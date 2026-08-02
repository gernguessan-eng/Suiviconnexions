// ─────────────────────────────────────────────────────────────────────────
// SCHÉMA DU CARNET D'ADRESSES
// ─────────────────────────────────────────────────────────────────────────
// Repris du modèle FleetGest fourni, adapté à ce projet (collection Firestore
// dédiée "contacts", temps réel comme le reste de l'app).
// ─────────────────────────────────────────────────────────────────────────

export const CONTACTS_COLLECTION = "contacts"

export const TYPE_OPTIONS = [
  "Fournisseur",
  "Garage",
  "Assureur",
  "Client",
  "Partenaire",
  "Administration",
  "Chauffeur",
  "Autre",
]

// Couleur d'accent par type de contact (réutilise la palette du thème sombre
// existant + deux teintes supplémentaires pour couvrir les 8 catégories).
export const TYPE_STYLES = {
  Fournisseur: { color: "var(--accent-info)", bg: "var(--accent-info-dim)" },
  Garage: { color: "var(--accent-warn)", bg: "var(--accent-warn-dim)" },
  Assureur: { color: "var(--accent-live)", bg: "var(--accent-live-dim)" },
  Client: { color: "var(--accent-purple)", bg: "var(--accent-purple-dim)" },
  Partenaire: { color: "var(--accent-pink)", bg: "var(--accent-pink-dim)" },
  Administration: { color: "var(--text-muted)", bg: "rgba(138, 153, 168, 0.12)" },
  Chauffeur: { color: "var(--accent-orange)", bg: "var(--accent-orange-dim)" },
  Autre: { color: "var(--text-faint)", bg: "rgba(86, 98, 112, 0.14)" },
}

export const emptyContact = {
  type_contact: "Fournisseur",
  civilite: "",
  nom: "",
  prenom: "",
  societe: "",
  fonction: "",
  telephone: "",
  telephone_secondaire: "",
  email: "",
  adresse: "",
  ville: "",
  pays: "Côte d'Ivoire",
  site_web: "",
  notes: "",
  date_creation: new Date().toISOString().slice(0, 10),
}
