// Colour / size / quantity selector + add-to-cart, shared by the product page and quick view.
// Scoped to a root element (no global IDs), so two pickers can exist on one page.
import { STORE, sizesOf, stockOf, isInStock } from '/data/products.js';
import { esc, addToCart } from '/assets/js/store.js';
import { t, colorName } from '/assets/js/i18n.js';

export function newSelection(p) {
  const sizes = sizesOf(p);
  const only = sizes.length === 1 && stockOf(p, sizes[0]) > 0 ? sizes[0] : null;
  return { size: only, color: p.colors[0]?.name, qty: 1 };
}

export function pickerHTML(p, sel, { compact = false } = {}) {
  const sizes = sizesOf(p);
  const orderable = p.available !== false && isInStock(p);
  const numeric = sizes.every((s) => /^\d+$/.test(s));
  return `
  <div class="opt-group">
    <div class="opt-label"><span>${t('color')}</span><span data-role="colorName">${esc(colorName(sel.color || ''))}</span></div>
    <div class="colors" role="radiogroup" aria-label="${t('color')}">
      ${p.colors.map((c) => `<button type="button" class="color" role="radio" aria-checked="${c.name === sel.color}" aria-label="${esc(colorName(c.name))}" data-color="${esc(c.name)}"><i style="background:${esc(c.hex)}"></i></button>`).join('')}
    </div>
  </div>
  <div class="opt-group">
    <div class="opt-label"><span>${t('size')}</span><span>${compact || p.category === 'shoes' || sizes.length === 1 ? '' : numeric ? t('sizeWaist') : t('sizeIntl')}</span></div>
    <div class="sizes" role="radiogroup" aria-label="${t('size')}">
      ${sizes.map((s) => { const out = stockOf(p, s) < 1; return `<button type="button" class="size" role="radio" aria-checked="${s === sel.size}" data-size="${esc(s)}"${out ? ` disabled aria-label="${esc(t('sizeOut', { s }))}"` : ''}>${esc(s)}</button>`; }).join('')}
    </div>
  </div>
  <div class="buy-row">
    <div class="qty" role="group" aria-label="${t('qty')}">
      <button type="button" data-role="minus" aria-label="${t('qtyDec')}">−</button><output data-role="qty" aria-live="polite">1</output><button type="button" data-role="plus" aria-label="${t('qtyInc')}">+</button>
    </div>
    <button class="btn" type="button" data-role="add" ${orderable ? '' : 'disabled'}>${orderable ? t('addToCart') : t('out')}</button>
  </div>
  <p class="stock-note" data-role="note" aria-live="polite"></p>`;
}

/**
 * Wires up a rendered picker. `onAdd(result)` runs after a successful add.
 * Returns { add } so other buttons (e.g. a sticky mobile bar) can trigger the same action.
 */
export function bindPicker(root, p, sel, { onAdd, onError } = {}) {
  const q = (r) => root.querySelector(`[data-role="${r}"]`);
  const orderable = p.available !== false && isInStock(p);
  const maxQty = () => (sel.size ? Math.min(stockOf(p, sel.size), STORE.maxQtyPerItem) : STORE.maxQtyPerItem);

  function update() {
    if (sel.qty > maxQty()) sel.qty = Math.max(1, maxQty());
    q('qty').textContent = sel.qty;
    q('minus').disabled = sel.qty <= 1;
    q('plus').disabled = sel.qty >= maxQty();
    const note = q('note');
    note.className = 'stock-note';
    if (!orderable) { note.textContent = t('noteOut'); return; }
    if (!sel.size) { note.textContent = ''; return; }
    const st = stockOf(p, sel.size);
    if (st <= 2) { note.textContent = t('noteLeft', { n: st, s: sel.size }); note.classList.add('warn'); }
    else { note.textContent = p.preorder ? t('notePre', { t: t('preorderTime') }) : t('inStock'); note.classList.add('ok'); }
  }

  root.querySelector('.colors').addEventListener('click', (e) => {
    const b = e.target.closest('[data-color]'); if (!b) return;
    sel.color = b.dataset.color;
    root.querySelectorAll('.color').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    q('colorName').textContent = colorName(sel.color);
    root.dispatchEvent(new CustomEvent('picker:color', { detail: sel.color }));
  });
  root.querySelector('.sizes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-size]'); if (!b || b.disabled) return;
    sel.size = b.dataset.size;
    root.querySelectorAll('.size').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    update();
    root.dispatchEvent(new CustomEvent('picker:size', { detail: sel.size }));
  });
  q('minus').addEventListener('click', () => { sel.qty = Math.max(1, sel.qty - 1); update(); });
  q('plus').addEventListener('click', () => { sel.qty = Math.min(maxQty(), sel.qty + 1); update(); });

  function add() {
    if (!orderable) return false;
    if (!sel.size) {
      const note = q('note'); note.className = 'stock-note warn'; note.textContent = t('pickSize');
      const first = root.querySelector('.size:not(:disabled)');
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      first?.focus({ preventScroll: true });
      return false;
    }
    const r = addToCart(p.id, sel.size, sel.color, sel.qty);
    if (!r.ok) { onError?.(r.reason); return false; }
    onAdd?.(r);
    return true;
  }
  q('add').addEventListener('click', add);
  update();
  return { add, update };
}
