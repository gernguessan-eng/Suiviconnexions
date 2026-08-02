import { useEffect, useState } from "react"
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"
import { ENTREPRISES_COLLECTION } from "../config/presenceSchema"

// Écoute la collection "entreprises" en temps réel. Vide au départ (vous
// n'en avez pas encore créé) : c'est normal, RISE SASU s'affiche quand
// même grâce à l'entreprise par défaut définie dans presenceSchema.js.
export function useEntreprises() {
  const [entreprises, setEntreprises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, ENTREPRISES_COLLECTION),
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          name: docSnap.data().name ?? "(sans nom)",
          createdAt: docSnap.data().createdAt ?? null,
        }))
        setEntreprises(rows)
        setLoading(false)
      },
      (err) => {
        console.error("Erreur d'écoute Firestore (entreprises):", err)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  return { entreprises, loading }
}

// Crée une nouvelle entreprise dans Firestore. Elle apparaîtra
// automatiquement dans toute l'application dès la création (temps réel).
export async function createEntreprise(name) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Le nom de l'entreprise est vide.")
  return addDoc(collection(db, ENTREPRISES_COLLECTION), {
    name: trimmed,
    createdAt: serverTimestamp(),
  })
}
