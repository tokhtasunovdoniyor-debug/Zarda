// GET /api/tg-setup — connects the order bot to the channel sync (sets its webhook) and reports status.
// Safe to open many times: it only points the bot at this site's own /api/telegram.
// If the bot already uses another webhook, nothing is changed unless ?force=1 is added.
import { CHANNEL, storeReady, webhookSecret, tg } from '../lib/tgstore.js';

const SITE = 'https://zarda.shop';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return res.status(503).json({ ok: false, error: 'TELEGRAM_BOT_TOKEN is not set' });
  const url = `${SITE}/api/telegram`;
  const me = await tg(token, 'getMe');
  const info = await tg(token, 'getWebhookInfo');
  const current = info.result?.url || '';
  let webhook = 'unchanged';
  if (current && current !== url && req.query?.force !== '1') {
    webhook = `bot already uses another webhook (${new URL(current).host}); add ?force=1 to replace it`;
  } else {
    const set = await tg(token, 'setWebhook', {
      url,
      secret_token: await webhookSecret(token),
      allowed_updates: ['channel_post', 'edited_channel_post', 'message'],
      max_connections: 10,
    });
    webhook = set.ok ? 'connected' : `failed: ${set.description || 'unknown'}`;
  }
  let channel = 'unknown';
  if (me.ok) {
    const member = await tg(token, 'getChatMember', { chat_id: `@${CHANNEL}`, user_id: me.result.id });
    channel = member.ok ? member.result.status : (member.description || 'not a member');
  }
  const after = await tg(token, 'getWebhookInfo');
  return res.status(200).json({
    ok: webhook === 'connected' && channel === 'administrator' && storeReady(),
    bot: me.ok ? `@${me.result.username}` : 'token error',
    webhook,
    channel: `@${CHANNEL}: ${channel === 'administrator' ? 'bot is admin ✓' : `bot is ${channel} — add it as an administrator of the channel`}`,
    database: storeReady() ? 'connected ✓' : 'not connected — create an Upstash Redis store in Vercel → Storage',
    pending_updates: after.result?.pending_update_count ?? null,
    last_error: after.result?.last_error_message || null,
  });
}
