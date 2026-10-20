/* The Green Harvest: fourteen stages for the original-art prototype.
 * World units follow the shared engine: x from -6 to 6, y up, platform y is the
 * walking surface, door y is the centre of its trigger (surface + 1).
 * Every stage holds exactly three pumpkins; each one smashed is a star.
 * `teaches` names the mechanic a verified route must use (see verify-routes.js).
 * Routes proving a three-star finish at human pace live in routes.js. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HNOriginalLevels = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const ALWAYS = { door: "always", stars: "pumpkins" };
  const ground = { x: 0, y: 0, w: 12, h: 1.5, type: "ground" };
  const stone = (x, y, w = 3) => ({ x, y, w, h: 0.5, type: "solid" });
  const swing = (x, y, w, dx, period) => ({ x, y, w, h: 0.5, type: "mover", dx, dy: 0, period });
  const slack = (x, y, w, period, offset = 0) => ({ x, y, w, h: 0.5, type: "ghost", period, offset });
  const frayed = (x, y, w = 2.4, delay = 0.5) => ({ x, y, w, h: 0.5, type: "drop", delay });
  const seesaw = (x, y, w = 4.4) => ({ x, y, w, h: 0.4, type: "seesaw" });
  const post = (x, surface, height, w = 0.5) => ({ x, y: surface + height, w, h: height, type: "post" });
  const pumpkin = (x, y, range = 3.5, speed = 1.2) => ({ x, y, range, speed });
  // Two grave posts with a gap too narrow for Izan; only a falling stone's
  // landing shock reaches the pumpkin sleeping between them.
  const nestPosts = (x, surface) => [post(x - 0.65, surface, 1.2), post(x + 0.65, surface, 1.2)];
  const sleeper = (x, surface) => ({ x, y: surface + 0.55, range: 0, speed: 0 });
  const roller = (x, surface) => ({ x, y: surface + 0.45, range: 0, speed: 0, roll: true });
  const web = (x, y, r = 0.8) => ({ type: "web", x, y, r });
  const trampoline = (x, y, nx, ny, r = 0.8) => ({ type: "trampoline", x, y, r, nx, ny });
  const zip = (x1, y1, x2, y2) => ({ type: "zip", x1, y1, x2, y2, x: (x1 + x2) / 2, y: (y1 + y2) / 2 });
  const spider = (x, y, dy, period = 3) => ({ type: "spider", x, y, r: 0.38, dx: 0, dy, period });
  const cauldron = (x, surface, vx, vy) => ({ type: "cannon", x, y: surface + 1.05, r: 0.75, vx, vy });

  const stages = [
    {
      id: 1,
      name: "The Lifted Stone",
      height: 16,
      lesson: "Drag back, aim, let go. Hit a pumpkin fast and it bursts.",
      start: { x: -4.5, y: 0.45 },
      door: { x: -0.4, y: 12.5 },
      platforms: [ground, stone(-3, 4.5, 3.2), stone(3, 8, 3.2), stone(-0.6, 11.5, 3.4)],
      pumpkins: [pumpkin(0.4, 3.2, 3, 0.8), pumpkin(0, 7.2, 3, 0.8), pumpkin(3.4, 11.4, 3, 0.8)],
      objects: [],
    },
    {
      id: 2,
      name: "They Go Around",
      height: 18,
      lesson: "They follow you. Aiming freezes them, so take your time, then go.",
      start: { x: 4.5, y: 0.45 },
      door: { x: 3.6, y: 15.5 },
      platforms: [ground, stone(-3.5, 4, 3), stone(2.5, 7.5, 3), stone(-2, 11.5, 3), stone(3, 14.5, 3)],
      pumpkins: [pumpkin(0, 2.6, 4.5, 1.1), pumpkin(-0.5, 9, 4.5, 1.1), pumpkin(0.5, 13.5, 4.5, 1.1)],
      objects: [],
    },
    {
      id: 3,
      name: "The Crypt Door",
      height: 16,
      teaches: "dash",
      lesson: "Tap while flying to dash. A dashing rabbit breaks anything it hits.",
      start: { x: -4.5, y: 0.45 },
      door: { x: 4.2, y: 13 },
      platforms: [ground, stone(3.4, 4.5, 3.4), stone(-3, 8.5, 3), stone(2.6, 12, 4)],
      pumpkins: [pumpkin(0.6, 2.4, 3, 1), pumpkin(-0.4, 6.6, 3, 1), pumpkin(1.6, 13.2, 2.2, 0.6)],
      objects: [],
    },
    {
      id: 4,
      name: "The Balanced Stone",
      height: 24,
      teaches: "seesaw",
      lesson: "A grave stone balanced on a post. Land hard on one end and watch the other.",
      start: { x: -4.5, y: 0.45 },
      door: { x: -2.5, y: 20 },
      platforms: [
        ground,
        post(0, 0, 2.2, 0.6),
        seesaw(0, 2.4),
        stone(-4.2, 7, 3),
        stone(2.2, 9.2, 3),
        post(0.5, 9.2, 2.6, 0.6),
        seesaw(0.5, 12.2),
        stone(4.3, 16.5, 3),
        stone(-2.5, 19, 3.4),
      ],
      pumpkins: [sleeper(1.6, 2.4), sleeper(-1.1, 12.2), pumpkin(3.6, 13.6, 3, 1)],
      objects: [],
    },
    {
      id: 5,
      name: "Threads That Swing",
      height: 20,
      teaches: "ride:mover",
      lesson: "These stones hang on threads. Ride one, leap when it swings close.",
      start: { x: -4, y: 0.45 },
      door: { x: -4.3, y: 17 },
      platforms: [stone(-4, 0, 3.4), swing(0, 4, 2.6, 3, 5), stone(4, 8, 2.6), swing(-1, 12, 2.4, -3, 6), stone(-4, 16, 3)],
      pumpkins: [pumpkin(0, 7, 3, 1), pumpkin(4.2, 11.6, 3, 1), pumpkin(-0.8, 15.2, 3, 1)],
      objects: [],
    },
    {
      id: 6,
      name: "Silk",
      height: 24,
      teaches: "web",
      lesson: "Fly into the silk. It holds you once, and you can leap again from it.",
      start: { x: 0, y: 0.45 },
      door: { x: 3.8, y: 21 },
      platforms: [ground, stone(3.5, 20, 3)],
      pumpkins: [pumpkin(0, 4.2, 3, 1), pumpkin(0.2, 10, 3, 1), pumpkin(0.8, 17, 3, 1)],
      objects: [web(-3.5, 6), web(3, 11.5), web(-2.5, 16.5)],
    },
    {
      id: 7,
      name: "Bounce",
      height: 26,
      teaches: "boing",
      lesson: "A tight web throws you back. Aim at it and let it do the jumping.",
      start: { x: -4.5, y: 0.45 },
      door: { x: -2.5, y: 22 },
      platforms: [ground, stone(-3.2, 11, 3), stone(-2.5, 21, 3.2)],
      pumpkins: [pumpkin(0.5, 8, 3, 1), pumpkin(0, 18.5, 3, 1), pumpkin(3.5, 11.5, 3.5, 1.1)],
      objects: [trampoline(4.6, 3.2, -0.6, 0.8), trampoline(3.8, 14.5, -0.5, 0.85)],
    },
    {
      id: 8,
      name: "The Long Thread",
      height: 18,
      teaches: "zip",
      lesson: "Catch the long thread and slide. Whatever sits on it is in your way.",
      start: { x: -4.5, y: 0.45 },
      door: { x: 1, y: 13 },
      platforms: [stone(-4.5, 0, 3), stone(4.3, 0, 3.4), stone(-4.3, 4.5, 3), stone(1, 12, 3)],
      pumpkins: [sleeper(1.5, 3.2), sleeper(0.5, 7.4), pumpkin(-1.5, 9.5, 3, 1)],
      objects: [zip(-2.5, 6, 4.5, 2.4), zip(4.5, 9.5, -4, 6)],
    },
    {
      id: 9,
      name: "The Frayed Thread",
      height: 24,
      teaches: "crush",
      lesson: "Some pumpkins sleep between grave posts. Stand on the frayed stone above and let it fall.",
      start: { x: -4.5, y: 0.45 },
      door: { x: 1.8, y: 21.5 },
      platforms: [
        ground,
        ...nestPosts(-1.2, 0),
        frayed(-1.2, 4.4, 2.4, 0.6),
        stone(3.4, 7.5, 4.4),
        ...nestPosts(3.8, 7.5),
        frayed(3.8, 11.8, 2.4, 0.6),
        stone(-3.4, 14, 4.4),
        ...nestPosts(-3.8, 14),
        frayed(-3.8, 18.2, 2.4, 0.6),
        stone(1.5, 20.5, 3),
      ],
      pumpkins: [sleeper(-1.2, 0), sleeper(3.8, 7.5), sleeper(-3.8, 14)],
      objects: [],
    },
    {
      id: 10,
      name: "Slack",
      height: 22,
      teaches: "ride:ghost",
      lesson: "Slack threads let their stones fade. The thread trembles before it goes.",
      start: { x: 0, y: 0.45 },
      door: { x: -3.3, y: 20 },
      platforms: [
        stone(0, 0, 4),
        slack(-3.5, 4.5, 2.8, 8, 0),
        slack(3, 8, 2.8, 8, 2.2),
        slack(2.5, 15.5, 2.8, 8, 4.4),
        stone(-3, 19, 3),
      ],
      pumpkins: [pumpkin(0.4, 6.4, 3, 1), pumpkin(0, 10.8, 3, 1), pumpkin(-0.6, 17.2, 3, 1)],
      objects: [web(-2.2, 12), spider(0.2, 14, 1.4, 3)],
    },
    {
      id: 11,
      name: "Bowling",
      height: 16,
      teaches: "roll",
      lesson: "A loose pumpkin rolls when you hit it. Roll it into the others, or off an edge.",
      start: { x: -4.5, y: 0.45 },
      door: { x: 3.5, y: 10 },
      platforms: [ground, stone(-3, 4, 3.5), stone(3.5, 9, 3)],
      pumpkins: [roller(-2.5, 4), sleeper(1.2, 0), pumpkin(3, 7.6, 3, 1)],
      objects: [],
    },
    {
      id: 12,
      name: "The Cellar",
      height: 24,
      teaches: "web",
      lesson: "The door is at the bottom. Fall carefully: webs and stones break the drop.",
      start: { x: -4, y: 22.45 },
      door: { x: 4.4, y: 1 },
      platforms: [ground, stone(-4, 22, 3), frayed(2.5, 18.5, 2.6, 0.4), swing(0.5, 9.5, 2.6, 3, 5)],
      pumpkins: [pumpkin(2.5, 15.2, 1.4, 0.8), pumpkin(-1.2, 12.4, 3, 1), pumpkin(-0.5, 4.4, 3, 1)],
      objects: [web(-3.2, 14.2), spider(-3, 7, 1.2, 3), spider(3.5, 5.5, 1.2, 2.6)],
    },
    {
      id: 13,
      name: "The Family Cauldrons",
      height: 26,
      teaches: "cannon",
      lesson: "Drop into a cauldron and it throws you. Pumpkins hang along the throw.",
      start: { x: -4.5, y: 0.45 },
      door: { x: 2.3, y: 23 },
      platforms: [ground, stone(1.5, 9.5, 3.4), slack(-3.5, 15.5, 2.8, 8, 0), stone(2, 22, 3.4)],
      pumpkins: [pumpkin(-1.4, 6, 2.5, 0.8), pumpkin(1.4, 14.5, 2.5, 0.8), pumpkin(-0.8, 19.2, 2.5, 0.8)],
      objects: [cauldron(-1.5, 0, 0.4, 15), cauldron(4, 9.5, -6.5, 14)],
    },
    {
      id: 14,
      name: "The Weaver",
      height: 22,
      rules: { door: "boss", stars: "pumpkins" },
      teaches: "boss-down",
      lesson: "Strike the Weaver three times, fast or dashing. Its silk bombs kill.",
      start: { x: 0, y: 0.45 },
      door: { x: 0, y: 1 },
      platforms: [ground, stone(-4, 5, 3), stone(4, 5, 3), stone(0, 9, 3)],
      pumpkins: [pumpkin(-2.2, 7.4, 3, 1), pumpkin(2.2, 7.4, 3, 1), pumpkin(0, 15.6, 3, 1)],
      objects: [web(-4.2, 12.5), web(4.2, 12.5)],
      boss: { x: 0, y: 11.5, hp: 3, r: 0.9, sway: 3, period: 6, bombEvery: 2.6, rise: 2 },
    },
  ];
  const chapterOf = (id) => (id <= 4 ? 0 : id <= 10 ? 1 : 2);
  for (const s of stages) {
    s.rules = s.rules || ALWAYS;
    s.chapter = chapterOf(s.id);
    s.par = 99;
  }
  function get(id) {
    const stage = stages.find((s) => s.id === id);
    if (!stage) throw new RangeError("No stage " + id);
    const routes = globalThis.HNOriginalRoutes || {};
    return { ...stage, route: routes[id] || [] };
  }
  return { get, count: stages.length, all: stages, chapterOf };
});
