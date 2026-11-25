"""Gera js/plan3d-data.js a partir de medidas tiradas das plantas oficiais (assets/planta-tipo*.webp).

Cada planta é descrita em pixels do desenho oficial (linhas de centro das paredes, vãos de porta e
contorno de cada móvel), com a escala do desenho em metros por pixel. Assim o 3D reproduz a planta
oficial: mesma posição, tamanho e orientação de cada cômodo, porta e móvel.
Uso: python3 tools/plantas-3d.py
"""
import json

def conv(p):
    s, ox, oy = p['s'], p['o'][0], p['o'][1]
    X = lambda v: round((v - ox) * s, 3)
    Z = lambda v: round((v - oy) * s, 3)
    rooms = [{'n': r[0], 'x': X(r[1]), 'z': Z(r[2]), 'w': round((r[3] - r[1]) * s, 3), 'd': round((r[4] - r[2]) * s, 3), 'f': r[5], **({'open': True} if len(r) > 6 and r[6] else {})} for r in p['rooms']]
    # vão de porta: [eixo, posição da parede, início, fim]  ('x' = parede vertical em x; 'y' = horizontal em y)
    ops = []
    for a, at, b0, b1 in p['doors']:
        ops.append([X(at), Z(b0), X(at), Z(b1)] if a == 'x' else [X(b0), Z(at), X(b1), Z(at)])
    rails = [[X(a), Z(b), X(c), Z(d)] for a, b, c, d in p.get('rails', [])]
    items = []
    for it in p['items']:
        t = it[0]
        if t == 'table':
            items.append([t, X(it[1]), Z(it[2]), it[3]])
        elif t in ('wc', 'chair'):
            items.append([t, X(it[1]), Z(it[2]), *it[3:]])
        else:  # retângulo x0,y0,x1,y1 (+ orientação)
            items.append([t, X(it[1]), Z(it[2]), round((it[3] - it[1]) * s, 3), round((it[4] - it[2]) * s, 3), *it[5:]])
    return {'rooms': rooms, 'openings': ops, 'rails': rails, 'items': items}

S1 = 0.0085   # escala das plantas avulsas (Tipo 01, 02 e 04): ~0,0085 m por pixel do desenho em 2828 px
S3 = 0.0088   # folha conjunta do Tipo 03/05

PLANS = {
  # Tipo 04: quarto em cima, nicho com escrivaninha, cozinha linear na parede leste, jantar, estar e banheiro embaixo
  't04': {'s': S1, 'o': (663, 26), 'rooms': [
      ['Quarto', 663, 26, 1110, 290, 'wood'],
      ['', 843, 290, 1110, 441, 'wood'],
      ['Cozinha · estar', 843, 441, 1110, 1362, 'tile'],
      ['Banheiro', 800, 1362, 1110, 1545, 'tile']],
    'doors': [['y', 290, 843, 1110], ['y', 441, 865, 960], ['x', 843, 750, 840], ['y', 1362, 880, 975]],
    'items': [
      ['wardrobe', 680, 35, 752, 280], ['bed', 845, 43, 1088, 200, 'e'], ['nightstand', 1032, 212, 1080, 262],
      ['desk', 1052, 290, 1100, 432], ['chair', 1028, 360],
      ['counter', 1020, 458, 1100, 915], ['fridge', 1016, 595, 1100, 690],
      ['table', 1045, 1015, 0.42],
      ['rug', 855, 1092, 1092, 1352], ['sofa', 988, 1105, 1095, 1345, 'e'], ['tv', 855, 1160, 872, 1300],
      ['sink', 810, 1478, 882, 1535], ['wc', 947, 1490, 's'], ['shower', 980, 1372, 1100, 1535]]},

  # Tipo 01: quarto com sacada à esquerda, banheiro, estar com sofá voltado para a TV (oeste), jantar e cozinha a leste
  't01': {'s': S1, 'o': (83, 25), 'rooms': [
      ['Entrada', 712, 25, 850, 662, 'tile'],
      ['Quarto 2', 850, 205, 1150, 662, 'wood'],
      ['Área de serviço', 1150, 380, 1340, 662, 'stone'],
      ['Quarto', 83, 662, 528, 995, 'wood'],
      ['Sacada', 83, 995, 528, 1075, 'stone', True],
      ['', 528, 662, 720, 788, 'tile'],
      ['Banheiro', 528, 788, 720, 1075, 'tile'],
      ['Estar · jantar · cozinha', 720, 662, 1340, 1075, 'tile']],
    'doors': [['y', 25, 725, 835], ['x', 528, 680, 775], ['y', 788, 545, 650], ['x', 720, 662, 788], ['y', 662, 712, 850],
              ['x', 850, 450, 555], ['y', 662, 1160, 1265], ['y', 995, 320, 515], ['y', 662, 528, 720]],
    'rails': [[83, 1075, 528, 1075]],
    'items': [
      ['wardrobe', 97, 675, 168, 985], ['bed', 210, 675, 418, 935, 'n'], ['nightstand', 182, 690, 222, 740],
      ['sink', 655, 800, 700, 870], ['wc', 650, 920, 'e'], ['shower', 545, 950, 712, 1060],
      ['tv', 722, 775, 752, 1058], ['rug', 752, 775, 960, 1058], ['sofa', 860, 778, 958, 1055, 'e'], ['panel', 960, 775, 985, 1058],
      ['table', 1078, 890, 0.55],
      ['counter', 1247, 675, 1330, 960], ['fridge', 1247, 960, 1330, 1058],
      ['desk', 862, 215, 908, 405], ['chair', 930, 300], ['bed', 1005, 215, 1138, 488, 'n'], ['wardrobe', 865, 575, 1138, 652],
      ['grill', 1270, 382, 1345, 455], ['counter', 1272, 455, 1330, 655]]},

  # Tipo 02: sacada com churrasqueira, estar (sofá de costas para o jantar, voltado para a TV), banheiro, 2 quartos e sacada
  't02': {'s': S1, 'o': (815, 28), 'rooms': [
      ['Sacada · churrasqueira', 815, 28, 1005, 302, 'stone', True],
      ['Estar · jantar · cozinha', 1005, 28, 1450, 650, 'tile'],
      ['Banheiro', 1005, 650, 1320, 810, 'tile'],
      ['', 1320, 650, 1450, 1230, 'wood'],
      ['Quarto', 1005, 810, 1315, 1230, 'wood'],
      ['Quarto com sacada', 1005, 1230, 1450, 1575, 'wood'],
      ['Sacada privativa', 815, 1290, 1005, 1575, 'stone', True]],
    'doors': [['x', 1005, 185, 285], ['x', 1450, 280, 380], ['x', 1320, 665, 745], ['x', 1315, 830, 930], ['y', 650, 1320, 1450],
              ['y', 1230, 1330, 1440], ['x', 1005, 1340, 1470]],
    'rails': [[815, 28, 815, 302], [815, 302, 1005, 302], [815, 1290, 1005, 1290], [815, 1290, 815, 1575]],
    'items': [
      ['counter', 1017, 38, 1340, 120], ['fridge', 1340, 38, 1440, 120],
      ['counter', 826, 38, 898, 222], ['grill', 812, 222, 898, 302],
      ['table', 1200, 305, 0.55],
      ['rug', 1017, 418, 1325, 620], ['sofa', 1030, 420, 1315, 528, 'n'], ['tv', 1100, 618, 1250, 640],
      ['shower', 1017, 662, 1150, 800], ['wc', 1180, 755, 's'], ['sink', 1235, 755, 1305, 800],
      ['bed', 1030, 822, 1195, 1095, 'n'], ['wardrobe', 1017, 1140, 1305, 1215],
      ['bed', 1058, 1288, 1298, 1560, 's'], ['nightstand', 1265, 1465, 1305, 1525], ['wardrobe', 1365, 1345, 1442, 1560],
      ['chair', 905, 1450]]},

  # Tipo 03: quarto 1 e quarto 2 (com sacada) em cima, banheiro, estar com cozinha linear na parede leste
  't03': {'s': S3, 'o': (147, 278), 'rooms': [
      ['Quarto 1', 147, 278, 480, 715, 'wood'],
      ['Sacada privativa', 480, 278, 775, 355, 'stone', True],
      ['Quarto 2', 480, 355, 775, 855, 'wood'],
      ['Banheiro', 147, 715, 345, 1030, 'tile'],
      ['', 345, 715, 480, 855, 'wood'],
      ['Estar · jantar · cozinha', 345, 855, 835, 1465, 'tile']],
    'doors': [['y', 715, 360, 465], ['x', 480, 730, 835], ['x', 345, 890, 1000], ['y', 355, 490, 680], ['y', 855, 345, 480], ['y', 1465, 650, 760]],
    'rails': [[480, 278, 775, 278], [775, 278, 775, 355]],
    'items': [
      ['bed', 232, 292, 405, 558, 'n'], ['wardrobe', 160, 625, 352, 702],
      ['wardrobe', 683, 368, 765, 572], ['bed', 590, 580, 765, 845, 's'],
      ['shower', 158, 725, 335, 860], ['wc', 200, 892, 'w'], ['sink', 162, 942, 212, 1015],
      ['counter', 765, 865, 825, 1460], ['table', 513, 1020, 0.55],
      ['sofa', 365, 1212, 617, 1320, 'n'], ['rug', 365, 1318, 617, 1440], ['tv', 365, 1440, 617, 1455]]},

  # Tipo 05: quarto 2 (solteiro, com escrivaninha) e quarto 1 em cima, banheiro, estar com sofá na parede leste e cozinha em L
  't05': {'s': S3, 'o': (18, 15), 'rooms': [
      ['Sacada privativa', 18, 15, 312, 103, 'stone', True],
      ['Quarto 2', 18, 103, 312, 603, 'wood'],
      ['Quarto 1', 312, 25, 650, 465, 'wood'],
      ['', 312, 465, 460, 603, 'tile'],
      ['Banheiro', 460, 470, 650, 775, 'tile'],
      ['Estar · jantar · cozinha', 75, 603, 460, 1365, 'tile']],
    'doors': [['y', 103, 110, 300], ['x', 312, 480, 585], ['y', 465, 330, 440], ['x', 460, 640, 760], ['y', 603, 312, 460], ['x', 75, 1240, 1345]],
    'rails': [[18, 15, 312, 15]],
    'items': [
      ['wardrobe', 30, 115, 110, 322], ['desk', 248, 115, 305, 295], ['chair', 218, 205], ['bed', 25, 325, 155, 590, 's'],
      ['bed', 325, 110, 595, 282, 'w'], ['wardrobe', 445, 372, 638, 450],
      ['shower', 470, 480, 640, 605], ['wc', 590, 640, 'e'], ['sink', 585, 688, 635, 760],
      ['tv', 97, 615, 117, 862], ['rug', 117, 612, 330, 862], ['sofa', 225, 612, 330, 862, 'e'],
      ['table', 190, 1088, 0.55],
      ['fridge', 372, 955, 447, 1033], ['counter', 372, 1035, 447, 1365], ['counter', 190, 1295, 372, 1365]]},
}

out = {k: conv(v) for k, v in PLANS.items()}
js = '// Gerado por tools/plantas-3d.py a partir das plantas oficiais (não editar à mão).\nexport const PLANS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
open('js/plan3d-data.js', 'w').write(js)
for k, v in out.items():
    mx = max(r['x'] + r['w'] for r in v['rooms']); mz = max(r['z'] + r['d'] for r in v['rooms'])
    print(k, f'{mx:.2f} x {mz:.2f} m', len(v['items']), 'móveis')
