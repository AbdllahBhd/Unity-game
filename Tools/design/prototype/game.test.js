"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { Game, launchVelocity, trajectory, stars } = require("./game.js");
const level = (extra = {}) => ({
  id: 1,
  start: { x: 0, y: 0.45 },
  height: 18,
  par: 3,
  platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }],
  pumpkins: [],
  objects: [],
  door: { x: 5, y: 1 },
  ...extra,
});
function advance(g, t) {
  for (let i = 0; i < Math.round(t * 120); i++) g.step(1 / 120);
}
test("drag launch prediction agrees with unimpeded flight", () => {
  const v = launchVelocity(1, 3);
  const g = new Game(level());
  g.launch(v.x, v.y);
  advance(g, 0.25);
  const p = trajectory({ x: 0, y: 0.45 }, v, 0.25);
  assert.ok(Math.abs(g.hero.x - p.x) < 1e-8);
  assert.ok(Math.abs(g.hero.y - p.y) < 1e-8);
});
test("dash can be used once per launch", () => {
  const g = new Game(level());
  g.launch(3, 9);
  assert.equal(g.dash(), true);
  assert.equal(g.dash(), false);
  advance(g, 0.5);
  assert.equal(g.dash(), false);
});
test("slow pumpkin contact kills and respawns without camping", () => {
  const g = new Game(level({ pumpkins: [{ x: 0, y: 0.5 }] }));
  g.step(0.01);
  assert.equal(g.deaths, 1);
  advance(g, 1);
  assert.equal(g.deaths, 1);
  assert.equal(g.hero.state, "resting");
});
test("fast impact smashes pumpkin and opens sealed door", () => {
  const g = new Game(level({ pumpkins: [{ x: 1, y: 0.7, speed: 0 }] }));
  g.launch(10, 3);
  advance(g, 0.15);
  assert.equal(g.pumpkins[0].alive, false);
  assert.equal(g.snapshot().sealed, false);
});
test("door refuses a hero while hunters remain", () => {
  const g = new Game(
    level({ door: { x: 0, y: 1 }, pumpkins: [{ x: 4, y: 4, speed: 0 }] }),
  );
  g.step(0.01);
  assert.equal(g.won, false);
});
test("stars have independent completion death and par goals", () => {
  assert.equal(stars(true, 0, 2, 3), 3);
  assert.equal(stars(true, 1, 2, 3), 2);
  assert.equal(stars(true, 0, 4, 3), 2);
  assert.equal(stars(false, 0, 1, 3), 0);
});
test("landing becomes stable and permits another launch", () => {
  const g = new Game(level());
  g.launch(1, 4);
  advance(g, 1);
  assert.equal(g.hero.state, "resting");
  assert.equal(g.launch(2, 5), true);
  assert.equal(g.launches, 2);
});
test("platform side stops horizontal movement", () => {
  const g = new Game(
    level({ start: { x: -2, y: 1 }, platforms: [{ x: 0, y: 3, w: 1, h: 3 }] }),
  );
  g.launch(16, 0);
  advance(g, 0.15);
  assert.ok(g.hero.x < -0.9);
});
test("light lure draws pumpkins while aiming under continuous pursuit", () => {
  const g = new Game(level({ mechanic: true, pumpkins: [{ x: 2, y: 3 }] }), {
    direction: "light",
    pursuit: "continuous",
  });
  g.activate();
  assert.ok(g.lure);
  const x = g.pumpkins[0].x;
  advance(g, 0.2);
  assert.ok(g.pumpkins[0].x < x);
});
test("restart clears death score and ephemeral mechanics", () => {
  const g = new Game(level({ mechanic: true }));
  g.activate();
  g.launch(4, 8);
  g.dash();
  g.restart();
  assert.equal(g.launches, 0);
  assert.equal(g.lure, null);
  assert.equal(g.hero.state, "resting");
});
test("mover uses authored dx dy and period and carries resting hero", () => {
  const g = new Game(
    level({
      start: { x: 0, y: 2.45 },
      platforms: [
        { type: "mover", x: 0, y: 2, w: 3, h: 0.4, dx: 2, dy: 1, period: 4 },
      ],
    }),
  );
  g.launch(0, 1);
  advance(g, 0.4);
  assert.equal(g.hero.state, "resting");
  const x = g.hero.x;
  advance(g, 0.2);
  assert.ok(g.hero.x > x);
  assert.ok(g.platforms[0].y > 2);
});
test("wind uses authored horizontal acceleration", () => {
  const g = new Game(
    level({
      objects: [{ type: "wind", x: 0, y: 3, w: 4, h: 6, ax: -12, ay: 0 }],
    }),
  );
  g.launch(0, 10);
  advance(g, 0.2);
  assert.ok(g.hero.vx < -2);
});
test("bat patrol follows authored displacement", () => {
  const g = new Game(
    level({ objects: [{ type: "bat", x: 3, y: 5, dx: 2, dy: 0, period: 4 }] }),
  );
  advance(g, 1);
  assert.ok(g.objects[0].x > 4.9);
});
test("shadow door requires echo switches even when pumpkin seal is clear", () => {
  const g = new Game(
    level({
      mechanic: true,
      door: { x: 0, y: 1 },
      switches: [{ x: 3, y: 3, r: 1 }],
      gate: { x: 3, y: 1, w: 1, h: 2 },
    }),
    { direction: "shadow" },
  );
  g.step(0.01);
  assert.equal(g.won, false);
});
test("lantern remains sealed while any pumpkin survives", () => {
  const g = new Game(
    level({
      boss: { x: 0, y: 2, hp: 1 },
      pumpkins: [{ x: 5, y: 5, speed: 0 }],
    }),
  );
  g.lantern = { x: 0, y: 0.45 };
  g.boss.hp = 0;
  g.step(0.01);
  assert.equal(g.won, false);
});
for (const perch of [
  { type: "mover", dx: 0, dy: 0, period: 4 },
  { type: "ghost", phase: 0 },
])
  test(`death after landing on ${perch.type} returns to the last permanent checkpoint`, () => {
    const g = new Game(
      level({
        start: { x: -3, y: 0.45 },
        platforms: [
          { x: 0, y: 0, w: 12, h: 0.4 },
          { ...perch, x: 0, y: 2, w: 3, h: 0.4 },
        ],
      }),
    );
    g.launch(3, 10);
    advance(g, 1.6);
    assert.equal(g.hero.state, "resting");
    assert.ok(g.hero.y > 2);
    g.die();
    assert.equal(g.hero.y, 0.45);
    assert.equal(g.hero.x, -3);
  });
function gateLanding() {
  const g = new Game(
    level({
      start: { x: 0, y: 3.85 },
      mechanic: true,
      platforms: [{ x: 0, y: 3.4, w: 1, h: 0.4 }],
      gate: { x: 2, y: 2, w: 2, h: 2 },
      switches: [{ x: 1.5, y: 3.5, r: 2 }],
    }),
    { direction: "shadow" },
  );
  g.launch(3, 2);
  advance(g, 1);
  assert.equal(g.hero.state, "resting");
  assert.equal(g.hero.y, 3.45);
  return g;
}
test("an echo opening its supporting gate makes Izan fall", () => {
  const g = gateLanding();
  assert.equal(g.activate(), true);
  advance(g, 0.3);
  assert.equal(g.switches[0].active, true);
  assert.equal(g.hero.state, "flying");
  assert.ok(g.hero.y < 3.45);
});
test("landing on a temporary shadow gate does not replace the checkpoint", () => {
  const g = gateLanding();
  g.die();
  assert.equal(g.hero.x, 0);
  assert.equal(g.hero.y, 3.85);
});

// Rules for the original-art prototype (Tools/design/original), enabled per level.
const original = (extra = {}) =>
  level({ rules: { door: "always", stars: "pumpkins" }, ...extra });
test("an always-open door completes the stage while pumpkins survive", () => {
  const g = new Game(
    original({ door: { x: 0, y: 1 }, pumpkins: [{ x: 4, y: 6, speed: 0 }] }),
  );
  g.step(0.01);
  assert.equal(g.won, true);
  assert.equal(g.snapshot().sealed, false);
});
test("pumpkin stars count every smashed pumpkin, independent of deaths", () => {
  const g = new Game(
    original({
      door: { x: 3, y: 1 },
      pumpkins: [
        { x: 1, y: 0.7, speed: 0 },
        { x: -4, y: 6, speed: 0 },
      ],
    }),
  );
  assert.equal(g.snapshot().stars, 0);
  g.launch(10, 3);
  advance(g, 0.15);
  assert.equal(g.pumpkins[0].alive, false);
  assert.equal(g.snapshot().stars, 1);
  advance(g, 2);
  assert.equal(g.won, true);
  assert.equal(g.events.find((e) => e.type === "win").stars, 1);
});
test("a web catches Izan, lets him launch again, then tears", () => {
  const g = new Game(
    original({ objects: [{ type: "web", x: 0, y: 4, r: 0.8 }] }),
  );
  g.launch(0, 12);
  advance(g, 0.4);
  assert.equal(g.hero.state, "resting");
  assert.equal(g.hero.vy, 0);
  const held = g.hero.y;
  advance(g, 0.5);
  assert.equal(g.hero.y, held);
  assert.equal(g.launch(6, 6), true);
  assert.equal(g.objects[0].alive, false);
  assert.deepEqual(g.respawn, { x: 0, y: 0.45 });
});
test("a frayed stone falls after its delay and crushes the pumpkin below", () => {
  const g = new Game(
    original({
      start: { x: 0, y: 4.45 },
      platforms: [
        { x: 0, y: 0, w: 12, h: 0.4 },
        { x: 0, y: 4, w: 2, h: 0.4, type: "drop", delay: 0.3 },
      ],
      pumpkins: [{ x: 0, y: 2, speed: 0, range: 0 }],
    }),
  );
  g.support = g.platforms[1];
  advance(g, 0.2);
  assert.equal(g.platforms[1].y, 4);
  advance(g, 1);
  assert.equal(g.pumpkins[0].alive, false);
  assert.ok(g.platforms[1].y < 1);
  assert.equal(g.deaths, 0);
});
test("death restores fallen stones and torn webs", () => {
  const g = new Game(
    original({
      platforms: [
        { x: 0, y: 0, w: 12, h: 0.4 },
        { x: 3, y: 4, w: 2, h: 0.4, type: "drop", delay: 0 },
      ],
      objects: [{ type: "web", x: -3, y: 4, r: 0.8 }],
    }),
  );
  g.platforms[1].falling = true;
  g.objects[0].alive = false;
  g.die();
  assert.equal(g.platforms[1].falling, false);
  assert.equal(g.platforms[1].y, 4);
  assert.equal(g.objects[0].alive, true);
});
test("a boss door stays shut until the boss falls", () => {
  const g = new Game(
    original({
      rules: { door: "boss", stars: "pumpkins" },
      door: { x: 0, y: 1 },
      boss: { x: 4, y: 12, hp: 1 },
    }),
  );
  g.step(0.01);
  assert.equal(g.won, false);
  g.boss.hp = 0;
  g.step(0.01);
  assert.equal(g.won, true);
});
test("aim pursuit freezes hunters only while aiming", () => {
  const g = new Game(level({ pumpkins: [{ x: 2.5, y: 0.6, speed: 1 }] }), {
    pursuit: "aim",
  });
  g.setAim(true);
  advance(g, 0.5);
  assert.equal(g.pumpkins[0].x, 2.5);
  g.setAim(false);
  advance(g, 0.5);
  assert.ok(g.pumpkins[0].x < 2.1);
});
test("a hanging spider bites a slow rabbit and breaks under a dash", () => {
  const bitten = new Game(
    original({ objects: [{ type: "spider", x: 0, y: 0.6, r: 0.4 }] }),
  );
  bitten.step(1 / 120);
  assert.equal(bitten.deaths, 1);
  const g = new Game(
    original({ objects: [{ type: "spider", x: 0, y: 3, r: 0.4 }] }),
  );
  g.launch(0, 12);
  g.dash();
  advance(g, 0.3);
  assert.equal(g.objects[0].alive, false);
  assert.equal(g.deaths, 0);
});
test("the boss drops silk bombs that kill on contact", () => {
  const g = new Game(
    original({
      rules: { door: "boss", stars: "pumpkins" },
      boss: { x: 0, y: 6, hp: 3, bombEvery: 0.5 },
    }),
  );
  advance(g, 2);
  assert.ok(g.deaths >= 1);
});
test("a frayed stone landing on nest posts crushes the pumpkin inside", () => {
  const g = new Game(
    original({
      start: { x: 0, y: 4.45 },
      platforms: [
        { x: 0, y: 0, w: 12, h: 0.4 },
        { x: -0.65, y: 1.2, w: 0.5, h: 1.2, type: "post" },
        { x: 0.65, y: 1.2, w: 0.5, h: 1.2, type: "post" },
        { x: 0, y: 4, w: 2.4, h: 0.5, type: "drop", delay: 0.1 },
      ],
      pumpkins: [{ x: 0, y: 0.55, speed: 0, range: 0 }],
    }),
  );
  g.support = g.platforms[3];
  advance(g, 1.5);
  assert.equal(g.platforms[3].y, 1.7);
  assert.equal(g.pumpkins[0].alive, false);
});
test("a landed stone falls again when the swing under it moves away", () => {
  const g = new Game(
    original({
      start: { x: 0, y: 4.15 },
      platforms: [
        { x: 0, y: -2, w: 12, h: 0.4 },
        { x: 0, y: 3, w: 2.4, h: 0.5, type: "mover", dx: 4, dy: 0, period: 4 },
        { x: 0, y: 3.7, w: 2, h: 0.5, type: "drop", delay: 0 },
      ],
    }),
  );
  g.support = g.platforms[2];
  advance(g, 0.3);
  assert.equal(g.platforms[2].landed, true);
  assert.equal(g.platforms[2].restOn.type, "mover");
  advance(g, 2);
  assert.ok(g.platforms[2].y < 0, `stone hangs at ${g.platforms[2].y}`);
});
test("a snapping stone does not crush a pumpkin beside or above it", () => {
  const g = new Game(
    original({
      start: { x: 0, y: 4.45 },
      platforms: [
        { x: 0, y: 0, w: 12, h: 0.4 },
        { x: 0, y: 4, w: 2.4, h: 0.5, type: "drop", delay: 0 },
      ],
      pumpkins: [{ x: 1.4, y: 4.4, speed: 0, range: 0 }],
    }),
  );
  g.support = g.platforms[1];
  advance(g, 0.05);
  assert.equal(g.pumpkins[0].alive, true);
});

// Round 2: lively hunters and new tricks for the original-art prototype.
const lively = (extra = {}, options = {}) =>
  new Game(original(extra), { pursuit: "aim", hunters: "lively", ...options });
test("a lively pumpkin notices first, then accelerates, then goes home", () => {
  const g = lively({
    start: { x: 0, y: 0.45 },
    pumpkins: [{ x: 3, y: 3, range: 4, speed: 1.2 }],
  });
  advance(g, 0.2);
  assert.equal(g.pumpkins[0].state, "notice");
  assert.equal(g.pumpkins[0].x, 3);
  advance(g, 0.4);
  assert.equal(g.pumpkins[0].state, "hunt");
  const d1 = Math.hypot(g.pumpkins[0].x, g.pumpkins[0].y - 0.45);
  advance(g, 0.3);
  const d2 = Math.hypot(g.pumpkins[0].x, g.pumpkins[0].y - 0.45);
  assert.ok(d2 < d1 - 0.3, `still far: ${d1} -> ${d2}`);
  g.hero.x = 5.5;
  g.hero.y = 20;
  advance(g, 6);
  assert.equal(g.pumpkins[0].state, "idle");
  assert.ok(Math.abs(g.pumpkins[0].x - 3) < 0.05 && Math.abs(g.pumpkins[0].y - 3) < 0.05);
});
test("lively pumpkins hold still while the player aims", () => {
  const g = lively({ pumpkins: [{ x: 2.5, y: 0.6, range: 4, speed: 1 }] });
  advance(g, 0.6);
  g.setAim(true);
  const x = g.pumpkins[0].x;
  advance(g, 0.5);
  assert.equal(g.pumpkins[0].x, x);
});
test("a trampoline web reflects Izan upward with speed kept", () => {
  const g = lively({ objects: [{ type: "trampoline", x: 3, y: 1.4, r: 0.8, nx: 0, ny: 1 }] });
  g.launch(9, 4);
  advance(g, 0.3);
  assert.ok(g.hero.vy > 6, `vy ${g.hero.vy}`);
  assert.equal(g.events.some((e) => e.type === "boing"), true);
});
test("a zip thread carries Izan along it and flings him off the low end", () => {
  const g = lively({
    objects: [{ type: "zip", x1: -2, y1: 6, x2: 4, y2: 3 }],
  });
  g.launch(0, 11.5);
  advance(g, 0.8);
  assert.equal(g.hero.state, "zip");
  advance(g, 2.5);
  assert.notEqual(g.hero.state, "zip");
  assert.ok(g.hero.x > 3.5, `x ${g.hero.x}`);
});
test("a hard landing on a seesaw flings the pumpkin on the other end", () => {
  const g = lively({
    start: { x: -3, y: 6.45 },
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: 0, y: 2, w: 4, h: 0.4, type: "seesaw" },
      { x: 0, y: 8, w: 1, h: 0.4, type: "solid" },
    ],
    pumpkins: [{ x: 1.5, y: 2.5, range: 0, speed: 0 }],
  });
  g.hero.x = -1.5;
  g.hero.y = 6;
  g.hero.state = "flying";
  advance(g, 1.2);
  const p = g.pumpkins[0];
  assert.ok(p.flung || !p.alive, "pumpkin was not flung");
  advance(g, 2);
  assert.equal(p.alive, false);
  assert.equal(g.smashed(), 1);
});
test("a rolling pumpkin bowls over another and shatters on a hard fall", () => {
  const g = lively({
    start: { x: -4, y: 0.45 },
    platforms: [
      { x: -2, y: 0, w: 8, h: 0.4 },
      { x: 5, y: -2.5, w: 2, h: 0.4 },
    ],
    pumpkins: [
      { x: -2.5, y: 0.5, roll: true },
      { x: 0.5, y: 0.5, range: 0, speed: 0 },
    ],
  });
  g.launch(9, 2);
  advance(g, 0.4);
  assert.ok(g.pumpkins[0].vx > 2, `roller vx ${g.pumpkins[0].vx}`);
  advance(g, 3);
  assert.equal(g.pumpkins[1].alive, false);
  assert.equal(g.pumpkins[0].alive, false);
  assert.equal(g.smashed(), 2);
});
test("a swinging stone crushes a pumpkin in its path", () => {
  const g = lively({
    start: { x: -5, y: 0.45 },
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: 0, y: 4, w: 2, h: 0.5, type: "mover", dx: 3, dy: 0, period: 3 },
    ],
    pumpkins: [{ x: 2.8, y: 4.3, range: 0, speed: 0 }],
  });
  advance(g, 2);
  assert.equal(g.pumpkins[0].alive, false);
});
test("ghost stones report how long they stay solid", () => {
  const g = lively({
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: 0, y: 4, w: 2, h: 0.5, type: "ghost", period: 7, offset: 0 },
    ],
  });
  g.step(0.01);
  const s = g.snapshot().platforms[1];
  assert.ok(s.solidFor > 0 && s.solidFor < 7, `solidFor ${s.solidFor}`);
});

// The tales of Mqidec: Teryel is never fought, only trapped.
const tale = (extra = {}) =>
  new Game(original({ rules: { door: "trap", stars: "pumpkins" }, ...extra }), {
    pursuit: "aim",
    hunters: "lively",
  });
test("touching Teryel is death, even dashing", () => {
  const g = tale({ objects: [{ type: "teryel", x: 0, y: 3, r: 1 }] });
  g.launch(0, 12);
  g.dash();
  advance(g, 0.3);
  assert.equal(g.deaths, 1);
  assert.equal(g.objects[0].trapped, undefined);
});
test("the trap door stays shut until Teryel is trapped", () => {
  const g = tale({ door: { x: 0, y: 1 }, objects: [{ type: "teryel", x: 4, y: 3, r: 1 }] });
  g.step(0.01);
  assert.equal(g.won, false);
  g.objects[0].trapped = true;
  g.step(0.01);
  assert.equal(g.won, true);
});
test("a rolling jar traps Teryel", () => {
  const g = tale({
    start: { x: -4, y: 0.45 },
    platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }],
    pumpkins: [{ x: -2.5, y: 0.45, roll: true, range: 0, speed: 0 }],
    objects: [{ type: "teryel", x: 2.5, y: 1.2, r: 1 }],
  });
  g.launch(9, 2);
  advance(g, 2.5);
  assert.equal(g.objects[0].trapped, true);
  assert.equal(g.events.some((e) => e.type === "trapped"), true);
});
test("a falling stone traps Teryel", () => {
  const g = tale({
    start: { x: 0, y: 4.45 },
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: 0, y: 4, w: 2.4, h: 0.5, type: "drop", delay: 0.1 },
    ],
    objects: [{ type: "teryel", x: 0, y: 1.3, r: 1 }],
  });
  g.support = g.platforms[1];
  advance(g, 0.15);
  g.launch(-8, 6);
  advance(g, 1.5);
  assert.equal(g.objects[0].trapped, true);
  assert.equal(g.deaths, 0);
});
test("a hard landing on a seesaw drops its linked gate stone", () => {
  const g = tale({
    start: { x: -1.5, y: 6 },
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: 0, y: 2, w: 4, h: 0.4, type: "seesaw", id: "gate" },
      { x: 4, y: 7, w: 1.6, h: 0.5, type: "drop", delay: 99, trigger: "gate" },
    ],
  });
  g.hero.state = "flying";
  advance(g, 1.4);
  assert.equal(g.platforms[2].falling || g.platforms[2].landed, true);
});
test("Teryel patrols along her path", () => {
  const g = tale({ objects: [{ type: "teryel", x: 0, y: 6, r: 1, dx: 3, period: 4 }] });
  advance(g, 1);
  assert.ok(Math.abs(g.objects[0].x - 3) < 0.05, `x ${g.objects[0].x}`);
});
test("an updraft lifts Izan and reports the gust once", () => {
  const g = tale({
    platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }],
    objects: [{ type: "wind", x: 0, y: 5, w: 2.4, h: 8, ax: 0, ay: 24 }],
  });
  g.launch(0, 8);
  advance(g, 0.8);
  assert.ok(g.hero.y > 5, `y ${g.hero.y}`);
  assert.equal(g.events.filter((e) => e.type === "gust").length, 1);
});
test("a rest inside Teryel's path is never kept as the respawn point", () => {
  const g = tale({
    start: { x: -5, y: 0.45 },
    platforms: [{ x: 0, y: 0, w: 12, h: 0.4, type: "ground" }],
    objects: [{ type: "teryel", x: 0, y: 1.2, r: 1.2, dx: 2, period: 8 }],
  });
  g.hero.x = 3.6;
  g.hero.y = 0.45;
  g.hero.state = "flying";
  g.hero.vy = -1;
  advance(g, 0.4);
  assert.equal(g.hero.state, "resting");
  assert.equal(g.respawn.x, -5);
});
test("after a death Teryel cannot kill again for a moment", () => {
  const g = tale({ objects: [{ type: "teryel", x: 0, y: 1.2, r: 1.2 }] });
  g.respawn = { x: 0.2, y: 0.45 };
  g.die();
  advance(g, 0.3);
  assert.equal(g.deaths, 1);
});
test("the trap jar is not a star and comes back if it breaks too early", () => {
  const g = tale({
    start: { x: -4, y: 0.45 },
    platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }],
    pumpkins: [{ x: -2.5, y: 0.45, roll: true, trap: true, range: 0, speed: 0 }],
    objects: [{ type: "teryel", x: 0, y: 9, r: 1 }],
  });
  g.launch(14, 1);
  g.dash();
  advance(g, 1.2);
  assert.equal(g.smashed(), 0);
  advance(g, 2);
  assert.equal(g.pumpkins[0].alive, true);
});
test("a gate stone dropped by its seesaw stays down after a death", () => {
  const g = tale({
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: 4, y: 7, w: 1.6, h: 0.5, type: "drop", delay: 99, trigger: "gate" },
    ],
  });
  Object.assign(g.platforms[1], { landed: true, y: 0.5 });
  g.die();
  assert.equal(g.platforms[1].y, 0.5);
});

// Night 4, the rooftops: sliding roofs and loose tile stacks.
test("landing on a sloped roof slides Izan downhill and off the end, faster", () => {
  const g = tale({
    start: { x: -5, y: 9 },
    platforms: [{ x: 0, y: -2, w: 12, h: 0.4 }, { type: "slope", x1: -4, y1: 6, x2: 2, y2: 3 }],
  });
  g.hero.x = -3;
  g.hero.y = 6.2;
  g.hero.state = "flying";
  g.hero.vy = -2;
  advance(g, 0.2);
  assert.equal(g.hero.state, "slide");
  const x0 = g.hero.x;
  advance(g, 0.3);
  assert.ok(g.hero.x > x0, "slides downhill");
  advance(g, 2);
  assert.notEqual(g.hero.state, "slide");
  assert.ok(g.events.some((e) => e.type === "slide"));
});
test("a tap while sliding hops off the roof", () => {
  const g = tale({ platforms: [{ type: "slope", x1: -4, y1: 6, x2: 2, y2: 3 }] });
  g.hero.x = -3;
  g.hero.y = 6.2;
  g.hero.state = "flying";
  g.hero.vy = -2;
  advance(g, 0.2);
  assert.equal(g.dash(), true);
  assert.equal(g.hero.state, "flying");
  assert.ok(g.hero.vy > 4, `vy ${g.hero.vy}`);
});
test("a slope does not block Izan coming from below", () => {
  const g = tale({
    start: { x: 0, y: 0.45 },
    platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }, { type: "slope", x1: -3, y1: 4, x2: 3, y2: 3 }],
  });
  g.launch(0, 12);
  advance(g, 0.5);
  assert.ok(g.hero.y > 4, `y ${g.hero.y}`);
});
test("a hard hit knocks a tile stack loose and it falls on Teryel", () => {
  const g = tale({
    start: { x: -5, y: 6.45 },
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: -5, y: 6, w: 2, h: 0.4 },
      { x: -1.5, y: 6.6, w: 1.2, h: 0.6, type: "drop", knock: true, delay: 99 },
    ],
    objects: [{ type: "teryel", x: 2.6, y: 1.2, r: 1.2 }],
  });
  g.launch(10, 2);
  advance(g, 2);
  assert.equal(g.objects[0].trapped, true);
  assert.ok(g.events.some((e) => e.type === "knock"));
});
test("a gentle touch does not knock a tile stack", () => {
  const g = tale({
    start: { x: -1.5, y: 7.65 },
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: -1.5, y: 7.2, w: 1.2, h: 0.6, type: "drop", knock: true, delay: 99 },
    ],
  });
  g.support = g.platforms[1];
  advance(g, 1);
  assert.equal(g.platforms[1].falling || false, false);
});
test("a knocked stack is pushed the way it was hit and tips off its ridge", () => {
  const g = tale({
    start: { x: -4, y: 6.45 },
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: -4, y: 6, w: 2, h: 0.4 },
      { x: 1.2, y: 6, w: 2, h: 0.4 },
      { x: 2, y: 6.6, w: 1.2, h: 0.6, type: "drop", knock: true, delay: 99 },
    ],
  });
  // Dash down onto the stack from above, moving right.
  Object.assign(g.hero, { x: 2, y: 8, vx: 2, vy: -8, state: "flying" });
  g.dashTime = 0.45;
  advance(g, 2.5);
  const stack = g.platforms[3];
  assert.ok(stack.x > 2.5, `x ${stack.x}`);
  assert.ok(stack.y < 2, `stack still on the ridge at y ${stack.y}`);
});
test("landing on a stack from above stands on it, without a dash", () => {
  const g = tale({
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: 1.2, y: 6, w: 2, h: 0.4 },
      { x: 1.2, y: 6.6, w: 1.2, h: 0.6, type: "drop", knock: true, delay: 99 },
    ],
  });
  Object.assign(g.hero, { x: 1.2, y: 8.5, vx: 0, vy: -7, state: "flying" });
  advance(g, 1);
  assert.equal(g.events.some((e) => e.type === "knock"), false);
  assert.equal(g.hero.state, "resting");
});
test("a knocked stack stops at the wall and does not skid on after a fall", () => {
  const g = tale({
    platforms: [
      { x: 0, y: 0, w: 12, h: 0.4 },
      { x: 4.5, y: 4, w: 3, h: 0.4 },
      { x: 4.8, y: 4.6, w: 1.1, h: 0.6, type: "drop", knock: true, delay: 99 },
    ],
  });
  Object.assign(g.hero, { x: 3, y: 4.7, vx: 12, vy: 0, state: "flying" });
  advance(g, 3);
  const st = g.platforms[2];
  assert.ok(Math.abs(st.x) <= 6 - st.w / 2 + 1e-9, `x ${st.x}`);
  assert.equal(st.vx || 0, 0);
});
test("a dash survives catching a roof", () => {
  const g = tale({ platforms: [{ type: "slope", x1: -4, y1: 6, x2: 2, y2: 3 }] });
  Object.assign(g.hero, { x: -3, y: 6.2, vx: 0, vy: -2, state: "flying" });
  g.dashTime = 0.4;
  advance(g, 0.1);
  assert.equal(g.hero.state, "slide");
  assert.ok(g.dashTime > 0);
});
test("a sliding hero stays inside the walls", () => {
  const g = tale({ platforms: [{ type: "slope", x1: 2, y1: 6, x2: 8, y2: 2 }] });
  Object.assign(g.hero, { x: 3, y: 5.6, vx: 0, vy: -2, state: "flying" });
  advance(g, 2);
  assert.ok(g.hero.x <= 6 - 0.45 + 1e-9, `x ${g.hero.x}`);
});

/* ---------- Night 5: the olive press (oil spills and the press wheel) ---------- */
const press = (extra = {}) => tale({ door: { x: -5, y: 15 }, ...extra });
const oilFloor = { x: 0, y: 0, w: 12, h: 0.4, oil: true };
test("a fast landing on oil keeps sliding instead of stopping", () => {
  const g = press({ platforms: [oilFloor] });
  Object.assign(g.hero, { x: -4, y: 1.5, vx: 6, vy: -3, state: "flying" });
  advance(g, 0.5);
  assert.ok(g.hero.vx > 4, `vx ${g.hero.vx}`);
  assert.equal(g.hero.state, "flying");
  assert.ok(g.events.some((e) => e.type === "oil"));
});
test("the same landing on a dry floor stops", () => {
  const g = press();
  Object.assign(g.hero, { x: -4, y: 1.5, vx: 6, vy: -3, state: "flying" });
  advance(g, 1);
  assert.equal(g.hero.state, "resting");
  assert.equal(g.events.some((e) => e.type === "oil"), false);
});
test("a gentle landing on oil still comes to rest", () => {
  const g = press({ platforms: [oilFloor] });
  Object.assign(g.hero, { x: 0, y: 1.5, vx: 0.5, vy: -3, state: "flying" });
  advance(g, 1);
  assert.equal(g.hero.state, "resting");
});
test("sliding on oil off the end of a ledge drops to the floor below", () => {
  const g = press({ platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }, { x: -2, y: 3, w: 4, h: 0.5, oil: true }] });
  Object.assign(g.hero, { x: -3.5, y: 3.6, vx: 5, vy: -1, state: "flying" });
  advance(g, 2);
  assert.ok(g.hero.y < 1, `y ${g.hero.y}`);
});
test("sliding on oil into a sleeping hunter smashes it", () => {
  const g = press({ platforms: [oilFloor], pumpkins: [{ x: 2, y: 0.55, range: 0, speed: 0 }] });
  Object.assign(g.hero, { x: -3, y: 0.9, vx: 7, vy: -1, state: "flying" });
  advance(g, 1.5);
  assert.equal(g.pumpkins[0].alive, false);
  assert.equal(g.deaths, 0);
});
// `angle` is the plank's starting place on the wheel (`phase` belongs to the bell mechanic).
const plank = (angle) => ({
  type: "wheel",
  cx: 0,
  cy: 4,
  radius: 2,
  period: 8,
  angle,
  x: Math.cos(angle) * 2,
  y: 4 + Math.sin(angle) * 2,
  w: 1.6,
  h: 0.4,
});
test("a wheel plank turns on a circle around the axle", () => {
  const g = press({ platforms: [{ x: 0, y: -3, w: 12, h: 0.4 }, plank(0)] });
  advance(g, 2);
  const p = g.platforms[1];
  assert.ok(Math.abs(p.x) < 0.05 && Math.abs(p.y - 6) < 0.05, `${p.x}, ${p.y}`);
});
test("a hero resting on a wheel plank is carried round, and it is never a respawn point", () => {
  const g = press({ platforms: [{ x: 0, y: -3, w: 12, h: 0.4 }, plank(Math.PI / 2)] });
  Object.assign(g.hero, { x: 0, y: 6.8, vx: 0, vy: 0, state: "flying" });
  advance(g, 0.6);
  assert.equal(g.hero.state, "resting");
  assert.equal(g.support.type, "wheel");
  advance(g, 1.5);
  const p = g.platforms[1];
  assert.ok(Math.abs(g.hero.x - p.x) < 0.6, `hero ${g.hero.x} plank ${p.x}`);
  assert.ok(Math.abs(g.hero.y - (p.y + 0.45)) < 0.05, `hero ${g.hero.y} plank ${p.y}`);
  assert.ok(p.x < -1, `plank ${p.x}`);
  assert.deepEqual({ x: g.respawn.x, y: g.respawn.y }, { x: 0, y: 0.45 });
});
test("a walking rat runs along its beam toward the hero and never leaves it", () => {
  const g = press({ pumpkins: [{ x: 0, y: 3.4, range: 4, speed: 1.2, walk: 1.5 }] });
  Object.assign(g.hero, { x: 3, y: 5, vx: 0, vy: 0, state: "resting" });
  advance(g, 3);
  const r = g.pumpkins[0];
  assert.equal(r.y, 3.4);
  assert.ok(r.x > 1.4 && r.x <= 1.5 + 1e-9, `x ${r.x}`);
});
/* Review of Night 5 */
test("a wheel rider is never carried through the wall: he drops off instead", () => {
  const near = { ...plank(Math.PI / 2), cx: -3.6, x: -3.6 };
  const g = press({ platforms: [{ x: 0, y: -3, w: 12, h: 0.4 }, near] });
  Object.assign(g.hero, { x: -4.3, y: 6.8, vx: 0, vy: 0, state: "flying" });
  for (let i = 0; i < 480; i++) {
    g.step(1 / 120);
    assert.ok(g.hero.x >= -6 + 0.45 - 1e-9, `x ${g.hero.x} at tick ${i}`);
  }
});
test("a wheel rider is never carried through a ledge", () => {
  const g = press({ platforms: [{ x: 0, y: -3, w: 12, h: 0.4 }, plank(Math.PI / 2), { x: -2.2, y: 6, w: 1.4, h: 0.5 }] });
  Object.assign(g.hero, { x: -0.3, y: 6.8, vx: 0, vy: 0, state: "flying" });
  const ledge = g.platforms[2];
  for (let i = 0; i < 360; i++) {
    g.step(1 / 120);
    const h = g.hero;
    const inside =
      h.x + 0.45 > ledge.x - ledge.w / 2 + 0.02 &&
      h.x - 0.45 < ledge.x + ledge.w / 2 - 0.02 &&
      h.y + 0.45 > ledge.y - ledge.h + 0.02 &&
      h.y - 0.45 < ledge.y - 0.02;
    assert.equal(inside, false, `inside the ledge at tick ${i}: ${h.x}, ${h.y}`);
  }
});
test("once the press beam has pinned Teryel it stays gone, even after a death", () => {
  const g = press({
    platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }, { x: 1, y: 5, w: 2, h: 0.5 }, { x: 1, y: 5.55, w: 2, h: 0.55, type: "drop", knock: true, delay: 99, beam: true }],
    objects: [{ type: "teryel", x: 2.4, y: 1.2, r: 1.2 }],
  });
  Object.assign(g.hero, { x: -1, y: 5.6, vx: 8, vy: 0, state: "flying" });
  advance(g, 2);
  assert.equal(g.objects[0].trapped, true);
  assert.equal(g.platforms[2].alive, false);
  g.die();
  assert.equal(g.platforms[2].alive, false);
});
test("a glide on oil smashes a sleeping rat even below the usual impact speed", () => {
  const g = press({ platforms: [oilFloor], pumpkins: [{ x: 1, y: 0.4, range: 0, speed: 0 }] });
  Object.assign(g.hero, { x: -3, y: 0.9, vx: 3, vy: -1, state: "flying" });
  advance(g, 2.5);
  assert.equal(g.pumpkins[0].alive, false);
  assert.equal(g.deaths, 0);
});
test("a rat held at the end of its beam still faces the hero", () => {
  const g = press({ pumpkins: [{ x: 0, y: 3.4, range: 4, speed: 1.2, walk: 1.5 }] });
  Object.assign(g.hero, { x: -3, y: 5, vx: 0, vy: 0, state: "resting" });
  advance(g, 3);
  assert.equal(g.pumpkins[0].face, -1);
});
