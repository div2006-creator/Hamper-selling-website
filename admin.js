let adminToken = localStorage.getItem('supriszoAdminToken') || '';
let productsData = [];
let categoriesData = [];
let ordersData = [];

// Helper API Fetcher with Auth Header
async function adminApi(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    ...(options.headers || {})
  };
  const response = await fetch(`/api/admin${path}`, { ...options, headers });
  const body = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== '/login') {
      logout();
      throw new Error('Session expired or unauthorized');
    }
    throw new Error(body.error || 'API Request failed');
  }
  return body;
}

function showToast(msg) {
  const toast = document.querySelector('#adminToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

// Auth Logic
document.querySelector('#loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.querySelector('#loginUsername').value.trim();
  const password = document.querySelector('#loginPassword').value.trim();
  const errEl = document.querySelector('#loginError');
  errEl.textContent = '';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    adminToken = data.token;
    localStorage.setItem('supriszoAdminToken', adminToken);
    localStorage.setItem('supriszoAdminUser', data.username);
    initAdminApp();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

function logout() {
  adminToken = '';
  localStorage.removeItem('supriszoAdminToken');
  document.querySelector('#loginScreen').style.display = 'grid';
  document.querySelector('#adminApp').style.display = 'none';
}

document.querySelector('#logoutBtn')?.addEventListener('click', logout);

// Initialize Admin App
function initAdminApp() {
  if (!adminToken) {
    document.querySelector('#loginScreen').style.display = 'grid';
    document.querySelector('#adminApp').style.display = 'none';
    return;
  }

  document.querySelector('#loginScreen').style.display = 'none';
  document.querySelector('#adminApp').style.display = 'flex';
  const username = localStorage.getItem('supriszoAdminUser') || 'Administrator';
  document.querySelector('#adminUsernameDisplay').textContent = username;

  loadDashboardStats();
  loadProducts();
  loadCategories();
  loadOrders();
  loadCustomRequests();
  loadSettings();
}

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach((content) => {
    content.classList.toggle('active', content.id === `tab-${tabId}`);
  });

  const titles = {
    dashboard: 'Dashboard Overview',
    products: 'Manage Products & Hampers',
    categories: 'Product Categories & Occasions',
    orders: 'Customer Orders & Fulfilment',
    'custom-requests': 'Personalised Hamper Requests',
    settings: 'Store Banners & Announcements'
  };
  document.querySelector('#pageTitle').textContent = titles[tabId] || 'Dashboard';

  if (tabId === 'custom-requests') {
    loadCustomRequests();
  }
}

document.querySelectorAll('.nav-tab').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// 1. Dashboard Stats
async function loadDashboardStats() {
  try {
    const stats = await adminApi('/stats');
    document.querySelector('#statRevenue').textContent = `₹${stats.totalRevenue.toLocaleString('en-IN')}`;
    document.querySelector('#statOrders').textContent = stats.totalOrders;
    document.querySelector('#statProducts').textContent = stats.totalProducts;
    document.querySelector('#statEngine').textContent = stats.usePostgres ? 'PostgreSQL' : 'JSON (Fallback)';

    const dbBadge = document.querySelector('#dbStatusBadge');
    const dbText = document.querySelector('#dbStatusText');
    if (stats.usePostgres) {
      dbBadge.classList.remove('fallback');
      dbText.textContent = 'PostgreSQL Active';
    } else {
      dbBadge.classList.add('fallback');
      dbText.textContent = 'JSON Engine (Fallback)';
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// 2. Products Management
async function loadProducts() {
  try {
    productsData = await adminApi('/products');
    renderProductsTable(productsData);
  } catch (err) {
    showToast(err.message);
  }
}

function renderProductsTable(products) {
  const tbody = document.querySelector('#productsTableBody');
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center muted">No products found. Click "Add New Hamper" to create one.</td></tr>';
    return;
  }

  tbody.innerHTML = products.map((p) => {
    const stockVal = p.stockQuantity !== undefined ? p.stockQuantity : (p.stock_quantity !== undefined ? p.stock_quantity : 50);
    const stockPill = stockVal <= 0
      ? '<span class="pill status-inactive" style="background:#ffebee; color:#c62828;">Out of Stock</span>'
      : stockVal <= 5
        ? `<span class="pill tag-pill" style="background:#fff8e1; color:#b78103;">Low Stock (${stockVal})</span>`
        : `<span class="pill status-active">${stockVal} units</span>`;

    return `
    <tr>
      <td>
        <div class="prod-cell">
          <img src="${p.image}" alt="${p.name}" class="table-thumb" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuCv99V82mbTkLCy_VYd6NxPxQ5kvPV3ckqvY6NRMfdOdoEXok6F0NtfZN_76HtgHFWSW4YAMqjZoIGlWXt_lGFci4gL1BuzvcfJucXy_7NhU_MN58Xo8iRtWskA7KvLwiOMJbLukB5FeEHh_Om18fC6qT8lxoR-c-kr49_EVc_hRTfjVzd-ychpySK41Sx0bHBBM-IP7eDSHfegeXuTBvhMg6Vgvw8GFALqfgHtYjct6aJLzzmM_witeg'" />
          <div>
            <strong>${p.name}</strong>
            <small class="muted" style="display:block;">${p.shortName || ''}</small>
          </div>
        </div>
      </td>
      <td>${p.categoryId || 'General'}</td>
      <td>
        <span class="pill tag-pill">${p.tag || 'Curated'}</span>
        ${p.isBestseller ? '<span class="pill tag-pill" style="background:#fff3e0; color:#e65100; font-weight:bold;">⭐ Bestseller</span>' : ''}
      </td>
      <td><strong>₹${p.price.toLocaleString('en-IN')}</strong></td>
      <td><del class="muted">₹${p.mrp ? p.mrp.toLocaleString('en-IN') : '-'}</del></td>
      <td>${stockPill}</td>
      <td>⭐ ${p.rating || 4.8} <small class="muted">(${p.reviews || 0})</small></td>
      <td>
        <button class="pill ${p.isActive !== false ? 'status-active' : 'status-inactive'}" onclick="toggleProductActive('${p.id}', ${p.isActive === false})" style="border:none; cursor:pointer;">
          ${p.isActive !== false ? 'Active' : 'Hidden'}
        </button>
      </td>
      <td>
        <button class="admin-btn secondary-btn small-btn" onclick="openProductModal('${p.id}')">Edit</button>
        <button class="admin-btn danger-btn small-btn" onclick="deleteProduct('${p.id}')">Delete</button>
      </td>
    </tr>
  `;}).join('');
}

document.querySelector('#productSearchInput')?.addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  const filtered = productsData.filter((p) =>
    p.name.toLowerCase().includes(query) ||
    (p.tag && p.tag.toLowerCase().includes(query)) ||
    (p.description && p.description.toLowerCase().includes(query))
  );
  renderProductsTable(filtered);
});

async function toggleProductActive(id, newStatus) {
  try {
    await adminApi(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: newStatus })
    });
    showToast(newStatus ? 'Product activated' : 'Product hidden from customer site');
    loadProducts();
  } catch (err) {
    showToast(err.message);
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this gift hamper?')) return;
  try {
    await adminApi(`/products/${id}`, { method: 'DELETE' });
    showToast('Product deleted successfully');
    loadProducts();
    loadDashboardStats();
  } catch (err) {
    showToast(err.message);
  }
}

// Product Modal Handlers
function openProductModal(productId = null) {
  const modal = document.querySelector('#productModal');
  const form = document.querySelector('#productForm');
  const title = document.querySelector('#modalProductTitle');
  const previewBox = document.querySelector('#modalProdImagePreviewBox');
  const previewImg = document.querySelector('#modalProdImagePreview');
  form.reset();

  // Populate categories dropdown
  const catSelect = document.querySelector('#modalProdCategory');
  catSelect.innerHTML = '<option value="">Select Category</option>' +
    categoriesData.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  if (productId) {
    const p = productsData.find(prod => prod.id === productId);
    if (p) {
      title.textContent = 'Edit Gift Hamper';
      document.querySelector('#modalProductId').value = p.id;
      document.querySelector('#modalProdName').value = p.name;
      document.querySelector('#modalProdShortName').value = p.shortName || '';
      document.querySelector('#modalProdCategory').value = p.categoryId || '';
      document.querySelector('#modalProdTag').value = p.tag || '';
      document.querySelector('#modalProdPrice').value = p.price;
      document.querySelector('#modalProdMrp').value = p.mrp || '';
      document.querySelector('#modalProdStock').value = p.stockQuantity !== undefined ? p.stockQuantity : (p.stock_quantity !== undefined ? p.stock_quantity : 50);
      document.querySelector('#modalProdImage').value = p.image;
      document.querySelector('#modalProdDesc').value = p.description || '';
      document.querySelector('#modalProdRating').value = p.rating || 4.8;
      document.querySelector('#modalProdReviews').value = p.reviews || 100;
      document.querySelector('#modalProdBestseller').checked = Boolean(p.isBestseller);
      document.querySelector('#modalProdActive').checked = p.isActive !== false;

      if (p.image && previewBox && previewImg) {
        previewImg.src = p.image;
        previewBox.style.display = 'block';
      }
    }
  } else {
    title.textContent = 'Add New Gift Hamper';
    document.querySelector('#modalProductId').value = '';
    document.querySelector('#modalProdStock').value = 50;
    document.querySelector('#modalProdBestseller').checked = false;
    document.querySelector('#modalProdActive').checked = true;
    if (previewBox) previewBox.style.display = 'none';
  }

  modal.style.display = 'grid';
}

function closeProductModal() {
  document.querySelector('#productModal').style.display = 'none';
}

// Live Image URL Preview Listener
document.querySelector('#modalProdImage')?.addEventListener('input', (e) => {
  const url = e.target.value.trim();
  const box = document.querySelector('#modalProdImagePreviewBox');
  const img = document.querySelector('#modalProdImagePreview');
  if (url && box && img) {
    img.src = url;
    box.style.display = 'block';
  } else if (box) {
    box.style.display = 'none';
  }
});

document.querySelector('#productForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.querySelector('#modalProductId').value;
  const payload = {
    name: document.querySelector('#modalProdName').value.trim(),
    shortName: document.querySelector('#modalProdShortName').value.trim(),
    categoryId: document.querySelector('#modalProdCategory').value,
    tag: document.querySelector('#modalProdTag').value.trim(),
    price: Number(document.querySelector('#modalProdPrice').value),
    mrp: Number(document.querySelector('#modalProdMrp').value),
    stockQuantity: Number(document.querySelector('#modalProdStock').value),
    image: document.querySelector('#modalProdImage').value.trim(),
    description: document.querySelector('#modalProdDesc').value.trim(),
    rating: Number(document.querySelector('#modalProdRating').value),
    reviews: Number(document.querySelector('#modalProdReviews').value),
    isBestseller: document.querySelector('#modalProdBestseller').checked,
    isActive: document.querySelector('#modalProdActive').checked
  };

  try {
    if (id) {
      await adminApi(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Product updated successfully!');
    } else {
      await adminApi('/products', { method: 'POST', body: JSON.stringify(payload) });
      showToast('New product added to catalog!');
    }
    closeProductModal();
    loadProducts();
    loadDashboardStats();
  } catch (err) {
    showToast(err.message);
  }
});

// 3. Categories Management
async function loadCategories() {
  try {
    categoriesData = await adminApi('/categories');
    renderCategoriesList(categoriesData);
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function renderCategoriesList(categories) {
  const container = document.querySelector('#categoriesList');
  if (!categories.length) {
    container.innerHTML = '<p class="muted">No custom categories added yet.</p>';
    return;
  }

  container.innerHTML = categories.map((c) => `
    <div class="category-chip">
      <span>${c.name}</span>
      <button onclick="deleteCategory('${c.id}')" title="Delete Category">&times;</button>
    </div>
  `).join('');
}

document.querySelector('#addCategoryForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameInput = document.querySelector('#newCategoryName');
  const name = nameInput.value.trim();
  if (!name) return;

  try {
    await adminApi('/categories', { method: 'POST', body: JSON.stringify({ name }) });
    nameInput.value = '';
    showToast('Category created!');
    loadCategories();
  } catch (err) {
    showToast(err.message);
  }
});

async function deleteCategory(id) {
  try {
    await adminApi(`/categories/${id}`, { method: 'DELETE' });
    showToast('Category removed');
    loadCategories();
  } catch (err) {
    showToast(err.message);
  }
}

// 4. Orders Management
async function loadOrders() {
  try {
    ordersData = await adminApi('/orders');
    renderOrdersTable(ordersData);
    renderRecentOrders(ordersData.slice(0, 5));
  } catch (err) {
    console.error('Failed to load orders:', err);
  }
}

function renderOrdersTable(orders) {
  const tbody = document.querySelector('#ordersTableBody');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center muted">No customer orders placed yet. Place an order on customer storefront to test!</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map((o) => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>
        <strong>${o.customer.name}</strong><br />
        <small class="muted">📞 ${o.customer.phone}</small><br />
        <small class="muted">📍 ${o.customer.address}</small>
      </td>
      <td>
        ${(o.items || []).map(i => `<div>• ${i.name} × ${i.quantity} (₹${i.lineTotal})</div>`).join('')}
      </td>
      <td><strong>₹${o.total.toLocaleString('en-IN')}</strong></td>
      <td><span class="pill tag-pill">${(o.paymentMethod || 'COD').toUpperCase()}</span></td>
      <td><small>${new Date(o.createdAt).toLocaleDateString()} ${new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="packed" ${o.status === 'packed' ? 'selected' : ''}>Packed</option>
          <option value="dispatched" ${o.status === 'dispatched' ? 'selected' : ''}>Dispatched</option>
          <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');
}

function renderRecentOrders(recent) {
  const container = document.querySelector('#recentOrdersList');
  if (!recent.length) {
    container.innerHTML = '<p class="muted">No orders recorded yet.</p>';
    return;
  }

  container.innerHTML = recent.map((o) => `
    <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>${o.id}</strong> — ${o.customer.name}<br />
        <small class="muted">${(o.items || []).length} hamper(s) • ₹${o.total.toLocaleString('en-IN')}</small>
      </div>
      <span class="pill status-${o.status}">${o.status.toUpperCase()}</span>
    </div>
  `).join('');
}

async function updateOrderStatus(orderId, status) {
  try {
    await adminApi(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    showToast(`Order ${orderId} status updated to ${status.toUpperCase()}`);
    loadOrders();
  } catch (err) {
    showToast(err.message);
  }
}

// 5. Store Settings
async function loadSettings() {
  try {
    const settings = await adminApi('/settings');
    document.querySelector('#settingAnnouncement').value = settings.announcement_text || '';
    document.querySelector('#settingBanner').value = settings.banner_shipping_text || '';
    document.querySelector('#settingPhone').value = settings.helpline_phone || '';
    document.querySelector('#settingInstagram').value = settings.instagram_handle || '';
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

document.querySelector('#settingsForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    announcement_text: document.querySelector('#settingAnnouncement').value.trim(),
    banner_shipping_text: document.querySelector('#settingBanner').value.trim(),
    helpline_phone: document.querySelector('#settingPhone').value.trim(),
    instagram_handle: document.querySelector('#settingInstagram').value.trim()
  };

  try {
    await adminApi('/settings', { method: 'PUT', body: JSON.stringify(payload) });
    showToast('Storefront banner & contact settings updated live!');
  } catch (err) {
    showToast(err.message);
  }
});

// 6. Custom Hamper Requests Management
let currentCustomRequests = [];
let customReqFilter = 'all';

async function loadCustomRequests() {
  try {
    currentCustomRequests = await adminApi('/custom-requests');
    
    // Update badge count for pending requests
    const pendingCount = (currentCustomRequests || []).filter(r => r.status === 'pending').length;
    const badge = document.querySelector('#pendingCustomBadge');
    if (badge) {
      if (pendingCount > 0) {
        badge.textContent = pendingCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    renderCustomRequestsTable();
  } catch (err) {
    console.error('Failed to load custom requests:', err);
    const tbody = document.querySelector('#customRequestsTableBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="loading-cell">Failed to load custom requests: ${err.message}</td></tr>`;
  }
}

function filterCustomRequests(status) {
  customReqFilter = status;
  document.querySelectorAll('#tab-custom-requests .filter-pills .pill').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(status));
  });
  renderCustomRequestsTable();
}

function renderCustomRequestsTable() {
  const tbody = document.querySelector('#customRequestsTableBody');
  if (!tbody) return;

  let list = currentCustomRequests || [];
  if (customReqFilter !== 'all') {
    list = list.filter(r => r.status === customReqFilter);
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading-cell">No ${customReqFilter !== 'all' ? customReqFilter : ''} custom requests found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => {
    let statusBadge = '<span class="pill" style="background:#fef3c7; color:#b45309; font-weight:700;">PENDING</span>';
    if (r.status === 'accepted') {
      statusBadge = '<span class="pill" style="background:#dcfce7; color:#15803d; font-weight:700;">ACCEPTED</span>';
    } else if (r.status === 'rejected') {
      statusBadge = '<span class="pill" style="background:#fee2e2; color:#b91c1c; font-weight:700;">REJECTED</span>';
    }

    return `
      <tr>
        <td><strong>${r.reqCode}</strong><br/><small class="muted">${new Date(r.createdAt).toLocaleDateString()}</small></td>
        <td>
          <strong>${r.customerName}</strong><br/>
          <small class="muted">📞 ${r.customerContact}</small>
        </td>
        <td>
          <span class="pill tag-pill">${r.occasion}</span><br/>
          <small class="muted">Budget: ${r.budget}</small>
        </td>
        <td>
          <div style="max-width:240px; font-size:12px; line-height:1.4;">${r.details || 'N/A'}</div>
        </td>
        <td>
          <small>🎀 ${r.ribbon || 'Default'}</small><br/>
          ${r.message ? `<small class="muted" style="font-style:italic;">"${r.message}"</small>` : '<small class="muted">No custom card note</small>'}
        </td>
        <td>
          ${statusBadge}
          ${r.adminReply ? `<div style="font-size:11px; margin-top:4px; font-style:italic; color:#555; background:#f5f3eb; padding:4px 6px; border-radius:4px;">Reply: ${r.adminReply}</div>` : ''}
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="admin-btn primary-btn" style="padding:4px 8px; font-size:10px; background:#166534;" onclick="openCustomReqModal('${r.id}', 'accepted')">
              <span class="material-symbols-outlined" style="font-size:14px;">check_circle</span> Accept &amp; Reply
            </button>
            <button class="admin-btn secondary-btn" style="padding:4px 8px; font-size:10px; color:#b91c1c; border-color:#fca5a5;" onclick="openCustomReqModal('${r.id}', 'rejected')">
              <span class="material-symbols-outlined" style="font-size:14px;">cancel</span> Reject &amp; Reply
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openCustomReqModal(id, defaultAction = 'accepted') {
  const reqItem = (currentCustomRequests || []).find(r => r.id === id || r.reqCode === id);
  if (!reqItem) return;

  document.querySelector('#modalReqId').value = reqItem.id;
  document.querySelector('#modalReqCustomer').textContent = `${reqItem.customerName} (${reqItem.customerContact})`;
  document.querySelector('#modalReqOccasion').textContent = reqItem.occasion;
  document.querySelector('#modalReqBudget').textContent = reqItem.budget;
  document.querySelector('#modalReqDetails').textContent = reqItem.details;
  document.querySelector('#modalReqDecisionSelect').value = defaultAction;
  
  const replyField = document.querySelector('#modalAdminReplyText');
  if (reqItem.adminReply) {
    replyField.value = reqItem.adminReply;
  } else {
    replyField.value = defaultAction === 'accepted'
      ? `Approved! We can assemble this custom hamper for your requested details. Official Quote: ₹3,500 with Free Express Delivery. Contact us on WhatsApp (8655239282) to confirm order.`
      : `Regrettably, we cannot fulfill this specific request at this time as some requested items are out of stock. We recommend exploring our Bestsellers catalog.`;
  }

  document.querySelector('#customReqModal').style.display = 'grid';
}

function closeCustomReqModal() {
  document.querySelector('#customReqModal').style.display = 'none';
}

document.querySelector('#customReqResponseForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.querySelector('#modalReqId').value;
  const status = document.querySelector('#modalReqDecisionSelect').value;
  const adminReply = document.querySelector('#modalAdminReplyText').value.trim();

  try {
    await adminApi(`/custom-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminReply })
    });
    showToast(`Custom request ${status === 'accepted' ? 'ACCEPTED' : 'REJECTED'} and reply saved!`);
    closeCustomReqModal();
    loadCustomRequests();
    loadDashboardStats();
  } catch (err) {
    showToast(err.message);
  }
});

// Run Init on Page Load
initAdminApp();
