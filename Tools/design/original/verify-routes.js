/* Replays every stored route through the shared engine. Fails unless each stage is
 * won with all three pumpkins smashed. Also lists which mechanics the route used. */
"use strict";
require("./routes.js");
const { Game } = require("../prototype/game.js");
const levels = require("./levels.js");
const { OPTIONS } = require("./find-routes.js");
let failures = 0;
// Layout checks. A rider anywhere on a press wheel plank (its width plus his own) must
// never be swept into another platform or onto a hunter's home, and a walking rat must
// stay on its beam.
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
      console.log(`FAIL stage ${stage.id}: the rat at (${k.x}, ${k.y}) walks off its beam`);
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
  for (const a of level.route) {
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
  const ok = check.won && check.smashed() === 3 && taught;
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
  ]
    .filter((m) => used.has(m))
    .join(", ");
  console.log(
    `${ok ? "ok  " : "FAIL"} stage ${stage.id}${stage.name ? " " + stage.name : ""}: ` +
      `${check.smashed()}/3 hunters, ${check.launches} launches, ${check.deaths} deaths, human pace` +
      (mechanics ? `; uses ${mechanics}` : "") +
      (taught ? "" : `; never uses its lesson (${stage.teaches})`),
  );
}
console.log(
  failures
    ? `${failures} stage(s) failed.`
    : `${levels.count}/${levels.count} stages finish with three stars through normal play.`,
);
process.exitCode = failures ? 1 : 0;
