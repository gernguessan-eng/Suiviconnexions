import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"
import { PRESENCE_COLLECTION, FIELDS, STATUT_DECONNECTE } from "../config/presenceSchema"

// Ferme manuellement une session "fantôme" (restée à Connecté sans jamais
// avoir reçu de déconnexion réelle côté client — ex. onglet fermé, app
// crashée, réseau coupé). Utilisé depuis le bouton "Clôturer" de la page
// Utilisateurs connectés.
export async function closeSession(presenceDocId) {
  const ref = doc(db, PRESENCE_COLLECTION, presenceDocId)
  await updateDoc(ref, {
    [FIELDS.statut]: STATUT_DECONNECTE,
    [FIELDS.disconnectedAt]: serverTimestamp(),
  })
}

// Supprime définitivement un document de présence (ligne de test, entrée
// erronée, doublon...). Irréversible — toujours demander confirmation
// avant d'appeler cette fonction depuis l'interface.
export async function deleteSession(presenceDocId) {
  const ref = doc(db, PRESENCE_COLLECTION, presenceDocId)
  await deleteDoc(ref)
}

