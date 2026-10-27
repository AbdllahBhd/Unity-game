#!/usr/bin/env python3
"""Checks that every stage in LevelLibrary.cs can be finished with three stars.

It re-implements the hero physics of the game (approximately) and searches for a chain of
launches that reaches the door. A stage passes when one route reaches the open door with
every hunter broken (pots, sleepers and rolling jars; never the trap jar) and uses the
mechanic the stage teaches: a jar pushed ("roll") where the stage has a rolling jar, the
hearth ("cannon") where it has one, Teryel trapped ("trapped") where the door waits for it.
For each stage it reports the fewest launches of such a route and when each hunter broke.

Modelled: the rolling and trap jars (part of the search state, rolling on while he waits
between launches), Teryel's patrol, touch and trap, and the door modes (always, trap).
Not modelled: pots hunting. They are checked at their home position (a fast or dashing
touch breaks them, a slow one kills), so the chase in Unity is only approximated.

Usage (from the project root):
    python3 Tools/check_levels.py            # all stages
    python3 Tools/check_levels.py 2 4        # only stages 2 and 4
    python3 Tools/check_levels.py --samples 400 --seed 3

This is a sanity check, not a proof: Unity's physics differs in details. A stage that passes here
with margin is playable; a stage that fails here needs a look.
"""
import math
import os
import random
import re
import sys
from concurrent.futures import ProcessPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIBRARY = os.path.join(ROOT, "Assets", "Scripts", "HollowNight", "Stage", "LevelLibrary.cs")
TEXT = os.path.join(ROOT, "Assets", "Scripts", "HollowNight", "Logic", "TalesText.cs")

R = 0.45
G = 9.81 * 1.5
DT = 0.02
MAX_DRAG_SPEED = {"Izan": 16.0, "Hoot": 14.0, "Webster": 15.0, "Pip": 13.5}
BOUNCE = 0.2
FRICTION = 0.49
KILL_Y = -3.5
HALF = 6.0
POT_R = 0.484      # pot trigger radius (LevelBuilder.Pot: 1.1 * 0.44)
JAR_R = 0.45       # Jar.Radius
JAR_DAMP = 0.45    # Rigidbody2D.linearDamping of a jar
STARS = 3


# ----------------------------------------------------------------------------- parsing
class Level:
    def __init__(self):
        self.id = 0
        self.name = ""
        self.hero = "Izan"
        self.height = 20.0
        self.par = 3
        self.start = (-3.5, 0.45)
        self.boxes = []      # static solids: (cx, cy, w, h)
        self.crates = []     # (cx, cy, w, h)
        self.mushrooms = []  # list of box lists
        self.spikes = []     # trigger boxes
        self.keys = []
        self.minions = []    # pots at their home position: (x, y, r, range)
        self.jars = []       # (x, y, trap)
        self.teryels = []    # (x, y, r, dx, period)
        self.door_mode = "always"
        self.movers = []     # (cx, cy, w, h, dx, dy, period)
        self.ghosts = []     # (cx, cy, w, h, period, phase)
        self.winds = []      # (cx, cy, w, h, ax, ay)
        self.portals = []    # ((x, y), (x2, y2))
        self.bats = []       # (x, y, dx, dy, period)
        self.cauldrons = []  # (x, y, vx, vy)
        self.webs = []       # (x, y, r)
        self.door = None     # trigger box
        self.boss = None

    @property
    def hunters(self):
        """Hunters that are stars: every pot and every rolling jar."""
        return len(self.minions) + sum(1 for j in self.jars if not j[2])

    @property
    def lessons(self):
        taught = set()
        if any(not j[2] for j in self.jars):
            taught.add("roll")
        if self.cauldrons:
            taught.add("cannon")
        if self.door_mode == "trap":
            taught.add("trapped")
        return taught


def num(text):
    return float(text.strip().rstrip("f"))


def stage_names():
    """English stage names from the text table (stage.N)."""
    try:
        source = open(TEXT, encoding="utf-8").read()
    except OSError:
        return {}
    return {int(m.group(1)): m.group(2) for m in re.finditer(r'Add\("stage\.(\d+)", "[^"]*", "[^"]*", "([^"]*)"', source)}


def parse():
    source = open(LIBRARY, encoding="utf-8").read()
    names = stage_names()
    levels = []
    for body in re.split(r"static LevelData Level\d+\(\)", source)[1:]:
        head = re.search(r"New\((\d+),\s*([\d.]+)f?\)", body)
        if not head:
            continue
        lv = Level()
        lv.id, lv.height = int(head.group(1)), float(head.group(2))
        lv.name = names.get(lv.id, "")
        lv.boxes.append((-HALF - 0.5, lv.height / 2, 1.0, lv.height + 20))
        lv.boxes.append((HALF + 0.5, lv.height / 2, 1.0, lv.height + 20))
        lv.boxes.append((0.0, lv.height + 6.5, 14.0, 1.0))
        end = body.find("\n        }")
        for call in re.finditer(r"^\s*\.(\w+)\(([^\n]*)\)\s*;?\s*$", body[:end], re.M):
            name, raw = call.group(1), call.group(2)
            if name in ("Hint", "Decor"):
                continue
            if name == "Rules":
                lv.door_mode = raw.strip().split(".")[-1].lower()
                continue
            a = [num(x) for x in raw.split(",")] if raw.strip() else []
            if name == "Start":
                lv.start = (a[0], a[1] + R)
            elif name == "Ground":
                x0, x1 = (a + [-6.0, 6.0])[:2] if len(a) >= 2 else (-6.0, 6.0)
                lv.boxes.append(((x0 + x1) / 2, -0.75, x1 - x0 - 0.06, 1.5 - 0.08))
            elif name == "Ledge":
                lv.boxes.append((a[0], a[1] - 0.3, a[2] - 0.06, 0.6 - 0.08))
            elif name == "Platform":
                h = a[3] if len(a) > 3 else 0.6
                lv.boxes.append((a[0], a[1], a[2] - 0.06, h - 0.08))
            elif name == "Door":
                lv.door = (a[0], a[1] + 1.0, 1.1, 1.9)
            elif name == "Key":
                lv.keys.append((a[0], a[1]))
            elif name == "Pot":
                lv.minions.append((a[0], a[1], POT_R, a[2] if len(a) > 2 else 3.2))
            elif name == "Sleeper":
                lv.minions.append((a[0], a[1] + 0.55, POT_R, 0.0))
            elif name in ("Jar", "TrapJar"):
                lv.jars.append((a[0], a[1] + JAR_R, name == "TrapJar"))
            elif name == "Teryel":
                lv.teryels.append((a[0], a[1] + a[2], a[2], a[3] if len(a) > 3 else 0.0, a[4] if len(a) > 4 else 6.0))
            elif name == "Spikes":
                lv.spikes.append((a[0], a[1] + 0.19, a[2] - 0.25, 0.34))
            elif name == "Mushroom":
                lv.mushrooms.append([(a[0], a[1] + 0.75, 1.2, 0.5), (a[0], a[1] + 0.3, 0.4, 0.6)])
            elif name == "Mover":
                lv.movers.append((a[0], a[1], a[2] - 0.06, 0.52, a[3], a[4], a[5] if len(a) > 5 else 4.0))
            elif name == "Wind":
                lv.winds.append(tuple(a[:6]))
            elif name == "Portal":
                lv.portals.append(((a[0], a[1]), (a[2], a[3])))
            elif name == "Bat":
                lv.bats.append((a[0], a[1], a[2], a[3], a[4] if len(a) > 4 else 3.0))
            elif name == "Cauldron":
                lv.cauldrons.append((a[0], a[1], a[2], a[3]))
            elif name == "Crate":
                w = a[2] if len(a) > 2 else 1.0
                h = a[3] if len(a) > 3 else 1.0
                lv.crates.append((a[0], a[1], w - 0.02, h - 0.02))
            elif name == "CrateRow":
                x = a[0]
                while x <= a[1] + 0.01:
                    lv.crates.append((x, a[2], 0.98, 0.98))
                    x += 1.0
            elif name == "Ghost":
                lv.ghosts.append((a[0], a[1], a[2] - 0.06, 0.52, a[3] if len(a) > 3 else 4.0,
                                  a[4] if len(a) > 4 else 0.0))
            elif name == "Web":
                lv.webs.append((a[0], a[1], (a[2] if len(a) > 2 else 2.0) * 0.36))
            elif name == "Boss":
                lv.boss = (a[0], a[1])
            else:
                print("  ! unknown call in LevelLibrary.cs:", name)
        levels.append(lv)
    return levels


# ----------------------------------------------------------------------------- geometry
def circle_box(px, py, r, box):
    """Returns (nx, ny, depth) if the circle overlaps the box, else None."""
    cx, cy, w, h = box
    hx, hy = w / 2, h / 2
    dx, dy = px - cx, py - cy
    qx = max(-hx, min(hx, dx))
    qy = max(-hy, min(hy, dy))
    ox, oy = dx - qx, dy - qy
    d2 = ox * ox + oy * oy
    if d2 > r * r:
        return None
    if d2 > 1e-9:
        d = math.sqrt(d2)
        return ox / d, oy / d, r - d
    # centre inside the box: push out through the nearest face
    left, right, down, up = hx + dx, hx - dx, hy + dy, hy - dy
    m = min(left, right, down, up)
    if m == up:
        return 0.0, 1.0, up + r
    if m == down:
        return 0.0, -1.0, down + r
    if m == left:
        return -1.0, 0.0, left + r
    return 1.0, 0.0, right + r


def touches_box(px, py, r, box):
    return circle_box(px, py, r, box) is not None


def touches_circle(px, py, r, cx, cy, cr):
    return (px - cx) ** 2 + (py - cy) ** 2 <= (r + cr) ** 2


def wave(t, period):
    return 0.5 - 0.5 * math.cos(t / max(0.1, period) * 2 * math.pi)


def ghost_solid(g, t):
    return ((t / max(0.5, g[4]) + g[5]) % 1.0) < 0.55


# ----------------------------------------------------------------------------- jars and Teryel
# A jar is [x, y, vx, vy, alive, fall_from, respawn_in, push_cd, grounded], as in Jar (Elements.cs).
def new_jar(j):
    return (j[0], j[1], 0.0, 0.0, True, j[1], 0.0, 0.0, True)


def teryel_at(te, t):
    return te[0] + te[3] * math.sin(t * 2 * math.pi / max(0.5, te[4])), te[1]


def teryel_kills(lv, trapped, x, y, t):
    for k, te in enumerate(lv.teryels):
        if k not in trapped:
            tx, ty = teryel_at(te, t)
            if math.hypot(x - tx, y - ty) < te[2] + R * 0.8:
                return True
    return False


def in_teryel_path(lv, trapped, x, y):
    for k, te in enumerate(lv.teryels):
        reach = te[2] + R + 0.3
        if k not in trapped and abs(x - te[0]) < abs(te[3]) + reach and abs(y - te[1]) < reach:
            return True
    return False


def jar_solids(lv, t, crates):
    solids = list(lv.boxes)
    solids += [c for i, c in enumerate(lv.crates) if i not in crates]
    solids += [(m[0] + m[4] * wave(t, m[6]), m[1] + m[5] * wave(t, m[6]), m[2], m[3]) for m in lv.movers]
    solids += [g[:4] for g in lv.ghosts if ghost_solid(g, t)]
    return solids


def shatter(lv, j, trap, trapped):
    j[4] = False
    j[6] = 1.2 if trap and len(trapped) < len(lv.teryels) else 0.0


def step_jar(lv, i, j, t, crates, minions, trapped, flags, hero):
    """One tick of jar i. hero is [x, y, vx, vy] while he flies (he can kick it), else None.
    He passes through jars (Physics2D.IgnoreCollision in Jar), so a jar never holds him up."""
    trap = lv.jars[i][2]
    if not j[4]:
        if j[6] > 0:
            j[6] -= DT
            if j[6] <= 0 and len(trapped) < len(lv.teryels):
                j[:] = list(new_jar(lv.jars[i]))
        return
    j[7] = max(0.0, j[7] - DT)
    if hero is not None and touches_circle(hero[0], hero[1], R, j[0], j[1], JAR_R):
        if j[7] <= 0:
            # Jar.Kick: the jar takes most of his horizontal speed and he hops off it.
            j[7] = 0.4
            push = hero[2] if abs(hero[2]) > 1 else math.copysign(4.0, j[0] - hero[0])
            j[2] = math.copysign(max(4.0, min(14.0, abs(push) * 0.9)), push)
            hero[2] *= 0.5
            if hero[3] < 0:
                hero[3] = 3.0
            flags.add("roll")
    was_grounded = j[8]
    j[5] = j[1] if was_grounded else max(j[5], j[1])
    damp = 1.0 / (1.0 + JAR_DAMP * DT)
    j[3] -= G * DT
    j[2] *= damp
    j[3] *= damp
    fast_x = j[2]
    j[0] += j[2] * DT
    j[1] += j[3] * DT
    if abs(j[2]) > 1.5 or j[3] < -2:
        # bowling: it breaks pots and traps Teryel
        for k, m in enumerate(lv.minions):
            if k in minions and touches_circle(j[0], j[1], JAR_R, m[0], m[1], m[2]):
                minions.discard(k)
                j[2] *= 0.85
        for k, te in enumerate(lv.teryels):
            if k not in trapped:
                tx, ty = teryel_at(te, t)
                if math.hypot(j[0] - tx, j[1] - ty) < te[2] + JAR_R:
                    trapped.add(k)
                    flags.add("trapped")
    grounded = False
    for box in jar_solids(lv, t, crates):
        hit = circle_box(j[0], j[1], JAR_R, box)
        if hit is None:
            continue
        nx, ny, depth = hit
        if ny > 0.6 and not was_grounded and j[5] - j[1] > 2.5:
            for k, m in enumerate(lv.minions):
                if k in minions and math.hypot(m[0] - j[0], m[1] - j[1]) < 1.1:
                    minions.discard(k)
            return shatter(lv, j, trap, trapped)
        if abs(nx) > 0.6 and abs(j[0]) > HALF - JAR_R - 0.1 and abs(fast_x) > 3:
            return shatter(lv, j, trap, trapped)
        j[0] += nx * depth
        j[1] += ny * depth
        vn = j[2] * nx + j[3] * ny
        if vn < 0:
            j[2] -= vn * nx
            j[3] -= vn * ny
        if ny > 0.6:
            grounded = True
    j[8] = grounded
    if j[1] < -3:
        shatter(lv, j, trap, trapped)


def jars_still(jars):
    return all((not j[4] and j[6] <= 0) or (j[8] and abs(j[2]) < 0.01 and abs(j[3]) < 0.01) for j in jars)


def wait_world(lv, state, t1):
    """Rolls the jars on while he waits at rest until t1. Returns False if Teryel walks into him."""
    if not lv.jars and not lv.teryels:
        return True
    jars = [list(j) for j in state["jars"]]
    minions, trapped, flags = set(state["minions"]), set(state["trapped"]), set(state["flags"])
    t = state["t"]
    moving = any(te[3] for te in lv.teryels)
    while t < t1 - 1e-9:
        if not moving and jars_still(jars):
            break
        t += DT
        for i, j in enumerate(jars):
            step_jar(lv, i, j, t, state["crates"], minions, trapped, flags, None)
        if teryel_kills(lv, trapped, state["x"], state["y"], t):
            return False
    state["jars"] = tuple(tuple(j) for j in jars)
    state["minions"], state["trapped"], state["flags"] = frozenset(minions), frozenset(trapped), frozenset(flags)
    return True


# ----------------------------------------------------------------------------- simulation
class Result:
    __slots__ = ("kind", "x", "y", "t", "key", "minions", "crates", "bosshit", "ground", "stable", "camped",
                 "jars", "trapped", "flags")

    def __init__(self):
        self.kind = "dead"
        self.bosshit = False
        self.camped = False
        self.ground = None
        self.stable = True


def simulate(lv, state, vx, vy, plan, rnd):
    """Flies the hero from a rest state. plan holds the ability timings."""
    x, y, t, key, minions, crates = state["x"], state["y"], state["t"], state["key"], set(state["minions"]), set(
        state["crates"])
    res = Result()
    hero = lv.hero
    used = False
    flaps = 2
    glide = 3.0
    powered = 0.0
    smashing = False
    stick_cd = 0.15
    portal_cd = 0.0
    rest_timer = 0.0
    cannon_cd = 0.0
    web_free = True   # launching from a web does not re-stick
    in_web = [touches_circle(x, y, R, w[0], w[1], w[2]) for w in lv.webs]
    flight = 0.0
    jars = [list(j) for j in state["jars"]]
    trapped, flags = set(state["trapped"]), set(state["flags"])

    def door_rule():
        return lv.door_mode == "always" or len(trapped) == len(lv.teryels)

    door_open = (not lv.keys or key) and door_rule()

    def finish(kind, ground=None, stable=True):
        res.kind, res.x, res.y, res.t = kind, x, y, t
        res.key, res.minions, res.crates = key, frozenset(minions), frozenset(crates)
        res.jars, res.trapped, res.flags = tuple(tuple(j) for j in jars), frozenset(trapped), frozenset(flags)
        res.ground, res.stable = ground, stable
        if kind == "rest":
            # a rest spot inside a live pot's hunting range is not safe to wait on
            for i, m in enumerate(lv.minions):
                if i in minions and m[3] > 0 and math.hypot(x - m[0], y - m[1]) < m[3] + m[2]:
                    res.camped, res.stable = True, False
            # Hero.Rest never saves a respawn spot inside a free Teryel's path
            if in_teryel_path(lv, trapped, x, y):
                res.stable = False
        return res

    for _ in range(int(9.0 / DT)):
        t += DT
        flight += DT
        # abilities
        for when, what in plan:
            if when <= flight < when + DT:
                if hero == "Izan" and not used:
                    used = True
                    sp = math.hypot(vx, vy)
                    if sp > 1:
                        k = max(sp + 5, 13) / sp
                        vx, vy = vx * k, vy * k
                    else:
                        vx, vy = 0.0, 13.0
                    powered = 0.45
                elif hero == "Hoot" and flaps > 0:
                    flaps -= 1
                    vy = max(vy, 0) + 6.5
                    vx += math.copysign(1.2, vx if abs(vx) > 0.2 else 1)
                elif hero == "Pip" and not used:
                    used = True
                    smashing = True
                    vx, vy = 0.0, -20.0
                elif hero == "Webster" and not used:
                    best = None
                    solids = list(lv.boxes) + [c for i, c in enumerate(lv.crates) if i not in crates]
                    solids += [(m[0] + m[4] * wave(t, m[6]), m[1] + m[5] * wave(t, m[6]), m[2], m[3]) for m in lv.movers]
                    solids += [g[:4] for g in lv.ghosts if ghost_solid(g, t)]
                    for b in solids:
                        if abs(x - b[0]) <= b[2] / 2:
                            d = (b[1] - b[3] / 2) - y
                            if 0.7 < d < 10 and (best is None or d < best):
                                best = d
                    if best is not None:
                        used = True
                        vx, vy = 0.0, math.sqrt(2 * G * best) + 3
                        stick_cd = 0.0
        if powered > 0:
            powered -= DT
        if stick_cd > 0:
            stick_cd -= DT
        if portal_cd > 0:
            portal_cd -= DT
        if cannon_cd > 0:
            cannon_cd -= DT

        # forces
        vy -= G * DT
        for w in lv.winds:
            if abs(x - w[0]) <= w[2] / 2 + R and abs(y - w[1]) <= w[3] / 2 + R:
                vx += w[4] * DT
                vy += w[5] * DT
        if hero == "Hoot" and plan and flight > plan[0][0] and glide > 0 and state.get("glide", True):
            glide -= DT
            if vy < -1.8:
                vy += (-1.8 - vy) * 0.25

        pvx, pvy = vx, vy
        x += vx * DT
        y += vy * DT

        # solids
        solids = [(b, None) for b in lv.boxes]
        solids += [(c, ("crate", i)) for i, c in enumerate(lv.crates) if i not in crates]
        for i, m in enumerate(lv.movers):
            k = wave(t, m[6])
            solids.append(((m[0] + m[4] * k, m[1] + m[5] * k, m[2], m[3]), ("mover", i)))
        for i, g in enumerate(lv.ghosts):
            if ghost_solid(g, t):
                solids.append((g[:4], ("ghost", i)))
        for i, ms in enumerate(lv.mushrooms):
            for b in ms:
                solids.append((b, ("mushroom", i)))

        grounded = None
        bounced = False
        for box, tag in solids:
            hit = circle_box(x, y, R, box)
            if hit is None:
                continue
            nx, ny, depth = hit
            impact = -(pvx * nx + pvy * ny)
            if tag and tag[0] == "crate":
                breaks = smashing or powered > 0 or (hero == "Pip" and impact > 6) or impact > 13
                if breaks and impact > 0:
                    crates.add(tag[1])
                    if smashing:
                        vx, vy = 0.0, -16.0
                    else:
                        vx, vy = pvx * 0.7, pvy * 0.7
                    continue
            x += nx * depth
            y += ny * depth
            if tag and tag[0] == "mushroom":
                vx, vy = max(-8, min(8, pvx * 0.75)), 17.0
                used, flaps, glide, smashing = False, 2, 3.0, False
                bounced = True
                rest_timer = 0.0
                continue
            vn = vx * nx + vy * ny
            if vn < 0:
                e = BOUNCE if -vn > 1.0 else 0.0
                jn = -(1 + e) * vn
                vx += jn * nx
                vy += jn * ny
                tx, ty = -ny, nx
                vt = vx * tx + vy * ty
                dv = max(-FRICTION * jn, min(FRICTION * jn, -vt))
                vx += dv * tx
                vy += dv * ty
            if smashing:
                smashing = False
                for i, c in enumerate(lv.crates):
                    if i not in crates and math.hypot(c[0] - x, c[1] - y) < 2.4 + 0.5:
                        crates.add(i)
                for i, m in enumerate(lv.minions):
                    if i in minions and math.hypot(m[0] - x, m[1] - y) < 2.4 + m[2]:
                        minions.discard(i)
            if hero == "Webster" and stick_cd <= 0 and (not tag or tag[0] != "mushroom"):
                stable = tag is None and ny > 0.6 and abs(box[0]) < HALF
                return finish("rest", tag, stable)
            if ny > 0.6:
                grounded = (box, tag)
        if bounced:
            continue

        # pots: a fast or dashing hero breaks them, a slow touch kills.
        # The hunt is not simulated; they are checked at their home position.
        for i, m in enumerate(lv.minions):
            if i not in minions or not touches_circle(x, y, R, m[0], m[1], m[2]):
                continue
            # Unity reads his speed in the trigger, after this step's collisions
            speed = math.hypot(vx, vy)
            if speed > 4.5 or powered > 0:
                minions.discard(i)
                vx, vy = vx * 0.6, vy * 0.6
            else:
                return finish("dead")

        # jars roll on, and Teryel kills on any touch, even a dash
        if jars:
            hero = [x, y, vx, vy]
            for i, j in enumerate(jars):
                step_jar(lv, i, j, t, crates, minions, trapped, flags, hero)
            x, y, vx, vy = hero
        if teryel_kills(lv, trapped, x, y, t):
            return finish("dead")
        door_open = (not lv.keys or key) and door_rule()

        # triggers
        for k in lv.keys:
            if touches_circle(x, y, R, k[0], k[1], 0.55):
                key = True
                door_open = (not lv.keys or key) and door_rule()
        for s in lv.spikes:
            if touches_box(x, y, R, s):
                return finish("dead")
        for b in lv.bats:
            k = wave(t, b[4])
            if touches_circle(x, y, R, b[0] + b[2] * k, b[1] + b[3] * k, 0.42 + 0.1):
                if powered > 0 or smashing:
                    continue
                return finish("dead")
        if portal_cd <= 0:
            for a, b in lv.portals:
                if touches_circle(x, y, R, a[0], a[1], 0.6):
                    x, y, portal_cd = b[0], b[1], 0.6
                    break
                if touches_circle(x, y, R, b[0], b[1], 0.6):
                    x, y, portal_cd = a[0], a[1], 0.6
                    break
        if cannon_cd <= 0:
            for c in lv.cauldrons:
                if touches_circle(x, y, R, c[0], c[1] + 1.05, 0.55):
                    x, y = c[0], c[1] + 1.2
                    vx, vy = c[2], c[3]
                    t += 0.4
                    flags.add("cannon")
                    cannon_cd = 0.6
                    used, flaps, glide, smashing, powered = False, 2, 3.0, False, 0.0
                    break
        for i, w in enumerate(lv.webs):
            inside = touches_circle(x, y, R, w[0], w[1], w[2])
            if inside and not in_web[i] and stick_cd <= 0:
                return finish("rest", ("web", i), False)
            in_web[i] = inside
        if lv.boss is not None and state.get("boss_y") is not None:
            bx = math.sin(t * 0.9) * 4.2
            if touches_circle(x, y, R, bx, state["boss_y"], 0.95):
                res.bosshit = True
                return finish("bosshit")
        if lv.door is not None and door_open and touches_box(x, y, R, lv.door):
            return finish("win")
        if y < KILL_Y:
            return finish("dead")

        # rest
        if grounded is not None:
            gvx = 0.0
            tag = grounded[1]
            if tag and tag[0] == "mover":
                m = lv.movers[tag[1]]
                k0, k1 = wave(t - DT, m[6]), wave(t, m[6])
                gvx = m[4] * (k1 - k0) / DT
            if math.hypot(vx - gvx, vy) < 0.6:
                rest_timer += DT
                if rest_timer >= 0.12:
                    return finish("rest", tag, tag is None)
            else:
                rest_timer = 0.0
        else:
            rest_timer = 0.0
    return finish("dead")


def random_plan(hero, rnd):
    if hero == "Izan":
        return [(rnd.uniform(0.1, 1.6), "dash")] if rnd.random() < 0.6 else []
    if hero == "Hoot":
        n = rnd.choice([0, 1, 2, 2])
        return sorted((rnd.uniform(0.2, 2.2), "flap") for _ in range(n))
    if hero == "Pip":
        return [(rnd.uniform(0.2, 1.8), "smash")] if rnd.random() < 0.6 else []
    if hero == "Webster":
        return [(rnd.uniform(0.1, 1.5), "zip")] if rnd.random() < 0.4 else []
    return []


def hunters_left(lv, minions, jars):
    return len(minions) + sum(1 for i, j in enumerate(jars) if j[4] and not lv.jars[i][2])


def key_of(res):
    jars = tuple((round(j[0] * 2), round(j[1] * 2), j[4], abs(j[2]) > 0.3) for j in res.jars)
    return (round(res.x * 1.5), round(res.y * 1.5), res.key, res.minions, res.crates, jars, res.trapped, res.flags)


def check(args):
    lv, samples, seed = args
    rnd = random.Random(seed * 1000 + lv.id)
    speed = MAX_DRAG_SPEED[lv.hero]
    lessons = lv.lessons
    start = {"x": lv.start[0], "y": lv.start[1], "t": 0.0, "key": False,
             "minions": frozenset(range(len(lv.minions))), "crates": frozenset(), "depth": 0, "ground": None,
             "jars": tuple(new_jar(j) for j in lv.jars), "trapped": frozenset(), "flags": frozenset()}
    frontier = [start]
    seen = set()
    hunter_depth = {}   # pot index, or ("jar", index) -> first launch that broke it
    camped = set()
    win_depth = None    # any win
    full_depth = None   # every hunter broken, lesson skipped
    best = None         # every hunter broken and the lesson used
    best_flags = frozenset()
    boss_depth = {}
    boss_heights = []
    if lv.boss is not None:
        boss_heights = [lv.boss[1], lv.boss[1] + 2.2, lv.boss[1] + 4.4]

    for depth in range(1, 9):
        nxt = []
        for st in frontier:
            for _ in range(samples):
                ang = rnd.uniform(0.05, math.pi - 0.05) if rnd.random() < 0.9 else rnd.uniform(-math.pi, math.pi)
                power = rnd.uniform(0.25, 1.0) ** 0.7
                vx, vy = math.cos(ang) * speed * power, math.sin(ang) * speed * power
                s = dict(st)
                # the player may wait before launching (not on a vanishing platform); jars roll on meanwhile
                on_ghost = st["ground"] is not None and st["ground"][0] == "ghost"
                s["t"] = st["t"] + (0.0 if on_ghost else rnd.uniform(0.0, 6.0))
                s["glide"] = rnd.random() < 0.7
                if st["ground"] is not None and st["ground"][0] == "mover":
                    m = lv.movers[st["ground"][1]]
                    k0, k1 = wave(st["t"], m[6]), wave(s["t"], m[6])
                    s["x"] = st["x"] + m[4] * (k1 - k0)
                    s["y"] = st["y"] + m[5] * (k1 - k0)
                s["t"], wanted = st["t"], s["t"]
                if not wait_world(lv, s, wanted):
                    continue
                s["t"] = wanted
                if boss_heights:
                    s["boss_y"] = boss_heights[rnd.randrange(3)]
                res = simulate(lv, s, vx, vy, random_plan(lv.hero, rnd), rnd)
                if res.kind == "dead":
                    continue
                for i in range(len(lv.minions)):
                    if i not in res.minions:
                        hunter_depth.setdefault(i, depth)
                for i, j in enumerate(res.jars):
                    if not j[4] and not lv.jars[i][2]:
                        hunter_depth.setdefault(("jar", i), depth)
                if res.camped:
                    camped.add((round(res.x), round(res.y)))
                if res.kind == "bosshit":
                    boss_depth.setdefault(s["boss_y"], depth)
                    continue
                if res.kind == "win":
                    win_depth = win_depth or depth
                    if hunters_left(lv, res.minions, res.jars) == 0:
                        if lessons <= res.flags:
                            if best is None:
                                best, best_flags = depth, res.flags
                        else:
                            full_depth = full_depth or depth
                    continue
                k = key_of(res)
                if k in seen:
                    continue
                seen.add(k)
                nxt.append({"x": res.x, "y": res.y, "t": res.t, "key": res.key, "minions": res.minions,
                            "crates": res.crates, "depth": depth, "ground": res.ground, "jars": res.jars,
                            "trapped": res.trapped, "flags": res.flags})
        if best is not None or (boss_heights and len(boss_depth) == 3):
            break
        # keep the search bounded: prefer states with less left to do, then near the goal
        if lv.door is not None:
            nxt.sort(key=lambda s: (hunters_left(lv, s["minions"], s["jars"])
                                    + len(lv.teryels) - len(s["trapped"]) + len(lessons - s["flags"]),
                                    not s["key"] and bool(lv.keys),
                                    math.hypot(s["x"] - lv.door[0], s["y"] - lv.door[1])))
        rnd.shuffle(nxt[30:])
        frontier = nxt[:60]
        if not frontier:
            break

    lines = []
    ok = True
    if lv.boss is not None:
        for h in boss_heights:
            if h in boss_depth:
                lines.append("    boss at height %.1f can be hit" % h)
            else:
                ok = False
                lines.append("    FAIL boss at height %.1f is never hit" % h)
        best = 3 if len(boss_depth) == 3 else None
    elif best is None:
        ok = False
        if full_depth is not None:
            lines.append("    FAIL the three-star routes found skip the lesson: %s" % ", ".join(sorted(lessons)))
        elif win_depth is not None:
            lines.append("    FAIL the door is reached, but never with every hunter broken")
        else:
            lines.append("    FAIL no route to the open door found")
    for i, m in enumerate(lv.minions):
        what = "sleeper" if m[3] == 0 else "pot"
        if i in hunter_depth:
            lines.append("    %s (%.1f, %.1f) broken, launch %d" % (what, m[0], m[1], hunter_depth[i]))
        else:
            ok = False
            lines.append("    FAIL %s (%.1f, %.1f) was never broken" % (what, m[0], m[1]))
    for i, j in enumerate(lv.jars):
        if j[2]:
            continue
        if ("jar", i) in hunter_depth:
            lines.append("    jar (%.1f, %.1f) broken, launch %d" % (j[0], j[1], hunter_depth[("jar", i)]))
        else:
            ok = False
            lines.append("    FAIL jar (%.1f, %.1f) was never broken" % (j[0], j[1]))
    if camped:
        lines.append("    note: %d rest spot(s) lie within a pot's reach, e.g. (%d, %d): leap quickly there"
                     % (len(camped), min(camped)[0], min(camped)[1]))
    used = ""
    if best is not None and lessons:
        used = "  lesson: %s" % ", ".join(sorted(lessons & best_flags))
    head = "%s Stage %2d  %-22s door %-6s 3 stars in: %s launches%s" % (
        "ok  " if ok else "FAIL", lv.id, lv.name, lv.door_mode, best if best is not None else "-", used)
    return ok, "\n".join([head] + lines)


def main():
    argv = sys.argv[1:]
    samples, seed, only = 220, 1, []
    i = 0
    while i < len(argv):
        if argv[i] == "--samples":
            samples = int(argv[i + 1])
            i += 2
        elif argv[i] == "--seed":
            seed = int(argv[i + 1])
            i += 2
        else:
            only.append(int(argv[i]))
            i += 1
    levels = [lv for lv in parse() if not only or lv.id in only]
    if not levels:
        print("no levels found in", LIBRARY)
        return 1
    with ProcessPoolExecutor() as pool:
        results = list(pool.map(check, [(lv, samples, seed) for lv in levels]))
    failed = 0
    for ok, text in results:
        print(text)
        failed += 0 if ok else 1
    print("\n%d of %d stages passed" % (len(results) - failed, len(results)))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
