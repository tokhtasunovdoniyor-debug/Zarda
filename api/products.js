// GET /api/products — products synced from the Telegram channel (the hand-made ones are in data/products.js).
// Cached briefly at the edge, so a new post shows up on the site within about a minute.
import { storeReady, loadDynamic } from '../lib/tgstore.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).json({ ok: false });
  if (!storeReady()) {
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(200).json({ ok: true, products: [] });
  }
  try {
    const products = await loadDynamic();
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=20, stale-while-revalidate=120');
    return res.status(200).json({ ok: true, products });
  } catch (e) {
    console.error('products load failed:', e.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: false, products: [] });
  }
}
