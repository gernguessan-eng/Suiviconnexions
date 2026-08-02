import { useEffect, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase"
import { ALERTES_COLLECTION } from "../config/presenceSchema"
import { toDate } from "../utils/date"

// Écoute une collection Firestore optionnelle "alertes". Si elle n'existe
// pas encore ou est vide, renvoie simplement un tableau vide (pas d'erreur) :
// la page Alertes utilisera alors les alertes calculées automatiquement.
export function useAlertesCollection() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, ALERTES_COLLECTION),
      (snapshot) => {
        const rows = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            severity: data.severity ?? "info",
            title: data.title ?? "Alerte",
            description: data.description ?? "",
            date: toDate(data.date ?? data.createdAt) ?? new Date(),
          }
        })
        setAlerts(rows)
        setLoading(false)
      },
      () => {
        // Collection absente ou inaccessible : on se rabat sur le calcul local
        setAlerts([])
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  return { alerts, loading }
}
