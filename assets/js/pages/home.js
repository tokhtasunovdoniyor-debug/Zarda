import { PRODUCTS, CATEGORIES, SITE_IMAGES, STORE, isInStock } from '/data/products.js';
import { initLayout, productCard, icon } from '/assets/js/layout.js';
import { imgTag, esc, money } from '/assets/js/store.js';
import { initReveal } from '/assets/js/reveal.js';
import { t, catName, pName } from '/assets/js/i18n.js';

initLayout();

const visible = PRODUCTS.filter((p) => p.available !== false);
// Up to 8 cards per grid; CSS shows 4 / 6 / 8 so every row is full on phones, tablets and desktops.
// Bestsellers skip what is already shown under «New», so the two sections don't repeat each other.
const newIn = visible.filter((p) => p.isNew).slice(0, 8);
const newIds = new Set(newIn.map((p) => p.id));
let best = visible.filter((p) => p.bestseller && isInStock(p) && !newIds.has(p.id));
// Top up to 8 with featured items (then anything in stock) that aren't on screen yet, so rows stay full.
for (const pool of [(p) => p.featured, () => true]) {
  if (best.length >= 8) break;
  best = best.concat(visible.filter((p) => pool(p) && isInStock(p) && !newIds.has(p.id) && !best.includes(p)).slice(0, 8 - best.length));
}
document.getElementById('newGrid').innerHTML = (newIn.length ? newIn : visible.slice(0, 8)).map((p) => productCard(p)).join('');
document.getElementById('bestGrid').innerHTML = (best.length ? best.slice(0, 8) : visible.slice(0, 8)).map((p) => productCard(p)).join('');

// Winter showcase: dark section with a horizontal rail of the winter collection (winter: true).
const winter = visible.filter((p) => p.winter);
if (winter.length) {
  const sec = document.getElementById('winter');
  document.getElementById('winterCount').textContent = t('winterModels', { n: winter.length });
  document.getElementById('winterRail').innerHTML = winter.map((p, i) => `
    <a class="w-card" href="/product?id=${encodeURIComponent(p.id)}">
      <span class="w-media">${imgTag(p.images[0], { alt: '', sizes: '(min-width:1024px) 24vw, 70vw', w: 700 })}${p.images[1] ? imgTag(p.images[1], { alt: '', sizes: '(min-width:1024px) 24vw, 70vw', w: 700, cls: 'alt' }) : ''}</span>
      <span class="w-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="w-info"><span class="w-name">${esc(pName(p))}</span><span class="w-price">${money(p.price)}</span></span>
    </a>`).join('') + `
    <a class="w-card w-more" href="/catalog?category=winter"><span class="w-more-in"><span class="display">${esc(t('winterAll'))}</span>${icon.arrow}</span></a>`;
  sec.hidden = false;
  // Progress bar under the rail (native swipe on phones; on desktop motion.js scrolls it with the page).
  const rail = document.getElementById('winterRail');
  const bar = document.getElementById('winterBar');
  const upd = () => { const max = rail.scrollWidth - rail.clientWidth; bar.style.transform = `scaleX(${max > 0 ? Math.max(0.04, rail.scrollLeft / max) : 1})`; };
  rail.addEventListener('scroll', upd, { passive: true });
  upd();
  // Start loading the main photos a bit before the section arrives (the rail is wider than the screen,
  // so lazy loading alone would show empty cards while the rail slides in).
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      rail.querySelectorAll('.w-media img:first-child').forEach((im) => { im.loading = 'eager'; });
      io.disconnect();
    }, { rootMargin: '800px 0px' });
    io.observe(sec);
  }
}

// Section photos come from SITE_IMAGES / products; in demo mode they are labelled as examples.
const demoTag = STORE.demo ? `<span class="demo-tag">${t('samplePhoto')}</span>` : '';

// Category rail: every category that has products, with its first (featured first) product photo.
const cats = CATEGORIES.map((c) => {
  const list = visible.filter((p) => p.category === c.id);
  const pick = list.find((p) => p.featured) || list[0];
  return pick ? { ...c, img: pick.images[0], n: list.length } : null;
}).filter(Boolean);
document.getElementById('catRail').innerHTML = cats.map((c) => `
  <a class="cat-tile" href="/catalog?category=${c.id}">
    <span class="cat-img">${imgTag(c.img, { alt: '', sizes: '(min-width:1024px) 13vw, 34vw', w: 400 })}</span>
    <span class="cat-name">${esc(catName(c))}</span>
  </a>`).join('') + `<a class="cat-tile cat-all" href="/catalog"><span class="cat-img">${icon.arrow}</span><span class="cat-name">${t('allCatalog')}</span></a>`;

document.getElementById('editorialMedia').innerHTML = imgTag(SITE_IMAGES.editorial, { alt: t('altEditorial'), sizes: '(min-width:900px) 50vw, 100vw', w: 1200 }) + demoTag;

const knit = visible.find((p) => p.category === 'knitwear' && p.featured) || visible.find((p) => p.category === 'knitwear');
const promos = [
  knit && { href: '/catalog?category=knitwear', img: knit.images[0], eyebrow: t('promoKnitE'), title: t('promoKnitT'), cta: t('promoKnitC') },
  { href: '/catalog?category=vests', img: SITE_IMAGES.vests, eyebrow: t('promoVestE'), title: t('promoVestT'), cta: t('promoVestC') },
].filter(Boolean);
document.getElementById('promos').innerHTML = promos.map((b) => `
  <a class="promo reveal" href="${b.href}">
    ${imgTag(b.img, { alt: '', sizes: '(min-width:768px) 50vw, 100vw', w: 1100 })}${demoTag}
    <span class="promo-copy"><span class="eyebrow">${esc(b.eyebrow)}</span><span class="display promo-title">${esc(b.title)}</span><span class="arrow-link">${esc(b.cta)}</span></span>
  </a>`).join('');

document.getElementById('storyMedia').innerHTML = imgTag(SITE_IMAGES.story, { alt: t('altStory'), sizes: '(min-width:900px) 45vw, 100vw', w: 1200 }) + demoTag;

initReveal();
