"""Genera assets de la app desde referencias/ (escudo + fotos del Instagram del club).
Uso: python3 scripts/make_assets.py  (desde mobile/)"""
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT.parent / "referencias"
OUT = ROOT / "assets"
NAVY = (12, 60, 110)
CELESTE = (42, 167, 223)

# --- Escudo limpio (fondo transparente) ---
src = Image.open(REF / "escudo-delsur-ig.png").convert("RGBA")
w, h = src.size
px = src.load()
mask = [[False] * h for _ in range(w)]

def is_bg(p):
    r, g, b, a = p
    near_white = r > 200 and g > 200 and b > 200
    dark = r < 40 and g < 40 and b < 50
    return near_white or dark

q = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (40, 160), (280, 160), (160, 10), (160, 305)])
while q:
    x, y = q.popleft()
    if x < 0 or y < 0 or x >= w or y >= h or mask[x][y]:
        continue
    if not is_bg(px[x, y]):
        continue
    mask[x][y] = True
    q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

alpha = Image.new("L", (w, h), 255)
ap = alpha.load()
for x in range(w):
    for y in range(h):
        if mask[x][y]:
            ap[x, y] = 0
# suavizar borde: erosionar 1px y blur leve
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
crest = src.copy()
crest.putalpha(alpha)
crest = crest.crop(crest.getbbox())
cw, ch = crest.size
scale = 512 / ch
crest_big = crest.resize((round(cw * scale), 512), Image.LANCZOS)
crest_big = ImageEnhance.Sharpness(crest_big).enhance(1.4)
crest_big.save(OUT / "escudo.png")
print("escudo", crest_big.size)

def centered(canvas_size, bg, img, frac):
    c = Image.new("RGBA", (canvas_size, canvas_size), bg)
    ih = round(canvas_size * frac)
    iw = round(img.width * ih / img.height)
    i = img.resize((iw, ih), Image.LANCZOS)
    c.alpha_composite(i, ((canvas_size - iw) // 2, (canvas_size - ih) // 2))
    return c

# icon iOS / general: fondo navy, escudo 72%
centered(1024, NAVY + (255,), crest_big, 0.72).convert("RGB").save(OUT / "icon.png")
# adaptive foreground: zona segura ~66% del lienzo → escudo 55%
centered(1024, (0, 0, 0, 0), crest_big, 0.55).save(OUT / "android-icon-foreground.png")
Image.new("RGB", (1024, 1024), NAVY).save(OUT / "android-icon-background.png")
mono = centered(1024, (0, 0, 0, 0), crest_big, 0.55)
white = Image.new("RGBA", mono.size, (255, 255, 255, 255))
white.putalpha(mono.getchannel("A"))
white.save(OUT / "android-icon-monochrome.png")
# splash: escudo sobre transparente (fondo lo pone app.json)
centered(1024, (0, 0, 0, 0), crest_big, 0.6).save(OUT / "splash-icon.png")
centered(196, NAVY + (255,), crest_big, 0.8).save(OUT / "favicon.png")

# --- Fotos del collage (tiles del perfil de Instagram) ---
ig = Image.open(REF / "instagram-delsurclub-perfil.jpg").convert("RGB")
tiles = {
    "foto-familia.jpg": (755, 700, 1031, 812),   # chicos jugando en el pasto (sin el texto del posteo)
    "foto-hockey.jpg": (476, 676, 752, 812),     # chicas jugando al hockey (queda el "HOCKEY?" del posteo)
    "foto-abrazo.jpg": (1033, 525, 1310, 615),   # abrazo (parte de arriba, sin texto)
}
(OUT / "fotos").mkdir(exist_ok=True)
for name, box in tiles.items():
    t = ig.crop(box)
    t = t.resize((t.width * 3, t.height * 3), Image.LANCZOS)
    t = ImageEnhance.Color(t).enhance(1.08)
    t.save(OUT / "fotos" / name, quality=88)
    print(name, t.size)
