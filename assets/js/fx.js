/* ============================================================
   fx.js — 全屏粒子引擎
   彩纸 / 烟花 / 孢子 / 光标火花，全部在一张 fixed canvas 上
   ============================================================ */
(function () {
  "use strict";

  const canvas = document.getElementById("fxCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PALETTE = ["#f04b3f", "#ff8a7a", "#ffc46b", "#fff3e8", "#bde6cd", "#ffa0aa", "#8e6cff", "#ffd9a8"];

  let W = 0, H = 0, DPR = 1;
  const parts = [];
  let raf = null, last = 0, running = false;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const TAU = Math.PI * 2;

  function push(p) {
    if (parts.length > 1400) return;
    parts.push(p);
  }

  /* ---------------- emitters ---------------- */
  function confettiBurst(x, y, count = 70, opts = {}) {
    const n = reduce ? Math.ceil(count * 0.35) : count;
    for (let i = 0; i < n; i++) {
      const angle = opts.angle !== undefined ? opts.angle + rand(-0.55, 0.55) : rand(0, TAU);
      const speed = rand(280, 920) * (opts.power || 1);
      push({
        kind: "confetti",
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(0, 260),
        g: rand(900, 1250),
        drag: 0.9,
        rot: rand(0, TAU),
        vr: rand(-9, 9),
        w: rand(6, 12),
        h: rand(8, 18),
        color: pick(PALETTE),
        shape: Math.random() < 0.16 ? "mushroom" : Math.random() < 0.3 ? "circle" : "rect",
        life: 0,
        ttl: rand(2.6, 4.6),
        sway: rand(20, 60),
        phase: rand(0, TAU)
      });
    }
  }

  function confettiRain(count = 90, opts = {}) {
    const n = reduce ? Math.ceil(count * 0.4) : count;
    for (let i = 0; i < n; i++) {
      push({
        kind: "confetti",
        x: rand(0, W),
        y: rand(-H * 0.4, -20) + (opts.offsetY || 0),
        vx: rand(-70, 70),
        vy: rand(60, 190),
        g: rand(120, 260),
        drag: 0.985,
        rot: rand(0, TAU),
        vr: rand(-6, 6),
        w: rand(5, 11),
        h: rand(8, 16),
        color: pick(PALETTE),
        shape: Math.random() < 0.2 ? "mushroom" : Math.random() < 0.35 ? "circle" : "rect",
        life: 0,
        ttl: rand(4.5, 8),
        sway: rand(18, 55),
        phase: rand(0, TAU)
      });
    }
  }

  function firework(x, y, opts = {}) {
    const hue = opts.hue !== undefined ? opts.hue : pick([0, 12, 34, 350, 280, 160, 44]);
    const count = reduce ? 34 : 78;
    const ring = opts.ring || false;
    for (let i = 0; i < count; i++) {
      const a = ring ? (i / count) * TAU : rand(0, TAU);
      const sp = ring ? rand(280, 360) : rand(90, 460);
      push({
        kind: "spark",
        x, y,
        px: x, py: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        g: 230,
        drag: 0.86,
        life: 0,
        ttl: rand(1.1, 2.1),
        color: `hsl(${hue + rand(-16, 16)} 95% ${rand(58, 76)}%)`,
        size: rand(1.2, 2.6)
      });
    }
    // flash
    push({ kind: "flash", x, y, life: 0, ttl: 0.28, size: 90 });
    if (opts.sound !== false && window.Sound) window.Sound.sfx("boom");
  }

  function rocket(x, targetY, opts = {}) {
    push({
      kind: "rocket",
      x, y: H + 10,
      targetY,
      vx: rand(-40, 40),
      vy: rand(-980, -760),
      life: 0,
      ttl: 3,
      hue: opts.hue !== undefined ? opts.hue : pick([0, 12, 34, 350, 280, 160, 44]),
      color: "#ffe1b0"
    });
  }

  function sparkle(x, y, amount = 1) {
    for (let i = 0; i < amount; i++) {
      push({
        kind: "dot",
        x: x + rand(-6, 6),
        y: y + rand(-6, 6),
        vx: rand(-40, 40),
        vy: rand(-70, 10),
        g: 60,
        drag: 0.9,
        life: 0,
        ttl: rand(0.5, 1.1),
        color: pick(["#ffc46b", "#fff3e8", "#f04b3f", "#ffd9a8"]),
        size: rand(1.4, 3.4)
      });
    }
  }

  function spore(x, y) {
    push({
      kind: "dot",
      x, y,
      vx: rand(-12, 12),
      vy: rand(-42, -14),
      g: -4,
      drag: 0.995,
      life: 0,
      ttl: rand(4, 8),
      color: pick(["rgba(255,236,205,.9)", "rgba(255,160,170,.8)", "rgba(255,196,107,.9)"]),
      size: rand(1, 2.6),
      glow: true
    });
  }

  function puff(x, y, color = "rgba(255,240,225,.8)") {
    for (let i = 0; i < 14; i++) {
      push({
        kind: "dot", x, y,
        vx: rand(-50, 50), vy: rand(-70, -10),
        g: -18, drag: 0.92, life: 0, ttl: rand(0.8, 1.8),
        color, size: rand(2, 5), glow: true
      });
    }
  }

  /* ---------------- loop ---------------- */
  function drawMushroom(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    const w = p.w, h = p.h;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.18, w * 0.5, h * 0.34, 0, Math.PI, TAU);
    ctx.fill();
    ctx.globalAlpha *= 0.9;
    ctx.beginPath();
    ctx.roundRect(-w * 0.16, -h * 0.1, w * 0.32, h * 0.55, w * 0.1);
    ctx.fill();
    ctx.restore();
  }

  function drawStar(x, y, r, color, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU - Math.PI / 2;
      const a2 = a + TAU / 10;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(Math.cos(a2) * r * 0.44, Math.sin(a2) * r * 0.44);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    if (!last) last = now;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    ctx.clearRect(0, 0, W, H);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      if (p.life >= p.ttl) { parts.splice(i, 1); continue; }

      if (p.kind === "flash") {
        const t = p.life / p.ttl;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (0.6 + t));
        g.addColorStop(0, `rgba(255,240,210,${0.55 * (1 - t)})`);
        g.addColorStop(1, "rgba(255,200,140,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.6 + t), 0, TAU);
        ctx.fill();
        continue;
      }

      if (p.kind === "rocket") {
        p.vy += 300 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // trail
        ctx.strokeStyle = "rgba(255,214,150,.75)";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.02, p.y - p.vy * 0.02);
        ctx.stroke();
        if (p.vy > -90 || p.y <= p.targetY) {
          firework(p.x, p.y, { hue: p.hue });
          parts.splice(i, 1);
        }
        continue;
      }

      // integrate
      p.vy += (p.g || 0) * dt;
      const drag = p.drag !== undefined ? Math.pow(p.drag, dt * 60) : 1;
      p.vx *= drag;
      p.vy *= drag;
      p.x += (p.vx + (p.kind === "confetti" ? Math.sin(p.life * 2.4 + p.phase) * p.sway : 0)) * dt;
      p.y += p.vy * dt;

      const lifeT = p.life / p.ttl;
      const alpha = lifeT > 0.78 ? 1 - (lifeT - 0.78) / 0.22 : 1;

      if (p.kind === "confetti") {
        p.rot += p.vr * dt;
        ctx.save();
        ctx.globalAlpha = alpha * 0.95;
        if (p.shape === "mushroom") {
          drawMushroom(p);
        } else {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          if (p.shape === "circle") {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.w * 0.45, 0, TAU);
            ctx.fill();
          } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life * 6 + p.phase)));
          }
        }
        ctx.restore();
      } else if (p.kind === "spark") {
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        p.px = p.x;
        p.py = p.y;
        ctx.globalCompositeOperation = "source-over";
      } else {
        // dot
        ctx.globalAlpha = alpha;
        if (p.glow) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, TAU);
          ctx.fill();
          ctx.globalAlpha = alpha * 0.22;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.2, 0, TAU);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, TAU);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    if (parts.length === 0) {
      running = false;
      raf = null;
      ctx.clearRect(0, 0, W, H);
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (!running) {
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  const wrap = (fn) => function () { fn.apply(null, arguments); kick(); };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else if (parts.length) {
      kick();
    }
  });

  window.FX = {
    confettiBurst: wrap(confettiBurst),
    confettiRain: wrap(confettiRain),
    firework: wrap(firework),
    rocket: wrap(rocket),
    sparkle: wrap(sparkle),
    spore: wrap(spore),
    puff: wrap(puff),
    get count() { return parts.length; },
    clear() { parts.length = 0; }
  };
})();
