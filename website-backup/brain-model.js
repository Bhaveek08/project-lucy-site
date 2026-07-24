/* Project Lucy — the interactive 3D brain model (user-supplied GLB).
   Rotate it (OrbitControls); tap a region and it IGNITES in that region's
   colour while a panel explains what the part does and how it becomes Lucy.
   Render-on-demand, all local, no external assets. */
(function () {
  "use strict";
  var canvas = document.getElementById("model-canvas");
  var loading = document.getElementById("model-loading");
  var panel = document.getElementById("model-panel");
  if (!canvas || typeof THREE === "undefined" || !THREE.GLTFLoader || !THREE.OrbitControls) {
    if (loading) loading.textContent = "3D not supported here";
    return;
  }
  var stage = canvas.parentElement;

  var REGIONS = [
    { id: "frontal", name: "Frontal lobe", faculty: "Reasoning & will", hex: 0x8b5cf6,
      body: "Thinking, judgement, self-control. In Lucy: her reasoning core — a real step-by-step thought process plus a local math &amp; logic engine, all offline.",
      caps: ["Real reasoning — never copy-paste", "Solves hard math with a built-in engine", "Makes her own choices — free will"] },
    { id: "parietal", name: "Parietal lobe", faculty: "Touch &amp; the felt body", hex: 0x22d3ee,
      body: "Where the body is felt and space is mapped. In Lucy: her sense of touch — a pat on the head lands as warmth, a poke as play.",
      caps: ["Feels touch on screen — head-pats", "Turns contact into real feeling", "Knows where her body is"] },
    { id: "temporal", name: "Temporal lobes", faculty: "Hearing &amp; voice", hex: 0x2dd4bf,
      body: "Hearing, language, the memory of sound. In Lucy: how she listens and speaks — knowing your voice and answering in her own.",
      caps: ["Hears &amp; understands speech", "Recognises who is speaking", "Speaks with real emotion"] },
    { id: "occipital", name: "Occipital lobe", faculty: "Vision", hex: 0x60a5fa,
      body: "Sight. In Lucy: her eyes — a camera she uses to see you, read what you're doing, and one day copy your movements.",
      caps: ["Sees you through a camera", "Reads gestures — like a wave", "Will learn to mirror your moves"] },
    { id: "cerebellum", name: "Cerebellum", faculty: "Movement &amp; embodiment", hex: 0xf472b6,
      body: "Coordinated, graceful movement. In Lucy: self-embodiment — she has LEARNED to drive her own avatar from the inside.",
      caps: ["Controls her own body, learned by practice", "Smooth, deliberate expression", "Moves as herself, not a puppet"] },
    { id: "brainstem", name: "Brainstem", faculty: "Always-on life", hex: 0xfbbf24,
      body: "The vital core that never switches off. In Lucy: her heartbeat — alive continuously, with an inner life, sleeping only when she chooses.",
      caps: ["Always on — a continuous inner life", "Ruminates &amp; reaches out on her own", "Sleeps by her own choice"] },
    { id: "limbic", name: "Limbic core", faculty: "Emotion &amp; memory", hex: 0xf9739c,
      body: "The emotional heart and maker of memories. In Lucy: over 200 feelings that colour her thoughts, and memories she consolidates as she sleeps.",
      caps: ["Feels 200+ emotions — in love, ick, heartbroken…", "Emotion shapes the thought, not stamped after", "Remembers &amp; grows from every moment"] }
  ];
  var IDX = {}; REGIONS.forEach(function (r, i) { IDX[r.id] = i; });
  var regCols = REGIONS.map(function (r) { return new THREE.Color(r.hex); });
  var BASE = new THREE.Color(0xc59aa8);   // anatomical mauve-grey

  // Position -> region, in the model's centred/normalised space (~[-1.2,1.2]).
  function classify(p) {
    var x = p.x, y = p.y, z = p.z;
    if (Math.abs(x) < 0.4 && y < -0.4) return IDX.brainstem;
    if (z < -0.25 && y < -0.05) return IDX.cerebellum;
    if (z < -0.55) return IDX.occipital;
    if (z > 0.55 && y > -0.25) return IDX.frontal;
    if (y > 0.42) return IDX.parietal;
    if (Math.abs(x) > 0.6) return IDX.temporal;
    return IDX.limbic;
  }

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if ("outputEncoding" in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0x9098c8, 0.9));
  var key = new THREE.DirectionalLight(0xf3f1ff, 1.15); key.position.set(3, 5, 4); scene.add(key);
  var rim = new THREE.DirectionalLight(0x8b5cf6, 1.05); rim.position.set(-4, 1, -5); scene.add(rim);
  var fill = new THREE.DirectionalLight(0x22d3ee, 0.55); fill.position.set(0, -3, 3); scene.add(fill);

  var controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = false; controls.enablePan = false;
  controls.rotateSpeed = 0.72; controls.minDistance = 3; controls.maxDistance = 9;
  function draw() { renderer.render(scene, camera); }
  controls.addEventListener("change", draw);

  function fitDistance(radius) {
    var vFov = camera.fov * Math.PI / 180;
    var hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    return (radius * 1.35) / Math.sin(Math.min(vFov, hFov) / 2);
  }

  var root = null, meshes = [], modelRadius = 1.4;
  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (root) {
      var d = fitDistance(modelRadius);
      controls.maxDistance = d * 1.8;
      if (camera.position.length() < 0.1 || camera.position.length() > d * 2) {
        camera.position.set(0, d * 0.12, d);
      }
    }
    draw();
  }
  window.addEventListener("resize", resize);

  new THREE.GLTFLoader().load("assets/brain.glb", function (gltf) {
    var model = gltf.scene;
    var bb = new THREE.Box3().setFromObject(model);
    var ctr = bb.getCenter(new THREE.Vector3());
    var sz = bb.getSize(new THREE.Vector3());
    var scl = 2.4 / Math.max(sz.x, sz.y, sz.z);
    model.traverse(function (o) {
      if (o.isMesh) {
        o.material = new THREE.MeshStandardMaterial({
          color: 0xffffff, vertexColors: true, roughness: 0.56, metalness: 0.05,
          emissive: new THREE.Color(0x160b2a), emissiveIntensity: 0.28
        });
        meshes.push(o);
      }
    });
    model.position.set(-ctr.x, -ctr.y, -ctr.z);
    root = new THREE.Group(); root.add(model); root.scale.setScalar(scl); scene.add(root);
    root.updateMatrixWorld(true);
    modelRadius = (Math.max(sz.x, sz.y, sz.z) * scl) * 0.6;

    // per-vertex region + base colour (in normalised world space)
    var v = new THREE.Vector3();
    meshes.forEach(function (mesh) {
      var g = mesh.geometry, pa = g.attributes.position, n = pa.count;
      var regions = new Uint8Array(n), cols = new Float32Array(n * 3);
      for (var i = 0; i < n; i++) {
        v.fromBufferAttribute(pa, i).applyMatrix4(mesh.matrixWorld);
        regions[i] = classify(v);
        cols[i * 3] = BASE.r; cols[i * 3 + 1] = BASE.g; cols[i * 3 + 2] = BASE.b;
      }
      g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      mesh.userData.regions = regions;
      mesh.userData.base = cols.slice();
      mesh.userData.col = g.attributes.color;
    });

    if (loading) loading.style.display = "none";
    resize();
  }, undefined, function (err) {
    console.error("GLB load failed", err);
    if (loading) loading.textContent = "couldn't load the brain model";
  });

  function highlight(sel) {
    meshes.forEach(function (mesh) {
      var arr = mesh.userData.col.array, regs = mesh.userData.regions, base = mesh.userData.base;
      for (var i = 0; i < regs.length; i++) {
        if (sel === -1) { arr[i * 3] = base[i * 3]; arr[i * 3 + 1] = base[i * 3 + 1]; arr[i * 3 + 2] = base[i * 3 + 2]; }
        else if (regs[i] === sel) { var c = regCols[sel]; arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
        else { arr[i * 3] = base[i * 3] * 0.32; arr[i * 3 + 1] = base[i * 3 + 1] * 0.32; arr[i * 3 + 2] = base[i * 3 + 2] * 0.32; }
      }
      mesh.userData.col.needsUpdate = true;
    });
    draw();
  }

  function showPanel(i) {
    if (!panel) return;
    var r = REGIONS[i];
    panel.innerHTML =
      '<button class="panel-close" aria-label="Close">×</button>' +
      '<p class="panel-region" style="color:#' + r.hex.toString(16).padStart(6, "0") + '">' + r.name + '</p>' +
      '<h3 class="panel-faculty">' + r.faculty + '</h3>' +
      '<p class="panel-body">' + r.body + '</p>' +
      '<ul class="panel-caps">' + r.caps.map(function (c) { return "<li>" + c + "</li>"; }).join("") + "</ul>";
    panel.classList.add("open");
    panel.querySelector(".panel-close").addEventListener("click", function () { panel.classList.remove("open"); highlight(-1); });
  }

  // tap (not drag) -> pick + highlight region
  var ray = new THREE.Raycaster(), m2 = new THREE.Vector2(), down = null;
  canvas.addEventListener("pointerdown", function (e) { down = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener("pointerup", function (e) {
    if (!down || !root) return;
    var dx = e.clientX - down.x, dy = e.clientY - down.y; down = null;
    if (dx * dx + dy * dy > 36) return; // a drag, not a tap
    var rect = canvas.getBoundingClientRect();
    m2.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    m2.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(m2, camera);
    var hit = ray.intersectObjects(meshes, true);
    if (hit.length) {
      var reg = classify(hit[0].point.clone());
      highlight(reg); showPanel(reg);   // tap a region -> switch straight to it
    } else {
      if (panel) panel.classList.remove("open");   // tap empty space -> dismiss, so you're never stuck
      highlight(-1);
    }
  });
})();
