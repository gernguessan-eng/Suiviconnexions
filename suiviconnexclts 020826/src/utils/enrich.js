import { DEFAULT_ENTREPRISE } from "../config/presenceSchema"

// Rattache chaque session de présence à son entreprise, via :
//   presence.uid → users/{uid}.entrepriseId → entreprises/{entrepriseId}.name
// Si l'utilisateur n'a pas encore d'entrepriseId (cas actuel), on le
// rattache à l'entreprise par défaut (RISE SASU) au lieu de le laisser
// "sans entreprise".
export function enrichWithEntreprise(presenceDocs, users, entreprises) {
  const usersByUid = new Map(users.map((u) => [u.uid, u]))
  const entreprisesById = new Map(entreprises.map((e) => [e.id, e]))

  return presenceDocs.map((p) => {
    const user = usersByUid.get(p.userId)
    const entrepriseId = user?.entrepriseId || DEFAULT_ENTREPRISE.id
    const entreprise = entreprisesById.get(entrepriseId)
    const entrepriseName =
      entreprise?.name ?? (entrepriseId === DEFAULT_ENTREPRISE.id ? DEFAULT_ENTREPRISE.name : "Entreprise inconnue")
    return { ...p, entrepriseId, entrepriseName }
  })
}

// Liste complète des entreprises à afficher : celles créées dans Firestore,
// plus l'entreprise par défaut (toujours présente, même sans document).
export function allEntreprisesWithDefault(entreprises) {
  const hasDefault = entreprises.some((e) => e.id === DEFAULT_ENTREPRISE.id)
  return hasDefault ? entreprises : [{ ...DEFAULT_ENTREPRISE, createdAt: null }, ...entreprises]
}
