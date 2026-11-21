import { PRODUCTS, CATEGORIES, SITE_IMAGES, STORE, isInStock } from '/data/products.js';
import { initLayout, productCard, icon } from '/assets/js/layout.js';
import { imgTag, esc } from '/assets/js/store.js';
import { initReveal } from '/assets/js/reveal.js';

initLayout();

const visible = PRODUCTS.filter((p) => p.available !== false);
const newIn = visible.filter((p) => p.isNew).slice(0, 4);
const best = visible.filter((p) => p.bestseller && isInStock(p)).slice(0, 4);
document.getElementById('newGrid').innerHTML = (newIn.length ? newIn : visible.slice(0, 4)).map((p) => productCard(p)).join('');
document.getElementById('bestGrid').innerHTML = (best.length ? best : visible.slice(0, 4)).map((p) => productCard(p)).join('');

// Section photos come from SITE_IMAGES / products; in demo mode they are labelled as examples.
if (STORE.demo) document.getElementById('heroDemo').hidden = false;
const demoTag = STORE.demo ? '<span class="demo-tag">Фото-пример</span>' : '';

// Category rail: every category that has products, with its first (featured first) product photo.
const cats = CATEGORIES.map((c) => {
  const list = visible.filter((p) => p.category === c.id);
  const pick = list.find((p) => p.featured) || list[0];
  return pick ? { ...c, img: pick.images[0], n: list.length } : null;
}).filter(Boolean);
document.getElementById('catRail').innerHTML = cats.map((c) => `
  <a class="cat-tile" href="/catalog?category=${c.id}">
    <span class="cat-img">${imgTag(c.img, { alt: '', sizes: '(min-width:1024px) 13vw, 34vw', w: 400 })}</span>
    <span class="cat-name">${esc(c.name)}</span>
  </a>`).join('') + `<a class="cat-tile cat-all" href="/catalog"><span class="cat-img">${icon.arrow}</span><span class="cat-name">Весь каталог</span></a>`;

document.getElementById('editorialMedia').innerHTML = imgTag(SITE_IMAGES.editorial, { alt: 'Женщина в сером пальто', sizes: '(min-width:900px) 50vw, 100vw', w: 1200 }) + demoTag;

const knit = visible.find((p) => p.category === 'knitwear' && p.featured) || visible.find((p) => p.category === 'knitwear');
const promos = [
  knit && { href: '/catalog?category=knitwear', img: knit.images[0], eyebrow: 'Трикотаж', title: 'Мягкие фактуры сезона', cta: 'Выбрать трикотаж' },
  { href: '/catalog?category=tshirts', img: SITE_IMAGES.basics, eyebrow: 'Базовый гардероб', title: 'Основа, которая сочетается со всем', cta: 'Смотреть базу' },
].filter(Boolean);
document.getElementById('promos').innerHTML = promos.map((b) => `
  <a class="promo reveal" href="${b.href}">
    ${imgTag(b.img, { alt: '', sizes: '(min-width:768px) 50vw, 100vw', w: 1100 })}${demoTag}
    <span class="promo-copy"><span class="eyebrow">${esc(b.eyebrow)}</span><span class="display promo-title">${esc(b.title)}</span><span class="arrow-link">${esc(b.cta)}</span></span>
  </a>`).join('');

document.getElementById('storyMedia').innerHTML = imgTag(SITE_IMAGES.store, { alt: 'Интерьер магазина одежды', sizes: '(min-width:900px) 45vw, 100vw', w: 1200 }) + demoTag;

initReveal();
