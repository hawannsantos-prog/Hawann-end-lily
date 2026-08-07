/* ============================================================
   Dermovita — montagem das cenas 3D e interações.
   ============================================================ */

import * as THREE from "three";
import { criarPalco, montarPasses, redimensionar, cenaHeroi, cenaShowcase, cenaCartao, ROTACAO_FRENTE } from "./src/stages.js";
import { CONSTRUTORES, DESTAQUES_SERUM, serum } from "./src/products.js";

const REDUZIDO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ESTREITO = window.matchMedia("(max-width: 860px)").matches;

const relogio = new THREE.Clock();
const ponteiro = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  ponteiro.x = (e.clientX / window.innerWidth) * 2 - 1;
  ponteiro.y = (e.clientY / window.innerHeight) * 2 - 1;
});

const visivel = (el) => {
  const r = el.getBoundingClientRect();
  return r.bottom > -120 && r.top < window.innerHeight + 120 && r.width > 2 && r.height > 2;
};

/* ── Herói ───────────────────────────────────────────────── */

const heroCanvas = document.getElementById("hero-canvas");
const heroEl = document.querySelector(".hero__stage");
// Limiar alto de propósito: o fundo do estúdio é claro e, com um
// limiar baixo, o quadro inteiro floresce e vira névoa. Só os
// brilhos especulares do vidro e do metal devem estourar.
const palcoHeroi = criarPalco(heroCanvas, {
  forcaBloom: 0.6, limiarBloom: 4.5, vinheta: 0.36, grao: 0.02, aberracao: 0.0008,
  dprMax: ESTREITO ? 2 : 2.5,
});
const heroi = cenaHeroi(palcoHeroi, serum, { altura: 2.6 });
montarPasses(palcoHeroi, heroi.cena, heroi.camera);

let arrasto = 0;      // inércia do arraste
let girando = false;
const dica = document.getElementById("hero-hint");

heroEl.addEventListener("pointerdown", (e) => {
  girando = true;
  heroEl.dataset.ultimo = e.clientX;
  heroEl.setPointerCapture(e.pointerId);
  dica?.classList.add("is-hidden");
});
heroEl.addEventListener("pointermove", (e) => {
  if (!girando) return;
  const dx = e.clientX - Number(heroEl.dataset.ultimo);
  heroEl.dataset.ultimo = e.clientX;
  heroi.pivo.rotation.y += dx * 0.008;
  arrasto = dx * 0.008;
});
["pointerup", "pointercancel", "pointerleave"].forEach((ev) =>
  heroEl.addEventListener(ev, () => (girando = false))
);

/* ── Showcase ────────────────────────────────────────────── */

const showEl = document.getElementById("showcase");
const showCanvas = document.getElementById("showcase-canvas");
const palcoShow = criarPalco(showCanvas, {
  forcaBloom: 0.6, limiarBloom: 3.2, vinheta: 0.85, grao: 0.045,
  dprMax: 2, transparente: false, fundoAmbiente: 0.1,
});
const show = cenaShowcase(palcoShow, serum, { altura: 3.2 });
montarPasses(palcoShow, show.cena, show.camera);

// Âncoras dos destaques, presas ao modelo: giram junto com ele.
const produtoShow = show.pivo.children[0];
const destaques = DESTAQUES_SERUM.map((d) => {
  const ancora = new THREE.Object3D();
  ancora.position.set(...d.ponto);
  produtoShow.add(ancora);

  const el = document.querySelector(`.hotspot[data-id="${d.id}"]`);
  return { ...d, ancora, el, mundo: new THREE.Vector3(), radial: new THREE.Vector3() };
});

const dirCamera = new THREE.Vector3();

function atualizarDestaques(rect) {
  show.camera.getWorldDirection(dirCamera);

  for (const d of destaques) {
    if (!d.el) continue;
    d.ancora.getWorldPosition(d.mundo);

    // Direção "para fora" do frasco, para saber se o ponto está na
    // face virada para a câmera.
    d.radial.set(d.mundo.x - show.pivo.position.x, 0, d.mundo.z - show.pivo.position.z).normalize();
    const deFrente = d.radial.dot(dirCamera) < 0.08;

    const p = d.mundo.clone().project(show.camera);
    const x = (p.x * 0.5 + 0.5) * rect.width;
    const y = (-p.y * 0.5 + 0.5) * rect.height;

    d.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    d.el.classList.toggle("is-atras", !deFrente);
    // O cartão abre sempre para fora do frasco, senão cobre o produto.
    d.el.classList.toggle("is-esquerda", x > rect.width * 0.5);
  }
}

/* ── Cartões do catálogo (canvas compartilhado) ──────────── */

const cardsCanvas = document.getElementById("cards-canvas");
const palcoCards = criarPalco(cardsCanvas, { bloom: false, dprMax: 2 });

const cartoes = [];
document.querySelectorAll(".view[data-view]").forEach((el) => {
  const construir = CONSTRUTORES[el.dataset.view];
  if (!construir) return;

  const chave = el.dataset.view;
  const v = cenaCartao(palcoCards.ambiente, construir, { altura: chave === "kit" ? 2.1 : 2.5 });
  cartoes.push({
    el, ...v,
    velocidade: 0.3, velocidadeBase: 0.3, inercia: 0,
    fase: Math.random() * Math.PI * 2,
    tilt: { x: 0, z: 0 }, tiltAlvo: { x: 0, z: 0 },
  });
});

document.querySelectorAll(".card--product").forEach((card) => {
  const v = cartoes.find((x) => card.contains(x.el));
  if (!v) return;
  card.addEventListener("pointerenter", () => (v.velocidade = 1.1));
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    v.tiltAlvo.x = ((e.clientY - r.top) / r.height - 0.5) * 0.32;
    v.tiltAlvo.z = -((e.clientX - r.left) / r.width - 0.5) * 0.24;
  });
  card.addEventListener("pointerleave", () => {
    v.velocidade = v.velocidadeBase;
    v.tiltAlvo.x = v.tiltAlvo.z = 0;
  });
});

/* ── Qualidade adaptativa ────────────────────────────────── */

let quadros = 0;
let acumulado = 0;
let rebaixado = false;

function medirDesempenho(dt) {
  if (rebaixado || quadros > 120) return;
  quadros++;
  acumulado += dt;
  if (quadros < 90) return;

  if (acumulado / quadros > 0.032) {   // abaixo de ~31 fps
    rebaixado = true;
    [palcoHeroi, palcoShow, palcoCards].forEach((p) => {
      p.renderer.setPixelRatio(1);
      p.composer?.setPixelRatio(1);
      if (p.bloomPass) p.bloomPass.enabled = false;
    });
  }
}

/* ── Laço ────────────────────────────────────────────────── */

function tamanhoDe(el) {
  const r = el.getBoundingClientRect();
  return { r, w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) };
}

const dim = { heroi: [0, 0], show: [0, 0], cards: [0, 0] };

function desenharHeroi(t, dt) {
  if (!visivel(heroEl)) return;
  const { w, h } = tamanhoDe(heroEl);
  if (dim.heroi[0] !== w || dim.heroi[1] !== h) {
    dim.heroi = [w, h];
    redimensionar(palcoHeroi, w, h);
    heroi.camera.aspect = w / h;
    heroi.camera.updateProjectionMatrix();
  }

  if (!REDUZIDO) {
    heroi.pivo.rotation.y += 0.16 * dt + arrasto;
    arrasto *= 0.93;
    if (Math.abs(arrasto) < 1e-4) arrasto = 0;

    heroi.flutua.position.y = Math.sin(t * 0.7) * 0.018;

    heroi.camera.position.x += (ponteiro.x * 0.5 - heroi.camera.position.x) * 0.045;
    heroi.camera.position.y += (heroi.alvoOlhar.y * 1.25 - ponteiro.y * 0.42 - heroi.camera.position.y) * 0.045;
    heroi.camera.lookAt(heroi.alvoOlhar);
    palcoHeroi.acabamento.uniforms.uTempo.value = t * 0.4;
  }

  palcoHeroi.composer.render();
}

function desenharShowcase(t, dt) {
  if (!visivel(showEl)) return;
  const alvo = showEl.querySelector(".showcase__stage");
  const { r, w, h } = tamanhoDe(alvo);
  if (dim.show[0] !== w || dim.show[1] !== h) {
    dim.show = [w, h];
    redimensionar(palcoShow, w, h);
    show.camera.aspect = w / h;
    show.camera.updateProjectionMatrix();
  }

  // A rolagem comanda a rotação: o produto dá quase uma volta
  // completa enquanto a seção atravessa a tela.
  const progresso = THREE.MathUtils.clamp(
    (window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1
  );
  show.pivo.rotation.y = ROTACAO_FRENTE + (REDUZIDO ? 0.5 : -1.1 + progresso * 4.6);
  show.camera.position.z = 10.4 - progresso * 1.2;
  show.camera.position.y = show.alvoOlhar.y * 1.7 - progresso * 0.22;
  show.camera.lookAt(show.alvoOlhar);

  if (!REDUZIDO) palcoShow.acabamento.uniforms.uTempo.value = t * 0.4;

  palcoShow.composer.render();
  atualizarDestaques({ width: w, height: h });
}

function desenharCartoes(t, dt) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (dim.cards[0] !== w || dim.cards[1] !== h) {
    dim.cards = [w, h];
    palcoCards.renderer.setSize(w, h, false);
  }

  const rend = palcoCards.renderer;
  rend.autoClear = false;
  rend.setScissorTest(false);
  rend.clear();
  rend.setScissorTest(true);

  for (const v of cartoes) {
    const r = v.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w || r.width < 2) continue;

    if (!REDUZIDO) {
      v.pivo.rotation.y += v.velocidade * dt + v.inercia;
      v.tilt.x += (v.tiltAlvo.x - v.tilt.x) * 0.12;
      v.tilt.z += (v.tiltAlvo.z - v.tilt.z) * 0.12;
      v.flutua.position.y = Math.sin(t * 0.85 + v.fase) * 0.05;
      v.flutua.rotation.x = v.tilt.x;
      v.flutua.rotation.z = Math.sin(t * 0.6 + v.fase) * 0.018 + v.tilt.z;
      v.contato.material.opacity = 0.45 - v.flutua.position.y * 0.4;
    }
    v.inercia *= 0.92;

    const baixo = h - r.bottom;
    rend.setViewport(r.left, baixo, r.width, r.height);
    rend.setScissor(r.left, baixo, r.width, r.height);
    v.camera.aspect = r.width / r.height;
    v.camera.updateProjectionMatrix();
    rend.render(v.cena, v.camera);
  }
}

function quadro() {
  const dt = Math.min(relogio.getDelta(), 0.05);
  const t = relogio.elapsedTime;

  desenharHeroi(t, dt);
  desenharShowcase(t, dt);
  desenharCartoes(t, dt);
  medirDesempenho(dt);
}

palcoHeroi.renderer.setAnimationLoop(quadro);

document.addEventListener("visibilitychange", () => {
  palcoHeroi.renderer.setAnimationLoop(document.hidden ? null : quadro);
  if (!document.hidden) relogio.getDelta();
});

window.__dermovita3d = true;
