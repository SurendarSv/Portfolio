document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });

        // Update active state
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  // Add sticky navbar effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(18, 18, 18, 0.98)';
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    } else {
      navbar.style.background = 'rgba(18, 18, 18, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  });

  // Portfolio Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');

        if (filterValue === 'all' || filterValue === itemCategory) {
          item.style.display = 'block';
          // Optional: Add a fade-in animation
          item.style.opacity = '0';
          setTimeout(() => item.style.opacity = '1', 50);
        } else {
          item.style.display = 'none';
        }

      });
    });
  });

  /**
   * PREMIUM FEATURES:
   * 1. Split Text generation for titles
   * 2. Custom Cursor with lag effect
   * 3. Ambient Parallax
   */

  // 1. Text Splitting for Premium Reveals
  const titles = document.querySelectorAll('.hero-title, .section-title, .hero-subtitle');
  titles.forEach(title => {
    // Only split if not already processed (cleaner idoms)
    if (title.querySelector('.word-mask')) return;

    const text = title.innerText;
    const words = text.split(' ');
    title.innerHTML = '';
    title.classList.add('title-reveal'); // Add class for observer to target specific animation

    words.forEach((word, index) => {
      // Create mask span
      const mask = document.createElement('span');
      mask.className = 'word-mask';

      // Create inner span
      const inner = document.createElement('span');
      inner.className = 'word-inner';
      inner.innerText = word + (index < words.length - 1 ? '\u00A0' : ''); // Add non-breaking space
      // Stagger immediately via inline style or CSS nth-child? Inline is dynamic relative to word pos.
      inner.style.transitionDelay = `${index * 0.05}s`;

      mask.appendChild(inner);
      title.appendChild(mask);
    });
  });

  // 2. Custom Cursor Logic
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  if (window.matchMedia("(pointer: fine)").matches) {
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows instantly
      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
      }

      // Add Hover Effect class to body
      const target = e.target;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        document.body.classList.add('hovering');
      } else {
        document.body.classList.remove('hovering');
      }
    });

    // Animate outline with lag
    const animateCursor = () => {
      // smooth lerp
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;

      if (cursorOutline) {
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;
      }
      requestAnimationFrame(animateCursor);
    };

    animateCursor();
  }

  // 3. Scroll Reveal & Text Reveal Observers

  // A. Standard Reveals (Cards, items)
  const revealElements = document.querySelectorAll('.service-card, .portfolio-card, .timeline-item, .skill-item, .hero-image-container, .hero-description, .hero-badges');
  revealElements.forEach(el => el.classList.add('reveal'));

  const standardObserver = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('active');
        }, delay);
        delay += 50;
        standardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  revealElements.forEach(el => standardObserver.observe(el));

  // B. Title Reveals (Text Split)
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  titles.forEach(t => titleObserver.observe(t));


  // Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 0.8,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  // Scroll Progress Bar & Parallax
  const progressBar = document.querySelector('.scroll-progress');
  const heroImageContainer = document.querySelector('.hero-image-container');
  const heroContent = document.querySelector('.hero-content');

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Hook into Lenis scroll event for Parallax, Progress, and Skew
  lenis.on('scroll', ({ scroll, limit, velocity }) => {
    // Update Progress Bar
    const progress = (scroll / limit) * 100;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // Parallax
    if (heroImageContainer && scroll < window.innerHeight) {
      // Move container instead of image to avoid conflict with hover transform
      heroImageContainer.style.transform = `translateY(${scroll * 0.15}px)`;
    }
    if (heroContent && scroll < window.innerHeight) {
      // Note: This might conflict with title reveals if we translate the whole content
      // Let's only translate if it doesn't break fixed pos expectations.
      // heroContent.style.transform = `translateY(${scroll * 0.05}px)`;
      // Removed generic heroContent parallax to allow text reveals to shine without conflict
    }
  });


  // Connect Lenis to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target);
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');

        // Mobile menu close logic if we had one
      }
    });
  });

});