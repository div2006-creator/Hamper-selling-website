const searchInput = document.querySelector('#searchInput');
const cards = [...document.querySelectorAll('.product-card')];
const cartCount = document.querySelector('#cartCount');
const toast = document.querySelector('#toast');
let toastTimer;

const productIds = {
  'Royal Heritage Celebration': 'royal-heritage',
  'Artisanal Chai and Sweets': 'chai-sweets',
  'Corporate Curated Box': 'corporate-curated'
};

async function cartRequest(path, options) {
  const response = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}

cartRequest('/cart').then((cart) => { cartCount.textContent = cart.itemCount; }).catch(() => {});

document.querySelectorAll('img').forEach((image) => {
  image.addEventListener('error', () => {
    if (image.dataset.fallback) return;
    image.dataset.fallback = 'true';
    image.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCv99V82mbTkLCy_VYd6NxPxQ5kvPV3ckqvY6NRMfdOdoEXok6F0NtfZN_76HtgHFWSW4YAMqjZoIGlWXt_lGFci4gL1BuzvcfJucXy_7NhU_MN58Xo8iRtWskA7KvLwiOMJbLukB5FeEHh_Om18fC6qT8lxoR-c-kr49_EVc_hRTfjVzd-ychpySK41Sx0bHBBM-IP7eDSHfegeXuTBvhMg6Vgvw8GFALqfgHtYjct6aJLzzmM_witeg';
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  cards.forEach((card) => {
    card.hidden = query && !card.dataset.name.toLowerCase().includes(query);
  });
});

document.querySelectorAll('.add-button').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      const cart = await cartRequest('/cart/items', { method: 'POST', body: JSON.stringify({ productId: productIds[button.dataset.product], quantity: 1 }) });
      cartCount.textContent = cart.itemCount;
      showToast(`${button.dataset.product} added to your hamper`);
    } catch (error) {
      showToast(error.message);
    }
  });
});

document.querySelectorAll('.favorite').forEach((button) => {
  button.addEventListener('click', async () => {
    const label = button.getAttribute('aria-label') || '';
    const productId = label.includes('Chai') ? 'chai-sweets' : label.includes('Corporate') ? 'corporate-curated' : 'royal-heritage';
    try {
      const result = await cartRequest(`/favorites/${productId}`, { method: 'POST' });
      button.classList.toggle('is-favorite', result.saved);
      showToast(result.saved ? 'Saved to your favorites' : 'Removed from your favorites');
    } catch (error) {
      showToast(error.message);
    }
  });
});

document.querySelector('#cartButton')?.addEventListener('click', () => { window.location.href = 'pages.html?view=cart'; });
