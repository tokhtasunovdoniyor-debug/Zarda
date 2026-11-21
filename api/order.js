// Vercel serverless function. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
// in Vercel Project Settings -> Environment Variables. Never put the token in browser code.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return res.status(503).json({ error: 'Telegram is not configured' });
  const order = req.body;
  if (!order?.customer?.name || !order?.customer?.phone || !order?.customer?.address || !Array.isArray(order.items) || !order.items.length) return res.status(400).json({ error: 'Invalid order' });
  const lines = order.items.map(i => `• ${i.name} / ${i.size} × ${i.qty} — ${(i.price*i.qty).toLocaleString('ru-RU')} UZS`).join('\n');
  const msg = `🛍 ZARDA.SHOP — НОВЫЙ ЗАКАЗ\n\n${lines}\n\nИТОГО: ${Number(order.total).toLocaleString('ru-RU')} UZS\n\n👤 ${order.customer.name}\n📞 ${order.customer.phone}\n📍 ${order.customer.address}\n💬 ${order.customer.comment || '—'}\n\nОплата: перевод на карту`;
  const tg = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg }) });
  const data = await tg.json();
  if (!data.ok) return res.status(502).json({ error: 'Telegram delivery failed' });
  return res.status(200).json({ ok: true });
}
