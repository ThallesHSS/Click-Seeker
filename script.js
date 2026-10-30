"use strict";

/* =========================================================
   CLICK SEEKER HERÓIS — versão estilo Clicker Heroes
   Os números do jogo ficam nas listas abaixo (biomas, herois,
   habilidades). Mudar valores aqui muda o jogo inteiro.
   Os sprites ficam em sprites.js.
   ========================================================= */

const CHAVE_SAVE = "click-seeker-herois-save";
const VERSAO_SAVE = 3; // some 1 quando o formato do save mudar (ver normalizar)

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
];

// Bônus de nível: dano x2 nos níveis 10 e 25, depois x2 a cada 25 níveis
// e x8 a cada 100 níveis (até o nível 1500, para dar margem a updates futuros)
const marcos = [
  { nivel: 10, f: 2 },
  { nivel: 25, f: 2 },
];
for (let n = 50; n <= 1500; n += 25)
  marcos.push({ nivel: n, f: n % 100 === 0 ? 8 : 2 });

/* ---------- Habilidades ativas ---------- */
const habilidades = [
  {
    id: "raio",
    nome: "Raio",
    tecla: "1",
    cd: 20,
    dur: 0,
    dica: () => "Dano enorme no monstro",
  },
  {
    id: "furia",
    nome: "Fúria",
    tecla: "2",
    cd: 45,
    dur: 15,
    dica: () => "Cliques valem x" + multFuria() + " por " + durHab(habilidades[1]) + " s",
  },
  {
    id: "sorte",
    nome: "Sorte",
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
];

const talentoPorId = (id) => talentos.find((t) => t.id === id);

// Soma o efeito de todos os talentos comprados. ranks = { id: nível }
function bonusArvore(ranks) {
  const b = {
    clique: 0, dps: 0, ouro: 0, crit: 0, critMult: 0, sincronia: 0, desconto: 0,
    equipe: 0, lider: 0, bau: 0, bauMult: 0, chefeOuro: 0, chefeTempo: 0,
    recarga: 0, raio: 0, furiaDur: 0, sorteDur: 0, furiaMult: 0, sorteMult: 0,
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
    herois: {},
    talentos: {}, // { idDoTalento: nível }
    pontosGanhos: 1, // pontos de talento ganhos (1 inicial + chefes)
    chefeMax: 0, // maior zona de chefe já vencida
    cdFim: {},
    ativoFim: {},
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
const DEV = { danoMult: 1, ouroMult: 1, custoMult: 1, semTempoChefe: false };
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
  return m;
}

const forcaHeroi = (h) => nivel(h.id) * h.forca * multNivel(nivel(h.id));

const MULT_FURIA = 4;
const MULT_SORTE = 2;
const multFuria = () => MULT_FURIA + B.furiaMult;
const multSorte = () => MULT_SORTE + B.sorteMult;
const chanceCritico = () => Math.min(0.75, CHANCE_CRITICO + B.crit / 100);
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
  (1 + B.ouro / 100) * (ativo("sorte") ? multSorte() : 1) * DEV.ouroMult;
const custoNivel = (h, n) =>
  Math.ceil(
    h.base *
      Math.pow(h.cresc || CRESCIMENTO_CUSTO, n) *
      (1 - B.desconto / 100) *
      DEV.custoMult,
  );

// Quantos níveis o botão compra e quanto custa, conforme o modo (x1, x10, x25, Máx)
function calcLote(h) {
  const n = nivel(h.id);
  if (estado.modo === "max") {
    let k = 0,
      total = 0;
    while (k < 5000) {
      const c = custoNivel(h, n + k);
      if (total + c > estado.ouro) break;
      total += c;
      k++;
    }
    return k === 0 ? { k: 1, total: custoNivel(h, n) } : { k, total };
  }
  const k = Number(estado.modo);
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
  cena: $("#cena"),
  fundo: $("#fundo"),
  zonaNome: $("#zona-nome"),
  pips: $("#pips"),
  grupoGrade: $("#grupo-grade"),
  grupoConta: $("#grupo-conta"),
  grupoDps: $("#grupo-dps"),
  monstro: $("#monstro"),
  monstroCanvas: $("#monstro-canvas"),
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
  toasts: $("#toasts"),
  btnSom: $("#btn-som"),
  btnSalvar: $("#btn-salvar"),
  btnZerar: $("#btn-zerar"),
  btnArvore: $("#btn-arvore"),
  seloPontos: $("#selo-pontos"),
  arvore: $("#arvore"),
  arvoreRamos: $("#arvore-ramos"),
  arvorePontos: $("#arvore-pontos"),
  arvoreInfo: $("#arvore-info"),
  arvoreRedefinir: $("#arvore-redefinir"),
  arvoreFechar: $("#arvore-fechar"),
};

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
    };
  } else {
    const pool = biomas[indiceBioma(z)].monstros;
    const s = pool[Math.floor(Math.random() * pool.length)];
    m = { sprite: s, nome: nomesMonstro[s], hpMax: hp, ouro: ouroPorHp(hp) };
  }
  m.hp = m.hpMax;
  m.morrendo = false;
  monstro = m;

  desenharSprite(el.monstroCanvas, m.sprite);
  el.monstro.className = "monstro entra" + (m.boss ? " chefe" : "");
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
  if (monstro.boss) {
    if (!estado.farm) mudarZona(estado.zona + 1);
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

el.monstro.addEventListener("click", (e) => {
  if (pausado || !monstro || monstro.morrendo) return;
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
        '<span class="heroi-nome"><span class="heroi-titulo">' +
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
    l.nivel.textContent = n > 0 ? "Nv " + n : "";
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
      n === 0 ? "Contratar" : k > 1 ? "Subir +" + k + " níveis" : "Subir nível";
    l.custo.textContent = fmt(total);
    l.btn.setAttribute("aria-disabled", String(estado.ouro < total));
  }
}

function comprarHeroi(id) {
  const h = heroiPorId(id);
  const { k, total } = calcLote(h);
  if (estado.ouro < total) {
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
        '<span class="slot-palco"><canvas class="membro"></canvas></span>' +
        '<span class="slot-nome">' +
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
    desenharSprite(c, h.sprite);
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
      txt(sl.nivel, "Nv " + n);
      txt(
        sl.info,
        h.tipo === "clique"
          ? "+" + fmt(forcaHeroi(h)) + "/clique"
          : fmt(forcaHeroi(h)) + "/s",
      );
    } else {
      txt(sl.nivel, vis === "silhueta" ? "Misterioso" : "Bloqueado");
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

function montarArvore() {
  el.arvoreRamos.innerHTML = RAMOS.map(
    (r) =>
      '<div class="ramo" style="--cor:' +
      r.cor +
      '"><h3>' +
      r.nome +
      "<small>" +
      r.dica +
      '</small></h3><div class="ramo-grade" data-ramo="' +
      r.id +
      '"><svg class="ramo-linhas" aria-hidden="true"></svg>' +
      talentos
        .filter((t) => t.ramo === r.id)
        .map(
          (t) =>
            '<button type="button" class="talento" data-id="' +
            t.id +
            '" style="grid-column:' +
            (t.pos[0] + 1) +
            ";grid-row:" +
            (t.pos[1] + 1) +
            '"><canvas class="talento-icone"></canvas><span class="talento-nivel"></span></button>',
        )
        .join("") +
      "</div></div>",
  ).join("");
  nosTalento = {};
  for (const t of talentos) {
    const b = el.arvoreRamos.querySelector('.talento[data-id="' + t.id + '"]');
    desenharIcone(b.querySelector("canvas"), t.icone);
    nosTalento[t.id] = { b, nivel: b.querySelector(".talento-nivel") };
  }
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
  talentoEmFoco = id;
  const t = talentoPorId(id);
  const n = rankTalento(id);
  let h = "<b>" + t.nome + "</b> <span>nível " + n + "/" + t.max + "</span><br>";
  if (n > 0) h += "Agora: " + textoTalento(t, n) + "<br>";
  if (n < t.max) {
    h += "Próximo nível: " + textoTalento(t, n + 1) + " · custa " + t.custo + (t.custo === 1 ? " ponto" : " pontos");
    if (t.req && rankTalento(t.req) <= 0)
      h += '<br><em>Requer: ' + talentoPorId(t.req).nome + "</em>";
  } else {
    h += "<em>Nível máximo</em>";
  }
  el.arvoreInfo.innerHTML = h;
}

function renderArvore() {
  const livres = pontosLivres();
  txt(el.arvorePontos, String(livres));
  for (const t of talentos) {
    const n = rankTalento(t.id);
    const no = nosTalento[t.id];
    const liberado = !t.req || rankTalento(t.req) > 0;
    let st = "trava";
    if (n >= t.max) st = "max";
    else if (liberado) st = livres >= t.custo ? "ok" : "falta";
    no.b.dataset.estado = st;
    txt(no.nivel, n + "/" + t.max);
    no.b.setAttribute("aria-label", t.nome + ", nível " + n + " de " + t.max);
  }
  desenharLinhasArvore();
  mostrarInfoTalento(talentoEmFoco || talentos[0].id);
}

function desenharLinhasArvore() {
  const NS = "http://www.w3.org/2000/svg";
  el.arvoreRamos.querySelectorAll(".ramo-grade").forEach((g) => {
    const svg = g.querySelector("svg");
    svg.setAttribute("width", g.offsetWidth);
    svg.setAttribute("height", g.offsetHeight);
    svg.innerHTML = "";
    for (const t of talentos) {
      if (t.ramo !== g.dataset.ramo || !t.req) continue;
      const a = nosTalento[t.req].b;
      const b = nosTalento[t.id].b;
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", a.offsetLeft + a.offsetWidth / 2);
      l.setAttribute("y1", a.offsetTop + a.offsetHeight / 2);
      l.setAttribute("x2", b.offsetLeft + b.offsetWidth / 2);
      l.setAttribute("y2", b.offsetTop + b.offsetHeight / 2);
      l.setAttribute("class", rankTalento(t.req) > 0 ? "on" : "");
      svg.appendChild(l);
    }
  });
}

function comprarTalento(id) {
  const t = talentoPorId(id);
  const n = rankTalento(id);
  const liberado = !t.req || rankTalento(t.req) > 0;
  if (n >= t.max || !liberado || pontosLivres() < t.custo) {
    som("erro");
    return;
  }
  estado.talentos[id] = n + 1;
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

function abrirArvore() {
  el.arvore.hidden = false;
  document.body.classList.add("modal-aberto");
  renderArvore();
  el.arvoreFechar.focus();
}

function fecharArvore() {
  el.arvore.hidden = true;
  document.body.classList.remove("modal-aberto");
  el.btnArvore.focus();
}

el.btnArvore.addEventListener("click", abrirArvore);
el.arvoreFechar.addEventListener("click", fecharArvore);
el.arvoreRedefinir.addEventListener("click", redefinirTalentos);
el.arvore.addEventListener("click", (e) => {
  if (e.target === el.arvore) fecharArvore();
});
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
  if (e.key === "Escape" && !el.arvore.hidden) fecharArvore();
  else if (
    (e.key === "t" || e.key === "T") &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey &&
    !digitando(e) &&
    !pausado
  )
    el.arvore.hidden ? abrirArvore() : fecharArvore();
});
window.addEventListener("resize", () => {
  if (!el.arvore.hidden) desenharLinhasArvore();
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
        h.nome +
        "<kbd>" +
        h.tecla +
        "</kbd></span>" +
        '<span class="hab-dica">' +
        h.dica() +
        "</span>" +
        '<span class="hab-estado">Pronto</span><span class="hab-barra"></span></button>',
    )
    .join("");
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
  el.btnFarm.textContent = estado.farm
    ? "Modo: farmar esta zona"
    : "Modo: avançar de zona";
  el.btnFarm.setAttribute("aria-pressed", String(!estado.farm));
}

function renderVida() {
  if (!monstro) return;
  el.vidaFill.style.width =
    Math.max(0, (monstro.hp / monstro.hpMax) * 100) + "%";
  el.vidaTexto.textContent =
    fmt(Math.ceil(monstro.hp)) + " / " + fmt(monstro.hpMax);
}

function renderStats() {
  el.ouro.textContent = fmt(Math.floor(estado.ouro));
  el.danoClique.textContent = fmt(danoClique());
  el.dps.textContent = fmt(dps());
}

function renderTudo() {
  atualizarSelo();
  renderZona();
  renderVida();
  renderStats();
  atualizarHerois();
  atualizarGrupo();
  renderHabilidades();
}

el.btnFarm.addEventListener("click", () => {
  estado.farm = !estado.farm;
  renderZona();
});

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
  montarGrupo();
  spawn();
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
  e.salvoEm = Number.isFinite(obj.salvoEm) ? obj.salvoEm : 0;
  e.farm = obj.farm === true;
  e.som = obj.som !== false;
  if (["1", "10", "25", "max"].includes(obj.modo)) e.modo = obj.modo;
  if (obj.herois && typeof obj.herois === "object") {
    for (const h of herois) {
      const n = Math.floor(obj.herois[h.id]);
      if (Number.isFinite(n) && n > 0) e.herois[h.id] = n;
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
  return e;
}

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
        causarDano(forcaHeroi(h), "heroi");
        if (!monstro || monstro.morrendo) break;
      }
      if (!monstro || monstro.morrendo) break;
    }
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

  desenharFundo(indiceBioma(estado.zona));
  montarHerois();
  montarHabilidades();
  montarGrupo();
  montarArvore();
  renderModo();
  renderSom();
  spawn();
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