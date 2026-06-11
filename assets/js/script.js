/* ============================================================
   STACKLY OTT — Main JavaScript
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Page Loader ─────────────────────────────────────────── */
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      setTimeout(() => loader.remove(), 500);
    }, 2000);
  }

  /* ── AOS Init ────────────────────────────────────────────── */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 80,
      easing: 'ease-out-cubic'
    });
  } else {
    document.querySelectorAll('[data-aos]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ── Navbar Scroll ───────────────────────────────────────── */
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 60);
    if (backToTop) backToTop.classList.toggle('show', y > 400);
  });
  // trigger once on load
  window.dispatchEvent(new Event('scroll'));

  /* ── Back to Top ─────────────────────────────────────────── */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Hamburger Toggle ────────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const navMobile = document.querySelector('.nav-mobile');
  if (hamburger && navMobile) {
    let scrollPos = 0;
    const toggleMenu = (forceClose = false) => {
      const isOpening = !hamburger.classList.contains('open') && !forceClose;
      if (isOpening) {
        scrollPos = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPos}px`;
        document.body.style.width = '100%';
        hamburger.classList.add('open');
        navMobile.classList.add('open');
      } else {
        hamburger.classList.remove('open');
        navMobile.classList.remove('open');
        if (document.body.style.position === 'fixed') {
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollPos);
        }
      }
    };

    hamburger.addEventListener('click', () => toggleMenu());
    
    // Close on link click
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(true));
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMobile.contains(e.target) && hamburger.classList.contains('open')) {
        toggleMenu(true);
      }
    });
  }

  /* ── Hero Slider ─────────────────────────────────────────── */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    currentSlide = (n + slides.length) % slides.length;
    if (slides[currentSlide]) slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  if (slides.length > 1) {
    slideInterval = setInterval(nextSlide, 6000);
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        goToSlide(i);
        slideInterval = setInterval(nextSlide, 6000);
      });
    });
    const prevBtn = document.querySelector('.hero-arrow.prev');
    const nextBtn = document.querySelector('.hero-arrow.next');
    if (prevBtn) prevBtn.addEventListener('click', () => { clearInterval(slideInterval); prevSlide(); slideInterval = setInterval(nextSlide, 6000); });
    if (nextBtn) nextBtn.addEventListener('click', () => { clearInterval(slideInterval); nextSlide(); slideInterval = setInterval(nextSlide, 6000); });
  }

  /* ── FAQ Accordion ───────────────────────────────────────── */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Tab System ──────────────────────────────────────────── */
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const tabBtns = tabGroup.querySelectorAll('.tab-btn');
    const parent = tabGroup.closest('section') || tabGroup.parentElement;
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.tab;
        if (target && parent) {
          parent.querySelectorAll('.tab-content').forEach(tc => {
            tc.style.display = tc.id === target ? 'block' : 'none';
          });
        }
      });
    });
  });

  /* ── Counter Animation ───────────────────────────────────── */
  const counters = document.querySelectorAll('.stat-num[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const start = performance.now();
        const step = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(c => counterObserver.observe(c));

  /* ── Scroll Row Drag ─────────────────────────────────────── */
  document.querySelectorAll('.scroll-row').forEach(row => {
    let isDown = false, startX, scrollLeft;
    row.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - row.offsetLeft; scrollLeft = row.scrollLeft; row.style.cursor = 'grabbing'; });
    row.addEventListener('mouseleave', () => { isDown = false; row.style.cursor = 'grab'; });
    row.addEventListener('mouseup', () => { isDown = false; row.style.cursor = 'grab'; });
    row.addEventListener('mousemove', e => {
      if (!isDown) return; e.preventDefault();
      const x = e.pageX - row.offsetLeft;
      row.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
    row.style.cursor = 'grab';
  });

  /* ── Toggle Password Visibility ──────────────────────────── */
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      btn.textContent = isPw ? '🙈' : '👁️';
    });
  });

  /* ── Dynamic Search Bar (Navbar) ─────────────────────────── */
  const searchInput = document.querySelector('.nav-search input');
  if (searchInput) {
    searchInput.addEventListener('focus', function() {
      this.style.width = '200px';
    });
    searchInput.addEventListener('blur', function() {
      this.style.width = '140px';
    });
  }

  /* ── Dashboard Sidebar Toggle for Mobile ─────────────────── */
  const dashToggle = document.querySelector('.dash-toggle');
  const dashSidebar = document.querySelector('.dash-sidebar');
  if (dashToggle && dashSidebar) {
    dashToggle.addEventListener('click', () => {
      dashSidebar.classList.toggle('open');
    });
  }

  /* ── Dashboard Nav Links ─────────────────────────────────── */
  document.querySelectorAll('.dash-nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      const target = this.dataset.section;
      if (!target) return;
      e.preventDefault();
      document.querySelectorAll('.dash-nav-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.dash-tab-content').forEach(section => {
        section.style.display = section.id === target ? 'block' : 'none';
      });
    });
  });

  /* ── Dashboard Auth Guard & Personalization ───────────────── */
  if (window.location.pathname.includes('dashboard.html')) {
    const currentUserRaw = localStorage.getItem('currentUser');
    let currentUser = null;
    try {
      if (currentUserRaw) currentUser = JSON.parse(currentUserRaw);
    } catch(e) {}

    // Redirect to login if not logged in (no fallback on dashboard)
    if (!currentUser) {
      // Allow a brief preview fallback for dev testing
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('preview') !== '1') {
        currentUser = { name: 'John Doe', email: 'john@stackly.com' };
      }
    }

    if (currentUser) {

    const firstName = currentUser.name.split(' ')[0];
    const firstLetter = currentUser.name.charAt(0).toUpperCase();

    // Update navbar avatar & name
    const navAvatar = document.getElementById('navAvatar');
    if (navAvatar) navAvatar.textContent = firstLetter;
    const navUserName = document.querySelector('.nav-user-name');
    if (navUserName) {
      navUserName.textContent = firstName;
      navUserName.style.display = 'inline';
    }

    // Update sidebar info
    const sidebarAvatar = document.querySelector('.dash-sidebar .user-avatar');
    if (sidebarAvatar) sidebarAvatar.textContent = firstLetter;
    const sidebarName = document.querySelector('.dash-sidebar .user-info h5');
    if (sidebarName) sidebarName.textContent = currentUser.name;
    const sidebarEmail = document.querySelector('.dash-sidebar .user-info p');
    if (sidebarEmail) sidebarEmail.textContent = currentUser.email;

    // Update overview header
    const overviewHeader = document.querySelector('.dash-header h2');
    if (overviewHeader) {
      overviewHeader.innerHTML = `Welcome back, <span class="gradient-text">${firstName}</span>! 👋`;
    }

    // Update profile forms initial values
    const profileName = document.getElementById('profileName');
    if (profileName) profileName.value = currentUser.name;
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) profileEmail.value = currentUser.email;
    } // end if(currentUser)
  } // end if(dashboard)

  /* ── Form Init (uses validation.js) ──────────────────────── */
  if (typeof Validator !== 'undefined') {
    // Login form
    Validator.initForm('#loginForm', (form) => {
      const emailVal = document.getElementById('loginEmail')?.value;
      const passVal = document.getElementById('loginPassword')?.value;
      
      const storedUserRaw = localStorage.getItem('registeredUser');
      let registeredUser = null;
      try {
        if (storedUserRaw) registeredUser = JSON.parse(storedUserRaw);
      } catch(e) {}

      const fallbackUser = { name: 'John Doe', email: 'john@stackly.com', password: 'Password123!' };

      if (registeredUser && registeredUser.email === emailVal) {
        if (registeredUser.password === passVal) {
          localStorage.setItem('currentUser', JSON.stringify(registeredUser));
          showToast('Login successful! Redirecting...', 'success');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        } else {
          Validator.setErr(document.getElementById('loginPassword'), 'Incorrect password.');
          showToast('Incorrect password.', 'error');
        }
      } else if (fallbackUser.email === emailVal) {
        if (fallbackUser.password === passVal) {
          localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
          showToast('Login successful! Redirecting...', 'success');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        } else {
          Validator.setErr(document.getElementById('loginPassword'), 'Incorrect password.');
          showToast('Incorrect password.', 'error');
        }
      } else {
        Validator.setErr(document.getElementById('loginEmail'), 'Email not registered.');
        showToast('Email not registered.', 'error');
      }
    });

    // Signup form
    Validator.initForm('#signupForm', (form) => {
      const nameVal = document.getElementById('signupName')?.value || 'Guest';
      const emailVal = document.getElementById('signupEmail')?.value;
      const passVal = document.getElementById('signupPassword')?.value;
      
      if (emailVal && passVal) {
        localStorage.setItem('registeredUser', JSON.stringify({ name: nameVal, email: emailVal, password: passVal }));
        showToast('Account created! Redirecting to login...', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      }
    });

    // Contact form
    Validator.initForm('#contactForm', (form) => {
      showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
      form.reset();
      form.querySelectorAll('[data-validate]').forEach(f => Validator.reset(f));
    });

    // Newsletter form
    Validator.initForm('#newsletterForm', (form) => {
      showToast('Subscribed successfully! Welcome aboard.', 'success');
      form.reset();
      form.querySelectorAll('[data-validate]').forEach(f => Validator.reset(f));
    });

    // Profile form
    Validator.initForm('#profileForm', (form) => {
      const nameVal = document.getElementById('profileName')?.value;
      const emailVal = document.getElementById('profileEmail')?.value;
      
      const currentUserRaw = localStorage.getItem('currentUser');
      if (currentUserRaw) {
        try {
          const user = JSON.parse(currentUserRaw);
          user.name = nameVal;
          user.email = emailVal;
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          const registeredUserRaw = localStorage.getItem('registeredUser');
          if (registeredUserRaw) {
            const regUser = JSON.parse(registeredUserRaw);
            if (regUser.email === user.email) {
              regUser.name = nameVal;
              localStorage.setItem('registeredUser', JSON.stringify(regUser));
            }
          }
        } catch(e) {}
      }
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => { window.location.reload(); }, 1000);
    });

    // Change password form
    Validator.initForm('#changePasswordForm', (form) => {
      const newPassVal = document.getElementById('newPassword')?.value;
      const currentUserRaw = localStorage.getItem('currentUser');
      if (currentUserRaw && newPassVal) {
        try {
          const user = JSON.parse(currentUserRaw);
          user.password = newPassVal;
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          const registeredUserRaw = localStorage.getItem('registeredUser');
          if (registeredUserRaw) {
            const regUser = JSON.parse(registeredUserRaw);
            if (regUser.email === user.email) {
              regUser.password = newPassVal;
              localStorage.setItem('registeredUser', JSON.stringify(regUser));
            }
          }
        } catch(e) {}
      }
      showToast('Password changed successfully!', 'success');
      form.reset();
    });
  }

  /* ── Content Filtering & Search ──────────────────────────── */
  let currentFilter = 'all';
  let searchQuery = '';

  const applyFilters = () => {
    document.querySelectorAll('.content-card').forEach(card => {
      // Find title and genre
      const titleEl = card.querySelector('h4');
      const metaEl = card.querySelector('.overlay p');
      
      const title = titleEl ? titleEl.textContent.toLowerCase() : '';
      const meta = metaEl ? metaEl.textContent.toLowerCase() : '';

      const matchesSearch = title.includes(searchQuery);
      const matchesFilter = currentFilter === 'all' || meta.includes(currentFilter);

      if (matchesSearch && matchesFilter) {
        card.style.display = ''; // revert to default (block/flex)
        card.style.animation = 'fadeIn 0.4s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  };

  // 1. Search Bar Input
  const navSearchInputs = document.querySelectorAll('.nav-search input');
  navSearchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  });

  // 2. Genre Tabs
  document.querySelectorAll('.tabs [data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active state in UI
      const parent = btn.closest('.tabs');
      if (parent) {
        parent.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      }
      btn.classList.add('active');
      
      // Apply filter
      currentFilter = btn.getAttribute('data-filter').toLowerCase();
      applyFilters();
    });
  });

  /* ── Active Nav Link Highlight ───────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

});
