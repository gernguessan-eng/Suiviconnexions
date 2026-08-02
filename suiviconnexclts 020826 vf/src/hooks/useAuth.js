import { useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { auth, db } from "../firebase"
import { USERS_COLLECTION, FIELDS, RISE_PRESENCE_ALLOWED_ROLES } from "../config/presenceSchema"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [checking, setChecking] = useState(true)
  const [checkingRole, setCheckingRole] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setChecking(false)
      if (!u) {
        setRole(null)
        setCheckingRole(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // Dès qu'un compte est authentifié, on va vérifier son rôle dans Firestore
  // (users/{uid}) : RISE Presence n'est pas destiné aux comptes clients
  // (FleetGest partage le même projet Firebase / le même annuaire de comptes).
  useEffect(() => {
    if (!user) return
    setCheckingRole(true)
    const unsubscribe = onSnapshot(
      doc(db, USERS_COLLECTION, user.uid),
      (snap) => {
        setRole(snap.exists() ? snap.data()[FIELDS.role] : null)
        setCheckingRole(false)
      },
      () => {
        setRole(null)
        setCheckingRole(false)
      }
    )
    return () => unsubscribe()
  }, [user])

  const isAuthorized = user && RISE_PRESENCE_ALLOWED_ROLES.includes(role)

  return { user, role, isAuthorized, checking: checking || checkingRole }
}

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider())
}

export async function logout() {
  return signOut(auth)
}

