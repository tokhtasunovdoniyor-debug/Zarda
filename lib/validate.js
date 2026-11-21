// Order validation shared by the checkout form (browser) and api/order.js (server).
// The server is the authority; the browser uses the same rules only to show errors early.
import { STORE, getProduct, sizesOf, stockOf } from '../data/products.js';

export const LIMITS = { name: [2, 80], city: [2, 60], address: [5, 300], comment: [0, 1000], lines: 20 };

// Remove control characters, collapse whitespace, trim.
export function cleanText(v, max = 1000) {
  return String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028-\u202E\uFEFF]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

/** Uzbekistan numbers: +998 XX XXX XX XX. Accepts 9 local digits or 12 digits starting with 998. */
export function normalizePhone(raw) {
  const d = String(raw ?? '').replace(/\D/g, '');
  const local = d.length === 12 && d.startsWith('998') ? d.slice(3) : d.length === 9 ? d : null;
  if (!local || !/^[1-9]\d{8}$/.test(local)) return null;
  return `+998${local}`;
}
export const formatPhone = (p) => p.replace(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/, '+998 $1 $2 $3 $4');

export function validateCustomer(input = {}) {
  const errors = {};
  const v = {
    name: cleanText(input.name, LIMITS.name[1] + 20),
    phone: normalizePhone(input.phone),
    city: cleanText(input.city, LIMITS.city[1] + 20),
    address: cleanText(input.address, LIMITS.address[1] + 50),
    comment: cleanText(input.comment, LIMITS.comment[1] + 50),
  };
  if (v.name.length < LIMITS.name[0] || v.name.length > LIMITS.name[1] || !/\p{L}/u.test(v.name)) errors.name = 'Укажите имя и фамилию';
  if (!v.phone) errors.phone = 'Укажите номер в формате +998 XX XXX XX XX';
  if (v.city.length < LIMITS.city[0] || v.city.length > LIMITS.city[1]) errors.city = 'Укажите город';
  if (v.address.length < LIMITS.address[0] || v.address.length > LIMITS.address[1]) errors.address = 'Укажите адрес доставки (улица, дом, квартира)';
  if (v.comment.length > LIMITS.comment[1]) errors.comment = `Не более ${LIMITS.comment[1]} символов`;
  return { ok: Object.keys(errors).length === 0, errors, value: v };
}

/**
 * Validates cart lines against the catalog and computes prices from trusted data.
 * Input lines: { id, size, color?, qty }. Client-sent prices/names are ignored.
 */
export function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) return { ok: false, error: 'Корзина пуста' };
  if (items.length > LIMITS.lines) return { ok: false, error: 'Слишком много позиций в заказе' };
  const merged = new Map();
  for (const raw of items) {
    const p = getProduct(String(raw?.id ?? ''));
    if (!p) return { ok: false, error: 'Один из товаров больше не продаётся. Обновите корзину.' };
    if (p.available === false) return { ok: false, error: `«${p.name}» сейчас недоступен` };
    const size = String(raw?.size ?? '');
    if (!sizesOf(p).includes(size)) return { ok: false, error: `Выберите размер для «${p.name}»` };
    const color = raw?.color == null || raw.color === '' ? p.colors[0]?.name : String(raw.color);
    if (!p.colors.some((c) => c.name === color)) return { ok: false, error: `Цвет недоступен для «${p.name}»` };
    const qty = Number(raw?.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > STORE.maxQtyPerItem) return { ok: false, error: `Некорректное количество для «${p.name}»` };
    const key = `${p.id}|${size}|${color}`;
    const prev = merged.get(key);
    merged.set(key, { product: p, size, color, qty: (prev?.qty || 0) + qty });
  }
  const lines = [];
  for (const l of merged.values()) {
    const stock = stockOf(l.product, l.size);
    if (l.qty > stock) return { ok: false, error: stock > 0 ? `«${l.product.name}», размер ${l.size}: в наличии только ${stock} шт.` : `«${l.product.name}», размер ${l.size}: нет в наличии` };
    lines.push({ id: l.product.id, name: l.product.name, size: l.size, color: l.color, qty: l.qty, price: l.product.price, total: l.product.price * l.qty, sample: !!l.product.sample });
  }
  const total = lines.reduce((s, l) => s + l.total, 0);
  return { ok: true, lines, total };
}
