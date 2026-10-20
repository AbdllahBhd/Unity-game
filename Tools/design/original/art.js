/* Renderer for The Green Harvest. Draws the user's original PSD art (exported to
 * assets/ by Tools/export_original_art.py) on a 2D canvas. Only effects with no
 * source art (glows, silk, the house silhouette, the ground) are drawn in code. */
(function (root) {
  "use strict";
  const A = root.HNOriginalAssets;
  const img = {};
  const TAU = Math.PI * 2;
  const NAMES = [
    "bg_far.jpg",
    "bg_front.png",
    "bg_webs.png",
    "stone.png",
    "pumpkin.png",
    "cauldron.png",
    "spider_small.png",
    "spider_body.png",
    "owl_open.png",
    "owl_narrow.png",
    "owl_closed.png",
    "hand.png",
    "rabbit_pupil.png",
  ];
  for (let i = 0; i < 6; i++) NAMES.push(`door_${i}.png`, `pumpkin_piece_${i}.png`);
  for (let i = 0; i < 12; i++) NAMES.push(`enter_${i}.png`);
  for (let i = 0; i < 8; i++) NAMES.push(`spider_leg_${i}.png`);
  for (const p of A.rabbit.parts) NAMES.push(`rabbit_${p.key}.png`);

  function load(base) {
    return Promise.all(
      NAMES.map(
        (name) =>
          new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve((img[name.replace(/\.\w+$/, "")] = image));
            image.onerror = () => reject(new Error("Missing art: " + base + name));
            image.src = base + name;
          }),
      ),
    )
      .then(() => (document.fonts ? document.fonts.load('24px "Noto Sans Tifinagh"').catch(() => null) : null))
      .then(() =>
        // Cloth renders from Tools/blender/mqidec_cloak.py are optional.
        Promise.all(
          ["idle", "hunted", "flight"].map(
            (state) =>
              new Promise((resolve) => {
                const image = new Image();
                image.onload = () => resolve((img["cloak_" + state] = image));
                image.onerror = () => resolve(null);
                image.src = base + "cloak/cloak_" + state + ".png";
              }),
          ),
        ),
      )
      .then(() => {
        img.pumpkin_orange = tinted(img.pumpkin, "#ff7a12");
      });
  }

  // A ripe pumpkin: the original art recoloured, keeping its own shading.
  function tinted(source, color) {
    const c = document.createElement("canvas");
    c.width = source.width;
    c.height = source.height;
    const x = c.getContext("2d");
    x.drawImage(source, 0, 0);
    x.globalCompositeOperation = "hue";
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = "destination-in";
    x.drawImage(source, 0, 0);
    return c;
  }

  function glow(c, x, y, r, color, alpha = 1) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.save();
    c.globalAlpha *= alpha;
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fill();
    c.restore();
  }

  function centred(c, image, x, y, w, h, angle = 0) {
    c.save();
    c.translate(x, y);
    if (angle) c.rotate(angle);
    c.drawImage(image, -w / 2, -h / 2, w, h);
    c.restore();
  }

  /* ---------- Izan, assembled from the original rabbit parts ---------- */
  const part = {};
  for (const p of A.rabbit.parts) part[p.key] = p;

  /* Outfits for Mqidec, drawn in code over the original parts (part coordinates:
   * body spans about x -107..107, y -116..116; ears rise to y -150).
   * outfit: {cloak, hood (0..1 up), fibula, marks, cap, scarf, lamp, glyphs} */
  const OCHRE = "#e0a63c",
    RED = "#b8342c",
    INK = "#17130e",
    SILVER = "#dde2e8",
    CORAL = "#d8442c",
    ENAMEL = ["#2e8b57", "#2b5fb3", "#e8c23a"];
  // Real Tifinagh text only when the browser has a font for it; otherwise the
  // geometric ⵣ drawn by mark("yaz") stands in.
  let tifinaghOk = null;
  function tifinaghSupported() {
    if (tifinaghOk !== null) return tifinaghOk;
    try {
      const probe = document.createElement("canvas");
      probe.width = probe.height = 32;
      const x = probe.getContext("2d");
      const pixels = (ch) => {
        x.clearRect(0, 0, 32, 32);
        x.font = '24px "Noto Sans Tifinagh", sans-serif';
        x.fillText(ch, 2, 26);
        return Array.from(x.getImageData(0, 0, 32, 32).data).join();
      };
      tifinaghOk = pixels("ⵣ") !== pixels("\u{10FFFD}") && pixels("ⵎ") !== pixels("ⵣ");
    } catch {
      tifinaghOk = false;
    }
    return tifinaghOk;
  }
  function tifinagh(c, text, x, y, size, color = "rgba(255,190,90,0.95)") {
    if (!tifinaghSupported()) {
      for (let i = 0; i < text.length; i++) mark(c, "yaz", x + (i - (text.length - 1) / 2) * size * 1.1, y, size * 0.8, 0);
      return;
    }
    c.save();
    c.fillStyle = color;
    c.shadowColor = "rgba(255,170,60,0.9)";
    c.shadowBlur = size * 0.6;
    c.font = `${size}px "Noto Sans Tifinagh", sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, x, y);
    c.restore();
  }
  // Pottery and weaving signs of Kabylie, drawn as bands along a path.
  function bandTriangles(c, x0, y0, x1, y1, h, fill = INK, alt = OCHRE) {
    const dx = x1 - x0,
      dy = y1 - y0,
      len = Math.hypot(dx, dy),
      n = Math.max(2, Math.round(len / h));
    const ux = dx / len,
      uy = dy / len,
      nx = -uy,
      ny = ux;
    for (let i = 0; i < n; i++) {
      const ax = x0 + ux * (i * h),
        ay = y0 + uy * (i * h);
      const bx = ax + ux * h,
        by = ay + uy * h;
      c.fillStyle = i % 2 ? alt : fill;
      c.beginPath();
      c.moveTo(ax, ay);
      c.lineTo(bx, by);
      c.lineTo((ax + bx) / 2 + nx * h, (ay + by) / 2 + ny * h);
      c.closePath();
      c.fill();
    }
  }
  function bandLozenges(c, x0, y0, x1, y1, h, color = RED) {
    const dx = x1 - x0,
      dy = y1 - y0,
      len = Math.hypot(dx, dy),
      n = Math.max(2, Math.round(len / (h * 1.4)));
    const ux = dx / len,
      uy = dy / len,
      nx = -uy,
      ny = ux;
    c.strokeStyle = color;
    c.lineWidth = Math.max(1.2, h * 0.14);
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const cx = x0 + ux * ((i + 0.5) * h * 1.4),
        cy = y0 + uy * ((i + 0.5) * h * 1.4);
      c.moveTo(cx - ux * h * 0.6, cy - uy * h * 0.6);
      c.lineTo(cx + nx * h * 0.5, cy + ny * h * 0.5);
      c.lineTo(cx + ux * h * 0.6, cy + uy * h * 0.6);
      c.lineTo(cx - nx * h * 0.5, cy - ny * h * 0.5);
      c.closePath();
      c.moveTo(cx + h * 0.12, cy);
      c.arc(cx, cy, h * 0.12, 0, TAU);
    }
    c.stroke();
  }
  function bandZigzag(c, x0, y0, x1, y1, h, color = INK) {
    const dx = x1 - x0,
      dy = y1 - y0,
      len = Math.hypot(dx, dy),
      n = Math.max(2, Math.round(len / h));
    const ux = dx / len,
      uy = dy / len,
      nx = -uy,
      ny = ux;
    c.strokeStyle = color;
    c.lineWidth = Math.max(1.2, h * 0.18);
    c.lineJoin = "round";
    c.beginPath();
    for (let i = 0; i <= n; i++) {
      const sgn = i % 2 ? 1 : -1;
      const px = x0 + ux * (i * h) + nx * sgn * h * 0.4,
        py = y0 + uy * (i * h) + ny * sgn * h * 0.4;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.stroke();
  }
  // Ticrad: the tattoo signs. style: "light" (brow and cheeks) | "full" (brow, between
  // the eyes, cheeks, chin comb and dot triangles) | "yaz" (ⵣ on the brow, cheeks).
  function ticrad(c, style, t) {
    const comb = (x, y, len, teeth) => {
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x, y + len);
      for (let i = 1; i <= teeth; i++) {
        const yy = y + (len * i) / (teeth + 1);
        c.moveTo(x - 9, yy);
        c.lineTo(x + 9, yy);
      }
      c.stroke();
    };
    c.save();
    // Engraved, not glowing: a dark groove with a faint warm line inside it.
    const pulse = 0.55 + Math.sin(t * 2) * 0.08;
    const engrave = (drawFn) => {
      c.save();
      c.strokeStyle = "rgba(0,0,0,0.6)";
      c.fillStyle = "rgba(0,0,0,0.6)";
      c.lineWidth = 4;
      c.lineCap = "round";
      drawFn();
      c.strokeStyle = `rgba(230,170,90,${pulse * 0.8})`;
      c.fillStyle = c.strokeStyle;
      c.lineWidth = 1.6;
      c.filter = "blur(0.6px)";
      c.shadowColor = "rgba(255,170,60,0.45)";
      c.shadowBlur = 5;
      drawFn();
      c.restore();
    };
    engrave(() => {
      if (style === "yaz") {
        c.beginPath();
        c.moveTo(-7, -84);
        c.lineTo(7, -84);
        c.moveTo(0, -91);
        c.lineTo(0, -77);
        c.stroke();
      } else comb(0, -92, 20, 2);
      if (style === "full") {
        // Men's marks were for healing and protection: a chain with two flies
        // on the brow, a dot on each cheek, and a small mark on the paw.
        c.beginPath();
        c.arc(-82, 18, 2.4, 0, TAU);
        c.arc(82, 18, 2.4, 0, TAU);
        c.fill();
        c.beginPath();
        c.moveTo(-10, -84);
        c.lineTo(10, -84);
        c.stroke();
        c.beginPath();
        c.arc(-13, -79, 2, 0, TAU);
        c.arc(13, -79, 2, 0, TAU);
        c.fill();
        comb(50, 76, 18, 1);
      } else {
        c.beginPath();
        c.arc(-82, 18, 2.4, 0, TAU);
        c.arc(82, 18, 2.4, 0, TAU);
        c.fill();
      }
    });
    c.restore();
  }
  function earStripes(c) {
    for (const key of ["ear_l", "ear_r"]) {
      const p = part[key];
      c.save();
      c.strokeStyle = OCHRE;
      c.lineWidth = 2.4;
      c.lineCap = "round";
      c.shadowColor = "rgba(255,170,60,0.7)";
      c.shadowBlur = 6;
      const cx = p.x + p.w / 2;
      for (let i = 0; i < 3; i++) {
        const y = p.y + p.h * (0.32 + i * 0.16);
        c.beginPath();
        c.moveTo(cx - 9, y + 6);
        c.lineTo(cx, y);
        c.lineTo(cx + 9, y + 6);
        c.stroke();
      }
      c.restore();
    }
  }
  // The body painted like Kabyle pottery: ochre belly band, black triangles, red zigzag.
  function potteryBody(c) {
    c.save();
    c.beginPath();
    c.ellipse(0, 8, 103, 110, 0, 0, TAU);
    c.clip();
    c.fillStyle = "rgba(224,166,60,0.95)";
    c.fillRect(-120, 26, 240, 52);
    bandTriangles(c, -120, 26, 120, 26, 12, INK, "#f0dcb0");
    bandZigzag(c, -120, 52, 120, 52, 10, RED);
    c.fillStyle = "rgba(240,220,176,0.9)";
    for (let x = -108; x <= 108; x += 18) {
      c.beginPath();
      c.arc(x, 70, 2.6, 0, TAU);
      c.fill();
    }
    c.strokeStyle = "rgba(240,220,176,0.8)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-120, 84);
    c.lineTo(120, 84);
    c.stroke();
    bandTriangles(c, 120, 100, -120, 100, 10, OCHRE, "rgba(0,0,0,0)");
    c.restore();
  }
  function necklace(c, t) {
    c.save();
    c.strokeStyle = SILVER;
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(-70, 0);
    c.quadraticCurveTo(0, 62, 70, 0);
    c.stroke();
    for (let i = -3; i <= 3; i++) {
      const u = (i + 3) / 6;
      const x = -70 + 140 * u;
      const y = 2 + Math.sin(u * Math.PI) * 46;
      c.fillStyle = i === 0 ? CORAL : i % 2 ? SILVER : ENAMEL[(i + 3) % 3];
      c.beginPath();
      if (i === 0) {
        c.moveTo(x, y + 14 + Math.sin(t * 2) * 0.6);
        c.lineTo(x - 7, y);
        c.lineTo(x + 7, y);
        c.closePath();
      } else c.arc(x, y + 3, 4, 0, TAU);
      c.fill();
    }
    c.restore();
  }
  // Tafzimt in the Beni Yenni manner: silver triangle, coral at the heart, enamel cells.
  function fibula(c, x, y, s, t) {
    c.save();
    c.shadowColor = "rgba(220,230,255,0.8)";
    c.shadowBlur = s * 0.9;
    c.fillStyle = SILVER;
    c.strokeStyle = "#6c7480";
    c.lineWidth = s * 0.1;
    c.beginPath();
    c.moveTo(x, y - s * 0.8);
    c.lineTo(x + s * 0.72, y + s * 0.45);
    c.lineTo(x - s * 0.72, y + s * 0.45);
    c.closePath();
    c.fill();
    c.stroke();
    c.beginPath();
    c.arc(x, y - s * 0.8, s * 0.3, 0, TAU);
    c.stroke();
    ENAMEL.forEach((color, i) => {
      c.fillStyle = color;
      c.beginPath();
      c.arc(x + (i - 1) * s * 0.36, y + s * 0.26, s * 0.1, 0, TAU);
      c.fill();
    });
    c.shadowColor = "rgba(255,120,80,0.9)";
    c.fillStyle = CORAL;
    c.beginPath();
    c.arc(x, y - s * 0.1, s * 0.17 + Math.sin(t * 6) * s * 0.015, 0, TAU);
    c.fill();
    c.restore();
  }
  function mark(c, kind, x, y, s, t) {
    c.save();
    c.strokeStyle = `rgba(255,190,90,${0.85 + Math.sin(t * 3) * 0.1})`;
    c.shadowColor = "rgba(255,170,60,0.9)";
    c.shadowBlur = s * 0.9;
    c.lineWidth = s * 0.14;
    c.lineCap = "round";
    c.beginPath();
    if (kind === "chevron") {
      c.moveTo(x - s * 0.5, y + s * 0.35);
      c.lineTo(x, y - s * 0.35);
      c.lineTo(x + s * 0.5, y + s * 0.35);
      c.moveTo(x - s * 0.3, y + s * 0.75);
      c.lineTo(x, y + s * 0.15);
      c.lineTo(x + s * 0.3, y + s * 0.75);
    } else if (kind === "eye") {
      c.moveTo(x, y - s * 0.5);
      c.lineTo(x + s * 0.5, y);
      c.lineTo(x, y + s * 0.5);
      c.lineTo(x - s * 0.5, y);
      c.closePath();
      c.moveTo(x + s * 0.1, y);
      c.arc(x, y, s * 0.1, 0, TAU);
    } else if (kind === "yaz") {
      // ⵣ, the sign of the free people
      c.moveTo(x - s * 0.45, y - s * 0.5);
      c.lineTo(x - s * 0.45, y - s * 0.15);
      c.lineTo(x, y + s * 0.15);
      c.lineTo(x + s * 0.45, y - s * 0.15);
      c.lineTo(x + s * 0.45, y - s * 0.5);
      c.moveTo(x, y + s * 0.15);
      c.lineTo(x, y + s * 0.6);
      c.moveTo(x - s * 0.45, y + s * 0.6);
      c.lineTo(x, y + s * 0.35);
      c.lineTo(x + s * 0.45, y + s * 0.6);
    } else if (kind === "zigzag") {
      for (let i = -2; i <= 2; i++) c.lineTo(x + i * s * 0.3, y + (i % 2 ? -1 : 1) * s * 0.18);
    }
    c.stroke();
    c.restore();
  }
  /* The burnous (abernus) as Kabyle men wear it: coarse wool, brown for every day or
   * cream for ceremony, a pointed hood (aqelmun) with a tassel, tied at the neck with
   * a cord, and one side thrown back over the shoulder so the front stays open.
   * Everything is painted with gradients, soft folds and the same blue rim light as
   * the original rabbit, so it reads as one painting. */
  const WOOL = {
    brown: { base: "#5b4029", light: "#846046", dark: "#2f1f14", band: "#d9c9a3", rim: "rgba(170,195,255,0.55)" },
    cream: { base: "#d8cfb8", light: "#efe9d8", dark: "#a99c80", band: "#3a2a1c", rim: "rgba(170,195,255,0.55)" },
  };
  let woolPattern = null;
  function wool(c) {
    if (woolPattern) return woolPattern;
    const t = document.createElement("canvas");
    t.width = t.height = 96;
    const x = t.getContext("2d");
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    x.lineCap = "round";
    // Coarse wool has a nap: short fibres lying mostly downward, a few across.
    for (let i = 0; i < 520; i++) {
      const v = rnd() > 0.5 ? 255 : 0;
      const px = rnd() * 96,
        py = rnd() * 96;
      const len = 2 + rnd() * 5;
      const a = Math.PI / 2 + (rnd() - 0.5) * 0.9;
      x.strokeStyle = `rgba(${v},${v},${v},${0.035 + rnd() * 0.07})`;
      x.lineWidth = 0.8 + rnd() * 0.9;
      x.beginPath();
      x.moveTo(px, py);
      x.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len);
      x.stroke();
    }
    // Slubs: a few thicker knots in the yarn.
    for (let i = 0; i < 18; i++) {
      x.fillStyle = `rgba(0,0,0,${0.06 + rnd() * 0.08})`;
      x.beginPath();
      x.ellipse(rnd() * 96, rnd() * 96, 1.2 + rnd() * 1.4, 0.8 + rnd(), rnd() * 3, 0, TAU);
      x.fill();
    }
    woolPattern = c.createPattern(t, "repeat");
    return woolPattern;
  }
  function paintPanel(c, pathFn, w, lightFrom = -1) {
    // Fill, wool grain, soft folds and a rim light, all clipped to the panel.
    c.save();
    pathFn();
    c.clip();
    const g = c.createLinearGradient(lightFrom * 130, -120, -lightFrom * 90, 140);
    g.addColorStop(0, w.light);
    g.addColorStop(0.45, w.base);
    g.addColorStop(1, w.dark);
    c.fillStyle = g;
    c.fillRect(-200, -260, 400, 520);
    c.fillStyle = wool(c);
    c.fillRect(-200, -260, 400, 520);
    c.restore();
  }
  function fold(c, points, width, alpha, color = "rgba(0,0,0,") {
    c.save();
    c.strokeStyle = color + alpha + ")";
    c.lineWidth = width;
    c.lineCap = "round";
    c.filter = "blur(2px)";
    c.beginPath();
    c.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 2)
      c.quadraticCurveTo(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    c.stroke();
    c.restore();
  }
  function tassel(c, x, y, len, w) {
    c.save();
    c.strokeStyle = w.band;
    c.lineWidth = 2;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y + len * 0.4);
    c.stroke();
    c.fillStyle = w.band;
    c.beginPath();
    c.moveTo(x - 5, y + len * 0.4);
    c.lineTo(x + 5, y + len * 0.4);
    c.lineTo(x + 7, y + len);
    c.lineTo(x - 7, y + len);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(0,0,0,0.35)";
    c.lineWidth = 1;
    for (let i = -4; i <= 4; i += 2) {
      c.beginPath();
      c.moveTo(x + i, y + len * 0.45);
      c.lineTo(x + i * 1.3, y + len);
      c.stroke();
    }
    c.restore();
  }
  function hemBand(c, w, x0, y0, x1, y1) {
    // One narrow woven band: a line of small lozenges, the eye that keeps watch.
    c.save();
    c.strokeStyle = w.band;
    c.globalAlpha *= 0.85;
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(x0, y0 - 7);
    c.lineTo(x1, y1 - 7);
    c.moveTo(x0, y0 + 7);
    c.lineTo(x1, y1 + 7);
    c.stroke();
    bandLozenges(c, x0, y0, x1, y1, 7, w.band);
    c.restore();
  }
  // Inner shadow and outer highlight that give a cloth panel thickness.
  function thickness(c, pathFn, w, inset = 10) {
    c.save();
    pathFn();
    c.clip();
    c.save();
    c.filter = `blur(${inset * 0.6}px)`;
    c.strokeStyle = "rgba(0,0,0,0.55)";
    c.lineWidth = inset;
    pathFn();
    c.stroke();
    c.restore();
    c.save();
    c.filter = "blur(2px)";
    c.strokeStyle = w.rim;
    c.lineWidth = 3;
    pathFn();
    c.stroke();
    c.restore();
    c.restore();
  }
  function cloakBack(c, hood, w) {
    // The cape itself hangs behind the body; only its edges show past the sides.
    const cape = () => {
      c.beginPath();
      c.moveTo(-108, -46);
      c.quadraticCurveTo(-152, 40, -136, 118);
      c.quadraticCurveTo(0, 134, 136, 118);
      c.quadraticCurveTo(152, 40, 108, -46);
      c.quadraticCurveTo(0, -70, -108, -46);
      c.closePath();
    };
    paintPanel(c, cape, { ...w, light: w.base, base: w.dark, dark: w.dark }, -1);
    if (hood > 0) {
      // Hood dome behind the head, rising to a point with its tassel.
      const dome = () => {
        c.beginPath();
        c.moveTo(-126, -30);
        c.quadraticCurveTo(-136, -150, -40, -190);
        c.quadraticCurveTo(0, -220 - hood * 16, 36, -210 - hood * 16);
        c.quadraticCurveTo(30, -186, 54, -176);
        c.quadraticCurveTo(136, -140, 126, -30);
        c.closePath();
      };
      c.save();
      c.globalAlpha *= hood;
      paintPanel(c, dome, w, -1);
      c.save();
      dome();
      c.clip();
      fold(c, [[-110, -50], [-118, -150], [-44, -184]], 8, 0.3);
      fold(c, [[110, -50], [120, -150], [48, -180]], 8, 0.3);
      fold(c, [[-124, -34], [-130, -156], [-40, -192]], 4, 0.28, "rgba(255,255,255,");
      c.restore();
      tassel(c, 36, -208 - hood * 16, 30, w);
      c.restore();
    } else {
      // Hood down: a soft roll of cloth on the shoulders, its point over the right one.
      const roll = () => {
        c.beginPath();
        c.moveTo(-132, -26);
        c.quadraticCurveTo(-120, -74, -40, -70);
        c.quadraticCurveTo(0, -66, 40, -72);
        c.quadraticCurveTo(122, -78, 132, -26);
        c.quadraticCurveTo(60, -4, 0, -2);
        c.quadraticCurveTo(-60, -4, -132, -26);
        c.closePath();
      };
      paintPanel(c, roll, w, -1);
      c.save();
      roll();
      c.clip();
      fold(c, [[-100, -40], [-60, -64], [-20, -52]], 6, 0.3);
      fold(c, [[20, -52], [60, -66], [100, -42]], 6, 0.3);
      c.restore();
      thickness(c, roll, w, 8);
      const point = () => {
        c.beginPath();
        c.moveTo(56, -64);
        c.quadraticCurveTo(108, -118, 144, -92);
        c.quadraticCurveTo(142, -58, 100, -38);
        c.closePath();
      };
      paintPanel(c, point, w, 1);
      thickness(c, point, w, 6);
      tassel(c, 140, -90, 34, w);
    }
  }
  function cloakFront(c, hood, t, w = WOOL.brown) {
    const breathe = Math.sin(t * 2.4) * 1.5;
    // Two flaps fall from the shoulders over the sides; the chest stays open.
    // The right flap is shorter: thrown back and tucked, the Kabyle way.
    const flapPath = (sgn) => () => {
      c.beginPath();
      c.moveTo(sgn * 104, -46);
      c.quadraticCurveTo(sgn * 134, 30, sgn * 114, 120);
      c.quadraticCurveTo(sgn * 80, 130, sgn * 38, 122);
      c.quadraticCurveTo(sgn * 26, 70, sgn * 44, 8 + breathe);
      c.quadraticCurveTo(sgn * 64, -32, sgn * 104, -46);
      c.closePath();
    };
    const left = flapPath(-1),
      right = flapPath(1);
    for (const [flap, side] of [
      [left, -1],
      [right, 1],
    ]) {
      paintPanel(c, flap, w, side);
      c.save();
      flap();
      c.clip();
      fold(c, [[side * 84, -24], [side * 100, 50], [side * 86, 116]], 8, 0.3);
      fold(c, [[side * 56, 14], [side * 60, 64], [side * 50, 120]], 5, 0.2);
      fold(c, [[side * 118, -20], [side * 128, 50], [side * 112, 112]], 4, 0.3, "rgba(255,255,255,");
      hemBand(c, w, side * 112, 106, side * 40, 112);
      c.restore();
      thickness(c, flap, w, 9);
    }
    // Neck cord, tied low on the chest, with two small tassels.
    c.save();
    c.strokeStyle = w.band;
    c.lineWidth = 2;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-62, -2);
    c.quadraticCurveTo(-20, 24, 0, 40);
    c.moveTo(60, -2);
    c.quadraticCurveTo(20, 24, 0, 40);
    c.stroke();
    c.restore();
    tassel(c, -5, 42, 18, w);
    tassel(c, 8, 40, 18, w);
    if (hood > 0) {
      // The hood's front rim: a folded crescent of cloth over the brow, with the
      // shadow it casts on the face beneath it.
      c.save();
      c.globalAlpha *= hood;
      c.save();
      c.beginPath();
      c.ellipse(0, -62, 96, 106, 0, 0, TAU);
      c.clip();
      const sh = c.createLinearGradient(0, -168, 0, -70);
      sh.addColorStop(0, "rgba(0,0,0,0.7)");
      sh.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = sh;
      c.fillRect(-110, -180, 220, 120);
      c.restore();
      const rim = () => {
        c.beginPath();
        c.moveTo(-126, -30);
        c.quadraticCurveTo(-128, -140, -36, -176);
        c.quadraticCurveTo(0, -190, 46, -170);
        c.quadraticCurveTo(128, -136, 126, -30);
        c.quadraticCurveTo(116, -36, 104, -44);
        c.quadraticCurveTo(100, -116, 40, -146);
        c.quadraticCurveTo(0, -158, -40, -146);
        c.quadraticCurveTo(-100, -116, -104, -44);
        c.quadraticCurveTo(-116, -36, -126, -30);
        c.closePath();
      };
      paintPanel(c, rim, { ...w, base: w.light, dark: w.base }, -1);
      c.save();
      rim();
      c.clip();
      fold(c, [[-116, -60], [-110, -130], [-40, -160]], 5, 0.25);
      fold(c, [[116, -60], [110, -130], [44, -156]], 5, 0.25);
      c.restore();
      thickness(c, rim, w, 7);
      c.restore();
    }
  }
  function cloakHidesEars(o, hood) {
    return Boolean(o.cloak) && hood > 0.5;
  }
  function knitCap(c, t) {
    c.save();
    c.fillStyle = "#d9cfb6";
    c.strokeStyle = "#7a6a50";
    c.lineWidth = 1.5;
    c.shadowColor = "rgba(170,195,255,0.45)";
    c.shadowBlur = 10;
    c.beginPath();
    c.moveTo(-64, -118);
    c.quadraticCurveTo(-60, -170, 0, -172 + Math.sin(t * 2.4) * 1.5);
    c.quadraticCurveTo(60, -170, 64, -118);
    c.quadraticCurveTo(0, -132, -64, -118);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "rgba(0,0,0,0.35)";
    c.lineWidth = 1.5;
    for (let i = -3; i <= 3; i++) {
      c.beginPath();
      c.moveTo(i * 16, -124);
      c.quadraticCurveTo(i * 16 * 0.9, -150, i * 10, -168);
      c.stroke();
    }
    c.strokeStyle = "#5b4029";
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(-62, -122);
    c.quadraticCurveTo(0, -136, 62, -122);
    c.stroke();
    c.fillStyle = "#d9cfb6";
    c.fillRect(-200, -300, 0, 0);
    c.restore();
  }
  function scarf(c) {
    c.save();
    c.fillStyle = OCHRE;
    c.strokeStyle = "#7a5316";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-96, 20);
    c.quadraticCurveTo(0, 62, 96, 20);
    c.quadraticCurveTo(0, 86, -96, 20);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#2a1a08";
    c.lineWidth = 2;
    c.beginPath();
    for (let i = -4; i <= 4; i++) {
      c.moveTo(i * 20 - 8, 40 + Math.abs(i) * 1.2);
      c.lineTo(i * 20, 52 + Math.abs(i) * 1.2);
      c.lineTo(i * 20 + 8, 40 + Math.abs(i) * 1.2);
    }
    c.stroke();
    c.restore();
  }
  function oilLamp(c, x, y, t) {
    c.save();
    c.translate(x, y);
    glow(c, 14, -18, 34, `rgba(255,170,70,${0.5 + Math.sin(t * 9) * 0.12})`);
    c.fillStyle = "#8b5a2b";
    c.strokeStyle = "#3a230f";
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, 0, 24, 11, 0, 0, TAU);
    c.fill();
    c.stroke();
    c.beginPath();
    c.moveTo(18, -4);
    c.lineTo(32, -6);
    c.lineTo(22, 4);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#ffd27a";
    c.beginPath();
    c.moveTo(26, -8);
    c.quadraticCurveTo(22 + Math.sin(t * 12) * 2, -26, 30, -30);
    c.quadraticCurveTo(34, -18, 26, -8);
    c.fill();
    c.restore();
  }
  function glyphTrail(c, x, y, size, vx, vy, t) {
    // ⵎⵇⵉⴷⴻⵛ, "Mqidec", trails behind the dash letter by letter.
    const letters = "ⵎⵇⵉⴷⴻⵛ";
    const n = 4;
    for (let i = 1; i <= n; i++) {
      c.save();
      c.globalAlpha *= 0.6 * (1 - i / (n + 1));
      const px = x - vx * 0.028 * i * size * 0.1,
        py = y + vy * 0.028 * i * size * 0.1;
      if (tifinaghSupported()) tifinagh(c, letters[(i - 1) % letters.length], px, py, size * 0.34);
      else mark(c, i % 2 ? "yaz" : "chevron", px, py, size * 0.4, t);
      c.restore();
    }
  }

  /* Mqidec in his burnous, built as one figure: the cloth is the silhouette and
   * the fur face, ears and paws come out of it. Hood up when hunted; the cape
   * streams behind him in flight. Drawn in part coordinates like rabbit(). */
  /* Mqidec in his burnous, rebuilt from references (a brown felted burnous with
   * dark braid binding, worn open; the hood snug on the head or lying flat on the
   * back). Each cloth piece is painted once to an offscreen canvas in part
   * coordinates with several passes (base, nap, creases, binding, rim light) and
   * composited per frame, so the result is richer and cheaper than live paths. */
  const BURNOUS = {
    brown: { base: "#5a3d27", light: "#7c5a3d", deep: "#2c1b10", braid: "#1a120c", braidHi: "#4a3a30" },
    cream: { base: "#d8cfb8", light: "#efe9d8", deep: "#9d8f74", braid: "#2a1e14", braidHi: "#5c4a3a" },
  };
  const pieceCache = new Map();
  const PIECE_PAD = 40;
  // Paints `draw(ctx)` once into a canvas covering `box` (part coords), at 2x.
  function piece(key, box, draw) {
    if (pieceCache.has(key)) return pieceCache.get(key);
    const scale = 2;
    const cv = document.createElement("canvas");
    cv.width = (box.w + PIECE_PAD * 2) * scale;
    cv.height = (box.h + PIECE_PAD * 2) * scale;
    const x = cv.getContext("2d");
    x.scale(scale, scale);
    x.translate(-box.x + PIECE_PAD, -box.y + PIECE_PAD);
    draw(x);
    const out = { canvas: cv, x: box.x - PIECE_PAD, y: box.y - PIECE_PAD, w: box.w + PIECE_PAD * 2, h: box.h + PIECE_PAD * 2 };
    pieceCache.set(key, out);
    return out;
  }
  function blit(c, pc) {
    c.drawImage(pc.canvas, pc.x, pc.y, pc.w, pc.h);
  }
  // Painting passes shared by every piece.
  function paintCloth(x, pathFn, col, opts = {}) {
    const lightX = opts.lightX === undefined ? -120 : opts.lightX;
    x.save();
    pathFn();
    x.clip();
    const g = x.createLinearGradient(lightX, -160, -lightX * 0.6, 140);
    g.addColorStop(0, col.light);
    g.addColorStop(0.5, col.base);
    g.addColorStop(1, col.deep);
    x.fillStyle = g;
    x.fillRect(-260, -300, 520, 600);
    // Felted wool: a fine, mostly vertical nap, subtle.
    x.globalAlpha = 0.55;
    x.fillStyle = wool(x);
    x.fillRect(-260, -300, 520, 600);
    x.globalAlpha = 1;
    for (const f of opts.folds || []) fold(x, f.pts, f.w, f.a, f.light ? "rgba(255,255,255," : "rgba(0,0,0,");
    // Ambient occlusion along the edges: cloth has thickness.
    x.save();
    x.filter = "blur(7px)";
    x.strokeStyle = "rgba(0,0,0,0.55)";
    x.lineWidth = 12;
    pathFn();
    x.stroke();
    x.restore();
    x.restore();
  }
  function braid(x, pathFn, col, width = 5) {
    x.save();
    x.lineCap = "round";
    x.lineJoin = "round";
    x.strokeStyle = col.braid;
    x.lineWidth = width;
    pathFn();
    x.stroke();
    x.strokeStyle = col.braidHi;
    x.lineWidth = Math.max(1, width * 0.3);
    x.setLineDash([3, 3]);
    pathFn();
    x.stroke();
    x.restore();
  }
  function rimLight(x, pathFn) {
    x.save();
    x.filter = "blur(3px)";
    x.strokeStyle = "rgba(170,195,255,0.5)";
    x.lineWidth = 3;
    pathFn();
    x.stroke();
    x.restore();
  }
  function tasselPainted(x, px, py, len, col) {
    x.save();
    x.strokeStyle = col.braid;
    x.lineWidth = 2;
    x.lineCap = "round";
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px, py + len * 0.35);
    x.stroke();
    x.fillStyle = col.braid;
    x.beginPath();
    x.moveTo(px - 4, py + len * 0.35);
    x.lineTo(px + 4, py + len * 0.35);
    x.lineTo(px + 6, py + len);
    x.lineTo(px - 6, py + len);
    x.closePath();
    x.fill();
    x.strokeStyle = col.braidHi;
    x.lineWidth = 0.8;
    for (let i = -3; i <= 3; i += 1.5) {
      x.beginPath();
      x.moveTo(px + i * 0.8, py + len * 0.42);
      x.lineTo(px + i * 1.4, py + len);
      x.stroke();
    }
    x.restore();
  }

  // Piece painters. Part coordinates: body egg x -107..107, y -116..116.
  function pieceCapeBack(colorKey) {
    const col = BURNOUS[colorKey];
    return piece("capeBack:" + colorKey, { x: -150, y: -70, w: 300, h: 200 }, (x) => {
      const path = () => {
        x.beginPath();
        x.moveTo(-92, -30);
        x.quadraticCurveTo(-146, 40, -134, 122);
        x.quadraticCurveTo(0, 134, 134, 122);
        x.quadraticCurveTo(146, 40, 92, -30);
        x.quadraticCurveTo(0, -46, -92, -30);
        x.closePath();
      };
      paintCloth(x, path, { ...col, light: col.base, base: col.deep, deep: col.deep });
    });
  }
  function pieceFlap(colorKey, sgn) {
    const col = BURNOUS[colorKey];
    return piece(`flap${sgn}:` + colorKey, { x: sgn < 0 ? -150 : 20, y: -60, w: 130, h: 200 }, (x) => {
      // Long panel from the shoulder to the hem, inner edge bound with braid.
      const path = () => {
        x.beginPath();
        x.moveTo(sgn * 106, -46);
        x.quadraticCurveTo(sgn * 142, 30, sgn * 124, 124);
        x.quadraticCurveTo(sgn * 90, 132, sgn * 50, 126);
        x.quadraticCurveTo(sgn * 38, 60, sgn * 44, -4);
        x.quadraticCurveTo(sgn * 58, -34, sgn * 106, -46);
        x.closePath();
      };
      paintCloth(x, path, col, {
        lightX: sgn * -120,
        folds: [
          { pts: [[sgn * 90, -24], [sgn * 108, 50], [sgn * 96, 122]], w: 9, a: 0.3 },
          { pts: [[sgn * 66, 4], [sgn * 72, 64], [sgn * 64, 124]], w: 6, a: 0.22 },
          { pts: [[sgn * 124, -14], [sgn * 136, 50], [sgn * 120, 118]], w: 4, a: 0.3, light: true },
          { pts: [[sgn * 52, 10], [sgn * 50, 70], [sgn * 56, 122]], w: 3, a: 0.22, light: true },
        ],
      });
      // Braid binding on the inner (front) edge and the hem.
      braid(
        x,
        () => {
          x.beginPath();
          x.moveTo(sgn * 50, 126);
          x.quadraticCurveTo(sgn * 38, 60, sgn * 44, -4);
          x.quadraticCurveTo(sgn * 58, -34, sgn * 106, -46);
        },
        col,
      );
      braid(
        x,
        () => {
          x.beginPath();
          x.moveTo(sgn * 124, 124);
          x.quadraticCurveTo(sgn * 90, 132, sgn * 50, 126);
        },
        col,
        4,
      );
      rimLight(x, () => {
        x.beginPath();
        x.moveTo(sgn * 106, -46);
        x.quadraticCurveTo(sgn * 142, 30, sgn * 124, 124);
      });
    });
  }
  function pieceHoodDown(colorKey) {
    const col = BURNOUS[colorKey];
    // The hood lying flat on the back: its bound edge shows as a collar behind the
    // head, and its point with the tassel hangs down the back on the right.
    return piece("hoodDown:" + colorKey, { x: -140, y: -120, w: 300, h: 150 }, (x) => {
      const collar = () => {
        x.beginPath();
        x.moveTo(-118, -30);
        x.quadraticCurveTo(-112, -74, -56, -88);
        x.quadraticCurveTo(0, -100, 56, -88);
        x.quadraticCurveTo(112, -74, 118, -30);
        x.quadraticCurveTo(60, -8, 0, -6);
        x.quadraticCurveTo(-60, -8, -118, -30);
        x.closePath();
      };
      paintCloth(x, collar, col, {
        folds: [
          { pts: [[-90, -44], [-60, -80], [-20, -78]], w: 7, a: 0.35 },
          { pts: [[20, -78], [60, -84], [96, -44]], w: 7, a: 0.35 },
          { pts: [[-100, -34], [0, -92], [100, -34]], w: 3, a: 0.25, light: true },
        ],
      });
      braid(x, () => {
        x.beginPath();
        x.moveTo(-118, -30);
        x.quadraticCurveTo(-112, -74, -56, -88);
        x.quadraticCurveTo(0, -100, 56, -88);
        x.quadraticCurveTo(112, -74, 118, -30);
      }, col, 4);
      const point = () => {
        x.beginPath();
        x.moveTo(80, -72);
        x.quadraticCurveTo(128, -96, 150, -70);
        x.quadraticCurveTo(140, -40, 116, -26);
        x.closePath();
      };
      paintCloth(x, point, col, { lightX: 60 });
      braid(x, () => {
        x.beginPath();
        x.moveTo(80, -72);
        x.quadraticCurveTo(128, -96, 150, -70);
      }, col, 3);
      tasselPainted(x, 148, -68, 30, col);
    });
  }
  function pieceHoodUp(colorKey) {
    const col = BURNOUS[colorKey];
    // Snug on the head: the head's own outline pushed out, a short point to the
    // back right, the face opening bound with braid. Ears come through slits.
    return piece("hoodUp:" + colorKey, { x: -140, y: -200, w: 300, h: 220 }, (x) => {
      const outer = () => {
        x.beginPath();
        x.moveTo(-122, -20);
        x.quadraticCurveTo(-128, -110, -70, -150);
        x.quadraticCurveTo(-30, -172, 20, -168);
        x.quadraticCurveTo(44, -190, 62, -176);
        x.quadraticCurveTo(52, -162, 70, -150);
        x.quadraticCurveTo(128, -110, 122, -20);
        x.quadraticCurveTo(80, -2, 0, 0);
        x.quadraticCurveTo(-80, -2, -122, -20);
        x.closePath();
      };
      const opening = () => {
        x.beginPath();
        x.ellipse(0, -68, 74, 88, 0, 0, TAU);
      };
      const shell = () => {
        outer();
        opening();
      };
      x.save();
      shell();
      x.clip("evenodd");
      paintCloth(x, outer, { ...col, base: col.light, deep: col.base }, {
        lightX: -60,
        folds: [
          { pts: [[-104, -40], [-110, -120], [-60, -150]], w: 8, a: 0.28 },
          { pts: [[104, -40], [112, -120], [66, -146]], w: 8, a: 0.28 },
          { pts: [[-118, -26], [-124, -118], [-64, -156]], w: 4, a: 0.3, light: true },
          { pts: [[30, -164], [50, -176], [60, -172]], w: 3, a: 0.3 },
          // Cloth gathers where the ears push through.
          { pts: [[-96, -120], [-80, -140], [-66, -160]], w: 4, a: 0.35 },
          { pts: [[-60, -126], [-70, -144], [-82, -156]], w: 3, a: 0.3 },
          { pts: [[96, -120], [80, -140], [66, -160]], w: 4, a: 0.35 },
          { pts: [[60, -126], [70, -144], [82, -156]], w: 3, a: 0.3 },
          { pts: [[-20, -150], [0, -166], [24, -150]], w: 3, a: 0.25, light: true },
        ],
      });
      // Soft top light so the crown reads as wool, not leather.
      const crown = x.createRadialGradient(-20, -150, 4, -20, -150, 90);
      crown.addColorStop(0, "rgba(255,240,220,0.22)");
      crown.addColorStop(1, "rgba(255,240,220,0)");
      x.fillStyle = crown;
      x.fillRect(-140, -200, 280, 200);
      x.restore();
      // Thickness at the opening: a dark inner lip, then the braid binding.
      x.save();
      x.filter = "blur(4px)";
      x.strokeStyle = "rgba(0,0,0,0.6)";
      x.lineWidth = 10;
      opening();
      x.stroke();
      x.restore();
      braid(x, opening, col, 4);
      tasselPainted(x, 62, -174, 26, col);
    });
  }

  const clothLag = new Map();
  function mqidec(c, x, y, size, pose = {}) {
    const k = size / A.rabbit.bodyWidth;
    const colorKey = (pose.outfit && pose.outfit.color) || "brown";
    const t = pose.time || 0;
    const vx = pose.vx || 0,
      vy = pose.vy || 0;
    const speed = Math.hypot(vx, vy);
    const flying = pose.state === "flying" || pose.state === "cannon";
    const hood = pose.hunted ? 1 : 0;
    const lagKey = pose.id === undefined ? "default" : pose.id;
    const lag = clothLag.get(lagKey) || { vx: 0, vy: 0 };
    lag.vx += (vx - lag.vx) * 0.09;
    lag.vy += (vy - lag.vy) * 0.09;
    clothLag.set(lagKey, lag);
    let sx = 1,
      sy = 1,
      tilt = 0;
    if (flying) {
      const stretch = Math.min(0.18, speed * 0.011);
      sy = 1 + stretch;
      sx = 1 - stretch * 0.6;
      tilt = Math.max(-0.4, Math.min(0.4, vx * 0.026));
    } else if (pose.aim) {
      const squash = Math.min(0.16, pose.aim * 0.045);
      sy = 1 - squash;
      sx = 1 + squash * 0.7;
    } else {
      sy = 1 + Math.sin(t * 2.4) * 0.012;
      sx = 1 - Math.sin(t * 2.4) * 0.009;
    }
    if (pose.landed) {
      sy *= 1 - pose.landed * 0.22;
      sx *= 1 + pose.landed * 0.18;
    }
    const swing = flying ? Math.max(-0.14, Math.min(0.14, -lag.vx * 0.012)) : Math.sin(t * 1.1) * 0.012;
    const lift = flying ? Math.min(0.14, Math.hypot(lag.vx, lag.vy) * 0.01) : 0;
    // Trailing: the hem is dragged opposite to the motion, more than the shoulders.
    const trailX = flying ? Math.max(-0.5, Math.min(0.5, -lag.vx * 0.045)) : 0;
    const trailY = flying ? Math.max(-0.18, Math.min(0.18, lag.vy * 0.012)) : 0;
    const blink = pose.blink === undefined ? blinkAt(t) : pose.blink;
    const lx = Math.max(-1, Math.min(1, (pose.look && pose.look.x) || vx * 0.08));
    const ly = Math.max(-1, Math.min(1, (pose.look && pose.look.y) || -vy * 0.06));
    const ear = flying ? Math.max(-0.6, Math.min(0.6, -vx * 0.04)) + (vy > 0 ? 0.25 : -0.1) : pose.aim ? 0.3 : Math.sin(t * 1.7) * 0.06;

    if (pose.outfit && pose.outfit.glyphs && pose.dash && !pose.ghost) glyphTrail(c, x, y, size, vx, vy, t);
    c.save();
    c.globalAlpha *= pose.alpha === undefined ? 1 : pose.alpha;
    c.translate(x, y);
    c.rotate(tilt);
    c.scale(sx * k, sy * k);

    // 1. Cape behind the body: the hem is dragged behind the motion.
    c.save();
    c.translate(0, -30);
    c.transform(1, 0, trailX * 0.8, 1 - lift - trailY * 0.5, 0, 0);
    c.rotate(swing * 0.4);
    c.translate(0, 30);
    blit(c, pieceCapeBack(colorKey));
    c.restore();
    // 2. Hood lying on the back (behind the head).
    if (!hood) blit(c, pieceHoodDown(colorKey));
    // 3. The fur body, with its own glow.
    c.save();
    c.shadowColor = pose.dash ? "rgba(150,220,255,0.95)" : "rgba(170,195,255,0.55)";
    c.shadowBlur = 26 * k * 4;
    const body = part.body;
    c.drawImage(img.rabbit_body, body.x, body.y, body.w, body.h);
    c.restore();
    // 4. Shadow of the cloak on the fur, each side.
    c.save();
    c.beginPath();
    c.ellipse(0, 8, 104, 112, 0, 0, TAU);
    c.clip();
    for (const sgn of [-1, 1]) {
      const g = c.createLinearGradient(sgn * 40, 0, sgn * 90, 0);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.6)");
      c.fillStyle = g;
      c.fillRect(sgn < 0 ? -110 : 40, -60, 70, 190);
    }
    c.restore();
    // 5. Front panels: pinned at the shoulder, the hem trails and flares outward.
    for (const sgn of [-1, 1]) {
      c.save();
      c.translate(sgn * 100, -44);
      // Shear so the hem lags behind the shoulders; flare the hem outward a little.
      const flare = flying ? 1 + Math.min(0.12, Math.hypot(lag.vx, lag.vy) * 0.008) : 1;
      c.transform(flare, 0, trailX * (1 + sgn * 0.25), 1 - lift - trailY, 0, 0);
      c.rotate(swing * (1 + sgn * 0.2));
      c.translate(-sgn * 100, 44);
      blit(c, pieceFlap(colorKey, sgn));
      c.restore();
    }
    // 6. Paws at the hem, cord at the throat.
    c.save();
    c.shadowColor = "rgba(235,245,255,0.9)";
    c.shadowBlur = 40 * k * 4;
    for (const key of ["paw_l", "paw_r"]) {
      const p = part[key];
      c.drawImage(img["rabbit_" + key], p.x, p.y, p.w, p.h);
    }
    c.restore();
    c.save();
    c.strokeStyle = BURNOUS[colorKey].braid;
    c.lineWidth = 2;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-48, -30);
    c.quadraticCurveTo(-16, -6, 0, 6);
    c.moveTo(48, -30);
    c.quadraticCurveTo(16, -6, 0, 6);
    c.stroke();
    c.restore();
    tasselPainted(c, -5, 8, 16, BURNOUS[colorKey]);
    tasselPainted(c, 7, 6, 16, BURNOUS[colorKey]);
    // 7. Hood up: snug over the head; the ears come through it.
    if (hood) {
      blit(c, pieceHoodUp(colorKey));
      c.save();
      c.beginPath();
      c.ellipse(0, -68, 74, 88, 0, 0, TAU);
      c.clip();
      const cast = c.createLinearGradient(0, -156, 0, -90);
      cast.addColorStop(0, "rgba(0,0,0,0.7)");
      cast.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = cast;
      c.fillRect(-90, -160, 180, 80);
      c.restore();
    }
    // 8. Ears, over everything; with the hood up, a small cloth fold at each base.
    for (const [key, sign] of [
      ["ear_l", -1],
      ["ear_r", 1],
    ]) {
      const p = part[key];
      c.save();
      c.translate(p.x + p.w / 2, p.y + p.h);
      c.rotate(sign * ear);
      c.translate(-(p.x + p.w / 2), -(p.y + p.h));
      if (hood) {
        c.save();
        c.fillStyle = BURNOUS[colorKey].deep;
        c.beginPath();
        c.ellipse(p.x + p.w / 2, p.y + p.h - 8, p.w * 0.75, 9, 0, 0, TAU);
        c.fill();
        c.restore();
      }
      c.drawImage(img["rabbit_" + key], p.x, p.y, p.w, p.h);
      const hl = part[key === "ear_l" ? "ear_hl_l" : "ear_hl_r"];
      c.drawImage(img["rabbit_" + (key === "ear_l" ? "ear_hl_l" : "ear_hl_r")], hl.x, hl.y, hl.w, hl.h);
      if (hood) {
        c.save();
        c.fillStyle = BURNOUS[colorKey].base;
        c.beginPath();
        c.ellipse(p.x + p.w / 2, p.y + p.h - 4, p.w * 0.7, 6, 0, 0, TAU);
        c.fill();
        c.restore();
      }
      c.restore();
    }
    // 9. Eyes, pupils, the protective mark.
    for (const key of ["eye_l", "eye_r"]) {
      const p = part[key];
      const open = pose.state === "dead" ? 0.15 : 1 - blink;
      c.save();
      c.translate(0, p.y + p.h / 2);
      c.scale(1, Math.max(0.08, open));
      c.translate(0, -(p.y + p.h / 2));
      c.drawImage(img["rabbit_" + key], p.x, p.y, p.w, p.h);
      if (open > 0.3 && pose.state !== "dead") {
        const pw = A.rabbit.pupil.w * 0.62,
          ph = A.rabbit.pupil.h * 0.62;
        c.drawImage(img.rabbit_pupil, p.x + p.w / 2 - pw / 2 + lx * p.w * 0.2, p.y + p.h / 2 - ph / 2 + ly * p.h * 0.18, pw, ph);
      }
      c.restore();
    }
    ticrad(c, "light", t);
    c.restore();
  }

  /* Mqidec with the burnous simulated and rendered in Blender (Tools/blender/
   * mqidec_cloak.py). The render is a front orthographic view at 200 px per unit,
   * centred on the body, with the body held out, so it composites over the sprite.
   * One render per state: idle (hood on the back), hunted (hood up), flight. */
  const CLOAK_W = 1100,
    CLOAK_H = 1300;
  function mqidecSim(c, x, y, size, pose = {}) {
    const k = size / A.rabbit.bodyWidth;
    const t = pose.time || 0;
    const vx = pose.vx || 0,
      vy = pose.vy || 0;
    const speed = Math.hypot(vx, vy);
    const flying = pose.state === "flying" || pose.state === "cannon";
    const hood = Boolean(pose.hunted);
    const stateKey = hood ? "hunted" : flying ? "flight" : "idle";
    const cloak = img["cloak_" + stateKey] || img.cloak_idle;
    let sx = 1,
      sy = 1,
      tilt = 0;
    if (flying) {
      const stretch = Math.min(0.16, speed * 0.01);
      sy = 1 + stretch;
      sx = 1 - stretch * 0.6;
      tilt = Math.max(-0.4, Math.min(0.4, vx * 0.026));
    } else if (pose.aim) {
      const squash = Math.min(0.16, pose.aim * 0.045);
      sy = 1 - squash;
      sx = 1 + squash * 0.7;
    } else {
      sy = 1 + Math.sin(t * 2.4) * 0.012;
      sx = 1 - Math.sin(t * 2.4) * 0.009;
    }
    if (pose.landed) {
      sy *= 1 - pose.landed * 0.22;
      sx *= 1 + pose.landed * 0.18;
    }
    const blink = pose.blink === undefined ? blinkAt(t) : pose.blink;
    const lx = Math.max(-1, Math.min(1, (pose.look && pose.look.x) || vx * 0.08));
    const ly = Math.max(-1, Math.min(1, (pose.look && pose.look.y) || -vy * 0.06));
    const ear = flying ? Math.max(-0.6, Math.min(0.6, -vx * 0.04)) + (vy > 0 ? 0.25 : -0.1) : pose.aim ? 0.3 : Math.sin(t * 1.7) * 0.06;
    if (pose.outfit && pose.outfit.glyphs && pose.dash && !pose.ghost) glyphTrail(c, x, y, size, vx, vy, t);
    c.save();
    c.globalAlpha *= pose.alpha === undefined ? 1 : pose.alpha;
    c.translate(x, y);
    c.rotate(tilt);
    c.scale(sx * k, sy * k);
    // 1. The fur body with its glow.
    c.save();
    c.shadowColor = pose.dash ? "rgba(150,220,255,0.95)" : "rgba(170,195,255,0.55)";
    c.shadowBlur = 26 * k * 4;
    const body = part.body;
    c.drawImage(img.rabbit_body, body.x, body.y, body.w, body.h);
    c.restore();
    // 2. The simulated cloak, mapped onto the body (render px / 2 = part px).
    if (cloak) {
      c.save();
      // The flight render was simulated moving right; mirror it for the other way.
      if (flying && vx < 0) c.scale(-1, 1);
      c.drawImage(cloak, -CLOAK_W / 4, -CLOAK_H / 4, CLOAK_W / 2, CLOAK_H / 2);
      c.restore();
    }
    // 3. Paws hold the cloak's edges.
    c.save();
    c.shadowColor = "rgba(235,245,255,0.9)";
    c.shadowBlur = 40 * k * 4;
    for (const key of ["paw_l", "paw_r"]) {
      const p = part[key];
      c.drawImage(img["rabbit_" + key], p.x, p.y, p.w, p.h);
    }
    c.restore();
    // 4. Ears over everything (through the hood when it is up).
    for (const [key, sign] of [
      ["ear_l", -1],
      ["ear_r", 1],
    ]) {
      const p = part[key];
      c.save();
      c.translate(p.x + p.w / 2, p.y + p.h);
      c.rotate(sign * ear);
      c.translate(-(p.x + p.w / 2), -(p.y + p.h));
      c.drawImage(img["rabbit_" + key], p.x, p.y, p.w, p.h);
      const hl = part[key === "ear_l" ? "ear_hl_l" : "ear_hl_r"];
      c.drawImage(img["rabbit_" + (key === "ear_l" ? "ear_hl_l" : "ear_hl_r")], hl.x, hl.y, hl.w, hl.h);
      c.restore();
    }
    // 5. Eyes, pupils and the mark.
    for (const key of ["eye_l", "eye_r"]) {
      const p = part[key];
      const open = pose.state === "dead" ? 0.15 : 1 - blink;
      c.save();
      c.translate(0, p.y + p.h / 2);
      c.scale(1, Math.max(0.08, open));
      c.translate(0, -(p.y + p.h / 2));
      c.drawImage(img["rabbit_" + key], p.x, p.y, p.w, p.h);
      if (open > 0.3 && pose.state !== "dead") {
        const pw = A.rabbit.pupil.w * 0.62,
          ph = A.rabbit.pupil.h * 0.62;
        c.drawImage(img.rabbit_pupil, p.x + p.w / 2 - pw / 2 + lx * p.w * 0.2, p.y + p.h / 2 - ph / 2 + ly * p.h * 0.18, pw, ph);
      }
      c.restore();
    }
    ticrad(c, "light", t);
    c.restore();
  }

  // pose: {time, vx, vy, state, look:{x,y}, aim, dash, blink, alpha, outfit}
  function rabbit(c, x, y, size, pose = {}) {
    const o = pose.outfit || {};
    const k = size / A.rabbit.bodyWidth;
    const t = pose.time || 0;
    const vx = pose.vx || 0,
      vy = pose.vy || 0;
    const speed = Math.hypot(vx, vy);
    const flying = pose.state === "flying" || pose.state === "cannon";
    let sx = 1,
      sy = 1,
      tilt = 0;
    if (flying) {
      const stretch = Math.min(0.22, speed * 0.014);
      sy = 1 + stretch;
      sx = 1 - stretch * 0.6;
      tilt = Math.max(-0.5, Math.min(0.5, vx * 0.03));
    } else if (pose.aim) {
      const squash = Math.min(0.18, pose.aim * 0.05);
      sy = 1 - squash;
      sx = 1 + squash * 0.7;
    } else if (pose.state === "float") {
      // Floating: a slow bob and roll on the swell.
      sy = 1 + Math.sin(t * 2.2) * 0.03;
      sx = 1 - Math.sin(t * 2.2) * 0.02;
      tilt = Math.sin(t * 1.3) * 0.08;
    } else {
      sy = 1 + Math.sin(t * 2.4) * 0.018;
      sx = 1 - Math.sin(t * 2.4) * 0.012;
    }
    const floating = pose.state === "float";
    if (pose.landed) {
      sy *= 1 - pose.landed * 0.25;
      sx *= 1 + pose.landed * 0.2;
    }
    const blink = pose.blink === undefined ? blinkAt(t) : pose.blink;
    const lx = Math.max(-1, Math.min(1, (pose.look && pose.look.x) || vx * 0.08));
    const ly = Math.max(-1, Math.min(1, (pose.look && pose.look.y) || -vy * 0.06));
    const ear = flying
      ? Math.max(-0.6, Math.min(0.6, -vx * 0.04)) + (vy > 0 ? 0.25 : -0.1)
      : pose.aim
        ? 0.3
        : floating
          ? -0.06 + Math.sin(t * 2.6) * 0.04
          : Math.sin(t * 1.7) * 0.06;
    if (o.glyphs && pose.dash && !pose.ghost) glyphTrail(c, x, y, size, vx, vy, t);
    c.save();
    c.globalAlpha *= pose.alpha === undefined ? 1 : pose.alpha;
    c.translate(x, y + (floating ? Math.sin(t * 2.2) * size * 0.035 : 0));
    c.rotate(tilt);
    c.scale(sx * k, sy * k);
    const hood = o.cloak ? Math.max(0, Math.min(1, o.hood === undefined ? (pose.hunted ? 1 : 0) : o.hood)) : 0;
    const w = WOOL[o.color || "brown"] || WOOL.brown;
    if (o.cloak) cloakBack(c, hood, w);
    const draw = (key, extra) => {
      const p = part[key];
      if (extra) {
        c.save();
        extra(p);
        c.drawImage(img["rabbit_" + key], p.x, p.y, p.w, p.h);
        c.restore();
      } else c.drawImage(img["rabbit_" + key], p.x, p.y, p.w, p.h);
    };
    const earTurn = (sign) => (p) => {
      const px = p.x + p.w / 2,
        py = p.y + p.h;
      c.translate(px, py);
      c.rotate(sign * (ear + (pose.state === "dead" ? 0.9 : 0)));
      c.translate(-px, -py);
    };
    const earsOut = !cloakHidesEars(o, hood);
    if (earsOut) {
      draw("ear_l", earTurn(-1));
      draw("ear_r", earTurn(1));
    }
    c.save();
    c.shadowColor = pose.dash ? "rgba(150,220,255,0.95)" : "rgba(170,195,255,0.55)";
    c.shadowBlur = (pose.dash ? 60 : 26) * k * 4;
    draw("body");
    c.restore();
    if (earsOut) {
      draw("ear_hl_l", earTurn(-1));
      draw("ear_hl_r", earTurn(1));
    }
    if (o.pottery) potteryBody(c);
    if (o.earStripes && earsOut) earStripes(c);
    if (o.cloak) cloakFront(c, hood, t, w);
    if (o.scarf) scarf(c);
    if (o.necklace) necklace(c, t);
    if (o.cap && hood < 0.5) knitCap(c, t);
    if (o.fibula) fibula(c, 0, 30, 16, t);
    c.save();
    c.shadowColor = "rgba(235,245,255,0.9)";
    c.shadowBlur = 40 * k * 4;
    // Floating, the paws paddle in turn under the surface.
    const paddle = (phase) => (floating ? () => c.translate(Math.sin(t * 6 + phase) * 7, Math.cos(t * 6 + phase) * 3) : undefined);
    draw("paw_l", paddle(0));
    draw("paw_r", paddle(Math.PI));
    if (o.lamp) oilLamp(c, 70, 84, t);
    if (o.ticrad) ticrad(c, o.ticrad, t);
    else if (o.marks) {
      mark(c, "chevron", 0, -100, 16, t);
      mark(c, "eye", -82, 14, 12, t);
      mark(c, "eye", 82, 14, 12, t);
    }
    for (const key of o.marks || o.ticrad ? [] : ["whisker_l1", "whisker_l2", "whisker_r1", "whisker_r2"])
      draw(key, (p) => {
        const px = key[8] === "l" ? p.x + p.w : p.x;
        c.translate(px, p.y + p.h / 2);
        c.rotate(Math.sin(t * 9 + p.y) * 0.05 * (key[8] === "l" ? 1 : -1));
        c.translate(-px, -(p.y + p.h / 2));
      });
    for (const key of ["eye_l", "eye_r"]) {
      const p = part[key];
      const open = pose.state === "dead" ? 0.15 : 1 - blink;
      c.save();
      c.translate(0, p.y + p.h / 2);
      c.scale(1, Math.max(0.08, open));
      c.translate(0, -(p.y + p.h / 2));
      c.drawImage(img["rabbit_" + key], p.x, p.y, p.w, p.h);
      if (open > 0.3 && pose.state !== "dead") {
        const pw = A.rabbit.pupil.w * 0.62,
          ph = A.rabbit.pupil.h * 0.62;
        c.shadowBlur = 0;
        c.drawImage(
          img.rabbit_pupil,
          p.x + p.w / 2 - pw / 2 + lx * p.w * 0.2,
          p.y + p.h / 2 - ph / 2 + ly * p.h * 0.18,
          pw,
          ph,
        );
      }
      c.restore();
    }
    c.restore();
    c.restore();
  }
  function blinkAt(t) {
    const phase = (t + 0.7) % 3.7;
    return phase < 0.14 ? Math.sin((phase / 0.14) * Math.PI) : 0;
  }

  /* ---------- Owl, Weaver, pumpkins ---------- */
  function owl(c, x, y, h, eyes = "open", t = 0) {
    const image = img["owl_" + eyes] || img.owl_open;
    const w = (h * image.width) / image.height;
    c.save();
    c.shadowColor = "rgba(150,170,255,0.6)";
    c.shadowBlur = h * 0.18;
    centred(c, image, x, y - h / 2 + Math.sin(t * 1.3) * h * 0.006, w, h);
    c.restore();
    if (eyes !== "closed") {
      glow(c, x - w * 0.2, y - h * 0.62, h * 0.12, "rgba(240,230,140,0.35)");
      glow(c, x + w * 0.2, y - h * 0.62, h * 0.12, "rgba(240,230,140,0.35)");
    }
  }

  // The Weaver: original spider body and legs, head down on her thread.
  function weaver(c, x, y, size, t = 0, hurt = 0) {
    const s = A.spider;
    const k = size / 280;
    c.save();
    c.strokeStyle = "rgba(230,240,255,0.55)";
    c.lineWidth = Math.max(1, size * 0.012);
    c.beginPath();
    c.moveTo(x, y - size * 0.35);
    c.lineTo(x, -10);
    c.stroke();
    c.translate(x, y);
    c.scale(k, k);
    c.translate(-s.centre.x, -s.centre.y);
    c.shadowColor = hurt ? "rgba(255,255,255,0.95)" : "rgba(140,160,255,0.5)";
    c.shadowBlur = hurt ? 40 : 18;
    s.legs.forEach((leg, i) => {
      const pivotX = leg.side === "l" ? leg.x + leg.w : leg.x;
      const pivotY = leg.y + leg.h / 2;
      c.save();
      c.translate(pivotX, pivotY);
      c.rotate(Math.sin(t * 3 + i * 1.3) * 0.09 * (leg.side === "l" ? 1 : -1));
      c.translate(-pivotX, -pivotY);
      c.drawImage(img["spider_leg_" + i], leg.x, leg.y, leg.w, leg.h);
      c.restore();
    });
    c.drawImage(
      img.spider_body,
      s.centre.x - s.body.w / 2,
      s.centre.y - s.body.h / 2,
      s.body.w,
      s.body.h,
    );
    c.restore();
    const eyeY = y + size * 0.13;
    for (const dx of [-0.035, 0.035])
      glow(c, x + dx * size, eyeY, size * 0.05, hurt ? "rgba(255,255,255,1)" : "rgba(255,40,40,0.95)");
  }

  // mood: sleep | hunt (idle, floating) | notice | chase | return | roll | flung
  function pumpkin(c, x, y, size, t = 0, mood = "hunt", ripe = false, extra = {}) {
    const vx = extra.vx || 0,
      vy = extra.vy || 0;
    const speed = Math.hypot(vx, vy);
    const bob = mood === "sleep" ? Math.sin(t * 1.2) * 0.02 : mood === "chase" ? Math.sin(t * 7 + x) * 0.03 : Math.sin(t * 2.2 + x) * 0.05;
    const hot = mood === "chase" || mood === "notice";
    const glowColor = ripe
      ? "rgba(255,150,40,0.55)"
      : mood === "sleep" || mood === "roll"
        ? "rgba(90,200,70,0.22)"
        : mood === "notice"
          ? `rgba(220,255,160,${0.5 + Math.sin(t * 40) * 0.3})`
          : mood === "chase"
            ? "rgba(150,255,90,0.65)"
            : mood === "return"
              ? "rgba(120,240,80,0.2)"
              : "rgba(120,240,80,0.38)";
    glow(c, x, y, size * (hot ? 1.3 : 0.95), glowColor);
    // Stretch along the direction of travel when lunging, squash when noticing.
    let sx = 1,
      sy = 1;
    if (mood === "chase" && speed > 1.5) {
      const k = Math.min(0.22, speed * 0.035);
      sx = 1 + k;
      sy = 1 - k * 0.7;
    } else if (mood === "notice") {
      const k = Math.sin(t * 30) * 0.06;
      sx = 1 - k;
      sy = 1 + k;
    } else if (mood === "sleep") sx = sy = 1 + Math.sin(t * 1.2) * 0.03;
    let angle = mood === "chase" ? Math.atan2(vy, Math.abs(vx)) * 0.25 * Math.sign(vx || 1) : Math.sin(t * 1.5 + x) * 0.05;
    if (mood === "roll" || mood === "flung") angle = extra.spin || 0;
    c.save();
    if (mood === "sleep" || mood === "return") c.globalAlpha *= 0.82;
    c.translate(x, y + bob * size);
    if (mood === "chase" && speed > 1.5) c.rotate(Math.atan2(vy, vx) * 0.15);
    c.scale(sx, sy);
    centred(c, ripe ? img.pumpkin_orange : img.pumpkin, 0, 0, size, size * (img.pumpkin.height / img.pumpkin.width), angle);
    c.restore();
    if (mood === "notice") {
      // The eyes flare and a thin ring shows how far it can smell you.
      glow(c, x - size * 0.18, y - size * 0.08, size * 0.16, "rgba(255,255,220,0.9)");
      glow(c, x + size * 0.12, y - size * 0.1, size * 0.16, "rgba(255,255,220,0.9)");
    }
    if (extra.ring) {
      c.save();
      c.strokeStyle = `rgba(170,255,110,${extra.ring})`;
      c.setLineDash([size * 0.12, size * 0.12]);
      c.lineWidth = Math.max(1, size * 0.025);
      c.beginPath();
      c.arc(x, y, extra.rangePx, 0, TAU);
      c.stroke();
      c.restore();
    }
  }
  function moodOf(p) {
    if (p.flung) return "flung";
    if (p.roll) return "roll";
    if (p.range === 0) return "sleep";
    return p.state === "notice" ? "notice" : p.state === "hunt" ? "chase" : p.state === "return" ? "return" : "hunt";
  }

  function silkWeb(c, x, y, r, alpha = 1, stretch = 0) {
    c.save();
    c.globalAlpha *= alpha;
    c.translate(x, y);
    c.scale(1, 1 + stretch);
    c.strokeStyle = "rgba(240,246,255,0.9)";
    c.shadowColor = "rgba(150,180,255,0.9)";
    c.shadowBlur = r * 0.25;
    c.lineWidth = Math.max(1, r * 0.035);
    const spokes = 9;
    c.beginPath();
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * TAU + 0.2;
      c.moveTo(0, 0);
      c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    for (let ring = 1; ring <= 4; ring++) {
      const rr = (r * ring) / 4.3;
      for (let i = 0; i <= spokes; i++) {
        const a = (i / spokes) * TAU + 0.2;
        const sag = 0.86 + (i % 2) * 0.05;
        const px = Math.cos(a) * rr * sag,
          py = Math.sin(a) * rr * sag;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
    }
    c.stroke();
    c.restore();
  }

  function tightWeb(c, x, y, r, nx, ny, t, hit = 0) {
    c.save();
    c.translate(x, y);
    c.rotate(Math.atan2(ny, nx) + Math.PI / 2);
    c.scale(1, 0.55 - hit * 0.2);
    c.strokeStyle = "rgba(240,246,255,0.95)";
    c.shadowColor = "rgba(170,200,255,1)";
    c.shadowBlur = r * 0.35;
    c.lineWidth = Math.max(1.2, r * 0.05);
    c.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      c.moveTo(0, 0);
      c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    for (let ring = 1; ring <= 5; ring++) {
      const rr = (r * ring) / 5;
      c.moveTo(rr, 0);
      c.arc(0, 0, rr, 0, TAU);
    }
    c.stroke();
    c.restore();
    glow(c, x, y, r * 1.1, `rgba(170,210,255,${0.18 + hit * 0.4 + Math.sin(t * 5) * 0.04})`);
  }
  function zipLine(c, x1, y1, x2, y2, rider) {
    c.save();
    c.strokeStyle = "rgba(240,246,255,0.85)";
    c.shadowColor = "rgba(160,190,255,0.9)";
    c.shadowBlur = 8;
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x1, -10);
    c.moveTo(x2, y2);
    c.lineTo(x2, -10);
    c.stroke();
    if (rider) {
      c.fillStyle = "#e9eef8";
      c.beginPath();
      c.arc(rider.x, rider.y, 5, 0, TAU);
      c.fill();
      c.beginPath();
      c.moveTo(rider.x, rider.y);
      c.lineTo(rider.x, rider.y + rider.drop);
      c.stroke();
    }
    c.restore();
  }
  function seesawStone(c, x, top, w, tilt) {
    c.save();
    c.translate(x, top);
    c.rotate(tilt * 0.16);
    stoneDisc(c, 0, 0, w);
    c.restore();
    c.save();
    c.fillStyle = "#2c2f35";
    c.beginPath();
    c.moveTo(x - w * 0.06, top + w * 0.02);
    c.lineTo(x + w * 0.06, top + w * 0.02);
    c.lineTo(x, top + w * 0.1);
    c.closePath();
    c.fill();
    c.restore();
  }

  function thread(c, x, y, toY, alpha = 0.55, frayed = 0, t = 0) {
    c.save();
    c.strokeStyle = `rgba(230,240,255,${alpha})`;
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(x, toY);
    if (frayed) {
      const mid = (y + toY) / 2;
      c.lineTo(x + Math.sin(t * 40) * frayed * 3, mid - 4);
      c.moveTo(x - 3, mid + 4);
    }
    c.lineTo(x, y);
    c.stroke();
    c.restore();
  }

  function house(c, x, base, w, t = 0, lit = 1, single = false) {
    const h = w * 0.75;
    c.save();
    c.fillStyle = "#050507";
    c.shadowColor = "rgba(150,170,255,0.35)";
    c.shadowBlur = w * 0.06;
    c.beginPath();
    c.moveTo(x - w * 0.5, base);
    c.lineTo(x - w * 0.5, base - h * 0.55);
    c.lineTo(x - w * 0.56, base - h * 0.55);
    c.lineTo(x - w * 0.05, base - h);
    c.lineTo(x + w * 0.56, base - h * 0.55);
    c.lineTo(x + w * 0.5, base - h * 0.55);
    c.lineTo(x + w * 0.5, base);
    c.closePath();
    c.fill();
    c.fillRect(x + w * 0.22, base - h * 0.98, w * 0.09, h * 0.3);
    c.restore();
    const windows = single
      ? [[0.18, 0.62]]
      : [
          [-0.3, 0.42],
          [0.18, 0.42],
          [-0.06, 0.66],
          [0.3, 0.2],
        ];
    windows.forEach(([wx, wy], i) => {
      const on = Math.max(0, Math.min(1, lit * windows.length - i));
      const px = x + wx * w,
        py = base - wy * h;
      const flicker = 0.85 + Math.sin(t * 7 + i * 3) * 0.08;
      if (on > 0) glow(c, px, py, w * 0.12, `rgba(255,200,90,${0.45 * on * flicker})`);
      c.fillStyle = on > 0 ? `rgba(255,214,120,${on})` : "#151518";
      c.fillRect(px - w * 0.045, py - w * 0.06, w * 0.09, w * 0.12);
    });
  }

  /* ---------- Backdrop ---------- */
  function backdrop(c, w, h, progress, chapter, t) {
    const bw = Math.max(w, (h * 9) / 16) * 1.06;
    const bh = (bw * 16) / 9;
    const shift = (bh - h) * (1 - progress);
    c.drawImage(img.bg_far, (w - bw) / 2, -shift * 0.4 - (bh - h) * 0.3, bw, bh);
    const tint = c.createLinearGradient(0, 0, 0, h);
    if (chapter === 0) {
      tint.addColorStop(0, "rgba(20,26,40,0.35)");
      tint.addColorStop(1, "rgba(10,14,22,0.25)");
    } else if (chapter === 1) {
      tint.addColorStop(0, "rgba(40,24,60,0.42)");
      tint.addColorStop(1, "rgba(14,10,24,0.3)");
    } else {
      tint.addColorStop(0, "rgba(46,30,18,0.38)");
      tint.addColorStop(1, "rgba(12,8,8,0.35)");
    }
    c.fillStyle = tint;
    c.fillRect(0, 0, w, h);
    const moonX = w * 0.78,
      moonY = h * 0.14 + shift * 0.05;
    glow(c, moonX, moonY, w * 0.22, "rgba(220,230,255,0.18)");
    c.fillStyle = "rgba(230,236,250,0.85)";
    c.beginPath();
    c.arc(moonX, moonY, w * 0.055, 0, TAU);
    c.fill();
    if (chapter === 2) house(c, w * 0.26, h * 0.62 + shift * 0.12, w * 0.32, t, 0.25);
    if (chapter >= 1) {
      c.save();
      c.strokeStyle = "rgba(225,232,255,0.16)";
      c.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        const sx = ((i * 0.153 + 0.05) % 1) * w;
        c.beginPath();
        c.moveTo(sx, 0);
        c.quadraticCurveTo(sx + 18 * Math.sin(t * 0.4 + i), h * 0.3, sx + 6, h * (0.35 + (i % 3) * 0.12));
        c.stroke();
      }
      c.restore();
    }
  }

  /* ---------- The stage ---------- */
  function stoneDisc(c, x, top, w, alpha = 1, shake = 0) {
    const iw = w * 1.1;
    const ih = Math.min((iw * A.stone.h) / A.stone.w, w * 0.42);
    c.save();
    c.globalAlpha *= alpha;
    c.shadowColor = "rgba(150,175,255,0.55)";
    c.shadowBlur = w * 0.12;
    c.drawImage(img.stone, x - iw / 2 + shake, top - ih * A.stone.rim, iw, ih);
    c.restore();
  }

  function post(c, x, top, w, h) {
    c.save();
    const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, "#6c7176");
    g.addColorStop(0.5, "#9ba0a5");
    g.addColorStop(1, "#5a5e63");
    c.fillStyle = g;
    c.strokeStyle = "#2b2e33";
    c.lineWidth = Math.max(1.5, w * 0.08);
    c.shadowColor = "rgba(150,175,255,0.45)";
    c.shadowBlur = w * 0.5;
    c.beginPath();
    c.moveTo(x - w / 2, top + h);
    c.lineTo(x - w / 2, top + w * 0.35);
    c.arc(x, top + w * 0.35, w / 2, Math.PI, 0);
    c.lineTo(x + w / 2, top + h);
    c.closePath();
    c.fill();
    c.shadowBlur = 0;
    c.stroke();
    c.beginPath();
    c.moveTo(x - w * 0.1, top + h * 0.35);
    c.lineTo(x + w * 0.08, top + h * 0.5);
    c.lineTo(x - w * 0.05, top + h * 0.62);
    c.stroke();
    c.restore();
  }

  function earth(c, x0, x1, top, bottom) {
    c.save();
    const g = c.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, "#26262b");
    g.addColorStop(1, "#0b0b0d");
    c.fillStyle = g;
    c.fillRect(x0, top, x1 - x0, bottom - top);
    c.strokeStyle = "rgba(170,190,255,0.35)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x0, top);
    c.lineTo(x1, top);
    c.stroke();
    c.fillStyle = "#151518";
    for (let x = x0; x < x1; x += 7) {
      const blade = 4 + ((x * 13) % 9);
      c.beginPath();
      c.moveTo(x, top + 1);
      c.lineTo(x + 2, top - blade);
      c.lineTo(x + 4, top + 1);
      c.fill();
    }
    c.restore();
  }

  function solidNow(p, time) {
    if (p.alive === false) return 0;
    if (p.type !== "ghost") return 1;
    const v = Math.sin((time * TAU) / (p.period || Math.PI) + (p.offset || 0));
    return Math.max(0.12, Math.min(1, (v + 0.25) * 2.2));
  }

  // A frog's leap as the drawing needs it (engine: leap {height, every}, leapClock, homeY):
  // leap {k: how high in the arc, 0 to 1, up: still rising} while in the air, and windup
  // (0 to 1), the crouch in the last 0.3 s before the next leap.
  function frogPose(p) {
    if (!p.leap) return {};
    const every = p.leap.every || 2,
      T = 2 * Math.sqrt((2 * p.leap.height) / 14.715);
    const clock = (p.leapClock || 0) % every;
    const air = p.y > p.homeY + 0.05;
    return {
      leap: air ? { k: Math.min(1, (p.y - p.homeY) / p.leap.height), up: clock < T / 2 } : null,
      windup: !air && p.leapClock > 0 ? Math.max(0, 1 - (every - clock) / 0.3) : 0,
    };
  }

  // view: {width, height, cameraY, chapter, time, aim, fx, hidden, doorFrame, enterFrame}
  function drawStage(c, g, view) {
    const w = view.width,
      h = view.height;
    const S = w / 12;
    const X = (x) => w / 2 + x * S;
    const Y = (y) => h - (y - view.cameraY) * S;
    const t = g.time;
    const progress = Math.max(0, Math.min(1, view.cameraY / Math.max(1, g.level.height - 14)));
    // A tale theme (tales-art.js) replaces the graveyard with its own place.
    const th = view.theme && g.level.theme ? view.theme : null;
    if (th) th.backdrop(c, w, h, progress, g.level.theme, t, X, Y, S, g.level.height);
    else {
      backdrop(c, w, h, progress, view.chapter, t);
      // Distant webs hang from the top of the stage, trees stand at its foot.
      const bw = w * 1.04,
        bh = (bw * 16) / 9;
      c.globalAlpha = 0.75;
      c.drawImage(img.bg_webs, (w - bw) / 2, Y(g.level.height + 6) - bh * 0.05, bw, bh);
      c.globalAlpha = 1;
      c.drawImage(img.bg_front, (w - bw) / 2, Y(-2.5) - bh, bw, bh);
    }
    const disc = (x, top, width, alpha = 1, shake = 0) =>
      th && th.ledge(c, x, top, width, alpha, shake, g.level.theme, t) ? null : stoneDisc(c, x, top, width, alpha, shake);

    const wheels = new Set();
    // Well buckets first, so stones resting in them are drawn over their dark insides:
    // the frame and rope once per rope, then the back of each bucket. The walls come
    // after the hero (th.front), so he stands inside the bucket.
    if (th && th.bucketBack) {
      const ropes = new Set();
      for (const p of g.platforms) {
        if (p.type !== "bucket" || p.alive === false) continue;
        if (!ropes.has(p.rope)) {
          ropes.add(p.rope);
          const pair = g.platforms.filter((q) => q.type === "bucket" && q.rope === p.rope);
          if (th.well && pair.length === 2) th.well(c, pair[0], pair[1], X, Y, S, t, g);
        }
        th.bucketBack(c, X(p.x), Y(p.y), p.w * S, S);
      }
    }
    for (const p of g.platforms) {
      const top = Y(p.y);
      if (p.type === "ground") {
        if (th) th.ground(c, X(p.x - p.w / 2), X(p.x + p.w / 2), top, h + 10, g.level.theme, t);
        else earth(c, X(p.x - p.w / 2), X(p.x + p.w / 2), top, h + 10);
        continue;
      }
      if (p.type === "post") {
        post(c, X(p.x), top, p.w * S, p.h * S);
        continue;
      }
      if (p.alive === false) continue;
      if (p.type === "slope") {
        if (th && th.slope) th.slope(c, p, X, Y, S, t);
        else {
          c.strokeStyle = "#888";
          c.lineWidth = 4;
          c.beginPath();
          c.moveTo(X(p.x1), Y(p.y1));
          c.lineTo(X(p.x2), Y(p.y2));
          c.stroke();
        }
        continue;
      }
      // The cracked cistern wall: a knock drop that floods a water when it breaks.
      if (p.type === "drop" && p.flood !== undefined && th && th.cistern) {
        th.cistern(c, X(p.x), top, p.w * S, (p.h || 0.4) * S, t);
        continue;
      }
      if (p.type === "drop" && p.knock && th && th.stack) {
        th.stack(c, X(p.x), top, p.w * S, p.h * S, t, g.level.theme);
        continue;
      }
      if (p.type === "bucket") {
        // A tale theme drew it before every other platform (see above).
        if (!(th && th.bucketBack)) disc(X(p.x), top, p.w * S, 1);
        continue;
      }
      if (p.type === "wheel") {
        // The wheel's frame is drawn once, under its first plank; planks are ledges.
        const key = p.cx + "," + p.cy;
        if (!wheels.has(key)) {
          wheels.add(key);
          const planks = g.platforms
            .filter((q) => q.type === "wheel" && q.cx === p.cx && q.cy === p.cy)
            .map((q) => ({ x: X(q.x), y: Y(q.y) }));
          if (th && th.wheel) th.wheel(c, X(p.cx), Y(p.cy), p.radius * S, planks, S, t);
          else {
            c.strokeStyle = "#555";
            c.lineWidth = 3;
            c.beginPath();
            c.arc(X(p.cx), Y(p.cy), p.radius * S, 0, TAU);
            c.stroke();
          }
        }
        disc(X(p.x), top, p.w * S, 1);
        continue;
      }
      if (p.type === "seesaw") {
        seesawStone(c, X(p.x), top, p.w * S, (p.tiltTime > 0 ? p.tilt : 0) * Math.min(1, (p.tiltTime || 0) * 3));
        continue;
      }
      if (p.type === "ghost") {
        // Warning: the thread trembles and the stone flickers in its last second.
        const warn = p.solidFor !== undefined && p.solidFor > 0 && p.solidFor < 1 ? 1 - p.solidFor : 0;
        thread(c, X(p.x), top, -10, 0.22 + warn * 0.4, warn, t);
        const a = solidNow(p, t);
        disc(X(p.x), top, p.w * S, warn ? a * (0.55 + 0.45 * Math.abs(Math.sin(t * 22))) : a, warn ? Math.sin(t * 50) * warn * 2 : 0);
        continue;
      }
      if (p.type === "mover") thread(c, X(p.x), top, -10, 0.5);
      // A tale theme may hang its own stones (the spring: a frayed rope, a tied stone).
      if (p.type === "drop" && th && th.hanging && th.hanging(c, p, X, Y, S, t, g)) continue;
      if (p.type === "drop") {
        const strain = p.timer && !p.falling && !p.landed ? p.timer / (p.delay || 0.6) : 0;
        if (!p.falling && !p.landed) thread(c, X(p.x), top, -10, 0.6, strain + 0.3, t);
        disc(X(p.x), top, p.w * S, 1, strain ? Math.sin(t * 60) * strain * 2.5 : 0);
        continue;
      }
      disc(X(p.x), top, p.w * S, solidNow(p, t));
      if (p.oil && th && th.oil) th.oil(c, X(p.x), top, p.w * S, t);
    }

    for (const o of g.objects) {
      if (th && th.object(c, o, X, Y, S, t, g)) continue;
      if (o.type === "web") {
        const caught = g.support === o;
        if (o.alive) silkWeb(c, X(o.x), Y(o.y), (o.r || 0.8) * S * 1.35, 0.95, caught ? 0.12 : 0);
      } else if (o.type === "trampoline") {
        const hit = o.cool ? o.cool / 0.25 : 0;
        tightWeb(c, X(o.x), Y(o.y), (o.r || 0.8) * S * 1.3, o.nx === undefined ? 0 : o.nx, o.ny === undefined ? 1 : -o.ny, t, hit);
      } else if (o.type === "zip") {
        const z = g.zip;
        const riding = z && Math.abs(z.x1 - Math.min(o.x1, o.x2)) < 0.01 + Math.abs(o.x1 - o.x2) ? z : null;
        zipLine(
          c,
          X(o.x1),
          Y(o.y1),
          X(o.x2),
          Y(o.y2),
          riding && g.hero.state === "zip" && z.x2 === (o.y1 >= o.y2 ? o.x2 : o.x1)
            ? { x: X(g.hero.x), y: Y(g.hero.y + 0.35), drop: S * 0.35 }
            : null,
        );
      } else if (o.type === "spider" && o.alive) {
        thread(c, X(o.x), Y(o.y) - S * 0.3, -10, 0.45);
        const size = S * 0.95;
        c.save();
        c.shadowColor = "rgba(160,180,255,0.6)";
        c.shadowBlur = size * 0.3;
        centred(c, img.spider_small, X(o.x), Y(o.y), size, size, Math.sin(t * 2) * 0.15);
        c.restore();
        glow(c, X(o.x), Y(o.y) + size * 0.12, size * 0.16, "rgba(255,50,50,0.8)");
      } else if (o.type === "cannon") {
        const cw = 1.7 * S,
          ch = (cw * img.cauldron.height) / img.cauldron.width;
        const by = Y(o.y - 1.05);
        glow(c, X(o.x), by - ch * 0.85, cw * 0.55, "rgba(140,255,60,0.35)");
        c.drawImage(img.cauldron, X(o.x) - cw / 2, by - ch, cw, ch);
        for (let i = 0; i < 3; i++) {
          const life = (t * 0.8 + i / 3) % 1;
          c.fillStyle = `rgba(170,255,90,${0.7 * (1 - life)})`;
          c.beginPath();
          c.arc(X(o.x) + Math.sin(i * 2.1 + t) * cw * 0.2, by - ch * (0.85 + life * 0.6), S * 0.07 * (1 - life * 0.5), 0, TAU);
          c.fill();
        }
      }
    }

    // Door: opens as Izan approaches; frames come from door_sprite_2.psd.
    const d = g.level.door;
    if (d && th && th.door(c, X(d.x), Y(d.y - 1) + S * 0.05, S, view, g, t)) {
      // drawn by the tale theme
    } else if (d) {
      const dh = 2.3 * S,
        dw = (dh * img.door_0.width) / img.door_0.height;
      const bottom = Y(d.y - 1) + S * 0.05;
      c.save();
      c.imageSmoothingEnabled = false;
      if (view.enterFrame !== undefined) {
        // Entering frames are cropped with a margin; the door's foot sits 171 px down.
        const k = dh / img.door_0.height;
        c.drawImage(
          img["enter_" + view.enterFrame],
          X(d.x) - (img.enter_0.width * k) / 2,
          bottom - 171 * k,
          img.enter_0.width * k,
          img.enter_0.height * k,
        );
      } else {
        if (!g.sealed) glow(c, X(d.x), bottom - dh * 0.45, dh * 0.7, "rgba(160,255,120,0.18)");
        c.drawImage(img["door_" + (view.doorFrame || 0)], X(d.x) - dw / 2, bottom - dh, dw, dh);
      }
      c.restore();
    }

    if (g.boss && g.boss.hp > 0)
      weaver(c, X(g.boss.x), Y(g.boss.y), S * 3.1, t, g.boss.cooldown > 0.35 ? 1 : 0);
    for (const b of g.bombs || []) {
      glow(c, X(b.x), Y(b.y), S * 0.6, "rgba(220,230,255,0.35)");
      c.save();
      c.fillStyle = "#e8edf6";
      c.strokeStyle = "#8d96a8";
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(X(b.x), Y(b.y), S * 0.3, 0, TAU);
      c.fill();
      c.beginPath();
      for (let i = -2; i <= 2; i++) {
        c.moveTo(X(b.x) - S * 0.3, Y(b.y) + i * S * 0.1);
        c.lineTo(X(b.x) + S * 0.3, Y(b.y) - i * S * 0.08);
      }
      c.stroke();
      c.restore();
    }

    for (const p of g.pumpkins) {
      if (!p.alive) continue;
      const mood = moodOf(p);
      const extra = {
        vx: p.vx,
        face: p.face,
        vy: -(p.vy || 0),
        spin: p.flung ? t * 6 : -(p.spin || 0),
        ring: mood === "notice" ? 0.55 : mood === "chase" && view.showRings ? 0.18 : 0,
        rangePx: p.range * S,
        ...frogPose(p),
      };
      if (th) th.hunter(c, g.level.hunter, X(p.x), Y(p.y), S * 1.05, t, mood, extra);
      else pumpkin(c, X(p.x), Y(p.y), S * 1.05, t, mood, false, extra);
    }

    if (view.aim && g.hero.state !== "flying") {
      const v = view.aim;
      for (let i = 1; i <= 22; i++) {
        const tt = i * 0.055;
        const px = g.hero.x + v.x * tt,
          py = g.hero.y + v.y * tt + (-14.715 * tt * tt) / 2;
        c.fillStyle = `rgba(240,248,255,${0.95 - i * 0.035})`;
        c.beginPath();
        c.arc(X(px), Y(py), Math.max(1.5, S * 0.09 * (1 - i / 30)), 0, TAU);
        c.fill();
      }
    }

    if (!view.hidden) {
      const hero = g.hero;
      if (g.dashTime > 0)
        for (let i = 3; i >= 1; i--)
          rabbit(c, X(hero.x - hero.vx * 0.025 * i), Y(hero.y - hero.vy * 0.025 * i), S * 1.08, {
            time: t,
            vx: hero.vx,
            vy: hero.vy,
            state: "flying",
            alpha: 0.18 * (4 - i),
            dash: true,
          });
      if (hero.state !== "cannon")
        rabbit(c, X(hero.x), Y(hero.y) + S * 0.04, S * 1.08, {
          time: t,
          vx: hero.state === "zip" ? 0 : hero.vx,
          vy: hero.state === "zip" ? 0 : hero.vy,
          state: hero.state === "zip" || hero.state === "slide" ? "flying" : hero.state,
          aim: view.aim ? Math.hypot(view.aim.x, view.aim.y) / 4 : 0,
          look: view.aim ? { x: view.aim.x / 16, y: -view.aim.y / 16 } : null,
          dash: g.dashTime > 0,
          landed: view.landed || 0,
          alpha: view.flash ? 0.35 + 0.65 * Math.abs(Math.sin(t * 25)) : 1,
        });
    }

    if (th && view.lamp && !view.hidden && g.hero.state !== "cannon") th.heroLamp(c, X(g.hero.x), Y(g.hero.y), S, t);
    // In front of the hero: bucket walls, the near side of the water.
    if (th && th.front) th.front(c, g, X, Y, S, t);
    if (view.fx) view.fx.draw(c, X, Y, S);
    if (view.focus) {
      // Teaching spotlight: everything dims except the object being explained.
      const f = view.focus;
      const fx = X(f.x),
        fy = Y(f.y),
        fr = (f.r || 1.6) * S;
      c.save();
      c.fillStyle = `rgba(4,5,8,${0.72 * f.alpha})`;
      c.beginPath();
      c.rect(0, 0, w, h);
      c.arc(fx, fy, fr, 0, TAU, true);
      c.fill();
      c.strokeStyle = `rgba(200,255,160,${0.8 * f.alpha})`;
      c.lineWidth = 2;
      c.setLineDash([8, 6]);
      c.beginPath();
      c.arc(fx, fy, fr + Math.sin(t * 4) * 3, 0, TAU);
      c.stroke();
      c.restore();
    }
    if (view.whiteFlash) {
      c.fillStyle = `rgba(255,255,255,${view.whiteFlash})`;
      c.fillRect(0, 0, w, h);
    }
    if (view.hand) {
      const k = (t * 0.6) % 1;
      const hx = X(g.hero.x) - k * S * 1.6,
        hy = Y(g.hero.y) + k * S * 1.4;
      c.globalAlpha = Math.sin(k * Math.PI);
      c.drawImage(img.hand, hx, hy, S * 0.6, (S * 0.6 * img.hand.height) / img.hand.width);
      c.globalAlpha = 1;
    }
  }

  /* ---------- Particle effects driven by engine events ---------- */
  class Effects {
    constructor() {
      this.items = [];
    }
    burst(x, y) {
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.5;
        this.items.push({
          kind: "piece",
          image: "pumpkin_piece_" + i,
          x,
          y,
          vx: Math.cos(a) * (3 + (i % 3)),
          vy: -Math.sin(a) * 4 + 4,
          spin: (i - 2.5) * 3,
          angle: 0,
          life: 1.4,
          max: 1.4,
        });
      }
      this.sparks(x, y, "rgba(150,255,90,", 14);
    }
    sparks(x, y, color, count = 10) {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * TAU;
        this.items.push({
          kind: "spark",
          color,
          x,
          y,
          vx: Math.cos(a) * (2 + (i % 4)),
          vy: Math.sin(a) * (2 + (i % 3)) + 1,
          life: 0.7,
          max: 0.7,
        });
      }
    }
    silk(x, y) {
      for (let i = 0; i < 8; i++)
        this.items.push({
          kind: "strand",
          x,
          y,
          vx: Math.cos(i) * 2,
          vy: Math.sin(i) * 2,
          angle: i,
          life: 0.9,
          max: 0.9,
        });
    }
    dust(x, y) {
      for (let i = 0; i < 6; i++)
        this.items.push({
          kind: "spark",
          color: "rgba(200,210,230,",
          x,
          y,
          vx: (i - 2.5) * 0.9,
          vy: 0.6 + (i % 2) * 0.4,
          life: 0.45,
          max: 0.45,
        });
    }
    // Water entry at (x, y): drops thrown up and out, a ring spreading on the surface.
    // strength: about 1 for a fall into a pool, 2 or more for a flood.
    splash(x, y, strength = 1) {
      const n = Math.round(6 + strength * 8);
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (0.15 + (0.7 * i) / Math.max(1, n - 1));
        const v = (2.5 + (i % 3)) * (0.6 + strength * 0.5);
        this.items.push({ kind: "drop", x, y, vx: Math.cos(a) * v * 0.8, vy: Math.sin(a) * v + 1.5, life: 0.75, max: 0.75 });
      }
      this.items.push({ kind: "ring", x, y, vx: 0, vy: 0, size: 0.5 + strength * 0.4, life: 0.7, max: 0.7 });
    }
    update(dt) {
      for (const p of this.items) {
        p.life -= dt;
        p.vy -= (p.kind === "piece" ? 14 : p.kind === "drop" ? 12 : p.kind === "ring" ? 0 : 4) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.spin) p.angle += p.spin * dt;
      }
      this.items = this.items.filter((p) => p.life > 0);
    }
    draw(c, X, Y, S) {
      for (const p of this.items) {
        const a = Math.max(0, p.life / p.max);
        c.save();
        c.globalAlpha = a;
        if (p.kind === "piece") {
          const image = img[p.image];
          const pw = S * 0.38,
            ph = (pw * image.height) / image.width;
          centred(c, image, X(p.x), Y(p.y), pw, ph, p.angle);
        } else if (p.kind === "ring") {
          const rx = S * p.size * (0.4 + (1 - a) * 1.2);
          c.strokeStyle = `rgba(215,235,255,${a})`;
          c.lineWidth = 1.5;
          c.beginPath();
          c.ellipse(X(p.x), Y(p.y), rx, rx * 0.22, 0, 0, TAU);
          c.stroke();
        } else if (p.kind === "drop") {
          c.fillStyle = `rgba(200,225,250,${a})`;
          c.beginPath();
          c.ellipse(X(p.x), Y(p.y), S * 0.045, S * 0.065, 0, 0, TAU);
          c.fill();
        } else if (p.kind === "strand") {
          c.strokeStyle = "rgba(235,242,255,0.9)";
          c.lineWidth = 1.2;
          c.beginPath();
          c.moveTo(X(p.x), Y(p.y));
          c.lineTo(X(p.x) + Math.cos(p.angle) * S * 0.5, Y(p.y) + Math.sin(p.angle) * S * 0.5);
          c.stroke();
        } else {
          c.fillStyle = p.color + a + ")";
          c.beginPath();
          c.arc(X(p.x), Y(p.y), S * 0.06, 0, TAU);
          c.fill();
        }
        c.restore();
      }
    }
  }

  /* ---------- Story illustrations ---------- */
  function fog(c, w, h, t, alpha = 0.16) {
    c.save();
    for (let i = 0; i < 4; i++) {
      const y = h * (0.52 + i * 0.07) + Math.sin(t * 0.3 + i) * 6;
      const g = c.createLinearGradient(0, y - 30, 0, y + 30);
      g.addColorStop(0, "rgba(180,190,210,0)");
      g.addColorStop(0.5, `rgba(180,190,210,${alpha})`);
      g.addColorStop(1, "rgba(180,190,210,0)");
      c.fillStyle = g;
      const x = ((t * (8 + i * 4)) % (w * 2)) - w;
      c.fillRect(x - w, y - 30, w * 3, 60);
    }
    c.restore();
  }
  function fireflies(c, w, h, t, count = 14) {
    for (let i = 0; i < count; i++) {
      const x = w * ((i * 0.173 + Math.sin(t * 0.21 + i) * 0.03 + 0.05) % 1);
      const y = h * (0.15 + ((i * 0.29 + t * 0.012 * (1 + (i % 3))) % 0.5)) + Math.sin(t * 1.3 + i * 2) * 6;
      const a = 0.35 + 0.35 * Math.sin(t * 2.1 + i * 1.7);
      glow(c, x, y, 7, `rgba(190,255,140,${Math.max(0, a)})`);
    }
  }
  // view: {speaker, lineAge, flash, zoom}
  function scene(c, name, w, h, t, view = {}) {
    // Story art is framed closer than gameplay and kept above the dialogue box.
    const S = w / 9;
    const groundY = h * 0.68;
    const talk = (who) => (view.speaker === who ? 1 + Math.max(0, 0.08 - (view.lineAge || 9) * 0.1) + Math.sin(t * 14) * 0.02 * Math.max(0, 1 - (view.lineAge || 9)) : 1);
    c.save();
    // Slow camera drift and breathing zoom; a short push-in on each new line.
    const push = Math.max(0, 0.06 - (view.lineAge === undefined ? 9 : view.lineAge) * 0.08);
    const zoom = 1.04 + Math.sin(t * 0.18) * 0.02 + push + (view.zoom || 0);
    c.translate(w / 2 + Math.sin(t * 0.13) * w * 0.012, h * 0.6);
    c.scale(zoom, zoom);
    c.translate(-w / 2, -h * 0.6);
    const chapter = ["house", "weaver", "window", "fall"].includes(name)
      ? 2
      : ["web", "nest", "crypt"].includes(name)
        ? 1
        : 0;
    backdrop(c, w, h, name === "green" ? 0.3 : 0.6, chapter, t);
    const bw = w * 1.04,
      bh = (bw * 16) / 9;
    if (["web", "weaver", "plot", "fall"].includes(name)) {
      c.globalAlpha = 0.85;
      c.drawImage(img.bg_webs, (w - bw) / 2, -bh * 0.08, bw, bh);
      c.globalAlpha = 1;
    }
    c.drawImage(img.bg_front, (w - bw) / 2, groundY + S * 2.2 - bh, bw, bh);
    earth(c, 0, w, groundY, h);
    const izan = (x, y, size, extra = {}) =>
      rabbit(c, x, y, size, { time: t, state: "resting", ...extra });
    const sway = Math.sin(t * 1.4);
    if (name === "graveyard") {
      for (let i = 0; i < 5; i++)
        pumpkin(c, w * (0.12 + i * 0.19), groundY - S * 0.45, S * 0.9, t + i, "sleep");
      izan(w * 0.5, groundY - S * 0.62, S * 1.2, { look: { x: 0.4, y: -0.2 } });
    } else if (name === "plot") {
      weaver(c, w * 0.58, h * 0.32 + sway * 6, S * 3.4 * talk("weaver"), t * (view.speaker === "weaver" ? 2.5 : 1));
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI;
        pumpkin(c, w * 0.58 + Math.cos(a) * S * 2.6, groundY - S * 0.5 - Math.sin(a) * S * 0.7, S * 1.05 * talk("pumpkin"), t + i, view.speaker === "pumpkin" ? "chase" : "hunt");
      }
      post(c, w * 0.13, groundY - S * 1.5, S * 0.9, S * 1.5);
      izan(w * 0.13 + S * 0.15, groundY - S * 1.9, S * 0.9, { look: { x: 1, y: 0 } });
    } else if (name === "spotted") {
      for (let i = 0; i < 5; i++)
        pumpkin(c, w * (0.45 + i * 0.11), groundY - S * (0.6 + (i % 2) * 0.8), S * 1.05 * talk("pumpkin"), t + i, view.speaker === "pumpkin" ? "notice" : "chase");
      izan(w * 0.16, groundY - S * 0.62, S * 1.25, { look: { x: 1, y: -0.3 }, blink: 0 });
      c.fillStyle = "#9aa0a8";
      c.beginPath();
      c.arc(w * 0.27 + Math.sin(t * 3) * 2, groundY - S * 0.12, S * 0.12, 0, TAU);
      c.fill();
    } else if (name === "chase") {
      const k = (t * 0.45) % 1;
      const hx = w * (0.15 + k * 0.7),
        hy = groundY - S * 0.6 - Math.sin(k * Math.PI) * S * 4;
      izan(hx, hy, S * 1.15, { state: "flying", vx: 7, vy: Math.cos(k * Math.PI) * 9 });
      for (let i = 0; i < 4; i++)
        pumpkin(c, hx - S * (2.2 + i * 1.6), groundY - S * (1.2 + Math.sin(t * 2 + i) * 0.6 + (i % 2)), S * 1, t + i, "chase");
    } else if (name === "owl") {
      owl(c, w * 0.5, groundY - S * 0.4, S * 6.5, "open", t);
      izan(w * 0.82, groundY - S * 0.62, S * 1.1, { look: { x: -1, y: -0.6 } });
    } else if (name === "web") {
      for (const [x, y] of [
        [0.25, 0.42],
        [0.7, 0.6],
      ]) {
        const sx = w * x + sway * S * 0.8 * (x < 0.5 ? 1 : -1);
        thread(c, sx, h * y, -10, 0.55);
        stoneDisc(c, sx, h * y, S * 2.6);
      }
      silkWeb(c, w * 0.5, h * 0.25, S * 1.2, 0.9);
      izan(w * 0.25 + sway * S * 0.8, h * 0.42 - S * 0.5, S * 1.05);
      pumpkin(c, w * 0.75, h * 0.3, S, t, "hunt");
    } else if (name === "nest") {
      const nx = w * 0.5;
      post(c, nx - S * 0.65, groundY - S * 1.2, S * 0.5, S * 1.2);
      post(c, nx + S * 0.65, groundY - S * 1.2, S * 0.5, S * 1.2);
      pumpkin(c, nx, groundY - S * 0.55, S * 1.0, t, "sleep");
      thread(c, nx, h * 0.38, -10, 0.6, 0.6, t);
      stoneDisc(c, nx, h * 0.38, S * 2.4, 1, Math.sin(t * 50) * 1.2);
      izan(nx, h * 0.38 - S * 0.5, S * 1.05, { look: { x: 0, y: 1 } });
    } else if (name === "crypt") {
      c.save();
      c.imageSmoothingEnabled = false;
      const dh = S * 5,
        dw = (dh * img.door_0.width) / img.door_0.height;
      c.drawImage(img.door_0, w * 0.5 - dw / 2, groundY - dh + S * 0.1, dw, dh);
      c.restore();
      for (let i = 0; i < 4; i++)
        pumpkin(c, w * (0.2 + i * 0.2), groundY - S * (0.6 + (i % 2) * 0.5), S * 1.05, t + i, "chase");
    } else if (name === "house") {
      c.fillStyle = "#08080a";
      c.beginPath();
      c.ellipse(w * 0.55, groundY + S * 0.6, w * 0.6, S * 3, 0, Math.PI, TAU);
      c.fill();
      house(c, w * 0.55, groundY - S * 2.1, w * 0.55, t, 0.25);
      izan(w * 0.18, groundY - S * 0.62, S * 1.05, { look: { x: 1, y: -0.5 } });
    } else if (name === "weaver") {
      weaver(c, w * 0.5, h * 0.36 + sway * 8, S * 5.2 * talk("weaver"), t * (view.speaker === "weaver" ? 2.5 : 1));
      izan(w * 0.5, groundY - S * 0.62, S * 1.2, { look: { x: 0, y: -1 }, blink: 0 });
    } else if (name === "fall" || name === "window") {
      c.fillStyle = "#08080a";
      c.beginPath();
      c.ellipse(w * 0.55, groundY + S * 0.6, w * 0.6, S * 3, 0, Math.PI, TAU);
      c.fill();
      const lit = name === "fall" ? Math.min(1, t * 0.25) : 1;
      house(c, w * 0.55, groundY - S * 2.1, w * 0.55, t, name === "window" ? 1 : lit, name === "window");
      for (let i = 0; i < 4; i++)
        pumpkin(c, w * (0.1 + i * 0.11), groundY - S * 0.45, S * 0.85, t + i, "sleep", name === "window" || lit > i * 0.25);
      if (name === "fall") {
        for (let i = 0; i < 4; i++) {
          const k = (t * 0.5 + i * 0.25) % 1;
          stoneDisc(c, w * (0.15 + i * 0.22), h * (0.1 + k * 0.6), S * 1.4, 1 - k);
        }
      } else {
        const frame = Math.min(11, Math.floor(Math.max(0, t - 1.2) * 6));
        const k = (S * 2.2) / img.door_0.height;
        c.save();
        c.imageSmoothingEnabled = false;
        c.drawImage(
          img["enter_" + frame],
          w * 0.62 - (img.enter_0.width * k) / 2,
          groundY - S * 2.1 - 171 * k,
          img.enter_0.width * k,
          img.enter_0.height * k,
        );
        c.restore();
      }
    } else if (name === "green") {
      c.fillStyle = "rgba(0,0,0,0.45)";
      c.fillRect(-w, -h, w * 3, h * 3);
      pumpkin(c, w * 0.7, groundY - S * 0.4, S * 0.8, t, "hunt");
    } else if (name === "seesaw") {
      post(c, w * 0.5, groundY - S * 2.2, S * 0.6, S * 2.2);
      const tilt = Math.sin(t * 1.1) > 0.6 ? -1 : 0;
      seesawStone(c, w * 0.5, groundY - S * 2.2, S * 4.4, tilt);
      pumpkin(c, w * 0.5 + S * 1.5, groundY - S * (2.7 + (tilt ? 2.5 : 0)), S, t, "sleep");
      const k = (t * 1.1) % TAU;
      izan(w * 0.5 - S * 1.5, groundY - S * 2.7 - Math.max(0, Math.sin(k)) * S * 4, S * 1.05, { state: "flying", vx: 0, vy: Math.cos(k) * 6 });
    } else if (name === "zip") {
      zipLine(c, w * 0.08, h * 0.22, w * 0.92, h * 0.5, null);
      const k = (t * 0.35) % 1;
      const x = w * (0.08 + k * 0.84),
        y = h * (0.22 + k * 0.28);
      c.strokeStyle = "rgba(240,246,255,0.9)";
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x, y + S * 0.4);
      c.stroke();
      izan(x, y + S * 0.95, S * 1.05, { state: "flying", vx: 5, vy: 0 });
      pumpkin(c, w * 0.6, h * 0.39 + S * 0.5, S * 0.95, t, "sleep");
    }
    c.restore();
    if (name === "spotted") talk("pumpkin");
    fog(c, w, h, t, name === "green" ? 0.08 : 0.16);
    if (!["window", "green"].includes(name)) fireflies(c, w, h, t, name === "fall" ? 24 : 12);
    if (view.flash) {
      c.fillStyle = `rgba(235,240,255,${view.flash})`;
      c.fillRect(0, 0, w, h);
    }
  }

  root.HNOriginalArt = {
    load,
    drawStage,
    rabbit,
    mqidec,
    mqidecSim,
    owl,
    weaver,
    pumpkin,
    scene,
    Effects,
    img,
    moodOf,
    mark,
    tifinagh,
    tifinaghSupported,
    // Shared helpers for tales-art.js.
    glow,
    centred,
    stoneDisc,
    thread,
    post,
    silkWeb,
    oilLamp,
    blinkAt,
    bandTriangles,
    bandLozenges,
    bandZigzag,
  };
})(globalThis);
