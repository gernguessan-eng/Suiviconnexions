import { Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import LoginScreen from "./components/LoginScreen"
import UtilisateursConnectes from "./pages/UtilisateursConnectes"
import HistoriqueConnexions from "./pages/HistoriqueConnexions"
import Entreprises from "./pages/Entreprises"
import Statistiques from "./pages/Statistiques"
import Alertes from "./pages/Alertes"
import CarnetAdresses from "./pages/CarnetAdresses"
import Comptes from "./pages/Comptes"
import Prospects from "./pages/Prospects"
import { PresenceProvider, usePresenceContext } from "./context/PresenceContext"
import { countConnectedUsers } from "./utils/presenceStats"
import { useAuth, logout } from "./hooks/useAuth"

function Shell({ user }) {
  // Un seul flux temps réel partagé par toute l'application : la sidebar
  // et chaque page restent synchronisées instantanément avec Firestore.
  const { docs } = usePresenceContext()
  const connectedCount = countConnectedUsers(docs)

  return (
    <div className="app-shell">
      <Sidebar connectedCount={connectedCount} user={user} />
      <main className="main">
        <Routes>
          <Route path="/" element={<UtilisateursConnectes />} />
          <Route path="/historique" element={<HistoriqueConnexions />} />
          <Route path="/entreprises" element={<Entreprises />} />
          <Route path="/statistiques" element={<Statistiques />} />
          <Route path="/alertes" element={<Alertes />} />
          <Route path="/carnet-adresses" element={<CarnetAdresses />} />
          <Route path="/comptes" element={<Comptes />} />
          <Route path="/prospects" element={<Prospects />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  const { user, role, isAuthorized, checking } = useAuth()

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-faint)",
          fontSize: 13,
        }}
      >
        Vérification de la connexion…
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  if (!isAuthorized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            maxWidth: 400,
            textAlign: "center",
            background: "var(--panel)",
            border: "1px solid var(--panel-border-soft)",
            borderRadius: "var(--radius-lg)",
            padding: 32,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
          <div className="brand-mark" style={{ marginBottom: 10 }}>Accès refusé</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13.5, marginBottom: 6 }}>
            Le compte <strong>{user.email}</strong> n'a pas accès à RISE Presence
            {role ? ` (rôle actuel : ${role})` : " (aucun profil trouvé)"}.
          </div>
          <div style={{ color: "var(--text-faint)", fontSize: 12, marginBottom: 20 }}>
            Cet outil est réservé aux comptes internes RISE SASU. Si vous pensez qu'il s'agit
            d'une erreur, contactez votre administrateur.
          </div>
          <button
            onClick={() => logout()}
            style={{
              background: "var(--accent-live-dim)",
              color: "var(--accent-live)",
              border: "1px solid rgba(47, 217, 166, 0.3)",
              borderRadius: 8,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <PresenceProvider>
      <Shell user={user} />
    </PresenceProvider>
  )
}


