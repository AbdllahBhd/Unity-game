"use strict";
/*
 * HNSfx: synthesized sound effects and ambience for Hollow Night (browser prototype).
 * Everything is generated with the Web Audio API (oscillators, noise buffers, filters,
 * envelopes). No audio files, no dependencies, plain script.
 *
 * API (globalThis.HNSfx):
 *   HNSfx.unlock()            create or resume the AudioContext; call on the first user
 *                             gesture. Safe to call repeatedly.
 *   HNSfx.setMuted(bool)      master gain to 0 when muted. Nothing is persisted.
 *   HNSfx.muted               getter, current mute state.
 *   HNSfx.ambience(on)        start/stop the looping wind bed and the occasional owl hoot.
 *                             Fades in/out over about 1 s.
 *   HNSfx.play(name, opts)    one-shot effect. opts.volume (0..1, default 1) scales the
 *                             sound, opts.pitch (default 1) multiplies frequencies,
 *                             opts.index (0..2, "star" only) raises the chime pitch.
 *     names: launch dash smash crush land web boing zip snap seesaw roll notice door
 *            death bosshit bossdown star tap page lightning
 *            snore growl clink whisper crackle creak caw squeak drip
 *   HNSfx.setPlace(place)     "hearth" | "kitchen" | "loom" | "gorge" | "roofs" | "press": changes the ambience
 *                             bed (indoor fire, creaking loom, wind and water outside).
 *   Unknown names do nothing. play() is a no-op until unlock() ran, and while muted.
 *   At most 4 instances of the same sound play at once.
 */
(function () {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  const MAX_SAME = 4;
  let ctx = null;
  let master = null;
  let muted = false;
  let noiseBuf = null;
  const playing = {};
  // One timer handle per loop, so nothing accumulates however long the game runs.
  const amb = { on: false, gain: null, src: null, filter: null, windT: 0, owlT: 0, tickT: 0, place: "hearth" };

  // ---------------------------------------------------------------- helpers
  function unlock() {
    if (!Ctor) return;
    if (!ctx) {
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
  }

  function ready() {
    return ctx !== null && !muted && ctx.state === "running";
  }

  // One shared 2 s white-noise buffer; every noise source reads from it.
  function noiseBuffer() {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  // Noise burst: buffer source started at t, stopped after duration.
  function noise(duration, t, loop) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = !!loop;
    src.start(t);
    if (!loop) src.stop(t + duration);
    return src;
  }

  // Oscillator started at t for duration. freq may be [start, end] for a sweep.
  function tone(type, freq, duration, t) {
    const osc = ctx.createOscillator();
    osc.type = type;
    if (Array.isArray(freq)) {
      osc.frequency.setValueAtTime(freq[0], t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq[1]), t + duration);
    } else {
      osc.frequency.value = freq;
    }
    osc.start(t);
    osc.stop(t + duration);
    return osc;
  }

  // Attack/decay/sustain/release envelope on a gain node starting at t; the release
  // begins at t + duration - release. Returns the gain node.
  function env(peak, t, attack, decay, sustainLevel, release, duration) {
    const g = ctx.createGain();
    const p = g.gain;
    p.setValueAtTime(0.0001, t);
    p.linearRampToValueAtTime(peak, t + attack);
    p.exponentialRampToValueAtTime(Math.max(0.0001, peak * sustainLevel), t + attack + decay);
    p.setValueAtTime(Math.max(0.0001, peak * sustainLevel), t + Math.max(attack + decay, duration - release));
    p.exponentialRampToValueAtTime(0.0001, t + duration);
    return g;
  }

  function filter(type, freq, q, t, sweepTo, duration) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q || 1;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + duration);
    return f;
  }

  // Low-frequency modulator wired into an AudioParam (vibrato, tremolo, flutter).
  function lfo(type, rate, depth, param, t, duration) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = rate;
    const g = ctx.createGain();
    g.gain.value = depth;
    o.connect(g).connect(param);
    o.start(t);
    o.stop(t + duration);
  }

  // Connect a chain of nodes left to right and return the last one.
  function chain() {
    for (let i = 0; i < arguments.length - 1; i++) arguments[i].connect(arguments[i + 1]);
    return arguments[arguments.length - 1];
  }

  // ---------------------------------------------------------------- sounds
  // Each recipe receives (t, p, out, opts): start time, pitch multiplier, output gain.
  const SOUNDS = {
    launch(t, p, out) {
      chain(noise(0.25, t), filter("bandpass", 400 * p, 2, t, 2400 * p, 0.25), env(0.5, t, 0.02, 0.1, 0.5, 0.1, 0.25), out);
    },
    dash(t, p, out) {
      chain(noise(0.2, t), filter("highpass", 1800 * p, 1, t), env(0.3, t, 0.01, 0.08, 0.5, 0.08, 0.2), out);
      chain(tone("sawtooth", [300 * p, 1100 * p], 0.2, t), filter("lowpass", 2500 * p, 1, t), env(0.15, t, 0.01, 0.1, 0.4, 0.06, 0.2), out);
    },
    smash(t, p, out) {
      chain(noise(0.18, t), filter("lowpass", 3000 * p, 1, t, 600 * p, 0.18), env(0.6, t, 0.005, 0.1, 0.3, 0.05, 0.18), out);
      chain(tone("sine", [130 * p, 40 * p], 0.25, t), env(0.8, t, 0.005, 0.15, 0.2, 0.08, 0.25), out);
      chain(tone("triangle", [700 * p, 140 * p], 0.14, t + 0.02), env(0.3, t + 0.02, 0.005, 0.08, 0.3, 0.04, 0.14), out);
    },
    crush(t, p, out) {
      chain(noise(0.04, t), filter("highpass", 3000 * p, 1, t), env(0.5, t, 0.002, 0.03, 0.2, 0.01, 0.04), out);
      chain(noise(0.4, t), filter("lowpass", 900 * p, 1, t, 150 * p, 0.4), env(0.7, t, 0.005, 0.2, 0.2, 0.15, 0.4), out);
      chain(tone("sine", [90 * p, 28 * p], 0.4, t), env(1, t, 0.005, 0.25, 0.2, 0.1, 0.4), out);
    },
    land(t, p, out) {
      chain(tone("sine", [95 * p, 50 * p], 0.12, t), env(0.25, t, 0.004, 0.08, 0.2, 0.03, 0.12), out);
      chain(noise(0.06, t), filter("lowpass", 700 * p, 1, t), env(0.08, t, 0.002, 0.04, 0.2, 0.02, 0.06), out);
    },
    web(t, p, out) {
      const o = tone("triangle", 220 * p, 0.4, t);
      lfo("sine", 9, 10 * p, o.frequency, t, 0.4);
      chain(o, filter("lowpass", 1800 * p, 2, t, 500 * p, 0.4), env(0.4, t, 0.003, 0.2, 0.3, 0.15, 0.4), out);
      chain(tone("sine", 330 * p, 0.3, t), env(0.12, t, 0.003, 0.15, 0.2, 0.1, 0.3), out);
    },
    boing(t, p, out) {
      const o = tone("sine", [140 * p, 620 * p], 0.3, t);
      lfo("sine", 18, 25 * p, o.frequency, t, 0.3);
      chain(o, env(0.45, t, 0.005, 0.15, 0.4, 0.1, 0.3), out);
      chain(tone("triangle", [280 * p, 1240 * p], 0.3, t), env(0.12, t, 0.005, 0.15, 0.3, 0.1, 0.3), out);
    },
    zip(t, p, out) {
      const g = env(0.3, t, 0.03, 0.2, 0.7, 0.15, 0.5);
      lfo("square", 28, 0.12, g.gain, t, 0.5);
      chain(noise(0.5, t), filter("bandpass", 900 * p, 3, t, 4200 * p, 0.5), g, out);
      chain(tone("sawtooth", [180 * p, 760 * p], 0.5, t), filter("lowpass", 1200 * p, 1, t), env(0.08, t, 0.03, 0.2, 0.6, 0.15, 0.5), out);
    },
    snap(t, p, out) {
      chain(noise(0.1, t), filter("highpass", 4000 * p, 1, t), env(0.5, t, 0.002, 0.05, 0.1, 0.03, 0.1), out);
      chain(tone("square", [2200 * p, 900 * p], 0.06, t), env(0.15, t, 0.002, 0.04, 0.1, 0.02, 0.06), out);
    },
    seesaw(t, p, out) {
      const creak = tone("sawtooth", [190 * p, 140 * p], 0.2, t);
      lfo("sine", 22, 12 * p, creak.frequency, t, 0.2);
      chain(creak, filter("bandpass", 600 * p, 4, t), env(0.25, t, 0.03, 0.1, 0.6, 0.05, 0.2), out);
      chain(tone("sine", [110 * p, 45 * p], 0.15, t + 0.2), env(0.6, t + 0.2, 0.004, 0.08, 0.2, 0.05, 0.15), out);
      chain(noise(0.08, t + 0.2), filter("lowpass", 500 * p, 1, t), env(0.25, t + 0.2, 0.003, 0.05, 0.2, 0.02, 0.08), out);
    },
    roll(t, p, out) {
      const g = env(0.5, t, 0.05, 0.2, 0.7, 0.2, 0.5);
      lfo("sine", 9, 0.2, g.gain, t, 0.5);
      chain(noise(0.5, t), filter("lowpass", 180 * p, 1, t), g, out);
      chain(tone("sine", 48 * p, 0.5, t), env(0.3, t, 0.05, 0.2, 0.6, 0.2, 0.5), out);
    },
    notice(t, p, out) {
      chain(tone("square", 440 * p, 0.1, t), filter("lowpass", 1500 * p, 1, t), env(0.12, t, 0.01, 0.05, 0.6, 0.03, 0.1), out);
      chain(tone("square", 466 * p, 0.1, t + 0.1), filter("lowpass", 1500 * p, 1, t), env(0.12, t + 0.1, 0.01, 0.05, 0.6, 0.03, 0.1), out);
    },
    door(t, p, out) {
      const base = 110 * p;
      [[1, 0.6, 1.5], [2.76, 0.25, 1.1], [5.4, 0.12, 0.7]].forEach((part) => {
        chain(tone("sine", base * part[0], part[2], t), env(part[1], t, 0.005, part[2] * 0.6, 0.15, part[2] * 0.3, part[2]), out);
      });
      chain(noise(0.05, t), filter("bandpass", 1500 * p, 2, t), env(0.2, t, 0.002, 0.03, 0.1, 0.02, 0.05), out);
    },
    death(t, p, out) {
      const moan = tone("sawtooth", [230 * p, 70 * p], 0.6, t);
      lfo("sine", 6, 8 * p, moan.frequency, t, 0.6);
      chain(moan, filter("lowpass", 900 * p, 2, t, 250 * p, 0.6), env(0.35, t, 0.03, 0.3, 0.5, 0.2, 0.6), out);
      chain(noise(0.15, t), filter("lowpass", 300 * p, 1, t), env(0.5, t, 0.004, 0.1, 0.2, 0.05, 0.15), out);
    },
    bosshit(t, p, out) {
      [[1, 0.35], [1.63, 0.25], [2.91, 0.15], [4.2, 0.08]].forEach((part) => {
        chain(tone("square", 320 * p * part[0], 0.5, t), filter("bandpass", 320 * p * part[0], 6, t), env(part[1], t, 0.003, 0.3, 0.15, 0.15, 0.5), out);
      });
      chain(noise(0.2, t), filter("highpass", 1500 * p, 1, t), env(0.5, t, 0.002, 0.12, 0.2, 0.06, 0.2), out);
    },
    bossdown(t, p, out) {
      const roar = tone("sawtooth", [170 * p, 38 * p], 1.2, t);
      lfo("sine", 7, 12 * p, roar.frequency, t, 1.2);
      chain(roar, filter("lowpass", 1200 * p, 3, t, 120 * p, 1.2), env(0.5, t, 0.05, 0.5, 0.5, 0.4, 1.2), out);
      const crackle = env(0.3, t, 0.05, 0.6, 0.4, 0.4, 1.2);
      lfo("square", 23, 0.15, crackle.gain, t, 1.2);
      chain(noise(1.2, t), filter("highpass", 1800 * p, 1, t), crackle, out);
    },
    star(t, p, out, opts) {
      const idx = Math.min(2, Math.max(0, opts.index | 0));
      const f = [880, 1108, 1318][idx] * p;
      chain(tone("sine", f, 0.3, t), env(0.35, t, 0.003, 0.15, 0.3, 0.1, 0.3), out);
      chain(tone("sine", f * 2, 0.25, t), env(0.12, t, 0.003, 0.12, 0.2, 0.08, 0.25), out);
      chain(tone("triangle", f * 1.5, 0.12, t + 0.03), env(0.08, t + 0.03, 0.003, 0.06, 0.2, 0.03, 0.12), out);
    },
    tap(t, p, out) {
      chain(tone("square", 1200 * p, 0.05, t), filter("lowpass", 2500 * p, 1, t), env(0.15, t, 0.002, 0.03, 0.2, 0.015, 0.05), out);
    },
    page(t, p, out) {
      chain(noise(0.15, t), filter("bandpass", 700 * p, 1.5, t, 2200 * p, 0.15), env(0.2, t, 0.02, 0.06, 0.5, 0.06, 0.15), out);
    },
    // Teryel asleep: a slow breath in, then a rumbling snore.
    snore(t, p, out) {
      chain(noise(0.6, t), filter("bandpass", 500 * p, 2, t, 900 * p, 0.6), env(0.08, t, 0.3, 0.2, 0.6, 0.15, 0.6), out);
      const rum = tone("sawtooth", [62 * p, 48 * p], 0.9, t + 0.7);
      lfo("square", 28, 10 * p, rum.frequency, t + 0.7, 0.9);
      chain(rum, filter("lowpass", 380 * p, 2, t + 0.7), env(0.35, t + 0.7, 0.15, 0.3, 0.7, 0.3, 0.9), out);
    },
    growl(t, p, out) {
      const g = tone("sawtooth", [95 * p, 70 * p], 0.8, t);
      lfo("sine", 11, 9 * p, g.frequency, t, 0.8);
      chain(g, filter("lowpass", 520 * p, 4, t, 260 * p, 0.8), env(0.35, t, 0.08, 0.3, 0.6, 0.25, 0.8), out);
      chain(noise(0.8, t), filter("bandpass", 300 * p, 3, t), env(0.12, t, 0.08, 0.3, 0.5, 0.25, 0.8), out);
    },
    // A clay pot knocking: short resonant tick.
    clink(t, p, out) {
      chain(tone("triangle", 620 * p, 0.12, t), filter("bandpass", 620 * p, 8, t), env(0.25, t, 0.002, 0.06, 0.2, 0.04, 0.12), out);
      chain(noise(0.03, t), filter("highpass", 2500 * p, 1, t), env(0.12, t, 0.001, 0.02, 0.2, 0.008, 0.03), out);
    },
    // A spirit's breath: noise through a slowly opening formant.
    whisper(t, p, out) {
      chain(noise(0.9, t), filter("bandpass", 900 * p, 6, t, 2400 * p, 0.9), env(0.12, t, 0.25, 0.3, 0.5, 0.3, 0.9), out);
      chain(noise(0.9, t + 0.1), filter("bandpass", 1600 * p, 8, t, 700 * p, 0.8), env(0.06, t + 0.1, 0.2, 0.3, 0.5, 0.3, 0.8), out);
    },
    crackle(t, p, out) {
      chain(noise(0.025, t), filter("bandpass", 2000 * p * (0.7 + Math.random() * 0.8), 2, t), env(0.18, t, 0.001, 0.015, 0.2, 0.005, 0.025), out);
    },
    // Old wood under strain: a slow, rough rising squeak.
    creak(t, p, out) {
      const o = tone("sawtooth", [140 * p, 210 * p], 0.7, t);
      lfo("square", 34, 18 * p, o.frequency, t, 0.7);
      chain(o, filter("bandpass", 700 * p, 6, t), env(0.07, t, 0.15, 0.25, 0.6, 0.2, 0.7), out);
    },
    // A raven's call: a rough, falling double croak.
    caw(t, p, out) {
      [0, 0.22].forEach((d) => {
        const o = tone("sawtooth", [720 * p, 420 * p], 0.18, t + d);
        lfo("square", 70, 60 * p, o.frequency, t + d, 0.18);
        chain(o, filter("bandpass", 1300 * p, 3, t + d), env(0.18, t + d, 0.01, 0.08, 0.5, 0.06, 0.18), out);
      });
    },
    // A rat: two quick, high, thin chirps.
    squeak(t, p, out) {
      [0, 0.09].forEach((d) => {
        const o = tone("square", [2600 * p, 3400 * p], 0.06, t + d);
        chain(o, filter("bandpass", 3000 * p, 5, t + d), env(0.08, t + d, 0.004, 0.03, 0.4, 0.02, 0.06), out);
      });
    },
    // A drop of oil into the vat: a soft falling plop.
    drip(t, p, out) {
      chain(tone("sine", [1300 * p, 380 * p], 0.09, t), env(0.16, t, 0.002, 0.04, 0.3, 0.04, 0.09), out);
    },
    lightning(t, p, out) {
      chain(noise(0.08, t), filter("highpass", 1800 * p, 1, t), env(0.9, t, 0.002, 0.05, 0.2, 0.02, 0.08), out);
      const rumble = env(0.6, t + 0.05, 0.05, 0.5, 0.5, 0.5, 1.15);
      lfo("sine", 4, 0.2, rumble.gain, t, 1.2);
      chain(noise(1.15, t + 0.05), filter("lowpass", 160 * p, 1, t, 60 * p, 1.2), rumble, out);
    },
  };
  const DURATION = {
    launch: 0.25, dash: 0.2, smash: 0.35, crush: 0.4, land: 0.12, web: 0.4, boing: 0.3, zip: 0.5,
    snap: 0.1, seesaw: 0.35, roll: 0.5, notice: 0.2, door: 1.5, death: 0.6, bosshit: 0.5,
    bossdown: 1.2, star: 0.3, tap: 0.05, page: 0.15, lightning: 1.2,
    snore: 1.6, growl: 0.8, clink: 0.12, whisper: 0.9, crackle: 0.03, creak: 0.7, caw: 0.45, squeak: 0.16, drip: 0.09,
  };

  function play(name, opts) {
    if (!ready() || !SOUNDS[name]) return;
    if ((playing[name] || 0) >= MAX_SAME) return;
    const o = opts || {};
    const volume = typeof o.volume === "number" ? Math.min(1, Math.max(0, o.volume)) : 1;
    const pitch = typeof o.pitch === "number" && o.pitch > 0 ? o.pitch : 1;
    const out = ctx.createGain();
    out.gain.value = volume;
    out.connect(master);
    const t = ctx.currentTime;
    SOUNDS[name](t, pitch, out, o);
    playing[name] = (playing[name] || 0) + 1;
    // Sources stop themselves; dropping the output gain lets the whole graph be collected.
    setTimeout(() => {
      out.disconnect();
      playing[name] -= 1;
    }, DURATION[name] * 1000 + 100);
  }

  // ---------------------------------------------------------------- ambience
  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  // Indoors the wind is a distant draught under the door; outside it is the gorge.
  function windSwell() {
    if (!amb.on) return;
    const t = ctx.currentTime;
    const len = rand(2, 4);
    const outside = amb.place === "gorge" || amb.place === "roofs";
    amb.filter.frequency.setTargetAtTime(outside ? rand(250, 700) : rand(160, 280), t, len * 0.4);
    amb.src.gainParam.setTargetAtTime(outside ? rand(0.03, 0.09) : rand(0.008, 0.02), t, len * 0.4);
    clearTimeout(amb.windT);
    amb.windT = setTimeout(windSwell, len * 1000);
  }

  // Small sounds of the place, scheduled at random: fire pops, loom creaks, whispers.
  function placeTick() {
    if (!amb.on) return;
    let next = 1.5;
    // Nothing is scheduled while the context is not running (unlock pending, iOS interrupt).
    const live = !muted && ctx.state === "running";
    if (amb.place === "hearth" || amb.place === "kitchen") {
      if (live) {
        const out = ctx.createGain();
        out.gain.value = amb.place === "hearth" ? 0.6 : 0.3;
        out.connect(amb.gain);
        SOUNDS.crackle(ctx.currentTime, 1, out, {});
        setTimeout(() => out.disconnect(), 200);
      }
      next = rand(0.08, 0.6);
    } else if (amb.place === "loom") {
      if (live) {
        const out = ctx.createGain();
        out.gain.value = 0.6;
        out.connect(amb.gain);
        SOUNDS.creak(ctx.currentTime, rand(0.8, 1.2), out, {});
        setTimeout(() => out.disconnect(), 900);
      }
      next = rand(4, 8);
    } else if (amb.place === "press") {
      // The wheel groans on its axle; oil drips into the vat between turns.
      if (live) {
        const out = ctx.createGain();
        out.gain.value = 0.4;
        out.connect(amb.gain);
        if (Math.random() < 0.45) {
          SOUNDS.creak(ctx.currentTime, rand(0.6, 0.8), out, {});
          setTimeout(() => out.disconnect(), 900);
        } else {
          SOUNDS.drip(ctx.currentTime, rand(0.9, 1.2), out, {});
          setTimeout(() => out.disconnect(), 200);
        }
      }
      next = rand(2, 5);
    } else if (amb.place === "roofs") {
      if (live && Math.random() < 0.6) {
        const out = ctx.createGain();
        out.gain.value = 0.25;
        out.connect(amb.gain);
        SOUNDS.caw(ctx.currentTime, rand(0.85, 1.1), out, {});
        setTimeout(() => out.disconnect(), 600);
      }
      next = rand(6, 12);
    } else if (amb.place === "gorge") {
      if (live && Math.random() < 0.5) {
        const out = ctx.createGain();
        out.gain.value = 0.35;
        out.connect(amb.gain);
        SOUNDS.whisper(ctx.currentTime, rand(0.7, 1.1), out, {});
        setTimeout(() => out.disconnect(), 1100);
      }
      next = rand(6, 11);
    }
    amb.tickT = setTimeout(placeTick, next * 1000);
  }

  // The wind changes at once when the place changes, not at the next swell.
  function setPlace(place) {
    if (place === amb.place) return;
    amb.place = place;
    if (amb.on) windSwell();
  }

  // Two soft sine notes with gentle vibrato, routed through the ambience gain.
  function owl() {
    if (!amb.on) return;
    if (amb.place !== "gorge" && amb.place !== "roofs") {
      amb.owlT = setTimeout(owl, rand(9, 15) * 1000);
      return;
    }
    const t = ctx.currentTime;
    const notes = [[330, 0.45, 0], [290, 0.6, 0.5]];
    notes.forEach((n) => {
      const o = tone("sine", n[0], n[1], t + n[2]);
      lfo("sine", 5.5, 4, o.frequency, t + n[2], n[1]);
      chain(o, env(0.06, t + n[2], 0.08, 0.15, 0.7, 0.2, n[1]), amb.gain);
    });
    amb.owlT = setTimeout(owl, rand(9, 15) * 1000);
  }

  function ambience(on) {
    if (!ctx) return;
    on = !!on;
    if (on === amb.on) return;
    amb.on = on;
    const t = ctx.currentTime;
    if (on) {
      amb.gain = ctx.createGain();
      amb.gain.gain.setValueAtTime(0.0001, t);
      amb.gain.gain.linearRampToValueAtTime(1, t + 1);
      amb.gain.connect(master);
      amb.filter = filter("lowpass", 400, 0.8, t);
      const wind = ctx.createGain();
      wind.gain.value = 0.05;
      amb.src = noise(0, t, true);
      amb.src.gainParam = wind.gain;
      chain(amb.src, amb.filter, wind, amb.gain);
      windSwell();
      placeTick();
      amb.owlT = setTimeout(owl, rand(4, 8) * 1000);
    } else {
      clearTimeout(amb.windT);
      clearTimeout(amb.owlT);
      clearTimeout(amb.tickT);
      const g = amb.gain;
      const src = amb.src;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0.0001, t + 1);
      src.stop(t + 1.05);
      setTimeout(() => g.disconnect(), 1100);
      amb.gain = null;
      amb.src = null;
      amb.filter = null;
    }
  }

  function setMuted(value) {
    muted = !!value;
    if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.02);
  }

  globalThis.HNSfx = {
    unlock,
    setMuted,
    ambience,
    setPlace,
    play,
    get muted() {
      return muted;
    },
  };
})();
