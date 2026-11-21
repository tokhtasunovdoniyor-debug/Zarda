// Shared browser utilities: formatting, images, cart persistence and validation.
import { PRODUCTS, STORE, getProduct, stockOf, sizesOf } from '/data/products.js';

const CART_KEY = 'zarda_cart_v1';

export const money = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n)).replace(/ /g, ' ') + ' сум';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// Responsive image helpers. Unsplash URLs get resized server-side; local files are used as-is.
const isUnsplash = (u) => u.startsWith('https://images.unsplash.com/');
export function imgUrl(u, w) {
  return isUnsplash(u) ? `${u}?auto=format&fit=crop&w=${w}&q=80` : u;
}
export function srcset(u, widths = [400, 700, 1000, 1400]) {
  return isUnsplash(u) ? widths.map((w) => `${imgUrl(u, w)} ${w}w`).join(', ') : '';
}
export function imgTag(u, { alt = '', sizes = '100vw', w = 800, cls = '', eager = false, ratio = '' } = {}) {
  const ss = srcset(u);
  return `<img src="${esc(imgUrl(u, w))}"${ss ? ` srcset="${esc(ss)}" sizes="${esc(sizes)}"` : ''} alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${ratio ? ` style="aspect-ratio:${ratio}"` : ''}>`;
}

// ---- storage (Safari private mode / blocked storage can throw) ----------
function read() {
  try { const v = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(v) ? v : []; }
  catch { return []; }
}
function write(items) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* storage unavailable: cart lives for this page only */ }
  memory = items;
  document.dispatchEvent(new CustomEvent('cart:change', { detail: items }));
}
let memory = null;

// Drop lines whose product/size/color no longer exists, clamp quantities to stock.
export function sanitize(items) {
  const out = [];
  for (const raw of items) {
    const p = getProduct(raw?.id);
    if (!p || p.available === false) continue;
    if (!sizesOf(p).includes(String(raw.size))) continue;
    const color = p.colors.some((c) => c.name === raw.color) ? raw.color : p.colors[0]?.name;
    const max = Math.min(stockOf(p, raw.size), STORE.maxQtyPerItem);
    const qty = Math.min(Math.max(parseInt(raw.qty, 10) || 0, 0), max);
    if (qty < 1) continue;
    const dup = out.find((l) => l.id === p.id && l.size === String(raw.size) && l.color === color);
    if (dup) dup.qty = Math.min(dup.qty + qty, max); else out.push({ id: p.id, size: String(raw.size), color, qty });
  }
  return out;
}

export function getCart() {
  if (!memory) memory = sanitize(read());
  return memory;
}

export function cartLines() {
  return getCart().map((l) => {
    const p = getProduct(l.id);
    return { ...l, product: p, price: p.price, lineTotal: p.price * l.qty, max: Math.min(stockOf(p, l.size), STORE.maxQtyPerItem) };
  });
}
export const cartCount = () => getCart().reduce((s, l) => s + l.qty, 0);
export const cartTotal = () => cartLines().reduce((s, l) => s + l.lineTotal, 0);

/** Returns { ok, added, reason } */
export function addToCart(id, size, color, qty = 1) {
  const p = getProduct(id);
  if (!p || p.available === false) return { ok: false, reason: 'Товар недоступен' };
  if (!sizesOf(p).includes(String(size))) return { ok: false, reason: 'Выберите размер' };
  const stock = stockOf(p, size);
  if (stock < 1) return { ok: false, reason: 'Этого размера нет в наличии' };
  const max = Math.min(stock, STORE.maxQtyPerItem);
  const items = getCart().map((l) => ({ ...l }));
  const line = items.find((l) => l.id === id && l.size === String(size) && l.color === color);
  const current = line ? line.qty : 0;
  const added = Math.max(0, Math.min(qty, max - current));
  if (added === 0) return { ok: false, reason: `Максимум ${max} шт. этого размера` };
  if (line) line.qty += added; else items.push({ id, size: String(size), color, qty: added });
  write(sanitize(items));
  return { ok: true, added, limited: added < qty };
}

export function setQty(index, qty) {
  const items = getCart().map((l) => ({ ...l }));
  if (!items[index]) return;
  items[index].qty = qty;
  write(sanitize(items));
}
export function removeLine(index) {
  const items = getCart().filter((_, i) => i !== index);
  write(items);
}
export function clearCart() { write([]); }

// Keep tabs in sync.
window.addEventListener('storage', (e) => {
  if (e.key === CART_KEY) { memory = sanitize(read()); document.dispatchEvent(new CustomEvent('cart:change', { detail: memory })); }
});

export { PRODUCTS, STORE };
