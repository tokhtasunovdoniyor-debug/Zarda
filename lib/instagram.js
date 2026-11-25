// Server-only: posts new product posts from the Telegram channel to Instagram (Instagram API with Instagram Login).
//
// How it works
//   api/telegram.js gets a new channel post → queueInstagram(post) puts its key into a Redis queue with a short delay
//   (an album arrives as several updates; every part pushes the delay back) → processInstagramQueue() publishes it:
//   photos → carousel (or one photo), caption = the post's text without prices + «Цены — в Telegram-канале».
//   Only posts that the site turns into products (photo + price line) are sent. Edits are not re-sent.
//
// Environment (Vercel → Settings → Environment Variables):
//   IG_ACCESS_TOKEN   long-lived Instagram user token (instagram_business_basic + instagram_business_content_publish).
//                     The site refreshes it by itself (stored in Redis), so it does not expire while posts keep coming.
//   IG_USER_ID        optional; taken from the token when missing.
// Without IG_ACCESS_TOKEN nothing is queued and nothing is sent.
//
// Redis keys: zarda:ig:queue (zset postKey → due ms), zarda:ig:done (hash postKey → result JSON),
//             zarda:ig:token (refreshed token JSON), zarda:ig:off (pause flag), zarda:ig:lock:<postKey>.
import { CHANNEL, redis, storeReady, tg } from './tgstore.js';
import { parsePost, PRICE_RE, PHOTO_COLOR } from './tgparse.js';

const API = 'https://graph.instagram.com/v23.0';
const SITE = 'https://zarda.shop';
const MANAGER = 'zarda_shop';
export const IG_DELAY_MS = 20_000; // wait for the rest of an album
const REFRESH_AFTER_MS = 7 * 86400_000;

const json = (s) => { try { return JSON.parse(s); } catch { return null; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pairs = (arr) => { const o = {}; for (let i = 0; i + 1 < (arr || []).length; i += 2) o[arr[i]] = arr[i + 1]; return o; };

export const igConfigured = () => !!process.env.IG_ACCESS_TOKEN;
export const igReady = () => igConfigured() && storeReady();

// ---- Instagram Graph API -----------------------------------------------------------
async function ig(path, { method = 'GET', params = {}, token } = {}) {
  const url = new URL(`${API}/${path.replace(/^\//, '')}`);
  const body = new URLSearchParams({ ...params, access_token: token });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = method === 'GET'
      ? await fetch(`${url}?${body}`, { signal: ctrl.signal })
      : await fetch(url, { method, body, signal: ctrl.signal });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || data.error) {
      const e = data.error || {};
      throw new Error(`${e.message || `http ${r.status}`}${e.code ? ` (code ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ''})` : ''}`);
    }
    return data;
  } finally { clearTimeout(timer); }
}

/** Current token: the refreshed one from Redis if newer, else the env one. Refreshes it once a week. */
export async function igToken() {
  const envToken = process.env.IG_ACCESS_TOKEN || '';
  const [raw] = await redis([['GET', 'zarda:ig:token']]);
  let saved = json(raw);
  // A new token in Vercel replaces the stored one.
  if (saved && saved.env !== envToken.slice(-12)) saved = null;
  let token = saved?.t || envToken;
  const age = Date.now() - (saved?.at || 0);
  if (age > REFRESH_AFTER_MS) {
    try {
      const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`);
      const d = await r.json();
      if (d.access_token) {
        token = d.access_token;
        await redis([['SET', 'zarda:ig:token', JSON.stringify({ t: token, at: Date.now(), env: envToken.slice(-12) })]]);
      }
    } catch { /* keep the current token; the error shows up on the next API call */ }
  }
  return token;
}

export async function igAccount(token) {
  return ig('me', { params: { fields: 'user_id,username' }, token });
}

// ---- caption ------------------------------------------------------------------------
const PRICE_LINE = new RegExp(PRICE_RE.source, 'i');
// Lines that must not go to Instagram: prices, cargo, contacts, links.
const DROP = /(цен[аы]|стоимост|карго|\/\s*100\s*г|💰|(?<![а-яё])сум(?![а-яё])|\bso['ʻ’]?m\b|\buzs\b|t\.me\/|@\w|https?:|по поводу заказа|заказы принимает|обращаться)/i;

/** Caption for Instagram: the post's own text without prices + where to see prices and order. Never empty. */
export function buildCaption(postText) {
  const items = parsePost(postText);
  const kept = String(postText || '').replace(/\r/g, '').split('\n')
    .filter((l) => !PRICE_LINE.test(l) && !DROP.test(l))
    .join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const letters = (kept.match(/[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]/g) || []).length;
  let body = kept;
  if (letters < 25 && items.length) {
    // The post had (almost) only a price: write a short factual description from what the parser found.
    body = items.map((it) => {
      const lines = [`${it.name}`];
      if (it.description) lines.push(it.description);
      const colors = it.colors.filter((c) => c !== PHOTO_COLOR);
      if (colors.length) lines.push(`🎨 Цвета: ${colors.join(' / ').toLowerCase()}`);
      if (it.sizes.length) lines.push(`📏 Размеры: ${it.sizes[0]}–${it.sizes[it.sizes.length - 1]}`);
      (it.details || []).forEach((d) => lines.push(`🧵 ${d}`));
      return lines.join('\n');
    }).join('\n\n');
    body += '\n\n🧵 Новая модель в ZARDA — под заказ за 5–7 рабочих дней, доставка по всему Узбекистану.';
  }
  const footer = [
    `💰 Цены — в нашем Telegram-канале: t.me/${CHANNEL}`,
    `✍️ Заказ: @${MANAGER} в Telegram или на сайте ${SITE.replace('https://', '')}`,
    '',
    '#zarda #zardashop #мужскаяодежда #одеждаташкент #ташкент #узбекистан',
  ].join('\n');
  return `${body}\n\n${footer}`.slice(0, 2200);
}

// ---- queue ------------------------------------------------------------------------
/** Called for every new channel post. Returns true when the post was queued. */
export async function queueInstagram(postKey) {
  if (!igReady()) return false;
  const [off, done] = await redis([['GET', 'zarda:ig:off'], ['HEXISTS', 'zarda:ig:done', postKey]]);
  if (off || done) return false;
  await redis([['ZADD', 'zarda:ig:queue', String(Date.now() + IG_DELAY_MS), postKey]]);
  return true;
}

/** Puts a post (by Telegram message number) into the queue right away — used by the /ig command. */
export async function queueByMessage(mid, { force = false } = {}) {
  const [postsRaw] = await redis([['HGETALL', 'zarda:posts']]);
  const post = Object.values(pairs(postsRaw)).map(json).find((p) => p && String(p.mid) === String(mid));
  if (!post) return null;
  const cmds = [['ZADD', 'zarda:ig:queue', '0', post.key]];
  if (force) cmds.push(['HDEL', 'zarda:ig:done', post.key]);
  await redis(cmds);
  return post.key;
}

/** Publishes every queued post whose delay has passed. Safe to call many times at once (per-post lock). */
export async function processInstagramQueue({ notify } = {}) {
  if (!igReady()) return [];
  const due = await redis([['ZRANGEBYSCORE', 'zarda:ig:queue', '0', String(Date.now())]]);
  const results = [];
  for (const key of due[0] || []) {
    const [lock] = await redis([['SET', `zarda:ig:lock:${key}`, '1', 'NX', 'EX', '180']]);
    if (lock !== 'OK') continue;
    let result;
    try {
      const [postRaw, mediaRaw, done] = await redis([['HGET', 'zarda:posts', key], ['HGETALL', `zarda:ph:${key}`], ['HGET', 'zarda:ig:done', key]]);
      if (json(done)?.id) { await redis([['ZREM', 'zarda:ig:queue', key]]); continue; }
      result = await publishPost(json(postRaw), pairs(mediaRaw));
    } catch (e) {
      result = { ok: false, error: e.message };
    }
    await redis([
      ['ZREM', 'zarda:ig:queue', key],
      ['HSET', 'zarda:ig:done', key, JSON.stringify({ ...result, at: Date.now() })],
      ['DEL', `zarda:ig:lock:${key}`],
    ]);
    results.push({ key, ...result });
    if (notify && !result.skip) await notify(result).catch(() => {});
  }
  return results;
}

async function publishPost(post, mediaMap) {
  if (!post?.caption) return { ok: false, skip: true, error: 'no caption' };
  const mid = post.mid;
  if (!parsePost(post.caption).length) return { ok: false, skip: true, mid, error: 'not a product (no price line)' };
  const photos = Object.keys(mediaMap).map(Number).sort((a, b) => a - b)
    .filter((m) => !json(mediaMap[m])?.v) // video covers are too small for Instagram
    .slice(0, 10);
  if (!photos.length) return { ok: false, mid, error: 'только видео — Instagram нужны фото. Добавьте фото в пост или выложите Reels вручную' };

  const token = await igToken();
  const userId = process.env.IG_USER_ID || (await igAccount(token)).user_id;
  // Instagram accepts JPEG with an aspect ratio between 4:5 and 1.91:1. Channel photos are often 3:4,
  // so every photo is fitted to 1080×1350 (4:5) by the wsrv.nl image proxy (free, no key; it only sees public photos).
  const imageUrl = (m) => {
    const src = `zarda.shop/api/photo?k=${encodeURIComponent(post.key)}&m=${m}`;
    return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=1080&h=1350&fit=cover&a=attention&output=jpg&q=90`;
  };
  const caption = buildCaption(post.caption);

  let creation;
  if (photos.length === 1) {
    creation = (await ig(`${userId}/media`, { method: 'POST', params: { image_url: imageUrl(photos[0]), caption }, token })).id;
  } else {
    const children = [];
    for (const m of photos) {
      children.push((await ig(`${userId}/media`, { method: 'POST', params: { image_url: imageUrl(m), is_carousel_item: 'true' }, token })).id);
    }
    creation = (await ig(`${userId}/media`, { method: 'POST', params: { media_type: 'CAROUSEL', children: children.join(','), caption }, token })).id;
  }
  // Wait until Instagram has fetched and processed the images.
  for (let i = 0; i < 12; i++) {
    const s = await ig(creation, { params: { fields: 'status_code' }, token });
    if (s.status_code === 'FINISHED') break;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`container ${s.status_code}`);
    await sleep(2500);
  }
  const published = await ig(`${userId}/media_publish`, { method: 'POST', params: { creation_id: creation }, token });
  let permalink = '';
  try { permalink = (await ig(published.id, { params: { fields: 'permalink' }, token })).permalink || ''; } catch { /* optional */ }
  return { ok: true, mid, id: published.id, permalink, photos: photos.length };
}

/** Message for the order chat about one result. */
export function resultText(r) {
  const post = r.mid ? `Пост ${r.mid}` : 'Пост';
  return r.ok
    ? `📸 ${post} опубликован в Instagram (${r.photos} фото)${r.permalink ? `: ${r.permalink}` : ''}`
    : `⚠️ ${post} не отправлен в Instagram: ${r.error}\nПовторить: /ig ${r.mid || 'номер_поста'}`;
}

/** Sends a short report to the order chat (TELEGRAM_CHAT_ID). */
export function chatNotifier(token) {
  const chat = process.env.TELEGRAM_CHAT_ID;
  return async (r) => { if (chat) await tg(token, 'sendMessage', { chat_id: chat, text: resultText(r), disable_web_page_preview: true }); };
}

/** Runs fn after the response is sent, when the platform allows it (Vercel waitUntil); otherwise returns its promise. */
export function afterResponse(fn) {
  const ctx = globalThis[Symbol.for('@vercel/request-context')]?.get?.();
  const p = Promise.resolve().then(fn).catch((e) => console.error('instagram:', e.message));
  if (ctx?.waitUntil) { ctx.waitUntil(p); return null; }
  return p;
}
