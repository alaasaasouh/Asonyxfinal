/* =================================================================
   ASONYX — js/main.js
   Lenis · GSAP · ScrollTrigger · Canvas frame scrubbing
   ================================================================= */
'use strict';

const FRAME_COUNT = 100;
const FRAME_SPEED = 1.9;   // product anim completes ~53% scroll
const IMAGE_SCALE = 0.88;  // padded cover sweet spot

// ── DOM ────────────────────────────────────────────────────────────
const loader      = document.getElementById('loader');
const loaderBar   = document.getElementById('loader-bar');
const loaderPct   = document.getElementById('loader-percent');
const canvasEl    = document.getElementById('video-canvas');
const ctx         = canvasEl.getContext('2d');
const overlay     = document.getElementById('dark-overlay');
const marqueeWrap = document.getElementById('marquee-wrap');
const marqueeText = marqueeWrap?.querySelector('.marquee-text');
const scrollCont  = document.getElementById('scroll-container');
const navbar      = document.querySelector('.navbar');

// ── Frames ─────────────────────────────────────────────────────────
const frames     = new Array(FRAME_COUNT).fill(null);
let   loaded     = 0;
let   curFrame   = 0;
let   bgColor    = '#050a12';

// ── 1. Lenis smooth scroll (must be first) ─────────────────────────
const lenis = new Lenis({
    duration:      1.2,
    easing:        t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel:   true,
    wheelMultiplier: 1,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── 2. Canvas ──────────────────────────────────────────────────────
let rafPending = false; // RAF flag — prevents redundant draws per frame

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width  = window.innerWidth  * dpr;  // resetting w/h also resets ctx transforms
    canvasEl.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);       // explicit set prevents accumulation
    draw(curFrame);
}

function sampleBg(img) {
    const t = document.createElement('canvas');
    t.width = t.height = 4;
    const tc = t.getContext('2d');
    tc.drawImage(img, 0, 0, 4, 4);
    const d = tc.getImageData(0, 0, 1, 1).data;
    bgColor = `rgb(${d[0]},${d[1]},${d[2]})`;
}

function draw(idx) {
    const img = frames[idx];
    const cw  = window.innerWidth, ch = window.innerHeight;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);
    if (!img) return;
    const { naturalWidth: iw, naturalHeight: ih } = img;
    const s = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    ctx.drawImage(img, (cw - iw * s) / 2, (ch - ih * s) / 2, iw * s, ih * s);
}

window.addEventListener('resize', resizeCanvas, { passive: true });

// ── 3. Preloader (two-phase) ────────────────────────────────────────
const RING_CIRC = 439.8; // 2π × 70
const loaderRing = document.getElementById('loaderRingEl');

function loadFrame(i) {
    return new Promise(resolve => {
        const img = new Image();
        img.src   = `frames/frame_${String(i + 1).padStart(4, '0')}.jpg`;
        img.onload = () => {
            frames[i] = img;
            loaded++;
            if (i % 20 === 0) sampleBg(img);
            const pct = loaded / FRAME_COUNT;
            if (loaderRing) loaderRing.style.strokeDashoffset = RING_CIRC * (1 - pct);
            if (loaderPct)  loaderPct.textContent = Math.round(pct * 100) + '%';
            resolve();
        };
        img.onerror = () => { loaded++; resolve(); };
    });
}

async function preload() {
    resizeCanvas();
    // Phase 1: first 12 frames fast
    await Promise.all(Array.from({ length: 12 }, (_, i) => loadFrame(i)));
    draw(0);
    // Phase 2: rest
    await Promise.all(Array.from({ length: FRAME_COUNT - 12 }, (_, i) => loadFrame(i + 12)));

    // Hide loader then boot — timeout fallback if transitionend never fires
    if (loader) {
        loader.classList.add('hidden');
        let booted = false;
        const boot = () => { if (!booted) { booted = true; bootGSAP(); } };
        loader.addEventListener('transitionend', boot, { once: true });
        setTimeout(boot, 900); // fallback: boot after 900ms max
    } else {
        bootGSAP();
    }
}

// ── 4. Boot all GSAP after loader hides ────────────────────────────
function bootGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    playHeroReveal();
    initFrameScrub();
    initScrollSections();
    initDarkOverlay();
    initMarquee();
    initCounters();
    initPageSections();
    initNavbarScroll();
    setTimeout(() => ScrollTrigger.refresh(true), 300);
}

// ── 5. Hero reveal ──────────────────────────────────────────────────
function playHeroReveal() {
    // Hide via GSAP (not CSS) so elements are always visible if GSAP fails
    gsap.set('.hero-eyebrow',  { y: 24, opacity: 0 });
    gsap.set('.eyebrow-line',  { width: 0 });
    gsap.set('.hero-word',     { y: 60, opacity: 0 }); // fade+slide, no clip needed
    gsap.set('.hero-role-row', { opacity: 0, y: 14 });
    gsap.set('.hero-ctas',     { opacity: 0, y: 22 });
    gsap.set('.hero-footer',   { opacity: 0, y: 10 });

    const tl = gsap.timeline({ delay: 0.05 });

    tl.to('.hero-eyebrow',  { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' })
      .to('.eyebrow-line',  { width: 28, duration: 0.45, ease: 'power2.out', stagger: 0.05 }, '-=0.3')
      .to('.hero-word',     { y: 0, opacity: 1, duration: 0.8, stagger: 0.13, ease: 'power3.out' }, '-=0.25')
      .to('.hero-role-row', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.45')
      .to('.hero-ctas',     { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.4)' }, '-=0.38')
      .to('.hero-footer',   { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.38');

    // Hard fallback — if timeline stalls for any reason, force everything visible at 4s
    setTimeout(() => {
        ['.hero-eyebrow','.hero-role-row','.hero-ctas','.hero-footer'].forEach(sel => {
            const el = document.querySelector(sel);
            if (el && (el.style.opacity === '0' || el.style.opacity === '')) {
                gsap.set(el, { opacity: 1, y: 0, scale: 1, clearProps: 'transform' });
            }
        });
        document.querySelectorAll('.hero-word').forEach(el => {
            if (el.style.opacity === '0' || el.style.opacity === '') {
                gsap.set(el, { opacity: 1, y: 0 });
            }
        });
    }, 4000);
}

// ── 6. Frame scrubbing ──────────────────────────────────────────────
function initFrameScrub() {
    ScrollTrigger.create({
        trigger: scrollCont,
        start: 'top bottom',
        end:   'bottom bottom',
        scrub: 0.8,
        onUpdate(self) {
            const idx = Math.min(
                Math.floor(Math.min(self.progress * FRAME_SPEED, 1) * FRAME_COUNT),
                FRAME_COUNT - 1
            );
            if (idx !== curFrame) {
                curFrame = idx;
                if (!rafPending) {
                    rafPending = true;
                    requestAnimationFrame(() => { draw(curFrame); rafPending = false; });
                }
            }
        }
    });
}

// ── 7. Dark overlay (stats zone: 58–80%) ───────────────────────────
function initDarkOverlay() {
    const E = 0.57, L = 0.82, F = 0.04;
    ScrollTrigger.create({
        trigger: scrollCont,
        start: 'top top', end: 'bottom bottom',
        scrub: 0.3,
        onUpdate(self) {
            const p = self.progress;
            let op = 0;
            if      (p >= E - F && p < E)  op = (p - (E - F)) / F;
            else if (p >= E && p <= L)      op = 0.93;
            else if (p > L && p <= L + F)   op = 0.93 * (1 - (p - L) / F);
            if (overlay) overlay.style.opacity = op;
        }
    });
}

// ── 8. Marquee (30–88%) ─────────────────────────────────────────────
function initMarquee() {
    if (!marqueeText || !marqueeWrap) return;
    const E = 0.30, L = 0.88, F = 0.04;
    gsap.to(marqueeText, {
        xPercent: -22, ease: 'none',
        scrollTrigger: { trigger: scrollCont, start: 'top top', end: 'bottom bottom', scrub: true }
    });
    ScrollTrigger.create({
        trigger: scrollCont, start: 'top top', end: 'bottom bottom', scrub: 0.3,
        onUpdate(self) {
            const p = self.progress;
            let op = 0;
            if      (p >= E - F && p < E) op = (p - (E - F)) / F;
            else if (p >= E && p <= L)    op = 1;
            else if (p > L && p <= L + F) op = 1 - (p - L) / F;
            marqueeWrap.style.opacity = op;
        }
    });
}

// ── 9. Scroll sections ──────────────────────────────────────────────
const ANIM_MAP = {
    'slide-left':   (ch) => ({ x: -90, opacity: 0, stagger: 0.14, duration: 1.0, ease: 'power3.out' }),
    'slide-right':  (ch) => ({ x:  90, opacity: 0, stagger: 0.14, duration: 1.0, ease: 'power3.out' }),
    'fade-up':      (ch) => ({ y:  60, opacity: 0, stagger: 0.14, duration: 1.0, ease: 'power3.out' }),
    'scale-up':     (ch) => ({ scale: 0.80, opacity: 0, stagger: 0.12, duration: 1.1, ease: 'power2.out' }),
    'stagger-up':   (ch) => ({ y:  70, opacity: 0, stagger: 0.16, duration: 0.9, ease: 'power3.out' }),
    // CTA: each mega word reveals from bottom clip, then button pulses in
    'cta-reveal':   (ch) => ({ yPercent: 105, opacity: 0, stagger: 0.18, duration: 1.2, ease: 'power4.out' }),
};

function initScrollSections() {
    document.querySelectorAll('.scroll-section').forEach(sec => {
        const enter   = +sec.dataset.enter / 100;
        const leave   = +sec.dataset.leave / 100;
        const mid     = (enter + leave) / 2;
        const persist = sec.dataset.persist === 'true';
        const type    = sec.dataset.animation || 'fade-up';
        const kids    = [...sec.querySelectorAll(
            '.section-label,.section-heading,.section-body,.scroll-cta-btn,.stat,.stat-sep,' +
            '.cta-eyebrow,.cta-mega-word,.cta-mega-btn'
        )];

        sec.style.top = `${mid * 100}%`;
        gsap.set(sec, { autoAlpha: 0 });

        let tl    = null;
        let shown = false;

        ScrollTrigger.create({
            trigger: scrollCont, start: 'top top', end: 'bottom bottom',
            scrub: false,
            onUpdate(self) {
                const p   = self.progress;
                const in_ = p >= enter && p <= leave;

                if (in_ && !shown) {
                    gsap.set(sec, { autoAlpha: 1 });
                    const vars = ANIM_MAP[type]?.(kids) || ANIM_MAP['fade-up'](kids);
                    tl = gsap.from(kids, vars);
                    shown = true;
                }

                if (!in_ && !persist) {
                    const far = p < enter - 0.04 || p > leave + 0.04;
                    if (far && shown) {
                        gsap.set(sec, { autoAlpha: 0 });
                        tl?.kill();
                        gsap.set(kids, { clearProps: 'all' });
                        shown = false;
                    }
                }
            }
        });
    });
}

// ── 10. Counter animations ──────────────────────────────────────────
function initCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = +el.dataset.value;
        const dec    = +(el.dataset.decimals || 0);
        const proxy  = { v: 0 };
        gsap.to(proxy, {
            v: target, duration: 2.5, ease: 'power1.out',
            onUpdate() {
                el.textContent = dec > 0 ? proxy.v.toFixed(dec) : Math.round(proxy.v);
            },
            scrollTrigger: {
                trigger: el.closest('.scroll-section'),
                start: 'top 85%',
                toggleActions: 'play none none reset',
            }
        });
    });
}

// ── 11. Page section animations (replaces IntersectionObserver) ──────
function initPageSections() {
    const from = (targets, trigger, extra = {}) => {
        if (!document.querySelector(typeof targets === 'string' ? targets : targets[0])) return;
        gsap.from(targets, {
            y: 40, opacity: 0, stagger: 0.08,
            duration: 0.75, ease: 'power2.out',
            ...extra,
            scrollTrigger: {
                trigger,
                start: 'top 83%',
                toggleActions: 'play none none none',
            }
        });
    };

    // Services
    from(['.svc-eyebrow','#services .section-title','.svc-header-desc'], '#services', { stagger:.08 });
    from('.svc-card', '.services-bento', { stagger: 0.07, y: 50 });

    // Testimonials
    from(['.testimonials-preview .section-title','.testimonials-preview .section-subtitle'], '.testimonials-preview');

    // Portfolio
    from(['.portfolio-preview .section-title','.portfolio-preview .section-subtitle'], '.portfolio-preview');
    from('.portfolio-item', '.portfolio-grid', { stagger: 0.1 });

    // Booking
    from(['.booking-section .section-title','.booking-section .section-subtitle'], '.booking-section');
    from('.cards .card', '.cards', { stagger: 0 });

    // Contact
    from(['.contact .section-title','.contact .section-subtitle'], '.contact');
    from('.contact-card-grid-space', '.contact-cards-wrapper', { stagger: 0.12 });

    // Footer
    from(['.footer-top','.footer-bottom'], '.footer', { stagger: 0.1, y: 20 });
}

// ── 12. Navbar ──────────────────────────────────────────────────────
function initNavbarScroll() {
    lenis.on('scroll', ({ scroll }) => {
        navbar?.classList.toggle('scrolled', scroll > 60);
    });
}

// ── 13. Mobile menu ─────────────────────────────────────────────────
function initMobileMenu() {
    const toggle  = document.getElementById('menuToggle');
    const menu    = document.getElementById('mobileMenu');
    const close   = document.getElementById('mobileMenuClose');
    const overlay = document.getElementById('mobileMenuOverlay');
    if (!toggle || !menu) return;

    const open  = () => { menu.classList.add('open'); toggle.classList.add('open'); overlay?.classList.add('visible'); toggle.setAttribute('aria-expanded','true'); };
    const close_ = () => { menu.classList.remove('open'); toggle.classList.remove('open'); overlay?.classList.remove('visible'); toggle.setAttribute('aria-expanded','false'); };

    toggle.addEventListener('click', () => menu.classList.contains('open') ? close_() : open());
    close?.addEventListener('click', close_);
    overlay?.addEventListener('click', close_);
    menu.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', close_));
}

// ── 14. Role cycler ─────────────────────────────────────────────────
function initRoleCycler() {
    const items = [...document.querySelectorAll('.role-item')];
    if (!items.length) return;
    let cur = 0;
    setInterval(() => {
        items[cur].classList.remove('active');
        items[cur].classList.add('exit');
        setTimeout(() => items[cur].classList.remove('exit'), 420);
        cur = (cur + 1) % items.length;
        items[cur].classList.add('active');
    }, 2400);
}

// ── Boot ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initRoleCycler();
    initMobileMenu();
    preload();
});
