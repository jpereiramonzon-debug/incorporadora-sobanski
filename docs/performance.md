# Auditoria de performance: Edifício Santa Ana

Medido com Chromium + Playwright em dois cenários:
- **Desktop:** 1366×800.
- **Celular:** Pixel 7 com a CPU emulada 4× mais lenta.

A GPU é emulada em software (swiftshader). Por isso os tempos absolutos de renderização são muito maiores que num aparelho real. O que vale é a comparação entre antes e depois e a contagem de trabalho: quadros desenhados, chamadas de desenho, compilações, recálculos e bytes.

## 1. Diagnóstico

| Onde | Vilão | Custo medido | Causa raiz |
|---|---|---|---|
| Entrada | CSS do Google Fonts | FCP de 840 ms; `load` em 1306 ms (desktop) | CSS externo bloqueia a primeira pintura e exige 2 conexões novas (googleapis + gstatic) antes de baixar as fontes |
| Entrada | Imagens abaixo da dobra | ~250–330 KB baixados nos primeiros 640 ms | `loading="lazy"` perto da dobra ainda baixa cedo e disputa banda com o 3D |
| Entrada | `three.module.min.js` | 676 KB sem compressão (~150–170 KB com Brotli no Vercel) | Biblioteca inteira, sem tree-shaking (o site não tem etapa de build). A montagem do prédio já começa só depois que as letras da abertura animam. |
| 3D | Oclusão de ambiente (GTAO) em resolução cheia | Redesenha a cena inteira de novo (passe de normais) + AO + denoise a cada quadro | Calculada em 100% da resolução, embora seja um efeito suave |
| 3D | Giro automático contínuo | Cada quadro com pós-processamento completo, a 30 qps, enquanto o topo estiver na tela | GPU ocupada também enquanto a página rola, o que trava a rolagem |
| 3D | Rabo de quadros ao pausar o giro | A câmera "assentava" a 60 qps por 1–2 s | Suavização exponencial sem corte |
| 3D | Resolução no desktop | Até 1,75× (num monitor Retina, 3360×1890 com GTAO + bloom + MSAA) | Limite alto demais para GPUs integradas |
| 3D | Mapa de sombra 4096² | 64 MB de memória de GPU | Maior que o necessário (a sombra é calculada uma única vez) |
| 3D | Aquecimento do estúdio | Desenhava prédio + estúdio fora da tela | Podia coincidir com a rolagem |
| Navegação | Handler de rolagem | Layout forçado várias vezes por quadro; atributos e classes regravados a cada quadro | Leitura e escrita intercaladas no mesmo laço; escritas sem checar mudança |

## 2. Plano aplicado (impacto vs. esforço)

1. **Fontes no próprio site** (alto impacto, baixo esforço): 6 arquivos woff2 latin/latin-ext (124 KB), `@font-face` dentro do `styles.css` e preload das duas fontes da abertura. Sai o CSS externo e as conexões extras.
2. **Maquete congela ao rolar** (alto, baixo): nenhuma chamada WebGL enquanto a página rola, nem com o topo menos da metade visível, nem com a aba oculta. O giro automático roda a 25 qps só com o topo à vista e a página parada.
3. **GTAO em meia resolução** (alto, baixo): o passe de normais e o AO custam ~1/4; a mistura continua em resolução cheia. Visualmente equivalente (comparação lado a lado).
4. **Resolução 1,5× no desktop** (médio, baixo): ~27–44% menos pixels por quadro em telas Retina, com MSAA 4×. O celular continua em 2× (sem GTAO e sem bloom).
5. **Sombra 3072²** (memória): −28 MB de GPU.
6. **Rolagem sem layout thrashing** (médio, baixo): leituras primeiro, escritas depois, só quando algo muda; etapas longe da tela são ignoradas.
7. **Pré-carregamento por intenção e em momento calmo** (médio, baixo):
   - os módulos do Tour 3D começam a baixar quando o mouse passa, o foco chega ou o dedo toca num link do tour;
   - as plantas do estúdio são montadas em ocioso;
   - o aquecimento fora da tela espera a página parar.
8. **Imagens fora da dobra com `fetchpriority="low"`** (baixo, baixo): o crítico baixa primeiro.
9. **Cache:** fontes com cache imutável de 1 ano (`vercel.json`).

Já existiam de rodadas anteriores:
- laço pausado com o canvas fora da tela;
- WebP com `srcset` e `loading="lazy"`;
- compilação de shaders antecipada;
- montagem da maquete depois do início da abertura;
- relevo das texturas na GPU.

## 3. Antes vs. depois (medido)

| Métrica | Antes | Depois |
|---|---|---|
| FCP desktop | 840 ms | **144 ms** |
| Evento `load` desktop | 1306 ms | **143 ms** |
| FCP celular (CPU 4×) | — | 252 ms |
| CLS | 0,006 | **0** |
| Chamadas WebGL durante ~6 s de rolagem | 1920 | **256** (2 quadros, antes do 1º evento de rolagem) |
| Quadros > 50 ms na rolagem (GPU emulada) | 24 | **17** |
| Recálculos de layout na rolagem | 54 | 44–71 (ruído do teste) |
| Compilações de shader / tarefas longas no voo até a unidade | 0 / 0 | **0 / 0** (máx. 13 ms de CPU por quadro) |
| Memória de GPU do mapa de sombra | 64 MB | **36 MB** |
| Erros no console | 0 | 0 |

**LCP:** o maior elemento da página é o título "SANTA ANA" da abertura cinematográfica, que entra de propósito por volta de 8–10 s. Por isso o LCP reflete a duração escolhida da abertura, não lentidão. O conteúdo aparece em ~0,15–0,25 s (FCP).

## 4. Como verificar no aparelho real
- **Chrome DevTools > Performance**, gravando 10 s com o topo parado e depois rolando a página: com a página rolando, a faixa da GPU deve ficar praticamente vazia.
- **Lighthouse (mobile):** FCP, TBT e CLS. O LCP depende da abertura, como explicado acima.
- **Memória:** `chrome://gpu` e o gerenciador de tarefas do Chrome (memória de GPU da aba) antes e depois de abrir uma unidade.

## 5. Próximo passo (exige etapa de build)

Empacotar com esbuild ou Vite, com tree-shaking do Three.js, reduziria o JS 3D em ~40%. Isso muda a forma de publicar o site (gera uma pasta `dist/`), por isso não foi feito sem combinar antes.

## 6. Rodada 3: análise do vídeo gravado no celular (25/11)

### O que o vídeo mostrou
O gravador de tela do Android só registra um quadro novo quando a tela muda, então o intervalo entre quadros do vídeo é o ritmo real da tela.

| Trecho do vídeo | Quadros por segundo | Leitura |
|---|---|---|
| Abertura SOBANSKI / APRESENTA | 60 | Animação no compositor, fluida |
| Descida da câmera até o prédio + título SANTA ANA (7–12 s) | **7–12** (um quadro a cada 80–140 ms, cadência constante) | GPU do aparelho no limite: cada quadro do prédio custava ~80 ms em 2× de densidade |
| Rolagem de todas as seções (14–29 s) | 60 (2 engasgos isolados de ~100 ms) | Rolagem saudável; o 3D já congelava ao rolar |

Havia três causas somadas:
1. **Resolução fixa em 2× no celular.** O governador antigo só agia durante o giro automático, 5 s depois da abertura e um degrau a cada 2,5 s. A descida inteira rodava na resolução máxima.
2. **Trabalho de fundo em cima da descida.** Montar as plantas, gerar os reflexos do estúdio e compilar shaders começava 4,5 s depois do primeiro quadro, exatamente durante a descida e o título. O perfil de CPU mostrou que quase todo esse tempo é compilação de shader síncrona (`getProgramInfoLog`): a pré-compilação era feita na variante errada (desenho direto na tela) e o aquecimento não esperava a compilação paralela terminar.
3. **Giro a 25 qps** em tela de 60 Hz: os quadros alternavam 2 e 3 atualizações de tela, o que dá uma cadência irregular.

### O que foi feito
- **Resolução dinâmica.**
  - O canvas fica fixo na densidade da tela, e só a resolução interna muda. Trocar o tamanho do canvas apaga a imagem; trocar a resolução interna não.
  - Níveis no celular: 2 → 1,75 → 1,5 → 1,3 → 1,15 → 1 → 0,85 → 0,75. No desktop: 1,5 → 1,3 → 1,15 → 1 → 0,85 → 0,75.
  - O último passe amplia a imagem, e o grão de filme continua na resolução da tela.
- **Medição da GPU durante a pausa da abertura.**
  - Com a tela preta por cima, o prédio é desenhado em duas resoluções e o tempo de GPU é lido de forma síncrona (leitura de 1 pixel), num máximo de 0,9 s.
  - Disso sai o custo por pixel e o custo fixo, e então a maior resolução que cabe em:
    - 12 ms por quadro no movimento rápido (60 qps);
    - 22 ms por quadro no giro (30 qps).
  - Uma GPU fraca demais para 60 qps em 1× faz a descida a 30 qps regulares, na resolução maior.
  - A medida fica guardada no aparelho para a próxima visita.
- **Conferência contínua.**
  - Se 4 de 8 quadros seguidos atrasam, a resolução desce um degrau na hora. No desktop, bloom e GTAO saem antes.
  - Depois de ~3 s de folga, tenta subir um degrau, uma vez só.
- **Cadência uniforme.**
  - Giro e rotação do estúdio a 30 qps exatos, sempre a cada 2 atualizações de tela (a cada 4 em telas de 120 Hz).
  - Movimento rápido até 60 qps.
  - Estúdio parado não redesenha (antes redesenhava 60 vezes por segundo a mesma imagem), e a rotação automática do estúdio para depois de 30 s sem interação.
- **Trabalho de fundo só quando não aparece.**
  - Roda atrás da abertura, depois da medição, ou com a câmera já pousada. Nunca durante a descida nem com uma unidade aberta.
  - O giro automático espera esse trabalho terminar.
  - A pré-compilação agora usa a variante certa ("desenho em textura") e o aquecimento espera a compilação paralela.
- **Um passe de tela cheia a menos.** A conversão de cor (OutputPass) e a vinheta e o grão de filme viraram um único passe. Comparação com o site publicado: diferença média de 1,9/255 por canal, que é só o grão aleatório.
- **Galeria no celular.** Foi criada a versão de 1400 px da primeira foto: o celular baixava e decodificava a de 2528 px (4,3 MP).

### Para conferir no aparelho
- Abra o site e veja a descida da câmera depois do APRESENTA: ela deve ser contínua, sem saltos.
- A medida da GPU fica em `localStorage` → `sb3d`:
  - `k`: ms por quadro com 1 pixel interno por pixel CSS;
  - `c`: ms fixos por quadro.
- Para comparar o visual numa resolução fixa, use `?q3d=2` (ou `1.5`, `1`…) na URL.
