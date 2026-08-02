import { firebaseConfig } from "../firebaseConfig"

export function SetupBanner() {
  const notConfigured = String(firebaseConfig.apiKey || "").includes("REMPLACER")
  if (!notConfigured) return null
  return (
    <div className="banner setup">
      ⚠ Configuration Firebase manquante — ouvrez <code>src/firebaseConfig.js</code> et remplacez
      les valeurs par celles de votre projet <strong>riseappli-prod</strong> (Console Firebase → Paramètres
      du projet → Vos applications). Le tableau de bord affichera des données dès que c'est fait.
    </div>
  )
}

export function ErrorBanner({ error, collection = "presence" }) {
  if (!error) return null
  const isPermission = error.code === "permission-denied"
  return (
    <div className="banner error">
      ⚠ Impossible de lire la collection <code>{collection}</code>
      {isPermission
        ? " : accès refusé par les règles de sécurité Firestore. Consultez FIRESTORE_RULES.md."
        : ` : ${error.message}`}
    </div>
  )
}
