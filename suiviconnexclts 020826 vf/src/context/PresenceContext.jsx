import { createContext, useContext, useMemo } from "react"
import { usePresence } from "../hooks/usePresence"
import { useUsers } from "../hooks/useUsers"
import { useEntreprises } from "../hooks/useEntreprises"
import { enrichWithEntreprise, allEntreprisesWithDefault } from "../utils/enrich"

const PresenceContext = createContext(null)

export function PresenceProvider({ children }) {
  const { docs: presenceDocs, loading: presenceLoading, error, lastSync } = usePresence()
  const { users, loading: usersLoading } = useUsers()
  const { entreprises, loading: entreprisesLoading } = useEntreprises()

  // Jointure presence → users → entreprises, recalculée à chaque mise à
  // jour temps réel de n'importe laquelle des trois collections.
  const docs = useMemo(
    () => enrichWithEntreprise(presenceDocs, users, entreprises),
    [presenceDocs, users, entreprises]
  )

  const entreprisesDisplay = useMemo(() => allEntreprisesWithDefault(entreprises), [entreprises])

  const loading = presenceLoading || usersLoading || entreprisesLoading

  const value = {
    docs,
    loading,
    error,
    lastSync,
    users,
    entreprises: entreprisesDisplay,
  }

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
}

// À utiliser dans les pages : un seul abonnement onSnapshot par collection
// est partagé par toute l'application (pas de doublons).
export function usePresenceContext() {
  const ctx = useContext(PresenceContext)
  if (!ctx) {
    throw new Error("usePresenceContext doit être utilisé à l'intérieur de <PresenceProvider>")
  }
  return ctx
}
