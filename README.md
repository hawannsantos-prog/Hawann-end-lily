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
index.html   marcação e conteúdo
styles.css   estilos
ui.js        interações sem dependência (menu, sacola, revelação, inclinação)
main.js      cenas 3D em Three.js
vendor/three three.module.js + RoomEnvironment (v0.160.0, licença MIT)
```

## Como o 3D funciona

- **Um único contexto WebGL para a página inteira.** Existe um `<canvas>`
  fixo cobrindo a janela; cada elemento `.view[data-view]` do HTML define um
  recorte (`setScissor` + `setViewport`) onde a sua cena é desenhada. Isso
  evita criar um contexto WebGL por produto — navegadores limitam esse
  número, e cinco contextos custariam bem mais memória.
- **O canvas fica acima do conteúdo** (`z-index: 5`), porque os cartões têm
  fundo opaco e o esconderiam. Como só os recortes são desenhados, o resto
  da página continua visível. A navegação usa `z-index` maior e passa por
  cima.
- **Os frascos são gerados por código**, sem modelos externos: perfis 2D
  revolucionados (`LatheGeometry`) para os corpos, cilindros para tampas e
  válvulas, e os rótulos são texturas desenhadas num `<canvas>` 2D e
  aplicadas a um cilindro aberto. O texto do rótulo é repetido a cada 120°
  para haver sempre uma face legível.
- **Iluminação** por `RoomEnvironment` (mapa de ambiente procedural,
  nenhum HDR para baixar) + luz principal e de recorte. A sombra de contato
  é um degradê radial deitado no chão, bem mais barato que shadow map.
- **Só é renderizado o que está na tela**, via `IntersectionObserver` mais
  um teste de retângulo por quadro; a animação também pausa quando a aba vai
  para segundo plano.

## Interações

| Onde | O quê |
| --- | --- |
| Herói | arraste horizontal gira o frasco (com inércia); o mouse dá parallax na câmera |
| Cartões de produto | inclinam em 3D e o produto acompanha a inclinação, girando mais rápido |
| Botão `+` | adiciona à sacola, com contador e aviso |

## Acessibilidade e degradação

- Cada área 3D tem `role="img"` e `aria-label` descrevendo o produto.
- `prefers-reduced-motion` desliga rotação, flutuação, parallax e revelações.
- Sem WebGL (ou se o módulo não carregar em 8s), o `<body>` ganha a classe
  `no-webgl`: o canvas some e as áreas 3D viram um fundo em degradê, com o
  resto do site funcionando normalmente.

## Three.js

`vendor/three/` traz apenas os dois arquivos usados, extraídos do pacote
`three@0.160.0` do npm — nada de CDN, então o site funciona offline e não
quebra se um terceiro sair do ar. A licença MIT original está em
`vendor/three/LICENSE`. Para atualizar:

```bash
npm pack three@<versão>
tar -xzf three-<versão>.tgz \
  package/build/three.module.js \
  package/examples/jsm/environments/RoomEnvironment.js \
  package/LICENSE
```

e mover os arquivos para `vendor/three/` mantendo a mesma estrutura de
pastas (o `importmap` no `index.html` aponta para ela).
