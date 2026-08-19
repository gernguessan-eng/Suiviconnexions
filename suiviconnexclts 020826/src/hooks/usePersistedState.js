import { useEffect, useState } from "react"

// Équivalent de usePersistedState dans FleetGest : garde une valeur (ex.
// filtre, recherche) en mémoire d'une visite à l'autre via localStorage.
// Contrairement aux données métier (contacts, presence...), ce n'est que
// une préférence d'affichage locale au navigateur — aucun souci à l'utiliser
// ici (ce projet n'est pas un artifact Claude.ai, juste une vraie app web).
export function usePersistedState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // stockage indisponible (navigation privée, quota...) : on ignore
    }
  }, [key, value])

  return [value, setValue]
}
