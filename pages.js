let sessionId = localStorage.getItem('supriszoSessionId');
if (!sessionId) {
  sessionId = 'guest_' + Math.random().toString(36).substring(2, 9);
  localStorage.setItem('supriszoSessionId', sessionId);
}

const api = (path, options = {}) => fetch(`/api${path}`, {
  headers: {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(options.headers || {})
  },
  ...options
}).then(async (response) => {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
});

function updateCartBadge(cart) {
  document.querySelectorAll('.header-actions b').forEach((badge) => { badge.textContent = cart.itemCount; });
}

function showToast(message) {
  const toast = document.querySelector('#pageToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

const productCardFromObject = (product) => `<article class="product-card page-product-card" data-name="${product.name.toLowerCase()}"><div class="product-image"><img src="${product.image}" alt="${product.name}" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuCv99V82mbTkLCy_VYd6NxPxQ5kvPV3ckqvY6NRMfdOdoEXok6F0NtfZN_76HtgHFWSW4YAMqjZoIGlWXt_lGFci4gL1BuzvcfJucXy_7NhU_MN58Xo8iRtWskA7KvLwiOMJbLukB5FeEHh_Om18fC6qT8lxoR-c-kr49_EVc_hRTfjVzd-ychpySK41Sx0bHBBM-IP7eDSHfegeXuTBvhMg6Vgvw8GFALqfgHtYjct6aJLzzmM_witeg'" /><span class="product-tag">${product.tag || 'Curated'}</span><button class="favorite" data-product-id="${product.id}" aria-label="Save ${product.name}"><span class="material-symbols-outlined">favorite</span></button></div><div class="product-info"><div class="rating"><span class="material-symbols-outlined">star</span> ${product.rating || 4.8} <small>(${product.reviews || 100} reviews)</small></div><h3><a href="pages.html?view=product&amp;product=${product.id}">${product.name}</a></h3><p>${product.description || ''}</p><div class="price-row"><strong>₹${(product.price || 0).toLocaleString('en-IN')}</strong><del>₹${(product.mrp || product.price + 400).toLocaleString('en-IN')}</del><span>OFFER</span></div><small class="saving">Free Express Shipping • Gift-ready packaging</small><button class="add-button" data-product-id="${product.id}" data-product="${product.name}"><span class="material-symbols-outlined">shopping_bag</span> Add to Cart</button></div></article>`;

const sectionHeader = (eyebrow, title, copy = '') => `<div class="page-title"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${copy ? `<p>${copy}</p>` : ''}</div>`;

const pageExtras = {
  hampers: `<section class="page-width trust-band"><div><span class="material-symbols-outlined">verified</span><strong>Authentic Artisanal Gifting</strong><p>Every hamper is checked, wrapped and dispatched from our Mumbai studio.</p></div><div><span class="material-symbols-outlined">local_shipping</span><strong>One-Day Pan Mumbai</strong><p>Order today and receive your surprise tomorrow evening.</p></div><div><span class="material-symbols-outlined">redeem</span><strong>Gift-Ready Always</strong><p>Premium keepsake boxes, handwritten notes and beautiful ribbons.</p></div></section>`,
  categories: `<section class="page-width quote-band"><p>“The best gifts are the ones that say I know you.”</p><span>— The Supriszo gifting philosophy</span></section>`,
  occasions: `<section class="page-width occasion-story"><p class="eyebrow">Occasions, thoughtfully composed</p><h2>Make the moment linger a little longer.</h2><div class="occasion-story-grid"><p>Choose a collection, add your words and let us handle the beautiful logistics. Every occasion box is available with pan-India delivery and complimentary gift notes.</p><div><strong>19,000+</strong><span>PIN codes served</span></div><div><strong>1 day</strong><span>Pan Mumbai delivery</span></div><div><strong>100%</strong><span>Gift-ready packaging</span></div></div></section>`,
  personalise: `<section class="page-width steps-band"><p class="eyebrow">A little ceremony</p><h2>Personalise in three thoughtful steps.</h2><div class="steps-grid"><div><b>01</b><span class="material-symbols-outlined">inventory_2</span><h3>Choose your hamper</h3><p>Start with a box made for the person and the moment.</p></div><div><b>02</b><span class="material-symbols-outlined">stylus_note</span><h3>Write your words</h3><p>Add a handwritten note printed on our gold foil card.</p></div><div><b>03</b><span class="material-symbols-outlined">local_shipping</span><h3>Send it with care</h3><p>We wrap, protect and deliver it right when it matters.</p></div></div></section>`,
  about: `<section class="page-width values-story"><p class="eyebrow">Our promise</p><h2>Good gifting should feel personal on both sides.</h2><div class="story-columns"><p>We work with small makers, use reusable keepsake boxes and keep the human touch in every dispatch.</p><div><strong>2019</strong><span>Supriszo &amp; Co. founded in Mumbai</span></div><div><strong>32</strong><span>Independent makers we work with</span></div></div></section>`,
  cart: `<section class="page-width checkout-steps"><div class="checkout-step active"><b>1</b><span>Cart &amp; Hampers</span></div><div class="checkout-step"><b>2</b><span>Delivery Details</span></div><div class="checkout-step"><b>3</b><span>Payment</span></div></section>`
};

function protectImages(scope = document) {
  scope.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      if (image.dataset.fallback) return;
      image.dataset.fallback = 'true';
      image.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCv99V82mbTkLCy_VYd6NxPxQ5kvPV3ckqvY6NRMfdOdoEXok6F0NtfZN_76HtgHFWSW4YAMqjZoIGlWXt_lGFci4gL1BuzvcfJucXy_7NhU_MN58Xo8iRtWskA7KvLwiOMJbLukB5FeEHh_Om18fC6qT8lxoR-c-kr49_EVc_hRTfjVzd-ychpySK41Sx0bHBBM-IP7eDSHfegeXuTBvhMg6Vgvw8GFALqfgHtYjct6aJLzzmM_witeg';
    });
  });
}

function render(view) {
  const content = document.querySelector('#pageContent');
  const targetView = (view === 'categories' || view === 'occasions') ? 'hampers' : view;
  document.querySelectorAll('[data-nav]').forEach((link) => link.classList.toggle('active', link.dataset.nav === targetView));

  if (targetView === 'hampers') {
    content.innerHTML = `<section class="page-width inner-page">
      ${sectionHeader('Curated Collections', 'Gift Hampers & Categories', 'Explore 42 unique artisanal hampers organized by occasion, milestone, and gift recipient.')}
      <div class="category-filter-bar" id="categoryFilterBar">
        <button class="cat-filter-btn active" data-filter="all">All Hampers (42)</button>
        <button class="cat-filter-btn" data-filter="birthday">🎂 Birthday</button>
        <button class="cat-filter-btn" data-filter="anniversary">💍 Anniversary</button>
        <button class="cat-filter-btn" data-filter="wedding">👑 Wedding</button>
        <button class="cat-filter-btn" data-filter="festivals">🪔 Festivals</button>
        <button class="cat-filter-btn" data-filter="corporate-gifting">💼 Corporate</button>
        <button class="cat-filter-btn" data-filter="for-her">🌹 For Her</button>
        <button class="cat-filter-btn" data-filter="for-him">🎩 For Him</button>
      </div>
      <div id="categoryCatalog" class="category-catalog" style="margin-top:20px;">
        <p class="catalog-loading">Loading live gift hamper collection...</p>
      </div>
    </section>`;
    hydrateCategoryCatalog();
  } else if (targetView === 'personalise') {
    content.innerHTML = `<section class="page-width inner-page personalise-page">${sectionHeader('Made Meaningful', 'Personalise Your Hamper Studio', 'Turn a beautiful gift into an unforgettable gesture with considered details, handwritten words and your own finishing touch.')}<div class="studio-grid"><div class="studio-preview"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuChn8y1etBcrr38hX_sAO2SMdwT-c6XIrGLdYC8znNYqJB5VpO9ZwYtBW_lEDu54Yrw619iQ3i7DDsj4ugSGUtPDlKjjQNZ934UAR0I1puvBSsCH2CNZZBYk_drdYxin66Pg5kNcXG3TcpucYegTsoH-Q7O3JedBkyMSy87RxykNBhUOmhitCptwE4ZshyVQWszkb6zeyi_P9TkSuSINU4Z7-ZuO4HiFTqOWgd8b8l0xtpSy2Pe2DWuZQ" alt="Personalised hamper preview" /><span class="preview-label">Your hamper preview</span></div><div class="studio-form"><label>Gift message<textarea id="personaliseMsg" placeholder="Write a note that feels like you..."></textarea></label><label>Choose a ribbon<select id="personaliseRibbon"><option>Terracotta Raw Silk</option><option>Forest Green Velvet</option><option>Ivory Cotton</option></select></label><label>Gift occasion<select id="personaliseOccasion"><option>Anniversary</option><option>Birthday</option><option>Wedding</option><option>Just Because</option></select></label><button class="button button-dark" id="savePersonalisation">Save Your Details <span class="material-symbols-outlined">arrow_forward</span></button></div></div></section>`;
    hydratePersonalisation();
  } else if (targetView === 'about') {
    content.innerHTML = `<section class="page-width inner-page about-page"><div class="about-hero"><div>${sectionHeader('Our Story', 'Gifts that hold a little more meaning.', 'Supriszo means thoughtful surprises. We create considered hampers for the people, places and moments you want to hold close.')}<p class="about-copy">From hand-poured candles to brass keepsakes and small-batch delicacies, every Supriszo & Co. box is composed like a personal story. We partner with independent makers across India and wrap every order by hand in our Mumbai studio.</p><a class="button button-dark" href="pages.html?view=hampers">Explore Our Hampers <span class="material-symbols-outlined">arrow_forward</span></a></div><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu3BWXfYxlaMPRQUu9j_hJdLAQrRubq6nxZTHgu2EPqZa3p566u9VkrFORuxItRWHMXnJ-NEBCOa0Tyw0Vu-Vmv7izkfiRTWjUu2QLe9Swi02sw0odD_dLuFw-CMd-vUBeZ564myuoFVL5aQeQHTi93tiE-rlQ7amB8GXHIVrbI9sQp_nxdtCjpPwPswbo86tVuuzkZ9r4rOhNUm34w7Er84KRLZxJOKH7-zL5TIF3hcminKZ5fdV1aA" alt="Supriszo and Co. gifting studio" /></div></section>`;
  } else if (targetView === 'cart') {
    content.innerHTML = `<section class="page-width inner-page cart-page">${sectionHeader('Your Supriszo', 'Your Shopping Basket', '')}<div class="cart-layout"><div class="cart-items"><p class="muted">Loading basket...</p></div><aside class="order-summary"><p class="eyebrow">Delivery Promise</p><h2>Order confirmed today, hand-delivered by <i>tomorrow.</i></h2></aside></div></section>`;
    hydrateCartPage();
  } else if (targetView === 'checkout') {
    content.innerHTML = `<section class="page-width inner-page checkout-page"><div class="checkout-steps"><div class="checkout-step active"><b>1</b><span>Cart &amp; Hampers</span></div><div class="checkout-step active"><b>2</b><span>Delivery Details</span></div><div class="checkout-step active"><b>3</b><span>Payment</span></div></div>${sectionHeader('Secure Checkout', 'Almost there.', 'Enter delivery details and choose how you would like to pay.')}<div class="checkout-layout"><form class="checkout-form" id="checkoutForm"><div class="checkout-panel"><p class="eyebrow">Delivery Details</p><div class="checkout-form-grid"><label>Full name<input id="checkoutName" required placeholder="Your name" /></label><label>Phone number<input id="checkoutPhone" required pattern="[0-9+ \\-]{10,}" placeholder="+91 8655239282" /></label><label class="full-field">Address<textarea id="checkoutAddress" required placeholder="House / building, street, area"></textarea></label><label>City<input id="checkoutCity" required value="Mumbai" /></label><label>PIN code<input id="checkoutPin" required pattern="[0-9]{6}" placeholder="400001" /></label></div></div><div class="checkout-panel"><p class="eyebrow">Payment Method</p><div class="payment-options"><label><input type="radio" name="paymentMethod" value="upi" checked /><span class="material-symbols-outlined">account_balance_wallet</span><b>UPI</b><small>GPay, PhonePe, Paytm</small></label><label><input type="radio" name="paymentMethod" value="card" /><span class="material-symbols-outlined">credit_card</span><b>Card</b><small>Credit or debit card</small></label><label><input type="radio" name="paymentMethod" value="netbanking" /><span class="material-symbols-outlined">account_balance</span><b>Net Banking</b><small>All major banks</small></label><label><input type="radio" name="paymentMethod" value="cod" /><span class="material-symbols-outlined">payments</span><b>Cash on Delivery</b><small>Pay when it arrives</small></label></div></div><button class="button button-dark place-order" type="submit">Place Secure Order <span class="material-symbols-outlined">lock</span></button></form><aside class="order-summary checkout-summary"><p class="eyebrow">Order Summary</p><h2>Thoughtful gifts, on their way.</h2><div id="checkoutSummary">Loading your basket...</div></aside></div></section>`;
    hydrateCheckoutPage();
  }

  if (pageExtras[targetView]) content.insertAdjacentHTML('beforeend', pageExtras[targetView]);
  protectImages(content);
  bindPageActions();
  bindSearch();
  api('/cart').then(updateCartBadge).catch(() => {});
}

function hydrateCategoryCatalog() {
  api('/categories').then((categories) => {
    const catalog = document.querySelector('#categoryCatalog');
    if (!catalog) return;
    catalog.innerHTML = categories.map((category) => `
      <section class="category-product-section" id="category-${category.id}">
        <div class="category-heading">
          <div><p class="eyebrow">${category.name}</p><h2>${category.name} Collection</h2></div>
          <span>${(category.products || []).length} hampers</span>
        </div>
        <div class="product-grid page-product-grid">
          ${(category.products || []).map(productCardFromObject).join('')}
        </div>
      </section>
    `).join('');
    protectImages(catalog);
    bindPageActions();

    // Bind Category Filter Buttons
    document.querySelectorAll('#categoryFilterBar .cat-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#categoryFilterBar .cat-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        const searchInput = document.querySelector('#pageSearch');
        if (searchInput) searchInput.value = '';
        const noResultsEl = document.querySelector('#searchNoResults');
        if (noResultsEl) noResultsEl.remove();

        document.querySelectorAll('.category-product-section').forEach((sec) => {
          sec.querySelectorAll('.product-card').forEach(card => card.hidden = false);
          if (filter === 'all') {
            sec.style.display = 'block';
          } else {
            const secId = sec.id.replace('category-', '');
            sec.style.display = secId === filter ? 'block' : 'none';
          }
        });
      });
    });

    // Check for active search query (from URL ?search= or input) and filter catalog
    const searchInput = document.querySelector('#pageSearch');
    const urlQuery = new URLSearchParams(window.location.search).get('search') || '';
    const activeQuery = (searchInput && searchInput.value.trim()) || urlQuery;
    if (activeQuery) {
      applyProductSearch(activeQuery);
    }
  }).catch((error) => showToast(error.message));
}

function hydratePersonalisation() {
  api('/personalisation').then((data) => {
    if (data.message) document.querySelector('#personaliseMsg').value = data.message;
    if (data.ribbon) document.querySelector('#personaliseRibbon').value = data.ribbon;
    if (data.occasion) document.querySelector('#personaliseOccasion').value = data.occasion;
  }).catch(() => {});
}

function hydrateCheckoutPage() {
  api('/cart').then((cart) => {
    updateCartBadge(cart);
    const summary = document.querySelector('#checkoutSummary');
    if (summary) {
      summary.innerHTML = `${cart.items.map((item) => `
        <div class="summary-row">
          <span>${item.product.name} × ${item.quantity}</span>
          <strong>₹${item.lineTotal.toLocaleString('en-IN')}</strong>
        </div>
      `).join('')}
      <div class="summary-row"><span>Express delivery</span><strong>Free</strong></div>
      <div class="summary-row total"><span>Total</span><strong>₹${cart.total.toLocaleString('en-IN')}</strong></div>`;
    }

    document.querySelector('#checkoutForm')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const customer = {
        name: document.querySelector('#checkoutName').value.trim(),
        phone: document.querySelector('#checkoutPhone').value.trim(),
        address: `${document.querySelector('#checkoutAddress').value.trim()}, ${document.querySelector('#checkoutCity').value.trim()} - ${document.querySelector('#checkoutPin').value.trim()}`
      };
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
      api('/orders', { method: 'POST', body: JSON.stringify({ customer, paymentMethod }) })
        .then(({ order }) => {
          showToast(`Order ${order.id} confirmed! Thank you.`);
          setTimeout(() => { window.location.href = 'index.html'; }, 1200);
        })
        .catch((error) => showToast(error.message));
    });
  }).catch((error) => showToast(error.message));
}

function renderCartItems(cart) {
  if (!cart.items.length) return '<div class="empty-cart"><span class="material-symbols-outlined">shopping_bag</span><h2>Your basket is empty.</h2><p>Explore our hampers and add your favorites here.</p><a class="button button-dark" href="pages.html?view=hampers">Explore Hampers</a></div>';
  return cart.items.map(({ product, quantity, lineTotal }) => `
    <article class="cart-item" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <span class="product-tag">${product.tag || 'Curated'}</span>
        <h2>${product.name}</h2>
        <p>${product.description || ''}</p>
        <div class="cart-controls">
          <button class="decrease" type="button">-</button>
          <strong>${quantity}</strong>
          <button class="increase" type="button">+</button>
          <button class="remove-item" type="button">Remove</button>
        </div>
      </div>
      <b>₹${lineTotal.toLocaleString('en-IN')}</b>
    </article>
  `).join('');
}

function hydrateCartPage() {
  api('/cart').then((cart) => {
    updateCartBadge(cart);
    const itemsContainer = document.querySelector('.cart-items');
    if (itemsContainer) itemsContainer.innerHTML = renderCartItems(cart);

    const summary = document.querySelector('.order-summary');
    if (summary) {
      summary.innerHTML = `
        <p class="eyebrow">Delivery Promise</p>
        <h2>${cart.items.length ? 'Order confirmed today, hand-delivered by <i>tomorrow.</i>' : 'Your next thoughtful gesture starts here.'}</h2>
        <div class="summary-row"><span>Subtotal</span><strong>₹${cart.subtotal.toLocaleString('en-IN')}</strong></div>
        <div class="summary-row"><span>Express delivery</span><strong>Free</strong></div>
        <div class="summary-row total"><span>Total</span><strong>₹${cart.total.toLocaleString('en-IN')}</strong></div>
        ${cart.items.length ? '<a class="button button-dark checkout-button" href="pages.html?view=checkout">Proceed to Secure Checkout <span class="material-symbols-outlined">lock</span></a>' : '<button class="button button-dark checkout-button" disabled>Proceed to Secure Checkout <span class="material-symbols-outlined">lock</span></button>'}
      `;
    }
    bindCartActions();
  }).catch((error) => showToast(error.message));
}

function bindCartActions() {
  document.querySelectorAll('.cart-item').forEach((item) => {
    const productId = item.dataset.productId;
    const quantity = () => Number(item.querySelector('strong').textContent);
    item.querySelector('.increase')?.addEventListener('click', () => api(`/cart/items/${productId}`, { method: 'PATCH', body: JSON.stringify({ quantity: quantity() + 1 }) }).then(hydrateCartPage).catch((error) => showToast(error.message)));
    item.querySelector('.decrease')?.addEventListener('click', () => quantity() > 1 && api(`/cart/items/${productId}`, { method: 'PATCH', body: JSON.stringify({ quantity: quantity() - 1 }) }).then(hydrateCartPage).catch((error) => showToast(error.message)));
    item.querySelector('.remove-item')?.addEventListener('click', () => api(`/cart/items/${productId}`, { method: 'DELETE' }).then(hydrateCartPage).catch((error) => showToast(error.message)));
  });
}

function bindPageActions() {
  document.querySelectorAll('.add-button').forEach((button) => button.addEventListener('click', () => {
    const productId = button.dataset.productId;
    api('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity: 1 }) }).then((cart) => { updateCartBadge(cart); showToast('Added to your hamper'); }).catch((error) => showToast(error.message));
  }));
  document.querySelectorAll('.favorite').forEach((button) => button.addEventListener('click', () => {
    const productId = button.dataset.productId;
    api(`/favorites/${productId}`, { method: 'POST' }).then((result) => { button.classList.toggle('is-favorite', result.saved); showToast(result.saved ? 'Saved to your favorites' : 'Removed from your favorites'); }).catch((error) => showToast(error.message));
  }));
  const saveButton = document.querySelector('#savePersonalisation');
  if (saveButton) {
    saveButton.addEventListener('click', () => api('/personalisation', {
      method: 'PUT',
      body: JSON.stringify({
        message: document.querySelector('#personaliseMsg')?.value || '',
        ribbon: document.querySelector('#personaliseRibbon')?.value || '',
        occasion: document.querySelector('#personaliseOccasion')?.value || ''
      })
    }).then(() => showToast('Your personalisation details are saved')).catch((error) => showToast(error.message)));
  }
}

function applyProductSearch(query) {
  const searchInput = document.querySelector('#pageSearch');
  if (searchInput && searchInput.value !== query) {
    searchInput.value = query;
  }

  const cleanQuery = (query || '').trim().toLowerCase();
  const allSections = document.querySelectorAll('.category-product-section');
  let totalVisible = 0;

  allSections.forEach((section) => {
    const secCategoryName = (section.querySelector('.category-heading p')?.textContent || '').toLowerCase();
    const cards = section.querySelectorAll('.product-card');
    let sectionVisibleCount = 0;

    cards.forEach((card) => {
      const cardText = card.textContent.toLowerCase();
      const cardName = (card.dataset.name || '').toLowerCase();

      const matches = !cleanQuery || cardText.includes(cleanQuery) || cardName.includes(cleanQuery) || secCategoryName.includes(cleanQuery);

      card.hidden = !matches;
      if (matches) {
        sectionVisibleCount++;
        totalVisible++;
      }
    });

    section.style.display = (sectionVisibleCount > 0) ? 'block' : 'none';
  });

  let noResultsEl = document.querySelector('#searchNoResults');
  if (cleanQuery && totalVisible === 0) {
    if (!noResultsEl) {
      noResultsEl = document.createElement('div');
      noResultsEl.id = 'searchNoResults';
      document.querySelector('#categoryCatalog')?.prepend(noResultsEl);
    }
    noResultsEl.innerHTML = `<div class="no-results-card" style="text-align:center; padding:48px 24px; background:#fffdf8; border:1px dashed #dad8ce; border-radius:6px; margin:20px 0 40px;">
      <span class="material-symbols-outlined" style="font-size:48px; color:var(--copper); margin-bottom:12px;">search_off</span>
      <h3 style="font-family:var(--serif); font-size:22px; margin:0 0 8px;">No hampers found matching "${query}"</h3>
      <p style="color:var(--muted); font-size:12px; margin:0 0 20px;">Try searching for dry fruits, brass, candle, tea, chocolates, or birthday hampers.</p>
      <button class="button button-dark" id="clearSearchBtn" style="font-size:11px;">View All 42 Hampers</button>
    </div>`;
    document.querySelector('#clearSearchBtn')?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      applyProductSearch('');
    });
  } else if (noResultsEl) {
    noResultsEl.remove();
  }
}

function bindSearch() {
  const searchInput = document.querySelector('#pageSearch');
  if (!searchInput) return;

  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('search') || '';

  if (initialSearch && !searchInput.value) {
    searchInput.value = initialSearch;
  }

  const searchBox = searchInput.closest('.search-box');
  const searchIcon = searchBox?.querySelector('.material-symbols-outlined');
  if (searchIcon) {
    searchIcon.style.cursor = 'pointer';
    searchIcon.setAttribute('title', 'Click to search hampers');
  }

  const handleSearchSubmit = () => {
    const query = searchInput.value.trim();
    const currentView = new URLSearchParams(window.location.search).get('view') || 'hampers';
    if (currentView !== 'hampers' && currentView !== 'categories' && currentView !== 'occasions') {
      window.location.href = `pages.html?view=hampers&search=${encodeURIComponent(query)}`;
    } else {
      document.querySelectorAll('#categoryFilterBar .cat-filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === 'all');
      });
      applyProductSearch(query);
    }
  };

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    const currentView = new URLSearchParams(window.location.search).get('view') || 'hampers';
    if (currentView === 'hampers' || currentView === 'categories' || currentView === 'occasions') {
      document.querySelectorAll('#categoryFilterBar .cat-filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === 'all');
      });
      applyProductSearch(query);
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  });

  searchIcon?.addEventListener('click', () => {
    handleSearchSubmit();
  });
}

const view = new URLSearchParams(window.location.search).get('view') || 'hampers';
render(view);
