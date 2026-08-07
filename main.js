/* ============================================================
   Dermovita — cenas 3D (Three.js)

   Um único WebGLRenderer desenha todas as cenas da página.
   Cada elemento `.view[data-view]` no HTML define um recorte
   (scissor + viewport) onde a sua cena é renderizada — assim a
   página inteira usa um contexto WebGL só, em vez de um por
   produto.
   ============================================================ */

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Renderer compartilhado ───────────────────────────────── */
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearAlpha(0);
renderer.autoClear = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const pmrem = new THREE.PMREMGenerator(renderer);
const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

/* ── Materiais ────────────────────────────────────────────── */
const MAT = {
  vidroAmbar: new THREE.MeshPhysicalMaterial({
    color: 0x7d3a1e, roughness: 0.12, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.35,
  }),
  vidroFume: new THREE.MeshPhysicalMaterial({
    color: 0x3b3330, roughness: 0.18, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2,
  }),
  creme: new THREE.MeshPhysicalMaterial({
    color: 0xf4e9df, roughness: 0.32, metalness: 0,
    clearcoat: 0.7, clearcoatRoughness: 0.2, envMapIntensity: 1,
  }),
  salvia: new THREE.MeshPhysicalMaterial({
    color: 0x7e8f76, roughness: 0.28, metalness: 0,
    clearcoat: 0.6, envMapIntensity: 1,
  }),
  terracota: new THREE.MeshPhysicalMaterial({
    color: 0xa8624c, roughness: 0.3, metalness: 0,
    clearcoat: 0.5, envMapIntensity: 1,
  }),
  tampa: new THREE.MeshPhysicalMaterial({
    color: 0x2a211d, roughness: 0.42, metalness: 0.1, envMapIntensity: 0.9,
  }),
  metal: new THREE.MeshPhysicalMaterial({
    color: 0xd8b78e, roughness: 0.24, metalness: 1, envMapIntensity: 1.4,
  }),
};

/* ── Utilitários de geometria ─────────────────────────────── */

/** Gera um sólido de revolução a partir de um perfil [[raio, altura], …]. */
function lathe(profile, segments = 72) {
  const pts = profile.map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, segments);
}

function cyl(rTop, rBottom, h, y, segments = 48) {
  const g = new THREE.CylinderGeometry(rTop, rBottom, h, segments);
  g.translate(0, y + h / 2, 0);
  return g;
}

/** Rótulo impresso: textura de canvas aplicada num cilindro aberto. */
function labelTexture(titulo, subtitulo, cor) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d");

  ctx.fillStyle = cor.fundo;
  ctx.fillRect(0, 0, c.width, c.height);

  // A textura dá uma volta completa no cilindro, mas de frente só se
  // enxerga cerca de um terço dela. Repetimos o texto a cada 120° para
  // que sempre haja uma face legível, dentro de uma faixa estreita.
  const FAIXA = 250;
  [c.width / 6, c.width / 2, (c.width * 5) / 6].forEach((cx) => {
    ctx.textAlign = "center";

    ctx.fillStyle = cor.texto;
    ctx.font = "600 26px Georgia, serif";
    ctx.letterSpacing = "9px";
    ctx.fillText("DERMOVITA", cx + 4, 132);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = cor.traco;
    ctx.fillRect(cx - 46, 156, 92, 2);

    ctx.fillStyle = cor.texto;
    ctx.font = "600 40px Georgia, serif";
    wrap(ctx, titulo, cx, 224, FAIXA, 46);

    ctx.fillStyle = cor.traco;
    ctx.font = "400 21px Helvetica, Arial, sans-serif";
    wrap(ctx, subtitulo, cx, 366, FAIXA, 26);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function wrap(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  words.forEach((w) => {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}

function labelRing(radius, height, y, titulo, subtitulo, cor) {
  const geo = new THREE.CylinderGeometry(radius, radius, height, 72, 1, true);
  geo.translate(0, y + height / 2, 0);
  const mat = new THREE.MeshPhysicalMaterial({
    map: labelTexture(titulo, subtitulo, cor),
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.35,
  });
  return new THREE.Mesh(geo, mat);
}

/** Sombra de contato falsa: um degradê radial deitado no chão. */
function contactShadow(radius = 1.6, opacity = 0.42) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 6, 128, 128, 126);
  g.addColorStop(0, "rgba(60,42,34,.85)");
  g.addColorStop(0.45, "rgba(60,42,34,.28)");
  g.addColorStop(1, "rgba(60,42,34,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    // `premultipliedAlpha` casa com o contexto do renderer: sem ele a
    // cor vaza onde o alfa é zero e deixa um retângulo esbranquiçado
    // sobre o fundo da página.
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      premultipliedAlpha: true,
      opacity,
      depthWrite: false,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = -1;
  return mesh;
}

/* ── Produtos ─────────────────────────────────────────────── */

/** Sérum: frasco âmbar com conta-gotas. */
function serum() {
  const g = new THREE.Group();

  g.add(new THREE.Mesh(lathe([
    [0.00, 0.00], [0.50, 0.00], [0.54, 0.06], [0.54, 1.24],
    [0.50, 1.34], [0.30, 1.46], [0.30, 1.58], [0.00, 1.58],
  ]), MAT.vidroAmbar));

  g.add(new THREE.Mesh(cyl(0.33, 0.33, 0.10, 1.52), MAT.metal));
  g.add(new THREE.Mesh(cyl(0.30, 0.32, 0.46, 1.60, 32), MAT.tampa));

  // pipeta de borracha
  const bulbo = new THREE.Mesh(lathe([
    [0.00, 0.00], [0.09, 0.02], [0.09, 0.16], [0.15, 0.26],
    [0.17, 0.44], [0.12, 0.58], [0.00, 0.62],
  ], 40), MAT.tampa);
  bulbo.position.y = 2.06;
  g.add(bulbo);

  g.add(labelRing(0.555, 0.74, 0.34, "Sérum Calmante", "niacinamida + centella", {
    fundo: "#f4e9df", texto: "#2a211d", traco: "#a8624c",
  }));

  return g;
}

/** Protetor solar: bisnaga com base prensada. */
function protetor() {
  const g = new THREE.Group();

  g.add(new THREE.Mesh(lathe([
    [0.00, 0.18], [0.40, 0.18], [0.44, 0.26], [0.44, 1.24],
    [0.40, 1.42], [0.21, 1.58], [0.21, 1.66], [0.00, 1.66],
  ]), MAT.creme));

  // base prensada da bisnaga
  const crimp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.08), MAT.creme);
  crimp.position.y = 0.1;
  g.add(crimp);

  g.add(new THREE.Mesh(cyl(0.23, 0.23, 0.30, 1.60, 32), MAT.terracota));

  g.add(labelRing(0.455, 0.86, 0.30, "Protetor Solar FPS 60", "toque seco · uso diário", {
    fundo: "#a8624c", texto: "#fdf6f0", traco: "#f0cdbc",
  }));

  return g;
}

/** Clareador: frasco fumê com válvula pump. */
function clareador() {
  const g = new THREE.Group();

  g.add(new THREE.Mesh(lathe([
    [0.00, 0.00], [0.45, 0.00], [0.47, 0.05], [0.47, 1.08],
    [0.43, 1.18], [0.23, 1.28], [0.23, 1.38], [0.00, 1.38],
  ]), MAT.vidroFume));

  g.add(new THREE.Mesh(cyl(0.26, 0.26, 0.14, 1.34), MAT.metal));
  g.add(new THREE.Mesh(cyl(0.09, 0.09, 0.22, 1.48, 20), MAT.metal));

  const cabeca = new THREE.Mesh(cyl(0.19, 0.20, 0.15, 1.70, 28), MAT.tampa);
  g.add(cabeca);
  const bico = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.09, 0.12), MAT.tampa);
  bico.position.set(0.16, 1.79, 0);
  g.add(bico);

  g.add(labelRing(0.485, 0.70, 0.26, "Clareador de Manchas", "ácido tranexâmico", {
    fundo: "#2f2925", texto: "#f6ece4", traco: "#c79a7e",
  }));

  return g;
}

/** Potinho do kit (limpeza / hidratante). */
function pote(corVidro, corTampa) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(lathe([
    [0.00, 0.00], [0.50, 0.00], [0.53, 0.05], [0.53, 0.58],
    [0.50, 0.62], [0.00, 0.62],
  ]), corVidro));
  g.add(new THREE.Mesh(cyl(0.55, 0.55, 0.22, 0.58, 48), corTampa));
  return g;
}

/** Kit: trio de produtos lado a lado. */
function kit() {
  const g = new THREE.Group();

  const potinho = pote(MAT.salvia, MAT.metal);
  potinho.position.set(-0.95, 0, 0.18);
  potinho.scale.setScalar(0.92);
  g.add(potinho);

  const s = serum();
  s.scale.setScalar(0.86);
  s.position.set(0.05, 0, 0);
  g.add(s);

  const h = pote(MAT.creme, MAT.terracota);
  h.position.set(1.0, 0, 0.1);
  h.scale.setScalar(0.92);
  g.add(h);

  return g;
}

/* ── Montagem das cenas ───────────────────────────────────── */

/** Centraliza o grupo na origem e normaliza a altura. */
function fit(group, alturaAlvo) {
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const escala = alturaAlvo / size.y;
  group.scale.multiplyScalar(escala);
  group.position.set(-center.x * escala, -center.y * escala, -center.z * escala);

  return { alturaBase: box.min.y * escala - group.position.y };
}

function baseScene() {
  const scene = new THREE.Scene();
  scene.environment = envMap;

  const key = new THREE.DirectionalLight(0xfff3e8, 1.6);
  key.position.set(3, 5, 4);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xd9e4d6, 0.85);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xdcc9bb, 0.45));
  return scene;
}

/**
 * Cria uma cena com um produto centralizado, sombra de contato e
 * um pivô que gira. Retorna o descritor consumido pelo loop.
 */
function makeView(el, build, opts = {}) {
  const scene = baseScene();
  const camera = new THREE.PerspectiveCamera(opts.fov || 30, 1, 0.1, 100);
  camera.position.set(0, opts.camY || 0.15, opts.dist || 6.4);
  camera.lookAt(0, 0, 0);

  const pivot = new THREE.Group();
  const produto = build();
  pivot.add(produto);
  fit(pivot, opts.altura || 2.2);

  const bob = new THREE.Group();   // flutuação vertical
  bob.add(pivot);
  scene.add(bob);

  const sombra = contactShadow(opts.sombra || 1.5, opts.sombraOp || 0.4);
  sombra.position.y = -(opts.altura || 2.2) / 2 - 0.06;
  scene.add(sombra);

  if (opts.decor) addDecor(scene);

  return {
    el, scene, camera, pivot, bob, sombra,
    velocidade: opts.velocidade ?? 0.32,
    velocidadeBase: opts.velocidade ?? 0.32,
    inercia: 0,
    tilt: { x: 0, z: 0 },
    tiltAlvo: { x: 0, z: 0 },
    fase: Math.random() * Math.PI * 2,
    visivel: false,
    parallax: !!opts.parallax,
  };
}

/** Esferas e anéis flutuando ao redor do frasco do herói. */
function addDecor(scene) {
  const decor = new THREE.Group();
  const pecas = [
    { geo: new THREE.SphereGeometry(0.24, 32, 24), mat: MAT.terracota, pos: [-1.55, 0.85, -0.6] },
    { geo: new THREE.SphereGeometry(0.16, 32, 24), mat: MAT.salvia, pos: [1.5, -0.75, -0.3] },
    { geo: new THREE.SphereGeometry(0.11, 24, 18), mat: MAT.creme, pos: [1.25, 1.05, 0.5] },
    { geo: new THREE.TorusGeometry(0.42, 0.045, 20, 80), mat: MAT.metal, pos: [-1.35, -0.85, 0.2] },
    { geo: new THREE.TorusGeometry(0.3, 0.035, 18, 64), mat: MAT.salvia, pos: [1.7, 0.4, -0.9] },
  ];
  pecas.forEach((p, i) => {
    const m = new THREE.Mesh(p.geo, p.mat);
    m.position.set(...p.pos);
    m.rotation.set(i * 0.7, i * 1.1, i * 0.4);
    m.userData.fase = i * 1.3;
    decor.add(m);
  });
  scene.add(decor);
  scene.userData.decor = decor;
}

const views = [];
const construtores = { hero: serum, serum, fps: protetor, clareador, kit };

document.querySelectorAll(".view[data-view]").forEach((el) => {
  const chave = el.dataset.view;
  const build = construtores[chave];
  if (!build) return;

  const isHero = chave === "hero";
  views.push(
    makeView(el, build, isHero
      ? { altura: 3.0, dist: 7.0, fov: 32, sombra: 2.2, sombraOp: 0.36, velocidade: 0.24, decor: true, parallax: true }
      : { altura: chave === "kit" ? 2.2 : 2.6, dist: 6.2, sombra: chave === "kit" ? 2.4 : 1.6 })
  );
});

/* Só desenha o que está na tela. */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const v = views.find((x) => x.el === e.target);
        if (v) v.visivel = e.isIntersecting;
      });
    },
    { rootMargin: "120px" }
  );
  views.forEach((v) => io.observe(v.el));
} else {
  views.forEach((v) => (v.visivel = true));
}

/* ── Interação ────────────────────────────────────────────── */

const ponteiro = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  ponteiro.x = (e.clientX / window.innerWidth) * 2 - 1;
  ponteiro.y = (e.clientY / window.innerHeight) * 2 - 1;
});

// Arrastar para girar (herói)
const heroView = views.find((v) => v.el.dataset.view === "hero");
const hint = document.getElementById("hero-hint");
if (heroView) {
  let arrastando = false;
  let ultimoX = 0;

  heroView.el.addEventListener("pointerdown", (e) => {
    arrastando = true;
    ultimoX = e.clientX;
    heroView.el.setPointerCapture(e.pointerId);
    if (hint) hint.classList.add("is-hidden");
  });
  heroView.el.addEventListener("pointermove", (e) => {
    if (!arrastando) return;
    const dx = e.clientX - ultimoX;
    ultimoX = e.clientX;
    heroView.pivot.rotation.y += dx * 0.008;
    heroView.inercia = dx * 0.008;
  });
  const soltar = () => (arrastando = false);
  heroView.el.addEventListener("pointerup", soltar);
  heroView.el.addEventListener("pointercancel", soltar);
  heroView.el.addEventListener("pointerleave", soltar);
}

// O produto acompanha a inclinação do cartão e gira mais rápido
// enquanto o cartão está sob o mouse.
document.querySelectorAll(".card--product").forEach((card) => {
  const v = views.find((x) => card.contains(x.el));
  if (!v) return;

  card.addEventListener("pointerenter", () => (v.velocidade = 1.15));
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    v.tiltAlvo.x = ((e.clientY - r.top) / r.height - 0.5) * 0.34;
    v.tiltAlvo.z = -((e.clientX - r.left) / r.width - 0.5) * 0.26;
  });
  card.addEventListener("pointerleave", () => {
    v.velocidade = v.velocidadeBase;
    v.tiltAlvo.x = v.tiltAlvo.z = 0;
  });
});

/* ── Loop de renderização ─────────────────────────────────── */

let larguraCanvas = 0;
let alturaCanvas = 0;

function ajustarTamanho() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w === larguraCanvas && h === alturaCanvas) return;
  larguraCanvas = w;
  alturaCanvas = h;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
}

const relogio = new THREE.Clock();

function frame() {
  const dt = Math.min(relogio.getDelta(), 0.05);
  const t = relogio.elapsedTime;
  ajustarTamanho();

  renderer.setScissorTest(false);
  renderer.clear();
  renderer.setScissorTest(true);

  for (const v of views) {
    if (!v.visivel) continue;

    const r = v.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > alturaCanvas || r.right < 0 || r.left > larguraCanvas) continue;
    if (r.width < 2 || r.height < 2) continue;

    // rotação + inércia do arraste + inclinação vinda do cartão
    if (!REDUCED) {
      v.pivot.rotation.y += (v.velocidade * dt) + v.inercia;
      v.tilt.x += (v.tiltAlvo.x - v.tilt.x) * 0.12;
      v.tilt.z += (v.tiltAlvo.z - v.tilt.z) * 0.12;

      v.bob.position.y = Math.sin(t * 0.9 + v.fase) * 0.055;
      v.bob.rotation.x = v.tilt.x;
      v.bob.rotation.z = Math.sin(t * 0.6 + v.fase) * 0.02 + v.tilt.z;
      v.sombra.scale.setScalar(1 - v.bob.position.y * 0.35);
      v.sombra.material.opacity = 0.4 - v.bob.position.y * 0.4;
    }
    v.inercia *= 0.92;
    if (Math.abs(v.inercia) < 1e-4) v.inercia = 0;

    if (v.parallax && !REDUCED) {
      v.camera.position.x += (ponteiro.x * 0.55 - v.camera.position.x) * 0.05;
      v.camera.position.y += (0.15 - ponteiro.y * 0.35 - v.camera.position.y) * 0.05;
      v.camera.lookAt(0, 0, 0);

      const decor = v.scene.userData.decor;
      if (decor) {
        decor.rotation.y = ponteiro.x * 0.14;
        decor.children.forEach((m) => {
          m.position.y += Math.sin(t * 0.8 + m.userData.fase) * 0.0016;
          m.rotation.y += dt * 0.25;
        });
      }
    }

    const baixo = alturaCanvas - r.bottom;
    renderer.setViewport(r.left, baixo, r.width, r.height);
    renderer.setScissor(r.left, baixo, r.width, r.height);

    v.camera.aspect = r.width / r.height;
    v.camera.updateProjectionMatrix();
    renderer.render(v.scene, v.camera);
  }
}

renderer.setAnimationLoop(frame);

// Pausa quando a aba está em segundo plano.
document.addEventListener("visibilitychange", () => {
  renderer.setAnimationLoop(document.hidden ? null : frame);
  if (!document.hidden) relogio.getDelta();
});

// Sinaliza para ui.js que o 3D subiu (evita o fallback sem WebGL).
window.__dermovita3d = true;
