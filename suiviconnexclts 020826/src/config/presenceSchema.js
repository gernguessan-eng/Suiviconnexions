// ─────────────────────────────────────────────────────────────────────────
// SCHÉMA DE LA COLLECTION "presence"
// ─────────────────────────────────────────────────────────────────────────
// Un document "presence" ressemble à ceci (confirmé via la console Firebase) :
//
// {
//   connexion:    Timestamp,
//   deconnexion:  Timestamp,
//   displayName:  "Animateur",
//   email:        "gernguessan@gmail.com",
//   role:         "Administrateur",
//   statut:       "Connecté" | "Déconnecté",
//   uid:          "b9IRWAZvhAdLFYCUtwsi2ImBPy52",
// }
//
// L'entreprise n'est pas stockée dans "presence" mais dans "users" :
//
// users/{uid} = {
//   displayName, email, role, uid, createdAt, updatedAt,
//   entrepriseId: "rise-sasu"   // ← champ à ajouter vous-même (voir README)
// }
//
// entreprises/{entrepriseId} = { name: "RISE SASU", createdAt }
//
// Vous n'avez pour l'instant qu'une seule entreprise (RISE SASU) et aucune
// n'existe encore dans une collection "entreprises". Tant qu'un utilisateur
// n'a pas de champ entrepriseId, l'application le rattache automatiquement
// à l'entreprise par défaut ci-dessous. Dès que vous créez d'autres
// entreprises (via le bouton "+ Ajouter une entreprise" du menu Entreprises,
// ou directement dans Firestore) et assignez des utilisateurs, tout se met
// à jour automatiquement, sans toucher au code.
// ─────────────────────────────────────────────────────────────────────────

export const PRESENCE_COLLECTION = "presence"
export const USERS_COLLECTION = "users"
export const ENTREPRISES_COLLECTION = "entreprises"
export const ALERTES_COLLECTION = "alertes" // optionnelle, voir README

export const FIELDS = {
  uid: "uid",
  userName: "displayName",
  userEmail: "email",
  role: "role",
  statut: "statut",
  connectedAt: "connexion",
  disconnectedAt: "deconnexion",
  entrepriseId: "entrepriseId", // champ à ajouter sur les documents "users"
  application: "application", // à confirmer : nom du champ dans "presence" s'il existe
}

// Valeur utilisée quand un document "presence" n'a pas de champ "application"
// (ex. anciens documents créés avant l'ajout de ce champ).
export const DEFAULT_APPLICATION = "RiseAppli"

// Valeur du champ "statut" qui signifie "actuellement en ligne".
export const STATUT_CONNECTE = "Connecté"
// Valeur utilisée pour clôturer manuellement une session depuis l'app.
export const STATUT_DECONNECTE = "Déconnecté"

// Entreprise utilisée pour tout utilisateur sans entrepriseId défini.
export const DEFAULT_ENTREPRISE = { id: "rise-sasu", name: "RISE SASU" }

// Rôles reconnus par les règles Firestore (canWrite()) et par FleetGest.
export const USER_ROLE_OPTIONS = ["Administrateur", "Agent", "Client"]

// Rôles autorisés à ouvrir RISE Presence lui-même (pas les comptes clients,
// même s'ils sont valides sur le même projet Firebase que FleetGest).
export const RISE_PRESENCE_ALLOWED_ROLES = ["Administrateur", "Agent"]


