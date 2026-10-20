"use strict";
const assert = require("node:assert/strict");
const { simulateRoute } = require("./game.js");
const { get } = require("./levels.js");
let verified = 0;
for (const mode of ["baseline", "redesigned"]) {
  for (let id = 1; id <= 10; id++) {
    for (const direction of ["light", "shadow", "bell"]) {
      const level = get(mode, id, direction);
      assert.ok(
        level.route.length,
        `${mode} ${id} ${direction}: missing completion route`,
      );
      const result = simulateRoute(level, level.route, { direction });
      assert.equal(
        result.won,
        true,
        `${mode} ${id} ${direction}: replay failed to win`,
      );
      assert.equal(
        result.deaths,
        0,
        `${mode} ${id} ${direction}: replay unexpectedly died`,
      );
      assert.equal(
        result.pumpkins.filter((pumpkin) => pumpkin.alive).length,
        0,
        "A surviving hunter seals the exit",
      );
      assert.ok(
        result.switches.every((switchObject) => switchObject.active),
        "A shadow replay must open every required seal",
      );
      if (result.boss)
        assert.equal(result.boss.hp, 0, "The queen must be defeated");
      verified++;
    }
  }
}
console.log(
  `${verified}/60 stage and story selections complete through normal victory with zero deaths.`,
);
