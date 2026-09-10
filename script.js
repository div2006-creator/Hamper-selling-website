const searchInput = document.querySelector('#searchInput');
const cartCount = document.querySelector('#cartCount');
const toast = document.querySelector('#toast');
let toastTimer;

// Session ID for individual cart/favorites tracking
let sessionId = localStorage.getItem('supriszoSessionId');
if (!sessionId) {
  sessionId = 'guest_' + Math.random().toString(36).substring(2, 9);
  localStorage.setItem('supriszoSessionId', sessionId);
}

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(options.headers || {})
  };
  const response = await fetch(`/api${path}`, { ...options, headers });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}

// Load Storefront Settings
async function loadStorefrontSettings() {
  try {
    const settings = await apiRequest('/settings');
    const annEl = document.querySelector('.announcement span');
    if (annEl && settings.announcement_text) {
      annEl.innerHTML = `<span class="material-symbols-outlined">bolt</span> ${settings.announcement_text}`;
    }
    const ribbonEl = document.querySelector('.delivery-ribbon span');
    if (ribbonEl && settings.banner_shipping_text) {
      ribbonEl.innerHTML = `<span class="material-symbols-outlined">local_shipping</span><strong>${settings.banner_shipping_text}</strong>`;
    }
    const waLink = document.querySelector('.announcement-links a[href*="wa.me"]');
    if (waLink && settings.helpline_phone) {
      const cleanPhone = settings.helpline_phone.replace(/[^0-9]/g, '');
      waLink.href = `https://wa.me/${cleanPhone}`;
      waLink.textContent = `WhatsApp: ${settings.helpline_phone}`;
    }
  } catch (err) {
    console.warn('Using default storefront settings');
  }
}

// Load Bestsellers Catalog Dynamically
async function loadBestsellers() {
  const container = document.querySelector('#bestsellers .product-grid');
  if (!container) return;

  try {
    const products = await apiRequest('/products');
    const favorites = await apiRequest('/favorites').catch(() => []);
    const favSet = new Set(favorites);

    if (!products.length) {
      container.innerHTML = '<p class="muted">No hampers currently available.</p>';
      return;
    }

    // Display bestsellers or first 6 products
    const displayProducts = products.filter(p => p.isBestseller).length > 0 ? products.filter(p => p.isBestseller) : products.slice(0, 6);

    container.innerHTML = displayProducts.map(p => {
      const isOutOfStock = (p.stockQuantity !== undefined && p.stockQuantity <= 0);
      return `
      <article class="product-card" data-id="${p.id}" data-name="${p.name.toLowerCase()}">
        <div class="product-image">
          <img src="${p.image}" alt="${p.name}" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuCv99V82mbTkLCy_VYd6NxPxQ5kvPV3ckqvY6NRMfdOdoEXok6F0NtfZN_76HtgHFWSW4YAMqjZoIGlWXt_lGFci4gL1BuzvcfJucXy_7NhU_MN58Xo8iRtWskA7KvLwiOMJbLukB5FeEHh_Om18fC6qT8lxoR-c-kr49_EVc_hRTfjVzd-ychpySK41Sx0bHBBM-IP7eDSHfegeXuTBvhMg6Vgvw8GFALqfgHtYjct6aJLzzmM_witeg'" />
          <span class="product-tag">${p.tag || 'Bestseller'}</span>
          ${isOutOfStock ? '<span class="out-stock-badge">Out of Stock</span>' : ''}
          <button class="favorite ${favSet.has(p.id) ? 'is-favorite' : ''}" data-product-id="${p.id}" aria-label="Add ${p.name} to favorites">
            <span class="material-symbols-outlined">favorite</span>
          </button>
        </div>
        <div class="product-info">
          <div class="rating"><span class="material-symbols-outlined">star</span> ${p.rating || 4.9} <small>(${p.reviews || 100} reviews)</small></div>
          <h3><a href="pages.html?view=product&amp;product=${p.id}">${p.name}</a></h3>
          <p>${p.description || ''}</p>
          <div class="price-row">
            <strong>₹${p.price.toLocaleString('en-IN')}</strong>
            <del>₹${p.mrp ? p.mrp.toLocaleString('en-IN') : (p.price + 500).toLocaleString('en-IN')}</del>
            <span>OFFER</span>
          </div>
          <small class="saving">${isOutOfStock ? 'Currently Unavailable' : 'Free Express Shipping'}</small>
          <button class="add-button" data-product-id="${p.id}" data-product-name="${p.name}" ${isOutOfStock ? 'disabled' : ''}>
            <span class="material-symbols-outlined">shopping_bag</span> ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </article>
    `}).join('');

    bindProductActions();
  } catch (err) {
    console.error('Failed to load bestsellers:', err);
  }
}

function bindProductActions() {
  document.querySelectorAll('.add-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const productId = button.dataset.productId;
      const productName = button.dataset.productName || 'Hamper';
      try {
        const cart = await apiRequest('/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId, quantity: 1 })
        });
        if (cartCount) cartCount.textContent = cart.itemCount;
        showToast(`${productName} added to your hamper`);
      } catch (error) {
        showToast(error.message);
      }
    });
  });

  document.querySelectorAll('.favorite').forEach((button) => {
    button.addEventListener('click', async () => {
      const productId = button.dataset.productId;
      try {
        const result = await apiRequest(`/favorites/${productId}`, { method: 'POST' });
        button.classList.toggle('is-favorite', result.saved);
        showToast(result.saved ? 'Saved to your favorites' : 'Removed from your favorites');
      } catch (error) {
        showToast(error.message);
      }
    });
  });
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// Initial cart count load
apiRequest('/cart')
  .then((cart) => {
    if (cartCount) cartCount.textContent = cart.itemCount;
  })
  .catch(() => {});

// Search Filter
if (searchInput) {
  const executeSearchRedirect = () => {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `pages.html?view=hampers&search=${encodeURIComponent(query)}`;
    } else {
      searchInput.focus();
    }
  };

  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    document.querySelectorAll('.product-card').forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.hidden = Boolean(query) && !text.includes(query);
    });
  });

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      executeSearchRedirect();
    }
  });

  const searchBox = searchInput.closest('.search-box');
  const searchIcon = searchBox?.querySelector('.material-symbols-outlined');
  if (searchIcon) {
    searchIcon.style.cursor = 'pointer';
    searchIcon.setAttribute('title', 'Click to search all hampers');
    searchIcon.addEventListener('click', executeSearchRedirect);
  }
}

document.querySelector('#cartButton')?.addEventListener('click', () => {
  window.location.href = 'pages.html?view=cart';
});

// Run Loaders
loadStorefrontSettings();
loadBestsellers();
