import { PRODUCTS, STORE, getProduct, getCategory } from '/data/products.js';
import { initLayout, productCard, toast, openCart, openOverlay, closeOverlay, availability, icon } from '/assets/js/layout.js';
import { esc, money, imgTag, imgUrl } from '/assets/js/store.js';
import { newSelection, pickerHTML, bindPicker } from '/assets/js/picker.js';
import { t, lang, pName, pDesc, pDetails, catName } from '/assets/js/i18n.js';

initLayout();

const root = document.getElementById('pdp');
const id = new URLSearchParams(location.search).get('id');
const p = getProduct(id);

if (!p) {
  document.title = `${t('notFound')} — ZARDA`;
  root.innerHTML = `<div class="empty" style="padding:120px 0"><h1 class="display h-m">${t('notFound')}</h1><p style="margin-top:16px">${t('notFoundHint')}</p><a class="btn" href="/catalog">${t('toCatalog')}</a></div>`;
  const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.append(m);
} else {
  render(p);
}

function render(p) {
  const cat = getCategory(p.category);
  const av = availability(p);
  const name = pName(p), desc = pDesc(p);
  document.title = `${name} — ZARDA`;
  document.querySelector('meta[name="description"]').content = `${name}: ${desc}`.slice(0, 160);

  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product', name, sku: p.id, description: desc, inLanguage: lang,
    image: p.images.map((u) => imgUrl(u, 1200)), brand: { '@type': 'Brand', name: 'ZARDA' },
    offers: { '@type': 'Offer', priceCurrency: 'UZS', price: p.price, availability: av.key === 'out' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' },
  });
  document.head.append(ld);

  const sel = newSelection(p);

  root.innerHTML = `
  <nav class="crumbs" aria-label="${t('crumbs')}"><a href="/">${t('home')}</a><span>/</span><a href="/catalog">${t('catalog')}</a>${cat ? `<span>/</span><a href="/catalog?category=${cat.id}">${esc(catName(cat))}</a>` : ''}</nav>
  <div class="pdp">
    <div class="gallery">
      <div class="gallery-track" id="track" tabindex="0" aria-label="${t('photos')}">
        ${p.images.map((u, i) => `<figure><button type="button" class="zoom" data-zoom="${i}" aria-label="${t('openPhoto', { i: i + 1 })}">${imgTag(u, { alt: t('photoN', { name, i: i + 1 }), sizes: '(min-width:900px) 55vw, 100vw', w: 1200, eager: i === 0 })}</button></figure>`).join('')}
      </div>
      ${p.images.length > 1 ? `<div class="dots" id="dots">${p.images.map((_, i) => `<button type="button" aria-label="${t('photoDot', { i: i + 1 })}" ${i === 0 ? 'aria-current="true"' : ''} data-i="${i}"></button>`).join('')}</div>` : ''}
      ${p.sample ? `<span class="demo-tag demo-tag-pdp">${t('samplePhoto')}</span>` : ''}
    </div>
    <div class="buy" id="buy">
      <p class="eyebrow">${esc(catName(cat))}</p>
      <h1 class="display" style="margin-top:8px">${esc(name)}</h1>
      <p class="price">${money(p.price)} <span class="avail avail-${av.key}">${av.label}</span></p>
      ${pickerHTML(p, sel)}

      <ul class="perks">
        <li><strong>${p.preorder ? esc(t('perkPre', { t: t('preorderTime') })) : t('perkDelivery')}</strong> ${t('perkDeliveryText')}</li>
        <li><strong>${t('perkPayB')}</strong> ${t('perkPay')}</li>
        <li><strong>${t('perkRetB')}</strong> ${t('perkRet')} <a class="link" href="/returns">${t('terms')}</a></li>
      </ul>

      <div class="acc">
        <details open><summary>${t('desc')}</summary><div class="acc-body"><p>${esc(desc)}</p></div></details>
        ${pDetails(p).length ? `<details><summary>${t('details')}</summary><div class="acc-body"><ul>${pDetails(p).map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div></details>` : ''}
        <details><summary>${t('delPay')}</summary><div class="acc-body"><p>${t('delPayText')} <a class="link" href="/delivery">${t('delivery')}</a> · <a class="link" href="/payment">${t('payment')}</a></p></div></details>
        ${p.video && p.post ? `<details open><summary>${t('videoTitle')}</summary><div class="acc-body"><p>${t('videoText')} <a class="link" href="${esc(p.post)}" target="_blank" rel="noopener">${t('videoLink')}</a></p></div></details>` : ''}
        <details><summary>${t('sku')}</summary><div class="acc-body"><p>${esc(p.id)}</p></div></details>
      </div>
      ${p.sample || STORE.demo ? `<p class="sample-note">${t('sampleNote')}</p>` : ''}
    </div>
  </div>
  <div class="sticky-buy" id="stickyBuy" aria-hidden="true">
    <div class="sticky-buy-info"><span class="sticky-name">${esc(name)}</span><span>${money(p.price)}<span id="stickySize"></span></span></div>
    <button class="btn" type="button" id="stickyAdd" tabindex="-1" ${av.key === 'out' ? 'disabled' : ''}>${av.key === 'out' ? t('out') : t('toCart')}</button>
  </div>`;

  const buy = document.getElementById('buy');
  const picker = bindPicker(buy, p, sel, {
    onAdd: (r) => { if (r.limited) toast(t('addedLimited', { n: r.added })); openCart(); },
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
    v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', t('photosShort'));
    document.body.append(v);
  }
  v.innerHTML = `
    <button class="icon-btn viewer-close" data-close aria-label="${t('close')}">${icon.close}</button>
    <div class="viewer-track">${p.images.map((u, i) => `<figure>${imgTag(u, { alt: t('photoN', { name: pName(p), i: i + 1 }), sizes: '100vw', w: 1600 })}</figure>`).join('')}</div>
    ${p.images.length > 1 ? `<div class="viewer-count"><span id="vI">${start + 1}</span> / ${p.images.length}</div>` : ''}`;
  openOverlay(v);
  const track = v.querySelector('.viewer-track');
  requestAnimationFrame(() => { track.scrollLeft = track.clientWidth * start; });
  const c = v.querySelector('#vI');
  if (c) track.addEventListener('scroll', () => { c.textContent = String(Math.round(track.scrollLeft / track.clientWidth) + 1); }, { passive: true });
  track.addEventListener('click', (e) => { if (e.target.tagName !== 'IMG') closeOverlay(v); });
}
