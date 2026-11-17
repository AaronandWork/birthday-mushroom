/* ============================================================
   audio.js — 一个手写的迷你音乐盒
   · 原创 8 小节摇篮曲（三角波 + 铃声 + 轻打击）
   · 程序化混响 IR，不加载任何外部音频文件
   · 音效：蜡烛、彩纸、烟花、点击、得分、失败
   ============================================================ */
(function () {
  "use strict";

  const A = {
    ctx: null,
    master: null,
    musicBus: null,
    sfxBus: null,
    convolver: null,
    playing: false,
    timer: null,
    nextTime: 0,
    step: 0,
    bpm: 84,
    noiseBuf: null,
    _starting: false
  };

  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* ---------- graph ---------- */
  function buildGraph() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    const ctx = new Ctx();
    A.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    A.master = master;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 24;
    comp.ratio.value = 3;
    comp.attack.value = 0.01;
    comp.release.value = 0.25;
    comp.connect(master);

    // procedural reverb
    const conv = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 2.2);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (ch ? 0.85 : 1);
      }
    }
    conv.buffer = ir;
    A.convolver = conv;

    const wet = ctx.createGain();
    wet.gain.value = 0.42;
    conv.connect(wet).connect(comp);

    const musicBus = ctx.createGain();
    musicBus.gain.value = 0.0;
    musicBus.connect(comp);
    musicBus.connect(conv);
    A.musicBus = musicBus;

    const sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.85;
    sfxBus.connect(comp);
    sfxBus.connect(conv);
    A.sfxBus = sfxBus;

    A.mix = comp;
    return true;
  }

  function ensure() {
    if (!A.ctx) {
      if (!buildGraph()) return null;
    }
    if (A.ctx.state === "suspended") A.ctx.resume();
    return A.ctx;
  }

  function noise() {
    if (!A.noiseBuf) {
      const ctx = A.ctx;
      const len = Math.floor(ctx.sampleRate * 2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      A.noiseBuf = buf;
    }
    return A.noiseBuf;
  }

  /* ---------- voices ---------- */
  function tone(opts) {
    const ctx = A.ctx;
    if (!ctx) return;
    const {
      freq = 440, type = "triangle", t = ctx.currentTime, dur = 0.6,
      gain = 0.1, attack = 0.01, bus = A.musicBus, detune = 0, glide = null, pan = 0
    } = opts;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (detune) osc.detune.value = detune;
    if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    let node = osc;
    if (pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      osc.connect(g).connect(p).connect(bus);
      node = null;
    } else {
      osc.connect(g).connect(bus);
    }
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function noiseHit(opts) {
    const ctx = A.ctx;
    if (!ctx) return;
    const {
      t = ctx.currentTime, dur = 0.3, gain = 0.1, type = "highpass",
      freq = 2000, q = 0.8, sweep = null, bus = A.sfxBus
    } = opts;
    const src = ctx.createBufferSource();
    src.buffer = noise();
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(80, sweep), t + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  /* ---------- music ---------- */
  // 8 bars · C — Am — F — G — C — Am — F — G
  const CHORDS = [
    { root: 48, notes: [60, 64, 67, 71] },
    { root: 45, notes: [57, 60, 64, 67] },
    { root: 41, notes: [53, 57, 60, 64] },
    { root: 43, notes: [55, 59, 62, 65] },
    { root: 48, notes: [60, 64, 67, 71] },
    { root: 45, notes: [57, 60, 64, 67] },
    { root: 41, notes: [53, 57, 60, 64] },
    { root: 43, notes: [55, 59, 62, 66] }
  ];

  const MELODY = [
    76, 79, 81, 79, 76, 74, 72, 74,
    72, 74, 76, 79, 81, 79, 76, 74,
    76, 79, 81, 84, 81, 79, 76, 72,
    74, 76, 79, 76, 74, 0, 0, 0,
    79, 81, 84, 81, 79, 76, 74, 76,
    72, 74, 76, 79, 81, 79, 76, 74,
    76, 79, 81, 79, 76, 74, 72, 74,
    72, 76, 79, 76, 72, 0, 0, 0
  ];

  const ARP = [0, 5, 9, 4, 9, 5, 9, 4]; // semitone offsets inside chord (relative-ish)

  function scheduleStep(step, t) {
    const bar = Math.floor(step / 8) % 8;
    const beatInBar = step % 8;
    const chord = CHORDS[bar];
    const bus = A.musicBus;

    // pad at bar start
    if (beatInBar === 0) {
      chord.notes.forEach((n, i) => {
        tone({ freq: midi(n), type: "sine", t, dur: 4.2, gain: 0.038, attack: 1.1, bus, pan: (i - 1.5) * 0.18 });
      });
      tone({ freq: midi(chord.root - 12), type: "sine", t, dur: 3.4, gain: 0.055, attack: 0.4, bus });
    }

    // arpeggio, 8th notes
    const arpNote = chord.notes[ARP[beatInBar] % chord.notes.length] + (beatInBar >= 4 ? 12 : 0);
    tone({
      freq: midi(arpNote + 12), type: "triangle", t,
      dur: 0.55 + (beatInBar % 2 === 0 ? 0.25 : 0),
      gain: 0.026, attack: 0.008, bus, pan: beatInBar % 2 ? 0.22 : -0.22
    });

    // melody
    const m = MELODY[step % MELODY.length];
    if (m) {
      tone({ freq: midi(m), type: "triangle", t, dur: 0.9, gain: 0.075, attack: 0.012, bus });
      tone({ freq: midi(m + 12), type: "sine", t, dur: 0.7, gain: 0.026, attack: 0.01, bus, pan: 0.12 });
    }

    // soft shaker on off-beats
    if (beatInBar % 2 === 1) {
      noiseHit({ t, dur: 0.07, gain: 0.012, type: "highpass", freq: 7000, bus });
    }
    // tiny bell sparkle every two bars
    if (step % 16 === 6) {
      tone({ freq: midi(96), type: "sine", t: t + 0.06, dur: 1.4, gain: 0.02, attack: 0.005, bus, pan: 0.4 });
    }
  }

  function scheduler() {
    const ctx = A.ctx;
    if (!ctx || !A.playing) return;
    const stepDur = 60 / A.bpm / 2;
    while (A.nextTime < ctx.currentTime + 0.25) {
      scheduleStep(A.step, A.nextTime);
      A.step = (A.step + 1) % 64;
      A.nextTime += stepDur;
    }
  }

  /* ---------- public ---------- */
  const Sound = {
    get isOn() { return A.playing; },

    async start() {
      const ctx = ensure();
      if (!ctx) return false;
      A.playing = true;
      A.step = 0;
      A.nextTime = ctx.currentTime + 0.12;
      A.musicBus.gain.cancelScheduledValues(ctx.currentTime);
      A.musicBus.gain.setValueAtTime(A.musicBus.gain.value, ctx.currentTime);
      A.musicBus.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.6);
      if (!A.timer) A.timer = setInterval(scheduler, 40);
      scheduler();
      return true;
    },

    stop() {
      if (!A.ctx) return;
      A.playing = false;
      const ctx = A.ctx;
      A.musicBus.gain.cancelScheduledValues(ctx.currentTime);
      A.musicBus.gain.setValueAtTime(A.musicBus.gain.value, ctx.currentTime);
      A.musicBus.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
      clearInterval(A.timer);
      A.timer = null;
    },

    async toggle() {
      if (A.playing) {
        this.stop();
        return false;
      }
      return await this.start();
    },

    /* sfx ------------------------------------------------------------------ */
    sfx(name) {
      const ctx = ensure();
      if (!ctx) return;
      const t = ctx.currentTime;
      switch (name) {
        case "pop":
          tone({ freq: 660, type: "sine", t, dur: 0.12, gain: 0.18, attack: 0.004, bus: A.sfxBus, glide: 150 });
          noiseHit({ t, dur: 0.06, gain: 0.08, type: "bandpass", freq: 1800, bus: A.sfxBus });
          break;
        case "sparkle":
          [1046, 1318, 1568, 2093].forEach((f, i) =>
            tone({ freq: f, type: "sine", t: t + i * 0.055, dur: 0.35, gain: 0.06, attack: 0.004, bus: A.sfxBus, pan: (i - 1.5) * 0.2 })
          );
          break;
        case "whoosh":
          noiseHit({ t, dur: 0.6, gain: 0.12, type: "bandpass", freq: 400, sweep: 3800, q: 1.2, bus: A.sfxBus });
          break;
        case "blow":
          noiseHit({ t, dur: 0.85, gain: 0.3, type: "lowpass", freq: 1400, sweep: 220, q: 0.6, bus: A.sfxBus });
          tone({ freq: 180, type: "sine", t, dur: 0.35, gain: 0.06, attack: 0.02, bus: A.sfxBus, glide: 90 });
          break;
        case "chime":
          [523, 659, 784, 1046, 1318].forEach((f, i) =>
            tone({ freq: f, type: "triangle", t: t + i * 0.08, dur: 1.1, gain: 0.07, attack: 0.01, bus: A.sfxBus })
          );
          break;
        case "boom":
          tone({ freq: 140, type: "sine", t, dur: 0.5, gain: 0.22, attack: 0.003, bus: A.sfxBus, glide: 40 });
          noiseHit({ t, dur: 0.5, gain: 0.14, type: "lowpass", freq: 900, sweep: 120, bus: A.sfxBus });
          break;
        case "tick":
          tone({ freq: 1200, type: "square", t, dur: 0.05, gain: 0.035, attack: 0.002, bus: A.sfxBus });
          break;
        case "score":
          tone({ freq: 880, type: "triangle", t, dur: 0.16, gain: 0.07, attack: 0.004, bus: A.sfxBus });
          tone({ freq: 1320, type: "sine", t: t + 0.05, dur: 0.22, gain: 0.05, attack: 0.004, bus: A.sfxBus });
          break;
        case "miss":
          tone({ freq: 300, type: "sawtooth", t, dur: 0.22, gain: 0.035, attack: 0.005, bus: A.sfxBus, glide: 150 });
          break;
        case "win":
          [523, 659, 784, 1046].forEach((f, i) => {
            tone({ freq: f, type: "triangle", t: t + i * 0.12, dur: 0.9, gain: 0.08, attack: 0.01, bus: A.sfxBus });
            tone({ freq: f * 2, type: "sine", t: t + i * 0.12, dur: 0.5, gain: 0.025, attack: 0.01, bus: A.sfxBus });
          });
          break;
        default:
          tone({ freq: 880, type: "triangle", t, dur: 0.12, gain: 0.05, bus: A.sfxBus });
      }
    },

    duck(amount = 0.25, time = 1.2) {
      if (!A.ctx || !A.playing) return;
      const ctx = A.ctx;
      const g = A.musicBus.gain;
      g.cancelScheduledValues(ctx.currentTime);
      g.setValueAtTime(g.value, ctx.currentTime);
      g.linearRampToValueAtTime(0.5 * amount, ctx.currentTime + 0.15);
      g.linearRampToValueAtTime(0.5, ctx.currentTime + time);
    }
  };

  window.Sound = Sound;
})();
