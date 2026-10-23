"use strict";

/* =========================================================
   CLICK SEEKER HERÓIS — versão estilo Clicker Heroes
   Os números do jogo ficam nas listas abaixo (biomas, herois,
   habilidades). Mudar valores aqui muda o jogo inteiro.
   Os sprites ficam em sprites.js.
   ========================================================= */

const CHAVE_SAVE = "click-seeker-herois-save";
const VERSAO_SAVE = 2; // some 1 quando o formato do save mudar (ver normalizar)

/* ---------- Balanceamento (mexa aqui para ajustar a dificuldade) ----------
   Ritmo de referência (jogador ativo, ~3 cliques/s, usando habilidades):
   zona 20 em ~5 min · zona 50 em ~1 h · zona 75 em ~4 h · zona 90 em ~1 dia.
   A "parede" fica depois da zona ~100, deixando espaço para sistemas
   futuros (ascensão, relíquias, mais heróis...). */
const MONSTROS_POR_ZONA = 10; // abates para passar de zona
const TEMPO_CHEFE = 30; // segundos para vencer um chefe
const VIDA_CHEFE = 10; // chefe tem 10x a vida de um monstro comum
const CRESC_VIDA = 1.5; // a vida dos monstros cresce 50% por zona
const OURO_DIV = 100; // ouro por abate = vida / OURO_DIV (mínimo 1)
const CHANCE_BAU = 0.04; // chance de um monstro ser um baú (ouro x10)
const CHANCE_CRITICO = 0.08; // chance de clique crítico (x5)
const CRESCIMENTO_CUSTO = 1.065; // cada nível de herói custa 6,5% a mais

/* ---------- Mundos (mudam a cada 10 zonas) ---------- */
const biomas = [
  {
    nome: "Floresta",
    monstros: ["slime", "goblin", "cogumelo"],
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
    monstros: ["morcego", "fantasma", "goblin"],
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
    monstros: ["golem", "cogumelo", "goblin"],
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
    monstros: ["fantasma", "golem", "slime"],
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
    monstros: ["morcego", "golem", "goblin"],
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
};

const chefes = [
  { sprite: "ogro", nome: "Ogro Rei" },
  { sprite: "dragao", nome: "Dragão Vermelho" },
];

/* ---------- Heróis ----------
   tipo "clique": soma dano em cada clique
   tipo "dps": ataca sozinho 1 vez por segundo
   base = custo do nível 1; forca = dano por nível */
const herois = [
  // cresc = crescimento de custo próprio (padrão: CRESCIMENTO_CUSTO).
  // O Pip sobe mais caro para o clique não atropelar o resto do jogo.
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
    base: 50,
    forca: 5,
    sprite: "tora",
  },
  {
    id: "mira",
    nome: "Mira, a Arqueira",
    tipo: "dps",
    base: 250,
    forca: 22,
    sprite: "mira",
  },
  {
    id: "gandor",
    nome: "Gandor, o Mago",
    tipo: "dps",
    base: 1000,
    forca: 74,
    sprite: "gandor",
  },
  {
    id: "luna",
    nome: "Luna, a Clériga",
    tipo: "dps",
    base: 4000,
    forca: 245,
    sprite: "luna",
  },
  {
    id: "sombra",
    nome: "Sombra, a Ladina",
    tipo: "dps",
    base: 20000,
    forca: 976,
    sprite: "sombra",
  },
  {
    id: "barba",
    nome: "Barba-Ruiva, o Anão",
    tipo: "dps",
    base: 100000,
    forca: 3725,
    sprite: "barba",
  },
  {
    id: "draco",
    nome: "Draco, o Cavaleiro",
    tipo: "dps",
    base: 400000,
    forca: 10859,
    sprite: "draco",
  },
  {
    id: "bruma",
    nome: "Bruma, a Druida",
    tipo: "dps",
    base: 2000000,
    forca: 43000,
    sprite: "bruma",
  },
  {
    id: "kuro",
    nome: "Kuro, o Samurai",
    tipo: "dps",
    base: 10000000,
    forca: 175000,
    sprite: "kuro",
  },
  {
    id: "zeph",
    nome: "Zeph, o Alquimista",
    tipo: "dps",
    base: 50000000,
    forca: 700000,
    sprite: "zeph",
  },
  {
    id: "brasa",
    nome: "Brasa, a Piromante",
    tipo: "dps",
    base: 250000000,
    forca: 2800000,
    sprite: "brasa",
  },
  {
    id: "vesper",
    nome: "Vesper, a Necromante",
    tipo: "dps",
    base: 1200000000,
    forca: 10700000,
    sprite: "vesper",
  },
  // Padre Thalles: o mais forte. Custa 5x a Vesper, mas dá ~16x mais dano por
  // nível (custo-benefício ~3x melhor que a linha dos outros heróis).
  {
    id: "padre",
    nome: "Padre Thalles, o Exorcista",
    tipo: "dps",
    base: 6000000000,
    forca: 170000000,
    sprite: "padre",
  },
  // Para adicionar um herói novo: sprite em sprites.js + uma entrada aqui.
  // O painel do Grupo e a loja aparecem sozinhos. Mantenha o custo-benefício
  // (base / forca) crescendo devagar de herói para herói (~25% por herói).
];

// Bônus de nível: dano x4 nos níveis 10 e 25, depois x2 a cada 25 níveis
// e x8 a cada 100 níveis (até o nível 1500, para dar margem a updates futuros)
const marcos = [
  { nivel: 10, f: 4 },
  { nivel: 25, f: 4 },
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
    dica: "Dano enorme no monstro",
  },
  {
    id: "furia",
    nome: "Fúria",
    tecla: "2",
    cd: 45,
    dur: 15,
    dica: "Cliques valem x4 por 15 s",
  },
  {
    id: "sorte",
    nome: "Sorte",
    tecla: "3",
    cd: 60,
    dur: 20,
    dica: "Ouro x2 por 20 s",
  },
];

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
    cdFim: {},
    ativoFim: {},
    cliques: 0,
    abatidos: 0,
    modo: "1",
    som: true,
  };
}

let estado = estadoInicial();
let monstro = null;
let fimChefe = 0;
let ultimoTick = Date.now();
let timers = [];
let timerAvanco = null;
const acumulador = {}; // tempo acumulado de cada herói até o próximo ataque

const nivel = (id) => estado.herois[id] || 0;
const heroiPorId = (id) => herois.find((h) => h.id === id);
const ativo = (id) => (estado.ativoFim[id] || 0) > Date.now();

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

function danoClique() {
  return (1 + forcaHeroi(heroiPorId("pip"))) * (ativo("furia") ? 4 : 1);
}

function dps() {
  return herois
    .filter((h) => h.tipo === "dps")
    .reduce((s, h) => s + forcaHeroi(h), 0);
}

const multOuro = () => (ativo("sorte") ? 2 : 1);
const custoNivel = (h, n) =>
  Math.ceil(h.base * Math.pow(h.cresc || CRESCIMENTO_CUSTO, n));

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

function desenharFundo(i) {
  const b = biomas[i];
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
    const def = chefes[(z / 5 - 1) % chefes.length];
    const hpMax = hp * VIDA_CHEFE;
    m = {
      sprite: def.sprite,
      nome: def.nome,
      hpMax,
      ouro: ouroPorHp(hpMax),
      boss: true,
    };
    fimChefe = Date.now() + TEMPO_CHEFE * 1000;
  } else if (Math.random() < CHANCE_BAU) {
    m = {
      sprite: "bau",
      nome: nomesMonstro.bau,
      hpMax: hp,
      ouro: ouroPorHp(hp) * 10,
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
  const ganho = monstro.ouro * multOuro();
  estado.ouro += ganho;
  estado.abatidos++;
  flutuar("+" + fmt(Math.round(ganho)), "ouro");
  moedas(monstro.boss ? 14 : monstro.bau ? 12 : 5);
  el.ouroBox.classList.remove("pulo");
  void el.ouroBox.offsetWidth;
  el.ouroBox.classList.add("pulo");
  el.monstro.classList.add("morre");

  if (monstro.boss) {
    som("chefe");
    el.cena.classList.remove("treme");
    void el.cena.offsetWidth;
    el.cena.classList.add("treme");
  } else {
    som("matar");
  }
  timerAvanco = setTimeout(avancar, 400);
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
  if (!monstro || monstro.morrendo) return;
  let d = danoClique();
  const critico = Math.random() < CHANCE_CRITICO;
  if (critico) d *= 5;
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
        '<li><button type="button" class="heroi-item" data-id="' +
        h.id +
        '">' +
        '<span class="heroi-foto"><canvas data-sprite="' +
        h.sprite +
        '"></canvas></span>' +
        '<span class="heroi-info">' +
        '<span class="heroi-nome">' +
        h.nome +
        '<em class="heroi-nivel"></em></span>' +
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
      nivel: btn.querySelector(".heroi-nivel"),
      desc: btn.querySelector(".heroi-desc"),
      prox: btn.querySelector(".heroi-prox"),
      acao: btn.querySelector(".heroi-acao"),
      custo: btn.querySelector(".heroi-custo"),
    };
  });
}

function atualizarHerois() {
  for (const l of linhas) {
    const { h } = l;
    const n = nivel(h.id);
    const { k, total } = calcLote(h);
    const marco = marcos.find((m) => m.nivel > n);

    l.btn.classList.toggle("novo", n === 0);
    l.nivel.textContent = n > 0 ? "Nv " + n : "";
    if (h.tipo === "clique") {
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
    l.prox.textContent = marco
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
        '<div class="slot bloqueado" data-id="' +
        h.id +
        '" title="' +
        h.nome +
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
    sl.s.classList.toggle("bloqueado", !aberto);
    sl.s.classList.toggle("pronto", !aberto && estado.ouro >= custoNivel(h, 0));
    if (aberto) {
      txt(sl.nivel, "Nv " + n);
      txt(
        sl.info,
        h.tipo === "clique"
          ? "+" + fmt(forcaHeroi(h)) + "/clique"
          : fmt(forcaHeroi(h)) + "/s",
      );
    } else {
      txt(sl.nivel, "Bloqueado");
      txt(sl.info, "Custa " + fmt(custoNivel(h, 0)));
    }
    // barrinha do ciclo de ataque (só heróis que atacam sozinhos)
    const p = aberto && h.tipo === "dps" ? Math.min(1, acumulador[h.id] || 0) : 0;
    sl.barra.style.transform = "scaleX(" + p.toFixed(2) + ")";
  }
  txt(el.grupoConta, contratados + " / " + herois.length);
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
        h.dica +
        "</span>" +
        '<span class="hab-estado">Pronto</span><span class="hab-barra"></span></button>',
    )
    .join("");
}

function usarHabilidade(id) {
  const h = habilidades.find((x) => x.id === id);
  const agora = Date.now();
  if (!h || (estado.cdFim[id] || 0) > agora) return;
  estado.cdFim[id] = agora + h.cd * 1000;
  if (h.dur) estado.ativoFim[id] = agora + h.dur * 1000;

  if (id === "raio") {
    som("raio");
    const r = document.createElement("div");
    r.className = "relampago";
    el.cena.appendChild(r);
    setTimeout(() => r.remove(), 450);
    causarDano(danoClique() * 30 + dps() * 5, "raio");
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

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const h = habilidades.find((x) => x.tecla === e.key);
  if (h) usarHabilidade(h.id);
});

function renderHabilidades() {
  const agora = Date.now();
  el.habilidades.querySelectorAll(".hab").forEach((b) => {
    const h = habilidades.find((x) => x.id === b.dataset.id);
    const cdRest = (estado.cdFim[h.id] || 0) - agora;
    const atvRest = (estado.ativoFim[h.id] || 0) - agora;
    let st, texto, p;
    if (atvRest > 0) {
      st = "ativo";
      texto = "Ativo: " + Math.ceil(atvRest / 1000) + " s";
      p = (atvRest / (h.dur * 1000)) * 100;
    } else if (cdRest > 0) {
      st = "recarga";
      texto = "Recarga: " + Math.ceil(cdRest / 1000) + " s";
      p = (1 - cdRest / (h.cd * 1000)) * 100;
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
  try {
    localStorage.setItem(CHAVE_SAVE, JSON.stringify(estado));
    if (avisar) toast("Jogo salvo.");
  } catch (e) {
    if (avisar) toast("Não foi possível salvar neste navegador.");
  }
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
  // Futuras migrações: if (obj.versao < 3) { ...ajusta obj... }
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
    if (obj.cdFim && Number.isFinite(obj.cdFim[h.id]))
      e.cdFim[h.id] = obj.cdFim[h.id];
    if (obj.ativoFim && Number.isFinite(obj.ativoFim[h.id]))
      e.ativoFim[h.id] = obj.ativoFim[h.id];
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
  estado = estadoInicial();
  estado.som = somLigado;
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
  const agora = Date.now();
  const dt = Math.min(1, Math.max(0, (agora - ultimoTick) / 1000));
  ultimoTick = agora;

  if (monstro && !monstro.morrendo) {
    for (const h of herois) {
      if (h.tipo !== "dps" || nivel(h.id) <= 0) continue;
      acumulador[h.id] =
        (acumulador[h.id] === undefined ? Math.random() : acumulador[h.id]) +
        dt;
      if (acumulador[h.id] >= 1) {
        acumulador[h.id] -= 1;
        animarMembro(h.id);
        causarDano(forcaHeroi(h), "heroi");
        if (!monstro || monstro.morrendo) break;
      }
    }
    if (monstro && monstro.boss && !monstro.morrendo) {
      const resta = (fimChefe - agora) / 1000;
      if (resta <= 0) {
        falharChefe();
      } else {
        el.tempoFill.style.width = (resta / TEMPO_CHEFE) * 100 + "%";
        el.tempoTexto.textContent = resta.toFixed(1).replace(".", ",") + " s";
        el.tempo.classList.toggle("urgente", resta < 10);
      }
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
  ultimoTick = Date.now();

  desenharFundo(indiceBioma(estado.zona));
  montarHerois();
  montarHabilidades();
  montarGrupo();
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