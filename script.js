// GND Studios — Tasteful Minimalist Motion, Scroll Parallax & Micro-Interactions
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);

  // Smooth in-page navigation without leaving stale #hashes in the URL
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      if (id === 'top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollLine = document.getElementById('scrollLine');
  const siteNav = document.getElementById('siteNav');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const parallaxDevices = document.querySelectorAll('.device-parallax');
  const sections = ['apps', 'services', 'founders', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  // 1. Scroll Progress, Navbar Border, Active Tab & Gentle Device Parallax
  let ticking = false;
  const updateOnScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollLine) {
      scrollLine.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;
    }
    if (siteNav) {
      siteNav.classList.toggle('scrolled', y > 16);
    }

    let current = '';
    for (const sec of sections) {
      if (y >= sec.offsetTop - 180) current = sec.id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });

    // Subtle scroll-linked parallax on phone mockups (±14px max)
    if (!prefersReduced) {
      const vh = window.innerHeight;
      parallaxDevices.forEach(el => {
        const rect = el.getBoundingClientRect();
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh; // -1 to 1
        const offset = Math.max(-16, Math.min(16, progress * 18));
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });
  updateOnScroll();

  // 2. Smooth Scroll-Triggered Reveals
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = Number(entry.target.dataset.delay || 0);
          setTimeout(() => entry.target.classList.add('revealed'), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // 3. Animated Hairline Dividers (draw left -> right on scroll)
  const lineObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('line-drawn');
          lineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );
  document.querySelectorAll('.hairline').forEach(el => lineObserver.observe(el));

  // 4. Subtle Magnetic Pull on Pill Buttons (desktop only)
  if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = ((e.clientX - r.left) / r.width - 0.5) * 8;
        const dy = ((e.clientY - r.top) / r.height - 0.5) * 6;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  // 5. Screenshot Switcher with Sliding Tab Indicator + Smooth Crossfade
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const img = gallery.querySelector('[data-gallery-img]');
    const tabBar = gallery.querySelector('.tab-bar');
    const indicator = gallery.querySelector('.tab-indicator');
    const tabs = gallery.querySelectorAll('[data-shot]');

    const moveIndicator = tab => {
      if (!indicator || !tabBar || !tab) return;
      const barRect = tabBar.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      indicator.style.left = `${tabRect.left - barRect.left}px`;
      indicator.style.width = `${tabRect.width}px`;
    };

    // Position indicator initially & on resize
    const initialActive = gallery.querySelector('.screen-tab.active');
    requestAnimationFrame(() => moveIndicator(initialActive));
    window.addEventListener('resize', () => {
      moveIndicator(gallery.querySelector('.screen-tab.active'));
    });

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('active')) return;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        moveIndicator(tab);

        if (img) {
          img.classList.add('swapping');
          setTimeout(() => {
            img.src = tab.dataset.shot;
            img.alt = tab.dataset.label || 'App Screenshot';
            img.onload = () => img.classList.remove('swapping');
            setTimeout(() => img.classList.remove('swapping'), 160);
          }, 150);
        }
      });
    });
  });

  // 6. Clean Day-Order Switcher with Staggered Row Entrance
  const schedules = [
    { day: 'Day Order 1', classes: ['09:00  Data Structures', '10:00  Java Programming', '11:15  DBMS Lab', '13:30  Discrete Math'] },
    { day: 'Day Order 2', classes: ['09:00  Operating Systems', '10:00  Python & AI Lab', '11:15  Computer Networks', '13:30  Web Tech'] },
    { day: 'Day Order 3', classes: ['09:00  Software Eng.', '10:00  Android Dev', '11:15  SQL Workshop', '13:30  Project Hour'] }
  ];
  let idx = 0;
  const dayTitle = document.getElementById('dayOrderTitle');
  const dayList = document.getElementById('dayOrderSlots');
  const dayBtn = document.getElementById('nextDayOrderBtn');

  const renderDay = () => {
    if (!dayTitle || !dayList) return;
    const item = schedules[idx];
    dayTitle.textContent = item.day;
    dayList.innerHTML = item.classes
      .map(
        (c, i) =>
          `<div class="day-row py-2.5 border-b border-zinc-800/90 text-xs text-zinc-300 font-mono-label" style="animation-delay:${i * 55}ms">${c}</div>`
      )
      .join('');
  };
  if (dayBtn) {
    dayBtn.addEventListener('click', () => {
      idx = (idx + 1) % schedules.length;
      renderDay();
    });
    renderDay();
  }

  // 7. Live Chennai (IST) Clock
  const istClock = document.getElementById('istClock');
  const updateClock = () => {
    if (!istClock) return;
    try {
      const now = new Date();
      const ist = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      istClock.textContent = `The New College · ${ist} IST`;
    } catch {
      istClock.textContent = 'The New College · IST (UTC+5:30)';
    }
  };
  updateClock();
  setInterval(updateClock, 30000);

  // 8. Fullscreen Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.device-screen[data-zoomable]').forEach(screen => {
    screen.addEventListener('click', () => {
      const img = screen.querySelector('img');
      if (!img || !lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });

  const closeBox = () => lightbox && lightbox.classList.remove('open');
  if (lightboxClose) lightboxClose.addEventListener('click', closeBox);
  if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeBox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBox(); });

  // 9. Toast + Copy Email
  const toast = document.getElementById('toast');
  const showToast = msg => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  };

  document.querySelectorAll('[data-copy-email]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('gndstudious@gmail.com');
        showToast('Copied gndstudious@gmail.com');
      } catch {
        showToast('gndstudious@gmail.com');
      }
    });
  });

  // 10. Contact Form -> Mailto
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('cfName').value.trim();
      const email = document.getElementById('cfEmail').value.trim();
      const message = document.getElementById('cfMessage').value.trim();
      const subject = encodeURIComponent(`GND Studios Inquiry — ${name}`);
      const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
      window.location.href = `mailto:gndstudious@gmail.com?subject=${subject}&body=${body}`;
      showToast('Opening email client...');
    });
  }

  // 11. Mobile Menu
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));
  }
});
