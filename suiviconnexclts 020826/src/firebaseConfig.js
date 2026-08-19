// ─────────────────────────────────────────────────────────────────────────
// CONFIGURATION FIREBASE
// ─────────────────────────────────────────────────────────────────────────
// Où trouver ces valeurs :
// 1. Ouvrez https://console.firebase.google.com/u/0/project/riseappli-prod/settings/general
// 2. Descendez jusqu'à "Vos applications"
// 3. Si vous n'avez pas encore d'application Web, cliquez sur l'icône </> pour en créer une
// 4. Copiez l'objet "firebaseConfig" qui s'affiche et collez ses valeurs ci-dessous
//
// Ces informations (apiKey, projectId, etc.) ne sont PAS des secrets : elles
// identifient votre projet côté client. La vraie sécurité de vos données se
// fait via les règles Firestore (voir FIRESTORE_RULES.md fourni avec ce projet).
// ─────────────────────────────────────────────────────────────────────────

export const firebaseConfig = {
  apiKey: "AIzaSyAdjUYlswy-rfk0cwVs2Qly5-iViNrhKqk",
  authDomain: "riseappli-prod.firebaseapp.com",
  projectId: "riseappli-prod",
  storageBucket: "riseappli-prod.firebasestorage.app",
  messagingSenderId: "404378933325",
  appId: "1:404378933325:web:881815792a58b529346404",
}
