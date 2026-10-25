"""
Aaron Compressed – an original compressed grotesque for lcars-gui.

Every glyph is constructed from simple geometry (rectangles, rounded
"stadium" rings, diagonal strokes) combined with boolean operations.
No existing font outlines are used as a template.

Usage:
    pip install -r requirements.txt
    python build_font.py [output_dir]      (or: npm run build:font)

Writes AaronCompressed.otf and AaronCompressed.woff2 to fonts/AaronCompressed/.
Licensed under the MIT License (see ../LICENSE).
"""

import math
import os
import sys

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from pathops import Path, PathOp, op

FAMILY = "Aaron Compressed"
PS_NAME = "AaronCompressed-Regular"
VERSION = "1.000"

# --- Metrics (units per em = 1000) -----------------------------------------
UPM = 1000
CAP = 860       # cap height
XH = 680        # x-height
ASC = 880       # ascender
DESC = -200     # descender
OS = 12         # overshoot of round shapes

BOLD = 1.12     # global weight factor
V = round(118 * BOLD)   # vertical stem, capitals
HB = round(96 * BOLD)   # horizontal bar, capitals
v = round(110 * BOLD)   # vertical stem, lowercase
h = round(88 * BOLD)    # horizontal bar, lowercase

SB = 18         # side bearing next to straight stems
SBR = 12        # side bearing next to round shapes
SBD = 2         # side bearing next to diagonals

K_OUT = 0.60    # curve tension of outer contours (0.55 = ellipse)
K_IN = 0.62     # curve tension of counters


# --- Geometry primitives ----------------------------------------------------

def poly(pts):
    p = Path()
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    p.close()
    return p


def R(x0, y0, x1, y1):
    return poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])


def RR(x0, y0, x1, y1, rx, ry, square="", k=K_OUT):
    """Rounded rectangle; corners listed in `square` (bl, br, tr, tl) stay sharp."""
    rx = min(rx, (x1 - x0) / 2)
    ry = min(ry, (y1 - y0) / 2)
    r = {c: (0, 0) if c in square else (rx, ry) for c in ("bl", "br", "tr", "tl")}
    p = Path()
    bx, by = r["bl"]
    p.moveTo(x0 + bx, y0)
    cx, cy = r["br"]
    p.lineTo(x1 - cx, y0)
    if cx:
        p.cubicTo(x1 - cx + k * cx, y0, x1, y0 + cy - k * cy, x1, y0 + cy)
    cx, cy = r["tr"]
    p.lineTo(x1, y1 - cy)
    if cx:
        p.cubicTo(x1, y1 - cy + k * cy, x1 - cx + k * cx, y1, x1 - cx, y1)
    cx, cy = r["tl"]
    p.lineTo(x0 + cx, y1)
    if cx:
        p.cubicTo(x0 + cx - k * cx, y1, x0, y1 - cy + k * cy, x0, y1 - cy)
    p.lineTo(x0, y0 + by)
    if bx:
        p.cubicTo(x0, y0 + by - k * by, x0 + bx - k * bx, y0, x0 + bx, y0)
    p.close()
    return p


def U(*paths):
    res = paths[0]
    for p in paths[1:]:
        res = op(res, p, PathOp.UNION)
    return res


def D(a, *bs):
    for b in bs:
        a = op(a, b, PathOp.DIFFERENCE)
    return a


def I(a, b):
    return op(a, b, PathOp.INTERSECTION)


def xf(p, a, b, c, d, e, f):
    out = Path()
    p.draw(TransformPen(out.getPen(), (a, b, c, d, e, f)))
    return out


def move(p, dx, dy=0):
    return xf(p, 1, 0, 0, 1, dx, dy)


def mirror_x(p, w):
    return xf(p, -1, 0, 0, 1, w, 0)


def rot180(p, w, hgt):
    return xf(p, -1, 0, 0, -1, w, hgt)


def ring(x0, y0, x1, y1, sv, sh, rxf=1.0, ryf=1.05, ryfi=1.35,
         square="", square_in=""):
    """Stadium-shaped ring: straight sides, rounded top and bottom."""
    w = x1 - x0
    rx = w / 2 * rxf
    outer = RR(x0, y0, x1, y1, rx, rx * ryf, square, K_OUT)
    iw = w - 2 * sv
    rxi = iw / 2 * rxf
    inner = RR(x0 + sv, y0 + sh, x1 - sv, y1 - sh, rxi, rxi * ryfi, square_in, K_IN)
    return D(outer, inner)


def stroke(p, q, t, ext=0):
    """Straight stroke with horizontal thickness t along the centre line p→q."""
    t *= BOLD
    (px, py), (qx, qy) = p, q
    if ext:
        L = math.hypot(qx - px, qy - py)
        ux, uy = (qx - px) / L, (qy - py) / L
        px, py, qx, qy = px - ux * ext, py - uy * ext, qx + ux * ext, qy + uy * ext
    return poly([(px - t / 2, py), (px + t / 2, py), (qx + t / 2, qy), (qx - t / 2, qy)])


def hstroke(p, q, t):
    """Straight stroke with vertical thickness t (for flat diagonals)."""
    t *= BOLD
    (px, py), (qx, qy) = p, q
    return poly([(px, py - t / 2), (qx, qy - t / 2), (qx, qy + t / 2), (px, py + t / 2)])


def wave(x0, x1, yc, amp, t, n=32):
    top, bot = [], []
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n
        y = yc + amp * math.sin(math.pi * 2 * i / n)
        top.append((x, y + t / 2))
        bot.append((x, y - t / 2))
    return poly(bot + top[::-1])


# --- Glyph registry ---------------------------------------------------------

GLYPHS = {}      # name -> (advance, Path)
CMAP = {}        # codepoint -> name
ORDER = [".notdef", "space"]


def add(name, uni, path, w, lsb=SB, rsb=SB, advance=None):
    adv = advance if advance is not None else round(lsb + w + rsb)
    GLYPHS[name] = (adv, move(path, lsb) if lsb else path, w, lsb)
    if name not in ORDER:
        ORDER.append(name)
    if uni is not None:
        CMAP[uni] = name


# --- Shape builders shared by several glyphs --------------------------------

def a_shape(w, hgt, t, aw, bar_y=None, bar_h=None):
    aw += 2 * t * (BOLD - 1)
    tb = t * BOLD
    left = stroke((tb / 2, 0), (w / 2 - aw / 2 + tb / 2, hgt), t)
    right = stroke((w - tb / 2, 0), (w / 2 + aw / 2 - tb / 2, hgt), t)
    p = U(left, right)
    if bar_y is not None:
        hull = poly([(0, 0), (w, 0), (w / 2 + aw / 2, hgt), (w / 2 - aw / 2, hgt)])
        p = U(p, I(R(0, bar_y, w, bar_y + bar_h), hull))
    return I(p, R(0, 0, w, hgt))


def v_shape(w, hgt, t, aw):
    return xf(a_shape(w, hgt, t, aw), 1, 0, 0, -1, 0, hgt)


def w_shape(w, hgt, t, aw):
    ww = (w + t) / 2
    return U(v_shape(ww, hgt, t, aw), move(v_shape(ww, hgt, t, aw), w - ww))


def x_shape(w, hgt, t):
    return I(U(stroke((t / 2, hgt), (w - t / 2, 0), t),
               stroke((w - t / 2, hgt), (t / 2, 0), t)), R(0, 0, w, hgt))


def z_shape(w, hgt, t, bar, inset=12):
    return I(U(R(inset, hgt - bar, w, hgt), R(0, 0, w, bar),
               stroke((w - t / 2, hgt), (t / 2, 0), t)), R(0, 0, w, hgt))


def s_shape(w, hgt, sv, sh, top_term=0.63, bot_term=0.34, mid=0.52, inset=8, rxf=0.7, ryf=0.8):
    """Squarish S: two half-open rings with tight corners stacked on a flat spine."""
    ym = hgt * mid
    top = D(ring(inset, ym - sh / 2, w - inset, hgt + OS, sv, sh, rxf=rxf, ryf=ryf, ryfi=ryf),
            R(w / 2, ym - sh, w + 5, hgt * top_term))
    bot = D(ring(0, -OS, w, ym + sh / 2, sv, sh, rxf=rxf, ryf=ryf, ryfi=ryf),
            R(-5, hgt * bot_term, w / 2, ym + sh))
    return U(top, bot)


def c_shape(w, hgt, sv, sh, lo=0.37, hi=0.63):
    return D(ring(0, -OS, w, hgt + OS, sv, sh), R(w * 0.5, hgt * lo, w + 5, hgt * hi))


def arch(x0, x1, sv, sh, top, cut, xmax=None):
    """Shoulder of n/m/h/r: upper half of a ring, without its left stem."""
    xmax = x1 if xmax is None else xmax
    return I(ring(x0, -400, x1, top + OS, sv, sh), R(x0 + sv, cut, xmax, top + 60))


def bowl_glyph(w, stem_top, stem_bottom, sv, sh):
    """b/p: stem with a bowl on the right."""
    bowl = ring(0, -OS, w, XH + OS, sv, sh, square="bltl")
    p = U(R(0, stem_bottom, sv, stem_top), bowl)
    if stem_bottom >= 0:
        p = D(p, R(-5, -60, sv, 0))
    if stem_top <= XH:
        p = D(p, R(-5, XH, sv, XH + 60))
    return p


def dot(x, y, s):
    return R(x, y, x + s, y + s)


# --- Capitals ---------------------------------------------------------------

def build_caps():
    C = CAP
    mid = C * 0.51
    add("A", ord("A"), a_shape(380, C, 102, 178, C * 0.17, HB * 0.82), 380, SBD, SBD)
    # B
    w = 330
    ym = C * 0.5
    p = U(ring(0, ym - HB / 2, w, C, V, HB, rxf=0.92, square="bltl", square_in="bltl"),
          ring(0, 0, w, ym + HB / 2, V, HB, rxf=0.92, square="bltl", square_in="bltl"))
    add("B", ord("B"), p, w, SB, SBR)
    add("C", ord("C"), c_shape(330, C, V, HB), 330, SBR, SBR - 6)
    w = 340
    add("D", ord("D"), ring(0, 0, w, C, V, HB, rxf=0.92, square="bltl", square_in="bltl"), w, SB, SBR)
    w = 280
    add("E", ord("E"), U(R(0, 0, V, C), R(0, C - HB, w, C), R(0, 0, w, HB),
                         R(0, mid - HB / 2, w - 20, mid + HB / 2)), w, SB, SB - 10)
    w = 270
    add("F", ord("F"), U(R(0, 0, V, C), R(0, C - HB, w, C),
                         R(0, mid - HB / 2 - 10, w - 20, mid + HB / 2 - 10)), w, SB, SB - 14)
    w = 340
    gy = C * 0.46
    p = U(D(ring(0, -OS, w, C + OS, V, HB), R(w * 0.5, gy, w + 5, C * 0.63)),
          R(w * 0.48, gy - HB, w, gy))
    add("G", ord("G"), p, w, SBR, SB - 6)
    w = 330
    add("H", ord("H"), U(R(0, 0, V, C), R(w - V, 0, w, C), R(0, mid - HB / 2, w, mid + HB / 2)), w)
    add("I", ord("I"), R(0, 0, V, C), V)
    w = 290
    p = U(R(w - V, C * 0.3, w, C),
          D(I(ring(0, -OS, w, C * 0.65, V, HB), R(-5, -30, w + 5, C * 0.32)),
            R(-5, C * 0.25, w / 2, C)))
    add("J", ord("J"), p, w, SBD + 6, SB)
    w = 345
    t = 124
    diag = U(stroke((V * 0.55, C * 0.28), (w - t / 2, C), t),
             stroke((w * 0.40, C * 0.56), (w - t / 2, 0), t * 1.04))
    add("K", ord("K"), U(R(0, 0, V, C), I(diag, R(V / 2, 0, w, C))), w, SB, SBD)
    w = 270
    add("L", ord("L"), U(R(0, 0, V, C), R(0, 0, w, HB)), w, SB, SBD)
    w = 420
    sv, t = 110, 122
    bw = t * 1.1
    vy = 0
    p = U(R(0, 0, sv, C), R(w - sv, 0, w, C),
          I(U(stroke((t / 2, C), (w / 2 - bw / 2 + t / 2, vy), t),
              stroke((w - t / 2, C), (w / 2 + bw / 2 - t / 2, vy), t)), R(0, 0, w, C)))
    add("M", ord("M"), p, w)
    w = 340
    sv, t = 106, 132
    p = U(R(0, 0, sv, C), R(w - sv, 0, w, C),
          I(stroke((t / 2, C), (w - t / 2, 0), t), R(0, 0, w, C)))
    add("N", ord("N"), p, w)
    w = 340
    add("O", ord("O"), ring(0, -OS, w, C + OS, V, HB), w, SBR, SBR)
    w = 320
    add("P", ord("P"), U(R(0, 0, V, C), ring(0, C * 0.42, w, C, V, HB, rxf=0.92,
                                             square="bltl", square_in="bltl")), w, SB, SBR)
    w = 340
    p = U(ring(0, -OS, w, C + OS, V, HB),
          I(stroke((w * 0.56, C * 0.22), (w * 0.93, -70), 104), R(0, -70, w + 20, C)))
    add("Q", ord("Q"), p, w, SBR, SBR)
    w = 335
    t = 128
    bowl = ring(0, C * 0.42, w - 8, C, V, HB, rxf=0.92, square="bltl", square_in="bltl")
    leg = I(stroke((w * 0.52, C * 0.46), (w - t / 2, 0), t), R(0, 0, w, C * 0.5))
    add("R", ord("R"), U(R(0, 0, V, C), bowl, leg), w, SB, SBD)
    add("S", ord("S"), s_shape(330, C, V, HB), 330, SBR - 4, SBR - 4)
    w = 300
    add("T", ord("T"), U(R(0, C - HB, w, C), R(w / 2 - V / 2, 0, w / 2 + V / 2, C)), w, SBD + 2, SBD + 2)
    w = 335
    p = U(R(0, C * 0.3, V, C), R(w - V, C * 0.3, w, C),
          I(ring(0, -OS, w, C * 0.7, V, HB), R(-5, -30, w + 5, C * 0.35)))
    add("U", ord("U"), p, w)
    add("V", ord("V"), v_shape(365, C, 110, 164), 365, SBD, SBD)
    add("W", ord("W"), w_shape(525, C, 106, 134), 525, SBD, SBD)
    add("X", ord("X"), x_shape(340, C, 128), 340, SBD, SBD)
    w = 345
    t = 126
    yj = C * 0.44
    p = U(I(U(stroke((t / 2, C), (w / 2, yj), t), stroke((w - t / 2, C), (w / 2, yj), t)),
            R(0, yj - 60, w, C)),
          R(w / 2 - V / 2, 0, w / 2 + V / 2, yj + 20))
    add("Y", ord("Y"), p, w, SBD, SBD)
    add("Z", ord("Z"), z_shape(295, C, 134, HB), 295, SBD + 8, SBD + 8)


# --- Lowercase --------------------------------------------------------------

def build_lower():
    X = XH
    w = 300
    top = D(I(ring(0, X * 0.3, w, X + OS, v, h), R(-5, X * 0.6, w + 5, X + 60)),
            R(-5, X * 0.6, w * 0.5, X * 0.72))
    p = U(top, R(w - v, 0, w, X * 0.75), ring(0, -OS, w, X * 0.56, v, h))
    add("a", ord("a"), p, w, SBR, SB)
    w = 310
    add("b", ord("b"), bowl_glyph(w, ASC, 0, v, h), w, SB, SBR)
    add("c", ord("c"), c_shape(290, X, v, h), 290, SBR, SBR - 6)
    add("d", ord("d"), mirror_x(bowl_glyph(w, ASC, 0, v, h), w), w, SBR, SB)
    w = 300
    p = U(D(ring(0, -OS, w, X + OS, v, h), R(w * 0.5, X * 0.2, w + 5, X * 0.42)),
          R(v / 2, X * 0.42, w - v / 2, X * 0.42 + h))
    add("e", ord("e"), p, w, SBR, SBR - 4)
    w = 215
    x0 = 30
    p = U(R(x0, 0, x0 + v, ASC - 150),
          I(ring(x0, ASC + OS - 700, x0 + 320, ASC + OS, v, h), R(x0, ASC - 250, w, ASC + 60)),
          R(0, X - h, w - 10, X))
    add("f", ord("f"), p, w, SBD, SBD - 4)
    w = 310
    bowl = D(ring(0, -OS, w, X + OS, v, h, square="brtr"), R(w - v, X, w + 5, X + 60))
    hook = D(I(ring(0, DESC - OS, w, 280, v, h), R(-5, DESC - 60, w + 5, 0)),
             R(-5, DESC + 110, w * 0.5, 20))
    add("g", ord("g"), U(bowl, R(w - v, -40, w, X), hook), w, SBR, SB)
    w = 300
    add("h", ord("h"), U(R(0, 0, v, ASC), R(w - v, 0, w, X * 0.6), arch(0, w, v, h, X, X * 0.45)), w)
    add("dotlessi", 0x131, R(0, 0, v, X), v)
    add("i", ord("i"), U(R(0, 0, v, X), dot(0, X + 90, v)), v)
    w = 170
    p = U(R(w - v, -30, w, X),
          I(ring(-160, DESC - OS, w, 320, v, h), R(0, DESC - 60, w + 5, 0)),
          dot(w - v, X + 90, v))
    add("j", ord("j"), p, w, SBD, SB)
    w = 310
    t = 116
    diag = U(stroke((v * 0.55, X * 0.22), (w - t / 2, X), t),
             stroke((w * 0.42, X * 0.55), (w - t / 2, 0), t * 1.04))
    add("k", ord("k"), U(R(0, 0, v, ASC), I(diag, R(v / 2, 0, w, X))), w, SB, SBD)
    add("l", ord("l"), R(0, 0, v, ASC), v)
    w = 490
    aw = (w + v) / 2
    p = U(R(0, 0, v, X), R(w - aw, 0, w - aw + v, X * 0.6), R(w - v, 0, w, X * 0.6),
          arch(0, aw, v, h, X, X * 0.45), arch(w - aw, w, v, h, X, X * 0.45))
    add("m", ord("m"), p, w)
    w = 300
    n = U(R(0, 0, v, X), R(w - v, 0, w, X * 0.6), arch(0, w, v, h, X, X * 0.45))
    add("n", ord("n"), n, w)
    add("o", ord("o"), ring(0, -OS, 305, X + OS, v, h), 305, SBR, SBR)
    w = 310
    add("p", ord("p"), bowl_glyph(w, X, DESC, v, h), w, SB, SBR)
    add("q", ord("q"), mirror_x(bowl_glyph(w, X, DESC, v, h), w), w, SBR, SB)
    w = 200
    add("r", ord("r"), U(R(0, 0, v, X), arch(0, w + 120, v, h, X, X * 0.5, xmax=w)), w, SB, SBD - 4)
    add("s", ord("s"), s_shape(290, X, v, h), 290, SBR - 4, SBR - 4)
    w = 210
    x0 = 30
    p = U(R(x0, X * 0.25, x0 + v, X + 150),
          I(ring(x0, -OS, x0 + 320, 700, v, h), R(x0, -30, w, X * 0.3)),
          R(0, X - h, w - 15, X))
    add("t", ord("t"), p, w, SBD, SBD - 4)
    add("u", ord("u"), rot180(n, 300, X), 300)
    add("v", ord("v"), v_shape(305, X, 120, 110), 305, SBD, SBD)
    add("w", ord("w"), w_shape(460, X, 106, 100), 460, SBD, SBD)
    add("x", ord("x"), x_shape(305, X, 120), 305, SBD, SBD)
    w = 305
    t = 120
    xb = w / 2 + t * 0.15
    xr = w - t / 2
    xd = xb - (xr - xb) * (-DESC) / X
    p = U(I(stroke((t / 2, X), (xb - t / 2, 0), t), R(0, 0, w, X)),
          I(stroke((xr, X), (xd, DESC), t), R(0, DESC, w, X)))
    add("y", ord("y"), p, w, SBD, SBD)
    add("z", ord("z"), z_shape(260, X, 124, h), 260, SBD + 6, SBD + 6)


# --- Figures (tabular) ------------------------------------------------------

def build_figures():
    C = CAP
    # Figures use slightly lighter strokes on a wider body for open counters
    V = round(118 * BOLD * 0.92)
    HB = round(96 * BOLD * 0.9)
    W = 340
    adv = W + 2 * 30
    fig = lambda name, ch, p: add(name, ord(ch), p, W, 30, 30, advance=adv)
    fig("zero", "0", ring(0, -OS, W, C + OS, V, HB))
    sx1 = W * 0.70
    sx0 = sx1 - V
    fig("one", "1", U(R(sx0, 0, sx1, C),
                      poly([(sx0 + 2, C), (sx0 + 2, C - 175), (sx0 - 120, C - 215), (sx0 - 120, C - 100)])))
    # spine: the right stem bends into the diagonal without steps
    spine = poly([(W, C * 0.70), (W, C * 0.50), (V * 1.15, HB - 1), (0, HB - 1),
                  (W - V, C * 0.50), (W - V, C * 0.70)])
    p = U(I(ring(0, C * 0.42, W, C + OS, V, HB), R(-5, C * 0.62, W + 5, C + 60)),
          spine, R(0, 0, W, HB))
    fig("two", "2", p)
    ym = C * 0.5
    p = U(D(ring(0, ym - HB / 2, W, C + OS, V, HB), R(-5, ym - HB, W * 0.38, C * 0.66)),
          D(ring(0, -OS, W, ym + HB / 2, V, HB), R(-5, C * 0.32, W * 0.38, ym + HB)))
    fig("three", "3", p)
    sx1 = W - 8
    sx0 = sx1 - V
    by = C * 0.15
    t = V * 0.70
    tb = t * BOLD
    p = U(R(sx0, 0, sx1, C), R(0, by, sx1, by + HB),
          I(stroke((sx0 + tb / 2, C), (tb / 2, by + HB), t), R(0, by, W, C)))
    fig("four", "4", p)
    bar_low = C * 0.6 - HB
    p = U(R(0, C - HB, W - 10, C), R(0, bar_low, V, C),
          D(ring(0, -OS, W, C * 0.6, V, HB), R(-5, C * 0.22, W * 0.5, bar_low)))
    fig("five", "5", p)
    six = U(D(I(ring(0, -OS, W, C + OS, V, HB), R(-5, C * 0.3, W + 5, C + 60)),
              R(W * 0.5, C * 0.3, W + 5, C * 0.72)),
            ring(0, -OS, W, C * 0.6, V, HB))
    fig("six", "6", six)
    t = V * 1.1
    fig("seven", "7", U(R(0, C - HB, W, C),
                        I(stroke((W - t / 2, C - HB / 2), (W * 0.28, 0), t), R(0, 0, W, C))))
    ym = C * 0.5
    fig("eight", "8", U(ring(6, ym - HB / 2, W - 6, C + OS, V * 0.95, HB),
                        ring(0, -OS, W, ym + HB / 2, V, HB)))
    fig("nine", "9", rot180(six, W, C))


# --- Punctuation and symbols ------------------------------------------------

def build_symbols():
    C = CAP
    d = 112                       # dot size
    mid = C * 0.42                # optical centre for math symbols
    add("period", ord("."), dot(0, 0, d), d, 40, 40)
    comma = U(dot(0, 0, d), poly([(d * 0.3, 0), (d, 0), (d * 0.45, -150), (0, -150)]))
    add("comma", ord(","), comma, d, 40, 40)
    add("colon", ord(":"), U(dot(0, 0, d), dot(0, XH - d, d)), d, 40, 40)
    add("semicolon", ord(";"), U(comma, dot(0, XH - d, d)), d, 40, 40)
    excl = U(poly([(0, C), (d, C), (d - 14, d + 90), (14, d + 90)]), dot(0, 0, d))
    add("exclam", ord("!"), excl, d, 40, 40)
    add("exclamdown", 0xA1, rot180(excl, d, C - 180), d, 40, 40)
    w = 270
    q = U(D(ring(0, C * 0.40, w, C + OS, V, HB), R(-5, C * 0.36, w / 2 - V / 2, C * 0.62)),
          R(w / 2 - V / 2, d + 80, w / 2 + V / 2, C * 0.40 + HB),
          dot(w / 2 - d / 2, 0, d))
    add("question", ord("?"), q, w, SBR, SBR)
    add("questiondown", 0xBF, rot180(q, w, C - 180), w, SBR, SBR)
    add("hyphen", ord("-"), R(0, mid - h / 2, 180, mid + h / 2), 180, 30, 30)
    add("softhyphen", 0xAD, R(0, mid - h / 2, 180, mid + h / 2), 180, 30, 30)
    add("endash", 0x2013, R(0, mid - h / 2, 420, mid + h / 2), 420, 20, 20)
    add("emdash", 0x2014, R(0, mid - h / 2, 860, mid + h / 2), 860, 20, 20)
    add("underscore", ord("_"), R(0, -150, 420, -150 + h), 420, 10, 10)
    add("quotesingle", ord("'"), R(0, C - 260, 100, C), 100, 40, 40)
    add("quotedbl", ord('"'), U(R(0, C - 260, 100, C), R(170, C - 260, 270, C)), 270, 40, 40)
    qr = move(comma, 0, C - d)
    ql = rot180(qr, d, 2 * C - d - 150)
    add("quoteright", 0x2019, qr, d, 40, 40)
    add("quoteleft", 0x2018, ql, d, 40, 40)
    add("quotesinglbase", 0x201A, comma, d, 40, 40)
    add("quotedblright", 0x201D, U(qr, move(qr, d + 60)), 2 * d + 60, 40, 40)
    add("quotedblleft", 0x201C, U(ql, move(ql, d + 60)), 2 * d + 60, 40, 40)
    add("quotedblbase", 0x201E, U(comma, move(comma, d + 60)), 2 * d + 60, 40, 40)
    add("ellipsis", 0x2026, U(dot(0, 0, d), dot(d + 70, 0, d), dot(2 * d + 140, 0, d)), 3 * d + 140, 40, 40)
    add("periodcentered", 0xB7, dot(0, mid - d / 2, d), d, 40, 40)
    add("bullet", 0x2022, ring(0, mid - 110, 220, mid + 110, 110, 110), 220, 40, 40)
    # brackets
    w = 170
    paren = I(ring(0, -170, 2 * w, C + 150, 100, 80, ryf=1.6, ryfi=2.0), R(0, -200, w, C + 200))
    add("parenleft", ord("("), paren, w, 40, 10)
    add("parenright", ord(")"), mirror_x(paren, w), w, 10, 40)
    w = 160
    brk = U(R(0, -150, 100, C + 130), R(0, -150, w, -150 + h), R(0, C + 130 - h, w, C + 130))
    add("bracketleft", ord("["), brk, w, 50, 10)
    add("bracketright", ord("]"), mirror_x(brk, w), w, 10, 50)
    brace = U(R(60, -150, 160, C + 130), R(60, -150, 200, -150 + h), R(60, C + 130 - h, 200, C + 130),
              R(0, C * 0.45 - h / 2, 100, C * 0.45 + h / 2))
    add("braceleft", ord("{"), brace, 200, 30, 10)
    add("braceright", ord("}"), mirror_x(brace, 200), 200, 10, 30)
    w = 300
    t = 96
    sl = I(stroke((t / 2, -120), (w - t / 2, C + 100), t), R(0, -120, w, C + 100))
    add("slash", ord("/"), sl, w, 10, 10)
    add("backslash", ord("\\"), mirror_x(sl, w), w, 10, 10)
    add("bar", ord("|"), R(0, -150, 96, C + 130), 96, 60, 60)
    add("brokenbar", 0xA6, U(R(0, -150, 96, 280), R(0, 440, 96, C + 130)), 96, 60, 60)
    # math
    w = 360
    hb = R(0, mid - h / 2, w, mid + h / 2)
    vb = R(w / 2 - h / 2, mid - w / 2, w / 2 + h / 2, mid + w / 2)
    add("plus", ord("+"), U(hb, vb), w, 30, 30)
    add("minus", 0x2212, hb, w, 30, 30)
    add("equal", ord("="), U(move(hb, 0, -80), move(hb, 0, 80)), w, 30, 30)
    add("plusminus", 0xB1, U(move(U(hb, I(vb, R(0, mid - 140, w, mid + 160))), 0, 60),
                             R(0, mid - 220, w, mid - 220 + h)), w, 30, 30)
    add("divide", 0xF7, U(hb, dot(w / 2 - 50, mid + 90, 100), dot(w / 2 - 50, mid - 190, 100)), w, 30, 30)
    cx, cy = w / 2, mid
    bar_ = R(cx - 170, cy - h / 2, cx + 170, cy + h / 2)
    rot = lambda p, deg: xf(move(p, -cx, -cy), math.cos(math.radians(deg)), math.sin(math.radians(deg)),
                            -math.sin(math.radians(deg)), math.cos(math.radians(deg)), cx, cy)
    add("multiply", 0xD7, U(rot(bar_, 45), rot(bar_, -45)), w, 30, 30)
    ast_c = (cx, C - 150)
    abar = R(cx - 130, C - 150 - 45, cx + 130, C - 150 + 45)
    rot_a = lambda p, deg: xf(move(p, -ast_c[0], -ast_c[1]), math.cos(math.radians(deg)),
                              math.sin(math.radians(deg)), -math.sin(math.radians(deg)),
                              math.cos(math.radians(deg)), ast_c[0], ast_c[1])
    add("asterisk", ord("*"), U(rot_a(abar, 90), rot_a(abar, 30), rot_a(abar, 150)), w, 10, 10)
    lt = I(U(hstroke((0, mid), (w, mid + 230), 96), hstroke((0, mid), (w, mid - 230), 96)),
           R(0, 0, w, C))
    lt = U(lt, R(0, mid - 48, 40, mid + 48))
    add("less", ord("<"), lt, w, 30, 30)
    add("greater", ord(">"), mirror_x(lt, w), w, 30, 30)
    gw = 150
    gq = I(U(hstroke((0, mid), (gw, mid + 150), 80), hstroke((0, mid), (gw, mid - 150), 80)),
           R(0, 0, gw, C))
    add("guilsinglleft", 0x2039, gq, gw, 30, 30)
    add("guilsinglright", 0x203A, mirror_x(gq, gw), gw, 30, 30)
    add("guillemotleft", 0xAB, U(gq, move(gq, gw - 20)), 2 * gw - 20, 30, 30)
    add("guillemotright", 0xBB, mirror_x(U(gq, move(gq, gw - 20)), 2 * gw - 20), 2 * gw - 20, 30, 30)
    w = 380
    hs = h
    p = U(I(U(stroke((110, 0), (160, C), 96), stroke((240, 0), (290, C), 96)), R(0, 60, w, C - 60)),
          R(0, C * 0.30, w, C * 0.30 + hs), R(0, C * 0.62, w, C * 0.62 + hs))
    add("numbersign", ord("#"), p, w, 15, 15)
    w = 520
    sm = 200
    p = U(ring(0, C * 0.5, sm, C, 80, 70), ring(w - sm, 0, w, C * 0.5, 80, 70),
          I(stroke((150, -20), (w - 150, C + 20), 88), R(0, 0, w, C)))
    add("percent", ord("%"), p, w, 20, 20)
    w = 330
    s = s_shape(w, C, V, HB)
    add("dollar", ord("$"), U(s, R(w / 2 - 32, -130, w / 2 + 32, 10), R(w / 2 - 32, C - 10, w / 2 + 32, C + 130)),
        w, SBR - 4, SBR - 4)
    w = 330
    p = U(c_shape(w, C, V, HB, 0.32, 0.68), R(-40, C * 0.52, w * 0.62, C * 0.52 + 70),
          R(-40, C * 0.34, w * 0.62, C * 0.34 + 70))
    add("Euro", 0x20AC, p, w, 50, SBR - 6)
    w = 220
    add("degree", 0xB0, ring(0, C - w, w, C, 70, 62), w, 40, 40)
    w = 400
    bw = w - 70
    p = U(ring(30, C * 0.55, bw - 50, C + OS, 96, HB),
          D(ring(0, -OS, bw, C * 0.58, V, HB), R(bw * 0.5, C * 0.24, w, C * 0.62)),
          I(stroke((90, C * 0.60), (w - 62, 0), 124), R(0, 0, w, C * 0.62)),
          R(bw - V, C * 0.24, w, C * 0.24 + HB * 0.9))
    add("ampersand", ord("&"), p, w, SBR, SBD)
    w = 640
    inner = U(ring(w * 0.30, C * 0.12, w * 0.58, C * 0.70, 80, 72), R(w * 0.58 - 80, C * 0.12, w * 0.58, C * 0.72))
    outer = D(ring(0, -150, w, C + 40, 84, 80, ryf=1.0), R(w * 0.58, -160, w + 5, C * 0.25))
    tail = R(w * 0.58 - 80, C * 0.12, w, C * 0.12 + 80)
    add("at", ord("@"), U(inner, outer, I(tail, R(0, 0, w, C))), w, SBR, SBR)
    add("asciitilde", ord("~"), wave(0, 340, mid, 50, 84), 340, 30, 30)
    add("asciicircum", ord("^"), U(stroke((60, C * 0.45), (170, C), 110), stroke((280, C * 0.45), (170, C), 110)), 340, 30, 30)
    add("logicalnot", 0xAC, U(hb, R(w * 0 + 360 - h, mid - 160, 360, mid)), 360, 30, 30)


# --- Accented letters -------------------------------------------------------

def acc_dieresis(cx, y, s=96, gap=56):
    return U(dot(cx - gap / 2 - s, y, s), dot(cx + gap / 2, y, s))


def acc_acute(cx, y, hgt=150):
    return poly([(cx - 70, y), (cx + 15, y), (cx + 85, y + hgt), (cx - 5, y + hgt)])


def acc_grave(cx, y, hgt=150):
    return mirror_x(move(acc_acute(0, y, hgt), cx), 2 * cx)


def acc_circumflex(cx, y, hgt=150):
    return U(stroke((cx - 75, y), (cx - 22, y + hgt), 92), stroke((cx + 75, y), (cx + 22, y + hgt), 92))


def acc_tilde(cx, y, hgt=150):
    return wave(cx - 115, cx + 115, y + hgt / 2, 34, 74)


def acc_ring(cx, y, hgt=170):
    return ring(cx - 85, y, cx + 85, y + hgt, 52, 48)


def acc_cedilla(cx):
    hook = D(ring(cx - 80, -220, cx + 60, -70, 48, 40), R(cx - 90, -150, cx - 5, -60))
    return U(hook, R(cx - 10, -110, cx + 38, 10))


MARKS = {
    "grave": acc_grave, "acute": acc_acute, "circumflex": acc_circumflex,
    "tilde": acc_tilde, "dieresis": acc_dieresis, "ring": acc_ring,
}

LATIN1 = [
    # name, codepoint, base, mark
    ("Agrave", 0xC0, "A", "grave"), ("Aacute", 0xC1, "A", "acute"),
    ("Acircumflex", 0xC2, "A", "circumflex"), ("Atilde", 0xC3, "A", "tilde"),
    ("Adieresis", 0xC4, "A", "dieresis"), ("Aring", 0xC5, "A", "ring"),
    ("Egrave", 0xC8, "E", "grave"), ("Eacute", 0xC9, "E", "acute"),
    ("Ecircumflex", 0xCA, "E", "circumflex"), ("Edieresis", 0xCB, "E", "dieresis"),
    ("Igrave", 0xCC, "I", "grave"), ("Iacute", 0xCD, "I", "acute"),
    ("Icircumflex", 0xCE, "I", "circumflex"), ("Idieresis", 0xCF, "I", "dieresis"),
    ("Ntilde", 0xD1, "N", "tilde"),
    ("Ograve", 0xD2, "O", "grave"), ("Oacute", 0xD3, "O", "acute"),
    ("Ocircumflex", 0xD4, "O", "circumflex"), ("Otilde", 0xD5, "O", "tilde"),
    ("Odieresis", 0xD6, "O", "dieresis"),
    ("Ugrave", 0xD9, "U", "grave"), ("Uacute", 0xDA, "U", "acute"),
    ("Ucircumflex", 0xDB, "U", "circumflex"), ("Udieresis", 0xDC, "U", "dieresis"),
    ("Yacute", 0xDD, "Y", "acute"),
    ("agrave", 0xE0, "a", "grave"), ("aacute", 0xE1, "a", "acute"),
    ("acircumflex", 0xE2, "a", "circumflex"), ("atilde", 0xE3, "a", "tilde"),
    ("adieresis", 0xE4, "a", "dieresis"), ("aring", 0xE5, "a", "ring"),
    ("egrave", 0xE8, "e", "grave"), ("eacute", 0xE9, "e", "acute"),
    ("ecircumflex", 0xEA, "e", "circumflex"), ("edieresis", 0xEB, "e", "dieresis"),
    ("igrave", 0xEC, "dotlessi", "grave"), ("iacute", 0xED, "dotlessi", "acute"),
    ("icircumflex", 0xEE, "dotlessi", "circumflex"), ("idieresis", 0xEF, "dotlessi", "dieresis"),
    ("ntilde", 0xF1, "n", "tilde"),
    ("ograve", 0xF2, "o", "grave"), ("oacute", 0xF3, "o", "acute"),
    ("ocircumflex", 0xF4, "o", "circumflex"), ("otilde", 0xF5, "o", "tilde"),
    ("odieresis", 0xF6, "o", "dieresis"),
    ("ugrave", 0xF9, "u", "grave"), ("uacute", 0xFA, "u", "acute"),
    ("ucircumflex", 0xFB, "u", "circumflex"), ("udieresis", 0xFC, "u", "dieresis"),
    ("yacute", 0xFD, "y", "acute"), ("ydieresis", 0xFF, "y", "dieresis"),
]


def build_accents():
    for name, uni, base, mark in LATIN1:
        adv, path, w, lsb = GLYPHS[base]
        cx = lsb + w / 2
        y = CAP + 50 if base[0].isupper() else XH + 80
        if base == "dotlessi" and mark == "dieresis":
            m = acc_dieresis(cx, y, s=80, gap=30)
        else:
            m = MARKS[mark](cx, y)
        add(name, uni, U(path, m), w, 0, 0, advance=adv)
    # cedilla
    for name, uni, base in (("Ccedilla", 0xC7, "C"), ("ccedilla", 0xE7, "c")):
        adv, path, w, lsb = GLYPHS[base]
        add(name, uni, U(path, acc_cedilla(lsb + w / 2)), w, 0, 0, advance=adv)
    # spacing marks
    for name, uni, fn in (("grave", 0x60, acc_grave), ("acute", 0xB4, acc_acute),
                          ("dieresis", 0xA8, acc_dieresis)):
        add(name, uni, fn(130, CAP - 150), 260, 0, 0, advance=300)
    add("cedilla", 0xB8, acc_cedilla(130), 260, 0, 0, advance=300)
    add("macron", 0xAF, R(0, CAP - 30, 260, CAP - 30 + h), 260, 20, 20)
    # slashed O, Eth, sharp s
    adv, path, w, lsb = GLYPHS["O"]
    add("Oslash", 0xD8, U(path, move(I(stroke((40, -60), (w - 40, CAP + 60), 84), R(-20, -60, w + 20, CAP + 60)), lsb)),
        w, 0, 0, advance=adv)
    adv, path, w, lsb = GLYPHS["o"]
    add("oslash", 0xF8, U(path, move(I(stroke((40, -50), (w - 40, XH + 50), 80), R(-20, -50, w + 20, XH + 50)), lsb)),
        w, 0, 0, advance=adv)
    adv, path, w, lsb = GLYPHS["D"]
    add("Eth", 0xD0, U(move(path, 40), R(SBD, CAP * 0.46, 220, CAP * 0.46 + HB)), w + 40, 0, 0,
        advance=adv + 40)
    w = 340
    ym = 520
    upper = I(ring(0, 300, w - 40, ASC + OS, v, h), R(-5, 580, w, ASC + 60))
    neck = R(w - 40 - v, ym - 40, w - 40, 600)
    lower = D(ring(30, -OS, w, ym, v, h), R(-5, -30, v + 45, ym + 10), R(-5, h, w * 0.5, ym + 10))
    p = U(R(0, 0, v, 620), upper, neck, lower)
    add("germandbls", 0xDF, p, w, SB, SBR)


# --- Font assembly ----------------------------------------------------------

def build_all():
    add("space", 0x20, Path(), 0, 0, 0, advance=230)
    add("nbspace", 0xA0, Path(), 0, 0, 0, advance=230)
    nd = D(R(0, 0, 400, CAP), R(60, 60, 340, CAP - 60))
    add(".notdef", None, nd, 400, 40, 40)
    build_caps()
    build_lower()
    build_figures()
    build_symbols()
    build_accents()


def charstring(path, width):
    path = Path(path)
    path.simplify(fix_winding=True, keep_starting_points=False, clockwise=False)
    pen = T2CharStringPen(width, None)
    path.draw(pen)
    return pen.getCharString()


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "fonts", "AaronCompressed")
    os.makedirs(out_dir, exist_ok=True)
    build_all()

    order = [".notdef"] + [n for n in ORDER if n != ".notdef"]
    fb = FontBuilder(UPM, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(CMAP)
    charstrings = {n: charstring(GLYPHS[n][1], GLYPHS[n][0]) for n in order}
    fb.setupCFF(PS_NAME, {"FullName": FAMILY, "FamilyName": FAMILY, "Weight": "Regular"},
                charstrings, {})
    metrics = {}
    for n in order:
        bounds = GLYPHS[n][1].bounds
        lsb = round(bounds[0]) if GLYPHS[n][1].bounds != (0, 0, 0, 0) else 0
        metrics[n] = (GLYPHS[n][0], lsb)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=1155, descent=-139)
    fb.setupNameTable({
        "familyName": FAMILY,
        "styleName": "Regular",
        "uniqueFontIdentifier": f"{PS_NAME};{VERSION}",
        "fullName": FAMILY,
        "psName": PS_NAME,
        "version": f"Version {VERSION}",
        "copyright": "Copyright (c) 2026 aarondnas (https://github.com/aarondnas/lcars-gui)",
        "licenseDescription": "This Font Software is licensed under the MIT License.",
        "licenseInfoURL": "https://opensource.org/license/mit",
    })
    fb.setupOS2(version=4, sTypoAscender=1155, sTypoDescender=-139, sTypoLineGap=0,
                usWinAscent=1155, usWinDescent=340, sxHeight=XH, sCapHeight=CAP,
                achVendID="NONE", fsType=0, fsSelection=0x40 | 0x80,
                usWeightClass=500, usWidthClass=2)
    fb.setupPost()
    otf = os.path.join(out_dir, "AaronCompressed.otf")
    fb.save(otf)
    font = TTFont(otf)
    font.flavor = "woff2"
    font.save(os.path.join(out_dir, "AaronCompressed.woff2"))
    print(f"{len(order)} glyphs -> {out_dir}")


if __name__ == "__main__":
    main()
