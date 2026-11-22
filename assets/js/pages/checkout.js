import { STORE } from '/data/products.js';
import { initLayout, openCart } from '/assets/js/layout.js';
import { esc, money, imgTag, cartLines, cartTotal, getCart, clearCart } from '/assets/js/store.js';
import { validateCustomer, normalizePhone, formatPhone } from '/lib/validate.js';
import { t, lang, pName, colorName } from '/assets/js/i18n.js';

// City names shown in Uzbek; the value sent to the manager stays Russian.
const UZ_CITY = { 'Ташкент': 'Toshkent', 'Ташкентская область': 'Toshkent viloyati', 'Самарканд': 'Samarqand', 'Бухара': 'Buxoro', 'Андижан': 'Andijon', 'Фергана': 'Fargʻona', 'Наманган': 'Namangan', 'Нукус': 'Nukus', 'Карши': 'Qarshi', 'Навои': 'Navoiy', 'Джизак': 'Jizzax', 'Гулистан': 'Guliston', 'Термез': 'Termiz', 'Ургенч': 'Urganch' };
const cityLabel = (c) => (lang === 'uz' && UZ_CITY[c]) || c;
// Field errors from lib/validate.js are Russian; show Uzbek equivalents when needed.
const UZ_FIELD = { name: 'errName', phone: 'errPhone', city: 'errCity', address: 'errAddress', comment: 'errComment' };
const fieldMsg = (k, msg) => (lang === 'uz' && msg ? t(UZ_FIELD[k]) : msg);
function apiMessage(status, data) {
  if (lang !== 'uz') return data.error || (status === 404 ? t('serverDown') : t('sendFail'));
  if (status === 422) return data.fields ? t('apiCustomer') : t('apiItems');
  return { 400: t('apiBad'), 429: t('apiRate'), 503: t('apiConfig'), 502: t('apiTelegram'), 404: t('serverDown') }[status] || t('sendFail');
}

initLayout();

const $ = (id) => document.getElementById(id);
const OTHER = '__other';
const DRAFT_KEY = 'zarda_checkout_draft';
const KEY_KEY = 'zarda_checkout_key';

$('citySel').innerHTML = `<option value="">${t('choose')}</option>` + STORE.cities.map((c) => `<option value="${esc(c)}">${esc(cityLabel(c))}</option>`).join('') + `<option value="${OTHER}">${t('otherCity')}</option>`;
$('tgLink').href = `https://t.me/${STORE.telegram}`;

const ss = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
  del(k) { try { sessionStorage.removeItem(k); } catch { /* ignore */ } },
};

function renderSummary() {
  const lines = cartLines();
  const empty = lines.length === 0 && $('success').hidden;
  $('emptyState').hidden = !empty;
  $('checkout').hidden = empty || !$('success').hidden;
  if (!lines.length) return;
  $('sumLines').innerHTML = lines.map((l) => `
    <div class="line">
      <div class="line-img">${imgTag(l.product.images[0], { alt: pName(l.product), w: 160, sizes: '64px' })}</div>
      <div class="line-info">
        <span class="line-name">${esc(pName(l.product))}</span>
        <div class="muted">${esc(t('sizeColor', { s: l.size, c: colorName(l.color) }))}</div>
        <div class="line-row" style="margin:6px 0 0"><span class="muted">${l.qty} × ${money(l.price)}</span><span>${money(l.lineTotal)}</span></div>
      </div>
    </div>`).join('');
  $('sumSubtotal').textContent = money(cartTotal());
  $('sumTotal').textContent = money(cartTotal());
}
document.addEventListener('cart:change', renderSummary);
$('editCart').addEventListener('click', (e) => { e.preventDefault(); openCart(); });

// ---- draft persistence (so a refresh doesn't lose typed data) ----
const fields = ['name', 'phone', 'citySel', 'cityOther', 'address', 'comment'];
try { const d = JSON.parse(ss.get(DRAFT_KEY) || '{}'); fields.forEach((f) => { if (d[f]) $(f).value = d[f]; }); } catch { /* ignore */ }
$('cityOtherWrap').hidden = $('citySel').value !== OTHER;
$('orderForm').addEventListener('input', () => ss.set(DRAFT_KEY, JSON.stringify(Object.fromEntries(fields.map((f) => [f, $(f).value])))));
$('citySel').addEventListener('change', () => { $('cityOtherWrap').hidden = $('citySel').value !== OTHER; if ($('citySel').value === OTHER) $('cityOther').focus(); });
$('phone').addEventListener('focus', () => { if (!$('phone').value) $('phone').value = '+998 '; });
$('phone').addEventListener('blur', () => { const p = normalizePhone($('phone').value); if (p) $('phone').value = formatPhone(p); else if ($('phone').value.trim() === '+998') $('phone').value = ''; });

function collect() {
  const city = $('citySel').value === OTHER ? $('cityOther').value : $('citySel').value;
  return { name: $('name').value, phone: $('phone').value, city, address: $('address').value, comment: $('comment').value };
}

function showErrors(errors) {
  const map = { name: 'name', phone: 'phone', city: $('citySel').value === OTHER ? 'cityOther' : 'citySel', address: 'address', comment: 'comment' };
  ['name', 'phone', 'city', 'address', 'comment'].forEach((k) => {
    const input = $(map[k]);
    const wrap = input.closest('.field');
    const errEl = $(`${k}-err`);
    const msg = fieldMsg(k, errors[k]);
    // City errors render under the dropdown even when "other" is used.
    const errWrap = k === 'city' ? $('citySel').closest('.field') : wrap;
    errWrap.classList.toggle('invalid', !!msg); wrap.classList.toggle('invalid', !!msg);
    if (errEl) errEl.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (errEl) input.setAttribute('aria-describedby', `${k}-err`);
  });
  const first = Object.keys(errors)[0];
  if (first) $(map[first]).focus();
}

// One key per checkout attempt; reused on retry so a double-submit can't create two orders.
function idemKey() {
  let k = ss.get(KEY_KEY);
  if (!k) { k = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`); ss.set(KEY_KEY, k); }
  return k;
}

let submitting = false;
$('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (submitting) return;
  $('formError').hidden = true;
  const v = validateCustomer(collect());
  showErrors(v.errors);
  if (!v.ok) return;
  if (!getCart().length) { renderSummary(); return; }

  submitting = true;
  const btn = $('submitBtn');
  btn.disabled = true; btn.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${t('sending')}`;
  const total = cartTotal();
  try {
    const r = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotencyKey: idemKey(),
        website: $('website').value,
        customer: { ...collect(), phone: v.value.phone },
        items: getCart().map(({ id, size, color, qty }) => ({ id, size, color, qty })),
        clientTotal: total,
        currency: 'UZS',
        lang,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.ok) {
      if (data.fields) showErrors(data.fields);
      throw new Error(apiMessage(r.status, data));
    }
    // Show success first so the cart-cleared event doesn't render the "empty cart" state.
    $('success').hidden = false;
    $('checkout').hidden = true;
    $('emptyState').hidden = true;
    document.querySelector('.page-head').hidden = true;
    clearCart();
    ss.del(KEY_KEY); ss.del(DRAFT_KEY);
    $('orderId').textContent = t('orderNo', { id: data.orderId });
    $('successTotal').textContent = t('successTotal', { sum: money(data.total ?? total) });
    document.title = `${t('doneTitle')} — ZARDA`;
    window.scrollTo({ top: 0 });
    $('success').focus();
  } catch (err) {
    $('formError').innerHTML = `${esc(err.message)} ${t('ifRepeat')} <a class="link" href="https://t.me/${esc(STORE.telegram)}" target="_blank" rel="noopener">@${esc(STORE.telegram)}</a>`;
    $('formError').hidden = false;
  } finally {
    submitting = false;
    btn.disabled = false; btn.textContent = t('submit');
  }
});

renderSummary();
