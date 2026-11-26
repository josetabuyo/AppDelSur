"""Capturas de App Store (iPhone 6.9", 1320x2868) a partir de las de Play: título arriba, captura abajo.
Uso: python3 docs/app-store/make_capturas.py (desde la raíz del repo)."""
from PIL import Image, ImageDraw, ImageFont

NAVY, AMARILLO = (12, 60, 110), (242, 217, 78)
ANTON = "mobile/node_modules/@expo-google-fonts/anton/400Regular/Anton_400Regular.ttf"
W, H = 1320, 2868
TITULOS = {
    "1-inicio": "SOMOS FAMILIA",
    "2-padron": "TU FAMILIA YA ESTÁ",
    "3-datos-precargados": "DIVISIÓN Y COLEGIO",
    "4-contacto": "TUS DATOS DE CONTACTO",
    "5-gracias": "¡YA SOS PARTE!",
}
font = ImageFont.truetype(ANTON, 120)
for nombre, titulo in TITULOS.items():
    shot = Image.open(f"docs/play-store/capturas/{nombre}.png").convert("RGB")
    sw = W - 160; sh = int(shot.height * sw / shot.width)
    shot = shot.resize((sw, sh), Image.LANCZOS)
    lienzo = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(lienzo)
    tw = d.textlength(titulo, font=font)
    y0 = (H - (170 + 120 + sh)) // 2
    d.text(((W - tw) / 2, y0), titulo, font=font, fill=AMARILLO)
    top = y0 + 170 + 120
    mask = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, sw, sh), radius=60, fill=255)
    lienzo.paste(shot, (80, top), mask)
    lienzo.save(f"docs/app-store/capturas/{nombre}.png")
print("ok")
