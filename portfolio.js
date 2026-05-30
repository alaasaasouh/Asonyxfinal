// =================================================================
// ASONYX - Portfolio Page Script (portfolio.html)
// Handles project data, filtering, and the Stellar 3D Testimonial Slide Navigator.
// =================================================================

'use strict';

// --- Data Structures ---

/**
 * Array of project objects for the portfolio.
 * Each object contains details for a project card.
 */
const projects = [
    {
        id: '1',
        title: '3D Interactive Website',
        category: '3d',
        description: 'Immersive 3D website with interactive elements and smooth animations',
        image: '🌐', // Placeholder: Use image URL in production
        tags: ['3D', 'WebGL', 'React', 'Animation'],
        metrics: [
            { label: 'Performance', value: '98/100' },
            { label: 'Engagement', value: '+150%' },
            { label: 'Load Time', value: '1.2s' }
        ]
    },
    {
        id: '2',
        title: 'Digital Marketing Platform',
        category: 'digital',
        description: 'Comprehensive platform for managing digital marketing campaigns',
        image: '📊', // Placeholder: Use image URL in production
        tags: ['Platform', 'Dashboard', 'Analytics', 'React'],
        metrics: [
            { label: 'Users', value: '5000+' },
            { label: 'Campaigns', value: '2000+' },
            { label: 'ROI Increase', value: '+320%' }
        ]
    },
    {
        id: '3',
        title: 'Professional Video Production',
        category: 'media',
        description: 'High-quality video production for corporate and commercial use',
        image: '🎬', // Placeholder: Use image URL in production
        tags: ['Video', 'Production', 'Cinematography', '4K'],
        metrics: [
            { label: 'Videos Produced', value: '150+' },
            { label: 'Total Views', value: '5M+' },
            { label: 'Client Satisfaction', value: '99%' }
        ]
    },
    {
        id: '4',
        title: 'Mobile App UI/UX Design',
        category: 'uiux',
        description: 'Beautiful and intuitive mobile app interface design',
        image: '📱', // Placeholder: Use image URL in production
        tags: ['Mobile', 'UI/UX', 'Design System', 'Figma'],
        metrics: [
            { label: 'Design Components', value: '200+' },
            { label: 'User Testing', value: '500+ Users' },
            { label: 'Usability Score', value: '9.2/10' }
        ]
    },
    {
        id: '5',
        title: 'Brand Identity & Strategy',
        category: 'brand',
        description: 'Complete brand identity and strategic positioning',
        image: '🎨', // Placeholder: Use image URL in production
        tags: ['Branding', 'Strategy', 'Identity', 'Guidelines'],
        metrics: [
            { label: 'Brand Recognition', value: '+280%' },
            { label: 'Market Share', value: '+45%' },
            { label: 'Customer Loyalty', value: '+160%' }
        ]
    },
    {
        id: '6',
        title: '3D Animation & VFX',
        category: 'animation',
        description: 'Stunning 3D animations and visual effects for various media',
        image: '✨', // Placeholder: Use image URL in production
        tags: ['3D Animation', 'VFX', 'Motion Graphics', 'Cinema4D'],
        metrics: [
            { label: 'Projects', value: '80+' },
            { label: 'Awards Won', value: '15+' },
            { label: 'Industry Recognition', value: 'Top 5' }
        ]
    },
    {
        id: '7',
        title: 'E-Commerce Platform Redesign',
        category: 'digital',
        description: 'Complete redesign and optimization of e-commerce platform',
        image: '🛍️', // Placeholder: Use image URL in production
        tags: ['E-Commerce', 'Optimization', 'Conversion', 'UX'],
        metrics: [
            { label: 'Conversion Rate', value: '+85%' },
            { label: 'Average Order Value', value: '+120%' },
            { label: 'Customer Retention', value: '+95%' }
        ]
    },
    {
        id: '8',
        title: 'Interactive 3D Product Showcase',
        category: '3d',
        description: 'Interactive 3D product visualization and showcase',
        image: '🎯', // Placeholder: Use image URL in production
        tags: ['3D', 'Product', 'Interactive', 'AR'],
        metrics: [
            { label: 'Interaction Rate', value: '+340%' },
            { label: 'Time on Page', value: '+420%' },
            { label: 'Sales Increase', value: '+210%' }
        ]
    }
];

/**
 * Array of testimonial objects for the 3D slide navigator.
 */
const testimonials = [
    {
        quote: "Asonyx transformed our entire digital presence. Their 3D website design is absolutely stunning and has increased our engagement by 150%. Highly recommend!",
        author: "Sarah Johnson",
        role: "CEO",
        company: "TechStart Inc",
        avatar: "👩‍💼",
        rating: 5,
        backTitle: "Project: TechStart 3D Site",
        backText: "We delivered a custom WebGL experience that set a new industry benchmark for interactive design.",
        backCta: "View Case Study"
    },
    {
        quote: "The team at Asonyx delivered an exceptional digital solution. Their attention to detail and creative approach exceeded all our expectations. Best investment we made!",
        author: "Michael Chen",
        role: "Marketing Director",
        company: "Global Media",
        avatar: "👨‍💼",
        rating: 5,
        backTitle: "Project: Global Media Platform",
        backText: "Asonyx built a scalable marketing dashboard, integrating advanced analytics and real-time reporting.",
        backCta: "Explore Features"
    },
    {
        quote: "Working with Asonyx was a game-changer for our brand. Their video production quality is world-class, and the creative direction was perfect. Truly outstanding!",
        author: "Emma Rodriguez",
        role: "Brand Manager",
        company: "Luxury Goods Co",
        avatar: "👩‍🦰",
        rating: 5,
        backTitle: "Project: Luxury Video Campaign",
        backText: "We produced a series of high-end 4K commercials that significantly boosted brand perception and sales.",
        backCta: "Watch Video"
    },
    {
        quote: "The UI/UX design system they created became the foundation of our entire product line. Their expertise in design thinking is unmatched. Fantastic collaboration!",
        author: "David Park",
        role: "Product Lead",
        company: "FitTech",
        avatar: "👨‍🦱",
        rating: 5,
        backTitle: "Project: FitTech Design System",
        backText: "A comprehensive design system was created to unify the look and feel across all their mobile and web applications.",
        backCta: "See Design Specs"
    },
    {
        quote: "Asonyx's brand strategy work helped us establish market leadership. Their insights and creative execution are second to none. Couldn't have done it without them!",
        author: "Lisa Thompson",
        role: "Founder",
        company: "InnovateCo",
        avatar: "👩‍🦳",
        rating: 5,
        backTitle: "Project: InnovateCo Rebrand",
        backText: "Asonyx developed a new brand identity and strategic guidelines, resulting in a 280% increase in brand recognition.",
        backCta: "Read Strategy"
    },
    {
        quote: "The 3D animations and VFX work from Asonyx brought our vision to life in ways we never imagined. Their technical expertise combined with creativity is remarkable!",
        author: "James Wilson",
        role: "Creative Director",
        company: "FilmStudio",
        avatar: "👨‍🎨",
        rating: 5,
        backTitle: "Project: FilmStudio VFX",
        backText: "We provided stunning 3D animations and visual effects for their latest feature film, earning critical acclaim.",
        backCta: "View Reel"
    }
];

// --- State Variables ---
let currentFilter = 'all'; // Current active project filter
let currentSlide = 0; // Index of the currently visible testimonial slide
const SLIDE_WIDTH = 400; // Must match the .carousel-slide width in CSS
const SLIDE_COUNT = testimonials.length;
const RADIUS = Math.round((SLIDE_WIDTH / 2) / Math.tan(Math.PI / SLIDE_COUNT)); // Calculate the radius for the 3D cylinder

// --- DOM Elements ---
const projectsGrid = document.getElementById('projectsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const carouselTrack = document.getElementById('carouselTrack'); // New track for 3D
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const carouselDots = document.getElementById('carouselDots'); // New dots container
const mobileMenu = document.getElementById('mobileMenu');
const menuToggle = document.getElementById('menuToggle');

// =================================================================
// PROJECT RENDERING AND FILTERING (Unchanged)
// =================================================================

/**
 * Generates the HTML string for a single project card.
 * @param {object} project - The project data object.
 * @returns {string} The HTML string for the project card.
 */
function createProjectCardHTML(project) {
    // Generate HTML for metrics section
    const metricsHTML = project.metrics.map(metric => `
        <div class="project-metric">
            <div class="metric-value">${metric.value}</div>
            <div class="metric-label">${metric.label}</div>
        </div>
    `).join('');

    // Generate HTML for tags section
    const tagsHTML = project.tags.map(tag => `
        <span class="project-tag">${tag}</span>
    `).join('');

    return `
        <div class="project-card" data-category="${project.category}">
            <div class="project-image" aria-label="Project image for ${project.title}">
                ${project.image}
            </div>
            <div class="project-content">
                <span class="project-category">${project.category}</span>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tags">
                    ${tagsHTML}
                </div>
                <div class="project-metrics">
                    ${metricsHTML}
                </div>
                <a href="#" class="project-cta btn btn-outline">
                    View Details
                </a>
            </div>
        </div>
    `;
}

/**
 * Renders the projects to the DOM based on the current filter.
 */
function renderProjects() {
    if (!projectsGrid) return;

    // Filter projects based on the current filter
    const filteredProjects = currentFilter === 'all'
        ? projects
        : projects.filter(p => p.category === currentFilter);

    // Generate HTML for all filtered projects
    const projectsHTML = filteredProjects.map(createProjectCardHTML).join('');

    // Update the grid content
    projectsGrid.innerHTML = projectsHTML;

    // Re-observe elements for scroll animations after rendering new content
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.project-card').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

/**
 * Sets the new project filter and re-renders the projects.
 * @param {string} newFilter - The category to filter by.
 */
function setFilter(newFilter) {
    currentFilter = newFilter;

    // Update active state on filter buttons
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === newFilter) {
            btn.classList.add('active');
        }
    });

    renderProjects();
}

/**
 * Attaches event listeners to the filter buttons.
 */
function setupFilterButtons() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            setFilter(filter);
        });
    });
}

// =================================================================
// STELLAR 3D SLIDE NAVIGATOR LOGIC
// =================================================================

/**
 * Generates the HTML string for a single testimonial slide.
 * @param {object} testimonial - The testimonial data object.
 * @param {number} index - The index of the testimonial.
 * @returns {string} The HTML string for the slide.
 */
function createSlideHTML(testimonial, index) {
    const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
    const rotateY = (360 / SLIDE_COUNT) * index;
    const transform = `rotateY(${rotateY}deg) translateZ(${RADIUS}px)`;

    return `
        <div class="carousel-slide" style="transform: ${transform};" data-index="${index}">
            <div class="slide-quote">
                <i class="fas fa-quote-left"></i>
                <p>"${testimonial.quote}"</p>
                <i class="fas fa-quote-right"></i>
            </div>
            <div class="slide-author">${testimonial.author}</div>
            <div class="slide-role">${testimonial.role} at ${testimonial.company}</div>
            <div class="slide-rating">${stars}</div>
        </div>
    `;
}

/**
 * Renders all testimonial slides to the 3D track.
 */
function renderSlides() {
    if (!carouselTrack) return;

    // Generate HTML for all slides
    const slidesHTML = testimonials.map(createSlideHTML).join('');
    carouselTrack.innerHTML = slidesHTML;
}

/**
 * Renders the navigation dots for the carousel.
 */
function renderDots() {
    if (!carouselDots) return;

    carouselDots.innerHTML = ''; // Clear existing dots

    testimonials.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('carousel-dot');
        if (index === currentSlide) {
            dot.classList.add('active');
        }
        dot.dataset.index = index;
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
        carouselDots.appendChild(dot);
    });
}

/**
 * Updates the 3D position of the carousel track to show the target slide.
 * @param {number} index - The index of the slide to show.
 */
function goToSlide(index) {
    currentSlide = (index % SLIDE_COUNT + SLIDE_COUNT) % SLIDE_COUNT;

    // Calculate the rotation needed to bring the current slide to the front
    const rotateY = (360 / SLIDE_COUNT) * currentSlide;
    carouselTrack.style.transform = `translateZ(-${RADIUS}px) rotateY(-${rotateY}deg)`;

    // Update active dot
    document.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
    });
}

/**
 * Attaches event listeners to the navigation controls.
 */
function setupCarouselControls() {
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });
    }
}

/**
 * Initializes all components of the 3D Slide Navigator.
 */
function setupSlideNavigator() {
    // Set the initial perspective on the container
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        // Set the center of the 3D space to the center of the track for correct rotation
        carouselContainer.style.transformOrigin = `center center -${RADIUS}px`;
    }

    renderSlides();
    renderDots();
    goToSlide(currentSlide); // Show the first slide
    setupCarouselControls();
}

// =================================================================
// MOBILE MENU SETUP (Copied from script.js for consistency)
// =================================================================

/**
 * Handles the opening and closing of the mobile navigation menu.
 */
function setupMobileMenu() {
    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        menuToggle.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', menuToggle.classList.contains('open'));
    });

    // Close menu when a navigation link is clicked
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// =================================================================
// SMOOTH SCROLLING (Copied from script.js for consistency)
// =================================================================

/**
 * Smoothly scrolls to the target section when an anchor link is clicked.
 */
const setupSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

// =================================================================
// INITIALIZATION
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup project filtering and rendering
    renderProjects();
    setupFilterButtons();

    // 2. Setup 3D Testimonial Slide Navigator
    setupSlideNavigator();

    // 3. Setup general UI elements
    setupMobileMenu();
    setupSmoothScrolling();

    console.log('✓ Portfolio script loaded successfully with 3D Slide Navigator!');
});
