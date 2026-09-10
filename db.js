const { Pool } = require('pg');
const fs = require('node:fs/promises');
const path = require('node:path');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/supriszo_db';
let pool = null;
let usePostgres = false;

// Fallback in-memory/JSON store if PostgreSQL connection fails or is not available
let fallbackStore = {
  products: [],
  categories: [],
  cart: { items: [], updatedAt: new Date().toISOString() },
  favorites: [],
  personalisation: { message: '', ribbon: 'Terracotta Raw Silk', occasion: 'Anniversary' },
  orders: [],
  settings: {
    announcement_text: 'ONE DAY DELIVERY PAN MUMBAI | Because your love deserves timely surprises.',
    helpline_phone: '+91 8655239282',
    instagram_handle: '@aaryann_guptaa',
    banner_shipping_text: 'One Day Delivery Pan Mumbai • Pan-India Delivery available across 19,000+ PIN Codes'
  }
};

const defaultCategories = [
  { id: 'birthday', name: 'Birthday' },
  { id: 'anniversary', name: 'Anniversary' },
  { id: 'wedding', name: 'Wedding' },
  { id: 'festivals', name: 'Festivals' },
  { id: 'corporate-gifting', name: 'Corporate Gifting' },
  { id: 'for-her', name: 'For Her' },
  { id: 'for-him', name: 'For Him' }
];

async function loadFallbackData() {
  try {
    const raw = await fs.readFile(path.join(__dirname, 'data.json'), 'utf8');
    const parsed = JSON.parse(raw);
    fallbackStore.products = parsed.products || [];
    fallbackStore.cart = parsed.cart || { items: [] };
    fallbackStore.favorites = parsed.favorites || [];
    fallbackStore.orders = parsed.orders || [];
    if (parsed.settings) fallbackStore.settings = parsed.settings;

    const catMap = new Map();
    defaultCategories.forEach(c => catMap.set(c.id, c));
    (parsed.categories || []).forEach(c => catMap.set(c.id, c));
    fallbackStore.categories = Array.from(catMap.values());
  } catch (err) {
    console.warn('Could not read initial data.json for fallback store:', err.message);
    fallbackStore.categories = [...defaultCategories];
  }
}

async function saveFallbackData() {
  if (usePostgres) return;
  try {
    const dataToSave = {
      products: fallbackStore.products,
      categories: fallbackStore.categories,
      cart: fallbackStore.cart,
      favorites: fallbackStore.favorites,
      orders: fallbackStore.orders,
      settings: fallbackStore.settings
    };
    await fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(dataToSave, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving fallback data to data.json:', err.message);
  }
}

async function initDb() {
  await loadFallbackData();

  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 3000
    });

    // Test query
    await pool.query('SELECT NOW()');
    usePostgres = true;
    console.log('✅ Connected to PostgreSQL database successfully!');

    // Initialize Schema
    const schemaSql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);

    // Seed data if empty
    await seedInitialData();
  } catch (err) {
    usePostgres = false;
    console.warn('⚠️  PostgreSQL connection failed or not configured. Operating in JSON/Memory fallback mode:', err.message);
  }
}

async function seedInitialData() {
  if (!usePostgres) return;
  const categoriesRes = await pool.query('SELECT COUNT(*) FROM categories');
  if (parseInt(categoriesRes.rows[0].count, 10) === 0) {
    console.log('🌱 Seeding initial categories into PostgreSQL...');
    const catNames = ['Birthday', 'Anniversary', 'Wedding', 'Festivals', 'Corporate Gifting', 'For Her', 'For Him'];
    for (const name of catNames) {
      const id = name.toLowerCase().replaceAll(' ', '-');
      await pool.query('INSERT INTO categories (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, name]);
    }
  }

  const productsRes = await pool.query('SELECT COUNT(*) FROM products');
  if (parseInt(productsRes.rows[0].count, 10) === 0 && fallbackStore.products.length > 0) {
    console.log('🌱 Seeding initial products into PostgreSQL...');
    for (const p of fallbackStore.products) {
      await pool.query(
        `INSERT INTO products (id, name, short_name, tag, price, mrp, image, description, rating, reviews, is_bestseller, category_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.shortName || p.name, p.tag || 'Curated', p.price, p.mrp, p.image, p.description, p.rating || 4.8, p.reviews || 100, true, p.categoryId || null]
      );
    }
  }

  // Seed default site settings
  const settingsRes = await pool.query('SELECT COUNT(*) FROM site_settings');
  if (parseInt(settingsRes.rows[0].count, 10) === 0) {
    for (const [key, value] of Object.entries(fallbackStore.settings)) {
      await pool.query('INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT DO NOTHING', [key, value]);
    }
  }
}

// Data Helper Functions

async function getProducts({ search = '', categoryId = null, activeOnly = true } = {}) {
  if (usePostgres) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (activeOnly) {
      query += ' AND is_active = true';
    }
    if (categoryId) {
      params.push(categoryId);
      query += ` AND category_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
    }
    query += ' ORDER BY created_at DESC';
    const res = await pool.query(query, params);
    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      shortName: row.short_name || row.name,
      tag: row.tag,
      price: row.price,
      mrp: row.mrp,
      image: row.image,
      description: row.description,
      rating: parseFloat(row.rating),
      reviews: row.reviews,
      stockQuantity: row.stock_quantity !== undefined ? parseInt(row.stock_quantity, 10) : 50,
      categoryId: row.category_id,
      isActive: row.is_active,
      isBestseller: row.is_bestseller
    }));
  } else {
    let items = fallbackStore.products.map(p => ({
      ...p,
      stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : (p.stock_quantity !== undefined ? p.stock_quantity : 50)
    }));
    if (activeOnly) {
      items = items.filter(p => p.isActive !== false);
    }
    if (categoryId) {
      items = items.filter(p => p.categoryId === categoryId);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    return items;
  }
}

async function getProductById(id) {
  if (usePostgres) {
    const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      shortName: row.short_name || row.name,
      tag: row.tag,
      price: row.price,
      mrp: row.mrp,
      image: row.image,
      description: row.description,
      rating: parseFloat(row.rating),
      reviews: row.reviews,
      stockQuantity: row.stock_quantity !== undefined ? parseInt(row.stock_quantity, 10) : 50,
      categoryId: row.category_id,
      isActive: row.is_active,
      isBestseller: row.is_bestseller
    };
  } else {
    const p = fallbackStore.products.find(prod => prod.id === id);
    if (!p) return null;
    return {
      ...p,
      stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : (p.stock_quantity !== undefined ? p.stock_quantity : 50)
    };
  }
}

async function createProduct(productData) {
  const { id, name, shortName, tag, price, mrp, image, description, rating = 4.8, reviews = 0, stockQuantity = 50, categoryId = null, isBestseller = false, isActive = true } = productData;
  const prodId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (usePostgres) {
    await pool.query(
      `INSERT INTO products (id, name, short_name, tag, price, mrp, image, description, rating, reviews, stock_quantity, category_id, is_bestseller, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [prodId, name, shortName || name, tag || 'Curated', price, mrp || price + 300, image, description, rating, reviews, stockQuantity, categoryId, Boolean(isBestseller), isActive !== false]
    );
    return getProductById(prodId);
  } else {
    const newProd = { id: prodId, name, shortName: shortName || name, tag: tag || 'Curated', price, mrp: mrp || price + 300, image, description, rating, reviews, stockQuantity, categoryId, isBestseller: Boolean(isBestseller), isActive: isActive !== false };
    fallbackStore.products.unshift(newProd);
    await saveFallbackData();
    return newProd;
  }
}

async function updateProduct(id, productData) {
  if (usePostgres) {
    const fields = [];
    const params = [];
    let idx = 1;

    const allowed = ['name', 'short_name', 'tag', 'price', 'mrp', 'image', 'description', 'rating', 'reviews', 'stock_quantity', 'category_id', 'is_active', 'is_bestseller'];
    for (const key of allowed) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (productData[key] !== undefined || productData[camelKey] !== undefined) {
        const val = productData[key] !== undefined ? productData[key] : productData[camelKey];
        fields.push(`${key} = $${idx}`);
        params.push(val);
        idx++;
      }
    }
    if (!fields.length) return getProductById(id);
    params.push(id);
    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${idx}`, params);
    return getProductById(id);
  } else {
    const prod = fallbackStore.products.find(p => p.id === id);
    if (!prod) return null;
    Object.assign(prod, productData);
    await saveFallbackData();
    return prod;
  }
}

async function deleteProduct(id) {
  const cleanId = String(id || '').trim().toLowerCase();
  if (usePostgres) {
    const res = await pool.query('DELETE FROM products WHERE LOWER(id) = $1 RETURNING *', [cleanId]);
    return res.rows.length > 0;
  } else {
    const index = fallbackStore.products.findIndex(p => String(p.id || '').trim().toLowerCase() === cleanId);
    if (index === -1) return false;
    fallbackStore.products.splice(index, 1);
    await saveFallbackData();
    return true;
  }
}

async function getCategories() {
  if (usePostgres) {
    const res = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return res.rows;
  } else {
    const catMap = new Map();
    defaultCategories.forEach(c => catMap.set(c.id, c));
    (fallbackStore.categories || []).forEach(c => catMap.set(c.id, c));
    fallbackStore.categories = Array.from(catMap.values());
    return fallbackStore.categories;
  }
}

async function createCategory(name) {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (usePostgres) {
    await pool.query('INSERT INTO categories (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, name]);
    return { id, name };
  } else {
    await getCategories();
    const newCat = { id, name };
    if (!fallbackStore.categories.some(c => c.id === id)) {
      fallbackStore.categories.push(newCat);
      await saveFallbackData();
    }
    return newCat;
  }
}

async function deleteCategory(id) {
  if (usePostgres) {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return true;
  } else {
    await getCategories();
    fallbackStore.categories = fallbackStore.categories.filter(c => c.id !== id);
    await saveFallbackData();
    return true;
  }
}

// Cart Management

async function getCart(sessionId = 'default_guest') {
  if (usePostgres) {
    const res = await pool.query(
      `SELECT c.product_id, c.quantity, c.personalisation_json, p.name, p.short_name, p.tag, p.price, p.mrp, p.image, p.description, p.stock_quantity
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.session_id = $1`,
      [sessionId]
    );
    const items = res.rows.map(row => ({
      productId: row.product_id,
      quantity: row.quantity,
      personalisation: row.personalisation_json || {},
      product: {
        id: row.product_id,
        name: row.name,
        shortName: row.short_name || row.name,
        tag: row.tag,
        price: row.price,
        mrp: row.mrp,
        image: row.image,
        description: row.description,
        stockQuantity: row.stock_quantity !== undefined ? parseInt(row.stock_quantity, 10) : 50
      },
      lineTotal: row.price * row.quantity
    }));
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    return { items, itemCount, subtotal, delivery: 0, total: subtotal };
  } else {
    const catalog = fallbackStore.products;
    const items = fallbackStore.cart.items.map(item => {
      const product = catalog.find(p => p.id === item.productId);
      return product ? {
        ...item,
        personalisation: item.personalisation || {},
        product: {
          ...product,
          stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : (product.stock_quantity !== undefined ? product.stock_quantity : 50)
        },
        lineTotal: product.price * item.quantity
      } : null;
    }).filter(Boolean);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    return { items, itemCount, subtotal, delivery: 0, total: subtotal };
  }
}

async function addToCart(sessionId = 'default_guest', productId, quantity = 1, personalisation = null) {
  const prod = await getProductById(productId);
  const maxStock = prod ? (prod.stockQuantity !== undefined ? prod.stockQuantity : 50) : 99;

  if (usePostgres) {
    const persJson = personalisation ? JSON.stringify(personalisation) : '{}';
    await pool.query(
      `INSERT INTO cart_items (session_id, product_id, quantity, personalisation_json)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (session_id, product_id)
       DO UPDATE SET quantity = LEAST($5, cart_items.quantity + $3),
                     personalisation_json = CASE WHEN $4 != '{}' THEN $4::jsonb ELSE cart_items.personalisation_json END,
                     updated_at = CURRENT_TIMESTAMP`,
      [sessionId, productId, quantity, persJson, maxStock]
    );
  } else {
    const item = fallbackStore.cart.items.find(i => i.productId === productId);
    if (item) {
      item.quantity = Math.min(maxStock, item.quantity + quantity);
      if (personalisation) item.personalisation = personalisation;
    } else {
      fallbackStore.cart.items.push({ productId, quantity, personalisation: personalisation || {} });
    }
    await saveFallbackData();
  }
  return getCart(sessionId);
}

async function updateCartItem(sessionId = 'default_guest', productId, quantity, personalisation = null) {
  const prod = await getProductById(productId);
  const maxStock = prod ? (prod.stockQuantity !== undefined ? prod.stockQuantity : 50) : 99;
  const validQty = Math.min(maxStock, Math.max(1, quantity));

  if (usePostgres) {
    if (personalisation) {
      await pool.query(
        `UPDATE cart_items SET quantity = $3, personalisation_json = $4::jsonb, updated_at = CURRENT_TIMESTAMP WHERE session_id = $1 AND product_id = $2`,
        [sessionId, productId, validQty, JSON.stringify(personalisation)]
      );
    } else {
      await pool.query(
        `UPDATE cart_items SET quantity = $3, updated_at = CURRENT_TIMESTAMP WHERE session_id = $1 AND product_id = $2`,
        [sessionId, productId, validQty]
      );
    }
  } else {
    const item = fallbackStore.cart.items.find(i => i.productId === productId);
    if (item) {
      item.quantity = validQty;
      if (personalisation) item.personalisation = personalisation;
    }
    await saveFallbackData();
  }
  return getCart(sessionId);
}

async function removeFromCart(sessionId = 'default_guest', productId) {
  if (usePostgres) {
    await pool.query(`DELETE FROM cart_items WHERE session_id = $1 AND product_id = $2`, [sessionId, productId]);
  } else {
    fallbackStore.cart.items = fallbackStore.cart.items.filter(i => i.productId !== productId);
    await saveFallbackData();
  }
  return getCart(sessionId);
}

async function clearCart(sessionId = 'default_guest') {
  if (usePostgres) {
    await pool.query(`DELETE FROM cart_items WHERE session_id = $1`, [sessionId]);
  } else {
    fallbackStore.cart.items = [];
    await saveFallbackData();
  }
  return getCart(sessionId);
}

// Favorites & Personalisation

async function getFavorites(sessionId = 'default_guest') {
  if (usePostgres) {
    const res = await pool.query('SELECT product_id FROM favorites WHERE session_id = $1', [sessionId]);
    return res.rows.map(r => r.product_id);
  } else {
    return fallbackStore.favorites || [];
  }
}

async function toggleFavorite(sessionId = 'default_guest', productId) {
  if (usePostgres) {
    const check = await pool.query('SELECT id FROM favorites WHERE session_id = $1 AND product_id = $2', [sessionId, productId]);
    if (check.rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE session_id = $1 AND product_id = $2', [sessionId, productId]);
      return { productId, saved: false, favorites: await getFavorites(sessionId) };
    } else {
      await pool.query('INSERT INTO favorites (session_id, product_id) VALUES ($1, $2)', [sessionId, productId]);
      return { productId, saved: true, favorites: await getFavorites(sessionId) };
    }
  } else {
    fallbackStore.favorites = fallbackStore.favorites || [];
    const idx = fallbackStore.favorites.indexOf(productId);
    if (idx === -1) fallbackStore.favorites.push(productId);
    else fallbackStore.favorites.splice(idx, 1);
    await saveFallbackData();
    return { productId, saved: idx === -1, favorites: fallbackStore.favorites };
  }
}

async function getPersonalisation(sessionId = 'default_guest') {
  if (usePostgres) {
    const res = await pool.query('SELECT message, ribbon, occasion FROM personalisations WHERE session_id = $1', [sessionId]);
    if (!res.rows.length) return { message: '', ribbon: 'Terracotta Raw Silk', occasion: 'Anniversary' };
    return res.rows[0];
  } else {
    return fallbackStore.personalisation || { message: '', ribbon: 'Terracotta Raw Silk', occasion: 'Anniversary' };
  }
}

async function savePersonalisation(sessionId = 'default_guest', { message = '', ribbon = '', occasion = '' }) {
  if (usePostgres) {
    await pool.query(
      `INSERT INTO personalisations (session_id, message, ribbon, occasion, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (session_id)
       DO UPDATE SET message = $2, ribbon = $3, occasion = $4, updated_at = CURRENT_TIMESTAMP`,
      [sessionId, message, ribbon, occasion]
    );
  } else {
    fallbackStore.personalisation = { message, ribbon, occasion };
    await saveFallbackData();
  }
  return { message, ribbon, occasion };
}

// Orders Management

async function getOrders() {
  if (usePostgres) {
    const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return res.rows.map(row => ({
      id: row.id,
      createdAt: row.created_at,
      status: row.status,
      customer: {
        name: row.customer_name,
        phone: row.customer_phone,
        address: row.customer_address
      },
      paymentMethod: row.payment_method,
      items: row.items_json,
      total: row.total
    }));
  } else {
    return fallbackStore.orders;
  }
}

async function getOrderById(id) {
  const cleanId = String(id || '').toLowerCase().trim();
  if (usePostgres) {
    const res = await pool.query('SELECT * FROM orders WHERE LOWER(id) = $1', [cleanId]);
    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      createdAt: row.created_at,
      status: row.status,
      customer: {
        name: row.customer_name,
        phone: row.customer_phone,
        address: row.customer_address
      },
      paymentMethod: row.payment_method,
      items: row.items_json,
      total: row.total
    };
  } else {
    return fallbackStore.orders.find(o => String(o.id).toLowerCase() === cleanId) || null;
  }
}

async function createOrder(orderData) {
  const { id, customer, paymentMethod, items, total } = orderData;

  // Deduct stock levels for ordered items
  for (const item of items) {
    if (item.productId) {
      const prod = await getProductById(item.productId);
      if (prod) {
        const newStock = Math.max(0, (prod.stockQuantity !== undefined ? prod.stockQuantity : 50) - item.quantity);
        await updateProduct(item.productId, { stockQuantity: newStock });
      }
    }
  }

  if (usePostgres) {
    await pool.query(
      `INSERT INTO orders (id, customer_name, customer_phone, customer_address, payment_method, items_json, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, customer.name, customer.phone, customer.address, paymentMethod, JSON.stringify(items), total]
    );
  } else {
    const order = { id, createdAt: new Date().toISOString(), status: 'confirmed', customer, paymentMethod, items, total };
    fallbackStore.orders.unshift(order);
    await saveFallbackData();
  }
  return orderData;
}

async function updateOrderStatus(orderId, status) {
  if (usePostgres) {
    await pool.query('UPDATE orders SET status = $2 WHERE id = $1', [orderId, status]);
  } else {
    const order = fallbackStore.orders.find(o => o.id === orderId);
    if (order) order.status = status;
    await saveFallbackData();
  }
  return { id: orderId, status };
}

// Settings & Admin Dashboard Stats

async function getSiteSettings() {
  if (usePostgres) {
    const res = await pool.query('SELECT key, value FROM site_settings');
    const settings = {};
    for (const row of res.rows) {
      settings[row.key] = row.value;
    }
    return settings;
  } else {
    return fallbackStore.settings;
  }
}

async function updateSiteSettings(settingsObj) {
  if (usePostgres) {
    for (const [key, value] of Object.entries(settingsObj)) {
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }
  } else {
    Object.assign(fallbackStore.settings, settingsObj);
    await saveFallbackData();
  }
  return getSiteSettings();
}

async function getAdminStats() {
  const orders = await getOrders();
  const products = await getProducts({ activeOnly: false });
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  return {
    totalOrders: orders.length,
    totalRevenue,
    totalProducts: products.length,
    usePostgres
  };
}

module.exports = {
  initDb,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  deleteCategory,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getFavorites,
  toggleFavorite,
  getPersonalisation,
  savePersonalisation,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getSiteSettings,
  updateSiteSettings,
  getAdminStats
};
