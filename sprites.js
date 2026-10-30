"use strict";

/* =========================================================
   SPRITES EM PIXEL ART (16 x 16)
   Cada sprite é desenhado só pela METADE ESQUERDA (8 colunas, "m").
   O código espelha para formar os 16 pixels de largura.
   Se o desenho não for simétrico, use "f": 16 linhas x 16 colunas.
   Cada letra é uma cor da PALETA; "." é transparente.
   "extras" são pixels soltos [x, y, cor] (armas, brilhos...)
   "sem_polir: true" desliga o polimento automático (use em desenhos
   feitos à mão que você quer exatamente como desenhou).
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
  // gelo, lava e cristal
  J: "#3b9bd6",
  j: "#1d5f99",
  K: "#3a1612",
  F: "#ff5a1f",
  X: "#ff7be0",
  x: "#b2429e",
  O: "#ff9eb5",
  U: "#e0607f",
  // Cold Bot 1 (cores exatas do desenho do Thalles)
  0: "#000000",
  1: "#065022",
  2: "#f2f2e4",
  3: "#ededda",
  4: "#e3e300",
  5: "#11ad4e",
  6: "#0d1a27",
  7: "#59abfd",
  8: "#4da6ff",
  9: "#e7e7d6",
  z: "#499df1",
  E: "#dbdbca",
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
      "..osssks",
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
      "..orssks",
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
      "..ogssks",
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
      "..oyssks",
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
      "..oqssks",
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
      "..ogssks",
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
      "..osssks",
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
      "..osssks",
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
      "..orssks",
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
      "..osssks",
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

  /* ---------------- MONSTROS NOVOS ---------------- */
  coldbot: { sem_polir: true, f: [
      "................",
      "....0000011.....",
      "...02222001.11..",
      "..0223333041511.",
      ".0223366660541..",
      ".0233677786051..",
      ".03367788886001.",
      ".03967800886300.",
      ".099688008z6330.",
      ".09968888zz63E0.",
      ".0393688zz633E0.",
      ".03993666633EE0.",
      "..039933333EE0..",
      "...03993EEEE0...",
      "....00000000....",
      "................",
    ] },
  cubogelo: { m: [
      "........",
      "........",
      "........",
      "..oooooo",
      ".oIIIIII",
      ".oIwwiii",
      ".oIikkii",
      ".oIikkii",
      ".oIiiiii",
      ".oIiioii",
      ".oIiiioo",
      ".oJiiiii",
      ".oJJJiii",
      ".ojjJJJJ",
      "..oooooo",
      "........",
    ], extras: [[11,5,'i'], [12,5,'i'], [4,6,'w'], [11,6,'w'], [10,3,'I'], [12,12,'j']] },
  amalgama: { m: [
      "........",
      "........",
      "........",
      "..oooooo",
      ".oGGGGGG",
      ".oGkkggg",
      ".ogggkkg",
      ".ogwwkgg",
      ".ogwwkgg",
      ".oggdddd",
      ".oggkkkk",
      ".oggkwkw",
      ".oddgdgd",
      ".odddddd",
      "..oyoyoy",
      "........",
    ], extras: [[0,7,'y'], [15,10,'y'], [0,10,'y'], [12,5,'G'], [12,6,'G'], [12,7,'G'], [12,8,'y'], [3,9,'G'], [4,9,'G'], [3,8,'y'], [5,9,'G'], [9,12,'k'], [10,12,'k'], [11,12,'k'], [12,12,'k'], [9,13,'m'], [10,13,'m'], [11,13,'m'], [12,13,'m'], [3,2,'o'], [4,2,'G'], [3,1,'o'], [12,2,'o'], [11,2,'g'], [12,1,'o']] },
  esqueleto: { m: [
      "........",
      "....oooo",
      "...oLLLL",
      "..oLLllL",
      "..oLccCC",
      "..oLCkkC",
      "..oLCkiC",
      "..oLCCCk",
      "..oLcwkw",
      "..ooLLLL",
      ".onnLLbb",
      "onnbbbbL",
      "onnbbbbL",
      "oNnnbbbL",
      ".onnbbbL",
      "..oooooo",
    ], extras: [[0,11,'C'], [0,12,'c'], [15,11,'C'], [15,12,'c'], [10,1,'c'], [10,0,'i']] },
  yeti: { m: [
      "........",
      "...ooooo",
      "..oLLLLL",
      ".oLLlLLL",
      ".oLLLjjj",
      ".oLLjrrj",
      ".oLLjjjj",
      ".oLLjkkk",
      ".oLLjwkw",
      ".oLLLjjj",
      "oLLLLLLl",
      "oLlLLLLL",
      "oLLLBLLl",
      "oLLLLLLL",
      "oLLLLo..",
      "occcco..",
    ], extras: [[5,4,'k'], [10,4,'k'], [1,1,'L'], [14,2,'l']] },
  ent: { m: [
      "........",
      "........",
      "..oo....",
      ".oGGo...",
      "oGggo...",
      "ooddoooo",
      "..otTTTT",
      "..otTtTT",
      ".otTkkTT",
      ".otTkqTT",
      ".ottTTTT",
      ".otTkkkk",
      ".ottThhh",
      "..ohhttT",
      ".ohhhhhh",
      "..oooooo",
    ], extras: [[6,3,'g'], [9,3,'g'], [7,2,'o'], [8,2,'o'], [3,11,'h'], [12,11,'h'], [4,7,'h'], [11,7,'h']] },
  entboss: { m: [
      "...ooooo",
      "..oGGgGg",
      ".oGgGggd",
      "oGggdGgg",
      "oggGgggd",
      "oddgdddd",
      "..ohhttt",
      ".ohtkkkt",
      ".ohtkYkt",
      ".ohttttt",
      ".ohtkkkk",
      ".ohtwkwk",
      ".ohttttt",
      "..ohhttt",
      ".ohhhhhh",
      "oohhooo.",
    ], extras: [[0,8,'h'], [1,8,'h'], [0,9,'t'], [15,8,'h'], [14,8,'h'], [15,9,'t'], [0,10,'g'], [15,10,'g'], [1,10,'G'], [14,10,'G']] },
  pegrande: { m: [
      "....oooo",
      "...ohhhh",
      "..ohhtth",
      ".ohhtThh",
      ".ohtSsss",
      ".ohtwkss",
      ".ohtsssS",
      ".ohtsssS",
      ".ohtskkk",
      ".ohhttTT",
      "ohhtttTT",
      "ohtThtTt",
      "ohhtttTt",
      "ohtttTtt",
      "ohttho..",
      "ohhhhho.",
    ], extras: [[4,4,'h'], [5,4,'h'], [10,4,'h'], [11,4,'h']] },
  bongclaw: { m: [
      ".o......",
      "oCo.....",
      "oCCo.ooo",
      ".ocCoNNN",
      "..ocNrrN",
      "..ooNrYN",
      "..oNNNNN",
      ".oouuuuk",
      "oumMuuuk",
      "oumuuuuk",
      "ouuuuuuk",
      ".ouuuuuk",
      "..oouuuk",
      "...oouuk",
      "....oooo",
      "........",
    ], extras: [[0,10,'k'], [0,11,'k'], [0,13,'k'], [1,14,'k'], [15,10,'k'], [15,11,'k'], [15,13,'k'], [14,14,'k']] },
  wormz: { f: [
      "................",
      "................",
      "......oooooo....",
      ".....oOOOOOOo...",
      "....orrrrrrrro..",
      "....oOwwOwwOOo..",
      "....oOwkOkwOOo..",
      "....oOOOOOOOOo..",
      "....oOOkOOkOOo..",
      "....oOOOkkOOOo..",
      ".....oUUUUUUo...",
      "....oOOOOOOo....",
      "...oOOOOOOo.....",
      "..oUUUUUUo......",
      "..oOOOOOo.......",
      "...ooooo........",
    ], extras: [[6,3,'R'], [7,3,'R'], [5,4,'R'], [14,4,'r'], [15,5,'r'], [14,5,'e']] },
  crystlixx: { m: [
      "........",
      ".......o",
      "......oX",
      ".....oXX",
      "....oXXw",
      "...oXXwX",
      "..oXXXXX",
      "..oXkkXX",
      "..oXkYXX",
      "..oXXXXX",
      "..oxXXoo",
      "...oxXXX",
      "....oxXX",
      ".....oxx",
      "......ox",
      ".......o",
    ], extras: [[2,11,'o'], [1,12,'o'], [2,12,'X'], [1,13,'x'], [2,13,'o'], [13,11,'o'], [14,12,'o'], [13,12,'X'], [14,13,'x'], [13,13,'o']] },
  almostdude: { f: [
      "................",
      "................",
      "................",
      ".....oooooo.....",
      "...ooCCCCCcoo...",
      "..oCCCCCCCCcco..",
      "..oCmmCCCCmmco..",
      "..oCCwkCCkwCco..",
      "..oCCwkCCkwCco..",
      "..oCCCCCCCCcco..",
      "..oCCCkkkkCcco..",
      "..oCCCkwkwCcco..",
      "...occCCCCcco...",
      "....occmmcco....",
      ".....oooooo.....",
      "................",
    ], extras: [[0,9,'o'], [1,9,'o'], [2,9,'o'], [3,9,'o'], [4,9,'o'], [0,10,'o'], [1,10,'C'], [2,10,'C'], [3,10,'c'], [4,10,'o'], [0,11,'o'], [1,11,'C'], [2,11,'c'], [3,11,'m'], [4,11,'o'], [0,12,'o'], [1,12,'c'], [2,12,'c'], [3,12,'m'], [4,12,'o'], [0,13,'o'], [1,13,'o'], [2,13,'o'], [3,13,'o'], [4,13,'o'], [15,9,'o'], [14,9,'o'], [13,9,'o'], [12,9,'o'], [11,9,'o'], [15,10,'o'], [14,10,'C'], [13,10,'C'], [12,10,'c'], [11,10,'o'], [15,11,'o'], [14,11,'C'], [13,11,'c'], [12,11,'m'], [11,11,'o'], [15,12,'o'], [14,12,'c'], [13,12,'c'], [12,12,'m'], [11,12,'o'], [15,13,'o'], [14,13,'o'], [13,13,'o'], [12,13,'o'], [11,13,'o'], [5,5,'w'], [4,6,'C']] },
  cocroatchi: { m: [
      "....oooo",
      "...oyYYY",
      "...orrrr",
      "oyyyyyyy",
      ".ooaaaaa",
      "...ottTT",
      "..otwkTT",
      "..otTTTT",
      "..otkkkk",
      "..ottTTT",
      ".orrRrRr",
      ".oyyyyyy",
      ".orrRrrr",
      "..oorrrr",
      "..ohoohh",
      "..oo.ooo",
    ], extras: [[3,9,'k'], [12,9,'k'], [0,10,'G'], [1,10,'g'], [0,11,'g'], [1,11,'d'], [1,12,'t'], [14,10,'R'], [15,10,'r'], [14,11,'r'], [15,11,'e'], [14,12,'t'], [3,2,'h'], [2,1,'h'], [1,0,'h'], [12,2,'h'], [13,1,'h'], [14,0,'h'], [0,0,'T'], [15,0,'T'], [1,14,'h'], [0,13,'h'], [14,14,'h'], [15,13,'h']] },
  dynaboom: { m: [
      ".......Y",
      "..oooook",
      "..oeeoee",
      "..oRroRr",
      "..oRroRr",
      "..oooooo",
      ".occccCC",
      "ohtTTtTt",
      "occcCCCC",
      "ohtwwkTt",
      "ohtwwkTt",
      "ohtTkkkk",
      "ohtTwkwk",
      "occcCCCC",
      ".ohhhhhh",
      "..oooooo",
    ] },
  firepit: { m: [
      "........",
      "........",
      "...oK.oK",
      "..oKKoKK",
      ".oKFKKKF",
      ".oKKFqqq",
      ".oqqQQQQ",
      ".oqQkwQQ",
      ".oqQkkQQ",
      ".oqQQQQQ",
      ".oqkkkkk",
      "oqqeqQqq",
      "oqqqeeqq",
      "oeqqqqqe",
      ".oeeeeee",
      "..oooooo",
    ] },
  foguinhumm: { m: [
      ".......o",
      "......oq",
      ".....oqq",
      "....oqqQ",
      "...oqqQQ",
      "..oqqQQY",
      "..oqQYYY",
      ".oqqQYYY",
      ".oqQkwYY",
      ".oqQkkYY",
      ".oqQQYYY",
      ".oqqQYkk",
      ".oqqqQYY",
      "..oqqqQQ",
      "...oqqqq",
      "....oooo",
    ], extras: [[8,0,'o'], [9,1,'o'], [9,2,'q']] },
  lavabee: { m: [
      "..o.....",
      "...o....",
      "....oooo",
      "....oqqq",
      "...oqkYq",
      "...oqkkq",
      "...oqqqk",
      "..oFFFFF",
      "..oKKKKK",
      "..oqqqqq",
      "..oKKKKK",
      "..oqqqQQ",
      "...oKKKK",
      "....oqqq",
      "......ok",
      "........",
    ], extras: [[1,4,'Y'], [0,5,'Y'], [1,5,'I'], [2,5,'Y'], [0,6,'Q'], [1,6,'Y'], [2,6,'I'], [1,7,'Q'], [14,4,'Y'], [15,5,'Y'], [14,5,'I'], [13,5,'Y'], [15,6,'Q'], [14,6,'Y'], [13,6,'I'], [14,7,'Q'], [13,0,'o'], [12,1,'o']] },
  magmahound: { m: [
      ".oF.....",
      ".oKo.ooo",
      ".oKooKKK",
      "oqoKKKKK",
      "oQqKYYKK",
      "oqqKFFKK",
      ".oqKKKKK",
      ".oqKKKFK",
      ".oqKkkkk",
      ".oqKwkwk",
      ".oqqKKKK",
      "oqqKKFKK",
      "oqKKKKFK",
      "oqKKFKKK",
      ".oKKKo..",
      ".ooooo..",
    ], extras: [[0,5,'q'], [0,6,'Q'], [0,7,'Y'], [0,9,'q'], [15,5,'q'], [15,6,'Q'], [15,7,'Y'], [15,9,'q']] },

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

/* ---------- Polimento automático ----------
   1) contorno seletivo: o contorno escuro ganha um pouco da cor do que ele
      cerca, em vez de ser sempre o mesmo roxo;
   2) luz vinda de cima/esquerda: bordas de cima ficam mais claras e bordas
      de baixo mais escuras, dando volume. */
const hexParaRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const misturar = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

function polirGrade(grade, opc) {
  const { contorno = 0.3, luz = 0.1, sombra = 0.1 } = opc || {};
  const rgb = grade.map((r) => r.map((c) => (PALETA[c] ? hexParaRgb(PALETA[c]) : null)));
  const eContorno = (x, y) =>
    x >= 0 && y >= 0 && x < 16 && y < 16 && (grade[y][x] === "o" || grade[y][x] === "k");
  const vazio = (x, y) => x < 0 || y < 0 || x >= 16 || y >= 16 || !rgb[y][x];
  const out = rgb.map((r) => r.slice());
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const base = rgb[y][x];
      if (!base) continue;
      if (eContorno(x, y)) {
        const viz = [];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (!vazio(nx, ny) && !eContorno(nx, ny)) viz.push(rgb[ny][nx]);
        }
        if (viz.length) {
          const med = [0, 1, 2].map((k) => Math.round(viz.reduce((t, c) => t + c[k], 0) / viz.length));
          out[y][x] = misturar(base, misturar(med, [10, 6, 24], 0.62), contorno);
        }
      } else {
        const cima = vazio(x, y - 1) || eContorno(x, y - 1);
        const esq = vazio(x - 1, y) || eContorno(x - 1, y);
        const baixo = vazio(x, y + 1) || eContorno(x, y + 1);
        const dir = vazio(x + 1, y) || eContorno(x + 1, y);
        let c = base;
        if (cima) c = misturar(c, [255, 255, 255], luz);
        else if (esq) c = misturar(c, [255, 255, 255], luz * 0.5);
        if (baixo) c = misturar(c, [0, 0, 20], sombra);
        else if (dir) c = misturar(c, [0, 0, 20], sombra * 0.5);
        out[y][x] = c;
      }
    }
  }
  return out;
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
  const cores = def.sem_polir
    ? grade.map((r) => r.map((c) => (PALETA[c] ? hexParaRgb(PALETA[c]) : null)))
    : polirGrade(grade);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const c = cores[y][x];
      if (c) {
        ctx.fillStyle = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

/* ---------- Ícones 8x8 (árvore de talentos) ---------- */
const ICONES = {
  fist: [".oooooo.", "osssssso", "osSsSsSo", "osssssso", "osssssso", ".ossssoo", "..osso..", "..oooo.."],
  eye: ["........", "..oooo..", ".owwwwo.", "owwbbwwo", "owbkkbwo", ".owbbwo.", "..oooo..", "........"],
  star: ["...yy...", "...yy...", ".yyyyyy.", "yyyYYyyy", ".yyYYyy.", "..yyyy..", ".yy..yy.", ".y....y."],
  gem: ["........", "..oooo..", ".oIBBBo.", "oIBBBBBo", ".oBBBnno", "..oBnno.", "...oo...", "........"],
  ghost: ["..oooo..", ".oIIIIo.", "oIkIIkIo", "oIIIIIIo", "oIIooIIo", "oIIIIIIo", "oIoIIoIo", ".o.oo.o."],
  sword: [".....ooo", "....oCCo", "...oCCo.", "o.oCCo..", "yooCo...", ".yyo....", "tyyo....", "o..o...."],
  tag: ["..oooo..", ".oCCCCo.", "oCwooCCo", "oCCooCCo", "oCCCCCCo", ".oCyyCo.", "..oCCo..", "...oo..."],
  heads: [".oo..oo.", "ossoosso", "oskoosko", "ossoosso", ".oo..oo.", "ogggoggg", "ogggoggg", "oooooooo"],
  crown: ["........", "y..y..y.", "yy.yy.yy", "yyyyyyyy", "yYyyyYyy", "yyyyyyyy", "oaaaaaao", ".oooooo."],
  banner: ["ot......", "otrrrrro", "otrYYrro", "otrrrrro", "otrrrro.", "ot.rro..", "ot..o...", "ot......"],
  bag: ["..oooo..", "...oo...", "..oyyo..", ".oyyyyo.", "oyyaayyo", "oyyyayyo", ".oyyyyo.", "..oooo.."],
  chest: ["........", ".oooooo.", "ottTTttT", "oyyyyyyo", "ottttytt", "ottttyto", "ohhhhhho", ".oooooo."],
  chestgold: [".yY.yY..", ".oooooo.", "oyYyYyyo", "oyyyyyyo", "ottTTttt", "ottyytto", "ohhhhhho", ".oooooo."],
  skull: ["..oooo..", ".oLLLLo.", "oLLLLLLo", "oLkLLkLo", "oLkLLkLo", ".oLLLLo.", ".oLwLwo.", "..oooo.."],
  clock: ["..oooo..", ".oLLLLo.", "oLLLkLLo", "oLLLkLLo", "oLLLkkLo", "oLLLLLLo", ".oLLLLo.", "..oooo.."],
  hourglass: ["oooooooo", ".oBBBBo.", "..oBBo..", "...oo...", "...oo...", "..oyyo..", ".oyyyyo.", "oooooooo"],
  coin: ["..oooo..", ".oYYyyo.", "oYyyaayo", "oyyaYyyo", "oyyaYyyo", "oyyaayyo", ".oyyyao.", "..oooo.."],
  bolt: ["...oyyo.", "..oyYo..", ".oyYo...", "oyyyyyyo", "..oyYyo.", "..oyo...", ".oyo....", ".oo....."],
  flame: ["...oo...", "..oqqo..", "..oqQqo.", ".oqQYqo.", ".oqQYqqo", "oqqQYqqo", "oqqQQqqo", ".oooooo."],
  clover: ["..oo.oo.", ".ogGogGo", ".ogGGgGo", "..oggoo.", ".oggGgo.", "ogGgogGo", ".oo.oo.t", ".....tt."],
};

function desenharIcone(canvas, nome) {
  const rows = ICONES[nome];
  if (!rows) return;
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 8, 8);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const cor = PALETA[rows[y][x]];
      if (cor) {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

if (typeof module !== "undefined")
module.exports = { PALETA, SPRITES, ICONES, gradeSprite, polirGrade };