// Server-only: stores Telegram channel posts in Upstash Redis (REST API, no npm packages)
// and turns them into shop products with lib/tgparse.js.
//
// Environment (added automatically when the Upstash Redis store is connected in Vercel):
//   KV_REST_API_URL + KV_REST_API_TOKEN   (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
//
// Keys:
//   zarda:posts          hash  postKey -> {key, mid, caption, date, edited}
//   zarda:ph:<postKey>   hash  messageId -> {f: file_id, v?: 1 (video thumbnail)}
//   zarda:hidden         set   product ids hidden with /hide
// postKey = "g<media_group_id>" for albums, "m<message_id>" for single posts.
import { parsePost, COLOR_HEX, PHOTO_COLOR } from './tgparse.js';

export const CHANNEL = 'www_zara_shop_uz';
// Posts up to this message are already in data/products.js (entered by hand); only newer posts sync.
export const SYNC_FROM_MESSAGE_ID = 763;
const NEW_DAYS = 30;

const env = (a, b) => process.env[a] || process.env[b] || '';
const RURL = () => env('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL').replace(/\/$/, '');
const RTOKEN = () => env('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN');
export const storeReady = () => !!(RURL() && RTOKEN());

/** Runs Redis commands in one pipeline request; returns their results in order. */
export async function redis(commands) {
  if (!commands.length) return [];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(`${RURL()}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${RTOKEN()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(`redis http ${r.status}`);
    const out = await r.json();
    return out.map((x) => { if (x.error) throw new Error(`redis: ${x.error}`); return x.result; });
  } finally { clearTimeout(timer); }
}

const pairs = (arr) => { const o = {}; for (let i = 0; i + 1 < (arr || []).length; i += 2) o[arr[i]] = arr[i + 1]; return o; };
const json = (s) => { try { return JSON.parse(s); } catch { return null; } };

export const postKey = (msg) => (msg.media_group_id ? `g${msg.media_group_id}` : `m${msg.message_id}`);

/** Saves one channel_post / edited_channel_post. Returns what was stored. */
export async function savePost(msg) {
  const key = postKey(msg);
  const caption = String(msg.caption ?? msg.text ?? '');
  let media = null;
  if (Array.isArray(msg.photo) && msg.photo.length) media = { f: msg.photo[msg.photo.length - 1].file_id };
  else if (msg.video?.thumbnail || msg.video?.thumb) media = { f: (msg.video.thumbnail || msg.video.thumb).file_id, v: 1 };
  else if (msg.animation?.thumbnail) media = { f: msg.animation.thumbnail.file_id, v: 1 };
  else if (msg.document?.mime_type?.startsWith('image/')) media = { f: msg.document.file_id };
  const cmds = [];
  if (media) cmds.push(['HSET', `zarda:ph:${key}`, String(msg.message_id), JSON.stringify(media)]);
  if (caption.trim()) cmds.push(['HSET', 'zarda:posts', key, JSON.stringify({ key, mid: msg.message_id, caption, date: msg.date || 0, edited: msg.edit_date || 0 })]);
  await redis(cmds);
  return { key, media: !!media, caption: !!caption.trim() };
}

export async function getMedia(key, mid) {
  const [v] = await redis([['HGET', `zarda:ph:${key}`, String(mid)]]);
  return json(v);
}

export async function setHidden(ids, hidden) {
  if (!ids.length) return;
  await redis([[hidden ? 'SADD' : 'SREM', 'zarda:hidden', ...ids]]);
}

/** All products built from synced posts, newest first. */
export async function loadDynamic({ now = Date.now() } = {}) {
  const [postsRaw, hiddenRaw] = await redis([['HGETALL', 'zarda:posts'], ['SMEMBERS', 'zarda:hidden']]);
  const posts = Object.values(pairs(postsRaw)).map(json).filter((p) => p && p.mid >= SYNC_FROM_MESSAGE_ID)
    .sort((a, b) => b.date - a.date || b.mid - a.mid);
  const hidden = new Set(hiddenRaw || []);
  const media = await redis(posts.map((p) => ['HGETALL', `zarda:ph:${p.key}`]));
  const out = [];
  posts.forEach((p, i) => {
    const photos = Object.keys(pairs(media[i])).map(Number).sort((a, b) => a - b);
    if (!photos.length) return; // a product needs at least one picture
    const images = photos.map((m) => `/api/photo?k=${encodeURIComponent(p.key)}&m=${m}`);
    const items = parsePost(p.caption);
    items.forEach((it) => {
      const id = items.length > 1 ? `tg${p.mid}-${it.n}` : `tg${p.mid}`;
      out.push({
        id,
        name: it.name,
        category: it.category,
        price: it.price,
        description: it.description,
        details: [],
        images,
        colors: it.colors.map((c) => ({ name: c, hex: COLOR_HEX[c] || COLOR_HEX[PHOTO_COLOR] })),
        stock: Object.fromEntries(it.sizes.map((s) => [s, 10])),
        available: !hidden.has(id),
        preorder: true,
        featured: now - p.date * 1000 < 14 * 86400_000, // fresh posts lead the default catalog order
        bestseller: false,
        isNew: now - p.date * 1000 < NEW_DAYS * 86400_000,
        source: 'telegram',
        post: `https://t.me/${CHANNEL}/${p.mid}`,
      });
    });
  });
  return out;
}

// Webhook secret derived from the bot token, so no extra secret has to be configured.
export async function webhookSecret(token) {
  const data = new TextEncoder().encode(`zarda-webhook:${token}`);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 48);
}

export async function tg(token, method, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}), signal: ctrl.signal,
    });
    return await r.json().catch(() => ({ ok: false }));
  } catch (e) {
    return { ok: false, description: e.name === 'AbortError' ? 'timeout' : 'network error' };
  } finally { clearTimeout(timer); }
}
