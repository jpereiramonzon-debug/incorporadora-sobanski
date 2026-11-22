"""Tratamento final e exportação das imagens HD do Tour 3D.

Uso (na raiz do projeto):
    python3 tools/exportar-imagens-tour.py PASTA

Cada arquivo .png/.jpg/.webp em PASTA deve ter o MESMO nome da imagem que substitui em assets/
(ex.: tipo01-quarto-1.png -> assets/tipo01-quarto-1.webp). Para cada um são gerados:
  assets/NOME.webp        até 2560 px, WebP qualidade 80 (modo foto do tour e galeria do site)
  assets/NOME-800.webp    800 px, para celular (o tour escolhe sozinho via srcset)
  assets/thumbs/NOME.webp 400 px, miniaturas do menu e das boas-vindas

Tratamento: níveis sem estourar pretos/brancos (autocontraste com corte mínimo, mantendo a cor) e
nitidez de saída suave. Substitui a etapa de acabamento do Canva quando ela não está disponível.
"""
import os
import sys

from PIL import Image, ImageFilter, ImageOps

src_dir = sys.argv[1]
for f in sorted(os.listdir(src_dir)):
    name, ext = os.path.splitext(f)
    if ext.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
        continue
    im = Image.open(os.path.join(src_dir, f)).convert('RGB')
    im = ImageOps.autocontrast(im, cutoff=(0.15, 0.1), preserve_tone=True)
    if im.width > 2560:
        im = im.resize((2560, round(im.height * 2560 / im.width)), Image.LANCZOS)
    im.filter(ImageFilter.UnsharpMask(radius=0.8, percent=40, threshold=2)).save(f'assets/{name}.webp', quality=80, method=6)
    m = im.resize((800, round(im.height * 800 / im.width)), Image.LANCZOS) if im.width > 800 else im
    m.filter(ImageFilter.UnsharpMask(radius=0.6, percent=50, threshold=2)).save(f'assets/{name}-800.webp', quality=82, method=6)
    im.resize((400, round(im.height * 400 / im.width)), Image.LANCZOS).save(f'assets/thumbs/{name}.webp', quality=80, method=6)
    print(f'{name}: {im.width}x{im.height}, {os.path.getsize(f"assets/{name}.webp") // 1024} KB')
