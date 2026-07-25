document.addEventListener('DOMContentLoaded', () => {
    initScrollCollapse();
    initScrollReveal();
    initSpotlight();
    initCounters();
    initExamBars();
    initMagneticElements();
    initParallax();
    initVelocitySkew();
});

// Scroll Collapse Effect for "L.U.C.Y"
function initScrollCollapse() {
    const heroSection = document.getElementById('hero');
    const remainders = document.querySelectorAll('.remainder');
    const initials = document.querySelectorAll('.initial');
    const container = document.getElementById('collapse-container');

    // Add dots dynamically
    initials.forEach((initial, index) => {
        const dot = document.createElement('span');
        dot.textContent = '.';
        dot.className = 'dot';
        dot.style.opacity = '0';
        dot.style.color = 'var(--accent-deep)';
        dot.style.width = '0px';
        dot.style.display = 'inline-block';
        dot.style.overflow = 'hidden';
        dot.style.transition = 'opacity 0.1s ease';
        initial.parentNode.insertBefore(dot, initial.nextSibling);
    });

    const dots = document.querySelectorAll('.dot');

    let maxScroll = window.innerHeight * 1.5;
    let winWidth = window.innerWidth;
    
    window.addEventListener('resize', () => {
        maxScroll = window.innerHeight * 1.5;
        winWidth = window.innerWidth;
    });

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                let progress = Math.min(scrollY / maxScroll, 1);
                const remainderOpacity = 1 - progress;
                const easeProgress = Math.pow(progress, 2);

                remainders.forEach(r => {
                    r.style.opacity = remainderOpacity;
                    if (progress === 1) {
                        r.style.display = 'none';
                    } else {
                        r.style.display = 'inline-block';
                        const maxWidth = winWidth > 768 ? 400 : 200;
                        r.style.maxWidth = `${maxWidth * (1 - easeProgress)}px`;
                    }
                });

                dots.forEach(dot => {
                    if (progress > 0.8) {
                        dot.style.width = 'auto';
                        dot.style.opacity = (progress - 0.8) * 5;
                    } else {
                        dot.style.opacity = '0';
                        dot.style.width = '0px';
                    }
                });

                if (progress > 0.8) {
                    const gap = 1 - ((progress - 0.8) * 5);
                    container.style.gap = `${Math.max(0, gap)}rem`;
                    initials.forEach(initial => initial.classList.add('collapsed-initial'));
                } else {
                    container.style.gap = '1.2rem';
                    initials.forEach(initial => initial.classList.remove('collapsed-initial'));
                }
                
                // Hero text pull effect
                const heroText = document.querySelector('.hero-content p');
                const heroBtns = document.querySelector('.hero-actions');
                if (heroText && heroBtns) {
                    heroText.style.transform = `translateY(${scrollY * 0.1}px)`;
                    heroText.style.opacity = 1 - progress * 1.5;
                    heroBtns.style.transform = `translateY(${scrollY * 0.15}px)`;
                    heroBtns.style.opacity = 1 - progress * 1.5;
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// Timeline Scroll Reveal Effect & Split Text
function initScrollReveal() {
    // Setup split text for section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        // Skip if already split or has nested HTML (like links)
        if (title.children.length > 0) return;
        
        const text = title.textContent;
        title.innerHTML = '';
        text.split(' ').forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.overflow = 'hidden';
            wordSpan.style.verticalAlign = 'top';
            wordSpan.style.paddingRight = '0.3em';
            
            const innerSpan = document.createElement('span');
            innerSpan.textContent = word;
            innerSpan.style.display = 'inline-block';
            innerSpan.style.transform = 'translateY(110%)';
            innerSpan.style.transition = `transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${wordIndex * 0.06}s`;
            // Keep the text gradient working on the inner spans
            innerSpan.style.background = 'inherit';
            innerSpan.style.webkitBackgroundClip = 'text';
            innerSpan.style.webkitTextFillColor = 'transparent';
            
            wordSpan.appendChild(innerSpan);
            title.appendChild(wordSpan);
        });
    });

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const titles = document.querySelectorAll('.section-title');
    const nodes = document.querySelectorAll('.timeline-node');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                if (entry.target.classList.contains('timeline-node')) {
                    entry.target.classList.add('active');
                }
                
                // Trigger text split reveal
                if(entry.target.classList.contains('section-title')) {
                     const spans = entry.target.querySelectorAll('span > span');
                     spans.forEach(s => s.style.transform = 'translateY(0)');
                }
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
    titles.forEach(el => revealObserver.observe(el));
    nodes.forEach(node => revealObserver.observe(node));
}

// ── Mouse spotlight on cards (RAF-throttled) ──
function initSpotlight() {
    const cards = document.querySelectorAll('.glass-card, .intro-point, .exam-card, .cap');
    cards.forEach(card => {
        let rafPending = false;
        card.addEventListener('mousemove', e => {
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--sx', `${e.clientX - rect.left}px`);
                card.style.setProperty('--sy', `${e.clientY - rect.top}px`);
                rafPending = false;
            });
        }, { passive: true });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--sx', '-9999px');
            card.style.setProperty('--sy', '-9999px');
        });
    });
}

// ── Animated stat counters ──
function initCounters() {
    const stats = document.querySelectorAll('.stat-num[data-target]');
    if (!stats.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            obs.unobserve(entry.target);
            animateCounter(entry.target);
        });
    }, { threshold: 0.6 });

    stats.forEach(el => obs.observe(el));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Expo-out easing
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(eased * target);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + suffix;
    }
    requestAnimationFrame(step);
}

// ── Animated exam progress bars ──
function initExamBars() {
    const bars = document.querySelectorAll('.exam-bar span');
    bars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';

        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                obs.unobserve(entry.target);
                // Small delay so it's visible after reveal
                setTimeout(() => { bar.style.width = targetWidth; }, 300);
            });
        }, { threshold: 0.8 });

        obs.observe(bar);
    });
}

// ── Magnetic elements (RAF-throttled, passive) ──
function initMagneticElements() {
    const magnetics = document.querySelectorAll('.nav-btn, .cyber-btn, .neural-node');
    magnetics.forEach(btn => {
        let rafPending = false;
        let lastE = null;
        btn.addEventListener('mousemove', (e) => {
            lastE = e;
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(() => {
                if (!lastE) { rafPending = false; return; }
                const rect = btn.getBoundingClientRect();
                const x = (lastE.clientX - rect.left) - rect.width / 2;
                const y = (lastE.clientY - rect.top) - rect.height / 2;
                btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
                rafPending = false;
            });
        }, { passive: true });
        btn.addEventListener('mouseleave', () => {
            lastE = null;
            btn.style.transform = 'translate(0,0)';
        });
    });
}

// ── Subtle Parallax (GPU-only: translateY, not CSS var in keyframes) ──
function initParallax() {
    // Apply parallax as a direct transform on the blobs, not injected into keyframe --vars.
    // This means the animation compositor handles the keyframe, and JS does a separate translate.
    // We use a wrapper translateY on the ambient-bg so blobs keep their own animations.
    const blobs = document.querySelectorAll('.blob');
    let ticking = false;
    let lastY = 0;
    window.addEventListener('scroll', () => {
        lastY = window.scrollY;
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const offset = lastY * 0.12;
            blobs.forEach((b, i) => {
                // Each blob gets a slightly different rate
                const rate = 0.08 + i * 0.03;
                b.style.setProperty('--parallax-translate', `${lastY * rate}px`);
            });
            ticking = false;
        });
    }, { passive: true });
}

// ── Scroll Velocity Skew (Cool animation) ──
function initVelocitySkew() {
    const skewElements = document.querySelectorAll('.glass-card, .timeline-node');
    if (!skewElements.length) return;

    let lastY = window.scrollY;
    let currentSkew = 0;
    let ticking = false;

    // Apply smooth spring-like decay to skew
    function updateSkew() {
        // Interpolate skew back to 0
        currentSkew += (0 - currentSkew) * 0.15;
        
        // Stop updating if it's visually zero to save battery
        if (Math.abs(currentSkew) < 0.1) {
            currentSkew = 0;
            skewElements.forEach(el => el.style.transform = '');
        } else {
            skewElements.forEach(el => {
                // Combine with existing transforms if needed, here we just apply skewY
                el.style.transform = `skewY(${currentSkew}deg)`;
            });
            requestAnimationFrame(updateSkew);
        }
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                const delta = y - lastY;
                lastY = y;
                
                // Calculate velocity-based skew (capped at 4 degrees)
                const velocity = Math.min(Math.max(delta * 0.05, -4), 4);
                
                // Only trigger update loop if skew changes significantly
                const previousSkew = currentSkew;
                currentSkew = velocity;
                
                if (Math.abs(previousSkew) < 0.1 && Math.abs(currentSkew) >= 0.1) {
                    requestAnimationFrame(updateSkew);
                }
                
                ticking = false;
            });
        }
    }, { passive: true });
}


