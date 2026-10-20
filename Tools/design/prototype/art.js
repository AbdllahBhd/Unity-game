(function (root) {
  "use strict";
  const palettes = {
    light: {
      sky: "#111827",
      low: "#313344",
      fog: "#667064",
      ink: "#171b24",
      face: "#e2d8b9",
      accent: "#f5b958",
      dim: "#967447",
      ground: "#44483d",
      edge: "#a3ab7e",
      ghost: "#b8d8bb",
    },
    shadow: {
      sky: "#16191c",
      low: "#454b49",
      fog: "#aab3a5",
      ink: "#121616",
      face: "#f1e8d2",
      accent: "#d56350",
      dim: "#804436",
      ground: "#343b38",
      edge: "#ddd4b8",
      ghost: "#bbcbcb",
    },
    bell: {
      sky: "#0c252e",
      low: "#274149",
      fog: "#67787b",
      ink: "#181c27",
      face: "#e6d7b1",
      accent: "#e0b763",
      dim: "#a95151",
      ground: "#713e48",
      edge: "#e2bd73",
      ghost: "#a5d6d1",
    },
  };
  function oval(c, x, y, rx, ry, fill, angle) {
    c.beginPath();
    c.ellipse(
      x,
      y,
      Math.max(0.01, rx),
      Math.max(0.01, ry),
      angle || 0,
      0,
      Math.PI * 2,
    );
    c.fillStyle = fill;
    c.fill();
  }
  function line(c, points, color, width) {
    c.beginPath();
    points.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.strokeStyle = color;
    c.lineWidth = width || 1;
    c.stroke();
  }
  function polygon(c, points, fill) {
    c.beginPath();
    points.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  }
  function glow(c, x, y, r, color) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    oval(c, x, y, r, r, g);
  }
  function themeKey(theme) {
    return palettes[theme] ? theme : "light";
  }
  function rabbit(c, x, y, size, p, time, state, vx) {
    c.save();
    c.translate(x, y);
    const airborne =
      state === "flying" || state === "Flying" || state === "dash";
    const tilt = airborne
      ? Math.max(-0.5, Math.min(0.5, (vx || 0) * 0.026))
      : 0;
    c.rotate(tilt);
    const s = size;
    const breathing = 1 + Math.sin(time * 2) * 0.025;
    c.scale(1, breathing);
    oval(c, 0, s * 0.62, s * 0.54, s * 0.14, "#00000055");
    oval(c, -s * 0.27, -s * 0.65, s * 0.15, s * 0.62, p.ink, -0.15);
    oval(c, s * 0.23, -s * 0.72, s * 0.14, s * 0.67, p.ink, 0.14);
    line(
      c,
      [
        [-s * 0.3, -s * 0.96],
        [-s * 0.25, -s * 0.46],
      ],
      p.dim,
      s * 0.045,
    );
    line(
      c,
      [
        [s * 0.25, -s * 1.12],
        [s * 0.2, -s * 0.5],
      ],
      p.dim,
      s * 0.04,
    );
    oval(c, 0, s * 0.16, s * 0.47, s * 0.54, p.ink);
    oval(c, 0, -s * 0.28, s * 0.47, s * 0.38, p.ink);
    oval(c, -s * 0.3, s * 0.6, s * 0.23, s * 0.12, p.ink);
    oval(c, s * 0.31, s * 0.6, s * 0.23, s * 0.12, p.ink);
    if (p === palettes.light) {
      polygon(
        c,
        [
          [-s * 0.36, s * 0.02],
          [s * 0.3, s * 0.02],
          [s * 0.55, s * 0.55],
          [-s * 0.42, s * 0.48],
        ],
        "#303b42",
      );
      line(
        c,
        [
          [-s * 0.25, s * 0.09],
          [s * 0.3, s * 0.09],
        ],
        p.accent,
        s * 0.06,
      );
    }
    if (p === palettes.bell) {
      polygon(
        c,
        [
          [-s * 0.27, s * 0.04],
          [s * 0.35, s * 0.04],
          [s * 0.66, s * 0.35],
          [s * 0.2, s * 0.24],
        ],
        p.dim,
      );
      line(
        c,
        [
          [s * 0.33, s * 0.08],
          [s * 0.54, s * 0.28],
        ],
        p.edge,
        s * 0.03,
      );
    }
    const blink = Math.sin(time * 1.71) > 0.994;
    if (blink) {
      line(
        c,
        [
          [-s * 0.28, -s * 0.31],
          [-s * 0.1, -s * 0.31],
        ],
        p.face,
        s * 0.04,
      );
      line(
        c,
        [
          [s * 0.1, -s * 0.31],
          [s * 0.28, -s * 0.31],
        ],
        p.face,
        s * 0.04,
      );
    } else {
      oval(c, -s * 0.18, -s * 0.32, s * 0.09, s * 0.115, p.face);
      oval(c, s * 0.18, -s * 0.32, s * 0.09, s * 0.115, p.face);
      oval(c, -s * 0.155, -s * 0.32, s * 0.03, s * 0.075, p.ink);
      oval(c, s * 0.2, -s * 0.32, s * 0.03, s * 0.075, p.ink);
    }
    polygon(
      c,
      [
        [-s * 0.04, -s * 0.14],
        [s * 0.04, -s * 0.14],
        [0, -s * 0.08],
      ],
      p.face,
    );
    c.restore();
  }
  function pumpkin(c, x, y, s, p, time, phase) {
    c.save();
    c.translate(x, y);
    const bob = Math.sin(time * 3 + x * 0.04) * s * 0.025;
    c.translate(0, bob);
    glow(c, 0, 0, s * 1.9, p.accent + "25");
    if (p === palettes.shadow) {
      polygon(
        c,
        [
          [-s * 0.85, -s * 0.6],
          [0, -s * 0.85],
          [s * 0.85, -s * 0.6],
          [s * 0.72, s * 0.6],
          [0, s * 0.82],
          [-s * 0.72, s * 0.6],
        ],
        "#292a27",
      );
      line(
        c,
        [
          [-s * 0.82, -s * 0.61],
          [0, -s * 0.83],
          [s * 0.82, -s * 0.61],
        ],
        p.face,
        s * 0.045,
      );
    } else {
      oval(c, 0, 0, s, s * 0.8, p === palettes.bell ? "#904b43" : "#b86731");
      for (let i = -1; i <= 1; i++) {
        c.beginPath();
        c.ellipse(
          i * s * 0.32,
          0,
          s * 0.33,
          s * 0.79,
          0,
          -Math.PI / 2,
          Math.PI / 2,
        );
        c.strokeStyle = p === palettes.bell ? "#613238" : "#824521";
        c.lineWidth = s * 0.05;
        c.stroke();
      }
    }
    line(
      c,
      [
        [0, -s * 0.69],
        [s * 0.06, -s * 0.95],
        [s * 0.25, -s * 1.08],
      ],
      p.edge,
      s * 0.11,
    );
    polygon(
      c,
      [
        [-s * 0.62, -s * 0.19],
        [-s * 0.2, -s * 0.35],
        [-s * 0.32, s * 0.08],
      ],
      p.accent,
    );
    polygon(
      c,
      [
        [s * 0.62, -s * 0.19],
        [s * 0.2, -s * 0.35],
        [s * 0.32, s * 0.08],
      ],
      p.accent,
    );
    polygon(
      c,
      [
        [-s * 0.49, s * 0.3],
        [-s * 0.21, s * 0.19],
        [0, s * 0.34],
        [s * 0.2, s * 0.19],
        [s * 0.49, s * 0.3],
        [s * 0.24, s * 0.48],
        [-s * 0.22, s * 0.48],
      ],
      phase ? "#d9e9d9" : p.accent,
    );
    c.restore();
  }
  function platform(c, x, y, w, h, p, type, time) {
    c.save();
    c.fillStyle = p.ground;
    c.fillRect(x - w / 2, y, w, h);
    c.fillStyle = p.edge;
    c.fillRect(x - w / 2 - 1, y - 1, w + 2, Math.max(3, h * 0.13));
    if (p === palettes.light) {
      for (let i = 0; i < w; i += 17)
        line(
          c,
          [
            [x - w / 2 + i, y + h * 0.25],
            [x - w / 2 + i + 8, y + h],
          ],
          p.ink,
          2,
        );
      for (let i = 7; i < w; i += 31)
        line(
          c,
          [
            [x - w / 2 + i, y + h],
            [x - w / 2 + i - 8, y + h + 13],
            [x - w / 2 + i - 2, y + h + 19],
          ],
          p.dim,
          2,
        );
    }
    if (p === palettes.shadow) {
      for (let i = 3; i < w; i += 9)
        line(
          c,
          [
            [x - w / 2 + i, y + 5],
            [x - w / 2 + i - 5, y + h],
          ],
          p.ink,
          1,
        );
    }
    if (p === palettes.bell) {
      for (let i = 0; i < w; i += 22)
        polygon(
          c,
          [
            [x - w / 2 + i, y + 5],
            [x - w / 2 + i + 11, y + 5],
            [x - w / 2 + i + 4, y + h],
            [x - w / 2 + i - 7, y + h],
          ],
          "#a95b5d",
        );
      c.fillStyle = p.edge;
      for (let i = 10; i < w; i += 28)
        oval(c, x - w / 2 + i, y + h * 0.63, 2, 2, p.edge);
    }
    if (type === "mover") {
      line(
        c,
        [
          [x - w / 2 + 8, y],
          [x - w / 2 + 8, y - 55],
        ],
        p.dim,
        2,
      );
      line(
        c,
        [
          [x + w / 2 - 8, y],
          [x + w / 2 - 8, y - 55],
        ],
        p.dim,
        2,
      );
    }
    c.restore();
  }
  function door(c, x, y, s, p, open) {
    c.save();
    c.translate(x, y);
    glow(c, 0, -s * 0.9, s * 1.5, open ? p.accent + "35" : "#00000000");
    c.fillStyle = p.dim;
    c.fillRect(-s * 0.62, -s * 1.9, s * 1.24, s * 1.9);
    oval(c, 0, -s * 1.9, s * 0.62, s * 0.36, p.dim);
    c.fillStyle = open ? "#050d13" : p.ink;
    c.fillRect(-s * 0.48, -s * 1.87, s * 0.96, s * 1.85);
    if (p === palettes.bell) {
      for (let i = -2; i <= 2; i++)
        line(
          c,
          [
            [i * s * 0.19, -s * 1.7],
            [i * s * 0.19, -s * 0.15],
          ],
          p.edge,
          s * 0.04,
        );
      oval(c, 0, -s * 1.93, s * 0.15, s * 0.15, p.accent);
    } else if (p === palettes.shadow) {
      line(
        c,
        [
          [0, -s * 1.85],
          [-s * 0.1, -s * 1.1],
          [s * 0.1, -s * 0.6],
          [0, 0],
        ],
        p.face,
        s * 0.035,
      );
    } else {
      line(
        c,
        [
          [-s * 0.49, -s * 1.85],
          [-s * 0.28, -s * 1.4],
          [-s * 0.52, -s * 0.7],
        ],
        p.edge,
        s * 0.06,
      );
      line(
        c,
        [
          [s * 0.49, -s * 1.7],
          [s * 0.25, -s * 1.3],
          [s * 0.5, -s * 0.3],
        ],
        p.edge,
        s * 0.06,
      );
    }
    oval(c, s * 0.29, -s * 0.88, s * 0.05, s * 0.05, p.accent);
    if (!open) {
      line(
        c,
        [
          [-s * 0.56, -s * 1.18],
          [s * 0.56, -s * 0.72],
        ],
        p.edge,
        s * 0.06,
      );
      line(
        c,
        [
          [-s * 0.56, -s * 0.72],
          [s * 0.56, -s * 1.18],
        ],
        p.edge,
        s * 0.06,
      );
      oval(c, 0, -s * 0.95, s * 0.13, s * 0.17, p.accent);
    }
    c.restore();
  }
  function boss(c, x, y, s, p, time) {
    c.save();
    c.translate(x, y);
    c.rotate(Math.sin(time) * 0.025);
    glow(c, 0, -s * 0.3, s * 2, p.accent + "12");
    polygon(
      c,
      [
        [0, -s * 0.7],
        [-s * 0.8, s * 0.8],
        [0, s * 0.55],
        [s * 0.8, s * 0.8],
      ],
      p.ink,
    );
    oval(c, 0, -s * 0.7, s * 0.26, s * 0.32, p.face);
    polygon(
      c,
      [
        [-s * 0.67, -s * 0.91],
        [s * 0.63, -s * 0.91],
        [s * 0.19, -s * 1.8],
        [0, -s * 1.1],
      ],
      p.ink,
    );
    line(
      c,
      [
        [-s * 0.12, -s * 0.76],
        [-s * 0.04, -s * 0.73],
      ],
      p.ink,
      s * 0.03,
    );
    line(
      c,
      [
        [s * 0.07, -s * 0.73],
        [s * 0.16, -s * 0.76],
      ],
      p.ink,
      s * 0.03,
    );
    if (p === palettes.light)
      for (let i = -2; i <= 2; i++) {
        line(
          c,
          [
            [i * s * 0.14, -s * 1.14],
            [i * s * 0.14, -s * 1.46],
          ],
          p.edge,
          s * 0.06,
        );
        oval(c, i * s * 0.14, -s * 1.5, s * 0.04, s * 0.07, p.accent);
      }
    if (p === palettes.bell) {
      line(
        c,
        [
          [-s * 0.62, s * 0.63],
          [0, s * 0.23],
          [s * 0.62, s * 0.63],
        ],
        p.edge,
        s * 0.04,
      );
      oval(c, 0, -s * 0.1, s * 0.05, s * 0.05, p.edge);
    }
    c.restore();
  }
  function backdrop(c, v, p, time) {
    const w = v.width,
      h = v.height,
      shift = v.cameraY * v.scale;
    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, p.sky);
    bg.addColorStop(1, p.low);
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    const moonX = w * 0.73,
      moonY = h * 0.18 + shift * 0.025;
    glow(c, moonX, moonY, w * 0.3, p.fog + "12");
    oval(
      c,
      moonX,
      moonY,
      w * 0.095,
      w * 0.095,
      p === palettes.shadow ? p.face : "#b2b9a030",
    );
    if (p !== palettes.shadow)
      oval(c, moonX - w * 0.025, moonY - w * 0.02, w * 0.08, w * 0.08, p.sky);
    c.save();
    c.globalAlpha = 0.32;
    for (let i = 0; i < 10; i++) {
      const x = (i * 117) % w,
        base = h + 45 + ((shift * 0.1) % 65),
        top = base - h * (0.3 + (i % 4) * 0.12);
      if (p === palettes.bell) {
        polygon(
          c,
          [
            [x - 70, base],
            [x - 50, top + 85],
            [x, top],
            [x + 50, top + 85],
            [x + 70, base],
          ],
          p.ink,
        );
        line(
          c,
          [
            [x, top],
            [x, top - 26],
          ],
          p.edge,
          2,
        );
      } else {
        line(
          c,
          [
            [x, base],
            [x + 10, top + 90],
            [x - 10, top],
          ],
          p.ink,
          14,
        );
        line(
          c,
          [
            [x + 5, top + 125],
            [x - 35, top + 80],
            [x - 55, top + 20],
          ],
          p.ink,
          5,
        );
        line(
          c,
          [
            [x, top + 95],
            [x + 43, top + 35],
            [x + 50, top - 15],
          ],
          p.ink,
          4,
        );
      }
    }
    c.restore();
    if (p === palettes.bell) {
      for (let side = 0; side < 2; side++) {
        const x = side ? w : 0;
        polygon(
          c,
          [
            [x, 0],
            [x + (side ? -1 : 1) * w * 0.12, 0],
            [x + (side ? -1 : 1) * w * 0.07, h * 0.3],
            [x, h * 0.42],
          ],
          "#572737",
        );
        for (let i = 1; i < 4; i++)
          line(
            c,
            [
              [x + (side ? -1 : 1) * i * w * 0.025, 0],
              [x + (side ? -1 : 1) * i * w * 0.014, h * 0.3],
            ],
            "#8b454850",
            2,
          );
      }
    } else {
      c.save();
      c.globalAlpha = 0.2;
      for (let i = 0; i < 11; i++) {
        const x = (i * w) / 10 + Math.sin(i) * 15,
          y = h * 0.9 + shift * 0.06 - (i % 3) * 17;
        c.fillStyle = p.ink;
        c.fillRect(x - 12, y - 37, 24, 47);
        oval(c, x, y - 37, 12, 8, p.ink);
        line(
          c,
          [
            [x - 7, y - 26],
            [x + 7, y - 26],
          ],
          p.face,
          1,
        );
      }
      c.restore();
    }
    for (let i = 0; i < 18; i++) {
      const x = (i * 67.7 + w + Math.sin(time * 0.2 + i) * 8) % w,
        y = (i * 103.1 + h + Math.sin(time * 0.15 + i) * 9) % h;
      oval(c, x, y, 1, 1, p.accent + "50");
    }
  }
  function object(c, o, X, Y, S, p, t) {
    const x = X(o.x || 0),
      y = Y(o.y || 0),
      s = S * 0.4,
      type = (o.type || o.kind || "").toLowerCase();
    if (type === "door") return door(c, x, y, S * 0.62, p, !!o.open);
    if (type === "hunter" || type === "pumpkin") {
      if (o.alive !== false) pumpkin(c, x, y, S * 0.48, p, t, o.phase);
      return;
    }
    if (type === "boss") return boss(c, x, y, S * 0.9, p, t);
    if (type === "spikes") {
      const w = (o.w || o.width || 2) * S;
      for (let i = 0; i < w; i += S * 0.34)
        polygon(
          c,
          [
            [x - w / 2 + i, y],
            [x - w / 2 + i + S * 0.17, y - S * 0.48],
            [x - w / 2 + i + S * 0.34, y],
          ],
          "#c8c9b4",
        );
      return;
    }
    if (type === "mushroom") {
      c.fillStyle = p.face;
      c.fillRect(x - s * 0.24, y - s * 0.5, s * 0.48, s * 0.55);
      oval(c, x, y - s * 0.6, s * 1.1, s * 0.48, p.dim);
      line(
        c,
        [
          [x - s, y - s * 0.55],
          [x + s, y - s * 0.55],
        ],
        p.accent,
        3,
      );
      return;
    }
    if (type === "crate") {
      const z = (o.w || 1) * S;
      c.fillStyle = p.dim;
      c.fillRect(x - z / 2, y - z / 2, z, z);
      c.strokeStyle = p.edge;
      c.lineWidth = 2;
      c.strokeRect(x - z / 2 + 3, y - z / 2 + 3, z - 6, z - 6);
      line(
        c,
        [
          [x - z * 0.4, y - z * 0.4],
          [x + z * 0.4, y + z * 0.4],
        ],
        p.edge,
        3,
      );
      line(
        c,
        [
          [x - z * 0.4, y + z * 0.4],
          [x + z * 0.4, y - z * 0.4],
        ],
        p.edge,
        3,
      );
      return;
    }
    if (type === "portal") {
      glow(c, x, y, S, p.ghost + "20");
      c.beginPath();
      c.ellipse(x, y, S * 0.4, S * 0.8, 0, 0, Math.PI * 2);
      c.strokeStyle = p.ghost;
      c.lineWidth = 4;
      c.stroke();
      for (let i = 0; i < 5; i++)
        oval(
          c,
          x + Math.sin(i + t) * S * 0.33,
          y + Math.cos(i + t) * S * 0.65,
          2,
          2,
          p.face,
        );
      return;
    }
    if (type === "wind") {
      const ax =
          o.ax === undefined
            ? o.forceX === undefined
              ? o.force || 3
              : o.forceX
            : o.ax,
        ay = o.ay === undefined ? o.forceY || 0 : o.ay,
        magnitude = Math.hypot(ax, ay);
      if (magnitude === 0) return;
      const dx = ax / magnitude,
        dy = -ay / magnitude,
        px = -dy,
        py = dx;
      for (let i = 0; i < 3; i++) {
        const xx =
            x + px * (i - 1) * S * 0.3 + dx * Math.sin(t * 2 + i) * S * 0.2,
          yy = y + py * (i - 1) * S * 0.3 + dy * Math.sin(t * 2 + i) * S * 0.2;
        line(
          c,
          [
            [xx - dx * S * 0.6, yy - dy * S * 0.6],
            [xx + dx * S * 0.6, yy + dy * S * 0.6],
          ],
          p.ghost + "99",
          2,
        );
        line(
          c,
          [
            [
              xx + dx * S * 0.4 + px * S * 0.1,
              yy + dy * S * 0.4 + py * S * 0.1,
            ],
            [xx + dx * S * 0.6, yy + dy * S * 0.6],
            [
              xx + dx * S * 0.4 - px * S * 0.1,
              yy + dy * S * 0.4 - py * S * 0.1,
            ],
          ],
          p.ghost,
          2,
        );
      }
      return;
    }
    if (type === "bat") {
      const wing = Math.sin(t * 8) * s * 0.4;
      polygon(
        c,
        [
          [x, y],
          [x - s * 1.3, y - s * 0.55 - wing],
          [x - s * 0.8, y + s * 0.2],
          [x, y + s * 0.3],
          [x + s * 0.8, y + s * 0.2],
          [x + s * 1.3, y - s * 0.55 - wing],
        ],
        p.ink,
      );
      oval(c, x, y, s * 0.25, s * 0.3, p.ink);
      oval(c, x - s * 0.1, y - s * 0.07, 1.8, 1.8, p.accent);
      oval(c, x + s * 0.1, y - s * 0.07, 1.8, 1.8, p.accent);
      return;
    }
    if (type === "cannon" || type === "cauldron") {
      oval(c, x, y, s, s * 0.7, p.ink);
      c.save();
      c.translate(x, y);
      c.rotate((-(o.angle || 45) * Math.PI) / 180);
      c.fillStyle = p.dim;
      c.fillRect(-s * 0.1, -s * 0.32, s * 1.6, s * 0.64);
      c.strokeStyle = p.edge;
      c.lineWidth = 2;
      c.strokeRect(-s * 0.1, -s * 0.32, s * 1.6, s * 0.64);
      c.restore();
      return;
    }
    if (type === "key") {
      c.beginPath();
      c.arc(x, y - s * 0.2, s * 0.3, 0, Math.PI * 2);
      c.strokeStyle = p.accent;
      c.lineWidth = 3;
      c.stroke();
      line(
        c,
        [
          [x, y],
          [x, y + s * 0.65],
          [x + s * 0.25, y + s * 0.65],
        ],
        p.accent,
        3,
      );
    }
  }
  function draw(c, game, view, theme) {
    const p = palettes[themeKey(theme)],
      t = game.time || 0,
      decorTime = view.reducedMotion ? 0 : t,
      v = view,
      S = v.scale || v.width / 12,
      X = (x) => v.width / 2 + x * S,
      Y = (y) => v.height - (y - (v.cameraY || 0)) * S;
    c.save();
    backdrop(c, v, p, decorTime);
    const platforms = game.platforms || [];
    platforms.forEach((o) => {
      c.save();
      const active =
        o.alive !== false && (o.phase === undefined || o.phase === game.phase);
      const solid =
        active &&
        (o.type !== "ghost" ||
          o.phase !== undefined ||
          Math.sin(
            (t * 2 * Math.PI) / (o.period || Math.PI) +
              (o.offset || o.ghostPhase || 0),
          ) > -0.25);
      c.globalAlpha = active ? (solid ? 1 : 0.2) : 0.16;
      platform(
        c,
        X(o.x || 0),
        Y(o.y || 0),
        (o.w || o.width || 2) * S,
        (o.h || 0.32) * S,
        p,
        o.type,
        t,
      );
      c.restore();
    });
    const objects = game.objects || (game.level && game.level.objects) || [];
    objects.forEach((o) => {
      if (o.alive === false) return;
      const type = (o.type || o.kind || "").toLowerCase();
      if (!["platform", "mover", "ghost", "hunter", "pumpkin"].includes(type))
        object(c, o, X, Y, S, p, decorTime);
    });
    (game.pumpkins || []).forEach((o) => {
      if (o.alive !== false) {
        c.save();
        if (o.phase !== undefined && o.phase !== game.phase)
          c.globalAlpha = 0.22;
        pumpkin(c, X(o.x), Y(o.y), S * 0.47, p, decorTime, o.phase);
        c.restore();
      }
    });
    const exit = game.door || (game.level && game.level.door);
    if (exit)
      door(
        c,
        X(exit.x),
        Y(exit.y),
        S * 0.6,
        p,
        game.won ||
          (!(game.pumpkins || []).some((o) => o.alive) &&
            game.hasKey !== false &&
            (game.switches || []).every((o) => o.active)),
      );
    (game.switches || []).forEach((o) => {
      const x = X(o.x),
        y = Y(o.y);
      glow(c, x, y, S * 0.7, o.active ? p.accent + "45" : p.ghost + "15");
      polygon(
        c,
        [
          [x, y - S * 0.25],
          [x + S * 0.2, y],
          [x, y + S * 0.25],
          [x - S * 0.2, y],
        ],
        o.active ? p.accent : p.ghost,
      );
      c.strokeStyle = p.face;
      c.lineWidth = 1;
      c.strokeRect(x - S * 0.3, y - S * 0.34, S * 0.6, S * 0.68);
    });
    if (
      game.level &&
      game.level.gate &&
      !(game.switches || []).every((o) => o.active)
    ) {
      const g = game.level.gate;
      platform(
        c,
        X(g.x),
        Y(g.y + (g.h || 2) / 2),
        (g.w || 0.6) * S,
        (g.h || 2) * S,
        p,
        "ghost",
        t,
      );
    }
    if (game.lantern) {
      const l = game.lantern;
      glow(c, X(l.x), Y(l.y), S * 1.4, p.accent + "55");
      oval(c, X(l.x), Y(l.y), S * 0.17, S * 0.26, p.accent);
    }
    if (game.boss && game.boss.alive !== false && game.boss.hp !== 0) {
      const b = game.boss;
      boss(c, X(b.x), Y(b.y), S * 0.9, p, decorTime);
    }
    if (game.lure) {
      const l = game.lure;
      glow(c, X(l.x), Y(l.y), S * 1.5, p.accent + "40");
      c.strokeStyle = p.accent + "50";
      c.lineWidth = 1;
      c.setLineDash([3, 6]);
      c.beginPath();
      c.arc(X(l.x), Y(l.y), (l.radius || l.r || 3.5) * S, 0, Math.PI * 2);
      c.stroke();
      c.setLineDash([]);
      oval(c, X(l.x), Y(l.y), S * 0.13, S * 0.2, p.accent);
    }
    if (game.echo) {
      const e = game.echo;
      c.save();
      c.globalAlpha = 0.45;
      if (Array.isArray(e.path || e.frames)) {
        const pts = (e.path || e.frames).map((q) => [X(q.x), Y(q.y)]);
        if (pts.length) line(c, pts, p.ghost, 2);
      }
      if (Number.isFinite(e.x))
        rabbit(c, X(e.x), Y(e.y), S * 0.65, p, decorTime, "flying", e.vx);
      c.restore();
    }
    const hero = game.hero;
    if (hero) {
      if (hero.dashing || hero.dashTime > 0 || game.dashTime > 0) {
        glow(c, X(hero.x), Y(hero.y), S * 0.9, p.accent + "40");
        line(
          c,
          [
            [
              X(hero.x - (hero.vx || 0) * 0.05),
              Y(hero.y - (hero.vy || 0) * 0.05),
            ],
            [X(hero.x), Y(hero.y)],
          ],
          p.accent,
          S * 0.16,
        );
      }
      rabbit(
        c,
        X(hero.x),
        Y(hero.y),
        S * (hero.r || 0.45) * 1.45,
        p,
        decorTime,
        hero.state,
        hero.vx,
      );
    }
    c.restore();
  }
  function drawSheet(c, theme) {
    const p = palettes[themeKey(theme)],
      w = c.canvas.width,
      h = c.canvas.height;
    c.clearRect(0, 0, w, h);
    c.fillStyle = p.sky;
    c.fillRect(0, 0, w, h);
    const labels = [
        "IZAN",
        "HUNTER",
        "LANDING",
        "SEALED DOOR",
        "SIGNATURE",
        "MORGRA",
      ],
      unit = w / 6;
    labels.forEach((label, i) => {
      const x = unit * (i + 0.5),
        y = h * 0.5;
      c.strokeStyle = p.edge + "30";
      c.beginPath();
      c.moveTo(unit * i, h * 0.12);
      c.lineTo(unit * i, h * 0.87);
      c.stroke();
      if (i === 0) rabbit(c, x, y + 15, 27, p, 0, "resting", 0);
      if (i === 1) pumpkin(c, x, y, 26, p, 0);
      if (i === 2) platform(c, x, y, unit * 0.78, 18, p, "", 0);
      if (i === 3) door(c, x, y + 33, 29, p, false);
      if (i === 4) {
        if (theme === "shadow") {
          c.save();
          c.globalAlpha = 0.48;
          rabbit(c, x, y + 15, 26, p, 0, "flying", 12);
          c.restore();
          line(
            c,
            [
              [x - 36, y + 34],
              [x + 30, y + 34],
            ],
            p.accent,
            2,
          );
        } else if (theme === "bell") {
          line(
            c,
            [
              [x, y - 51],
              [x, y - 25],
            ],
            p.edge,
            2,
          );
          polygon(
            c,
            [
              [x - 12, y - 23],
              [x + 12, y - 23],
              [x + 26, y + 18],
              [x - 26, y + 18],
            ],
            p.accent,
          );
          oval(c, x, y + 23, 5, 6, p.edge);
          line(
            c,
            [
              [x - 37, y + 35],
              [x + 37, y + 35],
            ],
            p.ghost,
            2,
          );
        } else {
          glow(c, x, y, 48, p.accent + "40");
          c.strokeStyle = p.edge;
          c.lineWidth = 2;
          c.strokeRect(x - 14, y - 23, 28, 44);
          oval(c, x, y, 6, 13, p.accent);
          line(
            c,
            [
              [x - 7, y - 25],
              [x - 7, y - 36],
              [x + 7, y - 36],
              [x + 7, y - 25],
            ],
            p.edge,
            2,
          );
        }
      }
      if (i === 5) boss(c, x, y + 13, 31, p, 0);
      c.fillStyle = p.face;
      c.font = "10px system-ui, sans-serif";
      c.textAlign = "center";
      c.fillText(label, x, h * 0.84);
    });
  }
  root.HNArt = { draw, drawSheet, palettes };
  if (typeof module !== "undefined") module.exports = root.HNArt;
})(typeof window !== "undefined" ? window : globalThis);
