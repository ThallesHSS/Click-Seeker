"use strict";

/* =========================================================
   CLICK SEEKER HERÓIS — versão estilo Clicker Heroes
   Os números do jogo ficam nas listas abaixo (biomas, herois,
   habilidades). Mudar valores aqui muda o jogo inteiro.
   Os sprites ficam em sprites.js.
   ========================================================= */

const CHAVE_SAVE = "click-seeker-herois-save";
const VERSAO_SAVE = 11; // estações visuais, receitas e equipamentos funcionais

/* ---------- Balanceamento (mexa aqui para ajustar a dificuldade) ----------
   (são "let" de propósito: a conta dev ajusta tudo isso ao vivo no painel Dev)

   Ritmo de referência (jogador ativo, ~3 cliques/s, usando habilidades e
   gastando os pontos de talento): zona 10 em ~5 min · zona 30 em ~45 min ·
   zona 50 em ~3 h · zona 75 em ~12 h · zona 90 em ~2 dias.
   Sem investir na árvore de talentos o jogo fica bem mais lento: é ela que
   compensa o dano e o ouro mais baixos. A "parede" fica depois da zona ~100,
   deixando espaço para sistemas futuros (ascensão, relíquias, mais heróis...). */
let MONSTROS_POR_ZONA = 10; // abates para passar de zona
let TEMPO_CHEFE = 30; // segundos para vencer um chefe
let VIDA_CHEFE = 10; // chefe tem 10x a vida de um monstro comum
let CRESC_VIDA = 1.37; // a vida dos monstros cresce 37% por zona
let OURO_DIV = 86; // ouro por abate = vida / OURO_DIV (mínimo 1)
let CHANCE_BAU = 0.04; // chance de um monstro ser um baú (ouro x10)
let CHANCE_CRITICO = 0.08; // chance de clique crítico (x5)
let CRESCIMENTO_CUSTO = 1.065; // cada nível de herói custa 6,5% a mais

/* ---------- Mundos (mudam a cada 10 zonas) ---------- */
const biomas = [
  {
    nome: "Floresta",
    id: "floresta", // liga com :root[data-bioma] no style.css
    monstros: ["slime", "goblin", "cogumelo", "ent", "bongclaw", "wormz"],
    chefes: [
      { sprite: "pegrande", nome: "Pé Grande" },
      { sprite: "entboss", nome: "ENT" },
    ],
    ceu: ["#5db8ff", "#8fd0ff", "#c2e8ff"],
    nuvem: "#ffffff",
    morro2: "#4c9e6a",
    morro: "#2f7f4a",
    chao: "#4aa35a",
    chao2: "#3b8a49",
    detalhe: "#6fcf7c",
  },
  {
    nome: "Caverna",
    id: "caverna", // liga com :root[data-bioma] no style.css
    monstros: ["morcego", "fantasma", "crystlixx", "almostdude", "cocroatchi"],
    chefes: [
      { sprite: "ogro", nome: "Ogro Rei" },
      { sprite: "dynaboom", nome: "DynaBoom" },
    ],
    ceu: ["#1a1330", "#241a45", "#31245a"],
    estrela: "#7fe3ff",
    morro2: "#3b2f63",
    morro: "#2a2150",
    chao: "#4a3d7a",
    chao2: "#3a2f66",
    detalhe: "#7a6ad0",
  },
  {
    nome: "Deserto",
    id: "deserto", // liga com :root[data-bioma] no style.css
    monstros: ["golem", "cogumelo", "goblin"],
    chefes: [
      { sprite: "ogro", nome: "Ogro das Dunas" },
      { sprite: "dragao", nome: "Dragão Vermelho" },
    ],
    ceu: ["#ff9f5a", "#ffc27d", "#ffe0a8"],
    nuvem: "#fff1d6",
    morro2: "#e0a455",
    morro: "#cf8f42",
    chao: "#e8bb6a",
    chao2: "#d9a757",
    detalhe: "#f6d58f",
  },
  {
    nome: "Geleira",
    id: "geleira", // liga com :root[data-bioma] no style.css
    monstros: ["coldbot", "amalgama", "cubogelo", "esqueleto", "fantasma"],
    chefes: [
      { sprite: "yeti", nome: "Yeti" },
      { sprite: "yeti", nome: "Yeti Ancião" },
    ],
    ceu: ["#86bfff", "#aed6ff", "#d9eeff"],
    nuvem: "#ffffff",
    morro2: "#cfe8f7",
    morro: "#a9d4ee",
    chao: "#eaf7ff",
    chao2: "#cfe6f5",
    detalhe: "#ffffff",
  },
  {
    nome: "Vulcão",
    id: "vulcao", // liga com :root[data-bioma] no style.css
    monstros: ["firepit", "foguinhumm", "lavabee", "morcego", "golem"],
    chefes: [
      { sprite: "dragao", nome: "Dragão Magmático" },
      { sprite: "magmahound", nome: "MagmaHound" },
    ],
    ceu: ["#220c10", "#431616", "#7a2a18"],
    estrela: "#ff8a3d",
    morro2: "#4b1c1a",
    morro: "#341312",
    chao: "#3a1614",
    chao2: "#2b0f0e",
    detalhe: "#ff6a2b",
  },
];

const afinidadesMonstro = {
  fantasma: ["morto-vivo"],
  esqueleto: ["morto-vivo"],
  firepit: ["fogo-lava"],
  foguinhumm: ["fogo-lava"],
  lavabee: ["fogo-lava"],
  dragao: ["fogo-lava"],
  magmahound: ["fogo-lava"],
};

const nomesMonstro = {
  slime: "Gosma",
  morcego: "Morcego",
  goblin: "Goblin",
  cogumelo: "Cogumelo",
  fantasma: "Fantasma",
  golem: "Golem",
  bau: "Baú do Tesouro",
  // gelo
  coldbot: "Cold Bot 1",
  amalgama: "Amálgama de Eletrônicos",
  cubogelo: "Cubo de Gelo",
  esqueleto: "Esqueleto Esquimó Androide",
  // floresta
  ent: "Ent",
  bongclaw: "BongClaw",
  wormz: "Wormz",
  // caverna
  crystlixx: "Crystlixx",
  almostdude: "Almostdude",
  cocroatchi: "Cocroatchi",
  // vulcão
  firepit: "FirePit",
  foguinhumm: "Foguinhumm",
  lavabee: "LavaBee",
};

/* Como adicionar monstros: sprite em sprites.js, nome aqui em cima e o id do
   sprite em "monstros" do bioma. Chefes ficam em "chefes" do bioma: o primeiro
   aparece nas zonas 5, 15, 25... e o segundo nas zonas 10, 20, 30... */

/* ---------- Heróis ----------
   tipo "clique": soma dano em cada clique
   tipo "dps": ataca sozinho 1 vez por segundo
   base = custo do nível 1; forca = dano por nível */
const herois = [
  // cresc = crescimento de custo próprio (padrão: CRESCIMENTO_CUSTO).
  // Heróis novos entram no fim da lista: o jogo mostra só os contratados
  // e a silhueta do próximo. Mantenha o custo (base) crescendo ~3-4x por herói.
  {
    id: "pip",
    nome: "Pip, o Aprendiz",
    tipo: "clique",
    base: 5,
    forca: 1,
    cresc: 1.12,
    sprite: "pip",
  },
  {
    id: "tora",
    nome: "Tora, a Guerreira",
    tipo: "dps",
    base: 100,
    forca: 4.7,
    sprite: "tora",
  },
  {
    id: "mira",
    nome: "Mira, a Arqueira",
    tipo: "dps",
    base: 260,
    forca: 9.8,
    sprite: "mira",
  },
  {
    id: "gandor",
    nome: "Gandor, o Mago",
    tipo: "dps",
    base: 700,
    forca: 21,
    sprite: "gandor",
  },
  {
    id: "luna",
    nome: "Luna, a Clériga",
    tipo: "dps",
    base: 1800,
    forca: 44,
    sprite: "luna",
  },
  {
    id: "sombra",
    nome: "Sombra, a Ladina",
    tipo: "dps",
    base: 4900,
    forca: 93,
    sprite: "sombra",
  },
  {
    id: "barba",
    nome: "Barba-Ruiva, o Anão",
    tipo: "dps",
    base: 13000,
    forca: 200,
    sprite: "barba",
  },
  {
    id: "draco",
    nome: "Draco, o Cavaleiro",
    tipo: "dps",
    base: 34000,
    forca: 410,
    sprite: "draco",
  },
  {
    id: "bruma",
    nome: "Bruma, a Druida",
    tipo: "dps",
    base: 89000,
    forca: 870,
    sprite: "bruma",
  },
  {
    id: "kuro",
    nome: "Kuro, o Samurai",
    tipo: "dps",
    base: 240000,
    forca: 1800,
    sprite: "kuro",
  },
  {
    id: "zeph",
    nome: "Zeph, o Alquimista",
    tipo: "dps",
    base: 620000,
    forca: 3900,
    sprite: "zeph",
  },
  {
    id: "brasa",
    nome: "Brasa, a Piromante",
    tipo: "dps",
    base: 1600000,
    forca: 8200,
    sprite: "brasa",
  },
  {
    id: "vesper",
    nome: "Vesper, a Necromante",
    tipo: "dps",
    base: 4300000,
    forca: 17000,
    sprite: "vesper",
  },
  {
    id: "padre",
    nome: "Padre Thalles, o Exorcista",
    tipo: "dps",
    base: 11000000,
    forca: 170000,
    sprite: "padre",
  },
  {
    id: "pedrinhoo07140",
    nome: "pedrinhoo07140, o Arauto Abissal",
    tipo: "dps",
    base: 11000000,
    forca: 170000,
    sprite: "pedro",
  },
  // ---- Pack novo: continua a mesma curva de preço e dano dos heróis acima. ----
  // O último (o mais forte de todos) custa ~2,6x o anterior e rende ~10x mais dano por nível.
  {
    id: "kobi",
    nome: "Kobi, o Gato Ninja",
    tipo: "dps",
    base: 30000000,
    forca: 77000,
    sprite: "kobi",
  },
  {
    id: "antao",
    nome: "Antão, o Eremita",
    tipo: "dps",
    base: 80000000,
    forca: 160000,
    sprite: "antao",
  },
  {
    id: "chico",
    nome: "Chico, o Pobrezinho",
    tipo: "dps",
    base: 210000000,
    forca: 350000,
    sprite: "chico",
  },
  {
    id: "ossinho",
    nome: "Ossinho, o Cozinheiro",
    tipo: "dps",
    base: 560000000,
    forca: 730000,
    sprite: "ossinho",
  },
  {
    id: "tere",
    nome: "Terê, a Florzinha",
    tipo: "dps",
    base: 1500000000,
    forca: 1500000,
    sprite: "tere",
  },
  {
    id: "bento",
    nome: "Bento, o do Corvo",
    tipo: "dps",
    base: 3900000000,
    forca: 3300000,
    sprite: "bento",
  },
  {
    id: "pio",
    nome: "Pio, o Frade das Luvas",
    tipo: "dps",
    base: 10000000000,
    forca: 6900000,
    sprite: "pio",
  },
  {
    id: "paulo",
    nome: "Paulo, o Memorial da Cruz",
    tipo: "dps",
    base: 27000000000,
    forca: 15000000,
    sprite: "paulo",
  },
  {
    id: "tictac",
    nome: "Tic-Tac, o Relojoeiro",
    tipo: "dps",
    base: 71000000000,
    forca: 31000000,
    sprite: "tictac",
  },
  {
    id: "aurelio",
    nome: "Aurélio, o Coração Inquieto",
    tipo: "dps",
    base: 190000000000,
    forca: 65000000,
    sprite: "aurelio",
  },
  {
    id: "jeronimo",
    nome: "Jerônimo, o Leão do Livro",
    tipo: "dps",
    base: 500000000000,
    forca: 140000000,
    sprite: "jeronimo",
  },
  {
    id: "tomas",
    nome: "Tomás, o Boi Mudo",
    tipo: "dps",
    base: 1300000000000,
    forca: 290000000,
    sprite: "tomas",
  },
  {
    id: "cefas",
    nome: "Cefas, o Pescador",
    tipo: "dps",
    base: 3500000000000,
    forca: 610000000,
    sprite: "cefas",
  },
  {
    id: "teoforo",
    nome: "Teóforo, o Trigo dos Leões",
    tipo: "dps",
    base: 9200000000000,
    forca: 1300000000,
    sprite: "teoforo",
  },
  {
    id: "jose",
    nome: "יוֹסֵף, אֲבִי הָאַהֲבָה",
    tipo: "dps",
    base: 24000000000000,
    forca: 14000000000,
    sprite: "jose",
  },
];

// Cada personagem tem uma família de arma própria. Um item só pode ser
// equipado se o tipo da receita corresponder ao estilo daquele herói.
const TIPO_ARMA_HEROI = {
  pip: "cajado",
  tora: "espada",
  mira: "arco",
  gandor: "cajado",
  luna: "cajado",
  sombra: "adagas",
  barba: "machado",
  draco: "espada",
  bruma: "cajado",
  kuro: "espada",
  zeph: "cajado",
  brasa: "cajado",
  vesper: "cajado",
  padre: "cajado",
  pedrinhoo07140: "cajado",
  kobi: "adagas",
  antao: "cajado",
  chico: "cajado",
  ossinho: "machado",
  tere: "cajado",
  bento: "arco",
  pio: "punhos",
  paulo: "cajado",
  tictac: "grimorio",
  aurelio: "espada",
  jeronimo: "grimorio",
  tomas: "punhos",
  cefas: "arco",
  teoforo: "cajado",
  jose: "cajado",
};
const NOME_TIPO_ARMA = {
  espada: "Espada", machado: "Machado", arco: "Arco", cajado: "Cajado",
  adagas: "Adagas", punhos: "Armas de punho", grimorio: "Grimório",
};

// Marcos clássicos até o nível 1500. Depois deles, dano e custo continuam
// crescendo em uma curva suave, evitando que Math.pow(1.065, nível) estoure.
const NIVEL_MARCOS_BASE = 1500;
const ESCALA_PROGRESSAO_POS_MARCOS = NIVEL_MARCOS_BASE;
const marcos = [
  { nivel: 10, f: 2 },
  { nivel: 25, f: 2 },
];
for (let n = 50; n <= NIVEL_MARCOS_BASE; n += 25)
  marcos.push({ nivel: n, f: n % 100 === 0 ? 8 : 2 });

/* ---------- Habilidades ativas ---------- */
const habilidades = [
  {
    id: "raio",
    nome: "Raio",
    icone: "bolt", // mesmo ícone pixel art usado no tutorial
    tecla: "1",
    cd: 20,
    dur: 0,
    dica: () => "Dano enorme no monstro",
  },
  {
    id: "furia",
    nome: "Fúria",
    icone: "flame", // mesmo ícone pixel art usado no tutorial
    tecla: "2",
    cd: 45,
    dur: 15,
    dica: () => "Cliques valem x" + multFuria() + " por " + durHab(habilidades[1]) + " s",
  },
  {
    id: "sorte",
    nome: "Sorte",
    icone: "clover", // mesmo ícone pixel art usado no tutorial
    tecla: "3",
    cd: 60,
    dur: 20,
    dica: () => "Ouro x" + multSorte() + " por " + durHab(habilidades[2]) + " s",
  },
];

/* ---------- Árvore de Talentos ----------
   Cada nó: id, ramo, nome, desc (usa {v} para o valor por nível), max (níveis),
   custo (pontos por nível), req (id do nó anterior), pos [coluna, linha],
   icone (ver ICONES em sprites.js) e efeito: { chave: valorPorNivel }.
   Os efeitos somam por nível e são lidos em bonusArvore().
   Para criar um talento novo: acrescente um nó aqui e use o efeito em
   bonusArvore() / nas contas do jogo. */
const RAMOS = [
  { id: "punho", nome: "Punho", cor: "#ff8a3d", dica: "Cliques e críticos" },
  { id: "grupo", nome: "Grupo", cor: "#4a9cff", dica: "Dano e custo dos heróis" },
  { id: "fortuna", nome: "Fortuna", cor: "#ffcf4a", dica: "Ouro, baús e chefes" },
  { id: "mestria", nome: "Mestria", cor: "#b07cff", dica: "Habilidades ativas" },
  { id: "purificacao", nome: "Purification Flames", cor: "#ff9b43", dica: "Passiva do Padre Thalles · requer contratação", heroi: "padre" },
  { id: "abissal", nome: "Abyss Flame", cor: "#a879ff", dica: "Passiva de pedrinhoo07140 · requer contratação", heroi: "pedrinhoo07140" },
];

const talentos = [
  // ---- Punho ----
  { id: "punho1", ramo: "punho", nome: "Punhos de Ferro", desc: "+{v}% de dano por clique", max: 5, custo: 1, req: null, pos: [1, 0], icone: "fist", efeito: { clique: 12 } },
  { id: "punho2", ramo: "punho", nome: "Olho de Águia", desc: "+{v}% de chance de crítico", max: 5, custo: 1, req: "punho1", pos: [0, 1], icone: "eye", efeito: { crit: 2 } },
  { id: "punho3", ramo: "punho", nome: "Golpe Mortal", desc: "Crítico causa +{v} de multiplicador", max: 3, custo: 2, req: "punho2", pos: [0, 2], icone: "star", efeito: { critMult: 1 } },
  { id: "punho4", ramo: "punho", nome: "Sincronia", desc: "Cada clique soma +{v}% do dano por segundo", max: 5, custo: 2, req: "punho1", pos: [2, 1], icone: "gem", efeito: { sincronia: 1 } },
  { id: "punho5", ramo: "punho", nome: "Mão Fantasma", desc: "+{v}% de dano por clique", max: 1, custo: 5, req: "punho4", pos: [2, 2], icone: "ghost", efeito: { clique: 100 } },
  // ---- Grupo ----
  { id: "grupo1", ramo: "grupo", nome: "Treinamento", desc: "+{v}% de dano dos heróis", max: 5, custo: 1, req: null, pos: [1, 0], icone: "sword", efeito: { dps: 10 } },
  { id: "grupo2", ramo: "grupo", nome: "Barganha", desc: "-{v}% no custo dos heróis", max: 5, custo: 1, req: "grupo1", pos: [0, 1], icone: "tag", efeito: { desconto: 2 } },
  { id: "grupo3", ramo: "grupo", nome: "Espírito de Equipe", desc: "+{v}% de dano dos heróis por herói contratado", max: 3, custo: 2, req: "grupo1", pos: [2, 1], icone: "heads", efeito: { equipe: 1 } },
  { id: "grupo4", ramo: "grupo", nome: "Liderança", desc: "O herói mais forte causa +{v}% de dano", max: 3, custo: 2, req: "grupo3", pos: [2, 2], icone: "crown", efeito: { lider: 25 } },
  { id: "grupo5", ramo: "grupo", nome: "Comando Supremo", desc: "+{v}% de dano dos heróis", max: 1, custo: 5, req: "grupo4", pos: [2, 3], icone: "banner", efeito: { dps: 60 } },
  // ---- Fortuna ----
  { id: "fort1", ramo: "fortuna", nome: "Ganância", desc: "+{v}% de ouro", max: 5, custo: 1, req: null, pos: [1, 0], icone: "bag", efeito: { ouro: 10 } },
  { id: "fort2", ramo: "fortuna", nome: "Faro de Tesouro", desc: "+{v}% de chance de baú", max: 5, custo: 1, req: "fort1", pos: [0, 1], icone: "chest", efeito: { bau: 2 } },
  { id: "fort3", ramo: "fortuna", nome: "Baú Recheado", desc: "Baús dão +{v} de multiplicador de ouro", max: 3, custo: 2, req: "fort2", pos: [0, 2], icone: "chestgold", efeito: { bauMult: 3 } },
  { id: "fort4", ramo: "fortuna", nome: "Caçador de Recompensas", desc: "Chefes dão +{v}% de ouro", max: 3, custo: 2, req: "fort1", pos: [2, 1], icone: "skull", efeito: { chefeOuro: 30 } },
  { id: "fort5", ramo: "fortuna", nome: "Contagem de Tempo", desc: "+{v} s para vencer chefes", max: 3, custo: 2, req: "fort4", pos: [2, 2], icone: "clock", efeito: { chefeTempo: 5 } },
  { id: "fort6", ramo: "fortuna", nome: "Toque de Midas", desc: "+{v}% de ouro", max: 1, custo: 5, req: "fort3", pos: [0, 3], icone: "coin", efeito: { ouro: 75 } },
  // ---- Mestria ----
  { id: "mest1", ramo: "mestria", nome: "Recarga Rápida", desc: "-{v}% na recarga das habilidades", max: 5, custo: 1, req: null, pos: [1, 0], icone: "hourglass", efeito: { recarga: 5 } },
  { id: "mest2", ramo: "mestria", nome: "Raio Potente", desc: "+{v}% de dano do Raio", max: 5, custo: 1, req: "mest1", pos: [0, 1], icone: "bolt", efeito: { raio: 25 } },
  { id: "mest3", ramo: "mestria", nome: "Fúria Duradoura", desc: "+{v} s de duração da Fúria", max: 3, custo: 2, req: "mest1", pos: [1, 1], icone: "flame", efeito: { furiaDur: 3 } },
  { id: "mest4", ramo: "mestria", nome: "Sorte Duradoura", desc: "+{v} s de duração da Sorte", max: 3, custo: 2, req: "mest1", pos: [2, 1], icone: "clover", efeito: { sorteDur: 4 } },
  { id: "mest5", ramo: "mestria", nome: "Maestria", desc: "+{v} no multiplicador da Fúria e +{v2} no da Sorte", max: 1, custo: 5, req: "mest3", pos: [1, 2], icone: "star", efeito: { furiaMult: 2, sorteMult: 1 } },
  // ---- Padre Thalles: Purification Flames ----
  { id: "pur1", ramo: "purificacao", nome: "Purification Flames", desc: "Desbloqueia a passiva: {v}% de chance de aplicar chamas purificadoras", max: 1, custo: 2, req: null, heroi: "padre", pos: [1, 0], icone: "holyflame", efeito: { purAtiva: 8 } },
  { id: "pur2", ramo: "purificacao", nome: "Fogo Consagrado", desc: "+{v}% de dano das chamas", max: 5, custo: 1, req: "pur1", heroi: "padre", pos: [0, 1], icone: "flame", efeito: { purDano: 20 } },
  { id: "pur3", ramo: "purificacao", nome: "Brasa Persistente", desc: "- {v}% de tempo de recarga da passiva", max: 5, custo: 1, req: "pur1", heroi: "padre", pos: [1, 1], icone: "hourglass", efeito: { purRecarga: 10 } },
  { id: "pur4", ramo: "purificacao", nome: "Chama Duradoura", desc: "+{v} s de duração das chamas", max: 5, custo: 1, req: "pur1", heroi: "padre", pos: [2, 1], icone: "clock", efeito: { purDuracao: 0.5 } },
  // ---- Pedro: Abyss Flame ----
  { id: "aby1", ramo: "abissal", nome: "Abyss Flame", desc: "Desbloqueia a passiva: {v}% de chance de aplicar chamas abissais", max: 1, custo: 2, req: null, heroi: "pedrinhoo07140", pos: [1, 0], icone: "abyss", efeito: { abyAtiva: 8 } },
  { id: "aby2", ramo: "abissal", nome: "Fogo do Vazio", desc: "+{v}% de dano das chamas", max: 5, custo: 1, req: "aby1", heroi: "pedrinhoo07140", pos: [0, 1], icone: "abyss", efeito: { abyDano: 20 } },
  { id: "aby3", ramo: "abissal", nome: "Vórtice Abissal", desc: "- {v}% de tempo de recarga da passiva", max: 5, custo: 1, req: "aby1", heroi: "pedrinhoo07140", pos: [1, 1], icone: "hourglass", efeito: { abyRecarga: 10 } },
  { id: "aby4", ramo: "abissal", nome: "Eco do Abismo", desc: "+{v} s de duração das chamas", max: 5, custo: 1, req: "aby1", heroi: "pedrinhoo07140", pos: [2, 1], icone: "clock", efeito: { abyDuracao: 0.5 } },
];

const talentoPorId = (id) => talentos.find((t) => t.id === id);

// Soma o efeito de todos os talentos comprados. ranks = { id: nível }
function bonusArvore(ranks) {
  const b = {
    clique: 0, dps: 0, ouro: 0, crit: 0, critMult: 0, sincronia: 0, desconto: 0,
    equipe: 0, lider: 0, bau: 0, bauMult: 0, chefeOuro: 0, chefeTempo: 0,
    recarga: 0, raio: 0, furiaDur: 0, sorteDur: 0, furiaMult: 0, sorteMult: 0,
    purAtiva: 0, purDano: 0, purRecarga: 0, purDuracao: 0,
    abyAtiva: 0, abyDano: 0, abyRecarga: 0, abyDuracao: 0,
  };
  for (const t of talentos) {
    const n = (ranks && ranks[t.id]) || 0;
    if (n <= 0) continue;
    for (const k in t.efeito) b[k] += t.efeito[k] * n;
  }
  return b;
}

// Pontos de talento: 1 por chefe vencido; chefes das zonas 25, 50, 75... dão 2 extras
const pontosDoChefe = (z) => 1 + (z % 25 === 0 ? 2 : 0);

let B = bonusArvore({}); // bônus atuais da árvore (recalculado ao mexer nos talentos)

/* =========================================================
   Economia: materiais e recursos
   =========================================================
   O inventário é extensível: materiais, estruturas e equipamentos já funcionam;
   consumíveis e projetos podem ser ampliados nas próximas etapas.
   As taxas ficam centralizadas aqui para facilitar balanceamento. */
const MATERIAIS = [
  { id:"madeira", nome:"Madeira", categoria:"basico", icone:"wood", descricao:"Tábuas e peças de madeira para estruturas e cabos.", fonte:"Monstros de qualquer bioma", peso:24 },
  { id:"pedra", nome:"Pedra", categoria:"basico", icone:"stone", descricao:"Pedras resistentes para fundações e construções.", fonte:"Monstros de qualquer bioma", peso:22 },
  { id:"ferroBruto", nome:"Ferro bruto", categoria:"basico", icone:"iron", descricao:"Minério ainda não refinado, usado em ferramentas e armas.", fonte:"Monstros de qualquer bioma", peso:17 },
  { id:"tecido", nome:"Tecido", categoria:"basico", icone:"cloth", descricao:"Retalhos e fibras para roupas, mantos e tendas.", fonte:"Monstros de qualquer bioma", peso:12 },
  { id:"couro", nome:"Couro", categoria:"basico", icone:"leather", descricao:"Material flexível para armaduras e acessórios.", fonte:"Monstros de qualquer bioma", peso:11 },
  { id:"ervas", nome:"Ervas", categoria:"basico", icone:"herbs", descricao:"Plantas úteis para preparar rações, tônicos e essências.", fonte:"Monstros de qualquer bioma", peso:14 },
  { id:"seivaVital", nome:"Seiva vital", categoria:"bioma", icone:"sap", descricao:"Seiva energizada encontrada nas criaturas da floresta.", fonte:"Floresta · chefes garantem uma pequena reserva", bioma:"floresta" },
  { id:"fragmentoCristalino", nome:"Fragmento cristalino", categoria:"bioma", icone:"crystalBlue", descricao:"Lasca de cristal que conserva energia mineral.", fonte:"Caverna · chefes garantem uma pequena reserva", bioma:"caverna" },
  { id:"areiaSolar", nome:"Areia solar", categoria:"bioma", icone:"solarSand", descricao:"Areia dourada aquecida pela energia do deserto.", fonte:"Deserto · chefes garantem uma pequena reserva", bioma:"deserto" },
  { id:"cristalGlacial", nome:"Cristal glacial", categoria:"bioma", icone:"iceShard", descricao:"Fragmento congelado, frio mesmo longe da geleira.", fonte:"Geleira · chefes garantem uma pequena reserva", bioma:"geleira" },
  { id:"nucleoIgneo", nome:"Núcleo ígneo", categoria:"bioma", icone:"igneousCore", descricao:"Resíduo sólido da energia vulcânica.", fonte:"Vulcão · chefes garantem uma pequena reserva", bioma:"vulcao" },
  { id:"fragmentoSagrado", nome:"Fragmento sagrado", categoria:"especial", icone:"sacredShard", descricao:"Relíquia luminosa usada em projetos ligados a Thalles.", fonte:"Chefes · chance adicional após contratar Padre Thalles", heroi:"padre" },
  { id:"fragmentoAbissal", nome:"Fragmento abissal", categoria:"especial", icone:"abyssShard", descricao:"Lasca de energia violeta associada às chamas de Pedro.", fonte:"Chefes · chance adicional após contratar pedrinhoo07140", heroi:"pedrinhoo07140" },
];
const MATERIAL_POR_BIOMA = {
  floresta:"seivaVital", caverna:"fragmentoCristalino", deserto:"areiaSolar",
  geleira:"cristalGlacial", vulcao:"nucleoIgneo",
};

// Estruturas permanentes do acampamento. A bancada é o primeiro projeto;
// a forja depende dela, formando uma progressão curta e fácil de entender.
const ESTRUTURAS_ACAMPAMENTO = [
  {
    id: "bancadaOficio",
    nome: "Bancada de Ofício",
    tipo: "bancada",
    descricao: "Uma estação versátil para trabalhar couro, tecidos, madeira e componentes.",
    funcao: "Fabricação de armaduras e acessórios.",
    custo: [{ id: "madeira", quantidade: 5 }, { id: "pedra", quantidade: 3 }, { id: "tecido", quantidade: 2 }],
    requer: null,
  },
  {
    id: "forja",
    nome: "Forja",
    tipo: "forja",
    descricao: "Uma fornalha de pedra para aquecer e moldar minérios resistentes.",
    funcao: "Fabricação de armas e equipamentos metálicos.",
    custo: [{ id: "pedra", quantidade: 6 }, { id: "ferroBruto", quantidade: 4 }, { id: "madeira", quantidade: 3 }],
    requer: "bancadaOficio",
  },
];

// Primeiras receitas do jogo. Os atributos são aplicados de verdade nos
// cálculos de dano, crítico e ouro; receitas novas podem ser adicionadas aqui.
const RECEITAS_EQUIPAMENTO = [
  {
    id: "espadaFerro", estacao: "forja", tipo: "arma", tipoArma: "espada", nome: "Espada de Ferro",
    icone: "espadaFerro", raridade: "comum", raridadeNome: "Comum",
    descricao: "Uma lâmina confiável, equilibrada para qualquer aventureiro.",
    bonus: { danoHeroiPct: 12 }, efeitos: ["+12% de dano do herói equipado"],
    custo: [{ id: "ferroBruto", quantidade: 4 }, { id: "madeira", quantidade: 2 }],
  },
  {
    id: "machadoBatalha", estacao: "forja", tipo: "arma", tipoArma: "machado", nome: "Machado de Batalha",
    icone: "machadoBatalha", raridade: "incomum", raridadeNome: "Incomum",
    descricao: "Uma arma pesada, feita para golpes de grande impacto.",
    bonus: { danoHeroiPct: 22 }, efeitos: ["+22% de dano do herói equipado"],
    custo: [{ id: "ferroBruto", quantidade: 7 }, { id: "madeira", quantidade: 3 }, { id: "couro", quantidade: 2 }],
  },
  {
    id: "arcoCacador", estacao: "forja", tipo: "arma", tipoArma: "arco", nome: "Arco de Caçador",
    icone: "arcoCacador", raridade: "comum", raridadeNome: "Comum",
    descricao: "Um arco leve e confiável, feito para aventureiros que atacam à distância.",
    bonus: { danoHeroiPct: 18 }, efeitos: ["+18% de dano do herói equipado"],
    custo: [{ id: "madeira", quantidade: 5 }, { id: "couro", quantidade: 2 }, { id: "tecido", quantidade: 2 }],
  },
  {
    id: "cajadoCarvalho", estacao: "forja", tipo: "arma", tipoArma: "cajado", nome: "Cajado de Carvalho",
    icone: "cajadoCarvalho", raridade: "incomum", raridadeNome: "Incomum",
    descricao: "Um cajado reforçado com ferro, preparado para canalizar magia e energia sagrada.",
    bonus: { danoHeroiPct: 17 }, efeitos: ["+17% de dano do herói equipado"],
    custo: [{ id: "madeira", quantidade: 5 }, { id: "ferroBruto", quantidade: 2 }, { id: "ervas", quantidade: 3 }],
  },
  {
    id: "adagasSombra", estacao: "forja", tipo: "arma", tipoArma: "adagas", nome: "Adagas da Sombra",
    icone: "adagasSombra", raridade: "incomum", raridadeNome: "Incomum",
    descricao: "Duas lâminas leves, equilibradas para ataques velozes e precisos.",
    bonus: { danoHeroiPct: 19 }, efeitos: ["+19% de dano do herói equipado"],
    custo: [{ id: "ferroBruto", quantidade: 5 }, { id: "couro", quantidade: 3 }],
  },
  {
    id: "gibaoCouro", estacao: "bancadaOficio", tipo: "armadura", nome: "Gibão de Couro",
    icone: "gibaoCouro", raridade: "comum", raridadeNome: "Comum",
    descricao: "Couro reforçado e tecido resistente para proteger quem vai à frente.",
    bonus: { danoHeroiPct: 8 }, efeitos: ["+8% de dano do herói equipado"],
    custo: [{ id: "couro", quantidade: 4 }, { id: "tecido", quantidade: 3 }],
  },
  {
    id: "amuletoViajante", estacao: "bancadaOficio", tipo: "acessorio", nome: "Amuleto do Viajante",
    icone: "amuletoViajante", raridade: "incomum", raridadeNome: "Incomum",
    descricao: "Um pequeno talismã que atrai oportunidades e golpes certeiros.",
    bonus: { ouroPct: 5, critPct: 1.5 }, efeitos: ["+5% de ouro", "+1,5% de chance de crítico"],
    custo: [{ id: "ervas", quantidade: 3 }, { id: "tecido", quantidade: 2 }, { id: "couro", quantidade: 1 }],
  },
];
const RECEITA_POR_ID = (id) => RECEITAS_EQUIPAMENTO.find((r) => r.id === id);
function tipoArmaDoItem(item) {
  if (!item) return null;
  return item.tipoArma || RECEITA_POR_ID(item.receitaId)?.tipoArma || null;
}
function heroiPodeUsarArma(idHeroi, item) {
  if (!item || item.tipo !== "arma") return false;
  const tipoItem = tipoArmaDoItem(item);
  return Boolean(tipoItem && TIPO_ARMA_HEROI[idHeroi] === tipoItem);
}
const ASSETS_ICONE_EQUIPAMENTO = {
  espadaFerro: "assets/espada-ferro.png",
  machadoBatalha: "assets/machado-batalha.png",
  arcoCacador: "assets/arco-cacador.png",
  cajadoCarvalho: "assets/cajado-carvalho.png",
  adagasSombra: "assets/adagas-sombra.png",
  gibaoCouro: "assets/gibao-couro.png",
  amuletoViajante: "assets/amuleto-viajante.png",
};
function iconeEquipamentoHtml(item, classe = "icone-equipamento-pixel") {
  const chave = typeof item === "string" ? item : item?.icone;
  const src = ASSETS_ICONE_EQUIPAMENTO[chave];
  if (src) return `<img class="${classe}" src="${src}" alt="" aria-hidden="true" draggable="false">`;
  const fallback = (typeof item === "string" ? item : item?.icone) || "✦";
  return `<span class="${classe}" aria-hidden="true">${fallback}</span>`;
}

// Todas as chances de obtenção probabilística foram reduzidas em dois terços
// (resta 1/3 da chance anterior). Pacotes garantidos de chefes e chances de
// quantidade extra não são chances de drop e permanecem inalterados.
const FATOR_REDUCAO_DROP = 1 / 3;
const CHANCE_DROP_BASICO = 0.18 * FATOR_REDUCAO_DROP; // 6%
const CHANCE_DROP_BIOMA = 0.10 * FATOR_REDUCAO_DROP; // 3,33%
const CHANCE_FRAGMENTO_ESPECIAL_CHEFE = 0.15 * FATOR_REDUCAO_DROP; // 5%
const CHANCE_DROP_EXTRA_BAU = 0.35 * FATOR_REDUCAO_DROP; // 11,67%
const PESO_BASICO_TOTAL = MATERIAIS.filter((m) => m.categoria === "basico").reduce((s,m) => s + m.peso, 0);

function inventarioInicial() {
  return {
    materiais: Object.fromEntries(MATERIAIS.map((m) => [m.id, 0])),
    // Quantidades obtidas desde a última abertura do inventário.
    // Esse mapa alimenta o selo verde de novidades no cabeçalho.
    novos: {},
    consumiveis: {},
    equipamentos: [],
    projetos: {},
    estruturas: [],
  };
}

function normalizarInventario(origem) {
  const base = inventarioInicial();
  if (!origem || typeof origem !== "object") return base;
  const materiais = origem.materiais && typeof origem.materiais === "object" ? origem.materiais : {};
  for (const item of MATERIAIS) {
    const n = Number(materiais[item.id]);
    if (Number.isFinite(n) && n > 0) base.materiais[item.id] = Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
  }
  const novos = origem.novos && typeof origem.novos === "object" ? origem.novos : {};
  for (const item of MATERIAIS) {
    const n = Number(novos[item.id]);
    if (Number.isFinite(n) && n > 0) base.novos[item.id] = Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
  }
  const consumiveis = origem.consumiveis && typeof origem.consumiveis === "object" ? origem.consumiveis : {};
  for (const [id, valor] of Object.entries(consumiveis)) {
    if (/^[a-zA-Z0-9_-]{1,64}$/.test(id) && !["__proto__", "constructor", "prototype"].includes(id) && Number.isFinite(Number(valor)) && Number(valor) > 0)
      base.consumiveis[id] = Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number(valor)));
  }
  base.equipamentos = Array.isArray(origem.equipamentos)
    ? origem.equipamentos.slice(0, 300).map((item) => {
        if (!item || typeof item !== "object" || typeof item.id !== "string" || !/^eq-[a-z0-9-]{5,70}$/i.test(item.id)) return null;
        const receita = RECEITA_POR_ID(item.receitaId);
        if (!receita) return null;
        return {
          id: item.id,
          receitaId: receita.id,
          tipo: receita.tipo,
          tipoArma: receita.tipoArma || null,
          nome: receita.nome,
          icone: receita.icone,
          raridade: receita.raridade,
          raridadeNome: receita.raridadeNome,
          descricao: receita.descricao,
          bonus: { ...receita.bonus },
          efeitos: [...receita.efeitos],
        };
      }).filter(Boolean)
    : [];
  const projetos = origem.projetos && typeof origem.projetos === "object" ? origem.projetos : {};
  for (const [id, desbloqueado] of Object.entries(projetos))
    if (/^[a-zA-Z0-9_-]{1,64}$/.test(id) && !["__proto__", "constructor", "prototype"].includes(id) && desbloqueado === true) base.projetos[id] = true;
  base.estruturas = Array.isArray(origem.estruturas)
    ? origem.estruturas.filter((id) => typeof id === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(id)).slice(0, 100)
    : [];
  return base;
}

function quantidadeMaterial(id) {
  return estado.inventario?.materiais?.[id] || 0;
}

function adicionarMaterial(id, quantidade = 1, ganhos = null) {
  const definicao = MATERIAIS.find((m) => m.id === id);
  if (!definicao || !Number.isFinite(quantidade) || quantidade <= 0) return 0;
  if (!estado.inventario) estado.inventario = inventarioInicial();
  if (!estado.inventario.materiais) estado.inventario.materiais = {};
  const atual = quantidadeMaterial(id);
  const novo = Math.min(Number.MAX_SAFE_INTEGER, atual + Math.floor(quantidade));
  const adicionado = novo - atual;
  estado.inventario.materiais[id] = novo;
  if (adicionado > 0) {
    if (!estado.inventario.novos) estado.inventario.novos = {};
    const pendentes = Number(estado.inventario.novos[id]) || 0;
    estado.inventario.novos[id] = Math.min(Number.MAX_SAFE_INTEGER, pendentes + adicionado);
    if (ganhos) ganhos[id] = (ganhos[id] || 0) + adicionado;
  }
  return adicionado;
}

function sortearMaterialBasico() {
  let sorteio = Math.random() * PESO_BASICO_TOTAL;
  for (const item of MATERIAIS) {
    if (item.categoria !== "basico") continue;
    sorteio -= item.peso;
    if (sorteio <= 0) return item.id;
  }
  return "madeira";
}

function concederMateriaisAbate(alvo) {
  if (!alvo) return;
  const ganhos = {};
  const bioma = biomas[indiceBioma(estado.zona)].id;
  const materialBioma = MATERIAL_POR_BIOMA[bioma];

  if (alvo.boss) {
    // Chefes sempre rendem um pequeno pacote: 3–4 recursos básicos e 2 do bioma.
    const unidadesBasicas = 3 + (Math.random() < 0.5 ? 1 : 0);
    for (let i = 0; i < unidadesBasicas; i++) {
      const id = sortearMaterialBasico();
      adicionarMaterial(id, 1 + (Math.random() < 0.18 ? 1 : 0), ganhos);
    }
    if (materialBioma) adicionarMaterial(materialBioma, 2, ganhos);
    // Relíquias especiais só podem começar a cair depois da contratação do herói.
    if (nivel("padre") > 0 && Math.random() < CHANCE_FRAGMENTO_ESPECIAL_CHEFE)
      adicionarMaterial("fragmentoSagrado", 1, ganhos);
    if (nivel("pedrinhoo07140") > 0 && Math.random() < CHANCE_FRAGMENTO_ESPECIAL_CHEFE)
      adicionarMaterial("fragmentoAbissal", 1, ganhos);
  } else {
    if (Math.random() < CHANCE_DROP_BASICO) {
      const id = sortearMaterialBasico();
      adicionarMaterial(id, 1 + (Math.random() < 0.22 ? 1 : 0), ganhos);
    }
    if (materialBioma && Math.random() < CHANCE_DROP_BIOMA)
      adicionarMaterial(materialBioma, 1, ganhos);
    // Baús/monstros especiais têm uma chance pequena de trazer mais um material básico.
    if (alvo.bau && Math.random() < CHANCE_DROP_EXTRA_BAU)
      adicionarMaterial(sortearMaterialBasico(), 1, ganhos);
  }

  const entradas = Object.entries(ganhos);
  if (!entradas.length) return;
  const resumo = entradas.map(([id, qtd]) => {
    const item = MATERIAIS.find((m) => m.id === id);
    return `${item ? item.nome : id} ×${qtd}`;
  });
  toast((alvo.boss ? "Recompensa do chefe: " : "Recursos encontrados: ") + resumo.join(" · "));
  atualizarSeloInventario();
  if (el.inventarioMateriais && !el.inventarioMateriais.hidden) renderInventarioMateriais();
}

/* =========================================================
   Estado
   ========================================================= */

function estadoInicial() {
  return {
    versao: VERSAO_SAVE,
    ouro: 0,
    zona: 1,
    zonaMax: 1,
    abates: 0,
    farm: false,
    acampado: false,
    campZona: 0,
    herois: {},
    equipamentosHerois: {}, // { idHeroi: { arma, armadura, acessorio } }
    tutorialEquipamentosVisto: false,
    inventario: inventarioInicial(),
    talentos: {}, // { idDoTalento: nível }
    pontosGanhos: 1, // pontos de talento ganhos (1 inicial + chefes)
    chefeMax: 0, // maior zona de chefe já vencida
    cdFim: {},
    ativoFim: {},
    passivasFim: {},
    passivasAvisos: {}, // avisos de descoberta ainda não confirmados
    cliques: 0,
    abatidos: 0,
    modo: "1",
    som: true,
    tutorialVisto: false,
    salvoEm: 0, // quando foi salvo (ms), usado para comparar com a nuvem
  };
}

let estado = estadoInicial();
let monstro = null;
let fimChefe = 0;
let telaAcampamento = true;
let inicioCicloAcampamento = 0;
let timerCicloAcampamento = null;
let timerFalasAcampamento = null;
let timerPasseioAcampamento = null;
let timerPassosAcampamento = null;
const cacheSpritesPassosAcampamento = new Map();
let timerEncontroAcampamento = null;
let timersAcoesAcampamento = [];
let timersPassarosAcampamento = [];
let assinaturaRosterAcampamento = "";
let periodoAnteriorAcampamento = null;
let encontroFogueiraAtivo = false;
// Movimento em pequenos passos de pixel, sem transição longa de CSS.
const movimentosLentosAcampamento = new Map();
let gruposSociaisAcampamento = [];
let proximoIdGrupoSocial = 1;
let tickPassosAcampamento = 0;
let ultimoTick = Date.now();

/* Relógio do jogo: para durante a tela inicial/tutorial e acelera no modo dev.
   Tudo que é tempo de jogo (recargas, duração, tempo do chefe) usa relogio(). */
let pausado = !!document.getElementById("inicio"); // começa pausado se há tela inicial
let velocidade = 1;
let relRef = Date.now();
let relVirt = relRef;
function relogio() {
  const real = Date.now();
  if (!pausado) relVirt += (real - relRef) * velocidade;
  relRef = real;
  return relVirt;
}
function pausar(v) {
  relogio(); // fecha o intervalo anterior antes de mudar o estado
  pausado = v;
  ultimoTick = Date.now();
}

// Trava de segurança: se a tela inicial (meta.js) não carregar ou quebrar, o jogo
// não pode ficar pausado atrás dela para sempre.
function liberarSemTelaInicial() {
  const t = document.getElementById("inicio");
  if (t) t.hidden = true;
  if (pausado) pausar(false);
}
setTimeout(() => {
  if (!window.metaPronta) liberarSemTelaInicial();
}, 3000);

// multiplicadores de teste (só a conta dev mexe; 1 = normal)
const DEV = {
  danoMult: 1,
  ouroMult: 1,
  custoMult: 1,
  semTempoChefe: false,
  enterLivre: false, // segurar Enter vira clique sem recarga (só no painel dev)
};
let timers = [];
let timerAvanco = null;
const acumulador = {}; // tempo acumulado de cada herói até o próximo ataque

const nivel = (id) => estado.herois[id] || 0;
const heroiPorId = (id) => herois.find((h) => h.id === id);
const ativo = (id) => (estado.ativoFim[id] || 0) > relogio();

/* ---------- Contas ---------- */

const hpZona = (z) => Math.floor(10 * (z - 1 + Math.pow(CRESC_VIDA, z - 1)));
const ouroPorHp = (hp) => Math.max(1, Math.ceil(hp / OURO_DIV));
const ehChefe = (z) => z % 5 === 0;
const indiceBioma = (z) => Math.floor((z - 1) / 10) % biomas.length;

function multNivel(n) {
  let m = 1;
  for (const mk of marcos) if (n >= mk.nivel) m *= mk.f;
  // A progressão continua após o último marco, mas com crescimento suave.
  if (n > NIVEL_MARCOS_BASE)
    m *= 1 + (n - NIVEL_MARCOS_BASE) / ESCALA_PROGRESSAO_POS_MARCOS;
  return m;
}

const forcaHeroi = (h) => nivel(h.id) * h.forca * multNivel(nivel(h.id)) * (1 + bonusDanoEquipadoHeroi(h.id) / 100);

/* ---------- Passivas elementais dos dois heróis especiais ----------
   Os dois heróis têm exatamente o mesmo dano e custo por nível.
   As passivas começam com 8% de chance, 18 s de recarga e 3 s de duração.
   Cada pulso causa 16% do dano de um ataque do próprio herói. */
const PASSIVAS_ELEMENTAIS = {
  padre: {
    chave: "pur",
    talento: "pur1",
    classe: "chama-purificadora",
    nome: "Purification Flames",
    chance: 0.08,
    recarga: 18000,
    duracao: 3000,
    danoPulso: 0.16,
  },
  pedrinhoo07140: {
    chave: "aby",
    talento: "aby1",
    classe: "chama-abissal",
    nome: "Abyss Flame",
    chance: 0.08,
    recarga: 18000,
    duracao: 3000,
    danoPulso: 0.16,
  },
};
const INTERVALO_CHAMAS = 500;
const MULT_CHAMA_AFINIDADE = 1.35;

function tentarAplicarPassiva(idHeroi, danoHeroi) {
  const cfg = PASSIVAS_ELEMENTAIS[idHeroi];
  if (!cfg || nivel(idHeroi) <= 0 || rankTalento(cfg.talento) <= 0) return;
  if (!monstro || monstro.morrendo) return;

  const agora = relogio();
  if ((estado.passivasFim[idHeroi] || 0) > agora) return;
  if (Math.random() >= cfg.chance) return;

  const danoRank = B[cfg.chave + "Dano"] || 0;
  const recargaRank = B[cfg.chave + "Recarga"] || 0;
  const duracaoRank = B[cfg.chave + "Duracao"] || 0;
  const recarga = cfg.recarga * (1 - Math.min(50, recargaRank) / 100);
  const duracao = cfg.duracao + duracaoRank * 1000;
  const afinidade = (monstro.afinidades || []).some((a) => a === "morto-vivo" || a === "fogo-lava");

  estado.passivasFim[idHeroi] = agora + recarga;
  if (!monstro.efeitosElementais) monstro.efeitosElementais = {};
  monstro.efeitosElementais[idHeroi] = {
    classe: cfg.classe,
    fim: agora + duracao,
    proximoPulso: agora + INTERVALO_CHAMAS,
    dano: danoHeroi * cfg.danoPulso * (1 + danoRank / 100) * (afinidade ? MULT_CHAMA_AFINIDADE : 1),
  };
  el.monstro.classList.add(cfg.classe);
  emitirParticulasElementais(cfg.classe, 9);
}

function processarChamasElementais(agora) {
  if (!monstro || monstro.morrendo || !monstro.efeitosElementais) return;
  for (const id of Object.keys(monstro.efeitosElementais)) {
    const efeito = monstro.efeitosElementais[id];
    let pulsos = 0;
    while (agora >= efeito.proximoPulso && efeito.proximoPulso <= efeito.fim && pulsos < 20) {
      efeito.proximoPulso += INTERVALO_CHAMAS;
      pulsos++;
      emitirParticulasElementais(efeito.classe, 2);
      causarDano(efeito.dano, efeito.classe);
      if (!monstro || monstro.morrendo) return;
    }
    if (agora >= efeito.fim && efeito.proximoPulso > efeito.fim) {
      el.monstro.classList.remove(efeito.classe);
      delete monstro.efeitosElementais[id];
    }
  }
}

const MULT_FURIA = 4;
const MULT_SORTE = 2;
const multFuria = () => MULT_FURIA + B.furiaMult;
const multSorte = () => MULT_SORTE + B.sorteMult;
const chanceCritico = () => Math.min(0.75, CHANCE_CRITICO + (B.crit + bonusEquipamentoGlobal("critPct")) / 100);
const multCritico = () => 5 + B.critMult;
const chanceBau = () => CHANCE_BAU + B.bau / 100;
const tempoChefe = () => TEMPO_CHEFE + B.chefeTempo;
const cdHab = (h) => h.cd * (1 - B.recarga / 100);
const durHab = (h) =>
  h.dur + (h.id === "furia" ? B.furiaDur : h.id === "sorte" ? B.sorteDur : 0);

const contratados = () =>
  herois.filter((h) => h.tipo === "dps" && nivel(h.id) > 0).length;

function dps() {
  let total = 0,
    maior = 0;
  for (const h of herois) {
    if (h.tipo !== "dps") continue;
    const f = forcaHeroi(h);
    total += f;
    if (f > maior) maior = f;
  }
  total += maior * (B.lider / 100);
  return (
    total * (1 + B.dps / 100) * (1 + (B.equipe / 100) * contratados()) * DEV.danoMult
  );
}

// dano de um clique sem Fúria (usado também pelo Raio)
function danoBase() {
  return (
    (1 + forcaHeroi(heroiPorId("pip"))) * (1 + B.clique / 100) * DEV.danoMult +
    dps() * (B.sincronia / 100)
  );
}

const danoClique = () => danoBase() * (ativo("furia") ? multFuria() : 1);

const multOuro = () =>
  (1 + (B.ouro + bonusEquipamentoGlobal("ouroPct")) / 100) * (ativo("sorte") ? multSorte() : 1) * DEV.ouroMult;
function custoNivel(h, n) {
  const crescimento = h.cresc || CRESCIMENTO_CUSTO;
  const nivelBase = Math.min(n, NIVEL_MARCOS_BASE);
  const nivelExtra = Math.max(0, n - NIVEL_MARCOS_BASE);
  const custo =
    h.base *
    Math.pow(crescimento, nivelBase) *
    (1 + nivelExtra / ESCALA_PROGRESSAO_POS_MARCOS) *
    (1 - B.desconto / 100) *
    DEV.custoMult;
  return Math.ceil(custo);
}

// Soma rápida de uma progressão geométrica. O + quantidade é uma margem
// conservadora para cobrir o Math.ceil aplicado individualmente a cada nível.
function somaGeometricaConservadora(primeiro, crescimento, quantidade) {
  if (quantidade <= 0) return 0;
  if (!Number.isFinite(primeiro) || !Number.isFinite(quantidade)) return Infinity;
  if (crescimento === 1) return primeiro * quantidade + quantidade;
  const expoente = quantidade * Math.log(crescimento);
  if (expoente > Math.log(Number.MAX_VALUE)) return Infinity;
  const soma = primeiro * Math.expm1(expoente) / (crescimento - 1);
  return soma + quantidade;
}

function somaAritmeticaConservadora(primeiro, incremento, quantidade) {
  if (quantidade <= 0) return 0;
  const soma = quantidade * (2 * primeiro + (quantidade - 1) * incremento) / 2;
  return Number.isFinite(soma) ? soma + quantidade : Infinity;
}

// Estima o custo de um lote sem percorrer nível por nível. A curva original
// é preservada até 1500; depois, usa a progressão suave de pós-marco.
function estimarCustoLote(h, nivelInicial, quantidade) {
  if (quantidade <= 0) return 0;
  if (quantidade <= 20000) {
    let totalExato = 0;
    for (let i = 0; i < quantidade; i++) {
      totalExato += custoNivel(h, nivelInicial + i);
      if (!Number.isFinite(totalExato)) return Infinity;
    }
    return totalExato;
  }
  const crescimento = h.cresc || CRESCIMENTO_CUSTO;
  const fator = (1 - B.desconto / 100) * DEV.custoMult;
  let nivelAtual = nivelInicial;
  let restante = quantidade;
  let total = 0;

  if (nivelAtual < NIVEL_MARCOS_BASE) {
    const qtdBase = Math.min(restante, NIVEL_MARCOS_BASE - nivelAtual);
    const primeiro = h.base * Math.pow(crescimento, nivelAtual) * fator;
    total += somaGeometricaConservadora(primeiro, crescimento, qtdBase);
    restante -= qtdBase;
    nivelAtual += qtdBase;
  }

  if (restante > 0) {
    const custoBase =
      h.base * Math.pow(crescimento, NIVEL_MARCOS_BASE) * fator;
    const primeiro =
      custoBase *
      (1 + (nivelAtual - NIVEL_MARCOS_BASE) / ESCALA_PROGRESSAO_POS_MARCOS);
    const incremento = custoBase / ESCALA_PROGRESSAO_POS_MARCOS;
    total += somaAritmeticaConservadora(primeiro, incremento, restante);
  }
  return total;
}

function custoLote(h, nivelInicial, quantidade) {
  // Para lotes pequenos, mantém o total exato. Em lotes enormes, usa a soma
  // conservadora para não travar a interface nem gastar ouro além do saldo.
  if (quantidade <= 20000) {
    let total = 0;
    for (let i = 0; i < quantidade; i++) {
      total += custoNivel(h, nivelInicial + i);
      if (!Number.isFinite(total)) return Infinity;
    }
    return total;
  }
  return estimarCustoLote(h, nivelInicial, quantidade);
}

// Quantos níveis o botão compra e quanto custa, conforme o modo (x1, x10, x25, Máx).
// No modo Máx, uma busca binária substitui o antigo limite fixo de 5000 níveis.
function calcLote(h) {
  const n = nivel(h.id);
  if (estado.modo === "max") {
    const maximoSeguro = Math.max(0, Number.MAX_SAFE_INTEGER - n);
    if (maximoSeguro <= 0) return { k: 0, total: Infinity };

    let baixo = 0;
    let alto = 1;
    while (
      alto < maximoSeguro &&
      estimarCustoLote(h, n, alto) <= estado.ouro
    ) {
      baixo = alto;
      alto = Math.min(maximoSeguro, alto * 2);
    }
    if (alto === maximoSeguro && estimarCustoLote(h, n, alto) <= estado.ouro)
      baixo = alto;
    else {
      while (baixo + 1 < alto) {
        const meio = Math.floor(baixo + (alto - baixo) / 2);
        if (estimarCustoLote(h, n, meio) <= estado.ouro) baixo = meio;
        else alto = meio;
      }
    }

    return baixo === 0
      ? { k: 1, total: custoNivel(h, n) }
      : { k: baixo, total: custoLote(h, n, baixo) };
  }
  const k = Math.min(Number(estado.modo), Math.max(0, Number.MAX_SAFE_INTEGER - n));
  let total = 0;
  for (let i = 0; i < k; i++) total += custoNivel(h, n + i);
  return { k, total };
}

/* ---------- Formatação: 1200 → 1,2 mil ---------- */
const SUFIXOS = [
  "",
  " mil",
  " mi",
  " bi",
  " tri",
  " qua",
  " qui",
  " sex",
  " sep",
  " oct",
  " non",
  " dec",
];

function fmtNivelHeroi(n) {
  if (!Number.isFinite(n)) return "∞";
  if (n < 1000000) return Math.floor(n).toLocaleString("pt-BR");
  const [coeficiente, expoenteTexto] = Number(n).toExponential(2).split("e");
  const expoente = Number(expoenteTexto);
  const sobrescrito = String(expoente).replace(/[0-9-]/g, (c) => ({
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
  })[c]);
  return coeficiente.replace(".", ",") + " × 10" + sobrescrito;
}

function fmt(n, dec = 0) {
  if (!Number.isFinite(n)) return "∞";
  if (n < 1000)
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: dec,
    });
  const original = n;
  let i = 0;
  while (n >= 1000 && i < SUFIXOS.length - 1) {
    n /= 1000;
    i++;
  }
  if (n >= 1000)
    return original.toExponential(2).replace(".", ",").replace("e+", "e");
  const casas = n < 10 ? 2 : n < 100 ? 1 : 0;
  return (
    n.toLocaleString("pt-BR", { maximumFractionDigits: casas }) + SUFIXOS[i]
  );
}

/* =========================================================
   Elementos da página
   ========================================================= */

const $ = (s) => document.querySelector(s);
const el = {
  jogo: $(".jogo"),
  palcoCol: $(".palco-col"),
  grupo: $("#grupo"),
  loja: $(".loja"),
  cena: $("#cena"),
  fundo: $("#fundo"),
  zonaPausada: $("#zona-pausada"),
  mapaQuadro: $("#mapa-quadro"),
  mapaTrilha: $("#mapa-trilha"),
  mapaTitulo: $("#mapa-titulo"),
  mapaLegenda: $("#mapa-legenda"),
  modoZonaOrigem: $("#modo-zona-origem"),
  btnCampToggle: $("#btn-alternar-camp"),
  acampamento: $("#acampamento"),
  campCenario: $("#camp-cenario"),
  campRoster: $("#camp-roster"),
  campEstacoes: $("#camp-estacoes-mundo"),
  campOficinas: $("#camp-oficinas"),
  campOficinasGrade: $("#camp-oficinas-grade"),
  oficinaModal: $("#oficina-modal"),
  oficinaModalTitulo: $("#oficina-modal-titulo"),
  oficinaModalConteudo: $("#oficina-modal-conteudo"),
  oficinaModalFechar: $("#oficina-modal-fechar"),
  heroiCard: $("#heroi-card"),
  heroiCardTitulo: $("#heroi-card-titulo"),
  heroiCardConteudo: $("#heroi-card-conteudo"),
  heroiCardFechar: $("#heroi-card-fechar"),
  heroiTutorial: $("#heroi-tutorial"),
  heroiTutorialFechar: $("#heroi-tutorial-fechar"),
  heroiTutorialAbrir: $("#heroi-tutorial-abrir"),
  campSubtitulo: $("#camp-subtitulo"),
  campPeriodo: $("#camp-periodo"),
  campRodape: $("#acampamento-rodape"),
  campPergunta: $("#camp-pergunta"),
  btnCampDescansar: $("#btn-camp-descansar"),
  btnCampContinuar: $("#btn-camp-continuar"),
  alvo: $(".alvo"),
  taxas: $(".taxas"),
  zonaNome: $("#zona-nome"),
  pips: $("#pips"),
  grupoGrade: $("#grupo-grade"),
  grupoConta: $("#grupo-conta"),
  grupoDps: $("#grupo-dps"),
  monstro: $("#monstro"),
  monstroCanvas: $("#monstro-canvas"),
  monstroEfeitos: $("#monstro-efeitos"),
  banner: $("#banner"),
  monstroNome: $("#monstro-nome"),
  recorde: $("#recorde"),
  vidaFill: $("#vida-fill"),
  vidaTexto: $("#vida-texto"),
  tempo: $("#tempo"),
  tempoFill: $("#tempo-fill"),
  tempoTexto: $("#tempo-texto"),
  danoClique: $("#dano-clique"),
  dps: $("#dps"),
  habilidades: $("#habilidades"),
  btnFarm: $("#btn-farm"),
  listaHerois: $("#lista-herois"),
  ouro: $("#ouro"),
  ouroBox: $("#ouro-box"),
  btnInventario: $("#btn-inventario"),
  seloMateriais: $("#selo-materiais"),
  inventarioMateriais: $("#inventario-materiais"),
  inventarioFechar: $("#inventario-fechar"),
  inventarioResumo: $("#inventario-resumo"),
  inventarioFiltros: $("#inventario-filtros"),
  inventarioGrade: $("#inventario-grade"),
  toasts: $("#toasts"),
  btnSom: $("#btn-som"),
  btnSalvar: $("#btn-salvar"),
  btnZerar: $("#btn-zerar"),
  btnArvore: $("#btn-arvore"),
  seloPontos: $("#selo-pontos"),
  arvore: $("#arvore"),
  arvoreViewport: $("#arvore-viewport"),
  arvoreRamos: $("#arvore-ramos"),
  arvorePontos: $("#arvore-pontos"),
  arvoreInfo: $("#arvore-info"),
  arvoreRedefinir: $("#arvore-redefinir"),
  arvoreCentralizar: $("#arvore-centralizar"),
  arvoreFechar: $("#arvore-fechar"),
  arvoreTitulo: $("#arvore-titulo"),
  arvoreDica: $("#arvore-dica"),
  arvoreModoPrincipal: $("#arvore-modo-principal"),
  arvoreModoPassivas: $("#arvore-modo-passivas"),
  arvoreConsultarPassivas: $("#arvore-consultar-passivas"),
  passivasAviso: $("#passivas-aviso"),
  passivasAvisoEtiqueta: $("#passivas-aviso-etiqueta"),
  passivasAvisoTitulo: $("#passivas-aviso-titulo"),
  passivasAvisoConteudo: $("#passivas-aviso-conteudo"),
  passivasAvisoFechar: $("#passivas-aviso-fechar"),
  passivasAvisoVerArvore: $("#passivas-aviso-ver-arvore"),
};

/* Menus compactos do cabeçalho. Os botões internos mantêm seus IDs e
   listeners originais; este controlador só abre/fecha os dropdowns. */
function configurarMenusTopo() {
  const dropdowns = Array.from(document.querySelectorAll("[data-menu-dropdown]"));
  const fechar = (dropdown, devolverFoco = false) => {
    const painel = dropdown.querySelector(".menu-lista");
    const gatilho = dropdown.querySelector("[data-menu-trigger]");
    if (!painel || !gatilho) return;
    painel.hidden = true;
    gatilho.setAttribute("aria-expanded", "false");
    if (devolverFoco) gatilho.focus();
  };

  dropdowns.forEach((dropdown) => {
    const gatilho = dropdown.querySelector("[data-menu-trigger]");
    const painel = dropdown.querySelector(".menu-lista");
    if (!gatilho || !painel) return;

    gatilho.addEventListener("click", () => {
      const deveAbrir = painel.hidden;
      dropdowns.forEach((outro) => fechar(outro));
      if (deveAbrir) {
        painel.hidden = false;
        gatilho.setAttribute("aria-expanded", "true");
      }
    });

    painel.addEventListener("click", (evento) => {
      const item = evento.target.closest("button");
      if (!item) return;
      // Zerar exige dois cliques; mantém o menu aberto durante a confirmação.
      if (item.id === "btn-zerar" && item.textContent.trim() === "Confirmar?") return;
      fechar(dropdown);
    });
  });

  document.addEventListener("click", (evento) => {
    if (evento.target.closest("[data-menu-dropdown]")) return;
    dropdowns.forEach((dropdown) => fechar(dropdown));
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    const aberto = dropdowns.find((dropdown) => {
      const painel = dropdown.querySelector(".menu-lista");
      return painel && !painel.hidden;
    });
    if (aberto) {
      evento.preventDefault();
      fechar(aberto, true);
    }
  });
}
configurarMenusTopo();

/* =========================================================
   Som (sintetizado, sem arquivos)
   ========================================================= */

let audio = null;

function contextoAudio() {
  if (!estado.som) return null;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    return audio;
  } catch (e) {
    return null;
  }
}

function nota(freq, dur, tipo = "square", vol = 0.04, atraso = 0) {
  const a = contextoAudio();
  if (!a) return;
  const t = a.currentTime + atraso;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

const sons = {
  clique: () => nota(260, 0.06, "square", 0.03),
  crit: () => {
    nota(520, 0.07, "square", 0.045);
    nota(780, 0.09, "square", 0.045, 0.06);
  },
  matar: () =>
    [392, 523, 659].forEach((f, i) => nota(f, 0.09, "square", 0.035, i * 0.06)),
  compra: () => {
    nota(523, 0.07, "square", 0.04);
    nota(784, 0.1, "square", 0.04, 0.07);
  },
  raio: () => {
    nota(90, 0.35, "sawtooth", 0.06);
    nota(1200, 0.12, "square", 0.025);
  },
  chefe: () =>
    [392, 523, 659, 784, 1047].forEach((f, i) =>
      nota(f, 0.14, "square", 0.045, i * 0.09),
    ),
  erro: () => nota(110, 0.2, "sawtooth", 0.04),
  hab: () => {
    nota(330, 0.08, "triangle", 0.05);
    nota(660, 0.12, "triangle", 0.05, 0.08);
  },
};
const som = (nome) => {
  if (sons[nome]) sons[nome]();
};

/* =========================================================
   Fundo da cena (pixel art gerada por código)
   ========================================================= */

function aleatorio(semente) {
  let s = semente | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Troca o visual da página inteira (cores, partículas, barra de rolagem)
function aplicarTema(b) {
  const raiz = document.documentElement;
  if (raiz.dataset.bioma === b.id) return;
  raiz.dataset.bioma = b.id;
  const meta = document.querySelector('meta[name="theme-color"]');
  const cor = getComputedStyle(raiz).getPropertyValue("--bg").trim();
  if (meta && cor) meta.setAttribute("content", cor);
}

function desenharFundo(i) {
  const b = biomas[i];
  aplicarTema(b);
  const W = 160,
    H = 96,
    horizonte = 64;
  const c = el.fundo;
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  const rnd = aleatorio(1234 + i * 77);

  for (let y = 0; y < horizonte; y++) {
    ctx.fillStyle =
      b.ceu[
        Math.min(b.ceu.length - 1, Math.floor(y / (horizonte / b.ceu.length)))
      ];
    ctx.fillRect(0, y, W, 1);
  }
  if (b.estrela) {
    ctx.fillStyle = b.estrela;
    for (let k = 0; k < 40; k++)
      ctx.fillRect(Math.floor(rnd() * W), Math.floor(rnd() * 44), 1, 1);
  } else {
    ctx.fillStyle = b.nuvem;
    for (let k = 0; k < 4; k++) {
      const x = Math.floor(rnd() * (W - 30)),
        y = 6 + Math.floor(rnd() * 22),
        w = 14 + Math.floor(rnd() * 12);
      ctx.fillRect(x, y, w, 3);
      ctx.fillRect(x + 3, y - 2, w - 8, 2);
    }
  }
  for (let x = 0; x < W; x++) {
    const h1 = Math.round(
      14 + Math.sin(x * 0.07 + i) * 7 + Math.sin(x * 0.19) * 3,
    );
    ctx.fillStyle = b.morro2;
    ctx.fillRect(x, horizonte - h1, 1, h1);
    const h2 = Math.round(7 + Math.sin(x * 0.11 + 2 + i) * 4);
    ctx.fillStyle = b.morro;
    ctx.fillRect(x, horizonte - h2, 1, h2);
  }
  ctx.fillStyle = b.chao;
  ctx.fillRect(0, horizonte, W, H - horizonte);
  ctx.fillStyle = b.chao2;
  ctx.fillRect(0, horizonte + 14, W, H - horizonte - 14);
  for (let k = 0; k < 110; k++) {
    ctx.fillStyle = rnd() < 0.55 ? b.detalhe : b.chao2;
    ctx.fillRect(
      Math.floor(rnd() * W),
      horizonte + 1 + Math.floor(rnd() * (H - horizonte - 1)),
      1 + Math.floor(rnd() * 2),
      1,
    );
  }
}

/* =========================================================
   Combate
   ========================================================= */

function spawn() {
  const z = estado.zona;
  const hp = hpZona(z);
  let m;
  if (ehChefe(z)) {
    const listaChefes = biomas[indiceBioma(z)].chefes;
    const def = listaChefes[Math.floor(((z - 1) % 10) / 5) % listaChefes.length];
    const hpMax = hp * VIDA_CHEFE;
    m = {
      sprite: def.sprite,
      nome: def.nome,
      hpMax,
      ouro: ouroPorHp(hpMax),
      boss: true,
      afinidades: afinidadesMonstro[def.sprite] || [],
    };
    m.tempoMax = tempoChefe();
    fimChefe = relogio() + m.tempoMax * 1000;
  } else if (Math.random() < chanceBau()) {
    m = {
      sprite: "bau",
      nome: nomesMonstro.bau,
      hpMax: hp,
      ouro: ouroPorHp(hp) * (10 + B.bauMult),
      bau: true,
      afinidades: [],
    };
  } else {
    const pool = biomas[indiceBioma(z)].monstros;
    const s = pool[Math.floor(Math.random() * pool.length)];
    m = { sprite: s, nome: nomesMonstro[s], hpMax: hp, ouro: ouroPorHp(hp), afinidades: afinidadesMonstro[s] || [] };
  }
  m.hp = m.hpMax;
  m.morrendo = false;
  monstro = m;

  desenharSprite(el.monstroCanvas, m.sprite);
  el.monstro.className = "monstro entra" + (m.boss ? " chefe" : "");
  // Remove qualquer partícula residual do alvo anterior.
  if (el.monstroEfeitos) el.monstroEfeitos.replaceChildren();
  setTimeout(() => el.monstro.classList.remove("entra"), 360);
  el.monstroNome.textContent = m.nome + (m.boss ? " (chefe)" : "");
  el.tempo.hidden = !m.boss;
  renderZona();
  renderVida();
}

function causarDano(d, tipo, x, y) {
  if (!monstro || monstro.morrendo) return;
  monstro.hp -= d;
  flutuar("-" + fmt(Math.round(d)), tipo, x, y);
  el.monstro.classList.remove("golpe");
  void el.monstro.offsetWidth;
  el.monstro.classList.add("golpe");
  if (monstro.hp <= 0) {
    monstro.hp = 0;
    matar();
  }
  renderVida();
}

function matar() {
  monstro.morrendo = true;
  const ganho =
    monstro.ouro * multOuro() * (monstro.boss ? 1 + B.chefeOuro / 100 : 1);
  estado.ouro += ganho;
  estado.abatidos++;
  concederMateriaisAbate(monstro);
  flutuar("+" + fmt(Math.round(ganho)), "ouro");
  moedas(monstro.boss ? 14 : monstro.bau ? 12 : 5);
  el.ouroBox.classList.remove("pulo");
  void el.ouroBox.offsetWidth;
  el.ouroBox.classList.add("pulo");
  el.monstro.classList.add("morre");

  if (monstro.boss) {
    ganharPontosChefe(estado.zona);
    som("chefe");
    el.cena.classList.remove("treme");
    void el.cena.offsetWidth;
    el.cena.classList.add("treme");
  } else {
    som("matar");
  }
  timerAvanco = setTimeout(avancar, 400 / velocidade);
}

function avancar() {
  if (monstro && monstro.boss) {
    if (!estado.farm) {
      // O acampamento aparece na vitória do chefe das zonas 10, 20, 30...
      // A pergunta ocorre antes de gerar a próxima zona.
      if (estado.zona % 10 === 0) {
        mostrarPerguntaAcampamento();
        return;
      }
      mudarZona(estado.zona + 1);
    }
  } else {
    estado.abates++;
    if (estado.abates >= MONSTROS_POR_ZONA) {
      estado.abates = 0;
      if (!estado.farm) mudarZona(estado.zona + 1);
    }
  }
  spawn();
}

function mudarZona(z) {
  const biomaAntes = indiceBioma(estado.zona);
  estado.zona = z;
  estado.zonaMax = Math.max(estado.zonaMax, z);
  estado.abates = 0;
  if (indiceBioma(z) !== biomaAntes) {
    desenharFundo(indiceBioma(z));
    banner(biomas[indiceBioma(z)].nome);
  } else {
    banner(ehChefe(z) ? "CHEFE!" : "Zona " + z);
  }
}

function falharChefe() {
  const z = Math.max(1, estado.zona - 1);
  estado.farm = true;
  estado.abates = 0;
  if (indiceBioma(z) !== indiceBioma(estado.zona))
    desenharFundo(indiceBioma(z));
  estado.zona = z;
  som("erro");
  toast(
    "O chefe venceu! Voltando para a zona " +
      z +
      ". Fique mais forte e tente de novo.",
  );
  spawn();
}

/* ---------- Clique ---------- */

/* Segurar Enter no monstro faz o navegador repetir o "clique" várias vezes por
   segundo. Para o jogador normal isso é bloqueado (e o teclado fica limitado
   a ~10 cliques por segundo). A conta dev pode liberar em DEV.enterLivre. */
let ultimoCliqueTeclado = 0;
el.monstro.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.repeat && !DEV.enterLivre) e.preventDefault();
});

el.monstro.addEventListener("click", (e) => {
  if (pausado || !monstro || monstro.morrendo) return;
  if (e.detail === 0 && !DEV.enterLivre) {
    const agoraMs = performance.now();
    if (agoraMs - ultimoCliqueTeclado < 100) return;
    ultimoCliqueTeclado = agoraMs;
  }
  let d = danoClique();
  const critico = Math.random() < chanceCritico();
  if (critico) d *= multCritico();
  estado.cliques++;
  const c = el.cena.getBoundingClientRect();
  let x, y;
  if (e.detail === 0) {
    const p = posMonstro();
    x = p.x;
    y = p.y;
  } else {
    x = e.clientX - c.left;
    y = e.clientY - c.top;
  }
  som(critico ? "crit" : "clique");
  animarMembro("pip");
  causarDano(d, critico ? "crit" : "clique", x, y);
});

/* =========================================================
   Heróis
   ========================================================= */

let linhas = [];

function montarHerois() {
  el.listaHerois.innerHTML = herois
    .map(
      (h) =>
        '<li hidden><button type="button" class="heroi-item" data-id="' +
        h.id +
        '">' +
        '<span class="heroi-foto"><canvas data-sprite="' +
        h.sprite +
        '"></canvas></span>' +
        '<span class="heroi-info">' +
        '<span class="heroi-nome"><span class="heroi-titulo" dir="auto">' +
        h.nome +
        '</span><em class="heroi-nivel"></em></span>' +
        '<span class="heroi-desc"></span><span class="heroi-prox"></span></span>' +
        '<span class="heroi-compra"><span class="heroi-acao"></span><span class="heroi-custo"></span></span>' +
        "</button></li>",
    )
    .join("");
  el.listaHerois
    .querySelectorAll("canvas[data-sprite]")
    .forEach((c) => desenharSprite(c, c.dataset.sprite));
  linhas = herois.map((h) => {
    const btn = el.listaHerois.querySelector('[data-id="' + h.id + '"]');
    return {
      h,
      btn,
      li: btn.parentElement,
      titulo: btn.querySelector(".heroi-titulo"),
      foto: btn.querySelector("canvas"),
      nivel: btn.querySelector(".heroi-nivel"),
      desc: btn.querySelector(".heroi-desc"),
      prox: btn.querySelector(".heroi-prox"),
      acao: btn.querySelector(".heroi-acao"),
      custo: btn.querySelector(".heroi-custo"),
    };
  });
}

/* Heróis escondidos: só aparecem os contratados e a silhueta do próximo.
   O primeiro herói da lista (Pip) é sempre mostrado inteiro. */
function estadoVisivel(h) {
  if (nivel(h.id) > 0) return "aberto";
  const prox = herois.find((x) => nivel(x.id) === 0);
  if (h !== prox) return "oculto";
  return h === herois[0] ? "aberto" : "silhueta";
}

function atualizarHerois() {
  for (const l of linhas) {
    const { h } = l;
    const n = nivel(h.id);
    const vis = estadoVisivel(h);
    l.li.hidden = vis === "oculto";
    l.btn.classList.toggle("silhueta", vis === "silhueta");
    if (vis === "oculto") continue;
    const { k, total } = calcLote(h);
    const marco = marcos.find((m) => m.nivel > n);

    l.btn.classList.toggle("novo", n === 0);
    txt(l.titulo, vis === "silhueta" ? "???" : h.nome);
    l.btn.setAttribute("aria-label", vis === "silhueta" ? "Herói misterioso" : h.nome);
    l.nivel.textContent = n > 0 ? "Nv " + fmtNivelHeroi(n) : "";
    l.nivel.title = n > 0 ? "Nível completo: " + Math.floor(n).toLocaleString("pt-BR") : "";
    if (vis === "silhueta") {
      l.desc.textContent = "Um herói misterioso quer se juntar a você...";
    } else if (h.tipo === "clique") {
      l.desc.textContent =
        n > 0
          ? "Dano por clique: +" + fmt(forcaHeroi(h))
          : "Cada nível: +" + fmt(h.forca) + " por clique";
    } else {
      l.desc.textContent =
        n > 0
          ? fmt(forcaHeroi(h)) + " de dano por segundo"
          : "Dá " + fmt(h.forca) + " de dano por segundo por nível";
    }
    l.prox.textContent =
      marco && vis !== "silhueta"
        ? "Próximo bônus: x" + marco.f + " no nível " + marco.nivel
        : "";
    l.acao.textContent =
      n === 0
        ? "Contratar"
        : k > 1
          ? "Subir +" + fmtNivelHeroi(k) + " níveis"
          : "Subir nível";
    l.custo.textContent = fmt(total);
    l.btn.setAttribute("aria-disabled", String(estado.ouro < total));
  }
}

function comprarHeroi(id) {
  const h = heroiPorId(id);
  const { k, total } = calcLote(h);
  if (k <= 0 || !Number.isFinite(total) || estado.ouro < total) {
    som("erro");
    return;
  }
  const antes = nivel(id);
  estado.ouro -= total;
  estado.herois[id] = antes + k;
  som("compra");
  const primeiroNome = h.nome.split(",")[0];
  if (antes === 0) {
    entrarNoGrupo(id);
    if (PASSIVAS_ELEMENTAIS[id]) {
      if (!estado.passivasAvisos) estado.passivasAvisos = {};
      estado.passivasAvisos[id] = true;
      atualizarAbasArvore();
      salvar(false);
    }
    const linha = linhas.find((x) => x.h.id === id);
    if (linha) {
      linha.li.classList.remove("revelado");
      void linha.li.offsetWidth;
      linha.li.classList.add("revelado");
    }
    toast(primeiroNome + " entrou para o grupo!");
  }
  for (const mk of marcos) {
    if (antes < mk.nivel && antes + k >= mk.nivel)
      toast(
        primeiroNome + " chegou ao nível " + mk.nivel + ": dano x" + mk.f + "!",
      );
  }
  renderTudo();
}

el.listaHerois.addEventListener("click", (e) => {
  const item = e.target.closest(".heroi-item");
  if (item) comprarHeroi(item.dataset.id);
});

document.querySelectorAll(".btn-qtd").forEach((b) => {
  b.addEventListener("click", () => {
    estado.modo = b.dataset.modo;
    renderModo();
    atualizarHerois();
  });
});

function renderModo() {
  document
    .querySelectorAll(".btn-qtd")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.modo === estado.modo)),
    );
}

/* ---------- Painel do Grupo (um lugarzinho para cada herói) ---------- */

let slots = {};

function txt(no, valor) {
  if (no.textContent !== valor) no.textContent = valor;
}

function montarGrupo() {
  el.grupoGrade.innerHTML = herois
    .map(
      (h) =>
        '<div class="slot bloqueado" hidden data-id="' +
        h.id +
        '">' +
        '<span class="slot-palco"><canvas class="membro" data-sprite="' + h.sprite + '" data-heroi="' + h.id + '"></canvas></span>' +
        '<span class="slot-nome" dir="auto">' +
        h.nome.split(",")[0] +
        "</span>" +
        '<span class="slot-nivel"></span>' +
        '<span class="slot-info"></span>' +
        '<span class="slot-barra"><span></span></span>' +
        "</div>",
    )
    .join("");
  slots = {};
  for (const h of herois) {
    const s = el.grupoGrade.querySelector('[data-id="' + h.id + '"]');
    const c = s.querySelector("canvas");
    c.style.animationDelay = (-Math.random() * 1.1).toFixed(2) + "s";
    // quando o golpe termina, volta a balançar (com um atraso novo)
    c.addEventListener("animationend", (e) => {
      if (e.animationName !== "ataca") return;
      c.classList.remove("ataca");
      c.style.animationDelay = (-Math.random() * 1.1).toFixed(2) + "s";
    });
    desenharSpriteHeroiEquipado(c, h.sprite, h.id);
    slots[h.id] = {
      s,
      c,
      nome: s.querySelector(".slot-nome"),
      nivel: s.querySelector(".slot-nivel"),
      info: s.querySelector(".slot-info"),
      barra: s.querySelector(".slot-barra span"),
    };
  }
  atualizarGrupo();
}

function atualizarGrupo() {
  let contratados = 0;
  for (const h of herois) {
    const sl = slots[h.id];
    if (!sl) continue;
    const n = nivel(h.id);
    const aberto = n > 0;
    if (aberto) contratados++;
    const vis = estadoVisivel(h);
    sl.s.hidden = vis === "oculto";
    if (vis === "oculto") continue;
    sl.s.classList.toggle("bloqueado", !aberto);
    sl.s.classList.toggle("silhueta", vis === "silhueta");
    sl.s.classList.toggle("pronto", !aberto && estado.ouro >= custoNivel(h, 0));
    txt(sl.nome, vis === "silhueta" ? "???" : h.nome.split(",")[0]);
    if (aberto) {
      txt(sl.nivel, "Nv " + fmtNivelHeroi(n));
      sl.nivel.title = "Nível completo: " + Math.floor(n).toLocaleString("pt-BR");
      txt(
        sl.info,
        h.tipo === "clique"
          ? "+" + fmt(forcaHeroi(h)) + "/clique"
          : fmt(forcaHeroi(h)) + "/s",
      );
    } else {
      txt(sl.nivel, vis === "silhueta" ? "Misterioso" : "Bloqueado");
      sl.nivel.removeAttribute("title");
      txt(sl.info, "Custa " + fmt(custoNivel(h, 0)));
    }
    // barrinha do ciclo de ataque (só heróis que atacam sozinhos)
    const p = aberto && h.tipo === "dps" ? Math.min(1, acumulador[h.id] || 0) : 0;
    sl.barra.style.transform = "scaleX(" + p.toFixed(2) + ")";
  }
  txt(el.grupoConta, contratados + (contratados === 1 ? " herói" : " heróis"));
  txt(el.grupoDps, fmt(dps()));
}

function entrarNoGrupo(id) {
  atualizarGrupo();
  const sl = slots[id];
  if (!sl) return;
  sl.s.classList.remove("entra");
  void sl.s.offsetWidth;
  sl.s.classList.add("entra");
  setTimeout(() => sl.s.classList.remove("entra"), 700);
}

function animarMembro(id) {
  const sl = slots[id];
  if (!sl || nivel(id) <= 0) return;
  sl.c.classList.remove("ataca");
  sl.c.style.animationDelay = "0s"; // o atraso negativo do balanço comia o golpe
  void sl.c.offsetWidth;
  sl.c.classList.add("ataca");
}


/* =========================================================
   Talentos (árvore de habilidades)
   ========================================================= */

const gastos = () =>
  talentos.reduce((s, t) => s + (estado.talentos[t.id] || 0) * t.custo, 0);
const pontosLivres = () => estado.pontosGanhos - gastos();
const rankTalento = (id) => estado.talentos[id] || 0;
const recalcularBonus = () => {
  B = bonusArvore(estado.talentos);
};

function ganharPontosChefe(z) {
  if (z <= estado.chefeMax) return;
  estado.chefeMax = z;
  const p = pontosDoChefe(z);
  estado.pontosGanhos += p;
  toast("Chefe derrotado! +" + p + (p === 1 ? " ponto" : " pontos") + " de talento");
  atualizarSelo();
  if (!el.arvore.hidden) renderArvore();
}

function atualizarSelo() {
  const p = pontosLivres();
  el.seloPontos.hidden = p <= 0;
  txt(el.seloPontos, String(p));
  el.btnArvore.classList.toggle("tem-pontos", p > 0);
}

let talentoEmFoco = null;
let nosTalento = {};
let modoArvore = "principal";
let passivasAvisoAtual = [];

const RAMOS_PRINCIPAIS = RAMOS.filter((r) => !r.heroi);
const RAMOS_PASSIVAS = RAMOS.filter((r) => !!r.heroi);
const talentosDaArvoreAtual = () => {
  const ids = new Set(ramosDaArvoreAtual().map((r) => r.id));
  return talentos.filter((t) => ids.has(t.ramo));
};
const ramosDaArvoreAtual = () =>
  modoArvore === "principal"
    ? RAMOS_PRINCIPAIS
    : RAMOS_PASSIVAS.filter((r) => nivel(r.heroi) > 0);

function atualizarAbasArvore() {
  const temPassivas = RAMOS_PASSIVAS.some((r) => nivel(r.heroi) > 0);
  if (el.arvoreModoPassivas) el.arvoreModoPassivas.hidden = !temPassivas;
  if (el.arvoreConsultarPassivas) el.arvoreConsultarPassivas.hidden = modoArvore !== "passivas" || !temPassivas;
  if (!temPassivas && modoArvore === "passivas") modoArvore = "principal";
  if (el.arvoreModoPrincipal) {
    el.arvoreModoPrincipal.classList.toggle("ativo", modoArvore === "principal");
    el.arvoreModoPrincipal.setAttribute("aria-selected", String(modoArvore === "principal"));
  }
  if (el.arvoreModoPassivas) {
    el.arvoreModoPassivas.classList.toggle("ativo", modoArvore === "passivas");
    el.arvoreModoPassivas.setAttribute("aria-selected", String(modoArvore === "passivas"));
  }
}

function profundidadeTalento(t, vistos = new Set()) {
  if (!t || !t.req || vistos.has(t.id)) return 0;
  vistos.add(t.id);
  const pai = talentoPorId(t.req);
  return pai ? 1 + profundidadeTalento(pai, vistos) : 0;
}

function direcaoRamoArvore(r) {
  if (modoArvore === "passivas") {
    return r.id === "purificacao" ? { x: -1, y: 0 } : { x: 1, y: 0 };
  }
  return {
    punho: { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
    grupo: { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
    fortuna: { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
    mestria: { x: Math.SQRT1_2, y: Math.SQRT1_2 },
  }[r.id] || { x: 0, y: -1 };
}

function centroArvoreAtual() {
  return modoArvore === "passivas" ? { x: 880, y: 560 } : { x: 950, y: 750 };
}

/*
 * Distribuição automática dos ramos no mesmo padrão visual de Mestria:
 * - o nó raiz fica próximo ao núcleo;
 * - os caminhos-filhos se abrem para fora, em leques simétricos;
 * - nós em sequência permanecem alinhados no mesmo corredor;
 * - quando um nó se divide, seus descendentes ocupam faixas próprias.
 *
 * A ordem lateral entre irmãos usa pos[0] apenas como preferência de leitura.
 * A geometria deixa de depender de coordenadas manuais por habilidade, então
 * novos nós podem ser adicionados apenas indicando seu pré-requisito (req).
 */
function faixasRadiaisDoRamo(r) {
  const lista = talentos.filter((t) => t.ramo === r.id);
  const porId = new Map(lista.map((t) => [t.id, t]));
  const filhos = new Map(lista.map((t) => [t.id, []]));
  for (const t of lista) {
    if (t.req && filhos.has(t.req)) filhos.get(t.req).push(t);
  }
  for (const arr of filhos.values()) {
    arr.sort((a, b) => ((a.pos && a.pos[0]) ?? 1) - ((b.pos && b.pos[0]) ?? 1) || a.id.localeCompare(b.id));
  }

  const raizes = lista.filter((t) => !t.req || !porId.has(t.req));
  const folhas = [];
  const coletarFolhas = (t, vistos = new Set()) => {
    if (!t || vistos.has(t.id)) return;
    vistos.add(t.id);
    const descendentes = filhos.get(t.id) || [];
    if (!descendentes.length) {
      folhas.push(t);
      return;
    }
    descendentes.forEach((filho) => coletarFolhas(filho, vistos));
  };
  raizes.forEach((raiz) => coletarFolhas(raiz));

  // Proteção para estruturas futuras que tenham algum nó desconectado.
  for (const t of lista) if (!folhas.some((f) => f.id === t.id) && !(filhos.get(t.id) || []).length) folhas.push(t);

  const faixaFolha = new Map();
  const quantidade = folhas.length;
  const amplitude = quantidade <= 1 ? 0 : Math.max(1, (quantidade - 1) / 2);
  folhas.forEach((folha, i) => {
    const lane = quantidade <= 1 ? 0 : -amplitude + (2 * amplitude * i) / (quantidade - 1);
    faixaFolha.set(folha.id, lane);
  });

  const memo = new Map();
  const coletarFaixasDescendentes = (t, vistos = new Set()) => {
    if (!t || vistos.has(t.id)) return [];
    vistos.add(t.id);
    const descendentes = filhos.get(t.id) || [];
    if (!descendentes.length) return [faixaFolha.get(t.id) ?? 0];
    return descendentes.flatMap((filho) => coletarFaixasDescendentes(filho, vistos));
  };
  const faixaDoNo = (t) => {
    if (memo.has(t.id)) return memo.get(t.id);
    if (!filhos.get(t.id)?.length) {
      const valor = faixaFolha.get(t.id) ?? 0;
      memo.set(t.id, valor);
      return valor;
    }
    const valores = coletarFaixasDescendentes(t);
    const valor = valores.length ? valores.reduce((s, v) => s + v, 0) / valores.length : 0;
    memo.set(t.id, valor);
    return valor;
  };

  const resultado = new Map();
  for (const t of lista) resultado.set(t.id, faixaDoNo(t));
  return resultado;
}

let faixasRadiaisArvore = new Map();

function posicaoTalentoRadial(r, t) {
  // Todos os ramos usam a mesma geometria. A Mestria é o modelo: cada trilha
  // abre seus caminhos em leque, mantendo cada sequência alinhada para fora.
  const centro = centroArvoreAtual();
  const dir = direcaoRamoArvore(r);
  const perp = { x: -dir.y, y: dir.x };
  const profundidade = profundidadeTalento(t);
  const especial = modoArvore === "passivas";
  const raioInicial = especial ? 218 : 246;
  const passoRadial = especial ? 196 : 190;
  const raio = raioInicial + profundidade * passoRadial;
  const faixaLateral = especial ? 112 : 130;
  const lane = faixasRadiaisArvore.get(t.ramo)?.get(t.id) ?? 0;
  const lateral = lane * faixaLateral;

  return {
    x: Math.round(centro.x + dir.x * raio + perp.x * lateral),
    y: Math.round(centro.y + dir.y * raio + perp.y * lateral),
  };
}

function posicaoTituloRamo(r) {
  if (modoArvore === "passivas") {
    return r.id === "purificacao"
      ? { x: 90, y: 505, align: "left" }
      : { x: 1320, y: 505, align: "right" };
  }
  return {
    punho: { x: 125, y: 95, align: "left" },
    grupo: { x: 1450, y: 95, align: "right" },
    fortuna: { x: 125, y: 1350, align: "left" },
    mestria: { x: 1450, y: 1350, align: "right" },
  }[r.id] || { x: 100, y: 100, align: "left" };
}

function talentoVisivel(t) {
  if (!t) return false;
  if (t.heroi && nivel(t.heroi) <= 0) return false;
  // A primeira habilidade de cada categoria é a raiz. Os próximos nós
  // só aparecem quando o pré-requisito imediato é comprado.
  return !t.req || rankTalento(t.req) > 0;
}

function htmlRamoArvore(r) {
  const titulo = posicaoTituloRamo(r);
  return (
    // Cada ramo ocupa o tabuleiro inteiro: os nós e os SVGs usam coordenadas
    // globais do tabuleiro, nunca a origem de um painel deslocado.
    // Os setores não criam mais caixas de posicionamento independentes.
    // Títulos e grades são posicionados diretamente no mesmo tabuleiro global.
    '<div class="ramo ramo-radial" data-ramo-painel="' + r.id + '" style="--cor:' + r.cor + '">' +
      '<h3 style="left:' + titulo.x + 'px;top:' + titulo.y + 'px;text-align:' + titulo.align + '">' + r.nome + '<small>' + r.dica + '</small></h3>' +
      '<div class="ramo-grade" data-ramo="' + r.id + '"><svg class="ramo-linhas" aria-hidden="true"></svg>' +
      talentos.filter((t) => t.ramo === r.id).map((t) => {
        const pos = posicaoTalentoRadial(r, t);
        return '<button type="button" class="talento" data-id="' + t.id + '" data-raiz="' + String(!t.req) + '" style="left:' + (pos.x - 29) + 'px;top:' + (pos.y - 29) + 'px"><canvas class="talento-icone"></canvas><span class="talento-nivel"></span></button>';
      }).join("") +
      '</div></div>'
  );
}

function montarEstruturaArvore() {
  const ramos = ramosDaArvoreAtual();
  const especial = modoArvore === "passivas";
  // Recalcula os leques uma vez ao montar a tela. Todos seguem o mesmo padrão
  // de organização da Mestria, inclusive quando novas habilidades forem criadas.
  faixasRadiaisArvore = new Map(ramos.map((r) => [r.id, faixasRadiaisDoRamo(r)]));
  // A árvore de passivas usa sempre o mesmo tabuleiro, com uma ou duas raízes.
  // Não há mais layout alternativo quando o segundo herói é contratado.
  el.arvoreRamos.dataset.modo = modoArvore;
  el.arvoreRamos.classList.remove("uma-ramificacao");
  el.arvoreRamos.innerHTML =
    '<svg class="arvore-conexoes-centro" aria-hidden="true"></svg>' +
    '<div class="arvore-nucleo"><canvas class="arvore-nucleo-icone"></canvas><b>' +
      (especial ? "CHAMAS" : "EXPEDIÇÃO") + '</b><small>' +
      (especial ? "Poderes elementais" : "Caminhos do herói") + '</small></div>' +
    ramos.map(htmlRamoArvore).join("");

  const iconeNucleo = el.arvoreRamos.querySelector(".arvore-nucleo-icone");
  desenharIcone(iconeNucleo, especial ? "sword" : "totemNucleo");

  nosTalento = {};
  for (const t of talentosDaArvoreAtual()) {
    const b = el.arvoreRamos.querySelector('.talento[data-id="' + t.id + '"]');
    if (!b) continue;
    desenharIcone(b.querySelector("canvas"), t.icone);
    nosTalento[t.id] = { b, nivel: b.querySelector(".talento-nivel") };
  }
  if (!nosTalento[talentoEmFoco]) talentoEmFoco = talentosDaArvoreAtual()[0]?.id || null;
  if (el.arvoreTitulo) el.arvoreTitulo.textContent = especial ? "Passivas Especiais" : "Árvore de Talentos";
  if (el.arvoreDica) el.arvoreDica.textContent = especial
    ? "Duas chamas, dois caminhos de aprimoramento."
    : "Quatro caminhos partem do núcleo e crescem conforme suas escolhas.";
  atualizarAbasArvore();
}

function montarArvore() {
  modoArvore = "principal";
  montarEstruturaArvore();
}

function textoTalento(t, n) {
  const ks = Object.keys(t.efeito);
  const v = (i) => {
    const x = t.efeito[ks[i]] * n;
    return Number.isInteger(x) ? x : x.toFixed(1);
  };
  return t.desc.replace("{v}", v(0)).replace("{v2}", ks[1] ? v(1) : "");
}

function mostrarInfoTalento(id) {
  const t = talentoPorId(id);
  if (!t) return;
  talentoEmFoco = id;
  const n = rankTalento(id);
  let h = "<b>" + t.nome + "</b> <span>nível " + n + "/" + t.max + "</span><br>";
  if (n > 0) h += "Agora: " + textoTalento(t, n) + "<br>";
  if (n < t.max) {
    h += "Próximo nível: " + textoTalento(t, n + 1) + " · custa " + t.custo + (t.custo === 1 ? " ponto" : " pontos");
    if (t.heroi && nivel(t.heroi) <= 0)
      h += '<br><em>Requer contratar: ' + heroiPorId(t.heroi).nome + "</em>";
    else if (t.req && rankTalento(t.req) <= 0)
      h += '<br><em>Requer: ' + talentoPorId(t.req).nome + "</em>";
  } else {
    h += "<em>Nível máximo</em>";
  }
  el.arvoreInfo.innerHTML = h;
}

function renderArvore() {
  atualizarAbasArvore();
  const livres = pontosLivres();
  txt(el.arvorePontos, String(livres));
  for (const r of ramosDaArvoreAtual()) {
    const grade = el.arvoreRamos.querySelector('.ramo-grade[data-ramo="' + r.id + '"]');
    const painel = grade && grade.closest(".ramo");
    if (painel) painel.classList.remove("ramo-bloqueado");
  }
  for (const t of talentosDaArvoreAtual()) {
    const n = rankTalento(t.id);
    const no = nosTalento[t.id];
    if (!no) continue;
    const visivel = talentoVisivel(t);
    no.b.hidden = !visivel;
    no.b.dataset.visivel = String(visivel);
    if (!visivel) continue;
    const liberado = !t.req || rankTalento(t.req) > 0;
    let st = "trava";
    if (n >= t.max) st = "max";
    else if (liberado) st = livres >= t.custo ? "ok" : "falta";
    no.b.dataset.estado = st;
    no.b.dataset.comprado = String(n > 0);
    txt(no.nivel, n + "/" + t.max);
    no.b.setAttribute("aria-label", t.nome + ", nível " + n + " de " + t.max);
  }
  desenharLinhasArvore();
  // Recalcula após o navegador aplicar hidden/visibilidade e compor as duas
  // grades no mesmo frame. Evita SVGs com medidas antigas após contratar herói.
  if (!el.arvore.hidden) requestAnimationFrame(() => {
    if (!el.arvore.hidden) desenharLinhasArvore();
  });
  const foco = talentoEmFoco && nosTalento[talentoEmFoco] && !nosTalento[talentoEmFoco].b.hidden
    ? talentoEmFoco
    : null;
  if (foco) mostrarInfoTalento(foco);
  else {
    const primeiro = talentosDaArvoreAtual().find(talentoVisivel);
    talentoEmFoco = primeiro ? primeiro.id : null;
    if (primeiro) mostrarInfoTalento(primeiro.id);
    else el.arvoreInfo.textContent = "Contrate Padre Thalles ou pedrinhoo07140 para descobrir uma passiva especial.";
  }
}

function desenharLinhasArvore() {
  const NS = "http://www.w3.org/2000/svg";
  el.arvoreRamos.querySelectorAll(".ramo-grade").forEach((g) => {
    const svg = g.querySelector("svg");
    svg.setAttribute("width", g.offsetWidth);
    svg.setAttribute("height", g.offsetHeight);
    svg.setAttribute("viewBox", "0 0 " + g.offsetWidth + " " + g.offsetHeight);
    svg.innerHTML = "";
    for (const t of talentosDaArvoreAtual()) {
      if (t.ramo !== g.dataset.ramo || !t.req || !talentoVisivel(t)) continue;
      const pai = nosTalento[t.req];
      const filho = nosTalento[t.id];
      if (!pai || !filho || pai.b.hidden || filho.b.hidden) continue;
      const a = pai.b, b = filho.b;
      // Cada SVG calcula seus pontos em relação à própria grade. Como todas
      // as grades ocupam o tabuleiro inteiro, essa origem é estável mesmo
      // quando uma segunda árvore de passiva aparece.
      const gradeRect = g.getBoundingClientRect();
      const centroNo = (botao) => {
        const rect = botao.getBoundingClientRect();
        return {
          x: rect.left - gradeRect.left + rect.width / 2,
          y: rect.top - gradeRect.top + rect.height / 2,
        };
      };
      const pa = centroNo(a);
      const pb = centroNo(b);
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", pa.x);
      l.setAttribute("y1", pa.y);
      l.setAttribute("x2", pb.x);
      l.setAttribute("y2", pb.y);
      l.setAttribute("class", rankTalento(t.req) > 0 ? "on" : "off");
      l.dataset.de = t.req;
      l.dataset.para = t.id;
      svg.appendChild(l);
    }
  });
  desenharConexoesNucleo();
}

function desenharConexoesNucleo() {
  const NS = "http://www.w3.org/2000/svg";
  const svg = el.arvoreRamos.querySelector(".arvore-conexoes-centro");
  const nucleo = el.arvoreRamos.querySelector(".arvore-nucleo");
  if (!svg || !nucleo) return;
  const largura = el.arvoreRamos.offsetWidth;
  const altura = el.arvoreRamos.offsetHeight;
  svg.setAttribute("width", largura);
  svg.setAttribute("height", altura);
  svg.setAttribute("viewBox", "0 0 " + largura + " " + altura);
  svg.innerHTML = "";
  const nucleoRect = nucleo.getBoundingClientRect();
  const boardRect = el.arvoreRamos.getBoundingClientRect();
  const hx = nucleoRect.left - boardRect.left + nucleoRect.width / 2;
  const hy = nucleoRect.top - boardRect.top + nucleoRect.height / 2;
  for (const r of ramosDaArvoreAtual()) {
    const raiz = talentosDaArvoreAtual().find((t) => t.ramo === r.id && !t.req);
    const no = raiz && nosTalento[raiz.id];
    if (!raiz || !no || no.b.hidden) continue;
    const noRect = no.b.getBoundingClientRect();
    const ex = noRect.left - boardRect.left + noRect.width / 2;
    const ey = noRect.top - boardRect.top + noRect.height / 2;
    const dx = ex - hx, dy = ey - hy;
    const comprimento = Math.hypot(dx, dy) || 1;
    const raioNucleo = 74;
    const sx = hx + dx / comprimento * raioNucleo;
    const sy = hy + dy / comprimento * raioNucleo;
    const path = document.createElementNS(NS, "path");
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    path.setAttribute("d", "M " + sx + " " + sy + " Q " + (mx - dy * .08) + " " + (my + dx * .08) + " " + ex + " " + ey);
    path.setAttribute("stroke", r.cor);
    path.style.color = r.cor;
    path.setAttribute("class", rankTalento(raiz.id) > 0 ? "conexao-nucleo on" : "conexao-nucleo");
    svg.appendChild(path);
  }
}

function comprarTalento(id) {
  const t = talentoPorId(id);
  if (!t || !nosTalento[id] || nosTalento[id].b.hidden || !talentoVisivel(t)) return;
  const n = rankTalento(id);
  const heroiLiberado = !t.heroi || nivel(t.heroi) > 0;
  const liberado = heroiLiberado && (!t.req || rankTalento(t.req) > 0);
  if (n >= t.max || !liberado || pontosLivres() < t.custo) {
    som("erro");
    return;
  }
  estado.talentos[id] = n + 1;
  const botaoComprado = nosTalento[id] && nosTalento[id].b;
  if (botaoComprado) {
    botaoComprado.classList.remove("comprando");
    void botaoComprado.offsetWidth;
    botaoComprado.classList.add("comprando");
    botaoComprado.addEventListener("animationend", () => {
      botaoComprado.classList.remove("comprando");
    }, { once: true });
  }
  recalcularBonus();
  som("compra");
  atualizarSelo();
  renderArvore();
  renderTudo();
}

function redefinirTalentos() {
  if (gastos() === 0) return;
  estado.talentos = {};
  recalcularBonus();
  som("hab");
  toast("Talentos redefinidos: todos os pontos voltaram.");
  atualizarSelo();
  renderArvore();
  renderTudo();
}

const posicaoArvore = { x: 0, y: 0, arrastando: false, pointerId: null, inicioX: 0, inicioY: 0, baseX: 0, baseY: 0, moveu: false };

function aplicarPosicaoArvore() {
  el.arvoreRamos.style.transform = "translate3d(" + posicaoArvore.x + "px, " + posicaoArvore.y + "px, 0)";
}

function centralizarArvore() {
  const largura = el.arvoreViewport.clientWidth;
  const altura = el.arvoreViewport.clientHeight;
  const boardW = el.arvoreRamos.offsetWidth;
  const boardH = el.arvoreRamos.offsetHeight;
  posicaoArvore.x = Math.round((largura - boardW) / 2);
  posicaoArvore.y = Math.round((altura - boardH) / 2);
  aplicarPosicaoArvore();
  desenharLinhasArvore();
}

function iniciarArrasteArvore(e) {
  if (e.button !== undefined && e.button !== 0) return;
  if (e.target.closest("button, .arvore-info, .arvore-topo, .passivas-aviso-fundo")) return;
  posicaoArvore.arrastando = true;
  posicaoArvore.pointerId = e.pointerId;
  posicaoArvore.inicioX = e.clientX;
  posicaoArvore.inicioY = e.clientY;
  posicaoArvore.baseX = posicaoArvore.x;
  posicaoArvore.baseY = posicaoArvore.y;
  posicaoArvore.moveu = false;
  el.arvoreViewport.classList.add("arrastando");
  el.arvoreViewport.setPointerCapture(e.pointerId);
  e.preventDefault();
}

function moverArvore(e) {
  if (!posicaoArvore.arrastando || e.pointerId !== posicaoArvore.pointerId) return;
  const dx = e.clientX - posicaoArvore.inicioX;
  const dy = e.clientY - posicaoArvore.inicioY;
  if (Math.abs(dx) + Math.abs(dy) > 4) posicaoArvore.moveu = true;
  posicaoArvore.x = posicaoArvore.baseX + dx;
  posicaoArvore.y = posicaoArvore.baseY + dy;
  aplicarPosicaoArvore();
}

function finalizarArrasteArvore(e) {
  if (!posicaoArvore.arrastando || e.pointerId !== posicaoArvore.pointerId) return;
  posicaoArvore.arrastando = false;
  posicaoArvore.pointerId = null;
  el.arvoreViewport.classList.remove("arrastando");
  if (el.arvoreViewport.hasPointerCapture(e.pointerId)) el.arvoreViewport.releasePointerCapture(e.pointerId);
}

function conteudoPassiva(id) {
  const cfg = PASSIVAS_ELEMENTAIS[id];
  const nomeHeroi = heroiPorId(id).nome;
  const cor = id === "padre" ? "#e7a34d" : "#b58aff";
  const adversarios = "mortos-vivos e criaturas de fogo ou lava";
  return '<article class="passiva-cartao" style="--passiva-cor:' + cor + '">' +
    '<h3>' + cfg.nome + '</h3>' +
    '<p>Uma passiva elemental ligada a <b>' + nomeHeroi + '</b>. Ela tem <b>8% de chance</b> de ser aplicada quando esse herói ataca.</p>' +
    '<ul><li>Permanece por <b>3 segundos</b>.</li><li>Aplica dano a cada <b>0,5 segundo</b>, começando em <b>16% do dano de um ataque</b> do herói por pulso.</li><li>Causa <b>35% de dano adicional</b> contra ' + adversarios + '.</li><li>Tem <b>18 segundos de recarga</b> inicial.</li></ul>' +
    '<p class="passiva-cartao-nota">Para ativar a passiva, compre primeiro o nó <b>' + cfg.nome + '</b> nesta ramificação. Os nós seguintes melhoram dano, recarga e duração.</p>' +
    '</article>';
}

function abrirAvisoPassivas(ids, novidade) {
  const validos = ids.filter((id) => PASSIVAS_ELEMENTAIS[id] && nivel(id) > 0);
  if (!validos.length) return;
  passivasAvisoAtual = novidade ? validos : [];
  el.passivasAvisoEtiqueta.textContent = novidade ? "NOVA DESCOBERTA" : "GUIA DE PASSIVAS";
  el.passivasAvisoTitulo.textContent = novidade
    ? (validos.length > 1 ? "Duas novas chamas despertaram" : "Uma nova chama despertou")
    : "Como funcionam as passivas elementais";
  el.passivasAvisoConteudo.innerHTML = validos.map(conteudoPassiva).join("");
  el.passivasAvisoVerArvore.hidden = modoArvore === "passivas";
  el.passivasAviso.hidden = false;
  el.passivasAvisoFechar.focus();
}

function avisosPassivasPendentes() {
  const flags = estado.passivasAvisos || {};
  return Object.keys(PASSIVAS_ELEMENTAIS).filter((id) => nivel(id) > 0 && flags[id] === true);
}

function fecharAvisoPassivas() {
  if (passivasAvisoAtual.length) {
    if (!estado.passivasAvisos) estado.passivasAvisos = {};
    for (const id of passivasAvisoAtual) delete estado.passivasAvisos[id];
    salvar(false);
  }
  passivasAvisoAtual = [];
  el.passivasAviso.hidden = true;
}

function abrirArvore() {
  atualizarAbasArvore();
  montarEstruturaArvore();
  renderArvore();
  el.arvore.hidden = false;
  document.body.classList.add("modal-aberto");
  requestAnimationFrame(() => centralizarArvore());
  const pendentes = avisosPassivasPendentes();
  if (pendentes.length) setTimeout(() => abrirAvisoPassivas(pendentes, true), 120);
  el.arvoreFechar.focus();
}

function fecharArvore() {
  el.passivasAviso.hidden = true;
  el.arvore.hidden = true;
  document.body.classList.remove("modal-aberto");
  el.btnArvore.focus();
}

function trocarModoArvore(modo) {
  if (modo === "passivas" && !RAMOS_PASSIVAS.some((r) => nivel(r.heroi) > 0)) return;
  modoArvore = modo;
  talentoEmFoco = null;
  montarEstruturaArvore();
  renderArvore();
  requestAnimationFrame(() => centralizarArvore());
}

el.btnArvore.addEventListener("click", abrirArvore);
el.arvoreFechar.addEventListener("click", fecharArvore);
el.arvoreRedefinir.addEventListener("click", redefinirTalentos);
el.arvoreCentralizar.addEventListener("click", centralizarArvore);
el.arvoreModoPrincipal.addEventListener("click", () => trocarModoArvore("principal"));
el.arvoreModoPassivas.addEventListener("click", () => trocarModoArvore("passivas"));
el.arvoreConsultarPassivas.addEventListener("click", () => {
  abrirAvisoPassivas(Object.keys(PASSIVAS_ELEMENTAIS).filter((id) => nivel(id) > 0), false);
});
el.passivasAvisoFechar.addEventListener("click", fecharAvisoPassivas);
el.passivasAvisoVerArvore.addEventListener("click", () => {
  fecharAvisoPassivas();
  trocarModoArvore("passivas");
});
el.passivasAviso.addEventListener("click", (e) => {
  if (e.target === el.passivasAviso) fecharAvisoPassivas();
});
el.arvore.addEventListener("click", (e) => {
  if (e.target === el.arvore) fecharArvore();
});
el.arvoreViewport.addEventListener("pointerdown", iniciarArrasteArvore);
el.arvoreViewport.addEventListener("pointermove", moverArvore);
el.arvoreViewport.addEventListener("pointerup", finalizarArrasteArvore);
el.arvoreViewport.addEventListener("pointercancel", finalizarArrasteArvore);
el.arvoreRamos.addEventListener("click", (e) => {
  const b = e.target.closest(".talento");
  if (b) {
    mostrarInfoTalento(b.dataset.id);
    comprarTalento(b.dataset.id);
  }
});
el.arvoreRamos.addEventListener("mouseover", (e) => {
  const b = e.target.closest(".talento");
  if (b) mostrarInfoTalento(b.dataset.id);
});
el.arvoreRamos.addEventListener("focusin", (e) => {
  const b = e.target.closest(".talento");
  if (b) mostrarInfoTalento(b.dataset.id);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !el.passivasAviso.hidden) fecharAvisoPassivas();
  else if (e.key === "Escape" && !el.arvore.hidden) fecharArvore();
  else if (
    (e.key === "t" || e.key === "T") &&
    !e.ctrlKey && !e.metaKey && !e.altKey && !digitando(e) && !pausado
  ) el.arvore.hidden ? abrirArvore() : fecharArvore();
});

window.addEventListener("resize", () => {
  if (!el.arvore.hidden) desenharLinhasArvore();
  requestAnimationFrame(atualizarCamadasProfundidadeAcampamento);
});

/* =========================================================
   Habilidades
   ========================================================= */

function montarHabilidades() {
  el.habilidades.innerHTML = habilidades
    .map(
      (h) =>
        '<button type="button" class="hab" data-id="' +
        h.id +
        '" data-estado="pronto">' +
        '<span class="hab-nome">' +
        '<canvas class="hab-icone" data-icone="' +
        h.icone +
        '" aria-hidden="true"></canvas>' +
        '<span class="hab-titulo">' +
        h.nome +
        '</span><kbd>' +
        h.tecla +
        "</kbd></span>" +
        '<span class="hab-dica">' +
        h.dica() +
        "</span>" +
        '<span class="hab-estado">Pronto</span><span class="hab-barra"></span></button>',
    )
    .join("");

  // Reutiliza os mesmos sprites de 8x8 que aparecem no tutorial.
  el.habilidades
    .querySelectorAll("canvas[data-icone]")
    .forEach((canvas) => desenharIcone(canvas, canvas.dataset.icone));
}

function usarHabilidade(id) {
  const h = habilidades.find((x) => x.id === id);
  const agora = relogio();
  if (pausado || !h || (estado.cdFim[id] || 0) > agora) return;
  estado.cdFim[id] = agora + cdHab(h) * 1000;
  if (h.dur) estado.ativoFim[id] = agora + durHab(h) * 1000;

  if (id === "raio") {
    som("raio");
    const r = document.createElement("div");
    r.className = "relampago";
    el.cena.appendChild(r);
    setTimeout(() => r.remove(), 450);
    causarDano((danoBase() * 30 + dps() * 5) * (1 + B.raio / 100), "raio");
  } else {
    som("hab");
    toast(h.nome + " ativada!");
  }
  renderHabilidades();
}

el.habilidades.addEventListener("click", (e) => {
  const b = e.target.closest(".hab");
  if (b) usarHabilidade(b.dataset.id);
});

// teclas de atalho não valem enquanto o jogador digita (login, painel dev...)
const digitando = (e) =>
  !!(e.target && e.target.closest && e.target.closest("input, textarea, select"));

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || digitando(e)) return;
  const h = habilidades.find((x) => x.tecla === e.key);
  if (h) usarHabilidade(h.id);
});

function renderHabilidades() {
  const agora = relogio();
  el.habilidades.querySelectorAll(".hab").forEach((b) => {
    const h = habilidades.find((x) => x.id === b.dataset.id);
    const cdRest = (estado.cdFim[h.id] || 0) - agora;
    const atvRest = (estado.ativoFim[h.id] || 0) - agora;
    let st, texto, p;
    if (atvRest > 0) {
      st = "ativo";
      texto = "Ativo: " + Math.ceil(atvRest / 1000) + " s";
      p = (atvRest / (durHab(h) * 1000)) * 100;
    } else if (cdRest > 0) {
      st = "recarga";
      texto = "Recarga: " + Math.ceil(cdRest / 1000) + " s";
      p = (1 - cdRest / (cdHab(h) * 1000)) * 100;
    } else {
      st = "pronto";
      texto = "Pronto";
      p = 100;
    }
    b.dataset.estado = st;
    b.querySelector(".hab-estado").textContent = texto;
    b.style.setProperty("--p", p.toFixed(1) + "%");
  });
  el.cena.classList.toggle("furia", ativo("furia"));
  // dicas mudam com os talentos
  el.habilidades.querySelectorAll(".hab").forEach((b) => {
    const h = habilidades.find((x) => x.id === b.dataset.id);
    const d = b.querySelector(".hab-dica");
    if (d && d.textContent !== h.dica()) d.textContent = h.dica();
  });
}

/* =========================================================
   Efeitos visuais
   ========================================================= */

function posMonstro() {
  const c = el.cena.getBoundingClientRect();
  const m = el.monstro.getBoundingClientRect();
  return {
    x: m.left + m.width / 2 - c.left,
    y: m.top + m.height * 0.4 - c.top,
  };
}

function flutuar(texto, classe, x, y) {
  if (x === undefined) {
    const p = posMonstro();
    x = p.x + (Math.random() * 70 - 35);
    y = p.y + (Math.random() * 30 - 15);
  }
  const s = document.createElement("span");
  s.className = "dano " + classe;
  s.textContent = texto;
  s.style.left = x + "px";
  s.style.top = y + "px";
  el.cena.appendChild(s);
  setTimeout(() => s.remove(), 1200);
}

// As brasas são desenhadas dentro de uma camada dedicada sobre o sprite do monstro.
// Assim elas acompanham o alvo e não dependem da camada/ordem de pintura da cena.
function emitirParticulasElementais(classe, quantidade = 6) {
  if (!monstro || monstro.morrendo) return;
  const camada = el.monstroEfeitos || el.monstro;
  if (!camada) return;

  for (let i = 0; i < quantidade; i++) {
    const particula = document.createElement("span");
    const duracao = 650 + Math.random() * 350;
    const dx = (Math.random() - 0.5) * 54;
    const dy = -24 - Math.random() * 48;
    // Nascem perto da base/laterais do inimigo e sobem em direções diferentes.
    particula.className = "particula-elemental " + classe;
    particula.style.left = (22 + Math.random() * 56).toFixed(1) + "%";
    particula.style.top = (58 + Math.random() * 30).toFixed(1) + "%";
    particula.style.setProperty("--particula-dx", dx.toFixed(1) + "px");
    particula.style.setProperty("--particula-dy", dy.toFixed(1) + "px");
    particula.style.setProperty("--particula-rot", (Math.random() * 180 - 90).toFixed(0) + "deg");
    particula.style.animationDuration = duracao.toFixed(0) + "ms";
    camada.appendChild(particula);
    setTimeout(() => particula.remove(), duracao + 100);
  }
}

function moedas(n) {
  const p = posMonstro();
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "moeda";
    s.style.left = p.x + "px";
    s.style.top = p.y + 24 + "px";
    s.style.setProperty("--dx", (Math.random() * 130 - 65).toFixed(0) + "px");
    s.style.setProperty("--dy", (-45 - Math.random() * 55).toFixed(0) + "px");
    s.style.animationDelay = i * 25 + "ms";
    el.cena.appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }
}

function banner(texto) {
  el.banner.textContent = texto;
  el.banner.classList.remove("mostra");
  void el.banner.offsetWidth;
  el.banner.classList.add("mostra");
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  el.toasts.appendChild(t);
  while (el.toasts.children.length > 3) el.toasts.firstChild.remove();
  setTimeout(() => t.remove(), 3600);
}

/* =========================================================
   Desenho da interface
   ========================================================= */

const MAPA_POSICOES = [
  [32, 55], [98, 38], [166, 59], [248, 45], [286, 108],
  [235, 164], [156, 143], [78, 169], [48, 238], [151, 278], [270, 246],
];
const CORES_MAPA = {
  floresta: "#789766", caverna: "#8a79b4", deserto: "#c99a4e",
  geleira: "#80b7d0", vulcao: "#c65d43",
};

function decoracaoMapa(id) {
  const op = 'opacity=".36"';
  if (id === "floresta") return `
    <g ${op} fill="none" stroke="#6d8054" stroke-width="2" stroke-linejoin="round">
      <path d="M0 95 34 66 58 88 88 58 119 91M206 292 237 258 260 274 291 242 320 267"/>
      <path d="M16 214v-24m-8 9 8-15 8 15M276 194v-26m-9 10 9-17 9 17"/>
      <path d="M22 122h14m-7-7v28m-6-14 6-9 6 9"/>
    </g>
    <g ${op} fill="#8c9a65"><path d="m8 90 14-28 14 28Z"/><path d="m270 82 16-31 16 31Z"/><path d="m244 291 11-22 11 22Z"/></g>`;
  if (id === "caverna") return `
    <g ${op} fill="none" stroke="#71628f" stroke-width="3" stroke-linejoin="round">
      <path d="M0 82 20 50 38 75 62 40 88 77M220 298l25-39 18 20 24-43 33 45"/>
      <path d="m35 185 9-30 9 30m-12-12h6m214-31 11-39 11 39m-15-19h8"/>
    </g>
    <g ${op} fill="#a08bc7"><path d="m37 180 7-25 7 25Z"/><path d="m254 146 10-40 10 40Z"/><path d="m286 290 8-26 8 26Z"/></g>`;
  if (id === "deserto") return `
    <g ${op} fill="none" stroke="#c39a58" stroke-width="3" stroke-linecap="round">
      <path d="M0 118q44-35 91 0t91 0 91 0 91 0M0 284q52-39 104 0t104 0 112 0"/>
      <path d="M42 76v-28m0 10-9-8m9 17 10-9m-10-1h-6m236 132v-30m0 12-9-8m9 17 10-10"/>
      <path d="M268 186v-36m-7 10h14m-14 10h14"/>
    </g>
    <g ${op} fill="#b68b4d"><path d="m14 117 20-11 20 11Z"/><path d="m260 288 18-12 18 12Z"/></g>`;
  if (id === "geleira") return `
    <g ${op} fill="none" stroke="#7aa9bf" stroke-width="2.5" stroke-linejoin="round">
      <path d="m0 91 34-44 27 43 27-31 39 45M198 292l35-50 24 31 24-47 39 63"/>
      <path d="M34 202q28-39 56 0v15H34Zm8 0v15m39-15v15M245 96l11-20 11 20m-11-7v27"/>
    </g>
    <g ${op} fill="#9bc8da"><path d="m8 91 26-42 27 42Z"/><path d="m232 282 26-39 24 39Z"/></g>`;
  return `
    <g ${op} fill="none" stroke="#bd674c" stroke-width="3" stroke-linejoin="round">
      <path d="m0 115 38-43 27 19 27-35 36 58M196 300l35-61 23 27 25-46 41 73"/>
      <path d="M17 237q25-18 50 0t50 0m126-72q25-18 50 0t50 0" stroke="#d27843" stroke-width="5"/>
      <path d="m264 82 14-37 14 37m-21-12h14"/>
    </g>
    <g ${op} fill="#c66a47"><path d="m5 116 33-44 27 44Z"/><path d="m250 287 30-49 31 49Z"/></g>`;
}

function caminhoMapa(posicoes) {
  if (!posicoes.length) return "";
  let d = `M ${posicoes[0][0]} ${posicoes[0][1]}`;
  for (let i = 1; i < posicoes.length; i++) {
    const [x1, y1] = posicoes[i - 1];
    const [x2, y2] = posicoes[i];
    const curva = i % 2 ? -15 : 15;
    d += ` Q ${(x1 + x2) / 2 + curva} ${(y1 + y2) / 2 - curva} ${x2} ${y2}`;
  }
  return d;
}

function atualizarMapaExpedicao() {
  if (!el.mapaTrilha || !el.mapaQuadro) return;
  const zona = estado.zona;
  // Cada etapa mostra dez zonas; da segunda em diante, mantém o acampamento
  // anterior como ponto de entrada para que os marcos 10, 20, 30... permaneçam visíveis.
  const inicio = zona <= 10 ? 1 : Math.floor((zona - 1) / 10) * 10;
  const fim = inicio === 1 ? 10 : inicio + 10;
  const zonas = Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i);
  const posicoes = MAPA_POSICOES.slice(0, zonas.length);
  const caminho = caminhoMapa(posicoes);
  const bioma = biomas[indiceBioma(zona)];
  el.mapaQuadro.dataset.bioma = bioma.id;
  el.mapaQuadro.style.setProperty("--mapa-cor", CORES_MAPA[bioma.id] || "#8d9a76");
  el.mapaTitulo.textContent = `Zonas ${inicio}–${fim}`;
  el.mapaLegenda.textContent = estado.acampado
    ? `Acampamento da Zona ${estado.campZona || zona} · pausa da expedição`
    : `Seu grupo está na Zona ${zona} · ${bioma.nome}`;

  const nos = zonas.map((n, i) => {
    const [x, y] = posicoes[i];
    const atual = n === zona;
    const passado = n < zona;
    const acampamento = n % 10 === 0;
    const classe = ["mapa-no", atual ? "atual" : passado ? "passado" : "futuro", acampamento ? "no-acampamento" : ""].join(" ");
    const camp = acampamento
      ? `<g class="mapa-tenda" transform="translate(${x - 9} ${y - 37})"><path d="M1 16 9 2l8 14Z"/><path d="M7 16v-6h4v6"/></g>`
      : "";
    const grupo = atual
      ? `<g class="mapa-grupo" transform="translate(${x} ${y - 18})"><circle cx="-5" cy="0" r="3"/><circle cx="4" cy="-1" r="3"/><path d="M-10 8q1-7 5-7t5 7m-1 0q1-7 5-7t5 7"/></g>`
      : "";
    return `<g class="${classe}" data-zona="${n}"><title>Zona ${n}${acampamento ? " · Acampamento" : ""}</title><circle class="no-halo" cx="${x}" cy="${y}" r="13"/><circle class="no-centro" cx="${x}" cy="${y}" r="7"/><text x="${x}" y="${y + 22}" text-anchor="middle">${n}</text>${camp}${grupo}</g>`;
  }).join("");

  el.mapaTrilha.innerHTML = `
    <title>Mapa da expedição — ${bioma.nome}</title>
    <defs><filter id="mapa-desfoque"><feGaussianBlur stdDeviation="11"/></filter></defs>
    ${decoracaoMapa(bioma.id)}
    <path class="mapa-rastro-suave" d="${caminho}" filter="url(#mapa-desfoque)"/>
    <path class="mapa-caminho" d="${caminho}"/>
    ${nos}`;
}

const EMOJIS_CONVERSA = ["💬", "😄", "⚔️", "✨", "🍖", "☕", "🌟", "👋", "❗", "😂", "🔥"];
// Distribuição preparada para todo o elenco atual (e para futuros heróis):
// seis tendas por fileira, em cinco fileiras com profundidades diferentes.
// Assim nenhum herói reutiliza a posição de outro quando o grupo está completo.
const FILEIRAS_TENDAS = [
  [7, 18, 27, 73, 82, 93],
  [8, 19, 28, 72, 81, 92],
  [6, 17, 26, 74, 83, 94],
  [8, 18, 27, 73, 82, 92],
  [7, 17, 26, 74, 83, 93],
];
const LINHAS_TENDAS = [18, 32, 46, 60, 74];
const POSICOES_TENDAS = Array.from({ length: herois.length }, (_, i) => {
  const linha = Math.floor(i / 6);
  const coluna = i % 6;
  const variacaoX = (coluna % 2 ? 0.45 : -0.45) * (linha % 2 ? 1 : 0.75);
  const variacaoY = coluna % 2 ? 0.45 : -0.35;
  return [
    FILEIRAS_TENDAS[linha % FILEIRAS_TENDAS.length][coluna] + variacaoX,
    LINHAS_TENDAS[linha % LINHAS_TENDAS.length] + variacaoY,
  ];
});

// Os personagens começam à frente da entrada da própria tenda. O corredor
// central permanece livre para a clareira e os encontros em volta da fogueira.
const POSICOES_INICIAIS = Array.from({ length: herois.length }, (_, i) => {
  const [x, y] = POSICOES_TENDAS[i % POSICOES_TENDAS.length];
  return [x, y + 6.9];
});

// Reunião em duas rodas concêntricas, ao redor da fogueira central. A roda
// externa recebe 18 companheiros e a interna recebe 12, sem ocupar as faixas
// laterais onde ficam as tendas.
const POSICOES_FOGUEIRA = (() => {
  const centroX = 50;
  const centroY = 58;
  const externas = Array.from({ length: 18 }, (_, i) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / 18;
    return [centroX + Math.cos(a) * 15, centroY + Math.sin(a) * 19];
  });
  const internas = Array.from({ length: 12 }, (_, i) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / 12 + Math.PI / 12;
    return [centroX + Math.cos(a) * 8.3, centroY + Math.sin(a) * 10.5];
  });
  return externas.concat(internas);
})();

// Clareiras para a convivência durante o dia, todas dentro da área aberta
// entre as fileiras laterais de tendas.
const PONTOS_CONVIVENCIA_ACAMPAMENTO = [
  [38, 35], [50, 34], [62, 35],
  [38, 46], [62, 46], [50, 43],
  [38, 70], [50, 72], [62, 70],
  [38, 82], [50, 84], [62, 82],
];
const OFFSETS_GRUPO_ACAMPAMENTO = [
  [-3.2, 1.5], [3.2, 1.5], [-3.2, -1.7], [3.2, -1.7],
];
const PASSO_PIXEL_ACAMPAMENTO = 2.1; // passo social: mantém o ritmo aprovado.
const PASSO_PIXEL_ACAO_ACAMPAMENTO = 3.0; // dormir/reunião: ação dirigida um pouco mais rápida.
const PASSO_INTERVALO_ACAMPAMENTO = 360; // intervalo entre passos visuais.

function agendarAcampamento(fn, atraso) {
  const timer = setTimeout(() => {
    timersAcoesAcampamento = timersAcoesAcampamento.filter((t) => t !== timer);
    fn();
  }, atraso);
  timersAcoesAcampamento.push(timer);
  return timer;
}

function limparAcoesAgendadasAcampamento() {
  timersAcoesAcampamento.forEach(clearTimeout);
  timersAcoesAcampamento = [];
}

function personagensAcampamento() {
  return el.campRoster ? Array.from(el.campRoster.querySelectorAll(".camp-personagem")) : [];
}

/* Ordenação de profundidade 2.5D do acampamento.
   A base visual de cada objeto (pé do herói, base da tenda ou tronco da árvore)
   determina a camada: quanto mais perto da borda inferior do cenário, mais à frente.
   Os pais das árvores e do roster não criam stacking contexts, permitindo que
   árvores, tendas e personagens sejam comparados no mesmo plano de pintura. */
function zIndiceProfundidadeAcampamento(elemento, bonus = 0) {
  const palco = el.campCenario;
  if (!palco || !elemento) return 1000 + bonus;
  const palcoRect = palco.getBoundingClientRect();
  const rect = elemento.getBoundingClientRect();
  if (!palcoRect.height) return 1000 + bonus;
  const profundidade = Math.max(0, Math.min(100, ((rect.bottom - palcoRect.top) / palcoRect.height) * 100));
  return 1000 + Math.round(profundidade * 10) + bonus;
}

function atualizarCamadasProfundidadeAcampamento() {
  if (!el.campCenario || !el.campRoster) return;
  // A raiz da árvore vem um passo à frente em caso de empate de profundidade.
  el.campCenario.querySelectorAll(".camp-arvore-sprite").forEach((arvore) => {
    if (!arvore.complete || !arvore.naturalWidth) {
      if (arvore.dataset.aguardaCamada !== "true") {
        arvore.dataset.aguardaCamada = "true";
        arvore.addEventListener("load", () => {
          arvore.dataset.aguardaCamada = "false";
          requestAnimationFrame(atualizarCamadasProfundidadeAcampamento);
        }, { once: true });
      }
      return;
    }
    arvore.style.zIndex = String(zIndiceProfundidadeAcampamento(arvore, 1));
  });
  // Arbustos e troncos são objetos baixos do mesmo plano 2.5D. Sua base
  // participa da mesma ordenação para ficarem atrás ou à frente dos heróis
  // conforme a posição no terreno, sem virar uma camada fixa sobre as tendas.
  el.campCenario.querySelectorAll(".camp-arbusto, .camp-tronco").forEach((detalhe) => {
    detalhe.style.zIndex = String(zIndiceProfundidadeAcampamento(detalhe, -1));
  });
  el.campRoster.querySelectorAll(".camp-tenda-mundo").forEach((tenda) => {
    tenda.style.zIndex = String(zIndiceProfundidadeAcampamento(tenda));
  });
  el.campRoster.querySelectorAll(".camp-personagem").forEach((personagem) => {
    personagem.style.zIndex = String(zIndiceProfundidadeAcampamento(personagem));
  });
}

function tendaDoPersonagem(personagem) {
  if (!personagem || !el.campRoster) return null;
  return Array.from(el.campRoster.querySelectorAll(".camp-tenda-mundo"))
    .find((tenda) => tenda.dataset.heroi === personagem.dataset.heroi) || null;
}

function marcarTendaOcupada(personagem) {
  // Sempre procura a tenda atual no DOM. Não guarda uma referência antiga que
  // possa ter ficado desconectada após uma atualização de interface.
  const tenda = tendaDoPersonagem(personagem);
  if (!tenda) return false;
  tenda.classList.add("ocupada");
  tenda.dataset.ocupada = "true";
  return true;
}

function sincronizarLuzesTendasDormindo() {
  if (!el.campCenario || el.campCenario.dataset.periodo !== "noite" || encontroFogueiraAtivo) return;
  personagensAcampamento().forEach((personagem) => {
    if (personagem.classList.contains("dentro-tenda")) marcarTendaOcupada(personagem);
  });
}

function posicionarPersonagemAcampamento(personagem, x, y, classe) {
  if (!personagem) return;
  personagem.dataset.campX = String(x);
  personagem.dataset.campY = String(y);
  personagem.style.setProperty("--camp-x", `${x}%`);
  personagem.style.setProperty("--camp-y", `${y}%`);
  personagem.style.setProperty("--camp-escala", (0.78 + y / 100 * 0.34).toFixed(2));
  personagem.style.zIndex = String(1000 + Math.round(y * 10));
  if (classe) personagem.classList.add(classe);
}

/* Animação de caminhada em pixel art: o sprite alterna os pés a cada passo. */
function baseSpritePassosAcampamento(nome, idHeroi) {
  const chave = `${nome}:${idHeroi || ""}`;
  if (!cacheSpritesPassosAcampamento.has(chave)) {
    const base = document.createElement("canvas");
    base.width = 16;
    base.height = 16;
    desenharSpriteHeroiEquipado(base, nome, idHeroi);
    cacheSpritesPassosAcampamento.set(chave, base);
  }
  return cacheSpritesPassosAcampamento.get(chave);
}

function desenharQuadroPassosAcampamento(canvas, fase) {
  if (!canvas) return;
  const base = baseSpritePassosAcampamento(canvas.dataset.sprite, canvas.dataset.heroi);
  const ctx = canvas.getContext("2d");
  canvas.width = 16;
  canvas.height = 16;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 16, 16);
  ctx.drawImage(base, 0, 0);
  const perna = fase % 2 === 0
    ? { origemX: 3, destinoX: 2 }
    : { origemX: 8, destinoX: 9 };
  ctx.clearRect(perna.origemX, 13, 5, 3);
  ctx.drawImage(base, perna.origemX, 13, 5, 3, perna.destinoX, 12, 5, 3);
  canvas.dataset.quadroCamp = "passo-" + (fase % 2);
}

function limparMovimentosAcampamento() {
  for (const personagem of movimentosLentosAcampamento.keys()) {
    personagem.classList.remove("andando");
    const canvas = personagem.querySelector(".camp-sprite");
    if (canvas && canvas.dataset.sprite) {
      desenharSpriteHeroiEquipado(canvas, canvas.dataset.sprite, canvas.dataset.heroi);
      canvas.dataset.quadroCamp = "parado";
    }
  }
  movimentosLentosAcampamento.clear();
}

function finalizarCaminhadaAcampamento(personagem, movimento) {
  movimentosLentosAcampamento.delete(personagem);
  posicionarPersonagemAcampamento(personagem, movimento.destinoX, movimento.destinoY);
  personagem.classList.remove("andando");
  const canvas = personagem.querySelector(".camp-sprite");
  if (canvas && canvas.dataset.sprite) {
    desenharSpriteHeroiEquipado(canvas, canvas.dataset.sprite, canvas.dataset.heroi);
    canvas.dataset.quadroCamp = "parado";
  }
  if (typeof movimento.aoChegar === "function") movimento.aoChegar();
}

/* Obstáculos das tendas: a faixa frontal impede que os heróis atravessem a
   lona. A faixa de trás permanece livre, porque passar atrás da tenda é correto
   na perspectiva 2.5D e a ordenação de profundidade já esconde o personagem. */
function obterObstaculosTendasAcampamento() {
  if (!el.campCenario || !el.campRoster) return [];
  const palco = el.campCenario.getBoundingClientRect();
  if (!palco.width || !palco.height) return [];
  return Array.from(el.campRoster.querySelectorAll(".camp-tenda-mundo")).map((tenda) => {
    const r = tenda.getBoundingClientRect();
    const centroX = ((r.left + r.right) / 2 - palco.left) / palco.width * 100;
    const baseY = (r.bottom - palco.top) / palco.height * 100;
    // O personagem tem corpo alto; a faixa frontal permanece bloqueada até
    // ele conseguir passar totalmente abaixo da projeção da lona. A parte
    // traseira fica livre e a profundidade 2.5D faz a tenda o encobrir.
    const margemX = ((r.width / 2 + 38) / palco.width) * 100;
    // Só o dono da tenda pode usar o pequeno corredor da entrada ao recolher-se.
    const meiaPorta = ((12 + 12) / palco.width) * 100;
    return {
      heroiId: tenda.dataset.heroi,
      centroX,
      meiaPorta,
      left: Math.max(1, centroX - margemX),
      right: Math.min(99, centroX + margemX),
      atras: baseY - 1.0,
      frente: baseY + 10.5,
    };
  });
}

function pontoBloqueadoAcampamento(x, y, obstaculos, portaPermitidaId = null) {
  for (const o of obstaculos) {
    if (x < o.left || x > o.right || y < o.atras || y > o.frente) continue;
    // A passagem pela porta é exclusiva do personagem que pertence àquela
    // tenda. Para todos os outros, a frente continua sendo um obstáculo sólido.
    const entrandoNaPropriaTenda = portaPermitidaId && o.heroiId === portaPermitidaId &&
      Math.abs(x - o.centroX) <= o.meiaPorta;
    if (!entrandoNaPropriaTenda) return true;
  }
  return false;
}

function heapPushAcampamento(heap, item) {
  let i = heap.length;
  heap.push(item);
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (heap[p].f <= item.f) break;
    heap[i] = heap[p];
    i = p;
  }
  heap[i] = item;
}

function heapPopAcampamento(heap) {
  if (!heap.length) return null;
  const primeiro = heap[0];
  const ultimo = heap.pop();
  if (heap.length) {
    let i = 0;
    while (true) {
      let filho = i * 2 + 1;
      if (filho >= heap.length) break;
      if (filho + 1 < heap.length && heap[filho + 1].f < heap[filho].f) filho++;
      if (heap[filho].f >= ultimo.f) break;
      heap[i] = heap[filho];
      i = filho;
    }
    heap[i] = ultimo;
  }
  return primeiro;
}

function calcularRotaAcampamento(origemX, origemY, destinoX, destinoY, portaPermitidaId = null) {
  const palco = el.campCenario?.getBoundingClientRect();
  if (!palco?.width || !palco?.height) return [[destinoX, destinoY]];
  const obstaculos = obterObstaculosTendasAcampamento();
  const passo = 2;
  const max = 50;
  const colunas = max + 1;
  const id = (col, row) => row * colunas + col;
  const coordenada = (col, row) => [col * passo, row * passo];
  const bloqueada = (col, row) => {
    if (col < 1 || row < 1 || col > max - 1 || row > max - 1) return true;
    const [x, y] = coordenada(col, row);
    return pontoBloqueadoAcampamento(x, y, obstaculos, portaPermitidaId);
  };
  const celulaLivreProxima = (x, y) => {
    const baseCol = Math.max(1, Math.min(max - 1, Math.round(x / passo)));
    const baseRow = Math.max(1, Math.min(max - 1, Math.round(y / passo)));
    let melhor = null;
    let menor = Infinity;
    for (let raio = 0; raio <= 12; raio++) {
      for (let dr = -raio; dr <= raio; dr++) {
        for (let dc = -raio; dc <= raio; dc++) {
          if (raio && Math.max(Math.abs(dc), Math.abs(dr)) !== raio) continue;
          const c = baseCol + dc;
          const r = baseRow + dr;
          if (bloqueada(c, r)) continue;
          const [px, py] = coordenada(c, r);
          const d = Math.hypot((px - x) * palco.width / 100, (py - y) * palco.height / 100);
          if (d < menor) { menor = d; melhor = { col: c, row: r, x: px, y: py }; }
        }
      }
      if (melhor) return melhor;
    }
    return melhor;
  };

  let destino = { x: Math.max(2, Math.min(98, destinoX)), y: Math.max(2, Math.min(98, destinoY)) };
  if (pontoBloqueadoAcampamento(destino.x, destino.y, obstaculos, portaPermitidaId)) {
    const livre = celulaLivreProxima(destino.x, destino.y);
    if (livre) destino = { x: livre.x, y: livre.y };
  }
  const inicio = { x: Math.max(2, Math.min(98, origemX)), y: Math.max(2, Math.min(98, origemY)) };
  const inicioLivre = celulaLivreProxima(inicio.x, inicio.y);
  const fimLivre = celulaLivreProxima(destino.x, destino.y);
  if (!inicioLivre || !fimLivre) return [[destino.x, destino.y]];

  const inicioId = id(inicioLivre.col, inicioLivre.row);
  const fimId = id(fimLivre.col, fimLivre.row);
  const total = colunas * colunas;
  const gScore = new Float64Array(total);
  gScore.fill(Infinity);
  const veioDe = new Int32Array(total);
  veioDe.fill(-1);
  const fechado = new Uint8Array(total);
  const heap = [];
  const sx = passo * palco.width / 100;
  const sy = passo * palco.height / 100;
  const heuristica = (c, r) => Math.hypot((c - fimLivre.col) * sx, (r - fimLivre.row) * sy);
  gScore[inicioId] = 0;
  heapPushAcampamento(heap, { id: inicioId, f: heuristica(inicioLivre.col, inicioLivre.row) });
  const direcoes = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let encontrou = false;

  while (heap.length) {
    const atual = heapPopAcampamento(heap);
    const atualId = atual.id;
    if (fechado[atualId]) continue;
    if (atualId === fimId) { encontrou = true; break; }
    fechado[atualId] = 1;
    const col = atualId % colunas;
    const row = Math.floor(atualId / colunas);
    for (const [dc, dr] of direcoes) {
      const nc = col + dc;
      const nr = row + dr;
      if (bloqueada(nc, nr)) continue;
      // Evita cortar quinas entre duas tendas.
      if (dc && dr && (bloqueada(col + dc, row) || bloqueada(col, row + dr))) continue;
      const nid = id(nc, nr);
      if (fechado[nid]) continue;
      const custo = Math.hypot(dc * sx, dr * sy);
      const tentativa = gScore[atualId] + custo;
      if (tentativa >= gScore[nid]) continue;
      veioDe[nid] = atualId;
      gScore[nid] = tentativa;
      heapPushAcampamento(heap, { id: nid, f: tentativa + heuristica(nc, nr) });
    }
  }
  if (!encontrou) return [[destino.x, destino.y]];

  const caminhoIds = [];
  let atualId = fimId;
  while (atualId !== -1) {
    caminhoIds.push(atualId);
    if (atualId === inicioId) break;
    atualId = veioDe[atualId];
  }
  caminhoIds.reverse();

  const segmentoLivre = (a, b) => {
    const distancia = Math.hypot((b.x - a.x) * palco.width / 100, (b.y - a.y) * palco.height / 100);
    // Amostragem curta o bastante para não atravessar a faixa estreita da frente da tenda.
    const amostras = Math.max(2, Math.ceil(distancia / 3));
    for (let i = 1; i < amostras; i++) {
      const t = i / amostras;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      if (pontoBloqueadoAcampamento(x, y, obstaculos, portaPermitidaId)) return false;
    }
    return true;
  };

  // Mantém os nós inicial e final da grade. Omiti-los fazia alguns atalhos
  // ligarem a posição original diretamente ao segundo nó, cortando a tenda.
  const pontos = [inicio];
  caminhoIds.forEach((nodeId) => {
    const col = nodeId % colunas;
    const row = Math.floor(nodeId / colunas);
    pontos.push({ x: col * passo, y: row * passo });
  });
  const fimDaGrade = pontos[pontos.length - 1];
  const destinoSeguro = segmentoLivre(fimDaGrade, destino) ? destino : fimDaGrade;
  pontos.push(destinoSeguro);
  // String-pulling: remove os pequenos zigue-zagues da grade sem atravessar tendas.
  const simplificado = [pontos[0]];
  let indice = 0;
  while (indice < pontos.length - 1) {
    let proximo = pontos.length - 1;
    while (proximo > indice + 1 && !segmentoLivre(pontos[indice], pontos[proximo])) proximo--;
    simplificado.push(pontos[proximo]);
    indice = proximo;
  }
  return simplificado.slice(1).map((p) => [p.x, p.y]);
}

/* Caminha em pequenos passos de pixel, seguindo uma rota que contorna a
   frente das tendas. O lado de trás continua atravessável pela profundidade. */
function caminharDevagarAcampamento(personagem, destinoX, destinoY, aoChegar = null, opcoes = {}) {
  if (!personagem || !personagem.isConnected) return;
  const x = Number(personagem.dataset.campX || 50);
  const y = Number(personagem.dataset.campY || 70);
  const reduzido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const passoPx = Number(opcoes.passoPx) || PASSO_PIXEL_ACAMPAMENTO;
  const rota = calcularRotaAcampamento(x, y, destinoX, destinoY, personagem.dataset.heroi || null);
  const destinoFinal = rota.length ? rota[rota.length - 1] : [destinoX, destinoY];
  if (reduzido) {
    posicionarPersonagemAcampamento(personagem, destinoFinal[0], destinoFinal[1]);
    personagem.classList.remove("andando");
    if (typeof aoChegar === "function") aoChegar();
    return;
  }
  if (!rota.length) {
    posicionarPersonagemAcampamento(personagem, destinoFinal[0], destinoFinal[1]);
    if (typeof aoChegar === "function") aoChegar();
    return;
  }
  movimentosLentosAcampamento.delete(personagem);
  personagem.classList.add("andando");
  const canvas = personagem.querySelector(".camp-sprite");
  if (canvas) canvas.dataset.quadroCamp = "";
  movimentosLentosAcampamento.set(personagem, {
    x, y, destinoX: destinoFinal[0], destinoY: destinoFinal[1],
    rota, indiceRota: 0, passoPx, ticks: 0,
    fase: Number(canvas?.dataset.passosFase || 0) % 2,
    aoChegar,
  });
}

function atualizarPassosAcampamento() {
  if (!estado.acampado || !telaAcampamento || !el.campCenario) return;
  tickPassosAcampamento++;
  const palco = el.campCenario.getBoundingClientRect();
  if (!palco.width || !palco.height) return;
  let mudouProfundidade = false;

  for (const [personagem, movimento] of Array.from(movimentosLentosAcampamento.entries())) {
    if (!personagem.isConnected) {
      movimentosLentosAcampamento.delete(personagem);
      continue;
    }
    movimento.ticks++;
    // O movimento avança em passos reais no mesmo intervalo que já dava o
    // ritmo cozy aprovado; as ações dirigidas podem usar um passo de 3 px.
    if (movimento.ticks % 2 !== 0) continue;

    const alvo = movimento.rota[movimento.indiceRota] || [movimento.destinoX, movimento.destinoY];
    const dxPx = (alvo[0] - movimento.x) * palco.width / 100;
    const dyPx = (alvo[1] - movimento.y) * palco.height / 100;
    const distanciaPx = Math.hypot(dxPx, dyPx);
    if (distanciaPx <= movimento.passoPx) {
      movimento.x = alvo[0];
      movimento.y = alvo[1];
      if (movimento.indiceRota < movimento.rota.length - 1) {
        movimento.indiceRota++;
      } else {
        finalizarCaminhadaAcampamento(personagem, movimento);
      }
      mudouProfundidade = true;
      continue;
    }

    const proporcao = movimento.passoPx / distanciaPx;
    movimento.x += (dxPx * proporcao / palco.width) * 100;
    movimento.y += (dyPx * proporcao / palco.height) * 100;
    posicionarPersonagemAcampamento(personagem, movimento.x, movimento.y);

    movimento.fase = 1 - movimento.fase;
    const canvas = personagem.querySelector(".camp-sprite");
    if (canvas) {
      desenharQuadroPassosAcampamento(canvas, movimento.fase);
      canvas.dataset.passosFase = String(movimento.fase);
    }
    mudouProfundidade = true;
  }

  if (mudouProfundidade && tickPassosAcampamento % 4 === 0) {
    requestAnimationFrame(atualizarCamadasProfundidadeAcampamento);
  }
}
function embaralharAcampamento(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function inteiroAleatorioAcampamento(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function posicaoSlotGrupoAcampamento(grupo, slot) {
  const [cx, cy] = grupo.centro;
  if (grupo.members.length <= 1) return [cx, cy];
  const [dx, dy] = OFFSETS_GRUPO_ACAMPAMENTO[slot % OFFSETS_GRUPO_ACAMPAMENTO.length];
  return [cx + dx, cy + dy];
}

function adicionarAoGrupoAcampamento(grupo, personagem) {
  const ocupados = new Set(grupo.members.map((m) => m.slot));
  const slot = [0, 1, 2, 3].find((n) => !ocupados.has(n));
  if (slot === undefined) return null;
  grupo.members.push({ personagem, slot });
  personagem.dataset.campGrupo = grupo.id;
  personagem.dataset.campSolitaria = grupo.members.length === 1 ? "true" : "false";
  const [x, y] = posicaoSlotGrupoAcampamento(grupo, slot);
  return [x, y];
}

function criarGrupoAcampamento(personagem, centroIndex, solitario = false) {
  const centro = PONTOS_CONVIVENCIA_ACAMPAMENTO[centroIndex % PONTOS_CONVIVENCIA_ACAMPAMENTO.length];
  const grupo = {
    id: "camp-social-" + proximoIdGrupoSocial++,
    centroIndex: centroIndex % PONTOS_CONVIVENCIA_ACAMPAMENTO.length,
    centro: [...centro],
    members: [],
    solitario,
  };
  gruposSociaisAcampamento.push(grupo);
  const destino = adicionarAoGrupoAcampamento(grupo, personagem);
  personagem.dataset.campSolitaria = solitario ? "true" : "false";
  return { grupo, destino };
}

function agendarCaminhadaSocialAcampamento(personagem, destino, atraso = 0) {
  if (!personagem || !destino) return;
  agendarAcampamento(() => {
    if (!estado.acampado || !telaAcampamento || el.campCenario.dataset.periodo !== "dia") return;
    personagem.classList.remove("saindo-tenda", "dentro-tenda", "reunido");
    personagem.classList.add("socializando");
    caminharDevagarAcampamento(personagem, destino[0], destino[1], () => {
      personagem.classList.remove("saindo-tenda");
    });
  }, atraso);
}

function formarGruposSociaisAcampamento() {
  const pessoas = embaralharAcampamento(personagensAcampamento().filter((p) =>
    !p.classList.contains("dentro-tenda") && !p.classList.contains("indo-tenda")
  ));
  limparMovimentosAcampamento();
  gruposSociaisAcampamento = [];
  if (!pessoas.length) return;

  const gruposBrutos = [];
  const quantidadeSolos = pessoas.length >= 12
    ? inteiroAleatorioAcampamento(2, Math.min(4, Math.max(2, Math.round(pessoas.length * 0.13))))
    : pessoas.length >= 5 ? 1 : 0;
  for (let i = 0; i < quantidadeSolos; i++) gruposBrutos.push([pessoas[i]]);
  let restantes = pessoas.slice(quantidadeSolos);
  while (restantes.length) {
    if (restantes.length === 1) {
      if (gruposBrutos.length && gruposBrutos[gruposBrutos.length - 1].length < 4) {
        gruposBrutos[gruposBrutos.length - 1].push(restantes.pop());
      } else gruposBrutos.push([restantes.pop()]);
      break;
    }
    let tamanho = inteiroAleatorioAcampamento(2, Math.min(4, restantes.length));
    if (restantes.length - tamanho === 1) tamanho--;
    gruposBrutos.push(restantes.splice(0, tamanho));
  }

  const centros = embaralharAcampamento(PONTOS_CONVIVENCIA_ACAMPAMENTO.map((_, i) => i));
  let ordemMovimento = 0;
  gruposBrutos.forEach((membros, indiceGrupo) => {
    const centroIndex = centros[indiceGrupo % centros.length];
    const centroBase = PONTOS_CONVIVENCIA_ACAMPAMENTO[centroIndex];
    let centro = [...centroBase];
    if (indiceGrupo >= centros.length) {
      centro = [Math.max(9, Math.min(91, centro[0] + (indiceGrupo % 2 ? -5 : 5))),
        Math.max(30, Math.min(84, centro[1] + (indiceGrupo % 3 - 1) * 4))];
    }
    const grupo = {
      id: "camp-social-" + proximoIdGrupoSocial++,
      centroIndex,
      centro,
      members: [],
      solitario: membros.length === 1,
    };
    gruposSociaisAcampamento.push(grupo);
    // Registra todos os membros primeiro para que a formação fique equilibrada
    // ao redor do centro, em vez de deixar o primeiro companheiro no mesmo ponto.
    membros.forEach((personagem, slot) => {
      grupo.members.push({ personagem, slot });
      personagem.dataset.campGrupo = grupo.id;
      personagem.dataset.campSolitaria = "false";
      personagem.classList.remove("dentro-tenda", "indo-tenda", "reunido");
    });
    grupo.members.forEach(({ personagem, slot }) => {
      const destino = posicaoSlotGrupoAcampamento(grupo, slot);
      const atraso = 900 + ordemMovimento * 330 + inteiroAleatorioAcampamento(0, 750);
      ordemMovimento++;
      agendarCaminhadaSocialAcampamento(personagem, destino, atraso);
    });
  });
}

function rotacionarGruposSociaisAcampamento() {
  if (!estado.acampado || !telaAcampamento || el.campCenario.dataset.periodo !== "dia") return;
  const disponiveis = embaralharAcampamento(personagensAcampamento().filter((p) =>
    !p.classList.contains("dentro-tenda") && !p.classList.contains("indo-tenda") &&
    !p.classList.contains("reunido") && !movimentosLentosAcampamento.has(p)
  ));
  if (disponiveis.length < 2) return;
  const quantidade = Math.min(6, Math.max(1, Math.round(disponiveis.length * 0.18)));
  const escolhidos = disponiveis.slice(0, quantidade);
  const origens = new Map();

  // Alguns companheiros deixam seu grupinho e procuram outro lugar.
  escolhidos.forEach((personagem) => {
    const origem = gruposSociaisAcampamento.find((g) => g.members.some((m) => m.personagem === personagem));
    if (origem) {
      origens.set(personagem, origem);
      origem.members = origem.members.filter((m) => m.personagem !== personagem);
    }
  });
  gruposSociaisAcampamento = gruposSociaisAcampamento.filter((g) => g.members.length);

  let ordem = 0;
  escolhidos.forEach((personagem) => {
    const origem = origens.get(personagem);
    const gruposPossiveis = gruposSociaisAcampamento.filter((g) => g !== origem && g.members.length < 4);
    const querFicarSozinho = Math.random() < 0.16;
    let destino = null;

    if (!querFicarSozinho && gruposPossiveis.length) {
      const grupoDestino = gruposPossiveis[inteiroAleatorioAcampamento(0, gruposPossiveis.length - 1)];
      destino = adicionarAoGrupoAcampamento(grupoDestino, personagem);
    }

    if (!destino) {
      const centrosUsados = new Set(gruposSociaisAcampamento.map((g) => g.centroIndex));
      let centroLivre = PONTOS_CONVIVENCIA_ACAMPAMENTO.findIndex((_, i) => !centrosUsados.has(i));
      if (centroLivre < 0) {
        const gruposComEspaco = gruposSociaisAcampamento.filter((g) => g.members.length < 4 && g !== origem);
        if (gruposComEspaco.length) {
          const grupoDestino = gruposComEspaco[inteiroAleatorioAcampamento(0, gruposComEspaco.length - 1)];
          destino = adicionarAoGrupoAcampamento(grupoDestino, personagem);
        }
      } else {
        const novo = criarGrupoAcampamento(personagem, centroLivre, true);
        destino = novo.destino;
      }
    }

    if (destino) {
      personagem.classList.remove("socializando");
      agendarCaminhadaSocialAcampamento(personagem, destino, 700 + ordem * 1900);
      ordem++;
    }
  });
}

function atualizarFalasGruposAcampamento() {
  if (!estado.acampado || !telaAcampamento) return;
  if (el.campCenario.dataset.periodo === "noite" && !encontroFogueiraAtivo) return;
  if (encontroFogueiraAtivo) {
    const reunidos = embaralharAcampamento(personagensAcampamento().filter((p) => p.classList.contains("reunido")));
    reunidos.slice(0, 2).forEach(mostrarFalaAcampamento);
    return;
  }
  const grupos = embaralharAcampamento(gruposSociaisAcampamento.filter((g) => g.members.length >= 2));
  const grupo = grupos.find((g) => g.members.filter((m) =>
    !movimentosLentosAcampamento.has(m.personagem) && !m.personagem.classList.contains("dentro-tenda")
  ).length >= 2);
  if (grupo) {
    const prontos = embaralharAcampamento(grupo.members.map((m) => m.personagem).filter((p) =>
      !movimentosLentosAcampamento.has(p) && !p.classList.contains("dentro-tenda")
    ));
    prontos.slice(0, 2).forEach(mostrarFalaAcampamento);
  } else {
    // Às vezes um herói que está sozinho apenas observa o movimento do acampamento.
    const solos = gruposSociaisAcampamento.filter((g) => g.members.length === 1);
    if (solos.length && Math.random() < 0.24) {
      const p = solos[0].members[0].personagem;
      if (!movimentosLentosAcampamento.has(p)) mostrarFalaAcampamento(p);
    }
  }
}

function mostrarFalaAcampamento(personagem) {
  const balao = personagem && personagem.querySelector(".camp-fala");
  if (!balao) return;
  balao.textContent = EMOJIS_CONVERSA[Math.floor(Math.random() * EMOJIS_CONVERSA.length)];
  balao.classList.remove("aparece");
  void balao.offsetWidth;
  balao.classList.add("aparece");
  setTimeout(() => balao.classList.remove("aparece"), 1850);
}

function passarosAcampamento() {
  return el.campCenario ? Array.from(el.campCenario.querySelectorAll(".camp-passaro")) : [];
}

function limparPassarosAcampamento() {
  timersPassarosAcampamento.forEach(clearTimeout);
  timersPassarosAcampamento = [];
  passarosAcampamento().forEach((ave) => {
    ave.className = "camp-passaro";
    ave.style.left = "-10%";
    ave.style.top = "12%";
  });
}

function agendarPassaroAcampamento(fn, atraso) {
  const timer = setTimeout(() => {
    timersPassarosAcampamento = timersPassarosAcampamento.filter((t) => t !== timer);
    fn();
  }, atraso);
  timersPassarosAcampamento.push(timer);
  return timer;
}

function iniciarPassarosAcampamento() {
  if (!estado.acampado || !telaAcampamento || !el.campCenario || el.campCenario.dataset.periodo !== "dia") return;
  if (timersPassarosAcampamento.length) return;
  const aves = passarosAcampamento();
  if (aves.length < 3) return;
  const [aveA, aveB, aveC] = aves;
  limparPassarosAcampamento();

  // Dois passarinhos descansam nas copas por alguns instantes.
  aveA.style.left = "12%"; aveA.style.top = "14%"; aveA.classList.add("visivel", "pousado");
  aveB.style.left = "86%"; aveB.style.top = "18%"; aveB.classList.add("visivel", "pousado");

  agendarPassaroAcampamento(() => {
    aveA.classList.remove("pousado"); aveB.classList.remove("pousado");
    aveA.classList.add("decolando"); aveB.classList.add("decolando");
  }, 6500);
  agendarPassaroAcampamento(() => {
    aveA.className = "camp-passaro visivel voando-ceu";
    aveA.style.left = "-4%"; aveA.style.top = "13%";
    requestAnimationFrame(() => { aveA.style.left = "106%"; aveA.style.top = "17%"; });
  }, 8400);
  agendarPassaroAcampamento(() => {
    aveB.className = "camp-passaro";
  }, 10500);
  agendarPassaroAcampamento(() => {
    // Um terceiro pássaro cruza o céu em diagonal e pousa no gramado.
    aveC.className = "camp-passaro visivel descendo";
    aveC.style.left = "83%"; aveC.style.top = "12%";
    requestAnimationFrame(() => { aveC.style.left = "73%"; aveC.style.top = "62%"; });
  }, 15500);
  agendarPassaroAcampamento(() => {
    aveA.className = "camp-passaro";
    aveC.classList.remove("descendo");
    aveC.classList.add("pousado-chao");
  }, 19400);
  agendarPassaroAcampamento(() => {
    aveC.classList.remove("pousado-chao");
    aveC.classList.add("voando-baixo");
    requestAnimationFrame(() => { aveC.style.left = "108%"; aveC.style.top = "51%"; });
  }, 26000);
  agendarPassaroAcampamento(() => {
    aveC.className = "camp-passaro";
    timersPassarosAcampamento = [];
    agendarPassaroAcampamento(iniciarPassarosAcampamento, 8000);
  }, 30500);
}

const DESCRICOES_HEROIS = {
  pip: "Um aprendiz curioso que transforma cada clique em força para a expedição.",
  tora: "Uma guerreira firme, sempre pronta para proteger seus companheiros.",
  mira: "Uma arqueira precisa que atinge os inimigos antes que se aproximem.",
  gandor: "Um mago estudioso que domina feitiços de grande poder.",
  luna: "Uma clériga serena que carrega esperança por onde passa.",
  sombra: "Uma ladina ágil, especialista em ataques rápidos e discretos.",
  barba: "Um anão resistente que resolve problemas com força e coragem.",
  draco: "Um cavaleiro disciplinado que nunca abandona a linha de frente.",
  bruma: "Uma druida ligada à natureza e aos mistérios dos biomas.",
  kuro: "Um samurai dedicado à precisão, à honra e à disciplina.",
  zeph: "Um alquimista inventivo que transforma conhecimento em poder.",
  brasa: "Uma piromante que canaliza o fogo contra os inimigos.",
  vesper: "Uma necromante que conhece os segredos entre a vida e a morte.",
  padre: "Um sacerdote que purifica as chamas e fortalece a equipe.",
  pedrinhoo07140: "Um aventureiro de poder equivalente ao Padre Thalles, guiado por sua chama abissal.",
};
const TIPOS_EQUIPAMENTO = [
  { id: "arma", nome: "Arma", icone: "⚔", dica: "Aumenta o dano; cada herói usa apenas sua categoria." },
  { id: "armadura", nome: "Armadura", icone: "🛡", dica: "Fortalece o combate do herói equipado." },
  { id: "acessorio", nome: "Acessório", icone: "✦", dica: "Concede efeitos e bônus especiais." },
];
let heroiSelecionadoCard = null;
let slotSelecionadoEquipamento = null;

function slotsEquipados(idHeroi) {
  if (!estado.equipamentosHerois) estado.equipamentosHerois = {};
  if (!estado.equipamentosHerois[idHeroi]) estado.equipamentosHerois[idHeroi] = { arma: null, armadura: null, acessorio: null };
  return estado.equipamentosHerois[idHeroi];
}

function itemEquipado(idItem) {
  return (estado.inventario?.equipamentos || []).find((item) => item && item.id === idItem) || null;
}

function bonusDanoEquipadoHeroi(idHeroi) {
  const slots = estado.equipamentosHerois?.[idHeroi] || {};
  return Object.values(slots).reduce((total, idItem) => total + (Number(itemEquipado(idItem)?.bonus?.danoHeroiPct) || 0), 0);
}

function bonusEquipamentoGlobal(chave) {
  let total = 0;
  for (const h of herois) {
    const slots = estado.equipamentosHerois?.[h.id];
    if (!slots) continue;
    for (const idItem of Object.values(slots)) {
      const item = itemEquipado(idItem);
      total += Number(item?.bonus?.[chave]) || 0;
    }
  }
  return total;
}

function textoEfeitosItem(item) {
  return Array.isArray(item?.efeitos) ? item.efeitos.join(" · ") : "Equipamento";
}

// Máscaras revisadas individualmente. Só removem pixels registrados em `extras`
// de sprites.js; assim, flores, auréolas, penas, mãos e detalhes do traje que
// ficam na grade-base nunca são apagados por engano.
function criarMascaraExtras(retangulos = [], excecoes = []) {
  const pixels = new Set();
  const preservar = new Set(excecoes.map(([x, y]) => `${x},${y}`));
  for (const [x0, y0, x1, y1] of retangulos) {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const chave = `${x},${y}`;
        if (!preservar.has(chave)) pixels.add(chave);
      }
    }
  }
  return pixels;
}
const MASCARAS_ARMA_PADRAO_HEROI = {
  // Cajados: remove o cabo inteiro, mas conserva a mão quando ela é um extra.
  pip: criarMascaraExtras([[14, 2, 15, 11], [14, 12, 14, 12]]),
  gandor: criarMascaraExtras([[13, 1, 15, 15]]),
  luna: criarMascaraExtras([[13, 3, 15, 5], [14, 6, 14, 14]]),
  bruma: criarMascaraExtras([[14, 3, 14, 14]], [[14, 11]]),
  zeph: criarMascaraExtras([[13, 4, 15, 12]]),
  brasa: criarMascaraExtras([[13, 5, 15, 10]]),
  // A decoração verde e cinza acima da cabeça de Vesper não é parte do cajado.
  vesper: criarMascaraExtras([[14, 2, 14, 14]], [[14, 11]]),
  // No Padre, a cruz dourada e o cabo pertencem ao cajado; a auréola permanece.
  padre: criarMascaraExtras([[13, 0, 15, 14]], [[14, 12]]),
  pedrinhoo07140: null,
  antao: criarMascaraExtras([[13, 4, 15, 4], [13, 5, 13, 5], [14, 5, 14, 14]]),
  // O brilho azul lateral era o antigo foco/empunhadura do personagem.
  chico: criarMascaraExtras([[13, 11, 15, 14]]),
  // A flor vermelha e o caule na mão são o item antigo; flores do traje ficam.
  tere: criarMascaraExtras([[13, 10, 15, 11], [14, 12, 14, 13]]),
  paulo: criarMascaraExtras([[13, 3, 15, 3], [14, 2, 14, 14]]),
  // Mantém os ornamentos dourados simétricos da cabeça e troca apenas o cabo.
  teoforo: criarMascaraExtras([[14, 5, 14, 10]]),
  jose: criarMascaraExtras([[13, 1, 15, 4], [14, 5, 14, 14]]),

  // Espadas: inclui guarda, empunhadura e pomo (não apenas a lâmina).
  tora: criarMascaraExtras([[14, 0, 15, 10], [13, 11, 15, 11], [14, 12, 14, 13]]),
  draco: criarMascaraExtras([[14, 1, 15, 11], [13, 12, 15, 12]]),
  kuro: criarMascaraExtras([[14, 0, 14, 13], [15, 2, 15, 10], [13, 10, 13, 10]]),

  // Arco: Mira o segura à esquerda; Bento e Cefas à direita.
  mira: criarMascaraExtras([[0, 3, 1, 13]]),
  bento: criarMascaraExtras([[13, 10, 15, 12]]),
  cefas: criarMascaraExtras([[0, 8, 1, 13], [13, 8, 15, 13]]),

  // Machado e adagas: remove também a parte traseira/segunda lâmina.
  barba: criarMascaraExtras([[12, 2, 15, 13]]),
  ossinho: criarMascaraExtras([[13, 5, 15, 12], [0, 10, 3, 13]]),
  sombra: criarMascaraExtras([[1, 6, 1, 12], [14, 6, 14, 12]]),
  kobi: criarMascaraExtras([[0, 11, 1, 12], [13, 10, 15, 14]]),
};

// Pixels de mão que fazem parte da pose original. Eles são redesenhados por
// cima da arma nova para o herói continuar parecendo estar segurando o item.
const MAOS_ARMA_HEROI = {
  pip: [[13, 11, "s"]],
  bruma: [[14, 11, "s"]],
  vesper: [[14, 11, "L"]],
  padre: [[14, 12, "s"]],
};

// Ajustes de pose por personagem. Arcos de Bento e Cefas ficam na mão direita;
// os cajados começam na altura em que cada sprite originalmente segurava o seu.
const AJUSTES_POSE_ARMA_HEROI = {
  pip: { topoCajado: 2 }, gandor: { topoCajado: 1 }, luna: { topoCajado: 3 },
  bruma: { topoCajado: 3 }, zeph: { topoCajado: 4 }, brasa: { topoCajado: 5 },
  vesper: { topoCajado: 2 }, padre: { topoCajado: 0 }, pedrinhoo07140: { topoCajado: 2 },
  antao: { topoCajado: 4 }, chico: { topoCajado: 4 }, tere: { topoCajado: 5 },
  paulo: { topoCajado: 2 }, teoforo: { topoCajado: 5 }, jose: { topoCajado: 1 },
  bento: { espelharArco: true }, cefas: { espelharArco: true },
};

function desenharArmaPixelArt(ctx, tipo, idHeroi) {
  const px = (x, y, cor, w = 1, h = 1) => {
    ctx.fillStyle = cor;
    ctx.fillRect(x, y, w, h);
  };
  const contorno = "#1a1330", metal = "#d7dde8", luz = "#ffffff";
  const sombra = "#586d86", madeira = "#8b5a2b", ouro = "#ffcf4a";
  const pose = AJUSTES_POSE_ARMA_HEROI[idHeroi] || {};

  ctx.save();
  if (tipo === "arco" && pose.espelharArco) {
    // Espelha o arco inteiro ao lado oposto sem inverter o personagem.
    ctx.translate(16, 0);
    ctx.scale(-1, 1);
  }

  if (tipo === "espada") {
    // Espada vertical curta, alinhada com as armas originais de Tora, Draco e Kuro.
    // Ponta, lâmina, guarda, cabo e pomo ficam dentro do canvas 16x16.
    px(14, 1, contorno);
    px(14, 2, metal); px(13, 3, contorno); px(14, 3, metal); px(15, 3, contorno);
    for (let y = 4; y <= 8; y++) {
      px(13, y, contorno); px(14, y, y < 7 ? luz : metal); px(15, y, contorno);
    }
    px(12, 9, contorno, 4, 2);
    px(12, 9, ouro, 3, 1); px(13, 10, ouro, 3, 1);
    px(13, 11, contorno, 3, 4); px(14, 11, madeira, 1, 4);
    px(13, 14, ouro, 3, 1); px(14, 14, luz);
  } else if (tipo === "machado") {
    // Cabo na mão direita e lâmina voltada para fora, sem corte na borda.
    px(11, 12, contorno, 2, 3); px(12, 11, contorno, 2, 2);
    px(12, 12, madeira, 1, 3); px(13, 10, madeira, 1, 3);
    px(12, 5, contorno, 4, 6); px(11, 6, contorno, 2, 4);
    px(12, 6, sombra, 2, 4); px(13, 5, metal, 2, 5);
    px(14, 6, luz); px(12, 8, metal); px(13, 10, ouro);
  } else if (tipo === "arco") {
    // Arco recurvo maior: as lâminas formam um C e a corda fica voltada
    // para o corpo. Bento/Cefas usam o espelho para segurar à direita.
    px(1, 2, contorno, 2, 2); px(0, 4, contorno, 2, 2);
    px(0, 6, contorno, 2, 4); px(1, 10, contorno, 2, 2);
    px(2, 12, contorno, 2, 2);
    px(1, 3, ouro); px(1, 4, madeira); px(1, 5, madeira);
    px(1, 6, madeira); px(1, 7, ouro); px(1, 8, madeira);
    px(1, 9, madeira); px(2, 10, madeira); px(2, 11, ouro);
    px(3, 4, madeira); px(3, 5, ouro); px(3, 10, ouro); px(3, 11, madeira);
    for (let y = 5; y <= 10; y++) px(4, y, "#e8e0d0");
    px(4, 4, contorno); px(4, 11, contorno);
  } else if (tipo === "cajado") {
    const topo = Math.max(0, Math.min(5, Number(pose.topoCajado ?? 1)));
    const inicioHaste = topo + 3;
    // Cabeça com cristal, haste contínua e ponta inferior; a altura varia
    // para acompanhar o espaço livre de cada sprite sem cobrir cabelo/auréola.
    px(13, topo, contorno, 3, 3);
    px(14, topo, ouro, 1, 2);
    px(13, topo + 1, ouro, 1, 1);
    px(14, topo + 1, "#1d5f99", 1, 1);
    px(14, topo + 2, "#7fe3ff", 1, 1);
    for (let y = inicioHaste; y <= 14; y++) {
      px(13, y, contorno); px(14, y, madeira); px(15, y, contorno);
    }
    px(14, 14, "#c08a4f");
  } else if (tipo === "adagas") {
    // Par simétrico: lâminas para cima e cabos para baixo.
    px(1, 12, contorno, 2, 2); px(1, 13, madeira, 1, 2);
    px(2, 10, contorno, 2, 3); px(2, 9, metal); px(1, 8, luz);
    px(13, 12, contorno, 2, 2); px(14, 13, madeira, 1, 2);
    px(12, 10, contorno, 2, 3); px(13, 9, metal); px(14, 8, luz);
  }
  ctx.restore();
}

// Compõe os equipamentos sobre o personagem. Quando há arma equipada,
// retira primeiro a arma padrão do sprite e desenha a nova no mesmo lugar.
function desenharSpriteHeroiEquipado(canvas, sprite, idHeroi) {
  if (!canvas || !sprite) return;
  const equipamentos = estado.equipamentosHerois?.[idHeroi] || {};
  const arma = itemEquipado(equipamentos.arma);
  const armaCompativel = heroiPodeUsarArma(idHeroi, arma);
  const mascaraArma = armaCompativel ? (MASCARAS_ARMA_PADRAO_HEROI[idHeroi] || null) : null;
  desenharSprite(canvas, sprite, mascaraArma);
  if (!idHeroi) return;
  const armadura = itemEquipado(equipamentos.armadura);
  const acessorio = itemEquipado(equipamentos.acessorio);
  const temArmadura = Boolean(armadura);
  const temAcessorio = Boolean(acessorio);
  if (!armaCompativel && !temArmadura && !temAcessorio) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const px = (x, y, cor, w = 1, h = 1) => { ctx.fillStyle = cor; ctx.fillRect(x, y, w, h); };

  if (temArmadura) {
    // Peitoral de couro com borda escura, ombreiras e fivela clara.
    px(5, 9, "#1a1330", 6, 5);
    px(6, 10, "#704326", 4, 3);
    px(6, 10, "#c08a4f", 1, 3);
    px(9, 10, "#8b5a2b", 1, 3);
    px(7, 9, "#e0b36d", 2, 1);
    px(8, 11, "#ffcf4a", 1, 1);
    px(7, 13, "#563a28", 3, 1);
  }
  if (armaCompativel) desenharArmaPixelArt(ctx, tipoArmaDoItem(arma), idHeroi);
  if (temAcessorio) {
    // Cordão curto e pingente azul/turquesa no peito.
    px(7, 8, "#8b5a2b", 1, 1);
    px(9, 8, "#8b5a2b", 1, 1);
    px(8, 9, "#ffcf4a", 1, 1);
    px(7, 10, "#1a1330", 3, 2);
    px(8, 10, "#ffcf4a", 1, 1);
    px(8, 11, "#1d5f99", 1, 1);
    px(8, 11, "#7fe3ff", 1, 1);
  }
  // A mão volta à frente da arma nova para manter a leitura de empunhadura.
  for (const [x, y, cor] of MAOS_ARMA_HEROI[idHeroi] || []) px(x, y, cor);
}

function atualizarSpritesHeroisEquipados() {
  cacheSpritesPassosAcampamento.clear();
  document.querySelectorAll("canvas[data-heroi][data-sprite]").forEach((canvas) => {
    desenharSpriteHeroiEquipado(canvas, canvas.dataset.sprite, canvas.dataset.heroi);
  });
}

function renderCardHeroi() {
  const h = herois.find((x) => x.id === heroiSelecionadoCard);
  if (!h || nivel(h.id) <= 0 || !el.heroiCardConteudo) return;
  const slots = slotsEquipados(h.id);
  const itens = estado.inventario?.equipamentos || [];
  const tipo = h.tipo === "clique" ? "Especialista em dano por clique" : "Combatente de dano contínuo";
  el.heroiCardTitulo.textContent = h.nome;
  el.heroiCardConteudo.innerHTML = `
    <div class="heroi-card-corpo">
      <div class="heroi-perfil">
        <div class="heroi-perfil-avatar"><canvas data-sprite="${h.sprite}" data-heroi="${h.id}" width="64" height="64"></canvas></div>
        <div class="heroi-perfil-texto"><span class="heroi-perfil-nivel">NÍVEL ${fmtNivelHeroi(nivel(h.id))}</span><p>${DESCRICOES_HEROIS[h.id] || "Um companheiro valoroso nesta expedição."}</p><small>${tipo}</small></div>
      </div>
      <div class="heroi-equipamentos">
        <div class="heroi-equipamentos-titulo"><b>Equipamentos</b><span>Itens individuais</span></div>
        <div class="heroi-slots">${TIPOS_EQUIPAMENTO.map((slot) => {
        const idItem = slots[slot.id];
        const item = idItem ? itemEquipado(idItem) : null;
        return `<button type="button" class="heroi-slot ${item ? "preenchido raridade-" + item.raridade : "vazio"}" data-slot-equip="${slot.id}" aria-label="${slot.nome}: ${item ? item.nome : "vazio"}" title="${item ? textoEfeitosItem(item) : slot.dica}">
          <span class="heroi-slot-icone">${item ? iconeEquipamentoHtml(item) : slot.icone}</span><span class="heroi-slot-info"><b>${slot.nome}</b><small>${item ? item.nome + " · " + item.raridadeNome : slot.id === "arma" ? "Usa: " + (NOME_TIPO_ARMA[TIPO_ARMA_HEROI[h.id]] || "arma específica") : "Espaço vazio"}</small></span><span class="heroi-slot-seta">›</span>
        </button>`;
        }).join("")}</div>
        <div class="heroi-itens-disponiveis" id="heroi-itens-disponiveis" hidden></div>
        <p class="heroi-equipamento-dica">${itens.length ? "Clique em um espaço para escolher um item." : "Fabrique armas na forja e armaduras ou acessórios na bancada do acampamento."}</p>
      </div>
    </div>`;
  el.heroiCardConteudo.querySelectorAll("canvas[data-sprite]").forEach((c) => desenharSpriteHeroiEquipado(c, c.dataset.sprite, h.id));
  el.heroiCardConteudo.querySelectorAll("[data-slot-equip]").forEach((b) => b.addEventListener("click", () => abrirSeletorEquipamento(b.dataset.slotEquip)));
}

function abrirCardHeroi(idHeroi) {
  if (!estado.acampado || !telaAcampamento || nivel(idHeroi) <= 0) return;
  heroiSelecionadoCard = idHeroi;
  renderCardHeroi();
  el.heroiCard.hidden = false;
  if (!estado.tutorialEquipamentosVisto) abrirTutorialEquipamentos();
  el.heroiCardFechar?.focus();
}

function fecharCardHeroi() {
  if (!el.heroiCard) return;
  el.heroiCard.hidden = true;
  heroiSelecionadoCard = null;
  slotSelecionadoEquipamento = null;
}

function abrirSeletorEquipamento(tipo) {
  slotSelecionadoEquipamento = tipo;
  const area = el.heroiCardConteudo.querySelector("#heroi-itens-disponiveis");
  if (!area) return;
  const disponiveis = (estado.inventario?.equipamentos || []).filter((item) => {
    if (!item || item.tipo !== tipo) return false;
    if (tipo === "arma" && !heroiPodeUsarArma(heroiSelecionadoCard, item)) return false;
    return !Object.entries(estado.equipamentosHerois || {}).some(([idHeroi, slots]) =>
      idHeroi !== heroiSelecionadoCard && Object.values(slots || {}).includes(item.id));
  });
  area.hidden = false;
  const equipado = slotsEquipados(heroiSelecionadoCard)[tipo];
  area.innerHTML = `<b>Escolher ${TIPOS_EQUIPAMENTO.find((x) => x.id === tipo)?.nome || "item"}</b>` +
    (equipado ? `<button type="button" class="btn-mini heroi-item-retirar" id="heroi-item-retirar">Retirar equipamento</button>` : "") +
    (disponiveis.length ? disponiveis.map((item) => `<button type="button" class="heroi-item-opcao raridade-${item.raridade}" data-item-equip="${item.id}"><span class="heroi-item-opcao-icone">${iconeEquipamentoHtml(item)}</span><span><b>${item.nome} <em>${item.raridadeNome}</em></b><small>${tipo === "arma" ? (NOME_TIPO_ARMA[tipoArmaDoItem(item)] || "Arma") + " · " : ""}${textoEfeitosItem(item)}</small></span></button>`).join("") : `<p>${tipo === "arma" ? "Este personagem utiliza " + (NOME_TIPO_ARMA[TIPO_ARMA_HEROI[heroiSelecionadoCard]] || "uma arma específica") + ". Ainda não há uma arma compatível no inventário. Fabrique uma arma dessa categoria na forja." : "Nenhum item disponível nesta categoria ainda. Visite a estação correspondente para fabricar um!"}</p>`);
  area.querySelector("#heroi-item-retirar")?.addEventListener("click", () => retirarEquipamento(tipo));
  area.querySelectorAll("[data-item-equip]").forEach((b) => b.addEventListener("click", () => equiparItem(b.dataset.itemEquip)));
}

function retirarEquipamento(tipo) {
  const h = herois.find((x) => x.id === heroiSelecionadoCard);
  if (!h) return;
  slotsEquipados(h.id)[tipo] = null;
  salvar(false);
  renderCardHeroi();
  renderStats();
  atualizarGrupo();
  atualizarSpritesHeroisEquipados();
  toast("Equipamento retirado.");
}

function equiparItem(idItem) {
  const h = herois.find((x) => x.id === heroiSelecionadoCard);
  const item = itemEquipado(idItem);
  if (!h || !item || !slotSelecionadoEquipamento || item.tipo !== slotSelecionadoEquipamento) return;
  if (slotSelecionadoEquipamento === "arma" && !heroiPodeUsarArma(h.id, item)) {
    toast(`${h.nome.split(",")[0]} só pode usar ${NOME_TIPO_ARMA[TIPO_ARMA_HEROI[h.id]] || "seu tipo próprio de arma"}.`);
    som("erro");
    return;
  }
  slotsEquipados(h.id)[slotSelecionadoEquipamento] = item.id;
  salvar(false);
  renderCardHeroi();
  renderStats();
  atualizarGrupo();
  atualizarSpritesHeroisEquipados();
  toast(`${item.nome} equipado em ${h.nome.split(",")[0]}.`);
}

function abrirTutorialEquipamentos() {
  if (el.heroiTutorial) el.heroiTutorial.hidden = false;
}

function fecharTutorialEquipamentos() {
  if (el.heroiTutorial) el.heroiTutorial.hidden = true;
  if (!estado.tutorialEquipamentosVisto) {
    estado.tutorialEquipamentosVisto = true;
    salvar(false);
  }
}

function configurarCardsHerois() {
  const abrirPersonagem = (personagem) => {
    if (personagem && !personagem.classList.contains("dentro-tenda")) abrirCardHeroi(personagem.dataset.heroi);
  };
  el.campRoster?.addEventListener("click", (e) => abrirPersonagem(e.target.closest(".camp-personagem")));
  el.campRoster?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const personagem = e.target.closest(".camp-personagem");
    if (personagem) { e.preventDefault(); abrirPersonagem(personagem); }
  });
  el.heroiCardFechar?.addEventListener("click", fecharCardHeroi);
  el.heroiCard?.addEventListener("click", (e) => { if (e.target === el.heroiCard) fecharCardHeroi(); });
  el.heroiTutorialAbrir?.addEventListener("click", abrirTutorialEquipamentos);
  el.heroiTutorialFechar?.addEventListener("click", fecharTutorialEquipamentos);
  el.heroiTutorial?.addEventListener("click", (e) => { if (e.target === el.heroiTutorial) fecharTutorialEquipamentos(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (el.heroiTutorial && !el.heroiTutorial.hidden) fecharTutorialEquipamentos();
    else if (el.heroiCard && !el.heroiCard.hidden) fecharCardHeroi();
  });
}

function renderRosterAcampamento() {
  if (!el.campRoster) return;
  const recrutados = herois.filter((h) => nivel(h.id) > 0);
  // A identidade do roster depende de quem foi contratado, não do nível.
  // Antes, cada level-up reconstruía o DOM e podia invalidar a referência da
  // tenda usada pelo timer que acenderia sua luz ao fim da caminhada noturna.
  const assinatura = recrutados.map((h) => h.id).join("|");
  if (assinatura === assinaturaRosterAcampamento) {
    recrutados.forEach((h) => {
      const personagem = el.campRoster.querySelector(`.camp-personagem[data-heroi="${h.id}"]`);
      const nivelEl = personagem && personagem.querySelector(".camp-nivel");
      if (nivelEl) nivelEl.textContent = "Nv " + fmtNivelHeroi(nivel(h.id));
    });
    sincronizarLuzesTendasDormindo();
    return;
  }
  assinaturaRosterAcampamento = assinatura;
  limparAcoesAgendadasAcampamento();
  limparMovimentosAcampamento();
  gruposSociaisAcampamento = [];

  if (!recrutados.length) {
    el.campRoster.innerHTML = '<p class="camp-vazio">O acampamento ainda está quieto. Seus primeiros companheiros aparecerão aqui quando forem contratados.</p>';
    return;
  }

  const tendas = recrutados.map((h, i) => {
    const [tx, ty] = POSICOES_TENDAS[i % POSICOES_TENDAS.length];
    const escala = (0.82 + ty / 100 * 0.28).toFixed(2);
    return `
      <div class="camp-tenda-mundo" data-heroi="${h.id}" data-x="${tx}" data-y="${ty}"
        style="left:${tx}%;top:${ty}%;--camp-tenda-escala:${escala};z-index:${1000 + Math.round(ty * 10)}" aria-label="Tenda de ${h.nome}">
        <div class="camp-tenda"><span class="camp-tenda-telhado"></span><span class="camp-tenda-porta"></span><span class="camp-tenda-luz"></span></div>
      </div>`;
  }).join("");

  const pessoas = recrutados.map((h, i) => {
    const [x, y] = POSICOES_INICIAIS[i % POSICOES_INICIAIS.length];
    const escala = (0.78 + y / 100 * 0.34).toFixed(2);
    return `
      <div class="camp-personagem" data-heroi="${h.id}" data-camp-x="${x}" data-camp-y="${y}"
        style="--camp-x:${x}%;--camp-y:${y}%;--camp-escala:${escala};z-index:${1000 + Math.round(y * 10)}" role="button" tabindex="0" aria-label="Ver personagem ${h.nome}">
        <span class="camp-fala" aria-hidden="true"></span>
        <canvas class="camp-sprite" width="16" height="16" data-sprite="${h.sprite}" data-heroi="${h.id}" data-passos-fase="${i % 2}" aria-label="${h.nome}"></canvas>
        <span class="camp-nome">${h.nome.split(",")[0]}</span>
        <span class="camp-nivel">Nv ${fmtNivelHeroi(nivel(h.id))}</span>
      </div>`;
  }).join("");

  el.campRoster.innerHTML = tendas + pessoas;
  el.campRoster.querySelectorAll("canvas[data-sprite]").forEach((c) => desenharSpriteHeroiEquipado(c, c.dataset.sprite, c.dataset.heroi));
  // Mede a base real das imagens depois do layout, inclusive a altura intrínseca
  // dos PNGs transparentes, para ordenar árvores e objetos por profundidade.
  requestAnimationFrame(() => requestAnimationFrame(atualizarCamadasProfundidadeAcampamento));

  // Se um herói for contratado já durante a noite, sua tenda aparece ocupada.
  if (el.campCenario && el.campCenario.dataset.periodo === "noite" && !encontroFogueiraAtivo) {
    personagensAcampamento().forEach((p) => {
      p.classList.remove("andando", "indo-tenda", "reunido", "socializando");
      p.classList.add("dentro-tenda");
      marcarTendaOcupada(p);
    });
  } else if (estado.acampado && el.campCenario && el.campCenario.dataset.periodo === "dia") {
    agendarAcampamento(formarGruposSociaisAcampamento, 900);
  }
}

function moverPersonagemParaTenda(personagem, atraso = 0) {
  if (!personagem) return;
  const tendaInicial = tendaDoPersonagem(personagem);
  if (!tendaInicial) return;
  const x = Number(tendaInicial.dataset.x);
  const y = Number(tendaInicial.dataset.y) + 6.9;
  personagem.classList.remove("reunido", "socializando", "dentro-tenda");
  agendarAcampamento(() => {
    if (!estado.acampado || el.campCenario.dataset.periodo !== "noite") return;
    personagem.classList.add("indo-tenda");
    caminharDevagarAcampamento(personagem, x, y, () => {
      personagem.classList.remove("indo-tenda", "socializando");
      personagem.classList.add("dentro-tenda");
      marcarTendaOcupada(personagem);
    }, { passoPx: PASSO_PIXEL_ACAO_ACAMPAMENTO });
  }, atraso);
}

function recolherGrupoNasTendas() {
  limparAcoesAgendadasAcampamento();
  limparMovimentosAcampamento();
  gruposSociaisAcampamento = [];
  encontroFogueiraAtivo = false;
  if (el.campCenario) el.campCenario.classList.remove("camp-reuniao");
  personagensAcampamento().forEach((p, i) => {
    p.classList.remove("socializando", "reunido", "andando", "saindo-tenda");
    moverPersonagemParaTenda(p, i * 230);
  });
}

function iniciarEncontroFogueira() {
  const pessoas = personagensAcampamento();
  if (pessoas.length < 2) {
    recolherGrupoNasTendas();
    return;
  }
  limparAcoesAgendadasAcampamento();
  limparMovimentosAcampamento();
  gruposSociaisAcampamento = [];
  encontroFogueiraAtivo = true;
  el.campCenario.classList.add("camp-reuniao");
  let reunidos = 0;
  pessoas.forEach((p, i) => {
    const [x, y] = POSICOES_FOGUEIRA[i % POSICOES_FOGUEIRA.length];
    const tenda = tendaDoPersonagem(p);
    if (tenda) tenda.classList.remove("ocupada");
    p.classList.remove("dentro-tenda", "indo-tenda", "socializando");
    agendarAcampamento(() => {
      caminharDevagarAcampamento(p, x, y, () => {
        p.classList.add("reunido");
        mostrarFalaAcampamento(p);
        reunidos++;
        if (reunidos === pessoas.length) iniciarDuracaoEncontro();
      }, { passoPx: PASSO_PIXEL_ACAO_ACAMPAMENTO });
    }, i * 180);
  });

  function iniciarDuracaoEncontro() {
    if (timerEncontroAcampamento) clearTimeout(timerEncontroAcampamento);
    timerEncontroAcampamento = setTimeout(() => {
      timerEncontroAcampamento = null;
      if (estado.acampado && el.campCenario.dataset.periodo === "noite") recolherGrupoNasTendas();
    }, 12500);
  }
}
function iniciarNoiteAcampamento() {
  if (!el.campCenario) return;
  limparPassarosAcampamento();
  limparAcoesAgendadasAcampamento();
  limparMovimentosAcampamento();
  if (timerEncontroAcampamento) clearTimeout(timerEncontroAcampamento);
  timerEncontroAcampamento = null;
  const pessoas = personagensAcampamento();
  const encontro = pessoas.length >= 2 && Math.random() < 0.28;
  if (encontro) iniciarEncontroFogueira();
  else recolherGrupoNasTendas();
}

function amanhecerAcampamento() {
  limparAcoesAgendadasAcampamento();
  limparMovimentosAcampamento();
  limparPassarosAcampamento();
  if (timerEncontroAcampamento) clearTimeout(timerEncontroAcampamento);
  timerEncontroAcampamento = null;
  encontroFogueiraAtivo = false;
  gruposSociaisAcampamento = [];
  if (el.campCenario) el.campCenario.classList.remove("camp-reuniao");
  el.campRoster.querySelectorAll(".camp-tenda-mundo").forEach((t) => t.classList.remove("ocupada"));
  personagensAcampamento().forEach((p, i) => {
    const tenda = tendaDoPersonagem(p);
    const x = tenda ? Number(tenda.dataset.x) : 20 + i * 8;
    const y = tenda ? Number(tenda.dataset.y) + 6.9 : 56;
    p.classList.remove("dentro-tenda", "indo-tenda", "reunido", "andando", "socializando");
    posicionarPersonagemAcampamento(p, x, y, "saindo-tenda");
  });
  // Ao amanhecer, os heróis deixam suas tendas aos poucos e se distribuem
  // em pequenos grupos espalhados pelas clareiras do acampamento.
  agendarAcampamento(formarGruposSociaisAcampamento, 1100);
  agendarPassaroAcampamento(iniciarPassarosAcampamento, 1800);
}

function atualizarPeriodoAcampamento() {
  if (!estado.acampado || !el.campCenario) return;
  if (!inicioCicloAcampamento) inicioCicloAcampamento = Date.now();
  // Um dia completo dura 12 minutos: seis minutos de luz e seis de noite.
  const DURACAO_PERIODO_ACAMPAMENTO = 6 * 60 * 1000;
  const DURACAO_CICLO_ACAMPAMENTO = DURACAO_PERIODO_ACAMPAMENTO * 2;
  const fase = (Date.now() - inicioCicloAcampamento) % DURACAO_CICLO_ACAMPAMENTO;
  const noite = fase >= DURACAO_PERIODO_ACAMPAMENTO;
  const periodo = noite ? "noite" : "dia";
  el.campCenario.dataset.periodo = periodo;
  if (el.campPeriodo) el.campPeriodo.textContent = noite ? "Noite" : "Dia";
  if (periodoAnteriorAcampamento !== periodo) {
    periodoAnteriorAcampamento = periodo;
    if (noite) iniciarNoiteAcampamento();
    else amanhecerAcampamento();
  }
  // Reparo idempotente: depois que cada herói está escondido na própria tenda,
  // garante que a luz correspondente permaneça acesa mesmo se um timer falhar.
  sincronizarLuzesTendasDormindo();
}

function iniciarCicloAcampamento() {
  if (!estado.acampado) {
    clearInterval(timerCicloAcampamento);
    clearInterval(timerFalasAcampamento);
    clearInterval(timerPasseioAcampamento);
    clearInterval(timerPassosAcampamento);
    if (timerEncontroAcampamento) clearTimeout(timerEncontroAcampamento);
    timerCicloAcampamento = null;
    timerFalasAcampamento = null;
    timerPasseioAcampamento = null;
    timerPassosAcampamento = null;
    timerEncontroAcampamento = null;
    limparAcoesAgendadasAcampamento();
    limparMovimentosAcampamento();
    gruposSociaisAcampamento = [];
    limparPassarosAcampamento();
    inicioCicloAcampamento = 0;
    periodoAnteriorAcampamento = null;
    encontroFogueiraAtivo = false;
    return;
  }
  if (!inicioCicloAcampamento) inicioCicloAcampamento = Date.now();
  if (!timerCicloAcampamento) timerCicloAcampamento = setInterval(atualizarPeriodoAcampamento, 1000);

  if (telaAcampamento) {
    // A cada pouco mais de um minuto, apenas alguns companheiros mudam de
    // grupo; os demais continuam conversando onde já estão.
    if (!timerPasseioAcampamento) timerPasseioAcampamento = setInterval(rotacionarGruposSociaisAcampamento, 68000);
    if (!timerPassosAcampamento) timerPassosAcampamento = setInterval(atualizarPassosAcampamento, PASSO_INTERVALO_ACAMPAMENTO / 2);
    if (!timerFalasAcampamento) timerFalasAcampamento = setInterval(atualizarFalasGruposAcampamento, 8200);
  } else {
    clearInterval(timerPasseioAcampamento);
    clearInterval(timerFalasAcampamento);
    clearInterval(timerPassosAcampamento);
    timerPasseioAcampamento = null;
    timerFalasAcampamento = null;
    timerPassosAcampamento = null;
    limparPassarosAcampamento();
  }
  atualizarPeriodoAcampamento();
  if (telaAcampamento && el.campCenario.dataset.periodo === "dia") iniciarPassarosAcampamento();
}

function renderEstadoAcampamento() {
  const acampado = estado.acampado === true;
  const mostrarAcampamento = acampado && telaAcampamento;
  if (el.jogo) el.jogo.classList.toggle("tela-acampamento", mostrarAcampamento);
  if (el.palcoCol) el.palcoCol.hidden = mostrarAcampamento;
  if (el.grupo) el.grupo.hidden = mostrarAcampamento;
  if (el.loja) el.loja.hidden = mostrarAcampamento;
  if (el.acampamento) el.acampamento.hidden = !mostrarAcampamento;
  if (el.btnCampToggle) {
    el.btnCampToggle.hidden = !acampado;
    el.btnCampToggle.setAttribute("aria-label", mostrarAcampamento ? "Abrir gestão de heróis" : "Voltar ao acampamento");
    el.btnCampToggle.title = mostrarAcampamento ? "Abrir gestão" : "Voltar ao acampamento";
    el.btnCampToggle.innerHTML = mostrarAcampamento
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 6"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 19 12 4l9 15H3Z"/><path d="M9 19v-5h6v5M3 19h18"/></svg>';
  }
  const destino = mostrarAcampamento ? el.campRodape : el.modoZonaOrigem;
  if (destino && el.btnFarm && el.btnFarm.parentElement !== destino) destino.appendChild(el.btnFarm);
  if (el.btnFarm) {
    el.btnFarm.disabled = acampado && !mostrarAcampamento;
    el.btnFarm.classList.toggle("btn-sair-acampamento", mostrarAcampamento);
  }
  if (el.monstro) el.monstro.hidden = acampado;
  if (el.zonaPausada) {
    el.zonaPausada.hidden = !acampado;
    el.zonaPausada.querySelector("b").textContent = `Acampamento na Zona ${estado.campZona || estado.zona}`;
  }
  if (el.alvo) el.alvo.hidden = acampado;
  if (el.taxas) el.taxas.hidden = acampado;
  if (el.habilidades) el.habilidades.hidden = acampado;
  window.jogoEmDescanso = acampado;
  if (acampado) {
    const bioma = biomas[indiceBioma(estado.zona)].nome;
    el.campSubtitulo.textContent = `Zona ${estado.campZona || estado.zona} · ${bioma} · ${herois.filter((h) => nivel(h.id) > 0).length} companheiros descansando`;
    renderRosterAcampamento();
    renderEstruturasAcampamento();
    renderEstacoesVisuaisAcampamento();
    iniciarCicloAcampamento();
  } else {
    assinaturaRosterAcampamento = "";
    iniciarCicloAcampamento();
  }
}

function mostrarPerguntaAcampamento() {
  if (!el.campPergunta) return;
  pausar(true);
  el.campPergunta.hidden = false;
  el.btnCampDescansar.focus();
}

function continuarDaParada() {
  el.campPergunta.hidden = true;
  const destino = estado.zona + 1;
  pausar(false);
  mudarZona(destino);
  spawn();
  renderTudo();
  salvar(false);
}

function entrarNoAcampamento() {
  el.campPergunta.hidden = true;
  estado.acampado = true;
  estado.campZona = estado.zona;
  telaAcampamento = true;
  inicioCicloAcampamento = Date.now();
  periodoAnteriorAcampamento = null;
  encontroFogueiraAtivo = false;
  pausar(true);
  renderTudo();
  salvar(false);
}

function sairDoAcampamento() {
  if (!estado.acampado) return;
  const zonaAcampamento = estado.campZona || estado.zona;
  estado.acampado = false;
  estado.campZona = 0;
  telaAcampamento = true;
  assinaturaRosterAcampamento = "";
  periodoAnteriorAcampamento = null;
  encontroFogueiraAtivo = false;
  pausar(false);
  mudarZona(zonaAcampamento + 1);
  spawn();
  renderTudo();
  salvar(false);
}

function alternarTelaAcampamento() {
  if (!estado.acampado) return;
  telaAcampamento = !telaAcampamento;
  renderTudo();
}

function renderZona() {
  const z = estado.zona;
  el.zonaNome.textContent = "Zona " + z + " · " + biomas[indiceBioma(z)].nome;
  el.pips.innerHTML = ehChefe(z)
    ? '<span class="pip-chefe">CHEFE</span>'
    : Array.from(
        { length: MONSTROS_POR_ZONA },
        (_, i) =>
          '<span class="pip' + (i < estado.abates ? " on" : "") + '"></span>',
      ).join("");
  el.recorde.textContent = "Recorde: zona " + estado.zonaMax;
  el.btnFarm.textContent = estado.acampado
    ? (telaAcampamento ? "Sair do acampamento" : "Descanso ativo")
    : estado.farm ? "Modo: farmar esta zona" : "Modo: avançar de zona";
  el.btnFarm.setAttribute("aria-pressed", String(!estado.farm && !estado.acampado));
  el.btnFarm.disabled = estado.acampado && !telaAcampamento;
  atualizarMapaExpedicao();
}

function renderVida() {
  if (!monstro) return;
  el.vidaFill.style.width =
    Math.max(0, (monstro.hp / monstro.hpMax) * 100) + "%";
  el.vidaTexto.textContent =
    fmt(Math.ceil(monstro.hp)) + " / " + fmt(monstro.hpMax);
}

function estruturaConstruida(id) {
  return (estado.inventario?.estruturas || []).includes(id);
}

function renderEstruturasAcampamento() {
  if (!el.campOficinasGrade) return;
  const feitas = ESTRUTURAS_ACAMPAMENTO.filter((e) => estruturaConstruida(e.id)).length;
  const progresso = document.getElementById("camp-oficinas-progresso");
  if (progresso) progresso.textContent = `${feitas} de ${ESTRUTURAS_ACAMPAMENTO.length} estruturas construídas`;

  el.campOficinasGrade.innerHTML = ESTRUTURAS_ACAMPAMENTO.map((estrutura) => {
    const construida = estruturaConstruida(estrutura.id);
    const prerequisito = estrutura.requer && !estruturaConstruida(estrutura.requer)
      ? ESTRUTURAS_ACAMPAMENTO.find((e) => e.id === estrutura.requer)
      : null;
    const custos = estrutura.custo.map((custo) => {
      const material = MATERIAIS.find((m) => m.id === custo.id);
      const disponivel = quantidadeMaterial(custo.id);
      const suficiente = disponivel >= custo.quantidade;
      return `<span class="camp-oficina-custo ${suficiente ? "suficiente" : "insuficiente"}" title="${material.nome}: ${disponivel} de ${custo.quantidade}">
        <canvas width="8" height="8" data-oficina-icone="${material.icone}" aria-hidden="true"></canvas>
        <b>${disponivel}/${custo.quantidade}</b><small>${material.nome}</small>
      </span>`;
    }).join("");
    const temMateriais = estrutura.custo.every((c) => quantidadeMaterial(c.id) >= c.quantidade);
    const podeConstruir = !construida && !prerequisito && temMateriais;
    const status = construida ? "Construída" : prerequisito ? `Requer ${prerequisito.nome}` : temMateriais ? "Pronta para construir" : "Materiais insuficientes";
    const acao = construida
      ? `<button class="btn-mini camp-oficina-acao" type="button" data-acessar-estacao="${estrutura.id}">Acessar estação</button>`
      : `<button class="btn-mini camp-oficina-acao" type="button" data-construir-estacao="${estrutura.id}" ${podeConstruir ? "" : "disabled"}>${prerequisito ? "Pré-requisito pendente" : podeConstruir ? "Construir" : "Faltam materiais"}</button>`;
    return `<article class="camp-oficina-card ${construida ? "construida" : ""} ${prerequisito ? "bloqueada" : ""}" data-estacao="${estrutura.id}">
      <div class="camp-oficina-cabecalho">
        <div class="camp-oficina-arte camp-oficina-arte-${estrutura.tipo}" aria-hidden="true"><span></span><i></i><b></b></div>
        <div class="camp-oficina-identidade"><span class="camp-oficina-etiqueta">${estrutura.tipo === "forja" ? "METALURGIA" : "TRABALHO MANUAL"}</span><h4>${estrutura.nome}</h4><span class="camp-oficina-status">${status}</span></div>
      </div>
      <p class="camp-oficina-descricao">${estrutura.descricao}</p>
      <div class="camp-oficina-funcao"><b>Especialidade:</b> ${estrutura.funcao}</div>
      ${construida ? `<div class="camp-oficina-pronta">✦ Estrutura instalada no acampamento</div>` : `<div class="camp-oficina-materiais"><b>Materiais necessários</b><div class="camp-oficina-custos">${custos}</div></div>`}
      ${acao}
    </article>`;
  }).join("");

  el.campOficinasGrade.querySelectorAll("canvas[data-oficina-icone]").forEach((canvas) => {
    desenharIcone(canvas, canvas.dataset.oficinaIcone);
  });
}

function construirEstrutura(id) {
  if (!estado.acampado || !telaAcampamento) return;
  const estrutura = ESTRUTURAS_ACAMPAMENTO.find((e) => e.id === id);
  if (!estrutura || estruturaConstruida(id)) return;
  if (estrutura.requer && !estruturaConstruida(estrutura.requer)) {
    const req = ESTRUTURAS_ACAMPAMENTO.find((e) => e.id === estrutura.requer);
    toast(`Construa ${req?.nome || "a estrutura anterior"} primeiro.`);
    return;
  }
  const faltantes = estrutura.custo.filter((c) => quantidadeMaterial(c.id) < c.quantidade);
  if (faltantes.length) {
    toast("Ainda faltam materiais para esta construção.");
    som("erro");
    return;
  }

  // A conferência e o consumo ocorrem juntos para evitar gastar parcialmente.
  for (const custo of estrutura.custo) {
    estado.inventario.materiais[custo.id] = Math.max(0, quantidadeMaterial(custo.id) - custo.quantidade);
    const pendentes = Number(estado.inventario.novos?.[custo.id]) || 0;
    if (pendentes > 0) {
      const restantes = Math.max(0, pendentes - custo.quantidade);
      if (restantes) estado.inventario.novos[custo.id] = restantes;
      else delete estado.inventario.novos[custo.id];
    }
  }
  if (!Array.isArray(estado.inventario.estruturas)) estado.inventario.estruturas = [];
  estado.inventario.estruturas.push(estrutura.id);
  renderEstruturasAcampamento();
  renderEstacoesVisuaisAcampamento();
  atualizarSeloInventario();
  salvar(false);
  som("hab");
  toast(`${estrutura.nome} construída!`);
}

function renderReceitasEstacao(id) {
  const receitas = RECEITAS_EQUIPAMENTO.filter((r) => r.estacao === id);
  const itensCriados = estado.inventario?.equipamentos?.length || 0;
  const cards = receitas.map((receita) => {
    const custos = receita.custo.map((custo) => {
      const material = MATERIAIS.find((m) => m.id === custo.id);
      const disponivel = quantidadeMaterial(custo.id);
      const suficiente = disponivel >= custo.quantidade;
      return `<span class="receita-custo ${suficiente ? "suficiente" : "insuficiente"}" title="${material.nome}: ${disponivel} de ${custo.quantidade}"><canvas width="8" height="8" data-oficina-icone="${material.icone}" aria-hidden="true"></canvas><b>${disponivel}/${custo.quantidade}</b><small>${material.nome}</small></span>`;
    }).join("");
    const podeFabricar = receita.custo.every((c) => quantidadeMaterial(c.id) >= c.quantidade);
    return `<article class="receita-card raridade-${receita.raridade}">
      <div class="receita-card-topo"><span class="receita-icone">${iconeEquipamentoHtml(receita)}</span><span class="receita-identidade"><b>${receita.nome}</b><small>${receita.tipo === "arma" ? "Arma · " + (NOME_TIPO_ARMA[receita.tipoArma] || "Equipamento") : receita.tipo} · ${receita.raridadeNome}</small></span><span class="receita-selo">${receita.raridadeNome}</span></div>
      <p>${receita.descricao}</p>
      <div class="receita-efeitos">${receita.efeitos.map((efeito) => `<span>✦ ${efeito}</span>`).join("")}</div>
      <div class="receita-materiais"><b>Materiais necessários</b><div class="receita-custos">${custos}</div></div>
      <button class="btn-mini receita-fabricar" type="button" data-craft-receita="${receita.id}" ${podeFabricar ? "" : "disabled"}>${podeFabricar ? "Fabricar equipamento" : "Materiais insuficientes"}</button>
    </article>`;
  }).join("");
  el.oficinaModalConteudo.innerHTML = `<div class="oficina-receitas-intro"><span class="oficina-em-preparo-icone">${id === "forja" ? "🔥" : "⚒️"}</span><div><b>${id === "forja" ? "Armas por especialidade" : "Proteções e acessórios"}</b><p>${id === "forja" ? "Forje espadas, machados, arcos, cajados e adagas. Cada herói só pode usar sua própria categoria." : "Trabalhe couro, tecido e ervas para preparar proteções e talismãs."}</p><small>${itensCriados} ${itensCriados === 1 ? "equipamento" : "equipamentos"} no inventário</small></div></div><div class="receitas-grade">${cards}</div><p class="oficina-receitas-nota">Cada fabricação cria uma unidade. Equipamentos pertencem ao inventário e só podem ser usados por um herói de cada vez.</p>`;
  el.oficinaModalConteudo.querySelectorAll("canvas[data-oficina-icone]").forEach((canvas) => desenharIcone(canvas, canvas.dataset.oficinaIcone));
}

function abrirEstacao(id) {
  const estrutura = ESTRUTURAS_ACAMPAMENTO.find((e) => e.id === id);
  if (!estrutura || !estruturaConstruida(id) || !el.oficinaModal) return;
  el.oficinaModalTitulo.textContent = estrutura.nome;
  el.oficinaModal.dataset.estacao = id;
  renderReceitasEstacao(id);
  el.oficinaModal.hidden = false;
  el.oficinaModalFechar?.focus();
}

function fabricarEquipamento(idReceita) {
  if (!estado.acampado || !telaAcampamento) return;
  const receita = RECEITA_POR_ID(idReceita);
  const estacao = receita && ESTRUTURAS_ACAMPAMENTO.find((e) => e.id === receita.estacao);
  if (!receita || !estruturaConstruida(receita.estacao) || el.oficinaModal?.dataset.estacao !== receita.estacao) return;
  const faltantes = receita.custo.filter((c) => quantidadeMaterial(c.id) < c.quantidade);
  if (faltantes.length) {
    toast("Faltam materiais para fabricar este equipamento.");
    som("erro");
    renderReceitasEstacao(receita.estacao);
    return;
  }
  if (!Array.isArray(estado.inventario.equipamentos)) estado.inventario.equipamentos = [];
  if (estado.inventario.equipamentos.length >= 300) {
    toast("O inventário chegou ao limite de 300 equipamentos.");
    return;
  }
  // Valida todos os custos antes de consumir qualquer recurso.
  for (const custo of receita.custo) {
    estado.inventario.materiais[custo.id] = Math.max(0, quantidadeMaterial(custo.id) - custo.quantidade);
    const pendentes = Number(estado.inventario.novos?.[custo.id]) || 0;
    if (pendentes > 0) {
      const restantes = Math.max(0, pendentes - custo.quantidade);
      if (restantes) estado.inventario.novos[custo.id] = restantes;
      else delete estado.inventario.novos[custo.id];
    }
  }
  const idItem = `eq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  estado.inventario.equipamentos.push({
    id: idItem,
    receitaId: receita.id,
    tipo: receita.tipo,
    tipoArma: receita.tipoArma || null,
    nome: receita.nome,
    icone: receita.icone,
    raridade: receita.raridade,
    raridadeNome: receita.raridadeNome,
    descricao: receita.descricao,
    bonus: { ...receita.bonus },
    efeitos: [...receita.efeitos],
  });
  salvar(false);
  atualizarSeloInventario();
  renderReceitasEstacao(receita.estacao);
  if (el.inventarioMateriais && !el.inventarioMateriais.hidden && filtroInventarioMateriais === "equipamentos") renderInventarioEquipamentos();
  som("hab");
  toast(`${receita.nome} fabricado! Abra a ficha de um herói para equipá-lo.`);
}

function renderEstacoesVisuaisAcampamento() {
  if (!el.campEstacoes) return;
  const posicoes = {
    bancadaOficio: { x: 39, y: 22, titulo: "Bancada de Ofício", classe: "bancada" },
    forja: { x: 61, y: 22, titulo: "Forja", classe: "forja" },
  };
  const construidas = ESTRUTURAS_ACAMPAMENTO.filter((e) => estruturaConstruida(e.id));
  el.campEstacoes.innerHTML = construidas.map((estrutura) => {
    const p = posicoes[estrutura.id];
    if (!p) return "";
    return `<button type="button" class="camp-estacao-mundo camp-estacao-${p.classe}" data-estacao-mundo="${estrutura.id}" style="left:${p.x}%;top:${p.y}%;--camp-estacao-escala:${(0.78 + p.y / 100 * 0.34).toFixed(2)};z-index:${1000 + Math.round(p.y * 10)}" aria-label="Abrir ${p.titulo}" title="${p.titulo} · clicar para usar">
      <span class="camp-estacao-arte" aria-hidden="true"><i></i><b></b><em></em><strong></strong></span>
      <span class="camp-estacao-placa">${p.titulo}</span><span class="camp-estacao-sinal">●</span>
    </button>`;
  }).join("");
}

function fecharModalEstacao() {
  if (el.oficinaModal) el.oficinaModal.hidden = true;
}

function configurarEstruturasAcampamento() {
  el.campEstacoes?.addEventListener("click", (e) => {
    const estacao = e.target.closest("[data-estacao-mundo]");
    if (estacao) abrirEstacao(estacao.dataset.estacaoMundo);
  });
  el.oficinaModalConteudo?.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-craft-receita]");
    if (botao && !botao.disabled) fabricarEquipamento(botao.dataset.craftReceita);
  });
  el.campOficinasGrade?.addEventListener("click", (e) => {
    const construir = e.target.closest("[data-construir-estacao]");
    if (construir && !construir.disabled) {
      construirEstrutura(construir.dataset.construirEstacao);
      return;
    }
    const acessar = e.target.closest("[data-acessar-estacao]");
    if (acessar) abrirEstacao(acessar.dataset.acessarEstacao);
  });
  el.oficinaModalFechar?.addEventListener("click", fecharModalEstacao);
  el.oficinaModal?.addEventListener("click", (e) => {
    if (e.target === el.oficinaModal) fecharModalEstacao();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.oficinaModal && !el.oficinaModal.hidden) {
      e.stopPropagation();
      fecharModalEstacao();
    }
  });
}

let filtroInventarioMateriais = "todos";

function atualizarSeloInventario() {
  if (!el.seloMateriais) return;
  const novos = estado.inventario?.novos || {};
  const totalNovos = Object.values(novos).reduce((s, n) => s + (Number.isFinite(n) ? n : 0), 0);
  const tiposNovos = Object.values(novos).filter((n) => Number.isFinite(n) && n > 0).length;
  el.seloMateriais.hidden = totalNovos <= 0;
  el.seloMateriais.textContent = totalNovos > 99 ? "99+" : String(totalNovos);
  if (el.btnInventario) {
    el.btnInventario.classList.toggle("tem-materiais", totalNovos > 0);
    el.btnInventario.title = totalNovos > 0
      ? `${totalNovos.toLocaleString("pt-BR")} materiais novos em ${tiposNovos} tipos · abrir inventário`
      : "Inventário de materiais";
    el.btnInventario.setAttribute("aria-label", el.btnInventario.title);
  }
}

function renderInventarioMateriais() {
  if (!el.inventarioGrade) return;
  if (filtroInventarioMateriais === "equipamentos") {
    renderInventarioEquipamentos();
    el.inventarioFiltros?.querySelectorAll("[data-filtro-material]").forEach((b) => {
      const ativo = b.dataset.filtroMaterial === filtroInventarioMateriais;
      b.classList.toggle("ativo", ativo);
      b.setAttribute("aria-pressed", String(ativo));
    });
    return;
  }
  const materiais = estado.inventario?.materiais || {};
  const total = Object.values(materiais).reduce((s, n) => s + (Number.isFinite(n) ? n : 0), 0);
  const tipos = Object.values(materiais).filter((n) => Number.isFinite(n) && n > 0).length;
  if (el.inventarioResumo) {
    el.inventarioResumo.textContent = total > 0
      ? `${total.toLocaleString("pt-BR")} unidades guardadas · ${tipos} tipos encontrados`
      : "Seu inventário está vazio. Derrote monstros para encontrar os primeiros materiais.";
  }
  const lista = MATERIAIS.filter((m) => filtroInventarioMateriais === "todos" || m.categoria === filtroInventarioMateriais);
  el.inventarioGrade.innerHTML = lista.map((m) => {
    const quantidade = materiais[m.id] || 0;
    const bloqueado = m.heroi && nivel(m.heroi) <= 0;
    const fonte = bloqueado ? `Desbloqueia ao contratar ${m.heroi === "padre" ? "Padre Thalles" : "pedrinhoo07140"}` : m.fonte;
    return `<article class="material-card ${quantidade > 0 ? "tem-quantidade" : ""} ${bloqueado ? "material-bloqueado" : ""}" data-categoria="${m.categoria}">
      <span class="material-icone"><canvas width="8" height="8" data-material-icone="${m.icone}" aria-hidden="true"></canvas></span>
      <span class="material-info"><b>${m.nome}</b><small>${m.descricao}</small><em>${fonte}</em></span>
      <strong class="material-quantidade">×${quantidade.toLocaleString("pt-BR")}</strong>
    </article>`;
  }).join("");
  el.inventarioGrade.querySelectorAll("canvas[data-material-icone]").forEach((canvas) => desenharIcone(canvas, canvas.dataset.materialIcone));
  el.inventarioFiltros?.querySelectorAll("[data-filtro-material]").forEach((b) => {
    const ativo = b.dataset.filtroMaterial === filtroInventarioMateriais;
    b.classList.toggle("ativo", ativo);
    b.setAttribute("aria-pressed", String(ativo));
  });
  atualizarSeloInventario();
}

function renderInventarioEquipamentos() {
  const itens = estado.inventario?.equipamentos || [];
  const total = itens.length;
  if (el.inventarioResumo) el.inventarioResumo.textContent = `${total} ${total === 1 ? "equipamento fabricado" : "equipamentos fabricados"} · itens não equipados ficam disponíveis para a equipe`;
  if (!total) {
    el.inventarioGrade.innerHTML = `<div class="inventario-vazio-equipamentos"><span>⚒</span><b>Nenhum equipamento fabricado</b><p>Construa a forja ou a bancada e visite uma delas para criar seu primeiro item.</p></div>`;
    return;
  }
  const usados = new Map();
  for (const h of herois) {
    const slots = estado.equipamentosHerois?.[h.id] || {};
    for (const id of Object.values(slots)) if (id) usados.set(id, h.nome.split(",")[0]);
  }
  el.inventarioGrade.innerHTML = itens.map((item) => {
    const dono = usados.get(item.id);
    return `<article class="equipamento-inventario-card raridade-${item.raridade}">
      <span class="equipamento-inventario-icone">${iconeEquipamentoHtml(item)}</span>
      <span class="equipamento-inventario-info"><b>${item.nome}</b><small>${item.tipo === "arma" ? "Arma · " + (NOME_TIPO_ARMA[tipoArmaDoItem(item)] || "Equipamento") : item.tipo} · ${item.raridadeNome}</small><em>${textoEfeitosItem(item)}</em>${dono ? `<strong>Equipado em ${dono}</strong>` : `<strong>Disponível</strong>`}</span>
    </article>`;
  }).join("");
}

function abrirInventarioMateriais() {
  if (!el.inventarioMateriais) return;
  filtroInventarioMateriais = "todos";
  // Ao abrir, o jogador está visualizando o conteúdo: limpa somente as
  // novidades pendentes, não as quantidades armazenadas dos materiais.
  const pendentes = estado.inventario?.novos || {};
  const haviaNovidades = Object.values(pendentes).some((n) => Number.isFinite(n) && n > 0);
  if (haviaNovidades) {
    estado.inventario.novos = {};
    atualizarSeloInventario();
    salvar(false);
  }
  renderInventarioMateriais();
  el.inventarioMateriais.hidden = false;
  el.inventarioFechar?.focus();
}

function fecharInventarioMateriais() {
  if (!el.inventarioMateriais) return;
  el.inventarioMateriais.hidden = true;
  el.btnInventario?.focus();
}

function configurarInventarioMateriais() {
  el.btnInventario?.addEventListener("click", abrirInventarioMateriais);
  el.inventarioFechar?.addEventListener("click", fecharInventarioMateriais);
  el.inventarioMateriais?.addEventListener("click", (e) => {
    if (e.target === el.inventarioMateriais) fecharInventarioMateriais();
  });
  el.inventarioFiltros?.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-filtro-material]");
    if (!botao) return;
    filtroInventarioMateriais = botao.dataset.filtroMaterial;
    renderInventarioMateriais();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.inventarioMateriais && !el.inventarioMateriais.hidden) {
      e.stopPropagation();
      fecharInventarioMateriais();
    }
  });
}

function renderStats() {
  el.ouro.textContent = fmt(Math.floor(estado.ouro));
  el.danoClique.textContent = fmt(danoClique());
  el.dps.textContent = fmt(dps());
}

function renderTudo() {
  atualizarSeloInventario();
  atualizarSelo();
  atualizarAbasArvore();
  renderZona();
  renderVida();
  renderStats();
  atualizarHerois();
  atualizarGrupo();
  renderHabilidades();
  renderEstadoAcampamento();
  atualizarSpritesHeroisEquipados();
}

el.btnFarm.addEventListener("click", () => {
  if (estado.acampado) {
    if (telaAcampamento) sairDoAcampamento();
    return;
  }
  estado.farm = !estado.farm;
  renderZona();
});

el.btnCampToggle.addEventListener("click", alternarTelaAcampamento);
el.btnCampDescansar.addEventListener("click", entrarNoAcampamento);
el.btnCampContinuar.addEventListener("click", continuarDaParada);

/* =========================================================
   Salvar, carregar e zerar
   ========================================================= */

function salvar(avisar) {
  estado.salvoEm = Date.now();
  try {
    localStorage.setItem(CHAVE_SAVE, JSON.stringify(estado));
    if (avisar) toast("Jogo salvo.");
  } catch (e) {
    if (avisar) toast("Não foi possível salvar neste navegador.");
  }
  // meta.js (contas e nuvem) se pendura aqui
  if (typeof window.aoSalvarLocal === "function") window.aoSalvarLocal(avisar);
}

// Troca o jogo inteiro por outro estado (ex.: progresso baixado da nuvem)
function aplicarEstadoExterno(obj) {
  clearTimeout(timerAvanco);
  estado = normalizar(obj);
  recalcularBonus();
  talentoEmFoco = null;
  for (const k in acumulador) delete acumulador[k];
  try {
    localStorage.setItem(CHAVE_SAVE, JSON.stringify(estado));
  } catch (e) {
    /* sem storage */
  }
  desenharFundo(indiceBioma(estado.zona));
  if (estado.acampado) pausar(true);
  telaAcampamento = true;
  montarGrupo();
  if (!estado.acampado) spawn();
  renderModo();
  renderSom();
  renderTudo();
}

function carregar() {
  try {
    const texto = localStorage.getItem(CHAVE_SAVE);
    return texto ? JSON.parse(texto) : null;
  } catch (e) {
    return null;
  }
}

function normalizar(obj) {
  const e = estadoInicial();
  if (!obj || typeof obj !== "object") return e;
  // Migrações: save antigo (versão < 3) não tinha talentos; dá os pontos
  // dos chefes que o jogador já tinha vencido.
  if (!obj.versao || obj.versao < 3) {
    const zmax = Number.isInteger(obj.zonaMax) ? obj.zonaMax : 1;
    let pts = 1;
    let ultimo = 0;
    for (let z = 5; z < zmax; z += 5) {
      pts += pontosDoChefe(z);
      ultimo = z;
    }
    obj.pontosGanhos = pts;
    obj.chefeMax = ultimo;
  }
  for (const k of ["ouro", "cliques", "abatidos"]) {
    if (Number.isFinite(obj[k]) && obj[k] >= 0) e[k] = obj[k];
  }
  if (Number.isInteger(obj.zona) && obj.zona >= 1) e.zona = obj.zona;
  e.zonaMax = Math.max(e.zona, Number.isInteger(obj.zonaMax) ? obj.zonaMax : 1);
  if (
    Number.isInteger(obj.abates) &&
    obj.abates >= 0 &&
    obj.abates < MONSTROS_POR_ZONA
  )
    e.abates = obj.abates;
  e.pontosGanhos = Number.isInteger(obj.pontosGanhos) && obj.pontosGanhos >= 1 ? obj.pontosGanhos : 1;
  e.chefeMax = Number.isInteger(obj.chefeMax) && obj.chefeMax >= 0 ? obj.chefeMax : 0;
  if (obj.talentos && typeof obj.talentos === "object") {
    let gasto = 0;
    for (const t of talentos) {
      const n = Math.floor(obj.talentos[t.id]);
      if (Number.isFinite(n) && n > 0) {
        const nn = Math.min(n, t.max);
        e.talentos[t.id] = nn;
        gasto += nn * t.custo;
      }
    }
    // save adulterado ou talentos que não cabem nos pontos: devolve tudo
    if (gasto > e.pontosGanhos) e.talentos = {};
  }
  e.tutorialVisto = obj.tutorialVisto === true;
  e.tutorialEquipamentosVisto = obj.tutorialEquipamentosVisto === true;
  e.inventario = normalizarInventario(obj.inventario);
  if (obj.equipamentosHerois && typeof obj.equipamentosHerois === "object") {
    for (const h of herois) {
      const slots = obj.equipamentosHerois[h.id];
      if (!slots || typeof slots !== "object") continue;
      const armaSalva = typeof slots.arma === "string" ? slots.arma : null;
      const itemArmaSalvo = armaSalva ? e.inventario.equipamentos.find((item) => item.id === armaSalva) : null;
      e.equipamentosHerois[h.id] = {
        // Equipamentos antigos incompatíveis voltam ao inventário, sem serem perdidos.
        arma: itemArmaSalvo && heroiPodeUsarArma(h.id, itemArmaSalvo) ? armaSalva : null,
        armadura: typeof slots.armadura === "string" ? slots.armadura : null,
        acessorio: typeof slots.acessorio === "string" ? slots.acessorio : null,
      };
    }
  }
  e.salvoEm = Number.isFinite(obj.salvoEm) ? obj.salvoEm : 0;
  e.farm = obj.farm === true;
  const zonaCampSalva = Number.isInteger(obj.campZona) && obj.campZona >= 10 && obj.campZona % 10 === 0
    ? obj.campZona
    : Number.isInteger(obj.zona) && obj.zona >= 10 && obj.zona % 10 === 0 ? obj.zona : 0;
  e.acampado = obj.acampado === true && zonaCampSalva > 0;
  e.campZona = e.acampado ? zonaCampSalva : 0;
  if (e.acampado) {
    e.zona = e.campZona;
    e.zonaMax = Math.max(e.zonaMax, e.zona);
  }
  e.som = obj.som !== false;
  if (["1", "10", "25", "max"].includes(obj.modo)) e.modo = obj.modo;
  if (obj.herois && typeof obj.herois === "object") {
    for (const h of herois) {
      const n = Math.floor(obj.herois[h.id]);
      if (Number.isFinite(n) && n > 0) e.herois[h.id] = n;
    }
  }
  if (obj.passivasAvisos && typeof obj.passivasAvisos === "object") {
    for (const id of Object.keys(PASSIVAS_ELEMENTAIS)) {
      if ((e.herois[id] || 0) > 0 && obj.passivasAvisos[id] === true) e.passivasAvisos[id] = true;
    }
  }
  for (const h of habilidades) {
    // recargas ficam no máximo 2 min no futuro (relógio mudou, aparelho novo...)
    const lim = Date.now() + 120000;
    if (obj.cdFim && Number.isFinite(obj.cdFim[h.id]))
      e.cdFim[h.id] = Math.min(obj.cdFim[h.id], lim);
    if (obj.ativoFim && Number.isFinite(obj.ativoFim[h.id]))
      e.ativoFim[h.id] = Math.min(obj.ativoFim[h.id], lim);
  }
  for (const id of Object.keys(PASSIVAS_ELEMENTAIS)) {
    if (obj.passivasFim && Number.isFinite(obj.passivasFim[id]))
      e.passivasFim[id] = Math.min(obj.passivasFim[id], Date.now() + 120000);
  }
  return e;
}

configurarInventarioMateriais();
configurarCardsHerois();
configurarEstruturasAcampamento();

el.btnSalvar.addEventListener("click", () => salvar(true));

el.btnSom.addEventListener("click", () => {
  estado.som = !estado.som;
  renderSom();
  if (estado.som) som("hab");
});

function renderSom() {
  el.btnSom.textContent = estado.som ? "Som: ligado" : "Som: desligado";
  el.btnSom.setAttribute("aria-pressed", String(estado.som));
}

let zerarArmado = null;
el.btnZerar.addEventListener("click", () => {
  if (zerarArmado) {
    clearTimeout(zerarArmado);
    zerarArmado = null;
    el.btnZerar.textContent = "Zerar";
    zerar();
  } else {
    el.btnZerar.textContent = "Confirmar?";
    zerarArmado = setTimeout(() => {
      zerarArmado = null;
      el.btnZerar.textContent = "Zerar";
    }, 4000);
  }
});

function zerar() {
  clearTimeout(timerAvanco);
  const somLigado = estado.som;
  const tutVisto = estado.tutorialVisto;
  estado = estadoInicial();
  telaAcampamento = true;
  assinaturaRosterAcampamento = "";
  window.jogoEmDescanso = false;
  estado.som = somLigado;
  estado.tutorialVisto = tutVisto;
  recalcularBonus();
  talentoEmFoco = null;
  try {
    localStorage.removeItem(CHAVE_SAVE);
  } catch (e) {
    /* sem storage */
  }
  for (const k in acumulador) delete acumulador[k];
  desenharFundo(0);
  montarGrupo();
  spawn();
  renderModo();
  renderTudo();
  toast("Jogo zerado.");
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) salvar(false);
});

/* =========================================================
   Laço do jogo: roda a cada 0,1 s
   ========================================================= */

function tick() {
  const real = Date.now();
  const dtReal = Math.min(1, Math.max(0, (real - ultimoTick) / 1000));
  ultimoTick = real;
  const agora = relogio();
  const dt = pausado ? 0 : dtReal * velocidade;

  if (dt > 0 && monstro && !monstro.morrendo) {
    for (const h of herois) {
      if (h.tipo !== "dps" || nivel(h.id) <= 0) continue;
      acumulador[h.id] =
        (acumulador[h.id] === undefined ? Math.random() : acumulador[h.id]) +
        dt;
      let golpes = 0;
      while (acumulador[h.id] >= 1 && golpes < 60) {
        acumulador[h.id] -= 1;
        if (++golpes === 1) animarMembro(h.id);
        const dano = forcaHeroi(h);
        causarDano(dano, "heroi");
        if (!monstro || monstro.morrendo) break;
        tentarAplicarPassiva(h.id, dano);
        if (!monstro || monstro.morrendo) break;
      }
      if (!monstro || monstro.morrendo) break;
    }
    if (monstro && !monstro.morrendo) processarChamasElementais(agora);
  }
  if (!pausado && monstro && monstro.boss && !monstro.morrendo) {
    if (DEV.semTempoChefe) fimChefe = agora + monstro.tempoMax * 1000;
    const resta = (fimChefe - agora) / 1000;
    if (resta <= 0) {
      falharChefe();
    } else {
      el.tempoFill.style.width = (resta / monstro.tempoMax) * 100 + "%";
      el.tempoTexto.textContent = resta.toFixed(1).replace(".", ",") + " s";
      el.tempo.classList.toggle("urgente", resta < 10);
    }
  }
  renderStats();
  atualizarHerois();
  atualizarGrupo();
  renderHabilidades();
}

function iniciar(dados) {
  timers.forEach(clearInterval);
  timers = [];
  clearTimeout(timerAvanco);

  estado = normalizar(dados && dados.estado ? dados.estado : carregar());
  recalcularBonus();
  ultimoTick = Date.now();
  telaAcampamento = true;
  if (estado.acampado) pausar(true);

  desenharFundo(indiceBioma(estado.zona));
  montarHerois();
  montarHabilidades();
  montarGrupo();
  montarArvore();
  renderModo();
  renderSom();
  if (!estado.acampado) spawn();
  renderTudo();

  timers.push(setInterval(tick, 100));
  timers.push(setInterval(() => salvar(false), 5000));
}

try {
  window.claude?.hot?.snapshot?.(() => ({ estado }));
} catch (e) {
  /* sem hot reload */
}

const hot = window.claude?.hot;
if (hot && hot.ready) hot.ready(iniciar);
else iniciar(hot?.data ?? {});
