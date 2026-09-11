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
    const ribbonEls = document.querySelectorAll('.delivery-ribbon span strong');
    if (ribbonEls.length && settings.banner_shipping_text) {
      ribbonEls.forEach(el => { el.textContent = settings.banner_shipping_text; });
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

const fallbackBestsellers = [
  {
    id: "bday-1",
    name: "Confetti Celebration Box",
    tag: "Popular",
    price: 1299,
    mrp: 1699,
    image: "images/bday_hamper.png",
    description: "Gourmet confetti cookies, birthday sparklers, artisan dark cacao bark and party popping candy.",
    rating: 4.9,
    reviews: 184,
    stockQuantity: 48,
    isBestseller: true
  },
  {
    id: "bday-2",
    name: "Birthday Brew & Truffles Box",
    tag: "Best Seller",
    price: 1499,
    mrp: 1899,
    image: "images/coffee_truffle_hamper.png",
    description: "Single-origin coffee, handcrafted belgian truffles, roasted almonds and a ceramic mug keepsake.",
    rating: 4.8,
    reviews: 210,
    stockQuantity: 30,
    isBestseller: true
  },
  {
    id: "anniv-1",
    name: "Eternal Romance Anniversary Trunk",
    tag: "Signature",
    price: 2499,
    mrp: 2999,
    image: "images/anniversary_romance_hamper.png",
    description: "Brass champagne flutes, hand-poured soy candle, artisan rose chocolates, and gold foil card.",
    rating: 4.9,
    reviews: 156,
    stockQuantity: 25,
    isBestseller: true
  },
  {
    id: "wed-1",
    name: "Royal Heritage Celebration Hamper",
    tag: "Royal Edit",
    price: 3899,
    mrp: 4499,
    image: "images/wedding_royal_trunk.png",
    description: "Handcrafted velvet keepsake trunk, royal dry fruits, brass diya set, and saffron infused sweets.",
    rating: 5.0,
    reviews: 320,
    stockQuantity: 15,
    isBestseller: true
  },
  {
    id: "fest-1",
    name: "Festive Golden Diwali Hamper",
    tag: "Festive Pick",
    price: 1899,
    mrp: 2299,
    image: "images/festive_diwali_hamper.png",
    description: "Artisanal brass thali, handmade brass diyas, premium organic dry fruits, and incense cones.",
    rating: 4.9,
    reviews: 240,
    stockQuantity: 40,
    isBestseller: true
  },
  {
    id: "corp-1",
    name: "Executive Leadership Gift Set",
    tag: "Corporate Bestseller",
    price: 2799,
    mrp: 3299,
    image: "images/corporate_executive_hamper.png",
    description: "Leather planner, Parker pen, thermal desk tumbler, premium roasted nuts, and velvet gift box.",
    rating: 4.8,
    reviews: 190,
    stockQuantity: 50,
    isBestseller: true
  }
];

// Load Bestsellers Catalog Dynamically
async function loadBestsellers() {
  const container = document.querySelector('#bestsellers .product-grid');
  if (!container) return;

  let products = [];
  let favSet = new Set();

  try {
    products = await apiRequest('/products');
    const favorites = await apiRequest('/favorites').catch(() => []);
    favSet = new Set(favorites);
  } catch (err) {
    console.warn('API fetch failed, rendering fallback bestsellers:', err.message);
  }

  // Use fetched products or fallback products
  const productList = (products && products.length > 0) ? products : fallbackBestsellers;
  const bestsellersOnly = productList.filter(p => p.isBestseller || p.tag);
  const displayProducts = bestsellersOnly.length > 0 ? bestsellersOnly.slice(0, 6) : productList.slice(0, 6);

  if (!displayProducts.length) {
    container.innerHTML = '<p class="muted">No hampers currently available.</p>';
    return;
  }

  container.innerHTML = displayProducts.map(p => {
    const isOutOfStock = (p.stockQuantity !== undefined && p.stockQuantity <= 0);
    return `
    <article class="product-card" data-id="${p.id}" data-name="${p.name.toLowerCase()}">
      <div class="product-image">
        <a href="pages.html?view=product&amp;product=${p.id}" class="product-img-link" aria-label="View details for ${p.name}">
          <img src="${p.image}" alt="${p.name}" onerror="this.src='images/bday-1.jpg'" />
        </a>
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
