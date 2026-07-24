document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollCollapse();
    initScrollReveal();
    initSpotlight();
    initCounters();
    initExamBars();
});

// Particle Effect
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height, particles;
    let isVisible = true;
    let animationFrameId;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5; // Smaller particles
            this.speedX = (Math.random() - 0.5) * 0.2; // Slower speed
            this.speedY = (Math.random() - 0.5) * 0.2;
            // Linear/Modern palette: very subtle indigo-white particles
            const roll = Math.random();
            this.color = roll > 0.75
                ? 'rgba(255,123,159,0.22)'    // indigo
                : roll > 0.5
                    ? 'rgba(170,170,200,0.12)' // cool white
                    : 'rgba(255,123,159,0.09)'; // faint indigo
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        // Significantly reduced particle count for performance
        const numParticles = window.innerWidth < 768 ? 20 : 40;
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        if (!isVisible) return; // Pause rendering if not visible

        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        init();
    });

    // Use IntersectionObserver to pause animation when scrolled past hero
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!isVisible) {
                    isVisible = true;
                    animate();
                }
            } else {
                isVisible = false;
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
            }
        });
    });
    
    // Assuming hero section is where the effect is most visible
    const hero = document.getElementById('hero');
    if(hero) observer.observe(hero);

    init();
    animate();
}

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
                
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Timeline Scroll Reveal Effect
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const nodes = document.querySelectorAll('.timeline-node');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                if (entry.target.classList.contains('timeline-node')) {
                    entry.target.classList.add('active');
                }
            } else {
                // Optional: remove class when scrolling up if we want it to trigger again
                // entry.target.classList.remove('is-revealed');
                // entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
    nodes.forEach(node => revealObserver.observe(node));
}

// ── Mouse spotlight on cards ──
function initSpotlight() {
    const cards = document.querySelectorAll('.glass-card, .intro-point, .exam-card, .cap');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--sx', `${e.clientX - rect.left}px`);
            card.style.setProperty('--sy', `${e.clientY - rect.top}px`);
        });
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
