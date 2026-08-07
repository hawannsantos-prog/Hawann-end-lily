/* ============================================================
   Palcos: cada área 3D da página e como ela é renderizada.

   - Herói e showcase têm canvas próprio, porque usam
     pós-processamento (bloom, vinheta, grão) e o composer
     trabalha sobre o quadro inteiro.
   - Os cartões do catálogo dividem um canvas só, recortado por
     scissor — são quatro cenas simples e não vale um contexto
     WebGL para cada.
   ============================================================ */

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { criarAmbiente, ciclorama, sombraContato, assentar, texturaFundo } from "./studio.js";

/* Rotação em que a frente do rótulo encara a câmera.
   No CylinderGeometry, u=0 fica em +Z (de frente para a câmera) e
   u=0.5 em -Z. Como o desenho do rótulo é centralizado em u=0.5,
   o modelo entra meia volta girado. */
export const ROTACAO_FRENTE = Math.PI;

/* ── Acabamento de imagem ─────────────────────────────────────
   Vinheta, grão de filme e uma aberração cromática mínima nas
   bordas. São os defeitos que uma lente real deixa — sem eles a
   imagem fica limpa demais e denuncia o CG. */
const AcabamentoShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTempo: { value: 0 },
    uVinheta: { value: 1.0 },
    uGrao: { value: 0.035 },
    uAberracao: { value: 0.0009 },
    uSaturacao: { value: 1.16 },
    uContraste: { value: 1.06 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTempo, uVinheta, uGrao, uAberracao, uSaturacao, uContraste;
    varying vec2 vUv;

    void main() {
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c);

      // A separação de canais cresce com a distância do centro.
      vec2 desvio = c * r2 * uAberracao * 8.0;
      vec4 cor;
      cor.r = texture2D(tDiffuse, vUv + desvio).r;
      cor.g = texture2D(tDiffuse, vUv).g;
      cor.b = texture2D(tDiffuse, vUv - desvio).b;
      cor.a = 1.0;

      // O ACES esvazia os tons quentes; a saturação volta aqui,
      // já em espaço de exibição.
      float luma = dot(cor.rgb, vec3(0.2126, 0.7152, 0.0722));
      cor.rgb = mix(vec3(luma), cor.rgb, uSaturacao);
      cor.rgb = (cor.rgb - 0.5) * uContraste + 0.5;

      cor.rgb *= 1.0 - uVinheta * smoothstep(0.18, 0.78, r2);

      float grao = fract(sin(dot(vUv * vec2(1.0, 1.3) + uTempo, vec2(12.9898, 78.233))) * 43758.5453);
      cor.rgb += (grao - 0.5) * uGrao;

      gl_FragColor = cor;
    }
  `,
};

/** Renderer + composer para um canvas dedicado. */
export function criarPalco(canvas, opcoes = {}) {
  const {
    bloom = true,
    forcaBloom = 0.42,
    limiarBloom = 0.82,
    vinheta = 0.55,
    grao = 0.03,
    aberracao = 0.0016,
    dprMax = 2,
    amostras = 4,
    transparente = true,
    // Brilho do "estúdio" em volta das softboxes. Alto = set claro
    // e arejado; baixo = set escuro, que recorta o vidro mas
    // apaga tudo que for branco.
    fundoAmbiente = 0.09,
  } = opcoes;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !bloom,        // com composer a suavização vem do alvo MSAA
    alpha: transparente,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprMax));
  renderer.setClearAlpha(0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;

  const ambiente = criarAmbiente(renderer, { fundo: fundoAmbiente });

  const palco = { canvas, renderer, ambiente, composer: null, acabamento: null, bloomPass: null };

  if (bloom) {
    const alvo = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: amostras,
    });
    const composer = new EffectComposer(renderer, alvo);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, dprMax));

    palco.composer = composer;
    palco.bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), forcaBloom, 0.55, limiarBloom);
    palco.acabamento = new ShaderPass(AcabamentoShader);
    palco.acabamento.uniforms.uVinheta.value = vinheta;
    palco.acabamento.uniforms.uGrao.value = grao;
    palco.acabamento.uniforms.uAberracao.value = aberracao;
  }

  return palco;
}

/** Liga a cena/câmera ao composer (precisa existir antes dos passes).
 *
 *  O acabamento vem DEPOIS do OutputPass, de propósito: grão e
 *  vinheta precisam agir sobre a imagem já mapeada em tom e
 *  codificada em sRGB. Aplicados antes, em espaço linear, um grão
 *  discreto vira ruído grosseiro nas sombras, porque o tone
 *  mapping amplia enormemente as variações nos valores baixos. */
export function montarPasses(palco, cena, camera) {
  if (!palco.composer) return;
  palco.composer.addPass(new RenderPass(cena, camera));
  palco.composer.addPass(palco.bloomPass);
  palco.composer.addPass(new OutputPass());
  palco.composer.addPass(palco.acabamento);
}

export function redimensionar(palco, largura, altura) {
  palco.renderer.setSize(largura, altura, false);
  if (palco.composer) {
    palco.composer.setSize(largura, altura);
    palco.bloomPass.resolution.set(largura, altura);
  }
}

/* ── Cena do herói: fundo infinito de estúdio ─────────────── */
export function cenaHeroi(palco, construir, { altura = 2.6, corFundo = 0xe8dcc2 } = {}) {
  const cena = new THREE.Scene();
  cena.environment = palco.ambiente;
  cena.background = new THREE.Color(corFundo);   // fora do ciclorama

  const fundo = new THREE.Mesh(
    ciclorama({ largura: 30, frente: 10, recuo: 2.4, raio: 6, altura: 12 }),
    new THREE.MeshStandardMaterial({
      map: texturaFundo(),
      roughness: 0.95, metalness: 0, envMapIntensity: 1.0,
    })
  );
  fundo.receiveShadow = true;
  cena.add(fundo);

  const pivo = new THREE.Group();
  const produto = construir();
  pivo.add(produto);
  assentar(pivo, altura);
  produto.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });

  pivo.rotation.y = ROTACAO_FRENTE;

  const flutua = new THREE.Group();
  flutua.add(pivo);
  cena.add(flutua);

  const contato = sombraContato(altura * 0.62, 0.5);
  contato.position.y = 0.004;
  cena.add(contato);

  // Luz principal com sombra: as softboxes do mapa de ambiente
  // iluminam, mas não projetam sombra.
  const chave = new THREE.DirectionalLight(0xfff4e8, 3.1);
  chave.position.set(-3.4, 5.4, 3.6);
  chave.castShadow = true;
  chave.shadow.mapSize.set(2048, 2048);
  chave.shadow.radius = 4;
  chave.shadow.bias = -0.0012;
  chave.shadow.normalBias = 0.02;
  const c = chave.shadow.camera;
  c.left = -4; c.right = 4; c.top = 5; c.bottom = -1; c.near = 0.5; c.far = 16;
  c.updateProjectionMatrix();
  cena.add(chave);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
  camera.position.set(0, altura * 0.62, 6.5);
  camera.lookAt(0, altura * 0.48, 0);

  return { cena, camera, pivo, flutua, alvoOlhar: new THREE.Vector3(0, altura * 0.48, 0) };
}

/* ── Cena do showcase: fundo escuro com piso espelhado ────── */
export function cenaShowcase(palco, construir, { altura = 3.2 } = {}) {
  const cena = new THREE.Scene();
  cena.environment = palco.ambiente;
  cena.background = new THREE.Color(0x14150f);

  const pivo = new THREE.Group();
  const produto = construir();
  pivo.add(produto);
  const escala = assentar(pivo, altura);
  produto.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  pivo.rotation.y = ROTACAO_FRENTE;
  cena.add(pivo);

  // Reflexo: uma cópia espelhada abaixo do piso, cortada pelo
  // plano do chão. Custa uma fração de um espelho de verdade.
  const reflexo = pivo.clone(true);
  const corte = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  reflexo.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = o.receiveShadow = false;
    o.material = o.material.clone();
    o.material.clippingPlanes = [corte];
    o.material.transparent = true;
    o.material.opacity = 0.16;
    o.material.side = THREE.BackSide;
    o.material.depthWrite = false;

  });
  reflexo.scale.y *= -1;
  cena.add(reflexo);

  // Sem plano de piso: qualquer superfície refletindo o estúdio
  // vira uma faixa cinza cortando o quadro. Fica só o reflexo
  // espelhado sobre o preto, que é como se fotografa produto em
  // fundo escuro.
  const poca = sombraContato(altura * 0.9, 0.5);
  poca.position.y = 0.002;
  cena.add(poca);

  // Véu vertical na cor do fundo, na frente do reflexo: some com
  // ele conforme desce, sem depender de mexer no shader dos
  // materiais clonados.
  const veu = document.createElement("canvas");
  veu.width = 4;
  veu.height = 256;
  const vctx = veu.getContext("2d");
  const vg = vctx.createLinearGradient(0, 0, 0, 256);
  vg.addColorStop(0, "rgba(20,21,15,0)");
  vg.addColorStop(0.45, "rgba(20,21,15,.72)");
  vg.addColorStop(1, "rgba(20,21,15,1)");
  vctx.fillStyle = vg;
  vctx.fillRect(0, 0, 4, 256);

  const cortina = new THREE.Mesh(
    new THREE.PlaneGeometry(30, altura * 2.2),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(veu),
      transparent: true,
      premultipliedAlpha: false,
      depthWrite: false,
    })
  );
  cortina.position.set(0, -altura * 1.1, 1.6);
  cena.add(cortina);

  const chave = new THREE.DirectionalLight(0xfff0e0, 4.2);
  chave.position.set(-3, 6, 4);
  cena.add(chave);
  const contra = new THREE.DirectionalLight(0xbcd4ff, 2.6);
  contra.position.set(4, 2.4, -4);
  cena.add(contra);

  // O alvo fica perto da linha do piso: assim o enquadramento
  // pega o frasco em cima e o reflexo inteiro embaixo.
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, altura * 0.52, 10.2);
  camera.lookAt(0, altura * 0.3, 0);

  return { cena, camera, pivo, escala, alvoOlhar: new THREE.Vector3(0, altura * 0.3, 0) };
}

/* ── Cena simples para os cartões ─────────────────────────── */
export function cenaCartao(ambiente, construir, { altura = 2.5 } = {}) {
  const cena = new THREE.Scene();
  cena.environment = ambiente;

  const pivo = new THREE.Group();
  pivo.add(construir());
  assentar(pivo, altura);

  pivo.rotation.y = ROTACAO_FRENTE;

  const flutua = new THREE.Group();
  flutua.add(pivo);
  cena.add(flutua);

  const contato = sombraContato(altura * 0.55, 0.45);
  cena.add(contato);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
  camera.position.set(0, altura * 0.55, 7.2);
  camera.lookAt(0, altura * 0.48, 0);

  return { cena, camera, pivo, flutua, contato };
}
