/* ============================================================
   Estúdio: ambiente de iluminação, materiais e utilitários de
   geometria/textura usados pelos produtos.

   A ideia é imitar um set de fotografia de produto: softboxes
   grandes em volta de um fundo infinito, vidro com refração de
   verdade e rótulo com textura de papel.
   ============================================================ */

import * as THREE from "three";

/* ── Ambiente de iluminação ───────────────────────────────────
   Um mini-set renderizado uma vez e convertido em mapa de
   ambiente pelo PMREMGenerator. Sai bem mais convincente que
   luzes pontuais: os reflexos viram faixas alongadas, como as
   softboxes reais deixam no vidro.
   ────────────────────────────────────────────────────────── */

function softbox(scene, { largura, altura, pos, olhar, cor, forca }) {
  const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  mat.color.setRGB(cor[0] * forca, cor[1] * forca, cor[2] * forca);

  const luz = new THREE.Mesh(new THREE.PlaneGeometry(largura, altura), mat);
  luz.position.set(...pos);
  luz.lookAt(...(olhar || [0, 0, 0]));
  scene.add(luz);
  return luz;
}

/** Cria o mapa de ambiente. É por renderer — cada contexto WebGL
 *  precisa do seu. */
export function criarAmbiente(renderer, { fundo = 0.015 } = {}) {
  const set = new THREE.Scene();

  // Caixa envolvente escura: é o "estúdio fechado" que dá
  // contraste às bordas do vidro.
  const caixa = new THREE.Mesh(
    new THREE.BoxGeometry(22, 16, 22),
    new THREE.MeshBasicMaterial({ side: THREE.BackSide })
  );
  caixa.material.color.setRGB(fundo, fundo, fundo * 1.1);
  set.add(caixa);

  // Luz principal, grande e alta à esquerda.
  softbox(set, { largura: 9, altura: 6, pos: [-5.5, 5, 5], cor: [1, 0.95, 0.88], forca: 10.5 });
  // Preenchimento suave à direita, mais frio.
  softbox(set, { largura: 7, altura: 7, pos: [6, 1.5, 3.5], cor: [0.97, 0.97, 1], forca: 2.6 });
  // Faixa atrás, que desenha o contorno do frasco.
  softbox(set, { largura: 5, altura: 3.5, pos: [1.5, 3.5, -6], cor: [1, 0.98, 0.94], forca: 6.5 });
  // Teto: reflexo comprido descendo pelo ombro do frasco.
  softbox(set, { largura: 8, altura: 8, pos: [0, 7, 0], olhar: [0, 0, 0], cor: [1, 1, 1], forca: 1.6 });

  const pmrem = new THREE.PMREMGenerator(renderer);
  const alvo = pmrem.fromScene(set, 0.02);
  pmrem.dispose();

  set.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });

  return alvo.texture;
}

/* ── Geometria ───────────────────────────────────────────── */

/** Sólido de revolução a partir de um perfil [[raio, altura], …]. */
export function lathe(perfil, segmentos = 128) {
  return new THREE.LatheGeometry(
    perfil.map(([x, y]) => new THREE.Vector2(x, y)),
    segmentos
  );
}

export function cilindro(rTopo, rBase, h, y, segmentos = 64) {
  const g = new THREE.CylinderGeometry(rTopo, rBase, h, segmentos);
  g.translate(0, y + h / 2, 0);
  return g;
}

/** Cilindro com estrias verticais — a serrilha das tampas de rosca.
 *  É geometria de verdade, então ela aparece no reflexo e na silhueta. */
export function tampaSerrilhada(raio, altura, y, { estrias = 46, fundura = 0.012 } = {}) {
  const g = new THREE.CylinderGeometry(raio, raio, altura, estrias * 4, 1, false);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r < raio * 0.9) continue;            // preserva as tampas do topo/base
    const ang = Math.atan2(v.z, v.x);
    const novo = raio + Math.sin(ang * estrias) * fundura;
    v.x = Math.cos(ang) * novo;
    v.z = Math.sin(ang) * novo;
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  g.computeVertexNormals();
  g.translate(0, y + altura / 2, 0);
  return g;
}

/** Fundo infinito de estúdio: chão que sobe numa curva até virar
 *  parede, varrido lateralmente. Sem emenda visível, como o
 *  ciclorama de um set real. */
export function ciclorama({ largura = 26, frente = 9, recuo = 2.2, raio = 5, altura = 11 } = {}) {
  const perfil = [];
  perfil.push([frente, 0]);
  perfil.push([-recuo, 0]);
  const passos = 24;
  for (let i = 1; i <= passos; i++) {
    const a = (i / passos) * (Math.PI / 2);
    perfil.push([-recuo - raio * Math.sin(a), raio - raio * Math.cos(a)]);
  }
  perfil.push([-recuo - raio, altura]);

  // V proporcional ao comprimento percorrido, não ao índice do
  // ponto: o trecho curvo tem muitos pontos e pouca extensão, e
  // com V por índice o degradê do fundo ficaria todo espremido
  // ali.
  const percorrido = [0];
  for (let i = 1; i < perfil.length; i++) {
    percorrido.push(
      percorrido[i - 1] + Math.hypot(perfil[i][0] - perfil[i - 1][0], perfil[i][1] - perfil[i - 1][1])
    );
  }
  const total = percorrido[percorrido.length - 1];

  const colunas = 2;
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let c = 0; c <= colunas; c++) {
    const x = -largura / 2 + (largura * c) / colunas;
    perfil.forEach(([z, y], i) => {
      vertices.push(x, y, z);
      uvs.push(c / colunas, percorrido[i] / total);
    });
  }

  const linhas = perfil.length;
  for (let c = 0; c < colunas; c++) {
    for (let i = 0; i < linhas - 1; i++) {
      const a = c * linhas + i;
      const b = (c + 1) * linhas + i;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/* ── Texturas ────────────────────────────────────────────── */

const RESOLUCAO_ROTULO = 2048;

/** Bloco de ruído monocromático, para compor por cima. */
function canvasRuido(lado) {
  const c = document.createElement("canvas");
  c.width = c.height = lado;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(lado, lado);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 110 + Math.random() * 40;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function quebraLinhas(ctx, texto, largura) {
  const linhas = [];
  let linha = "";
  texto.split(" ").forEach((p) => {
    const teste = linha ? linha + " " + p : p;
    if (ctx.measureText(teste).width > largura && linha) {
      linhas.push(linha);
      linha = p;
    } else {
      linha = teste;
    }
  });
  linhas.push(linha);
  return linhas;
}

/** Rótulo impresso.
 *
 *  Um desenho só, centralizado na frente, como num frasco de
 *  verdade — e a lista de ingredientes ocupando o verso, colada na
 *  emenda da textura. Repetir o desenho em volta do frasco daria
 *  sempre uma face legível, mas denuncia na hora que é 3D. */
export function texturaRotulo(titulo, subtitulo, volume, cor) {
  const c = document.createElement("canvas");
  c.width = RESOLUCAO_ROTULO;
  c.height = RESOLUCAO_ROTULO / 2;
  const ctx = c.getContext("2d");
  const { width: W, height: H } = c;

  ctx.fillStyle = cor.fundo;
  ctx.fillRect(0, 0, W, H);

  // Fibra do papel: ruído fino, quase imperceptível, mas tira o
  // aspecto de plástico chapado.
  //
  // Vai por drawImage, e não por putImageData: putImageData
  // sobrescreve os pixels em vez de compor, e apagaria a cor do
  // papel deixando o rótulo cinza.
  ctx.globalAlpha = 0.06;
  ctx.drawImage(canvasRuido(256), 0, 0, W, H);
  ctx.globalAlpha = 1;

  const FAIXA = W * 0.26;
  ctx.textAlign = "center";

  // Frente
  const cx = W / 2;
  ctx.fillStyle = cor.texto;
  ctx.font = `600 ${W * 0.022}px Georgia, serif`;
  ctx.letterSpacing = `${W * 0.0085}px`;
  ctx.fillText("DERMOVITA", cx + W * 0.004, H * 0.25);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = cor.traco;
  ctx.fillRect(cx - W * 0.042, H * 0.3, W * 0.084, 2);

  ctx.fillStyle = cor.texto;
  ctx.font = `600 ${W * 0.036}px Georgia, serif`;
  quebraLinhas(ctx, titulo, FAIXA).forEach((l, i) => {
    ctx.fillText(l, cx, H * 0.45 + i * W * 0.043);
  });

  ctx.fillStyle = cor.traco;
  ctx.font = `400 ${W * 0.019}px Helvetica, Arial, sans-serif`;
  quebraLinhas(ctx, subtitulo, FAIXA).forEach((l, i) => {
    ctx.fillText(l, cx, H * 0.71 + i * W * 0.025);
  });

  if (volume) {
    ctx.fillStyle = cor.traco;
    ctx.font = `500 ${W * 0.015}px Helvetica, Arial, sans-serif`;
    ctx.letterSpacing = `${W * 0.003}px`;
    ctx.fillText(volume, cx, H * 0.88);
    ctx.letterSpacing = "0px";
  }

  // Verso: fica na emenda da textura, então é desenhado nas duas
  // pontas para fechar sem corte.
  ctx.font = `400 ${W * 0.0125}px Helvetica, Arial, sans-serif`;
  ctx.fillStyle = cor.traco;
  const versoLinhas = [
    "MODO DE USO",
    "4 a 5 gotas no rosto limpo e seco,",
    "de manhã e à noite, antes do hidratante.",
    "",
    "Aqua, Niacinamide, Centella Asiatica",
    "Extract, Panthenol, Glycerin,",
    "Sodium Hyaluronate, Allantoin.",
  ];
  [0, W].forEach((ancora) => {
    versoLinhas.forEach((l, i) => {
      ctx.fillText(l, ancora, H * 0.36 + i * W * 0.017);
    });
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

/** Degradê do fundo infinito: claro atrás do produto, caindo para
 *  as bordas. É o que a luz de fundo faz num set real, e é o que
 *  separa o produto do fundo sem precisar de contorno. */
export function texturaFundo(centro = "#fbf0dd", borda = "#c9ad86") {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const ctx = c.getContext("2d");
  // O centro fica na altura em que o produto se apoia no fundo.
  const g = ctx.createRadialGradient(512, 660, 40, 512, 660, 760);
  g.addColorStop(0, centro);
  g.addColorStop(0.45, centro);
  g.addColorStop(1, borda);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 1024);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Relevo do papel, usado como bumpMap do rótulo. */
let bumpPapel = null;
export function texturaPapel() {
  if (bumpPapel) return bumpPapel;

  bumpPapel = new THREE.CanvasTexture(canvasRuido(512));
  bumpPapel.wrapS = bumpPapel.wrapT = THREE.RepeatWrapping;
  bumpPapel.repeat.set(6, 3);
  return bumpPapel;
}

/* ── Materiais ───────────────────────────────────────────── */

/** Vidro de verdade: refração, espessura e cor por absorção —
 *  o âmbar vem do quanto a luz é absorvida ao atravessar, não de
 *  uma cor chapada. */
export function vidro({ cor = 0xd2621f, absorcao = 2.2, rugosidade = 0.045 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: rugosidade,
    transmission: 1,
    thickness: 0.8,
    ior: 1.52,
    attenuationColor: new THREE.Color(cor),
    attenuationDistance: absorcao,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.5,
  });
}

export function plastico(cor, { rugosidade = 0.34, verniz = 0.65 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: cor,
    metalness: 0,
    roughness: rugosidade,
    clearcoat: verniz,
    clearcoatRoughness: 0.28,
    envMapIntensity: 1.1,
  });
}

export function metal(cor, { rugosidade = 0.22 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: cor,
    metalness: 1,
    roughness: rugosidade,
    envMapIntensity: 1.6,
  });
}

export function borracha(cor) {
  return new THREE.MeshPhysicalMaterial({
    color: cor,
    metalness: 0,
    roughness: 0.82,
    sheen: 0.4,
    sheenRoughness: 0.9,
    envMapIntensity: 0.7,
  });
}

export function papel(mapa) {
  return new THREE.MeshPhysicalMaterial({
    map: mapa,
    roughness: 0.72,
    metalness: 0,
    bumpMap: texturaPapel(),
    bumpScale: 0.014,
    clearcoat: 0.18,
    clearcoatRoughness: 0.6,
    envMapIntensity: 0.9,
  });
}

/** Sombra de contato: degradê radial deitado no chão. Muito mais
 *  barato que shadow map e serve de reforço embaixo do produto. */
export function sombraContato(raio = 1.6, opacidade = 0.5) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(256, 256, 8, 256, 256, 252);
  g.addColorStop(0, "rgba(24,14,10,.95)");
  g.addColorStop(0.35, "rgba(24,14,10,.42)");
  g.addColorStop(1, "rgba(24,14,10,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  const malha = new THREE.Mesh(
    new THREE.PlaneGeometry(raio * 2, raio * 2),
    // premultipliedAlpha casa com o contexto do renderer; sem isso
    // a cor vaza onde o alfa é zero.
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      premultipliedAlpha: true,
      opacity: opacidade,
      depthWrite: false,
    })
  );
  malha.rotation.x = -Math.PI / 2;
  malha.renderOrder = -1;
  return malha;
}

/** Centraliza o grupo na origem em X/Z, apoia a base em y=0 e
 *  normaliza a altura. */
export function assentar(grupo, alturaAlvo) {
  const caixa = new THREE.Box3().setFromObject(grupo);
  const tam = new THREE.Vector3();
  const centro = new THREE.Vector3();
  caixa.getSize(tam);
  caixa.getCenter(centro);

  const escala = alturaAlvo / tam.y;
  grupo.scale.multiplyScalar(escala);
  grupo.position.set(-centro.x * escala, -caixa.min.y * escala, -centro.z * escala);
  return escala;
}
