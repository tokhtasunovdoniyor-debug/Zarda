ZARDA.SHOP — deployment notes

Files:
- index.html: storefront demo
- api/order.js: Vercel serverless endpoint for Telegram order notifications

Deploy:
1. Upload this folder to a GitHub repository and import it into Vercel.
2. In Vercel Project Settings > Environment Variables add:
   TELEGRAM_BOT_TOKEN = token from BotFather
   TELEGRAM_CHAT_ID = 8422077609
3. Redeploy.
4. Open the deployed URL, place a test order, and verify the Telegram notification.

IMPORTANT:
- Never put the Telegram bot token in index.html or send it in chat.
- Open @Zarda_shop_bot and press Start from the Telegram account that owns chat ID 8422077609.
- Product images and prices are placeholders. Replace them with actual stock and prices before accepting real orders.
- This prototype does not process or verify card payments. It records the selected payment method as bank transfer; payment should be confirmed manually before fulfillment.
- Add spam protection, persistent order storage, privacy/returns/delivery policies, and validate prices server-side before production use.
