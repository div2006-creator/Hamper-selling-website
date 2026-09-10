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
  setTimeout(() => toast.classList.remove('show'), 2500);
}

const productCardFromObject = (product) => {
  const isOutOfStock = (product.stockQuantity !== undefined && product.stockQuantity <= 0);
  return `<article class="product-card page-product-card" data-name="${product.name.toLowerCase()}" data-price="${product.price}" data-rating="${product.rating || 4.8}">
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuCv99V82mbTkLCy_VYd6NxPxQ5kvPV3ckqvY6NRMfdOdoEXok6F0NtfZN_76HtgHFWSW4YAMqjZoIGlWXt_lGFci4gL1BuzvcfJucXy_7NhU_MN58Xo8iRtWskA7KvLwiOMJbLukB5FeEHh_Om18fC6qT8lxoR-c-kr49_EVc_hRTfjVzd-ychpySK41Sx0bHBBM-IP7eDSHfegeXuTBvhMg6Vgvw8GFALqfgHtYjct6aJLzzmM_witeg'" />
      <span class="product-tag">${product.tag || 'Curated'}</span>
      ${isOutOfStock ? '<span class="out-stock-badge">Out of Stock</span>' : ''}
      <button class="favorite" data-product-id="${product.id}" aria-label="Save ${product.name}"><span class="material-symbols-outlined">favorite</span></button>
    </div>
    <div class="product-info">
      <div class="rating"><span class="material-symbols-outlined">star</span> ${product.rating || 4.8} <small>(${product.reviews || 100} reviews)</small></div>
      <h3><a href="pages.html?view=product&amp;product=${product.id}">${product.name}</a></h3>
      <p>${product.description || ''}</p>
      <div class="price-row"><strong>₹${(product.price || 0).toLocaleString('en-IN')}</strong><del>₹${(product.mrp || product.price + 400).toLocaleString('en-IN')}</del><span>OFFER</span></div>
      <small class="saving">${isOutOfStock ? 'Currently Unavailable' : 'Free Express Shipping • Gift-ready packaging'}</small>
      <button class="add-button" data-product-id="${product.id}" data-product="${product.name}" ${isOutOfStock ? 'disabled' : ''}>
        <span class="material-symbols-outlined">shopping_bag</span> ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  </article>`;
};

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
  const urlParams = new URLSearchParams(window.location.search);
  const targetView = (view === 'categories' || view === 'occasions') ? 'hampers' : view;
  document.querySelectorAll('[data-nav]').forEach((link) => link.classList.toggle('active', link.dataset.nav === targetView));

  if (targetView === 'product') {
    const prodId = urlParams.get('product');
    content.innerHTML = `<section class="page-width inner-page pdp-page"><p class="catalog-loading">Loading product details...</p></section>`;
    hydrateProductDetailPage(prodId);
  } else if (targetView === 'track') {
    const orderId = urlParams.get('id') || '';
    content.innerHTML = `<section class="page-width inner-page track-page">${sectionHeader('Real-time Dispatch Tracking', 'Track Your Order', 'Enter your unique Supriszo Order ID (e.g. SPR-XXXXXX) to trace your hamper status.')}<div class="track-container"><div class="track-search-bar"><input id="trackOrderInput" placeholder="e.g. SPR-4A2B89" value="${orderId}" /><button class="button button-dark" id="btnTrackOrder">Track Status <span class="material-symbols-outlined">search</span></button></div><div id="trackResults" style="margin-top:24px;"></div></div></section>`;
    hydrateOrderTrackingPage(orderId);
  } else if (targetView === 'hampers') {
    content.innerHTML = `<section class="page-width inner-page">
      ${sectionHeader('Curated Collections', 'Gift Hampers & Categories', 'Explore unique artisanal hampers organized by occasion, milestone, budget, and gift recipient.')}
      <div class="category-filter-bar" id="categoryFilterBar">
        <button class="cat-filter-btn active" data-filter="all">All Hampers</button>
        <button class="cat-filter-btn" data-filter="birthday">🎂 Birthday</button>
        <button class="cat-filter-btn" data-filter="anniversary">💍 Anniversary</button>
        <button class="cat-filter-btn" data-filter="wedding">👑 Wedding</button>
        <button class="cat-filter-btn" data-filter="festivals">🪔 Festivals</button>
        <button class="cat-filter-btn" data-filter="corporate-gifting">💼 Corporate</button>
        <button class="cat-filter-btn" data-filter="for-her">🌹 For Her</button>
        <button class="cat-filter-btn" data-filter="for-him">🎩 For Him</button>
      </div>

      <div class="catalog-toolbar">
        <div class="budget-filter-bar">
          <span class="toolbar-label">Budget:</span>
          <button class="budget-btn active" data-budget="all">All Prices</button>
          <button class="budget-btn" data-budget="under1000">Under ₹1,000</button>
          <button class="budget-btn" data-budget="1000to2000">₹1,000 - ₹2,000</button>
          <button class="budget-btn" data-budget="above2000">₹2,000+</button>
        </div>
        <div class="sort-bar">
          <label>Sort By:
            <select id="catalogSortSelect">
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </label>
        </div>
      </div>

      <div id="categoryCatalog" class="category-catalog" style="margin-top:20px;">
        <p class="catalog-loading">Loading live gift hamper collection...</p>
      </div>
    </section>`;
    hydrateCategoryCatalog();
  } else if (targetView === 'personalise') {
    content.innerHTML = `<section class="page-width inner-page personalise-page">${sectionHeader('Made Meaningful', 'Personalise Your Hamper Studio', 'Turn a beautiful gift into an unforgettable gesture with considered details, handwritten words and your own finishing touch.')}<div class="studio-grid"><div class="studio-preview"><img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80" alt="Personalised hamper preview" /><span class="preview-label">Your hamper preview</span></div><div class="studio-form"><label>Gift message<textarea id="personaliseMsg" placeholder="Write a note that feels like you..."></textarea></label><label>Choose a ribbon<select id="personaliseRibbon"><option>Terracotta Raw Silk</option><option>Forest Green Velvet</option><option>Ivory Cotton</option><option>Royal Gold Satin</option></select></label><label>Gift occasion<select id="personaliseOccasion"><option>Anniversary</option><option>Birthday</option><option>Wedding</option><option>Just Because</option></select></label><button class="button button-dark" id="savePersonalisation">Save Your Details <span class="material-symbols-outlined">arrow_forward</span></button></div></div></section>`;
    hydratePersonalisation();
  } else if (targetView === 'about') {
    content.innerHTML = `<section class="page-width inner-page about-page"><div class="about-hero"><div>${sectionHeader('Our Story', 'Gifts that hold a little more meaning.', 'Supriszo means thoughtful surprises. We create considered hampers for the people, places and moments you want to hold close.')}<p class="about-copy">From hand-poured candles to brass keepsakes and small-batch delicacies, every Supriszo & Co. box is composed like a personal story. We partner with independent makers across India and wrap every order by hand in our Mumbai studio.</p><a class="button button-dark" href="pages.html?view=hampers">Explore Our Hampers <span class="material-symbols-outlined">arrow_forward</span></a></div><img src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80" alt="Supriszo and Co. gifting studio" /></div></section>`;
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

function hydrateProductDetailPage(prodId) {
  if (!prodId) {
    document.querySelector('#pageContent').innerHTML = `<section class="page-width inner-page"><div class="no-results-card" style="text-align:center; padding:48px 24px;"><h2>No product selected.</h2><a class="button button-dark" href="pages.html?view=hampers">Explore Catalog</a></div></section>`;
    return;
  }
  api(`/products/${prodId}`).then((product) => {
    const isOutOfStock = (product.stockQuantity !== undefined && product.stockQuantity <= 0);
    const stockMsg = isOutOfStock
      ? `<span class="stock-tag out-of-stock"><span class="material-symbols-outlined">cancel</span> Out of Stock</span>`
      : (product.stockQuantity && product.stockQuantity <= 5)
        ? `<span class="stock-tag low-stock"><span class="material-symbols-outlined">warning</span> Low Stock: Only ${product.stockQuantity} left</span>`
        : `<span class="stock-tag in-stock"><span class="material-symbols-outlined">check_circle</span> In Stock (${product.stockQuantity || 50} available)</span>`;

    document.querySelector('#pageContent').innerHTML = `
      <section class="page-width inner-page pdp-container">
        <div class="pdp-breadcrumb">
          <a href="index.html">Home</a> &rsaquo; <a href="pages.html?view=hampers">Hampers</a> &rsaquo; <span>${product.name}</span>
        </div>
        <div class="pdp-layout">
          <div class="pdp-gallery">
            <div class="main-image-wrap">
              <img id="pdpMainImg" src="${product.image}" alt="${product.name}" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuCv99V82mbTkLCy_VYd6NxPxQ5kvPV3ckqvY6NRMfdOdoEXok6F0NtfZN_76HtgHFWSW4YAMqjZoIGlWXt_lGFci4gL1BuzvcfJucXy_7NhU_MN58Xo8iRtWskA7KvLwiOMJbLukB5FeEHh_Om18fC6qT8lxoR-c-kr49_EVc_hRTfjVzd-ychpySK41Sx0bHBBM-IP7eDSHfegeXuTBvhMg6Vgvw8GFALqfgHtYjct6aJLzzmM_witeg'" />
              <span class="product-tag pdp-tag">${product.tag || 'Curated Keepsake'}</span>
            </div>
            <div class="pdp-trust-list">
              <div><span class="material-symbols-outlined">verified</span>100% Transit-Safe Assurance</div>
              <div><span class="material-symbols-outlined">card_giftcard</span>Complimentary Gold-foil Gift Card</div>
              <div><span class="material-symbols-outlined">eco</span>Eco-friendly Reusable Box</div>
            </div>
          </div>
          <div class="pdp-details">
            <p class="eyebrow">${product.tag || 'Handcrafted Collection'}</p>
            <h1>${product.name}</h1>
            <div class="pdp-rating-row">
              <span class="material-symbols-outlined">star</span> <strong>${product.rating || 4.9}</strong>
              <span class="muted">(${product.reviews || 120} customer reviews)</span>
              ${stockMsg}
            </div>
            <div class="pdp-price-box">
              <strong class="pdp-price">₹${(product.price || 0).toLocaleString('en-IN')}</strong>
              <del class="pdp-mrp">₹${(product.mrp || product.price + 400).toLocaleString('en-IN')}</del>
              <span class="pdp-discount">SAVE ₹${((product.mrp || product.price + 400) - product.price).toLocaleString('en-IN')}</span>
            </div>
            <p class="pdp-desc">${product.description || 'Thoughtfully curated luxury gift hamper filled with handcrafted keepsakes, artisanal delicacies, and elegant presentation.'}</p>

            <!-- PIN Code Delivery Checker Widget -->
            <div class="pincode-checker-box">
              <div class="pincode-header"><span class="material-symbols-outlined">local_shipping</span> <strong>Check Delivery Availability &amp; Date</strong></div>
              <div class="pincode-input-row">
                <input id="pincodeInput" type="text" maxlength="6" placeholder="Enter 6-digit PIN code (e.g. 400001)" />
                <button type="button" id="btnCheckPincode" class="button button-dark small-btn">Check PIN</button>
              </div>
              <div id="pincodeResult" class="pincode-result"></div>
            </div>

            <!-- Item-Level Personalisation Box -->
            <div class="pdp-personalisation-box">
              <h3><span class="material-symbols-outlined">edit_note</span> Personalise This Hamper</h3>
              <p class="small-copy">Add a handwritten message card &amp; ribbon style specifically for this box.</p>
              <label>Gift Message Card (optional)
                <textarea id="pdpMessage" rows="2" maxlength="300" placeholder="e.g. Happy Birthday! Wishing you joy and beautiful moments..."></textarea>
              </label>
              <div class="pdp-pers-grid">
                <label>Silk Ribbon Color
                  <select id="pdpRibbon">
                    <option>Terracotta Raw Silk</option>
                    <option>Forest Green Velvet</option>
                    <option>Ivory Cotton</option>
                    <option>Royal Gold Satin</option>
                  </select>
                </label>
                <label>Gift Occasion
                  <select id="pdpOccasion">
                    <option>Birthday</option>
                    <option>Anniversary</option>
                    <option>Wedding</option>
                    <option>Festive Celebration</option>
                    <option>Corporate Milestone</option>
                    <option>Just Because</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="pdp-actions">
              <div class="qty-selector">
                <button type="button" id="pdpQtyDec">-</button>
                <span id="pdpQtyVal">1</span>
                <button type="button" id="pdpQtyInc">+</button>
              </div>
              <button id="pdpAddToCartBtn" class="button button-dark add-to-cart-lg" ${isOutOfStock ? 'disabled' : ''}>
                <span class="material-symbols-outlined">shopping_bag</span> ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </section>
    `;

    protectImages(document.querySelector('.pdp-container'));

    // Pincode checker logic
    document.querySelector('#btnCheckPincode')?.addEventListener('click', () => {
      const pin = document.querySelector('#pincodeInput').value.trim();
      const resEl = document.querySelector('#pincodeResult');
      if (!/^\d{6}$/.test(pin)) {
        resEl.className = 'pincode-result error';
        resEl.innerHTML = '<span class="material-symbols-outlined">error</span> Please enter a valid 6-digit Indian PIN code.';
        return;
      }
      if (pin.startsWith('400') || pin.startsWith('401') || pin.startsWith('410')) {
        resEl.className = 'pincode-result success-fast';
        resEl.innerHTML = '⚡ <strong>One-Day Express Delivery Available!</strong> Hand-delivered tomorrow evening by 7 PM.';
      } else {
        resEl.className = 'pincode-result success-std';
        resEl.innerHTML = '🚚 <strong>Pan-India Air Express Delivery Available.</strong> Estimated delivery in 3 to 4 business days.';
      }
    });

    // Quantity selector logic
    let qty = 1;
    const maxQty = product.stockQuantity !== undefined ? product.stockQuantity : 50;
    document.querySelector('#pdpQtyInc')?.addEventListener('click', () => {
      if (qty < maxQty) { qty++; document.querySelector('#pdpQtyVal').textContent = qty; }
      else { showToast(`Only ${maxQty} hampers in stock`); }
    });
    document.querySelector('#pdpQtyDec')?.addEventListener('click', () => {
      if (qty > 1) { qty--; document.querySelector('#pdpQtyVal').textContent = qty; }
    });

    // Add to cart logic
    document.querySelector('#pdpAddToCartBtn')?.addEventListener('click', () => {
      if (isOutOfStock) return;
      const pers = {
        message: document.querySelector('#pdpMessage').value.trim(),
        ribbon: document.querySelector('#pdpRibbon').value,
        occasion: document.querySelector('#pdpOccasion').value
      };
      api('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity: qty, personalisation: pers })
      }).then((cart) => {
        updateCartBadge(cart);
        showToast(`${product.name} added to your basket!`);
      }).catch(err => showToast(err.message));
    });
  }).catch(err => {
    document.querySelector('#pageContent').innerHTML = `<section class="page-width inner-page"><div class="no-results-card" style="text-align:center; padding:48px 24px;"><h2>Hamper not found.</h2><p>${err.message}</p><a class="button button-dark" href="pages.html?view=hampers">Back to Catalog</a></div></section>`;
  });
}

function hydrateOrderTrackingPage(initialId = '') {
  const container = document.querySelector('#trackResults');
  const executeTrack = (id) => {
    const cleanId = String(id || '').trim();
    if (!cleanId) {
      if (container) container.innerHTML = '<p class="muted" style="text-align:center;">Enter an Order ID above to check tracking progress.</p>';
      return;
    }
    if (container) container.innerHTML = '<p class="muted" style="text-align:center;">Searching order database...</p>';

    api(`/orders/${encodeURIComponent(cleanId)}`).then((order) => {
      const statusMap = { confirmed: 1, packed: 2, dispatched: 3, delivered: 4, cancelled: 0 };
      const currentStep = statusMap[order.status.toLowerCase()] || 1;
      const isCancelled = order.status.toLowerCase() === 'cancelled';

      container.innerHTML = `
        <div class="tracking-card">
          <div class="tracking-header">
            <div>
              <p class="eyebrow">Order ID: ${order.id}</p>
              <h2>Status: <span class="status-badge ${order.status}">${order.status.toUpperCase()}</span></h2>
              <small class="muted">Placed on ${new Date(order.createdAt).toLocaleDateString()} at ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
            </div>
            <div class="tracking-total">
              <small>Total Amount</small>
              <strong>₹${(order.total || 0).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          ${!isCancelled ? `
          <div class="tracking-timeline">
            <div class="timeline-step ${currentStep >= 1 ? 'completed' : ''}">
              <div class="step-icon"><span class="material-symbols-outlined">check_circle</span></div>
              <div class="step-label">Order Confirmed</div>
            </div>
            <div class="timeline-connector ${currentStep >= 2 ? 'active' : ''}"></div>
            <div class="timeline-step ${currentStep >= 2 ? 'completed' : ''}">
              <div class="step-icon"><span class="material-symbols-outlined">inventory_2</span></div>
              <div class="step-label">Handcrafted &amp; Packed</div>
            </div>
            <div class="timeline-connector ${currentStep >= 3 ? 'active' : ''}"></div>
            <div class="timeline-step ${currentStep >= 3 ? 'completed' : ''}">
              <div class="step-icon"><span class="material-symbols-outlined">local_shipping</span></div>
              <div class="step-label">Dispatched / Out for Delivery</div>
            </div>
            <div class="timeline-connector ${currentStep >= 4 ? 'active' : ''}"></div>
            <div class="timeline-step ${currentStep >= 4 ? 'completed' : ''}">
              <div class="step-icon"><span class="material-symbols-outlined">home</span></div>
              <div class="step-label">Delivered</div>
            </div>
          </div>
          ` : '<div class="cancelled-alert"><span class="material-symbols-outlined">cancel</span> This order was cancelled. Please contact concierge support if you need assistance.</div>'}

          <div class="tracking-details-grid">
            <div class="track-detail-col">
              <h3>Recipient &amp; Delivery Address</h3>
              <p><strong>${order.customer.name}</strong></p>
              <p>📞 ${order.customer.phone}</p>
              <p>📍 ${order.customer.address}</p>
            </div>
            <div class="track-detail-col">
              <h3>Items Included (${(order.items || []).length})</h3>
              ${(order.items || []).map(i => `
                <div class="track-item-row">
                  <div>
                    <strong>${i.name} × ${i.quantity}</strong>
                    ${i.personalisation?.message ? `<small class="track-pers-note">💌 Note: "${i.personalisation.message}" (${i.personalisation.ribbon || 'Ribbon'})</small>` : ''}
                  </div>
                  <b>₹${(i.lineTotal || 0).toLocaleString('en-IN')}</b>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).catch(err => {
      container.innerHTML = `<div class="no-results-card" style="text-align:center; padding:32px 16px;">
        <span class="material-symbols-outlined" style="font-size:40px; color:#d9534f;">warning</span>
        <h3>Order "${cleanId}" not found</h3>
        <p class="muted">Please double check your Order ID from your confirmation screen.</p>
      </div>`;
    });
  };

  document.querySelector('#btnTrackOrder')?.addEventListener('click', () => {
    executeTrack(document.querySelector('#trackOrderInput').value);
  });
  document.querySelector('#trackOrderInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeTrack(document.querySelector('#trackOrderInput').value);
  });

  if (initialId) executeTrack(initialId);
}

function applyCatalogSortAndFilter() {
  const activeBudget = document.querySelector('.budget-btn.active')?.dataset.budget || 'all';
  const sortVal = document.querySelector('#catalogSortSelect')?.value || 'featured';

  document.querySelectorAll('.category-product-section').forEach((section) => {
    const grid = section.querySelector('.product-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.product-card'));

    cards.forEach((card) => {
      const price = Number(card.dataset.price || 0);
      let match = true;
      if (activeBudget === 'under1000') match = price < 1000;
      else if (activeBudget === '1000to2000') match = price >= 1000 && price <= 2000;
      else if (activeBudget === 'above2000') match = price > 2000;

      card.hidden = !match;
    });

    cards.sort((a, b) => {
      const priceA = Number(a.dataset.price || 0);
      const priceB = Number(b.dataset.price || 0);
      const ratingA = Number(a.dataset.rating || 0);
      const ratingB = Number(b.dataset.rating || 0);

      if (sortVal === 'price-low') return priceA - priceB;
      if (sortVal === 'price-high') return priceB - priceA;
      if (sortVal === 'rating') return ratingB - ratingA;
      return 0;
    });

    cards.forEach(card => grid.appendChild(card));
  });
}

function hydrateCategoryCatalog() {
  api('/categories').then((categories) => {
    const catalog = document.querySelector('#categoryCatalog');
    if (!catalog) return;

    // Dynamically render Category Filter Bar pills
    const filterBar = document.querySelector('#categoryFilterBar');
    if (filterBar) {
      const emojiMap = {
        'birthday': '🎂',
        'anniversary': '💍',
        'wedding': '👑',
        'festivals': '🪔',
        'corporate-gifting': '💼',
        'for-her': '🌹',
        'for-him': '🎩'
      };
      let filterBtnsHtml = `<button class="cat-filter-btn active" data-filter="all">All Hampers</button>`;
      categories.forEach(cat => {
        const icon = emojiMap[cat.id] || '🎁';
        filterBtnsHtml += `<button class="cat-filter-btn" data-filter="${cat.id}">${icon} ${cat.name}</button>`;
      });
      filterBar.innerHTML = filterBtnsHtml;
    }

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

    // Bind Budget Filters
    document.querySelectorAll('.budget-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.budget-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyCatalogSortAndFilter();
      });
    });

    // Bind Sort Selector
    document.querySelector('#catalogSortSelect')?.addEventListener('change', () => {
      applyCatalogSortAndFilter();
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

    document.querySelector('#checkoutForm')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitBtn = event.target.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const customer = {
        name: document.querySelector('#checkoutName').value.trim(),
        phone: document.querySelector('#checkoutPhone').value.trim(),
        address: `${document.querySelector('#checkoutAddress').value.trim()}, ${document.querySelector('#checkoutCity').value.trim()} - ${document.querySelector('#checkoutPin').value.trim()}`
      };
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

      if (paymentMethod === 'cod') {
        api('/orders', { method: 'POST', body: JSON.stringify({ customer, paymentMethod }) })
          .then(({ order }) => {
            showToast(`Order ${order.id} confirmed! Thank you.`);
            setTimeout(() => { window.location.href = `pages.html?view=track&id=${order.id}`; }, 1000);
          })
          .catch((error) => {
            if (submitBtn) submitBtn.disabled = false;
            showToast(error.message);
          });
      } else {
        try {
          showToast('Initializing secure Razorpay payment...');
          const rzpOrder = await api('/razorpay/create-order', {
            method: 'POST',
            body: JSON.stringify({ customer, paymentMethod })
          });

          if (typeof Razorpay === 'undefined') {
            throw new Error('Razorpay Checkout SDK failed to load. Please check your network connection.');
          }

          const options = {
            key: rzpOrder.keyId,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: 'Supriszo & Co.',
            description: 'Handcrafted Luxury Gift Hampers',
            order_id: rzpOrder.razorpayOrderId,
            prefill: {
              name: customer.name,
              contact: customer.phone
            },
            theme: { color: '#a8603d' },
            handler: function (response) {
              showToast('Verifying payment authorization...');
              api('/razorpay/verify-payment', {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  customer,
                  paymentMethod
                })
              }).then(({ order }) => {
                showToast(`Payment successful! Order ${order.id} confirmed.`);
                setTimeout(() => { window.location.href = `pages.html?view=track&id=${order.id}`; }, 1000);
              }).catch(err => {
                if (submitBtn) submitBtn.disabled = false;
                showToast(err.message);
              });
            },
            modal: {
              ondismiss: function() {
                if (submitBtn) submitBtn.disabled = false;
                showToast('Payment window closed.');
              }
            }
          };

          const rzp = new Razorpay(options);
          rzp.on('payment.failed', function (resp) {
            if (submitBtn) submitBtn.disabled = false;
            showToast(`Payment failed: ${resp.error?.description || 'Declined'}`);
          });
          rzp.open();
        } catch (error) {
          if (submitBtn) submitBtn.disabled = false;
          showToast(error.message);
        }
      }
    });
  }).catch((error) => showToast(error.message));
}

function renderCartItems(cart) {
  if (!cart.items.length) return '<div class="empty-cart"><span class="material-symbols-outlined">shopping_bag</span><h2>Your basket is empty.</h2><p>Explore our hampers and add your favorites here.</p><a class="button button-dark" href="pages.html?view=hampers">Explore Hampers</a></div>';
  return cart.items.map(({ product, quantity, lineTotal, personalisation }) => `
    <article class="cart-item" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuCv99V82mbTkLCy_VYd6NxPxQ5kvPV3ckqvY6NRMfdOdoEXok6F0NtfZN_76HtgHFWSW4YAMqjZoIGlWXt_lGFci4gL1BuzvcfJucXy_7NhU_MN58Xo8iRtWskA7KvLwiOMJbLukB5FeEHh_Om18fC6qT8lxoR-c-kr49_EVc_hRTfjVzd-ychpySK41Sx0bHBBM-IP7eDSHfegeXuTBvhMg6Vgvw8GFALqfgHtYjct6aJLzzmM_witeg'" />
      <div>
        <span class="product-tag">${product.tag || 'Curated'}</span>
        <h2><a href="pages.html?view=product&amp;product=${product.id}">${product.name}</a></h2>
        <p>${product.description || ''}</p>
        ${personalisation && (personalisation.message || personalisation.ribbon) ? `
          <div class="cart-item-pers">
            <span>💌 Card: "${personalisation.message || 'No custom note'}"</span>
            <span>🎀 Ribbon: ${personalisation.ribbon || 'Terracotta Raw Silk'} (${personalisation.occasion || 'General'})</span>
          </div>
        ` : ''}
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
    if (button.disabled) return;
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
      <button class="button button-dark" id="clearSearchBtn" style="font-size:11px;">View All Hampers</button>
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

async function loadStorefrontSettings() {
  try {
    const settings = await api('/settings');
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

loadStorefrontSettings();

const view = new URLSearchParams(window.location.search).get('view') || 'hampers';
render(view);
