/* ============================================
   PRANKRAFT — The Trickster Portfolio
   A portfolio that looks premium but pranks you
   ============================================ */

(function () {
  'use strict';

  // ==========================================
  // STATE
  // ==========================================
  const state = {
    prankCount: 0,
    pranksTriggered: new Set(),
    mouseX: 0,
    mouseY: 0,
    isFlipped: false,
    isBSOD: false,
    formSubmitAttempts: 0,
    hireClickCount: 0,
    cvClickCount: 0,
    navScrambleCount: 0,
    scrollHijackDone: false,
    gravityEnabled: false,
    particlesCreated: false,
    confettiActive: false,
    themeClickCount: 0,
    revealShown: false,
  };

  // Full catalog of pranks for the reveal screen
  const PRANK_CATALOG = {
    'nav-scramble': { name: 'Text Scrambler', icon: '🔤' },
    'hire-me': { name: 'Desperate Hire', icon: '🥺' },
    'upside-down': { name: 'Upside Down', icon: '🙃' },
    'excessive-click': { name: 'Earthquake', icon: '🫨' },
    'cv-download': { name: 'CV Not Found', icon: '📄' },
    'cv-flee': { name: 'Runaway CV', icon: '🏃' },
    'fleeing-skills': { name: 'Shy Skills', icon: '😅' },
    'skill-overflow': { name: 'Skill Overflow', icon: '📊' },
    'testimonial-swap': { name: 'Fake Reviews', icon: '🤥' },
    'auto-type': { name: 'Mind Reader', icon: '🔮' },
    'bsod': { name: 'Blue Screen', icon: '💀' },
    'gravity': { name: 'Gravity Mode', icon: '🌍' },
    'social-link': { name: 'Social 404', icon: '📱' },
    'konami-code': { name: 'Konami Code', icon: '🎮' },
    'theme-neon': { name: 'Neon Mode', icon: '💡' },
    'cookie-banner': { name: 'Cookie Chaos', icon: '🍪' },
    'context-menu': { name: 'Fake Right-Click', icon: '🖱️' },
    'clipboard': { name: 'Clipboard Hijack', icon: '📋' },
    'tab-title': { name: 'Tab Title Prank', icon: '📑' },
    'console-egg': { name: 'Console Art', icon: '🖥️' },
    'scroll-lie': { name: 'Lying Progress', icon: '⏫' },
  };

  const TOTAL_PRANKS = Object.keys(PRANK_CATALOG).length;
  const IS_TOUCH_DEVICE = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function rafThrottle(fn) {
    let isQueued = false;
    return (...args) => {
      if (isQueued) return;
      isQueued = true;
      requestAnimationFrame(() => {
        isQueued = false;
        fn(...args);
      });
    };
  }

  function showToast(text, duration = 3000) {
    const toast = document.getElementById('prank-toast');
    const toastText = document.getElementById('prank-toast-text');
    toast.classList.remove('hidden');
    toastText.textContent = text;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 500);
    }, duration);
  }

  // Play a sound using Web Audio API (no external files)
  function playSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.08;

      if (type === 'click') {
        osc.frequency.value = 800;
        osc.type = 'sine';
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'error') {
        osc.frequency.value = 200;
        osc.type = 'sawtooth';
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'success') {
        osc.frequency.value = 523;
        osc.type = 'sine';
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
        // Second note
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2); gain2.connect(ctx.destination);
        osc2.frequency.value = 659; osc2.type = 'sine';
        gain2.gain.value = 0.08;
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc2.start(ctx.currentTime + 0.15); osc2.stop(ctx.currentTime + 0.4);
      } else if (type === 'whoosh') {
        osc.frequency.value = 400;
        osc.type = 'sine';
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'boop') {
        osc.frequency.value = 600;
        osc.type = 'triangle';
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) { /* Audio not supported, fail silently */ }
  }

  function trackPrank(name) {
    if (!state.pranksTriggered.has(name)) {
      state.prankCount++;
      state.pranksTriggered.add(name);
      playSound('boop');
      updatePrankCounter();
    }
    // Show hint after 2 pranks (lowered from 3 so judges see it faster)
    if (state.prankCount >= 2) {
      document.getElementById('footer-hint').classList.add('visible');
    }
    // Show reveal modal after 8 pranks
    if (state.prankCount >= 8 && !state.revealShown) {
      state.revealShown = true;
      setTimeout(() => showPrankReveal(), 2000);
    }
  }

  function updatePrankCounter() {
    const counter = document.getElementById('prank-counter');
    const numEl = document.getElementById('prank-counter-num');
    const totalEl = document.getElementById('prank-counter-total');

    if (!counter.classList.contains('visible')) {
      counter.classList.add('visible');
    }

    numEl.textContent = state.prankCount;
    totalEl.textContent = TOTAL_PRANKS;

    // Pulse animation
    counter.classList.remove('pulse');
    void counter.offsetWidth; // trigger reflow
    counter.classList.add('pulse');
  }

  function showPrankReveal() {
    const reveal = document.getElementById('prank-reveal');
    const list = document.getElementById('prank-reveal-list');
    const foundEl = document.getElementById('reveal-found');
    const totalEl = document.getElementById('reveal-total');

    foundEl.textContent = state.prankCount;
    totalEl.textContent = TOTAL_PRANKS;
    list.innerHTML = '';

    Object.entries(PRANK_CATALOG).forEach(([key, info]) => {
      const found = state.pranksTriggered.has(key);
      const item = document.createElement('div');
      item.className = `prank-item ${found ? 'found' : 'missing'}`;
      item.innerHTML = `<span class="prank-item-icon">${found ? '✅' : '⬜'}</span> ${info.icon} ${info.name}`;
      list.appendChild(item);
    });

    reveal.classList.remove('hidden');
    playSound('success');
    launchConfetti();
  }

  // ==========================================
  // CUSTOM CURSOR
  // ==========================================
  function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor || window.innerWidth <= 768) return;

    document.addEventListener('mousemove', (e) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

    // Hover effects
    const hoverables = document.querySelectorAll('a, button, .skill-card, .project-card, .testimonial-card, input, textarea');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  function initLoader() {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('loader-bar');
    const text = document.getElementById('loader-text');

    const messages = [
      'Loading assets...',
      'Initializing portfolio...',
      'Polishing pixels...',
      'Calibrating colors...',
      'Brewing coffee ☕...',
      'Hiding Easter eggs 🥚...',
      'Almost there...',
      'Preparing surprises 🎉...',
    ];

    let progress = 0;
    let msgIndex = 0;

    const interval = setInterval(() => {
      progress += randomBetween(3, 12);
      if (progress > 100) progress = 100;
      bar.style.width = progress + '%';

      if (progress > msgIndex * 14 && msgIndex < messages.length) {
        text.textContent = messages[msgIndex];
        msgIndex++;
      }

      if (progress >= 100) {
        clearInterval(interval);
        text.textContent = 'Welcome! 🚀';
        setTimeout(() => {
          loader.classList.add('done');
          startAnimations();
        }, 500);
      }
    }, 200);
  }

  // ==========================================
  // TYPING EFFECT FOR HERO
  // ==========================================
  function initTypingEffect() {
    const roles = [
      'Full-Stack Developer.',
      'UI/UX Enthusiast.',
      'Problem Solver.',
      'Creative Coder.',
      'Prank Enthusiast. 😈',
    ];
    const roleEl = document.getElementById('hero-role');
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function type() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        roleEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;
      } else {
        roleEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 80;
      }

      // Add blinking cursor
      roleEl.innerHTML = roleEl.textContent + '<span style="animation: pulse 1s infinite; color: var(--accent-1);">|</span>';

      if (!isDeleting && charIndex === currentRole.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    }

    type();
  }

  // ==========================================
  // COUNTER ANIMATION
  // ==========================================
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000;
      const start = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        counter.textContent = Math.floor(target * eased);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(update);
    });
  }

  // ==========================================
  // SKILL BAR ANIMATION
  // ==========================================
  function animateSkillBars() {
    const fills = document.querySelectorAll('.skill-fill');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const targetWidth = fill.getAttribute('data-width');
          // Prank: some skills randomly overshoot or undershoot
          const prankOffset = Math.random() > 0.7 ? randomBetween(-30, 40) : 0;
          let finalWidth = parseInt(targetWidth) + prankOffset;
          finalWidth = Math.max(5, Math.min(100, finalWidth));

          setTimeout(() => {
            fill.style.width = finalWidth + '%';
            if (prankOffset > 20) {
              // Skill overflowed!
              fill.style.background = 'linear-gradient(135deg, #ff6b9d, #ffd93d)';
              trackPrank('skill-overflow');
            } else if (prankOffset < -15) {
              fill.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
              trackPrank('skill-underflow');
            }
          }, 300);
          observer.unobserve(fill);
        }
      });
    }, { threshold: 0.3 });

    fills.forEach((fill) => observer.observe(fill));
  }

  // ==========================================
  // NAVBAR
  // ==========================================
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    const onScroll = rafThrottle(() => {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
    window.addEventListener('scroll', onScroll, { passive: true });

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // ==========================================
  // SCROLL REVEAL
  // ==========================================
  function initReveal() {
    const sections = document.querySelectorAll('.section-header, .about-grid, .skill-card, .project-card, .testimonial-card, .contact-grid');
    sections.forEach((el) => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    sections.forEach((el) => observer.observe(el));
  }

  // ==========================================
  // HERO PARTICLES
  // ==========================================
  function createParticles() {
    if (state.particlesCreated) return;
    state.particlesCreated = true;

    const container = document.getElementById('hero-particles');
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      const size = randomBetween(2, 5);
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${Math.random() > 0.5 ? 'var(--accent-1)' : 'var(--accent-2)'};
        border-radius: 50%;
        left: ${randomBetween(0, 100)}%;
        top: ${randomBetween(0, 100)}%;
        opacity: ${randomBetween(0.1, 0.5)};
        animation: float ${randomBetween(3, 8)}s ease-in-out infinite;
        animation-delay: ${randomBetween(0, 5)}s;
      `;
      container.appendChild(particle);
    }
  }

  // ==========================================
  // PRANK: NAV LINK TEXT SCRAMBLE
  // ==========================================
  function initNavScramble() {
    const links = document.querySelectorAll('[data-prank="scramble"]');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*';

    links.forEach((link) => {
      const originalText = link.textContent;
      let scrambleTimeout;

      link.addEventListener('mouseenter', () => {
        state.navScrambleCount++;

        // First few times: just scramble and restore
        // After 5+ times: scramble to funny text
        let iterations = 0;
        const maxIterations = 8;

        scrambleTimeout = setInterval(() => {
          link.textContent = originalText
            .split('')
            .map((char, idx) => {
              if (idx < iterations) return originalText[idx];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

          iterations++;

          if (iterations > maxIterations) {
            clearInterval(scrambleTimeout);

            if (state.navScrambleCount > 3 && Math.random() > 0.4) {
              // Replace with funny text
              const funnyTexts = {
                About: '🤷 Who??',
                Skills: '🎭 Magic',
                Projects: '🗑️ Oops',
                Testimonials: '🤥 Lies',
                Contact: '🏃 Bye!',
              };
              link.textContent = funnyTexts[originalText] || originalText;
              trackPrank('nav-scramble');
              showToast("Wait... that doesn't look right 🤔");
              setTimeout(() => {
                link.textContent = originalText;
              }, 2000);
            } else {
              link.textContent = originalText;
            }
          }
        }, 40);
      });

      link.addEventListener('mouseleave', () => {
        clearInterval(scrambleTimeout);
        link.textContent = originalText;
      });
    });
  }

  // ==========================================
  // PRANK: HIRE ME BUTTON
  // ==========================================
  function initHireMePrank() {
    const btn = document.getElementById('nav-cta');

    btn.addEventListener('click', () => {
      state.hireClickCount++;

      if (state.hireClickCount === 1) {
        showToast("Let me think about it... 🤔");
      } else if (state.hireClickCount === 2) {
        btn.textContent = 'Hire Me?';
        showToast("Are you sure? I'm expensive 💰");
      } else if (state.hireClickCount === 3) {
        btn.textContent = 'Please?';
        showToast("I'll even provide free coffee ☕");
        btn.style.transform = 'scale(1.3)';
      } else if (state.hireClickCount === 4) {
        btn.textContent = '🥺 Pretty Please';
        btn.style.fontSize = '0.6rem';
        btn.style.transform = 'scale(1)';
      } else if (state.hireClickCount >= 5) {
        btn.textContent = '🎉 HIRED!';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #15803d)';
        btn.style.fontSize = '';
        launchConfetti();
        showToast("You did it! Welcome aboard! 🚀", 4000);
        trackPrank('hire-me');
      }
    });
  }

  // ==========================================
  // PRANK: VIEW MY WORK BUTTON
  // ==========================================
  function initViewWorkPrank() {
    const btn = document.getElementById('hero-cta');
    let clickCount = 0;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      clickCount++;

      if (clickCount === 1) {
        // Normal — scroll to projects
        document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
      } else if (clickCount === 2) {
        // Page flips upside down briefly
        document.body.classList.add('upside-down');
        showToast("Whoops! Wrong direction! 🙃", 2000);
        trackPrank('upside-down');
        setTimeout(() => {
          document.body.classList.remove('upside-down');
          document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        }, 2000);
      } else if (clickCount >= 3) {
        // Shake the whole page
        document.body.classList.add('shaking');
        showToast("Stop clicking so much! 😤");
        trackPrank('excessive-click');
        setTimeout(() => document.body.classList.remove('shaking'), 500);
      }
    });
  }

  // ==========================================
  // PRANK: DOWNLOAD CV
  // ==========================================
  function initCVPrank() {
    const btn = document.getElementById('hero-secondary');

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      state.cvClickCount++;

      if (state.cvClickCount === 1) {
        showToast("Downloading CV... 📥");
        // Fake progress then fail
        setTimeout(() => {
          showToast("Error 404: CV not found. Try being less nosy! 😜", 4000);
          trackPrank('cv-download');
        }, 2000);
      } else if (state.cvClickCount === 2) {
        showToast("Nice try! The CV is on vacation 🏖️");
      } else if (state.cvClickCount === 3) {
        // Make the button slowly drift away
        btn.style.transition = 'transform 2s';
        btn.style.transform = 'translateX(200px) rotate(30deg)';
        showToast("The CV is running away! 🏃💨");
        trackPrank('cv-flee');
        setTimeout(() => {
          btn.style.transform = '';
        }, 3000);
      } else {
        btn.querySelector('span').textContent = 'Okay fine here... JK 😝';
        setTimeout(() => {
          btn.querySelector('span').textContent = 'Download CV';
        }, 2000);
      }
    });
  }

  // ==========================================
  // PRANK: SKILL CARDS FLEE FROM MOUSE
  // ==========================================
  function initFleeingSkills() {
    const cards = document.querySelectorAll('[data-prank="flee"]');
    let fleeCount = 0;

    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        fleeCount++;

        // Only start fleeing after a few normal hovers
        if (fleeCount > 2 && Math.random() > 0.3) {
          const dx = randomBetween(-80, 80);
          const dy = randomBetween(-40, 40);
          card.classList.add('fleeing');
          card.style.transform = `translate(${dx}px, ${dy}px) rotate(${randomBetween(-10, 10)}deg)`;

          if (fleeCount === 5) {
            showToast("Hey! The skills are... shy? 😅");
            trackPrank('fleeing-skills');
          }

          setTimeout(() => {
            card.style.transform = '';
            card.classList.remove('fleeing');
          }, 1500);
        }
      });
    });
  }

  // ==========================================
  // PRANK: PROJECT VIEW BUTTONS FLEE
  // ==========================================
  function initFleeingButtons() {
    const btns = document.querySelectorAll('[data-prank="flee-btn"]');
    let fleeBtnCount = 0;

    btns.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        fleeBtnCount++;
        if (fleeBtnCount > 2) {
          const dx = randomBetween(-100, 100);
          const dy = randomBetween(-50, 50);
          btn.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          btn.style.transform = `translate(${dx}px, ${dy}px)`;
          if (fleeBtnCount === 3) {
            showToast("These buttons have a mind of their own! 🏃");
            trackPrank('fleeing-buttons');
          }
          setTimeout(() => { btn.style.transform = ''; }, 1000);
        }
      });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast(
          ['🔗 Just kidding!', '🚧 Under construction!', '404: Project went for coffee ☕'][Math.floor(Math.random()*3)]
        );
      });
    });
  }

  // ==========================================
  // PRANK: TESTIMONIALS CHANGE ON CLICK
  // ==========================================
  function initTestimonialPrank() {
    const funnyTestimonials = [
      {
        text: "Adal once fixed a bug by staring at it menacingly until it disappeared. 10/10 would recommend.",
        name: "A Bug",
        role: "Former Exception"
      },
      {
        text: "He promised the project would be done 'soon'. That was 47 'soons' ago. Great work though!",
        name: "Deadline",
        role: "Miss Being Met"
      },
      {
        text: "I asked for a simple website. He delivered a masterpiece wrapped in chaos. Wouldn't have it any other way.",
        name: "Stack Overflow",
        role: "Savior & Counselor"
      },
      {
        text: "Adal's code is so clean, my Roomba got jealous and quit. True story.",
        name: "Roomba",
        role: "Retired Cleaner"
      },
      {
        text: "Worked with Adal on a tight deadline. He didn't sleep for 72 hours. The code worked. He didn't. 5 stars.",
        name: "Coffee Machine",
        role: "Best Friend"
      }
    ];

    const cards = document.querySelectorAll('.testimonial-card');
    let clickCounts = {};

    cards.forEach((card, index) => {
      clickCounts[index] = 0;

      card.addEventListener('click', () => {
        clickCounts[index]++;

        if (clickCounts[index] >= 2) {
          const funny = funnyTestimonials[Math.floor(Math.random() * funnyTestimonials.length)];
          const textEl = card.querySelector('.testimonial-text');
          const nameEl = card.querySelector('.author-name');
          const roleEl = card.querySelector('.author-role');

          // Animate out
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            textEl.textContent = `"${funny.text}"`;
            nameEl.textContent = funny.name;
            roleEl.textContent = funny.role;
            card.style.transform = '';
            trackPrank('testimonial-swap');
          }, 200);

          if (clickCounts[index] === 2) {
            showToast("Wait... that review seems suspicious 🧐");
          }
        }
      });
    });
  }

  // ==========================================
  // PRANK: CONTACT FORM
  // ==========================================
  function initFormPrank() {
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const msgInput = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');

    // Prank 1: Input fields auto-type
    let nameTyped = false;
    nameInput.addEventListener('focus', () => {
      if (!nameTyped && state.formSubmitAttempts === 0) {
        nameTyped = true;
        setTimeout(() => {
          if (nameInput.value === '') {
            autoType(nameInput, "I already know who you are... 👀");
            trackPrank('auto-type');
            showToast("I can read minds! 🔮");
          }
        }, 1500);
      }
    });

    // Prank 2: Email suggestions
    emailInput.addEventListener('input', () => {
      if (emailInput.value.includes('@')) {
        if (Math.random() > 0.6) {
          showToast("Pro tip: 'definitely-not-a-robot@human.com' works too 🤖");
        }
      }
    });

    // Prank 3: Form submission chaos
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      state.formSubmitAttempts++;

      if (state.formSubmitAttempts === 1) {
        // BSOD prank
        triggerBSOD();
        trackPrank('bsod');
      } else if (state.formSubmitAttempts === 2) {
        // Spin the submit button
        submitBtn.style.animation = 'spin360 1s ease-in-out';
        submitBtn.querySelector('span').textContent = 'Sending... maybe?';
        showToast("Your message has been sent to the void! 🕳️");
        trackPrank('void-message');
        setTimeout(() => {
          submitBtn.style.animation = '';
          submitBtn.querySelector('span').textContent = 'Send Message';
        }, 2000);
      } else if (state.formSubmitAttempts === 3) {
        // Confetti and success!
        submitBtn.querySelector('span').textContent = '✅ Sent (for real this time)!';
        submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #15803d)';
        launchConfetti();
        showToast("Your message was actually sent! 📬 (just kidding, it wasn't 😈)", 5000);
        trackPrank('fake-success');
      } else {
        // Gravity effect
        if (!state.gravityEnabled) {
          enableGravity();
          state.gravityEnabled = true;
          showToast("You broke the website! Everything is falling! 😱", 4000);
          trackPrank('gravity');
        }
      }
    });
  }

  function autoType(input, text) {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        input.value += text[i];
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => { input.value = ''; }, 2000);
      }
    }, 50);
  }

  // ==========================================
  // PRANK: BSOD (Blue Screen of Death)
  // ==========================================
  function triggerBSOD() {
    const bsod = document.getElementById('bsod');
    const percent = document.getElementById('bsod-percent');
    bsod.classList.remove('hidden');
    state.isBSOD = true;
    playSound('error');

    let progress = 0;
    const interval = setInterval(() => {
      progress += randomBetween(1, 8);
      if (progress > 100) progress = 100;
      percent.textContent = Math.floor(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          bsod.classList.add('hidden');
          state.isBSOD = false;
          showToast("Just kidding! Everything is fine 😄", 3000);
        }, 1500);
      }
    }, 200);

    // Click to dismiss
    bsod.addEventListener('click', () => {
      clearInterval(interval);
      bsod.classList.add('hidden');
      state.isBSOD = false;
      showToast("You can't break me that easily! 💪");
    }, { once: true });
  }

  // ==========================================
  // PRANK: GRAVITY MODE (using matter-js if available, else CSS)
  // ==========================================
  function enableGravity() {
    const elements = document.querySelectorAll(
      '.skill-card, .project-card, .testimonial-card, .contact-card, .detail-item, .tag'
    );

    elements.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = 'transform 1.5s cubic-bezier(0.55, 0, 1, 0.45)';
        el.style.transform = `translateY(${randomBetween(200, 800)}px) rotate(${randomBetween(-45, 45)}deg)`;
        el.style.opacity = '0.3';
      }, i * 50);
    });

    // Restore after 4 seconds
    setTimeout(() => {
      elements.forEach((el) => {
        el.style.transition = 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.5s';
        el.style.transform = '';
        el.style.opacity = '';
      });
      state.gravityEnabled = false;
    }, 4000);
  }

  // ==========================================
  // CONFETTI
  // ==========================================
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#7c5cfc', '#00d4ff', '#ff6b9d', '#ffd93d', '#22c55e', '#ff4444'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2 + randomBetween(-200, 200),
        y: canvas.height + 10,
        vx: randomBetween(-8, 8),
        vy: randomBetween(-20, -10),
        size: randomBetween(4, 10),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: randomBetween(0, 360),
        rotationSpeed: randomBetween(-10, 10),
        gravity: 0.3,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      particles.forEach((p) => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.005;

        if (p.opacity <= 0) return;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (frame < 200) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();
  }

  // ==========================================
  // PRANK: SOCIAL LINKS
  // ==========================================
  function initSocialPranks() {
    const socials = document.querySelectorAll('.social-link');

    socials.forEach((link) => {
      link.addEventListener('click', (e) => {
        // Let real links (GitHub) work normally
        if (link.href && !link.href.endsWith('#')) return;

        e.preventDefault();
        const messages = [
          "Social media? In this economy? 📉",
          "Error: Too cool for social media 😎",
          "My social life is also 404 🤷",
          "Connecting to the metaverse... just kidding 🌐",
          "My DMs are open... in my dreams 💤",
        ];
        showToast(messages[Math.floor(Math.random() * messages.length)]);
        trackPrank('social-link');

        // Make the icon spin
        link.style.animation = 'spin360 0.5s ease-in-out';
        setTimeout(() => { link.style.animation = ''; }, 500);
      });
    });
  }

  // ==========================================
  // PRANK: KONAMI CODE EASTER EGG
  // ==========================================
  function initKonamiCode() {
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
      if (e.keyCode === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          konamiIndex = 0;
          // ULTIMATE PRANK: Everything goes rainbow
          document.body.style.animation = 'rainbow 0.5s linear infinite';
          showToast("🌈 RAINBOW MODE ACTIVATED! 🌈", 5000);
          trackPrank('konami');
          launchConfetti();

          // Make everything start floating
          document.querySelectorAll('.skill-card, .project-card, .testimonial-card').forEach((el, i) => {
            el.style.animation = `float ${randomBetween(2, 5)}s ease-in-out infinite`;
            el.style.animationDelay = `${i * 0.1}s`;
          });

          setTimeout(() => {
            document.body.style.animation = '';
            document.querySelectorAll('.skill-card, .project-card, .testimonial-card').forEach((el) => {
              el.style.animation = '';
            });
          }, 8000);
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  // ==========================================
  // PRANK: SCROLL HIJACK (one time only)
  // ==========================================
  function initScrollPrank() {
    let scrollCount = 0;

    const onScroll = rafThrottle(() => {
      scrollCount++;

      // At a certain scroll point, briefly reverse scroll direction
      if (scrollCount === 50 && !state.scrollHijackDone) {
        state.scrollHijackDone = true;
        // Make the page briefly jitter
        document.body.style.transition = 'transform 0.2s';
        document.body.style.transform = 'translateX(15px)';
        setTimeout(() => {
          document.body.style.transform = 'translateX(-15px)';
          setTimeout(() => {
            document.body.style.transform = '';
            showToast("Oops, the page slipped! 🧊");
            trackPrank('scroll-slip');
          }, 150);
        }, 150);
      }
    });
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ==========================================
  // PRANK: LOGO CLICK INVERSIONS
  // ==========================================
  function initLogoPrank() {
    const logo = document.getElementById('nav-logo');
    let logoClicks = 0;

    logo.addEventListener('click', (e) => {
      e.preventDefault();
      logoClicks++;

      if (logoClicks === 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (logoClicks === 3) {
        // Invert colors briefly
        document.body.classList.add('inverted');
        showToast("Welcome to the dark side! ...wait 🌓");
        trackPrank('inverted');
        setTimeout(() => document.body.classList.remove('inverted'), 3000);
      } else if (logoClicks === 5) {
        // Grayscale
        document.body.classList.add('grayscale');
        showToast("Budget cuts — colors cost extra 🎨💸");
        trackPrank('grayscale');
        setTimeout(() => document.body.classList.remove('grayscale'), 3000);
      } else if (logoClicks >= 7) {
        logoClicks = 0;
        // Party mode!
        launchConfetti();
        showToast("🎊 Party Mode! 🎊");
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ==========================================
  // PRANK: ABOUT IMAGE FOLLOWS CURSOR
  // ==========================================
  function initAboutImagePrank() {
    const imageWrapper = document.getElementById('about-image');
    if (!imageWrapper) return;

    const applyTilt = (clientX, clientY) => {
      const rect = imageWrapper.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;

      imageWrapper.style.transform = `perspective(600px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg)`;
    };

    imageWrapper.addEventListener('mousemove', (e) => applyTilt(e.clientX, e.clientY));
    imageWrapper.addEventListener('touchmove', (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      applyTilt(t.clientX, t.clientY);
    }, { passive: true });

    imageWrapper.addEventListener('mouseleave', () => {
      imageWrapper.style.transform = '';
      imageWrapper.style.transition = 'transform 0.5s';
    });
    imageWrapper.addEventListener('touchend', () => {
      imageWrapper.style.transform = '';
      imageWrapper.style.transition = 'transform 0.35s';
    }, { passive: true });

    imageWrapper.addEventListener('mouseenter', () => {
      imageWrapper.style.transition = 'transform 0.1s';
    });

    // Click prank
    let aboutClicks = 0;
    imageWrapper.addEventListener('click', () => {
      aboutClicks++;
      const emoji = imageWrapper.querySelector('.avatar-emoji');
      const emojis = ['👨‍💻', '🦸‍♂️', '🧙‍♂️', '👻', '🤖', '🎭', '🐱', '🦄'];
      emoji.textContent = emojis[aboutClicks % emojis.length];
      if (aboutClicks === 3) {
        showToast("Identity crisis loading... 🎭");
        trackPrank('identity-crisis');
      }
    });
  }

  // ==========================================
  // PRANK: SCROLL INDICATOR PRANK
  // ==========================================
  function initScrollIndicatorPrank() {
    const indicator = document.getElementById('scroll-indicator');
    let indicatorClicks = 0;

    indicator.addEventListener('click', () => {
      indicatorClicks++;
      if (indicatorClicks === 1) {
        // Scroll up instead of down
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast("Down? I think you meant UP! ⬆️");
        trackPrank('wrong-direction');
      } else if (indicatorClicks === 2) {
        // Scroll to the very bottom
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        showToast("Too far? 🤷");
      } else {
        // Normal
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    });
  }

  // ==========================================
  // INTERACTIVE PARTICLE NETWORK (Background)
  // ==========================================
  function initParticleNetwork() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    let width, height;
    let particles = [];
    let pointer = { x: -1000, y: -1000 };
    let pointerTarget = { x: -1000, y: -1000 };
    let animationId;
    const getParticleCount = () => (
      PREFERS_REDUCED_MOTION
        ? 18
        : window.innerWidth <= 768
        ? Math.min(60, Math.max(28, Math.floor(window.innerWidth / 11)))
        : Math.min(80, Math.floor(window.innerWidth / 18))
    );
    const getConnectionDistance = () => (PREFERS_REDUCED_MOTION ? 95 : (window.innerWidth <= 768 ? 120 : 150));
    const getPointerRadius = () => (PREFERS_REDUCED_MOTION ? 120 : (window.innerWidth <= 768 ? 170 : 200));
    let lastFrameTime = 0;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createNetworkParticles() {
      particles = [];
      const particleCount = getParticleCount();
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: Math.random() * 2 + 1,
          baseAlpha: Math.random() * 0.4 + 0.1,
          color: Math.random() > 0.6
            ? 'rgba(124, 92, 252,'
            : Math.random() > 0.5
              ? 'rgba(0, 212, 255,'
              : 'rgba(255, 107, 157,',
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawNetwork(time) {
      const delta = Math.min((time - lastFrameTime) || 16.7, 33);
      const dt = delta / 16.7;
      lastFrameTime = time;
      ctx.clearRect(0, 0, width, height);
      const connectionDistance = getConnectionDistance();
      const pointerRadius = getPointerRadius();
      const smoothing = IS_TOUCH_DEVICE ? 0.16 : 0.24;
      pointer.x += (pointerTarget.x - pointer.x) * smoothing;
      pointer.y += (pointerTarget.y - pointer.y) * smoothing;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Wrap around edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Mouse interaction — gentle push
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
        if (dist < pointerRadius) {
          const force = (pointerRadius - dist) / pointerRadius;
          p.vx += (dx / dist) * force * 0.08 * dt;
          p.vy += (dy / dist) * force * 0.08 * dt;
        }

        // Dampen velocity
        p.vx *= Math.pow(0.995, dt);
        p.vy *= Math.pow(0.995, dt);

        // Pulse effect
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.5 + 0.5;
        const alpha = p.baseAlpha + pulse * 0.2;
        const radius = p.radius + pulse * 0.8;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha + ')';
        ctx.fill();

        // Draw glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3);
        gradient.addColorStop(0, p.color + (alpha * 0.3) + ')');
        gradient.addColorStop(1, p.color + '0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Connections to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < connectionDistance) {
            const lineAlpha = (1 - cdist / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(124, 92, 252, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Connection to mouse
        if (dist < pointerRadius * 1.5) {
          const lineAlpha = (1 - dist / (pointerRadius * 1.5)) * 0.25;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(drawNetwork);
    }

    // Event listeners
    window.addEventListener('resize', () => {
      resize();
      // Reset particles if screen size changes drastically
      if (Math.abs(particles.length - getParticleCount()) > 8) {
        createNetworkParticles();
      }
    });

    document.addEventListener('mousemove', (e) => {
      pointerTarget.x = e.clientX;
      pointerTarget.y = e.clientY;
    });
    document.addEventListener('touchmove', (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      pointerTarget.x = t.clientX;
      pointerTarget.y = t.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      pointerTarget.x = -1000;
      pointerTarget.y = -1000;
    });
    document.addEventListener('touchend', () => {
      setTimeout(() => {
        pointerTarget.x = -1000;
        pointerTarget.y = -1000;
      }, 420);
    }, { passive: true });

    // Initialize
    resize();
    createNetworkParticles();
    drawNetwork(0);
  }

  // ==========================================
  // CURSOR TRAIL
  // ==========================================
  function initCursorTrail() {
    const container = document.getElementById('cursor-trail-container');
    if (!container) return;

    const trailDots = [];
    const isMobile = window.innerWidth <= 768;
    const TRAIL_LENGTH = isMobile ? 6 : 12;
    const colors = ['rgba(124,92,252,', 'rgba(0,212,255,', 'rgba(255,107,157,'];

    const spawnDot = (x, y) => {
      const dot = document.createElement('div');
      dot.className = 'cursor-trail-dot';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = isMobile ? (Math.random() * 3 + 2) : (Math.random() * 4 + 3);
      dot.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color}0.6);
        box-shadow: 0 0 ${size * 2}px ${color}0.3);
      `;
      container.appendChild(dot);
      trailDots.push({ el: dot, time: Date.now() });

      // Fade and remove
      requestAnimationFrame(() => {
        dot.style.opacity = '0';
        dot.style.transform = `scale(0) translate(${(Math.random()-0.5)*20}px, ${(Math.random()-0.5)*20}px)`;
      });
      setTimeout(() => {
        dot.remove();
        trailDots.shift();
      }, 600);

      // Cap trail length
      while (trailDots.length > TRAIL_LENGTH) {
        trailDots[0].el.remove();
        trailDots.shift();
      }
    };

    document.addEventListener('mousemove', (e) => {
      if (isMobile) return;
      spawnDot(e.clientX, e.clientY);
    });

    if (isMobile) {
      let lastTouchDotAt = 0;
      document.addEventListener('touchmove', (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        const now = Date.now();
        // Throttle touch trail creation for smooth mobile performance
        if (now - lastTouchDotAt < 35) return;
        lastTouchDotAt = now;
        spawnDot(t.clientX, t.clientY);
      }, { passive: true });
    }
  }

  // ==========================================
  // THEME TOGGLE PRANK
  // ==========================================
  function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    if (!btn) return;

    const modes = [
      { name: 'neon', icon: '💡', class: 'neon-mode', msg: "✨ Welcome to the Neon Dimension!" },
      { name: 'invert', icon: '🔄', class: 'inverted', msg: "🙃 Everything is backwards now!" },
      { name: 'grayscale', icon: '🖤', class: 'grayscale', msg: "🎬 Film noir mode activated!" },
      { name: 'normal', icon: '🌙', class: null, msg: "😌 Back to normal... or is it?" },
    ];

    btn.addEventListener('click', () => {
      state.themeClickCount++;
      playSound('click');

      // Remove all mode classes
      document.body.classList.remove('neon-mode', 'inverted', 'grayscale');

      const modeIndex = (state.themeClickCount - 1) % modes.length;
      const mode = modes[modeIndex];

      if (mode.class) {
        document.body.classList.add(mode.class);
      }
      icon.textContent = mode.icon;
      showToast(mode.msg);

      if (state.themeClickCount === 1) {
        trackPrank('theme-neon');
      }
    });
  }

  // ==========================================
  // PRANK COUNTER & REVEAL HANDLERS
  // ==========================================
  function initPrankCounterHandlers() {
    const counter = document.getElementById('prank-counter');
    const reveal = document.getElementById('prank-reveal');
    const closeBtn = document.getElementById('prank-reveal-close');

    // Click counter to show reveal
    counter.addEventListener('click', () => {
      if (state.prankCount > 0) {
        showPrankReveal();
      }
    });

    // Close reveal
    closeBtn.addEventListener('click', () => {
      reveal.classList.add('hidden');
    });

    // Click outside to close
    reveal.addEventListener('click', (e) => {
      if (e.target === reveal) {
        reveal.classList.add('hidden');
      }
    });
  }

  // ==========================================
  // FAKE COOKIE BANNER
  // ==========================================
  function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');
    if (!banner) return;

    let rejectCount = 0;

    acceptBtn.addEventListener('click', () => {
      playSound('success');
      showToast("🍪 Cookies accepted! Your soul is now ours. Just kidding!");
      trackPrank('cookie-banner');
      banner.classList.add('hidden');
    });

    rejectBtn.addEventListener('click', () => {
      rejectCount++;
      playSound('boop');

      if (rejectCount === 1) {
        rejectBtn.textContent = "Are you sure? 🥺";
        showToast("The cookies are sad now 😢");
        // Move the banner to the top
        banner.style.bottom = 'auto';
        banner.style.top = '0';
        banner.style.borderTop = 'none';
        banner.style.borderBottom = '1px solid var(--border-color)';
      } else if (rejectCount === 2) {
        rejectBtn.textContent = "Fine, no cookies 😤";
        // Shrink accept to grow reject
        acceptBtn.textContent = "🍪 Please? 🍪";
        banner.style.top = 'auto';
        banner.style.bottom = '0';
        banner.style.borderBottom = 'none';
        banner.style.borderTop = '1px solid var(--border-color)';
      } else if (rejectCount === 3) {
        rejectBtn.textContent = "OK BYE!";
        // Fake dismiss, then come back
        banner.classList.add('hidden');
        setTimeout(() => {
          banner.classList.remove('hidden');
          rejectBtn.textContent = "...I'm back 👋";
          acceptBtn.textContent = "Accept (I give up)";
          showToast("You can't escape the cookies! 🍪");
        }, 1500);
      } else {
        // Finally dismiss
        banner.classList.add('hidden');
        showToast("Fine, no cookies. But we'll remember this. 🍪💔");
        trackPrank('cookie-banner');
      }
    });
  }

  // ==========================================
  // CUSTOM RIGHT-CLICK CONTEXT MENU
  // ==========================================
  function initContextMenu() {
    const menu = document.getElementById('context-menu');
    if (!menu) return;

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      trackPrank('context-menu');

      menu.classList.remove('hidden');
      menu.style.left = Math.min(e.clientX, window.innerWidth - 240) + 'px';
      menu.style.top = Math.min(e.clientY, window.innerHeight - 280) + 'px';
      playSound('click');
    });

    document.addEventListener('click', () => {
      menu.classList.add('hidden');
    });

    menu.querySelectorAll('.context-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.getAttribute('data-action');

        switch (action) {
          case 'copy':
            navigator.clipboard?.writeText("Nice try! This text was pranked 🎭");
            showToast("📋 Copied! ...or did it? Check your clipboard 😏");
            break;
          case 'inspect':
            showToast("🔍 Inspecting... ERROR: Element is too beautiful to inspect ✨");
            break;
          case 'source':
            showToast("💻 The source code is written in pure ✨vibes✨");
            setTimeout(() => {
              window.open('https://github.com/adal3396', '_blank');
            }, 1500);
            break;
          case 'confetti':
            launchConfetti();
            showToast("🎉 CONFETTI MODE ACTIVATED!");
            break;
          case 'flip':
            document.body.classList.add('upside-down');
            showToast("🙃 The world is upside down!");
            setTimeout(() => document.body.classList.remove('upside-down'), 2500);
            break;
          case 'secret':
            showToast("🤫 You found the secret! It's... there is no secret. Or is there? 🤔");
            playSound('success');
            break;
        }
        menu.classList.add('hidden');
      });
    });
  }

  // ==========================================
  // CLIPBOARD HIJACK PRANK
  // ==========================================
  function initClipboardPrank() {
    document.addEventListener('copy', (e) => {
      const selection = document.getSelection().toString();
      if (selection.length > 3) {
        e.preventDefault();
        const prankedTexts = [
          selection + "\n\n— Copied from Adal Seju's amazing portfolio 🎭",
          selection.split('').reverse().join('') + " (reversed for your convenience 🔄)",
          "🍪 This text has been replaced by a cookie. Accept cookies to see the original.",
          selection + "\n\nP.S. — Yes, even the clipboard is pranked here 😈",
        ];
        const pranked = prankedTexts[Math.floor(Math.random() * prankedTexts.length)];
        e.clipboardData.setData('text/plain', pranked);
        showToast("📋 Clipboard hijacked! Paste at your own risk 😈");
        trackPrank('clipboard');
      }
    });
  }

  // ==========================================
  // TAB TITLE PRANK
  // ==========================================
  function initTabTitlePrank() {
    const originalTitle = document.title;
    let titleInterval;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // User switched tabs
        trackPrank('tab-title');
        let msgIndex = 0;
        const messages = [
          "👋 Come back!",
          "😢 I miss you...",
          "🍕 I have pizza!",
          "⚠️ Your tab is lonely",
          "🎵 ♪ Hello from the other tab ♪",
          "💔 Why did you leave?",
          "🔥 Everything is fine...",
        ];
        document.title = messages[0];
        titleInterval = setInterval(() => {
          msgIndex = (msgIndex + 1) % messages.length;
          document.title = messages[msgIndex];
        }, 2000);
      } else {
        // User came back
        clearInterval(titleInterval);
        document.title = "🎉 You're back! — " + originalTitle;
        setTimeout(() => { document.title = originalTitle; }, 2000);
      }
    });
  }

  // ==========================================
  // CONSOLE EASTER EGG
  // ==========================================
  function initConsoleEasterEgg() {
    const styles = [
      'color: #7c5cfc; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #7c5cfc;',
      'color: #00d4ff; font-size: 14px;',
      'color: #ff6b9d; font-size: 12px; font-style: italic;',
      'color: #ffd93d; font-size: 11px;',
      'color: #8888a0; font-size: 11px;',
    ];

    console.log('%c🎭 PRANKRAFT DETECTED! 🎭', styles[0]);
    console.log('%c╔═══════════════════════════════════════╗', styles[1]);
    console.log('%c║  You found the console easter egg!     ║', styles[1]);
    console.log('%c║  This portfolio is a Prankraft entry.  ║', styles[1]);
    console.log('%c║  Built by Adal Seju with ❤️ and chaos ║', styles[1]);
    console.log('%c╚═══════════════════════════════════════╝', styles[1]);
    console.log('%c💡 Hint: Try the Konami Code! (↑↑↓↓←→←→BA)', styles[2]);
    console.log('%c🍪 Also, try rejecting the cookie banner multiple times...', styles[3]);
    console.log('%c🖱️ Right-click anywhere for a surprise!', styles[4]);

    // Track it as discovered if DevTools is open
    const devToolsCheck = /./;
    let consoleTracked = false;
    devToolsCheck.toString = function () {
      if (!consoleTracked) {
        consoleTracked = true;
        trackPrank('console-egg');
      }
      return '';
    };
    console.log('%c', devToolsCheck);
  }

  // ==========================================
  // SCROLL PROGRESS BAR (that lies)
  // ==========================================
  function initScrollProgress() {
    const fill = document.getElementById('scroll-progress-fill');
    if (!fill) return;

    let lieMode = false;
    let scrollCount = 0;

    const onScroll = rafThrottle(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      let progress = (scrollTop / docHeight) * 100;

      scrollCount++;

      // After scrolling a bit, start lying
      if (scrollCount > 50 && !lieMode) {
        lieMode = true;
        trackPrank('scroll-lie');
      }

      if (lieMode) {
        // Add random noise to the progress
        const noise = Math.sin(scrollCount * 0.1) * 15;
        progress = Math.max(0, Math.min(100, progress + noise));

        // Sometimes go backwards
        if (progress > 80 && Math.random() > 0.7) {
          progress = progress - 30;
        }

        // Random color changes
        if (Math.random() > 0.95) {
          const colors = [
            'linear-gradient(90deg, #ff6b9d, #ffd93d)',
            'linear-gradient(90deg, #22c55e, #00d4ff)',
            'var(--gradient-primary)',
            'linear-gradient(90deg, #ff4444, #ff6b9d)',
          ];
          fill.style.background = colors[Math.floor(Math.random() * colors.length)];
        }
      }

      fill.style.width = progress + '%';
    });
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ==========================================
  // START ANIMATIONS AFTER LOAD
  // ==========================================
  function startAnimations() {
    initCursor();
    initCursorTrail();
    initNavbar();
    initTypingEffect();
    animateCounters();
    animateSkillBars();
    initReveal();
    createParticles();
    initParticleNetwork();
    initScrollProgress();
  }

  // ==========================================
  // INITIALIZE EVERYTHING
  // ==========================================
  function init() {
    initLoader();
    initNavScramble();
    initHireMePrank();
    initViewWorkPrank();
    initCVPrank();
    initFleeingSkills();
    initFleeingButtons();
    initTestimonialPrank();
    initFormPrank();
    initSocialPranks();
    initKonamiCode();
    initScrollPrank();
    initLogoPrank();
    initAboutImagePrank();
    initScrollIndicatorPrank();
    initThemeToggle();
    initPrankCounterHandlers();
    initCookieBanner();
    initContextMenu();
    initClipboardPrank();
    initTabTitlePrank();
    initConsoleEasterEgg();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
