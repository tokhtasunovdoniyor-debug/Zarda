// POST /api/telegram — Telegram webhook for the order bot.
// • New / edited posts in the channel → stored, they appear on the site as products (see lib/tgstore.js).
// • Commands from the order chat (TELEGRAM_CHAT_ID) manage synced products:
//     /list (/список)          last synced products and their ids
//     /hide 812 (/скрыть)      hide all products of post 812 (or a single id like tg812-2)
//     /show 812 (/показать)    show them again
//     /ig                      Instagram autopost status;  /ig 812 — post 812 to Instagram now;
//     /ig off | /ig on         pause / resume Instagram autopost (see lib/instagram.js)
// The request must carry the secret header set by /api/tg-setup.
import { CHANNEL, SYNC_FROM_MESSAGE_ID, storeReady, savePost, loadDynamic, setHidden, webhookSecret, tg, redis } from '../lib/tgstore.js';
import { igReady, igConfigured, queueInstagram, queueByMessage, processInstagramQueue, chatNotifier, afterResponse, resultText, IG_DELAY_MS } from '../lib/instagram.js';

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
    + '/list — последние товары и их номера\n/hide 812 — скрыть товары поста 812 (или номер вида tg812-2)\n/show 812 — снова показать\n\n'
    + 'Instagram: новые посты с ценой и фото публикуются сами (без цен).\n/ig — статус\n/ig 812 — отправить пост 812 в Instagram сейчас\n/ig off — пауза, /ig on — включить';
  if (['/start', '/help', '/помощь'].includes(cmd)) return reply(help);
  if (cmd === '/ig' || cmd === '/инста') return handleInstagram(token, reply, rest);
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

async function handleInstagram(token, reply, args) {
  if (!igConfigured()) return reply('Instagram ещё не подключён: в Vercel нужно добавить IG_ACCESS_TOKEN. Статус: https://zarda.shop/api/ig-setup');
  if (!storeReady()) return reply('База товаров ещё не подключена.');
  const a = (args[0] || '').toLowerCase();
  if (a === 'off' || a === 'стоп') { await redis([['SET', 'zarda:ig:off', '1']]); return reply('Автопубликация в Instagram на паузе. Включить: /ig on'); }
  if (a === 'on' || a === 'старт') { await redis([['DEL', 'zarda:ig:off']]); return reply('Автопубликация в Instagram включена.'); }
  const num = a.replace(/^https?:\/\/t\.me\/[^/]+\//, '');
  if (/^\d+$/.test(num)) {
    const again = /^(again|заново)$/i.test(args[1] || '');
    const key = await queueByMessage(num, { force: again });
    if (!key) return reply(`Пост ${num} не найден среди постов канала с текстом (синхронизируются посты начиная с ${SYNC_FROM_MESSAGE_ID}).`);
    const [done] = await redis([['HGET', 'zarda:ig:done', key]]);
    const prev = done ? JSON.parse(done) : null;
    if (prev?.ok && !again) { await redis([['ZREM', 'zarda:ig:queue', key]]); return reply(`Пост ${num} уже есть в Instagram${prev.permalink ? `: ${prev.permalink}` : ''}. Опубликовать ещё раз: /ig ${num} заново`); }
    if (prev && !again) await redis([['HDEL', 'zarda:ig:done', key]]);
    await reply(`Отправляю пост ${num} в Instagram…`);
    const results = await processInstagramQueue();
    const r = results.find((x) => x.key === key);
    return reply(r ? resultText(r) : 'Пост уже отправляется — результат придёт сюда.');
  }
  const [off, queued, doneRaw] = await redis([['GET', 'zarda:ig:off'], ['ZCARD', 'zarda:ig:queue'], ['HGETALL', 'zarda:ig:done']]);
  const done = [];
  for (let i = 0; i + 1 < (doneRaw || []).length; i += 2) { try { done.push(JSON.parse(doneRaw[i + 1])); } catch { /* skip */ } }
  const last = done.filter((d) => !d.skip).sort((x, y) => y.at - x.at).slice(0, 5).map(resultText);
  return reply([`Instagram: ${off ? 'на паузе (/ig on — включить)' : 'автопубликация включена'}`, `В очереди: ${queued || 0}`, '', ...(last.length ? ['Последние:', ...last] : ['Пока ничего не отправлялось.'])].join('\n'));
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

  let later = null;
  try {
    const post = update.channel_post || update.edited_channel_post;
    if (post) {
      const fromChannel = String(post.chat?.username || '').toLowerCase() === CHANNEL.toLowerCase()
        || (process.env.TELEGRAM_CHANNEL_ID && String(post.chat?.id) === process.env.TELEGRAM_CHANNEL_ID);
      if (fromChannel && post.message_id >= SYNC_FROM_MESSAGE_ID && storeReady()) {
        const saved = await savePost(post);
        // New posts only (not edits): queue for Instagram, publish once the whole album has arrived.
        if (update.channel_post && igReady() && await queueInstagram(saved.key)) {
          later = async () => { await new Promise((r) => setTimeout(r, IG_DELAY_MS + 1500)); await processInstagramQueue({ notify: chatNotifier(token) }); };
        }
      }
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
  // Instagram runs after the answer to Telegram (Vercel waitUntil); also picks up anything left in the queue.
  if (igReady()) {
    const job = later || (() => processInstagramQueue({ notify: chatNotifier(token) }));
    const pending = afterResponse(job);
    if (pending) await pending; // no waitUntil on this platform: finish before answering
  }
  return res.status(200).json({ ok: true });
}
