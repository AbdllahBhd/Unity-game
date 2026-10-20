/* Browser design simulator: fixed-step circle/AABB collision, analytic ballistic
 * integration and deterministic hunters. It approximates Unity friction, trigger
 * shapes, boss flight and bounces; it is not a port of Physics2D. No randomness. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.HNGame = factory();
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";
  const GRAVITY = -14.715,
    R = 0.45,
    MAX = 16;
  // Water: the push up at full depth, and how far under the surface a floating hero sits
  // (where that push balances gravity).
  const BUOYANCY = 30,
    FLOAT = (0.5 * -GRAVITY) / BUOYANCY;
  // Resting or floating: a hero who can be aimed and launched.
  const atRest = (state) => state === "resting" || state === "float";
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function launchVelocity(dx, dy) {
    const d = Math.hypot(dx, dy),
      scale = d > 4 ? MAX / d : MAX / 4;
    return { x: dx * scale, y: dy * scale };
  }
  function trajectory(p, v, t) {
    return { x: p.x + v.x * t, y: p.y + v.y * t + (GRAVITY * t * t) / 2 };
  }
  function stars(won, deaths, launches, par) {
    return won ? 1 + (deaths === 0 ? 1 : 0) + (launches <= par ? 1 : 0) : 0;
  }
  class Game {
    constructor(level, options = {}) {
      this.level = clone(level);
      this.options = { direction: "light", pursuit: "planning", ...options };
      this.restart();
    }
    restart() {
      const l = this.level;
      this.hero = {
        x: l.start.x,
        y: l.start.y,
        vx: 0,
        vy: 0,
        r: R,
        state: "resting",
      };
      this.respawn = { ...l.start };
      this.platforms = clone(l.platforms || []).map((p) => ({
        ...p,
        homeX: p.x,
        homeY: p.y,
      }));
      this.pumpkins = clone(l.pumpkins || []).map((p) => ({
        range: 3.5,
        speed: 1.2,
        ...p,
        homeX: p.x,
        homeY: p.y,
        alive: true,
        safe: false,
        state: "idle",
        vx: 0,
        vy: 0,
        noticeTimer: 0,
        flung: false,
        fallFrom: p.y,
      }));
      this.lively = this.options.hunters === "lively";
      this.zip = null;
      this.zipCooldown = 0;
      this.grace = 0;
      this.slide = null;
      this.slopeCooldown = 0;
      this.oiled = false;
      this.float = null;
      this.wet = false;
      this.waterCooldown = 0;
      this.floatStable = 0;
      this.objects = clone(l.objects || []).map((o) => ({
        ...o,
        homeX: o.x,
        homeY: o.y,
        alive: true,
      }));
      for (const o of this.objects)
        if (o.type === "water") Object.assign(o, { surface: o.level, flooded: false, floodT: 0 });
      this.ropes = this.buildRopes();
      this.switches = clone(l.switches || []).map((s) => ({
        ...s,
        active: false,
      }));
      this.rules = l.rules || {};
      this.boss = l.boss
        ? {
            ...clone(l.boss),
            hp: l.boss.hp === undefined ? 3 : l.boss.hp,
            cooldown: 0,
            homeX: l.boss.x,
            bombClock: 0,
          }
        : null;
      this.bombs = [];
      this.launches = 0;
      this.deaths = 0;
      this.time = 0;
      this.won = false;
      this.events = [];
      this.aim = false;
      this.dashReady = false;
      this.dashTime = 0;
      this.recording = [];
      this.priorFlight = [];
      this.echo = null;
      this.lure = null;
      this.phase = 0;
      this.phaseClock = 0;
      this.stable = 0;
      this.support = null;
      this.portalCooldown = 0;
      this.hasKey = !this.objects.some((o) => o.type === "key");
      this.lantern = null;
      this.cannon = null;
      return this;
    }
    emit(type, extra = {}) {
      this.events.push({ type, time: this.time, ...extra });
      if (this.events.length > 50) this.events.shift();
    }
    setAim(value) {
      this.aim = Boolean(value);
    }
    launch(vx, vy) {
      if (
        this.won ||
        !(atRest(this.hero.state) || this.hero.state === "cannon") ||
        !Number.isFinite(vx) ||
        !Number.isFinite(vy) ||
        Math.hypot(vx, vy) < 0.2
      )
        return false;
      const s = Math.hypot(vx, vy);
      if (s > MAX) {
        vx *= MAX / s;
        vy *= MAX / s;
      }
      if (this.support && this.support.type === "web") {
        this.support.alive = false;
        this.emit("tear");
      }
      // A launch from the water is not caught by the same water at once.
      if (this.hero.state === "float") this.waterCooldown = 0.25;
      this.float = null;
      this.hero.vx = vx;
      this.hero.vy = vy;
      this.hero.state = "flying";
      this.launches++;
      this.dashReady = true;
      this.dashTime = 0;
      this.aim = false;
      this.stable = 0;
      this.support = null;
      this.oiled = false;
      this.recording = [];
      for (const p of this.pumpkins) p.safe = false;
      this.emit("launch");
      return true;
    }
    dash() {
      if (this.hero.state === "slide" && this.slide) {
        this.leaveSlope(7);
        this.emit("hop", { x: this.hero.x, y: this.hero.y });
        return true;
      }
      if (this.hero.state === "zip" && this.zip) {
        this.leaveZip(1.25);
        return true;
      }
      if (this.hero.state !== "flying" || !this.dashReady) return false;
      this.dashReady = false;
      this.dashTime = 0.45;
      const s = Math.hypot(this.hero.vx, this.hero.vy);
      if (s > 0.1) {
        this.hero.vx *= 1.45;
        this.hero.vy *= 1.45;
      }
      this.emit("dash");
      return true;
    }
    activate() {
      if (!this.level.mechanic || this.won) return false;
      const direction = this.options.direction;
      if (direction === "light") {
        this.lure = { x: this.hero.x, y: this.hero.y + 2, r: 4, life: 5 };
        this.emit("lure");
        return true;
      }
      if (direction === "shadow") {
        if (this.priorFlight.length === 0) return false;
        this.echo = {
          frames: clone(this.priorFlight),
          index: 0,
          x: this.priorFlight[0].x,
          y: this.priorFlight[0].y,
        };
        this.emit("echo");
        return true;
      }
      if (direction === "bell" && this.hero.state === "resting") {
        this.phase = 1 - this.phase;
        this.phaseClock = 0;
        this.emit("phase");
        return true;
      }
      return false;
    }
    step(dt) {
      if (!Number.isFinite(dt) || dt < 0) return;
      const count = Math.ceil(dt * 120);
      if (!count) return;
      for (let i = 0; i < count; i++) this.tick(dt / count);
    }
    active(p) {
      return p.phase === undefined || p.phase === this.phase;
    }
    solid(p) {
      return (
        p.alive !== false &&
        (p.type !== "gate" || !this.switches.every((s) => s.active)) &&
        this.active(p) &&
        (p.type !== "ghost" ||
          p.phase !== undefined ||
          Math.sin(
            (this.time * 2 * Math.PI) / (p.period || Math.PI) +
              (p.offset || p.ghostPhase || 0),
          ) > -0.25)
      );
    }
    die() {
      this.deaths++;
      this.launches++;
      this.hero = {
        ...this.hero,
        ...this.respawn,
        vx: 0,
        vy: 0,
        state: "resting",
      };
      this.zip = null;
      this.slide = null;
      this.oiled = false;
      this.float = null;
      this.wet = false;
      this.waterCooldown = 0;
      this.floatStable = 0;
      this.support = null;
      this.stable = 0;
      this.dashTime = 0;
      this.dashReady = false;
      this.aim = false;
      this.recording = [];
      for (const p of this.pumpkins) {
        if (p.flung || p.roll) continue;
        p.x = p.homeX;
        p.y = p.homeY;
        p.safe = true;
        p.state = "return";
        p.vx = p.vy = 0;
        p.leapClock = 0;
      }
      // A moment of grace after a respawn, so nothing kills on the same spot again.
      this.grace = 0.6;
      // Stones that trapped Teryel stay where they are: she stays trapped too. A broken
      // cistern stays broken, and its flood stays up.
      const trapped = this.objects.some((o) => o.type === "teryel" && o.trapped);
      for (const p of this.platforms)
        if (p.type === "drop" && !(p.trigger !== undefined && p.landed) && !(trapped && p.knock) && !p.flooded)
          Object.assign(p, {
            x: p.homeX,
            y: p.homeY,
            vy: 0,
            vx: 0,
            timer: 0,
            falling: false,
            landed: false,
            restOn: null,
            alive: true,
          });
      for (const o of this.objects) if (o.type === "web") o.alive = true;
      for (const id of Object.keys(this.ropes)) {
        Object.assign(this.ropes[id], { s: this.ropes[id].start, jerk: 0, moving: false });
        this.placeBuckets(this.ropes[id]);
      }
      this.bombs = [];
      this.emit("death");
    }
    win() {
      this.won = true;
      this.hero.state = "won";
      this.hero.vx = 0;
      this.hero.vy = 0;
      this.emit("win", { stars: this.score() });
    }
    // The trap jar is a tool, not a hunter: it never counts as a star.
    smashed() {
      return this.pumpkins.filter((p) => !p.alive && !p.trap).length;
    }
    // A rest here would be inside the path of a Teryel who is still free.
    inTeryelPath(x, y) {
      return this.objects.some(
        (o) =>
          o.type === "teryel" &&
          !o.trapped &&
          Math.abs(x - o.homeX) < Math.abs(o.dx || 0) + (o.r || 1) + R + 0.3 &&
          Math.abs(y - o.homeY) < Math.abs(o.dy || 0) + (o.r || 1) + R + 0.3,
      );
    }
    score() {
      if (this.rules.stars === "pumpkins") return Math.min(3, this.smashed());
      return stars(this.won, this.deaths, this.launches, this.level.par);
    }
    doorOpen() {
      if (this.rules.door === "always") return true;
      if (this.rules.door === "boss") return !this.boss || this.boss.hp <= 0;
      if (this.rules.door === "trap")
        return this.objects.every((o) => o.type !== "teryel" || o.trapped);
      return (
        !this.boss &&
        !this.pumpkins.some((p) => p.alive) &&
        this.switches.every((s) => s.active) &&
        this.hasKey
      );
    }
    dropStone(p, dt) {
      if (p.alive === false) return;
      const h = this.hero;
      // A stone tied to a well rope slips once he has rested a moment in one of its buckets.
      const tug = p.tied !== undefined && this.bucketUnderHero() && this.bucketUnderHero().rope === p.tied;
      if (!p.falling && !p.landed && ((this.support === p && h.state === "resting") || tug)) {
        p.timer = (p.timer || 0) + dt;
        if (p.timer >= (p.delay === undefined ? 0.6 : p.delay)) {
          p.falling = true;
          p.vy = 0;
          this.emit("snap");
        }
      }
      // A landed stone keeps checking its support: a swing can slide out from
      // under it, a slack stone can fade, another stone can drop away.
      if (p.landed) {
        // A knocked stack skids along its ridge and goes over the edge.
        if (p.vx) {
          p.x += p.vx * dt;
          p.vx *= Math.exp(-1.2 * dt);
          if (Math.abs(p.vx) < 0.2) p.vx = 0;
          if (Math.abs(p.vx) > 0.5) this.crushUnder({ x: p.x, w: p.w, top: p.y, bottom: p.y - (p.h || 0.4) });
        }
        const edge = 6 - p.w / 2;
        if (Math.abs(p.x) > edge) {
          p.x = Math.sign(p.x) * edge;
          p.vx = 0;
        }
        const q = p.restOn;
        // A stone in a well bucket rides it up and down.
        if (q && q.type === "bucket" && Math.abs(q.x - p.x) < (q.w + p.w) / 2) p.y = q.y + (p.h || 0.4);
        const held =
          q &&
          this.solid(q) &&
          !q.falling &&
          Math.abs(q.x - p.x) < (q.w + p.w) / 2 &&
          Math.abs(q.y + (p.h || 0.4) - p.y) < 0.02;
        if (held) return;
        p.landed = false;
        p.falling = true;
        p.vy = 0;
        p.restOn = null;
      }
      if (!p.falling) return;
      // The cracked cistern: once knocked loose it breaks, and its water floods out.
      if (p.flood !== undefined && !p.flooded) {
        p.flooded = true;
        p.alive = false;
        for (const o of this.objects)
          if (o.type === "water" && o.id === p.flood && !o.flooded)
            Object.assign(o, { flooded: true, floodT: 0, floodFrom: o.surface });
        this.emit("flood", { x: p.x, y: p.y });
        return;
      }
      this.trapAt(p.x, p.y - (p.h || 0.4) / 2, Math.max(0.4, p.w / 2));
      // The press beam ends on Teryel's back (drawn there); it leaves the stage.
      if (p.beam && this.objects.some((o) => o.type === "teryel" && o.trapped)) {
        p.alive = false;
        return;
      }
      const bottom = p.y - (p.h || 0.4);
      p.vy += GRAVITY * dt;
      p.y += p.vy * dt;
      if (p.vx) {
        p.x += p.vx * dt;
        const edge = 6 - p.w / 2;
        if (Math.abs(p.x) > edge) {
          p.x = Math.sign(p.x) * edge;
          p.vx = 0;
        }
      }
      const nextBottom = p.y - (p.h || 0.4);
      for (const q of this.platforms) {
        if (q === p || !this.solid(q) || q.falling || q.type === "slope") continue;
        if (Math.abs(q.x - p.x) >= (q.w + p.w) / 2) continue;
        // A bucket already moved this tick: a stone it rose past still lands in it.
        const was = q.type === "bucket" && q.preY !== undefined ? q.preY : q.y;
        if (bottom >= Math.min(was, q.y) - 0.001 && nextBottom <= q.y) {
          const impact = -p.vy;
          p.y = q.y + (p.h || 0.4);
          p.vy = 0;
          p.falling = false;
          p.landed = true;
          if (p.fallFrom !== undefined && p.fallFrom - p.y > 0.3) p.vx = 0;
          p.fallFrom = p.y;
          p.restOn = q;
          this.emit("thud", { x: p.x, y: p.y - (p.h || 0.4) });
          if (q.type === "bucket" && impact >= 6) this.bucketJerk(q, impact);
          break;
        }
      }
      for (const pk of this.pumpkins) {
        if (!pk.alive) continue;
        // The 0.35 margin is the landing shock: it reaches a pumpkin sheltered
        // just beneath the posts the stone comes to rest on.
        const underside = p.y - (p.h || 0.4);
        if (
          Math.abs(pk.x - p.x) < p.w / 2 + 0.3 &&
          pk.y + 0.45 >= underside - 0.35 &&
          pk.y < underside
        ) {
          pk.alive = false;
          this.emit("smash", { x: pk.x, y: pk.y, crushed: true });
        }
      }
      if (p.y < -3) p.alive = false;
    }
    smashPumpkin(p, extra = {}) {
      if (!p.alive) return;
      p.alive = false;
      // A trap jar broken before Teryel is caught: another one rolls out.
      if (p.trap && this.objects.some((o) => o.type === "teryel" && !o.trapped)) p.respawnIn = 1.2;
      this.emit("smash", { x: p.x, y: p.y, ...extra });
    }
    // Moving stones and flying pumpkins break any pumpkin they overlap.
    crushUnder(box, extra) {
      for (const pk of this.pumpkins) {
        if (!pk.alive || pk.flung) continue;
        if (
          Math.abs(pk.x - box.x) < box.w / 2 + 0.3 &&
          pk.y + 0.45 > box.bottom &&
          pk.y - 0.45 < box.top
        )
          this.smashPumpkin(pk, { crushed: true, ...extra });
      }
    }
    // Teryel is never fought; a rolling jar, a falling stone or a flung object traps her.
    trapAt(x, y, reach) {
      for (const o of this.objects) {
        if (o.type !== "teryel" || o.trapped) continue;
        if (Math.hypot(o.x - x, o.y - y) < (o.r || 1) + reach) {
          o.trapped = true;
          this.emit("trapped", { x: o.x, y: o.y });
        }
      }
    }
    // Well buckets hang in pairs on one rope. `s` (0 to 1) is how far the left bucket
    // sits below its top; the right one sits as far above its bottom.
    buildRopes() {
      const ropes = {};
      this.platforms.forEach((p, i) => {
        if (p.type !== "bucket") return;
        const r = ropes[p.rope] || (ropes[p.rope] = { ids: [], s: 0, jerk: 0, moving: false });
        r.ids.push(i);
        if (p.s !== undefined) r.s = p.s;
      });
      for (const id of Object.keys(ropes)) {
        const r = ropes[id];
        if (r.ids.length !== 2) throw new Error(`rope ${id}: a rope holds exactly two buckets, not ${r.ids.length}`);
        r.ids.sort((i, j) => this.platforms[i].x - this.platforms[j].x);
        const [a, b] = r.ids.map((i) => this.platforms[i]);
        const travel = a.top - a.bottom;
        if (!(travel > 0) || Math.abs(travel - (b.top - b.bottom)) > 1e-9)
          throw new Error(`rope ${id}: both buckets must travel the same distance down from their top`);
        r.a = r.ids[0];
        r.b = r.ids[1];
        r.start = r.s;
        this.placeBuckets(r);
      }
      return ropes;
    }
    placeBuckets(r) {
      const a = this.platforms[r.a],
        b = this.platforms[r.b];
      const travel = a.top - a.bottom;
      a.y = a.top - r.s * travel;
      b.y = b.bottom + r.s * travel;
    }
    // The bucket the resting hero stands in, directly or on a stone inside it.
    bucketUnderHero() {
      const sup = this.support;
      if (this.hero.state !== "resting" || !sup) return null;
      if (sup.type === "bucket") return sup;
      if (sup.type === "drop" && sup.landed && !sup.falling && sup.restOn && sup.restOn.type === "bucket") return sup.restOn;
      return null;
    }
    // A resting hero weighs 1, a stone resting in the bucket 2.
    bucketLoad(q) {
      let w = this.bucketUnderHero() === q ? 1 : 0;
      for (const p of this.platforms)
        if (p.type === "drop" && p.alive !== false && p.landed && !p.falling && p.restOn === q) w += 2;
      return w;
    }
    heroBlocked(x, y, ignore) {
      return (
        Math.abs(x) > 6 - R ||
        this.platforms.some(
          (q) =>
            !ignore.includes(q) &&
            q.type !== "slope" &&
            q.type !== "bucket" &&
            this.solid(q) &&
            x + R > q.x - q.w / 2 &&
            x - R < q.x + q.w / 2 &&
            y + R > q.y - (q.h || 0.4) &&
            y - R < q.y,
        )
      );
    }
    // All ropes move in one pass before the platforms, so riders see one consistent move.
    updateRopes(dt) {
      for (const id of Object.keys(this.ropes)) {
        const r = this.ropes[id],
          a = this.platforms[r.a],
          b = this.platforms[r.b];
        for (const q of [a, b]) {
          q.preX = q.x;
          q.preY = q.y;
        }
        const travel = a.top - a.bottom;
        const dir = r.jerk || Math.sign(this.bucketLoad(a) - this.bucketLoad(b));
        const before = r.s;
        r.s = Math.max(0, Math.min(1, r.s + (dir * (r.jerk ? 10 : 2.5) * dt) / travel));
        if (r.jerk && (r.s === 0 || r.s === 1)) r.jerk = 0;
        this.placeBuckets(r);
        // The rope jams rather than carry him into a ledge.
        const ride = this.bucketUnderHero();
        if (ride === a || ride === b) {
          const h = this.hero;
          if (this.heroBlocked(h.x, h.y + ride.y - ride.preY, [this.support])) {
            r.s = before;
            r.jerk = 0;
            this.placeBuckets(r);
          }
        }
        const moving = r.s !== before;
        if (moving && !r.moving) this.emit("bucket", { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) });
        r.moving = moving;
      }
    }
    // A stone landing hard in one bucket jerks the other up and throws its rider.
    bucketJerk(q, impact) {
      const r = this.ropes[q.rope];
      if (!r) return;
      const a = this.platforms[r.a];
      const other = q === a ? this.platforms[r.b] : a;
      const dir = q === a ? 1 : -1;
      if ((dir > 0 && r.s >= 1) || (dir < 0 && r.s <= 0)) return;
      r.jerk = dir;
      const h = this.hero;
      const flung = this.bucketUnderHero() === other;
      if (flung) {
        h.state = "flying";
        h.vx = 0;
        // The bucket shoots up at rope speed (10) and throws him off its floor, higher
        // than any launch (16) can take him.
        h.vy = Math.min(20, 10 + impact);
        this.support = null;
        this.stable = 0;
        this.dashReady = true;
      }
      this.emit("jerk", { x: other.x, y: other.y, flung });
    }
    // Water whose surface lies more than `margin` above (x, y).
    waterAt(x, y, margin = 0) {
      return (
        this.objects.find(
          (o) => o.type === "water" && Math.abs(x - o.x) < o.w / 2 && y < o.surface - margin && y > o.y,
        ) || null
      );
    }
    updateWater(dt) {
      for (const o of this.objects) {
        if (o.type !== "water") continue;
        const before = o.surface;
        if (o.flooded) {
          o.floodT += dt;
          o.surface = o.floodFrom + (o.to - o.floodFrom) * Math.min(1, o.floodT / 1.5);
        } else if (o.rise)
          o.surface = o.level + (o.rise.dy * (1 - Math.cos((this.time * 2 * Math.PI) / (o.rise.period || 8)))) / 2;
        o.surfaceV = dt > 0 ? (o.surface - before) / dt : 0;
      }
    }
    enterFloat(pool) {
      const h = this.hero;
      h.state = "float";
      h.vx = 0;
      h.vy = 0;
      this.float = pool;
      this.support = null;
      this.stable = 0;
      this.floatStable = 0;
      this.priorFlight = this.recording.slice();
      this.emit("float", { x: h.x, y: pool.surface });
    }
    // Floating: he follows the surface; a falling surface sets him down on a ledge, and a
    // rising one under a ledge holds him beneath it, still floating (so he can launch).
    floatTick() {
      const h = this.hero,
        pool = this.float;
      if (!pool || Math.abs(h.x - pool.x) >= pool.w / 2) {
        h.state = "flying";
        this.float = null;
        return;
      }
      let target = pool.surface - FLOAT;
      for (const q of this.platforms) {
        if (!this.solid(q) || q.type === "slope") continue;
        if (h.x + R <= q.x - q.w / 2 || h.x - R >= q.x + q.w / 2) continue;
        if (target < h.y && h.y - R >= q.y - 0.001 && target - R < q.y) {
          h.y = q.y + R;
          h.state = "resting";
          this.support = q;
          this.float = null;
          this.emit("land");
          return;
        }
        const bottom = q.y - (q.h || 0.4);
        if (target > h.y - 0.001 && h.y + R <= bottom + 0.001 && target + R > bottom) target = bottom - R;
      }
      h.y = target;
    }
    seesawHit(p, heroX, impact) {
      if (impact < 5) return;
      const side = heroX < p.x ? -1 : 1;
      p.tilt = side;
      p.tiltTime = 0.6;
      const farX = p.x - (side * p.w) / 4;
      let flung = 0;
      for (const pk of this.pumpkins) {
        if (!pk.alive || pk.flung) continue;
        if (Math.abs(pk.x - farX) <= p.w / 4 + 0.35 && pk.y > p.y - 0.2 && pk.y < p.y + 1.5) {
          pk.flung = true;
          pk.roll = false;
          pk.vy = Math.min(16, impact * 1.2 + 4);
          pk.vx = -side * 1.5;
          flung++;
        }
      }
      if (p.id !== undefined)
        for (const q of this.platforms)
          if (q.type === "drop" && q.trigger === p.id && !q.falling && !q.landed) {
            q.falling = true;
            q.vy = 0;
            this.emit("snap", { x: q.x, y: q.y });
          }
      this.emit("seesaw", { x: p.x, y: p.y, side, flung });
    }
    // A rider is carried by his plank without collisions; at a wall or against another
    // platform the plank slides out from under him and he falls (normal collisions resume).
    wheelRiderBlocked(plank) {
      const h = this.hero;
      const wall = Math.abs(h.x) > 6 - R;
      const hit = this.platforms.some(
        (q) =>
          q !== plank &&
          q.type !== "wheel" &&
          q.type !== "slope" &&
          this.solid(q) &&
          h.x + R > q.x - q.w / 2 &&
          h.x - R < q.x + q.w / 2 &&
          h.y + R > q.y - (q.h || 0.4) &&
          h.y - R < q.y,
      );
      if (!wall && !hit) return;
      if (wall) h.x = Math.sign(h.x) * (6 - R);
      h.state = "flying";
      h.vx = 0;
      h.vy = 0;
      this.support = null;
      this.stable = 0;
    }
    // A sloped roof is a line from (x1, y1) to (x2, y2); its walking side faces up.
    slopeFrame(p) {
      const dx = p.x2 - p.x1,
        dy = p.y2 - p.y1,
        len = Math.hypot(dx, dy) || 1;
      const ux = dx / len,
        uy = dy / len;
      // Normal pointing up (or toward the sky side).
      let nx = -uy,
        ny = ux;
      if (ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      return { ux, uy, nx, ny, len };
    }
    trySlopes(h) {
      for (const p of this.platforms) {
        if (p.type !== "slope" || p.alive === false) continue;
        // Only the roof just left is ignored for a moment, so a valley still catches.
        if (this.slopeCooldown > 0 && p === this.lastSlope) continue;
        const f = this.slopeFrame(p);
        // A roof must slope: not flat (no end to the slide) and not vertical.
        if (Math.abs(f.uy) < 0.08 || Math.abs(f.ux) < 0.08) continue;
        const rx = h.x - p.x1,
          ry = h.y - p.y1;
        const along = rx * f.ux + ry * f.uy;
        const off = rx * f.nx + ry * f.ny;
        const into = h.vx * f.nx + h.vy * f.ny;
        if (along < 0 || along > f.len || off > R || off < -R * 0.2 || into >= 0) continue;
        this.slide = { p, s: along, v: h.vx * f.ux + h.vy * f.uy, f };
        h.state = "slide";
        this.dashReady = true;
        this.stable = 0;
        this.support = null;
        this.emit("slide", { x: h.x, y: h.y });
        return true;
      }
      return false;
    }
    leaveSlope(hop) {
      const sl = this.slide,
        h = this.hero;
      if (!sl) return;
      h.state = "flying";
      h.vx = sl.v * sl.f.ux + sl.f.nx * hop;
      h.vy = sl.v * sl.f.uy + sl.f.ny * hop;
      this.lastSlope = sl.p;
      this.slide = null;
      this.slopeCooldown = 0.2;
    }
    leaveZip(boost) {
      const z = this.zip;
      if (!z) return;
      const h = this.hero;
      h.state = "flying";
      h.vx = z.dx * z.v * boost;
      h.vy = z.dy * z.v * boost + 2;
      this.zip = null;
      this.zipCooldown = 0.5;
      this.dashReady = true;
      this.emit("zip-off", { x: h.x, y: h.y });
    }
    // Lively hunters: sleep, notice, accelerate, lunge, go home.
    livelyPumpkin(p, dt, target, paused) {
      const d = dist(p, target);
      if (p.safe && p.state !== "return") p.state = "return";
      if (p.state === "idle" && !p.safe && d < p.range) {
        p.state = "notice";
        p.noticeTimer = 0.35;
        this.emit("notice", { x: p.x, y: p.y });
      }
      if (paused) return;
      if (p.state === "notice") {
        p.noticeTimer -= dt;
        if (p.noticeTimer <= 0) p.state = "hunt";
        return;
      }
      let desired = { x: 0, y: 0 };
      if (p.state === "hunt") {
        if (d > p.range * 1.4 || p.safe) p.state = "return";
        else if (d > 0.001) {
          const top = p.speed * 1.6 * (d < 1.6 ? 1.8 : 1);
          desired = { x: ((target.x - p.x) / d) * top, y: ((target.y - p.y) / d) * top };
        }
      }
      if (p.state === "return") {
        const home = { x: p.homeX, y: p.homeY };
        const dh = dist(p, home);
        if (dh < 0.08) {
          p.x = home.x;
          p.y = home.y;
          p.vx = p.vy = 0;
          p.state = "idle";
          return;
        }
        const top = Math.min(p.speed * 0.9 + 0.3, dh * 2);
        desired = { x: ((home.x - p.x) / dh) * top, y: ((home.y - p.y) / dh) * top };
      }
      if (Math.abs(desired.x) > 0.05) p.face = Math.sign(desired.x);
      const k = Math.min(1, 3 * dt);
      p.vx += (desired.x - p.vx) * k;
      p.vy += (desired.y - p.vy) * k;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // A walker (a rat) runs only along its own beam, `walk` units either side of home.
      if (p.walk !== undefined) {
        p.y = p.homeY;
        p.vy = 0;
        const lo = p.homeX - p.walk,
          hi = p.homeX + p.walk;
        if (p.x < lo || p.x > hi) {
          p.x = Math.max(lo, Math.min(hi, p.x));
          p.vx = 0;
        }
        // A frog leaps `height` above its stone every `every` s while hunting; a leap
        // already in the air is finished.
        if (p.leap) {
          const every = p.leap.every || 2,
            T = 2 * Math.sqrt((2 * p.leap.height) / -GRAVITY);
          const inAir = (p.leapClock || 0) > 0 && (p.leapClock || 0) % every < T;
          if (p.state === "hunt" || inAir) {
            const before = p.leapClock || 0;
            p.leapClock = before + dt;
            // A new leap starts on the first tick of the hunt and each time the clock wraps.
            if (before === 0 || Math.floor(p.leapClock / every) > Math.floor(before / every))
              this.emit("leap", { x: p.x, y: p.y });
            const t = p.leapClock % every;
            if (t < T) p.y = p.homeY + 4 * p.leap.height * (t / T) * (1 - t / T);
          } else p.leapClock = 0;
        }
      }
    }
    // A pumpkin thrown by a seesaw: ballistic until it hits anything.
    flungPumpkin(p, dt) {
      p.vy += GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      this.trapAt(p.x, p.y, 0.45);
      if (Math.abs(p.x) > 6 - 0.3 || p.y < -3) return this.smashPumpkin(p, { crushed: true });
      for (const q of this.platforms) {
        if (!this.solid(q) || q.type === "post" || q.type === "slope") continue;
        if (Math.abs(p.x - q.x) < q.w / 2 + 0.3 && p.y + 0.3 > q.y - (q.h || 0.4) && p.y - 0.3 < q.y)
          return this.smashPumpkin(p, { crushed: true });
      }
      for (const other of this.pumpkins) {
        if (other === p || !other.alive || other.flung) continue;
        if (dist(p, other) < 0.85) {
          this.smashPumpkin(other, { crushed: true });
          return this.smashPumpkin(p, { crushed: true });
        }
      }
    }
    // A loose pumpkin on the ground: pushed by Izan, it rolls, bowls and breaks.
    rollingPumpkin(p, dt) {
      const r = 0.45;
      let supported = null;
      for (const q of this.platforms) {
        if (!this.solid(q) || q.type === "post" || q.type === "slope") continue;
        if (Math.abs(p.x - q.x) < q.w / 2 + r * 0.5 && Math.abs(p.y - r - q.y) < 0.08 && p.vy <= 0)
          supported = q;
      }
      if (supported) {
        p.y = supported.y + r;
        p.vy = 0;
        p.vx *= Math.exp(-0.45 * dt);
        p.fallFrom = p.y;
      } else {
        p.vy += GRAVITY * dt;
        p.fallFrom = Math.max(p.fallFrom, p.y);
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.spin = (p.spin || 0) + (p.vx / r) * dt;
      if (Math.abs(p.vx) > 1.5 || p.vy < -2) this.trapAt(p.x, p.y, r);
      if (!supported && p.vy < 0) {
        for (const q of this.platforms) {
          if (!this.solid(q) || q.type === "post" || q.type === "slope") continue;
          if (Math.abs(p.x - q.x) < q.w / 2 + r * 0.5 && p.y - r <= q.y && p.y - r > q.y - 0.5) {
            p.y = q.y + r;
            p.vy = 0;
            if (p.fallFrom - p.y > 2.5) {
              for (const other of this.pumpkins)
                if (other !== p && other.alive && !other.roll && dist(p, other) < 1.1)
                  this.smashPumpkin(other, { crushed: true });
              return this.smashPumpkin(p, { crushed: true });
            }
            p.fallFrom = p.y;
          }
        }
      }
      if (Math.abs(p.x) > 6 - r) {
        if (Math.abs(p.vx) > 3) return this.smashPumpkin(p, { crushed: true });
        p.x = Math.sign(p.x) * (6 - r);
        p.vx = -p.vx * 0.3;
      }
      if (p.y < -3) return this.smashPumpkin(p, { crushed: true });
      if (Math.abs(p.vx) > 1.5 || p.vy < -2)
        for (const other of this.pumpkins) {
          if (other === p || !other.alive || other.roll || other.flung) continue;
          if (dist(p, other) < 0.9) {
            this.smashPumpkin(other, { crushed: true });
            p.vx *= 0.85;
          }
        }
    }
    tick(dt) {
      if (this.won) return;
      this.time += dt;
      this.portalCooldown = Math.max(0, this.portalCooldown - dt);
      this.dashTime = Math.max(0, this.dashTime - dt);
      this.phaseClock += dt;
      if (
        this.options.direction === "bell" &&
        this.level.mechanic &&
        this.phaseClock >= (this.level.bellPeriod || 12) / 2 &&
        !this.aim
      ) {
        this.phase = 1 - this.phase;
        this.phaseClock = 0;
        this.emit("phase");
      }
      if (this.lure) {
        this.lure.life -= dt;
        if (this.lure.life <= 0) this.lure = null;
      }
      if (this.echo) {
        const f = this.echo.frames[this.echo.index++];
        if (f) {
          this.echo.x = f.x;
          this.echo.y = f.y;
          for (const s of this.switches)
            if (dist(f, s) < (s.r || 0.7)) s.active = true;
        } else this.echo = null;
      }
      this.updateWater(dt);
      this.updateRopes(dt);
      this.waterCooldown = Math.max(0, this.waterCooldown - dt);
      for (const p of this.platforms) {
        // Buckets already moved in updateRopes: their move this tick starts from there.
        const ox = p.type === "bucket" ? p.preX : p.x,
          oy = p.type === "bucket" ? p.preY : p.y;
        p.previousY = oy;
        if (p.type === "drop") this.dropStone(p, dt);
        if (p.type === "mover") {
          const t =
              this.time * (p.period ? (2 * Math.PI) / p.period : p.speed || 1),
            span = p.distance || p.amplitude || 2;
          p.x =
            p.homeX +
            Math.sin(t) *
              (p.dx === undefined ? span * (p.axis === "y" ? 0 : 1) : p.dx);
          p.y =
            p.homeY +
            Math.sin(t) *
              (p.dy === undefined ? span * (p.axis === "y" ? 1 : 0) : p.dy);
        }
        if (p.type === "wheel") {
          // A plank on the press wheel: it keeps level while it turns round the axle.
          const a = (p.angle || 0) + (this.time * 2 * Math.PI) / (p.period || 8);
          p.x = p.cx + Math.cos(a) * p.radius;
          p.y = p.cy + Math.sin(a) * p.radius;
        }
        if (this.support === p && this.hero.state === "resting") {
          this.hero.x += p.x - ox;
          this.hero.y += p.y - oy;
          if (p.type === "wheel") this.wheelRiderBlocked(p);
        }
        if (p.type === "seesaw" && p.tiltTime > 0) p.tiltTime -= dt;
        if (p.type === "ghost") {
          // Time left before this stone fades, for the warning in the renderer.
          const period = p.period || Math.PI;
          const edge = Math.asin(0.25);
          let theta = ((this.time * 2 * Math.PI) / period + (p.offset || p.ghostPhase || 0)) % (2 * Math.PI);
          if (theta < -edge) theta += 2 * Math.PI;
          if (theta > 2 * Math.PI - edge) theta -= 2 * Math.PI;
          p.solidFor = theta < Math.PI + edge ? ((Math.PI + edge - theta) * period) / (2 * Math.PI) : 0;
          p.backIn = theta < Math.PI + edge ? 0 : ((2 * Math.PI - edge - theta) * period) / (2 * Math.PI);
        }
        // Only pumpkins level with the stone's body are crushed, not one hovering
        // above its surface next to a resting hero.
        if (this.lively && p.type === "mover" && (p.x !== ox || p.y !== oy))
          this.crushUnder({ x: p.x, w: p.w, top: p.y - 0.1, bottom: p.y - (p.h || 0.4) });
      }
      this.zipCooldown = Math.max(0, this.zipCooldown - dt);
      this.grace = Math.max(0, this.grace - dt);
      if (this.hero.state === "zip" && this.zip) {
        const z = this.zip,
          h = this.hero;
        z.v += -GRAVITY * -z.dy * dt + 1.5 * dt;
        z.t += (z.v * dt) / z.len;
        h.x = z.x1 + (z.x2 - z.x1) * Math.min(1, z.t);
        h.y = z.y1 + (z.y2 - z.y1) * Math.min(1, z.t) - 0.35;
        // The ride speed counts as impact speed for pumpkins on the line.
        h.vx = z.dx * z.v;
        h.vy = z.dy * z.v;
        if (z.t >= 1) this.leaveZip(1);
      }
      const h = this.hero;
      if (h.state === "cannon" && this.cannon) {
        this.cannon.timer -= dt;
        if (this.cannon.timer <= 0) {
          h.state = "flying";
          h.vx = this.cannon.vx;
          h.vy = this.cannon.vy;
          this.portalCooldown = 0.6;
          this.cannon = null;
          this.emit("fire");
        }
      }
      if (h.state === "resting" && this.support && !this.solid(this.support)) {
        h.state = "flying";
        this.support = null;
      }
      if (h.state === "resting") {
        // On a ledge he floats once the water is well over the float line; with nothing
        // under him, any water holds him.
        const pool = this.waterAt(h.x, h.y, this.support ? FLOAT + 0.1 : 0);
        if (pool) this.enterFloat(pool);
      }
      if (h.state === "float") this.floatTick();
      this.slopeCooldown = Math.max(0, this.slopeCooldown - dt);
      if (h.state === "slide" && this.slide) {
        // Gravity along the roof, a little friction from the tiles.
        const sl = this.slide;
        sl.v += GRAVITY * sl.f.uy * dt;
        sl.v *= Math.exp(-0.25 * dt);
        sl.s += sl.v * dt;
        h.x = sl.p.x1 + sl.f.ux * sl.s + sl.f.nx * R;
        h.y = sl.p.y1 + sl.f.uy * sl.s + sl.f.ny * R;
        h.vx = sl.v * sl.f.ux;
        h.vy = sl.v * sl.f.uy;
        if (sl.s < 0 || sl.s > sl.f.len) this.leaveSlope(0);
        else if (Math.abs(h.x) > 6 - R) {
          h.x = Math.sign(h.x) * (6 - R);
          this.leaveSlope(0);
          h.vx = -h.vx * 0.25;
        }
      }
      if (h.state === "flying") {
        const old = { x: h.x, y: h.y };
        h.x += h.vx * dt;
        h.y += h.vy * dt + (GRAVITY * dt * dt) / 2;
        h.vy += GRAVITY * dt;
        // Water holds him up and slows him; near the surface and still, he floats.
        const pool = this.waterCooldown > 0 ? null : this.waterAt(h.x, h.y);
        if (pool) {
          if (!this.wet) this.emit("splash", { x: h.x, y: pool.surface, speed: Math.hypot(h.vx, h.vy) });
          this.wet = true;
          h.vy += BUOYANCY * Math.min(1, (pool.surface - h.y) / 0.5) * dt;
          const k = Math.exp(-4 * dt);
          h.vx *= k;
          h.vy *= k;
          if (Math.abs(pool.surface - FLOAT - h.y) < 0.25 && Math.hypot(h.vx, h.vy - (pool.surfaceV || 0)) < 1.2) this.floatStable += dt;
          else this.floatStable = 0;
        } else {
          this.wet = false;
          this.floatStable = 0;
        }
        let landed = false;
        // Only the first tick of a glide on oil is announced.
        const wasOiled = this.oiled;
        this.oiled = false;
        const colliders = this.platforms.concat(
          this.objects
            .filter((o) => o.type === "crate" && o.alive)
            .map((o) => ({ ...o, source: o, y: o.y + (o.h || 1) / 2 })),
        );
        if (this.level.gate && !this.switches.every((s) => s.active))
          colliders.push({
            ...this.level.gate,
            type: "gate",
            y: this.level.gate.y + (this.level.gate.h || 2) / 2,
          });
        for (const p of colliders) {
          if (!this.solid(p) || p.type === "slope") continue;
          const left = p.x - p.w / 2,
            right = p.x + p.w / 2,
            top = p.y,
            bottom = top - (p.h || 0.4);
          if (
            h.x + R <= left ||
            h.x - R >= right ||
            h.y + R <= bottom ||
            h.y - R >= top
          )
            continue;
          // Landing on a stack from above stands on it; a side hit or a dash knocks it.
          const fromAbove =
            old.y - R >= (p.previousY === undefined ? top : p.previousY) - 0.015 && h.vy <= 0;
          if (
            p.type === "drop" &&
            p.knock &&
            !p.falling &&
            !p.landed &&
            (this.dashTime > 0 || (!fromAbove && Math.hypot(h.vx, h.vy) > 4.5))
          ) {
            p.falling = true;
            p.vy = 0;
            p.fallFrom = p.y;
            p.restOn = null;
            // Pushed the way it was hit, so a stack on a ridge tips off the edge.
            p.vx = Math.sign(h.vx || 1) * Math.max(2.5, Math.min(6, Math.abs(h.vx) * 0.5));
            h.vx *= 0.6;
            this.emit("knock", { x: p.x, y: p.y });
            continue;
          }
          if (p.source && this.dashTime > 0) {
            p.source.alive = false;
            this.emit("crate");
            continue;
          }
          if (
            old.y - R >=
              (p.previousY === undefined ? top : p.previousY) - 0.015 &&
            h.vy <= (p.previousY === undefined ? 0 : (p.y - p.previousY) / dt)
          ) {
            h.y = top + R;
            if (p.type === "seesaw") this.seesawHit(p, h.x, -h.vy);
            // A wheel plank past the top sinks under him; he sinks with it and settles.
            h.vy =
              (p.type === "wheel" || p.type === "bucket") && p.previousY !== undefined
                ? Math.min(0, (p.y - p.previousY) / dt)
                : 0;
            // Spilt oil: a fast landing keeps gliding; a gentle one still stops.
            if (p.oil && Math.abs(h.vx) >= 1.2) {
              h.vx *= Math.exp(-0.2 * dt);
              if (!wasOiled && !this.oiled) this.emit("oil", { x: h.x, y: top });
              this.oiled = true;
            } else h.vx *= Math.exp(-8 * dt);
            landed = true;
            this.support = p.source ? null : p;
          } else if (old.y + R <= bottom + 0.015 && h.vy > 0) {
            h.y = bottom - R;
            h.vy = 0;
          } else if (old.x + R <= left + 0.02) {
            h.x = left - R;
            h.vx = 0;
          } else if (old.x - R >= right - 0.02) {
            h.x = right + R;
            h.vx = 0;
          }
        }
        if (this.trySlopes(h)) this.stable = 0;
        else if (h.x < -6 + R) {
          h.x = -6 + R;
          h.vx = Math.abs(h.vx) * 0.25;
        }
        if (h.x > 6 - R) {
          h.x = 6 - R;
          h.vx = -Math.abs(h.vx) * 0.25;
        }
        if (landed && Math.abs(h.vx) < 0.6) this.stable += dt;
        else this.stable = 0;
        if (h.state === "flying" && !landed && pool && this.floatStable >= 0.12) this.enterFloat(pool);
        if (h.state === "flying" && this.stable >= 0.12) {
          h.state = "resting";
          h.vx = 0;
          h.vy = 0;
          if (
            this.support &&
            this.support.type !== "mover" &&
            this.support.type !== "wheel" &&
            this.support.type !== "ghost" &&
            this.support.type !== "gate" &&
            this.support.type !== "drop" &&
            this.support.type !== "bucket" &&
            !this.waterAt(h.x, h.y) &&
            !this.inTeryelPath(h.x, h.y) &&
            this.support.phase === undefined
          )
            this.respawn = { x: h.x, y: h.y };
          this.priorFlight = this.recording.slice();
          this.emit("land");
        }
        this.recording.push({ x: h.x, y: h.y });
        if (this.recording.length > 3600) this.recording.shift();
      }
      for (const p of this.pumpkins) {
        if (!p.alive && p.trap && p.respawnIn > 0) {
          p.respawnIn -= dt;
          if (p.respawnIn <= 0)
            Object.assign(p, { alive: true, x: p.homeX, y: p.homeY, vx: 0, vy: 0, flung: false, roll: true, fallFrom: p.homeY });
        }
        if (!p.alive || !this.active(p)) continue;
        if (p.flung) {
          this.flungPumpkin(p, dt);
          if (p.alive && dist(h, p) < R + 0.45) this.smashPumpkin(p, { crushed: true });
          continue;
        }
        if (p.roll) {
          this.rollingPumpkin(p, dt);
          p.pushCool = Math.max(0, (p.pushCool || 0) - dt);
          if (p.alive && p.pushCool === 0 && dist(h, p) < R + 0.45 && (h.state === "flying" || h.state === "zip")) {
            p.pushCool = 0.4;
            const push = Math.abs(h.vx) > 1 ? h.vx : Math.sign(p.x - h.x) * 4;
            p.vx = Math.sign(push) * Math.max(4, Math.min(14, Math.abs(push) * 0.9));
            p.x += Math.sign(p.vx) * 0.05;
            h.vx *= 0.5;
            if (h.vy < 0) h.vy = 3;
            this.emit("roll", { x: p.x, y: p.y });
          }
          continue;
        }
        const target =
          this.lure && dist(p, this.lure) <= this.lure.r ? this.lure : h;
        const paused =
          (this.options.pursuit === "planning" &&
            (this.aim || atRest(h.state))) ||
          (this.options.pursuit === "aim" && this.aim);
        if (this.lively) this.livelyPumpkin(p, dt, target, paused);
        else {
          const chasing = !p.safe && dist(p, target) < p.range;
          const destination = chasing ? target : { x: p.homeX, y: p.homeY };
          if (!paused || p.safe) {
            const d = dist(p, destination),
              step = Math.min(d, p.speed * dt);
            if (d > 0.001) {
              p.x += ((destination.x - p.x) / d) * step;
              p.y += ((destination.y - p.y) / d) * step;
            }
          }
        }
        if (!p.alive) continue;
        if (!p.safe && dist(h, p) < R + 0.45) {
          // Gliding on oil he cannot stop: whatever sits at the end is knocked flat.
          if (this.dashTime > 0 || Math.hypot(h.vx, h.vy) > 4.5 || (this.oiled && h.state === "flying")) {
            p.alive = false;
            h.vx *= 0.6;
            h.vy *= 0.6;
            this.emit("smash", { x: p.x, y: p.y });
          } else {
            this.die();
            return;
          }
        }
      }
      for (const o of this.objects) {
        if (o.type === "bat" || o.type === "spider") {
          const t = (this.time * 2 * Math.PI) / (o.period || 4);
          o.x = o.homeX + Math.sin(t) * (o.dx || 0);
          o.y = o.homeY + Math.sin(t) * (o.dy || 0);
        }
        if (!o.alive || !this.active(o)) continue;
        const radius = o.r || 0.5;
        const inWind =
          o.type === "wind" &&
          Math.abs(h.x - o.x) < (o.w || 2) / 2 &&
          Math.abs(h.y - o.y) < (o.h || 3) / 2 &&
          h.state === "flying";
        if (o.type === "wind") {
          if (inWind && !o.inside) this.emit("gust", { x: o.x, y: o.y });
          o.inside = inWind;
        }
        if (inWind) {
          h.vx +=
            (o.ax === undefined
              ? o.forceX === undefined
                ? o.force || 3
                : o.forceX
              : o.ax) * dt;
          h.vy += (o.ay === undefined ? o.forceY || 0 : o.ay) * dt;
        }
        if (o.type === "spikes") {
          if (
            Math.abs(h.x - o.x) < (o.w || 1) / 2 + R &&
            Math.abs(h.y - o.y) < (o.h || 0.35) / 2 + R * 0.65
          ) {
            this.die();
            return;
          }
        }
        if (o.type === "teryel") {
          if (o.dx || o.dy) {
            const tt = (this.time * 2 * Math.PI) / (o.period || 4);
            if (!o.trapped) {
              o.x = o.homeX + Math.sin(tt) * (o.dx || 0);
              o.y = o.homeY + Math.sin(tt) * (o.dy || 0);
            }
          }
          // Water closing over her carries her off: any free Teryel under a surface is trapped.
          if (!o.trapped && this.waterAt(o.x, o.y)) {
            o.trapped = true;
            this.emit("trapped", { x: o.x, y: o.y, flood: true });
          }
          if (!o.trapped && this.grace <= 0 && dist(h, o) < (o.r || 1) + R * 0.8) {
            this.die();
            return;
          }
          continue;
        }
        if (o.type === "trampoline") {
          o.cool = Math.max(0, (o.cool || 0) - dt);
          if (h.state === "flying" && o.cool === 0 && dist(h, o) < radius + R * 0.5) {
            const nl = Math.hypot(o.nx === undefined ? 0 : o.nx, o.ny === undefined ? 1 : o.ny) || 1;
            const nx = (o.nx === undefined ? 0 : o.nx) / nl,
              ny = (o.ny === undefined ? 1 : o.ny) / nl;
            // Any touch flings Izan along the web's normal: the tangential part of
            // his speed is kept, the normal part is reflected and never below `min`.
            const along = h.vx * nx + h.vy * ny;
            const tx = h.vx - along * nx,
              ty = h.vy - along * ny;
            const out = Math.max(o.min === undefined ? 9 : o.min, Math.abs(along) * 1.1);
            h.vx = tx * 0.9 + nx * out;
            h.vy = ty * 0.9 + ny * out;
            h.x = o.x + nx * (radius + R * 0.5 + 0.02);
            h.y = o.y + ny * (radius + R * 0.5 + 0.02);
            o.cool = 0.25;
            this.dashReady = true;
            this.emit("boing", { x: o.x, y: o.y });
          }
          continue;
        }
        if (o.type === "zip") {
          if (h.state !== "flying" || this.zipCooldown > 0) continue;
          const high = o.y1 >= o.y2 ? { x: o.x1, y: o.y1 } : { x: o.x2, y: o.y2 };
          const low = o.y1 >= o.y2 ? { x: o.x2, y: o.y2 } : { x: o.x1, y: o.y1 };
          const lx = low.x - high.x,
            ly = low.y - high.y,
            len = Math.hypot(lx, ly) || 1;
          const t = Math.max(0, Math.min(1, ((h.x - high.x) * lx + (h.y - high.y) * ly) / (len * len)));
          const px = high.x + lx * t,
            py = high.y + ly * t;
          if (Math.hypot(h.x - px, h.y - py) < 0.45) {
            const dx = lx / len,
              dy = ly / len;
            this.zip = { x1: high.x, y1: high.y, x2: low.x, y2: low.y, len, dx, dy, t, v: Math.max(1.5, h.vx * dx + h.vy * dy) };
            h.state = "zip";
            h.vx = h.vy = 0;
            this.dashTime = 0;
            this.priorFlight = this.recording.slice();
            this.emit("zip", { x: px, y: py });
          }
          continue;
        }
        if (dist(h, o) > radius + R) continue;
        if (o.type === "key") {
          o.alive = false;
          this.hasKey = true;
          this.emit("key");
        }
        if (o.type === "web" && h.state === "flying") {
          h.state = "resting";
          h.vx = 0;
          h.vy = 0;
          this.dashTime = 0;
          this.stable = 0;
          this.support = o;
          this.priorFlight = this.recording.slice();
          this.emit("web");
        }
        if (o.type === "bat" || o.type === "spider") {
          if (this.dashTime > 0) {
            o.alive = false;
            this.emit(o.type, { x: o.x, y: o.y });
          } else {
            this.die();
            return;
          }
        }
        if (
          o.type === "mushroom" &&
          h.vy <= 0 &&
          h.state === "flying" &&
          h.y >= o.y
        ) {
          h.y = o.y + radius + R;
          h.vy = o.bounce || 17;
          this.support = null;
          this.emit("bounce");
        }
        if (o.type === "portal" && this.portalCooldown === 0) {
          const pair = this.objects.find(
            (p) =>
              p !== o &&
              p.type === "portal" &&
              (p.pair === o.pair || p.id === o.target),
          );
          if (pair) {
            h.x = pair.x;
            h.y = pair.y;
            this.portalCooldown = 0.6;
            this.emit("portal");
          }
        }
        if (
          o.type === "cannon" &&
          h.state === "flying" &&
          this.portalCooldown === 0
        ) {
          h.x = o.x;
          h.y = o.y + R;
          h.vx = 0;
          h.vy = 0;
          h.state = "cannon";
          this.cannon = {
            vx: o.vx === undefined ? 8 : o.vx,
            vy: o.vy === undefined ? 13 : o.vy,
            timer: 0.4,
          };
          this.portalCooldown = 0.6;
          this.priorFlight = this.recording.slice();
          this.emit("cannon");
        }
      }
      if (this.boss && this.boss.hp > 0) {
        const b = this.boss;
        if (b.sway)
          b.x =
            b.homeX +
            Math.sin((this.time * 2 * Math.PI) / (b.period || 5)) * b.sway;
        if (b.bombEvery) {
          b.bombClock += dt;
          if (b.bombClock >= b.bombEvery) {
            b.bombClock = 0;
            this.bombs.push({ x: b.x, y: b.y - 0.8, vy: 0 });
            this.emit("bomb");
          }
        }
        b.cooldown = Math.max(0, b.cooldown - dt);
        if (dist(h, b) < R + (b.r || 0.85) && b.cooldown === 0) {
          if (this.dashTime > 0 || Math.hypot(h.vx, h.vy) > 4.5) {
            b.hp--;
            b.cooldown = 0.7;
            h.vy = Math.max(h.vy, 8);
            this.emit("boss-hit");
            if (b.hp === 0) {
              this.bombs = [];
              if (this.rules.door === "boss") {
                this.emit("boss-down", { x: b.x, y: b.y });
              } else {
                this.lantern = { x: b.x, y: b.y };
                this.emit("lantern");
              }
            } else {
              b.y += b.rise === undefined ? 2.2 : b.rise;
              b.homeY = b.y;
            }
          } else {
            this.die();
            return;
          }
        }
      }
      for (const bomb of this.bombs) {
        bomb.vy += GRAVITY * dt;
        bomb.y += bomb.vy * dt;
        if (dist(h, bomb) < R + 0.35) {
          if (this.dashTime > 0) {
            bomb.gone = true;
            this.emit("pop", { x: bomb.x, y: bomb.y });
          } else {
            this.die();
            return;
          }
        }
        if (
          bomb.y < -3 ||
          this.platforms.some(
            (p) =>
              this.solid(p) &&
              p.type !== "slope" &&
              Math.abs(bomb.x - p.x) < p.w / 2 &&
              bomb.y - 0.35 <= p.y &&
              bomb.y > p.y - (p.h || 0.4),
          )
        ) {
          bomb.gone = true;
          this.emit("splat", { x: bomb.x, y: bomb.y });
        }
      }
      this.bombs = this.bombs.filter((b) => !b.gone);
      if (h.y < -3 || h.y > (this.level.height || 30) + 10) {
        this.die();
        return;
      }
      if (
        this.lantern &&
        !this.pumpkins.some((p) => p.alive) &&
        this.switches.every((s) => s.active) &&
        dist(h, this.lantern) < 1.2
      )
        this.win();
      else if (
        this.doorOpen() &&
        this.level.door &&
        Math.abs(h.x - this.level.door.x) < 0.7 &&
        Math.abs(h.y - this.level.door.y) < 1.2
      )
        this.win();
    }
    snapshot() {
      return {
        hero: { ...this.hero },
        level: this.level,
        platforms: this.platforms,
        pumpkins: this.pumpkins,
        objects: this.objects,
        switches: this.switches,
        boss: this.boss,
        lantern: this.lantern,
        lure: this.lure,
        echo: this.echo,
        phase: this.phase,
        phaseClock: this.phaseClock,
        launches: this.launches,
        deaths: this.deaths,
        time: this.time,
        won: this.won,
        events: this.events.slice(),
        remaining: this.pumpkins.filter((p) => p.alive).length,
        sealed: this.rules.door
          ? !this.doorOpen()
          : this.pumpkins.some((p) => p.alive) ||
            !this.hasKey ||
            !this.switches.every((s) => s.active),
        rules: this.rules,
        bombs: this.bombs,
        smashed: this.smashed(),
        support: this.support,
        zip: this.zip,
        hasKey: this.hasKey,
        dashReady: this.dashReady,
        dashTime: this.dashTime,
        canActivate: Boolean(
          this.level.mechanic &&
          (this.options.direction !== "shadow" || this.priorFlight.length),
        ),
        stars: this.score(),
      };
    }
  }
  function simulateRoute(level, route, options = {}) {
    const game = new Game(level, options);
    for (const a of route) {
      if (a.activate) game.activate();
      if (a.vx !== undefined) game.launch(a.vx, a.vy);
      const seconds = a.wait === undefined ? 4 : a.wait;
      for (let t = 0; t < seconds; t += 1 / 120) {
        if (a.dashAt !== undefined && t >= a.dashAt && game.dashReady)
          game.dash();
        game.step(1 / 120);
        if (game.won) break;
      }
      if (game.won) break;
    }
    return game;
  }
  return { Game, launchVelocity, trajectory, stars, simulateRoute, atRest, GRAVITY };
});
