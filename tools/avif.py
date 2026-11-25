"""Versões AVIF das imagens onde o AVIF ganha SEM perder fidelidade.

Uso (na raiz do projeto):
    python3 tools/avif.py [PASTA_DOS_ORIGINAIS]

Regra de qualidade: para cada imagem, a qualidade do AVIF sobe até que a fidelidade (SSIM de
luminância contra a referência, média e 1º percentil) seja PELO MENOS igual à da versão WebP atual.
Só então, e só se o arquivo ficar menor, o .avif é gravado ao lado do .webp. Assim o AVIF nunca é
pior que o WebP que já está no ar.

- Fotos HD do tour: a referência é o ORIGINAL sem compressão (PASTA/gen-NOME.png), com o mesmo
  tratamento de tools/exportar-imagens-tour.py. Partindo do original, o AVIF fica menor E mais fiel.
- Plantas oficiais (desenho técnico): a referência é o próprio WebP; o AVIF 4:4:4 precisa reproduzi-lo
  com SSIM >= 0,999 (traços e textos idênticos à vista).
- As demais fotos ficam só em WebP: sem o original, recomprimir só ganharia peso perdendo detalhe.
"""
import io
import os
import sys

import numpy as np
from PIL import Image, ImageFilter, ImageOps
from scipy.ndimage import gaussian_filter

HD = ['tipo01-sala-cozinha', 'tipo02-cozinha-sala', 'tipo03-sala-cozinha', 'social-salao-a']
PLANS = ['planta-tipo01', 'planta-tipo02', 'planta-tipo03-05', 'planta-tipo04']


def ssim(a, b):
    a = np.asarray(a.convert('L'), np.float64); b = np.asarray(b.convert('L'), np.float64)
    c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    m1, m2 = gaussian_filter(a, 1.5), gaussian_filter(b, 1.5)
    s11 = gaussian_filter(a * a, 1.5) - m1 ** 2; s22 = gaussian_filter(b * b, 1.5) - m2 ** 2; s12 = gaussian_filter(a * b, 1.5) - m1 * m2
    m = ((2 * m1 * m2 + c1) * (2 * s12 + c2)) / ((m1 ** 2 + m2 ** 2 + c1) * (s11 + s22 + c2))
    return float(m.mean()), float(np.percentile(m, 1))


def encode(im, q, sub):
    buf = io.BytesIO(); im.save(buf, 'AVIF', quality=q, subsampling=sub, speed=4)
    return buf.getvalue()


def best_avif(ref, target, sub, start=60):
    """menor qualidade cuja fidelidade >= alvo (média e 1º percentil)"""
    for q in range(start, 96, 3):
        data = encode(ref, q, sub)
        s = ssim(ref, Image.open(io.BytesIO(data)).convert('RGB'))
        if s[0] >= target[0] and s[1] >= target[1]:
            return data, q, s
    return None, None, None


def write(name, ref, webp_path, target, sub, start=60):
    webp = os.path.getsize(webp_path)
    data, q, s = best_avif(ref, target, sub, start)
    if data and len(data) < webp:
        open(webp_path[:-5] + '.avif', 'wb').write(data)
        print(f'{name}: webp {webp // 1024} KB (ssim {target[0]:.4f}) -> avif q{q} {len(data) // 1024} KB (ssim {s[0]:.4f}, {100 - len(data) * 100 // webp}% menor)')
    else:
        print(f'{name}: avif não ganha do webp com a mesma fidelidade; fica só o webp')


def treat(im, width, radius, percent):  # mesmo tratamento de tools/exportar-imagens-tour.py
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=radius, percent=percent, threshold=2))


src = sys.argv[1] if len(sys.argv) > 1 else None
if src:
    for n in HD:
        p = os.path.join(src, f'gen-{n}.png')
        if not os.path.exists(p):
            continue
        base = ImageOps.autocontrast(Image.open(p).convert('RGB'), cutoff=(0.15, 0.1), preserve_tone=True)
        for suffix, width, r, pc in (('', 2560, 0.8, 40), ('-800', 800, 0.6, 50)):
            ref = treat(base, width, r, pc)
            wp = f'assets/{n}{suffix}.webp'
            target = ssim(ref, Image.open(wp).convert('RGB').resize(ref.size, Image.LANCZOS))
            write(n + suffix, ref, wp, target, '4:2:0', 50)
for n in PLANS:
    for suffix in ('', '-800'):
        wp = f'assets/{n}{suffix}.webp'
        if os.path.exists(wp):
            ref = Image.open(wp).convert('RGB')
            write(n + suffix, ref, wp, (0.999, 0.97), '4:4:4', 66)
