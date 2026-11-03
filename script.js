'use strict';

const DURATION = 500;

// ── Testimonial carousel preview (index.html) ──────────────────────
const initTestimonialCarousel = () => {
    const card = document.getElementById('testimonialCardPreview');
    if (!card || typeof testimonials === 'undefined' || !testimonials.length) return;
    let idx = 0;
    const render = (i) => {
        const t = testimonials[i];
        card.innerHTML = `
            <div class="testimonial-quote"><p>${t.quote}</p></div>
            <div class="testimonial-author-info">
                <div class="author-name-preview">${t.author}</div>
                <div class="author-role-preview">${t.role} at ${t.company}</div>
            </div>`;
        card.classList.add('active');
    };
    const next = () => {
        if (document.hidden) return;
        card.classList.remove('active');
        setTimeout(() => { idx = (idx + 1) % testimonials.length; render(idx); }, DURATION);
    };
    render(0);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(next, 8000);
};

// ── Booking FLIP animation ─────────────────────────────────────────
const elApp        = document.querySelector('#app');
const elDetailCard = document.querySelector('#detail-card');
const elRestaurant = document.querySelector('#restaurant');
const elCloseBtn   = document.querySelector('.close-btn');
const elWaLink     = document.querySelector('#whatsapp-link');

if (elApp) elApp.style.setProperty('--duration', `${DURATION}ms`);
let bookingAnimation = null;

function activate(state) {
    if (!elApp) return;
    elApp.dataset.state = state;
    elRestaurant?.setAttribute('aria-expanded', String(state === 'details'));
    document.querySelectorAll('#app [data-active]').forEach(el => delete el.dataset.active);
    document.querySelectorAll(`#app [data-view="${state}"]`).forEach(el => el.dataset.active = true);
}

function flip(el, nextEl, layoutFn = () => {}) {
    if (!elApp || !el || !nextEl) return;
    bookingAnimation?.cancel();
    const rect = el.getBoundingClientRect();
    layoutFn();
    const last = nextEl.getBoundingClientRect();
    if (!rect.width || !rect.height || !last.width || !last.height ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches || !nextEl.animate) return;
    // Measure before changing views; native animation also avoids conflicting
    // with the inline transform left by the page's scroll reveal.
    bookingAnimation = nextEl.animate([
        { transformOrigin: 'top left', transform: `translate(${rect.left - last.left}px, ${rect.top - last.top}px) scale(${rect.width / last.width}, ${rect.height / last.height})` },
        { transformOrigin: 'top left', transform: 'none' }
    ], { duration: DURATION, easing: 'cubic-bezier(.4,0,.2,1)' });
}

function openBooking() {
    if (!elApp || elApp.dataset.state === 'details') return;
    flip(elRestaurant, elDetailCard, () => activate('details'));
    (elWaLink || elCloseBtn)?.focus({ preventScroll: true });
}

function closeBooking() {
    if (!elApp || elApp.dataset.state !== 'details') return;
    flip(elDetailCard, elRestaurant, () => activate('overview'));
    elRestaurant?.focus({ preventScroll: true });
}

if (elRestaurant && elDetailCard) {
    elRestaurant.setAttribute('role', 'button');
    elRestaurant.setAttribute('tabindex', '0');
    elRestaurant.setAttribute('aria-controls', elDetailCard.id);
    elRestaurant.addEventListener('click', openBooking);
    elRestaurant.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openBooking();
        }
    });
}

if (elCloseBtn) {
    elCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeBooking();
    });
}

if (elWaLink) {
    elWaLink.href = `https://wa.me/96176629850?text=${encodeURIComponent('Hello, I want to book a website with you')}`;
    elWaLink.target = '_blank';
    elWaLink.rel = 'noopener noreferrer';
    elWaLink.addEventListener('click', closeBooking);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && elApp?.dataset.state === 'details') {
        event.preventDefault();
        closeBooking();
    }
});

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initTestimonialCarousel();
    activate('overview');
});
