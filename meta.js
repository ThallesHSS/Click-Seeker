"use strict";

/* =========================================================
   TELA INICIAL, TUTORIAL, CONTAS/NUVEM E PAINEL DEV
   Usa as variáveis e funções globais do script.js (estado, toast, fmt...)
   e o objeto window.Nuvem do nuvem.js.
   ========================================================= */
try {
(function () {
  window.metaPronta = true; // avisa o script.js que a tela inicial carregou
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  // se o nuvem.js não carregou, o jogo segue só local
  const NV = window.Nuvem || {
    configurado: false,
    ativo: false,
    perfil: null,
    aoMudarAuth() {},
    async iniciar() {},
  };
  const params = new URLSearchParams(location.search);
  const META_KEY = "click-seeker-meta";

  const telaInicio = $("#inicio");
  const telaTutorial = $("#tutorial");
  const telaConta = $("#conta");
  const telaDialogo = $("#dialogo");

  /* ---------- Pausa: tela inicial, tutorial e perguntas congelam o jogo ---------- */
  function atualizarPausa() {
    const deve = [telaInicio, telaTutorial, telaDialogo].some((t) => t && !t.hidden);
    if (deve !== pausado) pausar(deve);
  }

  /* ---------- Perguntas (uma por vez) ---------- */
  let filaDialogo = Promise.resolve();
  function perguntar({ titulo, html, botoes }) {
    const rodar = () =>
      new Promise((resolve) => {
        $("#dialogo-titulo").textContent = titulo;
        $("#dialogo-corpo").innerHTML = html || "";
        const area = $("#dialogo-botoes");
        area.innerHTML = "";
        botoes.forEach((b) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = b.primario ? "btn-grande" : "btn-mini";
          btn.textContent = b.rotulo;
          btn.addEventListener("click", () => {
            telaDialogo.hidden = true;
            atualizarPausa();
            resolve(b.id);
          });
          area.appendChild(btn);
        });
        telaDialogo.hidden = false;
        atualizarPausa();
        area.querySelector("button")?.focus();
      });
    filaDialogo = filaDialogo.then(rodar, rodar);
    return filaDialogo;
  }

  /* ---------- Resumo do progresso ---------- */
  const contarHerois = (e) => Object.keys(e.herois || {}).length;
  const temProgresso = (e) =>
    e.zonaMax > 1 || contarHerois(e) > 0 || e.cliques > 0 || e.ouro > 0;
  const resumo = (e) => ({
    zonaMax: e.zonaMax,
    herois: contarHerois(e),
    pontos: e.pontosGanhos,
  });
  const textoResumo = (r) =>
    "Zona " +
    r.zonaMax +
    " · " +
    r.herois +
    (r.herois === 1 ? " herói" : " heróis") +
    " · " +
    r.pontos +
    (r.pontos === 1 ? " ponto" : " pontos") +
    " de talento";
  const quando = (ms) => {
    if (!ms) return "data desconhecida";
    const d = new Date(ms);
    return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  /* =========================================================
     Tela inicial
     ========================================================= */
  function desenharSpritesInicio() {
    $$("#inicio canvas[data-sprite]").forEach((c) => desenharSprite(c, c.dataset.sprite));
  }

  function renderInicio() {
    const e = estado;
    const prog = temProgresso(e);
    $("#inicio-jogar").textContent = prog ? "Continuar" : "Jogar";
    $("#inicio-info").textContent = prog ? textoResumo(resumo(e)) : "Comece sua jornada!";
    const p = NV.perfil;
    let status;
    if (p) status = "Conectado como " + p.nome + (p.papel === "dev" ? " (dev)" : "") + " · progresso na nuvem";
    else if (NV.ativo) status = "Jogando sem conta · o progresso fica só neste aparelho";
    else if (NV.configurado) status = "Sem conexão com a nuvem · o progresso fica só neste aparelho";
    else status = "Modo local · o progresso fica só neste aparelho";
    $("#inicio-status").textContent = status;
  }

  $("#inicio-jogar").addEventListener("click", () => {
    telaInicio.hidden = true;
    atualizarPausa();
    if (!estado.tutorialVisto) abrirTutorial();
  });
  $("#inicio-tutorial").addEventListener("click", () => abrirTutorial());
  $("#inicio-conta").addEventListener("click", () => abrirConta());

  /* =========================================================
     Tutorial completo
     Explica o gênero clicker para quem nunca jogou e depois cada parte
     do jogo, com réplicas dos botões, barras e ícones reais.
     Os números vêm das constantes do jogo, então não ficam desatualizados.
     ========================================================= */
  const pct = (x) => (Math.round(x * 10) / 10).toString().replace(".", ",");
  const cvSprite = (nome) => '<canvas class="fig-cv sprite" data-sprite="' + nome + '"></canvas>';
  const cvIcone = (nome) => '<canvas class="fig-cv icone" data-icone="' + nome + '"></canvas>';
  const fig = (html, classe) =>
    '<div class="tut-fig ' + (classe || "") + '" aria-hidden="true">' + html + "</div>";
  const btnFalso = (rotulo, classe, extra) =>
    '<button type="button" tabindex="-1" class="btn-mini ' + (classe || "") + '">' + rotulo + (extra || "") + "</button>";
  const ouroBox = (valor) =>
    '<div class="ouro-box"><span class="moeda-icone"></span><span>' + valor + "</span></div>";

  function linhaHeroi(o) {
    return (
      '<li><button type="button" tabindex="-1" class="heroi-item' + (o.silhueta ? " silhueta" : "") + (o.nivel ? "" : " novo") +
      '" aria-disabled="' + !!o.apagado + '">' +
      '<span class="heroi-foto"><canvas data-sprite="' + o.sprite + '"></canvas></span>' +
      '<span class="heroi-info"><span class="heroi-nome"><span class="heroi-titulo">' + o.nome + '</span><em class="heroi-nivel">' + (o.nivel ? "Nv " + o.nivel : "") + "</em></span>" +
      '<span class="heroi-desc">' + o.desc + '</span><span class="heroi-prox">' + (o.prox || "") + "</span></span>" +
      '<span class="heroi-compra"><span class="heroi-acao">' + o.acao + '</span><span class="heroi-custo">' + o.custo + "</span></span></button></li>"
    );
  }
  const custoBruto = (h, n) => Math.ceil(h.base * Math.pow(h.cresc || CRESCIMENTO_CUSTO, n));
  const danoNivel = (h, n) => n * h.forca * multNivel(n);

  function figSlot(o) {
    return (
      '<div class="slot' + (o.silhueta ? " bloqueado silhueta" : "") + '"><span class="slot-palco"><canvas class="membro" data-sprite="' + o.sprite + '"></canvas></span>' +
      '<span class="slot-nome">' + o.nome + '</span><span class="slot-nivel">' + o.nivel + '</span><span class="slot-info">' + o.info + '</span>' +
      '<span class="slot-barra"><span style="transform:scaleX(' + (o.barra || 0) + ')"></span></span></div>'
    );
  }
  function figHab(h, estadoHab, texto, p) {
    return (
      '<button type="button" tabindex="-1" class="hab" data-estado="' + estadoHab + '" style="--p:' + p + '%"><span class="hab-nome">' + h.nome +
      "<kbd>" + h.tecla + '</kbd></span><span class="hab-dica">' + h.dica() + '</span><span class="hab-estado">' + texto + '</span><span class="hab-barra"></span></button>'
    );
  }
  function figTalento(t, n, st) {
    return (
      '<div class="tut-talento"><button type="button" tabindex="-1" class="talento" data-estado="' + st + '"><canvas class="talento-icone" data-icone="' + t.icone +
      '"></canvas><span class="talento-nivel">' + n + "/" + t.max + "</span></button><small>" + t.nome + "</small></div>"
    );
  }
  const guia = (esq, texto) => '<div class="guia-item"><div class="guia-esq">' + esq + "</div><div>" + texto + "</div></div>";
  const marcosTxt = () => marcos.slice(0, 3).map((x) => x.nivel).join(", ");

  const SLIDES = [
    {
      id: "clicker",
      titulo: "O que é um jogo clicker?",
      arte: [["sprite", "slime"], ["sprite", "pip"], ["sprite", "dragao"]],
      corpo: () =>
        "<p>Um jogo <b>clicker</b> (também chamado de <i>idle</i> ou <i>incremental</i>) é muito fácil de começar: você faz uma ação simples, <b>clicar</b>, e ganha uma recompensa.</p>" +
        "<p>Com a recompensa você compra melhorias. As melhorias passam a <b>trabalhar por você</b>, e o jogo vai ficando cada vez mais automático. Os números só crescem: começam nas unidades e chegam a milhares, milhões e muito mais.</p>" +
        fig(
          '<div class="ciclo">' +
            ["fist|Clique|ataque o monstro", "coin|Ouro|a recompensa", "sword|Melhorias|heróis e níveis", "star|Mais poder|e tudo de novo"]
              .map((x) => { const [ic, t, s] = x.split("|"); return '<div class="ciclo-passo">' + cvIcone(ic) + "<b>" + t + "</b><small>" + s + "</small></div>"; })
              .join('<i class="seta">→</i>') +
            "</div>",
        ) +
        "<p>Não existe um “fim” como em um jogo de história: a graça é <b>ver o progresso crescer</b> e decidir bem onde gastar seus recursos. E você não precisa clicar o tempo todo!</p>" +
        '<p class="tut-salto"><button type="button" class="btn-mini" data-salto="alvo">Já conheço clickers: ir direto ao jogo</button></p>',
    },
    {
      id: "ciclo",
      titulo: "Como o jogo funciona",
      arte: [["icone", "fist"], ["icone", "coin"], ["icone", "sword"], ["icone", "skull"], ["icone", "star"]],
      corpo: () =>
        '<ol class="tut-passos">' +
        "<li>" + cvIcone("fist") + "<div><b>Você clica no monstro.</b> Cada clique causa dano e tira vida dele.</div></li>" +
        "<li>" + cvIcone("coin") + "<div><b>O monstro cai e solta ouro.</b> A cada " + MONSTROS_POR_ZONA + " monstros derrotados você avança de zona.</div></li>" +
        "<li>" + cvIcone("sword") + "<div><b>Você gasta o ouro em heróis.</b> Eles atacam sozinhos e ficam mais fortes a cada nível.</div></li>" +
        "<li>" + cvIcone("skull") + "<div><b>Os monstros ficam mais fortes</b> a cada zona e, de 5 em 5 zonas, aparece um <b>chefe</b>.</div></li>" +
        "<li>" + cvIcone("star") + "<div><b>Chefes dão pontos de talento</b>, que deixam você mais forte para sempre. Aí o ciclo recomeça, maior que antes.</div></li>" +
        "</ol>" +
        '<p class="tut-dica"><b>Dica para quem está começando:</b> no início, clique bastante. Mais tarde seus heróis fazem quase todo o trabalho, e você só decide onde investir e quando usar as habilidades.</p>',
    },
    {
      id: "alvo",
      titulo: "Atacando o monstro",
      arte: [["sprite", "slime"], ["sprite", "cogumelo"], ["sprite", "goblin"]],
      corpo: () =>
        "<p><b>Clique (ou toque) no monstro</b> para atacar. Cada clique tira vida dele, e a <b>barra vermelha</b> mostra quanta vida ainda resta.</p>" +
        fig(
          '<div class="tut-linha">' + ouroBox("1.250") + '<span class="chip">Zona 1 · Floresta</span></div>' +
            '<div class="alvo"><div class="alvo-linha"><span class="alvo-nome">Gosma</span><span class="alvo-recorde">Recorde: zona 1</span></div>' +
            '<div class="vida"><div class="vida-fill" style="width:60%"></div><span class="vida-texto">6 / 10</span></div></div>' +
            '<p class="taxas"><span>Dano por clique: <b>1</b></span><span>Dano por segundo: <b>0</b></span></p>',
        ) +
        '<ul class="tut-lista">' +
        "<li><b>Zona e bioma</b> (a etiqueta “Zona 1 · Floresta”): onde você está. Cada zona tem " + MONSTROS_POR_ZONA + " monstros; ao derrotar todos você sobe para a próxima, que é mais difícil e dá mais ouro.</li>" +
        "<li><b>Recorde</b>: a zona mais distante que você já alcançou.</li>" +
        "<li><b>Dano por clique</b>: quanto cada clique tira de vida. <b>Dano por segundo</b>: quanto seus heróis causam sozinhos.</li>" +
        "<li><b>Ouro</b> (a moeda no topo): cai de cada monstro derrotado e é o que você usa para contratar e melhorar heróis.</li>" +
        "</ul>",
    },
    {
      id: "herois",
      titulo: "Heróis: seu time",
      arte: [["sprite", "pip"], ["sprite", "tora"], ["sprite", "mira"]],
      corpo: () => {
        const pip = heroiPorId("pip"), tora = heroiPorId("tora"), mira = heroiPorId("mira");
        const m0 = marcos[0];
        return (
          "<p>Heróis são o coração do jogo. O primeiro, <b>Pip</b>, aumenta o dano dos seus <b>cliques</b>. Os outros <b>atacam sozinhos</b>, mesmo quando você não está clicando.</p>" +
          fig(
            '<ul class="fig-herois">' +
              linhaHeroi({ sprite: "pip", nome: pip.nome, nivel: 5, desc: "Dano por clique: +" + fmt(danoNivel(pip, 5)), prox: "Próximo bônus: x" + m0.f + " no nível " + m0.nivel, acao: "Subir nível", custo: fmt(custoBruto(pip, 5)) }) +
              linhaHeroi({ sprite: "tora", nome: tora.nome, nivel: 0, desc: "Dá " + fmt(tora.forca) + " de dano por segundo por nível", acao: "Contratar", custo: fmt(tora.base) }) +
              linhaHeroi({ sprite: "mira", nome: "???", nivel: 0, desc: "Um herói misterioso quer se juntar a você...", acao: "Contratar", custo: fmt(mira.base), silhueta: true, apagado: true }) +
              "</ul>",
          ) +
          '<ul class="tut-lista">' +
          "<li><b>Nome e nível</b> (ex.: <i>Nv 5</i>): quanto maior o nível, mais dano.</li>" +
          "<li><b>Descrição</b>: o dano que o herói dá hoje (ou quanto dará por nível, se ainda não foi contratado).</li>" +
          "<li><b>Próximo bônus</b>: em alguns níveis (" + marcosTxt() + "...) o dano do herói é <b>multiplicado</b> (por exemplo, x" + m0.f + " no nível " + m0.nivel + "). Vale a pena chegar lá!</li>" +
          "<li><b>Botão à direita</b>: mostra a ação e o <b>custo</b>. Quando ele fica apagado, ainda falta ouro.</li>" +
          "<li><b>Silhueta “???”</b>: o próximo herói ainda é um mistério. Ele aparece inteiro assim que você o contrata.</li>" +
          "</ul>"
        );
      },
    },
    {
      id: "lote",
      titulo: "Comprar vários níveis",
      arte: [["icone", "bag"], ["icone", "coin"]],
      corpo: () =>
        "<p>Os botões <b>x1</b>, <b>x10</b>, <b>x25</b> e <b>Máx</b>, no topo da lista de heróis, definem <b>quantos níveis</b> você compra de uma vez.</p>" +
        fig('<div class="modos"><button type="button" tabindex="-1" class="btn-qtd" aria-pressed="true">x1</button><button type="button" tabindex="-1" class="btn-qtd" aria-pressed="false">x10</button><button type="button" tabindex="-1" class="btn-qtd" aria-pressed="false">x25</button><button type="button" tabindex="-1" class="btn-qtd" aria-pressed="false">Máx</button></div>') +
        '<ul class="tut-lista">' +
        "<li><b>x1</b>: sobe um nível por clique.</li>" +
        "<li><b>x10</b> e <b>x25</b>: sobem vários níveis de uma vez. O botão do herói passa a mostrar, por exemplo, “Subir +10 níveis” e o preço total.</li>" +
        "<li><b>Máx</b>: compra tantos níveis quanto o seu ouro permitir.</li>" +
        "</ul>" +
        "<p>Cada nível custa um pouco mais que o anterior (cerca de <b>" + pct((CRESCIMENTO_CUSTO - 1) * 100) + "% a mais</b>), então concentrar tudo em um herói só fica caro. Espalhar entre vários costuma render mais.</p>",
    },
    {
      id: "grupo",
      titulo: "O painel Grupo",
      arte: [["sprite", "tora"], ["sprite", "mira"], ["sprite", "gandor"]],
      corpo: () => {
        const tora = heroiPorId("tora"), mira = heroiPorId("mira");
        return (
          "<p>No painel <b>Grupo</b> você vê seu time em ação. Cada herói contratado ganha um espaço só dele.</p>" +
          fig(
            '<div class="grupo-grade tut-slots">' +
              figSlot({ sprite: "tora", nome: "Tora", nivel: "Nv 12", info: fmt(danoNivel(tora, 12)) + "/s", barra: 0.65 }) +
              figSlot({ sprite: "mira", nome: "Mira", nivel: "Nv 4", info: fmt(danoNivel(mira, 4)) + "/s", barra: 0.25 }) +
              figSlot({ sprite: "gandor", nome: "???", nivel: "Misterioso", info: "Custa " + fmt(heroiPorId("gandor").base), silhueta: true }) +
              "</div>",
          ) +
          '<ul class="tut-lista">' +
          "<li>O herói <b>dá um golpe</b> (um pulinho) a cada ataque.</li>" +
          "<li><b>Nv 12</b> é o nível dele; <b>" + fmt(danoNivel(tora, 12)) + "/s</b> é o dano por segundo que ele causa. (O Pip mostra o dano por clique.)</li>" +
          "<li>A <b>barrinha dourada</b> enche até o próximo ataque.</li>" +
          "<li>O espaço escuro com <b>“???”</b> é o próximo herói misterioso.</li>" +
          "<li>No rodapé do painel fica o <b>dano total por segundo</b> do grupo inteiro.</li>" +
          "</ul>"
        );
      },
    },
    {
      id: "zonas",
      titulo: "Zonas, biomas e chefes",
      arte: [["sprite", "ogro"], ["sprite", "yeti"], ["sprite", "dragao"]],
      corpo: () =>
        "<p>A cada <b>" + MONSTROS_POR_ZONA + " monstros</b> derrotados você avança de zona. A cada <b>10 zonas</b> o cenário muda (o <i>bioma</i>): " +
        biomas.map((b) => "<b>" + b.nome + "</b>").join(" → ") + ", e depois tudo recomeça.</p>" +
        "<p>De <b>5 em 5 zonas</b> aparece um <b>chefe</b>, com " + VIDA_CHEFE + "x a vida de um monstro comum. Você tem <b>" + TEMPO_CHEFE + " segundos</b> para derrotá-lo:</p>" +
        fig(
          '<div class="tut-chefe">' + cvSprite("ogro") + '<div class="tempo"><div class="tempo-fill" style="width:62%"></div><span class="tempo-texto">' + pct(TEMPO_CHEFE * 0.62) + " s</span></div></div>",
        ) +
        '<ul class="tut-lista">' +
        "<li>A <b>barra amarela</b> é o tempo que resta. Se ele acabar, você <b>volta uma zona</b> e fica farmando para ficar mais forte.</li>" +
        "<li>Cada chefe derrotado pela <b>primeira vez</b> dá <b>pontos de talento</b>.</li>" +
        "</ul>" +
        "<p>O botão <b>Modo</b> (embaixo das habilidades) diz o que acontece depois que você derrota os monstros de uma zona:</p>" +
        fig('<div class="tut-modos"><button type="button" tabindex="-1" class="btn-modo-zona" aria-pressed="true">Modo: avançar de zona</button><button type="button" tabindex="-1" class="btn-modo-zona" aria-pressed="false">Modo: farmar esta zona</button></div>') +
        '<ul class="tut-lista">' +
        "<li><b>Avançar de zona</b>: sobe sozinho para a próxima (o padrão).</li>" +
        "<li><b>Farmar esta zona</b>: repete a zona atual para juntar ouro e ficar mais forte. Ótimo quando um chefe está difícil demais.</li>" +
        "</ul>",
    },
    {
      id: "habilidades",
      titulo: "Habilidades ativas",
      arte: [["icone", "bolt"], ["icone", "flame"], ["icone", "clover"]],
      corpo: () => {
        const [raio, furia, sorte] = habilidades;
        return (
          "<p>Embaixo do combate ficam as <b>habilidades</b>. Elas <b>não custam ouro</b>: depois de usadas, recarregam sozinhas.</p>" +
          fig('<div class="habilidades">' + figHab(raio, "pronto", "Pronto", 100) + figHab(furia, "ativo", "Ativo: 9 s", 60) + figHab(sorte, "recarga", "Recarga: 31 s", 48) + "</div>") +
          '<ul class="tut-lista icones">' +
          "<li>" + cvIcone("bolt") + "<div><b>Raio</b> (tecla <kbd>1</kbd>): dano enorme e instantâneo. Recarga de " + raio.cd + " s. Ótimo contra chefes!</div></li>" +
          "<li>" + cvIcone("flame") + "<div><b>Fúria</b> (tecla <kbd>2</kbd>): seus cliques valem <b>x" + multFuria() + "</b> por " + furia.dur + " s. Recarga de " + furia.cd + " s.</div></li>" +
          "<li>" + cvIcone("clover") + "<div><b>Sorte</b> (tecla <kbd>3</kbd>): todo ouro vale <b>x" + multSorte() + "</b> por " + sorte.dur + " s. Recarga de " + sorte.cd + " s.</div></li>" +
          "</ul>" +
          "<p>Cada botão tem três estados: <b>Pronto</b> (pode usar), <b>Ativo</b> (o efeito está rodando) e <b>Recarga</b> (espere a barra encher).</p>" +
          '<p class="tut-dica"><b>Dica:</b> use a Sorte antes de derrotar vários monstros e a Fúria junto com cliques rápidos. Os talentos melhoram as três habilidades.</p>'
        );
      },
    },
    {
      id: "surpresas",
      titulo: "Críticos e baús",
      arte: [["sprite", "bau"], ["icone", "star"], ["icone", "chestgold"]],
      corpo: () =>
        "<p>Os números que sobem pela tela contam o que está acontecendo:</p>" +
        fig('<div class="tut-danos"><span class="dano">12</span><span class="dano heroi">8</span><span class="dano crit">60!</span><span class="dano raio">900</span><span class="dano ouro">+25</span></div>') +
        '<ul class="tut-lista">' +
        "<li><b>Branco</b>: clique normal. <b>Azulado</b>: golpe de um herói.</li>" +
        "<li><b>Vermelho grande</b>: <b>crítico</b>! Acontece em cerca de <b>" + pct(CHANCE_CRITICO * 100) + "%</b> dos cliques e causa <b>x" + multCritico() + "</b> de dano.</li>" +
        "<li><b>Amarelo grande</b>: o dano do Raio.</li>" +
        "<li><b>Dourado</b>: ouro que você acabou de ganhar.</li>" +
        "</ul>" +
        fig('<div class="tut-chefe">' + cvSprite("bau") + "</div>") +
        "<p>Às vezes, no lugar de um monstro, surge um <b>Baú do Tesouro</b> (cerca de " + pct(CHANCE_BAU * 100) + "% das vezes). Ele dá <b>muito mais ouro</b> (x" + (10 + B.bauMult) + "). Não deixe passar!</p>",
    },
    {
      id: "talentos",
      titulo: "Talentos: evolução permanente",
      arte: [["icone", "fist"], ["icone", "sword"], ["icone", "bag"], ["icone", "hourglass"]],
      corpo: () =>
        "<p>Os <b>talentos</b> são melhorias permanentes que você compra com <b>pontos de talento</b> (e não com ouro).</p>" +
        '<ul class="tut-lista">' +
        "<li>Você começa com <b>1 ponto</b> e ganha <b>1 ponto</b> por cada chefe novo derrotado. Os chefes das zonas 25, 50, 75... dão <b>" + pontosDoChefe(25) + "</b>.</li>" +
        "<li>Abra a árvore pelo botão <b>Talentos</b> (o número no canto é o de pontos livres) ou pela tecla <kbd>T</kbd>.</li>" +
        "<li>Clique em um talento para comprar um nível dele. Os apagados precisam que o anterior (ligado por uma linha) seja comprado primeiro.</li>" +
        "<li>Errou? O botão <b>Redefinir</b> devolve todos os pontos, de graça.</li>" +
        "</ul>" +
        fig(
          '<div class="tut-talentos">' + figTalento(talentoPorId("punho1"), 2, "ok") + figTalento(talentoPorId("punho2"), 0, "trava") + figTalento(talentoPorId("fort1"), talentoPorId("fort1").max, "max") + "</div>",
        ) +
        '<ul class="tut-lista">' +
        "<li><b>Borda colorida</b>: dá para comprar agora. <b>Apagado</b>: bloqueado. <b>Dourado</b>: nível máximo. O número no cantinho é o nível atual.</li>" +
        "</ul>" +
        "<p>São quatro ramos:</p>" +
        fig('<div class="tut-ramos">' + RAMOS.map((r) => '<div class="tut-ramo" style="--cor:' + r.cor + '"><b>' + r.nome + "</b><small>" + r.dica + "</small></div>").join("") + "</div>"),
    },
    {
      id: "guia",
      titulo: "Guia de botões e ícones",
      arte: [["icone", "gem"], ["icone", "crown"], ["icone", "banner"]],
      corpo: () =>
        "<p><b>Os botões do topo da tela:</b></p>" +
        fig(
          guia(ouroBox("1.250"), "<b>Ouro</b>: quanto você tem para gastar. Pisca quando você ganha.") +
            guia(btnFalso("Talentos", "btn-arvore", '<span class="selo">2</span>'), "<b>Talentos</b>: abre a árvore. O número é de pontos livres.") +
            guia(btnFalso("Ajuda"), "<b>Ajuda</b>: abre este tutorial (ou use a tecla <kbd>H</kbd>).") +
            guia(btnFalso("Entrar"), "<b>Entrar</b> (depois mostra o seu nome): criar conta ou entrar para guardar o progresso na nuvem.") +
            guia(btnFalso("Som: ligado"), "<b>Som</b>: liga e desliga os sons.") +
            guia(btnFalso("Salvar"), "<b>Salvar</b>: salva agora (o jogo também salva sozinho).") +
            guia(btnFalso("Zerar"), "<b>Zerar</b>: apaga o progresso deste aparelho e recomeça do zero. Pede uma segunda confirmação, então cuidado!"),
          "tut-guia",
        ) +
        "<p><b>Ícones da árvore de talentos:</b> cada talento tem um desenho para você reconhecer rápido.</p>" +
        fig('<div class="tut-icones">' + talentos.map((t) => '<div class="tut-icone-item">' + cvIcone(t.icone) + "<span>" + t.nome + "</span></div>").join("") + "</div>"),
    },
    {
      id: "salvar",
      titulo: "Salvar e jogar em outros aparelhos",
      arte: [["icone", "chest"], ["icone", "chestgold"]],
      corpo: () =>
        "<p>O jogo <b>salva sozinho</b> neste navegador a cada poucos segundos (o botão <b>Salvar</b> força um salvamento na hora).</p>" +
        "<p>Para jogar em <b>outros aparelhos</b>, ou não perder o progresso se limpar o navegador, crie uma <b>conta</b> pelo botão <b>Entrar</b> no topo:</p>" +
        '<ul class="tut-lista">' +
        "<li>O progresso vai para a <b>nuvem</b> automaticamente enquanto você joga.</li>" +
        "<li>Em outro aparelho, é só entrar com o mesmo e-mail e senha para continuar de onde parou.</li>" +
        "<li>Se dois aparelhos tiverem progressos diferentes, o jogo <b>pergunta qual manter</b>. Nada é apagado sem você escolher.</li>" +
        "<li>Sem internet o jogo funciona normalmente e sincroniza depois.</li>" +
        "</ul>" +
        '<p class="tut-dica"><b>Cuidado:</b> o botão <b>Zerar</b> apaga o progresso deste aparelho.</p>',
    },
    {
      id: "dicas",
      titulo: "Dicas de estratégia e atalhos",
      arte: [["icone", "star"], ["icone", "clock"]],
      corpo: () =>
        '<ol class="tut-lista">' +
        "<li>No começo, gaste o ouro no <b>Pip</b> e contrate o primeiro herói assim que puder.</li>" +
        "<li>Prefira subir <b>vários heróis um pouco</b> a um só demais: os bônus de nível (" + marcosTxt() + "...) multiplicam o dano.</li>" +
        "<li>Antes de um chefe, junte ouro, suba heróis e deixe <b>Raio, Fúria e Sorte</b> prontos.</li>" +
        "<li>Se o tempo do chefe acabar, tudo bem: <b>farme</b> um pouco e tente de novo.</li>" +
        "<li>Gaste seus <b>pontos de talento</b>: eles ajudam em tudo. Mudou de ideia? Redefina de graça.</li>" +
        "<li>Fique de olho na <b>silhueta</b>: um herói novo costuma dar um grande salto de dano.</li>" +
        "</ol>" +
        "<p><b>Atalhos do teclado:</b></p>" +
        '<table class="tut-atalhos"><tbody>' +
        "<tr><td><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd></td><td>Raio, Fúria e Sorte</td></tr>" +
        "<tr><td><kbd>T</kbd></td><td>Abrir e fechar os Talentos</td></tr>" +
        "<tr><td><kbd>H</kbd></td><td>Abrir este tutorial</td></tr>" +
        "<tr><td><kbd>Esc</kbd></td><td>Fechar janelas</td></tr>" +
        "</tbody></table>",
    },
    {
      id: "glossario",
      titulo: "Glossário rápido",
      arte: [["sprite", "padre"]],
      corpo: () =>
        '<dl class="tut-glossario">' +
        "<dt>Ouro</dt><dd>A moeda do jogo. Cai dos monstros e serve para contratar e melhorar heróis.</dd>" +
        "<dt>Clique / dano por clique</dt><dd>O ataque que você faz tocando no monstro, e quanto ele tira de vida.</dd>" +
        "<dt>DPS (dano por segundo)</dt><dd>O dano que seus heróis causam sozinhos a cada segundo.</dd>" +
        "<dt>Nível</dt><dd>Quanto você melhorou um herói. Mais nível, mais dano (e mais caro o próximo).</dd>" +
        "<dt>Bônus de nível</dt><dd>Multiplicador de dano que o herói ganha em certos níveis (" + marcosTxt() + "...).</dd>" +
        "<dt>Zona</dt><dd>Uma fase com " + MONSTROS_POR_ZONA + " monstros. Quanto mais longe, mais forte o monstro e mais ouro.</dd>" +
        "<dt>Bioma</dt><dd>O cenário (Floresta, Caverna, Deserto...) que muda a cada 10 zonas.</dd>" +
        "<dt>Chefe</dt><dd>Monstro forte a cada 5 zonas, com tempo limite de " + TEMPO_CHEFE + " s.</dd>" +
        "<dt>Farmar</dt><dd>Repetir uma zona mais fácil para juntar ouro e ficar mais forte.</dd>" +
        "<dt>Crítico</dt><dd>Um clique de sorte que causa dano bem maior.</dd>" +
        "<dt>Baú</dt><dd>Um monstro especial que dá muito ouro.</dd>" +
        "<dt>Habilidade</dt><dd>Poder que não custa ouro, só espera recarregar (Raio, Fúria, Sorte).</dd>" +
        "<dt>Talento</dt><dd>Melhoria permanente comprada com pontos de talento, ganhos ao vencer chefes.</dd>" +
        "</dl>" +
        '<p class="tut-dica">Pronto! Se esquecer alguma coisa, é só clicar em <b>Ajuda</b>. Bom jogo!</p>',
    },
  ];
  let slide = 0;

  function desenharFiguras(raiz) {
    raiz.querySelectorAll("canvas[data-sprite]").forEach((c) => desenharSprite(c, c.dataset.sprite));
    raiz.querySelectorAll("canvas[data-icone]").forEach((c) => desenharIcone(c, c.dataset.icone));
  }

  function renderIndice() {
    $("#tut-indice").innerHTML = SLIDES.map(
      (s, i) => '<button type="button" data-i="' + i + '" class="' + (i === slide ? "on" : "") + '">' + (i + 1) + ". " + s.titulo + "</button>",
    ).join("");
  }

  function renderSlide() {
    const s = SLIDES[slide];
    $("#tut-etapa").textContent = "Passo " + (slide + 1) + " de " + SLIDES.length;
    $("#tut-titulo").textContent = s.titulo;
    const corpo = $("#tut-texto");
    corpo.innerHTML = s.corpo();
    desenharFiguras(corpo);
    const arte = $("#tut-arte");
    arte.innerHTML = "";
    for (const [tipo, nome] of s.arte || []) {
      const c = document.createElement("canvas");
      c.className = "tut-sprite " + tipo;
      (tipo === "sprite" ? desenharSprite : desenharIcone)(c, nome);
      arte.appendChild(c);
    }
    $("#tut-pontos").innerHTML = SLIDES.map((_, i) => '<i class="' + (i === slide ? "on" : "") + '"></i>').join("");
    $("#tut-barra-fill").style.width = ((slide + 1) / SLIDES.length) * 100 + "%";
    $("#tut-voltar").disabled = slide === 0;
    $("#tut-proximo").textContent = slide === SLIDES.length - 1 ? "Começar!" : "Próximo";
    $("#tut-corpo").scrollTop = 0;
    renderIndice();
  }

  function irParaSlide(i) {
    slide = Math.max(0, Math.min(SLIDES.length - 1, i));
    $("#tut-indice").hidden = true;
    $("#tut-indice-btn").setAttribute("aria-expanded", "false");
    renderSlide();
  }

  function abrirTutorial(inicio) {
    slide = inicio || 0;
    $("#tut-indice").hidden = true;
    $("#tut-indice-btn").setAttribute("aria-expanded", "false");
    renderSlide();
    telaTutorial.hidden = false;
    atualizarPausa();
    $("#tut-proximo").focus();
  }

  function fecharTutorial() {
    telaTutorial.hidden = true;
    if (!estado.tutorialVisto) {
      estado.tutorialVisto = true;
      salvar(false);
    }
    atualizarPausa();
  }

  $("#tut-proximo").addEventListener("click", () => {
    if (slide >= SLIDES.length - 1) fecharTutorial();
    else irParaSlide(slide + 1);
  });
  $("#tut-voltar").addEventListener("click", () => irParaSlide(slide - 1));
  $("#tut-pular").addEventListener("click", fecharTutorial);
  $("#tut-indice-btn").addEventListener("click", () => {
    const aberto = $("#tut-indice").hidden;
    $("#tut-indice").hidden = !aberto;
    $("#tut-indice-btn").setAttribute("aria-expanded", String(aberto));
  });
  $("#tut-indice").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) irParaSlide(parseInt(b.dataset.i, 10));
  });
  $("#tut-texto").addEventListener("click", (e) => {
    const b = e.target.closest("[data-salto]");
    if (!b) return;
    const i = SLIDES.findIndex((x) => x.id === b.dataset.salto);
    if (i >= 0) irParaSlide(i);
  });
  $("#btn-ajuda").addEventListener("click", () => abrirTutorial());

  /* =========================================================
     Conta
     ========================================================= */
  let aba = "entrar";
  let ocupado = false;

  function mensagemConta(texto, ok) {
    const e = $("#conta-erro");
    e.textContent = texto || "";
    e.classList.toggle("ok", !!ok);
  }

  function renderConta() {
    const p = NV.perfil;
    $("#conta-deslogado").hidden = !!p;
    $("#conta-logado").hidden = !p;
    $("#btn-conta").textContent = p ? p.nome : "Entrar";
    $("#btn-conta").title = p ? "Sua conta" : "Entrar ou criar conta";

    if (!p) {
      let aviso = "Entre para guardar seu progresso na nuvem e jogar em qualquer aparelho.";
      if (!NV.configurado) aviso = "As contas ainda não foram configuradas neste jogo (quem mantém o jogo precisa preencher o firebase-config.js). Por enquanto o progresso fica só neste aparelho.";
      else if (!NV.ativo) aviso = "Não deu para conectar ao Firebase agora. Confira a internet e recarregue a página.";
      $("#conta-aviso").textContent = aviso;
      const liberado = NV.ativo;
      $$("#conta-form input, #conta-form button, #conta-google, #conta-esqueci, .aba").forEach((x) => (x.disabled = !liberado || ocupado));
      $$(".aba").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.aba === aba)));
      $$("#conta [data-so]").forEach((x) => (x.hidden = x.dataset.so !== aba));
      $("#conta-enviar").textContent = aba === "criar" ? "Criar conta" : "Entrar";
      $("#conta-senha").autocomplete = aba === "criar" ? "new-password" : "current-password";
    } else {
      $("#conta-nome-ver").textContent = p.nome;
      $("#conta-email-ver").textContent = p.email;
      const pa = $("#conta-papel");
      pa.textContent = p.papel === "dev" ? "Dev" : "Jogador";
      pa.className = "papel " + p.papel;
      renderSync();
    }
  }

  function abrirConta() {
    mensagemConta("");
    renderConta();
    telaConta.hidden = false;
    document.body.classList.add("modal-aberto");
    (NV.perfil ? $("#conta-fechar") : $("#conta-email")).focus();
  }
  function fecharConta() {
    telaConta.hidden = true;
    if (telaTutorial.hidden) document.body.classList.remove("modal-aberto");
  }

  $("#btn-conta").addEventListener("click", abrirConta);
  $("#conta-fechar").addEventListener("click", fecharConta);
  telaConta.addEventListener("click", (e) => {
    if (e.target === telaConta) fecharConta();
  });
  $$(".aba").forEach((b) =>
    b.addEventListener("click", () => {
      aba = b.dataset.aba;
      mensagemConta("");
      renderConta();
    }),
  );

  async function comOcupado(fn) {
    if (ocupado) return;
    ocupado = true;
    renderConta();
    try {
      await fn();
    } catch (e) {
      mensagemConta(e.message || "Algo deu errado.");
    } finally {
      ocupado = false;
      renderConta();
    }
  }

  $("#conta-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const email = $("#conta-email").value.trim();
    const senha = $("#conta-senha").value;
    if (!email.includes("@")) return mensagemConta("Digite um e-mail válido.");
    if (senha.length < 6) return mensagemConta("A senha precisa ter pelo menos 6 caracteres.");
    mensagemConta("");
    comOcupado(async () => {
      if (aba === "criar") {
        const perfil = await NV.criarConta({
          email,
          senha,
          nome: $("#conta-nome").value,
          codigoDev: $("#conta-codigo").value.trim(),
        });
        if (perfil.aviso) toast(perfil.aviso);
      } else {
        await NV.entrar(email, senha);
      }
      $("#conta-senha").value = "";
      $("#conta-codigo").value = "";
      fecharConta();
    });
  });
  $("#conta-google").addEventListener("click", () =>
    comOcupado(async () => {
      await NV.entrarGoogle();
      fecharConta();
    }),
  );
  $("#conta-esqueci").addEventListener("click", () => {
    const email = $("#conta-email").value.trim();
    if (!email.includes("@")) return mensagemConta("Digite seu e-mail acima para receber o link.");
    comOcupado(async () => {
      await NV.recuperarSenha(email);
      mensagemConta("Enviamos um e-mail para redefinir a senha.", true);
    });
  });
  $("#conta-sair").addEventListener("click", () =>
    comOcupado(async () => {
      await NV.sair();
      toast("Você saiu da conta.");
    }),
  );
  $("#conta-enviar-nuvem").addEventListener("click", () => enviarNuvem(true));
  $("#conta-baixar").addEventListener("click", baixarNuvem);

  /* =========================================================
     Sincronização com a nuvem
     ========================================================= */
  let meta = lerMeta(); // { uid, baseNuvem, sig } do último sincronismo
  let statusSync = "";
  let enviando = false;

  function lerMeta() {
    try {
      return JSON.parse(localStorage.getItem(META_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function gravarMeta() {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch (e) {
      /* sem storage */
    }
  }
  function setStatus(t) {
    statusSync = t;
    if (!telaConta.hidden) renderSync();
  }
  function renderSync() {
    $("#conta-sync").textContent = statusSync || (meta.uid === (NV.perfil && NV.perfil.uid) && meta.baseNuvem ? "Última sincronização: " + quando(meta.baseNuvem) : "Ainda não sincronizado.");
  }

  // muda quando o progresso muda (ignora relógios de recarga e carimbo de hora)
  const assinatura = (e) =>
    [Math.floor(e.ouro), e.cliques, e.abatidos, e.zonaMax, e.pontosGanhos, JSON.stringify(e.herois), JSON.stringify(e.talentos)].join("|");

  // recargas viram "tempo que falta", para não depender do relógio de cada aparelho
  function paraNuvem() {
    const c = JSON.parse(JSON.stringify(estado));
    const rel = relogio();
    c.cdResta = {};
    c.ativoResta = {};
    for (const id in estado.cdFim) c.cdResta[id] = Math.max(0, estado.cdFim[id] - rel);
    for (const id in estado.ativoFim) c.ativoResta[id] = Math.max(0, estado.ativoFim[id] - rel);
    delete c.cdFim;
    delete c.ativoFim;
    return c;
  }
  function deNuvem(dados) {
    const o = { ...dados };
    const agora = Date.now();
    o.cdFim = {};
    o.ativoFim = {};
    for (const id in o.cdResta || {}) o.cdFim[id] = agora + o.cdResta[id];
    for (const id in o.ativoResta || {}) o.ativoFim[id] = agora + o.ativoResta[id];
    delete o.cdResta;
    delete o.ativoResta;
    return o;
  }

  function aplicarNuvem(remoto) {
    aplicarEstadoExterno(deNuvem(remoto.dados));
    meta = { uid: NV.perfil.uid, baseNuvem: remoto.salvoEm, sig: assinatura(estado) };
    gravarMeta();
    renderInicio();
    setStatus("Progresso carregado da nuvem.");
    toast("Progresso da nuvem carregado.");
  }

  function cartoes(remoto) {
    const local = resumo(estado);
    return (
      '<div class="comparar">' +
      '<div class="cartao"><h3>Nuvem</h3><p>' + textoResumo(remoto.resumo && remoto.resumo.zonaMax ? remoto.resumo : resumo(normalizar(deNuvem(remoto.dados)))) + "</p><small>" + quando(remoto.salvoEm) + "</small></div>" +
      '<div class="cartao"><h3>Este aparelho</h3><p>' + textoResumo(local) + "</p><small>" + quando(estado.salvoEm) + "</small></div>" +
      "</div>"
    );
  }

  async function resolverConflito(remoto) {
    const escolha = await perguntar({
      titulo: "Dois progressos diferentes",
      html: "<p>Encontramos um progresso na nuvem e outro neste aparelho. Qual você quer manter? O outro será substituído.</p>" + cartoes(remoto),
      botoes: [
        { id: "nuvem", rotulo: "Usar o da nuvem", primario: true },
        { id: "local", rotulo: "Usar o deste aparelho" },
      ],
    });
    if (escolha === "nuvem") aplicarNuvem(remoto);
    else {
      meta = { uid: NV.perfil.uid, baseNuvem: remoto.salvoEm, sig: "" };
      await enviarNuvem(true);
    }
  }

  async function enviarNuvem(manual) {
    const p = NV.perfil;
    if (!p) {
      if (manual) toast("Entre numa conta para salvar na nuvem.");
      return false;
    }
    if (enviando) return false;
    enviando = true;
    setStatus("Sincronizando…");
    try {
      if (meta.uid === p.uid && meta.baseNuvem) {
        const remoto = await NV.lerSave();
        if (remoto && remoto.salvoEm !== meta.baseNuvem) {
          enviando = false;
          setStatus("Outro aparelho salvou um progresso.");
          await resolverConflito(remoto);
          return true;
        }
      }
      const sigAntes = assinatura(estado);
      const t = await NV.gravarSave(paraNuvem(), resumo(estado));
      meta = { uid: p.uid, baseNuvem: t, sig: sigAntes };
      gravarMeta();
      setStatus("Salvo na nuvem em " + quando(t) + ".");
      if (manual) toast("Progresso salvo na nuvem.");
      return true;
    } catch (e) {
      setStatus("Não foi possível sincronizar: " + e.message);
      if (manual) toast("Não foi possível salvar na nuvem: " + e.message);
      return false;
    } finally {
      enviando = false;
    }
  }

  async function baixarNuvem() {
    if (!NV.perfil) return;
    try {
      const remoto = await NV.lerSave();
      if (!remoto) return toast("Ainda não há progresso salvo na nuvem.");
      const r = await perguntar({
        titulo: "Baixar da nuvem?",
        html: "<p>O progresso deste aparelho será substituído pelo da nuvem.</p>" + cartoes(remoto),
        botoes: [
          { id: "sim", rotulo: "Baixar", primario: true },
          { id: "nao", rotulo: "Cancelar" },
        ],
      });
      if (r === "sim") aplicarNuvem(remoto);
    } catch (e) {
      toast("Não foi possível baixar: " + e.message);
    }
  }

  async function sincronizarAoEntrar(perfil) {
    setStatus("Sincronizando…");
    try {
      const remoto = await NV.lerSave();
      const mesmaConta = meta.uid === perfil.uid;
      const localTem = temProgresso(estado);

      if (!remoto) {
        if (!localTem) {
          meta = { uid: perfil.uid, baseNuvem: 0, sig: assinatura(estado) };
          gravarMeta();
          return setStatus("Conta nova: o progresso será salvo na nuvem enquanto você joga.");
        }
        if (!mesmaConta && meta.uid) {
          const r = await perguntar({
            titulo: "Enviar este progresso?",
            html: "<p>Este aparelho tem um progresso salvo de outra conta (" + textoResumo(resumo(estado)) + "). Enviar para <b>" + perfil.nome + "</b>?</p>",
            botoes: [
              { id: "enviar", rotulo: "Enviar para esta conta", primario: true },
              { id: "zerar", rotulo: "Começar do zero" },
            ],
          });
          if (r === "zerar") {
            zerar();
            meta = { uid: perfil.uid, baseNuvem: 0, sig: assinatura(estado) };
            gravarMeta();
            renderInicio();
            return setStatus("Começando do zero nesta conta.");
          }
        }
        meta = { uid: perfil.uid, baseNuvem: 0, sig: "" };
        return void (await enviarNuvem(false));
      }

      if (!localTem) return aplicarNuvem(remoto);
      if (mesmaConta && meta.baseNuvem === remoto.salvoEm) {
        if (assinatura(estado) !== meta.sig) await enviarNuvem(false);
        else setStatus("Tudo sincronizado.");
        return;
      }
      if (mesmaConta && remoto.salvoEm > meta.baseNuvem && assinatura(estado) === meta.sig) {
        return aplicarNuvem(remoto);
      }
      await resolverConflito(remoto);
    } catch (e) {
      setStatus("Não foi possível sincronizar: " + e.message);
      toast("Não foi possível sincronizar: " + e.message);
    }
  }

  // envio automático: a cada 45 s se houver mudança, e ao esconder a aba
  function autoEnviar() {
    const p = NV.perfil;
    if (!p || enviando || meta.uid !== p.uid || !navigator.onLine) return;
    if (assinatura(estado) !== meta.sig) enviarNuvem(false);
  }
  setInterval(autoEnviar, 45000);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) autoEnviar();
  });
  window.addEventListener("pagehide", autoEnviar);
  window.aoSalvarLocal = (avisar) => {
    if (avisar && NV.perfil) enviarNuvem(true);
  };

  function aoMudarAuth(perfil) {
    renderConta();
    renderInicio();
    atualizarDev();
    if (perfil) {
      toast("Conectado como " + perfil.nome + (perfil.papel === "dev" ? " (dev)" : "") + ".");
      sincronizarAoEntrar(perfil);
    } else {
      setStatus("");
      meta = { ...meta };
    }
  }

  /* =========================================================
     Painel Dev (contas dev; ou ?dev=1 quando não há Firebase configurado)
     ========================================================= */
  const dev = $("#dev");
  const CAMPOS = [
    ["CRESC_VIDA", "Crescimento da vida por zona", 0.01, () => CRESC_VIDA, (v) => (CRESC_VIDA = v)],
    ["OURO_DIV", "Divisor de ouro (maior = menos ouro)", 1, () => OURO_DIV, (v) => (OURO_DIV = v)],
    ["VIDA_CHEFE", "Vida do chefe (x monstro)", 1, () => VIDA_CHEFE, (v) => (VIDA_CHEFE = v)],
    ["TEMPO_CHEFE", "Tempo do chefe (s)", 1, () => TEMPO_CHEFE, (v) => (TEMPO_CHEFE = v)],
    ["MONSTROS_POR_ZONA", "Abates por zona", 1, () => MONSTROS_POR_ZONA, (v) => (MONSTROS_POR_ZONA = v)],
    ["CRESCIMENTO_CUSTO", "Crescimento do custo dos heróis", 0.001, () => CRESCIMENTO_CUSTO, (v) => (CRESCIMENTO_CUSTO = v)],
    ["CHANCE_BAU", "Chance de baú (0 a 1)", 0.01, () => CHANCE_BAU, (v) => (CHANCE_BAU = v)],
    ["CHANCE_CRITICO", "Chance de crítico (0 a 1)", 0.01, () => CHANCE_CRITICO, (v) => (CHANCE_CRITICO = v)],
  ];
  const PADROES = Object.fromEntries(CAMPOS.map((c) => [c[0], c[3]()]));
  let devConstruido = false;
  let devLigado = false;
  let timerInfoDev = null;

  const devPermitido = () =>
    !!(NV.perfil && NV.perfil.papel === "dev") || (!NV.configurado && params.get("dev") === "1");

  function construirDev() {
    $("#dev-corpo").innerHTML =
      '<details open><summary>Recursos</summary>' +
      '<div class="dev-linha"><label>Ouro <input type="number" id="dev-ouro" step="any" min="0"></label><button data-dev="ouro-def">Definir</button></div>' +
      '<div class="dev-linha"><button data-dev="ouro" data-val="1000">+1 mil</button><button data-dev="ouro" data-val="1000000">+1 mi</button><button data-dev="ouro" data-val="1000000000">+1 bi</button><button data-dev="ouro-x" data-val="10">x10</button></div>' +
      '<div class="dev-linha">Pontos de talento <button data-dev="pontos" data-val="1">+1</button><button data-dev="pontos" data-val="10">+10</button><button data-dev="pontos" data-val="100">+100</button></div>' +
      "</details>" +
      '<details open><summary>Progresso</summary>' +
      '<div class="dev-linha"><label>Zona <input type="number" id="dev-zona" min="1" step="1"></label><button data-dev="zona-ir">Ir</button></div>' +
      '<div class="dev-linha"><button data-dev="zona-mais" data-val="1">+1</button><button data-dev="zona-mais" data-val="10">+10</button><button data-dev="zona-chefe">Próximo chefe</button><button data-dev="matar">Matar monstro</button></div>' +
      '<div class="dev-linha"><label>Nível <input type="number" id="dev-nivel" min="1" step="1" value="10"></label><button data-dev="herois-nivel">Todos os heróis</button></div>' +
      '<div class="dev-linha"><button data-dev="herois-liberar">Liberar todos (Nv 1)</button><button data-dev="herois-zerar">Zerar heróis</button><button data-dev="recargas">Zerar recargas</button></div>' +
      "</details>" +
      '<details><summary>Tempo e multiplicadores</summary>' +
      '<div class="dev-linha"><label>Velocidade <select id="dev-vel"><option>0.5</option><option selected>1</option><option>2</option><option>5</option><option>10</option><option>25</option><option>100</option></select>x</label></div>' +
      '<div class="dev-linha"><label class="dev-check"><input type="checkbox" id="dev-semtempo"> Chefes sem limite de tempo</label></div>' +
      '<div class="dev-linha"><label>Dano x <input type="number" id="dev-m-dano" step="any" min="0" value="1"></label><label>Ouro x <input type="number" id="dev-m-ouro" step="any" min="0" value="1"></label><label>Custo x <input type="number" id="dev-m-custo" step="any" min="0" value="1"></label></div>' +
      '<div class="dev-linha"><button data-dev="mult">Aplicar multiplicadores</button></div>' +
      "</details>" +
      '<details><summary>Balanceamento ao vivo</summary>' +
      CAMPOS.map((c) => '<div class="dev-linha"><label>' + c[1] + ' <input type="number" data-campo="' + c[0] + '" step="' + c[2] + '" min="0"></label></div>').join("") +
      '<div class="dev-linha"><button data-dev="balanco">Aplicar</button><button data-dev="padroes">Padrões</button></div>' +
      "</details>" +
      '<details><summary>Salvar / carregar (JSON)</summary>' +
      '<textarea id="dev-json" rows="5" spellcheck="false"></textarea>' +
      '<div class="dev-linha"><button data-dev="json-exportar">Exportar</button><button data-dev="json-importar">Importar</button></div>' +
      "</details>" +
      '<div class="dev-info" id="dev-info"></div>';
    preencherCampos();
    devConstruido = true;
  }

  function preencherCampos() {
    CAMPOS.forEach((c) => {
      const i = dev.querySelector('[data-campo="' + c[0] + '"]');
      if (i) i.value = +c[3]().toFixed(4);
    });
  }

  function infoDev() {
    const z = estado.zona;
    const hp = hpZona(z);
    const alvo = $("#dev-info");
    if (!alvo) return;
    alvo.innerHTML =
      "Zona " + z + " (máx " + estado.zonaMax + ")<br>" +
      "Vida do monstro: " + fmt(hp) + " · chefe: " + fmt(hp * VIDA_CHEFE) + "<br>" +
      "Ouro por abate: " + fmt(ouroPorHp(hp)) + "<br>" +
      "Dano/s: " + fmt(dps()) + " · clique: " + fmt(danoBase()) + "<br>" +
      "Pontos livres: " + pontosLivres() + " · velocidade " + velocidade + "x";
  }

  function irZona(z) {
    z = Math.max(1, Math.floor(z) || 1);
    clearTimeout(timerAvanco);
    estado.abates = 0;
    mudarZona(z);
    spawn();
    renderTudo();
  }

  const numero = (id) => parseFloat($("#" + id).value);

  function acaoDev(a, val) {
    switch (a) {
      case "ouro-def": {
        const v = numero("dev-ouro");
        if (Number.isFinite(v) && v >= 0) estado.ouro = v;
        break;
      }
      case "ouro": estado.ouro += val; break;
      case "ouro-x": estado.ouro = Math.max(1, estado.ouro) * val; break;
      case "pontos":
        estado.pontosGanhos += val;
        atualizarSelo();
        if (!$("#arvore").hidden) renderArvore();
        break;
      case "zona-ir": irZona(numero("dev-zona")); break;
      case "zona-mais": irZona(estado.zona + val); break;
      case "zona-chefe": irZona(Math.ceil((estado.zona + 1) / 5) * 5); break;
      case "matar":
        if (monstro && !monstro.morrendo) causarDano(monstro.hp + 1, "raio");
        break;
      case "herois-nivel": {
        const n = Math.max(1, Math.floor(numero("dev-nivel")) || 1);
        for (const h of herois) estado.herois[h.id] = n;
        break;
      }
      case "herois-liberar":
        for (const h of herois) if (!estado.herois[h.id]) estado.herois[h.id] = 1;
        break;
      case "herois-zerar": estado.herois = {}; break;
      case "recargas": estado.cdFim = {}; estado.ativoFim = {}; break;
      case "mult":
        DEV.danoMult = Math.max(0, numero("dev-m-dano")) || 0;
        DEV.ouroMult = Math.max(0, numero("dev-m-ouro")) || 0;
        DEV.custoMult = Math.max(0, numero("dev-m-custo")) || 0;
        break;
      case "balanco":
        CAMPOS.forEach((c) => {
          const v = parseFloat(dev.querySelector('[data-campo="' + c[0] + '"]').value);
          if (Number.isFinite(v) && v >= 0) c[4](v);
        });
        irZona(estado.zona);
        break;
      case "padroes":
        CAMPOS.forEach((c) => c[4](PADROES[c[0]]));
        preencherCampos();
        irZona(estado.zona);
        break;
      case "json-exportar":
        $("#dev-json").value = JSON.stringify(estado, null, 1);
        break;
      case "json-importar":
        try {
          aplicarEstadoExterno(JSON.parse($("#dev-json").value));
          renderInicio();
          toast("Save importado.");
        } catch (e) {
          toast("JSON inválido.");
        }
        break;
    }
    renderTudo();
    infoDev();
  }

  function restaurarDev() {
    relogio();
    velocidade = 1;
    DEV.danoMult = DEV.ouroMult = DEV.custoMult = 1;
    DEV.semTempoChefe = false;
    CAMPOS.forEach((c) => c[4](PADROES[c[0]]));
    if (devConstruido) {
      preencherCampos();
      $("#dev-vel").value = "1";
      $("#dev-semtempo").checked = false;
      ["dano", "ouro", "custo"].forEach((k) => ($("#dev-m-" + k).value = "1"));
    }
  }

  function atualizarDev() {
    const ok = devPermitido();
    $("#btn-dev").hidden = !ok;
    if (ok && !devConstruido) construirDev();
    if (ok && !devLigado) {
      devLigado = true;
      timerInfoDev = setInterval(() => {
        if (!dev.hidden) infoDev();
      }, 500);
    }
    if (!ok && devLigado) {
      devLigado = false;
      clearInterval(timerInfoDev);
      dev.hidden = true;
      restaurarDev();
      irZona(estado.zona);
    }
  }

  $("#btn-dev").addEventListener("click", () => {
    dev.hidden = !dev.hidden;
    if (!dev.hidden) infoDev();
  });
  $("#dev-fechar").addEventListener("click", () => (dev.hidden = true));
  dev.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dev]");
    if (b) acaoDev(b.dataset.dev, parseFloat(b.dataset.val));
  });
  dev.addEventListener("change", (e) => {
    if (e.target.id === "dev-vel") {
      relogio();
      velocidade = parseFloat(e.target.value) || 1;
    } else if (e.target.id === "dev-semtempo") {
      DEV.semTempoChefe = e.target.checked;
    }
  });

  /* =========================================================
     Atalhos e partida
     ========================================================= */
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") {
      if (!telaTutorial.hidden) fecharTutorial();
      else if (!telaConta.hidden) fecharConta();
      return;
    }
    if (digitando(e)) return;
    if (!telaTutorial.hidden) {
      if (e.key === "ArrowRight") $("#tut-proximo").click();
      else if (e.key === "ArrowLeft") $("#tut-voltar").click();
      return;
    }
    if ((e.key === "h" || e.key === "H") && telaInicio.hidden && telaConta.hidden && telaDialogo.hidden) abrirTutorial();
  });

  desenharSpritesInicio();
  renderInicio();
  renderConta();
  atualizarPausa();
  atualizarDev();
  $("#inicio-jogar").focus();

  NV.aoMudarAuth(aoMudarAuth);
  Promise.resolve()
    .then(() => NV.iniciar(window.FIREBASE_CONFIG))
    .catch((e) => console.warn("Contas indisponíveis:", e))
    .finally(() => {
      renderConta();
      renderInicio();
      atualizarDev();
    });
})();
} catch (erro) {
  // qualquer falha aqui não pode travar o jogo atrás da tela inicial
  console.error("meta.js falhou:", erro);
  liberarSemTelaInicial();
}
