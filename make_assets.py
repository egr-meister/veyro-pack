"""Generate Veyro Pack icon, adaptive icon and splash assets.

Pure-shape vector-style art drawn with Pillow. No external image packs.
Run: python3 make_assets.py
"""
from PIL import Image, ImageDraw

NAVY = (16, 40, 58, 255)
TEAL = (46, 139, 131, 255)
TEAL_DARK = (35, 112, 106, 255)
SAND = (239, 231, 218, 255)
SAND_BG = (247, 244, 239, 255)
SKY = (127, 178, 214, 255)
WHITE = (255, 255, 255, 255)


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_suitcase(draw, cx, cy, w, h, body_fill, stroke, stroke_w,
                  handle=True, tag=True, check=True):
    """Draw a suitcase centered at (cx, cy)."""
    left = cx - w / 2
    top = cy - h / 2
    right = cx + w / 2
    bottom = cy + h / 2
    r = w * 0.13

    # Handle
    if handle:
        hw = w * 0.42
        hh = h * 0.20
        hx0 = cx - hw / 2
        hx1 = cx + hw / 2
        hy0 = top - hh
        draw.rounded_rectangle(
            [hx0, hy0, hx1, top + hh * 0.4],
            radius=hh * 0.6, outline=stroke, width=stroke_w,
        )

    # Body
    draw.rounded_rectangle([left, top, right, bottom], radius=r,
                           fill=body_fill, outline=stroke, width=stroke_w)

    # Center latch line
    draw.line([(left + r * 0.4, cy), (right - r * 0.4, cy)],
              fill=stroke, width=max(2, int(stroke_w * 0.7)))
    # Two small latches
    latch_w = w * 0.10
    latch_h = h * 0.07
    for sign in (-1, 1):
        lx = cx + sign * w * 0.20 - latch_w / 2
        draw.rounded_rectangle(
            [lx, cy - latch_h / 2, lx + latch_w, cy + latch_h / 2],
            radius=latch_h * 0.4, fill=stroke,
        )

    # Travel tag accent (top-right, attached to handle area)
    if tag:
        ts = w * 0.20
        tx = right - ts * 0.2
        ty = top - ts * 0.55
        pts = [
            (tx, ty + ts * 0.25),
            (tx + ts * 0.5, ty),
            (tx + ts, ty + ts * 0.25),
            (tx + ts, ty + ts),
            (tx, ty + ts),
        ]
        draw.polygon(pts, fill=SKY, outline=stroke)
        # hole
        hr = ts * 0.10
        hcx = tx + ts * 0.5
        hcy = ty + ts * 0.22
        draw.ellipse([hcx - hr, hcy - hr, hcx + hr, hcy + hr], fill=stroke)

    # Checkmark on the suitcase (lower half)
    if check:
        ccx = cx
        ccy = cy + h * 0.20
        s = w * 0.26
        lw = max(6, int(stroke_w * 1.6))
        draw.line(
            [(ccx - s * 0.55, ccy),
             (ccx - s * 0.12, ccy + s * 0.42),
             (ccx + s * 0.62, ccy - s * 0.42)],
            fill=TEAL, width=lw, joint="curve",
        )


def make_icon(path, size=1024, bg=NAVY, body=SAND):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Rounded square background
    pad = int(size * 0.06)
    rounded(draw, [pad, pad, size - pad, size - pad],
            radius=int(size * 0.22), fill=bg)
    draw_suitcase(draw, size / 2, size / 2 + size * 0.02,
                  w=size * 0.50, h=size * 0.40,
                  body_fill=body, stroke=WHITE, stroke_w=max(8, int(size * 0.012)))
    img.save(path)


def make_adaptive(path, size=1024):
    # Foreground only (transparent); background color set in app.json.
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Keep art within the safe ~66% center circle of adaptive icons.
    draw_suitcase(draw, size / 2, size / 2 + size * 0.01,
                  w=size * 0.40, h=size * 0.32,
                  body_fill=SAND, stroke=WHITE, stroke_w=max(8, int(size * 0.012)))
    img.save(path)


def make_splash(path, w=1242, h=2436):
    img = Image.new("RGBA", (w, h), SAND_BG)
    draw = ImageDraw.Draw(img)
    cx = w / 2
    cy = h * 0.42
    sw = w * 0.42
    draw_suitcase(draw, cx, cy, w=sw, h=sw * 0.8,
                  body_fill=SAND, stroke=NAVY, stroke_w=max(6, int(w * 0.008)))
    # App name
    title = "Veyro Pack"
    # Use a large default bitmap font scaled up via a temp image for crispness.
    try:
        from PIL import ImageFont
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(w * 0.085))
    except Exception:
        font = None
    if font is not None:
        bbox = draw.textbbox((0, 0), title, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((cx - tw / 2, cy + sw * 0.55), title, font=font, fill=NAVY)
        sub = "Pack faster for every trip"
        try:
            sfont = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", int(w * 0.040))
        except Exception:
            sfont = font
        sb = draw.textbbox((0, 0), sub, font=sfont)
        sw2 = sb[2] - sb[0]
        draw.text((cx - sw2 / 2, cy + sw * 0.55 + th + int(h * 0.02)),
                  sub, font=sfont, fill=(60, 84, 104, 255))
    img.save(path)


if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "assets")
    os.makedirs(out, exist_ok=True)
    make_icon(os.path.join(out, "icon.png"))
    make_adaptive(os.path.join(out, "adaptive-icon.png"))
    make_splash(os.path.join(out, "splash.png"))
    # A small favicon-ish copy is handy too.
    make_icon(os.path.join(out, "favicon.png"), size=196)
    print("Assets written to", out)
