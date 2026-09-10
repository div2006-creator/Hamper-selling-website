require('dotenv').config();
const express = require('express');
const path = require('node:path');
const crypto = require('node:crypto');
const db = require('./db');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.static(__dirname));

// Admin Page Route Alias (/admin -> admin.html)
app.get(['/admin', '/admin/'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Rate Limiting & Anti-Spam Middleware
const requestLogs = new Map();
function rateLimit(maxRequests = 60, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const timestamps = (requestLogs.get(ip) || []).filter(t => now - t < windowMs);
    if (timestamps.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    }
    timestamps.push(now);
    requestLogs.set(ip, timestamps);
    next();
  };
}

// Dynamic Admin Session Security
const activeAdminTokens = new Set();
const defaultSecret = process.env.ADMIN_SESSION_SECRET || 'supriszo-secret-key-2024';

function requireAdmin(request, response, next) {
  const authHeader = request.headers.authorization;
  if (!authHeader) return response.status(401).json({ error: 'Unauthorized admin access' });

  const token = authHeader.replace('Bearer ', '').trim();
  if (token === defaultSecret || activeAdminTokens.has(token)) {
    return next();
  }
  return response.status(401).json({ error: 'Unauthorized admin access or session expired' });
}

// Public Customer API Routes

app.get('/api/settings', async (_request, response) => {
  try {
    const settings = await db.getSiteSettings();
    response.json(settings);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (request, response) => {
  try {
    const search = String(request.query.search || '').trim();
    const categoryId = request.query.category || null;
    const products = await db.getProducts({ search, categoryId, activeOnly: true });
    response.json(products);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (request, response) => {
  try {
    const product = await db.getProductById(request.params.id);
    if (!product) return response.status(404).json({ error: 'Product not found' });
    response.json(product);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (_request, response) => {
  try {
    const categories = await db.getCategories();
    const products = await db.getProducts({ activeOnly: true });

    // Group products into categories with smart matching
    const categoriesWithProducts = categories.map(cat => {
      const catLower = cat.name.toLowerCase();
      const catId = cat.id.toLowerCase();

      let matchedProducts = products.filter(p => {
        if (p.categoryId && p.categoryId.toLowerCase() === catId) return true;
        const nameLower = p.name.toLowerCase();
        const tagLower = (p.tag || '').toLowerCase();
        const descLower = (p.description || '').toLowerCase();

        if (tagLower.includes(catLower) || catLower.includes(tagLower)) return true;
        if (nameLower.includes(catLower) || descLower.includes(catLower)) return true;

        // Check key words like 'corporate', 'birthday', 'wedding', 'festival', 'her', 'him'
        const keywords = catLower.split(' ').filter(w => w.length > 2);
        return keywords.some(kw => nameLower.includes(kw) || tagLower.includes(kw) || descLower.includes(kw));
      });

      // Fallback: If a category has no matching products, show a curated subset of active products so no category is empty
      if (!matchedProducts.length && products.length > 0) {
        matchedProducts = products.slice(0, 3);
      }

      return {
        ...cat,
        products: matchedProducts
      };
    });

    response.json(categoriesWithProducts);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/cart', async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const cart = await db.getCart(sessionId);
    response.json(cart);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post('/api/cart/items', express.json(), async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const { productId, quantity = 1, personalisation = null } = request.body || {};
    if (!productId) return response.status(400).json({ error: 'productId is required' });

    const cart = await db.addToCart(sessionId, productId, Number(quantity), personalisation);
    response.status(201).json(cart);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.patch('/api/cart/items/:productId', express.json(), async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const { quantity, personalisation } = request.body || {};
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return response.status(400).json({ error: 'Quantity must be an integer between 1 and 99' });
    }

    const cart = await db.updateCartItem(sessionId, request.params.productId, qty, personalisation);
    response.json(cart);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/items/:productId', async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const cart = await db.removeFromCart(sessionId, request.params.productId);
    response.json(cart);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart', async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const cart = await db.clearCart(sessionId);
    response.json(cart);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/favorites', async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const favorites = await db.getFavorites(sessionId);
    response.json(favorites);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post('/api/favorites/:productId', async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const result = await db.toggleFavorite(sessionId, request.params.productId);
    response.json(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/personalisation', async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const personalisation = await db.getPersonalisation(sessionId);
    response.json(personalisation);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.put('/api/personalisation', express.json(), async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const { message = '', ribbon = '', occasion = '' } = request.body || {};
    if (String(message).length > 500) {
      return response.status(400).json({ error: 'Gift message must be 500 characters or fewer' });
    }
    const result = await db.savePersonalisation(sessionId, { message, ribbon, occasion });
    response.json(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Order Lookup (Public Order Tracking)
app.get('/api/orders/:id', async (request, response) => {
  try {
    const order = await db.getOrderById(request.params.id);
    if (!order) return response.status(404).json({ error: 'Order not found' });
    response.json(order);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', rateLimit(15, 60000), express.json(), async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const cart = await db.getCart(sessionId);
    if (!cart.items.length) return response.status(400).json({ error: 'Your cart is empty' });

    const customer = request.body?.customer || {};
    if (!customer.name || !customer.phone || !customer.address) {
      return response.status(400).json({ error: 'Name, phone and address are required' });
    }

    const paymentMethod = String(request.body?.paymentMethod || 'cod');
    if (!['cod', 'upi', 'card', 'netbanking'].includes(paymentMethod)) {
      return response.status(400).json({ error: 'Choose a valid payment method' });
    }

    const orderData = {
      id: `SPR-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      customer: { name: customer.name, phone: customer.phone, address: customer.address },
      paymentMethod,
      items: cart.items.map(({ product, quantity, lineTotal, personalisation }) => ({
        productId: product.id,
        name: product.name,
        quantity,
        personalisation: personalisation || {},
        lineTotal
      })),
      total: cart.total
    };

    const order = await db.createOrder(orderData);
    await db.clearCart(sessionId);
    response.status(201).json({ order, cart: await db.getCart(sessionId) });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Razorpay Integration Endpoints
app.get('/api/integrations/razorpay', async (_request, response) => {
  response.json({
    enabled: Boolean(process.env.RAZORPAY_KEY_ID),
    keyId: process.env.RAZORPAY_KEY_ID || null,
    webhookUrl: process.env.RAZORPAY_WEBHOOK_URL || null
  });
});

app.post('/api/razorpay/create-order', express.json(), async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const cart = await db.getCart(sessionId);
    if (!cart.items || !cart.items.length) {
      return response.status(400).json({ error: 'Your shopping basket is empty' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return response.status(500).json({ error: 'Razorpay payment gateway credentials not configured on server.' });
    }

    const amountInPaise = Math.round((cart.total || 0) * 100);
    if (amountInPaise < 100) {
      return response.status(400).json({ error: 'Order total must be at least ₹1' });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          session_id: sessionId,
          customer_name: request.body?.customer?.name || ''
        }
      })
    });

    const rzpData = await rzpResponse.json();
    if (!rzpResponse.ok) {
      throw new Error(rzpData.error?.description || 'Failed to create Razorpay payment order');
    }

    response.json({
      keyId,
      razorpayOrderId: rzpData.id,
      amount: rzpData.amount,
      currency: rzpData.currency
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post('/api/razorpay/verify-payment', express.json(), async (request, response) => {
  try {
    const sessionId = request.headers['x-session-id'] || 'default_guest';
    const cart = await db.getCart(sessionId);
    if (!cart.items || !cart.items.length) {
      return response.status(400).json({ error: 'Cart is empty' });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, customer, paymentMethod } = request.body || {};

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && razorpay_signature && razorpay_order_id && razorpay_payment_id) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return response.status(400).json({ error: 'Razorpay payment verification signature mismatch' });
      }
    }

    const orderData = {
      id: `SPR-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      customer: { name: customer.name, phone: customer.phone, address: customer.address },
      paymentMethod: paymentMethod ? `razorpay_${paymentMethod}` : 'razorpay_online',
      items: cart.items.map(({ product, quantity, lineTotal, personalisation }) => ({
        productId: product.id,
        name: product.name,
        quantity,
        personalisation: personalisation || {},
        lineTotal
      })),
      total: cart.total
    };

    const order = await db.createOrder(orderData);
    await db.clearCart(sessionId);
    response.status(201).json({ order, cart: await db.getCart(sessionId) });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post('/api/razorpay/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  const signature = request.get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (secret && signature) {
    const expected = crypto.createHmac('sha256', secret).update(request.body).digest('hex');
    if (signature !== expected) return response.status(401).json({ error: 'Invalid webhook signature' });
  }
  response.json({ received: true });
});

// ADMIN API ENDPOINTS

app.post('/api/admin/login', rateLimit(10, 60000), express.json(), (request, response) => {
  const { username, password } = request.body || {};
  const validUsername = process.env.ADMIN_USERNAME || 'Aryan gupta';
  const validPassword = process.env.ADMIN_PASSWORD || 'aryan@surpriszo777';

  if (username === validUsername && password === validPassword) {
    const sessionToken = `spr_adm_${crypto.randomBytes(16).toString('hex')}`;
    activeAdminTokens.add(sessionToken);
    return response.json({ success: true, token: sessionToken, username: validUsername });
  }

  return response.status(401).json({ error: 'Invalid admin username or password' });
});

app.get('/api/admin/stats', requireAdmin, async (_request, response) => {
  try {
    const stats = await db.getAdminStats();
    response.json(stats);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/products', requireAdmin, async (request, response) => {
  try {
    const products = await db.getProducts({ activeOnly: false });
    response.json(products);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/products', requireAdmin, express.json(), async (request, response) => {
  try {
    const product = await db.createProduct(request.body);
    response.status(201).json(product);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/products/:id', requireAdmin, express.json(), async (request, response) => {
  try {
    const product = await db.updateProduct(request.params.id, request.body);
    if (!product) return response.status(404).json({ error: 'Product not found' });
    response.json(product);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, async (request, response) => {
  try {
    const success = await db.deleteProduct(request.params.id);
    if (!success) return response.status(404).json({ error: 'Product not found' });
    response.json({ success: true, deletedId: request.params.id });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/categories', requireAdmin, async (_request, response) => {
  try {
    const categories = await db.getCategories();
    response.json(categories);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/categories', requireAdmin, express.json(), async (request, response) => {
  try {
    const { name } = request.body || {};
    if (!name) return response.status(400).json({ error: 'Category name is required' });
    const category = await db.createCategory(name);
    response.status(201).json(category);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/categories/:id', requireAdmin, async (request, response) => {
  try {
    await db.deleteCategory(request.params.id);
    response.json({ success: true });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/orders', requireAdmin, async (_request, response) => {
  try {
    const orders = await db.getOrders();
    response.json(orders);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/orders/:id/status', requireAdmin, express.json(), async (request, response) => {
  try {
    const { status } = request.body || {};
    if (!status) return response.status(400).json({ error: 'Status is required' });
    const order = await db.updateOrderStatus(request.params.id, status);
    response.json(order);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/settings', requireAdmin, async (_request, response) => {
  try {
    const settings = await db.getSiteSettings();
    response.json(settings);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/settings', requireAdmin, express.json(), async (request, response) => {
  try {
    const updated = await db.updateSiteSettings(request.body);
    response.json(updated);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// CUSTOM HAMPER REQUEST ENDPOINTS

app.post('/api/custom-requests', rateLimit(15, 60000), express.json(), async (request, response) => {
  try {
    const data = request.body || {};
    if (!data.customerName && !data.name) {
      return response.status(400).json({ error: 'Customer name is required' });
    }
    if (!data.customerContact && !data.phone && !data.email) {
      return response.status(400).json({ error: 'Contact phone or email is required' });
    }
    const customReq = await db.createCustomRequest(data);
    response.status(201).json({ success: true, request: customReq });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/custom-requests/status/:reqCode', async (request, response) => {
  try {
    const reqItem = await db.getCustomRequestByCode(request.params.reqCode);
    if (!reqItem) return response.status(404).json({ error: 'Custom hamper request not found' });
    response.json(reqItem);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/custom-requests', requireAdmin, async (_request, response) => {
  try {
    const requests = await db.getCustomRequests();
    response.json(requests);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/custom-requests/:id', requireAdmin, express.json(), async (request, response) => {
  try {
    const { status, adminReply } = request.body || {};
    if (!status || !['accepted', 'rejected', 'pending'].includes(status)) {
      return response.status(400).json({ error: 'Valid status (accepted, rejected, pending) is required' });
    }
    const updated = await db.updateCustomRequestStatus(request.params.id, status, adminReply || '');
    response.json({ success: true, request: updated });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Global error handler
app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'Internal Server Error' });
});

// Start Server and Init Database
db.initDb().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Supriszo & Co. Storefront & Admin running at http://localhost:${port}`);
    console.log(`🔑 Admin Panel available at: http://localhost:${port}/admin.html`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
