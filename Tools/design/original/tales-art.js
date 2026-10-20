/* Art for the tales of Mqidec: the five places (Teryel's kitchen, the loom room, the
 * Iron Gates, the rooftops, the olive press), the hunters of each (pots, spiders,
 * ijenniwen, ravens, rats), Teryel herself, the
 * wooden house door, and the story scenes (hearth, tale pictures) with speaker
 * portraits. Everything is drawn in code in the manner of the original art: dark
 * silhouettes, glowing eyes, soft rim light. Plugs into art.js drawStage as view.theme. */
(function (root) {
  "use strict";
  const Art = root.HNOriginalArt;
  const { glow, centred, thread, silkWeb, oilLamp, img, bandTriangles, bandLozenges, bandZigzag } = Art;
  const TAU = Math.PI * 2;
  const CLAY = "#a5552f",
    CLAY_LIGHT = "#cf7a45",
    CLAY_DARK = "#5e2a15",
    INK = "#17110c",
    OCHRE = "#d9a441",
    RED = "#9e2b22",
    CREAM = "#e9dcc0";

  // Deterministic pseudo-random for decor, so scenes do not flicker between frames.
  const rnd = (i) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  /* ---------------- Backdrops ---------------- */
  function backdrop(c, w, h, progress, theme, t, X, Y, S, height) {
    if (theme === "kitchen") kitchenBack(c, w, h, t, Y, S, height);
    else if (theme === "loom") loomBack(c, w, h, t, Y, S, height);
    else if (theme === "roofs") roofsBack(c, w, h, t, S, progress);
    else if (theme === "press") pressBack(c, w, h, t, Y, S, height);
    else if (theme === "spring") springBack(c, w, h, t, Y, S, height, progress);
    else gorgeBack(c, w, h, t, Y, S, progress);
  }

  function plaster(c, w, h, base, dark) {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, dark);
    g.addColorStop(1, base);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    // Earth plaster: faint warm mottling, never strong enough to read as shapes.
    c.save();
    c.globalAlpha = 0.035;
    for (let i = 0; i < 90; i++) {
      c.fillStyle = rnd(i) > 0.5 ? "#000" : "#c08a5a";
      c.beginPath();
      c.ellipse(rnd(i + 1) * w, rnd(i + 2) * h, 8 + rnd(i + 3) * 24, 5 + rnd(i + 4) * 12, rnd(i) * 3, 0, TAU);
      c.fill();
    }
    c.restore();
  }

  function kitchenBack(c, w, h, t, Y, S, height) {
    plaster(c, w, h, "#3a2416", "#140c07");
    // Ceiling beams near the top of the stage.
    c.fillStyle = "#1c120a";
    for (let i = 0; i < 4; i++) {
      const y = Y(height + 2 - i * 0.7);
      if (y > -40 && y < h) c.fillRect(0, y, w, S * 0.35);
    }
    // The wall of grain jars (ikufan), behind the play, drifting slower than the world.
    const base = Y(0) * 0.6 + h * 0.4;
    for (let i = 0; i < 5; i++) {
      const x = w * (0.1 + i * 0.2);
      const jh = S * (3.2 + rnd(i) * 1.4);
      bigJar(c, x, base, S * 1.9, jh, 0.45);
    }
    // Hearth glow from the left, flickering.
    const f = 0.8 + Math.sin(t * 7) * 0.06 + Math.sin(t * 13) * 0.04;
    glow(c, -w * 0.05, Y(1), w * 0.9, `rgba(255,140,60,${0.28 * f})`);
    vignette(c, w, h, 0.55);
  }

  function bigJar(c, x, base, wd, ht, alpha) {
    c.save();
    c.globalAlpha *= alpha;
    c.fillStyle = "#4a2a18";
    c.beginPath();
    c.moveTo(x - wd * 0.22, base - ht);
    c.quadraticCurveTo(x - wd * 0.6, base - ht * 0.7, x - wd * 0.42, base);
    c.lineTo(x + wd * 0.42, base);
    c.quadraticCurveTo(x + wd * 0.6, base - ht * 0.7, x + wd * 0.22, base - ht);
    c.closePath();
    c.fill();
    c.globalAlpha *= 0.8;
    bandTriangles(c, x - wd * 0.45, base - ht * 0.55, x + wd * 0.45, base - ht * 0.55, wd * 0.09, "#1d0f08", "rgba(0,0,0,0)");
    bandZigzag(c, x - wd * 0.42, base - ht * 0.42, x + wd * 0.42, base - ht * 0.42, wd * 0.08, "#6b3a20");
    c.restore();
  }

  function loomBack(c, w, h, t, Y, S, height) {
    plaster(c, w, h, "#2a1a24", "#0e0910");
    // The great vertical loom in the background: two uprights, beams, warp threads,
    // and a woven band at the bottom in the colours of a Kabyle blanket.
    const left = w * 0.12,
      right = w * 0.88;
    const top = Math.max(-40, Y(height + 1)),
      bottom = Y(0) * 0.7 + h * 0.3;
    c.fillStyle = "#1a0f0a";
    c.fillRect(left - S * 0.3, top, S * 0.3, bottom - top);
    c.fillRect(right, top, S * 0.3, bottom - top);
    c.fillRect(left - S * 0.4, bottom - S * 0.4, right - left + S * 0.8, S * 0.4);
    c.save();
    c.strokeStyle = "rgba(220,205,180,0.18)";
    c.lineWidth = 1;
    for (let x = left; x <= right; x += S * 0.18) {
      c.beginPath();
      c.moveTo(x, top);
      c.lineTo(x, bottom);
      c.stroke();
    }
    c.restore();
    const bandH = S * 2.2;
    c.save();
    c.globalAlpha = 0.55;
    c.fillStyle = "#3d1c14";
    c.fillRect(left, bottom - bandH - S * 0.4, right - left, bandH);
    bandTriangles(c, left, bottom - bandH - S * 0.4, right, bottom - bandH - S * 0.4, S * 0.35, "#8a2a20", "#c99a3a");
    bandLozenges(c, left, bottom - bandH * 0.55 - S * 0.4, right, bottom - bandH * 0.55 - S * 0.4, S * 0.3, "#d9c49a");
    bandZigzag(c, left, bottom - S * 0.75, right, bottom - S * 0.75, S * 0.25, "#111");
    c.restore();
    // Loose threads crossing the room, swaying.
    c.save();
    c.strokeStyle = "rgba(235,230,215,0.13)";
    c.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y1 = h * rnd(i + 20),
        y2 = h * rnd(i + 30);
      c.beginPath();
      c.moveTo(0, y1);
      c.quadraticCurveTo(w / 2, (y1 + y2) / 2 + Math.sin(t * 0.7 + i) * 10, w, y2);
      c.stroke();
    }
    c.restore();
    glow(c, w * 0.5, h * 0.25, w * 0.6, "rgba(255,200,120,0.08)");
    vignette(c, w, h, 0.6);
  }

  function gorgeBack(c, w, h, t, Y, S, progress) {
    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#0b1426");
    sky.addColorStop(1, "#1c2a3a");
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      c.fillStyle = `rgba(230,236,255,${0.3 + rnd(i) * 0.5})`;
      c.fillRect(rnd(i + 7) * w, rnd(i + 9) * h * 0.6, 1.4, 1.4);
    }
    const mx = w * 0.72,
      my = h * 0.16 + progress * h * 0.05;
    glow(c, mx, my, w * 0.25, "rgba(220,230,255,0.2)");
    c.fillStyle = "rgba(235,240,252,0.9)";
    c.beginPath();
    c.arc(mx, my, w * 0.05, 0, TAU);
    c.fill();
    // Far ridges of the Bibans.
    ridge(c, w, h, h * 0.55 + progress * 40, "#162030", 0.5, 3);
    ridge(c, w, h, h * 0.66 + progress * 60, "#101826", 0.7, 7);
    // Cliff walls on both sides. Each jag belongs to a world height, so the rock
    // scrolls with the stage instead of changing shape as the camera moves.
    const step = 1.2;
    const worldAt = (sy) => (Y(0) - sy) / S;
    const k0 = Math.floor(worldAt(h) / step) - 1,
      k1 = Math.ceil(worldAt(0) / step) + 1;
    // A zero-size canvas (layout not finished) would make this loop endless.
    if (!(S > 0) || !Number.isFinite(k0) || !Number.isFinite(k1) || k1 - k0 > 500) return;
    for (const side of [-1, 1]) {
      c.save();
      c.fillStyle = "#0a0f17";
      c.beginPath();
      const x0 = side < 0 ? 0 : w;
      c.moveTo(x0, Y(k0 * step));
      for (let k = k0; k <= k1; k++) {
        const jag = (rnd(k * 7 + (side > 0 ? 50 : 70)) * 0.5 + 0.3) * S * 1.4;
        c.lineTo(x0 + side * -jag, Y(k * step));
      }
      c.lineTo(x0, Y(k1 * step));
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(160,185,255,0.25)";
      c.lineWidth = 2;
      c.stroke();
      c.restore();
    }
    // Mist over the river.
    const mist = c.createLinearGradient(0, Y(0) - S * 3, 0, Y(0) + S);
    mist.addColorStop(0, "rgba(180,195,220,0)");
    mist.addColorStop(1, "rgba(180,195,220,0.22)");
    c.fillStyle = mist;
    c.fillRect(0, Y(0) - S * 3, w, S * 4);
    vignette(c, w, h, 0.45);
  }

  function ridge(c, w, h, base, color, amp, seed) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, h);
    for (let i = 0; i <= 10; i++) c.lineTo((i / 10) * w, base - rnd(i + seed) * h * 0.12 * amp);
    c.lineTo(w, h);
    c.closePath();
    c.fill();
  }

  function vignette(c, w, h, strength) {
    const g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${strength})`);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  }

  /* ---------------- The rooftops of Lqelɛa ---------------- */
  const TILE = "#8a3b22",
    TILE_LIGHT = "#b5573a",
    TILE_DARK = "#4a1d10";

  function roofsBack(c, w, h, t, S, progress) {
    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#0d0f24");
    sky.addColorStop(1, "#2a1f33");
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) {
      c.fillStyle = `rgba(235,236,255,${0.25 + rnd(i + 90) * 0.55})`;
      c.fillRect(rnd(i + 91) * w, rnd(i + 92) * h * 0.55, 1.3, 1.3);
    }
    const mx = w * 0.22,
      my = h * 0.13 + progress * h * 0.04;
    glow(c, mx, my, w * 0.28, "rgba(230,225,255,0.18)");
    c.fillStyle = "rgba(240,238,250,0.92)";
    c.beginPath();
    c.arc(mx, my, w * 0.055, 0, TAU);
    c.fill();
    ridge(c, w, h, h * 0.52 + progress * 30, "#15132a", 0.6, 13);
    // Two rows of houses of the citadel, stacked up the slope, windows lit for Yennayer.
    citadelRow(c, w, h * 0.72 + progress * 50, S * 1.6, "#120f1c", 21, t, 0.55);
    citadelRow(c, w, h * 0.88 + progress * 80, S * 2.3, "#0b0911", 37, t, 0.8);
    vignette(c, w, h, 0.45);
  }

  function citadelRow(c, w, base, size, color, seed, t, lit) {
    for (let i = -1; i < 8; i++) {
      const hw = size * (1 + rnd(seed + i) * 0.6),
        hx = (i / 7) * w + rnd(seed + i + 3) * size * 0.4,
        hh = size * (0.7 + rnd(seed + i + 5) * 0.5),
        top = base - hh - rnd(seed + i + 7) * size * 0.6;
      c.fillStyle = color;
      c.fillRect(hx - hw / 2, top, hw, base - top + size);
      c.fillStyle = TILE_DARK;
      c.beginPath();
      c.moveTo(hx - hw * 0.58, top);
      c.lineTo(hx, top - hh * 0.35);
      c.lineTo(hx + hw * 0.58, top);
      c.closePath();
      c.fill();
      if (rnd(seed + i + 11) < 0.7) {
        const wx = hx + (rnd(seed + i + 13) - 0.5) * hw * 0.5,
          wy = top + hh * 0.35;
        const f = 0.85 + Math.sin(t * 5 + i) * 0.1;
        glow(c, wx, wy, size * 0.35, `rgba(255,190,90,${0.3 * lit * f})`);
        c.fillStyle = `rgba(255,205,120,${lit})`;
        c.fillRect(wx - size * 0.06, wy - size * 0.08, size * 0.12, size * 0.16);
      }
    }
  }

  // A sloped roof of loose tiles: a terracotta band under the walking line, rows of
  // rounded tiles, a pale ridge cap on the top edge.
  function slope(c, p, X, Y, S, t) {
    const x1 = X(p.x1),
      y1 = Y(p.y1),
      x2 = X(p.x2),
      y2 = Y(p.y2);
    const th = S * 0.5;
    c.save();
    const g = c.createLinearGradient(0, Math.min(y1, y2), 0, Math.max(y1, y2) + th);
    g.addColorStop(0, TILE_LIGHT);
    g.addColorStop(1, TILE_DARK);
    c.fillStyle = g;
    c.shadowColor = "rgba(255,150,100,0.3)";
    c.shadowBlur = 8;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.lineTo(x2, y2 + th);
    c.lineTo(x1, y1 + th);
    c.closePath();
    c.fill();
    c.shadowBlur = 0;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(2, Math.round(len / (S * 0.32)));
    c.strokeStyle = "rgba(40,12,6,0.65)";
    c.lineWidth = 1.2;
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < n; i++) {
        const u = (i + (row % 2) * 0.5) / n;
        if (u > 1) continue;
        const cx = x1 + (x2 - x1) * u,
          cy = y1 + (y2 - y1) * u + th * (0.25 + row * 0.28);
        c.beginPath();
        c.arc(cx, cy, S * 0.15, Math.PI, TAU);
        c.stroke();
      }
    }
    c.strokeStyle = "rgba(240,200,170,0.55)";
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.restore();
  }

  // A pile of loose tiles, slightly askew; in the press, the great beam; at the spring,
  // a squared stone.
  function stack(c, x, top, w, h, t, theme) {
    if (theme === "press") {
      pressBeam(c, x, top, w, h, t);
      return;
    }
    if (theme === "spring") {
      stoneBlock(c, x, top, w, h);
      return;
    }
    c.save();
    c.translate(x, top + h);
    c.rotate(Math.sin(t * 2 + x) * 0.015);
    for (let i = 0; i < 4; i++) {
      const tw = w * (0.95 - i * 0.12),
        ty = h * 0.25 * i;
      c.fillStyle = i % 2 ? TILE : TILE_LIGHT;
      c.strokeStyle = TILE_DARK;
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(-tw / 2 + (i % 2 ? 2 : -2), -ty - h * 0.25, tw, h * 0.25, h * 0.08);
      c.fill();
      c.stroke();
    }
    c.restore();
  }

  // Teryel's ravens: black, glowing-eyed, wings beating faster on the hunt.
  function raven(c, x, y, size, t, mood, extra = {}) {
    const face = (extra.vx || 0) < 0 ? -1 : 1;
    const flap = mood === "sleep" ? 0 : Math.sin(t * (mood === "chase" ? 18 : 7) + x);
    c.save();
    c.translate(x, y);
    c.scale(face, 1);
    glow(c, 0, 0, size * 0.9, mood === "chase" ? "rgba(255,80,60,0.22)" : "rgba(180,170,255,0.12)");
    c.fillStyle = "#08070a";
    c.shadowColor = "rgba(170,180,255,0.5)";
    c.shadowBlur = size * 0.2;
    // Wings.
    for (const side of [-1, 1]) {
      c.beginPath();
      c.moveTo(-size * 0.05, -size * 0.05);
      const tipY = mood === "sleep" ? size * 0.1 : -size * (0.15 + 0.45 * flap * side * 0.5 + 0.25);
      c.quadraticCurveTo(-size * 0.45, tipY - size * 0.1, -size * 0.7, tipY + size * 0.05);
      c.quadraticCurveTo(-size * 0.4, size * 0.05, size * 0.05, size * 0.12);
      c.closePath();
      c.fill();
    }
    // Body, tail, head, beak.
    c.beginPath();
    c.ellipse(0, size * 0.05, size * 0.32, size * 0.2, -0.15, 0, TAU);
    c.fill();
    c.beginPath();
    c.moveTo(-size * 0.25, size * 0.08);
    c.lineTo(-size * 0.55, size * 0.2);
    c.lineTo(-size * 0.5, size * 0.02);
    c.closePath();
    c.fill();
    c.beginPath();
    c.arc(size * 0.28, -size * 0.12, size * 0.15, 0, TAU);
    c.fill();
    c.shadowBlur = 0;
    c.fillStyle = "#3a3632";
    c.beginPath();
    c.moveTo(size * 0.4, -size * 0.15);
    c.lineTo(size * 0.62, -size * 0.08);
    c.lineTo(size * 0.4, -size * 0.06);
    c.closePath();
    c.fill();
    c.restore();
    eyes(c, x + face * size * 0.31, y - size * 0.14, 0.001, size * 0.55, mood, t, "rgba(255,120,60,A)");
  }

  // The Yennayer bread: a round flat loaf, scored, golden.
  function bread(c, x, y, r) {
    c.save();
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, "#f2c77a");
    g.addColorStop(1, "#a8692c");
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(x, y, r, r * 0.55, 0, 0, TAU);
    c.fill();
    c.strokeStyle = "rgba(90,45,15,0.6)";
    c.lineWidth = Math.max(1, r * 0.06);
    for (let i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(x - r * 0.6, y + i * r * 0.18);
      c.lineTo(x + r * 0.6, y + i * r * 0.18);
      c.stroke();
    }
    glow(c, x, y, r * 1.6, "rgba(255,200,120,0.18)");
    c.restore();
  }

  /* ---------------- The olive press (tamɛeṣert) ---------------- */
  const OLIVE_WOOD = "#7a5530",
    OLIVE_DARK = "#2a1a0c",
    OIL = "rgba(196,170,60,";

  // Dry-stone walls, a low arch, the great screw press and the vats, all in lamplight.
  function pressBack(c, w, h, t, Y, S, height) {
    plaster(c, w, h, "#2d2418", "#0f0b07");
    // Dry-stone courses: rows of flat stones, faint.
    c.save();
    c.globalAlpha = 0.18;
    c.strokeStyle = "#000";
    c.lineWidth = 1;
    // Rows are counted from the world's floor line, so the joints scroll with the stage.
    const row = S * 0.55;
    const origin = Y(0);
    const shift = (((origin - h) % row) + row) % row;
    for (let y = shift - row; y < h; y += row) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
      const k = Math.round((y - origin) / row);
      for (let x = Math.abs(k % 2) * S * 0.45, j = 0; x < w; x += S * (0.8 + rnd(k * 31 + j) * 0.5), j++) {
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x, y + row);
        c.stroke();
      }
    }
    c.restore();
    // The screw press in the back: two thick posts, the crossbeam, the wooden screw.
    const base = Y(0) * 0.55 + h * 0.45,
      px = w * 0.72,
      top = Math.max(-60, Y(Math.min(height, 14)) * 0.6);
    c.fillStyle = "#170f08";
    c.fillRect(px - S * 1.6, top, S * 0.45, base - top);
    c.fillRect(px + S * 1.15, top, S * 0.45, base - top);
    c.fillRect(px - S * 1.9, top, S * 3.8, S * 0.55);
    c.fillStyle = "#1e140b";
    c.fillRect(px - S * 0.18, top + S * 0.55, S * 0.36, (base - top) * 0.55);
    c.strokeStyle = "rgba(0,0,0,0.6)";
    c.lineWidth = 2;
    for (let y = top + S * 0.7; y < top + (base - top) * 0.6; y += S * 0.22) {
      c.beginPath();
      c.moveTo(px - S * 0.18, y);
      c.lineTo(px + S * 0.18, y + S * 0.12);
      c.stroke();
    }
    // Stacked scourtins (the woven olive mats) under the screw.
    for (let i = 0; i < 6; i++) {
      c.fillStyle = i % 2 ? "#2b1d10" : "#33230f";
      c.beginPath();
      c.ellipse(px, base - S * 0.25 - i * S * 0.18, S * 1.05, S * 0.12, 0, 0, TAU);
      c.fill();
    }
    // Oil jars along the wall, drifting slower than the world.
    for (let i = 0; i < 3; i++) bigJar(c, w * (0.1 + i * 0.17), base + S * 0.2, S * 1.5, S * (2.4 + rnd(i + 7) * 0.8), 0.4);
    // A hanging oil lamp on the left, flickering.
    const f = 0.85 + Math.sin(t * 8) * 0.06 + Math.sin(t * 15) * 0.04;
    glow(c, w * 0.2, h * 0.3, w * 0.75, `rgba(255,170,70,${0.22 * f})`);
    glow(c, w * 0.85, h * 0.85, w * 0.5, "rgba(190,170,60,0.08)");
    vignette(c, w, h, 0.6);
  }

  // A film of spilt oil on a beam: a golden sheen with a moving highlight, drips at the ends.
  function oil(c, x, top, w, t) {
    c.save();
    const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    const k = (t * 0.25) % 1;
    g.addColorStop(0, OIL + "0.55)");
    g.addColorStop(Math.max(0, k - 0.12), OIL + "0.55)");
    g.addColorStop(k, "rgba(255,240,160,0.9)");
    g.addColorStop(Math.min(1, k + 0.12), OIL + "0.55)");
    g.addColorStop(1, OIL + "0.55)");
    c.fillStyle = g;
    c.beginPath();
    c.roundRect(x - w / 2 + 2, top - 3, w - 4, 4, 2);
    c.fill();
    // Puddles along the top.
    c.fillStyle = OIL + "0.45)";
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.ellipse(x - w * 0.3 + i * w * 0.3, top - 1, w * 0.09, 2.2, 0, 0, TAU);
      c.fill();
    }
    // Drips falling from both ends.
    for (const side of [-1, 1]) {
      const life = (t * 0.7 + (side > 0 ? 0.5 : 0)) % 1;
      const dx = x + side * (w / 2 - 3);
      c.fillStyle = OIL + `${0.85 * (1 - life)})`;
      c.beginPath();
      c.ellipse(dx, top + 6 + life * w * 0.35, 2, 3, 0, 0, TAU);
      c.fill();
    }
    glow(c, x, top, w * 0.4, "rgba(220,200,90,0.12)");
    c.restore();
  }

  // The press wheel: a thick rim, spokes to each plank's hanger, an iron-bound hub.
  function wheel(c, cx, cy, r, planks, S, t) {
    c.save();
    c.strokeStyle = "#4a321b";
    c.lineWidth = S * 0.22;
    c.beginPath();
    c.arc(cx, cy, r, 0, TAU);
    c.stroke();
    c.strokeStyle = "rgba(255,190,110,0.18)";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(cx, cy, r - S * 0.11, Math.PI * 1.1, Math.PI * 1.7);
    c.stroke();
    // Spokes follow the planks; each plank hangs level from a short iron hook.
    c.lineCap = "round";
    for (const p of planks) {
      c.strokeStyle = OLIVE_WOOD;
      c.lineWidth = S * 0.16;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(p.x, p.y);
      c.stroke();
      c.strokeStyle = "#555";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x, p.y + S * 0.12);
      c.stroke();
    }
    c.fillStyle = OLIVE_DARK;
    c.beginPath();
    c.arc(cx, cy, S * 0.42, 0, TAU);
    c.fill();
    c.strokeStyle = "#6b6560";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(cx, cy, S * 0.3, 0, TAU);
    c.stroke();
    c.restore();
  }

  // The great press beam: a squared olive trunk with iron bands and an end grain.
  function pressBeam(c, x, top, w, h, t) {
    c.save();
    c.translate(x, top + h);
    const g = c.createLinearGradient(0, -h, 0, 0);
    g.addColorStop(0, "#7a5532");
    g.addColorStop(1, OLIVE_DARK);
    c.fillStyle = g;
    c.shadowColor = "rgba(255,180,110,0.3)";
    c.shadowBlur = 8;
    c.beginPath();
    c.roundRect(-w / 2, -h, w, h, h * 0.25);
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(30,16,6,0.6)";
    c.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      c.beginPath();
      c.moveTo(-w / 2 + 4, -h + (h * i) / 3);
      c.lineTo(w / 2 - 4, -h + (h * i) / 3 + Math.sin(i) * 2);
      c.stroke();
    }
    c.fillStyle = "#4a4643";
    for (const bx of [-0.32, 0.32]) c.fillRect(bx * w - 3, -h, 6, h);
    c.strokeStyle = "rgba(255,210,150,0.35)";
    c.beginPath();
    c.ellipse(w / 2 - h * 0.2, -h / 2, h * 0.18, h * 0.38, 0, 0, TAU);
    c.stroke();
    c.restore();
  }

  // Teryel's rats: low, long-tailed, eyes like embers; they scurry on the hunt.
  function rat(c, x, y, size, t, mood, extra = {}) {
    const face = extra.face || ((extra.vx || 0) < -0.05 ? -1 : 1);
    const run = mood === "chase" || mood === "hunt" ? Math.sin(t * 22 + x) : 0;
    const asleep = mood === "sleep";
    c.save();
    c.translate(x, y + size * 0.12);
    c.scale(face, 1);
    glow(c, 0, 0, size * 0.8, mood === "chase" ? "rgba(255,90,50,0.2)" : "rgba(200,170,120,0.1)");
    c.fillStyle = "#1a1512";
    c.shadowColor = "rgba(255,190,130,0.45)";
    c.shadowBlur = size * 0.18;
    // Tail: a long curve, curled round the body when asleep.
    c.strokeStyle = "#2c2420";
    c.lineWidth = Math.max(1.5, size * 0.05);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-size * 0.3, size * 0.05);
    if (asleep) c.quadraticCurveTo(-size * 0.2, size * 0.35, size * 0.25, size * 0.22);
    else c.quadraticCurveTo(-size * 0.6, -size * 0.1 + run * size * 0.08, -size * 0.85, size * 0.12);
    c.stroke();
    // Body and head.
    c.beginPath();
    c.ellipse(0, 0, size * (asleep ? 0.3 : 0.36), size * (asleep ? 0.2 : 0.17), 0, 0, TAU);
    c.fill();
    c.beginPath();
    c.moveTo(size * 0.18, -size * 0.12);
    c.quadraticCurveTo(size * 0.42, -size * 0.12, size * 0.52, size * 0.02);
    c.quadraticCurveTo(size * 0.38, size * 0.1, size * 0.2, size * 0.08);
    c.closePath();
    c.fill();
    // Ears.
    c.fillStyle = "#3a2a26";
    c.beginPath();
    c.arc(size * 0.22, -size * 0.15, size * 0.08, 0, TAU);
    c.fill();
    c.shadowBlur = 0;
    // Legs, scurrying.
    if (!asleep) {
      c.strokeStyle = "#1a1512";
      c.lineWidth = Math.max(1, size * 0.04);
      for (const [lx, ph] of [[-0.18, 0], [0.16, Math.PI]]) {
        c.beginPath();
        c.moveTo(size * lx, size * 0.12);
        c.lineTo(size * lx + Math.sin(t * 22 + ph) * size * 0.08, size * 0.24);
        c.stroke();
      }
    }
    c.fillStyle = "#c98a8a";
    c.beginPath();
    c.arc(size * 0.52, size * 0.02, size * 0.03, 0, TAU);
    c.fill();
    c.restore();
    eyes(c, x + face * size * 0.34, y + size * 0.06, 0.001, size * 0.42, mood, t, "rgba(255,110,50,A)");
  }

  // Jida's tabzimt: a round silver brooch, coral at the heart, a ring of enamel,
  // a beaded rim and coral drops hanging on little chains.
  function tabzimt(c, x, y, r, t) {
    c.save();
    glow(c, x, y, r * 2.2, "rgba(230,235,255,0.18)");
    for (let i = -2; i <= 2; i++) {
      const dx = x + i * r * 0.32,
        len = r * (0.6 + (2 - Math.abs(i)) * 0.12);
      c.strokeStyle = "#b9bcc4";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(dx, y + r * 0.85);
      c.lineTo(dx + Math.sin(t * 2 + i) * 1.5, y + r * 0.85 + len);
      c.stroke();
      c.fillStyle = "#c0392b";
      c.beginPath();
      c.ellipse(dx + Math.sin(t * 2 + i) * 1.5, y + r * 0.9 + len, r * 0.07, r * 0.11, 0, 0, TAU);
      c.fill();
    }
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, "#f4f6fa");
    g.addColorStop(1, "#8c9099");
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fill();
    // Enamel ring in six segments: blue, green, yellow, as on Kabyle silver.
    const colors = ["#1f5fa8", "#2f8a4a", "#e0b23a"];
    for (let i = 0; i < 6; i++) {
      c.fillStyle = colors[i % 3];
      c.beginPath();
      c.arc(x, y, r * 0.72, (i * TAU) / 6 + 0.08, ((i + 1) * TAU) / 6 - 0.08);
      c.arc(x, y, r * 0.48, ((i + 1) * TAU) / 6 - 0.08, (i * TAU) / 6 + 0.08, true);
      c.closePath();
      c.fill();
    }
    c.fillStyle = "#c0392b";
    c.beginPath();
    c.arc(x, y, r * 0.3, 0, TAU);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.6)";
    c.beginPath();
    c.arc(x - r * 0.1, y - r * 0.1, r * 0.08, 0, TAU);
    c.fill();
    c.fillStyle = "#dfe2e8";
    for (let i = 0; i < 16; i++) {
      const a = (i * TAU) / 16;
      c.beginPath();
      c.arc(x + Math.cos(a) * r * 0.88, y + Math.sin(a) * r * 0.88, r * 0.07, 0, TAU);
      c.fill();
    }
    // A glint that runs round the rim.
    const a = t * 1.5;
    glow(c, x + Math.cos(a) * r * 0.88, y + Math.sin(a) * r * 0.88, r * 0.35, "rgba(255,255,255,0.7)");
    c.restore();
  }

  /* ---------------- The spring of Ath Abbas (tala) ---------------- */
  const STONE = "#776a56",
    STONE_LIGHT = "#a6967b",
    STONE_DARK = "#2c251d",
    WATER = "rgba(70,125,165,",
    FOAM = "rgba(236,244,250,",
    FROG = "#17220f",
    FROG_BELLY = "#5f6e3c";
  // How far the bucket walls rise above the floor he stands on, in world units.
  const RIM = 0.32;

  // A hot summer night over a dry ravine: the moon in a haze, the Bibans, dry-stone
  // terraces up both sides, the fig tree, heat shimmering over the cracked bed.
  // weather.rain brings the clouds down over the moon and puts out the stars.
  function springBack(c, w, h, t, Y, S, height, progress, weather = {}) {
    const rain = Boolean(weather.rain);
    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, rain ? "#0b0f17" : "#0a0d1f");
    sky.addColorStop(0.6, rain ? "#171c25" : "#1d1a2c");
    sky.addColorStop(1, rain ? "#20232a" : "#3a2a26");
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);
    const mx = w * 0.7,
      my = h * 0.14 + progress * h * 0.05;
    if (!rain) {
      for (let i = 0; i < 45; i++) {
        c.fillStyle = `rgba(240,232,220,${0.2 + rnd(i + 330) * 0.5})`;
        c.fillRect(rnd(i + 331) * w, rnd(i + 332) * h * 0.5, 1.3, 1.3);
      }
      // A summer moon, warm through the dust in the air.
      glow(c, mx, my, w * 0.32, "rgba(255,205,150,0.2)");
      c.fillStyle = "rgba(252,236,206,0.93)";
      c.beginPath();
      c.arc(mx, my, w * 0.055, 0, TAU);
      c.fill();
    } else {
      glow(c, mx, my, w * 0.3, "rgba(200,210,230,0.07)");
      cloudBank(c, w, h * 0.12, t, "#1c212b", 3, S);
      cloudBank(c, w, h * 0.22, t * 1.4, "#151922", 9, S);
    }
    ridge(c, w, h, h * 0.56 + progress * 40, rain ? "#14171e" : "#191626", 0.55, 41);
    ridge(c, w, h, h * 0.66 + progress * 60, rain ? "#0e1015" : "#120f1b", 0.75, 47);
    if (rain) cloudBank(c, w, h * 0.42 + progress * 30, t * 0.8, "rgba(28,32,40,0.75)", 17, S);
    // The fig tree far up the bed, drifting slower than the world.
    figTree(c, w * 0.26, Y(0) * 0.6 + h * 0.4, S * 4.2, t, 0.5);
    // Dry-stone terraces climb both walls of the ravine. Each step belongs to a world
    // height, so the walls scroll with the stage instead of changing shape.
    const step = 1.6;
    const worldAt = (sy) => (Y(0) - sy) / S;
    const k0 = Math.floor(worldAt(h) / step) - 1,
      k1 = Math.ceil(worldAt(0) / step) + 1;
    // A zero-size canvas (layout not finished) would make this loop endless.
    if (!(S > 0) || !Number.isFinite(k0) || !Number.isFinite(k1) || k1 - k0 > 500) return;
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? 0 : w;
      const depth = (k) => (rnd(k * 5 + (side > 0 ? 13 : 29)) * 0.5 + 0.35) * S * 1.3;
      c.save();
      c.fillStyle = "#1b140e";
      c.beginPath();
      c.moveTo(x0, Y(k0 * step));
      for (let k = k0; k <= k1; k++) {
        c.lineTo(x0 - side * depth(k), Y(k * step));
        c.lineTo(x0 - side * depth(k), Y((k + 1) * step));
      }
      c.lineTo(x0, Y((k1 + 1) * step));
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,215,160,0.18)";
      c.lineWidth = 2;
      c.stroke();
      // Courses of the dry stone, and a tuft of dry grass on each shelf.
      c.strokeStyle = "rgba(0,0,0,0.35)";
      c.lineWidth = 1;
      for (let k = k0; k <= k1; k++) {
        const d = depth(k);
        for (let j = 1; j < 4; j++) {
          const yy = Y(k * step + (j * step) / 4);
          c.beginPath();
          c.moveTo(x0, yy);
          c.lineTo(x0 - side * d, yy);
          c.stroke();
          const jx = x0 - side * d * (0.3 + rnd(k * 9 + j) * 0.5);
          c.beginPath();
          c.moveTo(jx, yy);
          c.lineTo(jx, Y(k * step + ((j - 1) * step) / 4));
          c.stroke();
        }
        c.strokeStyle = "rgba(120,100,60,0.5)";
        const gx = x0 - side * d * 0.7,
          gy = Y((k + 1) * step);
        for (let j = -1; j <= 1; j++) {
          c.beginPath();
          c.moveTo(gx + j * 2, gy);
          c.lineTo(gx + j * 5 + Math.sin(t * 0.7 + k) * 1.5, gy - S * 0.22);
          c.stroke();
        }
        c.strokeStyle = "rgba(0,0,0,0.35)";
      }
      c.restore();
    }
    if (!rain) {
      // Heat over the dry bed: faint wavering bands, and motes drifting up.
      c.save();
      c.strokeStyle = "rgba(255,200,150,0.05)";
      c.lineWidth = S * 0.25;
      for (let i = 0; i < 3; i++) {
        const y0 = Y(0) - S * (0.6 + i * 0.9);
        c.beginPath();
        for (let x = 0; x <= w; x += 12) c.lineTo(x, y0 + Math.sin(x * 0.03 + t * (1.2 + i * 0.3)) * 3);
        c.stroke();
      }
      for (let i = 0; i < 12; i++) {
        const y = h * ((((rnd(i + 340) - t * 0.012 * (1 + rnd(i + 341))) % 1) + 1) % 1);
        c.fillStyle = `rgba(255,220,170,${0.08 + rnd(i + 342) * 0.12})`;
        c.fillRect(rnd(i + 343) * w + Math.sin(t * 0.5 + i) * 8, y, 1.5, 1.5);
      }
      c.restore();
      glow(c, w * 0.5, Y(0), w * 0.7, "rgba(255,170,90,0.06)");
    }
    vignette(c, w, h, 0.5);
  }

  // A row of heavy clouds rolling slowly along.
  function cloudBank(c, w, y, t, color, seed, S) {
    c.save();
    c.fillStyle = color;
    const span = w + S * 4;
    for (let i = 0; i < 9; i++) {
      const x = ((((rnd(seed + i) * span + t * 3 * (0.6 + rnd(seed + i + 1) * 0.4)) % span) + span) % span) - S * 2;
      c.beginPath();
      c.ellipse(x, y + rnd(seed + i + 2) * S * 0.6, S * (1.2 + rnd(seed + i + 3)), S * (0.45 + rnd(seed + i + 4) * 0.3), 0, 0, TAU);
      c.fill();
    }
    c.restore();
  }

  // The fig tree (tneqlet): a smooth twisted trunk and broad three-lobed leaves.
  // In front (figs true) it carries fruit and catches the moon; behind it is a shadow.
  function figTree(c, x, base, size, t, alpha = 1, figs = false) {
    c.save();
    c.globalAlpha *= alpha;
    const trunk = figs ? "#2b2622" : "#0e0c0b";
    c.strokeStyle = trunk;
    c.lineCap = "round";
    c.lineWidth = size * 0.075;
    c.beginPath();
    c.moveTo(x, base);
    c.bezierCurveTo(x - size * 0.1, base - size * 0.25, x + size * 0.12, base - size * 0.35, x + size * 0.02, base - size * 0.55);
    c.stroke();
    c.lineWidth = size * 0.035;
    for (const [ex, ey] of [
      [-0.32, -0.78],
      [0.34, -0.74],
      [0.05, -0.95],
    ]) {
      c.beginPath();
      c.moveTo(x + size * 0.02, base - size * 0.52);
      c.quadraticCurveTo(x + size * ex * 0.4, base - size * 0.7, x + size * ex, base + size * ey);
      c.stroke();
    }
    if (figs) {
      c.strokeStyle = "rgba(220,210,180,0.25)";
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(x + size * 0.03, base);
      c.bezierCurveTo(x - size * 0.07, base - size * 0.25, x + size * 0.15, base - size * 0.35, x + size * 0.05, base - size * 0.55);
      c.stroke();
    }
    for (let i = 0; i < 30; i++) {
      const a = rnd(i + 360) * TAU,
        rr = Math.sqrt(rnd(i + 361));
      const lx = x + Math.cos(a) * rr * size * 0.45,
        ly = base - size * 0.8 + Math.sin(a) * rr * size * 0.25;
      c.fillStyle = figs ? (i % 3 ? "#16200f" : "#1f2c15") : "#0c0b0a";
      figLeaf(c, lx, ly, size * 0.11, a + Math.sin(t * 0.8 + i) * 0.06);
    }
    if (figs) {
      c.fillStyle = "#3a1f33";
      for (let i = 0; i < 6; i++) {
        c.beginPath();
        c.ellipse(x + (rnd(i + 390) - 0.5) * size * 0.6, base - size * (0.68 + rnd(i + 391) * 0.2), size * 0.025, size * 0.032, 0, 0, TAU);
        c.fill();
      }
    }
    c.restore();
  }

  function figLeaf(c, x, y, s, angle) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.beginPath();
    c.ellipse(0, -s * 0.45, s * 0.32, s * 0.55, 0, 0, TAU);
    c.ellipse(-s * 0.4, -s * 0.25, s * 0.28, s * 0.4, -0.7, 0, TAU);
    c.ellipse(s * 0.4, -s * 0.25, s * 0.28, s * 0.4, 0.7, 0, TAU);
    c.fill();
    c.restore();
  }

  // A squared stone from the old wall, chisel-marked and flecked with lichen.
  function stoneBlock(c, x, top, w, h) {
    c.save();
    const g = c.createLinearGradient(0, top, 0, top + h);
    g.addColorStop(0, STONE_LIGHT);
    g.addColorStop(1, STONE_DARK);
    c.fillStyle = g;
    c.shadowColor = "rgba(255,215,160,0.3)";
    c.shadowBlur = 8;
    c.beginPath();
    c.roundRect(x - w / 2, top, w, h, Math.min(w, h) * 0.18);
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(30,24,18,0.45)";
    c.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const cx = x - w * 0.3 + i * w * 0.2,
        cy = top + h * (0.35 + (i % 2) * 0.25);
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + w * 0.08, cy + h * 0.15);
      c.stroke();
    }
    c.fillStyle = "rgba(205,210,150,0.35)";
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.ellipse(x + (i - 1) * w * 0.28, top + h * 0.2 + (i % 2) * h * 0.4, w * 0.06, h * 0.06, 0, 0, TAU);
      c.fill();
    }
    c.strokeStyle = "rgba(255,235,200,0.4)";
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(x - w / 2 + 3, top + 1);
    c.lineTo(x + w / 2 - 3, top + 1);
    c.stroke();
    c.restore();
  }

  // The cracked cistern wall (aɣrab): courses of cut stone, a crack from the top to the
  // foot, and the water behind it already seeping through, darkening the stone and
  // dripping. course: the height of one course of stones, in pixels.
  function cistern(c, x, top, w, h, t, course = Math.min(w, h) * 0.3) {
    // A zero-size wall (layout not finished) would make the joint loop endless.
    if (!(w > 1 && h > 1 && course > 1)) return;
    const left = x - w / 2;
    c.save();
    // The water held behind it, catching the moon along the top.
    glow(c, x, top, Math.max(w, course * 3) * 0.9, "rgba(140,190,230,0.16)");
    const g = c.createLinearGradient(0, top, 0, top + h);
    g.addColorStop(0, STONE);
    g.addColorStop(1, STONE_DARK);
    c.fillStyle = g;
    c.shadowColor = "rgba(150,200,240,0.3)";
    c.shadowBlur = 10;
    c.beginPath();
    c.roundRect(left, top, w, h, Math.min(w, h) * 0.05);
    c.fill();
    c.shadowBlur = 0;
    c.save();
    c.beginPath();
    c.rect(left, top, w, h);
    c.clip();
    // Courses and joints.
    const rows = Math.max(3, Math.round(h / course));
    const rh = h / rows,
      joint = rh * 1.7;
    c.strokeStyle = "rgba(20,16,12,0.6)";
    c.lineWidth = 1.2;
    for (let r = 0; r < rows; r++) {
      const yy = top + r * rh;
      c.beginPath();
      c.moveTo(left, yy);
      c.lineTo(left + w, yy);
      c.stroke();
      for (let jx = left + (r % 2 ? joint * 0.5 : joint * (0.2 + rnd(r + 410) * 0.5)); jx < left + w; jx += joint * (0.8 + rnd(r * 7 + jx) * 0.4)) {
        c.beginPath();
        c.moveTo(jx, yy);
        c.lineTo(jx, yy + rh);
        c.stroke();
      }
    }
    // The crack: a zigzag from top to foot, the stone wet and dark all round it.
    const amp = Math.min(w * 0.4, course * 1.4);
    const pts = [];
    for (let i = 0; i <= 8; i++) pts.push([x + (rnd(i + 400) - 0.5) * amp, top + (h * i) / 8]);
    c.fillStyle = "rgba(15,30,45,0.32)";
    for (const [px, py] of pts) {
      c.beginPath();
      c.ellipse(px, py + rh * 0.3, amp * 0.45 + w * 0.08, rh * 0.8, 0, 0, TAU);
      c.fill();
    }
    c.strokeStyle = "#0b0806";
    c.lineWidth = Math.max(2, Math.min(w, h) * 0.05);
    c.beginPath();
    pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
    c.stroke();
    c.strokeStyle = `rgba(150,200,240,${0.45 + Math.sin(t * 2) * 0.1})`;
    c.lineWidth = 1;
    c.beginPath();
    pts.forEach(([px, py], i) => (i ? c.lineTo(px + 1, py) : c.moveTo(px + 1, py)));
    c.stroke();
    // Thin streams run down the face from the crack; a bead of light slides down each.
    for (const s of [2, 4, 6]) {
      const [sx, sy] = pts[s];
      c.strokeStyle = "rgba(120,170,210,0.45)";
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(sx, sy);
      c.quadraticCurveTo(sx + rh * 0.2, (sy + top + h) / 2, sx + rh * 0.1, top + h);
      c.stroke();
      const k = (t * 0.6 + s * 0.3) % 1;
      c.fillStyle = `rgba(210,235,255,${0.8 * (1 - k)})`;
      c.beginPath();
      c.arc(sx + rh * 0.12 * k, sy + (top + h - sy) * k, 1.8, 0, TAU);
      c.fill();
    }
    c.restore();
    // The water line along the top, swaying behind the coping.
    c.strokeStyle = "rgba(180,220,245,0.6)";
    c.lineWidth = 1.5;
    c.beginPath();
    for (let xx = left + 2; xx <= left + w - 2; xx += 4) c.lineTo(xx, top - 1 + Math.sin(xx * 0.2 + t * 2) * 0.8);
    c.stroke();
    c.strokeStyle = "rgba(255,235,200,0.35)";
    c.beginPath();
    c.moveTo(left, top + 1);
    c.lineTo(left + w, top + 1);
    c.stroke();
    // Drops falling off the foot.
    for (let i = 0; i < 2; i++) {
      const life = (t * 0.9 + i * 0.5) % 1;
      c.fillStyle = `rgba(170,210,240,${0.85 * (1 - life)})`;
      c.beginPath();
      c.ellipse(x + (i - 0.5) * w * 0.3, top + h + life * Math.max(10, rh), 1.6, 2.4, 0, 0, TAU);
      c.fill();
    }
    c.restore();
  }

  // A water's surface height at screen x: a slow swell, rough while a flood comes in.
  function waveAt(x, ys, t, rough) {
    const amp = 1.4 + rough * 4.5;
    return ys + Math.sin(x * 0.05 + t * 2) * amp + Math.sin(x * 0.13 - t * 3.1) * amp * 0.5;
  }
  function surfacePath(c, x0, x1, ys, t, rough) {
    c.moveTo(x0, waveAt(x0, ys, t, rough));
    for (let x = x0 + 6; x < x1; x += 6) c.lineTo(x, waveAt(x, ys, t, rough));
    c.lineTo(x1, waveAt(x1, ys, t, rough));
  }
  // How hard a flood still churns: full while it rises, settling over 2.5 s after.
  function floodStrength(o) {
    if (!o.flooded) return 0;
    return o.floodT < 1.5 ? 1 : Math.max(0, 1 - (o.floodT - 1.5) / 2.5);
  }

  // The body of a water from its surface ys down to yb; dir is the way a flood runs.
  function waterBody(c, x0, x1, ys, yb, t, rough, dir, S) {
    if (ys >= yb - 0.5) return;
    c.save();
    c.beginPath();
    surfacePath(c, x0, x1, ys, t, rough);
    c.lineTo(x1, yb);
    c.lineTo(x0, yb);
    c.closePath();
    const g = c.createLinearGradient(0, ys, 0, yb);
    g.addColorStop(0, rough ? `rgba(120,160,190,${0.55 + rough * 0.2})` : WATER + "0.5)");
    g.addColorStop(1, "rgba(8,20,36,0.85)");
    c.fillStyle = g;
    c.fill();
    c.clip();
    // Moonlight wavering under the surface.
    c.strokeStyle = "rgba(170,210,240,0.12)";
    c.lineWidth = 1;
    const deep = Math.min(yb - ys, S * 3);
    for (let i = 0; i < 6; i++) {
      const cx = x0 + (x1 - x0) * rnd(i + 500),
        cy = ys + 4 + deep * rnd(i + 501);
      c.beginPath();
      c.moveTo(cx - S * 0.3, cy);
      c.quadraticCurveTo(cx, cy + Math.sin(t * 2 + i) * 3, cx + S * 0.3, cy);
      c.stroke();
    }
    // A flood: white streaks racing down the ravine under the surface.
    if (rough) {
      c.strokeStyle = FOAM + 0.5 * rough + ")";
      c.lineWidth = 2;
      const band = Math.min(yb - ys, S * 2.5);
      for (let i = 0; i < 14; i++) {
        const k = (t * 1.4 * (0.6 + rnd(i + 510)) + rnd(i + 520)) % 1;
        const sx = dir > 0 ? x0 + k * (x1 - x0) : x1 - k * (x1 - x0);
        const sy = ys + 4 + band * rnd(i + 540) * 0.85;
        c.beginPath();
        c.moveTo(sx, sy);
        c.lineTo(sx - dir * S * (0.5 + rnd(i + 530)), sy + Math.sin(t * 6 + i) * 2);
        c.stroke();
      }
    }
    c.restore();
  }

  // The translucent front of a water, drawn over the hero: its surface line, moon
  // glints, foam while a flood comes in.
  function waterVeil(c, x0, x1, ys, yb, t, rough, dir, S) {
    if (ys >= yb - 0.5) return;
    c.save();
    c.beginPath();
    surfacePath(c, x0, x1, ys, t, rough);
    c.lineTo(x1, yb);
    c.lineTo(x0, yb);
    c.closePath();
    c.fillStyle = WATER + "0.3)";
    c.fill();
    c.beginPath();
    surfacePath(c, x0, x1, ys, t, rough);
    c.strokeStyle = rough ? FOAM + (0.6 + 0.35 * rough) + ")" : "rgba(190,225,250,0.55)";
    c.lineWidth = rough ? 2 + rough * 3 : 1.5;
    c.stroke();
    for (let i = 0; i < 5; i++) {
      const gx = x0 + (x1 - x0) * rnd(i + 600);
      c.strokeStyle = `rgba(235,245,255,${Math.max(0, 0.25 + Math.sin(t * 3 + i * 2) * 0.3)})`;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(gx - 4, waveAt(gx, ys, t, rough) + 2);
      c.lineTo(gx + 4, waveAt(gx, ys, t, rough) + 2);
      c.stroke();
    }
    if (rough) {
      for (let i = 0; i < 10; i++) {
        const k = (t * 0.9 * (0.7 + rnd(i + 580)) + rnd(i + 590)) % 1;
        const fx = dir > 0 ? x0 + k * (x1 - x0) : x1 - k * (x1 - x0);
        c.fillStyle = FOAM + 0.7 * rough + ")";
        c.beginPath();
        c.arc(fx, waveAt(fx, ys, t, rough), S * (0.12 + rnd(i + 595) * 0.15) * rough, 0, TAU);
        c.fill();
      }
    }
    c.restore();
  }

  // White water bursting from a breach at (bx, by), falling to the surface ys.
  function cascade(c, bx, by, bw, ys, t, k, dir) {
    if (by >= ys || k <= 0) return;
    c.save();
    const g = c.createLinearGradient(0, by, 0, ys);
    g.addColorStop(0, FOAM + 0.85 * k + ")");
    g.addColorStop(1, WATER + 0.6 * k + ")");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(bx - bw / 2, by);
    c.quadraticCurveTo(bx - bw * 0.6 + dir * bw * 0.3, (by + ys) / 2, bx - bw * 0.8 + dir * bw, ys);
    c.lineTo(bx + bw * 0.8 + dir * bw, ys);
    c.quadraticCurveTo(bx + bw * 0.6 + dir * bw * 0.3, (by + ys) / 2, bx + bw / 2, by);
    c.closePath();
    c.fill();
    c.strokeStyle = FOAM + 0.8 * k + ")";
    c.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const kk = (t * 2.2 + rnd(i + 560)) % 1;
      const sx = bx + (rnd(i + 570) - 0.5) * bw + dir * bw * kk * 0.7,
        sy = by + (ys - by) * kk;
      c.beginPath();
      c.moveTo(sx, sy);
      c.lineTo(sx + dir * 2, sy + Math.min(14, (ys - by) * 0.2));
      c.stroke();
    }
    glow(c, bx + dir * bw * 0.8, ys, bw * 1.3, FOAM + 0.35 * k + ")");
    c.restore();
  }

  // A water object of the stage (engine fields: x, y bottom, w, surface, flooded, floodT).
  function waterCoords(o, X, Y, g) {
    const breach = o.flooded ? g.platforms.find((p) => p.flood !== undefined && p.flood === o.id) : null;
    return {
      x0: X(o.x - o.w / 2),
      x1: X(o.x + o.w / 2),
      yb: Y(o.y),
      ys: Y(o.surface),
      rough: floodStrength(o),
      breach,
      dir: breach ? Math.sign(o.x - breach.x) || 1 : 1,
    };
  }
  function water(c, o, X, Y, S, t, g) {
    const k = waterCoords(o, X, Y, g);
    waterBody(c, k.x0, k.x1, k.ys, k.yb, t, k.rough, k.dir, S);
    if (k.breach) {
      const p = k.breach;
      cascade(c, X(p.x), Y(p.y - (p.h || 0.4) * 0.3), p.w * S * 0.9, k.ys, t, k.rough, k.dir);
    }
  }

  // The back of a well bucket: the iron handle, the dark inside, the far rim. Its walls
  // come later (bucketFront, after the hero), so he stands inside it.
  function bucketBack(c, x, top, w, S) {
    const rim = top - RIM * S;
    c.save();
    c.strokeStyle = "#3d3a36";
    c.lineWidth = Math.max(1.5, S * 0.05);
    c.beginPath();
    c.moveTo(x - w * 0.46, rim);
    c.quadraticCurveTo(x, rim - w, x + w * 0.46, rim);
    c.stroke();
    c.fillStyle = "#1d130b";
    c.fillRect(x - w * 0.5, rim, w, top - rim);
    c.beginPath();
    c.ellipse(x, rim, w * 0.5, w * 0.12, 0, Math.PI, TAU);
    c.fill();
    c.strokeStyle = "rgba(255,220,170,0.35)";
    c.lineWidth = 1.2;
    c.beginPath();
    c.ellipse(x, rim, w * 0.5, w * 0.12, 0, Math.PI, TAU);
    c.stroke();
    c.restore();
  }
  // The front of the bucket: tapering staves, two iron hoops, the near rim.
  function bucketFront(c, x, top, w, h, S) {
    const rim = top - RIM * S,
      foot = top + h;
    c.save();
    const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, "#3a2414");
    g.addColorStop(0.45, "#8a5c34");
    g.addColorStop(1, "#2a190c");
    c.fillStyle = g;
    c.shadowColor = "rgba(255,190,120,0.3)";
    c.shadowBlur = 6;
    c.beginPath();
    c.moveTo(x - w / 2, rim);
    c.lineTo(x - w * 0.42, foot);
    c.quadraticCurveTo(x, foot + w * 0.1, x + w * 0.42, foot);
    c.lineTo(x + w / 2, rim);
    c.ellipse(x, rim, w * 0.5, w * 0.12, 0, 0, Math.PI);
    c.closePath();
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(30,16,6,0.6)";
    c.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const u = i / 5;
      c.beginPath();
      c.moveTo(x - w / 2 + w * u, rim + w * 0.12 * Math.sin(u * Math.PI));
      c.lineTo(x - w * 0.42 + w * 0.84 * u, foot + w * 0.1 * Math.sin(u * Math.PI) * 0.5);
      c.stroke();
    }
    c.strokeStyle = "#3d3a36";
    c.lineWidth = Math.max(2, S * 0.06);
    for (const f of [0.3, 0.8]) {
      const yy = rim + (foot - rim) * f,
        half = w * (0.5 - 0.08 * f);
      c.beginPath();
      c.moveTo(x - half, yy);
      c.quadraticCurveTo(x, yy + w * 0.12, x + half, yy);
      c.stroke();
    }
    c.strokeStyle = "rgba(255,220,170,0.4)";
    c.lineWidth = 1.2;
    c.beginPath();
    c.ellipse(x, rim, w * 0.5, w * 0.12, 0, 0, Math.PI);
    c.stroke();
    c.restore();
  }
  // Both halves of a bucket at once, for the story scenes.
  function bucket(c, x, top, w, h, S) {
    bucketBack(c, x, top, w, S);
    bucketFront(c, x, top, w, h, S);
  }

  // The well frame for one rope: two posts and a beam, a pulley turning as the rope
  // runs, and the rope from one bucket's handle over the pulley down to the other's.
  // a, b: the two bucket platforms (world: x, y, w, h, top, bottom).
  // The frame's place in world units: pulley centre (px, py), the underside of the beam,
  // its ends, the posts' foot. It rises above any stone tied to the rope (at its home
  // height, so the frame never moves when the stone falls) and its beam spans it.
  function wellFrame(a, b, game) {
    if (a.x > b.x) [a, b] = [b, a];
    let py = Math.max(a.top, b.top) + RIM + Math.max(a.w, b.w) * 0.5 + 1.4,
      left = a.x - a.w / 2 - 0.35,
      right = b.x + b.w / 2 + 0.35;
    for (const p of (game && game.platforms) || []) {
      if (p.type !== "drop" || p.tied === undefined || p.tied !== a.rope) continue;
      py = Math.max(py, (p.homeY === undefined ? p.y : p.homeY) + 0.5);
      const hx = p.homeX === undefined ? p.x : p.homeX;
      left = Math.min(left, hx - p.w / 2 - 0.2);
      right = Math.max(right, hx + p.w / 2 + 0.2);
    }
    return {
      a,
      b,
      px: (a.x + b.x) / 2,
      py,
      // The pulley is 0.34 in radius and hangs 0.28 under the beam.
      beam: py + 0.34 + 0.28,
      left,
      right,
      foot: Math.min(a.bottom, b.bottom) - Math.max(a.h || 0.4, b.h || 0.4) - 0.3,
    };
  }
  // Every well frame of a stage, one per rope.
  function wellFrames(game) {
    const frames = [];
    const seen = new Set();
    for (const p of game.platforms) {
      if (p.type !== "bucket" || seen.has(p.rope)) continue;
      seen.add(p.rope);
      const pair = game.platforms.filter((q) => q.type === "bucket" && q.rope === p.rope);
      if (pair.length === 2) frames.push(wellFrame(pair[0], pair[1], game));
    }
    return frames;
  }

  function well(c, a, b, X, Y, S, t, game) {
    const f = wellFrame(a, b, game);
    [a, b] = [f.a, f.b];
    const px = X(f.px),
      py = Y(f.py),
      pr = S * 0.34;
    const beamY = py - pr - S * 0.28;
    const left = X(f.left),
      right = X(f.right);
    const foot = Y(f.foot);
    const pw = S * 0.22;
    c.save();
    // Posts and beam: rough timber, dim, behind the play.
    c.fillStyle = "#24180e";
    c.fillRect(left - pw / 2, beamY, pw, foot - beamY);
    c.fillRect(right - pw / 2, beamY, pw, foot - beamY);
    const g = c.createLinearGradient(0, beamY - S * 0.2, 0, beamY + S * 0.04);
    g.addColorStop(0, "#5a3d22");
    g.addColorStop(1, "#2a1a0d");
    c.fillStyle = g;
    c.beginPath();
    c.roundRect(left - pw, beamY - S * 0.2, right - left + pw * 2, S * 0.24, S * 0.05);
    c.fill();
    c.strokeStyle = "rgba(255,215,160,0.3)";
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(left - pw, beamY - S * 0.2);
    c.lineTo(right + pw, beamY - S * 0.2);
    c.stroke();
    // The pulley's iron bracket, then the wheel, its spokes turned by the rope.
    c.strokeStyle = "#3d3a36";
    c.lineWidth = Math.max(2, S * 0.07);
    c.beginPath();
    c.moveTo(px, beamY);
    c.lineTo(px, py);
    c.stroke();
    c.strokeStyle = "#5a3d22";
    c.lineWidth = Math.max(2, S * 0.08);
    c.beginPath();
    c.arc(px, py, pr, 0, TAU);
    c.stroke();
    const turn = a.y / 0.34;
    c.strokeStyle = "#4a321b";
    c.lineWidth = Math.max(1.5, S * 0.05);
    for (let i = 0; i < 4; i++) {
      const an = turn + (i * Math.PI) / 2;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px + Math.cos(an) * pr * 0.9, py + Math.sin(an) * pr * 0.9);
      c.stroke();
    }
    c.fillStyle = "#2a1a0c";
    c.beginPath();
    c.arc(px, py, S * 0.09, 0, TAU);
    c.fill();
    c.strokeStyle = "rgba(255,210,150,0.3)";
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(px, py, pr + S * 0.04, Math.PI * 1.1, Math.PI * 1.6);
    c.stroke();
    // The rope: up from each handle to the rim of the wheel and over its top.
    const handle = (q) => [X(q.x), Y(q.y) - RIM * S - q.w * S * 0.5];
    const [ax, ay] = handle(a),
      [bx, by] = handle(b);
    c.strokeStyle = "#b39a6c";
    c.lineWidth = Math.max(1.5, S * 0.05);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(ax, ay);
    c.lineTo(px - pr, py);
    c.arc(px, py, pr, Math.PI, TAU);
    c.lineTo(bx, by);
    c.stroke();
    c.restore();
  }

  // A hanging stone at the spring (a drop that is neither knocked nor the cistern): a
  // cracked slab on a frayed rope, or with `tied`, a block lashed to the well rope. The
  // rope runs up to the well's beam when one is above it, else it is a short torn end.
  // While p.timer grows toward p.delay the rope frays and the stone shivers; once the
  // stone is falling or has landed, the rope is gone. Returns false for other themes.
  function hanging(c, p, X, Y, S, t, game) {
    if (game.level.theme !== "spring" || p.knock || p.flood !== undefined) return false;
    const loose = p.falling || p.landed;
    const strain = p.timer && !loose ? Math.min(1, p.timer / (p.delay || 0.6)) : 0;
    const shiver = strain ? Math.sin(t * 60) * strain * 2.5 : 0;
    const x = X(p.x) + shiver,
      top = Y(p.y),
      w = p.w * S,
      h = (p.h || 0.4) * S;
    if (!loose) {
      const frames = wellFrames(game);
      const frame =
        p.tied !== undefined
          ? frames.find((f) => f.a.rope === p.tied)
          : frames.find((f) => p.x > f.left && p.x < f.right && f.beam > p.y && f.beam - p.y < 4.5);
      const anchor = frame ? Y(frame.beam) + S * 0.04 : top - S * 0.55;
      hangRope(c, x, top, anchor, S, t, strain, !frame);
    }
    if (p.tied !== undefined) {
      stoneBlock(c, x, top, w, h);
      // The lashing: two turns of rope round the block.
      c.save();
      c.strokeStyle = "#8e7a52";
      c.lineWidth = Math.max(1.5, S * 0.05);
      for (const f of [-0.22, 0.22]) {
        c.beginPath();
        c.moveTo(x + f * w, top);
        c.lineTo(x + f * w * 1.1, top + h);
        c.stroke();
      }
      c.restore();
    } else crackedSlab(c, x, top, w, h, t);
    return true;
  }

  // A rope from the stone's top up to anchorY. Near the top it frays: its strands part
  // more as strain (0 to 1) grows. torn: a short end with loose fibres, tied to nothing.
  function hangRope(c, x, top, anchorY, S, t, strain, torn) {
    c.save();
    c.strokeStyle = "#b39a6c";
    c.lineCap = "round";
    const lw = Math.max(1.5, S * 0.05);
    const fray = anchorY + (top - anchorY) * (torn ? 0.15 : 0.3);
    c.lineWidth = lw;
    c.beginPath();
    c.moveTo(x, top);
    c.lineTo(x, fray + S * 0.08);
    c.stroke();
    // The fraying spot: thin strands bowing apart.
    c.lineWidth = Math.max(1, lw * 0.4);
    for (const k of [-1, 0, 1]) {
      const bow = k * (1.5 + strain * 4) + (strain ? Math.sin(t * 50 + k) * strain : 0);
      c.beginPath();
      c.moveTo(x, fray + S * 0.08);
      c.quadraticCurveTo(x + bow, fray, x + (torn ? bow * 1.5 : 0), fray - S * 0.08);
      c.stroke();
    }
    if (!torn) {
      c.lineWidth = lw * (1 - strain * 0.4);
      c.beginPath();
      c.moveTo(x, fray - S * 0.08);
      c.lineTo(x, anchorY);
      c.stroke();
    }
    c.restore();
  }

  // A loose slab of the old terraces, split by a crack.
  function crackedSlab(c, x, top, w, h, t) {
    stoneBlock(c, x, top, w, h);
    c.save();
    c.strokeStyle = "#140f0b";
    c.lineWidth = Math.max(1.5, h * 0.08);
    c.beginPath();
    c.moveTo(x - w * 0.08, top);
    c.lineTo(x + w * 0.04, top + h * 0.35);
    c.lineTo(x - w * 0.05, top + h * 0.6);
    c.lineTo(x + w * 0.06, top + h);
    c.stroke();
    c.strokeStyle = `rgba(255,235,200,${0.2 + Math.sin(t * 1.5) * 0.05})`;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x - w * 0.06, top + 1);
    c.lineTo(x + w * 0.06, top + h * 0.35 + 1);
    c.stroke();
    c.restore();
  }

  // Drawn after the hero: bucket walls (he stands inside them) and the front of every
  // water (so a floating hero sits half in it), with ripples round him.
  function front(c, g, X, Y, S, t) {
    for (const p of g.platforms)
      if (p.type === "bucket" && p.alive !== false) bucketFront(c, X(p.x), Y(p.y), p.w * S, (p.h || 0.4) * S, S);
    for (const o of g.objects) {
      if (o.type !== "water") continue;
      const k = waterCoords(o, X, Y, g);
      waterVeil(c, k.x0, k.x1, k.ys, k.yb, t, k.rough, k.dir, S);
      const hero = g.hero;
      if (hero.state === "float" && Math.abs(hero.x - o.x) < o.w / 2 && Math.abs(hero.y - o.surface) < 0.8) {
        c.save();
        for (let i = 0; i < 3; i++) {
          const r = (t * 0.7 + i / 3) % 1;
          c.strokeStyle = `rgba(210,235,255,${0.5 * (1 - r)})`;
          c.lineWidth = 1.2;
          c.beginPath();
          c.ellipse(X(hero.x), k.ys, S * (0.45 + r * 0.9), S * (0.08 + r * 0.12), 0, 0, TAU);
          c.stroke();
        }
        c.restore();
      }
    }
  }

  // Teryel's frogs (imqerqar): squat and dark, a pale throat pulsing while they wait,
  // big glowing eyes on top. Mid-leap (extra.leap {k, up}) the body stretches and the
  // hind legs kick out; extra.windup (0 to 1) is the crouch just before a leap.
  function frog(c, x, y, size, t, mood, extra = {}) {
    const face = extra.face || ((extra.vx || 0) < -0.05 ? -1 : (extra.vx || 0) > 0.05 ? 1 : 0);
    const leap = extra.leap || null;
    const asleep = mood === "sleep";
    const crouch = leap ? 0 : extra.windup || (mood === "notice" ? 0.3 : 0);
    const stretch = leap ? (leap.up ? 1 : 0.55) : 0;
    c.save();
    c.translate(x, y + size * 0.1);
    if (leap) c.rotate(face * 0.15 * (leap.up ? 1 : -0.5));
    glow(c, 0, 0, size * 0.85, mood === "chase" ? "rgba(200,255,90,0.2)" : "rgba(170,220,120,0.1)");
    c.fillStyle = FROG;
    c.strokeStyle = FROG;
    c.lineCap = "round";
    c.shadowColor = "rgba(190,230,140,0.45)";
    c.shadowBlur = size * 0.16;
    // Hind legs: folded at the sides on the stone, kicked out in the air.
    c.lineWidth = Math.max(2, size * 0.09);
    for (const sx of [-1, 1]) {
      if (leap) {
        const fx = leap.up ? sx * size * 0.16 : sx * size * 0.42,
          fy = leap.up ? size * 0.62 : size * 0.4;
        c.beginPath();
        c.moveTo(sx * size * 0.18, size * 0.12);
        c.quadraticCurveTo(sx * size * 0.34, size * 0.3, fx, fy);
        c.stroke();
        c.beginPath();
        c.ellipse(fx, fy, size * 0.09, size * 0.035, sx * 0.4, 0, TAU);
        c.fill();
      } else {
        c.beginPath();
        c.ellipse(sx * size * (0.3 + crouch * 0.03), size * 0.13, size * 0.2, size * (0.14 - crouch * 0.02), sx * 0.5, 0, TAU);
        c.fill();
        c.beginPath();
        c.ellipse(sx * size * 0.42, size * 0.25, size * 0.12, size * 0.035, 0, 0, TAU);
        c.fill();
      }
    }
    // Body and head in one squat mound; stretched tall in a leap, flatter in a crouch.
    const rx = size * 0.34 * (1 - stretch * 0.15 + crouch * 0.08),
      ry = size * 0.24 * (1 + stretch * 0.35 - crouch * 0.15);
    c.beginPath();
    c.ellipse(0, size * 0.04 - stretch * size * 0.05, rx, ry, 0, 0, TAU);
    c.fill();
    // Eye bulges on top.
    const ey = size * 0.04 - stretch * size * 0.05 - ry * 0.75;
    for (const sx of [-1, 1]) {
      c.beginPath();
      c.arc(sx * size * 0.16 + face * size * 0.02, ey, size * 0.1, 0, TAU);
      c.fill();
    }
    // Front legs: planted, or reaching out in the air.
    c.lineWidth = Math.max(1.5, size * 0.05);
    for (const sx of [-1, 1]) {
      c.beginPath();
      if (leap && leap.up) {
        c.moveTo(sx * size * 0.12, size * 0.05);
        c.lineTo(sx * size * 0.28, -size * 0.12);
      } else if (leap) {
        c.moveTo(sx * size * 0.12, size * 0.12);
        c.lineTo(sx * size * 0.22, size * 0.32);
      } else {
        c.moveTo(sx * size * 0.12, size * 0.12);
        c.lineTo(sx * size * 0.14, size * 0.27);
      }
      c.stroke();
    }
    c.shadowBlur = 0;
    // The pale throat, swelling and emptying while it sits.
    const pulse = leap || mood === "chase" ? 0 : (Math.sin(t * (asleep ? 1.6 : 4.2) + x) + 1) * (asleep ? 0.15 : 0.3);
    c.fillStyle = FROG_BELLY;
    c.globalAlpha *= 0.85;
    c.beginPath();
    c.ellipse(face * size * 0.02, size * 0.1 + pulse * size * 0.03, size * 0.15 * (1 + pulse), size * 0.08 * (1 + pulse * 1.2), 0, 0, TAU);
    c.fill();
    c.globalAlpha /= 0.85;
    // Wide mouth line and a few darker warts.
    c.strokeStyle = "rgba(0,0,0,0.7)";
    c.lineWidth = Math.max(1, size * 0.02);
    c.beginPath();
    c.moveTo(-size * 0.2 + face * size * 0.03, size * 0.02);
    c.quadraticCurveTo(face * size * 0.03, size * 0.07, size * 0.2 + face * size * 0.03, size * 0.02);
    c.stroke();
    c.fillStyle = "#0b1207";
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.arc((i - 1.5) * size * 0.12, -size * 0.06 + (i % 2) * size * 0.05, size * 0.022, 0, TAU);
      c.fill();
    }
    c.restore();
    // Glowing eyes on the bulges, with slit pupils turned toward its prey.
    const eyeY = y + size * 0.1 + ey;
    const ex = x + face * size * 0.02;
    eyes(c, ex, eyeY, size * 0.16, size * 0.62, mood, t, "rgba(215,255,110,A)");
    if (!asleep) {
      c.save();
      c.fillStyle = "#050703";
      for (const sx of [-1, 1]) {
        c.beginPath();
        c.ellipse(ex + sx * size * 0.16 + face * size * 0.025, eyeY, size * 0.04, size * 0.015, 0, 0, TAU);
        c.fill();
      }
      c.restore();
    }
  }

  // Tislit n Wanzar: the wooden ladle (aɣenja) dressed as a bride to call the rain. The
  // bowl is her head under a red scarf, a crossed stick her arms, a striped dress, a
  // little necklace of coral and silver. size: her full height. opts.tilt: radians.
  function tislit(c, x, y, size, t, opts = {}) {
    const s = size;
    c.save();
    c.translate(x, y);
    c.rotate((opts.tilt || 0) + Math.sin(t * 1.4) * 0.04);
    glow(c, 0, -s * 0.1, s * 0.9, "rgba(170,210,255,0.16)");
    // The handle shows under the hem.
    c.fillStyle = "#7a5230";
    c.fillRect(-s * 0.035, s * 0.25, s * 0.07, s * 0.25);
    // Arms: a crossed stick with tassels.
    c.strokeStyle = "#6b4626";
    c.lineWidth = Math.max(1.5, s * 0.05);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-s * 0.32, -s * 0.12);
    c.lineTo(s * 0.32, -s * 0.12);
    c.stroke();
    for (const sx of [-1, 1]) {
      c.strokeStyle = sx < 0 ? "#d9a441" : "#c0392b";
      c.lineWidth = Math.max(1, s * 0.02);
      for (let i = -1; i <= 1; i++) {
        c.beginPath();
        c.moveTo(sx * s * 0.32, -s * 0.12);
        c.lineTo(sx * s * (0.34 + i * 0.02) + Math.sin(t * 3 + i) * 1, -s * 0.02);
        c.stroke();
      }
    }
    // The dress: a flaring cone in stripes, a woven band across it.
    c.save();
    c.beginPath();
    c.moveTo(-s * 0.1, -s * 0.16);
    c.lineTo(s * 0.1, -s * 0.16);
    c.quadraticCurveTo(s * 0.2, s * 0.05, s * 0.24 + Math.sin(t * 2) * s * 0.01, s * 0.28);
    c.lineTo(-s * 0.24 + Math.sin(t * 2 + 1) * s * 0.01, s * 0.28);
    c.quadraticCurveTo(-s * 0.2, s * 0.05, -s * 0.1, -s * 0.16);
    c.closePath();
    c.clip();
    const stripes = ["#9e2b22", "#d9a441", "#2f6b3a", "#9e2b22", "#1f4f8a", "#d9a441"];
    stripes.forEach((col, i) => {
      c.fillStyle = col;
      c.fillRect(-s * 0.3, -s * 0.16 + (i * s * 0.44) / stripes.length, s * 0.6, s * 0.44 / stripes.length + 0.5);
    });
    bandZigzag(c, -s * 0.3, s * 0.12, s * 0.3, s * 0.12, s * 0.05, CREAM);
    c.restore();
    // Head: the bowl of the ladle, smooth wood catching the light.
    const hg = c.createRadialGradient(-s * 0.04, -s * 0.33, s * 0.02, 0, -s * 0.28, s * 0.15);
    hg.addColorStop(0, "#d9a466");
    hg.addColorStop(1, "#6b4422");
    c.fillStyle = hg;
    c.beginPath();
    c.ellipse(0, -s * 0.28, s * 0.11, s * 0.13, 0, 0, TAU);
    c.fill();
    // Scarf over the bowl, falling behind on both sides, with a yellow fringe.
    c.fillStyle = "#b8302a";
    c.beginPath();
    c.moveTo(-s * 0.13, -s * 0.26);
    c.quadraticCurveTo(0, -s * 0.5, s * 0.13, -s * 0.26);
    c.quadraticCurveTo(s * 0.17 + Math.sin(t * 2) * s * 0.01, -s * 0.15, s * 0.14, -s * 0.08);
    c.lineTo(s * 0.09, -s * 0.2);
    c.quadraticCurveTo(0, -s * 0.38, -s * 0.09, -s * 0.2);
    c.lineTo(-s * 0.14, -s * 0.08);
    c.quadraticCurveTo(-s * 0.17, -s * 0.15, -s * 0.13, -s * 0.26);
    c.closePath();
    c.fill();
    c.fillStyle = OCHRE;
    for (let i = -3; i <= 3; i++) {
      c.beginPath();
      c.arc(i * s * 0.03, -s * 0.355 + Math.abs(i) * s * 0.012, s * 0.012, 0, TAU);
      c.fill();
    }
    // The necklace: coral and silver beads, a little pendant.
    for (let i = 0; i <= 6; i++) {
      const u = i / 6;
      c.fillStyle = i % 2 ? "#dfe2e8" : "#c0392b";
      c.beginPath();
      c.arc(-s * 0.08 + u * s * 0.16, -s * 0.13 + Math.sin(u * Math.PI) * s * 0.05, s * 0.016, 0, TAU);
      c.fill();
    }
    c.fillStyle = "#dfe2e8";
    c.beginPath();
    c.moveTo(0, -s * 0.07);
    c.lineTo(s * 0.025, -s * 0.03);
    c.lineTo(0, s * 0.0);
    c.lineTo(-s * 0.025, -s * 0.03);
    c.closePath();
    c.fill();
    c.restore();
  }

  // A stone basin under the fig tree, nearly dry: one wet glint at the bottom.
  function dryPool(c, x, y, w, t) {
    c.save();
    c.fillStyle = "#120d08";
    c.beginPath();
    c.ellipse(x, y, w / 2, w * 0.13, 0, 0, TAU);
    c.fill();
    c.fillStyle = `rgba(150,200,240,${0.35 + Math.sin(t * 1.7) * 0.1})`;
    c.beginPath();
    c.ellipse(x + w * 0.05, y + w * 0.02, w * 0.1, w * 0.025, 0, 0, TAU);
    c.fill();
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU;
      c.fillStyle = i % 2 ? STONE : STONE_LIGHT;
      c.beginPath();
      c.ellipse(x + Math.cos(a) * w * 0.5, y + Math.sin(a) * w * 0.13, w * 0.09, w * 0.05, 0, 0, TAU);
      c.fill();
    }
    c.restore();
  }

  // A few houses of Ath Abbas on their hill, every window lit.
  function village(c, x0, x1, base, size, t) {
    c.save();
    c.fillStyle = "#0b0a0d";
    c.beginPath();
    c.ellipse((x0 + x1) / 2, base + size * 0.6, (x1 - x0) * 0.7, size * 1.6, 0, Math.PI, TAU);
    c.fill();
    for (let i = 0; i < 5; i++) {
      const hx = x0 + ((i + 0.5) / 5) * (x1 - x0),
        hw = size * (0.8 + rnd(i + 620) * 0.4),
        top = base - size * (0.7 + rnd(i + 621) * 0.5) - Math.sin(((i + 0.5) / 5) * Math.PI) * size * 0.8;
      c.fillStyle = "#121015";
      c.fillRect(hx - hw / 2, top, hw, base - top + size);
      c.fillStyle = TILE_DARK;
      c.beginPath();
      c.moveTo(hx - hw * 0.6, top);
      c.lineTo(hx, top - size * 0.3);
      c.lineTo(hx + hw * 0.6, top);
      c.closePath();
      c.fill();
      const f = 0.85 + Math.sin(t * 5 + i) * 0.1;
      glow(c, hx, top + size * 0.3, size * 0.4, `rgba(255,190,90,${0.3 * f})`);
      c.fillStyle = "rgba(255,205,120,0.85)";
      c.fillRect(hx - size * 0.06, top + size * 0.22, size * 0.12, size * 0.15);
    }
    c.restore();
  }

  // A window in the house wall at night, rain streaming past, cool light spilling in.
  function rainWindow(c, x, y, ww, wh, t) {
    c.save();
    glow(c, x, y + wh, ww * 2.2, "rgba(150,180,220,0.1)");
    c.fillStyle = "#1a0f08";
    c.beginPath();
    c.roundRect(x - ww / 2 - 6, y - wh / 2 - 6, ww + 12, wh + 12, [ww * 0.55, ww * 0.55, 3, 3]);
    c.fill();
    c.beginPath();
    c.roundRect(x - ww / 2, y - wh / 2, ww, wh, [ww * 0.5, ww * 0.5, 2, 2]);
    const g = c.createLinearGradient(0, y - wh / 2, 0, y + wh / 2);
    g.addColorStop(0, "#1c2533");
    g.addColorStop(1, "#2c3644");
    c.fillStyle = g;
    c.fill();
    c.clip();
    c.strokeStyle = "rgba(200,220,245,0.45)";
    c.lineWidth = 1;
    for (let i = 0; i < 24; i++) {
      const k = (t * (1.6 + rnd(i + 640) * 0.8) + rnd(i + 641)) % 1;
      const rx = x - ww / 2 + rnd(i + 642) * ww * 1.2 - k * ww * 0.15,
        ry = y - wh / 2 - 10 + k * (wh + 20);
      c.beginPath();
      c.moveTo(rx, ry);
      c.lineTo(rx - 2, ry + 9);
      c.stroke();
    }
    c.restore();
    // The wooden bar across, and drops gathering on the sill and falling.
    c.save();
    c.fillStyle = "#2a170b";
    c.fillRect(x - 2, y - wh / 2, 4, wh);
    c.fillRect(x - ww / 2 - 8, y + wh / 2 + 4, ww + 16, 6);
    for (let i = 0; i < 3; i++) {
      const life = (t * 0.8 + i / 3) % 1;
      c.fillStyle = `rgba(190,215,245,${0.8 * (1 - life)})`;
      c.beginPath();
      c.ellipse(x - ww * 0.3 + i * ww * 0.3, y + wh / 2 + 12 + life * wh * 0.5, 1.6, 2.4, 0, 0, TAU);
      c.fill();
    }
    c.restore();
  }

  /* ---------------- Ground and ledges ---------------- */
  function ground(c, x0, x1, top, bottom, theme, t) {
    c.save();
    if (theme === "gorge") {
      const g = c.createLinearGradient(0, top, 0, bottom);
      g.addColorStop(0, "#26303a");
      g.addColorStop(1, "#0b1016");
      c.fillStyle = g;
      c.fillRect(x0, top, x1 - x0, bottom - top);
      for (let i = 0; i < 9; i++) {
        c.fillStyle = "#3a4552";
        c.beginPath();
        c.ellipse(x0 + (x1 - x0) * rnd(i + 3), top + 4, 14 + rnd(i) * 20, 7, 0, Math.PI, TAU);
        c.fill();
      }
      c.strokeStyle = `rgba(170,200,255,${0.25 + Math.sin(t * 2) * 0.05})`;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x0, top);
      c.lineTo(x1, top);
      c.stroke();
    } else if (theme === "spring") {
      // The dry bed of the spring: cracked earth and pale pebbles in the moonlight.
      const g = c.createLinearGradient(0, top, 0, bottom);
      g.addColorStop(0, "#5a4329");
      g.addColorStop(1, "#140d07");
      c.fillStyle = g;
      c.fillRect(x0, top, x1 - x0, bottom - top);
      c.strokeStyle = "rgba(20,12,6,0.7)";
      c.lineWidth = 1.2;
      const span = x1 - x0;
      const n = Math.max(3, Math.min(60, Math.round(span / 46)));
      for (let i = 0; i < n; i++) {
        let cx = x0 + ((i + rnd(i + 200)) * span) / n,
          cy = top + 1;
        c.beginPath();
        c.moveTo(cx, cy);
        for (let j = 0; j < 4; j++) {
          cx += (rnd(i * 7 + j + 210) - 0.5) * 18;
          cy += 4 + rnd(i * 5 + j + 220) * 7;
          c.lineTo(cx, cy);
        }
        c.stroke();
      }
      c.fillStyle = "rgba(160,145,115,0.5)";
      for (let i = 0; i < n; i++) {
        c.beginPath();
        c.ellipse(x0 + span * rnd(i + 230), top + 2, 3 + rnd(i + 231) * 5, 2, 0, Math.PI, TAU);
        c.fill();
      }
      c.strokeStyle = "rgba(255,220,170,0.25)";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x0, top);
      c.lineTo(x1, top);
      c.stroke();
    } else {
      const g = c.createLinearGradient(0, top, 0, bottom);
      g.addColorStop(0, theme === "loom" ? "#3a2618" : theme === "press" ? "#2e261c" : "#4a2e1b");
      g.addColorStop(1, "#140c07");
      c.fillStyle = g;
      c.fillRect(x0, top, x1 - x0, bottom - top);
      c.strokeStyle = "rgba(255,190,120,0.28)";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x0, top);
      c.lineTo(x1, top);
      c.stroke();
      if (theme === "loom") {
        // A folded Kabyle blanket on the floor.
        c.globalAlpha = 0.5;
        bandTriangles(c, x0, top + 6, x1, top + 6, 9, "#7a2219", "#b8892f");
      }
    }
    c.restore();
  }

  // Kitchen shelves and loom beams are wood; the gorge keeps the original stone.
  function ledge(c, x, top, w, alpha, shake, theme) {
    if (theme === "gorge") return false;
    if (theme === "spring") {
      // A dry-stone terrace: flat stones laid without mortar, a pale capstone on top.
      const h = Math.max(10, w * 0.11);
      c.save();
      c.globalAlpha *= alpha;
      c.translate(shake, 0);
      c.fillStyle = STONE_DARK;
      c.shadowColor = "rgba(255,210,150,0.25)";
      c.shadowBlur = 8;
      c.beginPath();
      c.roundRect(x - w / 2, top - h * 0.15, w, h * 1.6, h * 0.2);
      c.fill();
      c.shadowBlur = 0;
      const seed = Math.round(w);
      for (let row = 0; row < 2; row++) {
        const ry = top + h * 0.3 + row * h * 0.62,
          rh = h * 0.55;
        for (let sx = x - w / 2 + 1, j = 0; sx < x + w / 2 - 2; j++) {
          const sw = Math.min(x + w / 2 - 1 - sx, h * (0.9 + rnd(j * 3 + row * 17 + seed) * 0.9));
          c.fillStyle = rnd(j + row * 11 + seed + 5) > 0.5 ? STONE : "#665a49";
          c.beginPath();
          c.roundRect(sx + 0.5, ry, Math.max(1, sw - 1.5), rh, rh * 0.3);
          c.fill();
          sx += Math.max(2, sw);
        }
      }
      const g = c.createLinearGradient(0, top - h * 0.2, 0, top + h * 0.3);
      g.addColorStop(0, STONE_LIGHT);
      g.addColorStop(1, STONE);
      c.fillStyle = g;
      c.beginPath();
      c.roundRect(x - w / 2 - 2, top - h * 0.2, w + 4, h * 0.45, h * 0.15);
      c.fill();
      c.strokeStyle = "rgba(255,235,200,0.45)";
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(x - w / 2, top - h * 0.2);
      c.lineTo(x + w / 2, top - h * 0.2);
      c.stroke();
      c.restore();
      return true;
    }
    if (theme === "roofs") {
      const h = Math.max(10, w * 0.12);
      c.save();
      c.globalAlpha *= alpha;
      c.translate(shake, 0);
      c.fillStyle = "#3b2f2a";
      c.fillRect(x - w / 2, top, w, h * 2.4);
      c.fillStyle = "#6a5a50";
      c.fillRect(x - w / 2, top - h * 0.15, w, h * 0.35);
      c.fillStyle = TILE;
      for (let tx = x - w / 2; tx < x + w / 2 - 2; tx += h * 0.9) {
        c.beginPath();
        c.arc(tx + h * 0.45, top + h * 0.35, h * 0.42, 0, Math.PI);
        c.fill();
      }
      c.restore();
      return true;
    }
    const h = Math.max(8, w * 0.09);
    c.save();
    c.globalAlpha *= alpha;
    c.translate(shake, 0);
    const g = c.createLinearGradient(0, top, 0, top + h);
    g.addColorStop(0, theme === "loom" ? "#8a6440" : theme === "press" ? "#6d4a2a" : "#9a6a3c");
    g.addColorStop(1, "#3a2414");
    c.fillStyle = g;
    c.shadowColor = "rgba(255,180,110,0.35)";
    c.shadowBlur = 10;
    c.beginPath();
    c.roundRect(x - w / 2, top - h * 0.2, w, h, h * 0.25);
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(40,22,10,0.6)";
    c.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      c.beginPath();
      c.moveTo(x - w / 2 + 4, top - h * 0.2 + (h * i) / 4);
      c.bezierCurveTo(x - w / 6, top + (h * i) / 4 + 2, x + w / 6, top + (h * i) / 4 - 2, x + w / 2 - 4, top - h * 0.2 + (h * i) / 4);
      c.stroke();
    }
    if (theme === "kitchen") {
      // Brackets under the shelf.
      c.fillStyle = "#2a180c";
      for (const sx of [-0.35, 0.35]) {
        c.beginPath();
        c.moveTo(x + w * sx - 4, top + h * 0.8);
        c.lineTo(x + w * sx + 4, top + h * 0.8);
        c.lineTo(x + w * sx, top + h * 2.2);
        c.closePath();
        c.fill();
      }
    }
    c.restore();
    return true;
  }

  /* ---------------- Hunters ---------------- */
  function hunter(c, kind, x, y, size, t, mood, extra = {}) {
    if (kind === "pot") pot(c, x, y, size, t, mood, extra);
    else if (kind === "spider") spiderHunter(c, x, y, size, t, mood, extra);
    else if (kind === "raven") raven(c, x, y, size, t, mood, extra);
    else if (kind === "rat") rat(c, x, y, size, t, mood, extra);
    else if (kind === "frog") frog(c, x, y, size, t, mood, extra);
    else ijenni(c, x, y, size, t, mood, extra);
    if (extra.ring) {
      c.save();
      c.strokeStyle = `rgba(255,220,150,${extra.ring})`;
      c.setLineDash([size * 0.12, size * 0.12]);
      c.lineWidth = Math.max(1, size * 0.025);
      c.beginPath();
      c.arc(x, y, extra.rangePx, 0, TAU);
      c.stroke();
      c.restore();
    }
  }

  function eyes(c, x, y, spread, size, mood, t, color) {
    const open = mood === "sleep" ? 0 : mood === "notice" ? 1.2 : 1;
    for (const sx of [-1, 1]) {
      const ex = x + sx * spread;
      if (open === 0) {
        c.strokeStyle = "rgba(255,220,160,0.6)";
        c.lineWidth = Math.max(1, size * 0.05);
        c.beginPath();
        c.arc(ex, y, size * 0.12, 0.2, Math.PI - 0.2);
        c.stroke();
        continue;
      }
      const flick = mood === "chase" ? 0.85 + Math.sin(t * 20 + sx) * 0.15 : 1;
      glow(c, ex, y, size * 0.35 * open, color.replace("A", String(0.6 * flick)));
      c.fillStyle = color.replace("A", "1");
      c.beginPath();
      c.ellipse(ex, y, size * 0.1 * open, size * 0.13 * open, 0, 0, TAU);
      c.fill();
    }
  }

  // Teryel's pots: terracotta, painted with the pottery signs, eyes glowing on the belly.
  function pot(c, x, y, size, t, mood, extra) {
    const phase = Math.abs(Math.sin(t * 9 + x));
    const hop = mood === "chase" ? phase * size * 0.14 : mood === "sleep" ? 0 : Math.sin(t * 2 + x) * size * 0.03;
    // Squash where the hop meets the ground, stretch at the top; breathe when asleep.
    let sx = 1,
      sy = 1;
    if (mood === "chase") {
      const squash = Math.max(0, 0.25 - phase) * 0.7;
      sy = 1 - squash + phase * 0.05;
      sx = 1 + squash * 0.8;
    } else if (mood === "sleep") sy = 1 + Math.sin(t * 1.3 + x) * 0.025;
    else if (mood === "notice") {
      sy = 1.12;
      sx = 0.92;
    }
    c.save();
    c.translate(x, y - hop + (1 - sy) * size * 0.5);
    if (mood === "roll" || mood === "flung") c.rotate(extra.spin || 0);
    else if (mood === "chase") c.rotate(Math.sin(t * 9 + x) * 0.12);
    else c.rotate(Math.sin(t * 1.7 + x) * 0.04);
    c.scale(sx, sy);
    const w = size * 0.95,
      h = size * 1.0;
    glow(c, 0, 0, size * (mood === "chase" ? 1.2 : 0.85), mood === "sleep" ? "rgba(255,150,80,0.12)" : "rgba(255,160,80,0.28)");
    const g = c.createRadialGradient(-w * 0.2, -h * 0.2, w * 0.1, 0, 0, w * 0.7);
    g.addColorStop(0, CLAY_LIGHT);
    g.addColorStop(0.6, CLAY);
    g.addColorStop(1, CLAY_DARK);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-w * 0.18, -h * 0.5);
    c.quadraticCurveTo(-w * 0.62, -h * 0.25, -w * 0.48, h * 0.3);
    c.quadraticCurveTo(-w * 0.3, h * 0.52, 0, h * 0.52);
    c.quadraticCurveTo(w * 0.3, h * 0.52, w * 0.48, h * 0.3);
    c.quadraticCurveTo(w * 0.62, -h * 0.25, w * 0.18, -h * 0.5);
    c.closePath();
    c.fill();
    c.fillStyle = CLAY_DARK;
    c.beginPath();
    c.ellipse(0, -h * 0.5, w * 0.22, h * 0.07, 0, 0, TAU);
    c.fill();
    // Painted band: black triangles over a cream line, red lozenge.
    c.save();
    c.beginPath();
    c.ellipse(0, 0, w * 0.55, h * 0.52, 0, 0, TAU);
    c.clip();
    c.fillStyle = CREAM;
    c.fillRect(-w, -h * 0.18, w * 2, h * 0.06);
    bandTriangles(c, -w * 0.6, -h * 0.12, w * 0.6, -h * 0.12, w * 0.12, INK, "rgba(0,0,0,0)");
    c.fillStyle = RED;
    c.beginPath();
    c.moveTo(0, h * 0.28);
    c.lineTo(w * 0.08, h * 0.36);
    c.lineTo(0, h * 0.44);
    c.lineTo(-w * 0.08, h * 0.36);
    c.closePath();
    c.fill();
    c.restore();
    eyes(c, 0, h * 0.1, w * 0.17, size, mood, t, "rgba(255,210,110,A)");
    c.restore();
  }

  function spiderHunter(c, x, y, size, t, mood) {
    y += Math.sin(t * (mood === "chase" ? 7 : 2) + x) * size * 0.06;
    thread(c, x, y - size * 0.35, -10, 0.35);
    const scurry = mood === "chase" ? Math.sin(t * 24) * 0.12 : Math.sin(t * 2) * 0.08;
    c.save();
    c.shadowColor = "rgba(160,180,255,0.6)";
    c.shadowBlur = size * 0.3;
    centred(c, img.spider_small, x, y, size * 1.05, size * 1.05, scurry);
    c.restore();
    eyes(c, x, y + size * 0.14, size * 0.06, size * 0.6, mood, t, "rgba(255,60,50,A)");
  }

  // Ijenniwen: night spirits of springs and old trees, wisps of smoke with eyes.
  function ijenni(c, x, y, size, t, mood, extra) {
    const vx = extra.vx || 0,
      vy = extra.vy || 0;
    c.save();
    c.globalAlpha *= 0.82 + Math.sin(t * 11 + x) * 0.1 + Math.sin(t * 3.7) * 0.08;
    const tailX = -vx * size * 0.12,
      tailY = -vy * size * 0.12 + size * 0.35;
    c.save();
    for (let i = 5; i >= 0; i--) {
      const k = i / 5;
      const px = x + tailX * k + Math.sin(t * 3 + i) * size * 0.08,
        py = y + tailY * k;
      const r = size * (0.5 - k * 0.3);
      const a = (mood === "sleep" ? 0.25 : 0.45) * (1 - k * 0.6);
      const g = c.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, `rgba(200,225,255,${a})`);
      g.addColorStop(1, "rgba(120,150,210,0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(px, py, r, 0, TAU);
      c.fill();
    }
    c.restore();
    const blinking = (t + x) % 4.3 < 0.12;
    eyes(c, x, y - size * 0.05, size * 0.16, size * 0.9, blinking ? "sleep" : mood, t, "rgba(210,240,255,A)");
    c.restore();
  }

  /* ---------------- Objects: Teryel, updrafts ---------------- */
  function object(c, o, X, Y, S, t, g) {
    if (o.type === "teryel") {
      teryel(c, X(o.x), Y(o.y), o.r * S, t, {
        asleep: !o.dx && !o.dy && !o.trapped,
        trapped: o.trapped,
        theme: g.level.theme,
        moving: Boolean(o.dx || o.dy),
        look: Math.max(-1, Math.min(1, (g.hero.x - o.x) / 4)),
        near: Math.hypot(g.hero.x - o.x, g.hero.y - o.y) < (o.r || 1) + 3,
      });
      return true;
    }
    if (o.type === "wind") {
      updraft(c, X(o.x), Y(o.y + o.h / 2), (o.w || 2) * S, (o.h || 3) * S, t);
      return true;
    }
    if (o.type === "water") {
      water(c, o, X, Y, S, t, g);
      return true;
    }
    return false;
  }

  function updraft(c, x, top, w, h, t) {
    c.save();
    const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, "rgba(180,200,240,0)");
    g.addColorStop(0.5, "rgba(180,200,240,0.1)");
    g.addColorStop(1, "rgba(180,200,240,0)");
    c.fillStyle = g;
    c.fillRect(x - w / 2, top, w, h);
    c.strokeStyle = "rgba(220,232,255,0.35)";
    c.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) {
      const k = (t * 0.8 + rnd(i)) % 1;
      const sx = x - w / 2 + w * rnd(i + 5);
      const sy = top + h * (1 - k);
      c.globalAlpha = Math.sin(k * Math.PI);
      c.beginPath();
      c.moveTo(sx, sy);
      c.quadraticCurveTo(sx + Math.sin(t * 4 + i) * 6, sy - h * 0.06, sx, sy - h * 0.12);
      c.stroke();
    }
    c.restore();
  }

  // Teryel: a huge hunched shape, long hair, amber eyes, big hands. Asleep, awake, or trapped.
  function teryel(c, x, y, r, t, st = {}) {
    const sway = st.moving && !st.trapped ? Math.sin(t * 3) * r * 0.05 : 0;
    // Asleep she breathes; walking she rocks; trapped she struggles in bursts.
    const breathe = st.asleep ? Math.sin(t * 1.4) * r * 0.04 : st.moving && !st.trapped ? Math.abs(Math.sin(t * 3)) * r * 0.05 : 0;
    const struggle = st.trapped && t % 2.6 < 0.7 ? Math.sin(t * 40) * r * 0.04 : 0;
    const H = r * 2.3,
      W = r * 2.1;
    c.save();
    c.translate(x + sway + struggle, y + r);
    // Carried off by the flood she rolls over and over in the white water.
    const tumble = tumbleOf(st, t);
    if (tumble) {
      c.translate(0, -H * 0.5);
      c.rotate(tumble);
      c.translate(0, H * 0.5);
    }
    glow(c, 0, -H * 0.5, W, st.trapped ? "rgba(255,200,120,0.12)" : st.near ? "rgba(255,90,40,0.32)" : "rgba(255,120,60,0.22)");
    // Body: a dark mound with hair falling over it.
    c.fillStyle = "#0b0706";
    c.shadowColor = "rgba(255,150,90,0.4)";
    c.shadowBlur = r * 0.4;
    c.beginPath();
    c.moveTo(-W * 0.55, 0);
    c.quadraticCurveTo(-W * 0.6, -H * 0.6 - breathe, -W * 0.15, -H * 0.85 - breathe);
    c.quadraticCurveTo(0, -H * 1.02 - breathe, W * 0.18, -H * 0.85 - breathe);
    c.quadraticCurveTo(W * 0.62, -H * 0.6 - breathe, W * 0.55, 0);
    c.closePath();
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(40,30,28,0.9)";
    c.lineWidth = Math.max(1.5, r * 0.04);
    for (let i = 0; i < 9; i++) {
      const hx = -W * 0.35 + (W * 0.7 * i) / 8;
      c.beginPath();
      c.moveTo(hx * 0.4, -H * 0.86 - breathe);
      c.quadraticCurveTo(hx * 1.2, -H * 0.4, hx * 1.1 + Math.sin(t + i) * 2, -H * 0.05);
      c.stroke();
    }
    // Hands on the floor.
    c.fillStyle = "#120c0a";
    for (const sx of [-1, 1]) {
      c.beginPath();
      c.ellipse(sx * W * 0.45, -r * 0.08, r * 0.32, r * 0.14, 0, 0, TAU);
      c.fill();
    }
    // Eyes: closed when asleep, burning when awake, dim when trapped.
    const ey = -H * 0.68 - breathe;
    const lookX = (st.look || 0) * W * 0.05;
    for (const sx of [-1, 1]) {
      const ex = sx * W * 0.12 + lookX;
      if (st.asleep) {
        c.strokeStyle = "rgba(255,170,80,0.7)";
        c.lineWidth = Math.max(1.5, r * 0.05);
        c.beginPath();
        c.arc(ex, ey, r * 0.1, 0.2, Math.PI - 0.2);
        c.stroke();
      } else if (st.trapped) {
        c.strokeStyle = "rgba(255,200,140,0.7)";
        c.lineWidth = Math.max(1.5, r * 0.05);
        c.beginPath();
        c.moveTo(ex - r * 0.08, ey - r * 0.08);
        c.lineTo(ex + r * 0.08, ey + r * 0.08);
        c.moveTo(ex + r * 0.08, ey - r * 0.08);
        c.lineTo(ex - r * 0.08, ey + r * 0.08);
        c.stroke();
      } else {
        glow(c, ex, ey, r * 0.3, "rgba(255,140,40,0.8)");
        c.fillStyle = "#ffcf6a";
        c.beginPath();
        c.ellipse(ex, ey, r * 0.08, r * 0.05, sx * 0.3, 0, TAU);
        c.fill();
      }
    }
    if (st.asleep) {
      c.fillStyle = "rgba(255,220,170,0.6)";
      c.font = `${Math.round(r * 0.35)}px sans-serif`;
      const k = (t * 0.4) % 1;
      c.globalAlpha = 1 - k;
      c.fillText("z", W * 0.3 + k * r * 0.4, -H - k * r);
      c.globalAlpha = 1;
    }
    if (st.trapped) trappedOverlay(c, st.theme, W, H, r, t, st);
    c.restore();
  }

  function tumbleOf(st, t) {
    return st.trapped && st.theme === "spring" ? Math.sin(t * 2.3) * 0.28 : 0;
  }

  // st.bride === false keeps the ladle bride out of the spring overlay (a scene that
  // already shows her elsewhere).
  function trappedOverlay(c, theme, W, H, r, t, st = {}) {
    if (theme === "kitchen") {
      // The great grain jar over her head like a hat.
      c.save();
      c.translate(0, -H * 0.72);
      bigJar(c, 0, H * 0.25, W * 0.85, H * 0.6, 1);
      c.restore();
    } else if (theme === "loom") {
      // Wound in her own threads like a shuttle.
      c.save();
      c.strokeStyle = "rgba(240,235,220,0.85)";
      c.lineWidth = Math.max(1.2, r * 0.035);
      for (let i = 0; i < 12; i++) {
        const yy = -H * (0.1 + i * 0.07);
        c.beginPath();
        c.ellipse(0, yy, W * (0.58 - i * 0.02), r * 0.12, Math.sin(i) * 0.15, 0, TAU);
        c.stroke();
      }
      c.restore();
    } else if (theme === "press") {
      // Pinned flat under the great beam, oil running off her hair.
      c.save();
      c.rotate(-0.08);
      pressBeam(c, 0, -H * 0.62, W * 1.5, r * 0.5, t);
      c.restore();
      for (let i = 0; i < 4; i++) {
        const life = (t * 0.6 + i / 4) % 1;
        c.fillStyle = `rgba(196,170,60,${0.8 * (1 - life)})`;
        c.beginPath();
        c.ellipse(-W * 0.3 + i * W * 0.2, -H * 0.4 + life * H * 0.4, r * 0.03, r * 0.05, 0, 0, TAU);
        c.fill();
      }
    } else if (theme === "spring") {
      // Swept down the ravine in white water, rolling; the ladle bride flies free.
      c.save();
      c.translate(0, -H * 0.5);
      c.rotate(-tumbleOf(st, t));
      c.translate(0, H * 0.5);
      for (let i = 0; i < 14; i++) {
        const k = (t * 0.8 + rnd(i + 700)) % 1;
        c.fillStyle = FOAM + (0.55 + rnd(i + 701) * 0.35) * Math.sin(k * Math.PI) + ")";
        c.beginPath();
        c.ellipse(-W * 0.9 + k * W * 1.8, -H * (0.05 + rnd(i + 710) * 0.4), r * (0.25 + rnd(i + 720) * 0.25), r * (0.14 + rnd(i + 730) * 0.12), 0, 0, TAU);
        c.fill();
      }
      c.fillStyle = FOAM + "0.88)";
      c.beginPath();
      c.moveTo(-W * 0.85, r * 0.1);
      for (let i = 0; i <= 8; i++) c.lineTo(-W * 0.85 + i * W * 0.2125, -H * (0.2 + 0.08 * Math.sin(t * 5 + i * 1.7)));
      c.lineTo(W * 0.85, r * 0.1);
      c.closePath();
      c.fill();
      for (let i = 0; i < 6; i++) {
        const life = (t * 1.2 + i / 6) % 1;
        c.fillStyle = FOAM + 0.8 * (1 - life) + ")";
        c.beginPath();
        c.arc(Math.sin(i * 2.1) * W * 0.5 + life * W * 0.2, -H * (0.25 + life * 0.45), r * 0.05, 0, TAU);
        c.fill();
      }
      c.restore();
      if (st.bride !== false) tislit(c, W * 0.6 + Math.sin(t * 1.5) * r * 0.1, -H * 1.0 + Math.sin(t * 2) * r * 0.1, r * 0.9, t, { tilt: Math.sin(t * 1.3) * 0.4 });
    } else if (theme === "roofs") {
      // Halfway down the chimney: the bricks hold her lower half.
      c.save();
      c.fillStyle = "#5a2e20";
      c.fillRect(-W * 0.38, -H * 0.55, W * 0.76, H * 0.58);
      c.strokeStyle = "rgba(30,12,6,0.7)";
      c.lineWidth = 1.2;
      for (let row = 0; row < 5; row++) {
        const yy = -H * 0.55 + (row * H * 0.58) / 5;
        c.beginPath();
        c.moveTo(-W * 0.38, yy);
        c.lineTo(W * 0.38, yy);
        c.stroke();
        for (let col = 0; col < 4; col++) {
          const xx = -W * 0.38 + ((col + (row % 2) * 0.5) * W * 0.76) / 4;
          c.beginPath();
          c.moveTo(xx, yy);
          c.lineTo(xx, yy + (H * 0.58) / 5);
          c.stroke();
        }
      }
      c.fillStyle = "#3a1c12";
      c.fillRect(-W * 0.44, -H * 0.6, W * 0.88, H * 0.08);
      c.restore();
      for (let i = 0; i < 3; i++) {
        const a = t * 3 + (i * TAU) / 3;
        c.fillStyle = "rgba(255,230,160,0.8)";
        c.beginPath();
        c.arc(Math.cos(a) * W * 0.25, -H * 1.05 + Math.sin(a) * r * 0.1, r * 0.06, 0, TAU);
        c.fill();
      }
    } else {
      // Dazed under the gate stone.
      for (let i = 0; i < 3; i++) {
        const a = t * 3 + (i * TAU) / 3;
        c.fillStyle = "rgba(255,230,160,0.8)";
        c.beginPath();
        c.arc(Math.cos(a) * W * 0.25, -H * 1.05 + Math.sin(a) * r * 0.1, r * 0.06, 0, TAU);
        c.fill();
      }
    }
  }

  /* ---------------- The house door ---------------- */
  function door(c, x, bottom, S, view, g, t) {
    if (g.level.theme === "gorge") return false;
    const dh = 2.3 * S,
      dw = 1.35 * S;
    const open = view.enterFrame !== undefined ? 1 : (view.doorFrame || 0) / 5;
    c.save();
    // Frame and the dark doorway.
    c.fillStyle = "#1a100a";
    c.beginPath();
    c.moveTo(x - dw / 2 - 6, bottom);
    c.lineTo(x - dw / 2 - 6, bottom - dh * 0.78);
    c.quadraticCurveTo(x, bottom - dh - 10, x + dw / 2 + 6, bottom - dh * 0.78);
    c.lineTo(x + dw / 2 + 6, bottom);
    c.closePath();
    c.fill();
    if (!g.sealed) glow(c, x, bottom - dh * 0.45, dh * 0.6, `rgba(255,200,110,${0.18 + open * 0.25})`);
    // The leaf swings open: drawn narrower as it turns.
    const leaf = 1 - open * 0.85;
    c.translate(x - dw / 2, 0);
    c.scale(leaf, 1);
    const grd = c.createLinearGradient(0, 0, dw, 0);
    grd.addColorStop(0, "#6b4426");
    grd.addColorStop(1, "#4a2c17");
    c.fillStyle = grd;
    c.beginPath();
    c.moveTo(0, bottom);
    c.lineTo(0, bottom - dh * 0.76);
    c.quadraticCurveTo(dw / 2, bottom - dh - 4, dw, bottom - dh * 0.76);
    c.lineTo(dw, bottom);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(30,16,8,0.7)";
    c.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) {
      c.beginPath();
      c.moveTo((dw * i) / 4, bottom - 2);
      c.lineTo((dw * i) / 4, bottom - dh * 0.82);
      c.stroke();
    }
    // Carved band of triangles and the iron studs.
    bandTriangles(c, dw * 0.1, bottom - dh * 0.55, dw * 0.9, bottom - dh * 0.55, dw * 0.1, "#2a170b", "rgba(0,0,0,0)");
    c.fillStyle = "#1b1b1f";
    for (const [sx, sy] of [
      [0.2, 0.3],
      [0.8, 0.3],
      [0.2, 0.72],
      [0.8, 0.72],
    ]) {
      c.beginPath();
      c.arc(dw * sx, bottom - dh * sy, Math.max(1.5, S * 0.05), 0, TAU);
      c.fill();
    }
    c.restore();
    if (g.sealed) {
      // Barred until Teryel is trapped.
      c.save();
      c.strokeStyle = "#2c1b10";
      c.lineWidth = S * 0.18;
      c.beginPath();
      c.moveTo(x - dw / 2 - 8, bottom - dh * 0.45);
      c.lineTo(x + dw / 2 + 8, bottom - dh * 0.45);
      c.stroke();
      c.restore();
    }
    if (view.enterFrame !== undefined) {
      // Mqidec goes through: a small shape shrinking into the light.
      const k = Math.min(1, view.enterFrame / 11);
      c.save();
      c.globalAlpha = 1 - k;
      Art.rabbit(c, x, bottom - S * 0.5 - k * S * 0.3, S * (1 - k * 0.7), { time: t, state: "resting" });
      c.restore();
    }
    return true;
  }

  function heroLamp(c, x, y, S, t) {
    c.save();
    c.translate(x + S * 0.42, y + S * 0.15);
    c.scale(S / 90, S / 90);
    oilLamp(c, 0, 0, t);
    c.restore();
    glow(c, x + S * 0.6, y - S * 0.1, S * 2.4, `rgba(255,190,90,${0.16 + Math.sin(t * 9) * 0.03})`);
  }

  /* ---------------- Story scenes ---------------- */
  // view: {speaker, lineAge}
  function scene(c, name, w, h, t, view = {}) {
    // Slow drift and a breathing zoom; a short push-in on every new line.
    const age = view.lineAge === undefined ? 9 : view.lineAge;
    // Push-in: eases up over the first 0.4 s of a line, then settles back.
    const push = age < 0.4 ? Math.sin((age / 0.4) * (Math.PI / 2)) * 0.04 : Math.max(0, 0.04 - (age - 0.4) * 0.05);
    const zoom = 1.05 + Math.sin(t * 0.17) * 0.02 + push;
    c.save();
    c.translate(w / 2 + Math.sin(t * 0.13) * w * 0.008, h * 0.6);
    c.scale(zoom, zoom);
    c.translate(-w / 2, -h * 0.6);
    sceneBody(c, name, w, h, t, view);
    c.restore();
    particles(c, name, w, h, t);
    if (view.flash) {
      c.fillStyle = `rgba(255,240,220,${view.flash})`;
      c.fillRect(0, 0, w, h);
    }
  }

  // One ember sprite, drawn once; each frame only places copies of it.
  let emberSprite = null;
  function ember() {
    if (emberSprite) return emberSprite;
    emberSprite = document.createElement("canvas");
    emberSprite.width = emberSprite.height = 16;
    glow(emberSprite.getContext("2d"), 8, 8, 8, "rgba(255,180,80,0.9)");
    return emberSprite;
  }
  // Embers rise from fires, dust hangs in the rooms, mist drifts in the gorge.
  function particles(c, name, w, h, t) {
    const hearth = name === "hearth" || name === "hearth-rain";
    if (hearth || name.startsWith("kitchen")) {
      const sprite = ember();
      c.save();
      for (let i = 0; i < 16; i++) {
        const k = (t * (0.12 + rnd(i) * 0.1) + rnd(i + 3)) % 1;
        const x = w * (hearth ? 0.5 : 0.1) + (rnd(i + 5) - 0.5) * w * 0.25 + Math.sin(t * 2 + i) * 10;
        const y = h * 0.7 - k * h * 0.6;
        c.globalAlpha = (1 - k) * 0.9;
        c.drawImage(sprite, x - 4, y - 4, 8, 8);
      }
      c.restore();
    }
    if (name.startsWith("kitchen") || name.startsWith("loom") || name.startsWith("press") || hearth) {
      for (let i = 0; i < 22; i++) {
        const x = w * ((rnd(i + 40) + t * 0.004 * (1 + rnd(i))) % 1);
        const y = h * ((rnd(i + 60) + Math.sin(t * 0.3 + i) * 0.02) % 1);
        c.fillStyle = `rgba(255,225,180,${0.1 + rnd(i) * 0.12})`;
        c.fillRect(x, y, 1.5, 1.5);
      }
    }
    if (name.startsWith("gorge") || name.startsWith("citadel") || name === "home" || name === "roof") {
      for (let i = 0; i < 3; i++) {
        const y = h * (0.58 + i * 0.07) + Math.sin(t * 0.3 + i) * 6;
        const g = c.createLinearGradient(0, y - 30, 0, y + 30);
        g.addColorStop(0, "rgba(180,195,220,0)");
        g.addColorStop(0.5, "rgba(180,195,220,0.12)");
        g.addColorStop(1, "rgba(180,195,220,0)");
        c.fillStyle = g;
        c.fillRect(0, y - 30, w, 60);
      }
    }
    if (name === "spring" || name === "spring-cistern") {
      // A hot night: heat motes drifting up, fireflies blinking over the dry bed.
      for (let i = 0; i < 18; i++) {
        const y = h * ((((rnd(i + 760) - t * 0.01 * (1 + rnd(i + 761))) % 1) + 1) % 1);
        c.fillStyle = `rgba(255,220,170,${0.08 + rnd(i + 762) * 0.12})`;
        c.fillRect(w * rnd(i + 763) + Math.sin(t * 0.5 + i) * 8, y, 1.5, 1.5);
      }
      for (let i = 0; i < 7; i++) {
        const x = w * ((rnd(i + 770) + Math.sin(t * 0.2 + i) * 0.04 + 1) % 1);
        const y = h * (0.35 + rnd(i + 771) * 0.35) + Math.sin(t * 1.1 + i * 2) * 8;
        const a = Math.max(0, 0.15 + 0.45 * Math.sin(t * 2.3 + i * 1.9));
        glow(c, x, y, 7, `rgba(210,255,150,${a})`);
      }
    }
    if (name === "spring-trap") {
      // Spray thrown up off the flood.
      for (let i = 0; i < 26; i++) {
        const k = (t * (0.7 + rnd(i + 780) * 0.5) + rnd(i + 781)) % 1;
        const x = w * (0.3 + rnd(i + 782) * 0.7) + k * w * 0.15;
        const y = h * 0.7 - Math.sin(k * Math.PI) * h * (0.12 + rnd(i + 783) * 0.15);
        c.fillStyle = FOAM + 0.7 * (1 - k) + ")";
        c.beginPath();
        c.arc(x, y, 1.5 + rnd(i + 784) * 2, 0, TAU);
        c.fill();
      }
    }
    if (name === "spring-rain") rainfall(c, w, h, t, 80, h * 0.7);
  }

  // Rain streaks slanting down, and little splashes where they meet the ground.
  function rainfall(c, w, h, t, count, floorY) {
    c.save();
    c.strokeStyle = "rgba(200,215,240,0.35)";
    c.lineWidth = 1.2;
    for (let i = 0; i < count; i++) {
      const k = (t * (1.4 + rnd(i + 790) * 0.8) + rnd(i + 791)) % 1;
      const x = w * (rnd(i + 792) * 1.2 - k * 0.12),
        y = -20 + k * (h + 40);
      const len = 12 + rnd(i + 793) * 10;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x - len * 0.18, y + len);
      c.stroke();
    }
    c.strokeStyle = "rgba(210,225,245,0.4)";
    for (let i = 0; i < 14; i++) {
      const k = (t * 2 + rnd(i + 795)) % 1;
      const x = w * rnd(i + 796),
        y = floorY + rnd(i + 797) * h * 0.2;
      c.globalAlpha = 1 - k;
      c.beginPath();
      c.ellipse(x, y, 2 + k * 8, 1 + k * 2, 0, 0, TAU);
      c.stroke();
    }
    c.restore();
  }

  function sceneBody(c, name, w, h, t, view) {
    const S = w / 9;
    const floor = h * 0.68;
    const talk = (who) =>
      view.speaker === who ? 1 + Math.max(0, 0.06 - (view.lineAge || 9) * 0.08) + Math.sin(t * 14) * 0.015 * Math.max(0, 1 - (view.lineAge || 9)) : 1;
    const Yw = (yy) => floor - yy * S;
    if (name === "hearth") hearthScene(c, w, h, t, S, floor, view, talk);
    else if (name === "hearth-rain") hearthScene(c, w, h, t, S, floor, view, talk, true);
    else if (name.startsWith("spring")) springScene(c, name, w, h, t, S, floor, Yw, talk);
    else if (name === "home") homeScene(c, w, h, t, S, floor);
    else if (name.startsWith("kitchen")) {
      kitchenBack(c, w, h, t, Yw, S, 8);
      ground(c, 0, w, floor, h, "kitchen", t);
      const sleeping = name !== "kitchen-trap" && view.speaker !== "teryel";
      teryel(c, w * 0.66, floor - S * 1.3, S * 1.3 * talk("teryel"), t, { asleep: sleeping, trapped: name === "kitchen-trap", theme: "kitchen" });
      if (name === "kitchen-sleep") bigJar(c, w * 0.78, floor, S * 0.9, S * 1.0, 1);
      for (let i = 0; i < 3; i++) pot(c, w * (0.12 + i * 0.12), floor - S * 0.5, S * 0.9, t + i, name === "kitchen-trap" ? "sleep" : "hunt", {});
      Art.rabbit(c, w * 0.42, floor - S * 0.55, S * 1.05, { time: t, state: "resting", look: { x: 1, y: 0 } });
      if (name === "kitchen-trap") bigJar(c, w * 0.3, floor, S * 0.8, S * 0.9, 1);
    } else if (name.startsWith("loom") || name === "roof") {
      if (name === "roof") roofScene(c, w, h, t, S, floor);
      else {
        loomBack(c, w, h, t, Yw, S, 10);
        ground(c, 0, w, floor, h, "loom", t);
        // The stolen lamp, woven into the threads, still burning.
        glow(c, w * 0.5, h * 0.3, S * 2.2, `rgba(255,200,110,${0.4 + Math.sin(t * 6) * 0.05})`);
        c.save();
        c.translate(w * 0.5, h * 0.32);
        c.scale(S / 70, S / 70);
        oilLamp(c, 0, 0, t);
        c.restore();
        silkWeb(c, w * 0.5, h * 0.31, S * 1.4, 0.7);
        for (let i = 0; i < 3; i++) spiderHunter(c, w * (0.2 + i * 0.3), h * (0.18 + (i % 2) * 0.12), S * 0.8, t + i, "hunt");
        if (name !== "loom") teryel(c, w * 0.7, floor - S * 1.3, S * 1.3 * talk("teryel"), t, { trapped: name === "loom-trap", theme: "loom", moving: name === "loom-wait" });
        Art.rabbit(c, w * 0.22, floor - S * 0.55, S * 1.05, { time: t, state: "resting", look: { x: 1, y: -0.6 } });
      }
    } else if (name.startsWith("citadel")) {
      roofsBack(c, w, h, t, S, 0.3);
      // A near row of roofs: a slope and a flat roof with its chimney.
      slope(c, { x1: -4.5, y1: 0.4, x2: -0.5, y2: 2.6 }, (x) => w / 2 + x * S, Yw, S, t);
      slope(c, { x1: -0.5, y1: 2.6, x2: 3.5, y2: 0.4 }, (x) => w / 2 + x * S, Yw, S, t);
      c.fillStyle = "#3b2f2a";
      c.fillRect(0, floor + S * 0.2, w, h - floor);
      for (let i = 0; i < 3; i++) raven(c, w * (0.18 + i * 0.3), h * (0.3 + (i % 2) * 0.1) + Math.sin(t * 2 + i) * 5, S * 0.9, t + i, "hunt", { vx: i % 2 ? -1 : 1 });
      if (name === "citadel-teryel" || name === "citadel-trap") {
        const trapped = name === "citadel-trap";
        teryel(c, w * 0.7, floor - S * 1.3, S * 1.3 * talk("teryel"), t, { trapped, theme: "roofs", asleep: false });
        if (!trapped) {
          bread(c, w * 0.7, floor - S * 0.35, S * 0.5);
          stack(c, w * 0.66, h * 0.3, S * 1.2, S * 0.6, t);
        }
      }
      const hx = name === "citadel-trap" ? w * 0.3 : w * 0.5;
      Art.rabbit(c, hx, Yw(2.6) - S * 0.55, S * 1.05, { time: t, state: "resting", look: { x: 1, y: -0.2 } });
      if (name === "citadel-trap") bread(c, hx + S * 0.55, Yw(2.6) - S * 0.35, S * 0.35);
    } else if (name.startsWith("press")) {
      pressBack(c, w, h, t, Yw, S, 8);
      ground(c, 0, w, floor, h, "press", t);
      // The great wheel on the left, turning; a rat on its rim.
      const cx = w * 0.24,
        cy = floor - S * 2.6,
        wr = S * 2;
      const planks = [0, 1, 2, 3].map((i) => {
        const a = -t * 0.35 + (i * TAU) / 4;
        return { x: cx + Math.cos(a) * wr, y: cy + Math.sin(a) * wr };
      });
      wheel(c, cx, cy, wr, planks, S, t);
      for (const p of planks) ledge(c, p.x, p.y, S * 1.2, 1, 0, "press");
      // An oily beam across the room, rats asleep and awake on it.
      ledge(c, w * 0.62, floor - S * 1.8, S * 3.4, 1, 0, "press");
      oil(c, w * 0.62, floor - S * 1.8, S * 3.4, t);
      // Rats: one asleep on the oily beam, the others on the floor, clear of Teryel.
      const withTeryel = name !== "press";
      const rats = withTeryel ? [[0.56, 2.1, "sleep"], [0.93, 0.3, "hunt"]] : [[0.6, 2.1, "sleep"], [0.66, 0.3, "hunt"], [0.88, 0.3, "hunt"]];
      rats.forEach(([rx, ry, mood], i) => rat(c, w * rx, floor - S * ry, S * 0.8, t + i, mood, { vx: -1 }));
      if (name === "press-beam" || name === "press-trap") {
        const trapped = name === "press-trap";
        teryel(c, w * 0.74, floor - S * 1.3, S * 1.3 * talk("teryel"), t, { trapped, theme: "press", moving: !trapped });
        if (!trapped) {
          ledge(c, w * 0.84, floor - S * 3.05, S * 1.8, 1, 0, "press");
          pressBeam(c, w * 0.78, floor - S * 3.6, S * 2.2, S * 0.55, t);
          tabzimt(c, w * 0.66, floor - S * 2.1, S * 0.22, t);
        }
      }
      const hx = name === "press-trap" ? w * 0.36 : w * 0.46;
      Art.rabbit(c, hx, floor - S * 0.55, S * 1.05, { time: t, state: "resting", look: { x: 1, y: -0.3 } });
      if (name === "press-trap") tabzimt(c, hx + S * 0.5, floor - S * 0.75, S * 0.18, t);
    } else if (name.startsWith("gorge")) {
      gorgeBack(c, w, h, t, Yw, S, 0.3);
      ground(c, 0, w, floor, h, "gorge", t);
      for (let i = 0; i < 3; i++) ijenni(c, w * (0.2 + i * 0.28), h * (0.36 + (i % 2) * 0.1) + Math.sin(t + i) * 6, S * 0.9, t + i, "hunt", {});
      if (name === "gorge-gate" || name === "gorge-trap") {
        const down = name === "gorge-trap";
        Art.stoneDisc(c, w * 0.62, down ? floor - S * 0.1 : h * 0.3, S * 2.6);
        if (!down) thread(c, w * 0.62, h * 0.3, -10, 0.6, 0.5, t);
        teryel(c, w * 0.82, floor - S * 1.3, S * 1.3 * talk("teryel"), t, { trapped: down, theme: "gorge", moving: !down });
      }
      Art.rabbit(c, w * 0.3, floor - S * 0.55, S * 1.05, { time: t, state: "resting", look: { x: 1, y: -0.3 } });
      heroLamp(c, w * 0.3, floor - S * 0.55, S * 1.05, t);
    }
  }

  // rain: the window shows the first rain, and the children turn toward it.
  function hearthScene(c, w, h, t, S, floor, view, talk, rain = false) {
    plaster(c, w, h, "#2c1a10", "#0c0705");
    if (rain) rainWindow(c, w * 0.5, h * 0.2, S * 1.3, S * 1.6, t);
    // The wall niche with the lamp, top right.
    c.fillStyle = "#0a0604";
    c.beginPath();
    c.moveTo(w * 0.72, h * 0.3);
    c.lineTo(w * 0.72, h * 0.2);
    c.quadraticCurveTo(w * 0.8, h * 0.12, w * 0.88, h * 0.2);
    c.lineTo(w * 0.88, h * 0.3);
    c.closePath();
    c.fill();
    glow(c, w * 0.8, h * 0.25, S * 2, `rgba(255,200,110,${0.35 + Math.sin(t * 6) * 0.04})`);
    c.save();
    c.translate(w * 0.8, h * 0.28);
    c.scale(S / 70, S / 70);
    oilLamp(c, 0, 0, t);
    c.restore();
    // Floor with a woven blanket.
    const fg = c.createLinearGradient(0, floor, 0, h);
    fg.addColorStop(0, "#3a2212");
    fg.addColorStop(1, "#0d0805");
    c.fillStyle = fg;
    c.fillRect(0, floor, w, h - floor);
    c.save();
    c.globalAlpha = 0.6;
    c.fillStyle = "#5a1d15";
    c.fillRect(w * 0.08, floor + S * 0.25, w * 0.84, S * 0.6);
    bandTriangles(c, w * 0.08, floor + S * 0.25, w * 0.92, floor + S * 0.25, S * 0.18, "#c99a3a", "#1b0d08");
    bandLozenges(c, w * 0.08, floor + S * 0.6, w * 0.92, floor + S * 0.6, S * 0.14, "#e3d1a6");
    c.restore();
    // The hearth (lkanun): a pit of embers and flames, centre.
    const fx = w * 0.5,
      fy = floor + S * 0.1;
    const f = 0.85 + Math.sin(t * 8) * 0.08 + Math.sin(t * 13) * 0.05;
    glow(c, fx, fy - S * 0.4, w * 0.75, `rgba(255,130,50,${0.35 * f})`);
    for (let i = 0; i < 6; i++) {
      const fh = S * (0.7 + rnd(i) * 0.6) * (0.85 + Math.sin(t * (6 + i) + i) * 0.15);
      const fxx = fx + (i - 2.5) * S * 0.16;
      const g = c.createLinearGradient(0, fy, 0, fy - fh);
      g.addColorStop(0, "rgba(255,220,120,0.95)");
      g.addColorStop(0.6, "rgba(255,120,40,0.7)");
      g.addColorStop(1, "rgba(200,40,20,0)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(fxx - S * 0.12, fy);
      c.quadraticCurveTo(fxx - S * 0.1, fy - fh * 0.6, fxx + Math.sin(t * 5 + i) * S * 0.05, fy - fh);
      c.quadraticCurveTo(fxx + S * 0.1, fy - fh * 0.6, fxx + S * 0.12, fy);
      c.closePath();
      c.fill();
    }
    // Jida, seated on the left: a silhouette with headscarf, lit by the fire.
    const lean = view.mood === "hushed" ? 0.12 : view.mood === "teasing" ? -0.04 : 0;
    person(c, w * 0.24, floor + S * 0.2, S * 2.4 * talk("jida"), "jida", t, lean, 1, view.speaker === "jida" && view.mood === "teasing");
    // The children start at the hushed parts.
    const flinch = view.mood === "hushed" ? Math.max(0, 0.5 - (view.lineAge || 9)) * S * 0.5 : 0;
    c.save();
    c.translate(0, -flinch);
    // The children on the right.
    person(c, w * 0.7, floor + S * 0.2, S * 1.5 * talk("boy") * talk("children"), "boy", t, rain ? -0.16 : -0.05 + (view.mood === "hushed" ? 0.06 : 0), -1);
    person(c, w * 0.84, floor + S * 0.2, S * 1.4 * talk("girl") * talk("children"), "girl", t, rain ? -0.22 : view.mood === "hushed" ? -0.12 : 0, -1);
    c.restore();
    vignette(c, w, h, 0.5);
  }

  // A seated figure in silhouette, rim-lit by the fire. lean: radians toward the fire.
  // rimSide: 1 when the fire is to the figure's right, -1 when to its left.
  function person(c, x, base, size, who, t, lean = 0, rimSide = 1, gesture = false) {
    c.save();
    c.translate(x, base);
    c.rotate(lean);
    const body = who === "jida" ? "#100906" : "#0e0805";
    c.fillStyle = body;
    c.shadowColor = "rgba(255,140,60,0.55)";
    c.shadowBlur = size * 0.08;
    // Seated body, wide dress.
    c.beginPath();
    c.moveTo(-size * 0.34, 0);
    c.quadraticCurveTo(-size * 0.32, -size * 0.45, -size * 0.16, -size * 0.6);
    c.lineTo(size * 0.16, -size * 0.6);
    c.quadraticCurveTo(size * 0.32, -size * 0.45, size * 0.36, 0);
    c.closePath();
    c.fill();
    // Head.
    const breathe = Math.sin(t * 1.6 + x) * size * 0.006;
    c.beginPath();
    c.arc(0, -size * 0.72 + breathe, size * 0.13, 0, TAU);
    c.fill();
    c.shadowBlur = 0;
    if (who === "jida") {
      // Headscarf (amendil) falling behind, with a fringe in ochre and red.
      c.fillStyle = "#4a1712";
      c.beginPath();
      c.moveTo(-size * 0.15, -size * 0.74 + breathe);
      c.quadraticCurveTo(0, -size * 0.92 + breathe, size * 0.15, -size * 0.74 + breathe);
      c.quadraticCurveTo(size * 0.2, -size * 0.5, size * 0.12, -size * 0.42);
      c.lineTo(-size * 0.12, -size * 0.42);
      c.quadraticCurveTo(-size * 0.2, -size * 0.5, -size * 0.15, -size * 0.74 + breathe);
      c.closePath();
      c.fill();
      bandZigzag(c, -size * 0.14, -size * 0.8 + breathe, size * 0.14, -size * 0.8 + breathe, size * 0.03, OCHRE);
      c.fillStyle = OCHRE;
      for (let i = -3; i <= 3; i++) {
        c.beginPath();
        c.arc(i * size * 0.035, -size * 0.43, size * 0.012, 0, TAU);
        c.fill();
      }
    } else if (who === "girl") {
      c.strokeStyle = body;
      c.lineWidth = size * 0.05;
      c.beginPath();
      c.moveTo(size * 0.11, -size * 0.72);
      c.quadraticCurveTo(size * 0.2, -size * 0.6, size * 0.16, -size * 0.5);
      c.stroke();
      c.fillStyle = RED;
      c.fillRect(-size * 0.13, -size * 0.8 + breathe, size * 0.26, size * 0.035);
    } else if (who === "boy") {
      c.fillStyle = "#3a1c12";
      c.beginPath();
      c.arc(0, -size * 0.78 + breathe, size * 0.11, Math.PI, TAU);
      c.fill();
    }
    if (gesture) {
      // A raised hand, the teller's flourish.
      const lift = 0.5 + Math.sin(t * 3) * 0.08;
      c.strokeStyle = body;
      c.lineWidth = size * 0.07;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(size * 0.18, -size * 0.5);
      c.quadraticCurveTo(size * 0.38, -size * (0.5 + lift * 0.2), size * 0.42, -size * (0.55 + lift * 0.3));
      c.stroke();
    }
    // Firelight catching the face edge.
    c.strokeStyle = "rgba(255,170,90,0.45)";
    c.lineWidth = Math.max(1, size * 0.012);
    c.beginPath();
    if (rimSide > 0) c.arc(0, -size * 0.72 + breathe, size * 0.13, -0.9, 0.9);
    else c.arc(0, -size * 0.72 + breathe, size * 0.13, Math.PI - 0.9, Math.PI + 0.9);
    c.stroke();
    c.restore();
  }

  // The tale of the spring, night 6. Positions are in S (w / 9) from the left.
  function springScene(c, name, w, h, t, S, floor, Yw, talk) {
    const rain = name === "spring-rain";
    springBack(c, w, h, t, Yw, S, 8, 0.3, { rain });
    ground(c, 0, w, floor, h, "spring", t);
    const Xs = (x) => x * S;
    if (rain) {
      // Home through the first rain, the ladle bride riding on his back.
      village(c, w * 0.58, w * 1.02, floor - S * 0.9, S * 0.75, t);
      c.save();
      c.fillStyle = "rgba(150,180,210,0.12)";
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.ellipse(w * (0.15 + i * 0.22), floor + S * (0.4 + (i % 2) * 0.5), S * 0.6, S * 0.08, 0, 0, TAU);
        c.fill();
      }
      c.restore();
      const hop = Math.abs(Math.sin(t * 4)) * S * 0.12;
      const hx = w * 0.4,
        hy = floor - S * 0.55 - hop;
      tislit(c, hx - S * 0.35, hy - S * 0.35, S * 1.0, t, { tilt: -0.55 });
      Art.rabbit(c, hx, hy, S * 1.05, { time: t, state: "resting", look: { x: 1, y: -0.3 } });
      return;
    }
    if (name === "spring") {
      // The fig tree and its dry basin, the well, the cistern up on its terrace.
      figTree(c, Xs(1.0), floor, S * 3.6, t, 1, true);
      dryPool(c, Xs(2.1), floor + S * 0.1, S * 1.5, t);
      const wa = { x: 4.9, y: 1.1, w: 0.9, h: 0.3, top: 1.4, bottom: 0.4 },
        wb = { x: 6.2, y: 0.7, w: 0.9, h: 0.3, top: 1.4, bottom: 0.4 };
      well(c, wa, wb, Xs, Yw, S, t);
      for (const q of [wa, wb]) bucket(c, Xs(q.x), Yw(q.y), q.w * S, q.h * S, S);
      ledge(c, Xs(8.1), Yw(2.6), S * 2.2, 1, 0, "spring");
      cistern(c, Xs(8.3), Yw(2.6 + 1.7), S * 1.0, S * 1.7, t);
      stoneBlock(c, Xs(2.95), Yw(0.35), S * 0.6, S * 0.35);
      frog(c, Xs(2.95), Yw(0.35) - S * 0.4, S * 0.85, t, "sleep", {});
      frog(c, Xs(6.2), Yw(wb.y + RIM) - S * 0.35, S * 0.8, t + 1, "hunt", { vx: -1 });
      frog(c, Xs(7.5), Yw(2.6) - S * 0.4, S * 0.85, t + 2, "hunt", { vx: -1 });
      Art.rabbit(c, Xs(3.7), floor - S * 0.55, S * 1.05, { time: t, state: "resting", look: { x: 1, y: -0.5 } });
    } else if (name === "spring-cistern") {
      // Teryel in the dry bed with the ladle bride in her hands, the cracked wall behind.
      cistern(c, Xs(5.9), floor - S * 4.2, S * 4.6, S * 4.2, t, S * 0.5);
      const tx = Xs(5.9);
      teryel(c, tx, floor - S * 1.3, S * 1.3 * talk("teryel"), t, { theme: "spring", asleep: false });
      tislit(c, tx, floor - S * 0.95, S * 1.1, t);
      // Her long fingers round the bride's skirt.
      c.save();
      c.strokeStyle = "#120c0a";
      c.lineWidth = S * 0.09;
      c.lineCap = "round";
      for (const sx of [-1, 1]) {
        c.beginPath();
        c.moveTo(tx + sx * S * 0.55, floor - S * 0.5);
        c.quadraticCurveTo(tx + sx * S * 0.4, floor - S * 0.85, tx + sx * S * 0.14, floor - S * 0.78);
        c.stroke();
      }
      c.restore();
      stoneBlock(c, Xs(2.6), Yw(0.4), S * 0.7, S * 0.4);
      frog(c, Xs(2.6), Yw(0.4) - S * 0.4, S * 0.85, t, "hunt", { vx: -1 });
      frog(c, Xs(8.5), floor - S * 0.4, S * 0.8, t + 1, "sleep", {});
      Art.rabbit(c, Xs(1.3), floor - S * 0.55, S * 1.05, { time: t, state: "resting", look: { x: 1, y: -0.6 } });
    } else if (name === "spring-trap") {
      // The wall bursts: white water down the ravine with Teryel in it; Mqidec safe on
      // a stone above the flood, holding the ladle bride.
      const wx = Xs(6.6),
        top = floor - S * 4.2,
        ww = S * 3.6;
      c.save();
      c.beginPath();
      c.rect(wx - ww / 2 - 2, top - 2, ww + 4, S * 4.2 + 4);
      c.moveTo(wx - S * 0.9, floor);
      [[-0.7, 2.4], [-0.2, 3.1], [0.3, 2.7], [0.8, 3.3], [1.0, 0]].forEach(([dx, dy]) => c.lineTo(wx + dx * S, floor - dy * S));
      c.closePath();
      c.clip("evenodd");
      cistern(c, wx, top, ww, S * 4.2, t, S * 0.5);
      c.restore();
      // Loose stones flung out of the breach.
      for (let i = 0; i < 4; i++) {
        const k = (t * 0.5 + i / 4) % 1;
        stoneBlock(c, wx + S * (0.2 - k * 2.5 + i * 0.3), floor - S * (2.8 - k * 2.4 + Math.sin(k * Math.PI) * 0.8), S * 0.4, S * 0.3);
      }
      const surface = floor - S * 0.9;
      waterBody(c, -2, w + 2, surface, h + 2, t, 1, -1, S);
      cascade(c, wx + S * 0.1, floor - S * 2.6, S * 1.6, surface, t, 1, -1);
      const tx = Xs(3.4) + Math.sin(t * 0.6) * S * 0.3;
      teryel(c, tx, surface - S * 0.6, S * 1.15 * talk("teryel"), t, { trapped: true, theme: "spring", bride: false });
      frog(c, Xs(5), surface - S * 1.6 + Math.sin(t * 2) * S * 0.2, S * 0.75, t, "notice", { leap: { k: 1, up: false }, vx: -1 });
      stoneBlock(c, Xs(1.2), floor - S * 1.9, S * 1.5, S * 1.9);
      waterVeil(c, -2, w + 2, surface, h + 2, t, 1, -1, S);
      Art.rabbit(c, Xs(1.1), floor - S * 1.9 - S * 0.55, S * 1.05, { time: t, state: "resting", look: { x: 1, y: 0 } });
      tislit(c, Xs(1.7), floor - S * 1.9 - S * 0.55, S * 0.95, t, { tilt: 0.2 });
    }
  }

  function homeScene(c, w, h, t, S, floor) {
    gorgeBack(c, w, h, t, (y) => floor - y * S, S, 0.2);
    // The hill and the old house of stone and earth under tiles.
    c.fillStyle = "#07090d";
    c.beginPath();
    c.ellipse(w * 0.55, floor + S * 0.8, w * 0.7, S * 3, 0, Math.PI, TAU);
    c.fill();
    const hx = w * 0.56,
      hb = floor - S * 1.8,
      hw = w * 0.5;
    c.fillStyle = "#0d0b0a";
    c.fillRect(hx - hw / 2, hb - hw * 0.42, hw, hw * 0.42);
    // Tile roof.
    c.fillStyle = "#3a1a10";
    c.beginPath();
    c.moveTo(hx - hw * 0.58, hb - hw * 0.42);
    c.lineTo(hx, hb - hw * 0.7);
    c.lineTo(hx + hw * 0.58, hb - hw * 0.42);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(120,50,30,0.6)";
    c.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      c.beginPath();
      c.moveTo(hx - hw * 0.58 + (hw * 0.58 * i) / 6, hb - hw * 0.42 - (hw * 0.28 * i) / 6);
      c.lineTo(hx + hw * 0.58 - (hw * 0.58 * i) / 6, hb - hw * 0.42 - (hw * 0.28 * i) / 6);
      c.stroke();
    }
    // The door open and the lamp on the sill.
    c.fillStyle = "#2a1408";
    c.fillRect(hx - hw * 0.07, hb - hw * 0.26, hw * 0.14, hw * 0.26);
    glow(c, hx, hb - hw * 0.12, S * 2.6, `rgba(255,190,90,${0.45 + Math.sin(t * 6) * 0.05})`);
    c.save();
    c.translate(hx + hw * 0.1, hb - S * 0.15);
    c.scale(S / 80, S / 80);
    oilLamp(c, 0, 0, t);
    c.restore();
    Art.rabbit(c, hx - hw * 0.2, hb - S * 0.45, S * 0.9, { time: t, state: "resting", look: { x: 1, y: -0.2 } });
  }

  function roofScene(c, w, h, t, S, floor) {
    gorgeBack(c, w, h, t, (y) => floor - y * S, S, 0.1);
    // Rows of red tiles, moonlit.
    for (let row = 0; row < 4; row++) {
      const y = floor - S * 1.2 + row * S * 0.5;
      for (let x = -S * 0.5; x < w + S; x += S * 0.5) {
        c.fillStyle = row % 2 ? "#4a2014" : "#5a2818";
        c.beginPath();
        c.arc(x + (row % 2) * S * 0.25, y, S * 0.27, Math.PI, TAU);
        c.fill();
      }
    }
    Art.rabbit(c, w * 0.5, floor - S * 1.9, S * 1.05, { time: t, state: "resting", look: { x: 0, y: -1 } });
    heroLamp(c, w * 0.5, floor - S * 1.9, S * 1.05, t);
  }

  /* ---------------- Speaker portraits ---------------- */
  function portrait(c, who, mood, size, t) {
    c.clearRect(0, 0, size, size);
    const g = c.createRadialGradient(size / 2, size * 0.65, 2, size / 2, size / 2, size * 0.6);
    g.addColorStop(0, who === "teryel" ? "#4a1a10" : "#5a3018");
    g.addColorStop(1, "#140b06");
    c.fillStyle = g;
    c.beginPath();
    c.arc(size / 2, size / 2, size / 2, 0, TAU);
    c.fill();
    c.save();
    c.beginPath();
    c.arc(size / 2, size / 2, size / 2, 0, TAU);
    c.clip();
    if (who === "teryel") teryel(c, size / 2, size * 0.55, size * 0.32, t, {});
    else if (who) {
      const lean = mood === "hushed" ? 0.12 : mood === "teasing" ? -0.05 : 0;
      person(c, size / 2, size * 1.25, size * 1.25, who === "children" ? "girl" : who, t, lean);
    }
    c.restore();
  }

  root.HNTalesArt = {
    backdrop,
    ground,
    ledge,
    slope,
    stack,
    oil,
    wheel,
    hunter,
    object,
    door,
    heroLamp,
    scene,
    portrait,
    teryel,
    pot,
    ijenni,
    raven,
    rat,
    bread,
    tabzimt,
    // Night 6, the spring.
    frog,
    tislit,
    cistern,
    well,
    hanging,
    bucketBack,
    bucketFront,
    front,
  };
})(globalThis);
