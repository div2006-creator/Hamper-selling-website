const images = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB96gGuSJ4VRBfuHniiaWrbaw2qyQFXTvd7cm9fjLd5aOzW2iRiy8_2MKkB075fcEphqBa6NCh5_kaUKfNaSuqPsjPxb2WpZ_gChiec3Kdq0BTAGMOemnai41hsnSqN7Kj32QV18nvvututlWrRTc9GgzO4ZqURINdcka-YOkrZwcdQZMFD5BfUYyersFZyJfme0LmLqUAXJhYSQ09hTS3UY06XQpyEgZlhEj1ZjrHIH9e-CCJW6U7hKQ',
  chai: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCv99V82mbTkLCy_VYd6NxPxQ5kvPV3ckqvY6NRMfdOdoEXok6F0NtfZN_76HtgHFWSW4YAMqjZoIGlWXt_lGFci4gL1BuzvcfJucXy_7NhU_MN58Xo8iRtWskA7KvLwiOMJbLukB5FeEHh_Om18fC6qT8lxoR-c-kr49_EVc_hRTfjVzd-ychpySK41Sx0bHBBM-IP7eDSHfegeXuTBvhMg6Vgvw8GFALqfgHtYjct6aJLzzmM_witeg',
  corporate: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3BWXfYxlaMPRQUu9j_hJdLAQrRubq6nxZTHgu2EPqZa3p566u9VkrFORuxItRWHMXnJ-NEBCOa0Tyw0Vu-Vmv7izkfiRTWjUu2QLe9Swi02sw0odD_dLuFw-CMd-vUBeZ564myuoFVL5aQeQHTi93tiE-rlQ7amB8GXHIVrbI9sQp_nxdtCjpPwPswbo86tVuuzkZ9r4rOhNUm34w7Er84KRLZxJOKH7-zL5TIF3hcminKZ5fdV1aA',
  wedding: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8A0hPMtM8aaoeonT3zlDY2dnbGE9OWubwMsAt0dAZbexi65jcJMr4j1Sm1p7TGIzuhHGamIYBj3gcorMdXS6k8gqX_0fW_wWKJHmeF1bv9dKVUzKUSjmu-xflexZAg5Ykgv9ITaeiKtINXJiSJH3kdkxLofD4xPiIpe7FDbX2Hh2F5vUW4iRhqy57xVPWwW8AdbACrrVTW558JI7Hjb_w13V-XezHkyfHRExBiW8lsCQ3AspxX69aKA',
  festival: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9nA932W3v2MtrjjEohxGyxQ1hhwINjFdYEaCB7lacKesmKaNvMoIDJNyDq5FaBI7k0IeXxKNrlW8Ig-p8LjtEmmV_SOdAiX5R3afKGlVvCOwc_DfKcDbMXC-Ee-fb2JrXm-ELclPgupUhbrbaUxY4TU7KRS79D3RBbtQTtfI4LSUE74TxoT7oHYCs9ca4UV0yHg-kwSiP2k-Vkmdsw8IO7hO0X42InVkPFYSh6D44hwRnL6lim3AvOA',
  corporateAlt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_pEBSWWKB5RFuEFe_8t6ZTVKTUcH59B67UkpmBByhKP2ACVzJBcbMC00JsK4Tya7bSi-dRg9VfmW6mOwVDpaZTHs1J2-q0e5_wxd8aWqh5NesjU66LThdzMRNoPqxNmD718EsWY9eOIApvNl3arxxLMwtPRlfnfiO7hNCL0Kj-X3XpscG7yNwP6y9IRrzbsdJ9IMEVtFTa7fYFBbkEUW7MGcAgOwdMjvn5yf8nfdLPyj6K1zEbS3fRA',
  her: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1blANw3pSvlKkdTMF-JCCxiw1KXnyiF20ytVeQc1NuKs8CXR9t0TQSTdlUhYBb3AQvTDQk25y36Rz4IpnBtmAHPO7QJh8HFX3yDiNRfqmMn3B_X9bpKmB_uuGtqxFeMtDgSS1UasDJk-AmgQTFfopI8kaAeBQRm2xhxvoO6fGKYE_wyzVfjeQASGqSYCJ6FSdUPDIOBE5oiFKxWhgecAhkgiip6rJxZjCGxZyZp7yF75caGFx-8FgHQ',
  him: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB96gGuSJ4VRBfuHniiaWrbaw2qyQFXTvd7cm9fjLd5aOzW2iRiy8_2MKkB075fcEphqBa6NCh5_kaUKfNaSuqPsjPxb2WpZ_gChiec3Kdq0BTAGMOemnai41hsnSqN7Kj32QV18nvvututlWrRTc9GgzO4ZqURINdcka-YOkrZwcdQZMFD5BfUYyersFZyJfme0LmLqUAXJhYSQ09hTS3UY06XQpyEgZlhEj1ZjrHIH9e-CCJW6U7hKQ'
};

const products = [
  ['Royal Heritage Celebration Hamper', 'Signature Box', images.hero, '₹1,899', 'Saffron threads, salted dry fruits, dark chocolates and a carved brass diya.'],
  ['Artisanal Chai & Sweets Box', 'Eco-Luxe', images.chai, '₹999', 'Single-estate tea, roasted almonds, pistachio bites and a brass spoon.'],
  ['Corporate Curated Box', 'Trending', images.corporate, '₹1,499', 'Premium coffee, pistachios, chocolate bark and a handcrafted keepsake.'],
  ['Festival Light Hamper', 'Festive', images.festival, '₹1,299', 'Saffron sweets, brass diya, rose tea and a keepsake greeting card.'],
  ['The Celebration Edit', 'New', images.corporateAlt, '₹1,699', 'Dark chocolate bark, spiced cashews, candlelight and a silk ribbon.'],
  ['Self-Care Ritual Box', 'For Her', images.her, '₹1,149', 'Scented soy candle, organic tea, nourishing treats and a handwritten note.']
];

const productIdByName = Object.fromEntries(products.map(([name], index) => [name, ['royal-heritage', 'chai-sweets', 'corporate-curated', 'festival-light', 'celebration-edit', 'self-care-ritual'][index]]));
const api = (path, options) => fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...options }).then(async (response) => {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
});

function updateCartBadge(cart) {
  document.querySelectorAll('.header-actions b').forEach((badge) => { badge.textContent = cart.itemCount; });
}

const occasionCards = [
  ['Birthday', 'Gourmet treats & celebration boxes', images.hero], ['Anniversary', 'Romance, fine aromas & keepsake flutes', images.chai], ['Wedding', 'Royal mithai & brassware tokens', images.wedding], ['Festivals', 'Diwali, Rakhi & New Year hampers', images.festival], ['Corporate Gifting', 'Client appreciation & team milestone kits', images.corporateAlt], ['For Her', 'Self-care, scented soy & organic teas', images.her], ['For Him', 'Grooming essentials & dark roasts', images.him]
];

const productCard = ([name, tag, image, price, description]) => `<article class="product-card page-product-card" data-name="${name.toLowerCase()}"><div class="product-image"><img src="${image}" alt="${name}" /><span class="product-tag">${tag}</span><button class="favorite" data-product-name="${name}" aria-label="Save ${name}"><span class="material-symbols-outlined">favorite</span></button></div><div class="product-info"><div class="rating"><span class="material-symbols-outlined">star</span> 4.9 <small>(342 reviews)</small></div><h3><a href="pages.html?view=product">${name}</a></h3><p>${description}</p><div class="price-row"><strong>${price}</strong><del>₹2,499</del><span>24% OFF</span></div><small class="saving">Free Express Shipping • Gift-ready packaging</small><button class="add-button" data-product="${name}"><span class="material-symbols-outlined">shopping_bag</span> Add to Cart</button></div></article>`;
const sectionHeader = (eyebrow, title, copy = '') => `<div class="page-title"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${copy ? `<p>${copy}</p>` : ''}</div>`;
const pageExtras = {
  hampers: `<section class="page-width trust-band"><div><span class="material-symbols-outlined">verified</span><strong>Authentic Artisanal Gifting</strong><p>Every hamper is checked, wrapped and dispatched from our Mumbai studio.</p></div><div><span class="material-symbols-outlined">local_shipping</span><strong>One-Day Pan Mumbai</strong><p>Order today and receive your surprise tomorrow evening.</p></div><div><span class="material-symbols-outlined">redeem</span><strong>Gift-Ready Always</strong><p>Premium keepsake boxes, handwritten notes and beautiful ribbons.</p></div></section><section class="page-width editorial-rail"><div><p class="eyebrow">The Bandhan Edit</p><h2>Small details. Big feelings.</h2><p>Our collections pair familiar comforts with one unexpected keepsake, so the unboxing feels as considered as the gesture itself.</p></div><img src="${images.wedding}" alt="Artisanal celebration hamper" /></section>`,
  categories: `<section class="page-width editorial-rail"><div><p class="eyebrow">Find Your Feeling</p><h2>There is a box for every kind of celebration.</h2><p>From a quiet thank-you to a room full of wedding guests, browse by the feeling you want to send.</p></div><img src="${images.corporate}" alt="Curated corporate gifting hamper" /></section><section class="page-width quote-band"><p>“The best gifts are the ones that say I know you.”</p><span>— The Bandhan gifting philosophy</span></section>`,
  occasions: `<section class="page-width occasion-story"><p class="eyebrow">Occasions, thoughtfully composed</p><h2>Make the moment linger a little longer.</h2><div class="occasion-story-grid"><p>Choose a collection, add your words and let us handle the beautiful logistics. Every occasion box is available with pan-India delivery and complimentary gift notes.</p><div><strong>19,000+</strong><span>PIN codes served</span></div><div><strong>1 day</strong><span>Pan Mumbai delivery</span></div><div><strong>100%</strong><span>Gift-ready packaging</span></div></div></section>`,
  personalise: `<section class="page-width steps-band"><p class="eyebrow">A little ceremony</p><h2>Personalise in three thoughtful steps.</h2><div class="steps-grid"><div><b>01</b><span class="material-symbols-outlined">inventory_2</span><h3>Choose your hamper</h3><p>Start with a box made for the person and the moment.</p></div><div><b>02</b><span class="material-symbols-outlined">stylus_note</span><h3>Write your words</h3><p>Add a handwritten note printed on our gold foil card.</p></div><div><b>03</b><span class="material-symbols-outlined">local_shipping</span><h3>Send it with care</h3><p>We wrap, protect and deliver it right when it matters.</p></div></div></section>`,
  about: `<section class="page-width values-story"><p class="eyebrow">Our promise</p><h2>Good gifting should feel personal on both sides.</h2><div class="story-columns"><p>We work with small makers, use reusable keepsake boxes and keep the human touch in every dispatch. That means fewer anonymous parcels and more moments that feel like they were made just for you.</p><div><strong>2019</strong><span>Bandhan &amp; Co. founded in Mumbai</span></div><div><strong>32</strong><span>Independent makers we work with</span></div></div></section>`,
  cart: `<section class="page-width checkout-steps"><div class="checkout-step active"><b>1</b><span>Cart &amp; Hampers</span></div><div class="checkout-step"><b>2</b><span>Delivery Details</span></div><div class="checkout-step"><b>3</b><span>Payment</span></div></section>`,
  product: `<section class="page-width product-story"><div><p class="eyebrow">Inside the box</p><h2>Made for the unboxing moment.</h2><p>Every Royal Heritage Celebration Hamper includes a hand-poured candle, saffron infusion, Mamra almonds, artisanal chocolate and a brass tea spoon, finished with your personal note.</p></div><div class="detail-facts"><span><b>01</b> Hand-poured candle</span><span><b>02</b> Raw saffron infusion</span><span><b>03</b> Carved brass keepsake</span><span><b>04</b> Gold foil gift card</span></div></section>`
};

function protectImages(scope = document) {
  scope.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      if (image.dataset.fallback) return;
      image.dataset.fallback = 'true';
      image.src = images.chai;
    });
    if (image.complete && image.naturalWidth === 0) image.dispatchEvent(new Event('error'));
  });
}

function render(view) {
  const content = document.querySelector('#pageContent');
  document.querySelectorAll('[data-nav]').forEach((link) => link.classList.toggle('active', link.dataset.nav === view));
  if (view === 'hampers') {
    content.innerHTML = `<section class="page-width inner-page">${sectionHeader('Verified Best Loved', 'Explore Curated Gift Hampers', 'Thoughtful boxes for every milestone, assembled with artisanal treats and keepsakes.') }<div class="filter-row"><span>Showing 12 signature hampers</span><button class="button button-light">Filter by Occasion <span class="material-symbols-outlined">tune</span></button></div><div class="product-grid page-product-grid">${products.map(productCard).join('')}</div></section>`;
  } else if (view === 'categories' || view === 'occasions') {
    const title = view === 'categories' ? 'Categories & Shop by Occasion' : 'Shop by Occasion';
    content.innerHTML = `<section class="page-width inner-page">${sectionHeader('Curated For Moments', title, 'Every celebration has its own cadence. Find thematic gift boxes intentionally crafted for life\'s warmest milestones.') }<div class="large-occasion-grid">${occasionCards.map(([name, copy, image], index) => `<a class="large-occasion-card" href="pages.html?view=hampers"><div class="large-occasion-image"><img src="${image}" alt="${name} gifts" /><span>${index === 0 || index === 3 ? 'Popular' : 'Explore'}</span></div><div><h2>${name}</h2><p>${copy}</p><span class="text-link">Discover <span class="material-symbols-outlined">arrow_forward</span></span></div></a>`).join('')}</div></section>`;
  } else if (view === 'personalise') {
    content.innerHTML = `<section class="page-width inner-page personalise-page">${sectionHeader('Made Meaningful', 'Personalise Your Hamper Studio', 'Turn a beautiful gift into an unforgettable gesture with considered details, handwritten words and your own finishing touch.') }<div class="studio-grid"><div class="studio-preview"><img src="${images.hero}" alt="Personalised hamper preview" /><span class="preview-label">Your hamper preview</span></div><div class="studio-form"><label>Gift message<textarea placeholder="Write a note that feels like you..."></textarea></label><label>Choose a ribbon<select><option>Terracotta Raw Silk</option><option>Forest Green Velvet</option><option>Ivory Cotton</option></select></label><label>Gift occasion<select><option>Anniversary</option><option>Birthday</option><option>Wedding</option><option>Just Because</option></select></label><button class="button button-dark" id="savePersonalisation">Save Your Details <span class="material-symbols-outlined">arrow_forward</span></button></div></div></section>`;
  } else if (view === 'about') {
    content.innerHTML = `<section class="page-width inner-page about-page"><div class="about-hero"><div>${sectionHeader('Our Story', 'Gifts that hold a little more meaning.', 'Bandhan means a bond. We create considered hampers for the people, places and moments you want to hold close.') }<p class="about-copy">From hand-poured candles to brass keepsakes and small-batch delicacies, every Bandhan & Co. box is composed like a personal story. We partner with independent makers across India and wrap every order by hand in our Mumbai studio.</p><a class="button button-dark" href="pages.html?view=hampers">Explore Our Hampers <span class="material-symbols-outlined">arrow_forward</span></a></div><img src="${images.corporate}" alt="Bandhan and Co. gifting studio" /></div><div class="values-grid"><div><span class="material-symbols-outlined">handshake</span><h2>Thoughtful by design</h2><p>Gifts with a point of view, chosen to make the recipient feel seen.</p></div><div><span class="material-symbols-outlined">local_shipping</span><h2>Made to arrive well</h2><p>Secure, beautiful packaging with one-day delivery across Pan Mumbai.</p></div><div><span class="material-symbols-outlined">eco</span><h2>Better little choices</h2><p>Reusable boxes, recyclable fibres and makers worth knowing.</p></div></div></section>`;
  } else if (view === 'cart') {
    content.innerHTML = `<section class="page-width inner-page cart-page">${sectionHeader('Your Bandhan', 'Your Shopping Basket', '(2 Bespoke Hampers)')}<div class="cart-layout"><div class="cart-items">${products.slice(0,2).map(([name, tag, image, price, description]) => `<article class="cart-item"><img src="${image}" alt="${name}" /><div><span class="product-tag">${tag}</span><h2>${name}</h2><p>${description}</p><div class="cart-controls"><button>-</button><strong>1</strong><button>+</button><button class="remove-item">Remove</button></div></div><b>${price}</b></article>`).join('')}</div><aside class="order-summary"><p class="eyebrow">Delivery Promise</p><h2>Order confirmed today, hand-delivered by <i>tomorrow.</i></h2><div class="checkout-fields"><input id="customerName" placeholder="Full name" required /><input id="customerPhone" placeholder="Phone number" required /><textarea id="customerAddress" placeholder="Delivery address" required></textarea></div><div class="summary-row"><span>Subtotal</span><strong>₹2,898</strong></div><div class="summary-row"><span>Express delivery</span><strong>Free</strong></div><div class="summary-row total"><span>Total</span><strong>₹2,898</strong></div><button class="button button-dark checkout-button">Proceed to Secure Checkout <span class="material-symbols-outlined">lock</span></button></aside></div></section>`;
  } else {
    content.innerHTML = `<section class="page-width inner-page product-detail-page"><a class="back-link" href="pages.html?view=hampers"><span class="material-symbols-outlined">arrow_back</span> Return to Catalog</a><div class="detail-grid"><div class="detail-image"><img src="${images.hero}" alt="Royal Heritage Celebration Hamper" /></div><div class="detail-copy"><p class="eyebrow">Signature Box • Bestseller</p><h1>Royal Heritage Celebration Hamper</h1><div class="rating"><span class="material-symbols-outlined">star</span> 4.9 <small>(342 reviews)</small></div><p class="detail-description">A warm, generous celebration of India's finest flavours and lasting keepsakes. Includes saffron threads, salted dry fruits, artisanal dark chocolates and a carved brass diya.</p><div class="detail-price">₹1,899 <del>₹2,499</del></div><div class="detail-options"><span>Gift note included</span><span>Free express shipping</span><span>Secure foam packing</span></div><button class="button button-dark add-detail">Add to Cart <span class="material-symbols-outlined">shopping_bag</span></button></div></div></section>`;
  }
  if (pageExtras[view]) content.insertAdjacentHTML('beforeend', pageExtras[view]);
  protectImages(content);
  bindPageActions();
  bindSearch();
  api('/cart').then(updateCartBadge).catch(() => {});
  if (view === 'cart') hydrateCartPage();
}

function renderCartItems(cart) {
  if (!cart.items.length) return '<div class="empty-cart"><span class="material-symbols-outlined">shopping_bag</span><h2>Your basket is waiting.</h2><p>Choose a thoughtful hamper and it will appear here.</p><a class="button button-dark" href="pages.html?view=hampers">Explore Hampers</a></div>';
  return cart.items.map(({ product, quantity, lineTotal }) => `<article class="cart-item" data-product-id="${product.id}"><img src="${product.image}" alt="${product.name}" /><div><span class="product-tag">${product.tag}</span><h2>${product.name}</h2><p>${product.description}</p><div class="cart-controls"><button class="decrease" type="button">-</button><strong>${quantity}</strong><button class="increase" type="button">+</button><button class="remove-item" type="button">Remove</button></div></div><b>₹${lineTotal.toLocaleString('en-IN')}</b></article>`).join('');
}

function hydrateCartPage() {
  api('/cart').then((cart) => {
    updateCartBadge(cart);
    const items = document.querySelector('.cart-items');
    if (!items) return;
    items.innerHTML = renderCartItems(cart);
    const summary = document.querySelector('.order-summary');
    if (summary) summary.innerHTML = `<p class="eyebrow">Delivery Promise</p><h2>${cart.items.length ? 'Order confirmed today, hand-delivered by <i>tomorrow.</i>' : 'Your next thoughtful gesture starts here.'}</h2><div class="summary-row"><span>Subtotal</span><strong>₹${cart.subtotal.toLocaleString('en-IN')}</strong></div><div class="summary-row"><span>Express delivery</span><strong>Free</strong></div><div class="summary-row total"><span>Total</span><strong>₹${cart.total.toLocaleString('en-IN')}</strong></div><button class="button button-dark checkout-button" ${cart.items.length ? '' : 'disabled'}>Proceed to Secure Checkout <span class="material-symbols-outlined">lock</span></button>`;
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
  document.querySelector('.checkout-button')?.addEventListener('click', () => {
    const customer = { name: document.querySelector('#customerName')?.value.trim(), phone: document.querySelector('#customerPhone')?.value.trim(), address: document.querySelector('#customerAddress')?.value.trim() };
    api('/orders', { method: 'POST', body: JSON.stringify({ customer }) }).then(({ order }) => { showToast(`Order ${order.id} confirmed`); hydrateCartPage(); }).catch((error) => showToast(error.message));
  });
}

function bindPageActions() {
  document.querySelectorAll('.add-button, .add-detail').forEach((button) => button.addEventListener('click', () => {
    const productName = button.dataset.product || 'Royal Heritage Celebration Hamper';
    const productId = productIdByName[productName] || 'royal-heritage';
    api('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity: 1 }) }).then((cart) => { updateCartBadge(cart); showToast('Added to your hamper'); }).catch((error) => showToast(error.message));
  }));
  document.querySelectorAll('.favorite').forEach((button) => button.addEventListener('click', () => {
    const productId = productIdByName[button.dataset.productName] || 'royal-heritage';
    api(`/favorites/${productId}`, { method: 'POST' }).then((result) => { button.classList.toggle('is-favorite', result.saved); showToast(result.saved ? 'Saved to your favorites' : 'Removed from your favorites'); }).catch((error) => showToast(error.message));
  }));
  const saveButton = document.querySelector('#savePersonalisation');
  if (saveButton) saveButton.addEventListener('click', () => api('/personalisation', { method: 'PUT', body: JSON.stringify({ message: document.querySelector('textarea')?.value || '', ribbon: document.querySelectorAll('select')[0]?.value || '', occasion: document.querySelectorAll('select')[1]?.value || '' }) }).then(() => showToast('Your personalisation details are saved')).catch((error) => showToast(error.message)));
  document.querySelectorAll('.remove-item').forEach((button) => button.addEventListener('click', () => button.closest('.cart-item').remove()));
}

function bindSearch() {
  const search = document.querySelector('#pageSearch');
  if (!search) return;
  search.addEventListener('input', async () => {
    const query = search.value.trim().toLowerCase();
    const matches = await api(`/products?search=${encodeURIComponent(query)}`).catch(() => []);
    const names = new Set(matches.map((product) => product.name.toLowerCase()));
    document.querySelectorAll('.page-product-card').forEach((card) => { card.hidden = Boolean(query) && !names.has(card.dataset.name); });
  });
}
function showToast(message) { const toast = document.querySelector('#pageToast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }

const view = new URLSearchParams(window.location.search).get('view') || 'hampers';
render(view);
