import { PRODUCTS, CATEGORIES, sizesOf, stockOf } from '/data/products.js';
import { initLayout, productCard, openOverlay } from '/assets/js/layout.js';
import { isInStock } from '/data/products.js';
import { esc } from '/assets/js/store.js';

initLayout();

const $ = (id) => document.getElementById(id);
const visible = PRODUCTS.filter((p) => p.available !== false);

// Option lists derived from data, so new sizes/colors appear automatically.
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const allSizes = [...new Set(visible.flatMap(sizesOf))].sort((a, b) => {
  const ia = SIZE_ORDER.indexOf(a), ib = SIZE_ORDER.indexOf(b);
  if (ia > -1 && ib > -1) return ia - ib;
  if (ia > -1) return -1; if (ib > -1) return 1;
  return Number(a) - Number(b);
});
const allColors = [...new Map(visible.flatMap((p) => p.colors).map((c) => [c.name, c])).values()];

const params = new URLSearchParams(location.search);
const state = {
  category: params.get('category') || '',
  q: params.get('q') || '',
  sort: params.get('sort') || 'featured',
  sizes: new Set((params.get('size') || '').split(',').filter(Boolean)),
  colors: new Set((params.get('color') || '').split(',').filter(Boolean)),
  min: params.get('min') || '',
  max: params.get('max') || '',
  stock: params.get('stock') === '1',
};
const mobile = () => window.matchMedia('(max-width: 767px)').matches;
if (state.category && !CATEGORIES.some((c) => c.id === state.category)) state.category = '';

const norm = (s) => String(s).toLowerCase().replace(/ё/g, 'е').trim();

function syncUrl() {
  const p = new URLSearchParams();
  if (state.category) p.set('category', state.category);
  if (state.q) p.set('q', state.q);
  if (state.sort !== 'featured') p.set('sort', state.sort);
  if (state.sizes.size) p.set('size', [...state.sizes].join(','));
  if (state.colors.size) p.set('color', [...state.colors].join(','));
  if (state.min) p.set('min', state.min);
  if (state.max) p.set('max', state.max);
  if (state.stock) p.set('stock', '1');
  const qs = p.toString();
  history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
}

function filtered() {
  const q = norm(state.q);
  const min = Number(state.min) || 0;
  const max = Number(state.max) || Infinity;
  let list = visible.filter((p) => {
    if (state.category && p.category !== state.category) return false;
    if (q) {
      const cat = CATEGORIES.find((c) => c.id === p.category)?.name || '';
      const hay = norm(`${p.name} ${p.description} ${cat} ${p.colors.map((c) => c.name).join(' ')}`);
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    if (state.sizes.size && ![...state.sizes].some((s) => stockOf(p, s) > 0)) return false;
    if (state.colors.size && !p.colors.some((c) => state.colors.has(c.name))) return false;
    if (p.price < min || p.price > max) return false;
    if (state.stock && !isInStock(p)) return false;
    return true;
  });
  const by = {
    featured: (a, b) => (b.featured - a.featured) || (b.isNew - a.isNew),
    new: (a, b) => (b.isNew - a.isNew) || (b.featured - a.featured),
    popular: (a, b) => (b.bestseller - a.bestseller) || (b.featured - a.featured),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
  }[state.sort] || (() => 0);
  return [...list].sort((a, b) => by(a, b) || visible.indexOf(a) - visible.indexOf(b));
}

function plural(n) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'товар';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'товара';
  return 'товаров';
}

function render() {
  const cat = CATEGORIES.find((c) => c.id === state.category);
  $('catTitle').textContent = cat ? cat.name : 'Каталог';
  document.title = `${cat ? cat.name : 'Каталог'} — ZARDA`;
  $('cats').innerHTML = [{ id: '', name: 'Все' }, ...CATEGORIES.filter((c) => visible.some((p) => p.category === c.id))]
    .map((c) => `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${c.id === state.category}">${esc(c.name)}</button>`).join('');
  $('fSizes').innerHTML = allSizes.map((s) => `<button class="opt" type="button" data-size="${esc(s)}" aria-pressed="${state.sizes.has(s)}">${esc(s)}</button>`).join('');
  $('fColors').innerHTML = allColors.map((c) => `<button class="opt" type="button" data-color="${esc(c.name)}" aria-pressed="${state.colors.has(c.name)}"><i style="background:${esc(c.hex)}"></i>${esc(c.name)}</button>`).join('');

  const list = filtered();
  $('grid').innerHTML = list.map((p, i) => productCard(p, { eager: i < 2 })).join('');
  $('empty').hidden = list.length > 0;
  $('count').textContent = `${list.length} ${plural(list.length)}`;
  const active = state.sizes.size + state.colors.size + (state.min ? 1 : 0) + (state.max ? 1 : 0) + (state.stock ? 1 : 0);
  $('filterLbl').textContent = active ? `Фильтры (${active})` : 'Фильтры';
  $('fStock').setAttribute('aria-pressed', String(state.stock));
  $('applyFilters').textContent = list.length ? `Показать ${list.length} ${plural(list.length)}` : 'Ничего не найдено';
  syncUrl();
}

// ---- events ----
$('q').value = state.q;
$('sort').value = state.sort;
$('pmin').value = state.min;
$('pmax').value = state.max;
if (!mobile() && (state.sizes.size || state.colors.size || state.min || state.max || state.stock)) { $('filters').hidden = false; $('filterBtn').setAttribute('aria-expanded', 'true'); }
if (location.hash === '#q') setTimeout(() => $('q').focus(), 100);

let t;
$('q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 150); });
$('sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
$('cats').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) { state.category = b.dataset.cat; render(); } });
$('filterBtn').addEventListener('click', () => {
  const f = $('filters');
  if (mobile()) { openOverlay(f); return; } // bottom sheet on phones
  f.hidden = !f.hidden; $('filterBtn').setAttribute('aria-expanded', String(!f.hidden));
});
$('fStock').addEventListener('click', () => { state.stock = !state.stock; render(); });
$('filters').addEventListener('submit', (e) => e.preventDefault());
$('filters').addEventListener('click', (e) => {
  const s = e.target.closest('[data-size]'); const c = e.target.closest('[data-color]');
  if (s) { state.sizes.has(s.dataset.size) ? state.sizes.delete(s.dataset.size) : state.sizes.add(s.dataset.size); render(); }
  if (c) { state.colors.has(c.dataset.color) ? state.colors.delete(c.dataset.color) : state.colors.add(c.dataset.color); render(); }
});
const priceInput = () => { clearTimeout(t); t = setTimeout(() => { state.min = $('pmin').value.replace(/\D/g, ''); state.max = $('pmax').value.replace(/\D/g, ''); render(); }, 300); };
$('pmin').addEventListener('input', priceInput);
$('pmax').addEventListener('input', priceInput);
function reset(all) {
  state.sizes.clear(); state.colors.clear(); state.min = ''; state.max = ''; state.stock = false;
  $('pmin').value = ''; $('pmax').value = '';
  if (all) { state.q = ''; $('q').value = ''; state.category = ''; }
  render();
}
$('reset').addEventListener('click', () => reset(false));
$('reset2').addEventListener('click', () => reset(true));

render();
