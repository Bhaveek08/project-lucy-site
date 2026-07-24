// SAO "Link Start" style intro - Three.js (vendored r128, global THREE).
// Sequence: letters stagger in -> streak tunnel accelerates around the camera ->
// white flash that FADES OUT FROM CENTER, revealing the site -> hero auto-collapse.
// Falls back to the old 2D-canvas intro (intro.js) when WebGL is unavailable or
// the user prefers reduced motion. Plays once per browser session.
(function () {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    if (sessionStorage.getItem('lucyIntroPlayed') === '1') {
        overlay.remove();
        return;
    }

    // ---- capability gate BEFORE claiming the intro (fallback must still run) ----
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.getElementById('intro-canvas');
    let gl = null;
    try { gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'); } catch (e) { /* fall through */ }
    if (!gl || reducedMotion || typeof THREE === 'undefined') {
        const s = document.createElement('script');
        s.src = 'intro.js';           // old soft-particle intro: gentler + no WebGL needed
        document.body.appendChild(s);
        return;
    }
    sessionStorage.setItem('lucyIntroPlayed', '1');
    document.body.style.overflow = 'hidden';

    // ================= three.js streak tunnel =================
    const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 0, 0);

    window.addEventListener('resize', onResize);
    function onResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    // streaks: thin elongated boxes flying past the camera, additive-blended.
    // Mostly white-blue core with rainbow accents (the SAO login palette).
    const COUNT = window.innerWidth < 700 ? 260 : 520;
    const PALETTE = ['#ffffff', '#cfe4ff', '#9fd0ff', '#9fd0ff', '#ffffff',
                     '#ff9fe0', '#a0ffc8', '#ffe29f', '#c2a0ff', '#9fffff'];
    const geo = new THREE.BoxGeometry(0.016, 0.016, 1);
    const mat = new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending, transparent: true, opacity: 0.9, depthWrite: false,
    });
    const streaks = new THREE.InstancedMesh(geo, mat, COUNT);
    const S = [];   // per-streak state {x, y, z}
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.55 + Math.pow(Math.random(), 0.7) * 5.5;   // hollow center for the camera path
        S.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: -6 - Math.random() * 60 });
        streaks.setColorAt(i, color.set(PALETTE[(Math.random() * PALETTE.length) | 0]));
    }
    scene.add(streaks);

    // glow at the end of the tunnel (radial-gradient sprite, additive)
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 256;
    const gctx = glowCanvas.getContext('2d');
    const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(210, 230, 255, 1)');
    grad.addColorStop(0.35, 'rgba(140, 185, 255, 0.55)');
    grad.addColorStop(1, 'rgba(140, 185, 255, 0)');
    gctx.fillStyle = grad; gctx.fillRect(0, 0, 256, 256);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(glowCanvas),
        blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.0,
    }));
    glow.position.set(0, 0, -50);
    glow.scale.set(30, 30, 1);
    scene.add(glow);

    // ================= timeline =================
    // 0.0-1.2s  letters land, streaks drift slow
    // 1.2-3.2s  acceleration ramp (ease-in cubic), text fades ~1.9s, FOV pumps
    // ~3.25s    white flash -> site revealed under it -> flash opens from center
    const T_RAMP0 = 1.2, T_RAMP1 = 3.2, T_FLASH = 3.25;
    const easeInCubic = (u) => u * u * u;

    const introText = document.getElementById('intro-text');
    const skipBtn = document.getElementById('intro-skip');
    skipBtn.addEventListener('click', () => finish(true));

    let raf, startTime, textFaded = false, flashed = false, begun = false;

    // rAF is frozen while a tab is hidden (opened in the background) - starting the
    // clock at load would fast-forward straight to the flash on first focus. Begin
    // the whole timeline only once the document is actually visible.
    function begin() {
        if (begun) return;
        begun = true;
        const letters = document.querySelectorAll('#intro-text .intro-line span');
        letters.forEach((el, i) => {
            el.style.transition = `opacity 0.55s ease ${i * 0.035}s, transform 0.55s cubic-bezier(0.2,0.8,0.2,1) ${i * 0.035}s`;
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0) scale(1)';
            });
        });
        setTimeout(() => skipBtn.classList.add('intro-visible'), 900);
        startTime = performance.now();
        raf = requestAnimationFrame(frame);
    }
    if (document.visibilityState === 'visible') begin();
    else document.addEventListener('visibilitychange', function onVis() {
        if (document.visibilityState !== 'visible') return;
        document.removeEventListener('visibilitychange', onVis);
        begin();
    });

    function frame(now) {
        try { frameBody(now); }
        catch (e) {                       // any runtime surprise: never strand the overlay
            console.error('intro3d:', e);
            finish(true);
        }
    }

    function frameBody(now) {
        const t = (now - startTime) / 1000;
        const dt = Math.min(0.05, (now - (frame.__last || now)) / 1000 || 0.016);   // clamp tab-switch gaps
        frame.__last = now;

        const u = Math.min(1, Math.max(0, (t - T_RAMP0) / (T_RAMP1 - T_RAMP0)));
        const speed = 6 + easeInCubic(u) * 110;              // units/s toward the camera
        const stretch = 0.6 + speed * 0.10;                  // streaks elongate with speed

        for (let i = 0; i < COUNT; i++) {
            const s = S[i];
            s.z += speed * dt;
            if (s.z > 1) {                                   // passed the camera - respawn far away
                const a = Math.random() * Math.PI * 2;
                const r = 0.55 + Math.pow(Math.random(), 0.7) * 5.5;
                s.x = Math.cos(a) * r; s.y = Math.sin(a) * r; s.z = -60 - Math.random() * 8;
            }
            dummy.position.set(s.x, s.y, s.z);
            dummy.scale.set(1, 1, stretch);
            dummy.updateMatrix();
            streaks.setMatrixAt(i, dummy.matrix);
        }
        streaks.instanceMatrix.needsUpdate = true;

        glow.material.opacity = 0.15 + u * 0.85;             // tunnel-end light swells
        camera.fov = 70 + u * 26;                            // warp FOV pump
        camera.updateProjectionMatrix();

        if (!textFaded && t > 1.9) {
            textFaded = true;
            introText.style.transition = 'opacity 0.7s ease';
            introText.style.opacity = '0';
        }
        if (!flashed && t >= T_FLASH) { flash(); return; }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
    }

    // ================= the flash: white, then FADES OUT FROM CENTER =================
    // A fullscreen div snaps to solid white (0.12s), the overlay is removed underneath,
    // then a transparent hole grows from the center (radial-gradient edge kept soft)
    // while the remaining white fades - the site emerges through the middle first.
    function flash() {
        if (flashed) return;
        flashed = true;
        const f = document.createElement('div');
        f.id = 'intro-flash';
        f.style.cssText = 'position:fixed;inset:0;z-index:10001;pointer-events:none;background:#fff;opacity:0;transition:opacity 0.12s ease-out;';
        document.body.appendChild(f);
        requestAnimationFrame(() => { f.style.opacity = '1'; });

        setTimeout(() => {
            teardown();               // overlay gone - site sits under the white
            const t0 = performance.now();
            const DUR = 900;
            (function open(now) {
                const p = Math.min(1, (now - t0) / DUR);
                const hole = p * 150;                                  // hole radius, vmax %
                const fade = 1 - p * p;                                // white remnant fades late
                f.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0) ${hole * 0.72}%, rgba(255,255,255,${fade}) ${Math.min(150, hole * 0.72 + 26)}%)`;
                if (p < 1) requestAnimationFrame(open);
                else f.remove();
            })(t0);
            autoCollapseHero();
        }, 160);
    }

    let done = false;
    function teardown() {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        overlay.remove();
        document.body.style.overflow = '';
        geo.dispose(); mat.dispose();
        glow.material.map.dispose(); glow.material.dispose();
        renderer.dispose();
    }

    // Skip: no flash spectacle, just a quick clean reveal (same as the old intro's exit)
    function finish(skipped) {
        if (done || flashed) return;
        flashed = true;
        overlay.classList.add('intro-hidden');
        setTimeout(() => { teardown(); autoCollapseHero(); }, 950);
    }

    // After the intro, smooth-scroll the hero's collapse range so "Lucent Unbound
    // Conscious Yield" settles into "LUCY" on its own (same maxScroll app.js uses).
    // Native smooth scroll, not a rAF tween - rAF can be throttled on hidden tabs.
    function autoCollapseHero() {
        const maxScroll = window.innerHeight * 1.5;
        window.scrollTo({ top: maxScroll * 0.97, behavior: 'smooth' });
    }
})();
