// Cinematic intro: plays once per browser session on load, then auto-collapses
// "Lucent Unbound Conscious Yield" into "LUCY" for the user (no manual scroll
// needed) by driving the SAME scroll-collapse app.js already listens for.
// Skippable, and never replays once shown this session (nav "LUCY" button just
// jumps to the top afterward, per spec - no repeat intro).
(function () {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    const ALREADY_PLAYED = sessionStorage.getItem('lucyIntroPlayed') === '1';
    if (ALREADY_PLAYED) {
        overlay.remove();
        return;
    }
    sessionStorage.setItem('lucyIntroPlayed', '1');

    document.body.style.overflow = 'hidden';   // no scrolling while the intro plays

    // ---- particle field: soft points drifting inward toward center ----
    const canvas = document.getElementById('intro-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const N = window.innerWidth < 700 ? 60 : 130;
    for (let i = 0; i < N; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 260 + Math.random() * 420;
        particles.push({
            x: W / 2 + Math.cos(angle) * dist,
            y: H / 2 + Math.sin(angle) * dist,
            baseDist: dist, angle,
            r: 0.6 + Math.random() * 1.6,
            speed: 0.15 + Math.random() * 0.35,
        });
    }

    let raf, startTime = performance.now();
    function frame(now) {
        const t = (now - startTime) / 1000;   // seconds since intro start
        ctx.clearRect(0, 0, W, H);
        const pull = Math.min(1, t / 3.2);    // particles converge over ~3.2s
        for (const p of particles) {
            const d = p.baseDist * (1 - pull * 0.86);
            const x = W / 2 + Math.cos(p.angle + t * p.speed * 0.15) * d;
            const y = H / 2 + Math.sin(p.angle + t * p.speed * 0.15) * d;
            const alpha = 0.15 + pull * 0.55;
            ctx.beginPath();
            ctx.arc(x, y, p.r + pull * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150, 195, 255, ${alpha})`;
            ctx.fill();
        }
        // soft central glow that brightens as particles converge
        const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 260);
        g.addColorStop(0, `rgba(120, 170, 255, ${0.10 + pull * 0.18})`);
        g.addColorStop(1, 'rgba(120, 170, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // ---- letters stagger in ----
    const letters = document.querySelectorAll('#intro-text .intro-line span');
    letters.forEach((el, i) => {
        el.style.transition = `opacity 0.55s ease ${i * 0.035}s, transform 0.55s cubic-bezier(0.2,0.8,0.2,1) ${i * 0.035}s`;
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
        });
    });

    const skipBtn = document.getElementById('intro-skip');
    setTimeout(() => skipBtn.classList.add('intro-visible'), 900);
    skipBtn.addEventListener('click', finish);

    // hold on the full text, then finish (unless skipped first)
    const holdTimer = setTimeout(finish, 3600);

    let finished = false;
    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(holdTimer);
        cancelAnimationFrame(raf);
        overlay.classList.add('intro-hidden');
        document.body.style.overflow = '';
        setTimeout(() => {
            overlay.remove();
            autoCollapseHero();
        }, 950);   // matches the CSS fade duration
    }

    // After the intro, smoothly scroll the page through the hero's collapse
    // range so "Lucent Unbound Conscious Yield" settles into "LUCY" on its
    // own - the user never has to scroll manually to see it (spec: "auto
    // collapse scroll down"). Uses the exact maxScroll app.js's own scroll
    // handler uses, so the two stay in sync.
    function autoCollapseHero() {
        // Native smooth-scroll, not a hand-rolled requestAnimationFrame tween: rAF can be
        // throttled/paused on a backgrounded or automated tab (verified live - a manual rAF
        // tween silently never advanced past frame 0 in that case), while the browser's own
        // compositor-driven smooth scroll keeps working regardless.
        const maxScroll = window.innerHeight * 1.5;
        const target = maxScroll * 0.97;   // settle just short of 1.0 so the tagline/scroll-indicator are still reachable
        window.scrollTo({ top: target, behavior: 'smooth' });
    }
})();
