document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollCollapse();
    initScrollReveal();
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
            this.color = Math.random() > 0.8 ? 'rgba(230, 25, 25, 0.4)' : 'rgba(255, 255, 255, 0.2)'; // Less opacity
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
        dot.style.color = 'var(--accent-red)';
        dot.style.width = '0px';
        dot.style.display = 'inline-block';
        dot.style.overflow = 'hidden';
        dot.style.transition = 'opacity 0.1s ease';
        initial.parentNode.insertBefore(dot, initial.nextSibling);
    });

    const dots = document.querySelectorAll('.dot');

    window.addEventListener('scroll', () => {
        // Calculate scroll progress specifically for the hero section
        // Hero is 300vh. We want the effect to complete over the first 150vh.
        const scrollY = window.scrollY;
        const maxScroll = window.innerHeight * 1.5;
        let progress = Math.min(scrollY / maxScroll, 1);

        // Calculate opacity and max-width for remainders based on progress
        // When progress = 0: opacity 1, max-width fully expanded (e.g., 500px)
        // When progress = 1: opacity 0, max-width 0px
        const remainderOpacity = 1 - progress;
        
        // Easing for smoother collapse
        const easeProgress = Math.pow(progress, 2);

        remainders.forEach(r => {
            r.style.opacity = remainderOpacity;
            // Use a clip-path or max-width to collapse
            if (progress === 1) {
                r.style.display = 'none';
            } else {
                r.style.display = 'inline-block';
                // Estimate max width based on viewport to avoid wrapping jumps
                const maxWidth = window.innerWidth > 768 ? 400 : 200;
                r.style.maxWidth = `${maxWidth * (1 - easeProgress)}px`;
            }
        });

        // Show dots as it collapses
        dots.forEach(dot => {
            if (progress > 0.8) {
                dot.style.width = 'auto';
                dot.style.opacity = (progress - 0.8) * 5; // fade in from 0.8 to 1.0
            } else {
                dot.style.opacity = '0';
                dot.style.width = '0px';
            }
        });

        // Adjust gap in container to bring letters together
        if (progress > 0.8) {
            const gap = 1 - ((progress - 0.8) * 5); // From 1rem to 0rem
            container.style.gap = `${gap}rem`;
            // Add red glow effect to initials
            initials.forEach(initial => initial.classList.add('collapsed-initial'));
        } else {
            container.style.gap = '1rem';
            initials.forEach(initial => initial.classList.remove('collapsed-initial'));
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
