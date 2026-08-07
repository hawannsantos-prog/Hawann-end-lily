/* ============================================================
   Modelos dos produtos, gerados por código.

   Linha de três passos em torno do óleo de jojoba: óleo de
   limpeza, sérum e primer. Cada frasco é um perfil 2D
   revolucionado; tampas, colares e válvulas são cilindros.
   Nenhum arquivo 3D externo.
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

/* Paleta de impressão dos rótulos. */
const MARFIM = { fundo: "#f3ece0", texto: "#221f18", traco: "#a98a4b" };

const OURO_METAL = 0xd4b06a;
const OURO_ESCURO = 0xb08e4f;

/* ── Óleo de limpeza: frasco alto com válvula pump ───────────
   O vidro é quase incolor e a cor vem da absorção do óleo
   dourado dentro dele. */
export function oleoLimpeza() {
  const g = new THREE.Group();

  const corpo = new THREE.Mesh(lathe([
    [0.00, 0.00], [0.38, 0.00], [0.43, 0.05], [0.43, 1.72],
    [0.41, 1.82], [0.22, 1.94], [0.22, 2.04], [0.00, 2.04],
  ]), vidro({ cor: 0xd9a441, absorcao: 1.9 }));
  corpo.name = "vidro";
  g.add(corpo);

  // Válvula: colar dourado, haste e cabeça.
  g.add(new THREE.Mesh(
    tampaSerrilhada(0.245, 0.2, 1.98, { estrias: 48, fundura: 0.006 }),
    metal(OURO_METAL, { rugosidade: 0.2 })
  ));
  g.add(new THREE.Mesh(cilindro(0.08, 0.08, 0.26, 2.16, 32), metal(OURO_METAL, { rugosidade: 0.18 })));

  const cabeca = new THREE.Mesh(cilindro(0.175, 0.19, 0.17, 2.4, 48), metal(OURO_ESCURO, { rugosidade: 0.28 }));
  g.add(cabeca);
  const bico = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.1, 0.13), metal(OURO_ESCURO, { rugosidade: 0.28 }));
  bico.position.set(0.155, 2.49, 0);
  g.add(bico);

  g.add(rotulo(0.437, 0.92, 0.42, "Óleo de Limpeza", "jojoba orgânico prensado a frio", "145 ml", MARFIM));
  return g;
}

/* ── Sérum: frasco com conta-gotas ───────────────────────── */
export function serum() {
  const g = new THREE.Group();

  const corpo = new THREE.Mesh(lathe([
    [0.00, 0.00], [0.44, 0.00], [0.50, 0.05], [0.50, 1.24],
    [0.47, 1.33], [0.30, 1.44], [0.30, 1.56], [0.00, 1.56],
  ]), vidro({ cor: 0xdfae5f, absorcao: 1.9 }));
  corpo.name = "vidro";
  g.add(corpo);

  // Rosca do gargalo, visível sob o colar.
  g.add(new THREE.Mesh(cilindro(0.315, 0.315, 0.16, 1.42, 48), plastico(0x2b2a24, { verniz: 0.2 })));

  const colar = new THREE.Mesh(cilindro(0.335, 0.345, 0.11, 1.50), metal(OURO_METAL, { rugosidade: 0.18 }));
  colar.name = "colar";
  g.add(colar);

  const tampa = new THREE.Mesh(
    tampaSerrilhada(0.315, 0.44, 1.60, { estrias: 52, fundura: 0.011 }),
    metal(OURO_ESCURO, { rugosidade: 0.3 })
  );
  tampa.name = "tampa";
  g.add(tampa);
  g.add(new THREE.Mesh(cilindro(0.315, 0.315, 0.02, 2.03, 48), metal(OURO_ESCURO, { rugosidade: 0.3 })));

  const bulbo = new THREE.Mesh(lathe([
    [0.00, 0.00], [0.10, 0.03], [0.10, 0.14], [0.16, 0.25],
    [0.175, 0.44], [0.13, 0.58], [0.00, 0.63],
  ], 64), borracha(0x2b2a24));
  bulbo.position.y = 2.04;
  bulbo.name = "pipeta";
  g.add(bulbo);

  const etiqueta = rotulo(0.508, 0.76, 0.30, "Sérum Firmador", "ácido hialurônico + edelvaisse", "30 ml", MARFIM);
  etiqueta.name = "rotulo";
  g.add(etiqueta);

  return g;
}

/* ── Primer: pote baixo de vidro fosco com tampa dourada ──── */
export function primer() {
  const g = new THREE.Group();

  // roughness alto no vidro dá o efeito fosco, sem textura.
  g.add(new THREE.Mesh(lathe([
    [0.00, 0.00], [0.52, 0.00], [0.58, 0.06], [0.58, 0.92],
    [0.55, 0.98], [0.00, 0.98],
  ]), vidro({ cor: 0xf0e6d2, absorcao: 3.4, rugosidade: 0.46 })));

  g.add(new THREE.Mesh(
    tampaSerrilhada(0.598, 0.2, 0.94, { estrias: 60, fundura: 0.008 }),
    metal(OURO_METAL, { rugosidade: 0.24 })
  ));
  g.add(new THREE.Mesh(cilindro(0.598, 0.598, 0.02, 1.14, 64), metal(OURO_METAL, { rugosidade: 0.3 })));

  g.add(rotulo(0.585, 0.42, 0.24, "Primer Botânico", "esqualano + jojoba", "50 ml", MARFIM));
  return g;
}

/* ── Coleção: os três produtos juntos ────────────────────── */
export function colecao() {
  const g = new THREE.Group();

  const oleo = oleoLimpeza();
  oleo.position.set(-1.15, 0, -0.1);
  oleo.scale.setScalar(0.82);
  g.add(oleo);

  const s = serum();
  s.position.set(0.05, 0, 0.15);
  s.scale.setScalar(0.9);
  g.add(s);

  const p = primer();
  p.position.set(1.15, 0, 0.05);
  p.scale.setScalar(0.95);
  g.add(p);

  return g;
}

export const CONSTRUTORES = { oleo: oleoLimpeza, serum, primer, colecao };

/* Pontos de destaque do sérum, usados na seção de showcase.
   As coordenadas são no espaço local do modelo (antes de assentar). */
export const DESTAQUES_SERUM = [
  {
    id: "vidro",
    ponto: [0.5, 0.42, 0],
    titulo: "Vidro, não plástico",
    texto: "Não reage com a fórmula e não solta micropartícula no produto — e volta para a reciclagem quantas vezes precisar.",
  },
  {
    id: "pipeta",
    ponto: [0.17, 2.4, 0],
    titulo: "Conta-gotas graduado",
    texto: "Dosa 4 a 5 gotas por aplicação — sem desperdício e sem contato da pele com o que sobra no frasco.",
  },
  {
    id: "colar",
    ponto: [-0.34, 1.55, 0],
    titulo: "Lacre de alumínio",
    texto: "Fecha a rosca por completo: o óleo não oxida e nada entra depois de aberto.",
  },
  {
    id: "rotulo",
    ponto: [-0.5, 0.95, 0],
    titulo: "Fórmula declarada",
    texto: "Ativo e percentual impressos na frente do rótulo, não escondidos no fim da lista de ingredientes.",
  },
];
