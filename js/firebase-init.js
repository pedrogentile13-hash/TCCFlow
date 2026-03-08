// ============================================================
// TCCFlow - Firebase Configuration
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBOiwIkkFyrWhemD6cGl3A85Hvlz16NU5o",
    authDomain: "tccflow-94be6.firebaseapp.com",
    projectId: "tccflow-94be6",
    storageBucket: "tccflow-94be6.firebasestorage.app",
    messagingSenderId: "207188280509",
    appId: "1:207188280509:web:34dc672554887295c3e3d4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Check if Firebase is configured
function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "SUA_API_KEY_AQUI";
}
