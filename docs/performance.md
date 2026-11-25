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

## 7. Reengenharia de carregamento e renderização (25/11)

Condições de medição: celular (Pixel 7) com rede 4G lenta (1,6 Mbps, 150 ms) e CPU 4× mais lenta, no site publicado, antes e depois. Roteiro: `node tests/audit-load.js`. A GPU é emulada, então os tempos de 3D e as tarefas longas ficam inflados nas duas medições; os tempos de rede e da abertura são comparáveis.

### Diagnóstico

| Onde | Arquivo / recurso | Custo medido | Causa raiz |
|---|---|---|---|
| Entrada | `main.js` (abertura) | Letras só aos **3,8 s** | Script de módulo executa em ordem com GSAP, ScrollTrigger e Lenis (`defer`), que só chegavam aos 3,5 s |
| Entrada | `mallet-aerea.webp` + `vista-fundos-1600.webp` | **493 KB** baixando desde 0,6 s | Fotos de seções de baixo pedidas no início, disputando a banda com fontes e 3D |
| Entrada | 27 arquivos JS | 319 KB transferidos (1,07 MB descompactados) | Módulos soltos sem build, Three.js inteiro (675 KB brutos) |
| Tour | `RectAreaLightTexturesLib.js` | 109 KB pedidos **em cascata** (3 viagens de rede) | Import dentro de import, fora da lista de pré-carregamento |
| Tour | Troca de ambiente | Compilação de shader síncrona | Pré-compilação na variante "tela" e desenho na variante "textura" |
| 3D | Buffers de pós-processamento | 80 bytes por pixel (celular em 2×: ~121 MB só no prédio) | O 2º buffer era clonado com MSAA 4×, sem precisar, porque só recebe passes de tela cheia |
| 3D | Cena do prédio | 55 chamadas de desenho, 23 mil triângulos, 27 texturas (~33 MB) | Saudável: geometria procedural já unida por material |
| Cache | JS e CSS | Revalidados a cada visita | Sem nomes com hash, não dava para usar cache imutável |

### Stack adotada
- **esbuild** (build em ~0,2 s):
  - empacota, minifica e faz tree-shaking;
  - faz code splitting em entrada, maquete 3D, camada cinematográfica e Tour 3D;
  - o Three.js fica num pedaço compartilhado: ao ir do site para o tour, ele vem do cache;
  - nomes com hash de conteúdo e cache imutável de 1 ano.
- **three@0.170.0, gsap@3.12.5 e lenis@1.1.13 do npm**: as mesmas versões de antes, agora com tree-shaking. O Three.js caiu de 136 para 112 KB comprimidos.
- **Caminho crítico em 3 ondas:**
  1. HTML, CSS, as 2 fontes da abertura e a entrada (9 KB);
  2. a maquete 3D, com todos os pedaços em paralelo, quando as fontes chegam;
  3. GSAP/Lenis e as fotos de baixo, depois que o 3D chegou.
- **AVIF com controle de fidelidade** (`tools/avif.py`): a qualidade sobe até o SSIM igualar ou superar o do WebP atual.
  - Fotos HD do tour, a partir dos originais sem compressão: 30–51% menores e mais fiéis ao original.
  - Plantas: SSIM 0,999, 13–44% menores.
  - As outras fotos ficaram em WebP: sem o original, recomprimir só ganharia peso perdendo detalhe.
  - A detecção de suporte é feita uma vez; navegador sem AVIF recebe o WebP de sempre.
- **GPU:**
  - MSAA só no buffer da cena (prédio, estúdio e tour): **−40% de memória nos buffers** (celular em 2×: de 121 para 72 MB no prédio e de 72 para 48 MB no estúdio) e uma resolução de MSAA a menos por quadro;
  - o tour ganhou o passe único de cor + grão;
  - os shaders do tour passaram a ser compilados na variante certa;
  - as texturas do prédio são enviadas à GPU atrás da abertura;
  - a medição da GPU usa cerca de sincronização (fence), sem bloquear a página.

### O que não foi adotado, e por quê
| Sugestão | Decisão |
|---|---|
| Draco / Meshopt | Não há malhas para comprimir. O prédio, as plantas e os ambientes do tour são gerados por código (21 KB comprimidos). Exportar para GLB criaria centenas de KB a mais para baixar. |
| KTX2 / Basis | As 27 texturas são procedurais (geradas em ~80 ms com a CPU 4× mais lenta, atrás da abertura) e ocupam ~33 MB. O transcodificador Basis custaria ~200 KB + WASM na entrada. O vilão de memória eram os buffers, que caíram 40%. |
| React Three Fiber / drei | O site não é React. As técnicas equivalentes já estão aplicadas em Three.js puro: desenho sob demanda, pausa fora da tela, DPR controlado com monitor de desempenho (resolução dinâmica calibrada), `dispose` ao trocar de cena. |
| Framer Motion | O GSAP já anima só `transform`, `opacity` e `clip-path`. |
| Web Workers | Não há decodificação nem parsing pesado na hora crítica: o navegador decodifica imagens fora da thread principal e o trabalho 3D de CPU roda atrás da abertura ou com a câmera parada. |
| InstancedMesh | Depois da união por material, são 55 chamadas por quadro; a repetição restante (árvores) é pequena. |

### Antes vs. depois (site publicado, celular, 4G lenta, CPU 4×)

| Métrica | Antes | Depois |
|---|---|---|
| Primeira pintura (FCP) | 1232 ms | **904 ms** |
| Letras da abertura começam | 3810 ms | **998 ms** (−74%) |
| `DOMContentLoaded` | 3790 ms | **912 ms** |
| Evento `load` | 11954 ms | **1106 ms** |
| Prédio revelado (fim da abertura) | 13818 ms | **6496 ms** (−53%; agora é o tempo da própria coreografia) |
| JS até o prédio aparecer | 27 arquivos, 319 KB | **8 arquivos, 243 KB** (só 13 KB antes das letras) |
| Fotos disputando a abertura | 493 KB desde 0,6 s | **0** (pedidas aos 3,3 s, depois do 3D) |
| Tarefas longas até o prédio (GPU emulada) | 9,6 s | **2,6 s** |
| Tour: primeiro ambiente pronto | 7423 ms | **4965 ms** (−33%) |
| Tour: JS | 22 arquivos, 363 KB | **5 arquivos, 289 KB** |
| Tour: primeira foto HD | 194 KB (WebP) | **133 KB (AVIF, mais fiel ao original)** |
| Memória de GPU dos buffers (celular, 2×) | 121 MB (prédio) + 72 MB (estúdio) | **72 + 48 MB** |
| Visita seguinte | 27+ revalidações de JS/CSS | **0** (cache imutável) |
| Erros e avisos no console | 1 aviso | **0** |

**Qualidade visual:**
- O prédio no build novo, comparado com o site publicado na mesma resolução, ficou visualmente idêntico, com o mesmo antisserrilhado no zoom de 4×. Restam diferenças de 1 pixel em 0,6% da imagem, só em bordas, com diferença média de brilho zero.
- As fotos AVIF foram conferidas em 100% de zoom contra o original.

### Como rodar
- `npm ci` e depois `npm run build` geram `dist/`. O Vercel faz isso sozinho em cada push (`vercel.json`).
- `npm run dev` serve `dist/` em http://localhost:8080 e recompila ao salvar.
- `python3 tools/avif.py PASTA_DOS_ORIGINAIS` gera novos AVIF, só quando ganham sem perder fidelidade.
- Testes:
  - `node tests/qa-site.js [d|m]`: roteiro de 19 etapas;
  - `node tests/audit-load.js [URL]`: auditoria de carregamento.
