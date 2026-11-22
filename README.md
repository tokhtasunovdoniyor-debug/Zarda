# ZARDA.SHOP

Online clothing store for Uzbekistan. Static storefront + one Vercel serverless function that sends orders to Telegram.
No build step, no npm dependencies, no database.

## Structure

```
index.html            Homepage
catalog.html          Catalog: categories, search, sort, size/color/price filters
product.html          Product page (?id=zr-001): gallery, color, size, quantity
checkout.html         Checkout form + order summary
about / delivery / payment / returns / contacts / privacy .html   Info pages
404.html              Not-found page
data/products.js      ← THE PRODUCT CATALOG (edit this file to manage products)
lib/validate.js       Order validation shared by browser and server
api/order.js          POST /api/order → validates, recalculates total, sends to Telegram
api/telegram.js       Telegram webhook: channel posts → products, /hide /show /list
api/products.js       Products synced from the channel (JSON)
api/photo.js          Channel photos (proxied, token stays on the server)
api/tg-setup.js       One-click webhook setup + status
lib/tgparse.js        Post text → products (rules, no AI)
lib/tgstore.js        Redis storage for synced posts
assets/css/styles.css Design system (tokens at the top: colours, fonts, spacing)
assets/js/store.js    Cart (localStorage), money/image helpers
assets/js/layout.js   Header, mobile menu, cart drawer, footer, product cards, overlay/scroll-lock manager
assets/js/picker.js   Colour/size/quantity + add-to-cart (shared by product page and quick view)
assets/js/quickview.js Quick product preview (bottom sheet on phones, dialog on desktop)
assets/js/pages/      Per-page scripts
assets/js/i18n.js     Interface texts RU/UZ, language switcher
assets/js/lang.js     Early language pick (runs in <head>)
data/products.uz.js   Uzbek product texts
vercel.json           Clean URLs, security headers (CSP, HSTS, etc.)
package.json          Marks the project as ES modules, Node 20+
robots.txt, sitemap.xml, favicon.svg
```

## Managing products

Everything lives in `data/products.js`. Each product:

```js
{
  id: 'zr-015',                 // unique, never reuse
  name: 'Название',
  category: 'outerwear',        // one of CATEGORIES ids
  price: 450000,                // UZS, whole number
  description: 'Текст…',
  details: ['Состав: …'],       // optional bullet list
  images: ['https://…', '/images/zr-015-1.jpg'],   // first = main
  colors: [{ name: 'Чёрный', hex: '#151515' }],
  stock: { S: 3, M: 5, L: 0 },  // sizes and quantity; 0 = sold out
  available: true,              // false = can't be ordered
  featured: true, bestseller: false, isNew: true,
  sample: false,                // remove/false for real products
}
```

- **Add**: copy a block, change `id` and fields. **Remove**: delete the block (or set `available: false`).
- **Own photos**: create an `images/` folder, put JPG/WebP files there (≈1600px wide, under 400 KB), reference them as `/images/file.jpg`.
- **Go live with real stock**: replace all sample products (remove `sample: true`), replace `SITE_IMAGES` with your own photos, then set `STORE.demo = false`. While demo mode is on, the site shows a demo banner, every placeholder photo carries a «Фото-пример» label, and Telegram orders are tagged `[DEMO]`.
- Cards show «Осталось мало» when a product's total stock across sizes is ≤ `LOW_STOCK` (3), and «Нет в наличии» when it is sold out.
- The server recalculates prices and checks stock from this same file, so customers cannot change prices in the browser.
- Stock is **not** decremented automatically (there is no database). Update `stock` after sales.

Commit the change to GitHub → Vercel redeploys automatically (~30 s).

## Products from the Telegram channel (automatic)

New posts in **t.me/www_zara_shop_uz** appear on the site by themselves (about a minute later):

- A post becomes products when it has **a photo (or video) and a price line**: `Куртка - 450.000 сум`, `💰Брюки - 280.000 sum`, `Цена : 240.000`. One price line = one product; a post with several prices (a look) gives several products with the post's photos.
- Understood extras: `Размеры: S/M/L/XL/2XL` (otherwise S–3XL; shoes 39–45), colours as emoji `⚫️🟤🔵` or words on a «цвет/расцветка» line (otherwise «Как на фото»). The name is taken from the first sentence when it describes the item (`Объёмный пуховик с капюшоном…`), otherwise the word before the price.
- Editing a post updates the product. Deleting a post does **not** reach the site (Telegram doesn't report it) — hide it from the order chat with the bot: `/hide 812` (post number from its link), `/show 812`, `/list`.
- Orders from synced products include a link to the post in the Telegram message.

How it works: the order bot is an admin of the channel → Telegram sends posts to `api/telegram.js` → stored in Upstash Redis (`lib/tgstore.js`) → `api/products.js` turns them into products with `lib/tgparse.js` (no AI) → `data/products.js` merges them in front of the hand-made list (browser and order check). Photos are served by `api/photo.js` (the bot token never reaches the browser). Posts up to message 762 are ignored (they're already in `data/products.js`).

Setup (once): connect an **Upstash Redis** store to the project in Vercel → Storage (adds `KV_REST_API_URL` / `KV_REST_API_TOKEN`), redeploy, add the bot as an **administrator** of the channel, then open **https://zarda.shop/api/tg-setup** — it connects the webhook and shows what is still missing.

## Languages (Русский / Oʻzbekcha)

The visitor switches language with the RU | UZ buttons (header, mobile menu, footer); the choice is remembered in the browser. A link can force a language with `?lang=uz` or `?lang=ru`.

- `assets/js/i18n.js` — all interface texts for JS-rendered parts (header, cart, product page, checkout…), `t('key')`.
- `data/products.uz.js` — Uzbek product names/descriptions/details, category and colour names. **When you add a product, add its Uzbek text here too** (without it the Russian text is shown).
- HTML pages — short texts carry `data-uz="…"` (also `data-uz-placeholder`, `data-uz-aria-label`, `data-uz-alt`, `data-uz-content`); long texts on info pages are written twice in `data-lang="ru"` / `data-lang="uz"` blocks.
- `assets/js/lang.js` runs first in `<head>` so Uzbek pages don't flash Russian.
- Orders always reach Telegram in Russian (product, colour and city names); the message includes the visitor's site language.

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Value | Environments |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | token from @BotFather | Production (+ Preview if you test there) |
| `TELEGRAM_CHAT_ID` | chat ID that receives orders | same |

Never put the token in any file in this repository. After changing variables, **redeploy**.
The bot can only message you after you open the bot in Telegram and press **Start** from the receiving account.

## Order API

`POST /api/order` with JSON `{ idempotencyKey, customer: {name, phone, city, address, comment}, items: [{id, size, color, qty}] }`.

Responses: `200 {ok, orderId, total}` · `422` validation error (with `fields`) · `429` rate limit · `502` Telegram failed · `503` not configured · `403` cross-site · `405/415` wrong method/type.

Protection: server-side validation and sanitisation, trusted prices, stock check, honeypot field, same-origin check,
per-IP limit (5 valid orders / 10 min), and duplicate-submit protection (same checkout attempt → same order ID, no second Telegram message).
Rate limit and duplicate memory are per serverless instance (best effort). For a hard guarantee, add a shared store such as Upstash Redis later.

## TLS error (ERR_SSL_PROTOCOL_ERROR / "TLS alert protocol version")

Diagnosed on 2026‑11‑21 from the owner's network:

- **Every** `*.vercel.app` hostname (including unrelated sites like `og-playground.vercel.app`) fails with this error, while custom domains hosted on the same Vercel servers (`nextjs.org`, `vercel.com`) work. The network path blocks/interferes with the `vercel.app` name (SNI-based filtering). It is **not** caused by this code or by Vercel's TLS configuration.
- Fix: serve the shop from your own domain. `zarda.shop` currently returns **NXDOMAIN** (it is not registered, or has no nameservers), so it must be registered/configured first.

## Deployment

1. Upload these files to `tokhtasunovdoniyor-debug/Zarda` (replace the old `index.html`, `api/order.js`; delete `README.txt`).
2. Vercel → Project → Settings → General: Framework Preset **Other**, Build Command **empty**, Output Directory **empty** (root), Root Directory **empty**.
3. Set the two environment variables, then redeploy.
4. Settings → Deployment Protection: **Standard Protection** (protects previews only; the production domain stays public). Disable "Vercel Authentication" for production if it is on.
5. Domain: register `zarda.shop` (if not already yours) → Vercel → Settings → Domains → add `zarda.shop` and `www.zarda.shop` → create exactly the DNS records Vercel shows at your registrar (typically `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`). Vercel issues HTTPS certificates automatically.
6. Open `https://zarda.shop`, place a test order, confirm it arrives in Telegram.
