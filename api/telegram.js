// POST /api/telegram — Telegram webhook for the order bot.
// • New / edited posts in the channel → stored, they appear on the site as products (see lib/tgstore.js).
// • Commands from the order chat (TELEGRAM_CHAT_ID) manage synced products:
//     /list (/список)          last synced products and their ids
//     /hide 812 (/скрыть)      hide all products of post 812 (or a single id like tg812-2)
//     /show 812 (/показать)    show them again
// The request must carry the secret header set by /api/tg-setup.
import { CHANNEL, SYNC_FROM_MESSAGE_ID, storeReady, savePost, loadDynamic, setHidden, webhookSecret, tg } from '../lib/tgstore.js';

const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n).replace(/ /g, ' ');

function idsFor(arg, products) {
  const a = String(arg || '').trim().replace(/^https?:\/\/t\.me\/[^/]+\//, '');
  if (!a) return [];
  if (/^\d+$/.test(a)) return products.filter((p) => p.id === `tg${a}` || p.id.startsWith(`tg${a}-`)).map((p) => p.id);
  return products.filter((p) => p.id === a.toLowerCase()).map((p) => p.id);
}

async function handleCommand(token, chatId, text) {
  const [cmdRaw, ...rest] = text.trim().split(/\s+/);
  const cmd = cmdRaw.toLowerCase().replace(/@\w+$/, '');
  const reply = (t) => tg(token, 'sendMessage', { chat_id: chatId, text: t, disable_web_page_preview: true });
  const help = 'Товары из канала появляются на сайте сами (пост с ценой и фото).\n\n'
    + '/list — последние товары и их номера\n/hide 812 — скрыть товары поста 812 (или номер вида tg812-2)\n/show 812 — снова показать';
  if (['/start', '/help', '/помощь'].includes(cmd)) return reply(help);
  if (!['/list', '/список', '/hide', '/скрыть', '/show', '/показать'].includes(cmd)) return null;
  if (!storeReady()) return reply('База товаров ещё не подключена.');
  const products = await loadDynamic();
  if (cmd === '/list' || cmd === '/список') {
    if (!products.length) return reply('Пока нет товаров из канала.');
    return reply(products.slice(0, 25).map((p) => `${p.id} — ${p.name} — ${fmt(p.price)} сум${p.available ? '' : ' (скрыт)'}`).join('\n'));
  }
  const hide = cmd === '/hide' || cmd === '/скрыть';
  const ids = rest.flatMap((a) => idsFor(a, products));
  if (!ids.length) return reply(`Не нашёл товары по «${rest.join(' ') || '…'}». Напишите номер поста, например: ${hide ? '/hide' : '/show'} 812`);
  await setHidden(ids, hide);
  return reply(`${hide ? 'Скрыто' : 'Снова показано'} на сайте: ${ids.join(', ')}`);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return res.status(503).json({ ok: false });
  if (req.headers['x-telegram-bot-api-secret-token'] !== await webhookSecret(token)) return res.status(401).json({ ok: false });

  let update = req.body;
  try { if (typeof update === 'string') update = JSON.parse(update); } catch { update = null; }
  if (!update || typeof update !== 'object') return res.status(200).json({ ok: true });

  try {
    const post = update.channel_post || update.edited_channel_post;
    if (post) {
      const fromChannel = String(post.chat?.username || '').toLowerCase() === CHANNEL.toLowerCase()
        || (process.env.TELEGRAM_CHANNEL_ID && String(post.chat?.id) === process.env.TELEGRAM_CHANNEL_ID);
      if (fromChannel && post.message_id >= SYNC_FROM_MESSAGE_ID && storeReady()) await savePost(post);
    }
    const msg = update.message;
    const adminChat = process.env.TELEGRAM_CHAT_ID;
    if (msg?.text?.startsWith('/') && adminChat && String(msg.chat?.id) === String(adminChat)) {
      await handleCommand(token, msg.chat.id, msg.text);
    }
  } catch (e) {
    // Answer 200 anyway so Telegram doesn't retry forever; the error goes to Vercel logs.
    console.error('telegram webhook error:', e.message);
  }
  return res.status(200).json({ ok: true });
}
