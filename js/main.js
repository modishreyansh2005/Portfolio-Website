/**
 * Neel - Senior AI & ML Engineer Portfolio
 * Master Orchestrator: Ink Cursor, Intersection Observers, Lab Tabs, Project Filters, & Micro-Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. CLASSICAL INK CURSOR & MAGNETIC PULL
  // =========================================================================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }
  });

  // Smooth Spring Ring Follower
  function renderCursorRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    if (cursorRing) {
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    }
    requestAnimationFrame(renderCursorRing);
  }
  renderCursorRing();

  // Hover states on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, input, select, textarea, .pillar-card, .timeline-card, .classical-project-card, .token-bubble');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Ink Ripple on Click
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-ink';
    const size = 32;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - size / 2}px`;
    ripple.style.top = `${e.clientY - size / 2}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 750);
  });

  // Magnetic Buttons
  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

  // Dynamic 3D Card Tilt with Specular Glare Follower
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;

      // Update radial glare position
      card.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // =========================================================================
  // 2. NAVBAR SCROLL EFFECT & MOBILE DRAWER
  // =========================================================================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('active');
      if (window.classicalAudio) window.classicalAudio.playTick(700);
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => mobileDrawer.classList.remove('active'));
    });
  }

  // =========================================================================
  // 3. STAT METRICS ANIMATED COUNTER
  // =========================================================================
  const metricElements = document.querySelectorAll('.metric-num');
  let metricsAnimated = false;

  function animateMetrics() {
    metricElements.forEach(el => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      let count = 0;
      const duration = 1800;
      const stepTime = 30;
      const increment = Math.max(1, Math.ceil(target / (duration / stepTime)));

      const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
          el.textContent = target;
          clearInterval(timer);
        } else {
          el.textContent = count;
        }
      }, stepTime);
    });
  }

  // Animate on load
  setTimeout(() => {
    if (!metricsAnimated) {
      animateMetrics();
      metricsAnimated = true;
    }
  }, 400);

  // =========================================================================
  // 4. INTERSECTION OBSERVER FOR REVEALS & SKILL PROGRESS BARS
  // =========================================================================
  const revealElements = document.querySelectorAll('[data-reveal]');
  const skillFills = document.querySelectorAll('.skill-fill');

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => revealObserver.observe(el));

  const skillsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        skillFills.forEach(fill => fill.classList.add('animated'));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const skillsSection = document.getElementById('skills');
  if (skillsSection) skillsObserver.observe(skillsSection);

  // =========================================================================
  // 5. INTERACTIVE LATENT LAB TABS
  // =========================================================================
  const tabButtons = document.querySelectorAll('.lab-tab-btn');
  const tabContents = document.querySelectorAll('.lab-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      if (window.classicalAudio) window.classicalAudio.playTick(900);

      // Trigger resize event to repaint active canvas properly
      window.dispatchEvent(new Event('resize'));
    });
  });

  // =========================================================================
  // 6. PROJECTS FILTER BAR
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.classical-project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });

      if (window.classicalAudio) window.classicalAudio.playTick(850);
    });
  });

  // =========================================================================
  // 7. BIBTEX & COORDINATE CLIPBOARD COPY
  // =========================================================================
  const bibCopyBtns = document.querySelectorAll('.btn-copy-bib');
  bibCopyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const bib = btn.getAttribute('data-bib');
      if (bib) {
        navigator.clipboard.writeText(bib).then(() => {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> BibTeX Copied!';
          btn.style.color = '#10b981';
          if (window.classicalAudio) window.classicalAudio.playChime(659.25);

          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.color = '';
          }, 2200);
        });
      }
    });
  });

  const coordCopyBtns = document.querySelectorAll('.btn-copy-coord');
  coordCopyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const copyVal = btn.getAttribute('data-copy');
      if (copyVal) {
        navigator.clipboard.writeText(copyVal).then(() => {
          btn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i>';
          if (window.classicalAudio) window.classicalAudio.playChime(784);
          setTimeout(() => {
            btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
          }, 2000);
        });
      }
    });
  });

  // =========================================================================
  // 8. DISPATCH TRANSMISSION FORM
  // =========================================================================
  const dispatchForm = document.getElementById('dispatch-form');
  const submitBtn = document.getElementById('btn-submit-dispatch');
  const statusMsg = document.getElementById('form-status');

  if (dispatchForm && submitBtn) {
    submitBtn.addEventListener('click', () => {
      const name = document.getElementById('sender-name').value.trim();
      const email = document.getElementById('sender-email').value.trim();
      const msg = document.getElementById('sender-message').value.trim();

      if (!name || !email || !msg) {
        if (statusMsg) {
          statusMsg.className = 'form-status-message';
          statusMsg.style.display = 'block';
          statusMsg.style.background = 'rgba(239, 68, 68, 0.1)';
          statusMsg.style.color = '#991b1b';
          statusMsg.style.border = '1px solid rgba(239, 68, 68, 0.2)';
          statusMsg.textContent = 'Please complete all coordinates before transmitting.';
        }
        if (window.classicalAudio) window.classicalAudio.playTick(400);
        return;
      }

      // Simulate successful transmission
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Encrypting & Transmitting...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Transmit Electronic Dispatch</span> <i class="fa-solid fa-paper-plane"></i>';
        dispatchForm.reset();

        if (statusMsg) {
          statusMsg.className = 'form-status-message success';
          statusMsg.innerHTML = '<i class="fa-solid fa-circle-check"></i> <strong>Transmission Authenticated.</strong> Your dispatch has been securely queued to Neel\'s research terminal.';
        }

        if (window.classicalAudio) window.classicalAudio.playChime(523.25);
      }, 1100);
    });
  }
});
