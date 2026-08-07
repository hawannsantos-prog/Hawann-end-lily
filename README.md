# Dermovita — site 3D

Site institucional/catálogo da Dermovita com os produtos renderizados em 3D
interativo no navegador (WebGL/Three.js). Todo o conteúdo está em português.

**Site modelo:** os dados de contato, WhatsApp e CNPJ são placeholders —
personalize antes de publicar.

## Como rodar

O site é estático, sem build. Basta servir a pasta:

```bash
npx http-server -p 8080 .
# ou
python3 -m http.server 8080
```

E abrir <http://localhost:8080>. É preciso servir por HTTP (e não abrir o
`index.html` direto pelo `file://`), porque os módulos ES não carregam a
partir do sistema de arquivos.

Para publicar, suba os arquivos como estão em qualquer hospedagem estática
(GitHub Pages, Netlify, Vercel, Cloudflare Pages…).

## Estrutura

```
index.html          marcação e conteúdo
styles.css          estilos
fonts.css           @font-face das fontes locais
ui.js               interações sem dependência (menu, sacola, revelação, inclinação)
main.js             montagem das cenas 3D e laço de renderização
src/studio.js       ambiente de luz, materiais, geometria e texturas
src/products.js     modelos dos produtos
src/stages.js       renderers, pós-processamento e as três cenas
vendor/three        three.module.js + addons (v0.160.0, licença MIT)
vendor/fonts        Fraunces e Inter em woff2 (SIL OFL 1.1)
```

## Como o 3D funciona

A página tem três palcos, com necessidades diferentes:

| Palco | Canvas | Pós-processamento |
| --- | --- | --- |
| Herói | próprio | bloom, vinheta, grão, aberração cromática |
| Showcase | próprio | idem, mais forte |
| Cartões do catálogo | um só, recortado por scissor | nenhum |

Herói e showcase têm canvas próprio porque o `EffectComposer` trabalha
sobre o quadro inteiro — um bloom aplicado num canvas compartilhado
vazaria de uma cena para a outra. Os quatro cartões, que não usam
pós-processamento, dividem um canvas só: cada `.view[data-view]` vira um
recorte via `setScissor`/`setViewport`, em vez de um contexto WebGL por
produto.

**Iluminação.** Um mini-estúdio — quatro softboxes em volta de uma caixa
escura — é renderizado uma vez e convertido em mapa de ambiente pelo
`PMREMGenerator`. É o que dá os reflexos alongados no vidro, que luzes
pontuais não produzem. O parâmetro `fundoAmbiente` controla o brilho da
caixa: alto deixa o set claro e arejado (herói), baixo recorta o vidro
contra o preto (showcase).

**Materiais.** O vidro usa refração de verdade (`transmission`), com a
cor vindo da absorção ao longo do caminho óptico (`attenuationColor` +
`attenuationDistance`), não de uma cor chapada. As tampas têm a serrilha
modelada como geometria, então ela aparece na silhueta e nos reflexos. Os
rótulos são texturas de 2048px desenhadas em canvas 2D, com relevo de
papel no `bumpMap` e a lista de ingredientes no verso.

**Fundo do herói.** Um ciclorama — chão que sobe numa curva até virar
parede — com degradê claro atrás do produto. É o que separa o frasco do
fundo sem precisar de contorno.

**Showcase.** Fundo escuro, sem plano de piso (qualquer superfície
refletindo o estúdio vira uma faixa cinza cortando o quadro). O reflexo é
uma cópia espelhada do produto, cortada por um plano de recorte e
apagada por um véu em degradê. Os pontos de destaque são âncoras 3D
presas ao modelo, projetadas para a tela a cada quadro — por isso
acompanham o frasco e somem quando passam para trás.

**Desempenho.** Só é renderizado o que está na tela; a animação pausa com
a aba em segundo plano; e, se os primeiros 90 quadros ficarem abaixo de
~31 fps, o site reduz a resolução e desliga o bloom sozinho.

## Interações

| Onde | O quê |
| --- | --- |
| Herói | arraste horizontal gira o frasco (com inércia); o mouse dá parallax na câmera |
| Showcase | a rolagem da página comanda a rotação do frasco e a aproximação da câmera |
| Cartões de produto | inclinam em 3D e o produto acompanha a inclinação, girando mais rápido |
| Botão `+` | adiciona à sacola, com contador e aviso |

## Acessibilidade e degradação

- Cada área 3D tem `role="img"` e `aria-label` descrevendo o produto.
- `prefers-reduced-motion` desliga rotação, flutuação, parallax e revelações.
- Sem WebGL (ou se o módulo não carregar em 8s), o `<body>` ganha a classe
  `no-webgl`: os canvas somem, as áreas 3D viram um fundo em degradê e os
  destaques do showcase aparecem como lista de texto.

## Three.js

`vendor/three/` traz apenas os arquivos usados, extraídos do pacote
`three@0.160.0` do npm — nada de CDN, então o site funciona offline e não
quebra se um terceiro sair do ar. A licença MIT original está em
`vendor/three/LICENSE`. Para atualizar:

```bash
npm pack three@<versão>
tar -xzf three-<versão>.tgz \
  package/build/three.module.js \
  package/examples/jsm/postprocessing/ \
  package/examples/jsm/shaders/ \
  package/LICENSE
```

e mover os arquivos para `vendor/three/`, mantendo `build/three.module.js`
como `vendor/three/three.module.js` e `examples/jsm/` como
`vendor/three/addons/` — é para essa estrutura que o `importmap` do
`index.html` aponta.

As fontes em `vendor/fonts/` vêm dos pacotes `@fontsource/fraunces` e
`@fontsource/inter` (subconjunto latin).
