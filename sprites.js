"use strict";

/* =========================================================
   SPRITES EM PIXEL ART (16 x 16)
   Cada sprite é desenhado só pela METADE ESQUERDA (8 colunas, "m").
   O código espelha para formar os 16 pixels de largura.
   Se o desenho não for simétrico, use "f": 16 linhas x 16 colunas.
   Cada letra é uma cor da PALETA; "." é transparente.
   "extras" são pixels soltos [x, y, cor] (armas, brilhos...)
   ========================================================= */

const PALETA = {
  o: "#1a1330",
  k: "#0d0a1a",
  w: "#ffffff",
  g: "#3fbf5a",
  G: "#8ff0a4",
  d: "#1f7a3a",
  r: "#e5484d",
  R: "#ff9a8f",
  e: "#8f1f2b",
  b: "#4a7bff",
  B: "#a5c2ff",
  n: "#243f9c",
  y: "#ffcf4a",
  Y: "#fff0a8",
  a: "#c28a12",
  p: "#9b5de5",
  P: "#d1a8ff",
  u: "#5a2d9c",
  s: "#f2c9a0",
  S: "#c98f63",
  t: "#8b5a2b",
  T: "#c08a4f",
  h: "#5c3a1a",
  c: "#9aa5b5",
  C: "#d7dde8",
  m: "#5b6578",
  q: "#ff8a3d",
  Q: "#ffc08a",
  i: "#7fe3ff",
  I: "#d6f6ff",
  l: "#e8e0d0",
  L: "#fff8ea",
  A: "#2fbf9b",
  D: "#177a64",
  N: "#26263a",
  M: "#4a4a66",
};

// linha vertical de pixels: v(x, de, até, cor)
const v = (x, y0, y1, c) => {
  const a = [];
  for (let y = y0; y <= y1; y++) a.push([x, y, c]);
  return a;
};

const SPRITES = {
  /* ---------------- MONSTROS ---------------- */
  slime: {
    m: [
      "........",
      "........",
      "........",
      "........",
      ".....ooo",
      "...oogGG",
      "..ogGGGG",
      ".ogGGGGG",
      ".ogGGGGG",
      ".ogGwkGG",
      ".ogGwkGG",
      ".ogggGGG",
      ".ogggGoo",
      ".ogggggG",
      ".oddgggg",
      "..oooooo",
    ],
  },

  morcego: {
    m: [
      "........",
      "........",
      "........",
      "......o.",
      "......op",
      "o.....oP",
      "oo...oPr",
      "oumooppP",
      "oummuoPp",
      ".oummuop",
      ".oumuuop",
      "..oumoop",
      "...ouoo.",
      "....o...",
      "........",
      "........",
    ],
  },

  goblin: {
    m: [
      "........",
      "........",
      "....oooo",
      "..ooggGg",
      "o.oggggg",
      "ooogwkgg",
      "oggogggg",
      ".ooogrrr",
      "...oogoo",
      "..otttTt",
      ".otttTTt",
      ".ottsttt",
      ".oottttt",
      "..ohhohh",
      "..ohoo.o",
      "..oo...o",
    ],
  },

  cogumelo: {
    m: [
      "........",
      "........",
      ".....ooo",
      "...oorrr",
      "..orrwwr",
      ".orrwwrr",
      ".orrrrrr",
      "oorrrrrw",
      "oeeeoooo",
      ".oooLLLL",
      "...oLwkL",
      "...oLwkL",
      "...oLLLL",
      "...oLLoo",
      "..ooLLLL",
      "..oooooo",
    ],
  },

  fantasma: {
    m: [
      "........",
      ".....ooo",
      "...ooIII",
      "..oIIIII",
      ".oIIIIII",
      ".oIIkkII",
      ".oIIkkII",
      ".oIIIIII",
      ".oIIIooI",
      "oIIIIooI",
      "oIIIIIII",
      "oIIIIIII",
      "oIIoIIII",
      "oIo.oIIo",
      ".o...oIo",
      "........",
    ],
  },

  golem: {
    m: [
      "........",
      "....oooo",
      "...occCC",
      "..occCCC",
      "..ocCqqC",
      "..ocCCCC",
      "..oommmm",
      "ooccccCC",
      "occCCmCC",
      "ocCCCmcc",
      "ocmCCmcc",
      "occ.occC",
      "oc..occC",
      ".oo..occ",
      "..o..oom",
      "..oooooo",
    ],
  },

  bau: {
    m: [
      "........",
      "........",
      "........",
      "........",
      "........",
      "..oooooo",
      ".ottTTTT",
      ".ottTTTT",
      ".oyyyyyy",
      ".ottttyY",
      ".ottttyk",
      ".ottttyy",
      ".ottTTTT",
      ".ottTTTT",
      ".ohhhhhh",
      "..oooooo",
    ],
  },

  /* ---------------- CHEFES ---------------- */
  ogro: {
    m: [
      ".Y......",
      ".YY..ooo",
      "..Yoogtg",
      "..oggggg",
      "..ogwkgg",
      "..oggggg",
      "..oglllg",
      ".oooggoo",
      "oggggggg",
      "ogggtgGg",
      "ogggtgGg",
      "oggggggg",
      ".ottttgg",
      ".ottttgg",
      ".oggo.oo",
      ".oooo...",
    ],
  },

  dragao: {
    m: [
      "....o...",
      "....oo.o",
      "o...orro",
      "oo.orrRr",
      "oeoorwkr",
      "oeeorrrr",
      "oeeoorrr",
      ".oeeoyyr",
      ".oeeoyYr",
      "..oeoyyr",
      "..ooryyr",
      "...orrrr",
      "...orror",
      "...orro..",
      "..oyyo..",
      "..ooo...",
    ],
  },

  /* ---------------- HERÓIS ---------------- */
  pip: {
    m: [
      "........",
      "........",
      "....oooo",
      "...ohhhh",
      "..ohhhhh",
      "..ohssss",
      "..osskss",
      "..ossssS",
      "...ooosS",
      "..ogggGg",
      ".oggggGg",
      ".osgtttt",
      "..ogggGg",
      "....otto",
      "....otto",
      "...ohhho",
    ],
    extras: [
      ...v(14, 3, 10, "T"),
      ...v(15, 3, 10, "o"),
      [14, 2, "o"],
      [15, 2, "o"],
      [13, 11, "s"],
      [14, 11, "a"],
      [15, 11, "o"],
      [14, 12, "h"],
    ],
  },

  tora: {
    m: [
      "........",
      "........",
      "....oooo",
      "...orrRr",
      "..orrrrr",
      "..orssss",
      "..orskss",
      "..orsssS",
      "..orroos",
      "..occCCc",
      ".occCCcc",
      ".oscmmCc",
      "..occCCc",
      "....occo",
      "....occo",
      "...ommmo",
    ],
    extras: [
      ...v(14, 1, 10, "C"),
      ...v(15, 1, 10, "m"),
      [14, 0, "o"],
      [15, 0, "o"],
      [13, 11, "y"],
      [14, 11, "y"],
      [15, 11, "y"],
      [14, 12, "h"],
      [14, 13, "a"],
    ],
  },

  mira: {
    m: [
      "........",
      "........",
      "....oooo",
      "...oggGg",
      "..ogggGg",
      "..ogsssS",
      "..ogskss",
      "..ogsssS",
      "...ogooS",
      "..otttTt",
      ".ostttTt",
      ".ostthtt",
      "..otttTt",
      "....otto",
      "....otto",
      "...ohhho",
    ],
    extras: [
      ...v(0, 4, 12, "T"),
      [1, 3, "T"],
      [1, 13, "T"],
      ...v(1, 5, 11, "L"),
    ],
  },

  gandor: {
    m: [
      ".......o",
      "......op",
      ".....opp",
      "....oppp",
      "..oooooo",
      "...ossss",
      "...osksS",
      "...olllL",
      "..oplllL",
      ".oppplLL",
      ".osppuLL",
      ".opppppp",
      "..oppppp",
      "..oppuuu",
      "..oppppp",
      "..oooooo",
    ],
    extras: [
      ...v(14, 4, 15, "t"),
      [14, 2, "Q"],
      [13, 2, "q"],
      [15, 2, "q"],
      [14, 1, "q"],
      [14, 3, "q"],
    ],
  },

  luna: {
    m: [
      "........",
      "......YY",
      "....oooo",
      "...oyyYy",
      "..oyyyyy",
      "..oyssss",
      "..oyskss",
      "..oysssS",
      "..oyyoos",
      "..oLLLLL",
      ".oLLLLyL",
      ".osLLLyL",
      "..oLLLLL",
      "..oLLLLL",
      "..oyLLLL",
      "..oooooo",
    ],
    extras: [
      ...v(14, 6, 14, "t"),
      [13, 3, "c"],
      [14, 3, "C"],
      [15, 3, "c"],
      [13, 4, "c"],
      [14, 4, "C"],
      [15, 4, "c"],
      [14, 5, "c"],
    ],
  },

  sombra: {
    m: [
      "........",
      "........",
      "....oooo",
      "...ouuuu",
      "..ouuuuu",
      "..ouukkk",
      "..oukykk",
      "..ouukkk",
      "...oouuu",
      "..oummuu",
      ".ouummum",
      ".osummuu",
      "..ouuuuu",
      "....ouuo",
      "....ouuo",
      "...ommmo",
    ],
    extras: [
      ...v(14, 7, 11, "C"),
      [14, 6, "o"],
      [14, 12, "h"],
      ...v(1, 7, 11, "C"),
      [1, 6, "o"],
      [1, 12, "h"],
    ],
  },

  barba: {
    m: [
      "........",
      "........",
      "....oooo",
      "...occCC",
      "..occCCC",
      "..oqsssS",
      "..oqskss",
      "..oqqqqq",
      "..oqqqqQ",
      ".oqqqqQQ",
      ".osqqQQQ",
      ".oqmmqqq",
      "..oqqqqq",
      "....ohho",
      "....ohho",
      "...ohhho",
    ],
    extras: [
      ...v(14, 5, 13, "t"),
      [12, 2, "c"],
      [13, 2, "C"],
      [14, 2, "C"],
      [15, 2, "c"],
      [12, 3, "c"],
      [13, 3, "C"],
      [14, 3, "C"],
      [15, 3, "c"],
      [12, 4, "m"],
      [13, 4, "m"],
      [14, 4, "m"],
      [15, 4, "m"],
    ],
  },

  draco: {
    m: [
      "........",
      "..Y.....",
      "..Yoyyyy",
      "..oyyYYY",
      "..oyaaaa",
      "..oykkkk",
      "..oyaaaa",
      "...ooyyy",
      ".orrooyY",
      "orryyYYy",
      "orrayYYa",
      "orrayaaa",
      ".orryyyy",
      "...oyyyo",
      "....oyyo",
      "...ommmo",
    ],
    extras: [
      ...v(14, 2, 11, "C"),
      ...v(15, 2, 11, "m"),
      [14, 1, "o"],
      [15, 1, "o"],
      [13, 12, "y"],
      [14, 12, "y"],
      [15, 12, "y"],
    ],
  },

  /* ---------------- HERÓIS NOVOS ---------------- */
  bruma: {
    m: [
      "........",
      "........",
      "....oooo",
      "...oggGG",
      "..oggGGG",
      "..ogssss",
      "..ogskss",
      "..ogsssS",
      "..ogooos",
      "..oDAAAA",
      ".oDAAAAA",
      ".osGGGGG",
      "..oAAAAD",
      "....oAAo",
      "....oAAo",
      "...ohhho",
    ],
    extras: [
      [4, 1, "l"], [4, 0, "l"], [3, 0, "l"], [5, 0, "l"],
      [11, 1, "l"], [11, 0, "l"], [10, 0, "l"], [12, 0, "l"],
      ...v(14, 3, 14, "t"),
      [13, 0, "g"], [14, 0, "G"], [15, 0, "g"],
      [13, 1, "G"], [14, 1, "w"], [15, 1, "G"],
      [13, 2, "g"], [14, 2, "G"], [15, 2, "g"],
      [14, 11, "s"],
    ],
  },

  kuro: {
    m: [
      ".......o",
      "......ok",
      "....oooo",
      "...okkkk",
      "..okkkkk",
      "..orrrrr",
      "..osskss",
      "..ossssS",
      "...ooosS",
      ".onnbbbn",
      "onnnnbnn",
      "osnrrrrr",
      "onnnnnnn",
      "..onnnnn",
      "..onnbnn",
      "..oooooo",
    ],
    extras: [
      [14, 0, "w"],
      ...v(14, 1, 9, "C"),
      ...v(15, 2, 9, "c"),
      [13, 10, "a"], [14, 10, "a"], [15, 10, "a"],
      ...v(14, 11, 13, "k"),
    ],
  },

  zeph: {
    m: [
      "........",
      "........",
      "....oooo",
      "...oqqqq",
      "..oqqqQQ",
      "..ocIiII",
      "..osskss",
      "..ossssS",
      "...ooosS",
      "..oLLLlL",
      ".oLLLLLl",
      ".osttttt",
      "..oLLLLL",
      "..oLLlLL",
      "....ohho",
      "...ohhho",
    ],
    extras: [
      [13, 5, "i"], [15, 4, "I"], [15, 6, "I"],
      [14, 7, "t"], [14, 8, "C"], [14, 9, "s"],
      [13, 10, "i"], [14, 10, "I"], [15, 10, "i"],
      [13, 11, "i"], [14, 11, "i"], [15, 11, "i"],
      [13, 12, "n"], [14, 12, "n"], [15, 12, "n"],
    ],
  },

  brasa: {
    m: [
      "......Q.",
      "....qQqq",
      "...orrrr",
      "..orrRrR",
      "..orrrrr",
      "..orssss",
      "..orskss",
      "..orsssS",
      "..orroos",
      "..oqqqQQ",
      ".oqqqeqq",
      ".osqqyyy",
      "..oqqqqe",
      "..oqqeqq",
      "..oqqqqq",
      "..oooooo",
    ],
    extras: [
      [14, 5, "q"], [14, 6, "Y"],
      [13, 7, "Q"], [14, 7, "Y"], [15, 7, "Q"],
      [13, 8, "q"], [14, 8, "Q"], [15, 8, "q"],
      [14, 9, "r"],
      [14, 10, "s"],
    ],
  },

  vesper: {
    m: [
      "........",
      "........",
      "....oooo",
      "...ouuuu",
      "..ouuuuu",
      "..ouuLLL",
      "..ouLkkL",
      "..ouLLLl",
      "...ooLkL",
      ".ouuuupu",
      "ouuukuuu",
      "osuuuuGG",
      "ouuukuuu",
      ".ouuuuuu",
      "..ouuuuu",
      "..oo.oo.",
    ],
    extras: [
      [6, 1, "g"], [7, 0, "G"], [8, 0, "G"], [9, 1, "g"],
      ...v(14, 2, 14, "t"),
      [11, 1, "C"], [12, 0, "C"], [13, 0, "C"], [14, 0, "C"],
      [15, 1, "c"], [12, 1, "m"], [13, 1, "m"],
      [14, 11, "L"],
    ],
  },

  /* O padre: bem mais forte que todo mundo (ver script.js) */
  padre: {
    m: [
      "........",
      "........",
      "....oooo",
      "...ohhhh",
      "..ohhhhh",
      "..ohssss",
      "..osskss",
      "..ossssS",
      "...ooosS",
      ".oNNNppL",
      "oNMNNNpy",
      "oNMNNNyy",
      "osNNNNpy",
      "oNNNMNpy",
      "oNNNNNyN",
      ".ooooooo",
    ],
    extras: [
      // auréola
      [5, 0, "y"], [6, 0, "Y"], [7, 0, "Y"], [8, 0, "Y"], [9, 0, "Y"], [10, 0, "y"],
      [4, 1, "y"], [11, 1, "y"],
      // cajado com cruz dourada
      ...v(14, 4, 14, "T"),
      [14, 0, "y"], [14, 1, "Y"], [14, 2, "y"], [14, 3, "y"],
      [13, 1, "y"], [15, 1, "y"],
      [14, 12, "s"],
    ],
  },

  /* ---------------- SEUS SPRITES ----------------
     Cole aqui os sprites feitos à mão. Se o desenho NÃO for simétrico,
     use "f" (16 linhas de 16 letras) em vez de "m" (8 letras, espelhado):
       meuHeroi: { f: ["................", ... 16 linhas ...] },
  */
};

/* ---------- Transforma o desenho em uma grade 16x16 de cores ---------- */
function gradeSprite(def) {
  const grade = [];
  for (let y = 0; y < 16; y++) {
    if (def.f) {
      // desenho completo (16 colunas), sem espelhar
      grade.push((def.f[y] || "").padEnd(16, ".").slice(0, 16).split(""));
    } else {
      const metade = (def.m[y] || "").padEnd(8, ".").slice(0, 8);
      const linha = metade + metade.split("").reverse().join("");
      grade.push(linha.split(""));
    }
  }
  for (const [x, y, c] of def.extras || []) {
    if (x >= 0 && x < 16 && y >= 0 && y < 16) grade[y][x] = c;
  }
  return grade;
}

/* ---------- Desenha um sprite num <canvas> ---------- */
function desenharSprite(canvas, nome) {
  const def = SPRITES[nome];
  if (!def) return;
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 16, 16);
  const grade = gradeSprite(def);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const cor = PALETA[grade[y][x]];
      if (cor) {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

if (typeof module !== "undefined")
  module.exports = { PALETA, SPRITES, gradeSprite };