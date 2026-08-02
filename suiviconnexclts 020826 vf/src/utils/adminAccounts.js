import { initializeApp, deleteApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db, auth as primaryAuth } from "../firebase"
import { firebaseConfig } from "../firebaseConfig"
import { USERS_COLLECTION, FIELDS } from "../config/presenceSchema"

// Génère un mot de passe temporaire aléatoire. Personne n'a besoin de le
// connaître ou de le transmettre : un e-mail est envoyé juste après pour
// que la personne choisisse elle-même son mot de passe définitif.
function generateTempPassword() {
  const bytes = new Uint8Array(18)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(36)).join("").slice(0, 20) + "Aa1!"
}

// Crée un compte Firebase Authentication + son profil Firestore (users/{uid}),
// SANS déconnecter l'administrateur actuellement connecté.
//
// Pourquoi une deuxième instance Firebase : createUserWithEmailAndPassword
// connecte automatiquement l'application au compte qu'elle vient de créer,
// sur l'instance où on l'appelle. Pour éviter que ça ne déconnecte
// l'administrateur en train d'utiliser RISE Presence, on fait cette
// opération sur une instance secondaire, isolée, qu'on détruit aussitôt
// après. Le document Firestore, lui, est bien écrit via l'instance
// principale (donc avec les droits de l'administrateur connecté).
export async function createUserAccount({ email, displayName, role, entrepriseId }) {
  const secondaryApp = initializeApp(firebaseConfig, "admin-create-user-" + Date.now())
  const secondaryAuth = getAuth(secondaryApp)
  try {
    const tempPassword = generateTempPassword()
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, tempPassword)
    const uid = cred.user.uid

    await setDoc(doc(db, USERS_COLLECTION, uid), {
      [FIELDS.uid]: uid,
      [FIELDS.userName]: displayName || email,
      [FIELDS.userEmail]: email,
      [FIELDS.role]: role,
      [FIELDS.entrepriseId]: entrepriseId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Permet à la personne de définir elle-même son mot de passe.
    try {
      await sendPasswordResetEmail(secondaryAuth, email)
    } catch (e) {
      console.warn("E-mail de définition de mot de passe non envoyé :", e)
    }

    return uid
  } finally {
    await signOut(secondaryAuth).catch(() => {})
    await deleteApp(secondaryApp).catch(() => {})
  }
}

// Envoie un e-mail de réinitialisation de mot de passe à un compte existant.
export async function sendPasswordReset(email) {
  return sendPasswordResetEmail(primaryAuth, email)
}
