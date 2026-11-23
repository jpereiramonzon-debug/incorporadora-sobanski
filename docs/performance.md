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
