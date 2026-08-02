import { useEffect, useState } from "react"
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../firebase"
import { USERS_COLLECTION, FIELDS } from "../config/presenceSchema"
import { toDate } from "../utils/date"

// Écoute la collection "users" en temps réel : sert à savoir à quelle
// entreprise appartient chaque utilisateur (champ entrepriseId), et à
// gérer les comptes (menu Comptes).
export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, USERS_COLLECTION),
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => {
          const data = docSnap.data()
          return {
            uid: data[FIELDS.uid] ?? docSnap.id,
            displayName: data[FIELDS.userName] ?? "Utilisateur inconnu",
            email: data[FIELDS.userEmail] ?? "",
            role: data[FIELDS.role] ?? "Sans rôle",
            entrepriseId: data[FIELDS.entrepriseId] ?? null,
            createdAt: toDate(data.createdAt),
          }
        })
        setUsers(rows)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Erreur d'écoute Firestore (users):", err)
        setError(err)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  return { users, loading, error }
}

// Assigne un utilisateur (par uid) à une entreprise. Met à jour uniquement
// le champ entrepriseId du document users/{uid} — rien d'autre n'est touché.
export async function assignUserEntreprise(uid, entrepriseId) {
  return updateDoc(doc(db, USERS_COLLECTION, uid), {
    [FIELDS.entrepriseId]: entrepriseId,
  })
}

// Change le rôle d'un utilisateur.
export async function updateUserRole(uid, role) {
  return updateDoc(doc(db, USERS_COLLECTION, uid), {
    [FIELDS.role]: role,
  })
}

// Supprime uniquement le PROFIL Firestore (collection users) d'un compte.
// ⚠️ Ne supprime PAS le compte Firebase Authentication lui-même : depuis une
// app cliente (sans backend/Cloud Function), il est impossible de supprimer
// le compte de connexion d'un AUTRE utilisateur pour des raisons de sécurité.
// La personne pourrait donc techniquement encore se connecter, mais sans
// profil (rôle, entreprise) tant qu'aucun nouveau profil n'est recréé.
export async function deleteUserProfile(uid) {
  return deleteDoc(doc(db, USERS_COLLECTION, uid))
}

