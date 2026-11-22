# Revisão técnica e visual: Edifício Santa Ana

**Evidência:** gravação de tela de um celular Android (480×1070, 43,6 s, taxa de quadros variável), analisada quadro a quadro com `ffmpeg` (luminância média por quadro, intervalos entre quadros e grade de quadros ampliados) e cruzada com o código.

**Skills usadas:** `video-editor-pro` (decupagem do vídeo), `img2-harness` (pipeline 3D do tour), `photorealistic-render-director` (luz e materiais) e `performance-engineer` (gargalos).

## 1. Diagnóstico técnico (vídeo + código)

As linhas citadas como "antes" são da versão anterior; o "depois" aponta para o código atual.

| # | Vídeo | Sintoma | Arquivo / ponto do código | Causa raiz | Correção aplicada |
|---|---|---|---|---|---|
| 1 | 00:06,4–00:06,8 | Tela escura ao sair da abertura, depois o prédio "salta" para a tela | `js/main.js` `revealBuilding()`; `js/building.js` `intro()` | A câmera só ia para a posição de partida no instante da revelação. Os primeiros quadros (com compilação de shaders) eram feitos com a abertura já sumindo. | `viewer.prime()` (`js/building.js:639`) posiciona a câmera e desenha o primeiro quadro **por trás** da tela preta. A revelação espera `viewer.whenReady` (`js/main.js:294-295`). |
| 2 | 00:06,8–00:07,4 | "SANTA ANA" borrado e se expandindo, ilegível enquanto "EDIFÍCIO" já está nítido | `styles.css` `@keyframes titleIn` (antes: `filter:blur(8px)` + `letter-spacing:.35em`) | Animar `letter-spacing` refaz o layout do texto a cada quadro, e o `blur` rasteriza o texto borrado. No celular isso gerou o glifo "fantasma". | A animação usa só `opacity` e `transform` (compositor da GPU), sem layout nem blur (`styles.css:323`). As fontes Cinzel e Jost são carregadas antes do início (`js/main.js:240`). |
| 3 | 00:08,8–00:10,4 | Dois títulos ao mesmo tempo: o "SANTA ANA" da abertura e o "Edifício Santa Ana" do topo se sobrepõem, com um "EDIFÍCIO" fantasma | `styles.css` (antes: atrasos fixos de 3,7 s e 4,0 s) vs. `js/main.js` (título da abertura de 0,3 s a 4,2 s) | Dois relógios independentes: o título do topo entrava antes do da abertura terminar de sair. | O título do topo só entra quando o da abertura saiu de cena (`titleIn()`, `js/main.js:275`; `styles.css:318-320`). Teste: opacidade do título da abertura = **0** no instante em que o do topo entra. |
| 4 | 00:00,0–00:00,2 | Letras do SOBANSKI começam a entrar antes da fonte final | `index.html` (Google Fonts `display=swap`) | A troca de fonte no meio da animação dava um salto nas letras. | `.intro:not(.go)` pausa as animações até as fontes chegarem, com limite de 1,2 s (`styles.css:304`, `js/main.js:236-242`). |
| 5 | 00:20,9–00:22,5 | Tela preta ao trocar do site para o tour | `tour.html`; `js/tour/player.js` (carregamento síncrono) | Navegação sem transição, mais a montagem do primeiro ambiente travando a thread principal. | `@view-transition{navigation:auto}` (`styles.css:509`), import map e modulepreload no `<head>` do tour, carregamento assíncrono. |
| 6 | 00:27,2–00:29,5 | Tela preta "Carregando ambiente" por 2,3 s após escolher o Tipo 02 | `js/lookdev.js` (antes: `normalCanvasFrom`, filtro Sobel em JS); `js/tour/player.js` `loadEnv` | Gerar normal maps na CPU custava **3,5 s** por ambiente (CPU 4× mais lenta). A compilação síncrona de shaders custava 1,6 s, e o overlay opaco escondia tudo. | Relevo por `bumpMap` na GPU (`js/lookdev.js:42`), custo zero de CPU. `loadEnv` assíncrono com `compileAsync` (`js/tour/player.js:141-142`). Véu translúcido sobre o último quadro em vez de tela preta (`tour.css:64-66`). |
| 7 | **00:31,39–00:31,44, 00:32,79–00:32,82 e 00:34,26–00:34,29** | **Canvas preto por 2 a 3 quadros (~50 ms), com a interface intacta, a cada ~1,45 s ao andar** | `js/tour/player.js` (antes: `composer.render(); adaptResolution(now);` + `renderer.setPixelRatio()` a cada 1.500 ms) | A resolução dinâmica mudava o tamanho do canvas **depois** de desenhar o quadro. Mudar o tamanho apaga o canvas, e o navegador exibia o canvas vazio. O intervalo de 1,45 s no vídeo bate com o `lastChange < 1500` do código. | O canvas fica fixo na resolução nativa (`js/tour/player.js:28`). Só a resolução interna do compositor se adapta (`setQuality`, `:72`), sem apagar a tela. `resize()` redesenha no mesmo quadro (`:103`). O mesmo foi corrigido na maquete (`js/building.js:537`). |
| 8 | 00:35–00:43 | Ao andar, a câmera passa rente ao sofá e cola na parede da TV. O joystick fica pressionado e a imagem não muda (sem quadros novos em 37,07 s, 38,59 s e 41,76 s). | `js/tour/player.js` `moveTo` (antes: regra `was \|\| !inside`) | 1) O ponto da foto nasce dentro da margem do sofá. A regra "se já está dentro, pode tudo" deixava atravessar móveis até a parede. 2) No celular em pé a visão horizontal era de ~34°: a meio metro da parede, ela toma a tela inteira. 3) Cada móvel que entrava na tela pela primeira vez compilava shader na hora (engasgo). 4) O passo era limitado a 0,05 s, o que dá câmera lenta em aparelhos a 15–20 fps. | Colisão por profundidade com deslizamento (`depth`/`moveTo`, `:349-354`): dá para sair de um móvel e nunca entrar nele, e encostar desliza. Visão horizontal mínima de 46° no celular em pé (`updateFov`, `:89`). Todos os materiais são compilados antes de mostrar o ambiente (`:141`). Passo de até 0,1 s. |
| 9 | 00:23–00:43 | Ícone do WhatsApp sobre o tour | `tour.html` (`<script src="js/chat.js">`) | O chat era carregado também no tour. | O script foi removido **só** do `tour.html`. Teste: 0 elementos `.wa` no tour e 1 no site. |
| 10 | Tour inteiro | Imagem mole no celular | `js/tour/player.js` (antes: `PR_MAX = modest ? 1.25 : 1.75`) | No celular a resolução ficava limitada a 1,25× (baixava até 0,85×). | Canvas a até 2× em todos os aparelhos, escala interna adaptativa enquanto anda e **quadro refinado na resolução máxima ao parar** (`:463`). Anisotropia no máximo da GPU e sombra 2048 em todos os aparelhos. |
| 11 | Maquete | Prédio montado durante a abertura, segurando a tela preta | `js/main.js` (import do `building.js` no início) | A montagem da cena bloqueava a thread principal antes das letras começarem (abertura presa por ~3,7 s na emulação). | A montagem começa logo depois das letras (`introStarted`, `js/main.js:282`). As letras animam no compositor e seguem fluidas. A compilação usa `compileAsync` quando existe. |

## 2. Desempenho medido

Ambiente de medição: Chromium com Pixel 7 emulado, CPU 4× mais lenta e GPU em software (swiftshader). Os tempos absolutos são piores que num celular real; a comparação entre antes e depois é o que vale.

| Métrica | Antes | Depois |
|---|---|---|
| Tour: maior bloqueio da thread principal ao abrir um ambiente | 5,2 s | ~2,0 s nas medições intermediárias, com a GPU em software. A última medição também tinha um bloqueio de 4,5 s, que o perfil atribuiu sobretudo a código nativo e chamadas WebGL. |
| Tour: CPU para gerar o relevo dos materiais | 3,5 s | 0 s (feito na GPU) |
| Tour: textura de variação de rugosidade | 0,57 s | 0,2 s |
| Tour: troca de ambiente (até o véu sair) | 7,2 s | 3,3 s |
| Abertura: início das letras | 4,4 s (presas pela montagem do prédio) | 0,7 s |
| Flashes pretos no tour (vídeo de 26 s com troca de ambiente, caminhada e troca de foto) | 3 em 3 s no vídeo do cliente | 0 quadros escuros |

Também foi adicionado o `vercel.json`, com cache imutável de 1 ano para `vendor/` (Three.js, GSAP, Lenis) e cache com revalidação para `assets/` e `js/`.

## 3. Devolutiva técnica: 4K no Tour 3D

**O que o código já entrega**
- Canvas na resolução nativa do aparelho até 2×: num monitor 4K com escala de 200%, a imagem tem 3.840 px de largura.
- Quadro parado refeito na resolução máxima; em telas 1× é renderizado a 1,5× (supersampling).
- Antisserrilhado MSAA 4× (2× no celular) e anisotropia no máximo da GPU (normalmente 16×).
- Sombras de 2.048 px, tone mapping ACES Filmic, reflexos capturados do próprio cômodo (PMREM) e oclusão de ambiente (GTAO).
- Relevo e variação de rugosidade em todos os materiais.

**O que impede um 4K real só com código**
1. **Geometria:** os ambientes são reconstruções procedurais (caixas e cilindros a partir das fotos). Em 4K, a falta de chanfros, costuras e detalhes fica mais evidente, não menos.
2. **Texturas:** são geradas em canvas a 512 px (10 delas), 1.024 px (2) ou menos. Em 4K um piso de 512 px fica visivelmente esticado.
3. **Vista das janelas:** é uma pintura desfocada procedural. Nenhuma resolução corrige isso.
4. **Fotos de referência:** vão de 1.400 px até ~310 px (Tipo 03 e áreas sociais, capturas do Instagram).
5. **GPU do cliente:** GTAO + MSAA a 3.840 px roda em 60 fps só em placa de vídeo dedicada. No celular o certo é ~2× com refinamento ao parar, que é o que foi implementado.

**O que precisa ser produzido ou fornecido para um 4K fluido**

| Item | Especificação mínima | Formato de entrega web |
|---|---|---|
| Modelos 3D dos apartamentos e áreas sociais | Arquivos originais do projeto (SketchUp, Revit, 3ds Max ou Blender). Até ~300 mil triângulos por ambiente, com chanfros reais. | GLB com compressão **Draco** ou **meshopt** e LOD (2 níveis) |
| Materiais PBR | Base color, normal, roughness e AO. **2.048²** nas superfícies comuns e **4.096²** em piso, painéis de madeira e bancadas. | **KTX2/Basis**: UASTC para normal e roughness, ETC1S para cor. Ocupa de 4 a 8× menos memória de GPU que WebP/PNG. |
| Iluminação | Lightmaps pré-calculados (Cycles, V-Ray ou Corona) de **2.048–4.096 px** por ambiente | KTX2 ou RGBM em WebP |
| Vista real das janelas | Foto ou HDRI do entorno real, a partir do prédio em Mallet. Equiretangular de **8.192×4.096** (.exr/.hdr). | Servida a 4.096 px em KTX2 ou RGBM |
| Alternativa mais fiel e mais leve | Panoramas 360° renderizados no mesmo motor dos renders oficiais, **8K–12K equiretangular** por ponto de vista | Cubemap em tiles multirresolução (6 faces de 2.048–4.096 px, carregamento progressivo) |
| Entrega | CDN com Brotli, cache imutável com nome versionado e carregamento progressivo (baixa resolução primeiro) | Vercel já serve com Brotli; o `vercel.json` cuida do cache |

## 4. Checklist de validação

| Requisito | Situação | Como foi verificado |
|---|---|---|
| 1. Intro: "SOBANSKI" em destaque e "INCORPORADORA ─── APRESENTA" abaixo, responsiva e sem flicker | ✅ | Capturas no celular (412 px) e no desktop (1.280 px). Animações pausadas até a fonte chegar; letras começam em 0,7 s. |
| 2. "Santa Ana" estável desde o primeiro quadro | ✅ | Animação só por transform/opacity. Título da abertura com opacidade 0 quando o do topo entra (sem sobreposição). Capturas do título fixado no celular e no desktop. |
| 3. Flashes de tela preta | ✅ | Canvas não muda de tamanho para ajustar desempenho; `resize` redesenha no mesmo quadro; véu sobre o último quadro; transição entre páginas. Vídeo de teste de 26 s: **0 quadros escuros**. |
| 4. WhatsApp removido só do Tour 3D | ✅ | `.wa` no tour = 0; no site = 1, e o botão abre o chat. "Tenho interesse" no tour abre o chat no site. |
| 5. Caminhada e alta definição no tour | ✅ (4K real depende dos itens da seção 3) | Teste de colisão (sai de móveis, não entra, desliza em paredes). Caminhada por joystick e teclado sem erros. Resolução até 2×, quadro refinado ao parar, anisotropia máxima, sombra 2.048. |
| 6. Performance geral | ✅ | Relevo na GPU (−3,5 s), textura de rugosidade mais leve (−0,37 s), compilação sem bloqueio, montagem do prédio adiada para depois do início da abertura, cache HTTP. Console sem erros em todas as páginas testadas. |
