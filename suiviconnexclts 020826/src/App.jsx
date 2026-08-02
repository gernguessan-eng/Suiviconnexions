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
import { useAuth } from "./hooks/useAuth"

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
  const { user, checking } = useAuth()

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

  return (
    <PresenceProvider>
      <Shell user={user} />
    </PresenceProvider>
  )
}


