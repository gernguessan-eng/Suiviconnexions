import { useState } from "react"
import { usePresenceContext } from "../context/PresenceContext"
import TopBar from "../components/TopBar"
import KpiCard from "../components/KpiCard"
import { SetupBanner, ErrorBanner } from "../components/Banners"
import {
  countConnectedUsers,
  countConnectionsToday,
  countConnectedEntreprises,
  averageDurationTodayMs,
  withDuration,
  isStaleSession,
  STALE_SESSION_MS,
} from "../utils/presenceStats"
import { formatDuration, formatTime } from "../utils/date"
import { closeSession, deleteSession } from "../utils/presenceActions"

export default function UtilisateursConnectes() {
  const { docs, loading, error, lastSync } = usePresenceContext()
  const [closingId, setClosingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const onlineUsers = withDuration(docs.filter((d) => d.isOnline)).sort(
    (a, b) => b.connectedAt - a.connectedAt
  )

  async function handleClose(id) {
    setClosingId(id)
    try {
      await closeSession(id)
    } catch (err) {
      console.error("Impossible de clôturer la session", err)
      alert("Impossible de clôturer cette session : " + err.message)
    } finally {
      setClosingId(null)
    }
  }

  async function handleDelete(u) {
    const ok = window.confirm(
      `Supprimer définitivement la session de ${u.userName} (${formatTime(u.connectedAt)}) ?\n\nCette action est irréversible.`
    )
    if (!ok) return
    setDeletingId(u.id)
    try {
      await deleteSession(u.id)
    } catch (err) {
      console.error("Impossible de supprimer la session", err)
      alert("Impossible de supprimer cette session : " + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <TopBar
        title="Utilisateurs connectés"
        subtitle="Vue en direct de l'activité de connexion — synchronisée avec Firestore"
        lastSync={lastSync}
      />

      <SetupBanner />
      <ErrorBanner error={error} />

      <div className="kpi-grid">
        <KpiCard
          icon="👤"
          label="Utilisateurs connectés"
          value={loading ? "—" : countConnectedUsers(docs)}
          accent="var(--accent-live)"
        />
        <KpiCard
          icon="📅"
          label="Connexions aujourd'hui"
          value={loading ? "—" : countConnectionsToday(docs)}
          accent="var(--accent-info)"
        />
        <KpiCard
          icon="🏢"
          label="Entreprises connectées"
          value={loading ? "—" : countConnectedEntreprises(docs)}
          accent="var(--accent-warn)"
        />
        <KpiCard
          icon="⏱"
          label="Temps moyen de connexion (aujourd'hui)"
          value={loading ? "—" : formatDuration(averageDurationTodayMs(docs))}
          accent="var(--accent-alert)"
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Actuellement en ligne</h2>
          <span className="panel-meta">{onlineUsers.length} session(s) active(s)</span>
        </div>

        {onlineUsers.some(isStaleSession) && (
          <div className="banner setup" style={{ marginBottom: 16 }}>
            ⚠ Une ou plusieurs sessions sont "Connecté" depuis plus de{" "}
            {formatDuration(STALE_SESSION_MS)} — probablement des déconnexions jamais enregistrées
            côté application (onglet fermé, crash, coupure réseau). Vous pouvez les clôturer
            manuellement ci-dessous.
          </div>
        )}

        {loading ? (
          <div className="spinner-row">Connexion à Firestore…</div>
        ) : onlineUsers.length === 0 ? (
          <div className="empty-state">Aucun utilisateur connecté pour le moment.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Entreprise</th>
                <th>Application</th>
                <th>Rôle</th>
                <th>Connecté depuis</th>
                <th>Durée</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {onlineUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.userName}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{u.userEmail}</div>
                  </td>
                  <td>{u.entrepriseName}</td>
                  <td>
                    <span className="tag info">{u.application}</span>
                  </td>
                  <td>{u.role}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{formatTime(u.connectedAt)}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>
                    {formatDuration(u.durationMs)}
                    {isStaleSession(u) && (
                      <div style={{ fontSize: 10.5, color: "var(--accent-warn)", marginTop: 2 }}>
                        ⚠ probablement fantôme
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="tag online">● {u.statut}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleClose(u.id)}
                        disabled={closingId === u.id || deletingId === u.id}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--panel-border-soft)",
                          borderRadius: 6,
                          color: "var(--text-muted)",
                          fontSize: 11.5,
                          padding: "5px 10px",
                          cursor: closingId === u.id ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {closingId === u.id ? "…" : "Clôturer"}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={closingId === u.id || deletingId === u.id}
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(240, 97, 107, 0.3)",
                          borderRadius: 6,
                          color: "var(--accent-alert)",
                          fontSize: 11.5,
                          padding: "5px 10px",
                          cursor: deletingId === u.id ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {deletingId === u.id ? "…" : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

