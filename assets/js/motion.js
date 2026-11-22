// Motion layer: smooth scrolling (Lenis) + scroll animations (GSAP, ScrollTrigger, SplitText).
// Loaded after the page has rendered. Everything is optional: if the visitor prefers reduced motion,
// or the libraries fail to load, the site stays exactly as it is without animation.
// Library files are self-hosted in /assets/vendor (GSAP 3.13 «standard no-charge» licence, Lenis MIT).
import { t } from '/assets/js/i18n.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

function load(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = false;
    s.onload = resolve; s.onerror = reject;
    document.head.append(s);
  });
}
const ready = () => root.classList.remove('motion-pending');

let started = false;
export async function initMotion() {
  if (started) return; started = true;
  if (reduce) { ready(); return; }
  try {
    await load('/assets/vendor/gsap.min.js');
    await Promise.all(['/assets/vendor/ScrollTrigger.min.js', '/assets/vendor/SplitText.min.js', '/assets/vendor/lenis.min.js'].map(load));
  } catch { ready(); return; }
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  if (!gsap || !ScrollTrigger) { ready(); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // Split text only after the web fonts are in, so line breaks are right (wait at most 1.2 s).
  await Promise.race([document.fonts?.ready || Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]);
  root.classList.add('motion');

  // Show the hidden hero/cards now; the animations below set their own start states in this same frame.
  ready();
  const run = (fn) => { try { fn(gsap, ScrollTrigger, SplitText, Lenis); } catch (e) { console.warn('motion:', e); } };
  run(smoothScroll);
  run(hero);
  run(marquee);
  run(headings);
  run(cards);
  run(parallax);
  run(magnetic);
  run(cartBump);
  // Images change section heights as they load.
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready?.then(() => ScrollTrigger.refresh());
}

// ---- smooth scroll -------------------------------------------------------------
function smoothScroll(gsap, ScrollTrigger, _S, Lenis) {
  if (!Lenis) return;
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    // Let menus, the cart, filters and photo viewers scroll natively.
    prevent: (node) => !!node.closest?.('.drawer, .mnav, .sheet, .qv, .viewer, .cat-rail, .cats, .gallery-track, [data-lenis-prevent]'),
  });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ---- hero: photos unveil, title rises line by line, eyebrow un-blurs --------------
function hero(gsap, ScrollTrigger, SplitText) {
  const el = document.querySelector('.hero');
  if (!el) return;
  const imgs = el.querySelectorAll('.hero-media img');
  const title = el.querySelector('h1');
  const eyebrow = el.querySelector('.eyebrow');
  const buttons = el.querySelectorAll('.hero-actions .btn');
  const split = title && SplitText ? new SplitText(title, { type: 'lines,words', mask: 'lines' }) : null;

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo(imgs, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.3 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.7, stagger: 0.14 });
  if (eyebrow) tl.fromTo(eyebrow, { autoAlpha: 0, filter: 'blur(10px)', y: 12 }, { autoAlpha: 1, filter: 'blur(0px)', y: 0, duration: 1.2 }, 0.45);
  if (split) tl.from(split.words, { yPercent: 115, duration: 1.3, stagger: 0.06 }, 0.55);
  tl.fromTo(buttons, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 }, 1.0);

  // Rotating badge «NEW COLLECTION · ZARDA ·» (a React Bits «circular text» idea, built with GSAP).
  const badge = document.createElement('a');
  badge.className = 'hero-badge';
  badge.href = '/catalog?sort=new';
  badge.setAttribute('aria-label', t('new'));
  const text = `${t('badgeText')} · ZARDA · ${t('badgeText')} · ZARDA · `;
  badge.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><path id="hbPath" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs>
    <text><textPath href="#hbPath" textLength="236">${text}</textPath></text></svg><span aria-hidden="true">✦</span>`;
  el.append(badge);
  tl.fromTo(badge, { autoAlpha: 0, scale: 0.6, rotate: -90 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.4 }, 1.1);
  gsap.to(badge.querySelector('svg'), { rotate: 360, duration: 22, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });

  // On scroll: photos drift slower than the page, the text lifts away.
  gsap.to(imgs, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to(el.querySelector('.hero-copy'), { y: -80, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: '70% top', scrub: true } });
}

// ---- running line that speeds up with scroll velocity (React Bits «scroll velocity» idea) ----
function marquee(gsap) {
  const after = document.querySelector('.hero');
  if (!after) return;
  const wrap = document.createElement('div');
  wrap.className = 'marquee';
  wrap.setAttribute('aria-hidden', 'true');
  const chunk = `<span>${t('marquee').split('·').map((s) => s.trim()).filter(Boolean).join('</span><i>✦</i><span>')}</span><i>✦</i>`;
  wrap.innerHTML = `<div class="marquee-track"><div class="marquee-chunk">${chunk.repeat(3)}</div><div class="marquee-chunk">${chunk.repeat(3)}</div></div>`;
  after.after(wrap);
  const track = wrap.querySelector('.marquee-track');
  const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 38, repeat: -1 });
  const lenis = window.__lenis;
  if (lenis) {
    let dir = 1;
    lenis.on('scroll', ({ velocity, direction }) => {
      if (direction) dir = direction;
      const speed = Math.min(6, 1 + Math.abs(velocity) / 6);
      gsap.to(loop, { timeScale: speed * dir, duration: 0.4, overwrite: true });
      gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.4 });
    });
  }
}

// ---- headings rise out of a mask as they scroll into view ------------------------
function headings(gsap, ScrollTrigger, SplitText) {
  if (!SplitText) return;
  document.querySelectorAll('.section-head h2, .split-copy h2, .story-copy h2, .page-head h1, .promo-title, .ftr-claim').forEach((h) => {
    const split = new SplitText(h, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });
  document.querySelectorAll('.section-head .eyebrow, .split-copy .eyebrow, .story-copy .eyebrow, .page-head .eyebrow, .section-head .arrow-link').forEach((e) => {
    gsap.from(e, { autoAlpha: 0, y: 14, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 90%', once: true } });
  });
}

// ---- product cards appear in a wave (also cards added later by filters) ----------
function cards(gsap, ScrollTrigger) {
  const show = (els) => gsap.fromTo(els, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, overwrite: true });
  const watch = (els) => ScrollTrigger.batch(els, { start: 'top 94%', once: true, onEnter: show });
  watch(document.querySelectorAll('.grid .card'));
  // Catalog filters and related products replace grid contents — animate the new cards too.
  document.querySelectorAll('.grid').forEach((grid) => {
    new MutationObserver((list) => {
      const added = list.flatMap((m) => [...m.addedNodes]).filter((n) => n.nodeType === 1 && n.classList.contains('card'));
      if (added.length) { watch(added); ScrollTrigger.refresh(); }
    }).observe(grid, { childList: true });
  });
  // Category tiles on the home page.
  const tiles = document.querySelectorAll('.cat-tile');
  if (tiles.length) gsap.from(tiles, { autoAlpha: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: tiles[0], start: 'top 92%', once: true } });
}

// ---- editorial photos move slower than the page --------------------------------
function parallax(gsap) {
  document.querySelectorAll('.split-media img, .story-media img, .promo img, .info-hero img').forEach((img) => {
    const box = img.parentElement;
    gsap.fromTo(img, { yPercent: -7, scale: 1.16 }, { yPercent: 7, scale: 1.16, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

// ---- magnetic buttons on desktop (React Bits «magnet» idea) ----------------------
function magnetic(gsap) {
  if (!finePointer) return;
  document.querySelectorAll('.hero .btn, .split-copy .btn, .ftr-top .btn, .hero-badge').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

// ---- cart counter pops when something is added ----------------------------------
function cartBump(gsap) {
  let last = Number(document.getElementById('cartCount')?.textContent || 0);
  document.addEventListener('cart:change', () => {
    const el = document.getElementById('cartCount');
    if (!el) return;
    const n = Number(el.textContent || 0);
    if (n > last) gsap.fromTo([el, document.getElementById('cartBtn')], { scale: 1.35 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    last = n;
  });
}
