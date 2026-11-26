// Motion layer: smooth scrolling (Lenis) + scroll animations (GSAP, ScrollTrigger, SplitText).
// Loaded after the page has rendered. Everything is optional: if the visitor prefers reduced motion,
// or the libraries fail to load, the site stays exactly as it is without animation.
// Library files are self-hosted in /assets/vendor (GSAP 3.13 «standard no-charge» licence, Lenis MIT).
import { t, lang } from '/assets/js/i18n.js';

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
  run(winter);
  run(steps);
  run(pageTransitions);
  run(cursor);
  run(progress);
  run(footerMark);
  run(flyToCart);
  run(productPage);
  run(heroMouse);
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
    prevent: (node) => !!node.closest?.('.drawer, .mnav, .sheet, .qv, .viewer, .cat-rail, .cats, .gallery-track, .winter-rail, [data-lenis-prevent]'),
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
  document.querySelectorAll('.section-head h2, .split-copy h2, .story-copy h2, .page-head h1, .promo-title, .ftr-claim, .winter-title, .tg-title').forEach((h) => {
    const split = new SplitText(h, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });
  document.querySelectorAll('.section-head .eyebrow, .split-copy .eyebrow, .story-copy .eyebrow, .page-head .eyebrow, .section-head .arrow-link, .winter .eyebrow, .winter-side, .tg-band .eyebrow, .tg-text, .tg-actions').forEach((e) => {
    gsap.from(e, { autoAlpha: 0, y: 14, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 90%', once: true } });
  });
}

// ---- product cards appear in a wave (also cards added later by filters) ----------
function cards(gsap, ScrollTrigger) {
  const show = (els) => {
    gsap.fromTo(els, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, overwrite: true });
    // The photo opens like a curtain and settles from a slight zoom.
    const media = els.map((c) => c.querySelector('.card-media')).filter(Boolean);
    gsap.fromTo(media, { clipPath: 'inset(18% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', stagger: 0.07, clearProps: 'clipPath' });
    const imgs = els.map((c) => c.querySelector('.card-link img')).filter(Boolean);
    gsap.fromTo(imgs, { scale: 1.16 }, { scale: 1, duration: 1.6, ease: 'expo.out', stagger: 0.07, clearProps: 'transform' });
  };
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

// ---- winter showcase: light snowfall; on desktop the section pins and the rail slides sideways ----
function winter(gsap, ScrollTrigger) {
  const sec = document.querySelector('.winter');
  if (!sec || sec.hidden) return;
  snow(sec);
  const rail = sec.querySelector('.winter-rail');
  const bar = document.getElementById('winterBar');
  const cardsIn = rail.querySelectorAll('.w-card');
  gsap.fromTo(cardsIn, { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: rail, start: 'top 85%', once: true } });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    sec.classList.add('is-pinned');
    rail.scrollLeft = 0;
    // How far the rail has to travel so its last card ends at the right gutter.
    const dist = () => {
      const last = rail.lastElementChild;
      const pad = parseFloat(getComputedStyle(rail).paddingRight) || 0;
      return last ? Math.max(0, last.offsetLeft + last.offsetWidth + pad - rail.clientWidth) : 0;
    };
    const tw = gsap.to(rail, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1,
        onUpdate: (st) => { if (bar) bar.style.transform = `scaleX(${Math.max(0.04, st.progress)})`; },
      },
    });
    // Big title drifts slower than the cards: a little depth.
    gsap.to(sec.querySelector('.winter-head'), { x: () => -Math.min(120, dist() * 0.06), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${dist()}`, scrub: 0.7, invalidateOnRefresh: true } });
    return () => { sec.classList.remove('is-pinned'); tw.scrollTrigger?.kill(); gsap.set(rail, { clearProps: 'x' }); };
  });
}

function snow(sec) {
  const c = document.createElement('canvas');
  c.className = 'winter-snow';
  c.setAttribute('aria-hidden', 'true');
  sec.prepend(c);
  const ctx = c.getContext('2d');
  if (!ctx) return;
  const n = window.innerWidth < 768 ? 45 : 110;
  let w = 0, h = 0, on = false, raf = 0;
  const size = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = sec.clientWidth; h = sec.clientHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const make = (y) => ({ x: Math.random() * w, y: y ?? Math.random() * h, r: 0.5 + Math.random() * 1.7, s: 0.2 + Math.random() * 0.65, d: Math.random() * 6.28, o: 0.18 + Math.random() * 0.5 });
  size();
  const flakes = Array.from({ length: n }, () => make());
  const tick = (time) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    for (const f of flakes) {
      f.y += f.s; f.x += Math.sin(time / 1800 + f.d) * 0.28;
      if (f.y > h + 4) Object.assign(f, make(-4));
      ctx.globalAlpha = f.o;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
    }
    if (on) raf = requestAnimationFrame(tick);
  };
  // Only animate while the section is on screen.
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !on) { on = true; raf = requestAnimationFrame(tick); }
    else if (!e.isIntersecting) { on = false; cancelAnimationFrame(raf); }
  }).observe(sec);
  if (window.ResizeObserver) new ResizeObserver(size).observe(sec);
}

// ---- «how to order»: big numbers rise one after another ---------------------------
function steps(gsap) {
  const list = document.querySelector('.steps-list');
  if (!list) return;
  gsap.from(list.querySelectorAll('li'), { autoAlpha: 0, y: 40, duration: 1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: list, start: 'top 85%', once: true } });
  gsap.from(list.querySelectorAll('.step-n'), { yPercent: 60, duration: 1.4, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: list, start: 'top 85%', once: true } });
}

// ---- page transitions: a dark «ZARDA» curtain covers the page before an internal link opens ----
// The next page lifts the same curtain with CSS (html.pt-in, set in lang.js before the first paint).
function pageTransitions(gsap) {
  const cover = document.createElement('div');
  cover.className = 'pt-cover';
  cover.setAttribute('aria-hidden', 'true');
  cover.innerHTML = '<span>ZARDA</span>';
  document.body.append(cover);
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname.startsWith('/api/') || /\.\w{2,4}$/.test(url.pathname.replace(/\.html$/, ''))) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same page / #anchor
    e.preventDefault();
    try { sessionStorage.setItem('zarda_pt', '1'); } catch { /* ignore */ }
    gsap.fromTo(cover, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.inOut', onComplete: () => { location.href = url.href; } });
    gsap.fromTo(cover.firstChild, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, delay: 0.12, ease: 'power3.out' });
  });
  // Back/forward cache restores the page with the curtain down — lift it.
  window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(cover, { yPercent: 100 }); });
}

// ---- custom cursor (desktop): a small dot; over photos it becomes a «Смотреть» circle ----
function cursor(gsap) {
  if (!finePointer) return;
  const c = document.createElement('div');
  c.className = 'cursor';
  c.setAttribute('aria-hidden', 'true');
  c.innerHTML = `<i></i><span>${lang === 'uz' ? 'Koʻrish' : 'Смотреть'}</span>`;
  document.body.append(c);
  const xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); c.classList.add('on'); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => c.classList.remove('on'));
  const VIEW = '.card-media, .w-media, .promo, .cat-img, .split-media, .story-media';
  const LINK = 'a, button, summary, select, input, textarea, label, [role="radio"]';
  document.addEventListener('pointerover', (e) => {
    const inOverlay = e.target.closest('.drawer, .mnav, .qv, .sheet, .viewer');
    const view = !inOverlay && e.target.closest(VIEW);
    c.classList.toggle('view', !!view);
    c.classList.toggle('link', !view && !!e.target.closest(LINK));
  });
}

// ---- thin progress line under the header -----------------------------------------
function progress(gsap) {
  if (document.documentElement.scrollHeight < window.innerHeight * 1.8) return;
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
}

// ---- giant ZARDA at the bottom of the footer, letters rise as the page ends ---------
function footerMark(gsap) {
  const ftr = document.querySelector('.ftr');
  if (!ftr) return;
  const mark = document.createElement('div');
  mark.className = 'ftr-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.innerHTML = 'ZARDA'.split('').map((l) => `<span><b>${l}</b></span>`).join('');
  ftr.append(mark);
  gsap.from(mark.querySelectorAll('b'), { yPercent: 105, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: mark, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
}

// ---- add to cart: the product photo flies to the cart ---------------------------
function flyToCart(gsap) {
  let src = null;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-role="add"], #stickyAdd');
    if (b) src = { b, at: Date.now() };
  }, true);
  document.addEventListener('cart:change', () => {
    if (!src || Date.now() - src.at > 1500) return;
    const { b } = src; src = null;
    const box = b.closest('.qv') || document.querySelector('.pdp');
    const img = box?.querySelector('.qv-track img, .gallery-track img');
    const cart = document.getElementById('cartBtn');
    if (!img || !cart) return;
    let r = img.getBoundingClientRect();
    // Photo scrolled away (sticky buy bar): start from the button instead.
    if (r.bottom < 0 || r.top > window.innerHeight) { const br = b.getBoundingClientRect(); r = { left: br.left + br.width / 2 - 60, top: br.top - 160, width: 120, height: 160 }; }
    const to = cart.getBoundingClientRect();
    const fly = document.createElement('img');
    fly.src = img.currentSrc || img.src; fly.alt = ''; fly.className = 'fly-img';
    Object.assign(fly.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    document.body.append(fly);
    const dx = to.left + to.width / 2 - (r.left + r.width / 2);
    const dy = to.top + to.height / 2 - (r.top + r.height / 2);
    gsap.timeline({ onComplete: () => fly.remove() })
      .to(fly, { scale: 0.55, duration: 0.25, ease: 'power2.out' })
      .to(fly, { x: dx, duration: 0.75, ease: 'power2.inOut' }, 0.15)
      .to(fly, { y: dy, duration: 0.75, ease: 'back.in(1.4)' }, 0.15)
      .to(fly, { scale: 48 / Math.max(r.width, 1), borderRadius: '50%', duration: 0.75, ease: 'power2.in' }, 0.15)
      .to(fly, { autoAlpha: 0, duration: 0.2 }, 0.8);
  });
}

// ---- product page: photo opens like a curtain, details rise one by one --------------
function productPage(gsap) {
  const pdp = document.querySelector('.pdp');
  if (!pdp) return;
  const first = pdp.querySelector('.gallery-track figure');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo(pdp.querySelector('.gallery'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 });
  if (first) {
    tl.fromTo(first, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, clearProps: 'clipPath' }, 0);
    const img = first.querySelector('img');
    if (img) tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, clearProps: 'transform' }, 0);
  }
  tl.fromTo(pdp.querySelectorAll('.buy > *'), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06, clearProps: 'transform' }, 0.25);
}

// ---- hero photos drift a little with the mouse (desktop) ---------------------------
function heroMouse(gsap) {
  if (!finePointer) return;
  const hero = document.querySelector('.hero');
  const media = hero?.querySelector('.hero-media');
  if (!media) return;
  const xTo = gsap.quickTo(media, 'x', { duration: 1.2, ease: 'power3' });
  const yTo = gsap.quickTo(media, 'y', { duration: 1.2, ease: 'power3' });
  gsap.set(media, { scale: 1.04 });
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    xTo(((e.clientX - r.left) / r.width - 0.5) * -24);
    yTo(((e.clientY - r.top) / r.height - 0.5) * -16);
  });
  hero.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
}

// ---- magnetic buttons on desktop (React Bits «magnet» idea) ----------------------
function magnetic(gsap) {
  if (!finePointer) return;
  document.querySelectorAll('.hero .btn, .split-copy .btn, .ftr-top .btn, .hero-badge, .winter-side .btn, .tg-actions .btn, .steps-cta .btn').forEach((el) => {
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
