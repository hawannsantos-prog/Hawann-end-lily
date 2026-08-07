/* ============================================================
   Modelos dos produtos, gerados por código.

   Cada frasco é um perfil 2D revolucionado; tampas, colares e
   válvulas são cilindros. Nenhum arquivo 3D externo.
   ============================================================ */

import * as THREE from "three";
import {
  lathe, cilindro, tampaSerrilhada,
  vidro, plastico, metal, borracha, papel, texturaRotulo,
} from "./studio.js";

/** Rótulo: cilindro aberto encostado no corpo do frasco. */
function rotulo(raio, altura, y, titulo, subtitulo, volume, cor) {
  const g = new THREE.CylinderGeometry(raio, raio, altura, 128, 1, true);
  g.translate(0, y + altura / 2, 0);
  return new THREE.Mesh(g, papel(texturaRotulo(titulo, subtitulo, volume, cor)));
}

const CREME = { fundo: "#f2e7dc", texto: "#241b16", traco: "#a8624c" };
const TERRACOTA = { fundo: "#a8624c", texto: "#fdf6f0", traco: "#f0cdbc" };
const ESCURO = { fundo: "#241f1c", texto: "#f6ece4", traco: "#c79a7e" };

/* ── Sérum: frasco âmbar com conta-gotas ─────────────────── */
export function serum() {
  const g = new THREE.Group();

  const corpo = new THREE.Mesh(lathe([
    [0.00, 0.00], [0.44, 0.00], [0.50, 0.05], [0.50, 1.24],
    [0.47, 1.33], [0.30, 1.44], [0.30, 1.56], [0.00, 1.56],
  ]), vidro({ cor: 0xc4551a, absorcao: 1.45 }));
  corpo.name = "vidro";
  g.add(corpo);

  // Rosca do gargalo, visível sob o colar.
  g.add(new THREE.Mesh(cilindro(0.315, 0.315, 0.16, 1.42, 48), plastico(0x1c1613, { verniz: 0.2 })));

  const colar = new THREE.Mesh(cilindro(0.335, 0.345, 0.11, 1.50), metal(0xd9b276, { rugosidade: 0.18 }));
  colar.name = "colar";
  g.add(colar);

  const tampa = new THREE.Mesh(
    tampaSerrilhada(0.315, 0.44, 1.60, { estrias: 52, fundura: 0.011 }),
    plastico(0x241d19, { rugosidade: 0.3, verniz: 0.8 })
  );
  tampa.name = "tampa";
  g.add(tampa);
  g.add(new THREE.Mesh(cilindro(0.315, 0.315, 0.02, 2.03, 48), plastico(0x241d19)));

  const bulbo = new THREE.Mesh(lathe([
    [0.00, 0.00], [0.10, 0.03], [0.10, 0.14], [0.16, 0.25],
    [0.175, 0.44], [0.13, 0.58], [0.00, 0.63],
  ], 64), borracha(0x2b2320));
  bulbo.position.y = 2.04;
  bulbo.name = "pipeta";
  g.add(bulbo);

  const etiqueta = rotulo(0.508, 0.76, 0.30, "Sérum Calmante", "niacinamida 5% + centella asiática", "30 ml", CREME);
  etiqueta.name = "rotulo";
  g.add(etiqueta);

  return g;
}

/* ── Protetor solar: bisnaga com base prensada ───────────── */
export function protetor() {
  const g = new THREE.Group();

  g.add(new THREE.Mesh(lathe([
    [0.00, 0.18], [0.38, 0.18], [0.43, 0.27], [0.43, 1.22],
    [0.39, 1.40], [0.21, 1.56], [0.21, 1.64], [0.00, 1.64],
  ]), plastico(0xf4ebe2, { rugosidade: 0.36, verniz: 0.55 })));

  const prensa = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.2, 0.075), plastico(0xf4ebe2, { rugosidade: 0.4 }));
  prensa.position.y = 0.1;
  g.add(prensa);

  g.add(new THREE.Mesh(cilindro(0.225, 0.225, 0.06, 1.58, 48), metal(0xd9b276, { rugosidade: 0.3 })));
  g.add(new THREE.Mesh(
    tampaSerrilhada(0.235, 0.26, 1.64, { estrias: 40, fundura: 0.008 }),
    plastico(0xa8624c, { rugosidade: 0.28, verniz: 0.85 })
  ));

  g.add(rotulo(0.437, 0.9, 0.32, "Protetor Solar FPS 60", "toque seco · sem marcas brancas", "50 g", TERRACOTA));
  return g;
}

/* ── Clareador: frasco fumê com válvula pump ─────────────── */
export function clareador() {
  const g = new THREE.Group();

  g.add(new THREE.Mesh(lathe([
    [0.00, 0.00], [0.40, 0.00], [0.46, 0.05], [0.46, 1.06],
    [0.43, 1.15], [0.24, 1.26], [0.24, 1.36], [0.00, 1.36],
  ]), vidro({ cor: 0x6b5647, absorcao: 1.5, rugosidade: 0.06 })));

  g.add(new THREE.Mesh(
    tampaSerrilhada(0.265, 0.16, 1.32, { estrias: 44, fundura: 0.007 }),
    metal(0xcfa96f, { rugosidade: 0.24 })
  ));
  g.add(new THREE.Mesh(cilindro(0.085, 0.085, 0.24, 1.46, 32), metal(0xcfa96f, { rugosidade: 0.2 })));

  const cabeca = new THREE.Mesh(cilindro(0.185, 0.2, 0.16, 1.70, 48), plastico(0x241d19, { verniz: 0.8 }));
  g.add(cabeca);
  const bico = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.095, 0.13), plastico(0x241d19, { verniz: 0.8 }));
  bico.position.set(0.16, 1.79, 0);
  g.add(bico);

  g.add(rotulo(0.468, 0.72, 0.24, "Clareador de Manchas", "ácido tranexâmico 5%", "30 ml", ESCURO));
  return g;
}

/* ── Potinho do kit ──────────────────────────────────────── */
function pote(matVidro, matTampa) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(lathe([
    [0.00, 0.00], [0.44, 0.00], [0.50, 0.05], [0.50, 0.54],
    [0.48, 0.6], [0.00, 0.6],
  ]), matVidro));
  g.add(new THREE.Mesh(
    tampaSerrilhada(0.53, 0.22, 0.56, { estrias: 56, fundura: 0.009 }),
    matTampa
  ));
  return g;
}

/* ── Kit: trio de produtos ───────────────────────────────── */
export function kit() {
  const g = new THREE.Group();

  const limpeza = pote(vidro({ cor: 0x7d9a6a, absorcao: 1.8 }), metal(0xd9b276, { rugosidade: 0.26 }));
  limpeza.position.set(-0.95, 0, 0.2);
  limpeza.scale.setScalar(0.92);
  g.add(limpeza);

  const s = serum();
  s.scale.setScalar(0.88);
  g.add(s);

  const hidratante = pote(
    plastico(0xf4ebe2, { rugosidade: 0.38 }),
    plastico(0xa8624c, { rugosidade: 0.3, verniz: 0.8 })
  );
  hidratante.position.set(1.0, 0, 0.12);
  hidratante.scale.setScalar(0.92);
  g.add(hidratante);

  return g;
}

export const CONSTRUTORES = { serum, fps: protetor, clareador, kit };

/* Pontos de destaque do sérum, usados na seção de showcase.
   As coordenadas são no espaço local do modelo (antes de assentar). */
export const DESTAQUES_SERUM = [
  { id: "vidro", ponto: [0.5, 0.42, 0], titulo: "Vidro âmbar", texto: "Barra a luz que oxida a niacinamida e mantém a fórmula estável até o fim do frasco." },
  { id: "pipeta", ponto: [0.17, 2.4, 0], titulo: "Conta-gotas graduado", texto: "Dosa 4 a 5 gotas por aplicação — sem desperdício e sem contato com a pele." },
  { id: "colar", ponto: [-0.34, 1.55, 0], titulo: "Lacre de alumínio", texto: "Fecha a rosca por completo: nada evapora e nada entra depois de aberto." },
  { id: "rotulo", ponto: [-0.5, 0.95, 0], titulo: "Fórmula declarada", texto: "Percentual de ativo impresso no rótulo, não escondido na lista de ingredientes." },
];
