// GET /api/ig-setup — status of the Telegram → Instagram autopost (lib/instagram.js). Never shows the token.
//   ?preview=812  — shows the Instagram caption that post 812 would get (nothing is published).
import { redis, storeReady } from '../lib/tgstore.js';
import { igConfigured, igToken, igAccount, buildCaption } from '../lib/instagram.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const out = { ok: false, instagram: 'not connected — add IG_ACCESS_TOKEN in Vercel → Settings → Environment Variables, then redeploy' };
  if (!storeReady()) return res.status(200).json({ ...out, database: 'not connected' });

  const preview = String(req.query?.preview || '');
  if (/^\d{1,9}$/.test(preview)) {
    const [postsRaw] = await redis([['HGETALL', 'zarda:posts']]);
    let post = null;
    for (let i = 0; i + 1 < (postsRaw || []).length; i += 2) {
      try { const p = JSON.parse(postsRaw[i + 1]); if (String(p.mid) === preview) post = p; } catch { /* skip */ }
    }
    if (!post) return res.status(404).json({ ok: false, error: `post ${preview} not found` });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).end(buildCaption(post.caption));
  }

  if (!igConfigured()) return res.status(200).json(out);
  const [off, queued, tokenRaw, doneRaw] = await redis([['GET', 'zarda:ig:off'], ['ZCARD', 'zarda:ig:queue'], ['GET', 'zarda:ig:token'], ['HGETALL', 'zarda:ig:done']]);
  let account;
  try {
    const me = await igAccount(await igToken());
    account = `@${me.username} ✓`;
  } catch (e) {
    account = `error: ${e.message}`;
  }
  const done = [];
  for (let i = 0; i + 1 < (doneRaw || []).length; i += 2) { try { done.push(JSON.parse(doneRaw[i + 1])); } catch { /* skip */ } }
  let refreshed = null;
  try { refreshed = tokenRaw ? new Date(JSON.parse(tokenRaw).at).toISOString().slice(0, 10) : null; } catch { /* skip */ }
  return res.status(200).json({
    ok: account.endsWith('✓') && !off,
    instagram: account,
    autopost: off ? 'paused (/ig on in the order chat)' : 'on',
    queue: queued || 0,
    token_refreshed: refreshed || 'not yet (refreshes itself weekly)',
    last: done.filter((d) => !d.skip).sort((a, b) => b.at - a.at).slice(0, 5)
      .map((d) => ({ post: d.mid, ok: !!d.ok, link: d.permalink || undefined, error: d.error || undefined, at: new Date(d.at).toISOString().slice(0, 16) })),
  });
}
