// app.js — progressive enhancement only. The store is fully usable without it.
// 1) Staggered scroll-reveal   2) Count-up numbers   3) /compare bars   4) /match wizard
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 0. Theme toggle --------------------------------------------------------
  // The <head> script already set data-theme (saved choice > system preference).
  // This button flips it and remembers; the icon shows what you'll switch TO.
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    var setIcon = function () {
      var dark = document.documentElement.getAttribute("data-theme") !== "light";
      themeBtn.textContent = dark ? "☀️" : "🌙";
    };
    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      setIcon();
    });
    // follow the OS live if the user never made an explicit choice
    try {
      if (!localStorage.getItem("theme") && window.matchMedia) {
        matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
          document.documentElement.setAttribute("data-theme", e.matches ? "light" : "dark");
          setIcon();
        });
      }
    } catch (e) {}
    setIcon();
  }

  // ---- 1. Scroll reveal -----------------------------------------------------
  if (!reduceMotion && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll(".card, .page-head, .hero, .quote-summary");
    targets.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min((i % 5) * 70, 280) + "ms";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          countUpWithin(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // ---- 2. Count-up numbers ---------------------------------------------------
  // Animates the numeric part of stat values like "$25,500", "282 GB", "~1.5 homes".
  function countUpWithin(root) {
    if (reduceMotion) return;
    root.querySelectorAll(".stat-value, .reqnum strong").forEach(function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = "1";
      var text = el.textContent;
      var m = text.match(/^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/);
      if (!m) return;
      var prefix = m[1], target = parseFloat(m[2].replace(/,/g, "")), suffix = m[3];
      if (!isFinite(target) || target === 0) return;
      var decimals = (m[2].split(".")[1] || "").length;
      var start = null, dur = 750;
      function frame(ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        var val = target * eased;
        el.textContent = prefix + val.toLocaleString("en-US", {
          minimumFractionDigits: decimals, maximumFractionDigits: decimals
        }) + suffix;
        if (t < 1) requestAnimationFrame(frame);
        else el.textContent = text; // land exactly on the original formatting
      }
      requestAnimationFrame(frame);
    });
  }

  // ---- Circuitscape background --------------------------------------------------
  // AI chips etched into the background with circuit traces; light pulses travel
  // the traces like data packets. Trace routing is randomized per visit.
  if (!reduceMotion) {
    var scape = document.createElement("div");
    scape.className = "circuitscape";
    scape.setAttribute("aria-hidden", "true");
    var floor = document.createElement("div");
    floor.className = "floor";
    scape.appendChild(floor);

    var NS = "http://www.w3.org/2000/svg";
    var W = Math.max(window.innerWidth, 1200), H = Math.max(window.innerHeight, 700);
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");

    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var el = function (tag, attrs) {
      var n = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      return n;
    };

    var traceId = 0;
    // A right-angled circuit trace from (x,y) heading outward, with a blinking
    // terminal dot and (sometimes) a light pulse traveling along it.
    function trace(x, y, dirX, dirY) {
      var d = "M" + x + " " + y, cx = x, cy = y;
      var segs = 2 + Math.floor(rnd(0, 2));
      for (var s = 0; s < segs; s++) {
        if ((s % 2 === 0 && dirX !== 0) || dirY === 0) { cx += dirX * rnd(60, 190); }
        else { cy += dirY * rnd(40, 130); }
        d += " L" + Math.round(cx) + " " + Math.round(cy);
      }
      var id = "tr" + (++traceId);
      var p = el("path", { d: d, "class": "trace", id: id });
      svg.appendChild(p);
      var end = el("circle", { cx: Math.round(cx), cy: Math.round(cy), r: 3, "class": "trace-end" + (Math.random() < 0.1 ? " amber" : "") });
      end.style.animationDelay = rnd(0, 3).toFixed(2) + "s";
      svg.appendChild(end);
      if (Math.random() < 0.6) {
        var dot = el("circle", { r: 2.6, "class": "pulse" });
        var mo = el("animateMotion", { dur: rnd(3.5, 8).toFixed(1) + "s", repeatCount: "indefinite", begin: rnd(0, 4).toFixed(1) + "s" });
        var mp = el("mpath", {});
        mp.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + id);
        mo.appendChild(mp);
        dot.appendChild(mo);
        svg.appendChild(dot);
      }
    }

    // A chip: package body, glowing die, pins on all four sides, silicon label.
    function chip(cx, cy, size, label, opacity) {
      var g = el("g", { opacity: opacity });
      var half = size / 2, pinLen = 10, pins = 4;
      for (var i = 1; i <= pins; i++) {
        var off = -half + (size / (pins + 1)) * i;
        g.appendChild(el("line", { "class": "chip-pin", x1: cx + off, y1: cy - half - pinLen, x2: cx + off, y2: cy - half }));
        g.appendChild(el("line", { "class": "chip-pin", x1: cx + off, y1: cy + half, x2: cx + off, y2: cy + half + pinLen }));
        g.appendChild(el("line", { "class": "chip-pin", x1: cx - half - pinLen, y1: cy + off, x2: cx - half, y2: cy + off }));
        g.appendChild(el("line", { "class": "chip-pin", x1: cx + half, y1: cy + off, x2: cx + half + pinLen, y2: cy + off }));
      }
      g.appendChild(el("rect", { "class": "chip-body", x: cx - half, y: cy - half, width: size, height: size, rx: 10 }));
      var die = el("rect", { "class": "chip-die", x: cx - half * 0.55, y: cy - half * 0.55, width: size * 0.55, height: size * 0.55, rx: 6 });
      die.style.animationDelay = rnd(0, 4).toFixed(2) + "s";
      g.appendChild(die);
      var t = el("text", { "class": "chip-label", x: cx, y: cy + size * 0.045, "text-anchor": "middle", "font-size": Math.round(size * 0.13) });
      t.textContent = label;
      g.appendChild(t);
      svg.appendChild(g);
      // traces leave from two opposite sides of the chip
      for (var k = 0; k < 3; k++) {
        var oy = rnd(-half * 0.6, half * 0.6);
        trace(cx + half + pinLen, cy + oy, 1, Math.random() < 0.5 ? -1 : 1);
        trace(cx - half - pinLen, cy + oy, -1, Math.random() < 0.5 ? -1 : 1);
      }
    }

    // Chips live in the margins; labels nod to the store's real inventory.
    chip(W * 0.075, H * 0.22, 120, "GB300", 0.75);
    chip(W * 0.045, H * 0.62, 88, "H200", 0.55);
    chip(W * 0.93,  H * 0.18, 100, "235B", 0.7);
    chip(W * 0.955, H * 0.56, 76, "RTX", 0.5);
    chip(W * 0.88,  H * 0.85, 64, "671B", 0.4);

    scape.appendChild(svg);
    document.body.appendChild(scape);
  }

  // ---- Interface sounds (synthesized, whisper-quiet, mutable) ---------------------
  // No audio files: tiny WebAudio blips, only ever on user gestures. The 🔊 button
  // in the header mutes everything; the choice is remembered.
  var sound = (function () {
    var ctx = null;
    var enabled = true;
    try { enabled = localStorage.getItem("sound") !== "off"; } catch (e) {}
    function ac() {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; ctx = AC ? new AC() : null; }
      if (ctx && ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    function tone(freq, dur, type, gainV, slideTo) {
      if (!enabled) return;
      var c = ac(); if (!c) return;
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, c.currentTime);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
      g.gain.setValueAtTime(gainV || 0.02, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + dur);
    }
    return {
      isOn: function () { return enabled; },
      toggle: function () {
        enabled = !enabled;
        try { localStorage.setItem("sound", enabled ? "on" : "off"); } catch (e) {}
        if (enabled) tone(880, 0.09, "sine", 0.03);
        return enabled;
      },
      tick: function () { tone(1900, 0.045, "sine", 0.022); },
      pick: function () { tone(620, 0.07, "sine", 0.028, 880); },
      zap: function () {
        tone(120, 0.35, "sawtooth", 0.05, 1800);
        setTimeout(function () { tone(2400, 0.12, "square", 0.02, 300); }, 120);
      },
    };
  })();

  var soundBtn = document.getElementById("sound-toggle");
  if (soundBtn) {
    var setSndIcon = function () { soundBtn.textContent = sound.isOn() ? "🔊" : "🔇"; };
    soundBtn.addEventListener("click", function () { sound.toggle(); setSndIcon(); });
    setSndIcon();
  }
  // Soft ticks on the store's interactive controls (event delegation, gestures only)
  document.addEventListener("click", function (e) {
    if (e.target.closest("#sound-toggle")) return;
    if (e.target.closest(".chip")) sound.tick();
    else if (e.target.closest(".opt")) sound.pick();
    else if (e.target.closest(".theme-toggle")) sound.tick();
    else if (e.target.closest(".lad-dot")) sound.pick();
  });

  // ---- Cursor spotlight (desktop only) --------------------------------------------
  // A soft light that follows the mouse across the dark blueprint.
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var glow = document.createElement("div");
    glow.id = "cursor-glow";
    document.body.appendChild(glow);
    var gx = 0, gy = 0, pending = false;
    document.addEventListener("mousemove", function (e) {
      gx = e.clientX; gy = e.clientY;
      glow.classList.add("on");
      if (!pending) {
        pending = true;
        requestAnimationFrame(function () {
          glow.style.transform = "translate(" + (gx - 280) + "px," + (gy - 280) + "px)";
          pending = false;
        });
      }
    });
    document.addEventListener("mouseleave", function () { glow.classList.remove("on"); });
  }

  // ---- Live burn counters -------------------------------------------------------
  // Every build shows electricity used since the page opened. Watts, made visceral.
  var burns = document.querySelectorAll(".burn[data-watts]");
  if (burns.length) {
    var t0 = Date.now();
    setInterval(function () {
      var hours = (Date.now() - t0) / 3600000;
      burns.forEach(function (el) {
        var wh = parseFloat(el.dataset.watts) * hours;              // watt-hours so far
        var usd = (wh / 1000) * 0.17;                               // at ~$0.17/kWh
        el.querySelector(".burn-wh").textContent =
          wh >= 1000 ? (wh / 1000).toFixed(3) + " kWh" : wh.toFixed(2) + " Wh";
        el.querySelector(".burn-usd").textContent = "$" + usd.toFixed(6);
      });
    }, 1000);
  }

  // ---- Easter egg: type "gpu" anywhere → POWER SURGE ------------------------------
  (function () {
    var buf = "";
    document.addEventListener("keydown", function (e) {
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-3);
      if (buf === "gpu" && !document.body.classList.contains("surge")) {
        document.body.classList.add("surge");
        sound.zap();
        var toast = document.createElement("div");
        toast.className = "surge-toast";
        toast.textContent = "⚡ POWER SURGE — 135 kW just coursed through the store. (~112 homes flickered.)";
        document.body.appendChild(toast);
        setTimeout(function () {
          document.body.classList.remove("surge");
          toast.remove();
        }, 4200);
      }
    });
  })();

  var D = window.STORE_DATA || null;

  // ---- 3. Compare page --------------------------------------------------------
  var compareRoot = document.getElementById("compare-root");
  if (compareRoot && D && D.products) {
    var picker = compareRoot.querySelector(".compare-picker");
    var barsEl = compareRoot.querySelector(".compare-bars");
    var selected = {};
    // sensible default: the desktop card, the workstation card, one datacenter GPU
    ["rtx-5090", "rtx-pro-6000", "h200-141"].forEach(function (id) { selected[id] = true; });

    D.products.forEach(function (p) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (selected[p.id] ? " on" : "");
      chip.textContent = p.name.replace(/^NVIDIA /, "");
      chip.setAttribute("aria-pressed", selected[p.id] ? "true" : "false");
      chip.onclick = function () {
        selected[p.id] = !selected[p.id];
        chip.classList.toggle("on", selected[p.id]);
        chip.setAttribute("aria-pressed", selected[p.id] ? "true" : "false");
        renderBars();
      };
      picker.appendChild(chip);
    });

    var fmt = function (n, dec) {
      return Number(n).toLocaleString("en-US", { maximumFractionDigits: dec || 0 });
    };
    var group = function (title, note, rows, cls) {
      var max = Math.max.apply(null, rows.map(function (r) { return r.v; }).concat([1]));
      var html = '<div class="bar-group"><h4>' + title + '</h4><p class="bar-note">' + note + "</p>";
      rows.forEach(function (r) {
        html += '<div class="bar-row"><span class="bar-name">' + r.name + '</span>' +
          '<span class="bar-track"><i class="bar-fill ' + (cls || "") + '" data-w="' +
          Math.max((r.v / max) * 100, 1.5) + '"></i></span>' +
          '<span class="bar-val">' + r.label + "</span></div>";
      });
      return html + "</div>";
    };
    var renderBars = function () {
      var picks = D.products.filter(function (p) { return selected[p.id]; });
      if (picks.length === 0) {
        barsEl.innerHTML = '<p class="muted">Pick at least one product above to compare.</p>';
        return;
      }
      var name = function (p) { return p.name.replace(/^NVIDIA /, ""); };
      barsEl.innerHTML =
        group("GPU memory", "The number that decides which models fit. Bigger bar = bigger models.",
          picks.map(function (p) { return { name: name(p), v: p.gpuMemoryGB, label: fmt(p.gpuMemoryGB) + " GB" }; })) +
        group("Price", "What you pay once, up front. Read it next to power — cheap to buy can be expensive to run.",
          picks.map(function (p) { return { name: name(p), v: p.priceUSD, label: "$" + fmt(p.priceUSD) }; }), "green") +
        group("Power draw", "Your ongoing electric bill and cooling problem. An average home draws ~1,200 W.",
          picks.map(function (p) { return { name: name(p), v: p.watts, label: fmt(p.watts) + " W (~" + fmt(p.watts / 1200, 1) + " homes)" }; }), "amber") +
        group("Memory per $1,000", "The value lens: how many GB of GPU memory each $1,000 buys. Longer bar = better memory value.",
          picks.map(function (p) {
            var v = p.gpuMemoryGB / (p.priceUSD / 1000);
            return { name: name(p), v: v, label: fmt(v, 1) + " GB / $1k" };
          }));
      // animate widths on the next frame so the CSS transition runs
      requestAnimationFrame(function () {
        barsEl.querySelectorAll(".bar-fill").forEach(function (el) {
          el.style.width = el.dataset.w + "%";
        });
      });
    };
    renderBars();
  }

  // ---- 3.5 The Math Lab: parameters → hardware, live ---------------------------
  var labRoot = document.getElementById("mathlab-root");
  if (labRoot && D && D.lab) {
    var slider = document.getElementById("lab-params");
    var bEl = document.getElementById("lab-b");
    var mathEl = document.getElementById("lab-math");
    var resEl = document.getElementById("lab-result");
    var f = function (n) { return Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 }); };

    var renderLab = function () {
      var p = parseInt(slider.value, 10);
      var base = p; // 1 GB per billion
      var need = Math.round(p * 1.2);
      bEl.textContent = f(p);
      mathEl.textContent = f(p) + "B × 1 GB = " + f(base) + " GB  +  20% (" + f(need - base) + " GB)  =  " + f(need) + " GB required";

      // Same honest selection the store uses: smallest card that can cover the
      // need; datacenter GPUs once workstation cards would get silly.
      var unit = need <= D.lab.small.gpuMemoryGB ? D.lab.small
               : need <= 384 ? D.lab.mid
               : D.lab.big;
      var qty = Math.ceil(need / unit.gpuMemoryGB);
      var totGB = qty * unit.gpuMemoryGB;
      var totPrice = qty * unit.priceUSD;
      var totW = qty * unit.watts;
      var homes = Math.round((totW / 1200) * 10) / 10;
      var monthly = Math.round((totW / 1000) * 24 * 30 * 0.17);

      resEl.innerHTML =
        '<div class="lab-build"><span class="qty">' + qty + " ×</span> " + unit.name + "</div>" +
        '<div class="lab-grid">' +
        '<div class="lab-cell"><span>' + f(totGB) + " GB</span><small>GPU memory in build (needs " + f(need) + ")</small></div>" +
        '<div class="lab-cell"><span>$' + f(totPrice) + "</span><small>total price</small></div>" +
        '<div class="lab-cell"><span>' + f(totW) + " W</span><small>≈ " + homes + " homes</small></div>" +
        '<div class="lab-cell"><span>$' + f(monthly) + "/mo</span><small>electricity, 24/7</small></div>" +
        "</div>" +
        (qty > 1
          ? '<p class="muted lab-note">' + qty + " GPUs linked as a cluster — their memory pools together.</p>"
          : '<p class="muted lab-note">Fits on a single card — no cluster needed.</p>');
    };
    slider.addEventListener("input", renderLab);
    renderLab();
  }

  // ---- 3.7 Hardware page interactions -------------------------------------------
  // (a) "Would it run…?" — tap a model chip on any product card and see how many
  //     of THAT unit it takes, honestly. (b) The price-ladder dots jump-scroll
  //     to their product card. (c) Hovering a card lights up its dot.
  var runchecks = document.querySelectorAll(".runcheck");
  if (runchecks.length && D && D.products && D.modelsMini) {
    var fm = function (n) { return Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 }); };
    runchecks.forEach(function (rc) {
      var product = D.products.filter(function (p) { return p.id === rc.dataset.product; })[0];
      if (!product) return;
      var chipsEl = rc.querySelector(".runcheck-chips");
      var out = rc.querySelector(".runcheck-out");
      D.modelsMini.forEach(function (m) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.textContent = m.name;
        chip.onclick = function () {
          chipsEl.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("on"); });
          chip.classList.add("on");
          var need = Math.round(m.params * 1.2);
          var qty = Math.ceil(need / product.gpuMemoryGB);
          var html;
          if (qty === 1) {
            html = "✅ <strong>Yes — one unit runs it.</strong> " + m.name + " needs " + fm(need) +
              " GB; this unit pools " + fm(product.gpuMemoryGB) + " GB.";
          } else if (qty > 32) {
            html = "🚫 <strong>Not with this.</strong> You'd need " + fm(qty) +
              " of them for " + fm(need) + " GB — nobody sane builds that. Step up an aisle.";
          } else {
            html = "🔗 <strong>" + qty + " × this unit</strong> → " + fm(qty * product.gpuMemoryGB) +
              " GB pooled (needs " + fm(need) + " GB), " + fm(qty * product.watts) + " W, <strong>$" +
              fm(qty * product.priceUSD) + "</strong>.";
            if (product.tier === "Desktop card") {
              html += " ⚠️ <em>But honestly: " + qty + " desktop cards have the memory on paper and can't team up fast enough to run one big model — the \"pile of desktop cards\" trap.</em>";
            }
          }
          out.classList.remove("muted");
          out.innerHTML = html;
          out.classList.remove("pop"); void out.offsetWidth; out.classList.add("pop");
        };
        chipsEl.appendChild(chip);
      });
    });
    // (b) ladder dots scroll to their card and flash it
    document.querySelectorAll(".lad-dot[data-target]").forEach(function (dot) {
      var go = function () {
        var el = document.getElementById(dot.dataset.target);
        if (!el) return;
        el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
      };
      dot.addEventListener("click", go);
      dot.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    // (c) hovering a card lights its dot on the shelf
    document.querySelectorAll(".product[id]").forEach(function (cardEl) {
      var dot = document.querySelector('.lad-dot[data-target="' + cardEl.id + '"]');
      if (!dot) return;
      cardEl.addEventListener("mouseenter", function () { dot.classList.add("lit"); });
      cardEl.addEventListener("mouseleave", function () { dot.classList.remove("lit"); });
    });
  }

  // ---- 3.8 The 3D showroom turntable ----------------------------------------------
  // Products orbit on a CSS-3D carousel: auto-spins, drag to rotate, click to
  // jump to the product's card. Slows on hover so items are easy to catch.
  var showcase = document.getElementById("showcase3d");
  if (showcase) {
    var car = showcase.querySelector(".carousel");
    var items = car.querySelectorAll(".car-item");
    var n = items.length;
    var radius = window.innerWidth < 640 ? 210 : 330;
    items.forEach(function (it, i) {
      it.style.transform = "rotateY(" + (360 / n) * i + "deg) translateZ(" + radius + "px)";
    });
    var angle = 0, baseVel = reduceMotion ? 0 : 0.12, vel = baseVel;
    var dragging = false, lastX = 0, moved = 0;
    (function spin() {
      if (!dragging) angle += vel;
      car.style.transform = "translateZ(-" + radius + "px) rotateY(" + angle + "deg)";
      requestAnimationFrame(spin);
    })();
    showcase.addEventListener("mouseenter", function () { vel = baseVel * 0.25; });
    showcase.addEventListener("mouseleave", function () { vel = baseVel; });
    // NOTE: no setPointerCapture here — capturing redirects the click event to
    // the showcase, so the .car-item click handlers would never fire. Window
    // listeners keep the drag alive when the cursor leaves the showcase.
    showcase.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; moved = 0;
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX; lastX = e.clientX;
      moved += Math.abs(dx);
      angle += dx * 0.35;
    });
    window.addEventListener("pointerup", function () { dragging = false; });
    window.addEventListener("pointercancel", function () { dragging = false; });
    items.forEach(function (it) {
      it.addEventListener("click", function () {
        if (moved > 6) return; // that was a drag, not a click
        var el = document.getElementById(it.dataset.target);
        if (!el) return;
        sound.pick();
        el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
      });
    });
  }

  // ---- 3.9 Card tilt parallax (desktop) --------------------------------------------
  // Product cards lean toward the cursor — subtle 3D depth on hover.
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".product[id]").forEach(function (cardEl) {
      cardEl.addEventListener("mousemove", function (e) {
        var r = cardEl.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -3.5;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 3.5;
        cardEl.style.transform = "perspective(900px) translateY(-3px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      });
      cardEl.addEventListener("mouseleave", function () { cardEl.style.transform = ""; });
    });
  }

  // ---- 4. Find-my-match wizard -------------------------------------------------
  var matchRoot = document.getElementById("match-root");
  if (matchRoot && D && D.matches) {
    var answers = {};
    var steps = matchRoot.querySelectorAll(".wstep");
    var bar = matchRoot.querySelector(".progress i");
    var current = 0;
    var fmt2 = function (n) { return Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 }); };

    var show = function (i) {
      current = i;
      steps.forEach(function (s, j) { s.classList.toggle("on", j === i); });
      bar.style.width = (i / (steps.length - 1)) * 100 + "%";
      if (i === steps.length - 1) renderResult();
    };

    matchRoot.querySelectorAll(".opt").forEach(function (btn) {
      btn.onclick = function () {
        answers[btn.dataset.q] = btn.dataset.v;
        show(current + 1);
      };
    });
    matchRoot.querySelectorAll(".back").forEach(function (btn) {
      btn.onclick = function () { show(Math.max(current - 1, 0)); };
    });

    var renderResult = function () {
      // Honest matching: ambition (use case + growth) points at a model size;
      // budget caps what we actually recommend — and we SAY so when it does.
      var pts = ({ small: 1, product: 2, scale: 3 })[answers.usecase] +
                ({ experiment: 0, steady: 1, fast: 2 })[answers.growth];
      var ambition = pts <= 2 ? "qwen" : pts <= 4 ? "deepseek" : "kimi";
      var cap = ({ starter: "qwen", serious: "deepseek", enterprise: "kimi" })[answers.budget];
      var order = ["qwen", "deepseek", "kimi"];
      var pick = order[Math.min(order.indexOf(ambition), order.indexOf(cap))];
      var m = D.matches[pick];
      var capped = order.indexOf(ambition) > order.indexOf(cap);
      var ambitionModel = D.matches[ambition];

      var row = function (label, value) {
        return '<div class="stat"><div class="stat-head"><span class="stat-label">' + label +
          '</span><span class="stat-value">' + value + "</span></div></div>";
      };

      matchRoot.querySelector(".match-result").innerHTML =
        '<p class="muted">Our honest pick for you:</p>' +
        '<p class="big">' + m.modelName + " (" + fmt2(m.params) + "B parameters)</p>" +
        "<p>" + m.summary + "</p>" +
        (capped
          ? '<div class="match-note">⚖️ <strong>Honesty note:</strong> your ambitions point at <strong>' +
            ambitionModel.modelName + "</strong> ($" + fmt2(ambitionModel.priceUSD) +
            "), but within your budget, <strong>" + m.modelName +
            "</strong> is the build we can honestly recommend. You can grow into the bigger one later — clusters expand.</div>"
          : "") +
        '<div class="stats">' +
        row("Minimum honest build", m.qty + " × " + m.productName) +
        row("GPU memory: need vs. build", fmt2(m.needGB) + " GB needed → " + fmt2(m.buildGB) + " GB in build") +
        row("Total price", "$" + fmt2(m.priceUSD)) +
        row("Power", fmt2(m.watts) + " W (≈ " + m.homes + " homes)") +
        "</div>" +
        '<div class="cta-row"><a class="btn primary" href="' + m.quoteUrl + '">Request this build →</a>' +
        '<a class="btn ghost" href="/models">See the full math</a></div>';
    };

    show(0);
  }
})();
