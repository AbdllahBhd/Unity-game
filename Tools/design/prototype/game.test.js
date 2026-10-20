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

/* ---------- Night 6: the bride of Anzar (water, well buckets, frogs, the flood) ---------- */
const spring = (extra = {}) => tale({ door: { x: -5, y: 15 }, start: { x: -4.8, y: 0.45 }, ...extra });
// A pool 4 deep over the ground, clear of the start at x = -4.8.
const deep = { x: 0, y: 0, w: 12, h: 0.4 };
const pool = (extra = {}) => ({ type: "water", x: 1, y: 0, w: 10, level: 4, ...extra });
const dropIn = (g, x = 0, y = 7, vy = -8) => Object.assign(g.hero, { x, y, vx: 0, vy, state: "flying" });
test("at rest means resting or floating", () => {
  const { atRest } = require("./game.js");
  assert.equal(atRest("resting"), true);
  assert.equal(atRest("float"), true);
  assert.equal(atRest("flying"), false);
});
test("falling into water slows him down and he floats at the surface", () => {
  const g = spring({ platforms: [deep], objects: [pool()] });
  dropIn(g);
  let low = Infinity;
  for (let i = 0; i < 360; i++) {
    g.step(1 / 120);
    low = Math.min(low, g.hero.y);
  }
  assert.equal(g.hero.state, "float");
  assert.ok(g.hero.y > 3.55 && g.hero.y < 4.1, `y ${g.hero.y}`);
  assert.ok(low > 1, `sank to ${low}`);
  assert.ok(g.events.some((e) => e.type === "splash"));
  assert.ok(g.events.some((e) => e.type === "float"));
});
test("he launches from the water and is not caught again at once", () => {
  const g = spring({ platforms: [deep], objects: [pool()] });
  dropIn(g);
  advance(g, 3);
  assert.equal(g.hero.state, "float");
  assert.equal(g.launch(0, 10), true);
  advance(g, 0.3);
  assert.equal(g.hero.state, "flying");
  assert.ok(g.hero.y > 5.5, `y ${g.hero.y}`);
});
test("a rising basin carries a floating hero up with it", () => {
  const g = spring({ platforms: [deep], objects: [pool({ rise: { dy: 3, period: 8 } })] });
  dropIn(g, 0, 5, -2);
  advance(g, 4);
  const surface = g.objects[0].surface;
  assert.ok(surface > 6.9, `surface ${surface}`);
  assert.equal(g.hero.state, "float");
  assert.ok(Math.abs(g.hero.y - surface) < 0.45, `hero ${g.hero.y} surface ${surface}`);
});
test("a basin rising under a ledge holds him floating beneath it, and he can still launch", () => {
  const ledge = { x: 0, y: 7, w: 4, h: 0.5 };
  const g = spring({ platforms: [deep, ledge], objects: [pool({ rise: { dy: 4, period: 8 } })] });
  dropIn(g, 0, 5, -2);
  let floated = false;
  for (let i = 0; i < 480; i++) {
    g.step(1 / 120);
    floated = floated || g.hero.state === "float";
    assert.ok(g.hero.y + 0.45 <= ledge.y - ledge.h + 0.05, `inside the ledge at tick ${i}: ${g.hero.y}`);
  }
  assert.ok(floated, "never floated");
  assert.equal(g.hero.state, "float");
  assert.ok(Math.abs(g.hero.y - (ledge.y - ledge.h - 0.45)) < 0.02, `not held under the ledge: ${g.hero.y}`);
  assert.equal(g.launch(6, 2), true);
});
test("water falling below a ledge sets him down on it", () => {
  const ledge = { x: 0, y: 4.5, w: 4, h: 0.5 };
  const g = spring({ platforms: [deep, ledge], objects: [pool({ level: 6, rise: { dy: -3, period: 8 } })] });
  dropIn(g, 0, 7, -1);
  advance(g, 1.25);
  assert.equal(g.hero.state, "float");
  advance(g, 2.75);
  assert.equal(g.hero.state, "resting");
  assert.equal(g.support, g.platforms[1]);
  assert.ok(Math.abs(g.hero.y - 4.95) < 0.02, `y ${g.hero.y}`);
});
test("water rising over a resting hero lifts him off", () => {
  const g = spring({ platforms: [deep], objects: [pool({ level: 0, rise: { dy: 4, period: 8 } })] });
  Object.assign(g.hero, { x: 0, y: 0.45, vx: 0, vy: 0, state: "resting" });
  g.support = g.platforms[0];
  advance(g, 4);
  assert.equal(g.hero.state, "float");
  assert.ok(g.hero.y > 3, `y ${g.hero.y}`);
});
test("floating is never a respawn point, and a death ends it", () => {
  const g = spring({ platforms: [deep], objects: [pool()] });
  dropIn(g);
  advance(g, 3);
  assert.equal(g.hero.state, "float");
  assert.deepEqual({ x: g.respawn.x, y: g.respawn.y }, { x: -4.8, y: 0.45 });
  g.die();
  assert.equal(g.hero.state, "resting");
  assert.equal(g.hero.x, -4.8);
});
// Two buckets on one rope: the first sits `s` of the way down from its top.
const well = (s = 0, order = 1) => {
  const pair = [
    { type: "bucket", rope: "w", x: -2, y: 0, w: 1.4, h: 0.4, top: 6, bottom: 1, s },
    { type: "bucket", rope: "w", x: 2, y: 0, w: 1.4, h: 0.4, top: 6, bottom: 1 },
  ];
  return order > 0 ? pair : pair.reverse();
};
const pit = { x: 0, y: -3, w: 12, h: 0.4 };
const bucketA = (g) => g.platforms.find((p) => p.type === "bucket" && p.x < 0);
const bucketB = (g) => g.platforms.find((p) => p.type === "bucket" && p.x > 0);
const stone = (x, y, extra = {}) => ({ x, y, w: 1, h: 0.4, type: "drop", knock: true, delay: 99, falling: true, vy: 0, ...extra });
test("buckets start where the rope puts them, and an empty pair stays put", () => {
  const g = spring({ platforms: [pit, ...well(0)] });
  assert.equal(bucketA(g).y, 6);
  assert.equal(bucketB(g).y, 1);
  advance(g, 2);
  assert.equal(bucketA(g).y, 6);
  assert.equal(bucketB(g).y, 1);
});
test("buckets on one rope must travel the same distance", () => {
  const bad = well(0);
  bad[1].bottom = 2;
  assert.throws(() => spring({ platforms: [pit, ...bad] }), /rope/);
});
test("his weight takes his bucket down to its end and the other up; never a respawn point", () => {
  const g = spring({ platforms: [pit, ...well(0)] });
  dropIn(g, -2, 6.8, -1);
  advance(g, 3.5);
  assert.equal(g.support, bucketA(g));
  assert.equal(g.hero.state, "resting");
  assert.ok(Math.abs(bucketA(g).y - 1) < 1e-9, `A ${bucketA(g).y}`);
  assert.ok(Math.abs(bucketB(g).y - 6) < 1e-9, `B ${bucketB(g).y}`);
  assert.ok(Math.abs(g.hero.y - 1.45) < 0.02, `hero ${g.hero.y}`);
  assert.deepEqual({ x: g.respawn.x, y: g.respawn.y }, { x: -4.8, y: 0.45 });
  assert.ok(g.events.some((e) => e.type === "bucket"));
});
test("the rope moves the same whatever the order of the platforms", () => {
  const run = (order) => {
    const g = spring({ platforms: [pit, ...well(0, order)] });
    dropIn(g, -2, 6.8, -1);
    advance(g, 1.5);
    return { a: bucketA(g).y, b: bucketB(g).y, hero: g.hero.y, state: g.hero.state };
  };
  const one = run(1),
    two = run(-1);
  assert.deepEqual(one, two);
  assert.ok(one.a > 1.5 && one.a < 5.5, `bucket not on its way down: ${one.a}`);
  assert.ok(Math.abs(one.hero - (one.a + 0.45)) < 0.02, `hero ${one.hero} bucket ${one.a}`);
});
test("a stone outweighs him, and a stone resting in a bucket rides it", () => {
  const g = spring({ platforms: [pit, ...well(0), stone(-2, 6.6)] });
  advance(g, 3.5);
  const s = g.platforms[3];
  assert.ok(Math.abs(bucketA(g).y - 1) < 1e-9, `A ${bucketA(g).y}`);
  assert.equal(s.falling, false);
  assert.ok(Math.abs(s.y - (bucketA(g).y + 0.4)) < 0.02, `stone ${s.y}`);
  // He now lands in the raised bucket: the stone still wins.
  dropIn(g, 2, 6.8, -1);
  advance(g, 2);
  assert.equal(g.support, bucketB(g));
  assert.ok(Math.abs(bucketB(g).y - 6) < 1e-9, `B ${bucketB(g).y}`);
});
test("a stone landing hard in one bucket flings him out of the other", () => {
  const g = spring({ platforms: [pit, ...well(0), stone(-2, 12, { falling: false, trigger: "nope" })] });
  dropIn(g, 2, 1.8, -1);
  advance(g, 1);
  assert.equal(g.support, bucketB(g));
  Object.assign(g.platforms[3], { falling: true, vy: 0 });
  let jerked = false,
    high = 0;
  for (let i = 0; i < 240; i++) {
    g.step(1 / 120);
    if (g.events.some((e) => e.type === "jerk")) jerked = true;
    high = Math.max(high, g.hero.y);
  }
  assert.ok(jerked, "no jerk");
  assert.ok(high > 8, `only reached ${high}`);
});
test("the rope jams rather than carry him into a ledge", () => {
  const ledge = { x: 3.8, y: 5, w: 2, h: 0.4 };
  const g = spring({ platforms: [pit, ...well(0), stone(-2, 6.6), ledge] });
  dropIn(g, 2.6, 1.8, -1);
  for (let i = 0; i < 480; i++) {
    g.step(1 / 120);
    const h = g.hero;
    const inside = h.x + 0.45 > ledge.x - ledge.w / 2 + 0.05 && h.y + 0.45 > ledge.y - ledge.h + 0.05 && h.y - 0.45 < ledge.y - 0.05;
    assert.equal(inside, false, `inside the ledge at tick ${i}: ${h.x}, ${h.y}`);
  }
  assert.equal(g.hero.state, "resting");
  assert.equal(g.support, bucketB(g));
  assert.ok(bucketB(g).y > 3 && bucketB(g).y < 3.75, `B ${bucketB(g).y}`);
});
test("a death puts the rope back where it started", () => {
  const g = spring({ platforms: [pit, ...well(0)] });
  dropIn(g, -2, 6.8, -1);
  advance(g, 3.5);
  g.die();
  advance(g, 0.1);
  assert.equal(bucketA(g).y, 6);
  assert.equal(bucketB(g).y, 1);
});
// A frog crouches on its stone and leaps at him once it has noticed him.
const frog = (x, surface, extra = {}) => ({ x, y: surface + 0.4, range: 3, speed: 1, walk: 0.5, leap: { height: 2, every: 2 }, ...extra });
test("a frog leaps only once it is hunting", () => {
  const g = spring({ platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }], pumpkins: [frog(4, 0)] });
  let high = 0;
  for (let i = 0; i < 240; i++) {
    g.step(1 / 120);
    high = Math.max(high, g.pumpkins[0].y);
  }
  assert.ok(high < 0.41, `leapt while asleep: ${high}`);
  Object.assign(g.hero, { x: 1.5, y: 0.45, state: "resting" });
  for (let i = 0; i < 240; i++) {
    g.step(1 / 120);
    high = Math.max(high, g.pumpkins[0].y);
  }
  assert.ok(high > 1.9, `never leapt: ${high}`);
});
test("a leaping frog kills a hero who is not moving, and a death sends it home", () => {
  const g = spring({ platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }], pumpkins: [frog(2, 0, { walk: 0 })] });
  Object.assign(g.hero, { x: 2, y: 2.4, vx: 0, vy: 0, state: "resting" });
  advance(g, 2);
  assert.equal(g.deaths, 1);
  assert.equal(g.pumpkins[0].y, 0.4);
  assert.equal(g.pumpkins[0].leapClock || 0, 0);
});
// The cistern: a cracked wall that floods the water it is linked to.
const cistern = { x: 1, y: 1.5, w: 1, h: 1.5, type: "drop", knock: true, delay: 99, flood: "f" };
const basin = { type: "water", id: "f", x: 3.5, y: 0, w: 5, level: 0, to: 3 };
const teryelAt = (x, extra = {}) => ({ type: "teryel", x, y: 1.2, r: 1.2, ...extra });
test("breaking the cistern floods its water and the flood traps Teryel", () => {
  const g = spring({ platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }, { ...cistern }], objects: [{ ...basin }, teryelAt(4.5)] });
  Object.assign(g.hero, { x: -1, y: 0.8, vx: 8, vy: 0, state: "flying" });
  advance(g, 2.5);
  assert.ok(g.events.some((e) => e.type === "flood"));
  assert.ok(g.objects[0].surface > 2.9, `surface ${g.objects[0].surface}`);
  assert.equal(g.objects[1].trapped, true);
  assert.equal(g.doorOpen(), true);
});
test("after a death the cistern stays broken and the flood stays up", () => {
  const g = spring({ platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }, { ...cistern }], objects: [{ ...basin }, teryelAt(-3)] });
  Object.assign(g.hero, { x: -1, y: 0.8, vx: 8, vy: 0, state: "flying" });
  advance(g, 2.5);
  g.die();
  advance(g, 0.5);
  assert.equal(g.platforms[1].alive, false);
  assert.ok(g.objects[0].surface > 2.9, `surface ${g.objects[0].surface}`);
});
test("a Teryel who walks into deep water later is trapped", () => {
  const g = spring({ objects: [{ type: "water", x: 3.5, y: 0, w: 5, level: 3 }, teryelAt(-2, { dx: 3.6, period: 6 })] });
  Object.assign(g.hero, { x: -5, y: 8, state: "resting" });
  advance(g, 0.8);
  assert.notEqual(g.objects[1].trapped, true);
  advance(g, 1.7);
  assert.equal(g.objects[1].trapped, true);
});
test("a stone tied to the well rope slips once he rests in a bucket, and throws him out of the other", () => {
  // The left bucket waits at the bottom; the tied stone hangs high over the raised right one.
  const g = spring({ platforms: [pit, ...well(1), stone(2, 9.4, { falling: false, tied: "w", delay: 0.5 })] });
  advance(g, 0.5);
  assert.equal(g.platforms[3].falling, false, "fell before he rested");
  dropIn(g, -2, 1.8, -1);
  let high = 0;
  for (let i = 0; i < 360; i++) {
    g.step(1 / 120);
    high = Math.max(high, g.hero.y);
  }
  assert.ok(g.events.some((e) => e.type === "snap"));
  assert.ok(g.events.some((e) => e.type === "jerk" && e.flung));
  assert.ok(high > 8, `only reached ${high}`);
  g.die();
  assert.equal(g.platforms[3].falling, false);
  assert.ok(Math.abs(g.platforms[3].y - 9.4) < 1e-9);
});
test("a hero resting in water with nothing under him floats", () => {
  const g = spring({ start: { x: 0, y: 3.8 }, platforms: [deep], objects: [pool()] });
  advance(g, 0.1);
  assert.equal(g.hero.state, "float");
});
test("a flood rising under a ledge never pins him out of reach of a launch", () => {
  // Stage 24's terrace over the dry bed: he waits on the bed beneath its edge as the flood comes.
  const terrace = { x: -2.4, y: 4, w: 2.4, h: 0.5 };
  const g = spring({ platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }, terrace], objects: [{ type: "water", id: "f", x: 2.5, y: 0, w: 7, level: 0 }] });
  Object.assign(g.hero, { x: -0.85, y: 0.45, state: "resting" });
  g.support = g.platforms[0];
  Object.assign(g.objects[0], { flooded: true, floodT: 0, floodFrom: 0, to: 3.4 });
  advance(g, 5);
  const floats = g.events.filter((e) => e.type === "float").length;
  assert.equal(g.hero.state, "float");
  assert.ok(floats <= 2, `float announced ${floats} times`);
  assert.equal(g.launch(-6, 4), true);
});
test("every frog leap is announced", () => {
  const g = spring({ platforms: [{ x: 0, y: 0, w: 12, h: 0.4 }], pumpkins: [frog(4, 0, 0, 1.6, 1.5)] });
  Object.assign(g.hero, { x: 2.5, y: 2.5, state: "resting" });
  advance(g, 6);
  assert.equal(g.deaths, 0);
  const leaps = g.events.filter((e) => e.type === "leap").length;
  assert.ok(leaps >= 3, `only ${leaps} leap events`);
});
test("a stone falling onto a bucket rising fast lands in it instead of passing through", () => {
  // The right bucket jerks up past a stone that is already falling toward it.
  const g = spring({ platforms: [pit, ...well(0), stone(2, 10.3), stone(-2, 12)] });
  advance(g, 2);
  const s = g.platforms[3];
  assert.equal(s.restOn, bucketB(g));
  assert.ok(Math.abs(s.y - (bucketB(g).y + 0.4)) < 0.02, `stone ${s.y} bucket ${bucketB(g).y}`);
});
