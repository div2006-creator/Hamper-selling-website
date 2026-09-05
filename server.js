const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const app = express();
const port = Number(process.env.PORT) || 3000;
const dataPath = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(__dirname));

async function readStore() {
  return JSON.parse(await fs.readFile(dataPath, 'utf8'));
}

async function writeStore(store) {
  store.cart.updatedAt = new Date().toISOString();
  await fs.writeFile(dataPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

function buildCart(store) {
  const catalog = [...store.products, ...buildCategories(store).flatMap((category) => category.products)];
  const items = store.cart.items.map((item) => {
    const product = catalog.find((entry) => entry.id === item.productId);
    return product ? { ...item, product, lineTotal: product.price * item.quantity } : null;
  }).filter(Boolean);
  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
    delivery: 0,
    total: items.reduce((total, item) => total + item.lineTotal, 0)
  };
}

const categoryNames = ['Birthday', 'Anniversary', 'Wedding', 'Festivals', 'Corporate Gifting', 'For Her', 'For Him'];
const categoryTemplates = [
  ['Signature Treats Box', 'Celebration snacks, artisan chocolate and a handwritten card.', 899],
  ['Curated Comfort Hamper', 'Small-batch delicacies, fragrant tea and a keepsake detail.', 1199],
  ['Golden Hour Gift Set', 'Premium dry fruits, a brass accent and a warm candle.', 1499],
  ['Maker\'s Table Collection', 'Independent-maker favourites presented in a reusable box.', 1699],
  ['Grand Gesture Hamper', 'A generous edit of gourmet treats and lasting keepsakes.', 2199]
];

function buildCategories(store) {
  const sourceImages = store.products.map((product) => product.image);
  return categoryNames.map((name, categoryIndex) => ({
    id: name.toLowerCase().replaceAll(' ', '-'),
    name,
    products: categoryTemplates.map(([label, description, price], productIndex) => ({
      id: `${name.toLowerCase().replaceAll(' ', '-')}-${productIndex + 1}`,
      name: `${name} ${label}`,
      shortName: `${name} ${label}`,
      tag: productIndex === 0 ? 'Popular' : productIndex === 4 ? 'Signature' : 'Curated',
      price: price + categoryIndex * 50,
      mrp: price + categoryIndex * 50 + 300,
      image: sourceImages[(categoryIndex + productIndex) % sourceImages.length],
      description,
      rating: 4.7 + ((categoryIndex + productIndex) % 3) / 10,
      reviews: 48 + categoryIndex * 11 + productIndex * 7,
      category: name
    }))
  }));
}

app.get('/api/products', async (_request, response) => {
  const store = await readStore();
  const query = String(_request.query.search || '').trim().toLowerCase();
  const catalog = [...store.products, ...buildCategories(store).flatMap((category) => category.products)];
  response.json(query ? catalog.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(query)) : catalog);
});

app.get('/api/products/:id', async (request, response) => {
  const store = await readStore();
  const product = [...store.products, ...buildCategories(store).flatMap((category) => category.products)].find((entry) => entry.id === request.params.id);
  if (!product) return response.status(404).json({ error: 'Product not found' });
  response.json(product);
});

app.get('/api/categories', async (_request, response) => {
  const store = await readStore();
  response.json(buildCategories(store));
});

app.get('/api/cart', async (_request, response) => {
  const store = await readStore();
  response.json(buildCart(store));
});

app.get('/api/favorites', async (_request, response) => {
  const store = await readStore();
  response.json(store.favorites || []);
});

app.post('/api/favorites/:productId', async (request, response) => {
  const store = await readStore();
  const product = [...store.products, ...buildCategories(store).flatMap((category) => category.products)].find((entry) => entry.id === request.params.productId);
  if (!product) return response.status(404).json({ error: 'Product not found' });
  store.favorites = store.favorites || [];
  const index = store.favorites.indexOf(product.id);
  if (index === -1) store.favorites.push(product.id);
  else store.favorites.splice(index, 1);
  await writeStore(store);
  response.json({ productId: product.id, saved: index === -1, favorites: store.favorites });
});

app.get('/api/personalisation', async (_request, response) => {
  const store = await readStore();
  response.json(store.personalisation || { message: '', ribbon: 'Terracotta Raw Silk', occasion: 'Anniversary' });
});

app.put('/api/personalisation', async (request, response) => {
  const { message = '', ribbon = '', occasion = '' } = request.body || {};
  if (String(message).length > 500) return response.status(400).json({ error: 'Gift message must be 500 characters or fewer' });
  const store = await readStore();
  store.personalisation = { message: String(message), ribbon: String(ribbon), occasion: String(occasion), updatedAt: new Date().toISOString() };
  await writeStore(store);
  response.json(store.personalisation);
});

app.post('/api/cart/items', async (request, response) => {
  const { productId, quantity = 1 } = request.body || {};
  const amount = Number(quantity);
  const store = await readStore();
  const product = [...store.products, ...buildCategories(store).flatMap((category) => category.products)].find((entry) => entry.id === productId);
  if (!product) return response.status(404).json({ error: 'Product not found' });
  if (!Number.isInteger(amount) || amount < 1 || amount > 99) return response.status(400).json({ error: 'Quantity must be an integer between 1 and 99' });

  const item = store.cart.items.find((entry) => entry.productId === productId);
  if (item) item.quantity = Math.min(99, item.quantity + amount);
  else store.cart.items.push({ productId, quantity: amount });
  await writeStore(store);
  response.status(201).json(buildCart(store));
});

app.patch('/api/cart/items/:productId', async (request, response) => {
  const amount = Number(request.body?.quantity);
  if (!Number.isInteger(amount) || amount < 1 || amount > 99) return response.status(400).json({ error: 'Quantity must be an integer between 1 and 99' });
  const store = await readStore();
  const item = store.cart.items.find((entry) => entry.productId === request.params.productId);
  if (!item) return response.status(404).json({ error: 'Cart item not found' });
  item.quantity = amount;
  await writeStore(store);
  response.json(buildCart(store));
});

app.delete('/api/cart/items/:productId', async (request, response) => {
  const store = await readStore();
  const before = store.cart.items.length;
  store.cart.items = store.cart.items.filter((entry) => entry.productId !== request.params.productId);
  if (store.cart.items.length === before) return response.status(404).json({ error: 'Cart item not found' });
  await writeStore(store);
  response.json(buildCart(store));
});

app.delete('/api/cart', async (_request, response) => {
  const store = await readStore();
  store.cart.items = [];
  await writeStore(store);
  response.json(buildCart(store));
});

app.post('/api/orders', async (request, response) => {
  const store = await readStore();
  const cart = buildCart(store);
  if (!cart.items.length) return response.status(400).json({ error: 'Your cart is empty' });
  const customer = request.body?.customer || {};
  if (!customer.name || !customer.phone || !customer.address) return response.status(400).json({ error: 'Name, phone and address are required' });

  const order = {
    id: `BND-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    customer: { name: customer.name, phone: customer.phone, address: customer.address },
    items: cart.items.map(({ product, quantity, lineTotal }) => ({ productId: product.id, name: product.name, quantity, lineTotal })),
    total: cart.total
  };
  store.orders.push(order);
  store.cart.items = [];
  await writeStore(store);
  response.status(201).json({ order, cart: buildCart(store) });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(port, () => {
  console.log(`Bandhan & Co. running at http://localhost:${port}`);
});
