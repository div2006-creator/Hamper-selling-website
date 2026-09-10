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
      <a href="pages.html?view=product&amp;product=${product.id}" class="product-img-link" aria-label="View details for ${product.name}">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/bday-1.jpg'" />
      </a>
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
      image.src = 'images/bday-1.jpg';
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
    content.innerHTML = `<section class="page-width inner-page personalise-page">${sectionHeader('Made Meaningful', 'Personalise Your Hamper Studio', 'Turn a beautiful gift into an unforgettable gesture with considered details, handwritten words and your own finishing touch.')}<div class="studio-grid"><div class="studio-preview"><img src="images/bday_hamper.png" alt="Personalised hamper preview" /><span class="preview-label">Your hamper preview</span></div><div class="studio-form"><label>Gift message<textarea id="personaliseMsg" placeholder="Write a note that feels like you..."></textarea></label><label>Choose a ribbon<select id="personaliseRibbon"><option>Terracotta Raw Silk</option><option>Forest Green Velvet</option><option>Ivory Cotton</option><option>Royal Gold Satin</option></select></label><label>Gift occasion<select id="personaliseOccasion"><option>Anniversary</option><option>Birthday</option><option>Wedding</option><option>Just Because</option></select></label><button class="button button-dark" id="savePersonalisation">Save Your Details <span class="material-symbols-outlined">arrow_forward</span></button></div></div></section>`;
    hydratePersonalisation();
  } else if (targetView === 'about') {
    content.innerHTML = `<section class="page-width inner-page about-page"><div class="about-hero"><div>${sectionHeader('Our Story', 'Gifts that hold a little more meaning.', 'Supriszo means thoughtful surprises. We create considered hampers for the people, places and moments you want to hold close.')}<p class="about-copy">From hand-poured candles to brass keepsakes and small-batch delicacies, every Supriszo & Co. box is composed like a personal story. We partner with independent makers across India and wrap every order by hand in our Mumbai studio.</p><a class="button button-dark" href="pages.html?view=hampers">Explore Our Hampers <span class="material-symbols-outlined">arrow_forward</span></a></div><img src="images/anniversary_romance_hamper.png" alt="Supriszo and Co. gifting studio" /></div></section>`;
  } else if (targetView === 'cart') {
    content.innerHTML = `<section class="page-width inner-page cart-page">${sectionHeader('Your Supriszo', 'Your Shopping Basket', '')}<div class="cart-layout"><div class="cart-items"><p class="muted">Loading basket...</p></div><aside class="order-summary"><p class="eyebrow">Delivery Promise</p><h2>Order confirmed today, hand-delivered by <i>tomorrow.</i></h2></aside></div></section>`;
    hydrateCartPage();
  } else if (targetView === 'checkout') {
    content.innerHTML = `<section class="page-width inner-page checkout-page"><div class="checkout-steps"><div class="checkout-step active"><b>1</b><span>Cart &amp; Hampers</span></div><div class="checkout-step active"><b>2</b><span>Delivery Details</span></div><div class="checkout-step active"><b>3</b><span>Payment</span></div></div>${sectionHeader('Secure Checkout', 'Almost there.', 'Enter delivery details and choose how you would like to pay.')}<div class="checkout-layout"><form class="checkout-form" id="checkoutForm"><div class="checkout-panel"><p class="eyebrow">Delivery Details</p><div class="checkout-form-grid"><label>Full name<input id="checkoutName" required placeholder="Your name" /></label><label>Phone number<input id="checkoutPhone" required pattern="[0-9+ \\-]{10,}" placeholder="+91 8655239282" /></label><label class="full-field">Address<textarea id="checkoutAddress" required placeholder="House / building, street, area"></textarea></label><label>City<input id="checkoutCity" required value="Mumbai" /></label><label>PIN code<input id="checkoutPin" required pattern="[0-9]{6}" placeholder="400001" /></label></div></div><div class="checkout-panel"><p class="eyebrow">Payment Method</p><div class="payment-options"><label><input type="radio" name="paymentMethod" value="upi" checked /><span class="material-symbols-outlined">account_balance_wallet</span><b>UPI</b><small>GPay, PhonePe, Paytm</small></label><label><input type="radio" name="paymentMethod" value="card" /><span class="material-symbols-outlined">credit_card</span><b>Card</b><small>Credit or debit card</small></label><label><input type="radio" name="paymentMethod" value="netbanking" /><span class="material-symbols-outlined">account_balance</span><b>Net Banking</b><small>All major banks</small></label><label><input type="radio" name="paymentMethod" value="cod" /><span class="material-symbols-outlined">payments</span><b>Cash on Delivery</b><small>Pay when it arrives</small></label></div></div><button class="button button-dark place-order" type="submit">Place Secure Order <span class="material-symbols-outlined">lock</span></button></form><aside class="order-summary checkout-summary"><p class="eyebrow">Order Summary</p><h2>Thoughtful gifts, on their way.</h2><div id="checkoutSummary">Loading your basket...</div></aside></div></section>`;
    hydrateCheckoutPage();
  } else if (targetView === 'shipping') {
    content.innerHTML = `<section class="page-width inner-page policy-page">
      ${sectionHeader('Delivery & Logistics', 'Shipping & Delivery Policy', 'Transparent dispatch timelines, express delivery cutoffs, and pan-India coverage.')}
      <div class="policy-container">
        <div class="policy-card">
          <h3><span class="material-symbols-outlined">bolt</span> One-Day Express Delivery Pan-Mumbai</h3>
          <p>Orders placed before <strong>2:00 PM IST</strong> for Mumbai, Thane, and Navi Mumbai PIN codes (starting with 400, 401, 410) are processed and hand-delivered by 7:00 PM the next day.</p>
        </div>
        <div class="policy-card">
          <h3><span class="material-symbols-outlined">flight_takeoff</span> Pan-India Air Express (19,000+ PIN Codes)</h3>
          <p>For all other locations across India, hampers are dispatched via air express courier partners (Bluedart, Delhivery, DTDC). Estimated delivery is <strong>2 to 4 business days</strong> depending on your destination.</p>
        </div>
        <div class="policy-card">
          <h3><span class="material-symbols-outlined">inventory_2</span> Transit-Safe Packaging Guarantee</h3>
          <p>Every Supriszo box is double-packaged in high-density protective outer cartons with eco-friendly cushioning to withstand air and ground transit without a scratch.</p>
        </div>
        <div class="policy-card">
          <h3><span class="material-symbols-outlined">distance</span> Real-Time Tracking</h3>
          <p>As soon as your hamper is dispatched from our Mumbai studio, you receive an automated SMS &amp; WhatsApp notification containing your Supriszo Order ID to trace dispatch steps live on our <a href="pages.html?view=track">Track Order page</a>.</p>
        </div>
      </div>
    </section>`;
  } else if (targetView === 'returns') {
    content.innerHTML = `<section class="page-width inner-page policy-page">
      ${sectionHeader('Customer Protection', 'Return & Transit-Safe Guarantee', 'Our 100% replacement guarantee for damaged or missing hamper items.')}
      <div class="policy-container">
        <div class="policy-card">
          <h3><span class="material-symbols-outlined">verified</span> 100% Replacement Commitment</h3>
          <p>Because our hampers contain artisanal delicacies and personalized keepsakes, we do not accept general returns once delivered. However, if your box arrives damaged, broken, or with missing items during transit, we provide a <strong>100% complimentary replacement or full refund</strong> without hassle.</p>
        </div>
        <div class="policy-card">
          <h3><span class="material-symbols-outlined">photo_camera</span> How to Claim Replacement (Within 24 Hours)</h3>
          <ol class="policy-steps">
            <li>Take a clear photo or short unboxing video showing the damaged box or item.</li>
            <li>Send the photo along with your Order ID to concierge WhatsApp <a href="https://wa.me/918655239282" target="_blank">+91 8655239282</a> or call us directly.</li>
            <li>Our concierge team dispatches a fresh replacement within 24 hours.</li>
          </ol>
        </div>
        <div class="policy-card">
          <h3><span class="material-symbols-outlined">currency_rupee</span> Refund Processing Timelines</h3>
          <p>For approved refund claims, money is credited back to your original payment method (UPI / Credit Card / Bank) within 3 to 5 business days.</p>
        </div>
      </div>
    </section>`;
  } else if (targetView === 'terms') {
    content.innerHTML = `<section class="page-width inner-page policy-page">
      ${sectionHeader('Legal & Guidelines', 'Terms & Conditions', 'General terms of service governing your orders and use of Supriszo & Co.')}
      <div class="policy-container">
        <div class="policy-card">
          <h3>1. Orders &amp; Pricing</h3>
          <p>All hamper orders placed via our website are subject to availability and acceptance. Prices listed are inclusive of applicable taxes. In rare instances of item unavailability, we reserve the right to substitute an item with one of equal or greater value after informing the buyer.</p>
        </div>
        <div class="policy-card">
          <h3>2. Personalised Messages &amp; Customization</h3>
          <p>Buyers are responsible for verifying recipient names and handwritten card messages prior to order submission. Supriszo &amp; Co. disclaims liability for typographical errors submitted by customers in gift notes.</p>
        </div>
        <div class="policy-card">
          <h3>3. Payment &amp; Security</h3>
          <p>All online payments (UPI, Credit/Debit Cards, Net Banking) are securely processed using Razorpay PCI-DSS compliant payment gateways. Supriszo &amp; Co. does not store or process card numbers directly.</p>
        </div>
        <div class="policy-card">
          <h3>4. Intellectual Property</h3>
          <p>All brand marks, hamper curated photography, and website content are exclusive property of Supriszo &amp; Co. Gifting Solutions Pvt. Ltd.</p>
        </div>
      </div>
    </section>`;
  } else if (targetView === 'privacy') {
    content.innerHTML = `<section class="page-width inner-page policy-page">
      ${sectionHeader('Data Protection', 'Privacy Policy', 'How we handle, safeguard, and respect your personal information.')}
      <div class="policy-container">
        <div class="policy-card">
          <h3>1. Information We Collect</h3>
          <p>We collect essential delivery information including your name, recipient name, contact phone number, shipping address, and personalized gift message to fulfill your hamper orders.</p>
        </div>
        <div class="policy-card">
          <h3>2. Zero Data Selling Guarantee</h3>
          <p>We respect your privacy completely. Your personal data and recipient contact details are strictly used for order dispatch, customer concierge support, and delivery updates. We NEVER sell or rent data to third parties.</p>
        </div>
        <div class="policy-card">
          <h3>3. Payment Privacy &amp; Encryption</h3>
          <p>Transactions are encrypted end-to-end via 256-bit SSL protocols. Online payments are handled securely by Razorpay.</p>
        </div>
        <div class="policy-card">
          <h3>4. Contacting Our Data Concierge</h3>
          <p>If you wish to update or delete your customer account information, reach out to our concierge team at <a href="tel:+918655239282">+91 8655239282</a> or via WhatsApp.</p>
        </div>
      </div>
    </section>`;
  } else if (targetView === 'faq') {
    content.innerHTML = `<section class="page-width inner-page faq-page">
      ${sectionHeader('Help & Concierge', 'Frequently Asked Questions (FAQ)', 'Find answers to common questions about ordering, customisation, delivery & corporate gifting.')}
      <div class="faq-container">
        <div class="faq-accordion">
          <div class="faq-item active">
            <button class="faq-question"><span>How fast is delivery in Mumbai?</span><span class="material-symbols-outlined">expand_more</span></button>
            <div class="faq-answer"><p>We offer <strong>One-Day Express Delivery Pan-Mumbai</strong> (including Thane and Navi Mumbai) for orders placed before 2:00 PM. Your hamper will be hand-delivered tomorrow evening by 7:00 PM.</p></div>
          </div>
          <div class="faq-item">
            <button class="faq-question"><span>Do you deliver across India?</span><span class="material-symbols-outlined">expand_more</span></button>
            <div class="faq-answer"><p>Yes! We deliver via air express courier partners across 19,000+ PIN codes in India. Estimated delivery time is 2 to 4 business days.</p></div>
          </div>
          <div class="faq-item">
            <button class="faq-question"><span>Can I add a personalized handwritten gift note?</span><span class="material-symbols-outlined">expand_more</span></button>
            <div class="faq-answer"><p>Absolutely! Every hamper comes with a complimentary gold-foil embossed greeting card. You can write your custom message during product selection or at checkout.</p></div>
          </div>
          <div class="faq-item">
            <button class="faq-question"><span>What payment modes do you support?</span><span class="material-symbols-outlined">expand_more</span></button>
            <div class="faq-answer"><p>We accept UPI (GPay, PhonePe, Paytm), Credit &amp; Debit Cards (Visa, Mastercard, RuPay), Net Banking across all major banks, and Cash on Delivery (COD).</p></div>
          </div>
          <div class="faq-item">
            <button class="faq-question"><span>What if the hamper items arrive damaged?</span><span class="material-symbols-outlined">expand_more</span></button>
            <div class="faq-answer"><p>We have a 100% Transit-Safe Guarantee. Simply share a photo of the damaged package with our concierge within 24 hours on WhatsApp (+91 8655239282), and we will dispatch an instant free replacement!</p></div>
          </div>
          <div class="faq-item">
            <button class="faq-question"><span>Do you accept corporate or bulk custom hamper orders?</span><span class="material-symbols-outlined">expand_more</span></button>
            <div class="faq-answer"><p>Yes! We specialize in custom corporate gifting, employee onboarding kits, and wedding bulk orders with custom company branding &amp; custom ribbon colors. Call or WhatsApp +91 8655239282 for bulk quotes.</p></div>
          </div>
          <div class="faq-item">
            <button class="faq-question"><span>Are the gift boxes reusable?</span><span class="material-symbols-outlined">expand_more</span></button>
            <div class="faq-answer"><p>Yes! All Supriszo hampers are packaged in heavy-duty, reusable rigid keepsake trunks or boxes designed to be kept for years to store keepsakes and personal treasures.</p></div>
          </div>
          <div class="faq-item">
            <button class="faq-question"><span>How do I track my order status?</span><span class="material-symbols-outlined">expand_more</span></button>
            <div class="faq-answer"><p>Enter your Supriszo Order ID (e.g. SPR-XXXXXX) on our <a href="pages.html?view=track">Track Order page</a> to trace real-time packing, dispatch, and courier tracking status.</p></div>
          </div>
        </div>
      </div>
    </section>`;
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        item.classList.toggle('active');
      });
    });
  }

  if (pageExtras[targetView]) content.insertAdjacentHTML('beforeend', pageExtras[targetView]);
  protectImages(content);
  bindPageActions();
  bindSearch();
  api('/cart').then(updateCartBadge).catch(() => {});
}

function hydrateProductDetailPage(prodId) {
  // Remove existing sticky buy bar if any
  document.querySelector('#stickyPdpBar')?.remove();

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

    const catName = product.categoryId ? (product.categoryId.charAt(0).toUpperCase() + product.categoryId.slice(1).replace('-', ' ')) : 'Gift Hampers';

    const price = product.price || 0;
    const mrp = product.mrp || (price + 400);
    const savings = mrp - price;
    const discountPct = Math.round((savings / mrp) * 100);

    const reviewsCount = product.reviews || 184;
    const ratingScore = product.rating || 4.9;

    const aboutBullets = [
      {
        icon: 'card_giftcard',
        title: 'EXQUISITE GIFT CURATION',
        text: `Thoughtfully composed featuring ${product.description || 'handcrafted treats and luxury keepsakes'}. Every item is selected to create an unboxing moment filled with joy.`
      },
      {
        icon: 'inventory_2',
        title: 'REUSABLE LUXURY KEEPSAKE CHEST',
        text: 'Encased in a signature heavyweight rigid trunk with gold foil detailing, velvet lining, and raw silk ribbon finish that can be cherished forever.'
      },
      {
        icon: 'edit_note',
        title: 'COMPLIMENTARY GOLD-FOIL GIFT CARD',
        text: 'Includes a complimentary gold-trimmed greeting card customized with your personal message written by our studio calligrapher.'
      },
      {
        icon: 'eco',
        title: '100% ARTISANAL & FRESHLY PACKED',
        text: 'Crafted in small batches by artisan partners with 100% pure gourmet ingredients, free from artificial preservatives.'
      },
      {
        icon: 'verified_user',
        title: 'TRANSIT-SAFE GUARANTEE',
        text: 'Double-boxed with shock-absorbent eco-friendly packaging ensuring 100% damage-free delivery anywhere in India.'
      }
    ];

    const weightEst = price > 2000 ? '2.4 kg' : (price > 1400 ? '1.8 kg' : '1.2 kg');
    const boxDimensions = price > 2000 ? '32.0 × 26.0 × 14.0 cm' : '28.0 × 22.0 × 12.0 cm';

    const mockReviews = [
      {
        name: 'Ananya Sharma',
        avatar: 'A',
        stars: 5,
        title: 'Unbelievable presentation! The recipient loved it!',
        date: '3 days ago',
        verified: true,
        text: `Ordered the ${product.name} for a special surprise. The keepsake box looked even more stunning in person than on the site. The treats were fresh and delicious!`
      },
      {
        name: 'Rohan Mehta',
        avatar: 'R',
        stars: 5,
        title: 'Fast 1-day delivery in Mumbai & top tier quality',
        date: '1 week ago',
        verified: true,
        text: `Impressed by the speedy delivery! The handwritten card with gold foil border was a really classy touch. Will definitely order again.`
      },
      {
        name: 'Priyanka Nair',
        avatar: 'P',
        stars: 4,
        title: 'Worth every rupee for a milestone gift',
        date: '2 weeks ago',
        verified: true,
        text: `High quality rigid trunk box, beautifully tied with silk ribbon. Everything inside was intact and packaged with great care.`
      }
    ];

    document.querySelector('#pageContent').innerHTML = `
      <section class="page-width inner-page pdp-container">
        <!-- Breadcrumb -->
        <div class="pdp-breadcrumb">
          <a href="index.html">Home</a> &rsaquo; 
          <a href="pages.html?view=hampers">Hampers</a> &rsaquo; 
          <a href="pages.html?view=hampers&search=${encodeURIComponent(product.categoryId || '')}">${catName}</a> &rsaquo; 
          <span>${product.name}</span>
        </div>

        <div class="pdp-layout">
          <!-- Gallery Column -->
          <div class="pdp-gallery">
            <div class="main-image-wrap">
              <img id="pdpMainImg" src="${product.image}" alt="${product.name}" onerror="this.src='images/bday-1.jpg'" />
              <span class="product-tag pdp-tag">${product.tag || 'Curated Keepsake'}</span>
            </div>
            
            <!-- Gallery Thumbnails -->
            <div class="pdp-thumbnails">
              <button type="button" class="pdp-thumb-btn active" data-src="${product.image}">
                <img src="${product.image}" alt="Main View" onerror="this.src='images/bday-1.jpg'" />
              </button>
              <button type="button" class="pdp-thumb-btn" data-src="${product.image}">
                <img src="${product.image}" alt="Detail View" style="filter: brightness(1.05) contrast(1.05);" onerror="this.src='images/bday-1.jpg'" />
              </button>
              <button type="button" class="pdp-thumb-btn" data-src="images/anniversary_romance_hamper.png">
                <img src="images/anniversary_romance_hamper.png" alt="Box Presentation" onerror="this.src='images/bday-1.jpg'" />
              </button>
              <button type="button" class="pdp-thumb-btn" data-src="images/bday_hamper.png">
                <img src="images/bday_hamper.png" alt="Gift Ribbon & Card" onerror="this.src='images/bday-1.jpg'" />
              </button>
            </div>

            <div class="pdp-trust-list">
              <div><span class="material-symbols-outlined">verified</span>100% Transit-Safe Assurance</div>
              <div><span class="material-symbols-outlined">card_giftcard</span>Complimentary Gold-foil Card</div>
              <div><span class="material-symbols-outlined">eco</span>Eco Reusable Keepsake Box</div>
            </div>
          </div>

          <!-- Product Details Column -->
          <div class="pdp-details">
            <div class="pdp-store-line">
              <span class="material-symbols-outlined">storefront</span> Supriszo &amp; Co. Luxury Store
            </div>
            <h1>${product.name}</h1>

            <div class="pdp-rating-row">
              <div class="pdp-stars">
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
              </div>
              <span class="pdp-rating-score">${ratingScore}</span>
              <a href="#pdpReviewsSection" class="pdp-review-count">(${reviewsCount} global ratings)</a>
              ${stockMsg}
            </div>

            <div class="pdp-price-box">
              <strong class="pdp-price">₹${price.toLocaleString('en-IN')}</strong>
              <del class="pdp-mrp">M.R.P.: ₹${mrp.toLocaleString('en-IN')}</del>
              <span class="pdp-discount">${discountPct}% OFF</span>
              <div class="pdp-tax-note">Inclusive of all taxes • Free Express Shipping on this hamper</div>
            </div>

            <p class="pdp-desc">${product.description || 'Handcrafted luxury gift hamper filled with gourmet delicacies, signature keepsake box, and personalized gift presentation.'}</p>

            <!-- PIN Code Delivery Checker Widget -->
            <div class="pincode-checker-box">
              <div class="pincode-header"><span class="material-symbols-outlined">local_shipping</span> <strong>Check Fast Delivery Availability</strong></div>
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
                <textarea id="pdpMessage" rows="2" maxlength="300" placeholder="e.g. Happy Birthday! Wishing you endless joy and beautiful moments..."></textarea>
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
              <button id="pdpBuyNowBtn" class="buy-now-btn" ${isOutOfStock ? 'disabled' : ''}>
                <span class="material-symbols-outlined">bolt</span> Buy Now
              </button>
            </div>
          </div>
        </div>

        <!-- AMAZON-STYLE "ABOUT THIS ITEM" SECTION -->
        <div class="pdp-section">
          <div class="pdp-section-header">
            <h2>About this item</h2>
            <p>Detailed product feature breakdown and artisanal crafting standards</p>
          </div>
          <ul class="pdp-about-list">
            ${aboutBullets.map(b => `
              <li>
                <span class="material-symbols-outlined bullet-icon">${b.icon}</span>
                <div><strong>${b.title}:</strong> ${b.text}</div>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- AMAZON A+ BRAND SHOWCASE SECTION (FROM THE MANUFACTURER) -->
        <div class="pdp-aplus-section">
          <div class="aplus-hero-banner">
            <div>
              <h3>Supriszo &amp; Co. Luxury Gifting Studio</h3>
              <p>Every Supriszo box is composed by master gift curators in our Mumbai studio. We combine small-batch delicacies with heirloom-quality keepsakes.</p>
            </div>
            <span class="aplus-brand-tag">Crafted in Mumbai</span>
          </div>
          <div class="aplus-grid">
            <div class="aplus-card">
              <img class="aplus-card-img" src="${product.image}" alt="${product.name}" onerror="this.src='images/bday-1.jpg'" />
              <div class="aplus-card-body">
                <h4>Heavyweight Rigid Keepsake Box</h4>
                <p>Built with 1200 GSM rigid recycled board, gold foil embossing, and velvet lining. Designed to be kept as a memory box long after the occasion.</p>
              </div>
            </div>
            <div class="aplus-card">
              <img class="aplus-card-img" src="images/coffee_truffle_hamper.png" alt="Artisanal Sourcing" onerror="this.src='images/bday-1.jpg'" />
              <div class="aplus-card-body">
                <h4>Small-Batch Artisanal Sourcing</h4>
                <p>We work directly with 32 independent makers across India to source single-origin coffees, belgian truffles, and brass keepsakes.</p>
              </div>
            </div>
            <div class="aplus-card">
              <img class="aplus-card-img" src="images/anniversary_romance_hamper.png" alt="Unboxing Experience" onerror="this.src='images/bday-1.jpg'" />
              <div class="aplus-card-body">
                <h4>Considered Unboxing Ceremony</h4>
                <p>Tied with terracotta raw silk ribbons, cushioned with eco-friendly paper shredding, and paired with a gold foil handwritten message card.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- AMAZON-STYLE PRODUCT SPECIFICATIONS TABLE -->
        <div class="pdp-section">
          <div class="pdp-section-header">
            <h2>Product Specifications &amp; Technical Details</h2>
            <p>Complete box dimensions, materials, storage instructions &amp; origin</p>
          </div>
          <div class="pdp-specs-grid">
            <div class="spec-item">
              <strong>Brand</strong>
              <span>Supriszo &amp; Co. Luxury Hampers</span>
            </div>
            <div class="spec-item">
              <strong>Hamper Style &amp; Material</strong>
              <span>Heavyweight Rigid Keepsake Trunk / Satin Ribbon</span>
            </div>
            <div class="spec-item">
              <strong>Box Dimensions (L × W × H)</strong>
              <span>${boxDimensions}</span>
            </div>
            <div class="spec-item">
              <strong>Net Weight</strong>
              <span>~${weightEst}</span>
            </div>
            <div class="spec-item">
              <strong>Included Components</strong>
              <span>${product.description || 'Artisanal Keepsakes & Treats'}, Foil Card &amp; Seal</span>
            </div>
            <div class="spec-item">
              <strong>Shelf Life</strong>
              <span>60 Days from dispatch date</span>
            </div>
            <div class="spec-item">
              <strong>Country of Origin</strong>
              <span>India (Handcrafted in Mumbai Studio)</span>
            </div>
            <div class="spec-item">
              <strong>Suitable For</strong>
              <span>${catName} &amp; Milestone Celebrations</span>
            </div>
          </div>
        </div>

        <!-- AMAZON-STYLE COMPARISON TABLE SECTION -->
        <div class="pdp-section" id="pdpCompareSection">
          <div class="pdp-section-header">
            <h2>Compare with Similar Hampers</h2>
            <p>See how ${product.name} compares with other popular gift boxes in our collection</p>
          </div>
          <div class="pdp-compare-table-wrap">
            <table class="pdp-compare-table">
              <tbody id="pdpCompareBody">
                <!-- Dynamically populated comparison rows -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- AMAZON-STYLE CUSTOMER REVIEWS & RATINGS SECTION -->
        <div class="pdp-section" id="pdpReviewsSection">
          <div class="pdp-section-header">
            <h2>Customer Reviews &amp; Ratings</h2>
            <p>Verified purchase feedback and rating distribution from real customers</p>
          </div>

          <div class="reviews-dashboard">
            <div class="rating-score-box">
              <div class="score-number">${ratingScore}</div>
              <div class="score-stars">
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
              </div>
              <div class="score-count">${reviewsCount} global ratings</div>
            </div>

            <div class="rating-bars-box">
              <div class="histogram-row">
                <span class="star-lbl">5 star</span>
                <div class="histogram-bar-track"><div class="histogram-bar-fill" style="width: 86%;"></div></div>
                <span class="pct-lbl">86%</span>
              </div>
              <div class="histogram-row">
                <span class="star-lbl">4 star</span>
                <div class="histogram-bar-track"><div class="histogram-bar-fill" style="width: 10%;"></div></div>
                <span class="pct-lbl">10%</span>
              </div>
              <div class="histogram-row">
                <span class="star-lbl">3 star</span>
                <div class="histogram-bar-track"><div class="histogram-bar-fill" style="width: 3%;"></div></div>
                <span class="pct-lbl">3%</span>
              </div>
              <div class="histogram-row">
                <span class="star-lbl">2 star</span>
                <div class="histogram-bar-track"><div class="histogram-bar-fill" style="width: 1%;"></div></div>
                <span class="pct-lbl">1%</span>
              </div>
              <div class="histogram-row">
                <span class="star-lbl">1 star</span>
                <div class="histogram-bar-track"><div class="histogram-bar-fill" style="width: 0%;"></div></div>
                <span class="pct-lbl">0%</span>
              </div>
            </div>

            <div class="write-review-box">
              <h4>Review this product</h4>
              <p>Share your experience with other hamper shoppers</p>
              <button type="button" class="btn-write-review" id="btnToggleReviewForm">
                Write a Customer Review
              </button>
            </div>
          </div>

          <!-- WRITE REVIEW FORM (Collapsible/Interactive) -->
          <div id="reviewFormCard" class="review-form-card" style="display: none;">
            <h3>Write a Customer Review</h3>
            <div class="star-rating-select" id="starRatingSelect">
              <span class="material-symbols-outlined selected" data-val="1">star</span>
              <span class="material-symbols-outlined selected" data-val="2">star</span>
              <span class="material-symbols-outlined selected" data-val="3">star</span>
              <span class="material-symbols-outlined selected" data-val="4">star</span>
              <span class="material-symbols-outlined selected" data-val="5">star</span>
            </div>
            <div class="review-form-grid">
              <input id="reviewAuthor" placeholder="Your Name (e.g. Aarav Patel)" required />
              <input id="reviewTitle" placeholder="Review Headline (e.g. Magnificent gifting experience)" required />
            </div>
            <textarea id="reviewBody" rows="3" placeholder="Write your detailed review about packaging, items, delivery..." required></textarea>
            <div style="margin-top: 14px; display: flex; gap: 10px;">
              <button type="button" id="btnSubmitReview" class="button button-dark">Submit Review</button>
              <button type="button" id="btnCancelReview" class="button button-light">Cancel</button>
            </div>
          </div>

          <!-- VERIFIED REVIEWS LIST -->
          <div class="reviews-list" id="pdpReviewsList">
            ${mockReviews.map(r => `
              <div class="review-card">
                <div class="review-user-row">
                  <div class="user-avatar">${r.avatar}</div>
                  <div class="user-name-wrap">
                    <strong>${r.name}</strong>
                    <span class="verified-tag"><span class="material-symbols-outlined" style="font-size:13px;">check_circle</span> Verified Purchase</span>
                  </div>
                  <span class="review-date">${r.date}</span>
                </div>
                <div class="review-rating-row">
                  <div class="stars">
                    ${'<span class="material-symbols-outlined">star</span>'.repeat(r.stars)}
                  </div>
                  <span class="review-title">${r.title}</span>
                </div>
                <p class="review-body">${r.text}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- RELATED HAMPERS SECTION -->
        <div class="pdp-section" id="pdpRelatedSection">
          <div class="pdp-section-header">
            <h2>Customers Who Viewed This Also Viewed</h2>
            <p>Explore complementary gift hampers from our curated collection</p>
          </div>
          <div id="pdpRelatedGrid" class="product-grid" style="grid-template-columns: repeat(4, 1fr);">
            <p class="muted">Loading recommended hampers...</p>
          </div>
        </div>
      </section>

      <!-- STICKY FLOATING ADD TO CART BAR -->
      <div class="sticky-pdp-bar" id="stickyPdpBar">
        <div class="page-width sticky-bar-inner">
          <div class="sticky-bar-info">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='images/bday-1.jpg'" />
            <div class="sticky-bar-text">
              <strong>${product.name}</strong>
              <small>⭐ ${ratingScore} (${reviewsCount} reviews) • Supriszo &amp; Co. Luxury</small>
            </div>
          </div>
          <div class="sticky-bar-actions">
            <span class="sticky-bar-price">₹${price.toLocaleString('en-IN')}</span>
            <button type="button" class="button button-dark" id="stickyAddToCartBtn" ${isOutOfStock ? 'disabled' : ''}>
              <span class="material-symbols-outlined">shopping_bag</span> ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    `;

    protectImages(document.querySelector('.pdp-container'));

    // Bind Gallery Thumbnails
    document.querySelectorAll('.pdp-thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mainImg = document.querySelector('#pdpMainImg');
        if (mainImg) mainImg.src = btn.dataset.src;
      });
    });

    // Sticky bar scroll trigger
    const onScrollPdp = () => {
      const bar = document.querySelector('#stickyPdpBar');
      const buyActions = document.querySelector('.pdp-actions');
      if (bar && buyActions) {
        const rect = buyActions.getBoundingClientRect();
        if (rect.bottom < 0) bar.classList.add('show');
        else bar.classList.remove('show');
      }
    };
    window.addEventListener('scroll', onScrollPdp);

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
    const handleAddToCart = async () => {
      if (isOutOfStock) return;
      const pers = {
        message: document.querySelector('#pdpMessage').value.trim(),
        ribbon: document.querySelector('#pdpRibbon').value,
        occasion: document.querySelector('#pdpOccasion').value
      };
      return api('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity: qty, personalisation: pers })
      }).then((cart) => {
        updateCartBadge(cart);
        showToast(`${product.name} added to your basket!`);
        return cart;
      }).catch(err => showToast(err.message));
    };

    document.querySelector('#pdpAddToCartBtn')?.addEventListener('click', handleAddToCart);
    document.querySelector('#stickyAddToCartBtn')?.addEventListener('click', handleAddToCart);

    // Buy Now button logic (adds to cart & redirects directly to checkout)
    document.querySelector('#pdpBuyNowBtn')?.addEventListener('click', async () => {
      const cart = await handleAddToCart();
      if (cart) {
        window.location.href = 'pages.html?view=checkout';
      }
    });

    // Interactive Review Form Logic
    const reviewFormCard = document.querySelector('#reviewFormCard');
    document.querySelector('#btnToggleReviewForm')?.addEventListener('click', () => {
      reviewFormCard.style.display = reviewFormCard.style.display === 'none' ? 'block' : 'none';
    });
    document.querySelector('#btnCancelReview')?.addEventListener('click', () => {
      reviewFormCard.style.display = 'none';
    });

    let selectedStarRating = 5;
    const starSelect = document.querySelectorAll('#starRatingSelect span');
    starSelect.forEach(star => {
      star.addEventListener('click', () => {
        selectedStarRating = Number(star.dataset.val);
        starSelect.forEach(s => {
          const val = Number(s.dataset.val);
          s.classList.toggle('selected', val <= selectedStarRating);
        });
      });
    });

    document.querySelector('#btnSubmitReview')?.addEventListener('click', () => {
      const author = document.querySelector('#reviewAuthor').value.trim();
      const title = document.querySelector('#reviewTitle').value.trim();
      const body = document.querySelector('#reviewBody').value.trim();

      if (!author || !title || !body) {
        showToast('Please fill out all review fields');
        return;
      }

      const newReviewHtml = `
        <div class="review-card" style="border: 1px solid var(--copper); background: #fffdf5;">
          <div class="review-user-row">
            <div class="user-avatar" style="background: var(--copper);">${author.charAt(0).toUpperCase()}</div>
            <div class="user-name-wrap">
              <strong>${author}</strong>
              <span class="verified-tag"><span class="material-symbols-outlined" style="font-size:13px;">check_circle</span> Verified Purchase</span>
            </div>
            <span class="review-date">Just now</span>
          </div>
          <div class="review-rating-row">
            <div class="stars">
              ${'<span class="material-symbols-outlined">star</span>'.repeat(selectedStarRating)}
            </div>
            <span class="review-title">${title}</span>
          </div>
          <p class="review-body">${body}</p>
        </div>
      `;

      document.querySelector('#pdpReviewsList').insertAdjacentHTML('afterbegin', newReviewHtml);
      showToast('Thank you! Your customer review has been posted.');
      reviewFormCard.style.display = 'none';
      document.querySelector('#reviewAuthor').value = '';
      document.querySelector('#reviewTitle').value = '';
      document.querySelector('#reviewBody').value = '';
    });

    // Hydrate Comparison Table & Related Hampers
    api('/products').then(allProducts => {
      // Comparison table
      const compareBody = document.querySelector('#pdpCompareBody');
      if (compareBody) {
        const compareItems = [product, ...allProducts.filter(p => p.id !== product.id).slice(0, 3)];
        compareBody.innerHTML = `
          <tr>
            <th>Product</th>
            ${compareItems.map(p => `
              <td class="compare-product-header">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='images/bday-1.jpg'" />
                <strong>${p.name}</strong>
              </td>
            `).join('')}
          </tr>
          <tr>
            <th>Rating</th>
            ${compareItems.map(p => `<td>⭐ ${p.rating || 4.8} (${p.reviews || 100})</td>`).join('')}
          </tr>
          <tr>
            <th>Price</th>
            ${compareItems.map(p => `<td><strong>₹${(p.price || 0).toLocaleString('en-IN')}</strong></td>`).join('')}
          </tr>
          <tr>
            <th>Keepsake Trunk</th>
            ${compareItems.map(p => `<td>${p.price > 1800 ? 'Velvet Gold Trunk' : 'Rigid Keepsake Box'}</td>`).join('')}
          </tr>
          <tr>
            <th>Contents</th>
            ${compareItems.map(p => `<td>${(p.description || '').substring(0, 60)}...</td>`).join('')}
          </tr>
          <tr>
            <th>Delivery Speed</th>
            ${compareItems.map(() => `<td>⚡ 1-Day Mumbai / Express India</td>`).join('')}
          </tr>
          <tr>
            <th>Action</th>
            ${compareItems.map(p => `
              <td>
                <a class="button button-dark" style="font-size:10px; padding:6px 10px;" href="pages.html?view=product&amp;product=${p.id}">
                  ${p.id === product.id ? 'Current Item' : 'View Hamper'}
                </a>
              </td>
            `).join('')}
          </tr>
        `;
      }

      // Related grid
      const relGrid = document.querySelector('#pdpRelatedGrid');
      if (!relGrid) return;
      const related = allProducts.filter(p => p.id !== product.id).slice(0, 4);
      if (!related.length) {
        document.querySelector('#pdpRelatedSection').style.display = 'none';
        return;
      }
      relGrid.innerHTML = related.map(productCardFromObject).join('');
      protectImages(relGrid);
      bindPageActions();
    }).catch(() => {
      const relSec = document.querySelector('#pdpRelatedSection');
      if (relSec) relSec.style.display = 'none';
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
      <img src="${product.image}" alt="${product.name}" onerror="this.src='images/bday-1.jpg'" />
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
