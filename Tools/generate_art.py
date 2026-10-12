#!/usr/bin/env python3
"""Generates the Hollow Night sprite set into Assets/Resources/HN/ (with Unity .meta files).

Run from the project root:  python3 Tools/generate_art.py
Requires Pillow. Re-running overwrites the PNGs but keeps existing .meta GUIDs.
"""
import hashlib
import math
import os
import random
import shutil

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "Assets", "Resources", "HN")
DECO = os.path.join(ROOT, "Assets", "2D Halloween Decoration", "Assets", "Sprites", "Single Sprites")
LEGACY_PUMPKIN = os.path.join(ROOT, "Assets", "graphics", "Texture", "Jack o lantern_3.png")
SS = 4  # supersampling factor

META = """fileFormatVersion: 2
guid: {guid}
TextureImporter:
  internalIDToNameTable: []
  externalObjects: {{}}
  serializedVersion: 11
  mipmaps:
    mipMapMode: 0
    enableMipMap: 0
    sRGBTexture: 1
    linearTexture: 0
    fadeOut: 0
    borderMipMap: 0
    mipMapsPreserveCoverage: 0
    alphaTestReferenceValue: 0.5
    mipMapFadeDistanceStart: 1
    mipMapFadeDistanceEnd: 3
  bumpmap:
    convertToNormalMap: 0
    externalNormalMap: 0
    heightScale: 0.25
    normalMapFilter: 0
  isReadable: 0
  streamingMipmaps: 0
  streamingMipmapsPriority: 0
  grayScaleToAlpha: 0
  generateCubemap: 6
  cubemapConvolution: 0
  seamlessCubemap: 0
  textureFormat: 1
  maxTextureSize: 2048
  textureSettings:
    serializedVersion: 2
    filterMode: 1
    aniso: -1
    mipBias: -100
    wrapU: 1
    wrapV: 1
    wrapW: 1
  nPOTScale: 0
  lightmap: 0
  compressionQuality: 50
  spriteMode: 1
  spriteExtrude: 1
  spriteMeshType: 0
  alignment: 0
  spritePivot: {{x: 0.5, y: 0.5}}
  spritePixelsToUnits: 100
  spriteBorder: {{x: {b}, y: {b}, z: {b}, w: {b}}}
  spriteGenerateFallbackPhysicsShape: 1
  alphaUsage: 1
  alphaIsTransparency: 1
  spriteTessellationDetail: -1
  textureType: 8
  textureShape: 1
  singleChannelComponent: 0
  maxTextureSizeSet: 0
  compressionQualitySet: 0
  textureFormatSet: 0
  applyGammaDecoding: 1
  platformSettings:
  - serializedVersion: 3
    buildTarget: DefaultTexturePlatform
    maxTextureSize: 2048
    resizeAlgorithm: 0
    textureFormat: -1
    textureCompression: 1
    compressionQuality: 50
    crunchedCompression: 0
    allowsAlphaSplitting: 0
    overridden: 0
    androidETC2FallbackOverride: 0
    forceMaximumCompressionQuality_BC6H_BC7: 1
  spriteSheet:
    serializedVersion: 2
    sprites: []
    outline: []
    physicsShape: []
    bones: []
    spriteID: 5e97eb03825dee720800000000000000
    internalID: 0
    vertices: []
    indices:
    edges: []
    weights: []
    secondaryTextures: []
  spritePackingTag:
  pSDRemoveMatte: 0
  pSDShowRemoveMatteOption: 0
  userData:
  assetBundleName:
  assetBundleVariant:
"""


def guid_for(name):
    return hashlib.md5(("hollow-night/" + name).encode()).hexdigest()


def write_meta(path, name, border=0):
    meta = path + ".meta"
    if os.path.exists(meta):
        return
    with open(meta, "w", newline="\n") as f:
        f.write(META.format(guid=guid_for(name), b=border))


def save(img, name, border=0, ss=SS):
    if ss > 1:
        img = img.resize((img.width // ss, img.height // ss), Image.LANCZOS)
    path = os.path.join(OUT, name + ".png")
    img.save(path)
    write_meta(path, name, border)
    return img


# ----------------------------------------------------------------------------- helpers
def rgb(h, a=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def canvas(w, h, ss=SS):
    return Image.new("RGBA", (w * ss, h * ss), (0, 0, 0, 0))


def new_mask(img):
    m = Image.new("L", img.size, 0)
    return m, ImageDraw.Draw(m)


def P(v, ss=SS):
    return v * ss


def ell(d, cx, cy, rx, ry, fill=255):
    d.ellipse([P(cx - rx), P(cy - ry), P(cx + rx), P(cy + ry)], fill=fill)


def rot_ell(d, cx, cy, rx, ry, deg, fill=255, n=48):
    a = math.radians(deg)
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x, y = rx * math.cos(t), ry * math.sin(t)
        pts.append((P(cx + x * math.cos(a) - y * math.sin(a)), P(cy + x * math.sin(a) + y * math.cos(a))))
    d.polygon(pts, fill=fill)


def poly(d, pts, fill=255):
    d.polygon([(P(x), P(y)) for x, y in pts], fill=fill)


def rrect(d, x0, y0, x1, y1, r, fill=255):
    d.rounded_rectangle([P(x0), P(y0), P(x1), P(y1)], radius=P(r), fill=fill)


def line(d, pts, w, fill=255):
    pp = [(P(x), P(y)) for x, y in pts]
    d.line(pp, fill=fill, width=int(P(w)), joint="curve")
    r = P(w) / 2
    for x, y in pp:
        d.ellipse([x - r, y - r, x + r, y + r], fill=fill)


def curve(p0, p1, p2, n=16):
    """Quadratic bezier points."""
    out = []
    for i in range(n + 1):
        t = i / n
        out.append(((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
                    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]))
    return out


def round_gradient():
    """255 at the centre falling to exactly 0 on the inscribed circle (no square corners)."""
    return ImageChops.invert(Image.radial_gradient("L").point(lambda v: min(255, int(v * 1.4143))))


def radial(size, cx, cy, r):
    g = round_gradient().resize((max(2, int(2 * r)), max(2, int(2 * r))))
    out = Image.new("L", size, 0)
    out.paste(g, (int(cx - r), int(cy - r)))
    return out


def dilate(mask, px):
    if px <= 0:
        return mask
    return mask.filter(ImageFilter.GaussianBlur(px * 0.6)).point(lambda v: 255 if v > 18 else 0).filter(
        ImageFilter.GaussianBlur(1.2))


def scale_alpha(mask, k):
    return mask.point(lambda v: int(v * k))


def paint(img, mask, base, hi=None, lo=None, outline=None, ow=3.0, hi_pos=(0.35, 0.28)):
    """Composites a shaded, outlined shape described by mask onto img."""
    bb = mask.getbbox()
    if not bb:
        return
    x0, y0, x1, y1 = bb
    w, h = x1 - x0, y1 - y0
    if outline is not None:
        om = dilate(mask, P(ow))
        img.paste(Image.new("RGBA", img.size, rgb(outline)), (0, 0), om)
    col = Image.new("RGBA", img.size, rgb(base))
    if lo is not None:
        lm = ImageChops.invert(radial(img.size, x0 + w * 0.45, y0 + h * 0.2, max(w, h) * 1.05))
        col.paste(Image.new("RGBA", img.size, rgb(lo)), (0, 0), scale_alpha(lm, 0.9))
    if hi is not None:
        hm = radial(img.size, x0 + w * hi_pos[0], y0 + h * hi_pos[1], max(w, h) * 0.55)
        col.paste(Image.new("RGBA", img.size, rgb(hi)), (0, 0), scale_alpha(hm, 0.85))
    img.paste(col, (0, 0), mask)


def shape(img, fn, base, hi=None, lo=None, outline=None, ow=3.0, hi_pos=(0.35, 0.28)):
    m, d = new_mask(img)
    fn(d)
    paint(img, m, base, hi, lo, outline, ow, hi_pos)
    return m


def flat(img, fn, color):
    m, d = new_mask(img)
    fn(d)
    img.paste(Image.new("RGBA", img.size, rgb(color) if isinstance(color, str) else color), (0, 0), m)


def glow_layer(img, fn, color, blur, strength=1.0):
    m, d = new_mask(img)
    fn(d)
    m = scale_alpha(m.filter(ImageFilter.GaussianBlur(P(blur))), strength)
    layer = Image.new("RGBA", img.size, rgb(color))
    layer.putalpha(m)
    return Image.alpha_composite(img, layer)


def under(img, layer_fn):
    """Draws layer_fn on a fresh layer and puts it underneath img."""
    back = Image.new("RGBA", img.size, (0, 0, 0, 0))
    layer_fn(back)
    return Image.alpha_composite(back, img)


# ----------------------------------------------------------------------------- faces
def eye(img, cx, cy, r, expr, iris="#2a1a4a", look=(0, 0), side=1):
    if expr == "blink":
        flat(img, lambda d: line(d, curve((cx - r, cy), (cx, cy + r * 0.7), (cx + r, cy)), 3.2), "#1b1030")
        return
    if expr == "happy":
        flat(img, lambda d: line(d, curve((cx - r, cy + r * 0.3), (cx, cy - r * 0.9), (cx + r, cy + r * 0.3)), 3.6),
             "#1b1030")
        return
    if expr == "hurt":
        flat(img, lambda d: line(d, [(cx - r * 0.8, cy - r * 0.8), (cx + r * 0.8, cy + r * 0.8)], 3.4), "#1b1030")
        flat(img, lambda d: line(d, [(cx - r * 0.8, cy + r * 0.8), (cx + r * 0.8, cy - r * 0.8)], 3.4), "#1b1030")
        return
    ry = r * (1.18 if expr == "fly" else 1.08)
    shape(img, lambda d: ell(d, cx, cy, r, ry), "#ffffff", None, "#cfd8ee", "#1b1030", 2.0)
    pr = r * (0.5 if expr == "fly" else 0.58)
    px, py = cx + look[0] * r * 0.3, cy + look[1] * r * 0.3 + r * 0.08
    flat(img, lambda d: ell(d, px, py, pr, pr * 1.1), iris)
    flat(img, lambda d: ell(d, px, py + pr * 0.1, pr * 0.55, pr * 0.62), "#0b0616")
    flat(img, lambda d: ell(d, px - pr * 0.35, py - pr * 0.45, pr * 0.32, pr * 0.32), "#ffffff")
    flat(img, lambda d: ell(d, px + pr * 0.35, py + pr * 0.4, pr * 0.15, pr * 0.15), "#ffffff")
    if expr == "angry":
        flat(img, lambda d: poly(d, [(cx - r * 1.3 * side, cy - ry * 1.5), (cx + r * 1.3 * side, cy - ry * 0.55),
                                     (cx + r * 1.3 * side, cy - ry * 1.6)]), "#1b1030")


def mouth(img, cx, cy, w, expr, fang=False):
    dark = "#1b1030"
    if expr in ("idle", "blink"):
        flat(img, lambda d: line(d, curve((cx - w, cy), (cx, cy + w * 0.9), (cx + w, cy)), 3.0), dark)
    elif expr == "happy":
        shape(img, lambda d: poly(d, curve((cx - w * 1.3, cy - 2), (cx, cy + w * 2.3), (cx + w * 1.3, cy - 2))),
              "#7a1533", None, None, dark, 2.2)
        flat(img, lambda d: ell(d, cx, cy + w * 0.95, w * 0.55, w * 0.32), "#ff7d9c")
    elif expr == "fly":
        shape(img, lambda d: ell(d, cx, cy + w * 0.3, w * 0.62, w * 0.8), "#7a1533", None, None, dark, 2.2)
        flat(img, lambda d: ell(d, cx, cy + w * 0.7, w * 0.36, w * 0.3), "#ff7d9c")
    elif expr == "hurt":
        pts = [(cx - w + i * w / 3, cy + (3 if i % 2 else -3)) for i in range(7)]
        flat(img, lambda d: line(d, pts, 3.0), dark)
    elif expr == "angry":
        shape(img, lambda d: poly(d, curve((cx - w * 1.2, cy + w * 0.5), (cx, cy - w * 0.9), (cx + w * 1.2, cy + w * 0.5))
                                  + [(cx + w * 0.8, cy + w * 0.9), (cx - w * 0.8, cy + w * 0.9)]),
              "#3a0b22", None, None, dark, 2.0)
    if fang:
        for s in (-1, 1):
            flat(img, lambda d: poly(d, [(cx + s * w * 0.55 - 3, cy + 1), (cx + s * w * 0.55 + 3, cy + 1),
                                         (cx + s * w * 0.55, cy + 9)]), "#ffffff")


def cheeks(img, cx, cy, dx, r, color="#ff8fb0"):
    for s in (-1, 1):
        m, d = new_mask(img)
        ell(d, cx + s * dx, cy, r, r * 0.65)
        m = scale_alpha(m.filter(ImageFilter.GaussianBlur(P(2))), 0.55)
        img.paste(Image.new("RGBA", img.size, rgb(color)), (0, 0), m)


def shadow(img, cx, cy, rx, ry=7):
    def fn(back):
        m, d = new_mask(back)
        ell(d, cx, cy, rx, ry)
        m = scale_alpha(m.filter(ImageFilter.GaussianBlur(P(3))), 0.35)
        back.paste(Image.new("RGBA", back.size, (0, 0, 0, 255)), (0, 0), m)
    return under(img, fn)


EXPRS = ["idle", "blink", "fly", "happy", "hurt"]


# ----------------------------------------------------------------------------- heroes
def glow_eye(img, cx, cy, r, expr, look=(0, 0)):
    """Izan's eyes: solid glowing white, no iris, like the original rabbit."""
    white = "#ffffff"
    if expr == "blink":
        img2 = glow_layer(img, lambda d: line(d, curve((cx - r, cy), (cx, cy + r * 0.6), (cx + r, cy)), 4.0), white, 3, 0.7)
        img.paste(img2)
        flat(img, lambda d: line(d, curve((cx - r, cy), (cx, cy + r * 0.6), (cx + r, cy)), 4.0), white)
        return
    if expr == "happy":
        pts = curve((cx - r, cy + r * 0.3), (cx, cy - r * 0.9), (cx + r, cy + r * 0.3))
        img.paste(glow_layer(img, lambda d: line(d, pts, 4.4), white, 3, 0.7))
        flat(img, lambda d: line(d, pts, 4.4), white)
        return
    if expr == "hurt":
        a = [(cx - r * 0.8, cy - r * 0.8), (cx + r * 0.8, cy + r * 0.8)]
        b = [(cx - r * 0.8, cy + r * 0.8), (cx + r * 0.8, cy - r * 0.8)]
        img.paste(glow_layer(img, lambda d: (line(d, a, 4.0), line(d, b, 4.0)), white, 3, 0.7))
        flat(img, lambda d: line(d, a, 4.0), white)
        flat(img, lambda d: line(d, b, 4.0), white)
        return
    ry = r * (1.3 if expr == "fly" else 1.2)
    ex, ey = cx + look[0] * r * 0.25, cy + look[1] * r * 0.25
    img.paste(glow_layer(img, lambda d: ell(d, ex, ey, r * 1.1, ry * 1.1), "#dff4ff", 5, 0.8))
    shape(img, lambda d: ell(d, ex, ey, r, ry), "#f4fbff", "#ffffff", "#d6e9ff", None, 0, (0.4, 0.3))
    flat(img, lambda d: ell(d, ex - r * 0.3, ey - ry * 0.35, r * 0.22, r * 0.22), "#ffffff")


def izan(expr):
    """The black rabbit from the first prototype: egg body, tall ears, glowing eyes, pale belly."""
    img = canvas(256, 256)
    base, hi, lo, out = "#17141f", "#3b3648", "#06050a", "#000000"
    ear_rot = {"fly": 34, "hurt": 24, "happy": 6}.get(expr, 10)
    ear_len = 62 if expr != "fly" else 66
    for s in (-1, 1):
        ex, ey = 128 + s * 40, 92 - (4 if expr == "happy" else 0)
        cx_e, cy_e = ex + s * ear_rot * 0.5, ey - ear_len * 0.5
        shape(img, lambda d: rot_ell(d, cx_e, cy_e, 19, ear_len, s * ear_rot), base, hi, lo, out, 3.2)
        flat(img, lambda d: rot_ell(d, cx_e, cy_e + 6, 8, ear_len * 0.62, s * ear_rot), "#2c2838")
    for s in (-1, 1):
        shape(img, lambda d: ell(d, 128 + s * 40, 228, 26, 14), base, hi, lo, out, 3.0)
    ry = 92 if expr != "fly" else 86
    shape(img, lambda d: ell(d, 128, 150, 84, ry), base, hi, lo, out, 3.4, (0.35, 0.22))
    # pale belly: two soft bumps low on the body
    for s in (-1, 1):
        shape(img, lambda d: ell(d, 128 + s * 22, 212, 28, 20), "#eef0f6", "#ffffff", "#c9cde0", None, 0, (0.5, 0.3))
    for s in (-1, 1):
        glow_eye(img, 128 + s * 32, 136, 19, expr, (0.3 * s if expr == "fly" else 0, 0))
    # white whisker streaks on the cheeks
    for s in (-1, 1):
        for i in range(2):
            y0 = 164 + i * 10
            flat(img, lambda d: line(d, [(128 + s * 52, y0), (128 + s * 70, y0 - 6)], 3.0), "#e8e8f0")
    if expr in ("idle", "blink"):
        flat(img, lambda d: line(d, curve((118, 172), (128, 180), (138, 172)), 3.0), "#e8e8f0")
    else:
        mouth(img, 128, 174, 10, expr)
    return shadow(img, 128, 242, 68)


def hoot(expr):
    img = canvas(256, 256)
    out = "#2e1708"
    spread = expr in ("fly", "happy")
    for s in (-1, 1):
        if spread:
            pts = [(128 + s * 60, 120), (128 + s * 124, 66), (128 + s * 118, 110), (128 + s * 126, 132),
                   (128 + s * 108, 150), (128 + s * 112, 176), (128 + s * 64, 180)]
            shape(img, lambda d: poly(d, pts), "#7a4a2a", "#b98556", "#4a2a14", out, 3.2)
        else:
            shape(img, lambda d: rot_ell(d, 128 + s * 82, 166, 26, 58, s * -12), "#7a4a2a", "#b98556", "#4a2a14", out,
                  3.2)
    for s in (-1, 1):
        shape(img, lambda d: poly(d, [(128 + s * 30, 86), (128 + s * 84, 38), (128 + s * 80, 110)]),
              "#8a5a3c", "#c79a6a", "#4a2a14", out, 3.2)
    for s in (-1, 1):
        shape(img, lambda d: ell(d, 128 + s * 30, 232, 22, 11), "#ff9a2e", "#ffd27a", "#c25a00", out, 2.6)
    shape(img, lambda d: ell(d, 128, 152, 84, 84), "#9a6541", "#d6a877", "#5b3518", out, 3.4)
    shape(img, lambda d: ell(d, 128, 182, 52, 50), "#f3dfb8", "#fff6e0", "#d9b985")
    for row in range(3):
        for col in range(-1, 2):
            cx, cy = 128 + col * 26 + (13 if row % 2 else 0) - 6, 170 + row * 17
            flat(img, lambda d: line(d, [(cx - 7, cy), (cx, cy + 6), (cx + 7, cy)], 2.4), "#c89b62")
    for s in (-1, 1):
        shape(img, lambda d: ell(d, 128 + s * 36, 126, 33, 33), "#f7e6c4", "#ffffff", "#d9b985", out, 2.4)
        eye(img, 128 + s * 36, 127, 22, expr, "#e08a00", (-0.2 * s, 0), s)
    shape(img, lambda d: poly(d, [(116, 146), (140, 146), (128, 168)]), "#ff9a2e", "#ffd27a", "#c25a00", out, 2.4)
    if expr == "hurt":
        mouth(img, 128, 176, 10, "hurt")
    return shadow(img, 128, 244, 64)


def webster(expr):
    img = canvas(256, 256)
    out = "#160a2b"
    lift = -16 if expr in ("fly", "happy") else 0
    for s in (-1, 1):
        for i, (ang, ln) in enumerate([(-38, 96), (-12, 104), (14, 100), (40, 88)]):
            a = math.radians(ang)
            sx, sy = 128 + s * 60 * math.cos(a), 150 + 60 * math.sin(a) * 0.9
            kx, ky = 128 + s * ln * math.cos(a), 150 + ln * math.sin(a) - 34 + lift
            fx, fy = 128 + s * (ln + 12) * math.cos(a) + s * 6, 150 + ln * math.sin(a) + 40 + lift * (1 if i < 2 else -0.5)
            pts = curve((sx, sy), (kx, ky), (fx, min(fy, 246)), 14)
            flat(img, lambda d: line(d, pts, 13), out)
            flat(img, lambda d: line(d, pts, 7.5), "#6b45a6")
    shape(img, lambda d: ell(d, 128, 170, 62, 56), "#5b3b8c", "#9c7bd6", "#2d1a52", out, 3.4)
    shape(img, lambda d: ell(d, 128, 136, 70, 62), "#6b45a6", "#b597ea", "#38206a", out, 3.4)
    flat(img, lambda d: poly(d, [(128, 188), (140, 204), (128, 222), (116, 204)]), "#ffcf4a")
    for s in (-1, 1):
        eye(img, 128 + s * 30, 128, 22, expr, "#c02a6a", (0, 0.1), s)
        if expr not in ("blink", "happy", "hurt"):
            shape(img, lambda d: ell(d, 128 + s * 58, 102, 8, 8), "#ffffff", None, None, out, 1.8)
            flat(img, lambda d: ell(d, 128 + s * 58, 103, 4, 4), "#0b0616")
    cheeks(img, 128, 154, 52, 11, "#ff79b5")
    mouth(img, 128, 158, 12, expr, fang=expr in ("idle", "blink", "happy"))
    return shadow(img, 128, 246, 84)


def pip(expr):
    img = canvas(256, 256)
    out = "#5a1e00"
    for s in (-1, 1):
        shape(img, lambda d: ell(d, 128 + s * 46, 232, 28, 13), "#d95f00", "#ffa54a", "#9a3b00", out, 3.0)
    squash = 8 if expr == "fly" else 0
    body = shape(img, lambda d: ell(d, 128, 160, 100 - squash, 74 + squash), "#ff8a1e", "#ffd07a", "#c24a00", out, 3.6)
    seg = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(seg)
    for off, rx in ((0, 34), (-46, 30), (46, 30)):
        sd.ellipse([P(128 + off - rx), P(160 - 74 - squash), P(128 + off + rx), P(160 + 74 + squash)],
                   outline=(150, 60, 0, 120), width=int(P(2.4)))
    seg.putalpha(ImageChops.multiply(seg.getchannel("A"), body))
    img = Image.alpha_composite(img, seg)
    shape(img, lambda d: poly(d, [(118, 94), (122, 58), (142, 52), (140, 94)]), "#4f8f2a", "#9fd65a", "#2d5a12",
          "#173408", 3.0)
    leaf = curve((138, 70), (176, 30), (204, 62), 12) + curve((204, 62), (176, 80), (138, 70), 12)
    shape(img, lambda d: poly(d, leaf), "#5fae32", "#b5ec6a", "#2d5a12", "#173408", 2.8)
    flat(img, lambda d: line(d, curve((142, 68), (172, 52), (198, 62)), 1.8), "#2d5a12")
    for s in (-1, 1):
        eye(img, 128 + s * 36, 146, 22, expr, "#6a2a00", (0, 0), s)
    cheeks(img, 128, 176, 62, 13, "#ff5a5a")
    mouth(img, 128, 180, 15, expr)
    return shadow(img, 128, 244, 84)


# ----------------------------------------------------------------------------- villain + enemies
def morgra(expr):
    img = canvas(320, 320)
    out = "#12071f"
    # broom
    straw = [(248, 214), (314, 186), (318, 214), (316, 244), (312, 268), (248, 240)]
    shape(img, lambda d: poly(d, straw), "#e0b04a", "#ffe08a", "#9a6a14", out, 3.0)
    for i in range(5):
        y = 196 + i * 15
        flat(img, lambda d: line(d, [(258, 220 + i * 4), (310, y)], 1.6), "#9a6a14")
    shape(img, lambda d: rrect(d, 20, 218, 262, 236, 8), "#8a5a2c", "#c58f52", "#4a2a0c", out, 3.0)
    shape(img, lambda d: rrect(d, 238, 210, 256, 244, 5), "#c0392b", "#ff7a66", "#7a1a10", out, 2.4)
    # cape + robe
    shape(img, lambda d: poly(d, [(150, 130), (250, 170), (236, 250), (160, 232)]), "#4a1d73", "#7b3fb0", "#250b3d",
          out, 3.0)
    shape(img, lambda d: poly(d, [(96, 144), (192, 138), (220, 244), (84, 244)]), "#6a2ba0", "#a566e0", "#32104f", out,
          3.2)
    shape(img, lambda d: rrect(d, 92, 196, 214, 210, 5), "#ffcf4a", "#fff0a0", "#b8860b", out, 2.0)
    # boots
    shape(img, lambda d: poly(d, [(88, 240), (128, 240), (128, 270), (70, 272), (62, 262)]), "#1d1230", "#4a3a6a",
          "#0a0614", out, 2.6)
    # hands
    shape(img, lambda d: ell(d, 84, 214, 15, 13), "#8fd14f", "#c9f08a", "#4f8f1e", out, 2.6)
    if expr == "cast":
        shape(img, lambda d: ell(d, 232, 118, 15, 13), "#8fd14f", "#c9f08a", "#4f8f1e", out, 2.6)
        img = glow_layer(img, lambda d: ell(d, 250, 96, 20, 20), "#7dff6a", 8, 1.0)
        flat(img, lambda d: ell(d, 250, 96, 9, 9), "#eaffd0")
    # hair
    shape(img, lambda d: poly(d, [(92, 84), (196, 84), (214, 176), (178, 150), (110, 150), (80, 178)]),
          "#2a1a3a", "#5a3f7a", "#0f0818", out, 3.0)
    # head
    shape(img, lambda d: ell(d, 144, 112, 50, 46), "#8fd14f", "#c9f08a", "#4f8f1e", out, 3.2)
    # nose
    shape(img, lambda d: poly(d, [(128, 112), (100, 130), (132, 132)]), "#7cc23e", "#c9f08a", "#4f8f1e", out, 2.4)
    flat(img, lambda d: ell(d, 108, 124, 3, 3), "#4f8f1e")
    e = {"idle": "angry", "hurt": "hurt", "cast": "angry"}[expr]
    eye(img, 124, 102, 13, e, "#d4a000", (-0.4, 0), -1)
    eye(img, 164, 102, 13, e, "#d4a000", (-0.4, 0), 1)
    if expr == "hurt":
        mouth(img, 148, 138, 13, "hurt")
    elif expr == "cast":
        mouth(img, 148, 134, 14, "happy", fang=True)
    else:
        mouth(img, 148, 140, 13, "angry")
    # hat
    brim = lambda d: rot_ell(d, 146, 76, 86, 17, -6)
    shape(img, brim, "#3b1560", "#7b3fb0", "#1d0833", out, 3.2)
    cone = [(96, 72), (128, 10), (178, 2), (214, 22), (176, 24), (196, 66)]
    shape(img, lambda d: poly(d, cone), "#4a1d73", "#9256c8", "#250b3d", out, 3.2)
    shape(img, lambda d: poly(d, [(98, 62), (194, 54), (197, 70), (96, 78)]), "#ff8a1e", "#ffd07a", "#c24a00", out, 2.0)
    shape(img, lambda d: rrect(d, 134, 52, 158, 76, 4), "#ffcf4a", "#fff0a0", "#b8860b", out, 2.0)
    flat(img, lambda d: rrect(d, 141, 59, 151, 69, 2), "#4a1d73")
    return img


def bat(frame):
    img = canvas(256, 160)
    out = "#0c0516"
    up = frame == 0
    for s in (-1, 1):
        if up:
            pts = [(128 + s * 26, 84), (128 + s * 64, 26), (128 + s * 122, 14), (128 + s * 108, 52),
                   (128 + s * 92, 50), (128 + s * 84, 82), (128 + s * 64, 72), (128 + s * 46, 104)]
        else:
            pts = [(128 + s * 26, 80), (128 + s * 70, 66), (128 + s * 122, 96), (128 + s * 100, 110),
                   (128 + s * 88, 100), (128 + s * 72, 132), (128 + s * 58, 110), (128 + s * 40, 124)]
        shape(img, lambda d: poly(d, pts), "#3b2060", "#7a52b0", "#1a0c30", out, 3.0)
    for s in (-1, 1):
        shape(img, lambda d: poly(d, [(128 + s * 12, 62), (128 + s * 40, 22), (128 + s * 44, 74)]),
              "#4a2a78", "#8d66c6", "#1a0c30", out, 3.0)
        flat(img, lambda d: poly(d, [(128 + s * 22, 60), (128 + s * 37, 36), (128 + s * 39, 68)]), "#ff8fb0")
    shape(img, lambda d: ell(d, 128, 94, 42, 40), "#4a2a78", "#9a74d6", "#21103e", out, 3.2)
    for s in (-1, 1):
        eye(img, 128 + s * 17, 88, 12, "angry", "#d41a3a", (0, 0.2), s)
    mouth(img, 128, 108, 9, "angry")
    for s in (-1, 1):
        flat(img, lambda d: poly(d, [(128 + s * 6 - 3, 110), (128 + s * 6 + 3, 110), (128 + s * 6, 120)]), "#ffffff")
    return img


def ghost_npc():
    img = canvas(256, 256)
    pts = curve((58, 230), (40, 40), (128, 36), 16) + curve((128, 36), (216, 40), (198, 230), 16)
    pts += [(176, 212), (152, 232), (128, 212), (104, 232), (80, 212)]
    img = glow_layer(img, lambda d: poly(d, pts), "#9adfff", 10, 0.7)
    shape(img, lambda d: poly(d, pts), "#eaf6ff", "#ffffff", "#9cc4ea", "#3a5f96", 3.0)
    for s in (-1, 1):
        flat(img, lambda d: ell(d, 128 + s * 30, 112, 13, 18), "#1b1030")
        flat(img, lambda d: ell(d, 128 + s * 30 - 4, 105, 4, 5), "#ffffff")
    flat(img, lambda d: ell(d, 128, 152, 12, 15), "#1b1030")
    cheeks(img, 128, 140, 52, 12, "#ffa0c0")
    return img


# ----------------------------------------------------------------------------- tiles
def speckle(img, mask, colors, n, rmin, rmax, seed):
    rnd = random.Random(seed)
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    w, h = img.size
    for _ in range(n):
        x, y, r = rnd.uniform(0, w), rnd.uniform(0, h), rnd.uniform(P(rmin), P(rmax))
        d.ellipse([x - r, y - r * 0.7, x + r, y + r * 0.7], fill=rgb(rnd.choice(colors), rnd.randint(40, 110)))
    lay.putalpha(ImageChops.multiply(lay.getchannel("A"), mask))
    return Image.alpha_composite(img, lay)


def platform(name, base, hi, lo, out, top=None, top_hi=None, bricks=False, seed=1, alpha=255, rune=None):
    w, h = 192, 64
    img = canvas(w, h)
    m = shape(img, lambda d: rrect(d, 4, 4, w - 4, h - 4, 14), base, hi, lo, out, 3.0, (0.3, 0.1))
    img = speckle(img, m, [lo, hi, out], 46, 2, 7, seed)
    if bricks:
        lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(lay)
        for y in (24, 44):
            d.line([P(6), P(y), P(w - 6), P(y)], fill=rgb(out, 130), width=int(P(1.6)))
        for i, y0 in enumerate((6, 24, 44)):
            for x in range(24 + (16 if i % 2 else 0), w - 8, 34):
                d.line([P(x), P(y0), P(x), P(min(h - 6, y0 + 19))], fill=rgb(out, 130), width=int(P(1.6)))
        lay.putalpha(ImageChops.multiply(lay.getchannel("A"), m))
        img = Image.alpha_composite(img, lay)
    if top:
        tm, td = new_mask(img)
        rrect(td, 4, 4, w - 4, 26, 12)
        rnd = random.Random(seed + 7)
        for x in range(8, w - 8, 9):
            ell(td, x + rnd.uniform(-2, 2), 24, 6, rnd.uniform(3, 8))
        tm = ImageChops.multiply(tm, m)
        paint(img, tm, top, top_hi, None, None, 0, (0.3, 0.0))
    if rune:
        img = glow_layer(img, lambda d: poly(d, [(96, 26), (108, 40), (96, 54), (84, 40)]), rune, 5, 0.9)
        flat(img, lambda d: poly(d, [(96, 30), (104, 40), (96, 50), (88, 40)]), "#ffffff")
    if alpha < 255:
        img.putalpha(scale_alpha(img.getchannel("A"), alpha / 255.0))
    save(img, name, border=24)


def crate():
    img = canvas(128, 128)
    m = shape(img, lambda d: rrect(d, 5, 5, 123, 123, 12), "#8d8aa0", "#c9c6dc", "#55526a", "#23212f", 3.0, (0.3, 0.2))
    img = speckle(img, m, ["#55526a", "#c9c6dc"], 40, 2, 8, 5)
    cracks = [[(30, 8), (44, 36), (36, 58), (58, 78), (50, 120)], [(44, 36), (74, 44), (96, 30), (120, 40)],
              [(58, 78), (88, 84), (104, 110)], [(36, 58), (10, 70)]]
    for c in cracks:
        flat(img, lambda d: line(d, c, 2.6), "#23212f")
    save(img, "crate", border=0)


def door(state):
    img = canvas(256, 320)
    out = "#140b22"
    if state == "open":
        img = glow_layer(img, lambda d: rrect(d, 40, 40, 216, 310, 80), "#ffd86a", 14, 0.9)
    arch = lambda d: (ell(d, 128, 120, 104, 104), d.rectangle([P(24), P(120), P(232), P(310)], fill=255))
    m = shape(img, arch, "#77748c", "#b9b6cf", "#44415a", out, 3.4, (0.3, 0.15))
    img = speckle(img, m, ["#44415a", "#b9b6cf"], 50, 2, 9, 3)
    inner = lambda d: (ell(d, 128, 126, 76, 80), d.rectangle([P(52), P(126), P(204), P(310)], fill=255))
    if state == "open":
        im = shape(img, inner, "#ffe9a0", "#ffffff", "#ffb02e", out, 3.0, (0.5, 0.5))
        lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(lay)
        for i in range(-3, 4):
            d.polygon([(P(128), P(190)), (P(128 + i * 40 - 9), P(330)), (P(128 + i * 40 + 9), P(330))],
                      fill=(255, 255, 255, 70))
        lay.putalpha(ImageChops.multiply(lay.getchannel("A"), im))
        img = Image.alpha_composite(img, lay)
    else:
        shape(img, inner, "#6a3d1e", "#a86a3a", "#351a08", out, 3.0, (0.3, 0.2))
        for x in (90, 128, 166):
            flat(img, lambda d: line(d, [(x, 60), (x, 306)], 2.0), "#351a08")
        for y in (150, 250):
            shape(img, lambda d: rrect(d, 54, y, 202, y + 16, 4), "#3a3750", "#77748c", "#1d1b2b", out, 2.0)
        shape(img, lambda d: ell(d, 182, 206, 9, 9), "#ffcf4a", "#fff0a0", "#b8860b", out, 2.0)
        if state == "locked":
            shape(img, lambda d: rrect(d, 98, 176, 158, 230, 8), "#ffcf4a", "#fff0a0", "#b8860b", out, 2.6)
            lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(lay)
            d.arc([P(108), P(146), P(148), P(196)], 180, 360, fill=rgb(out), width=int(P(12)))
            d.arc([P(108), P(146), P(148), P(196)], 180, 360, fill=rgb("#d9d9e6"), width=int(P(7)))
            img = Image.alpha_composite(lay, img) if False else Image.alpha_composite(img, lay)
            shape(img, lambda d: rrect(d, 98, 176, 158, 230, 8), "#ffcf4a", "#fff0a0", "#b8860b", out, 2.6)
            flat(img, lambda d: ell(d, 128, 196, 7, 7), out)
            flat(img, lambda d: poly(d, [(124, 198), (132, 198), (135, 218), (121, 218)]), out)
    # keystone pumpkin
    shape(img, lambda d: ell(d, 128, 28, 20, 16), "#ff8a1e", "#ffd07a", "#c24a00", out, 2.4)
    flat(img, lambda d: poly(d, [(118, 24), (124, 24), (121, 30)]), out)
    flat(img, lambda d: poly(d, [(132, 24), (138, 24), (135, 30)]), out)
    save(img, "door_" + state)


def key():
    img = canvas(128, 128)
    out = "#4a3000"
    img = glow_layer(img, lambda d: ell(d, 64, 64, 40, 40), "#ffe27a", 10, 0.7)
    shape(img, lambda d: rrect(d, 58, 50, 72, 116, 5), "#ffcf4a", "#fff0a0", "#b8860b", out, 2.6)
    shape(img, lambda d: rrect(d, 70, 92, 92, 104, 3), "#ffcf4a", "#fff0a0", "#b8860b", out, 2.6)
    shape(img, lambda d: rrect(d, 70, 74, 86, 84, 3), "#ffcf4a", "#fff0a0", "#b8860b", out, 2.6)
    m, d = new_mask(img)
    ell(d, 65, 36, 28, 26)
    ell(d, 65, 36, 12, 11, fill=0)
    paint(img, m, "#ffcf4a", "#fff0a0", "#b8860b", out, 2.6)
    save(img, "key")


def spikes():
    img = canvas(128, 64)
    out = "#140b22"
    for i in range(4):
        x = 16 + i * 32
        shape(img, lambda d: poly(d, [(x - 15, 62), (x, 6), (x + 15, 62)]), "#c9c6dc", "#ffffff", "#6a6785", out, 2.6,
              (0.3, 0.3))
        flat(img, lambda d: poly(d, [(x - 3, 20), (x, 6), (x + 3, 20)]), "#ff4a6a")
    save(img, "spikes")


def mushroom(squashed):
    img = canvas(192, 160)
    out = "#2b0a1a"
    capy, capry = (84, 44) if squashed else (66, 58)
    shape(img, lambda d: rrect(d, 70, capy, 122, 154, 18), "#f3dfc8", "#ffffff", "#c9a88a", out, 3.0)
    m = shape(img, lambda d: (ell(d, 96, capy, 88, capry), d.rectangle([0, P(capy + 8), P(192), P(160)], fill=0)),
              "#e0315a", "#ff8fa8", "#8a1233", out, 3.2, (0.3, 0.3))
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for cx, cy, r in ((60, capy - 22, 13), (108, capy - 34, 16), (148, capy - 14, 11), (88, capy - 8, 8)):
        d.ellipse([P(cx - r), P(cy - r * 0.8), P(cx + r), P(cy + r * 0.8)], fill=(255, 255, 255, 235))
    lay.putalpha(ImageChops.multiply(lay.getchannel("A"), m))
    img = Image.alpha_composite(img, lay)
    eye(img, 84, 120, 7, "idle" if not squashed else "happy", "#2b0a1a")
    eye(img, 108, 120, 7, "idle" if not squashed else "happy", "#2b0a1a")
    save(img, "mushroom_1" if squashed else "mushroom_0")


def portal(name, c1, c2):
    img = canvas(192, 192)
    img = glow_layer(img, lambda d: ell(d, 96, 96, 70, 70), c1, 12, 0.9)
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for k in range(3):
        pts = []
        for i in range(70):
            t = i / 69.0
            a = k * 2.094 + t * 5.2
            r = 70 * (1 - t * 0.92)
            pts.append((P(96 + r * math.cos(a)), P(96 + r * math.sin(a))))
        d.line(pts, fill=rgb(c2, 230), width=int(P(7)), joint="curve")
    lay = lay.filter(ImageFilter.GaussianBlur(P(1.0)))
    flat(img, lambda dd: ell(dd, 96, 96, 66, 66), "#12071f")
    img = Image.alpha_composite(img, lay)
    m, dm = new_mask(img)
    ell(dm, 96, 96, 74, 74)
    ell(dm, 96, 96, 64, 64, fill=0)
    paint(img, m, c1, "#ffffff", c2, None)
    flat(img, lambda dd: ell(dd, 96, 96, 9, 9), "#ffffff")
    save(img, name)


def web():
    img = canvas(256, 256)
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    n = 10
    for i in range(n):
        a = 2 * math.pi * i / n
        d.line([P(128), P(128), P(128 + 122 * math.cos(a)), P(128 + 122 * math.sin(a))], fill=(235, 240, 255, 230),
               width=int(P(2.4)))
    for ring in range(1, 6):
        r = ring * 22
        for i in range(n):
            a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n
            p0 = (128 + r * math.cos(a0), 128 + r * math.sin(a0))
            p2 = (128 + r * math.cos(a1), 128 + r * math.sin(a1))
            am = (a0 + a1) / 2
            p1 = (128 + r * 0.8 * math.cos(am), 128 + r * 0.8 * math.sin(am))
            d.line([(P(x), P(y)) for x, y in curve(p0, p1, p2, 8)], fill=(235, 240, 255, 215), width=int(P(1.8)))
    soft = lay.filter(ImageFilter.GaussianBlur(P(3)))
    img = Image.alpha_composite(Image.alpha_composite(img, soft), lay)
    save(img, "web")


def lantern(lit=True):
    img = canvas(192, 256)
    out = "#2b1a00"
    if lit:
        img = glow_layer(img, lambda d: ell(d, 96, 140, 80, 90), "#ffe27a", 16, 1.0)
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.arc([P(60), P(8), P(132), P(76)], 180, 360, fill=rgb(out), width=int(P(9)))
    d.arc([P(60), P(8), P(132), P(76)], 180, 360, fill=rgb("#ffcf4a"), width=int(P(4.5)))
    img = Image.alpha_composite(img, lay)
    shape(img, lambda d: poly(d, [(56, 70), (96, 40), (136, 70)]), "#ffcf4a", "#fff0a0", "#b8860b", out, 2.8)
    shape(img, lambda d: rrect(d, 46, 210, 146, 236, 8), "#ffcf4a", "#fff0a0", "#b8860b", out, 2.8)
    shape(img, lambda d: rrect(d, 54, 68, 138, 214, 14), "#fff3b0" if lit else "#3a3750", "#ffffff" if lit else "#6a6785",
          "#ffb02e" if lit else "#1d1b2b", out, 2.8, (0.5, 0.5))
    if lit:
        shape(img, lambda d: ell(d, 96, 142, 36, 36), "#fffbe0", "#ffffff", "#ffe27a")
        for cx, cy, r in ((84, 132, 7), (106, 128, 5), (100, 152, 8), (82, 156, 4)):
            flat(img, lambda dd: ell(dd, cx, cy, r, r), (230, 225, 190, 150))
    for x in (76, 116):
        flat(img, lambda dd: line(dd, [(x, 72), (x, 210)], 3.0), out)
    save(img, "lantern_lit" if lit else "lantern_dark")


def wind_streak():
    img = canvas(192, 64)
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for y, x0, x1, w in ((18, 10, 150, 5), (34, 40, 186, 6), (50, 4, 120, 4)):
        d.line([(P(x), P(y + 5 * math.sin(x * 0.06))) for x in range(x0, x1, 4)], fill=(255, 255, 255, 210),
               width=int(P(w)), joint="curve")
    lay = lay.filter(ImageFilter.GaussianBlur(P(1.5)))
    a = lay.getchannel("A")
    fade = Image.linear_gradient("L").rotate(90, expand=True).resize(img.size)
    fade = fade.point(lambda v: int(255 * math.sin(math.pi * v / 255.0)))
    lay.putalpha(ImageChops.multiply(a, fade))
    save(lay, "wind")


# ----------------------------------------------------------------------------- fx + ui
def soft(name, size, color, power=1.0):
    img = Image.new("RGBA", (size, size), rgb(color))
    g = round_gradient().resize((size, size))
    g = g.point(lambda v: int(255 * (v / 255.0) ** power))
    img.putalpha(g)
    save(img, name, ss=1)


def star_pts(cx, cy, r1, r2, n=5, rot=-90):
    pts = []
    for i in range(n * 2):
        r = r1 if i % 2 == 0 else r2
        a = math.radians(rot + i * 180.0 / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def star(full):
    img = canvas(128, 128)
    if full:
        img = glow_layer(img, lambda d: poly(d, star_pts(64, 66, 52, 24)), "#ffe27a", 8, 0.8)
        shape(img, lambda d: poly(d, star_pts(64, 66, 52, 24)), "#ffcf4a", "#fff7c0", "#e08a00", "#5a3000", 3.0)
    else:
        shape(img, lambda d: poly(d, star_pts(64, 66, 52, 24)), "#3a3458", "#57507a", "#211c38", "#0e0a1c", 3.0)
    save(img, "star_full" if full else "star_empty")


def spark():
    img = canvas(64, 64)
    flat(img, lambda d: poly(d, star_pts(32, 32, 30, 7, 4)), "#ffffff")
    save(img, "spark")


def leaf():
    img = canvas(64, 64)
    pts = curve((8, 56), (10, 10), (56, 8), 10) + curve((56, 8), (54, 54), (8, 56), 10)
    shape(img, lambda d: poly(d, pts), "#ff8a1e", "#ffd07a", "#c24a00")
    flat(img, lambda d: line(d, [(10, 54), (54, 10)], 1.6), "#9a3b00")
    save(img, "leaf")


def shard():
    img = canvas(64, 64)
    shape(img, lambda d: poly(d, [(10, 40), (26, 8), (54, 22), (44, 56)]), "#ff8a1e", "#ffd07a", "#c24a00", "#5a1e00",
          2.0)
    save(img, "shard")


def white():
    img = Image.new("RGBA", (16, 16), (255, 255, 255, 255))
    save(img, "white", ss=1)


def button(name, base, hi, lo, out):
    img = canvas(160, 96)
    flat(img, lambda d: rrect(d, 8, 14, 152, 92, 26), rgb(out))
    m = shape(img, lambda d: rrect(d, 8, 6, 152, 82, 26), base, hi, lo, out, 3.0, (0.4, 0.0))
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(lay).rounded_rectangle([P(16), P(11), P(144), P(40)], radius=P(16), fill=(255, 255, 255, 60))
    lay.putalpha(ImageChops.multiply(lay.getchannel("A"), m))
    save(Image.alpha_composite(img, lay), name, border=34)


def panel(name, base, hi, lo, out, trim):
    img = canvas(192, 192)
    flat(img, lambda d: rrect(d, 6, 12, 186, 190, 30), (0, 0, 0, 90))
    shape(img, lambda d: rrect(d, 6, 4, 186, 182, 30), trim, "#fff0a0", "#8a5a00", out, 3.0, (0.3, 0.0))
    shape(img, lambda d: rrect(d, 14, 12, 178, 174, 24), base, hi, lo, None, 0, (0.4, 0.0))
    save(img, name, border=44)


def round_button(name, base, hi, lo, out, icon):
    img = canvas(128, 128)
    flat(img, lambda d: ell(d, 64, 70, 54, 54), rgb(out))
    shape(img, lambda d: ell(d, 64, 62, 54, 54), base, hi, lo, out, 3.0, (0.35, 0.2))
    w = "#ffffff"
    sh = rgb(out, 160)

    def both(fn, dy=0):
        lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        m, d = new_mask(lay)
        fn(d, 3)
        lay.paste(Image.new("RGBA", img.size, sh), (0, 0), m)
        m, d = new_mask(lay)
        fn(d, 0)
        lay.paste(Image.new("RGBA", img.size, rgb(w)), (0, 0), m)
        return lay

    if icon == "play":
        lay = both(lambda d, o: poly(d, [(50, 36 + o), (50, 88 + o), (94, 62 + o)]))
    elif icon == "next":
        lay = both(lambda d, o: (poly(d, [(40, 38 + o), (40, 86 + o), (70, 62 + o)]),
                                 poly(d, [(66, 38 + o), (66, 86 + o), (96, 62 + o)])))
    elif icon == "pause":
        lay = both(lambda d, o: (rrect(d, 42, 36 + o, 58, 88 + o, 5), rrect(d, 70, 36 + o, 86, 88 + o, 5)))
    elif icon == "home":
        lay = both(lambda d, o: (poly(d, [(64, 30 + o), (30, 62 + o), (98, 62 + o)]),
                                 d.rectangle([P(42), P(60 + o), P(86), P(92 + o)], fill=255),
                                 d.rectangle([P(57), P(72 + o), P(71), P(92 + o)], fill=0)))
    elif icon == "restart":
        def fn(d, o):
            d.arc([P(36), P(34 + o), P(92), P(90 + o)], 40, 320, fill=255, width=int(P(10)))
            poly(d, [(74, 28 + o), (102, 40 + o), (78, 58 + o)])
        lay = both(fn)
    elif icon == "swap":
        def fn(d, o):
            d.arc([P(34), P(32 + o), P(94), P(92 + o)], 200, 330, fill=255, width=int(P(9)))
            d.arc([P(34), P(32 + o), P(94), P(92 + o)], 20, 150, fill=255, width=int(P(9)))
            poly(d, [(80, 30 + o), (104, 50 + o), (76, 58 + o)])
            poly(d, [(48, 94 + o), (24, 74 + o), (52, 66 + o)])
        lay = both(fn)
    elif icon in ("sound_on", "sound_off"):
        def fn(d, o):
            poly(d, [(34, 52 + o), (50, 52 + o), (70, 34 + o), (70, 90 + o), (50, 72 + o), (34, 72 + o)])
            if icon == "sound_on":
                d.arc([P(62), P(40 + o), P(96), P(84 + o)], -50, 50, fill=255, width=int(P(7)))
            else:
                line(d, [(80, 50 + o), (100, 74 + o)], 7)
                line(d, [(100, 50 + o), (80, 74 + o)], 7)
        lay = both(fn)
    elif icon == "lock":
        def fn(d, o):
            d.arc([P(46), P(30 + o), P(82), P(74 + o)], 180, 360, fill=255, width=int(P(9)))
            rrect(d, 38, 56 + o, 90, 94 + o, 8)
        lay = both(fn)
    else:
        lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    save(Image.alpha_composite(img, lay), name)


def finger():
    img = canvas(128, 128)
    out = "#2a1a3a"
    shape(img, lambda d: (rrect(d, 50, 14, 74, 80, 12), rrect(d, 34, 58, 100, 116, 20), rrect(d, 74, 50, 92, 84, 9),
                          rot_ell(d, 36, 70, 11, 22, -30)), "#ffe4c9", "#ffffff", "#e0a884", out, 3.0)
    save(img, "finger")


def cloud():
    img = canvas(256, 128)
    m, d = new_mask(img)
    for cx, cy, r in ((70, 80, 40), (120, 60, 50), (176, 76, 42), (100, 92, 44), (150, 94, 40)):
        ell(d, cx, cy, r, r * 0.8)
    m = scale_alpha(m.filter(ImageFilter.GaussianBlur(P(5))), 0.8)
    lay = Image.new("RGBA", img.size, (255, 255, 255, 255))
    lay.putalpha(m)
    save(lay, "cloud")


# ----------------------------------------------------------------------------- backgrounds
def vgrad(w, h, stops):
    img = Image.new("RGBA", (w, h))
    px = img.load()
    for y in range(h):
        t = y / (h - 1.0)
        for i in range(len(stops) - 1):
            t0, c0 = stops[i]
            t1, c1 = stops[i + 1]
            if t0 <= t <= t1:
                k = (t - t0) / (t1 - t0)
                c = tuple(int(c0[j] + (c1[j] - c0[j]) * k) for j in range(3)) + (255,)
                break
        for x in range(w):
            px[x, y] = c
    return img


def tree_sil(d, x, base, hgt, rnd, color):
    def branch(x0, y0, ang, ln, w, depth):
        x1, y1 = x0 + ln * math.cos(ang), y0 - ln * math.sin(ang)
        d.line([x0, y0, x1, y1], fill=color, width=max(1, int(w)))
        if depth > 0:
            for _ in range(rnd.randint(2, 3)):
                branch(x1, y1, ang + rnd.uniform(-0.8, 0.8), ln * rnd.uniform(0.55, 0.75), w * 0.62, depth - 1)
    d.polygon([(x - hgt * 0.07, base), (x + hgt * 0.07, base), (x + hgt * 0.035, base - hgt * 0.4),
               (x - hgt * 0.035, base - hgt * 0.4)], fill=color)
    branch(x, base - hgt * 0.35, math.pi / 2 + rnd.uniform(-0.2, 0.2), hgt * 0.3, hgt * 0.06, 4)


def background(name, stops, moon, moon_glow, far, mid, near, kind, seed):
    W, H = 1080, 2160
    rnd = random.Random(seed)
    img = vgrad(W, H, stops)
    d = ImageDraw.Draw(img)
    stars = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stars)
    for _ in range(260):
        x, y, r = rnd.uniform(0, W), rnd.uniform(0, H * 0.75), rnd.uniform(0.8, 3.2)
        sd.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, rnd.randint(70, 230)))
    img = Image.alpha_composite(img, stars)
    mx, my, mr = moon
    gl = Image.new("RGBA", (W, H), rgb(moon_glow))
    gl.putalpha(scale_alpha(radial((W, H), mx, my, mr * 3.6), 0.55))
    img = Image.alpha_composite(img, gl)
    ml = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    md = ImageDraw.Draw(ml)
    md.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=(255, 250, 225, 255))
    for cx, cy, r in ((-0.3, -0.2, 0.22), (0.25, 0.1, 0.16), (-0.05, 0.4, 0.13), (0.35, -0.4, 0.1)):
        md.ellipse([mx + cx * mr - r * mr, my + cy * mr - r * mr, mx + cx * mr + r * mr, my + cy * mr + r * mr],
                   fill=(232, 222, 190, 255))
    img = Image.alpha_composite(img, ml.filter(ImageFilter.GaussianBlur(1.5)))
    d = ImageDraw.Draw(img)
    # clouds
    cl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(cl)
    for _ in range(9):
        cx, cy = rnd.uniform(0, W), rnd.uniform(H * 0.08, H * 0.6)
        for _ in range(6):
            r = rnd.uniform(50, 120)
            ox, oy = rnd.uniform(-160, 160), rnd.uniform(-20, 20)
            cd.ellipse([cx + ox - r, cy + oy - r * 0.4, cx + ox + r, cy + oy + r * 0.4], fill=rgb(far, 120))
    img = Image.alpha_composite(img, cl.filter(ImageFilter.GaussianBlur(14)))
    d = ImageDraw.Draw(img)

    def hills(base, amp, color, s):
        r2 = random.Random(s)
        ph = [r2.uniform(0, 6.28) for _ in range(3)]
        pts = [(0, H)]
        for x in range(0, W + 20, 20):
            y = base - amp * (0.6 * math.sin(x * 0.004 + ph[0]) + 0.3 * math.sin(x * 0.011 + ph[1]) + 0.1 * math.sin(
                x * 0.03 + ph[2]))
            pts.append((x, y))
        pts.append((W, H))
        d.polygon(pts, fill=rgb(color))

    hills(H * 0.74, 90, far, seed + 1)
    if kind == "graveyard":
        for _ in range(7):
            x = rnd.uniform(0, W)
            y = H * 0.76 + rnd.uniform(-20, 30)
            if rnd.random() < 0.5:
                d.rounded_rectangle([x - 34, y - 100, x + 34, y + 20], radius=30, fill=rgb(far))
            else:
                d.rectangle([x - 10, y - 130, x + 10, y + 20], fill=rgb(far))
                d.rectangle([x - 42, y - 96, x + 42, y - 76], fill=rgb(far))
        for _ in range(4):
            tree_sil(d, rnd.uniform(0, W), H * 0.8, rnd.uniform(500, 800), rnd, rgb(mid))
    elif kind == "forest":
        for _ in range(9):
            x = rnd.uniform(0, W)
            w = rnd.uniform(40, 90)
            d.polygon([(x - w, H), (x - w * 0.5, 0), (x + w * 0.5, 0), (x + w, H)], fill=rgb(far))
        for _ in range(6):
            tree_sil(d, rnd.uniform(0, W), H * 0.84, rnd.uniform(700, 1100), rnd, rgb(mid))
        for _ in range(5):
            x, y, r = rnd.uniform(0, W), rnd.uniform(H * 0.1, H * 0.6), rnd.uniform(60, 130)
            for i in range(8):
                a = 2 * math.pi * i / 8
                d.line([x, y, x + r * math.cos(a), y + r * math.sin(a)], fill=(220, 225, 255, 70), width=2)
            for k in range(1, 4):
                rr = r * k / 3.5
                d.ellipse([x - rr, y - rr, x + rr, y + rr], outline=(220, 225, 255, 60), width=2)
    elif kind == "tower":
        cx = W * 0.5
        d.polygon([(cx - 210, H), (cx - 170, H * 0.34), (cx + 170, H * 0.34), (cx + 210, H)], fill=rgb(far))
        for i in range(-3, 4):
            d.rectangle([cx + i * 56 - 22, H * 0.34 - 50, cx + i * 56 + 22, H * 0.34 + 4], fill=rgb(far))
        d.polygon([(cx - 120, H * 0.34 - 40), (cx, H * 0.16), (cx + 120, H * 0.34 - 40)], fill=rgb(far))
        for s, hx in ((-1, 330), (1, 330)):
            x = cx + s * hx
            d.polygon([(x - 80, H), (x - 66, H * 0.5), (x + 66, H * 0.5), (x + 80, H)], fill=rgb(mid))
            d.polygon([(x - 90, H * 0.5), (x, H * 0.4), (x + 90, H * 0.5)], fill=rgb(mid))
        wl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        wd = ImageDraw.Draw(wl)
        for _ in range(14):
            x, y = cx + rnd.uniform(-130, 130), rnd.uniform(H * 0.38, H * 0.78)
            wd.rounded_rectangle([x - 14, y - 26, x + 14, y + 26], radius=14, fill=(255, 200, 90, 255))
        img = Image.alpha_composite(img, wl.filter(ImageFilter.GaussianBlur(10)))
        img = Image.alpha_composite(img, wl)
        d = ImageDraw.Draw(img)
    hills(H * 0.86, 60, mid, seed + 2)
    hills(H * 0.95, 40, near, seed + 3)
    # fog
    fog = Image.new("RGBA", (W, H), rgb(moon_glow))
    fm = Image.linear_gradient("L").resize((W, H)).point(lambda v: int(max(0, v - 150) * 0.9))
    fog.putalpha(fm)
    img = Image.alpha_composite(img, fog)
    # vignette
    vg = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    vm = Image.radial_gradient("L").resize((W, H)).point(lambda v: int(max(0, v - 110) * 0.9))
    vg.putalpha(vm)
    img = Image.alpha_composite(img, vg)
    img = img.resize((720, 1440), Image.LANCZOS)
    save(img, name, ss=1)


def import_deco():
    picks = {
        "candy_0": "Candy_1_V1.png", "candy_1": "Candy_1_V2.png", "candy_2": "Candy_1_V3.png",
        "candy_3": "Candy_2.png", "candy_4": "Candy_3.png",
        "minion_0": "Jack o lantern_1_V1.png", "minion_1": "Jack o lantern_1_V2.png",
        "minion_2": "Jack o lantern_1_V3.png", "bomb": "Jack o lantern_2.png",
        "cauldron": "Cauldron_V2.png", "cauldron_candy": "Cauldron_V3.png",
        "tomb_0": "Tombstone_1_V1.png", "tomb_1": "Tombstone_2_V2.png", "tomb_2": "Tombstone_3_V1.png",
        "tree_0": "Tree_2.png", "tree_1": "Tree_3.png", "tree_2": "Tree_5_V1.png",
        "fence_0": "Fence_1.png", "fence_1": "Fence_4.png",
        "hat": "Witch hat_2.png", "pumpkin_0": "Pumpkin_1.png", "pumpkin_1": "Pumpkin_2.png",
        "candle": "Candle_2.png", "hangbat": "Bat.png", "lolly": "Loli_1_V1.png",
    }
    for name, src in picks.items():
        a = Image.open(os.path.join(DECO, src)).convert("RGBA")
        bb = a.getbbox()
        a = a.crop(bb)
        a.thumbnail((256, 256), Image.LANCZOS)
        pad = Image.new("RGBA", (a.width + 8, a.height + 8), (0, 0, 0, 0))
        pad.paste(a, (4, 4))
        save(pad, name, ss=1)


def import_hunter():
    """The hunting pumpkin is the first prototype's jack-o'-lantern; frame 1 is its brighter glow."""
    a = Image.open(LEGACY_PUMPKIN).convert("RGBA")
    a = a.crop(a.getbbox())
    a.thumbnail((236, 236), Image.LANCZOS)
    frame = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    frame.paste(a, ((256 - a.width) // 2, (256 - a.height) // 2))
    save(frame, "hunter_0", ss=1)
    bright = ImageEnhance.Brightness(frame).enhance(1.3)
    bright.putalpha(frame.getchannel("A"))
    save(bright, "hunter_1", ss=1)


def main():
    os.makedirs(OUT, exist_ok=True)
    import_hunter()
    for e in EXPRS:
        save(izan(e), "izan_" + e)
        save(hoot(e), "hoot_" + e)
        save(webster(e), "webster_" + e)
        save(pip(e), "pip_" + e)
    for e in ("idle", "hurt", "cast"):
        save(morgra(e), "morgra_" + e)
    save(bat(0), "bat_0")
    save(bat(1), "bat_1")
    save(ghost_npc(), "ghost")

    platform("plat_grave", "#6f6c86", "#b4b1cc", "#3f3c55", "#1a1828", top="#4f9a3a", top_hi="#a5e06a", seed=1)
    platform("plat_wood", "#7a4a2a", "#b98556", "#40220e", "#1f0f04", top="#3d7a4a", top_hi="#8fd19a", seed=2)
    platform("plat_tower", "#5a3f8a", "#9a7bd0", "#2c1a52", "#140a2b", bricks=True, seed=3)
    platform("plat_mover", "#3a6f8a", "#8fd0ea", "#1a3a52", "#0a1a2b", bricks=True, seed=4, rune="#6affea")
    platform("plat_ghost", "#9adfff", "#ffffff", "#5a9fd0", "#2a5f96", seed=5, alpha=190)
    crate()
    for s in ("closed", "open", "locked"):
        door(s)
    key()
    spikes()
    mushroom(False)
    mushroom(True)
    portal("portal_a", "#6affea", "#2a8fff")
    portal("portal_b", "#ff9a4a", "#ff3a8a")
    web()
    lantern(True)
    lantern(False)
    wind_streak()

    soft("glow", 256, "#ffffff", 1.6)
    soft("dot", 64, "#ffffff", 0.35)
    star(True)
    star(False)
    spark()
    leaf()
    shard()
    white()
    cloud()
    finger()
    button("btn_orange", "#ff8a1e", "#ffc46a", "#d95f00", "#4a1a00")
    button("btn_purple", "#7b3fb0", "#b58ae6", "#4a1d73", "#1a0830")
    button("btn_green", "#4fae3a", "#a5e06a", "#2d7a1e", "#0f3008")
    panel("panel", "#2a1a4a", "#4a3478", "#160a2b", "#0a0416", "#ffcf4a")
    panel("panel_dark", "#160f2b", "#2a1f4a", "#0a0616", "#05020c", "#7b3fb0")
    for icon, col in (("play", "green"), ("next", "green"), ("pause", "purple"), ("home", "purple"),
                      ("restart", "orange"), ("swap", "orange"), ("sound_on", "purple"), ("sound_off", "purple"),
                      ("lock", "grey")):
        pal = {"green": ("#4fae3a", "#a5e06a", "#2d7a1e", "#0f3008"),
               "purple": ("#7b3fb0", "#b58ae6", "#4a1d73", "#1a0830"),
               "orange": ("#ff8a1e", "#ffc46a", "#d95f00", "#4a1a00"),
               "grey": ("#57507a", "#8a84aa", "#2f2a4a", "#0e0a1c")}[col]
        round_button("ico_" + icon, pal[0], pal[1], pal[2], pal[3], icon)
    round_button("node", "#ff8a1e", "#ffc46a", "#d95f00", "#4a1a00", "none")
    round_button("node_done", "#4fae3a", "#a5e06a", "#2d7a1e", "#0f3008", "none")
    round_button("node_locked", "#57507a", "#8a84aa", "#2f2a4a", "#0e0a1c", "lock")

    background("bg_graveyard", [(0, (14, 10, 46)), (0.5, (44, 30, 96)), (0.8, (96, 58, 130)), (1, (150, 90, 120))],
               (800, 430, 150), "#c9a0ff", "#2a1d52", "#1a1238", "#0e0a22", "graveyard", 11)
    background("bg_forest", [(0, (4, 22, 30)), (0.5, (12, 56, 62)), (0.8, (30, 96, 84)), (1, (70, 130, 96))],
               (280, 380, 130), "#8affc9", "#0c3038", "#071f26", "#031216", "forest", 22)
    background("bg_tower", [(0, (30, 6, 30)), (0.5, (84, 18, 60)), (0.8, (150, 40, 60)), (1, (220, 100, 60))],
               (540, 300, 170), "#ff9a6a", "#3a0f30", "#240820", "#120410", "tower", 33)
    import_deco()
    print("sprites written to", OUT, "->", len([f for f in os.listdir(OUT) if f.endswith(".png")]))


if __name__ == "__main__":
    main()
