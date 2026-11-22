// Header, mobile menu, cart drawer, footer, product cards and overlay management — shared by every page.
import { STORE, CATEGORIES, PRODUCTS, getCategory, isInStock, totalStock, sizesOf, stockOf, LOW_STOCK } from '/data/products.js';
import { esc, money, imgTag, imgUrl, cartLines, cartCount, cartTotal, setQty, removeLine } from '/assets/js/store.js';
import { t, lang, setLang, applyStatic, langSwitch, pName, catName, colorName } from '/assets/js/i18n.js';

const icon = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18M3 16h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};
export { icon };

const NAV = [
  { href: '/catalog?sort=new', label: t('new') },
  { href: '/catalog', label: t('catalog') },
  ...CATEGORIES.slice(0, 1).map((c) => ({ href: `/catalog?category=${c.id}`, label: catName(c) })),
  { href: '/about', label: t('about') },
];

function header() {
  const catCount = (id) => PRODUCTS.filter((p) => p.category === id && p.available !== false).length;
  return `
  <a class="skip" href="#main">${t('skip')}</a>
  ${STORE.demo ? '<div class="announce">Демо-каталог · товары, фото и цены являются примерами</div>' : `<div class="announce">${esc(t('announce', { t: t('preorderTime') }))}</div>`}
  <header class="hdr" id="hdr">
    <div class="hdr-in">
      <div class="hdr-l">
        <button class="icon-btn only-m" id="menuBtn" aria-label="${t('menuOpen')}" aria-expanded="false" aria-controls="mnav">${icon.menu}</button>
        ${langSwitch('lang-hdr only-m')}
        <nav class="nav only-d" aria-label="${t('navMain')}">${NAV.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join('')}</nav>
      </div>
      <a class="logo" href="/" aria-label="${t('homeAria')}">ZARDA</a>
      <div class="hdr-r">
        ${langSwitch('lang-hdr only-d')}
        <a class="icon-btn" href="/catalog#q" aria-label="${t('search')}">${icon.search}</a>
        <button class="cart-btn" id="cartBtn" aria-haspopup="dialog" aria-controls="drawer">
          <span class="only-d">${t('cart')}</span><span class="only-m">${icon.bag}</span>
          <span class="cart-n" id="cartCount" aria-label="${t('cartAria0')}">0</span>
        </button>
      </div>
    </div>
  </header>
  <div class="mnav" id="mnav" data-overlay role="dialog" aria-modal="true" aria-label="${t('menu')}" hidden>
    <div class="mnav-top"><button class="icon-btn" data-close aria-label="${t('menuClose')}">${icon.close}</button><span class="logo">ZARDA</span><span style="width:44px"></span></div>
    <div class="mnav-body">
      <a class="mnav-search" href="/catalog#q">${icon.search}<span>${t('searchCatalog')}</span></a>
      <nav aria-label="${t('navMobile')}">
        <a class="mnav-big" href="/catalog?sort=new">${t('new')}</a>
        <a class="mnav-big" href="/catalog">${t('allCatalog')}</a>
        <p class="mnav-label">${t('categories')}</p>
        ${CATEGORIES.filter((c) => catCount(c.id)).map((c) => `<a class="mnav-cat" href="/catalog?category=${c.id}"><span>${esc(catName(c))}</span><small>${catCount(c.id)}</small></a>`).join('')}
      </nav>
      <div class="mnav-links"><a href="/about">${t('about')}</a><a href="/delivery">${t('delivery')}</a><a href="/payment">${t('payment')}</a><a href="/returns">${t('returns')}</a><a href="/contacts">${t('contacts')}</a></div>
      <p class="mnav-label">${t('language')}</p>
      ${langSwitch('lang-menu')}
      <a class="btn btn-ghost btn-full mnav-tg" href="https://t.me/${esc(STORE.telegram)}" target="_blank" rel="noopener">${t('writeTg')}</a>
    </div>
  </div>
  <div class="scrim" id="scrim" hidden></div>
  <aside class="drawer" id="drawer" data-overlay role="dialog" aria-modal="true" aria-labelledby="drawerTitle" hidden>
    <div class="drawer-head"><h2 id="drawerTitle">${t('cart')} <span id="drawerCount" class="muted"></span></h2><button class="icon-btn" data-close aria-label="${t('cartClose')}">${icon.close}</button></div>
    <div class="drawer-body" id="drawerBody"></div>
    <div class="drawer-foot" id="drawerFoot"></div>
  </aside>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

function footer() {
  const y = new Date().getFullYear();
  return `
  <footer class="ftr">
    <div class="wrap ftr-top">
      <p class="display ftr-claim">${t('claim')}</p>
      <a class="btn btn-light" href="https://t.me/${esc(STORE.telegram)}" target="_blank" rel="noopener">${t('contactTg')}</a>
    </div>
    <div class="wrap ftr-grid">
      <div class="ftr-brand"><a class="logo logo-light" href="/">ZARDA</a><p>${t('ftrAbout')}</p>${langSwitch('lang-ftr')}</div>
      <div><h3>${t('shop')}</h3><a href="/catalog?sort=new">${t('new')}</a><a href="/catalog">${t('catalog')}</a><a href="/catalog?sort=popular">${t('bestsellers')}</a></div>
      <div><h3>${t('customers')}</h3><a href="/delivery">${t('delivery')}</a><a href="/payment">${t('payment')}</a><a href="/returns">${t('returns')}</a></div>
      <div><h3>${t('company')}</h3><a href="/about">${t('about')}</a><a href="/contacts">${t('contacts')}</a><a href="/privacy">${t('privacy')}</a></div>
      <div><h3>${t('inTouch')}</h3>
        <a href="https://t.me/${esc(STORE.telegram)}" rel="noopener" target="_blank">Telegram</a>
        <a href="https://t.me/${esc(STORE.channel)}" rel="noopener" target="_blank">${t('channel')}</a>
        <a href="https://t.me/${esc(STORE.reviews)}" rel="noopener" target="_blank">${t('reviews')}</a>
      </div>
    </div>
    <div class="wrap ftr-bottom"><span>© ${y} ZARDA.SHOP</span><span>${t('pricesNote')}</span></div>
  </footer>`;
}

// ---- availability -----------------------------------------------------------
export function availability(p) {
  if (p.available === false || !isInStock(p)) return { key: 'out', label: t('out') };
  if (totalStock(p) <= LOW_STOCK) return { key: 'low', label: t('low') };
  if (p.preorder) return { key: 'in', label: t('preorder') };
  return { key: 'in', label: t('inStock') };
}

// ---- product card -------------------------------------------------------
export function productCard(p, { eager = false } = {}) {
  const cat = getCategory(p.category);
  const av = availability(p);
  const second = p.images[1];
  const href = `/product?id=${encodeURIComponent(p.id)}`;
  const badge = av.key === 'out' ? `<span class="badge badge-out">${av.label}</span>`
    : av.key === 'low' ? `<span class="badge badge-low">${av.label}</span>`
    : p.isNew ? `<span class="badge">${t('newBadge')}</span>` : '';
  const sizes = sizesOf(p);
  return `
  <article class="card${av.key === 'out' ? ' is-out' : ''}">
    <div class="card-media">
      <a class="card-link" href="${href}" tabindex="-1" aria-hidden="true">
        ${imgTag(p.images[0], { alt: '', sizes: '(min-width:1200px) 25vw, (min-width:768px) 33vw, 50vw', w: 700, eager })}
        ${second ? imgTag(second, { alt: '', sizes: '(min-width:1200px) 25vw, (min-width:768px) 33vw, 50vw', w: 700, cls: 'alt' }) : ''}
      </a>
      ${badge}
      ${p.sample ? `<span class="demo-tag">${t('samplePhoto')}</span>` : ''}
      ${av.key !== 'out' ? `<div class="card-sizes" aria-hidden="true">${sizes.map((s) => `<span${stockOf(p, s) < 1 ? ' class="na"' : ''}>${esc(s)}</span>`).join('')}</div>` : ''}
      <button class="qv-btn" type="button" data-qv="${esc(p.id)}" aria-label="${esc(t('quickView', { name: pName(p) }))}">${icon.plus}</button>
    </div>
    <div class="card-info">
      <h3><a href="${href}">${esc(pName(p))}</a></h3>
      <div class="card-meta"><span class="card-price">${money(p.price)}</span>${p.colors.length > 1 ? `<span class="swatches" aria-label="${t('colorsAria', { n: p.colors.length })}">${p.colors.map((c) => `<i style="background:${esc(c.hex)}" title="${esc(colorName(c.name))}"></i>`).join('')}</span>` : ''}</div>
      <span class="sr-only">${esc(catName(cat))}. ${av.label}.</span>
    </div>
  </article>`;
}

// ---- toast --------------------------------------------------------------
let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---- overlays: a stack, so quick view → cart drawer works -----------------
const stack = [];
let savedY = 0;
function lockScroll(on) {
  // iOS Safari ignores overflow:hidden on <html> for touch scrolling; pin the body instead.
  const b = document.body;
  if (on) {
    savedY = window.scrollY;
    b.style.position = 'fixed'; b.style.top = `-${savedY}px`; b.style.left = '0'; b.style.right = '0';
    document.documentElement.classList.add('noscroll');
  } else {
    b.style.position = ''; b.style.top = ''; b.style.left = ''; b.style.right = '';
    document.documentElement.classList.remove('noscroll');
    // Jump back instantly (html has scroll-behavior: smooth, which would animate from the top).
    window.scrollTo({ top: savedY, left: 0, behavior: 'instant' });
  }
}

function trapFocus(el, e) {
  if (e.key !== 'Tab') return;
  const f = [...el.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]')].filter((x) => x.offsetParent !== null || x === document.activeElement);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

export function openOverlay(el, { focus } = {}) {
  if (stack.some((s) => s.el === el)) return;
  const scrim = document.getElementById('scrim');
  stack.push({ el, returnTo: document.activeElement });
  if (stack.length === 1) { window.__lenis?.stop(); lockScroll(true); }
  el.hidden = false; scrim.hidden = false;
  el.style.zIndex = String(70 + stack.length * 2); scrim.style.zIndex = String(69 + stack.length * 2);
  requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add('open'); scrim.classList.add('open'); }));
  setTimeout(() => (focus || el.querySelector('[data-close], button, a'))?.focus({ preventScroll: true }), 60);
}

export function closeOverlay(el) {
  const i = stack.findIndex((s) => s.el === el);
  if (i < 0) return;
  const [{ returnTo }] = stack.splice(i, 1);
  const scrim = document.getElementById('scrim');
  el.classList.remove('open');
  if (!stack.length) { scrim.classList.remove('open'); lockScroll(false); if (window.__lenis) { const l = window.__lenis; l.resize?.(); l.start(); l.scrollTo(savedY, { immediate: true, force: true }); } }
  else { const top = stack[stack.length - 1].el; scrim.style.zIndex = String(Number(top.style.zIndex) - 1); }
  setTimeout(() => { if (!el.classList.contains('open')) el.hidden = true; if (!stack.length) scrim.hidden = true; }, 320);
  if (returnTo && document.contains(returnTo)) returnTo.focus?.({ preventScroll: true });
}
const top = () => stack[stack.length - 1]?.el;

export function openCart() { renderDrawer(); openOverlay(document.getElementById('drawer')); }
export function closeCart() { closeOverlay(document.getElementById('drawer')); }

function renderDrawer() {
  const body = document.getElementById('drawerBody');
  const foot = document.getElementById('drawerFoot');
  const lines = cartLines();
  const n = cartCount();
  document.getElementById('drawerCount').textContent = n ? `(${n})` : '';
  if (!lines.length) {
    body.innerHTML = `<div class="empty"><p class="display" style="font-size:26px;color:var(--ink)">${t('cartEmpty')}</p><p>${t('cartEmptyHint')}</p><a class="btn" href="/catalog?sort=new">${t('seeNew')}</a></div>`;
    foot.innerHTML = '';
    return;
  }
  body.innerHTML = lines.map((l, i) => `
    <div class="line">
      <a class="line-img" href="/product?id=${encodeURIComponent(l.id)}">${imgTag(l.product.images[0], { alt: pName(l.product), w: 200, sizes: '90px' })}</a>
      <div class="line-info">
        <a class="line-name" href="/product?id=${encodeURIComponent(l.id)}">${esc(pName(l.product))}</a>
        <div class="muted">${esc(t('sizeColor', { s: l.size, c: colorName(l.color) }))}</div>
        <div class="line-row">
          <div class="qty" role="group" aria-label="${t('qty')}">
            <button data-q="${i}" data-d="-1" aria-label="${t('dec')}">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="${t('inc')}" ${l.qty >= l.max ? 'disabled' : ''}>+</button>
          </div>
          <span>${money(l.lineTotal)}</span>
        </div>
        <button class="link" data-rm="${i}">${t('remove')}</button>
      </div>
    </div>`).join('');
  foot.innerHTML = `
    <div class="sum"><span>${t('total')}</span><span>${money(cartTotal())}</span></div>
    <p class="muted small">${t('cartNote')}</p>
    <a class="btn btn-full" href="/checkout">${t('checkout')}</a>
    <button class="link drawer-continue" data-close type="button">${t('continue')}</button>`;
}

function updateCount() {
  const n = cartCount();
  const el = document.getElementById('cartCount');
  if (el) { el.textContent = n; el.setAttribute('aria-label', t('cartAria', { n })); }
}

export function initLayout() {
  document.documentElement.classList.add('has-js');
  applyStatic();
  document.getElementById('site-header').outerHTML = header();
  document.getElementById('site-footer').outerHTML = footer();

  // highlight current nav
  const here = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') + location.search;
  document.querySelectorAll('.nav a, .mnav a').forEach((a) => { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });

  const menu = document.getElementById('mnav');
  const drawer = document.getElementById('drawer');
  const menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', () => { menuBtn.setAttribute('aria-expanded', 'true'); openOverlay(menu); });
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('scrim').addEventListener('click', () => { const o = top(); if (o) closeOverlay(o); });

  // Any [data-close] inside an overlay closes that overlay.
  document.addEventListener('click', (e) => {
    const sl = e.target.closest('[data-setlang]');
    if (sl) { if (sl.dataset.setlang !== lang) setLang(sl.dataset.setlang); return; }
    const c = e.target.closest('[data-close]');
    if (c) { const ov = c.closest('[data-overlay]'); if (ov) { closeOverlay(ov); if (ov === menu) menuBtn.setAttribute('aria-expanded', 'false'); } }
    // Quick view is loaded on demand.
    const qv = e.target.closest('[data-qv]');
    if (qv) { e.preventDefault(); import('/assets/js/quickview.js').then((m) => m.openQuickView(qv.dataset.qv)); }
  });
  document.addEventListener('keydown', (e) => {
    const o = top(); if (!o) return;
    if (e.key === 'Escape') { closeOverlay(o); if (o === menu) menuBtn.setAttribute('aria-expanded', 'false'); }
    else trapFocus(o, e);
  });
  drawer.addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]');
    const rm = e.target.closest('[data-rm]');
    if (q) { const i = +q.dataset.q; const line = cartLines()[i]; if (line) setQty(i, line.qty + +q.dataset.d); }
    if (rm) removeLine(+rm.dataset.rm);
  });
  document.addEventListener('cart:change', () => { updateCount(); if (!drawer.hidden) renderDrawer(); });

  const hdr = document.getElementById('hdr');
  const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  updateCount();
  // Animations load after the page has rendered (page scripts finish in this same tick).
  setTimeout(() => { import('/assets/js/motion.js').then((m) => m.initMotion()).catch(() => document.documentElement.classList.remove('motion-pending')); }, 0);
}

export { imgUrl };
