(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WHATSAPP = '919605327757';

  /* Reveal on scroll, children staggered */
  const revealEls = document.querySelectorAll('[data-reveal]');
  revealEls.forEach((el) => {
    [...el.children].forEach((child, i) => child.style.setProperty('--i', i));
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* Navigation: hide on scroll down, current section, mobile menu */
  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const progressBar = document.getElementById('progressBar');
  const toTop = document.getElementById('toTop');
  let lastY = window.scrollY;

  const closeMenu = () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  };

  navToggle.addEventListener('click', () => {
    const open = !navLinks.classList.contains('is-open');
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    nav.classList.remove('is-hidden');
  });
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) closeMenu();
  });

  const sectionLinks = [...navLinks.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = sectionLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const parallaxImgs = document.querySelectorAll('[data-parallax]');

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    nav.classList.toggle('is-scrolled', y > 10);
    if (!navLinks.classList.contains('is-open')) {
      nav.classList.toggle('is-hidden', y > lastY && y > 400);
    }
    lastY = y;

    toTop.classList.toggle('is-visible', y > window.innerHeight * 1.2);

    const mark = y + window.innerHeight * 0.35;
    let current = null;
    sections.forEach((s) => { if (s.offsetTop <= mark) current = s; });
    sectionLinks.forEach((a) => {
      a.classList.toggle('is-current', current && a.getAttribute('href') === `#${current.id}`);
    });

    if (!reduceMotion) {
      parallaxImgs.forEach((img) => {
        const box = img.parentElement.getBoundingClientRect();
        if (box.bottom < 0 || box.top > window.innerHeight) return;
        const progress = (box.top + box.height) / (window.innerHeight + box.height);
        const shift = (progress - 0.5) * box.height * 0.2 - box.height * 0.1;
        img.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      });
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Hero slideshow */
  const slides = [...document.querySelectorAll('#heroSlides img')];
  const dotsWrap = document.getElementById('heroDots');
  const caption = document.getElementById('heroCaption');
  const SLIDE_MS = 6000;
  let slideIndex = 0;
  let slideTimer;
  document.documentElement.style.setProperty('--slide-ms', `${SLIDE_MS}ms`);

  const dots = slides.map((img, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Photo ${i + 1}: ${img.dataset.caption}`);
    b.addEventListener('click', () => { showSlide(i); restartTimer(); });
    dotsWrap.appendChild(b);
    return b;
  });

  function showSlide(i) {
    slides[slideIndex].classList.remove('is-active');
    dots[slideIndex].classList.remove('is-active');
    dots[slideIndex].setAttribute('aria-selected', 'false');
    slideIndex = (i + slides.length) % slides.length;
    const img = slides[slideIndex];
    img.loading = 'eager';
    img.classList.add('is-active');
    const dot = dots[slideIndex];
    dot.setAttribute('aria-selected', 'true');
    void dot.offsetWidth;
    dot.classList.add('is-active');
    caption.classList.add('is-swapping');
    setTimeout(() => {
      caption.textContent = img.dataset.caption;
      caption.classList.remove('is-swapping');
    }, 300);
  }
  function restartTimer() {
    clearInterval(slideTimer);
    if (!reduceMotion) slideTimer = setInterval(() => showSlide(slideIndex + 1), SLIDE_MS);
  }
  dots[0].classList.add('is-active');
  dots[0].setAttribute('aria-selected', 'true');
  slides.slice(1).forEach((img) => { img.loading = 'eager'; });
  restartTimer();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(slideTimer); else restartTimer();
  });

  /* Counting figures */
  const counters = document.querySelectorAll('[data-count]');
  const countIO = 'IntersectionObserver' in window && !reduceMotion
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const end = Number(el.dataset.count);
          const start = Number(el.dataset.from || 0);
          const duration = 1600;
          const t0 = performance.now();
          const step = (t) => {
            const p = Math.min((t - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(start + (end - start) * eased);
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          countIO.unobserve(el);
        });
      }, { threshold: 0.6 })
    : null;
  if (countIO) counters.forEach((el) => countIO.observe(el));

  /* How the mission works: list drives the picture */
  const workButtons = [...document.querySelectorAll('#workList button')];
  const workImg = document.getElementById('workImg');
  let workSwap;
  const activateWork = (btn) => {
    if (btn.classList.contains('is-active')) return;
    workButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
    clearTimeout(workSwap);
    workImg.classList.add('is-fading');
    const next = new Image();
    next.src = btn.dataset.img;
    workSwap = setTimeout(() => {
      workImg.src = btn.dataset.img;
      workImg.alt = btn.dataset.alt;
      const done = () => workImg.classList.remove('is-fading');
      if (workImg.complete) requestAnimationFrame(done); else workImg.onload = done;
    }, 280);
  };
  workButtons.forEach((btn) => {
    btn.addEventListener('click', () => activateWork(btn));
    btn.addEventListener('focus', () => activateWork(btn));
    btn.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover)').matches) activateWork(btn);
    });
  });

  /* Gallery filter */
  const tiles = [...document.querySelectorAll('#galleryGrid .tile')];
  const filterButtons = document.querySelectorAll('.filters button');
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filterButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
      let n = 0;
      tiles.forEach((tile) => {
        const show = f === 'all' || tile.dataset.cat === f;
        tile.classList.toggle('is-hidden', !show);
        tile.classList.remove('is-entering');
        if (show) {
          tile.style.setProperty('--i', n++);
          void tile.offsetWidth;
          tile.classList.add('is-entering');
        }
      });
    });
  });

  /* Lightbox */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  let lbIndex = 0;
  let lastFocus = null;
  const visibleTiles = () => tiles.filter((t) => !t.classList.contains('is-hidden'));

  const setLightbox = (i, animate) => {
    const list = visibleTiles();
    lbIndex = (i + list.length) % list.length;
    const tile = list[lbIndex];
    const apply = () => {
      lbImg.src = tile.getAttribute('href');
      lbImg.alt = tile.querySelector('img').alt;
      lbCaption.textContent = tile.dataset.caption;
      lbImg.classList.remove('is-fading');
    };
    if (animate) { lbImg.classList.add('is-fading'); setTimeout(apply, 200); } else apply();
  };
  const openLightbox = (tile) => {
    lastFocus = document.activeElement;
    setLightbox(visibleTiles().indexOf(tile), false);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    lightbox.querySelector('.lightbox__close').focus();
  };
  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { lightbox.hidden = true; }, 350);
    if (lastFocus) lastFocus.focus();
  };

  tiles.forEach((tile) => {
    tile.addEventListener('click', (e) => { e.preventDefault(); openLightbox(tile); });
  });
  lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox__prev').addEventListener('click', () => setLightbox(lbIndex - 1, true));
  lightbox.querySelector('.lightbox__next').addEventListener('click', () => setLightbox(lbIndex + 1, true));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') setLightbox(lbIndex - 1, true);
    if (e.key === 'ArrowRight') setLightbox(lbIndex + 1, true);
  });
  let touchX = null;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) setLightbox(lbIndex + (dx < 0 ? 1 : -1), true);
    touchX = null;
  });

  /* Prayer request: opens WhatsApp with the message written out */
  const form = document.getElementById('prayerForm');
  const note = document.getElementById('formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const message = (data.get('message') || '').trim();
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));

    const missing = [];
    if (!name) missing.push(form.elements.name);
    if (!message) missing.push(form.elements.message);
    if (missing.length) {
      missing.forEach((el) => el.classList.add('is-invalid'));
      missing[0].focus();
      note.textContent = 'Please add your name and your request.';
      note.classList.add('is-error');
      return;
    }

    const lines = [
      'Prayer request – Global Missions India',
      '',
      `Name: ${name}`,
      data.get('phone') ? `Phone: ${data.get('phone').trim()}` : null,
      data.get('place') ? `Place: ${data.get('place').trim()}` : null,
      `Pray for: ${data.get('topic')}`,
      data.get('private') ? 'Please keep this confidential.' : null,
      '',
      message,
    ].filter((l) => l !== null);

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    note.classList.remove('is-error');
    note.textContent = 'WhatsApp is opening with your request. Thank you, we will pray with you.';
    form.reset();
  });
})();
