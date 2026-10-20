/* Replays every stored route through the shared engine. Fails unless each stage is
 * won with all three pumpkins smashed. Also lists which mechanics the route used. */
"use strict";
require("./routes.js");
const { Game } = require("../prototype/game.js");
const levels = require("./levels.js");
const { OPTIONS } = require("./find-routes.js");
let failures = 0;
// Layout checks. A rider anywhere on a press wheel plank (its width plus his own) must
// never be swept into another platform or onto a hunter's home, a walking hunter must
// stay on its beam, a well bucket (with a rider standing in it) must never travel
// through a platform, and a frog's leap must stay clear of every platform.
const R = 0.45;
for (const stage of levels.all) {
  const axles = new Map();
  for (const p of stage.platforms) if (p.type === "wheel") axles.set(p.cx + "," + p.cy, p);
  for (const plank of axles.values()) {
    const reach = plank.w / 2 + R;
    const blockers = stage.platforms
      .filter((q) => q.type !== "wheel" && q.type !== "ground")
      .map((q) => ({ what: `the platform at (${q.x}, ${q.y})`, x: q.x, w: q.w, bottom: q.y - (q.h || 0.4), top: q.y }))
      .concat(stage.pumpkins.map((k) => ({ what: `the hunter at (${k.x}, ${k.y})`, x: k.x, w: 0.9, bottom: k.y - 0.45, top: k.y + 0.45 })));
    for (const b of blockers)
      for (let a = 0; a < Math.PI * 2; a += 0.02) {
        const x = plank.cx + Math.cos(a) * plank.radius,
          y = plank.cy + Math.sin(a) * plank.radius;
        if (Math.abs(x - b.x) < reach + b.w / 2 && y + 2 * R > b.bottom && y < b.top) {
          console.log(`FAIL stage ${stage.id}: a wheel rider sweeps into ${b.what}`);
          failures++;
          break;
        }
      }
  }
  for (const k of stage.pumpkins) {
    if (k.walk === undefined) continue;
    const beam = stage.platforms.find(
      (q) => Math.abs(q.y + 0.4 - k.y) < 0.01 && k.x - k.walk >= q.x - q.w / 2 && k.x + k.walk <= q.x + q.w / 2,
    );
    if (!beam) {
      console.log(`FAIL stage ${stage.id}: the hunter at (${k.x}, ${k.y}) walks off its beam`);
      failures++;
    }
  }
  const fixed = stage.platforms.filter((q) => q.type !== "bucket" && q.type !== "ground");
  const crosses = (x, half, bottom, top) =>
    fixed.find((q) => Math.abs(q.x - x) < half + q.w / 2 && bottom < q.y && top > q.y - (q.h || 0.4));
  for (const b of stage.platforms) {
    if (b.type !== "bucket") continue;
    const q = crosses(b.x, b.w / 2 + R, b.bottom - (b.h || 0.4), b.top + 2 * R);
    if (q) {
      console.log(`FAIL stage ${stage.id}: the bucket at x ${b.x} travels through the platform at (${q.x}, ${q.y})`);
      failures++;
    }
  }
  for (const o of stage.objects)
    if (o.type === "water" && o.freeze && o.rise) {
      console.log(`FAIL stage ${stage.id}: the pond at x ${o.x} both freezes and rises`);
      failures++;
    }
  // Nothing may hang inside a freezing pond with water under it: he would be pinned beneath
  // it while thawed, and the ice would close round it.
  for (const o of stage.objects) {
    if (o.type !== "water" || !o.freeze) continue;
    for (const q of stage.platforms) {
      const bottom = q.y - (q.h || 0.4);
      if (Math.abs(q.x - o.x) < (q.w + o.w) / 2 && bottom > o.y + 0.001 && bottom < o.level) {
        console.log(`FAIL stage ${stage.id}: the platform at (${q.x}, ${q.y}) hangs inside the pond at x ${o.x}`);
        failures++;
      }
    }
  }
  for (const k of stage.pumpkins) {
    if (!k.leap) continue;
    const q = crosses(k.x, (k.walk || 0) + 0.45, k.y - 0.35, k.y + k.leap.height + 0.45);
    if (q) {
      console.log(`FAIL stage ${stage.id}: the frog at (${k.x}, ${k.y}) leaps into the platform at (${q.x}, ${q.y})`);
      failures++;
    }
  }
}
for (const stage of levels.all) {
  const level = levels.get(stage.id);
  const used = new Set();
  const game = new Game(level, OPTIONS);
  const emit = game.emit.bind(game);
  game.emit = (type, extra = {}) => {
    used.add(extra.crushed ? "crush" : type);
    emit(type, extra);
  };
  // Same stepping as find-routes.js replayRoute, kept here so events can be observed.
  // `think` is the human pause before a launch, with pumpkins hunting meanwhile.
  // Every spot he rests on before a launch (the start included) must be out of a live
  // goat's charge, unless a drift lies between them to stop it.
  const goatThreat = () =>
    game.pumpkins.find((k) => {
      if (!k.alive || !k.charge) return false;
      const h = game.hero;
      // It charges when he is within `range`, but its run only reaches the end of its walk.
      const dx = Math.abs(h.x - k.homeX);
      if (Math.abs(h.y - k.homeY) >= 1 || dx >= k.charge.range || dx >= (k.walk || 0) + R + 0.45) return false;
      const lo = Math.min(h.x, k.homeX),
        hi = Math.max(h.x, k.homeX);
      return !game.platforms.some((q) => q.drift && q.x > lo && q.x < hi && Math.abs(q.y - (k.homeY - 0.4)) < 1);
    });
  let threatened = null;
  for (const a of level.route) {
    const goat = goatThreat();
    if (goat && !threatened) threatened = `a goat at (${goat.homeX}, ${goat.homeY}) can charge his rest at (${game.hero.x.toFixed(2)}, ${game.hero.y.toFixed(2)})`;
    for (let t = 0; t < (a.think || 0); t += 1 / 120) game.step(1 / 120);
    if (a.vx !== undefined) game.launch(a.vx, a.vy);
    let dashed = false;
    for (let t = 0; t < a.wait; t += 1 / 120) {
      if (!dashed && a.dashAt !== undefined && t >= a.dashAt && game.dashReady) {
        game.dash();
        dashed = true;
      }
      game.step(1 / 120);
      if (game.hero.state === "resting" && game.support && game.support.type)
        used.add("ride:" + game.support.type);
      if (game.won) break;
    }
    if (game.won) break;
  }
  const check = game;
  const taught = !stage.teaches || used.has(stage.teaches);
  const ok = check.won && check.smashed() === 3 && taught && !threatened;
  if (!ok) failures++;
  const mechanics = [
    "dash",
    "web",
    "ride:mover",
    "ride:ghost",
    "snap",
    "crush",
    "seesaw",
    "boing",
    "zip",
    "roll",
    "cannon",
    "spider",
    "boss-hit",
    "boss-down",
    "trapped",
    "gust",
    "slide",
    "knock",
    "hop",
    "oil",
    "ride:wheel",
    "float",
    "ride:bucket",
    "jerk",
    "flood",
    "ride:ice",
    "drift",
    "stuck",
  ]
    .filter((m) => used.has(m))
    .join(", ");
  console.log(
    `${ok ? "ok  " : "FAIL"} stage ${stage.id}${stage.name ? " " + stage.name : ""}: ` +
      `${check.smashed()}/3 hunters, ${check.launches} launches, ${check.deaths} deaths, human pace` +
      (mechanics ? `; uses ${mechanics}` : "") +
      (taught ? "" : `; never uses its lesson (${stage.teaches})`) +
      (threatened ? `; ${threatened}` : ""),
  );
}
console.log(
  failures
    ? `${failures} stage(s) failed.`
    : `${levels.count}/${levels.count} stages finish with three stars through normal play.`,
);
process.exitCode = failures ? 1 : 0;
