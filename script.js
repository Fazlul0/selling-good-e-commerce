// Dummy product data (no backend)
const PRODUCTS = [
  {
    id: 'p1',
    name: 'Linen Field Shirt',
    price: 68,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=450&fit=crop',
    description: 'A breathable, oversized linen shirt with corozo buttons. Worn open over a tee or tucked into trousers.'
  },
  {
    id: 'p2',
    name: 'Walnut Pour-Over Kettle',
    price: 89,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=450&fit=crop',
    description: 'Precision gooseneck spout, 1L capacity. Hand-welded stainless steel with a heat-resistant walnut handle.'
  },
  {
    id: 'p3',
    name: 'Recycled Wool Beanie',
    price: 32,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=450&fit=crop',
    description: 'Soft, ribbed beanie spun from recycled wool. Naturally water-resistant and warm without itch.'
  },
  {
    id: 'p4',
    name: 'Brass Desk Lamp',
    price: 145,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=450&fit=crop',
    description: 'Adjustable arm, warm dimmable LED. Solid brass that develops a soft patina over time.'
  },
  {
    id: 'p5',
    name: 'Hand-Thrown Ceramic Mug',
    price: 28,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=450&fit=crop',
    description: 'Stoneware mug, 12oz. Each piece is unique with a satin matte glaze. Dishwasher safe.'
  },
  {
    id: 'p6',
    name: 'Canvas Weekend Tote',
    price: 54,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=450&fit=crop',
    description: '16oz heavy canvas, reinforced handles, and an interior pocket for your laptop or notebook.'
  },
  {
    id: 'p7',
    name: 'Leather Card Wallet',
    price: 42,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=450&fit=crop',
    description: 'Slim 4-pocket wallet in vegetable-tanned leather. Ages beautifully with daily use.'
  },
  {
    id: 'p8',
    name: 'Oak Cutting Board',
    price: 76,
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=450&fit=crop',
    description: 'Solid white oak, end-grain construction. Treated with food-safe mineral oil and beeswax.'
  }
];

// ----- Cart state (persisted in localStorage) -----
const STORAGE_KEY = 'northwind-cart-v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

let cart = loadCart();

// ----- Formatting -----
const formatPrice = (n) => `$${n.toFixed(2)}`;

// ----- Render product grid -----
function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-card__image" style="background-image:url('${p.image}')"></div>
      <div class="product-card__body">
        <h3 class="product-card__title">${p.name}</h3>
        <div class="product-card__price">${formatPrice(p.price)}</div>
        <div class="product-card__actions">
          <button class="btn btn-outline" data-action="view" data-id="${p.id}">Details</button>
          <button class="btn btn-primary" data-action="add" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `).join('');
}

// ----- Cart logic -----
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  openCart();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  saveCart(cart);
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  updateCartUI();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
  document.getElementById('cartCount').textContent = cartCount();
  document.getElementById('cartTotal').textContent = formatPrice(cartTotal());

  const body = document.getElementById('cartItems');
  if (cart.length === 0) {
    body.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    return;
  }

  body.innerHTML = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return '';
    return `
      <div class="cart-item">
        <div class="cart-item__image" style="background-image:url('${product.image}')"></div>
        <div>
          <p class="cart-item__title">${product.name}</p>
          <div class="cart-item__price">${formatPrice(product.price)}</div>
          <div class="cart-item__qty">
            <button data-action="dec" data-id="${item.id}" aria-label="Decrease">&minus;</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-id="${item.id}" aria-label="Increase">+</button>
          </div>
        </div>
        <button class="cart-item__remove" data-action="remove" data-id="${item.id}">Remove</button>
      </div>
    `;
  }).join('');
}

// ----- Drawer / overlay -----
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');

function openCart() {
  cartDrawer.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-visible');
}
function closeCart() {
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('is-visible');
}

// ----- Product modal -----
const productModal = document.getElementById('productModal');
const productModalBody = document.getElementById('productModalBody');

function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  productModalBody.innerHTML = `
    <div class="product-detail">
      <div class="product-detail__image" style="background-image:url('${product.image}')"></div>
      <h2 style="margin:0 0 4px;">${product.name}</h2>
      <div class="product-detail__price">${formatPrice(product.price)}</div>
      <p class="product-detail__desc">${product.description}</p>
      <button class="btn btn-primary" data-action="add" data-id="${product.id}">Add to cart</button>
    </div>
  `;
  productModal.classList.add('is-open');
  productModal.setAttribute('aria-hidden', 'false');
}
function closeProductModal() {
  productModal.classList.remove('is-open');
  productModal.setAttribute('aria-hidden', 'true');
}

// ----- Checkout modal -----
const checkoutModal = document.getElementById('checkoutModal');
const checkoutBody = document.getElementById('checkoutBody');

function openCheckout() {
  if (cart.length === 0) {
    checkoutBody.innerHTML = `
      <div class="checkout">
        <h3>Checkout</h3>
        <p>Your cart is empty. Add something first.</p>
      </div>
    `;
  } else {
    checkoutBody.innerHTML = `
      <div class="checkout">
        <h3>Checkout</h3>
        <div class="checkout-summary">
          ${cart.length} item${cart.length === 1 ? '' : 's'} — <strong>${formatPrice(cartTotal())}</strong>
        </div>
        <form id="checkoutForm">
          <label for="name">Full name</label>
          <input id="name" name="name" required />
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required />
          <label for="address">Address</label>
          <input id="address" name="address" required />
          <div class="checkout__row">
            <div>
              <label for="city">City</label>
              <input id="city" name="city" required />
            </div>
            <div>
              <label for="zip">Postal code</label>
              <input id="zip" name="zip" required />
            </div>
          </div>
          <label for="card">Card number (demo — any 12 digits)</label>
          <input id="card" name="card" pattern="\\d{12}" title="Enter any 12 digits" required />
          <div style="margin-top:18px;">
            <button type="submit" class="btn btn-primary btn-block">Place order</button>
          </div>
        </form>
      </div>
    `;
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showOrderSuccess();
    });
  }
  checkoutModal.classList.add('is-open');
  checkoutModal.setAttribute('aria-hidden', 'false');
}
function closeCheckout() {
  checkoutModal.classList.remove('is-open');
  checkoutModal.setAttribute('aria-hidden', 'true');
}
function showOrderSuccess() {
  const orderId = 'NW-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  checkoutBody.innerHTML = `
    <div class="checkout__success">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <h3 style="margin:8px 0 4px;">Order placed</h3>
      <p style="color:var(--muted);margin:0 0 16px;">Confirmation #${orderId}. (This is a demo — no real charge.)</p>
      <button class="btn btn-primary" id="finishOrder">Continue shopping</button>
    </div>
  `;
  cart = [];
  saveCart(cart);
  updateCartUI();
  document.getElementById('finishOrder').addEventListener('click', closeCheckout);
}

// ----- Event wiring -----
function handleAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (action === 'add') {
    addToCart(id);
  } else if (action === 'view') {
    e.stopPropagation();
    openProductModal(id);
  } else if (action === 'inc') {
    changeQty(id, +1);
  } else if (action === 'dec') {
    changeQty(id, -1);
  } else if (action === 'remove') {
    removeFromCart(id);
  }
}

document.addEventListener('click', handleAction);

document.getElementById('productGrid').addEventListener('click', (e) => {
  const card = e.target.closest('.product-card');
  if (!card) return;
  if (e.target.closest('[data-action]')) return; // button handled separately
  openProductModal(card.dataset.id);
});

document.getElementById('cartButton').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('overlay').addEventListener('click', () => {
  closeCart();
  closeProductModal();
  closeCheckout();
});
document.getElementById('closeProduct').addEventListener('click', closeProductModal);
document.getElementById('closeCheckout').addEventListener('click', closeCheckout);
document.getElementById('checkoutButton').addEventListener('click', () => {
  closeCart();
  openCheckout();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCart();
    closeProductModal();
    closeCheckout();
  }
});

// ----- Hero slideshow -----
function initHeroSlideshow() {
  const track = document.getElementById('heroTrack');
  const dotsContainer = document.getElementById('heroDots');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  if (!track || !dotsContainer) return;

  const slides = Array.from(track.querySelectorAll('.hero__slide'));

  // Apply background image from data-bg so the markup stays semantic
  slides.forEach(slide => {
    const bg = slide.dataset.bg;
    if (bg) slide.style.backgroundImage = `url('${bg}')`;
  });

  // Build dots
  dotsContainer.innerHTML = slides.map((_, i) =>
    `<button class="hero__dot" data-slide="${i}" role="tab" aria-label="Go to slide ${i + 1}"></button>`
  ).join('');
  const dots = Array.from(dotsContainer.querySelectorAll('.hero__dot'));

  let current = 0;
  let autoplayId = null;
  const AUTOPLAY_MS = 5000;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      const isActive = i === current;
      d.classList.toggle('is-active', isActive);
      d.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  // Events
  prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
  nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
  dotsContainer.addEventListener('click', (e) => {
    const dot = e.target.closest('[data-slide]');
    if (!dot) return;
    goTo(parseInt(dot.dataset.slide, 10));
    startAutoplay();
  });

  // Pause on hover, resume on leave
  const hero = document.getElementById('hero');
  hero.addEventListener('mouseenter', stopAutoplay);
  hero.addEventListener('mouseleave', startAutoplay);

  // Keyboard support when hero is focused
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
    else if (e.key === 'ArrowRight') { next(); startAutoplay(); }
  });
  hero.setAttribute('tabindex', '0');

  goTo(0);
  startAutoplay();
}

// ----- Init -----
renderProducts();
updateCartUI();
initHeroSlideshow();
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();
