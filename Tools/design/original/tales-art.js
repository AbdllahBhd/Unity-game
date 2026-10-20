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

  // A pile of loose tiles, slightly askew; in the press, the great beam.
  function stack(c, x, top, w, h, t, theme) {
    if (theme === "press") {
      pressBeam(c, x, top, w, h, t);
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
    if (st.trapped) trappedOverlay(c, st.theme, W, H, r, t);
    c.restore();
  }

  function trappedOverlay(c, theme, W, H, r, t) {
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
    if (name === "hearth" || name.startsWith("kitchen")) {
      const sprite = ember();
      c.save();
      for (let i = 0; i < 16; i++) {
        const k = (t * (0.12 + rnd(i) * 0.1) + rnd(i + 3)) % 1;
        const x = w * (name === "hearth" ? 0.5 : 0.1) + (rnd(i + 5) - 0.5) * w * 0.25 + Math.sin(t * 2 + i) * 10;
        const y = h * 0.7 - k * h * 0.6;
        c.globalAlpha = (1 - k) * 0.9;
        c.drawImage(sprite, x - 4, y - 4, 8, 8);
      }
      c.restore();
    }
    if (name.startsWith("kitchen") || name.startsWith("loom") || name.startsWith("press") || name === "hearth") {
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
  }

  function sceneBody(c, name, w, h, t, view) {
    const S = w / 9;
    const floor = h * 0.68;
    const talk = (who) =>
      view.speaker === who ? 1 + Math.max(0, 0.06 - (view.lineAge || 9) * 0.08) + Math.sin(t * 14) * 0.015 * Math.max(0, 1 - (view.lineAge || 9)) : 1;
    const Yw = (yy) => floor - yy * S;
    if (name === "hearth") hearthScene(c, w, h, t, S, floor, view, talk);
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

  function hearthScene(c, w, h, t, S, floor, view, talk) {
    plaster(c, w, h, "#2c1a10", "#0c0705");
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
    person(c, w * 0.7, floor + S * 0.2, S * 1.5 * talk("boy") * talk("children"), "boy", t, -0.05 + (view.mood === "hushed" ? 0.06 : 0), -1);
    person(c, w * 0.84, floor + S * 0.2, S * 1.4 * talk("girl") * talk("children"), "girl", t, view.mood === "hushed" ? -0.12 : 0, -1);
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
  };
})(globalThis);
