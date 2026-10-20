"""Export the user's original handmade PSD art to PNGs for the browser prototype.

Reads Assets/graphics/Texture/*.psd (never writes there) and writes
Tools/design/original/assets/ plus manifest.js describing part positions.

Run from the project root:
    uv run --with psd-tools --with pillow python3 Tools/export_original_art.py
"""
import json
import os
import shutil

from PIL import Image
from psd_tools import PSDImage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "Assets", "graphics", "Texture")
OUT = os.path.join(ROOT, "Tools", "design", "original", "assets")
manifest = {}


def psd(name):
    return PSDImage.open(os.path.join(SRC, name))


def layers(doc):
    return {layer.name: layer for layer in doc.descendants()}


def render(layer):
    image = layer.composite(force=True)
    if image is None:
        raise RuntimeError("Layer %r rendered nothing" % layer.name)
    return image.convert("RGBA")


def save(image, name, scale=1.0):
    if scale != 1.0:
        size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
        image = image.resize(size, Image.LANCZOS)
    path = os.path.join(OUT, name)
    if name.endswith(".jpg"):
        image.convert("RGB").save(path, quality=86, optimize=True)
    else:
        image.save(path, optimize=True)
    return image


def trim(image):
    box = image.getchannel("A").getbbox()
    return image.crop(box) if box else image


def export_rabbit():
    # Cateracter2.psd is the assembled rabbit; every part keeps its offset from the
    # body centre so the browser can animate ears, eyes and paws independently.
    named = layers(psd("Cateracter2.psd"))
    parts = [
        ("ear_l", "Ellipse 5"), ("ear_r", "Ellipse 5 copy 2"),
        ("ear_hl_l", "Ellipse 8 copy 4"), ("ear_hl_r", "Ellipse 8 copy 5"),
        ("body", "Ellipse 7"),
        ("paw_l", "Ellipse 4 copy 3"), ("paw_r", "Ellipse 4 copy 2"),
        ("eye_l", "Ellipse 6 copy"), ("eye_r", "Ellipse 6 copy 3"),
        ("whisker_l1", "Ellipse 8 copy 2"), ("whisker_l2", "Ellipse 8 copy 3"),
        ("whisker_r1", "Ellipse 8"), ("whisker_r2", "Ellipse 8 copy"),
    ]
    body = named["Ellipse 7"].bbox
    cx, cy = (body[0] + body[2]) / 2, (body[1] + body[3]) / 2
    scale = 0.5
    out = {"bodyWidth": (body[2] - body[0]) * scale, "parts": []}
    for key, layer_name in parts:
        layer = named[layer_name]
        image = render(layer)
        save(image, "rabbit_%s.png" % key, scale)
        x0, y0 = layer.bbox[0], layer.bbox[1]
        out["parts"].append({
            "key": key,
            "x": (x0 - cx) * scale, "y": (y0 - cy) * scale,
            "w": image.width * scale, "h": image.height * scale,
        })
    # The assembled file hides its pupils; the sprite sheet keeps them visible.
    sheet = layers(psd("Cateracter2 sprite_blue.psd"))
    pupil = save(trim(render(sheet["Ellipse 9"])), "rabbit_pupil.png", scale)
    out["pupil"] = {"w": pupil.width, "h": pupil.height}
    manifest["rabbit"] = out


def export_stone():
    layer = next(iter(psd("ground_tombe.psd").descendants()))
    image = save(trim(render(layer)), "stone.png", 0.5)
    # Fraction of the image height where the walkable rim sits (the disc's top face).
    manifest["stone"] = {"w": image.width, "h": image.height, "rim": 0.3}


def export_doors():
    named = layers(psd("door_sprite_2.psd"))
    frames = sorted((l for n, l in named.items() if n.startswith("Layer")), key=lambda l: l.bbox[0])
    for i, layer in enumerate(frames):
        save(trim(render(layer)), "door_%d.png" % i)
    doc = psd("door_sprite_entring.psd")
    full = doc.composite().convert("RGBA")
    starts = [152, 309, 470, 630, 780, 927, 1097, 1262, 1442, 1633, 1820, 1986]
    for i, x in enumerate(starts):
        save(full.crop((x - 6, 55, x + 140, 240)), "enter_%d.png" % i)
    manifest["door"] = {"frames": len(frames), "enterFrames": len(starts)}


def export_pumpkin():
    image = Image.open(os.path.join(SRC, "Jack o lantern_3.png")).convert("RGBA")
    save(trim(image), "pumpkin.png", 0.5)
    named = layers(psd("Jack o lantern_3_death.psd"))
    pieces = ["Layer 9", "Layer 8", "Layer 11", "Layer 10", "Layer 13", "Layer 12"]
    for i, name in enumerate(pieces):
        save(trim(render(named[name])), "pumpkin_piece_%d.png" % i, 0.5)
    manifest["pumpkin"] = {"pieces": len(pieces)}


def export_owl():
    named = layers(psd("owl_sprite.psd"))
    for key, name in (("open", "Owl"), ("narrow", "Owl copy"), ("closed", "Owl copy 2")):
        save(trim(render(named[name])), "owl_%s.png" % key, 0.6)


def export_spider():
    named = layers(psd("Spider_sprite.psd"))
    # Crop to the solid body; the layer also carries a faint glow and leg ghosts.
    raw = render(named["Layer 0"])
    body = raw.crop(raw.getchannel("A").point(lambda a: 255 if a > 200 else 0).getbbox())
    save(body, "spider_body.png", 0.5)
    legs = []
    names = ["foot_back _left", "foot_back _right", "foot_midel1 _left", "foot_midel1 _right copy",
             "foot_midel2 _left", "foot_midel2 _right copy", "foot_uper _left", "foot_uper _right copy"]
    for i, name in enumerate(names):
        layer = named[name]
        save(render(layer), "spider_leg_%d.png" % i, 0.5)
        x0, y0, x1, y1 = layer.bbox
        legs.append({"side": "l" if "left" in name else "r",
                     "x": x0 * 0.5, "y": y0 * 0.5, "w": (x1 - x0) * 0.5, "h": (y1 - y0) * 0.5})
    # In the sheet both leg columns meet around x 272; the body sits between them.
    manifest["spider"] = {"legs": legs, "centre": {"x": 272 * 0.5, "y": 360 * 0.5},
                          "body": {"w": body.width * 0.5, "h": body.height * 0.5}}


def export_backdrop():
    doc = psd("back1.psd")
    named = layers(doc)
    width, height = doc.width, doc.height
    groups = {
        "bg_far": ["Background copy", "clouds", "clouds copy", "Layer 1", "Far_Tree",
                   "Far_Tree copy", "Far_Tree copy 2", "Tombestone", "Tombestone copy"],
        "bg_front": ["Near_tree", "Far_Tree copy 4", "Far_Tree copy 3"],
        "bg_webs": ["spider_web_left", "Spder_web_Right"],
    }
    for key, names in groups.items():
        canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        for layer in doc.descendants():
            if layer.name in names:
                image = render(layer)
                canvas.alpha_composite(image, (max(0, layer.bbox[0]), max(0, layer.bbox[1])),
                                       (max(0, -layer.bbox[0]), max(0, -layer.bbox[1])))
        save(canvas, key + (".jpg" if key == "bg_far" else ".png"), 1 / 3)
    save(trim(render(named["Spider"])), "spider_small.png", 0.5)
    manifest["backdrop"] = {"w": width / 3, "h": height / 3}


def export_ui():
    named = layers(psd("menu_next_sprite.psd"))
    for key, name in (("btn_stone", "stone"), ("btn_next", "next"), ("btn_reset", "reset"),
                      ("btn_menu", "menu"), ("star", "Layer 13")):
        save(trim(render(named[name])), key + ".png")
    # The play button's colours come from layer effects, so crop the full composite.
    doc = psd("Play_button.psd")
    full = doc.composite().convert("RGBA")
    named = layers(doc)
    save(trim(full.crop(named["Layer 3"].bbox)), "btn_play.png", 0.6)
    save(trim(full.crop(named["Layer 4"].bbox)), "btn_play_pressed.png", 0.6)
    save(trim(render(next(iter(psd("fingerhand.psd").descendants())))), "hand.png")
    cauldron = os.path.join(ROOT, "Assets", "2D Halloween Decoration", "Assets", "Sprites",
                            "Single Sprites", "Cauldron_V2.png")
    save(trim(Image.open(cauldron).convert("RGBA")), "cauldron.png", 0.5)


def copy_fonts():
    fonts = os.path.join(ROOT, "Assets", "Resources", "HN", "Fonts")
    target = os.path.join(OUT, "fonts")
    os.makedirs(target, exist_ok=True)
    for name in ("Creepster.ttf", "Creepster-OFL.txt", "LuckiestGuy.ttf", "LuckiestGuy-LICENSE.txt"):
        shutil.copyfile(os.path.join(fonts, name), os.path.join(target, name))


def main():
    os.makedirs(OUT, exist_ok=True)
    export_rabbit()
    export_stone()
    export_doors()
    export_pumpkin()
    export_owl()
    export_spider()
    export_backdrop()
    export_ui()
    copy_fonts()
    with open(os.path.join(OUT, "manifest.js"), "w") as handle:
        handle.write("/* Generated by Tools/export_original_art.py. Do not edit. */\n")
        handle.write("globalThis.HNOriginalAssets = %s;\n" % json.dumps(manifest, indent=1))
    print("Exported to", OUT)


if __name__ == "__main__":
    main()
