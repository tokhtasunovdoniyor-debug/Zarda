import { PRODUCTS, STORE, getProduct, getCategory } from '/data/products.js';
import { initLayout, productCard, toast, openCart, openOverlay, closeOverlay, availability, icon } from '/assets/js/layout.js';
import { esc, money, imgTag, imgUrl } from '/assets/js/store.js';
import { newSelection, pickerHTML, bindPicker } from '/assets/js/picker.js';

initLayout();

const root = document.getElementById('pdp');
const id = new URLSearchParams(location.search).get('id');
const p = getProduct(id);

if (!p) {
  document.title = 'Товар не найден — ZARDA';
  root.innerHTML = `<div class="empty" style="padding:120px 0"><h1 class="display h-m">Товар не найден</h1><p style="margin-top:16px">Возможно, он был снят с продажи.</p><a class="btn" href="/catalog">Перейти в каталог</a></div>`;
  const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.append(m);
} else {
  render(p);
}

function render(p) {
  const cat = getCategory(p.category);
  const av = availability(p);
  document.title = `${p.name} — ZARDA`;
  document.querySelector('meta[name="description"]').content = `${p.name}: ${p.description}`.slice(0, 160);

  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.id, description: p.description,
    image: p.images.map((u) => imgUrl(u, 1200)), brand: { '@type': 'Brand', name: 'ZARDA' },
    offers: { '@type': 'Offer', priceCurrency: 'UZS', price: p.price, availability: av.key === 'out' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' },
  });
  document.head.append(ld);

  const sel = newSelection(p);

  root.innerHTML = `
  <nav class="crumbs" aria-label="Навигация"><a href="/">Главная</a><span>/</span><a href="/catalog">Каталог</a>${cat ? `<span>/</span><a href="/catalog?category=${cat.id}">${esc(cat.name)}</a>` : ''}</nav>
  <div class="pdp">
    <div class="gallery">
      <div class="gallery-track" id="track" tabindex="0" aria-label="Фотографии товара">
        ${p.images.map((u, i) => `<figure><button type="button" class="zoom" data-zoom="${i}" aria-label="Открыть фото ${i + 1} на весь экран">${imgTag(u, { alt: `${p.name} — фото ${i + 1}`, sizes: '(min-width:900px) 55vw, 100vw', w: 1200, eager: i === 0 })}</button></figure>`).join('')}
      </div>
      ${p.images.length > 1 ? `<div class="dots" id="dots">${p.images.map((_, i) => `<button type="button" aria-label="Фото ${i + 1}" ${i === 0 ? 'aria-current="true"' : ''} data-i="${i}"></button>`).join('')}</div>` : ''}
      ${p.sample ? '<span class="demo-tag demo-tag-pdp">Фото-пример</span>' : ''}
    </div>
    <div class="buy" id="buy">
      <p class="eyebrow">${esc(cat?.name || '')}</p>
      <h1 class="display" style="margin-top:8px">${esc(p.name)}</h1>
      <p class="price">${money(p.price)} <span class="avail avail-${av.key}">${av.label}</span></p>
      ${pickerHTML(p, sel)}

      <ul class="perks">
        <li><strong>Доставка по Узбекистану.</strong> Стоимость и срок сообщит менеджер до оплаты.</li>
        <li><strong>Без предоплаты на сайте.</strong> Оплата после подтверждения заказа.</li>
        <li><strong>Обмен и возврат.</strong> Поможем, если размер не подошёл. <a class="link" href="/returns">Условия</a></li>
      </ul>

      <div class="acc">
        <details open><summary>Описание</summary><div class="acc-body"><p>${esc(p.description)}</p></div></details>
        ${p.details?.length ? `<details><summary>Состав и детали</summary><div class="acc-body"><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div></details>` : ''}
        <details><summary>Доставка и оплата</summary><div class="acc-body"><p>Мы доставляем по Ташкенту и во все регионы Узбекистана. После оформления менеджер свяжется с вами, подтвердит наличие, рассчитает доставку и согласует оплату. <a class="link" href="/delivery">Доставка</a> · <a class="link" href="/payment">Оплата</a></p></div></details>
        <details><summary>Артикул</summary><div class="acc-body"><p>${esc(p.id)}</p></div></details>
      </div>
      ${p.sample || STORE.demo ? '<p class="sample-note">Демонстрационный товар: название, фото и цена являются примером.</p>' : ''}
    </div>
  </div>
  <div class="sticky-buy" id="stickyBuy" aria-hidden="true">
    <div class="sticky-buy-info"><span class="sticky-name">${esc(p.name)}</span><span>${money(p.price)}<span id="stickySize"></span></span></div>
    <button class="btn" type="button" id="stickyAdd" tabindex="-1" ${av.key === 'out' ? 'disabled' : ''}>${av.key === 'out' ? 'Нет в наличии' : 'В корзину'}</button>
  </div>`;

  const buy = document.getElementById('buy');
  const picker = bindPicker(buy, p, sel, {
    onAdd: (r) => { if (r.limited) toast(`Добавлено ${r.added} шт. — это максимум в наличии`); openCart(); },
    onError: (msg) => toast(msg),
  });
  buy.addEventListener('picker:size', (e) => { document.getElementById('stickySize').textContent = ` · ${e.detail}`; });

  // Sticky add-to-cart bar (mobile): visible once the main button scrolls out of view.
  const sticky = document.getElementById('stickyBuy');
  const mainBtn = buy.querySelector('[data-role="add"]');
  document.getElementById('stickyAdd').addEventListener('click', () => picker.add());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      const show = !e.isIntersecting && e.boundingClientRect.top < 0;
      sticky.classList.toggle('show', show);
      sticky.setAttribute('aria-hidden', String(!show));
      document.getElementById('stickyAdd').tabIndex = show ? 0 : -1;
    }).observe(mainBtn);
  }

  // Gallery dots follow horizontal swipe on mobile.
  const track = document.getElementById('track'), dots = document.getElementById('dots');
  if (dots) {
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      dots.querySelectorAll('button').forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    }, { passive: true });
    dots.addEventListener('click', (e) => { const d = e.target.closest('[data-i]'); if (d) track.scrollTo({ left: track.clientWidth * +d.dataset.i, behavior: 'smooth' }); });
  }

  // Fullscreen photo viewer.
  track.addEventListener('click', (e) => { const z = e.target.closest('[data-zoom]'); if (z) openViewer(p, +z.dataset.zoom); });

  const related = PRODUCTS.filter((x) => x.id !== p.id && x.available !== false && x.category === p.category)
    .concat(PRODUCTS.filter((x) => x.id !== p.id && x.available !== false && x.category !== p.category && x.featured))
    .slice(0, 4);
  if (related.length) { document.getElementById('related').hidden = false; document.getElementById('relGrid').innerHTML = related.map((x) => productCard(x)).join(''); }
}

function openViewer(p, start) {
  let v = document.getElementById('viewer');
  if (!v) {
    v = document.createElement('div');
    v.id = 'viewer'; v.className = 'viewer'; v.dataset.overlay = ''; v.hidden = true;
    v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'Фотографии');
    document.body.append(v);
  }
  v.innerHTML = `
    <button class="icon-btn viewer-close" data-close aria-label="Закрыть">${icon.close}</button>
    <div class="viewer-track">${p.images.map((u, i) => `<figure>${imgTag(u, { alt: `${p.name} — фото ${i + 1}`, sizes: '100vw', w: 1600 })}</figure>`).join('')}</div>
    ${p.images.length > 1 ? `<div class="viewer-count"><span id="vI">${start + 1}</span> / ${p.images.length}</div>` : ''}`;
  openOverlay(v);
  const t = v.querySelector('.viewer-track');
  requestAnimationFrame(() => { t.scrollLeft = t.clientWidth * start; });
  const c = v.querySelector('#vI');
  if (c) t.addEventListener('scroll', () => { c.textContent = String(Math.round(t.scrollLeft / t.clientWidth) + 1); }, { passive: true });
  t.addEventListener('click', (e) => { if (e.target.tagName !== 'IMG') closeOverlay(v); });
}
