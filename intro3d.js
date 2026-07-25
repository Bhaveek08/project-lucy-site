// SAO "Link Start" faithful recreation — Three.js (vendored r128, global THREE).
// 4 Phases:
//   Phase 1 (0-1.5s):  2D canvas overlay — circuit-board lines trace from center
//   Phase 2 (1.5-2.8s): 3D wireframe polygon grid materializes around camera
//   Phase 3 (2.8-4.2s): Electric-blue streak warp tunnel accelerates
//   Phase 4 (4.2-4.8s): White flash -> "Link Start" -> radial reveal of site
//
// Falls back to the old 2D intro (intro.js) when WebGL unavailable or reduced-motion.
// Plays once per browser session.
(function () {
    const overlay = document.getElementById("intro-overlay");
    if (!overlay) return;

    if (sessionStorage.getItem("lucyIntroPlayed") === "1") {
        overlay.remove();
        return;
    }

    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const threeCanvas = document.getElementById("intro-canvas");
    let gl = null;
    try { gl = threeCanvas.getContext("webgl") || threeCanvas.getContext("experimental-webgl"); } catch (e) {}
    if (!gl || reducedMotion || typeof THREE === "undefined") {
        const s = document.createElement("script");
        s.src = "intro.js";
        document.body.appendChild(s);
        return;
    }
    sessionStorage.setItem("lucyIntroPlayed", "1");
    document.body.style.overflow = "hidden";

    // 2D overlay canvas for Phase 1 circuit lines
    const lineCanvas = document.createElement("canvas");
    lineCanvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:10001;pointer-events:none;transition:opacity 0.5s ease;";
    lineCanvas.width = window.innerWidth;
    lineCanvas.height = window.innerHeight;
    document.body.appendChild(lineCanvas);
    const lctx = lineCanvas.getContext("2d");

    // Three.js setup
    const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, context: gl, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 0);

    window.addEventListener("resize", onResize);
    function onResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        lineCanvas.width = window.innerWidth;
        lineCanvas.height = window.innerHeight;
    }

    // SAO Electric Blue palette
    var PALE = ["#00cfff","#00aaff","#0077ff","#00ffee","#ffffff","#66dfff","#33bbff","#0055cc","#aaf0ff","#55ccff"];

    // Phase 2: Wireframe hexagonal grid
    const gridGroup = new THREE.Group();
    scene.add(gridGroup);
    const hexes = [];

    function makeHex(cx, cy, cz, size, color) {
        var pts = [];
        for (var i = 0; i <= 6; i++) {
            var a = (Math.PI / 3) * i - Math.PI / 6;
            pts.push(new THREE.Vector3(cx + size * Math.cos(a), cy + size * Math.sin(a), cz));
        }
        var geo = new THREE.BufferGeometry().setFromPoints(pts);
        var mat = new THREE.LineBasicMaterial({ color: color || 0x00aaff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
        return new THREE.Line(geo, mat);
    }

    var HEX_ROWS = 7, HEX_SIZE = 0.55;
    for (var row = -HEX_ROWS; row <= HEX_ROWS; row++) {
        for (var col = -HEX_ROWS; col <= HEX_ROWS; col++) {
            var x = col * HEX_SIZE * 1.75;
            var y = row * HEX_SIZE * 1.5 + (Math.abs(col) % 2) * HEX_SIZE * 0.75;
            var dist = Math.sqrt(x * x + y * y);
            if (dist > HEX_ROWS * HEX_SIZE * 1.6) continue;
            var colorIdx = Math.random() > 0.85 ? 0x00ffee : 0x00aaff;
            var hex = makeHex(x, y, -8, HEX_SIZE * 0.85, colorIdx);
            hex.userData.dist = dist;
            hex.userData.phase2Delay = dist * 0.08;
            gridGroup.add(hex);
            hexes.push(hex);
        }
    }

    // Phase 3: Streak tunnel
    var COUNT = window.innerWidth < 700 ? 200 : 380;
    var streakGeo = new THREE.BoxGeometry(0.012, 0.012, 1);
    var streakMat = new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, transparent: true, opacity: 0.85, depthWrite: false });
    var streaks = new THREE.InstancedMesh(streakGeo, streakMat, COUNT);
    streaks.visible = false;
    var S = [];
    var dummy = new THREE.Object3D();
    var col3 = new THREE.Color();
    for (var i = 0; i < COUNT; i++) {
        var a = Math.random() * Math.PI * 2;
        var r = 0.3 + Math.pow(Math.random(), 0.6) * 5.0;
        S.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: -4 - Math.random() * 55 });
        streaks.setColorAt(i, col3.set(PALE[(Math.random() * PALE.length) | 0]));
    }
    streaks.instanceColor.needsUpdate = true;
    scene.add(streaks);

    // Central glow orb
    var glowC = document.createElement("canvas");
    glowC.width = glowC.height = 256;
    var gctx = glowC.getContext("2d");
    var grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(0, 210, 255, 1)");
    grad.addColorStop(0.3, "rgba(0, 140, 255, 0.6)");
    grad.addColorStop(1, "rgba(0, 80, 200, 0)");
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 256, 256);
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowC), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.0 }));
    glow.position.set(0, 0, -55);
    glow.scale.set(28, 28, 1);
    scene.add(glow);

    // Phase 1 line data
    var W = window.innerWidth, H = window.innerHeight;
    var CX = W / 2, CY = H / 2;
    var lineSegs = [];
    var NUM_LINES = window.innerWidth < 700 ? 18 : 32;
    for (var i = 0; i < NUM_LINES; i++) {
        var angle = (Math.PI * 2 / NUM_LINES) * i + Math.random() * 0.15;
        var length = 140 + Math.random() * (Math.min(W, H) * 0.38);
        var branches = Math.floor(1 + Math.random() * 2);
        var seg = { angle: angle, length: length, delay: Math.random() * 0.6, speed: 0.5 + Math.random() * 0.5, color: PALE[(Math.random() * PALE.length) | 0], isBranch: false };
        lineSegs.push(seg);
        for (var b = 0; b < branches; b++) {
            var branchDist = length * (0.25 + Math.random() * 0.5);
            var branchAngle = angle + (Math.random() - 0.5) * 0.8;
            var branchLen = 30 + Math.random() * 80;
            lineSegs.push({ angle: branchAngle, startDist: branchDist, length: branchLen, delay: Math.random() * 0.8 + 0.2, speed: 0.4 + Math.random() * 0.4, color: PALE[(Math.random() * PALE.length) | 0], isBranch: true, parentAngle: angle });
        }
    }

    // Skip button
    var skipBtn = document.getElementById("intro-skip");
    skipBtn.addEventListener("click", function() { finish(true); });
    setTimeout(function() { skipBtn.classList.add("intro-visible"); }, 1000);

    // Timing
    var T_P1_END = 1.5, T_P2_END = 2.8, T_P3_END = 4.2, T_FLASH = 4.25;
    function easeInCubic(u) { return u * u * u; }
    function easeOutQuad(u) { return 1 - (1 - u) * (1 - u); }

    var raf, startTime, flashed = false, begun = false, done = false;

    function begin() {
        if (begun) return;
        begun = true;
        var introText = document.getElementById("intro-text");
        if (introText) introText.style.opacity = "0";
        startTime = performance.now();
        raf = requestAnimationFrame(frame);
    }

    if (document.visibilityState === "visible") begin();
    else document.addEventListener("visibilitychange", function onVis() {
        if (document.visibilityState !== "visible") return;
        document.removeEventListener("visibilitychange", onVis);
        begin();
    });

    function frame(now) {
        try { frameBody(now); } catch (e) { console.error("intro3d:", e); finish(true); }
    }

    function frameBody(now) {
        var t = (now - startTime) / 1000;
        var dt = Math.min(0.05, (now - (frame.__last || now)) / 1000 || 0.016);
        frame.__last = now;

        // Phase 1: 2D circuit lines
        if (t < T_P1_END + 0.35) {
            lctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);

            for (var si = 0; si < lineSegs.length; si++) {
                var seg = lineSegs[si];
                var segT = Math.max(0, (t - seg.delay) * seg.speed);
                if (segT <= 0) continue;
                var drawFrac = Math.min(1, segT / 1.2);
                var alpha = Math.min(1, drawFrac * 2) * (t < T_P1_END ? 1 : Math.max(0, 1 - (t - T_P1_END) * 3.5));
                if (alpha <= 0) continue;

                lctx.strokeStyle = seg.color;
                lctx.globalAlpha = alpha * 0.85;
                lctx.lineWidth = 1.2;
                lctx.shadowBlur = 7;
                lctx.shadowColor = "#00aaff";
                lctx.beginPath();

                if (seg.isBranch) {
                    var sx = CX + Math.cos(seg.parentAngle) * seg.startDist;
                    var sy = CY + Math.sin(seg.parentAngle) * seg.startDist;
                    lctx.moveTo(sx, sy);
                    lctx.lineTo(sx + Math.cos(seg.angle) * seg.length * drawFrac, sy + Math.sin(seg.angle) * seg.length * drawFrac);
                    lctx.stroke();
                    // node dot
                    lctx.globalAlpha = alpha;
                    lctx.fillStyle = "#aaf0ff";
                    lctx.shadowBlur = 10;
                    lctx.beginPath();
                    lctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
                    lctx.fill();
                } else {
                    lctx.moveTo(CX, CY);
                    lctx.lineTo(CX + Math.cos(seg.angle) * seg.length * drawFrac, CY + Math.sin(seg.angle) * seg.length * drawFrac);
                    lctx.stroke();
                }
            }

            // Central glow
            var cgAlpha = Math.min(1, t * 2.5) * (t < T_P1_END ? 1 : Math.max(0, 1 - (t - T_P1_END) * 4));
            var cg = lctx.createRadialGradient(CX, CY, 0, CX, CY, 55 + t * 12);
            cg.addColorStop(0, "rgba(0, 220, 255, " + (cgAlpha * 0.9) + ")");
            cg.addColorStop(0.4, "rgba(0, 140, 255, " + (cgAlpha * 0.4) + ")");
            cg.addColorStop(1, "rgba(0, 80, 200, 0)");
            lctx.globalAlpha = 1;
            lctx.shadowBlur = 0;
            lctx.fillStyle = cg;
            lctx.beginPath();
            lctx.arc(CX, CY, 70, 0, Math.PI * 2);
            lctx.fill();
        } else {
            lctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
        }

        // Phase 2: Polygon grid
        if (t >= T_P1_END * 0.6 && t < T_P2_END + 0.5) {
            var p2Start = T_P1_END * 0.6;
            var fadeOut = t > T_P2_END ? Math.max(0, 1 - (t - T_P2_END) * 3.5) : 1;
            for (var hi = 0; hi < hexes.length; hi++) {
                var hex = hexes[hi];
                var localT = Math.max(0, t - p2Start - hex.userData.phase2Delay);
                var appear = Math.min(1, localT * 2.5);
                hex.material.opacity = appear * 0.75 * fadeOut;
                var pullT = Math.max(0, (t - T_P1_END) / (T_P2_END - T_P1_END));
                hex.position.z = easeInCubic(pullT) * 5;
            }
            gridGroup.visible = true;
        } else {
            gridGroup.visible = false;
        }

        // Phase 3: Streak tunnel
        if (t >= T_P2_END * 0.75) {
            streaks.visible = true;
            var p3T = Math.max(0, t - T_P2_END * 0.75);
            var u = Math.min(1, Math.max(0, (t - T_P2_END) / (T_P3_END - T_P2_END)));
            var speed = 4 + easeInCubic(u) * 140;
            var stretch = 0.5 + speed * 0.09;

            for (var i = 0; i < COUNT; i++) {
                var s = S[i];
                s.z += speed * dt;
                if (s.z > 1) {
                    var a2 = Math.random() * Math.PI * 2;
                    var r2 = 0.3 + Math.pow(Math.random(), 0.6) * 5.0;
                    s.x = Math.cos(a2) * r2; s.y = Math.sin(a2) * r2; s.z = -55 - Math.random() * 8;
                }
                dummy.position.set(s.x, s.y, s.z);
                dummy.scale.set(1, 1, stretch);
                dummy.updateMatrix();
                streaks.setMatrixAt(i, dummy.matrix);
            }
            streaks.instanceMatrix.needsUpdate = true;
            glow.material.opacity = Math.min(0.95, p3T * 0.35 + easeInCubic(u) * 0.75);
            camera.fov = 75 + u * 32;
            camera.updateProjectionMatrix();
        } else {
            streaks.visible = false;
        }

        if (!flashed && t >= T_FLASH) { flash(); return; }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
    }

    function flash() {
        if (flashed) return;
        flashed = true;

        var linkText = document.createElement("div");
        linkText.style.cssText = "position:fixed;inset:0;z-index:10002;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;font-family:'Inter',sans-serif;color:#fff;opacity:0;transition:opacity 0.2s ease;";
        linkText.innerHTML = '<div style="font-size:clamp(0.55rem,1.4vw,0.85rem);letter-spacing:0.4em;text-transform:uppercase;color:#00cfff;margin-bottom:0.6rem;font-weight:300;text-shadow:0 0 20px #00aaff;">Fluctlight Synchronization</div><div style="font-size:clamp(1.4rem,4vw,2.4rem);font-weight:800;letter-spacing:0.14em;text-transform:uppercase;text-shadow:0 0 40px #00cfff,0 0 80px rgba(0,180,255,0.5);">Link Start</div><div style="width:120px;height:1px;background:linear-gradient(90deg,transparent,#00cfff,transparent);margin-top:0.8rem;"></div>';
        document.body.appendChild(linkText);

        var f = document.createElement("div");
        f.style.cssText = "position:fixed;inset:0;z-index:10001;pointer-events:none;background:rgba(0,200,255,0.15);opacity:0;transition:opacity 0.15s ease-out;";
        document.body.appendChild(f);

        requestAnimationFrame(function() { f.style.opacity = "1"; linkText.style.opacity = "1"; });

        setTimeout(function() {
            f.style.transition = "background 0.08s ease, opacity 0.08s ease";
            f.style.background = "#fff";
            setTimeout(function() {
                linkText.style.transition = "opacity 0.3s ease";
                linkText.style.opacity = "0";
                teardown();
                var t0 = performance.now(), DUR = 900;
                (function open(now) {
                    var p = Math.min(1, (now - t0) / DUR);
                    var hole = p * 160;
                    var fade = 1 - p * p;
                    f.style.background = "radial-gradient(circle at 50% 50%, rgba(0,200,255,0) " + (hole * 0.70) + "%, rgba(255,255,255," + fade + ") " + Math.min(160, hole * 0.70 + 24) + "%)";
                    if (p < 1) requestAnimationFrame(open);
                    else { f.remove(); linkText.remove(); }
                })(t0);
                autoCollapseHero();
            }, 140);
        }, 120);
    }

    function teardown() {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        overlay.remove();
        if (lineCanvas.parentNode) lineCanvas.remove();
        document.body.style.overflow = "";
        streakGeo.dispose(); streakMat.dispose();
        glow.material.map.dispose(); glow.material.dispose();
        for (var hi = 0; hi < hexes.length; hi++) { hexes[hi].geometry.dispose(); hexes[hi].material.dispose(); }
        renderer.dispose();
    }

    function finish(skipped) {
        if (done || flashed) return;
        flashed = true;
        overlay.classList.add("intro-hidden");
        lineCanvas.style.opacity = "0";
        setTimeout(function() { teardown(); autoCollapseHero(); }, 950);
    }

    function autoCollapseHero() {
        var maxScroll = window.innerHeight * 1.5;
        window.scrollTo({ top: maxScroll * 0.97, behavior: "smooth" });
    }
})();
