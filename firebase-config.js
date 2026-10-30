/* =========================================================
   CONFIGURAÇÃO DO FIREBASE

   ATENÇÃO: aqui NÃO entra o trecho com "import { initializeApp } ..."
   que o console do Firebase mostra. Aquele trecho é para projetos com
   bundler (npm/Vite) e dá erro num <script> comum. Este jogo só precisa
   do objeto de configuração, guardado em window.FIREBASE_CONFIG: o
   nuvem.js carrega o Firebase sozinho.

   Essas chaves são públicas por natureza (ficam no navegador de
   qualquer jeito): quem protege os dados são as regras do Firestore
   (arquivo firestore.rules). Lembre de:
     - Authentication > Método de login: ativar E-mail/senha (e Google);
     - Authentication > Configurações > Domínios autorizados: incluir o
       domínio onde o jogo está hospedado;
     - Firestore Database: criar o banco e publicar o firestore.rules.
   ========================================================= */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBTblLsRUdWVPNNDemXueEpj4tBbofZB8A",
  authDomain: "click-seeker.firebaseapp.com",
  projectId: "click-seeker",
  storageBucket: "click-seeker.firebasestorage.app",
  messagingSenderId: "649885917476",
  appId: "1:649885917476:web:15c10d164c34158d1d53b1",
  measurementId: "G-XFXDFVNKCN",
};
