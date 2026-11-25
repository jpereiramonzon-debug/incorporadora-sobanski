# Tour 3D em HD fotorrealista: status, pipeline e próximos passos

## 1. Padrão visual extraído da imagem de referência

Análise com a skill `photorealistic-render-director`. A imagem enviada (cozinha do Tipo 01, 1086×1448) é o padrão obrigatório para todas as imagens do tour.

| Aspecto | Medida na referência | Como entra nos prompts |
|---|---|---|
| Luz principal | Luz do dia difusa pela janela (~6500 K) no lado esquerdo, com queda suave | "6500K daylight diffused through the sheers, 3:1 falloff" |
| Luzes práticas | Globos do lustre a ~2700 K e fita de LED sob o armário a ~3000 K banhando o backsplash | "chandelier globes glowing 2700K, 3000K under-cabinet LED" |
| Balanço de branco | ~4300 K: brancos neutros, madeira quente, sem dominante | "warm natural color" |
| Contraste | Médio (~3:1), pretos abertos e brancos sem estourar | "gentle 3:1 contrast" |
| Nitidez | De borda a borda (f/8), verticais paralelas | "TS-E 24mm tilt-shift at f/8, verticals perfectly parallel" |
| Reflexos | Mármore e quartzo polidos com reflexo nítido das luminárias; porcelanato com reflexo difuso; inox escovado acetinado | "soft diffuse reflections", "satin brushed steel" |
| Microtexturas | Veio contínuo do carvalho, trama do tecido das cadeiras, veios do mármore | "continuous oak grain", "visible boucle loops / weave" |
| Contato | Sombra de contato sob os pés da mesa e das cadeiras | "tight contact shadows under every chair foot" |

Em cada geração, a **Imagem 1** é a foto original do ambiente (layout travado) e a **Imagem 2** é a referência, usada só como padrão de luz e acabamento.

## 2. Status de cada imagem do Tour 3D

Antes/depois de cada imagem atualizada em `docs/tour-hd/`.

| Ponto do tour | Arquivo | Antes | Depois | Como foi feito |
|---|---|---|---|---|
| Tipo 01 · Cozinha e sala | `tipo01-sala-cozinha` | 1400×987, com texto "APARTAMENTO TIPO 01" | **2528×1696**, sem texto | Higgsfield · Nano Banana 2.1 · 2K |
| Tipo 01 · Cozinha | `tipo01-cozinha` | 1400×990 | **1086×1448** (a sua imagem de referência) | Imagem enviada por você, mesmo ambiente |
| Tipo 02 · Cozinha e sala | `tipo02-cozinha-sala` | 1400×979, com textos sobrepostos | **2528×1696**, sem textos | Higgsfield · Nano Banana 2.1 · 2K |
| Tipo 03/05 · Estar e cozinha | `tipo03-sala-cozinha` | **614×544** (captura do Instagram) | **2304×1856** | Higgsfield · Nano Banana 2.1 · 2K |
| Áreas sociais · Salão | `social-salao-a` | **632×460** (captura), com legenda | **2400×1792**, sem legenda | Higgsfield · Nano Banana 2.1 · 2K |

**Pendentes por falta de créditos (20 arquivos):**
- Tipo 01: `tipo01-varanda`, `tipo01-quarto-1`, `tipo01-quarto-2`
- Tipo 02: `tipo02-cozinha-v2`, `tipo02-sacadas` (usado em 2 pontos), `tipo02-quarto-01`
- Tipo 03/05: `tipo03-cozinha`, `tipo03-sala-tv`, `tipo03-quarto1-a`, `tipo03-quarto1-b`, `tipo03-quarto2-a`, `tipo03-quarto2-b`, `tipo03-infantil`
- Áreas sociais: `social-salao-b`, `social-hall-a`, `social-hall-b`, `social-pet`, `social-pet-banho`, `social-kids-a`, `social-kids-b`

Esses pontos já usam o modo foto com a imagem oficial atual e passam a mostrar a versão HD assim que o arquivo for trocado.

## 3. Onde travou

| Etapa | O que aconteceu | O que destrava |
|---|---|---|
| Higgsfield: créditos | A conta tinha **8,2 créditos** (plano gratuito). O Nano Banana 2.1 custa **2 créditos por imagem em 2K** e **3 em 4K**; o upscale para 4K custa **2**. Foram gastos 8 (4 imagens). | **40 créditos** para as 20 restantes em 2K, ou **60** em 4K nativo |
| Higgsfield: fila | O plano gratuito roda **1 geração por vez** | Plano pago, ou rodar em sequência (como foi feito) |
| Canva: design e exportação | As imagens foram importadas na sua biblioteca do Canva ("Santa Ana Tour – Tipo 01/02 Cozinha e Sala (HD)"). A criação de design foi recusada com **"Your team admin has disabled this tool"**, e sem design não há exportação pelo conector. | O administrador da equipe Canva libera o recurso de criar designs para apps conectados. Enquanto isso, o acabamento é feito por `tools/exportar-imagens-tour.py`. |
| Rede do ambiente | `upload.higgsfield.ai` e os CDNs `d2ol7oe51mr4n9.cloudfront.net` e `d8j0ntlcm91z4.cloudfront.net` estavam bloqueados | Liberados com a sua aprovação durante a sessão |

## 4. Como gerar as imagens restantes (pronto para executar)

1. **Higgsfield**, modelo `nano_banana_2_1` com `resolution: "2k"` (ou `"4k"`). Proporção `3:2` para as imagens horizontais; nas capturas do Tipo 03 e das áreas sociais, a mais próxima do original (`4:3` ou `5:4`).
   - **Imagem 1:** a imagem atual de `assets/NOME.webp`, convertida para JPG.
   - **Imagem 2:** `docs/tour-hd/referencia.jpg`.
2. **Prompt:** use o prompt "Gemini 3 Pro Image (edição com referência)" da imagem em `docs/prompts-fotorrealistas.md` (Nano Banana é o mesmo dialeto) e acrescente no início:
   > `Match the photographic finish of Image 2: crisp edge-to-edge detail, warm natural color, gentle 3:1 contrast and real material microtexture. Image 2 is only a quality and lighting benchmark; keep everything of Image 1 exactly as it is.`
3. **Acabamento e exportação:** salve os resultados numa pasta com o nome do asset (ex.: `tipo01-quarto-1.png`) e rode:
   ```bash
   python3 tools/exportar-imagens-tour.py PASTA
   ```
   O script gera a versão HD, a de 800 px e a miniatura. O tour e o site passam a usá-las sem mudança no código.

## 5. Integração no Tour 3D

- **Modo foto:** ao chegar em cada ponto de foto, a imagem HD aparece por cima do 3D com fade de 0,7 s. Ela só entra depois de baixada **e** decodificada (`img.decode()`), então nunca aparece pela metade nem sobre tela preta.
- **Volta ao 3D:** ao andar, girar ou trocar de ponto, o 3D volta em 0,3 s. O botão "Ver foto realista" / "Explorar em 3D" alterna entre os dois.
- **Carregamento progressivo:** o `srcset` faz o celular baixar 800 px e a tela grande baixar a HD. As imagens só são pedidas no ponto em que aparecem, sem pré-carregar o tour inteiro.
- **Desempenho:** a imagem fica numa camada de compositor por cima do canvas, sem custo de GPU no 3D. Enquanto a foto aparece, o 3D não redesenha (a câmera está parada), então andar não perde quadros.
- **Correção encontrada no caminho:** o ambiente do Tipo 03 aparecia todo preto com pontos brancos. A causa era um NaN no relevo (bump) que contaminava o mapa de reflexos do cômodo. Foi corrigido em `js/lookdev.js`; os 17 ambientes foram verificados com 0 pixels inválidos.

## 6. Nitidez em movimento e superfícies sobrepostas (25/11)

### Bug 1: imagem borrada ao andar/girar, nítida só parada
**Causa raiz** (`js/tour/player.js`): a resolução interna dependia do movimento.
- Andando, a cena era desenhada em `qMove`, de 0,75 a 1×. A função `adaptResolution()` ainda podia baixar para `Q_MIN`, entre 0,5 e 0,6×.
- 260 ms depois de parar, um quadro "refinado" era refeito em `Q_IDLE`, até 1,5×.

Não havia TAA nem efeito acumulativo: a diferença era só a resolução.

**Correção:**
- Uma única resolução interna (`E`), igual andando, girando e parado. O laço não tem mais refino ao parar.
- `E` é escolhida uma vez por aparelho, medindo a GPU com cerca de sincronização atrás do véu do primeiro ambiente, e fica guardada em `localStorage.sbTourQ`:
  - celular: entre 1,25× e 1,75×;
  - computador: 1,5× (supersample) em tela comum, 2× em Retina, 1× de piso.
- Se o aparelho não sustenta 60 qps, a oclusão de ambiente (GTAO) perde amostras, sempre na resolução cheia; a nitidez nunca é reduzida. A meia resolução foi descartada porque deixava degraus nas bordas.
- `sharpen()` aplica anisotropia (até 16×) e mipmaps trilineares a **todas** as texturas de cada ambiente. Antes, peças transparentes e "lisas" ficavam de fora.

**Medido:** nitidez da imagem em movimento em relação à imagem parada (variância do Laplaciano):
- antes: **0,45**;
- depois: **1,0** (1,09 na medição, diferença que vem do conteúdo da vista).

A resolução interna foi lida durante 1,2 s andando: ficou constante.

### Bug 2: cuba da pia cortada na diagonal e sumindo sob o tampo
**Causa raiz** (`js/tour/kit.js`, `kitchenRun`): a "cuba" era uma chapa de 5 mm (`box(... 0.905 ...)`) cuja face de cima ficava **exatamente no plano** da face de cima do tampo (0,91 m). Duas faces coplanares, viradas para o mesmo lado, disputam a profundidade. O vencedor muda de pixel para pixel conforme a câmera se mexe, e isso dá o corte diagonal serrilhado e o sumiço.

**Correção (geometria real, sem `polygonOffset`):**
- O tampo virou uma placa única com **recorte** arredondado para a cuba.
- A cuba é **rebaixada 19 cm**, aberta em cima e vista por dentro, com os cantos arredondados iguais aos do recorte.
- A borda de inox tem 1,5 mm e fica **acima** do tampo, cobrindo a junta. O ralo fica 1 mm acima do fundo.
- O gabinete perdeu a face de cima, que apareceria dentro da pia.

**Auditoria do apartamento inteiro.** Duas ferramentas, uma geométrica e uma por renderização (a verdade de campo):
- **Geométrica** (`tests/zfight.html` + `tests/zfight-audit.js`): faces coplanares de objetos diferentes.
- **Por renderização** (`tests/zfight-render.html` + `tests/zfight-render.js`): cada ambiente é desenhado de todos os pontos de foto e de uma grade de posições onde a pessoa anda (8 direções × 2 inclinações). Cada objeto ganha uma cor única e a cena é desenhada na ordem normal e na inversa. Pixel que troca de dono é z-fighting.

O que foi corrigido:
- **Pias das 4 cozinhas:** tampo com recorte e cuba rebaixada.
- **Caixilhos das janelas e portas-janela:** antes as peças se sobrepunham nos cantos com a frente no mesmo plano; agora montantes inteiros e travessas encaixadas.
- **Rodapés:** os cantos tinham o topo sobreposto.
- **Sofás:** encosto e braços tinham faces externas coincidentes com a base.
- **Cama:** a peça do pé tinha a frente no plano do lençol.
- **Guarda-roupa aberto:** fundo, prateleiras e gaveteiro atravessavam as laterais.
- **Armário da geladeira:** atravessava o painel de madeira.
- **Nichos, molduras e boiseries:** nicho de nogueira, nicho da lavadora, molduras dos aéreos da varanda, moldura de granito da churrasqueira e boiserie do quarto.
- **Vasos:** a terra ficava no mesmo plano da boca do vaso.
- **Áreas sociais:** arremates dos painéis do quarto infantil, friso dos degraus, moldura do elevador e montantes da fachada do hall.
- **Lambri e vista das janelas:** subdivididos. Triângulos de 3,6 m cortados pelo plano da câmera perdiam precisão de profundidade.
- **Câmera:** near 0,05 m e far 100 m (antes 200 m). Profundidade de 24 bits.
- **Sem problema, conferidos:** cooktop, forno, tapetes, espelhos, quadros e portas já tinham separação física. As faces que se tocam estão viradas para lados opostos e não disputam.

**Resultado:** pixels de z-fighting em área, somados nos 17 ambientes:

| Antes | Depois |
|---|---|
| 109.901 | 0 |

Restam só linhas de 1 pixel onde duas peças se encostam. Não piscam, e o MSAA as suaviza.

Antes/depois da pia: `docs/tour-hd/pia-antes-depois.png`.

Como rodar: `python3 -m http.server 8123 &` e depois `node tests/zfight-render.js`.
