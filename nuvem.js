"use strict";

/* =========================================================
   CONTAS E NUVEM (Firebase Auth + Firestore)
   Só carrega o Firebase se existir window.FIREBASE_CONFIG
   (veja firebase-config.js). Sem configuração o jogo funciona
   normalmente, só que salvando apenas neste navegador.

   Estrutura no Firestore:
     usuarios/{uid}                   -> { papel: "jogador" | "dev", nome, criadoEm }
     usuarios/{uid}/saves/principal   -> { dados (JSON em texto), salvoEm, resumo, versao }
   As regras de segurança estão em firestore.rules.
   ========================================================= */
(function () {
  // tenta as versões em ordem, caso alguma não esteja disponível no CDN
  const VERSOES_SDK = ["10.14.1", "10.13.2", "10.12.5", "11.0.2"];
  const baseSdk = (v) => "https://www.gstatic.com/firebasejs/" + v + "/";

  async function carregarSdk() {
    let ultimoErro = null;
    for (const v of VERSOES_SDK) {
      try {
        const b = baseSdk(v);
        return await Promise.all([
          import(b + "firebase-app.js"),
          import(b + "firebase-auth.js"),
          import(b + "firebase-firestore.js"),
        ]);
      } catch (e) {
        ultimoErro = e;
      }
    }
    throw ultimoErro;
  }

  let A = null; // módulo firebase-auth
  let F = null; // módulo firebase-firestore
  let auth = null;
  let db = null;
  let criandoConta = false; // evita criar o perfil duas vezes durante o cadastro
  const ouvintes = [];

  const MENSAGENS = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/missing-email": "Digite o e-mail.",
    "auth/missing-password": "Digite a senha.",
    "auth/user-not-found": "Não existe conta com esse e-mail.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/email-already-in-use": "Já existe uma conta com esse e-mail.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Espere um pouco e tente de novo.",
    "auth/network-request-failed": "Sem conexão com a internet.",
    "auth/popup-closed-by-user": "A janela do Google foi fechada.",
    "auth/cancelled-popup-request": "A janela do Google foi fechada.",
    "auth/popup-blocked": "O navegador bloqueou a janela do Google.",
    "auth/operation-not-allowed": "Esse tipo de login ainda não foi ativado no Firebase.",
    "auth/user-disabled": "Essa conta foi desativada.",
    "permission-denied": "Sem permissão (confira as regras do Firestore).",
    unavailable: "Servidor indisponível. Tente de novo em instantes.",
    timeout: "A conexão demorou demais. Tente de novo.",
  };

  function traduzir(e) {
    const codigo = (e && e.code) || "";
    const msg =
      MENSAGENS[codigo] ||
      MENSAGENS[codigo.replace("firestore/", "")] ||
      (e && e.message) ||
      "Algo deu errado.";
    const erro = new Error(msg);
    erro.codigo = codigo;
    return erro;
  }

  const comTimeout = (p, ms) =>
    Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej({ code: "timeout" }), ms)),
    ]);

  const refPerfil = (uid) => F.doc(db, "usuarios", uid);
  const refSave = (uid) => F.doc(db, "usuarios", uid, "saves", "principal");

  async function carregarPerfil(user) {
    const nomePadrao =
      user.displayName || (user.email || "").split("@")[0] || "Jogador";
    try {
      const snap = await comTimeout(F.getDoc(refPerfil(user.uid)), 10000);
      if (snap.exists()) {
        const d = snap.data();
        return {
          uid: user.uid,
          email: user.email || "",
          nome: d.nome || nomePadrao,
          papel: d.papel === "dev" ? "dev" : "jogador",
        };
      }
      // primeiro acesso (ex.: login com Google): cria o perfil de jogador
      await comTimeout(
        F.setDoc(refPerfil(user.uid), {
          papel: "jogador",
          nome: nomePadrao,
          criadoEm: Date.now(),
        }),
        10000,
      );
    } catch (e) {
      /* offline ou sem permissão: segue como jogador */
    }
    return { uid: user.uid, email: user.email || "", nome: nomePadrao, papel: "jogador" };
  }

  const Nuvem = {
    configurado: false, // existe configuração do Firebase
    ativo: false, // SDK carregado e pronto
    perfil: null, // { uid, email, nome, papel } quando logado
    erroInicio: null,

    aoMudarAuth(cb) {
      ouvintes.push(cb);
    },

    async iniciar(config) {
      this.configurado = !!(config && config.apiKey && config.projectId);
      if (!this.configurado) return;
      try {
        const [app, authMod, fsMod] = await carregarSdk();
        A = authMod;
        F = fsMod;
        const instancia = app.initializeApp(config);
        auth = A.getAuth(instancia);
        db = F.getFirestore(instancia);
        this.ativo = true;
        await new Promise((resolve) => {
          let primeira = true;
          A.onAuthStateChanged(auth, async (user) => {
            if (criandoConta) return;
            const perfil = user ? await carregarPerfil(user) : null;
            Nuvem.perfil = perfil;
            ouvintes.forEach((cb) => cb(perfil));
            if (primeira) {
              primeira = false;
              resolve();
            }
          });
        });
      } catch (e) {
        this.erroInicio = e;
        this.ativo = false;
        console.warn("Firebase indisponível:", e);
      }
    },

    async criarConta({ email, senha, nome, codigoDev }) {
      if (!this.ativo) throw new Error("Contas indisponíveis.");
      criandoConta = true;
      try {
        const cred = await A.createUserWithEmailAndPassword(auth, email, senha);
        const user = cred.user;
        const nomeFinal = (nome || "").trim() || email.split("@")[0];
        try {
          await A.updateProfile(user, { displayName: nomeFinal });
        } catch (e) {
          /* não é crítico */
        }
        let papel = "jogador";
        let aviso = "";
        if (codigoDev) {
          try {
            await comTimeout(
              F.setDoc(refPerfil(user.uid), { papel: "dev", nome: nomeFinal, codigoDev, criadoEm: Date.now() }),
              10000,
            );
            papel = "dev";
          } catch (e) {
            aviso = "Código de dev inválido: a conta foi criada como jogador.";
          }
        }
        if (papel === "jogador") {
          await comTimeout(
            F.setDoc(refPerfil(user.uid), { papel: "jogador", nome: nomeFinal, criadoEm: Date.now() }),
            10000,
          );
        }
        const perfil = { uid: user.uid, email: user.email || email, nome: nomeFinal, papel, aviso };
        this.perfil = perfil;
        criandoConta = false;
        ouvintes.forEach((cb) => cb(perfil));
        return perfil;
      } catch (e) {
        throw traduzir(e);
      } finally {
        criandoConta = false;
      }
    },

    async entrar(email, senha) {
      if (!this.ativo) throw new Error("Contas indisponíveis.");
      try {
        await A.signInWithEmailAndPassword(auth, email, senha);
      } catch (e) {
        throw traduzir(e);
      }
    },

    async entrarGoogle() {
      if (!this.ativo) throw new Error("Contas indisponíveis.");
      try {
        await A.signInWithPopup(auth, new A.GoogleAuthProvider());
      } catch (e) {
        throw traduzir(e);
      }
    },

    async recuperarSenha(email) {
      if (!this.ativo) throw new Error("Contas indisponíveis.");
      try {
        await A.sendPasswordResetEmail(auth, email);
      } catch (e) {
        throw traduzir(e);
      }
    },

    async sair() {
      if (!this.ativo) return;
      try {
        await A.signOut(auth);
      } catch (e) {
        throw traduzir(e);
      }
    },

    // -> null (sem save) ou { dados, salvoEm, resumo }
    async lerSave() {
      if (!this.ativo || !this.perfil) throw new Error("Entre numa conta primeiro.");
      try {
        const snap = await comTimeout(F.getDoc(refSave(this.perfil.uid)), 15000);
        if (!snap.exists()) return null;
        const d = snap.data();
        return { dados: JSON.parse(d.dados), salvoEm: d.salvoEm || 0, resumo: d.resumo || {} };
      } catch (e) {
        throw traduzir(e);
      }
    },

    // -> salvoEm (ms) do que foi gravado
    async gravarSave(dados, resumo) {
      if (!this.ativo || !this.perfil) throw new Error("Entre numa conta primeiro.");
      const salvoEm = Date.now();
      try {
        await comTimeout(
          F.setDoc(refSave(this.perfil.uid), {
            dados: JSON.stringify(dados),
            salvoEm,
            resumo: resumo || {},
            versao: dados.versao || 0,
          }),
          15000,
        );
        return salvoEm;
      } catch (e) {
        throw traduzir(e);
      }
    },
  };

  window.Nuvem = Nuvem;
})();
