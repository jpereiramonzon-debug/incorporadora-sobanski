# Edifício Santa Ana: prompts fotorrealistas para substituir as imagens do site

Documento gerado com a skill `photorealistic-render-director`. Cada imagem tem dois prompts:

- **Gemini 3 Pro Image (Nano Banana Pro), edição com referência:** o recomendado. Você envia a imagem atual do site como *Image 1* e o prompt mantém o projeto real (layout, móveis, materiais, cores) e troca só o aspecto de render por fotografia. É o único caminho que preserva a fidelidade ao empreendimento.
- **FLUX.2 / FLUX 3, prosa natural:** para gerar do zero quando não houver imagem de referência, ou para variações. Ele inventa detalhes, então serve só para material de apoio e nunca como "foto oficial" de uma unidade.

> As plantas (`tipo01-planta`, `tipo02-planta-oficial`, `tipo03-05-planta`, `tipo04-planta`) **não** devem ser geradas por IA: modelos de imagem não respeitam cotas e paredes. O caminho certo é pedir à construtora os PDFs vetoriais ou redesenhar em vetor.

---

## 1. Blueprint de física e direção de arte

| Item | Exteriores (fachada, lateral, fundos) | Interiores (apartamentos e áreas sociais) |
|---|---|---|
| Gênero e uso | Fotografia de arquitetura para hero de site imobiliário, em tela cheia | Fotografia de interiores editorial (estilo revista de arquitetura) para galeria em tela cheia e painéis |
| Câmera e ótica | Médio formato Hasselblad X2D II 100C + lente basculante (TS) 32 mm equivalente, f/9–f/11, ISO 100, tripé, **verticais paralelas**, altura de 1,6 m | Full-frame Canon EOS R5 + Canon TS-E 24 mm f/3.5L II deslocada para cima, f/8, ISO 200–400, tripé na altura de 1,25–1,4 m, verticais corrigidas |
| Luz motivada | Céu do crepúsculo (blue hour, cerca de 9.000 K) como luz principal difusa, com o brilho residual do pôr do sol no horizonte a oeste; LEDs lineares de 2.700 K nas lajes, balizadores de piso 2.700 K, janelas internas em tungstênio de 3.000 K. Balanço de branco em 4.300 K, para o céu ficar azul e as luzes âmbar | Janela lateral de luz do dia difusa (6.500 K, através de cortina de voile) como principal, razão de 3:1 com a sombra; pendentes e fitas de LED de 2.700–3.000 K como luzes práticas. Balanço de branco em 5.200 K |
| Materiais e imperfeições | Reboco texturizado com leve variação de tom e manchas de umidade sutis na base; vidro com reflexo do céu e da vegetação; ferro com tinta acetinada e mínima oxidação nas soldas; piso intertravado com rejunte irregular; vegetação com folhas de tamanhos e tons variados | Porcelanato com rejunte fino e reflexo difuso (não espelhado); madeira com veio contínuo e variação de tom entre lâminas; tecidos com trama visível (bouclé, linho, malha); poeira e marcas sutis em superfícies horizontais; **sombras de contato** sob pés de móveis |
| Pessoas | Nenhuma (imagens de produto do imóvel) | Nenhuma |
| Padrões assumidos | Proporção 5:4 (hero) ou 3:2 (galeria); horário de blue hour, porque os renders oficiais da Sobanski são todos ao entardecer | Proporção 3:2 (galeria horizontal) ou 4:5 (cartões verticais); luz de fim de tarde, coerente com a fachada |

---

## 2. Prompts compilados

### Exteriores

#### `vista-lateral` (quina dianteira, coluna de tijolo de vidro): hero da seção "O empreendimento"

**Gemini 3 Pro Image (edição com referência)**
```text
Edit Image 1 into an authentic architectural photograph for a luxury residential website hero. Keep the building's exact massing, the warm-grey textured plaster facade, the illuminated glass-block column, the three stacked loggias with black wrought-iron scroll railings, the linear warm LED strips at each slab, the classical stepped cornice, the "Sobanski" lettering on the stair tower and the arched carport below exactly as they are. Re-photograph it as if shot on a Hasselblad X2D II medium format with a 32mm tilt-shift lens at f/10 from 1.6 m on a tripod, verticals perfectly parallel, during blue hour: diffused 9000K sky as the main light, a faint amber afterglow low on the western horizon, 2700K LED strips grazing the plaster and revealing its fine trowel texture, warm 3000K tungsten glowing through sheer curtains in the loggia windows. Give the plaster subtle tonal variation and faint moisture staining near the base, the glass blocks soft internal refraction, the railings satin black paint with tiny weld irregularities, and the foreground birch and shrubs individually defined leaves catching uplight. Honest color, gentle highlight roll-off on the LEDs, fine natural sensor grain in the sky.
```

**FLUX.2 / FLUX 3 (prosa)**
```text
Architectural photograph of a four-storey classical-modern residential building at blue hour, seen from the front-left corner, warm-grey textured plaster facade with a full-height illuminated glass-block column, three stacked recessed loggias with black wrought-iron scroll railings and sheer-curtained French doors, linear 2700K LED strips under each slab grazing the plaster, stepped cornice in darker plaster, arched carport at street level, birch trees and low clipped shrubs lit by warm ground uplights. Diffused 9000K twilight sky as key light with faint amber afterglow on the western horizon, warm tungsten windows. Shot on Hasselblad X2D II with a 32mm tilt-shift lens at f/10, ISO 100, tripod at 1.6 m, perfectly parallel verticals, building occupying the right two thirds with sky negative space upper left, plaster with subtle tonal variation and fine trowel texture, glass with soft sky reflections, crisp detail across the frame, natural fine grain.
```

#### `vista-frente` (fachada frontal com letreiro e palmeira)

**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic frontal architectural photograph of the residential entrance at blue hour. Keep the exact symmetry and layout: the stacked loggias on the left with wrought-iron railings and potted plants, the light plaster bay with six black-framed windows on the right, the dark stepped cornice, the young palm tree in front of the loggias, the illuminated stone sign reading "Edifício Santa Ana" with the small "Witamy" and "Laskavo prosymo" lines and their flags, the two black garage doors on the left and the ornamental black iron gate with scrollwork on the right. Re-photograph it with a 32mm tilt-shift lens at f/11 from the sidewalk at 1.6 m, verticals parallel, frame centered on the sign with the building filling 70% of the height. Light it with a 9000K twilight sky, 2700K concealed LEDs washing the sign from below, wall-washer uplights tracing soft scallops on the dark side walls, and warm 3000K interiors behind sheer curtains. Add believable detail: fine sandstone grain on the sign, palm fronds with dry brown tips, a few fallen leaves on the pavers, slight wet sheen on the sidewalk reflecting the lights.
```

**FLUX.2 / FLUX 3 (prosa)**
```text
Frontal architectural photograph of a four-storey residential building entrance at blue hour, left side with three stacked loggias and black wrought-iron railings with potted plants, right side a light plaster bay with six black-framed windows glowing warm behind sheer curtains, dark stepped cornice on top, a young palm tree rising in front of the loggias, a low illuminated sandstone sign reading "Edifício Santa Ana" in elegant serif italic centered above a planter of clipped shrubs, two black garage doors on the left and an ornamental black iron gate with scrollwork on the right, concrete paver sidewalk with a faint wet sheen. 9000K twilight sky as key light, 2700K LED uplights washing the sign and walls in soft scallops. Shot on Hasselblad X2D II, 32mm tilt-shift at f/11, ISO 100, tripod at 1.6 m, strictly parallel verticals, symmetrical formal composition with the sign on the central axis, sandstone grain and palm fronds with dry tips in crisp detail.
```

#### `vista-fundos` (fundos com arcadas e garagem)

**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic architectural photograph of the rear and side of the building at sunset. Keep the exact building: grey plaster blocks with lighter infill panels, the stacked loggias with black scroll railings on the right corner, the arched ground-floor carport with parked cars and bicycles, the number "125" on the boundary wall, the long grey perimeter wall with a bed of low shrubs and ground uplights along the sidewalk. Re-photograph it with a 35mm tilt-shift lens at f/9 from the street corner at 1.6 m, verticals parallel. Light it with a low 3200K sun setting behind the trees on the right, rim-lighting the cornice and leaves, a 7000K open sky filling the shadow side at about 4:1, and warm 2700K uplights starting to glow on the wall. Add honest material detail: subtle dirt streaks under the window sills, slightly uneven paint on the perimeter wall, real paint and glass reflections on the parked cars, damp patches on the sidewalk.
```

**FLUX.2 / FLUX 3 (prosa)**
```text
Architectural photograph of the rear corner of a four-storey residential building at sunset, grey plaster volumes with lighter infill panels and black-framed windows, stacked corner loggias with black wrought-iron railings, an arched open carport at ground level with two parked sedans and bicycles, the number "125" in metal numerals on the boundary wall, a long grey perimeter wall above a bed of low shrubs with small warm uplights along a concrete sidewalk. Low 3200K sun setting behind trees on the right rim-lighting the cornice and foliage, 7000K open sky filling the shadow side at 4:1. Shot on Canon EOS R5 with TS-E 35mm at f/9, ISO 100, tripod at 1.6 m, parallel verticals, building on the left two thirds with sunset sky and trees on the right third, subtle dirt streaks under sills and slightly uneven wall paint.
```

### Apartamento Tipo 01

#### `tipo01-sala-cozinha`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic interior photograph for a residential sales gallery, and remove the "APARTAMENTO TIPO 01" graphic overlay so the corner shows the white ceiling and wall. Keep the exact layout and every object: the linear kitchen on the left with oak upper cabinets, grey lower cabinets, pale marble worktop and black built-in oven, the stainless fridge in an oak tower, the round white table on a conical oak base with four terracotta bouclé chairs on brass legs, the brass branch chandelier with clear glass globes, the two tall black-framed windows with floor-to-ceiling sheer linen curtains, the white sofa with black metal console, the oak TV wall and the split air conditioner. Re-photograph it with a 24mm tilt-shift lens at f/8 from 1.3 m, verticals parallel. Light it with late-afternoon 6500K daylight diffused through the sheers from the far wall, a 3:1 falloff toward the kitchen, and the chandelier bulbs at 2700K. Give the porcelain floor soft diffuse reflections of the windows, the bouclé visible loops, the oak continuous grain with slight board-to-board tone shifts, and tight contact shadows under chair feet and the table base.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Interior photograph of a compact integrated kitchen and living room in a new apartment, linear kitchen on the left with oak upper cabinets, grey slab lower cabinets, pale grey marble worktop, black built-in oven and stainless fridge in an oak tower, a round white table on a conical oak pedestal with four terracotta bouclé chairs on slim brass legs under a brass branch chandelier with clear glass globes, two tall black aluminium windows behind floor-to-ceiling sheer linen curtains, a white linen sofa with a slim black metal console, oak-panelled TV wall with a wall-mounted split air conditioner. Late-afternoon 6500K daylight diffused through the sheers, 3:1 falloff into the kitchen, 2700K glow from the chandelier. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.3 m, parallel verticals, table placed on the lower-left third, light porcelain floor with soft window reflections, visible bouclé loops, tight contact shadows under furniture.
```

#### `tipo01-cozinha`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic frontal kitchen photograph. Keep the exact elevation: oak flat-panel upper cabinets, an open oak niche with a white microwave, a cookbook and utensils, a grey stone-look backsplash slab, a stainless sink and gooseneck tap, a black induction hob and built-in oven, sage-grey lower cabinets, the stainless fridge in an oak tower, the round white table with terracotta chairs and the brass glass-globe chandelier in the foreground, the black door frame on the left and the sheer curtain on the right. Re-photograph it one-point frontal with a 24mm tilt-shift lens at f/8 from 1.35 m, verticals and horizontals perfectly level. Use soft 6500K window light from the right through the sheer, a warm 3000K under-cabinet LED wash on the backsplash, and 2700K chandelier bulbs. Add realistic detail: stone backsplash with natural veining and a matte sheen, faint fingerprints on the fridge door, a bowl of tomatoes with natural color variation, soft shadow of the chandelier arms on the ceiling.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
One-point frontal interior photograph of a compact apartment kitchen, oak flat-panel upper cabinets with an open oak niche holding a white microwave and a cookbook, grey stone-look backsplash slab with natural veining, stainless sink with gooseneck tap, black induction hob and built-in oven, sage-grey slab lower cabinets, stainless fridge in a full-height oak tower, a round white table with terracotta bouclé chairs in the foreground under a brass branch chandelier with clear globes, black door frame on the left, sheer curtain on the right. Soft 6500K window light from the right, warm 3000K under-cabinet LED on the backsplash, 2700K chandelier bulbs. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.35 m, perfectly level verticals and horizontals, table on the lower third, faint fingerprints on the fridge, matte stone sheen.
```

#### `tipo01-varanda` (díptico: área de serviço e churrasqueira)
**Gemini 3 Pro Image**
```text
Edit Image 1, a two-panel diptych, into two authentic photographs of the service balcony, keeping the white gap between the panels and removing the "VARANDA E ÁREA DE SERVIÇO" caption. Keep everything as designed: sage-grey shaker upper and lower cabinets with round knobs, a stainless front-load washing machine, a pale quartz worktop with a stainless sink and tap, a light grey shelf with a wicker basket and potted herbs, large-format light porcelain wall tiles, the barbecue framed in black speckled granite with chrome grill bars, and the black wrought-iron scroll railing opening onto a green field. Re-photograph each panel with a 24mm tilt-shift lens at f/8, verticals parallel. Light it with low 3500K late sun from the open side casting the railing's scroll shadow across the barbecue wall, and 7000K skylight filling the cabinets at 3:1. Add real wear: faint water spots on the steel sink, soot traces inside the barbecue, a little dust on top of the washer.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Two-panel diptych of an apartment service balcony with barbecue, left panel showing sage-grey shaker cabinets with round knobs, a stainless front-load washing machine under a pale quartz worktop with a small stainless sink, a light grey shelf with a wicker basket and potted herbs, large light porcelain wall tiles, and a barbecue framed in black speckled granite with chrome grill bars beside a black wrought-iron scroll railing; right panel showing the same balcony from the side looking out over a green field through the railing. Low 3500K late sun from the open side casting the railing's scroll shadow across the barbecue wall, 7000K skylight fill at 3:1. Canon EOS R5, TS-E 24mm at f/8, ISO 200, parallel verticals, faint water spots on the sink, soot inside the barbecue.
```

#### `tipo01-quarto-1`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic bedroom photograph and remove the "QUARTO 01" caption. Keep the exact design: white handleless ceiling-height cabinets, the walnut niche wrapping the bed with a long walnut shelf of books, a black "VOGUE" book, a ceramic vase and bowl, the black articulated swing-arm wall lamp, the floating walnut nightstand with a small vase, the grey upholstered bed with layered grey bedding, the floor-to-ceiling walnut slat panel and the white door on the right, light oak laminate floor. Re-photograph it frontal with a 24mm tilt-shift lens at f/8 from 1.3 m. Light it with soft 6500K window light from behind the camera on the left, a slanted sunlight patch across the duvet, and the wall lamp glowing 2700K. Add detail: walnut with continuous grain and satin sheen, slats with tiny tone differences, natural creases and slight pilling on the knit throw, a fine dust line on the shelf.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Frontal interior photograph of a compact bedroom, white handleless ceiling-height wardrobe cabinets above a walnut niche that frames the bed, a long walnut shelf with stacked art books, a black book, a ceramic vase and bowl, a black articulated swing-arm wall lamp, a floating walnut nightstand with a bud vase, a grey upholstered bed with layered grey linen bedding and a charcoal knit throw, a floor-to-ceiling walnut slat panel beside a white door, light oak laminate floor. Soft 6500K window light from the left behind the camera, a slanted sun patch across the duvet, 2700K wall lamp glow. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.3 m, symmetrical frontal framing with the bed on the lower half, satin walnut grain, natural linen creases.
```

#### `tipo01-quarto-2`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic bedroom photograph, crop away the bottom timeline bar and remove the "QUARTO 02" caption. Keep the exact room: taupe walls with white boiserie moulding frames, walnut wainscot behind the bed, the blush upholstered tufted headboard, white bedding with a grey throw, the round grey nightstand, the two brass ring pendants with opal globes, the black aluminium window, the large abstract canvas with teal, navy, lilac and peach shapes and a gold line, the bronze mirrored sliding wardrobe and the striped grey carpet. Re-photograph it from the side with a 24mm tilt-shift lens at f/8 from 1.25 m. Light it with 6500K daylight from the window at 3:1, a soft reflection of the canvas in the bronze mirror, and the opal globes glowing 2700K. Add detail: a fine weave in the carpet, a visible canvas texture, natural wrinkles in the duvet.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Side-view interior photograph of a calm bedroom, taupe walls with white boiserie moulding frames, walnut wainscot behind a blush upholstered tufted headboard, white cotton bedding with a grey throw, a round grey nightstand with a small crystal vase, two brass ring pendants with opal glass globes hanging beside the bed, a black aluminium window looking onto open fields, a large abstract canvas with teal, navy, lilac and peach organic shapes and a fine gold line, a bronze mirrored sliding wardrobe on the right, striped grey wall-to-wall carpet. 6500K daylight from the window at 3:1, 2700K globe glow. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.25 m, bed on the lower-left third, visible canvas texture, carpet weave.
```

### Apartamento Tipo 02

#### `tipo02-cozinha-sala`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic interior photograph and remove the "APARTAMENTO TIPO 02" and "COZINHA E SALA" graphics. Keep the exact layout: the oak TV wall with a wooden grid lattice panel and lattice ceiling soffit, the split air conditioner, the floating white rack, the sheer curtains and black window, the glass door to the service balcony, the curved oatmeal bouclé sofa, the fiddle-leaf fig, the round table with a beige top on an oak cone base, the white bouclé chairs on brass frames, the smoky glass globe cluster pendant and the grey kitchen with stainless fridge and stacked ovens on the right. Re-photograph it with a 24mm tilt-shift lens at f/8 from 1.3 m. Light it with 6500K daylight through the sheers casting the lattice's soft grid shadow on the wall, 3:1 falloff toward the kitchen, and the pendant at 2700K. Add detail: fig leaves with uneven sheen, bouclé loops, contact shadows under the sofa legs.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Interior photograph of an integrated living, dining and kitchen space in a new apartment, oak-panelled TV wall with a wooden grid lattice panel continuing into a lattice ceiling soffit, a split air conditioner and floating white rack, a black window with floor-to-ceiling sheer curtains, a glass door to a service balcony, a curved oatmeal bouclé sofa beside a fiddle-leaf fig in a black planter, a round table with a beige top on an oak cone base and white bouclé chairs on brass frames under a smoky glass globe cluster pendant, a grey kitchen with stainless fridge and stacked built-in ovens on the right. 6500K daylight through sheers casting a soft lattice grid shadow, 2700K pendant glow. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.3 m, table on the right third, sofa on the lower-left third.
```

#### `tipo02-cozinha-v2`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic frontal kitchen photograph and crop away the bottom timeline bar. Keep the exact elevation: the warm-lit oak open niche with herb pots and ceramics, the three black-framed reeded glass cabinets backlit with warm LED and holding stacked dishes, the white subway backsplash, the black speckled granite worktop with a stainless sink and tall tap, the grey slab lower cabinets, the stainless fridge, the grey tower with two built-in ovens and drawers, the linear brass pendant with smoky glass globes, the round table with white bouclé chairs, the sheer curtain and glass door on the left and the white door on the right. Re-photograph it one-point frontal with a 24mm tilt-shift lens at f/8 from 1.35 m, perfectly level. Light it with 3000K LED from the cabinets and niche as practical sources, 6500K window light from the left at 3:1, and a slot of linear 4000K ceiling light. Add detail: soft distortion of the dishes behind the reeded glass, granite flecks with a gentle sheen, slightly uneven grout lines.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
One-point frontal photograph of a contemporary apartment kitchen, an open oak niche lit warm with herb pots and ceramic jars, three black-framed reeded glass upper cabinets backlit by 3000K LED showing softly distorted stacked dishes, white subway tile backsplash, black speckled granite worktop with a stainless sink and tall tap, grey slab lower cabinets, a stainless fridge and a grey tower with two built-in ovens, a linear brass pendant with smoky glass globes above a round table with white bouclé chairs, a sheer curtain and glass door on the left, a white door on the right. 6500K window light from the left at 3:1, linear 4000K ceiling slot. Canon EOS R5, TS-E 24mm at f/8, ISO 320, perfectly level verticals, table in the lower center third.
```

#### `tipo02-sacadas` (díptico: sacada do quarto e área de serviço)
**Gemini 3 Pro Image**
```text
Edit Image 1, a two-panel diptych, into two authentic photographs and remove the "SACADA DO QUARTO 01" and "SACADA COM ÁREA DE SERVIÇO" captions. Keep the left panel exactly as designed, with the taupe walls, the column of green glass blocks, the black-framed glass railing, the walnut lounge armchair with beige cushions and the grey porcelain floor, and the right panel with the barbecue in black speckled granite, the black wrought-iron railing, the sage shaker cabinets, the stainless front-load washer, the quartz worktop with sink and the shelf with herbs and a wicker basket. Re-photograph each with a 24mm tilt-shift lens at f/8. Light both with low 3500K late sun streaming in sideways: green caustic light from the glass blocks on the left floor, and the iron scroll shadow on the right barbecue wall, filled by 7000K skylight. Add detail: subtle reflections and a faint dust film on the glass railing, natural cushion creases.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Two-panel diptych of apartment balconies, left panel a private bedroom balcony with taupe walls, a full-height column of green glass blocks, a black-framed glass railing over open fields, a walnut lounge armchair with beige linen cushions on a grey porcelain floor; right panel a service balcony with a barbecue framed in black speckled granite, a black wrought-iron scroll railing, sage-grey shaker cabinets, a stainless front-load washer and a quartz worktop with sink and a shelf of herbs. Low 3500K late sun from the side throwing green caustic light from the glass blocks onto the floor and scroll shadows across the barbecue wall, 7000K skylight fill. Canon EOS R5, TS-E 24mm at f/8, ISO 200, parallel verticals, faint dust film on the glass railing.
```

#### `tipo02-quarto-01`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic bedroom photograph, crop away the bottom timeline bar and remove the "QUARTO 01" caption. Keep the exact room: the upper walnut-veneer wall panel with the split air conditioner, the ivory channel-tufted upholstered wall headboard, grey bedding with blush and geometric cushions and a blush-and-grey knit throw with fringes, the walnut nightstand with a glass bud vase, the brass cylinder pendant, the full-height sheer curtain on the right, the open wardrobe with glass doors, hanging clothes and drawers on the left, the brass wall sconce with opal globes on a wood strip, and the striped grey carpet. Re-photograph it frontal with a 24mm tilt-shift lens at f/8 from 1.3 m. Light it with 6500K daylight diffused through the sheer from the right at 3:1, the sconce glowing 2700K, and a soft highlight on the tufted channels. Add detail: real fabric weave on the throw, slight puckering in the headboard channels, carpet stripes with fibre texture.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Frontal interior photograph of a serene bedroom, upper wall clad in walnut veneer with a split air conditioner, an ivory channel-tufted upholstered wall headboard spanning the width, grey cotton bedding with blush and black-white geometric cushions and a blush and grey knit throw with fringes, a walnut nightstand with a glass bud vase and a brass cylinder pendant, a full-height sheer curtain on the right, an open wardrobe with glass doors, hanging clothes and drawers on the left beside a brass wall sconce with opal globes, striped grey carpet. 6500K daylight diffused through the sheer from the right at 3:1, 2700K sconce glow. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.3 m, bed centered on the lower half, natural fabric creases, visible weave.
```

### Apartamento Tipo 03 e 05

> As imagens deste tipo no site vieram de capturas do Instagram (cerca de 310 px). Para a edição com referência, use os arquivos originais da construtora se possível; se não houver, use a versão do site, sabendo que pequenos detalhes podem ser reinterpretados.

#### `tipo03-sala-cozinha`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic, high-resolution interior photograph, rebuilding the fine detail lost to low resolution while keeping the layout exact: the floor-to-ceiling oak slatted partition between the kitchen and the living room, the oak breakfast bar with a light stone top and oak bar stools, the kitchen wall with reeded glass upper cabinets and a stone backsplash, the sofa facing the TV wall, the round textured rug and the LED cove ceiling. Re-photograph it with a 24mm tilt-shift lens at f/8 from 1.4 m. Light it with 6500K window light from the far wall at 3:1, the 2700K cove LED as a soft ceiling halo, and warm light filtered through the slats casting thin parallel shadows. Give the oak continuous grain and the stone a matte honed finish, and add contact shadows under the stools.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Interior photograph of an integrated living room and kitchen, a floor-to-ceiling oak slatted partition dividing the spaces, an oak breakfast bar with a honed light stone top and three oak bar stools, kitchen wall with reeded glass upper cabinets, cream lower cabinets and a stone backsplash, a light sofa facing an oak TV wall, a round textured wool rug, a plaster ceiling with a 2700K LED cove. 6500K window light from the far wall at 3:1, warm light through the slats casting thin parallel shadows on the floor. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.4 m, partition on the right third leading the eye into the kitchen, contact shadows under the stools.
```

#### `tipo03-cozinha`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic, high-resolution kitchen photograph, keeping the layout exact: cream lower cabinets, oak upper cabinets with reeded glass doors, the beige stone backsplash, the oak laundry niche housing a white front-load washer integrated into the kitchen, the stainless fridge, the oak slat panel on the right and the light porcelain floor. Re-photograph it frontal with a 24mm tilt-shift lens at f/8 from 1.4 m. Light it with 3000K LED under the upper cabinets and 6500K window light from behind the camera at 3:1. Add detail: honed stone with subtle fossil-like speckles, faint wear on the washer door seal, the washer and fridge grounded by soft contact shadows.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Frontal photograph of a compact apartment kitchen with integrated laundry, cream slab lower cabinets, oak upper cabinets with reeded glass doors glowing from 3000K LED, a honed beige stone backsplash with subtle speckles, an oak niche housing a white front-load washing machine, a stainless fridge, an oak slat panel on the right, light porcelain floor. 6500K window light from behind the camera at 3:1, under-cabinet 3000K wash on the stone. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.4 m, perfectly level, laundry niche on the right third, soft contact shadows under the appliances.
```

#### `tipo03-sala-tv`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic, high-resolution living room photograph, keeping the layout exact: the TV wall with a low oak rack, the plaster ceiling with a warm LED cove outlining the living area, the light sofa, the breakfast counter with stools, the split air conditioner and the tall plants. Re-photograph it with a 24mm tilt-shift lens at f/8 from 1.3 m. Light it with dusk 7000K window light from the left at 4:1 and the 2700K cove LED as the main warm practical, casting soft gradients on the walls. Add detail: an off TV with a matte black screen and a faint dust sheen, rack grain, natural cushion creases on the sofa.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Interior photograph of a living room at dusk, a TV wall with a low oak rack and a matte black off screen, a plaster ceiling with a 2700K LED cove outlining the seating area, a light linen sofa with natural cushion creases, a breakfast counter with oak stools in the background, a wall-mounted split air conditioner, a tall leafy plant in a ceramic pot. 7000K dusk window light from the left at 4:1, warm cove light grading softly down the walls. Canon EOS R5, TS-E 24mm at f/8, ISO 640, tripod at 1.3 m, sofa on the lower-left third, TV wall on the right.
```

#### `tipo03-quarto1-a` e `tipo03-quarto1-b`
**Gemini 3 Pro Image (use em cada uma das duas imagens)**
```text
Edit Image 1 into an authentic, high-resolution bedroom photograph, keeping the layout and viewpoint exact: the oak wall panel with curved vertical grooves behind the bed, the upholstered headboard, layered natural bedding with a dark brown throw, the nightstands with brass globe sconces, the white three-door wardrobe with long brass handles, the window with a sheer curtain and the light oak floor. Re-photograph it with a 24mm tilt-shift lens at f/8 from 1.3 m. Light it with 6500K window light from the right at 3:1, sconces glowing 2700K, and a grazing highlight revealing the depth of the curved grooves. Add detail: oak with satin sheen and continuous grain across the panels, linen bedding with soft creases, crisp brass handles with faint fingerprints.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Interior photograph of a master bedroom, an oak wall panel with sculpted curved vertical grooves behind the bed, a cream upholstered headboard, natural linen bedding with a dark brown knit throw, oak nightstands with brass opal-globe sconces, a white three-door wardrobe with long brass bar handles, a window with a sheer curtain, light oak floor with a textured rug. 6500K window light from the right at 3:1 grazing the groove relief, 2700K sconce glow. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.3 m, bed on the lower-left third, wardrobe on the right edge, linen creases and satin oak grain.
```

#### `tipo03-quarto2-a` e `tipo03-quarto2-b`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic, high-resolution children's room photograph, keeping the layout exact: the hand-painted mural with a pastel striped hot-air balloon carrying a basket with a teddy bear, clouds and sage foliage, the upholstered daybed with sage cushions and teddy bears, the white upper cabinets and wardrobe with brass knobs, the floating shelf with LED strip, the balcony door with a black railing and the light oak floor. Re-photograph it with a 24mm tilt-shift lens at f/8 from 1.2 m. Light it with soft 6500K daylight from the balcony door at 2:1, high-key and gentle, plus the 3000K shelf LED. Add detail: matte mural paint with brush texture, plush teddy fur, cotton cushion covers with seams.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Interior photograph of a soft pastel children's bedroom, a hand-painted wall mural with a striped sage and sand hot-air balloon carrying a wicker basket with a teddy bear among clouds and sage foliage, an upholstered cream daybed with sage cushions and plush teddy bears, white upper cabinets and a wardrobe with brass knobs, a floating shelf with a warm LED strip holding small toys, a balcony door with a black railing, light oak floor with a round cotton rug. Soft 6500K daylight from the balcony door at 2:1, 3000K shelf glow. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.2 m, daybed on the lower third, mural centered above, matte brushed paint texture, plush fur.
```

#### `tipo03-infantil` (Tipos 03 e 04)
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic children's bedroom photograph, remove the "TIPO 03 E 04" caption and the bottom timeline bar, and replace the misspelled name sign on the wall with a clean pastel coral script sign reading "Helena". Keep the exact room: the scalloped blush upholstered wall panels, the striped butter-yellow wallpaper border, the black window over trees, the sage upholstered bed with cushions and a sun-shaped pillow, the cream nightstand with a ceramic lamp, the cloud-shaped oak play table with bunny-ear chairs, the hot-air balloon and cloud mobile, the cream wardrobe with arched rattan cane doors, and the oak floor. Re-photograph it with a 24mm tilt-shift lens at f/8 from 1.2 m. Light it with warm 3500K late-afternoon sun through the window raking across the scallops at 3:1, the lamp glowing 2700K, and a linear 3000K ceiling LED. Add detail: velvet nap on the panels, open cane weave on the wardrobe, natural oak grain on the little chairs.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Interior photograph of a whimsical children's bedroom, scalloped blush velvet upholstered wall panels, a striped butter-yellow wallpaper border near the ceiling, a black aluminium window framing trees, a sage upholstered bed with sage and peach cushions and a sun-shaped pillow, a cream nightstand with a ceramic lamp, a cloud-shaped oak play table with two bunny-ear oak chairs, a felt hot-air balloon and cloud mobile, a coral script wall sign reading "Helena", a cream wardrobe with arched rattan cane doors, oak floor. Warm 3500K late sun through the window raking across the scallops at 3:1, 2700K lamp glow, linear 3000K ceiling LED. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.2 m, bed on the left third, wardrobe on the right edge, velvet nap and cane weave detail.
```

### Áreas sociais

#### `social-salao-a` e `social-salao-b` (salão de festas)
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic, high-resolution photograph of the residential party room, keeping the layout exact: the red-brown brick barbecue chimney and brick-clad counter, the black speckled granite worktop, the cognac leather bar stools with black legs, the round oak tables with cognac leather tub chairs, the black cone pendants, the square recessed LED ceiling panels, the potted olive tree, the greige upper cabinets and the stainless fridge. Re-photograph it with a 24mm tilt-shift lens at f/8 from 1.3 m. Light it with 6500K daylight from a side window at 3:1 and 2700K pendants pooling warm light on the counter, with a faint ember glow in the barbecue. Add detail: brick with irregular mortar joints and slight soot near the firebox, leather with creases and worn patina on the stool seats, granite with flecks under specular highlights.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Interior photograph of a residential party room, a red-brown brick barbecue chimney with a brick-clad counter topped in black speckled granite, cognac leather bar stools on black steel legs, round oak tables with cognac leather tub chairs, black cone pendants, square recessed LED ceiling panels, a potted olive tree, greige upper cabinets and a stainless fridge, light porcelain floor. 6500K daylight from a side window at 3:1, 2700K pendants pooling warm light on the counter, a faint ember glow inside the barbecue. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.3 m, barbecue on the right third, tables leading from the lower-left foreground, irregular mortar joints and worn leather patina.
```

#### `social-hall-a` e `social-hall-b` (hall de entrada)
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic, high-resolution architectural photograph of the entrance hall, keeping the layout exact: the black steel glazing with arched transoms, the light stone staircase with a black handrail, the stainless elevator doors, the walnut wall panel, the yellow and navy patterned encaustic tile floor, the tiered crystal chandelier, the two framed botanical prints and the tall black planter with a trailing plant. Re-photograph it frontal through the glazing with a 24mm tilt-shift lens at f/8 from 1.5 m at dusk. Light it with warm 3000K interior light from the chandelier and recessed spots, a cool 9000K twilight reflection on the glass, and leaf shadows from street trees falling across the facade. Add detail: soft refractive sparkle in the crystals, slightly worn tile edges and grout, brushed grain on the elevator doors.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Architectural photograph at dusk of a residential entrance hall seen through black steel glazing with arched transoms, inside a light stone staircase with a slim black handrail, stainless brushed elevator doors beside a walnut wall panel, a yellow and navy patterned encaustic tile floor, a tiered crystal bead chandelier, two framed botanical prints and a tall black planter with a trailing plant. Warm 3000K interior light from the chandelier and recessed spots, cool 9000K twilight reflected on the glass, leaf shadows from street trees on the facade. Canon EOS R5, TS-E 24mm at f/8, ISO 400, tripod at 1.5 m, frontal one-point composition with the arched frames as a rhythm, crystal sparkle, slightly worn tile edges.
```

#### `social-pet` (área pet)
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic, high-resolution outdoor photograph of the pet area, keeping the layout exact: the lawn strip beside the building, the blue and red agility ramp and toys, the timber-slat bench on concrete supports, the bamboo against the light rendered wall, the covered walkway and the wall lights. Re-photograph it with a 24mm tilt-shift lens at f/8 from 1.4 m. Light it with 5500K late-morning sun from the upper right casting crisp bamboo shadows on the wall, and 7000K skylight fill at 3:1. Add detail: grass with mixed blade lengths and a few worn patches, sun-faded paint on the agility toys, weathered silver-grey edges on the bench timber.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Outdoor photograph of a residential pet area, a strip of lawn alongside a light rendered wall, a blue and red agility ramp and a yellow training cone, a timber-slat bench on concrete supports, clumps of bamboo against the wall casting crisp shadows, a covered concrete walkway with matte black wall lights. 5500K late-morning sun from the upper right, 7000K skylight fill at 3:1. Canon EOS R5, TS-E 24mm at f/8, ISO 200, tripod at 1.4 m, lawn leading diagonally from the lower-left corner, grass with mixed blade lengths and worn patches, sun-faded paint on the toys, weathered silver-grey timber edges.
```

#### `social-pet-banho`
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic, high-resolution photograph of the pet grooming room, keeping the layout exact: the raised black granite washing tub with a matte black hand shower, the white hexagon wall tiles, the black paw-print decals, the dark mirror, the shampoo bottles and the wall light. Re-photograph it frontal with a 24mm tilt-shift lens at f/8 from 1.4 m. Light it with 4000K recessed downlights and the wall light at 3:1. Add detail: water droplets beading on the granite, slightly uneven hex grout, a small folded towel with terry texture.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Frontal interior photograph of a compact pet grooming room, a raised black granite washing tub with a matte black hand shower on a hose, white hexagon wall tiles with fine grey grout, black paw-print decals climbing the side wall, a dark rectangular mirror, amber shampoo bottles and a folded terry towel, a matte black wall light. 4000K recessed downlights and wall light at 3:1. Canon EOS R5, TS-E 24mm at f/8, ISO 320, tripod at 1.4 m, tub on the lower-center third, water droplets beading on the granite.
```

#### `social-kids-a` e `social-kids-b` (área kids)
**Gemini 3 Pro Image**
```text
Edit Image 1 into an authentic, high-resolution outdoor photograph of the kids' play area, keeping the layout exact: the covered concrete patio with a timber bench on concrete blocks and the party-room window, the bamboo and lawn strip, the grey concrete paver path, the red spring rider and the red and blue merry-go-round, the ivy-covered green wall on the right, the blue foam play mat and the trees beyond the wall. Re-photograph it with a 24mm tilt-shift lens at f/8 from 1.2 m, a child's-eye height. Light it with 5500K morning sun from the left, dappled through the trees onto the pavers, with 7000K sky fill at 3:1. Add detail: ivy leaves of varied sizes and tones, slight wear on the toy paint, uneven paver joints with a few sprigs of moss.
```
**FLUX.2 / FLUX 3 (prosa)**
```text
Outdoor photograph of a residential kids' play area, a covered concrete patio with a timber bench on concrete blocks and a large window, a strip of lawn with bamboo, a grey concrete paver path, a red spring rider and a red and blue merry-go-round, an ivy-covered green wall on the right, a blue foam play mat in the foreground, trees beyond the boundary wall. 5500K morning sun from the left dappled through trees, 7000K sky fill at 3:1. Canon EOS R5, TS-E 24mm at f/8, ISO 200, tripod at 1.2 m child's-eye height, paver path leading from the lower-right corner, ivy leaves of varied size and tone, uneven paver joints with moss.
```

---

## 3. Parâmetros técnicos e protocolo de iteração

**Gemini 3 Pro Image (recomendado):**
- **Referência:** envie a imagem atual do site em resolução máxima como *Image 1*.
- **Formato:** peça a mesma proporção do original (5:4 nas vistas, 3:2 nos interiores) e saída de pelo menos 2048 px no lado maior.
- **Se a IA alterar o projeto**, responda na mesma conversa: *"Restore the exact cabinet layout and furniture positions from Image 1; change only lighting, materials and photographic rendering."*

**FLUX.2 / FLUX 3:**
- **Formato:** proporção 3:2 (1536×1024) ou 5:4 (1280×1024).
- **Ajustes:** passos 28–40 e guidance 3.0–3.5. Valores mais altos deixam a imagem plástica e saturada.
- **Variações:** fixe a seed ao achar uma boa composição e mude só o trecho de luz.

**Depois de gerar:**
- **Formato do site:** exporte em WebP, qualidade 80, com versões de 1400 px e 800 px. Use os mesmos nomes de arquivo; o site já usa as variantes `-800`.
- **Substituição:** basta trocar os arquivos em `assets/` (e regenerar `assets/thumbs/`). Nenhum código precisa mudar.

**Refinos pontuais, sem refazer a imagem inteira:**
1. **Texto ou letreiro deformado:** recorte só a área e peça *"Re-letter the sign to read exactly 'Edifício Santa Ana' in elegant serif italic, keep everything else identical."*
2. **Reflexo de vidro artificial:** recorte a janela e peça *"Make the glass reflect the twilight sky and trees with a subtle 10% reflectance, keep frames identical."*
3. **Brilho plástico no porcelanato:** recorte o piso e peça *"Reduce floor gloss to a soft satin, keep the window reflection as a broad diffuse glow, keep grout lines."*

Antes de publicar, confira cada imagem com zoom de 100%: rejuntes contínuos, linhas verticais retas, nenhum objeto flutuando e textos corretos.

---

## 4. Verificação de qualidade (pré-voo)

| Critério | Resultado |
|---|---|
| Luz com causa física (fonte, ângulo, razão, Kelvin) | Passou: cada prompt nomeia janela, céu, LED ou sol, com temperatura e razão |
| Sem termos genéricos e com micro-imperfeições | Passou: nenhum "8k / masterpiece"; trama, rejunte, poeira, sombra de contato e pátina descritos |
| Composição intencional | Passou: terços e linhas guia definidos; simetria só onde o projeto é simétrico (fachada frontal) |
| Coerência ótica | Passou: basculante (TS) de 24–35 mm entre f/8 e f/11 em tripé, compatível com foco profundo e verticais paralelas |
| Pureza de dialeto | Passou: FLUX sem "no/without/nothing" nem pesos; Gemini em frases completas e positivas |
| Segurança espacial | Passou: sem pessoas; objetos com apoio e sombra de contato explícitos |
| Fidelidade ao briefing | Passou: cada prompt preserva o projeto oficial e corrige os problemas reais (sobreposições, barras, baixa resolução, nome com erro) |
