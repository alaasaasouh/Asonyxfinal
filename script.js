'use strict';

const DURATION = 500;

// ── Testimonial carousel preview (index.html) ──────────────────────
const initTestimonialCarousel = () => {
    const card = document.getElementById('testimonialCardPreview');
    if (!card) return;
    const script = document.createElement('script');
    script.src = 'portfolio.js';
    document.head.appendChild(script);
    script.onload = () => {
        if (typeof testimonials === 'undefined' || !testimonials.length) return;
        let idx = 0;
        const render = (i) => {
            const t = testimonials[i];
            card.innerHTML = `
                <div class="testimonial-quote"><p>"${t.quote}"</p></div>
                <div class="testimonial-author-info">
                    <div class="author-name-preview">${t.author}</div>
                    <div class="author-role-preview">${t.role} at ${t.company}</div>
                </div>`;
            card.classList.add('active');
        };
        const next = () => {
            card.classList.remove('active');
            setTimeout(() => { idx = (idx + 1) % testimonials.length; render(idx); }, 500);
        };
        render(0);
        setInterval(next, 8000);
    };
};

// ── Booking FLIP animation ─────────────────────────────────────────
const elApp        = document.querySelector('#app');
const elDetailCard = document.querySelector('#detail-card');
const elRestaurant = document.querySelector('#restaurant');
const elCloseBtn   = document.querySelector('.close-btn');
const elWaLink     = document.querySelector('#whatsapp-link');

if (elApp) elApp.style.setProperty('--duration', `${DURATION}ms`);

function activate(state) {
    if (!elApp) return;
    elApp.dataset.state = state;
    document.querySelectorAll('#app [data-active]').forEach(el => delete el.dataset.active);
    document.querySelectorAll(`#app [data-view="${state}"]`).forEach(el => el.dataset.active = true);
}

function flip(el, nextEl, layoutFn = () => {}) {
    if (!elApp) return;
    const rect = el.getBoundingClientRect();
    layoutFn();
    const last = nextEl.getBoundingClientRect();
    nextEl.style.setProperty('--dx', last.x - rect.x);
    nextEl.style.setProperty('--dy', last.y - rect.y);
    nextEl.style.setProperty('--dw', rect.width  / last.width);
    nextEl.style.setProperty('--dh', rect.height / last.height);
    requestAnimationFrame(() => {
        nextEl.dataset.move = 'pending';
        requestAnimationFrame(() => {
            nextEl.dataset.move = 'moving';
            setTimeout(() => delete nextEl.dataset.move, DURATION);
        });
    });
}

if (elRestaurant) {
    elRestaurant.addEventListener('click', () => {
        activate('details');
        elApp.dataset.transitioning = true;
        setTimeout(() => flip(elRestaurant, elDetailCard, () => delete elApp.dataset.transitioning), 10);
    });
}

if (elCloseBtn) {
    elCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        activate('overview');
        elApp.dataset.transitioning = true;
        setTimeout(() => flip(elDetailCard, elRestaurant, () => delete elApp.dataset.transitioning), 10);
    });
}

if (elWaLink) {
    elWaLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://wa.me/96176629850?text=${encodeURIComponent('Hello, I want to book a website with you')}`, '_blank');
        if (elCloseBtn) elCloseBtn.click();
    });
}

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initTestimonialCarousel();
    activate('overview');
});
