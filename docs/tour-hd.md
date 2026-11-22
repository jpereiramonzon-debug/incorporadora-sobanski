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
