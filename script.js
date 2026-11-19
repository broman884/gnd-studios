// GND Studios — Minimalist Scroll Actions, Screenshot Switchers & Interactions
document.addEventListener('DOMContentLoaded', () => {
  const scrollLine = document.getElementById('scrollLine');
  const siteNav = document.getElementById('siteNav');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = ['apps', 'founders', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  // 1. Crisp 1px Scroll Progress + Navbar Border + Active Section Highlight
  const onScroll = () => {
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
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // 3. Minimal Screenshot Switcher (Pulse & CancelIt)
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const img = gallery.querySelector('[data-gallery-img]');
    const tabs = gallery.querySelectorAll('[data-shot]');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (img) {
          img.style.opacity = '0.2';
          setTimeout(() => {
            img.src = tab.dataset.shot;
            img.alt = tab.dataset.label || 'App Screenshot';
            img.style.opacity = '1';
          }, 120);
        }
      });
    });
  });

  // 4. Clean Day-Order Schedule Switcher
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
      .map(c => `<div class="py-2.5 border-b border-zinc-800/90 text-xs text-zinc-300 font-mono-label">${c}</div>`)
      .join('');
  };
  if (dayBtn) {
    dayBtn.addEventListener('click', () => {
      idx = (idx + 1) % schedules.length;
      renderDay();
    });
    renderDay();
  }

  // 5. Fullscreen Lightbox
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

  // 6. Toast + Copy Email
  const toast = document.getElementById('toast');
  const showToast = msg => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
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

  // 7. Contact Form -> Mailto
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

  // 8. Mobile Menu
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));
  }
});
