/* ============================================================
   app.js — 派对总控
   loader / 视差 / 蜡烛 / 信封 / 相册 / 接孢子 / 许愿灯 / 卡片导出
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  const CONFIG = {
    name: "蘑菇崽",
    date: "2026.11.17",
    letter:
      "谢谢你今天点开这一页。\n\n" +
      "我是一只不太会说话的小蘑菇，只能把想说的都放在这里：愿你今年所有的期待都有回音，所有的疲惫都有人接住；愿你想吃的时候有蛋糕，想哭的时候有肩膀，想笑的时候有人陪你笑到打嗝。\n\n" +
      "如果哪一天觉得世界有点吵，就来这里坐一会儿。我会一直戴着这顶小红帽，在原地等你。\n\n" +
      "生日快乐。今天你最大。"
  };

  /* ══════════════════ 01 · loader ══════════════════ */
  (function loader() {
    const el = $("#loader");
    const bar = $("#loaderBar");
    const pct = $("#loaderPct");
    if (!el) return;
    let value = 0;
    let done = false;

    const paint = (v) => {
      value = v;
      if (bar) bar.style.width = v + "%";
      if (pct) pct.textContent = String(Math.round(v));
    };
    paint(0);

    const timer = setInterval(() => {
      const step = value < 70 ? rand(6, 14) : value < 90 ? rand(2, 6) : rand(0.4, 1.4);
      paint(Math.min(94, value + step));
    }, 130);

    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(timer);
      paint(100);
      setTimeout(() => {
        el.classList.add("is-done");
        document.body.classList.remove("is-loading");
        document.body.classList.add("is-ready");
        boot();
      }, 420);
    };

    window.addEventListener("load", () => setTimeout(finish, 320));
    setTimeout(finish, 4200); // safety net
  })();

  function boot() {
    applyName();
    buildHeroSky();
    buildNav();
    buildSprinkles();
    buildGarland();
    observeReveals();
    countUp();
    initHeroParallax();
    initCursor();
    initSoundButton();
    initCake();
    initLetter();
    initGallery();
    initGame();
    initFinale();
    initMascotClicks();
    initGlobalActions();
    setDates();
    scrollSpy();
  }

  function buildSprinkles() {
    const colors = ["#f04b3f", "#ffc46b", "#bde6cd", "#fff7ee", "#8e6cff", "#ff8fa0"];
    $$(".cake__sprinkles").forEach((box) => {
      const n = 16;
      for (let i = 0; i < n; i++) {
        const s = document.createElement("i");
        const w = rand(3, 5);
        s.style.cssText = `left:${rand(4, 94)}%;top:${rand(6, 42)}%;width:${w}px;height:${rand(7, 13)}px;
          background:${colors[(Math.random() * colors.length) | 0]};--r:${rand(-60, 60)}deg;`;
        box.appendChild(s);
      }
    });
  }

  function buildGarland() {
    const box = $("#garland");
    if (!box) return;
    const colors = ["#f04b3f", "#ffc46b", "#bde6cd", "#ffa0aa", "#fff7ee", "#8e6cff"];
    const n = Math.max(9, Math.min(18, Math.floor(window.innerWidth / 92)));
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1);
      const f = document.createElement("i");
      f.style.cssText = [
        `--c:${colors[i % colors.length]}`,
        `--sag:${(Math.sin(Math.PI * t) * 30).toFixed(1)}px`,
        `--r:${((t - 0.5) * 9).toFixed(1)}deg`,
        `--d:${(i * 0.13).toFixed(2)}s`
      ].join(";");
      box.appendChild(f);
    }
  }

  function applyName() {
    const name = CONFIG.name;
    if (name === "蘑菇崽") return;
    const skip = new Set(["SCRIPT", "STYLE"]);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (skip.has(n.parentNode && n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      if (n.nodeValue.includes("蘑菇崽")) n.nodeValue = n.nodeValue.split("蘑菇崽").join(name);
    });
    document.title = document.title.replace("蘑菇崽", name);
  }

  function setDates() {
    const d = $("#letterDate");
    if (d) d.textContent = CONFIG.date;
    const hero = $("#heroDate");
    if (hero) hero.textContent = CONFIG.date.replace(/\./g, " · ") + " · 生日特别放送";
  }

  /* ══════════════════ 02 · hero sky ══════════════════ */
  function buildHeroSky() {
    const starBox = $("#heroStars");
    if (starBox) {
      const n = reduceMotion ? 30 : 90;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const s = document.createElement("i");
        const size = rand(1, 2.6);
        s.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 78)}%;width:${size}px;height:${size}px;
          opacity:${rand(0.2, 0.9)};animation-delay:${rand(0, 6)}s;animation-duration:${rand(2.6, 6)}s;
          box-shadow:0 0 ${rand(2, 8)}px rgba(255,255,255,.7);`;
        frag.appendChild(s);
      }
      starBox.appendChild(frag);
    }

    const bokeh = $("#heroBokeh");
    if (bokeh) {
      const n = reduceMotion ? 5 : 11;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const s = document.createElement("i");
        const size = rand(50, 150);
        s.style.cssText = `left:${rand(-4, 96)}%;top:${rand(4, 84)}%;width:${size}px;height:${size}px;
          opacity:${rand(0.12, 0.34)};animation-delay:${rand(-8, 0)}s;animation-duration:${rand(12, 22)}s;`;
        frag.appendChild(s);
      }
      bokeh.appendChild(frag);
    }

    // 孢子：英雄区可见时缓慢上浮
    const hero = $("#hero");
    if (!hero || reduceMotion) return;
    setInterval(() => {
      const r = hero.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (document.hidden) return;
      window.FX.spore(rand(0, window.innerWidth), window.innerHeight * rand(0.45, 1));
    }, 900);
  }

  /* ══════════════════ 03 · nav + reveal + count ══════════════════ */
  function buildNav() {
    const nav = $("#chapterNav");
    const sections = $$("main section[data-chapter]");
    if (!nav || !sections.length) return;
    sections.forEach((sec, i) => {
      const a = document.createElement("a");
      a.href = "#" + sec.id;
      a.className = "chapter-nav__item";
      a.innerHTML = `<span class="chapter-nav__label">${sec.dataset.chapter}</span><span class="chapter-nav__dot"></span>`;
      a.setAttribute("aria-label", sec.dataset.chapter);
      a.addEventListener("click", () => {
        if (window.Sound && window.Sound.isOn) window.Sound.sfx("tick");
      });
      nav.appendChild(a);
      sec.dataset.index = i;
    });
  }

  function observeReveals() {
    const items = $$("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  function countUp() {
    const stats = $$("[data-count]");
    if (!stats.length) return;
    const run = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const dur = 1500;
      const t0 = performance.now();
      const tick = (now) => {
        const k = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = String(Math.round(eased * target));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) { stats.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    stats.forEach((el) => io.observe(el));
  }

  function scrollSpy() {
    const sections = $$("main section[data-chapter]");
    const links = $$(".chapter-nav__item");
    const hud = $(".hud");
    const bar = $("#scrollBar");
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      if (hud) hud.classList.toggle("is-stuck", y > 40);
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? clamp((y / max) * 100, 0, 100) : 0) + "%";
      }
      let current = 0;
      sections.forEach((sec, i) => {
        const r = sec.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5) current = i;
      });
      links.forEach((l, i) => l.classList.toggle("is-active", i === current));
      const sec = sections[current];
      const light = !!sec && (sec.id === "cake" || sec.id === "gallery");
      if (hud) hud.classList.toggle("hud--light", light);
      const nav = $("#chapterNav");
      if (nav) nav.classList.toggle("is-light", light);
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ══════════════════ 04 · hero parallax + cursor ══════════════════ */
  function initHeroParallax() {
    const hero = $("#hero");
    const stage = $("#heroStage");
    const copy = $(".hero__copy");
    const stars = $("#heroStars");
    if (!hero) return;

    if (finePointer && !reduceMotion && stage) {
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        stage.style.transform = `translate3d(${nx * 26}px, ${ny * 18}px, 0)`;
        if (copy) copy.style.transform = `translate3d(${nx * -10}px, ${ny * -8}px, 0)`;
        if (stars) stars.style.transform = `translate3d(${nx * -18}px, ${ny * -14}px, 0)`;
      });
      hero.addEventListener("pointerleave", () => {
        stage.style.transform = "";
        if (copy) copy.style.transform = "";
        if (stars) stars.style.transform = "";
      });
    }

    if (reduceMotion) return;
    let t = false;
    window.addEventListener("scroll", () => {
      if (t) return;
      t = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2 && stage) {
          stage.style.setProperty("--scroll", String(y));
        }
        t = false;
      });
    }, { passive: true });
  }

  function initCursor() {
    const halo = $("#cursorHalo");
    if (!halo || !finePointer) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y, active = false;

    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!active) { active = true; halo.style.opacity = "1"; }
    }, { passive: true });
    window.addEventListener("pointerleave", () => { halo.style.opacity = "0"; active = false; });

    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      halo.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();

    let last = 0;
    window.addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - last < 90) return;
      last = now;
      if (Math.random() < 0.4) window.FX.sparkle(e.clientX, e.clientY, 1);
    }, { passive: true });
  }

  /* ══════════════════ 05 · sound ══════════════════ */
  function initSoundButton() {
    const btn = $("#soundBtn");
    if (!btn) return;
    const label = $(".sound-btn__label", btn);

    const sync = () => {
      const on = window.Sound && window.Sound.isOn;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      if (label) label.textContent = on ? "音乐开" : "音乐";
    };

    btn.addEventListener("click", async () => {
      const on = await window.Sound.toggle();
      sync();
      if (on) window.Sound.sfx("sparkle");
    });
    sync();

    // 第一个明确的手势里顺手把音乐打开（"开始派对"）
    const party = $('a[href="#cake"]');
    if (party) {
      party.addEventListener("click", () => {
        if (!window.Sound.isOn) window.Sound.start().then(sync);
      });
    }
  }

  /* ══════════════════ 06 · cake ══════════════════ */
  function initCake() {
    const row = $("#candleRow");
    const stage = $("#cakeStage");
    const status = $("#cakeStatus");
    const blowBtn = $("#blowBtn");
    const micBtn = $("#micBtn");
    const micLabel = $("#micBtnLabel");
    const meter = $("#meter");
    if (!row || !stage) return;

    const candles = $$(".candle", row);
    const cake = $("#cakeEl");
    let outCount = 0;
    let celebrated = false;
    let micStream = null;
    let micCtx = null;
    let analyser = null;
    let micRaf = null;
    let micOn = false;

    const setStatus = (text, done) => {
      if (!status) return;
      status.textContent = text;
      status.classList.toggle("is-done", !!done);
    };

    const centerOf = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    function blow(candle, quiet) {
      if (!candle || candle.classList.contains("is-out")) return false;
      candle.classList.add("is-out");
      outCount++;
      const p = centerOf(candle);
      window.FX.puff(p.x, p.y - 10, "rgba(255,245,232,.75)");
      window.FX.sparkle(p.x, p.y - 14, 3);
      if (!quiet) window.Sound.sfx("pop");
      if (outCount >= candles.length) celebrate();
      else setStatus(`还有 ${candles.length - outCount} 根。慢慢来，愿望不着急。`);
      return true;
    }

    function celebrate() {
      if (celebrated) return;
      celebrated = true;
      setStatus("愿望已经顺着烟飘到星星那里了。接下来，轮到你被祝福。", true);
      if (cake) {
        cake.classList.remove("is-celebrating");
        void cake.offsetWidth;
        cake.classList.add("is-celebrating");
      }
      window.Sound.sfx("chime");
      window.Sound.duck(0.4, 1.6);
      const p = centerOf(stage);
      window.FX.confettiBurst(p.x, p.y - 40, 110, { power: 1.1 });
      window.FX.confettiBurst(window.innerWidth * 0.12, window.innerHeight * 0.85, 70);
      window.FX.confettiBurst(window.innerWidth * 0.88, window.innerHeight * 0.85, 70);
      setTimeout(() => window.FX.rocket(rand(0.3, 0.7) * window.innerWidth, window.innerHeight * 0.22), 420);
      setTimeout(() => window.FX.rocket(rand(0.2, 0.8) * window.innerWidth, window.innerHeight * 0.3), 980);
      if (blowBtn) $("span", blowBtn).textContent = "再点一次蜡烛";
    }

    function relight() {
      celebrated = false;
      outCount = 0;
      candles.forEach((c) => c.classList.remove("is-out"));
      setStatus("蜡烛重新点上了。刚才那个愿望，已经记下来了。");
      window.Sound.sfx("sparkle");
      if (blowBtn) $("span", blowBtn).textContent = "帮我一起吹";
    }

    function blowAll() {
      if (celebrated) { relight(); return; }
      let i = 0;
      const tick = () => {
        const lit = candles.filter((c) => !c.classList.contains("is-out"));
        if (!lit.length) return;
        blow(lit[0], i > 0);
        i++;
        if (lit.length > 1) setTimeout(tick, 220);
      };
      window.Sound.sfx("blow");
      tick();
    }

    candles.forEach((c) => {
      c.addEventListener("click", () => blow(c));
      c.addEventListener("pointerenter", () => { if (finePointer) c.style.transform = "translateY(-2px)"; });
      c.addEventListener("pointerleave", () => { c.style.transform = ""; });
    });

    if (blowBtn) blowBtn.addEventListener("click", blowAll);

    // 蛋糕跟随指针轻微 3D 倾斜
    const cakeEl = $("#cakeEl");
    if (finePointer && !reduceMotion && stage && cakeEl) {
      stage.addEventListener("pointermove", (e) => {
        const r = stage.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cakeEl.style.setProperty("--tilt-y", (px * 9).toFixed(2) + "deg");
        cakeEl.style.setProperty("--tilt-x", (-py * 7).toFixed(2) + "deg");
      });
      stage.addEventListener("pointerleave", () => {
        cakeEl.style.setProperty("--tilt-y", "0deg");
        cakeEl.style.setProperty("--tilt-x", "0deg");
      });
    }

    /* ---- microphone ---- */
    async function startMic() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("这个浏览器没有开放麦克风。点蜡烛，或按空格，一样可以吹灭。");
        return;
      }
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
        micCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = micCtx.createMediaStreamSource(micStream);
        analyser = micCtx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.6;
        src.connect(analyser);
        micOn = true;
        if (micBtn) micBtn.setAttribute("aria-pressed", "true");
        if (micLabel) micLabel.textContent = "麦克风已开启 · 对着吹";
        if (meter) meter.classList.add("is-live");
        setStatus("把嘴靠近麦克风，轻轻吹一下。蜡烛会一根一根灭掉。");
        listen();
      } catch (err) {
        setStatus("麦克风没打开也没关系，点蜡烛或者按空格一样可以吹灭。");
        if (micBtn) micBtn.setAttribute("aria-pressed", "false");
      }
    }

    function stopMic() {
      micOn = false;
      if (micRaf) cancelAnimationFrame(micRaf);
      micRaf = null;
      if (micStream) micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
      if (micCtx) { micCtx.close(); micCtx = null; }
      analyser = null;
      if (micBtn) micBtn.setAttribute("aria-pressed", "false");
      if (micLabel) micLabel.textContent = "用嘴吹（开麦克风）";
      if (meter) { meter.classList.remove("is-live"); $("i", meter).style.width = "0%"; }
    }

    function listen() {
      if (!analyser) return;
      const data = new Uint8Array(analyser.fftSize);
      let blowFrames = 0;

      const loop = () => {
        if (!micOn) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        if (meter) $("i", meter).style.width = clamp(rms * 260, 2, 100) + "%";

        if (rms > 0.07) blowFrames++;
        else blowFrames = Math.max(0, blowFrames - 1);

        if (blowFrames > 4) {
          blowFrames = 0;
          const lit = candles.filter((c) => !c.classList.contains("is-out"));
          if (lit.length) {
            blow(lit[0], true);
            window.Sound.sfx("blow");
            window.Sound.duck(0.5, 1.2);
          }
        }
        micRaf = requestAnimationFrame(loop);
      };
      loop();
    }

    if (micBtn) {
      micBtn.addEventListener("click", () => {
        if (micOn) { stopMic(); setStatus("麦克风关掉了。点蜡烛也可以。"); }
        else startMic();
      });
    }

    // 空格吹蜡烛
    window.addEventListener("keydown", (e) => {
      if (e.code !== "Space" || e.target.matches("input, textarea")) return;
      const r = stage.getBoundingClientRect();
      const visible = r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.2;
      if (!visible) return;
      e.preventDefault();
      blowAll();
    });

    setStatus("五根蜡烛，五个愿望。吹灭它们，就会有人替你实现。");
  }

  /* ══════════════════ 07 · letter ══════════════════ */
  function initLetter() {
    const envelope = $("#envelope");
    const sheet = $("#letterSheet");
    const textEl = $("#letterText");
    const replay = $("#replayLetter");
    const stage = document.querySelector(".letter-stage");
    if (!envelope || !sheet || !textEl) return;

    let typing = false;
    let skip = null;

    // 信纸展开后比信封高：测量内容高度，让舞台平滑长高
    const measure = () => {
      const prev = sheet.style.cssText;
      sheet.style.cssText = prev + ";position:static;visibility:hidden;opacity:0;height:auto;max-height:none;";
      const h = Math.ceil(sheet.offsetHeight);
      sheet.style.cssText = prev;
      return h;
    };

    const expand = () => {
      if (!stage) return;
      const from = stage.offsetHeight;
      const need = Math.max(measure(), from);
      stage.style.height = from + "px";
      void stage.offsetHeight;
      stage.classList.add("is-open");
      requestAnimationFrame(() => { stage.style.height = need + "px"; });
    };

    const type = (str, speed = 13) => {
      textEl.textContent = "";
      typing = true;
      const caret = document.createElement("span");
      caret.className = "caret";
      textEl.appendChild(caret);
      let i = 0;
      let timer = null;

      const finishNow = () => {
        clearTimeout(timer);
        textEl.textContent = str;
        typing = false;
        skip = null;
        if (window.Sound) window.Sound.sfx("sparkle");
      };

      const step = () => {
        if (i >= str.length) { finishNow(); return; }
        const ch = str[i++];
        caret.insertAdjacentText("beforebegin", ch);
        timer = setTimeout(step, ch === "\n" ? speed * 7 : ch === "。" || ch === "，" ? speed * 3 : speed);
      };
      step();
      skip = finishNow;
    };

    const open = () => {
      if (envelope.getAttribute("aria-expanded") === "true") return;
      envelope.setAttribute("aria-expanded", "true");
      envelope.classList.add("is-open");
      window.Sound.sfx("whoosh");
      setTimeout(() => {
        envelope.classList.add("is-hidden");
        sheet.classList.add("is-in");
        sheet.setAttribute("aria-hidden", "false");
        // 先把全文放进去量高度，再开始逐字打字
        textEl.textContent = CONFIG.letter;
        expand();
        type(CONFIG.letter);
        // 展开后如果信纸超出视口，轻轻把它带回画面
        setTimeout(() => {
          if (!stage) return;
          const r = stage.getBoundingClientRect();
          if (r.bottom > window.innerHeight - 30 || r.top < 70) {
            stage.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
          }
        }, 1000);
      }, 480);
    };

    envelope.addEventListener("click", open);
    sheet.addEventListener("click", () => { if (typing && skip) skip(); });

    if (replay) {
      replay.addEventListener("click", () => {
        sheet.classList.add("is-in");
        sheet.setAttribute("aria-hidden", "false");
        envelope.classList.add("is-open", "is-hidden");
        envelope.setAttribute("aria-expanded", "true");
        window.Sound.sfx("whoosh");
        textEl.textContent = CONFIG.letter;
        expand();
        type(CONFIG.letter);
      });
    }

    let rt = null;
    window.addEventListener("resize", () => {
      if (!stage || !stage.classList.contains("is-open")) return;
      clearTimeout(rt);
      rt = setTimeout(() => { stage.style.height = measure() + "px"; }, 180);
    });

    if (reduceMotion) {
      textEl.textContent = CONFIG.letter;
    }
  }

  /* ══════════════════ 08 · gallery ══════════════════ */
  function initGallery() {
    const box = $("#lightbox");
    const img = $("#lightboxImg");
    const cap = $("#lightboxCap");
    const closeBtn = $(".lightbox__close");
    if (!box || !img) return;

    const open = (src, caption, alt) => {
      img.src = src;
      img.alt = alt || caption || "";
      if (cap) cap.textContent = caption || "";
      box.hidden = false;
      document.body.style.overflow = "hidden";
      window.Sound.sfx("pop");
    };
    const close = () => {
      box.hidden = true;
      document.body.style.overflow = "";
      img.src = "";
    };

    $$(".polaroid__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const im = $("img", btn);
        open(btn.dataset.full, btn.dataset.caption, im ? im.alt : "");
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });

    if (!finePointer || reduceMotion) return;
    $$(".polaroid").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotate(0deg) perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-6px) scale(1.03)`;
        card.style.zIndex = "3";
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        card.style.zIndex = "";
      });
    });
  }

  /* ══════════════════ 09 · mini game ══════════════════ */
  function initGame() {
    const canvas = $("#gameCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const overlay = $("#gameOverlay");
    const startBtn = $("#gameStart");
    const scoreEl = $("#gameScore");
    const comboEl = $("#gameCombo");
    const timeEl = $("#gameTime");
    const bestEl = $("#gameBest");
    const popEl = $("#comboPop");
    const titleEl = $("#gameOverlayTitle");
    const textEl = $("#gameOverlayText");
    const kickerEl = $(".arcade__kicker");

    const DURATION = 20;
    const BEST_KEY = "mushroom-birthday-best";
    let W = 0, H = 0, DPR = 1;
    let spores = [];
    let score = 0, combo = 0, best = 0;
    let playing = false, raf = null, lastT = 0;
    let timeLeft = DURATION, spawnAcc = 0, lastCatch = 0;
    let pointer = { x: -999, y: -999 };

    try { best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0; } catch (e) { best = 0; }
    if (bestEl) bestEl.textContent = String(best);

    function resize() {
      const r = canvas.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", () => { if (!playing) { resize(); draw(); } });

    function spawn() {
      const gold = Math.random() < 0.14;
      const r = gold ? rand(15, 19) : rand(11, 16);
      spores.push({
        x: rand(r + 10, W - r - 10),
        y: -r * 2,
        vy: rand(65, 120) * (1 + (DURATION - timeLeft) * 0.018),
        vx: rand(-26, 26),
        r,
        rot: rand(0, Math.PI * 2),
        spin: rand(-2, 2),
        gold,
        alive: true
      });
    }

    function drawSpore(s) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(Math.sin(s.rot) * 0.28);
      if (s.gold) {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s.r * 3.4);
        g.addColorStop(0, "rgba(255,214,120,.55)");
        g.addColorStop(1, "rgba(255,214,120,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, s.r * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      // cap
      ctx.fillStyle = s.gold ? "#ffd479" : "#f04b3f";
      ctx.beginPath();
      ctx.ellipse(0, -s.r * 0.18, s.r, s.r * 0.82, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      // spots
      ctx.fillStyle = "rgba(255,247,238,.92)";
      ctx.beginPath();
      ctx.ellipse(-s.r * 0.34, -s.r * 0.5, s.r * 0.2, s.r * 0.15, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s.r * 0.3, -s.r * 0.44, s.r * 0.16, s.r * 0.12, 0.4, 0, Math.PI * 2);
      ctx.fill();
      // stem
      ctx.fillStyle = "#fff3e8";
      ctx.beginPath();
      ctx.roundRect(-s.r * 0.26, -s.r * 0.14, s.r * 0.52, s.r * 0.72, s.r * 0.2);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#2a1424";
      ctx.beginPath();
      ctx.arc(-s.r * 0.12, s.r * 0.12, s.r * 0.07, 0, Math.PI * 2);
      ctx.arc(s.r * 0.12, s.r * 0.12, s.r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // background glow
      const bg = ctx.createRadialGradient(W / 2, H * 0.1, 10, W / 2, H * 0.5, Math.max(W, H) * 0.8);
      bg.addColorStop(0, "rgba(120,40,90,.35)");
      bg.addColorStop(1, "rgba(20,6,18,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // stars
      ctx.fillStyle = "rgba(255,243,232,.35)";
      for (let i = 0; i < 26; i++) {
        const x = ((i * 137.5) % W);
        const y = ((i * 89.3) % (H * 0.9));
        ctx.fillRect(x, y, 1.6, 1.6);
      }

      spores.forEach(drawSpore);
    }

    function floatingText(x, y, text, color) {
      if (!popEl) return;
      popEl.textContent = text;
      popEl.style.left = x + "px";
      popEl.style.top = y + "px";
      popEl.style.color = color || "#ffc46b";
      popEl.classList.remove("is-live");
      void popEl.offsetWidth;
      popEl.classList.add("is-live");
    }

    function hitTest(x, y) {
      for (let i = spores.length - 1; i >= 0; i--) {
        const s = spores[i];
        if (!s.alive) continue;
        const dx = x - s.x;
        const dy = y - (s.y - s.r * 0.1);
        if (dx * dx + dy * dy <= (s.r + 12) * (s.r + 12)) {
          s.alive = false;
          spores.splice(i, 1);
          const now = performance.now();
          combo = now - lastCatch < 1500 ? combo + 1 : 1;
          lastCatch = now;
          const mult = clamp(1 + Math.floor(combo / 4), 1, 5);
          const gain = (s.gold ? 5 : 1) * mult;
          score += gain;
          if (scoreEl) scoreEl.textContent = String(score);
          if (comboEl) comboEl.textContent = "×" + mult;
          floatingText(s.x, s.y, "+" + gain + (mult > 1 ? " ×" + mult : ""), s.gold ? "#ffd479" : "#fff3e8");
          window.Sound.sfx(s.gold ? "chime" : "score");
          window.FX.sparkle(canvas.getBoundingClientRect().left + s.x, canvas.getBoundingClientRect().top + s.y, 4);
          return;
        }
      }
      combo = 0;
      if (comboEl) comboEl.textContent = "×1";
      window.Sound.sfx("miss");
    }

    function loop(t) {
      if (!playing) return;
      if (!lastT) lastT = t;
      const dt = Math.min((t - lastT) / 1000, 0.06);
      lastT = t;

      timeLeft -= dt;
      if (timeEl) timeEl.textContent = Math.max(0, timeLeft).toFixed(1) + "s";

      spawnAcc += dt;
      const interval = clamp(0.86 - (DURATION - timeLeft) * 0.026, 0.34, 0.9);
      if (spawnAcc > interval) { spawnAcc = 0; spawn(); if (Math.random() < 0.35) spawn(); }

      spores.forEach((s) => {
        s.y += s.vy * dt;
        s.x += Math.sin((s.y + s.r * 20) / 90) * 22 * dt + s.vx * dt;
        s.rot += s.spin * dt;
      });
      const before = spores.length;
      spores = spores.filter((s) => s.y < H + 60 && s.alive);
      if (spores.length < before) {
        combo = 0;
        if (comboEl) comboEl.textContent = "×1";
      }

      draw();

      if (timeLeft <= 0) { end(); return; }
      raf = requestAnimationFrame(loop);
    }

    function start() {
      resize();
      spores = [];
      score = 0; combo = 0; timeLeft = DURATION; spawnAcc = 0; lastCatch = 0; lastT = 0;
      if (scoreEl) scoreEl.textContent = "0";
      if (comboEl) comboEl.textContent = "×1";
      if (timeEl) timeEl.textContent = DURATION.toFixed(1) + "s";
      if (overlay) overlay.classList.add("is-hidden");
      playing = true;
      window.Sound.sfx("whoosh");
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }

    function end() {
      playing = false;
      cancelAnimationFrame(raf);
      spores = [];
      draw();
      let rank = "重在参与";
      if (score >= 60) rank = "蘑菇之王";
      else if (score >= 35) rank = "孢子猎手";
      else if (score >= 15) rank = "手速还行";
      if (score > best) {
        best = score;
        try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) {}
        if (bestEl) bestEl.textContent = String(best);
      }
      if (overlay) overlay.classList.remove("is-hidden");
      if (titleEl) titleEl.textContent = `${score} 分 · ${rank}`;
      if (textEl) textEl.textContent = score > 0 ? `你一共接住了 ${score} 分快乐，最佳纪录 ${best} 分。要不要再来一局？` : "一个都没接到也没关系，它们在森林里等你下次来。";
      if (kickerEl) kickerEl.textContent = "GAME OVER";
      if (startBtn) $("span", startBtn).textContent = "再来一局";
      window.Sound.sfx("win");
      window.FX.confettiBurst(window.innerWidth / 2, window.innerHeight * 0.45, 90);
      if (score >= 35) window.FX.firework(window.innerWidth * 0.5, window.innerHeight * 0.3, { hue: 34 });
    }

    if (startBtn) startBtn.addEventListener("click", start);

    canvas.addEventListener("pointerdown", (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      pointer = { x, y };
      if (playing) hitTest(x, y);
    });

    draw();
    if (timeEl) timeEl.textContent = DURATION.toFixed(1) + "s";
  }

  /* ══════════════════ 10 · finale ══════════════════ */
  function initFinale() {
    const form = $("#wishForm");
    const input = $("#wishInput");
    const layer = $("#lanternLayer");
    const chips = $("#wishChips");
    const fwBtn = $("#fireworkBtn");
    const cardBtn = $("#cardBtn");

    const wishes = ["健康平安", "暴富", "少加班", "被爱包围", "睡个好觉", "永远可爱"];
    if (chips) {
      wishes.forEach((w) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "wish-chip";
        b.textContent = w;
        b.addEventListener("click", () => {
          if (input) { input.value = w; input.focus(); }
          window.Sound.sfx("tick");
        });
        chips.appendChild(b);
      });
    }

    const release = (text) => {
      if (!layer) return;
      const el = document.createElement("div");
      el.className = "lantern";
      el.style.left = rand(8, 88) + "%";
      el.style.setProperty("--dur", rand(13, 19) + "s");
      el.innerHTML = `<div class="lantern__body"><span class="lantern__wish"></span></div>`;
      $(".lantern__wish", el).textContent = text.slice(0, 24);
      layer.appendChild(el);
      setTimeout(() => el.remove(), 20000);
      window.FX.sparkle(window.innerWidth * rand(0.2, 0.8), window.innerHeight * 0.75, 6);
      window.Sound.sfx("sparkle");
    };

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = (input && input.value.trim()) || "希望明年也能一起过生日";
        release(text);
        if (input) { input.value = ""; input.blur(); }
        window.FX.confettiRain(24, {});
      });
    }

    if (fwBtn) {
      fwBtn.addEventListener("click", () => {
        window.Sound.duck(0.35, 2.2);
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            window.FX.rocket(rand(0.12, 0.88) * window.innerWidth, rand(0.12, 0.42) * window.innerHeight, {
              hue: [0, 12, 34, 350, 280, 160][i % 6]
            });
          }, i * 260);
        }
      });
    }

    if (cardBtn) cardBtn.addEventListener("click", downloadCard);

    // 氛围：进入许愿区时，自动放一颗烟花，并偶尔升起几盏别人的灯
    const finale = $("#finale");
    if (finale && "IntersectionObserver" in window) {
      let ambient = null;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !ambient) {
            window.FX.rocket(window.innerWidth * 0.72, window.innerHeight * 0.3, { hue: 34 });
            let i = 0;
            const pool = ["要一直开心", "今年顺顺利利", "被世界温柔以待", "天天有好吃的", "早点睡", "发大财"];
            ambient = setInterval(() => {
              if (document.hidden) return;
              if (layer && layer.childElementCount < 3) release(pool[i++ % pool.length]);
            }, 5200);
          } else if (!e.isIntersecting && ambient) {
            clearInterval(ambient);
            ambient = null;
          }
        });
      }, { threshold: 0.35 });
      io.observe(finale);
    }
  }

  /* ══════════════════ 11 · card export ══════════════════ */
  function downloadCard() {
    const W = 1080, H = 1440;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");

    const paint = () => {
      // paper
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#fff8ef");
      bg.addColorStop(0.6, "#fbeadb");
      bg.addColorStop(1, "#f6dcc9");
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);

      // top red band
      g.fillStyle = "#f04b3f";
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(W, 0);
      g.lineTo(W, 250);
      g.quadraticCurveTo(W / 2, 330, 0, 250);
      g.closePath();
      g.fill();

      // dots
      const colors = ["#ffc46b", "#bde6cd", "#ffa0aa", "#f04b3f", "#8e6cff"];
      for (let i = 0; i < 70; i++) {
        g.fillStyle = colors[i % colors.length];
        g.globalAlpha = 0.55;
        g.beginPath();
        g.arc(Math.random() * W, 260 + Math.random() * (H - 300), 2 + Math.random() * 5, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;

      // headline
      g.fillStyle = "#fff7ee";
      g.textAlign = "center";
      g.font = "60px 'Cooper Black', 'Microsoft YaHei', serif";
      g.fillText("HAPPY BIRTHDAY", W / 2, 126);
      g.font = "400 24px 'Segoe UI', 'Microsoft YaHei', sans-serif";
      g.globalAlpha = 0.82;
      g.fillText("生日特别放送 · " + CONFIG.date, W / 2, 176);
      g.globalAlpha = 1;

      // chinese title
      g.fillStyle = "#2a1424";
      g.font = "900 96px 'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', sans-serif";
      g.fillText("生日快乐", W / 2, 452);
      g.fillStyle = "#cf352f";
      g.font = "400 46px 'STXingkai', 'KaiTi', serif";
      g.fillText("给 " + CONFIG.name, W / 2, 522);

      // message
      g.fillStyle = "#5a3245";
      g.font = "400 28px 'Microsoft YaHei', sans-serif";
      g.textAlign = "left";
      const lines = [
        "愿你今年所有的期待都有回音，",
        "所有的疲惫都有人接住，",
        "想笑的时候有人陪你笑到打嗝。"
      ];
      lines.forEach((line, i) => g.fillText(line, 248, 604 + i * 52));
      g.textAlign = "center";

      // mascot
      const img = new Image();
      img.onload = () => {
        const iw = 460;
        const ih = iw * (img.height / img.width);
        g.save();
        g.globalAlpha = 0.16;
        g.fillStyle = "#f04b3f";
        g.beginPath();
        g.ellipse(W / 2, H - 250, 260, 60, 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
        g.drawImage(img, (W - iw) / 2, H - ih - 210, iw, ih);

        // footer
        g.fillStyle = "#2a1424";
        g.font = "600 30px Fredoka, 'Microsoft YaHei', sans-serif";
        g.fillText("今天你最大", W / 2, H - 96);
        g.fillStyle = "rgba(42,20,36,.55)";
        g.font = "400 20px Inter, 'Microsoft YaHei', sans-serif";
        g.fillText("蘑菇崽的生日派对 · 把这一页收藏起来", W / 2, H - 56);
        save();
      };
      img.onerror = () => { save(); };
      img.src = "assets/img/mascot.png";

      function save() {
        try {
          c.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "蘑菇崽的生日卡片.png";
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
            window.Sound.sfx("chime");
            window.FX.confettiBurst(window.innerWidth - 120, window.innerHeight - 160, 60);
          }, "image/png");
        } catch (e) {
          window.alert("这张卡片没能保存下来。换一个浏览器再试试？");
        }
      }
    };

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
    else paint();
  }

  /* ══════════════════ 12 · mascot & global actions ══════════════════ */
  function initMascotClicks() {
    const mascot = $("#heroMascot");
    const bubbles = $$(".bubble");
    if (!mascot) return;
    const lines = ["嘿嘿", "别戳啦", "今天是我生日", "要不要吃蛋糕", "愿望借你一个"];
    let i = 0;

    mascot.addEventListener("click", () => {
      mascot.animate(
        [
          { transform: "translateY(0) scale(1) rotate(0deg)" },
          { transform: "translateY(-24px) scale(1.04) rotate(-3deg)" },
          { transform: "translateY(0) scale(.98) rotate(2deg)" },
          { transform: "translateY(0) scale(1) rotate(0deg)" }
        ],
        { duration: 700, easing: "cubic-bezier(.34,1.56,.64,1)" }
      );
      const r = mascot.getBoundingClientRect();
      window.FX.confettiBurst(r.left + r.width / 2, r.top + r.height / 2, 26, { power: 0.6 });
      window.FX.sparkle(r.left + r.width / 2, r.top + r.height * 0.4, 8);
      window.Sound.sfx("pop");
      if (bubbles.length) {
        const b = bubbles[i % bubbles.length];
        b.textContent = lines[i % lines.length];
        b.animate(
          [
            { transform: "scale(.8) translateY(6px)", opacity: 0.4 },
            { transform: "scale(1.06) translateY(-4px)", opacity: 1 },
            { transform: "scale(1) translateY(0)", opacity: 1 }
          ],
          { duration: 500, easing: "cubic-bezier(.34,1.56,.64,1)" }
        );
        i++;
      }
    });
  }

  function initGlobalActions() {
    $$('[data-action="confetti"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        window.FX.confettiRain(120);
        window.FX.confettiBurst(window.innerWidth / 2, window.innerHeight * 0.62, 70);
        window.Sound.sfx("whoosh");
      });
    });

    // 磁吸按钮：指针靠近时轻轻跟过去
    if (finePointer && !reduceMotion) {
      $$(".btn").forEach((btn) => {
        btn.addEventListener("pointermove", (e) => {
          const r = btn.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          btn.style.transform = `translate(${(x * 9).toFixed(1)}px, ${(y * 7 - 2).toFixed(1)}px) scale(1.03)`;
        });
        btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
      });
    }
  }
})();
