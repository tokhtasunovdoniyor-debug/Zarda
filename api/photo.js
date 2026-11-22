// GET /api/photo?k=<postKey>&m=<messageId> — serves a channel photo.
// The bot token never reaches the browser: the file is fetched from Telegram here and cached at the edge.
import { storeReady, getMedia, tg } from '../lib/tgstore.js';

export default async function handler(req, res) {
  const k = String(req.query?.k || '');
  const m = String(req.query?.m || '');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!/^[gm][\w-]{1,40}$/.test(k) || !/^\d{1,12}$/.test(m)) return res.status(400).end('bad request');
  if (!token || !storeReady()) return res.status(503).end('not configured');
  try {
    const media = await getMedia(k, m);
    if (!media?.f) return res.status(404).end('not found');
    const info = await tg(token, 'getFile', { file_id: media.f });
    if (!info.ok || !info.result?.file_path) return res.status(404).end('not found');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(`https://api.telegram.org/file/bot${token}/${info.result.file_path}`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) return res.status(502).end('upstream error');
    const buf = Buffer.from(await r.arrayBuffer());
    const ext = info.result.file_path.split('.').pop().toLowerCase();
    res.setHeader('Content-Type', ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable');
    return res.status(200).end(buf);
  } catch (e) {
    console.error('photo proxy error:', e.message);
    return res.status(502).end('error');
  }
}
