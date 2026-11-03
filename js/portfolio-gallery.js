(() => {
  'use strict';
  const data = window.ASONYX_PORTFOLIO;
  const gallery = document.getElementById('projectGallery');
  if (!data || !gallery) return;
  const categories = data.categories.filter(c => c.id === 'all' || data.projects.some(p => p.category === c.id));
  const types = data.types;
  const $ = (id) => document.getElementById(id);
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const categoryLabel = (id) => categories.find((c) => c.id === id)?.label || id;
  const typeLabel = (id) => types.find((t) => t.id === id)?.label || id;
  const params = new URLSearchParams(location.search);
  const state = {
    type: types.some((t) => t.id === params.get('type')) ? params.get('type') : 'all',
    category: categories.some((c) => c.id === params.get('category')) ? params.get('category') : 'all',
    query: (params.get('q') || '').slice(0, 200),
    vercel: params.get('vercel') === '1',
    sort: ['curated', 'newest', 'az'].includes(params.get('sort')) ? params.get('sort') : 'curated',
    view: params.get('view') === 'list' ? 'list' : 'grid'
  };
  const projects = data.projects.map((p, index) => ({ ...p, index }));
  const cards = new Map();
  let visible = [];
  let currentProject = null;
  let previewOpener = null;
  let previewTimer;
  const dialog = $('previewDialog');
  const frame = $('previewFrame');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function saveState() {
    const url = new URL(location.href);
    for (const key of ['type', 'category', 'q', 'vercel', 'sort', 'view']) url.searchParams.delete(key);
    if (state.type !== 'all') url.searchParams.set('type', state.type);
    if (state.category !== 'all') url.searchParams.set('category', state.category);
    if (state.query) url.searchParams.set('q', state.query);
    if (state.vercel) url.searchParams.set('vercel', '1');
    if (state.sort !== 'curated') url.searchParams.set('sort', state.sort);
    if (state.view !== 'grid') url.searchParams.set('view', state.view);
    history.replaceState(null, '', url);
  }

  function cardMarkup(p) {
    return `<article class="work-card" style="--project-color:${escape(p.color)}" data-project="${escape(p.id)}">
      <button type="button" class="card-visual" data-preview="${escape(p.id)}" aria-label="Preview ${escape(p.name)} website">
        <span class="card-fallback" aria-hidden="true"><span>${escape(p.mark)}</span><small>${escape(p.name)}</small></span>
        <img src="images/portfolio/${escape(p.id)}.webp" srcset="images/portfolio/${escape(p.id)}-480.webp 480w, images/portfolio/${escape(p.id)}.webp 960w" sizes="(max-width: 640px) 89vw, (max-width: 900px) 44vw, 30vw" alt="${escape(p.name)} website screenshot" width="960" height="627" loading="lazy" decoding="async">
        <span class="card-topline"><span class="card-number">${String(p.index + 1).padStart(2, '0')} / ASONYX</span><span class="live-badge"><span></span> LIVE SITE</span></span>
        <span class="card-preview-label">${icon('eye')} Step inside</span>
        <span class="card-bottomline"><span class="card-visual-arrow">${icon('diagonal')}</span></span>
      </button>
      <div class="card-body"><div class="card-category"><span>${escape(typeLabel(p.type))}</span><span class="card-industry">${escape(categoryLabel(p.category))}</span></div>
        <div class="card-title-row"><h3><button type="button" data-preview="${escape(p.id)}">${escape(p.name)}</button></h3></div>
        <p>${escape(p.description)}</p>
        <div class="card-link-row"><a class="site-link" href="${escape(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${escape(p.name)} website"><span class="site-link-dot"></span><span class="site-link-text">${escape(new URL(p.url).hostname.replace(/^www\./, ''))}</span>${icon('diagonal')}</a><button class="card-preview-button" type="button" data-preview="${escape(p.id)}">${icon('eye')} ${p.type === 'menu' ? 'Preview menu' : 'Preview'}</button></div>
      </div></article>`;
  }

  $('typeFilters').innerHTML = types.map((t) => {
    const count = t.id === 'all' ? projects.length : projects.filter((p) => p.type === t.id).length;
    return `<button type="button" data-type="${t.id}" aria-pressed="${t.id === state.type}">${escape(t.id === 'all' ? 'All work' : t.label)} <span>${count}</span></button>`;
  }).join('');
  $('projectIndustry').innerHTML = categories.map(c => `<option value="${c.id}">${escape(c.id === 'all' ? 'All industries' : c.label)}</option>`).join('');
  gallery.innerHTML = projects.map(cardMarkup).join('');
  gallery.querySelectorAll('.work-card').forEach((card) => cards.set(card.dataset.project, card));
  document.querySelectorAll('[data-project-total]').forEach((el) => { el.textContent = projects.length; });
  document.querySelectorAll('[data-category-total]').forEach((el) => { el.textContent = String(categories.length - 1).padStart(2, '0'); });
  $('vercelCount').textContent = projects.filter((p) => p.vercel).length;
  $('projectSearch').value = state.query;
  $('projectSort').value = state.sort;
  $('vercelFilter').checked = state.vercel;
  $('projectIndustry').value = state.category;
  $('extraFilters').open = state.vercel;

  const revealObserver = 'IntersectionObserver' in window && !reducedMotion.matches ? new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.06, rootMargin: '0px 0px 70px 0px' }) : null;

  const filterAnimations = new Map();
  function filterProjects(updateUrl = true, animate = true) {
    filterAnimations.forEach(animation => animation.cancel());
    filterAnimations.clear();
    const query = state.query.trim().toLocaleLowerCase();
    visible = projects.filter((p) => (state.type === 'all' || p.type === state.type) && (state.category === 'all' || p.category === state.category) && (!state.vercel || p.vercel) && (!query || [p.name, p.description, typeLabel(p.type), categoryLabel(p.category), ...p.tags, ...p.stack, ...p.sources.map((s) => s.repo)].join(' ').toLocaleLowerCase().includes(query)));
    if (state.sort === 'az') visible.sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === 'newest') visible.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.index - b.index);
    const ids = new Set(visible.map((p) => p.id));
    cards.forEach((card, id) => { card.hidden = !ids.has(id); });
    visible.forEach((p, i) => {
      const card = cards.get(p.id);
      card.style.setProperty('--reveal-delay', `${Math.min(i % 3, 2) * 60}ms`);
      gallery.append(card);
      if (revealObserver && !card.classList.contains('is-visible')) { card.classList.add('will-reveal'); revealObserver.observe(card); }
    });
    gallery.dataset.view = state.view;
    document.querySelectorAll('.view-switch [data-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === state.view)));
    document.querySelectorAll('[data-type]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.type === state.type)));
    const label = state.type === 'all' ? 'Selected work' : typeLabel(state.type);
    $('resultsCount').innerHTML = `<strong>${String(visible.length).padStart(2, '0')}</strong> ${visible.length === 1 ? 'project' : 'projects'} <span>/</span> ${escape(label)}${state.category === 'all' ? '' : ` · ${escape(categoryLabel(state.category))}`}${state.vercel ? ' · Vercel' : ''}${query ? ` · “${escape(state.query.trim())}”` : ''}`;
    $('emptyState').hidden = visible.length !== 0;
    $('clearFilters').hidden = state.type === 'all' && state.category === 'all' && !state.query && !state.vercel && state.sort === 'curated';
    $('extraFilters').classList.toggle('has-active-filter', state.vercel);
    if (updateUrl && animate && !reducedMotion.matches) {
      visible.forEach((p, i) => {
        const card = cards.get(p.id);
        const rect = card.getBoundingClientRect();
        if (rect.top < innerHeight && rect.bottom > 0 && i < 12) {
          card.classList.add('is-visible');
          revealObserver?.unobserve(card);
          filterAnimations.set(p.id, card.animate([{ opacity: .15, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 380, delay: Math.min(i, 3) * 35, easing: 'cubic-bezier(.2,.7,.2,1)' }));
        }
      });
    }
    if (updateUrl) saveState();
    if (updateUrl && gallery.getBoundingClientRect().top < document.querySelector('.work-header').offsetHeight) {
      const target = gallery.getBoundingClientRect().top + scrollY - document.querySelector('.work-header').offsetHeight - document.querySelector('.browse-panel').offsetHeight - 48;
      window.scrollTo({ top: Math.max(0, target), behavior: reducedMotion.matches || !animate ? 'instant' : 'smooth' });
    }
  }

  function resetFilters() {
    Object.assign(state, { type: 'all', category: 'all', query: '', vercel: false, sort: 'curated' });
    $('projectSearch').value = '';
    $('projectSort').value = 'curated';
    $('vercelFilter').checked = false;
    $('projectIndustry').value = 'all';
    filterProjects();
  }
  $('typeFilters').addEventListener('click', (event) => {
    const button = event.target.closest('[data-type]');
    if (button) { state.type = button.dataset.type; state.category = 'all'; $('projectIndustry').value = 'all'; filterProjects(); }
  });
  document.querySelectorAll('[data-type-shortcut]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    resetFilters();
    state.type = link.dataset.typeShortcut;
    filterProjects();
    $('collection').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }));
  $('projectIndustry').addEventListener('change', event => { state.category = event.target.value; filterProjects(); });
  $('projectSearch').addEventListener('input', (event) => { state.query = event.target.value.slice(0, 200); filterProjects(true, false); });
  $('projectSort').addEventListener('change', (event) => { state.sort = event.target.value; filterProjects(); });
  $('vercelFilter').addEventListener('change', (event) => { state.vercel = event.target.checked; filterProjects(); });
  $('clearFilters').addEventListener('click', resetFilters);
  $('resetEmpty').addEventListener('click', () => { resetFilters(); $('projectSearch').focus(); });
  document.querySelector('.view-switch').addEventListener('click', (event) => {
    const button = event.target.closest('[data-view]');
    if (button) { state.view = button.dataset.view; filterProjects(); }
  });

  function imageFallback(img) {
    img.hidden = true;
    img.parentElement.classList.add('image-unavailable');
  }
  gallery.querySelectorAll('img').forEach((img) => { img.addEventListener('error', () => imageFallback(img)); if (img.complete && !img.naturalWidth) imageFallback(img); });
  $('spotlightImage').addEventListener('error', (event) => imageFallback(event.currentTarget));
  $('spotlightTabs').innerHTML = projects.slice(0, 3).map((p, i) => `<button type="button" data-spotlight="${escape(p.id)}" aria-pressed="${i === 0}"><span>${String(i + 1).padStart(2, '0')}</span> ${escape(p.spotlightLabel || p.name)}</button>`).join('');
  document.querySelectorAll('[data-spotlight]').forEach((button, index) => button.addEventListener('click', () => {
    const p = projects.find((item) => item.id === button.dataset.spotlight);
    document.querySelectorAll('[data-spotlight]').forEach((tab) => tab.setAttribute('aria-pressed', String(tab === button)));
    $('spotlightOpen').dataset.preview = p.id;
    $('spotlightOpen').setAttribute('aria-label', `Preview ${p.name}`);
    $('spotlightOpen').style.setProperty('--spotlight-color', p.color);
    $('spotlightImage').hidden = false;
    $('spotlightImage').alt = `${p.name} website screenshot`;
    $('spotlightImage').src = `images/portfolio/${p.id}.webp`;
    $('spotlightImage').srcset = `images/portfolio/${p.id}-480.webp 480w, images/portfolio/${p.id}.webp 960w`;
    $('spotlightArt').classList.remove('image-unavailable');
    document.querySelector('.spotlight-fallback').textContent = p.mark;
    $('spotlightIndex').textContent = `${String(index + 1).padStart(2, '0')} / 03`;
    $('spotlightName').textContent = p.name;
    $('spotlightCategory').textContent = categoryLabel(p.category);
    if (!reducedMotion.matches) $('spotlightArt').animate([{ opacity: 0.35, transform: 'scale(1.03)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 400, easing: 'ease-out' });
  }));

  function setDevice(device) {
    $('previewViewport').dataset.device = device;
    document.querySelectorAll('[data-device]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.device === device)));
  }

  function setTab(tab) {
    const live = tab === 'live';
    $('livePanel').hidden = !live;
    $('detailsPanel').hidden = live;
    $('liveTab').setAttribute('aria-selected', String(live));
    $('detailsTab').setAttribute('aria-selected', String(!live));
    $('liveTab').tabIndex = live ? 0 : -1;
    $('detailsTab').tabIndex = live ? -1 : 0;
    document.querySelector('.device-switch').hidden = !live;
    if (live && currentProject && frame.getAttribute('src') !== currentProject.url) loadFrame(currentProject);
  }

  function loadFrame(p) {
    clearTimeout(previewTimer);
    $('previewLoading').hidden = false;
    $('previewMessage').textContent = 'Some websites limit embedded previews. You can always open the full website.';
    frame.onload = () => { if (dialog.open) { clearTimeout(previewTimer); $('previewLoading').hidden = true; } };
    frame.onerror = () => { clearTimeout(previewTimer); $('previewLoading').hidden = true; $('previewMessage').textContent = 'This preview could not load here. Open the website in a new tab to explore it.'; };
    frame.title = `${p.name} — live website preview`;
    frame.src = p.url;
    previewTimer = setTimeout(() => {
      $('previewLoading').hidden = true;
      $('previewMessage').textContent = 'Still waiting, or seeing a blank page? Open the full website in a new tab.';
    }, 10000);
  }

  function renderDetails(p) {
    $('detailsPanel').innerHTML = `<div class="detail-intro" style="--project-color:${escape(p.color)}"><span class="eyebrow">${escape(categoryLabel(p.category))}</span><h3>${escape(p.name)}</h3><p class="detail-line">${escape(p.line)}</p><p>${escape(p.description)}</p><a href="${escape(p.url)}" target="_blank" rel="noopener noreferrer" class="work-button">Explore the website ${icon('diagonal')}</a>${p.vercel && p.vercel !== p.url ? `<a href="${escape(p.vercel)}" target="_blank" rel="noopener noreferrer" class="detail-alt-link">Open Vercel preview ↗</a>` : ''}</div>
    <div class="detail-art"><img src="images/portfolio/${escape(p.id)}.webp" alt="${escape(p.name)} website" width="960" height="627" loading="lazy">${p.note ? `<p class="detail-note">${escape(p.note)}</p>` : ''}</div>`;
  }

  function previewSequence() {
    return visible.some((p) => p.id === currentProject?.id) ? visible : projects;
  }

  function openProject(id, tab = 'live', opener = null) {
    const p = projects.find((item) => item.id === id);
    if (!p) return;
    currentProject = p;
    if (!dialog.open) {
      previewOpener = opener || document.activeElement;
      dialog.showModal();
      document.body.classList.add('dialog-open');
    }
    $('previewTitle').textContent = p.name;
    $('previewDomain').textContent = new URL(p.url).hostname.replace(/^www\./, '');
    $('previewExternal').href = p.url;
    $('previewExternal').innerHTML = `${p.type === 'menu' ? 'Open menu' : 'Open website'} ${icon('diagonal')}`;
    $('previewFallback').href = p.url;
    renderDetails(p);
    const sequence = previewSequence();
    const position = sequence.findIndex((item) => item.id === p.id) + 1;
    $('previewPosition').textContent = `${String(position).padStart(2, '0')} / ${String(sequence.length).padStart(2, '0')}`;
    $('previousProject').disabled = sequence.length < 2;
    $('nextProject').disabled = sequence.length < 2;
    clearTimeout(previewTimer);
    if (tab === 'details') {
      frame.onload = null;
      frame.src = 'about:blank';
    }
    setTab(tab);
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-preview], [data-details]');
    if (button) openProject(button.dataset.preview || button.dataset.details, button.dataset.details ? 'details' : 'live', button);
  });
  $('closePreview').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); }
  });
  dialog.addEventListener('close', () => {
    clearTimeout(previewTimer);
    frame.onload = null;
    frame.onerror = null;
    frame.src = 'about:blank';
    currentProject = null;
    document.body.classList.remove('dialog-open');
    previewOpener?.focus({ preventScroll: true });
  });
  $('liveTab').addEventListener('click', () => setTab('live'));
  $('detailsTab').addEventListener('click', () => setTab('details'));
  document.querySelector('.preview-tabs').addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const live = event.key === 'Home' || (event.key !== 'End' && $('liveTab').getAttribute('aria-selected') !== 'true');
      setTab(live ? 'live' : 'details');
      $(live ? 'liveTab' : 'detailsTab').focus();
    }
  });
  document.querySelectorAll('[data-device]').forEach((button) => button.addEventListener('click', () => setDevice(button.dataset.device)));
  function moveProject(direction) {
    const sequence = previewSequence();
    const index = sequence.findIndex((p) => p.id === currentProject?.id);
    openProject(sequence[(index + direction + sequence.length) % sequence.length].id, $('detailsPanel').hidden ? 'live' : 'details');
  }
  $('previousProject').addEventListener('click', () => moveProject(-1));
  $('nextProject').addEventListener('click', () => moveProject(1));

  const mobileMenu = $('workMobileMenu');
  const closeMenu = () => mobileMenu.close();
  $('menuToggle').addEventListener('click', () => { mobileMenu.showModal(); $('menuToggle').setAttribute('aria-expanded', 'true'); document.body.classList.add('dialog-open'); });
  $('mobileMenuClose').addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  mobileMenu.addEventListener('close', () => { $('menuToggle').setAttribute('aria-expanded', 'false'); document.body.classList.remove('dialog-open'); });
  mobileMenu.addEventListener('click', (event) => { if (event.target === mobileMenu) { const r = mobileMenu.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right) closeMenu(); } });

  document.addEventListener('keydown', (event) => {
    const typing = event.target.matches('input, textarea, select, [contenteditable="true"]');
    if (event.key === '/' && !typing && !dialog.open && !mobileMenu.open) { event.preventDefault(); $('projectSearch').focus(); $('collection').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' }); }
    if (event.key === 'Escape' && !dialog.open) $('extraFilters').open = false;
  });
  document.addEventListener('click', event => { if (!$('extraFilters').contains(event.target)) $('extraFilters').open = false; });

  // Motion follows the visitor: native scrolling, short transitions and no
  // animation loop when the hero is out of view or reduced motion is requested.
  const hero = document.querySelector('.work-hero');
  const spotlight = $('spotlightOpen');
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      hero.classList.toggle('hero-in-view', entries[0].isIntersecting);
    }, { threshold: 0 });
    heroObserver.observe(hero);
  } else hero.classList.add('hero-in-view');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let tiltFrame;
    spotlight.addEventListener('pointermove', event => {
      if (reducedMotion.matches) return;
      cancelAnimationFrame(tiltFrame);
      const x = event.clientX, y = event.clientY;
      tiltFrame = requestAnimationFrame(() => {
        const r = spotlight.getBoundingClientRect();
        spotlight.style.setProperty('--tilt-x', `${-((y - r.top) / r.height - .5) * 5}deg`);
        spotlight.style.setProperty('--tilt-y', `${((x - r.left) / r.width - .5) * 5}deg`);
      });
    });
    spotlight.addEventListener('pointerleave', () => {
      cancelAnimationFrame(tiltFrame);
      spotlight.style.setProperty('--tilt-x', '0deg');
      spotlight.style.setProperty('--tilt-y', '0deg');
    });
  }
  let progressFrame = 0;
  function updateProgress() {
    progressFrame = 0;
    const total = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--reading-progress', total > 0 ? String(Math.min(1, Math.max(0, scrollY / total))) : '0');
  }
  window.addEventListener('scroll', () => { if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress); }, { passive: true });
  window.addEventListener('resize', () => { if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress); }, { passive: true });
  updateProgress();
  setDevice('desktop');
  document.querySelector('[data-spotlight]')?.click();
  filterProjects(false);
})();
