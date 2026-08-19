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
import { CONTACTS_COLLECTION } from "../config/contactsSchema"

// Écoute la collection "contacts" en temps réel : toute création,
// modification ou suppression se reflète instantanément dans l'app,
// y compris si plusieurs personnes utilisent le carnet en même temps.
export function useContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, CONTACTS_COLLECTION),
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        setContacts(rows)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Erreur d'écoute Firestore (contacts):", err)
        setError(err)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  return { contacts, loading, error }
}

export async function addContact(data) {
  return addDoc(collection(db, CONTACTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateContact(id, data) {
  return updateDoc(doc(db, CONTACTS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteContact(id) {
  return deleteDoc(doc(db, CONTACTS_COLLECTION, id))
}
