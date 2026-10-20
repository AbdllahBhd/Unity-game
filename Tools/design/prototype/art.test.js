"use strict";
const assert = require("node:assert/strict");
const art = require("./art.js");
function context() {
  const calls = [],
    stack = [];
  const target = {
    canvas: { width: 360, height: 600 },
    globalAlpha: 1,
    fillStyle: "",
    save() {
      stack.push({ globalAlpha: this.globalAlpha, fillStyle: this.fillStyle });
    },
    restore() {
      Object.assign(this, stack.pop());
    },
    createLinearGradient() {
      return { addColorStop() {} };
    },
    createRadialGradient() {
      return { addColorStop() {} };
    },
    fillRect(...args) {
      calls.push({
        kind: "rect",
        alpha: this.globalAlpha,
        color: this.fillStyle,
        args,
      });
    },
    beginPath() {
      calls.push({ kind: "path" });
    },
    moveTo(x, y) {
      calls.push({ kind: "move", x, y });
    },
    lineTo(x, y) {
      calls.push({ kind: "line", x, y });
    },
    stroke() {
      calls.push({ kind: "stroke", color: this.strokeStyle });
    },
  };
  return {
    calls,
    ctx: new Proxy(target, {
      get(t, k) {
        return k in t ? t[k] : () => {};
      },
      set(t, k, v) {
        t[k] = v;
        return true;
      },
    }),
  };
}
const view = {
  width: 360,
  height: 600,
  scale: 30,
  cameraY: 0,
  reducedMotion: true,
};
function platformAlpha(p, time, phase) {
  const { ctx, calls } = context();
  art.draw(ctx, { time, phase, platforms: [p] }, view, "light");
  return calls.find(
    (x) => x.kind === "rect" && x.color === art.palettes.light.ground,
  ).alpha;
}
assert.equal(
  platformAlpha({ type: "ghost", x: 0, y: 3, w: 2, h: 0.4, phase: 1 }, 1, 0),
  0.16,
  "inactive phased ghost stays clearly inactive",
);
assert.equal(
  platformAlpha({ type: "ghost", x: 0, y: 3, w: 2, h: 0.4, period: 4 }, 3, 0),
  0.2,
  "non-solid ghost uses authored period",
);
assert.equal(
  platformAlpha({ type: "ghost", x: 0, y: 3, w: 2, h: 0.4, period: 4 }, 1, 0),
  1,
  "solid ghost has solid rendering even with reduced motion",
);
assert.equal(
  platformAlpha(
    { type: "ghost", x: 0, y: 3, w: 2, h: 0.4, phase: 0, period: 4 },
    3,
    0,
  ),
  1,
  "active phase ghost does not additionally blink",
);
const { ctx, calls } = context();
art.draw(
  ctx,
  {
    time: 3,
    platforms: [],
    objects: [{ type: "wind", x: 0, y: 2, ax: 0, ay: 24 }],
  },
  view,
  "light",
);
const windStroke = calls.findIndex(
  (x) => x.kind === "stroke" && x.color === art.palettes.light.ghost + "99",
);
const windLine = calls[windStroke - 1],
  windStart = calls[windStroke - 2];
assert.equal(windStart.kind, "move");
assert.equal(windLine.kind, "line");
assert.equal(windStart.x, windLine.x, "updraft arrow is vertical");
assert.ok(
  windLine.y < windStart.y,
  "positive world ay arrow points up on canvas",
);
function decorativeDraw(time, reducedMotion) {
  const { ctx, calls } = context();
  art.draw(
    ctx,
    {
      time,
      platforms: [],
      objects: [{ type: "wind", x: 0, y: 2, ax: 0, ay: 24 }],
      pumpkins: [{ x: 1, y: 2, alive: true }],
      hero: { x: 0, y: 0.45, r: 0.45, state: "resting" },
      boss: { x: 2, y: 5, hp: 3 },
    },
    { ...view, reducedMotion },
    "light",
  );
  return JSON.parse(JSON.stringify(calls));
}
assert.deepEqual(
  decorativeDraw(1, true),
  decorativeDraw(3, true),
  "reduced motion freezes decorative effects",
);
assert.notDeepEqual(
  decorativeDraw(1, false),
  decorativeDraw(3, false),
  "normal decorative effects remain animated",
);
console.log(
  "Art regression checks passed: ghost solidity, phase opacity, updraft direction, reduced motion.",
);
