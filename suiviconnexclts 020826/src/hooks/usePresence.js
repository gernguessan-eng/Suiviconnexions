import { useEffect, useState } from "react"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { db } from "../firebase"
import { PRESENCE_COLLECTION, FIELDS, STATUT_CONNECTE, DEFAULT_APPLICATION } from "../config/presenceSchema"
import { toDate } from "../utils/date"

// Écoute la collection "presence" en temps réel (onSnapshot).
// Chaque mise à jour côté Firestore (nouvelle connexion, déconnexion,
// changement de statut) déclenche automatiquement un re-render ici,
// donc tout ce qui consomme ce hook reste synchronisé en direct.
export function usePresence() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    let q
    try {
      q = query(collection(db, PRESENCE_COLLECTION), orderBy(FIELDS.connectedAt, "desc"))
    } catch (e) {
      q = collection(db, PRESENCE_COLLECTION)
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => normalizeDoc(docSnap.id, docSnap.data()))
        setDocs(rows)
        setLoading(false)
        setLastSync(new Date())
        setError(null)
      },
      (err) => {
        console.error("Erreur d'écoute Firestore (presence):", err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { docs, loading, error, lastSync }
}

function normalizeDoc(id, data) {
  const userId = data[FIELDS.uid] ?? id
  const statut = data[FIELDS.statut]
  return {
    id,
    userId,
    userName: data[FIELDS.userName] ?? "Utilisateur inconnu",
    userEmail: data[FIELDS.userEmail] ?? "",
    role: data[FIELDS.role] ?? "Sans rôle",
    application: data[FIELDS.application] ?? DEFAULT_APPLICATION,
    statut: statut ?? "Inconnu",
    isOnline: statut === STATUT_CONNECTE,
    connectedAt: toDate(data[FIELDS.connectedAt]),
    disconnectedAt: toDate(data[FIELDS.disconnectedAt]),
    raw: data,
  }
}


