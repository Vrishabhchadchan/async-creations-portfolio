document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('loaded'), 300);
  });
  // fallback in case 'load' already fired / slow assets
  setTimeout(() => preloader && preloader.classList.add('loaded'), 2500);

  /* ---------- Cursor glow (desktop only) ---------- */
  const cursorGlow = document.getElementById('cursorGlow');
  const isFinePointer = window.matchMedia('(pointer:fine)').matches;
  if (isFinePointer && cursorGlow) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  } else if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  const toTop = document.getElementById('toTop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }));

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navObserver.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + (progress === 1 && target >= 100 ? '+' : '');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => countObserver.observe(c));

  /* ---------- Service card video playback & 3D tilt ---------- */
  const serviceCards = document.querySelectorAll('.service-card');
  const isTouchDevice = !window.matchMedia('(hover: hover)').matches;

  serviceCards.forEach(card => {
    const video = card.querySelector('.service-bg-video');
    let leaveTimeout = null;

    const playVideo = () => {
      if (!video) return;
      clearTimeout(leaveTimeout);

      if (!video.src && video.getAttribute('data-src')) {
        video.src = video.getAttribute('data-src');
        video.load();
      }

      video.play().then(() => {
        video.classList.add('playing');
      }).catch(() => {
        // Autoplay policy or unsupported format fallback
        video.classList.add('playing');
      });
    };

    const stopVideo = () => {
      if (!video) return;
      video.classList.remove('playing');
      leaveTimeout = setTimeout(() => {
        if (!card.matches(':hover')) {
          video.pause();
        }
      }, 500);
    };

    if (!isTouchDevice) {
      card.addEventListener('mouseenter', playVideo);
      card.addEventListener('mouseleave', () => {
        stopVideo();
        card.style.transform = '';
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');

        // Subtle 3D camera parallax tilt (max ±5 degrees)
        const tiltX = ((y - 0.5) * -8).toFixed(2);
        const tiltY = ((x - 0.5) * 8).toFixed(2);
        card.style.transform = `perspective(900px) translateY(-8px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      });
    } else if (video) {
      // Mobile touch preview via IntersectionObserver
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            playVideo();
          } else {
            stopVideo();
          }
        });
      }, { threshold: 0.6 });
      cardObserver.observe(card);
    }
  });

  /* ---------- Gallery: fetched live from the team portal's manifest ---------- */
  const galleryEl = document.getElementById('gallery');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCat = document.getElementById('lightboxCat');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let visibleItems = [];
  let currentIndex = 0;

  const getBg = (el) => {
    const style = el.style.backgroundImage;
    const match = style.match(/url\(["']?(.*?)["']?\)/);
    return match ? match[1] : '';
  };

  const openLightbox = (index) => {
    const items = Array.from(galleryEl.querySelectorAll('.gallery-item')).filter(i => !i.classList.contains('hide'));
    visibleItems = items;
    const item = visibleItems[index];
    if (!item) return;
    currentIndex = index;
    const media = item.querySelector('.tile-media');
    const bg = getBg(media);
    lightboxImg.src = bg || 'images/icon/logo-icon-400.png';
    lightboxCat.textContent = item.querySelector('.tile-cat')?.textContent || '';
    lightboxTitle.textContent = item.querySelector('.tile-title')?.textContent || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  lightboxPrev.addEventListener('click', () => openLightbox((currentIndex - 1 + visibleItems.length) % visibleItems.length));
  lightboxNext.addEventListener('click', () => openLightbox((currentIndex + 1) % visibleItems.length));
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox((currentIndex - 1 + visibleItems.length) % visibleItems.length);
    if (e.key === 'ArrowRight') openLightbox((currentIndex + 1) % visibleItems.length);
  });

  const activeFilter = () => document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';

  const applyFilter = () => {
    const filter = activeFilter();
    galleryEl.querySelectorAll('.gallery-item').forEach(item => {
      const match = filter === 'all' || item.getAttribute('data-cat') === filter;
      item.classList.toggle('hide', !match);
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter();
    });
  });

  const bindGalleryClicks = () => {
    galleryEl.querySelectorAll('.gallery-item').forEach((item) => {
      item.addEventListener('click', () => {
        const items = Array.from(galleryEl.querySelectorAll('.gallery-item')).filter(i => !i.classList.contains('hide'));
        const idx = items.indexOf(item);
        openLightbox(idx);
      });
    });
  };

  fetch('/api/gallery')
    .then((r) => { if (!r.ok) throw new Error('Request failed'); return r.json(); })
    .then(({ items }) => {
      if (!Array.isArray(items) || !items.length) {
        galleryEl.innerHTML = '<div class="gallery-loading">Our work is on its way — check back soon.</div>';
        return;
      }
      galleryEl.innerHTML = items.map((item) => window.GalleryShared.galleryTileHTML(item)).join('');
      applyFilter();
      bindGalleryClicks();
    })
    .catch(() => {
      galleryEl.innerHTML = '<div class="gallery-loading">Couldn\'t load the gallery right now — please refresh.</div>';
    });

  /* ---------- Testimonial auto-scroll marquee ---------- */
  const tTrack = document.querySelector('.t-track');
  if (tTrack) {
    let pos = 0;
    let paused = false;
    const wrap = document.querySelector('.t-track-wrap');
    wrap.addEventListener('mouseenter', () => paused = true);
    wrap.addEventListener('mouseleave', () => paused = false);
    const step = () => {
      if (!paused) {
        pos -= 0.4;
        const maxScroll = tTrack.scrollWidth / 2;
        if (Math.abs(pos) >= maxScroll) pos = 0;
        tTrack.style.transform = `translateX(${pos}px)`;
      }
      requestAnimationFrame(step);
    };
    // duplicate testimonial cards for seamless loop
    tTrack.innerHTML += tTrack.innerHTML;
    requestAnimationFrame(step);
  }

  /* ---------- Contact form (front-end only) ---------- */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formSuccess.classList.add('show');
      contactForm.reset();
      setTimeout(() => formSuccess.classList.remove('show'), 6000);
    });
  }

  /* ---------- Executive Dossier interactive tabs ---------- */
  document.querySelectorAll('.dossier-card').forEach(card => {
    const tabBtns = card.querySelectorAll('.dossier-tab-btn');
    const panels = card.querySelectorAll('.dossier-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.toggle('active', b === btn));
        panels.forEach(p => {
          const match = p.getAttribute('data-panel') === targetTab;
          p.classList.toggle('active', match);
        });
      });
    });
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
