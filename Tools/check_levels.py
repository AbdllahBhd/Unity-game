#!/usr/bin/env python3
"""Checks that every stage in LevelLibrary.cs can be finished.

It re-implements the hero physics of the game (approximately) and searches for a chain of
launches that reaches the door. For each stage it reports:
  - whether the goal is reachable and the fewest launches found
  - whether each candy can be collected
  - whether the par of the stage is achievable

Usage (from the project root):
    python3 Tools/check_levels.py            # all stages
    python3 Tools/check_levels.py 4 7        # only stages 4 and 7
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

R = 0.45
G = 9.81 * 1.5
DT = 0.02
MAX_DRAG_SPEED = {"Izan": 16.0, "Hoot": 14.0, "Webster": 15.0, "Pip": 13.5}
BOUNCE = 0.2
FRICTION = 0.49
KILL_Y = -3.5
HALF = 6.0


# ----------------------------------------------------------------------------- parsing
class Level:
    def __init__(self):
        self.id = 0
        self.name = ""
        self.hero = "Izan"
        self.height = 20.0
        self.par = 3
        self.start = (-3.5, 0.45)
        self.smash_all = False
        self.boxes = []      # static solids: (cx, cy, w, h)
        self.crates = []     # (cx, cy, w, h)
        self.mushrooms = []  # list of box lists
        self.spikes = []     # trigger boxes
        self.candies = []
        self.keys = []
        self.minions = []    # (x, y, r)
        self.movers = []     # (cx, cy, w, h, dx, dy, period)
        self.ghosts = []     # (cx, cy, w, h, period, phase)
        self.winds = []      # (cx, cy, w, h, ax, ay)
        self.portals = []    # ((x, y), (x2, y2))
        self.bats = []       # (x, y, dx, dy, period)
        self.cauldrons = []  # (x, y, vx, vy)
        self.webs = []       # (x, y, r)
        self.door = None     # trigger box
        self.boss = None


def num(text):
    return float(text.strip().rstrip("f"))


def parse():
    source = open(LIBRARY, encoding="utf-8").read()
    levels = []
    for body in re.split(r"static LevelData Level\d+\(\)", source)[1:]:
        head = re.search(r'New\((\d+),\s*"([^"]*)",\s*HeroType\.(\w+),\s*([\d.]+)f?,\s*(\d+)\)', body)
        if not head:
            continue
        lv = Level()
        lv.id, lv.name, lv.hero = int(head.group(1)), head.group(2), head.group(3)
        lv.height, lv.par = float(head.group(4)), int(head.group(5))
        lv.boxes.append((-HALF - 0.5, lv.height / 2, 1.0, lv.height + 20))
        lv.boxes.append((HALF + 0.5, lv.height / 2, 1.0, lv.height + 20))
        lv.boxes.append((0.0, lv.height + 6.5, 14.0, 1.0))
        end = body.find("\n        }")
        for call in re.finditer(r"^\s*\.(\w+)\(([^\n]*)\)\s*;?\s*$", body[:end], re.M):
            name, raw = call.group(1), call.group(2)
            if name in ("Hint", "Decor"):
                continue
            a = [num(x) for x in raw.split(",")] if raw.strip() else []
            if name == "SmashAll":
                lv.smash_all = True
            elif name == "Start":
                lv.start = (a[0], a[1] + R)
            elif name == "Ground":
                x0, x1 = (a + [-6.0, 6.0])[:2] if len(a) >= 2 else (-6.0, 6.0)
                lv.boxes.append(((x0 + x1) / 2, -0.75, x1 - x0 - 0.06, 1.5 - 0.08))
            elif name == "Ledge":
                lv.boxes.append((a[0], a[1] - 0.3, a[2] - 0.06, 0.6 - 0.08))
            elif name == "Platform":
                h = a[3] if len(a) > 3 else 0.6
                lv.boxes.append((a[0], a[1], a[2] - 0.06, h - 0.08))
            elif name == "Candy":
                lv.candies.append((a[0], a[1]))
            elif name == "Door":
                lv.door = (a[0], a[1] + 1.0, 1.1, 1.9)
            elif name == "Key":
                lv.keys.append((a[0], a[1]))
            elif name == "Minion":
                lv.minions.append((a[0], a[1] + 0.55, 0.506))
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


# ----------------------------------------------------------------------------- simulation
class Result:
    __slots__ = ("kind", "x", "y", "t", "key", "minions", "crates", "candies", "bosshit", "ground", "stable")

    def __init__(self):
        self.kind = "dead"
        self.candies = set()
        self.bosshit = False
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
    door_open = (not lv.keys or key) and (not lv.smash_all or not minions)

    def finish(kind, ground=None, stable=True):
        res.kind, res.x, res.y, res.t = kind, x, y, t
        res.key, res.minions, res.crates = key, frozenset(minions), frozenset(crates)
        res.ground, res.stable = ground, stable
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
                door_open = (not lv.keys or key) and (not lv.smash_all or not minions)
            if hero == "Webster" and stick_cd <= 0 and (not tag or tag[0] != "mushroom"):
                stable = tag is None and ny > 0.6 and abs(box[0]) < HALF
                return finish("rest", tag, stable)
            if ny > 0.6:
                grounded = (box, tag)
        if bounced:
            continue

        # minions behave like obstacles that shatter when hit hard
        for i, m in enumerate(lv.minions):
            if i not in minions or not touches_circle(x, y, R, m[0], m[1], m[2]):
                continue
            speed = math.hypot(pvx, pvy)
            if speed > 4.5 or powered > 0:
                minions.discard(i)
                vx, vy = vx * 0.6, vy * 0.6
                door_open = (not lv.keys or key) and (not lv.smash_all or not minions)
            else:
                d = math.hypot(x - m[0], y - m[1]) or 1e-6
                nx, ny = (x - m[0]) / d, (y - m[1]) / d
                x, y = m[0] + nx * (R + m[2]), m[1] + ny * (R + m[2])
                vn = vx * nx + vy * ny
                if vn < 0:
                    vx -= vn * nx
                    vy -= vn * ny
                if ny > 0.6:
                    grounded = (None, ("minion", i))

        # triggers
        for c in lv.candies:
            if touches_circle(x, y, R, c[0], c[1], 0.5):
                res.candies.add(c)
        for k in lv.keys:
            if touches_circle(x, y, R, k[0], k[1], 0.55):
                key = True
                door_open = (not lv.keys or key) and (not lv.smash_all or not minions)
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
                    t += 0.45
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


def key_of(res):
    return (round(res.x * 1.5), round(res.y * 1.5), res.key, res.minions, res.crates)


def check(args):
    lv, samples, seed = args
    rnd = random.Random(seed * 1000 + lv.id)
    speed = MAX_DRAG_SPEED[lv.hero]
    start = {"x": lv.start[0], "y": lv.start[1], "t": 0.0, "key": False,
             "minions": frozenset(range(len(lv.minions))), "crates": frozenset(), "depth": 0, "ground": None}
    frontier = [start]
    seen = {(round(start["x"] * 1.5), round(start["y"] * 1.5), False, start["minions"], start["crates"])}
    candy_depth = {}
    win_depth = None
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
                # the player may wait before launching (not on a vanishing platform)
                on_ghost = st["ground"] is not None and st["ground"][0] == "ghost"
                s["t"] = st["t"] + (0.0 if on_ghost else rnd.uniform(0.0, 6.0))
                s["glide"] = rnd.random() < 0.7
                if st["ground"] is not None and st["ground"][0] == "mover":
                    m = lv.movers[st["ground"][1]]
                    k0, k1 = wave(st["t"], m[6]), wave(s["t"], m[6])
                    s["x"] = st["x"] + m[4] * (k1 - k0)
                    s["y"] = st["y"] + m[5] * (k1 - k0)
                if boss_heights:
                    s["boss_y"] = boss_heights[rnd.randrange(3)]
                res = simulate(lv, s, vx, vy, random_plan(lv.hero, rnd), rnd)
                if res.kind == "dead":
                    continue
                for c in res.candies:
                    candy_depth.setdefault(c, depth)
                if res.kind == "bosshit":
                    boss_depth.setdefault(s["boss_y"], depth)
                    continue
                if res.kind == "win":
                    if win_depth is None:
                        win_depth = depth
                    continue
                k = key_of(res)
                if k in seen:
                    continue
                seen.add(k)
                nxt.append({"x": res.x, "y": res.y, "t": res.t, "key": res.key, "minions": res.minions,
                            "crates": res.crates, "depth": depth, "ground": res.ground})
        done = win_depth is not None or (boss_heights and len(boss_depth) == 3)
        if done and len(candy_depth) == len(lv.candies):
            break
        if done and depth >= (win_depth or max(boss_depth.values())) + 2:
            break
        # keep the search bounded: prefer states near the goal
        if lv.door is not None:
            nxt.sort(key=lambda s: (not s["key"] and bool(lv.keys), len(s["minions"]) if lv.smash_all else 0,
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
    else:
        best = win_depth
        if win_depth is None:
            ok = False
            lines.append("    FAIL no route to the door found")
    for c in lv.candies:
        if c in candy_depth:
            lines.append("    candy (%.1f, %.1f) reachable, launch %d" % (c[0], c[1], candy_depth[c]))
        else:
            ok = False
            lines.append("    FAIL candy (%.1f, %.1f) was never collected" % c)
    par_note = ""
    if best is not None:
        if lv.par < best:
            ok = False
            par_note = "  FAIL par %d is below the best route found (%d)" % (lv.par, best)
        else:
            par_note = "  par %d" % lv.par
    head = "%s Stage %2d  %-20s %-8s best route: %s launches%s" % (
        "ok  " if ok else "FAIL", lv.id, lv.name, lv.hero, best if best is not None else "-", par_note)
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
