import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase"
import { PROSPECTS_COLLECTION, emptyProspect } from "../config/prospectsSchema"

// Écoute la collection "prospects" en temps réel.
export function useProspects() {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, PROSPECTS_COLLECTION),
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        setProspects(rows)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Erreur d'écoute Firestore (prospects):", err)
        setError(err)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  return { prospects, loading, error }
}

// Ajoute une nouvelle ligne vide, prête à être remplie directement dans le tableau.
export async function addProspectRow() {
  return addDoc(collection(db, PROSPECTS_COLLECTION), {
    ...emptyProspect,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// Met à jour un seul champ d'une ligne (édition directe dans le tableau).
export async function updateProspectField(id, field, value) {
  return updateDoc(doc(db, PROSPECTS_COLLECTION, id), {
    [field]: value,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProspect(id) {
  return deleteDoc(doc(db, PROSPECTS_COLLECTION, id))
}
