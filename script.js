/* Prism One showcase. Vanilla JS + Three + GSAP + Lenis with graceful fallbacks. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";
  var hasThree = typeof window.THREE !== "undefined";

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (hasLenis && !reduceMotion) {
    try {
      lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
      var rafL = function (t) { lenis.raf(t); requestAnimationFrame(rafL); };
      requestAnimationFrame(rafL);
      if (hasST) { lenis.on("scroll", window.ScrollTrigger.update); }
    } catch (e) { lenis = null; }
  }
  function goTo(target) {
    var el = document.querySelector(target);
    if (!el) return;
    if (lenis) { try { lenis.scrollTo(el, { offset: -64 }); return; } catch (e) {} }
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ---------- nav / progress ---------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (!mobileMenu || !burger) return;
    mobileMenu.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }
  document.querySelectorAll("[data-scroll]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var href = a.getAttribute("href");
      if (href && href.charAt(0) === "#") {
        ev.preventDefault();
        closeMenu();
        goTo(href);
      }
    });
  });
  var fill = document.getElementById("progressFill");
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (fill) fill.style.width = p + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveals ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (hasGsap && hasST && !reduceMotion) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    revealEls.forEach(function (el) {
      window.gsap.fromTo(el, { y: 34, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- finishes ---------- */
  var FINISHES = { Indigo: "#4F46E5", Slate: "#1F2937", Clay: "#E07856" };
  var currentFinish = "Indigo";
  var mesh = null, ring = null, renderer = null, scene = null, camera = null;
  var targetRX = 0.4, targetRY = 0.6, scrubSpin = 0;
  var mouseRX = 0, mouseRY = 0;
  var canvas = document.getElementById("stageCanvas");
  var frame = document.getElementById("stageFrame");
  var hero = document.getElementById("stage");
  var fallback = document.getElementById("stageFallback");
  var status = document.getElementById("stageStatus");
  var scrubFill = document.getElementById("scrubFill");
  var finishNote = document.getElementById("finishNote");
  var shapes = Array.prototype.slice.call(document.querySelectorAll(".floatShape"));

  function paintFinish(name) {
    if (!FINISHES[name]) return;
    currentFinish = name;
    if (finishNote) finishNote.textContent = "Now viewing " + name;
    var sel = document.getElementById("fFinish");
    if (sel) sel.value = name;
    document.querySelectorAll(".swatch").forEach(function (s) {
      s.classList.toggle("isActive", s.dataset.name === name);
    });
    if (!mesh || !window.THREE) return;
    var c = new window.THREE.Color(FINISHES[name]);
    if (hasGsap && !reduceMotion) {
      window.gsap.to(mesh.material.color, { r: c.r, g: c.g, b: c.b, duration: 0.7, ease: "power2.out" });
    } else {
      mesh.material.color.set(FINISHES[name]);
    }
  }
  document.querySelectorAll(".swatch").forEach(function (btn) {
    btn.addEventListener("click", function () { paintFinish(btn.dataset.name); });
  });
  document.querySelectorAll(".tierBtn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      goTo("#order");
      var note = document.getElementById("fNote");
      if (note) note.value = "Interested in the " + btn.dataset.tier + " bundle.";
    });
  });

  /* ---------- mouse + scroll parallax (shapes + stage) ---------- */
  var parX = 0, parY = 0, scrollPar = 0;
  function renderParallax() {
    var i, s, sp;
    for (i = 0; i < shapes.length; i++) {
      s = shapes[i];
      sp = parseFloat(s.dataset.speed || "30", 10);
      s.style.translate = (parX * sp) + "px " + ((parY * sp) + scrollPar * sp * 0.4) + "px";
    }
    if (frame && !reduceMotion) {
      frame.style.translate = (parX * 10) + "px " + (parY * 10) + "px";
    }
  }
  if (hero && !reduceMotion) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / Math.max(r.width, 1)) * 2 - 1;
      var ny = ((e.clientY - r.top) / Math.max(r.height, 1)) * 2 - 1;
      parX = nx; parY = ny;
      mouseRY = nx * 0.45;
      mouseRX = ny * 0.3;
      renderParallax();
    });
    hero.addEventListener("mouseleave", function () {
      parX = 0; parY = 0; mouseRX = 0; mouseRY = 0;
      renderParallax();
    });
    window.addEventListener("scroll", function () {
      var r = hero.getBoundingClientRect();
      scrollPar = Math.max(-1, Math.min(1, -r.top / Math.max(window.innerHeight, 1)));
      renderParallax();
    }, { passive: true });
    renderParallax();
  }

  /* ---------- THREE stage ---------- */
  function stageSize() {
    var w = frame ? (frame.clientWidth - 28) : 320;
    if (w < 200) w = 200;
    var h = window.innerWidth < 480 ? 340 : (window.innerWidth < 980 ? 420 : 520);
    return { w: w, h: h };
  }

  function showFallback(msg) {
    if (canvas) canvas.style.display = "none";
    if (fallback) fallback.hidden = false;
    if (status && msg) status.textContent = msg;
  }

  function baseScene(detail) {
    scene = new window.THREE.Scene();
    scene.background = new window.THREE.Color("#1B1E26");
    camera = new window.THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.6, 6.2);
    renderer = new window.THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 2));
    var geo = new window.THREE.IcosahedronGeometry(1.55, detail);
    var mat = new window.THREE.MeshStandardMaterial({ color: FINISHES.Indigo, roughness: 0.42, metalness: 0.25, flatShading: true });
    mesh = new window.THREE.Mesh(geo, mat);
    scene.add(mesh);
    var ringGeo = new window.THREE.TorusGeometry(2.35, 0.07, 16, 90);
    var ringMat = new window.THREE.MeshStandardMaterial({ color: "#F6F5F0", roughness: 0.5, metalness: 0.4 });
    ring = new window.THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.15;
    scene.add(ring);
    var floorGeo = new window.THREE.CircleGeometry(2.9, 48);
    var floorMat = new window.THREE.MeshStandardMaterial({ color: "#111318", roughness: 0.9 });
    var floor = new window.THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.15;
    scene.add(floor);
    scene.add(new window.THREE.AmbientLight("#ffffff", 0.85));
    var key = new window.THREE.DirectionalLight("#ffffff", 1.6);
    key.position.set(4, 6, 5);
    scene.add(key);
    var rim = new window.THREE.PointLight("#4F46E5", 30, 30);
    rim.position.set(-4, 2, 3);
    scene.add(rim);
  }

  function fitStage() {
    if (!renderer || !camera) return;
    var s = stageSize();
    renderer.setSize(s.w, s.h, false);
    camera.aspect = s.w / s.h;
    camera.updateProjectionMatrix();
  }

  function bindScrub() {
    if (!(hasGsap && hasST) || reduceMotion) return;
    try {
      window.ScrollTrigger.create({
        trigger: "#highlights", start: "top bottom", end: "bottom top", scrub: 1,
        onUpdate: function (self) {
          scrubSpin = self.progress * Math.PI * 2;
          if (scrubFill) scrubFill.style.width = Math.round(self.progress * 100) + "%";
        }
      });
    } catch (e) {}
  }

  function initStage() {
    try {
      var detail = window.innerWidth < 768 ? 0 : 1;
      baseScene(detail);
      fitStage();
      var dragging = false, px = 0, py = 0;
      canvas.addEventListener("pointerdown", function (e) {
        dragging = true; px = e.clientX; py = e.clientY;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      });
      canvas.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        targetRY += (e.clientX - px) * 0.008;
        targetRX += (e.clientY - py) * 0.005;
        px = e.clientX; py = e.clientY;
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
        canvas.addEventListener(ev, function () { dragging = false; });
      });
      window.addEventListener("resize", fitStage);
      var clock = new window.THREE.Clock();
      (function tick() {
        var t = clock.getElapsedTime();
        if (!dragging) { targetRY += 0.004; }
        mesh.rotation.y += ((targetRY + mouseRY + scrubSpin) - mesh.rotation.y) * 0.08;
        mesh.rotation.x += ((targetRX + mouseRX) - mesh.rotation.x) * 0.08;
        mesh.position.y = Math.sin(t * 1.1) * 0.12;
        ring.rotation.z = t * 0.25 + scrubSpin * 0.5;
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
      })();
      bindScrub();
    } catch (e) {
      showFallback("Static preview");
    }
  }

  function initStageStatic() {
    try {
      baseScene(1);
      fitStage();
      mesh.rotation.set(0.4, 0.6, 0);
      renderer.render(scene, camera);
      if (status) status.textContent = "Static 3D (reduced motion on)";
      window.addEventListener("resize", function () { fitStage(); renderer.render(scene, camera); });
    } catch (e) {
      showFallback("Static preview");
    }
  }

  if (!hasThree || !canvas) {
    showFallback("Static preview");
  } else if (reduceMotion) {
    initStageStatic();
  } else {
    initStage();
  }
  /* Re apply chosen finish after scene init (covers static path) */
  if (mesh && FINISHES[currentFinish]) { mesh.material.color.set(FINISHES[currentFinish]); }

  /* ---------- counters ---------- */
  var counters = document.querySelectorAll(".count");
  function runCounter(el) {
    var target = parseInt(el.dataset.target, 10) || 0;
    if (reduceMotion || !hasGsap) { el.textContent = String(target); return; }
    if (hasST) {
      var obj = { v: 0 };
      window.gsap.to(obj, {
        v: target, duration: 1.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: function () { el.textContent = String(Math.round(obj.v)); },
        onComplete: function () { el.textContent = String(target); }
      });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { el.textContent = String(target); io.disconnect(); }
        });
      });
      io.observe(el);
    }
  }
  counters.forEach(runCounter);

  /* ---------- testimonials ---------- */
  var QUOTES = [
    { t: "It looks like sculpture and sounds like a much bigger speaker. Guests always ask about it.", n: "Mara, Architect in Oslo" },
    { t: "Setup took two minutes. The light modes make late work sessions feel calm and focused.", n: "Dev, Producer in Bergen" },
    { t: "Bought one, came back for the stereo pair. The app control is simple and reliable.", n: "Jonas, Teacher in Trondheim" }
  ];
  var qi = 0, qTimer = null;
  var qText = document.getElementById("quoteText");
  var qName = document.getElementById("quoteName");
  var qdots = document.querySelectorAll(".qdot");
  function showQ(i) {
    qi = (i + QUOTES.length) % QUOTES.length;
    if (qText) {
      if (hasGsap && !reduceMotion) {
        window.gsap.fromTo(qText, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45 });
      }
      qText.textContent = QUOTES[qi].t;
    }
    if (qName) qName.textContent = QUOTES[qi].n;
    qdots.forEach(function (d, k) { d.classList.toggle("isOn", k === qi); });
  }
  qdots.forEach(function (d) {
    d.addEventListener("click", function () { showQ(parseInt(d.dataset.q, 10) || 0); restartQ(); });
  });
  function restartQ() {
    if (qTimer) clearInterval(qTimer);
    if (!reduceMotion) { qTimer = setInterval(function () { showQ(qi + 1); }, 6000); }
  }
  restartQ();

  /* ---------- form ---------- */
  var form = document.getElementById("orderForm");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = document.getElementById("fName").value.trim();
      var email = document.getElementById("fEmail").value.trim();
      var qty = parseInt(document.getElementById("fQty").value, 10);
      var ok = true;
      var eName = document.getElementById("eName");
      var eEmail = document.getElementById("eEmail");
      var eQty = document.getElementById("eQty");
      eName.textContent = ""; eEmail.textContent = ""; eQty.textContent = "";
      if (name.length < 2) { eName.textContent = "Please add your name."; ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { eEmail.textContent = "Please add a valid email."; ok = false; }
      if (!(qty >= 1 && qty <= 10)) { eQty.textContent = "Quantity must be between 1 and 10."; ok = false; }
      if (!ok) return;
      var done = document.getElementById("formOk");
      done.hidden = false;
      if (hasGsap && !reduceMotion) {
        window.gsap.fromTo(done, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 });
      }
      form.querySelector("button[type=submit]").textContent = "Order placed";
    });
  }
})();
