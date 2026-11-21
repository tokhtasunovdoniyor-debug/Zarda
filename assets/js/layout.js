// Header, mobile menu, cart drawer, footer, product cards and overlay management — shared by every page.
import { STORE, CATEGORIES, PRODUCTS, getCategory, isInStock, totalStock, sizesOf, stockOf, LOW_STOCK } from '/data/products.js';
import { esc, money, imgTag, imgUrl, cartLines, cartCount, cartTotal, setQty, removeLine } from '/assets/js/store.js';

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
  { href: '/catalog?sort=new', label: 'Новинки' },
  { href: '/catalog', label: 'Каталог' },
  ...CATEGORIES.slice(0, 1).map((c) => ({ href: `/catalog?category=${c.id}`, label: c.name })),
  { href: '/about', label: 'О бренде' },
];

function header() {
  const catCount = (id) => PRODUCTS.filter((p) => p.category === id && p.available !== false).length;
  return `
  <a class="skip" href="#main">Перейти к содержимому</a>
  ${STORE.demo ? '<div class="announce">Демо-каталог · товары, фото и цены являются примерами</div>' : '<div class="announce">Доставка по всему Узбекистану · Заказ через Telegram</div>'}
  <header class="hdr" id="hdr">
    <div class="hdr-in">
      <div class="hdr-l">
        <button class="icon-btn only-m" id="menuBtn" aria-label="Открыть меню" aria-expanded="false" aria-controls="mnav">${icon.menu}</button>
        <nav class="nav only-d" aria-label="Основная навигация">${NAV.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join('')}</nav>
      </div>
      <a class="logo" href="/" aria-label="ZARDA — на главную">ZARDA</a>
      <div class="hdr-r">
        <a class="icon-btn" href="/catalog#q" aria-label="Поиск">${icon.search}</a>
        <button class="cart-btn" id="cartBtn" aria-haspopup="dialog" aria-controls="drawer">
          <span class="only-d">Корзина</span><span class="only-m">${icon.bag}</span>
          <span class="cart-n" id="cartCount" aria-label="товаров в корзине">0</span>
        </button>
      </div>
    </div>
  </header>
  <div class="mnav" id="mnav" data-overlay role="dialog" aria-modal="true" aria-label="Меню" hidden>
    <div class="mnav-top"><button class="icon-btn" data-close aria-label="Закрыть меню">${icon.close}</button><span class="logo">ZARDA</span><span style="width:44px"></span></div>
    <div class="mnav-body">
      <a class="mnav-search" href="/catalog#q">${icon.search}<span>Поиск по каталогу</span></a>
      <nav aria-label="Мобильная навигация">
        <a class="mnav-big" href="/catalog?sort=new">Новинки</a>
        <a class="mnav-big" href="/catalog">Весь каталог</a>
        <p class="mnav-label">Категории</p>
        ${CATEGORIES.filter((c) => catCount(c.id)).map((c) => `<a class="mnav-cat" href="/catalog?category=${c.id}"><span>${esc(c.name)}</span><small>${catCount(c.id)}</small></a>`).join('')}
      </nav>
      <div class="mnav-links"><a href="/about">О бренде</a><a href="/delivery">Доставка</a><a href="/payment">Оплата</a><a href="/returns">Возврат и обмен</a><a href="/contacts">Контакты</a></div>
      <a class="btn btn-ghost btn-full mnav-tg" href="https://t.me/${esc(STORE.telegram)}" target="_blank" rel="noopener">Написать в Telegram</a>
    </div>
  </div>
  <div class="scrim" id="scrim" hidden></div>
  <aside class="drawer" id="drawer" data-overlay role="dialog" aria-modal="true" aria-labelledby="drawerTitle" hidden>
    <div class="drawer-head"><h2 id="drawerTitle">Корзина <span id="drawerCount" class="muted"></span></h2><button class="icon-btn" data-close aria-label="Закрыть корзину">${icon.close}</button></div>
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
      <p class="display ftr-claim">Меньше вещей.<br>Больше стиля.</p>
      <a class="btn btn-light" href="https://t.me/${esc(STORE.telegram)}" target="_blank" rel="noopener">Связаться в Telegram</a>
    </div>
    <div class="wrap ftr-grid">
      <div class="ftr-brand"><a class="logo logo-light" href="/">ZARDA</a><p>Современная одежда с доставкой по Узбекистану.</p></div>
      <div><h3>Магазин</h3><a href="/catalog?sort=new">Новинки</a><a href="/catalog">Каталог</a><a href="/catalog?sort=popular">Бестселлеры</a></div>
      <div><h3>Покупателям</h3><a href="/delivery">Доставка</a><a href="/payment">Оплата</a><a href="/returns">Возврат и обмен</a></div>
      <div><h3>Компания</h3><a href="/about">О бренде</a><a href="/contacts">Контакты</a><a href="/privacy">Конфиденциальность</a></div>
      <div><h3>Мы на связи</h3>
        <a href="https://t.me/${esc(STORE.telegram)}" rel="noopener" target="_blank">Telegram</a>
        <a href="https://instagram.com/${esc(STORE.instagram)}" rel="noopener" target="_blank">Instagram</a>
      </div>
    </div>
    <div class="wrap ftr-bottom"><span>© ${y} ZARDA.SHOP</span><span>Цены указаны в узбекских сумах (UZS)</span></div>
  </footer>`;
}

// ---- availability -----------------------------------------------------------
export function availability(p) {
  if (p.available === false || !isInStock(p)) return { key: 'out', label: 'Нет в наличии' };
  if (totalStock(p) <= LOW_STOCK) return { key: 'low', label: 'Осталось мало' };
  return { key: 'in', label: 'В наличии' };
}

// ---- product card -------------------------------------------------------
export function productCard(p, { eager = false } = {}) {
  const cat = getCategory(p.category);
  const av = availability(p);
  const second = p.images[1];
  const href = `/product?id=${encodeURIComponent(p.id)}`;
  const badge = av.key === 'out' ? `<span class="badge badge-out">${av.label}</span>`
    : av.key === 'low' ? `<span class="badge badge-low">${av.label}</span>`
    : p.isNew ? '<span class="badge">Новинка</span>' : '';
  const sizes = sizesOf(p);
  return `
  <article class="card${av.key === 'out' ? ' is-out' : ''}">
    <div class="card-media">
      <a class="card-link" href="${href}" tabindex="-1" aria-hidden="true">
        ${imgTag(p.images[0], { alt: '', sizes: '(min-width:1200px) 25vw, (min-width:768px) 33vw, 50vw', w: 700, eager })}
        ${second ? imgTag(second, { alt: '', sizes: '(min-width:1200px) 25vw, (min-width:768px) 33vw, 50vw', w: 700, cls: 'alt' }) : ''}
      </a>
      ${badge}
      ${p.sample ? '<span class="demo-tag">Фото-пример</span>' : ''}
      ${av.key !== 'out' ? `<div class="card-sizes" aria-hidden="true">${sizes.map((s) => `<span${stockOf(p, s) < 1 ? ' class="na"' : ''}>${esc(s)}</span>`).join('')}</div>` : ''}
      <button class="qv-btn" type="button" data-qv="${esc(p.id)}" aria-label="Быстрый просмотр: ${esc(p.name)}">${icon.plus}</button>
    </div>
    <div class="card-info">
      <h3><a href="${href}">${esc(p.name)}</a></h3>
      <div class="card-meta"><span class="card-price">${money(p.price)}</span>${p.colors.length > 1 ? `<span class="swatches" aria-label="${p.colors.length} цвета">${p.colors.map((c) => `<i style="background:${esc(c.hex)}" title="${esc(c.name)}"></i>`).join('')}</span>` : ''}</div>
      <span class="sr-only">${esc(cat?.name || '')}. ${av.label}.</span>
    </div>
  </article>`;
}

// ---- toast --------------------------------------------------------------
let toastTimer;
export function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
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
    window.scrollTo(0, savedY);
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
  if (stack.length === 1) lockScroll(true);
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
  if (!stack.length) { scrim.classList.remove('open'); lockScroll(false); }
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
    body.innerHTML = '<div class="empty"><p class="display" style="font-size:26px;color:var(--ink)">Ваша корзина пуста</p><p>Начните с новинок сезона.</p><a class="btn" href="/catalog?sort=new">Смотреть новинки</a></div>';
    foot.innerHTML = '';
    return;
  }
  body.innerHTML = lines.map((l, i) => `
    <div class="line">
      <a class="line-img" href="/product?id=${encodeURIComponent(l.id)}">${imgTag(l.product.images[0], { alt: l.product.name, w: 200, sizes: '90px' })}</a>
      <div class="line-info">
        <a class="line-name" href="/product?id=${encodeURIComponent(l.id)}">${esc(l.product.name)}</a>
        <div class="muted">Размер ${esc(l.size)} · ${esc(l.color)}</div>
        <div class="line-row">
          <div class="qty" role="group" aria-label="Количество">
            <button data-q="${i}" data-d="-1" aria-label="Уменьшить">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="Увеличить" ${l.qty >= l.max ? 'disabled' : ''}>+</button>
          </div>
          <span>${money(l.lineTotal)}</span>
        </div>
        <button class="link" data-rm="${i}">Удалить</button>
      </div>
    </div>`).join('');
  foot.innerHTML = `
    <div class="sum"><span>Итого</span><span>${money(cartTotal())}</span></div>
    <p class="muted small">Доставка рассчитывается менеджером при подтверждении. Оплата — после подтверждения заказа.</p>
    <a class="btn btn-full" href="/checkout">Оформить заказ</a>
    <button class="link drawer-continue" data-close type="button">Продолжить покупки</button>`;
}

function updateCount() {
  const n = cartCount();
  const el = document.getElementById('cartCount');
  if (el) { el.textContent = n; el.setAttribute('aria-label', `${n} товаров в корзине`); }
}

export function initLayout() {
  document.documentElement.classList.add('has-js');
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
  document.getElementById('scrim').addEventListener('click', () => { const t = top(); if (t) closeOverlay(t); });

  // Any [data-close] inside an overlay closes that overlay.
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-close]');
    if (c) { const ov = c.closest('[data-overlay]'); if (ov) { closeOverlay(ov); if (ov === menu) menuBtn.setAttribute('aria-expanded', 'false'); } }
    // Quick view is loaded on demand.
    const qv = e.target.closest('[data-qv]');
    if (qv) { e.preventDefault(); import('/assets/js/quickview.js').then((m) => m.openQuickView(qv.dataset.qv)); }
  });
  document.addEventListener('keydown', (e) => {
    const t = top(); if (!t) return;
    if (e.key === 'Escape') { closeOverlay(t); if (t === menu) menuBtn.setAttribute('aria-expanded', 'false'); }
    else trapFocus(t, e);
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
}

export { imgUrl };
