/* The tales of Mqidec: five tales of four stages (Tools/design/yennayer-spec.md).
 * World units follow the shared engine: x from -6 to 6, y up, platform y is the
 * walking surface, door y is the centre of its trigger (surface + 1).
 * Every stage holds three hunters; each one broken is a star. The fourth stage of
 * each tale traps Teryel: the door opens only once she is trapped.
 * `teaches` names the mechanic a verified route must use (see verify-routes.js).
 * Routes proving a three-star finish at human pace live in routes.js. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HNOriginalLevels = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const ALWAYS = { door: "always", stars: "pumpkins" };
  const TRAP = { door: "trap", stars: "pumpkins" };
  const ground = { x: 0, y: 0, w: 12, h: 1.5, type: "ground" };
  const ledge = (x, y, w = 3) => ({ x, y, w, h: 0.5, type: "solid" });
  const crumbling = (x, y, w, period, offset = 0) => ({ x, y, w, h: 0.5, type: "ghost", period, offset });
  const frayed = (x, y, w = 2.4, delay = 0.5, trigger) => ({ x, y, w, h: 0.5, type: "drop", delay, trigger });
  const seesaw = (x, y, w = 4.4, id) => ({ x, y, w, h: 0.4, type: "seesaw", id });
  const post = (x, surface, height, w = 0.5) => ({ x, y: surface + height, w, h: height, type: "post" });
  const hunter = (x, y, range = 3.2, speed = 1) => ({ x, y, range, speed });
  const sleeper = (x, surface) => ({ x, y: surface + 0.55, range: 0, speed: 0 });
  const roller = (x, surface) => ({ x, y: surface + 0.45, range: 0, speed: 0, roll: true });
  const web = (x, y, r = 0.8) => ({ type: "web", x, y, r });
  const tight = (x, y, nx, ny, r = 0.8) => ({ type: "trampoline", x, y, r, nx, ny });
  const zip = (x1, y1, x2, y2) => ({ type: "zip", x1, y1, x2, y2, x: (x1 + x2) / 2, y: (y1 + y2) / 2 });
  const hearth = (x, surface, vx, vy) => ({ type: "cannon", x, y: surface + 1.05, r: 0.75, vx, vy });
  const updraft = (x, y, w, h, lift = 24) => ({ type: "wind", x, y, w, h, ax: 0, ay: lift });
  const teryel = (x, surface, r, dx = 0, period = 6) => ({ type: "teryel", x, y: surface + r, r, dx, period });
  // A sloped roof of loose tiles, walking side up, from (x1, y1) to (x2, y2).
  const roof = (x1, y1, x2, y2) => ({ type: "slope", x1, y1, x2, y2, x: (x1 + x2) / 2, y: Math.max(y1, y2), w: Math.abs(x2 - x1) });
  // A stack of loose tiles sitting on a ridge: a hard hit pushes it over the edge.
  const stack = (x, surface) => ({ x, y: surface + 0.6, w: 1.1, h: 0.6, type: "drop", knock: true, delay: 99 });
  // Spilt oil on a beam: a fast landing glides on, a gentle one stops.
  const oily = (x, y, w = 3) => ({ ...ledge(x, y, w), oil: true });
  // The press wheel: `n` level planks turning round the axle at (cx, cy), one turn per `period` s.
  const wheel = (cx, cy, radius, period, n = 4, w = 1.6) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (i * 2 * Math.PI) / n;
      return { type: "wheel", cx, cy, radius, period, angle, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, w, h: 0.4 };
    });
  // Rats: a walker runs `walk` units along its beam; a sleeper stays curled up.
  const rat = (x, surface, walk = 1.5, range = 3, speed = 1.1) => ({ x, y: surface + 0.4, range, speed, walk });
  const ratNest = (x, surface) => ({ x, y: surface + 0.4, range: 0, speed: 0 });
  // The great press beam on its ledge: a hard side hit sends it over the edge.
  const beam = (x, surface, w = 2.2) => ({ x, y: surface + 0.55, w, h: 0.55, type: "drop", knock: true, delay: 99, beam: true });

  const tales = [
    { id: 1, key: "kitchen", hunter: "pot" },
    { id: 2, key: "loom", hunter: "spider" },
    { id: 3, key: "gorge", hunter: "ijenni" },
    { id: 4, key: "roofs", hunter: "raven" },
    { id: 5, key: "press", hunter: "rat" },
  ];

  const stages = [
    /* ---------- Tale 1: Teryel's kitchen. Her pots hunt him. ---------- */
    {
      id: 1,
      height: 16,
      start: { x: -4.5, y: 0.45 },
      door: { x: 2.6, y: 12 },
      platforms: [ground, ledge(3, 4, 3.4), ledge(-3, 7.5, 3.4), ledge(2, 11, 3.6)],
      pumpkins: [hunter(0, 2.6, 3, 0.9), hunter(0, 6.2, 3, 0.9), hunter(-2.6, 10.4, 3, 0.9)],
      objects: [],
    },
    {
      id: 2,
      height: 16,
      teaches: "roll",
      start: { x: -4.6, y: 0.45 },
      door: { x: 3.8, y: 10.4 },
      platforms: [ground, ledge(-2.8, 4.2, 4), ledge(3.6, 9.4, 3)],
      pumpkins: [roller(-3.2, 4.2), sleeper(1.6, 0), hunter(2.8, 7.4, 3, 1)],
      objects: [],
    },
    {
      id: 3,
      height: 24,
      teaches: "cannon",
      start: { x: -4.5, y: 0.45 },
      door: { x: -3.4, y: 19 },
      platforms: [ground, ledge(1.6, 10, 3.6), crumbling(-3.4, 14.5, 2.8, 8, 0), ledge(-3, 18, 3.4)],
      pumpkins: [hunter(-1.2, 5.6, 2.5, 0.8), hunter(1.2, 14, 2.5, 0.8), hunter(-1, 16.6, 2.5, 0.8)],
      objects: [hearth(-1.2, 0, 0.4, 15), hearth(4.2, 10, -6.5, 13.5)],
    },
    {
      id: 4,
      height: 14,
      rules: TRAP,
      teaches: "trapped",
      start: { x: -4.6, y: 0.45 },
      door: { x: 5, y: 1 },
      platforms: [ground, ledge(-3.6, 3, 3), ledge(-2.5, 6.2, 5)],
      // The great jar is the trap, not a star; three pots hunt.
      pumpkins: [{ ...roller(-0.7, 6.2), trap: true }, hunter(-4.2, 9.2, 3, 0.9), hunter(1.2, 9.4, 3, 0.9), hunter(4.2, 5.4, 2.6, 0.8)],
      objects: [teryel(2.4, 0, 1.3)],
    },

    /* ---------- Tale 2: the loom room. Her spiders and threads. ---------- */
    {
      id: 5,
      height: 24,
      teaches: "web",
      start: { x: 0, y: 0.45 },
      door: { x: -3.6, y: 20.5 },
      platforms: [ground, ledge(-3.4, 19.5, 3.2)],
      pumpkins: [hunter(0.5, 3.8, 3, 1), hunter(-0.4, 9, 3, 1), hunter(0.6, 14.2, 3, 1)],
      objects: [web(3.4, 5.5), web(-3, 10.5), web(2.6, 15.5)],
    },
    {
      id: 6,
      height: 26,
      teaches: "boing",
      start: { x: 4.5, y: 0.45 },
      door: { x: 2.5, y: 22 },
      platforms: [ground, ledge(3.2, 11, 3), ledge(2.5, 21, 3.2)],
      pumpkins: [hunter(-0.5, 8, 3, 1), hunter(0, 18.5, 3, 1), hunter(-3.5, 11.5, 3.5, 1.1)],
      objects: [tight(-4.6, 3.2, 0.6, 0.8), tight(-3.8, 14.5, 0.5, 0.85)],
    },
    {
      id: 7,
      height: 18,
      teaches: "zip",
      start: { x: 4.5, y: 0.45 },
      door: { x: -1, y: 13 },
      platforms: [ledge(4.5, 0, 3), ledge(-4.3, 0, 3.4), ledge(4.3, 4.5, 3), ledge(-1, 12, 3)],
      pumpkins: [sleeper(-1.5, 3.2), sleeper(-0.5, 7.4), hunter(1.5, 9.5, 3, 1)],
      objects: [zip(2.5, 6, -4.5, 2.4), zip(-4.5, 9.5, 4, 6)],
    },
    {
      id: 8,
      height: 16,
      rules: TRAP,
      teaches: "trapped",
      start: { x: -4.8, y: 0.45 },
      door: { x: 4.9, y: 1 },
      platforms: [ground, ledge(-4.4, 4, 3), ledge(4.4, 4.5, 2.6), frayed(0, 7.2, 3, 0.5)],
      pumpkins: [hunter(-1.6, 4.8, 3, 1), hunter(2.6, 9.4, 3, 1), hunter(-2.8, 10.6, 3, 1)],
      objects: [web(-2.6, 9), teryel(0, 0, 1.2, 2, 7)],
    },

    /* ---------- Tale 3: the Iron Gates. The ijenniwen of the gorge. ---------- */
    {
      id: 9,
      height: 22,
      teaches: "gust",
      start: { x: -4.2, y: 0.45 },
      door: { x: 3.6, y: 19.5 },
      platforms: [ledge(-4.2, 0, 3.4), ledge(4.2, 7.5, 2.8), ledge(-3.6, 12.5, 3), ledge(3.6, 18.5, 3)],
      pumpkins: [hunter(0, 6, 2.6, 0.9), hunter(4, 10.8, 2.6, 0.9), hunter(-1, 16.5, 2.6, 0.9)],
      objects: [updraft(0, 5.5, 2.4, 11, 24), updraft(0.5, 16, 2.4, 6, 22)],
    },
    {
      id: 10,
      height: 24,
      teaches: "seesaw",
      start: { x: 4.5, y: 0.45 },
      door: { x: 2.5, y: 20 },
      platforms: [
        ground,
        post(0, 0, 2.2, 0.6),
        seesaw(0, 2.4),
        ledge(4.2, 7, 3),
        ledge(-2.2, 9.2, 3),
        post(-0.5, 9.2, 2.6, 0.6),
        seesaw(-0.5, 12.2),
        ledge(-4.3, 16.5, 3),
        ledge(2.5, 19, 3.4),
      ],
      pumpkins: [sleeper(-1.6, 2.4), sleeper(1.1, 12.2), hunter(-3.6, 13.6, 3, 1)],
      objects: [],
    },
    {
      id: 11,
      height: 22,
      teaches: "ride:ghost",
      start: { x: 0, y: 0.45 },
      door: { x: 3.3, y: 20 },
      platforms: [
        ledge(0, 0, 4),
        crumbling(3.5, 4.5, 2.8, 8, 0),
        frayed(-3, 8, 2.6, 0.8),
        crumbling(-2.5, 12, 2.8, 8, 2.2),
        crumbling(2.6, 15.5, 2.8, 8, 4.4),
        ledge(3, 19, 3),
      ],
      pumpkins: [hunter(-0.4, 6.4, 3, 1), hunter(0, 10.6, 3, 1), hunter(0.6, 17.2, 3, 1)],
      objects: [],
    },
    {
      id: 12,
      height: 16,
      rules: TRAP,
      teaches: "trapped",
      start: { x: -4.8, y: 0.45 },
      door: { x: 5, y: 1 },
      platforms: [ground, post(-2, 0, 2.2, 0.6), seesaw(-2, 2.4, 4.4, "gate"), ledge(-4.6, 7, 2.4), frayed(3.2, 8.5, 2.4, 99, "gate")],
      pumpkins: [sleeper(-0.9, 2.4), hunter(0.4, 7.6, 3, 1), hunter(-3, 10.4, 3, 1)],
      objects: [teryel(3.2, 0, 1.2, 1.2, 6)],
    },

    /* ---------- Tale 4: the rooftops of Lqelɛa. Teryel's ravens. ---------- */
    {
      id: 13,
      height: 18,
      teaches: "slide",
      start: { x: -4.6, y: 0.45 },
      door: { x: -3.2, y: 14.5 },
      platforms: [
        ledge(-4.6, 0, 2.6),
        ledge(-2.6, 5.5, 1.8),
        roof(-1.7, 5.5, 2.8, 3),
        ledge(4.4, 1.5, 2.4),
        ledge(3.8, 9, 2.4),
        roof(2.6, 9, -1.8, 6.6),
        ledge(-3, 13.5, 2.2),
      ],
      pumpkins: [hunter(1.2, 4.6, 2.4, 0.8), hunter(0.6, 8.4, 2.4, 0.8), hunter(-0.6, 11.6, 2.8, 0.9)],
      objects: [],
    },
    {
      id: 14,
      height: 16,
      teaches: "knock",
      start: { x: -4.6, y: 0.45 },
      door: { x: 3.8, y: 13.5 },
      platforms: [
        ledge(-4.6, 0, 2.6),
        ledge(1, 2.6, 6),
        ledge(1.4, 7, 2.2),
        stack(2.2, 7),
        ledge(-2.6, 10, 2),
        stack(-1.9, 10),
        ledge(3.6, 12.5, 2.4),
      ],
      pumpkins: [sleeper(-0.8, 2.6), sleeper(3.2, 2.6), hunter(-1, 12.6, 2.8, 0.9)],
      objects: [],
    },
    {
      id: 15,
      height: 18,
      teaches: "slide",
      start: { x: -4.6, y: 0.45 },
      door: { x: 3.8, y: 14.5 },
      platforms: [
        ledge(-4.6, 0, 2.6),
        ledge(2.5, 2.5, 4),
        ledge(-4.4, 4.8, 2),
        ledge(-3, 9, 1.8),
        roof(-2.1, 9, 1.6, 6.4),
        ledge(2.4, 6.2, 1.6),
        stack(2.9, 6.2),
        ledge(3.6, 13.5, 2.4),
      ],
      pumpkins: [sleeper(3.8, 2.5), hunter(0, 4.5, 2.6, 0.9), hunter(-0.5, 12, 2.8, 0.9)],
      objects: [],
    },
    {
      id: 16,
      height: 16,
      rules: TRAP,
      teaches: "trapped",
      start: { x: -4.8, y: 0.45 },
      door: { x: 5.2, y: 1 },
      platforms: [
        ledge(-4.8, 0, 2),
        ledge(1.5, 0, 9),
        ledge(-3.2, 7, 2),
        roof(-2.3, 7, 0.8, 5.2),
        ledge(1.6, 5, 1.6),
        stack(2.1, 5),
        ledge(-4.6, 3.6, 1.8),
      ],
      pumpkins: [hunter(-1, 3.4, 2.6, 0.9), hunter(0.6, 9, 2.6, 0.9), hunter(3.8, 7.5, 2.6, 0.9)],
      objects: [teryel(1.5, 0, 1.2, 1.5, 7)],
    },

    /* ---------- Tale 5: the olive press. Teryel's rats. ---------- */
    {
      id: 17,
      height: 16,
      teaches: "oil",
      start: { x: -4.6, y: 0.45 },
      door: { x: 4.2, y: 13 },
      platforms: [ground, oily(1.6, 3, 6), ledge(-3.8, 6.2, 2.4), oily(0.8, 9, 5), ledge(4.2, 12, 2.6)],
      pumpkins: [ratNest(4, 3), rat(2.4, 9, 0.9, 2.6, 1), rat(4.2, 0, 1.2, 2.6, 1)],
      objects: [],
    },
    {
      id: 18,
      height: 16,
      teaches: "ride:wheel",
      start: { x: -4.8, y: 0.45 },
      door: { x: 4.4, y: 13 },
      platforms: [ground, ...wheel(0.2, 5.6, 3, 10), ledge(5.2, 4.6, 1.4), ledge(-4.6, 10.6, 2.2), ledge(4.4, 12, 2.4)],
      pumpkins: [ratNest(-4.6, 10.6), ratNest(5.2, 4.6), rat(3.2, 0, 1.4, 2.6, 1)],
      objects: [],
    },
    {
      id: 19,
      height: 18,
      teaches: "oil",
      start: { x: -4.8, y: 0.45 },
      door: { x: -4.4, y: 15 },
      platforms: [ground, ...wheel(-2.4, 5, 2.6, 10, 3), oily(3.4, 7, 3.6), ledge(4.6, 10.6, 2), oily(-0.4, 12, 4.4), ledge(-4.4, 14, 2.2)],
      pumpkins: [ratNest(4.6, 7), rat(-1.6, 12, 1, 2.6, 1), rat(3.4, 0, 1.4, 2.6, 1)],
      objects: [],
    },
    {
      id: 20,
      height: 14,
      rules: TRAP,
      teaches: "trapped",
      start: { x: -4.8, y: 0.45 },
      door: { x: -4.4, y: 10 },
      platforms: [ground, ledge(-4, 3, 2.4), oily(0.4, 5.2, 4.4), beam(2.1, 5.2, 2), ledge(-4.4, 9, 2.2), ledge(4.6, 8.4, 1.8)],
      pumpkins: [rat(-4, 3, 0.8, 2.4, 0.9), ratNest(4.6, 8.4), rat(-1.4, 0, 1.2, 2.4, 1)],
      objects: [teryel(3.6, 0, 1.2, 1.4, 7)],
    },
  ];
  const taleOf = (id) => Math.ceil(id / 4);
  for (const s of stages) {
    s.rules = s.rules || ALWAYS;
    s.tale = taleOf(s.id);
    s.theme = tales[s.tale - 1].key;
    s.hunter = tales[s.tale - 1].hunter;
    s.chapter = s.tale - 1;
    s.par = 99;
  }
  function get(id) {
    const stage = stages.find((s) => s.id === id);
    if (!stage) throw new RangeError("No stage " + id);
    const routes = globalThis.HNOriginalRoutes || {};
    return { ...stage, route: routes[id] || [] };
  }
  return { get, count: stages.length, all: stages, tales, taleOf, chapterOf: (id) => taleOf(id) - 1 };
});
