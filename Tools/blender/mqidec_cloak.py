"""Simulate and render Mqidec's burnous with Blender cloth physics.

The rabbit body is an egg that only collides and holds out (it is never drawn: the
game composites the renders over the original sprite). The cloak is a wool sheet
pinned at the collar and draped by the simulation; the hood is simulated up (snug on
the head, ears through holes) or down (lying on the back). A wind field makes the
flight state. Output: PNGs with transparent film plus mapping.json, in
Tools/design/original/assets/cloak/.

Run from the project root:
    ~/Apps/blender/blender -b -P Tools/blender/mqidec_cloak.py -- idle hunted flight
Units: 1 Blender unit = 100 part pixels of the sprite (body 2.135 wide, 2.325 tall).
"""
import json
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "Tools", "design", "original", "assets", "cloak")
PX_PER_UNIT = 200  # render pixels per Blender unit (2x the part pixels)
RES = (1100, 1300)
BODY_W, BODY_H = 2.135, 2.325
SIM_FRAMES = 48
STATES = [a for a in sys.argv[sys.argv.index("--") + 1 :]] if "--" in sys.argv else ["idle", "hunted", "flight"]
SAMPLES = int(os.environ.get("CLOAK_SAMPLES", "48"))

BROWN = (0.118, 0.067, 0.036, 1)
BROWN_LIGHT = (0.22, 0.13, 0.075, 1)
BRAID = (0.035, 0.022, 0.014, 1)


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def egg_body():
    """The rabbit: an egg, narrower at the top, plus two ear capsules. Collides and holds out."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, radius=1)
    body = bpy.context.object
    body.name = "Body"
    for v in body.data.vertices:
        z = v.co.z
        taper = 1 - 0.22 * max(0, z)  # narrower towards the top, like the sprite
        v.co.x *= BODY_W / 2 * taper
        v.co.y *= BODY_W / 2 * 0.8 * taper
        v.co.z *= BODY_H / 2
    bpy.ops.object.shade_smooth()
    ears = []
    for sx in (-1, 1):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.17, depth=1.1, location=(sx * 0.72, 0.05, 1.42))
        ear = bpy.context.object
        ear.name = "Ear" + ("L" if sx < 0 else "R")
        ear.rotation_euler = (0, sx * math.radians(8), 0)
        bpy.ops.object.shade_smooth()
        ears.append(ear)
    for ob in [body] + ears:
        ob.modifiers.new("collide", "COLLISION")
        ob.collision.thickness_outer = 0.02
        ob.is_holdout = os.environ.get("CLOAK_DEBUG") is None
    # Shoulders: an unseen collider so the cloak hangs from a shoulder line and
    # flares away from the body instead of clinging to the egg.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1, location=(0, 0.12, 0.05))
    shoulders = bpy.context.object
    shoulders.name = "Shoulders"
    shoulders.scale = (1.3, 0.95, 0.28)
    shoulders.modifiers.new("collide", "COLLISION")
    shoulders.collision.thickness_outer = 0.02
    shoulders.hide_render = True
    return body, ears


def cone_sheet(name, z_top, r_top, z_bottom, r_bottom, gap_deg, rings=22, segs=64):
    """An open cone of cloth with a front gap (the open burnous)."""
    bm = bmesh.new()
    start = math.radians(-90 + gap_deg / 2)  # front is -Y; the gap is centred on it
    span = math.radians(360 - gap_deg)
    grid = []
    for i in range(rings + 1):
        t = i / rings
        z = z_top + (z_bottom - z_top) * t
        r = r_top + (r_bottom - r_top) * (t**0.85)
        row = []
        for j in range(segs + 1):
            a = start + span * j / segs
            row.append(bm.verts.new((math.cos(a) * r, math.sin(a) * r, z)))
        grid.append(row)
    for i in range(rings):
        for j in range(segs):
            bm.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    # Vertices were created ring by ring, so their indices follow the grid.
    index_grid = [[i * (segs + 1) + j for j in range(segs + 1)] for i in range(rings + 1)]
    return ob, index_grid


def vertex_groups(ob, pin_idx, edge_idx):
    pin = ob.vertex_groups.new(name="pin")
    pin.add(pin_idx, 1.0, "REPLACE")
    edge = ob.vertex_groups.new(name="braid")
    edge.add(edge_idx, 1.0, "REPLACE")


def boundary_indices(ob):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.verts.ensure_lookup_table()
    idx = [v.index for v in bm.verts if any(e.is_boundary for e in v.link_edges)]
    bm.free()
    return idx


def wool_material():
    mat = bpy.data.materials.new("Wool")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.88
    bsdf.inputs["Sheen Weight"].default_value = 0.9
    bsdf.inputs["Sheen Roughness"].default_value = 0.6
    attr = nt.nodes.new("ShaderNodeAttribute")
    attr.attribute_name = "braid"
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs["A"].default_value = BROWN
    mix.inputs["B"].default_value = BRAID
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 180
    noise.inputs["Detail"].default_value = 6
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.18
    shade = nt.nodes.new("ShaderNodeMix")
    shade.data_type = "RGBA"
    shade.inputs["A"].default_value = BROWN
    shade.inputs["B"].default_value = BROWN_LIGHT
    noise2 = nt.nodes.new("ShaderNodeTexNoise")
    noise2.inputs["Scale"].default_value = 9
    nt.links.new(noise2.outputs["Fac"], shade.inputs["Factor"])
    nt.links.new(shade.outputs["Result"], mix.inputs["A"])
    nt.links.new(attr.outputs["Fac"], mix.inputs["Factor"])
    nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def cloth(ob, pin="pin", mass=0.45, tension=12, bending=0.9, wind=None):
    mod = ob.modifiers.new("cloth", "CLOTH")
    s = mod.settings
    s.quality = 10
    s.mass = mass
    s.tension_stiffness = tension
    s.compression_stiffness = tension
    s.shear_stiffness = tension * 0.6
    s.bending_stiffness = bending
    s.tension_damping = 5
    s.bending_damping = 0.5
    s.air_damping = 1.2
    s.vertex_group_mass = pin
    mod.collision_settings.use_self_collision = True
    mod.collision_settings.distance_min = 0.02
    mod.collision_settings.self_distance_min = 0.015
    mod.collision_settings.collision_quality = 4
    sub = ob.modifiers.new("smooth", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2
    return mod


def lights():
    bpy.ops.object.light_add(type="AREA", location=(-3.5, -5, 4))
    key = bpy.context.object
    key.data.energy = 260
    key.data.size = 4
    key.data.color = (1.0, 0.95, 0.88)
    key.rotation_euler = (math.radians(52), 0, math.radians(-30))
    bpy.ops.object.light_add(type="AREA", location=(3.5, 4, 2))
    rim = bpy.context.object
    rim.data.energy = 220
    rim.data.size = 3
    rim.data.color = (0.66, 0.76, 1.0)
    rim.rotation_euler = (math.radians(-110), 0, math.radians(40))
    bpy.ops.object.light_add(type="AREA", location=(0, -6, -2))
    fill = bpy.context.object
    fill.data.energy = 40
    fill.data.size = 6
    fill.data.color = (0.75, 0.8, 1.0)
    fill.rotation_euler = (math.radians(100), 0, 0)
    world = bpy.data.worlds.new("W")
    bpy.context.scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.02, 0.025, 0.04, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.6


def camera():
    bpy.ops.object.camera_add(location=(0, -12, 0), rotation=(math.radians(90), 0, 0))
    cam = bpy.context.object
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = RES[0] / PX_PER_UNIT
    cam.data.clip_end = 100
    bpy.context.scene.camera = cam


def build_cloak(state):
    """Cloak pinned at the collar; the front gap keeps it open."""
    ob, grid = cone_sheet("Cloak", z_top=0.3, r_top=1.06, z_bottom=-1.14, r_bottom=1.8, gap_deg=40)
    pin_idx = grid[0] + grid[1]
    vertex_groups(ob, pin_idx, boundary_indices(ob))
    ob.data.materials.append(bpy.data.materials["Wool"])
    cloth(ob)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.shade_smooth()
    if state == "flight":
        bpy.ops.object.effector_add(type="WIND", location=(-4, 0, -0.4), rotation=(0, math.radians(90), 0))
        wind = bpy.context.object
        wind.field.strength = 11
        wind.field.flow = 0.6
        wind.field.noise = 0.4
    return ob


def build_hood(state):
    """A cap fitted to the head, with a face opening, ear holes and a short point at
    the back. Placed statically (a snug hood barely moves); only the cloak simulates."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=40, radius=1.0, location=(0, -0.22, 0.6))
    hood = bpy.context.object
    hood.name = "Hood"
    # Match the egg: a little wider than the head in x and z, shallower in y.
    hood.scale = (1.14, 1.05, 1.18)
    bm = bmesh.new()
    bm.from_mesh(hood.data)
    bm.verts.ensure_lookup_table()
    doomed = []
    for v in bm.verts:
        p = v.co
        if p.z < -0.12 or (p.z < 0.05 and p.y < -0.3):
            doomed.append(v)  # below the collar; lower in front than at the back
            continue
        # The face window: an ellipse seen from the front, only on the front half.
        window = p.y < 0 and (p.x / 0.52) ** 2 + ((p.z + 0.1) / 0.62) ** 2 < 1
        # Ear slits: small ellipses where the ears come through, front half only.
        ear = p.y < 0.3 and any((((p.x - sx * 0.63) / 0.15) ** 2 + ((p.z - 0.8) / 0.2) ** 2) < 1 for sx in (-1, 1))
        if window or ear:
            doomed.append(v)
    bmesh.ops.delete(bm, geom=doomed, context="VERTS")
    for v in bm.verts:  # the crown gathers into a short point leaning back
        p = v.co
        if p.z > 0.55:
            k = (p.z - 0.55) / 0.45
            v.co.y += 0.5 * k * k
            v.co.z += 0.28 * k * k
    bm.to_mesh(hood.data)
    bm.free()
    vertex_groups(hood, [], boundary_indices(hood))
    hood.data.materials.append(bpy.data.materials["Wool"])
    sub = hood.modifiers.new("smooth", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2
    # Creases: a displacement from noise so the cloth does not read as a smooth shell.
    tex = bpy.data.textures.new("creases", "CLOUDS")
    tex.noise_scale = 0.35
    disp = hood.modifiers.new("creases", "DISPLACE")
    disp.texture = tex
    disp.strength = 0.045
    disp.mid_level = 0.5
    if state != "hunted":
        # Down: the hood lies on the back of the shoulders, opening up, wider than
        # the body so its edges show past the sides; the point hangs to the right.
        hood.rotation_euler = (math.radians(-100), 0, math.radians(15))
        hood.location = (0.1, 0.55, 0.0)
        hood.scale = (1.3, 1.0, 0.9)
    bpy.context.view_layer.objects.active = hood
    bpy.ops.object.shade_smooth()
    return hood


def render(state):
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = SIM_FRAMES
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = RES
    scene.render.film_transparent = True
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "AgX"
    for f in range(1, SIM_FRAMES + 1):  # step the simulation to its settled frame
        scene.frame_set(f)
    os.makedirs(OUT, exist_ok=True)
    suffix = "_debug" if os.environ.get("CLOAK_DEBUG") else ""
    scene.render.filepath = os.path.join(OUT, f"cloak_{state}{suffix}.png")
    bpy.ops.render.render(write_still=True)


def main():
    for state in STATES:
        clear()
        wool_material()
        egg_body()
        build_cloak(state)
        build_hood(state)
        lights()
        camera()
        render(state)
        print("CLOAK RENDERED", state)
    with open(os.path.join(OUT, "mapping.json"), "w") as fh:
        json.dump({"pxPerUnit": PX_PER_UNIT, "width": RES[0], "height": RES[1], "partPxPerUnit": 100}, fh)


main()
