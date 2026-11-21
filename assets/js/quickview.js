// Quick view: product preview with colour/size/qty and add-to-cart, without leaving the listing.
// Desktop: centred dialog. Mobile: bottom sheet. Loaded on demand from layout.js.
import { getProduct, getCategory } from '/data/products.js';
import { openOverlay, closeOverlay, openCart, toast, availability, icon } from '/assets/js/layout.js';
import { esc, money, imgTag } from '/assets/js/store.js';
import { newSelection, pickerHTML, bindPicker } from '/assets/js/picker.js';

let el;
function ensure() {
  if (el) return el;
  el = document.createElement('div');
  el.className = 'qv';
  el.id = 'quickview';
  el.dataset.overlay = '';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'qvTitle');
  el.hidden = true;
  document.body.append(el);
  return el;
}

export function openQuickView(id) {
  const p = getProduct(id);
  if (!p) return;
  const root = ensure();
  const sel = newSelection(p);
  const av = availability(p);
  const href = `/product?id=${encodeURIComponent(p.id)}`;
  root.innerHTML = `
    <div class="qv-grab" aria-hidden="true"></div>
    <button class="icon-btn qv-close" data-close aria-label="Закрыть">${icon.close}</button>
    <div class="qv-grid">
      <div class="qv-media">
        <div class="qv-track" tabindex="0" aria-label="Фотографии товара">
          ${p.images.map((u, i) => `<figure>${imgTag(u, { alt: `${p.name} — фото ${i + 1}`, sizes: '(min-width:900px) 420px, 70vw', w: 900, eager: i === 0 })}</figure>`).join('')}
        </div>
        ${p.images.length > 1 ? `<div class="qv-count"><span data-qv-i>1</span> / ${p.images.length}</div>` : ''}
        ${p.sample ? '<span class="demo-tag">Фото-пример</span>' : ''}
      </div>
      <div class="qv-info buy">
        <p class="eyebrow">${esc(getCategory(p.category)?.name || '')}</p>
        <h2 class="display qv-title" id="qvTitle">${esc(p.name)}</h2>
        <p class="price">${money(p.price)} <span class="avail avail-${av.key}">${av.label}</span></p>
        ${pickerHTML(p, sel, { compact: true })}
        <a class="arrow-link" href="${href}">Подробнее о товаре</a>
      </div>
    </div>`;
  bindPicker(root.querySelector('.qv-info'), p, sel, {
    onAdd: (r) => {
      if (r.limited) toast(`Добавлено ${r.added} шт. — это максимум в наличии`);
      closeOverlay(root);
      setTimeout(openCart, 200);
    },
    onError: (msg) => toast(msg),
  });
  const track = root.querySelector('.qv-track');
  const counter = root.querySelector('[data-qv-i]');
  if (counter) track.addEventListener('scroll', () => { counter.textContent = String(Math.round(track.scrollLeft / track.clientWidth) + 1); }, { passive: true });
  openOverlay(root, { focus: root.querySelector('.qv-close') });
}
