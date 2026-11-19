// GND Studios — Interactive Scroll Actions, Mockup Switchers, Founders Tab & Lightbox
document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('scrollProgress');
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-pill[data-section]');
  const sections = ['home', 'apps', 'founders', 'studio', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  // 1. Scroll Progress Bar + Navbar Depth + Parallax Orbs
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    if (progressBar) progressBar.style.width = `${pct}%`;

    if (navbar) {
      navbar.classList.toggle('scrolled', scrollTop > 24);
    }

    // Subtle scroll-linked parallax on ambient orbs
    if (orb1) orb1.style.transform = `translate3d(0, ${scrollTop * 0.08}px, 0)`;
    if (orb2) orb2.style.transform = `translate3d(0, ${-scrollTop * 0.06}px, 0)`;

    // Scroll-spy active tab
    let current = 'home';
    for (const sec of sections) {
      const top = sec.offsetTop - 150;
      if (scrollTop >= top) current = sec.id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 2. Scroll-Triggered Staggered Reveal Animations
  const revealItems = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('revealed'), Number(delay));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealItems.forEach(el => revealObserver.observe(el));

  // 3. Animated Metric Counters
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1100;
        const start = performance.now();

        const step = now => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(c => counterObserver.observe(c));

  // 4. Mouse-Tracking Spotlight on Glass Cards
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  // 5. Interactive Phone Screenshot Switchers (Pulse & CancelIt)
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const img = gallery.querySelector('[data-gallery-img]');
    const caption = gallery.querySelector('[data-gallery-caption]');
    const buttons = gallery.querySelectorAll('[data-shot]');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (img) {
          img.style.opacity = '0.25';
          setTimeout(() => {
            img.src = btn.dataset.shot;
            img.alt = btn.dataset.label || 'App Screenshot';
            if (caption) caption.textContent = btn.dataset.label || '';
            img.style.opacity = '1';
          }, 140);
        }
      });
    });
  });

  // 6. Interactive Day-Order App Demo Switcher
  const dayOrders = [
    { day: 'Day Order 1', slots: ['09:00 • Data Structures', '10:00 • Java Programming', '11:15 • DBMS Lab', '13:30 • Discrete Math'] },
    { day: 'Day Order 2', slots: ['09:00 • Operating Systems', '10:00 • Python & AI Lab', '11:15 • Computer Networks', '13:30 • Web Tech'] },
    { day: 'Day Order 3', slots: ['09:00 • Software Engineering', '10:00 • Mobile App Dev', '11:15 • SQL Workshop', '13:30 • Project Hour'] }
  ];
  let dayIdx = 0;
  const dayTitle = document.getElementById('dayOrderTitle');
  const daySlots = document.getElementById('dayOrderSlots');
  const nextDayBtn = document.getElementById('nextDayOrderBtn');

  const renderDayOrder = () => {
    if (!dayTitle || !daySlots) return;
    const item = dayOrders[dayIdx];
    dayTitle.textContent = item.day;
    daySlots.innerHTML = item.slots
      .map(
        s => `<div class="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-center justify-between">
          <span>${s}</span>
          <span class="text-[10px] text-emerald-400 font-semibold">ACTIVE</span>
        </div>`
      )
      .join('');
  };
  if (nextDayBtn) {
    nextDayBtn.addEventListener('click', () => {
      dayIdx = (dayIdx + 1) % dayOrders.length;
      renderDayOrder();
    });
    renderDayOrder();
  }

  // 7. Lightbox Preview for Phone Screenshots
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.phone-screen[data-zoomable]').forEach(screen => {
    screen.addEventListener('click', () => {
      const img = screen.querySelector('img');
      if (!img || !lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });

  const closeLightbox = () => lightbox && lightbox.classList.remove('open');
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  // 8. Toast Helper + Copy Email
  const toast = document.getElementById('toast');
  const showToast = msg => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  };

  document.querySelectorAll('[data-copy-email]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('gndstudious@gmail.com');
        showToast('Copied gndstudious@gmail.com to clipboard!');
      } catch {
        showToast('Email: gndstudious@gmail.com');
      }
    });
  });

  // 9. Contact Form -> Opens Pre-filled Mailto + Toast
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('cfName').value.trim();
      const email = document.getElementById('cfEmail').value.trim();
      const topic = document.getElementById('cfTopic').value;
      const message = document.getElementById('cfMessage').value.trim();

      const subject = encodeURIComponent(`[GND Studios — ${topic}] Inquiry from ${name}`);
      const body = encodeURIComponent(`Hi GND Studios Team,\n\nName: ${name}\nReply Email: ${email}\nTopic: ${topic}\n\n${message}\n`);
      window.location.href = `mailto:gndstudious@gmail.com?subject=${subject}&body=${body}`;
      showToast('Opening your email client to message gndstudious@gmail.com...');
    });
  }

  // 10. Mobile Drawer Toggle
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }
});
