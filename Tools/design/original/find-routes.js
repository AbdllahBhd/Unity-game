/* Searches for a three-star route through each stage and writes routes.js.
 * Usage: node find-routes.js [stage ids...] [--seed N] [--strip water|bucket|flood]
 * `--strip` searches a copy of each stage without that mechanic (water removed, buckets
 * frozen where they start, no cistern) and writes nothing: finding no
 * three-star route there is evidence, not proof, that the stage needs the mechanic.
 * Beam search over random launches and waits from every resting state. Stored
 * actions replay exactly through replayRoute below and verify-routes.js (same
 * 1/120 s stepping, same thinking pauses, at most one dash per action). */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { Game, atRest } = require("../prototype/game.js");
const levels = require("./levels.js");

const args = process.argv.slice(2);
const seedIndex = args.indexOf("--seed");
let seed = seedIndex >= 0 ? Number(args[seedIndex + 1]) : 7;
const stripIndex = args.indexOf("--strip");
const strip = stripIndex >= 0 ? args[stripIndex + 1] : null;
if (stripIndex >= 0 && !["water", "bucket", "flood"].includes(strip))
  throw new Error(`--strip takes water, bucket or flood, not ${strip}`);
const ids = args
  .filter((a, i) => /^\d+$/.test(a) && !(seedIndex >= 0 && i === seedIndex + 1))
  .map(Number);
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const OPTIONS = { pursuit: "aim", hunters: "lively" };
const STEP = 1 / 120;
// Human pace: after landing, a person needs time to see, think and aim. During that
// time the pumpkins keep hunting (aiming itself freezes them). A dash also needs a
// reaction delay. A route that needs instant reflexes is not accepted.
const THINK = 1.2;
const REACTION = 0.15;

function cloneGame(g) {
  return Object.setPrototypeOf(structuredClone({ ...g }), Game.prototype);
}

// Mirrors one simulateRoute action, stopping when Izan rests, wins or dies.
function tryAction(base, action) {
  const g = cloneGame(base);
  const deaths = g.deaths;
  const since = g.time;
  if (action.dashAt !== undefined && action.dashAt < REACTION) return null;
  // Thinking time first: Izan rests while the pumpkins close in.
  if (action.hold === undefined && atRest(g.hero.state)) {
    for (let t = 0; t < THINK; t += STEP) {
      g.step(STEP);
      if (g.deaths > deaths) return null;
    }
    if (!atRest(g.hero.state)) return null;
  }
  // A wait action launches nothing; Izan stays put for at least `hold` seconds.
  if (action.hold === undefined && !g.launch(action.vx, action.vy)) return null;
  let n = 0;
  let dashed = false;
  for (let t = 0; t < 6; t += STEP) {
    const holding = action.hold !== undefined && t < action.hold;
    // One dash per action: a trampoline or zip re-arms the dash, but a person
    // cannot tap again within the same tick.
    if (!dashed && action.dashAt !== undefined && t >= action.dashAt && g.dashReady) {
      g.dash();
      dashed = true;
    }
    g.step(STEP);
    n++;
    if (g.deaths > deaths) return null;
    if (g.won || (!holding && atRest(g.hero.state))) {
      const used = new Set(
        g.events
          .filter((e) => e.time > since)
          .map((e) => (e.crushed ? "crush" : e.type)),
      );
      if (g.support && g.support.type) used.add("ride:" + g.support.type);
      const stored = { ...action, wait: (n - 0.5) / 120 };
      if (action.hold === undefined) stored.think = THINK;
      delete stored.hold;
      return { game: g, used, action: stored };
    }
  }
  return null;
}

function score(g, level) {
  const d = level.door;
  const near = Math.hypot(g.hero.x - d.x, g.hero.y - d.y);
  const bossHits = g.boss ? (level.boss.hp - g.boss.hp) * 60 : 0;
  return g.smashed() * 100 + bossHits - near * 2 + g.hero.y * 0.5 - g.launches * 4;
}
function rank(node, level) {
  const taught = level.teaches && node.used.has(level.teaches) ? 40 : 0;
  return score(node.game, level) + taught;
}

function search(level) {
  const start = new Game(level, OPTIONS);
  let beam = [{ game: start, route: [], used: new Set() }];
  let best = null;
  let anyWin = null;
  for (let depth = 0; depth < 9 && !best; depth++) {
    const next = [];
    for (const node of beam) {
      for (const hold of [0.8, 1.6]) {
        const result = tryAction(node.game, { hold });
        if (!result) continue;
        const route = node.route.concat(result.action);
        const used = new Set([...node.used, ...result.used]);
        next.push({ game: result.game, route, used });
      }
      for (let k = 0; k < 90; k++) {
        const angle = 0.08 + random() * (Math.PI - 0.16);
        const speed = 5 + random() * 11;
        const action = {
          vx: +(Math.cos(angle) * speed).toFixed(4),
          vy: +(Math.sin(angle) * speed).toFixed(4),
        };
        if (random() < 0.35) action.dashAt = +(REACTION + random() * 0.85).toFixed(3);
        const result = tryAction(node.game, action);
        if (!result) continue;
        const route = node.route.concat(result.action);
        const used = new Set([...node.used, ...result.used]);
        if (result.game.won) {
          if (!anyWin) anyWin = route;
          const taught = !level.teaches || used.has(level.teaches);
          if (taught && result.game.smashed() === 3 && (!best || route.length < best.length))
            best = route;
          continue;
        }
        next.push({ game: result.game, route, used });
      }
    }
    const seen = new Set();
    beam = next
      .sort((a, b) => rank(b, level) - rank(a, level))
      .filter((n) => {
        const key = [
          Math.round(n.game.hero.x * 2),
          Math.round(n.game.hero.y * 2),
          n.game.smashed(),
          n.game.boss ? n.game.boss.hp : 0,
          level.teaches && n.used.has(level.teaches) ? 1 : 0,
        ].join();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 40);
    if (!beam.length) break;
  }
  return { best, anyWin };
}

// Same stepping as simulateRoute plus the stored thinking pauses.
function replayRoute(level, route) {
  const game = new Game(level, OPTIONS);
  for (const a of route) {
    for (let t = 0; t < (a.think || 0); t += STEP) game.step(STEP);
    if (a.vx !== undefined) game.launch(a.vx, a.vy);
    let dashed = false;
    for (let t = 0; t < a.wait; t += STEP) {
      if (!dashed && a.dashAt !== undefined && t >= a.dashAt && game.dashReady) {
        game.dash();
        dashed = true;
      }
      game.step(STEP);
      if (game.won) break;
    }
    if (game.won) break;
  }
  return game;
}
module.exports = { replayRoute, OPTIONS };

const file = path.join(__dirname, "routes.js");
const existing = {};
if (fs.existsSync(file)) {
  require(file);
  Object.assign(existing, globalThis.HNOriginalRoutes || {});
}
// A copy of the stage without one mechanic, for --strip.
function stripped(level, kind) {
  const copy = structuredClone(level);
  if (kind === "water") copy.objects = copy.objects.filter((o) => o.type !== "water");
  if (kind === "bucket")
    copy.platforms = new Game(level, OPTIONS).platforms.map((p) =>
      p.type === "bucket" ? { x: p.x, y: p.y, w: p.w, h: p.h, type: "solid" } : structuredClone(p),
    );
  // The cistern only ever floods, so without the flood it is not there at all.
  if (kind === "flood") copy.platforms = copy.platforms.filter((p) => p.flood === undefined);
  delete copy.teaches;
  return copy;
}
function main() {
const targets = ids.length ? ids : levels.all.map((s) => s.id);
let failed = 0;
if (strip) {
  for (const id of targets) {
    const { best, anyWin } = search(stripped(levels.get(id), strip));
    console.log(
      `stage ${id} without ${strip}: ` +
        (best ? `three stars in ${best.length} actions` : "no three-star route") +
        (anyWin ? `; door reachable in ${anyWin.length}` : "; door not reached"),
    );
  }
  return;
}
for (const id of targets) {
  const level = levels.get(id);
  const { best, anyWin } = search(level);
  const replay = best && replayRoute(level, best);
  if (best && replay.won && replay.smashed() === 3) {
    existing[id] = best;
    console.log(`ok   stage ${id} ${level.name}: three stars in ${best.length} actions`.replace(" undefined", ""));
  } else {
    failed++;
    console.log(
      `FAIL stage ${id} ${level.name}: ${best ? "route did not replay" : "no three-star route"}` +
        (anyWin ? `; door reachable in ${anyWin.length}` : "; door not reached"),
    );
  }
}
const ordered = Object.keys(existing).sort((a, b) => a - b);
const body = ordered.map((k) => `  ${k}: ${JSON.stringify(existing[k])},`).join("\n");
fs.writeFileSync(
  file,
  "/* Generated by find-routes.js: one verified three-star route per stage. */\n" +
    `globalThis.HNOriginalRoutes = {\n${body}\n};\n`,
);
process.exitCode = failed ? 1 : 0;
}
if (require.main === module) main();
