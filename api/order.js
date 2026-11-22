// POST /api/order — validates an order, recalculates the total from data/products.js,
// assigns an order ID and sends it to Telegram.
//
// Required environment variables (Vercel → Project → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN  — from @BotFather. Never put it in browser code or Git.
//   TELEGRAM_CHAT_ID    — chat that receives orders.
import { STORE, loadDynamicProducts } from '../data/products.js';
import { validateCustomer, validateItems, cleanText, formatPhone } from '../lib/validate.js';

const MAX_BODY = 20_000;
const RATE = { windowMs: 10 * 60_000, max: 5 };
const DEDUPE_MS = 15 * 60_000;

// Best-effort, per-instance memory. Serverless instances do not share it, so this limits
// bursts and double-clicks but is not a hard guarantee (see README for a shared store).
const hits = new Map();   // ip -> [timestamps]
const seen = new Map();   // idempotency key -> { orderId, at }

function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || String(req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown');
}

function rateLimited(ip, now) {
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  if (list.length >= RATE.max) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < RATE.windowMs)) hits.delete(k);
  return false;
}

function newOrderId(now) {
  const d = new Date(now + 5 * 3600_000); // Asia/Tashkent (UTC+5, no DST)
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, '');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(5)); // Web Crypto, Node 20+
  const rnd = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `ZR-${ymd}-${rnd}`;
}

const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n).replace(/ /g, ' ');

function buildMessage(orderId, customer, lines, total, now, lang = 'ru') {
  const when = new Date(now).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', dateStyle: 'short', timeStyle: 'short' });
  const demo = STORE.demo || lines.some((l) => l.sample);
  const items = lines.map((l, i) => `${i + 1}. ${l.name}\n   Арт. ${l.id} · Размер ${l.size} · ${l.color}\n   ${l.qty} × ${fmt(l.price)} = ${fmt(l.total)} сум${/^tg\d+/.test(l.id) ? `\n   Пост: https://t.me/${STORE.channel}/${l.id.slice(2).split('-')[0]}` : ''}`).join('\n');
  const text = [
    `${demo ? '[DEMO] ' : ''}🛍 ZARDA.SHOP — НОВЫЙ ЗАКАЗ`,
    `№ ${orderId}`,
    `🕒 ${when} (Ташкент)`,
    '',
    items,
    '',
    `ИТОГО: ${fmt(total)} сум (без доставки)`,
    '',
    `👤 ${customer.name}`,
    `📞 ${formatPhone(customer.phone)}`,
    `🏙 ${customer.city}`,
    `📍 ${customer.address}`,
    `💬 ${customer.comment || '—'}`,
    `🌐 Язык сайта: ${lang === 'uz' ? 'узбекский' : 'русский'}`,
    '',
    'Оплата: после подтверждения менеджером',
  ].join('\n');
  return text.length > 4000 ? text.slice(0, 3990) + '\n…' : text;
}

async function sendTelegram(token, chatId, text) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    if (!data.ok) console.error('Telegram sendMessage failed:', r.status, data.description || 'no description');
    return !!data.ok;
  } catch (e) {
    console.error('Telegram request error:', e.name === 'AbortError' ? 'timeout' : e.message);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Reject cross-site browser submissions.
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin) {
    let oh = '';
    try { oh = new URL(origin).host; } catch { /* invalid */ }
    if (oh !== host) return res.status(403).json({ ok: false, error: 'Forbidden' });
  }

  if (!String(req.headers['content-type'] || '').includes('application/json')) {
    return res.status(415).json({ ok: false, error: 'Expected JSON' });
  }

  let body = req.body;
  try { if (typeof body === 'string') body = JSON.parse(body); } catch { body = null; }
  if (!body || typeof body !== 'object' || JSON.stringify(body).length > MAX_BODY) {
    return res.status(400).json({ ok: false, error: 'Некорректный запрос' });
  }

  // Honeypot: real customers never fill this hidden field.
  if (body.website) return res.status(200).json({ ok: true, orderId: newOrderId(Date.now()) });

  const now = Date.now();
  const ip = clientIp(req);

  // Idempotency: the same checkout attempt returns the same order ID without resending.
  const key = cleanText(body.idempotencyKey, 64);
  for (const [k, v] of seen) if (now - v.at > DEDUPE_MS) seen.delete(k);
  if (key && seen.has(key)) return res.status(200).json({ ok: true, orderId: seen.get(key).orderId, duplicate: true });

  // Backward compatibility: the previous storefront sent only `address` (city inside it).
  const rawCustomer = { ...(body.customer || {}) };
  if (!rawCustomer.city && rawCustomer.address) rawCustomer.city = 'Не указан';

  const c = validateCustomer(rawCustomer);
  if (!c.ok) return res.status(422).json({ ok: false, error: 'Проверьте данные покупателя', fields: c.errors });

  await loadDynamicProducts(); // include products synced from the Telegram channel
  const items = validateItems(body.items);
  if (!items.ok) return res.status(422).json({ ok: false, error: items.error });

  // Counted only for valid orders, so a customer correcting typos is not locked out.
  if (rateLimited(ip, now)) {
    res.setHeader('Retry-After', String(RATE.windowMs / 1000));
    return res.status(429).json({ ok: false, error: 'Слишком много заказов подряд. Попробуйте позже или напишите нам в Telegram.' });
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Order rejected: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured');
    return res.status(503).json({ ok: false, error: 'Приём заказов временно недоступен. Напишите нам в Telegram.' });
  }

  const orderId = newOrderId(now);
  const sent = await sendTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, buildMessage(orderId, c.value, items.lines, items.total, now, body.lang === 'uz' ? 'uz' : 'ru'));
  if (!sent) return res.status(502).json({ ok: false, error: 'Не удалось отправить заказ. Попробуйте ещё раз или напишите нам в Telegram.' });

  if (key) seen.set(key, { orderId, at: now });
  return res.status(200).json({ ok: true, orderId, total: items.total, currency: 'UZS' });
}
