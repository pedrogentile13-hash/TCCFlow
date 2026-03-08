// ============================================================
// TCCFlow - Firebase Configuration
// ============================================================
// INSTRUCOES:
// 1. Acesse https://console.firebase.google.com
// 2. Crie um novo projeto (ou use um existente)
// 3. Ative Authentication > Email/Password
// 4. Crie um Firestore Database (modo teste para comecar)
// 5. Va em Project Settings > General > Your apps > Web
// 6. Copie os valores e cole abaixo
// ============================================================

const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Check if Firebase is configured
function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "SUA_API_KEY_AQUI";
}
