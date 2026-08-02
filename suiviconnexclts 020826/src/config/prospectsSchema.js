export const PROSPECTS_COLLECTION = "prospects"

export const PROSPECTEE_OPTIONS = ["Oui", "Non"]
export const DEMO_VIA_OPTIONS = ["Teams", "Présentiel", "Autres"]
export const RDV_OPTIONS = ["Déjà obtenu", "En attente", "Programmé"]

export const RDV_STYLES = {
  "Déjà obtenu": { color: "var(--accent-live)", bg: "var(--accent-live-dim)" },
  "En attente": { color: "var(--accent-warn)", bg: "var(--accent-warn-dim)" },
  "Programmé": { color: "var(--accent-info)", bg: "var(--accent-info-dim)" },
}

export const emptyProspect = {
  entreprise: "",
  prospectee: "Non",
  demoVia: "Teams",
  dateDemo: "",
  rdv: "En attente",
  notes: "",
}
