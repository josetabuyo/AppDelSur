"""Genera el ícono 512 y la imagen destacada 1024x500 de la ficha de Google Play.
Uso: python3 docs/play-store/make_graphics.py (desde la raíz del repo)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter

A = "mobile/assets"
OUT = "docs/play-store"
NAVY, CELESTE, AMARILLO = (12, 60, 110), (42, 167, 223), (242, 217, 78)
ANTON = "mobile/node_modules/@expo-google-fonts/anton/400Regular/Anton_400Regular.ttf"
INTER = "mobile/node_modules/@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf"

# Ícono: Play pide 512x512 PNG de 32 bits, sin transparencia en las esquinas (Play las redondea).
Image.open(f"{A}/icon.png").convert("RGB").resize((512, 512), Image.LANCZOS).save(f"{OUT}/icono-512.png")

# Imagen destacada: foto del equipo a la derecha, degradé azul marino, escudo y lema a la izquierda.
W, H = 1024, 500
g = Image.new("RGB", (W, H), NAVY)
foto = Image.open(f"{A}/fotos/foto-rugby.jpg").convert("RGB")
fh = H; fw = int(foto.width * fh / foto.height)
foto = foto.resize((fw, fh), Image.LANCZOS)
g.paste(foto, (W - fw + 120, 0))
grad = Image.new("L", (W, 1))
for x in range(W):
    grad.putpixel((x, 0), int(255 * max(0, min(1, (640 - x) / 380))))
grad = grad.resize((W, H))
g = Image.composite(Image.new("RGB", (W, H), NAVY), g, grad)
tint = Image.new("RGB", (W, H), NAVY)
g = Image.blend(g, tint, 0.18)

d = ImageDraw.Draw(g)
escudo = Image.open(f"{A}/escudo.png").convert("RGBA")
eh = 150; escudo = escudo.resize((int(escudo.width * eh / escudo.height), eh), Image.LANCZOS)
g.paste(escudo, (64, 60), escudo)
f_big = ImageFont.truetype(ANTON, 74)
f_sub = ImageFont.truetype(INTER, 24)
y = 232
for txt, col in (("MÁS CONECTADOS.", (255, 255, 255)), ("MÁS ORGANIZADOS.", (255, 255, 255)), ("MÁS DEL SUR.", CELESTE)):
    d.text((64, y), txt, font=f_big, fill=col)
    y += 78
# franja celeste-blanco-amarillo como en la app
for i, col in enumerate((CELESTE, (255, 255, 255), AMARILLO)):
    d.rectangle((210 + i * 40, 128, 210 + i * 40 + 38, 134), fill=col)
d.text((210, 70), "DEL SUR", font=ImageFont.truetype(ANTON, 44), fill=(255, 255, 255))
d.text((210, 146), "Rugby · Hockey · Rugby inclusivo", font=f_sub, fill=(220, 232, 245))
g.save(f"{OUT}/destacada-1024x500.png")
print("ok")
