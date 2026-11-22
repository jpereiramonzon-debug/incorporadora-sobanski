# Vista por unidade: do prédio à planta 3D isolada

## 1. Mapeamento do vídeo de referência

O vídeo tem 10,35 s, 30 fps e 720×1280 px, e foi analisado quadro a quadro.

| Tempo | O que acontece | Valor usado no site |
|---|---|---|
| 0,0–4,4 s | Hover: cartão branco "Apartment 4B" ligado à unidade por uma linha fina | Cartão ancorado na unidade, com linha de 44 px e ponto na fachada; fade de 0,2 s |
| 4,4–4,9 s | Clique: textos da hero somem | Fade de 0,45 s em título, botões de andar, CTA e menu |
| 5,1 s | Surge "Back to the building" no canto superior esquerdo | "Voltar ao prédio" com fade e deslize de 0,45 s |
| 5,1–7,2 s | A câmera orbita devagar e mergulha na unidade no fim | Voo de 2,3 s em power3.inOut; o zoom começa a 22% do tempo (orbita primeiro, aproxima depois) |
| 7,1–7,7 s | Dissolve do prédio para o estúdio creme; a planta aparece no lugar da unidade | Dissolve de 0,75 s iniciado a 80% do voo; a planta surge antes do fundo (máscara por alfa) |
| 7,7–8,1 s | A câmera assenta na vista isométrica | Assentamento de 1,1 s até ~52° de inclinação |
| 8,2 s | O cartão lateral entra pela direita | Deslize de 48 px com fade (0,5–0,65 s) a 35% do assentamento |
| depois | A planta gira devagar | 0,05 rad/s quando parado; arrastar gira |

## 2. Arquitetura

- **Unidades na fachada** (`js/building.js`, `SLOTS`): são 15 volumes clicáveis (3 andares × finais 01, 02, 03, 05 e 04) mais o térreo. Cada slot define a caixa da unidade, o ponto da fachada que a câmera mira, o lado de chegada e a planta revelada. O id da unidade é andar + final (ex.: 201).
- **Dados exibidos** (`js/main.js`, `UNIT_SLOTS`): tipo, posição e metragens vêm de `MODELS`.
- **Uma cena WebGL só.** O estúdio é uma segunda cena desenhada pelo mesmo renderer e pela mesma câmera. O dissolve é um shader de composição: mistura o prédio (composer A) com o estúdio (composer B, fundo transparente) sobre o creme. Não há troca de canvas nem novo contexto, então não há tela preta.
- **Várias unidades no mesmo andar:** dá para orbitar e clicar direto na unidade, ou escolher pelos botões de andar. Na vista isolada, as pílulas trocam entre as 5 unidades do andar e as setas trocam de andar. A nova planta surge no mesmo lugar, em cross-fade de 0,6 s, e o cartão troca o conteúdo com fade.
- **Voltar ao prédio:** é a animação inversa. A câmera volta à fachada, a planta some antes do fundo (para não flutuar diante do prédio) e o voo retorna ao enquadramento original.
- **Luz do estúdio:**
  - luz principal de ~5200 K vinda de cima e da esquerda, com sombra suave (PCF, raio 5);
  - contraluz frio;
  - reflexos de softbox (RoomEnvironment em PMREM);
  - chão que só recebe sombra, mais sombra de contato difusa sob a maquete;
  - pisos com textura em escala real (madeira, porcelanato, pedra) e rugosidade por acabamento.

## 3. Desempenho

- As 5 plantas são montadas em momentos ociosos do navegador depois da abertura, e os shaders do estúdio são compilados em paralelo. Um **aquecimento fora da tela** desenha uma vez tudo o que a transição usa.
- **Medido** (Chromium com GPU emulada) em entrada, troca de unidade e volta:
  - **0 shaders compilados** e **0 tarefas longas**;
  - CPU por quadro com p95 de 2,8 ms e máximo de 7,5 ms no desktop; p95 de 1,7 ms e máximo de 8,4 ms no celular. O limite de 60 fps é 16,7 ms.
- Com o estúdio pleno, o prédio deixa de ser desenhado. Durante o dissolve, as duas cenas são desenhadas por ~0,75 s.
- Se o clique vier antes do pré-carregamento terminar, a preparação roda no clique, antes do voo, e nunca no meio do dissolve.

## 4. Pendências com a incorporadora

- A numeração (finais 01–05) e a posição de cada tipo na fachada são ilustrativas. Basta confirmar e ajustar `SLOTS` (posição) e `UNIT_SLOTS` (dados).
- O status de venda e o preço de cada unidade não estão no material de divulgação. Quando houver, entram no cartão como no vídeo de referência.
