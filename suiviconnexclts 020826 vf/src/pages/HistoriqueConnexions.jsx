import { useMemo, useState } from "react"
import { usePresenceContext } from "../context/PresenceContext"
import TopBar from "../components/TopBar"
import { SetupBanner, ErrorBanner } from "../components/Banners"
import SortToggleButton from "../components/SortToggleButton"
import { withDuration } from "../utils/presenceStats"
import { formatDateTime, formatDuration, formatTime } from "../utils/date"
import { deleteSession } from "../utils/presenceActions"

export default function HistoriqueConnexions() {
  const { docs, loading, error, lastSync } = usePresenceContext()
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState(null)
  const [sortOrder, setSortOrder] = useState("desc")

  const rows = useMemo(() => {
    const withDur = withDuration(docs).sort((a, b) =>
      sortOrder === "desc" ? b.connectedAt - a.connectedAt : a.connectedAt - b.connectedAt
    )
    if (!search.trim()) return withDur
    const q = search.toLowerCase()
    return withDur.filter(
      (d) =>
        d.userName.toLowerCase().includes(q) ||
        d.entrepriseName.toLowerCase().includes(q) ||
        d.userEmail.toLowerCase().includes(q)
    )
  }, [docs, search, sortOrder])

  async function handleDelete(d) {
    const ok = window.confirm(
      `Supprimer définitivement la session de ${d.userName} (${formatTime(d.connectedAt)}) ?\n\nCette action est irréversible.`
    )
    if (!ok) return
    setDeletingId(d.id)
    try {
      await deleteSession(d.id)
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
        title="Historique des connexions"
        subtitle="Toutes les sessions enregistrées dans la collection presence"
        lastSync={lastSync}
      />

      <SetupBanner />
      <ErrorBanner error={error} />

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Journal des sessions</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <SortToggleButton order={sortOrder} onToggle={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur ou une entreprise…"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--panel-border-soft)",
                borderRadius: 8,
                padding: "7px 12px",
                color: "var(--text-primary)",
                fontSize: 13,
                width: 260,
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="spinner-row">Chargement de l'historique…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">Aucune session trouvée.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Entreprise</th>
                <th>Application</th>
                <th>Connexion</th>
                <th>Déconnexion</th>
                <th>Durée</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.userName}</td>
                  <td>{d.entrepriseName}</td>
                  <td>
                    <span className="tag info">{d.application}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{formatDateTime(d.connectedAt)}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>
                    {d.disconnectedAt ? formatDateTime(d.disconnectedAt) : "—"}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{formatDuration(d.durationMs)}</td>
                  <td>
                    <span className={"tag " + (d.isOnline ? "online" : "offline")}>
                      {d.isOnline ? "● en ligne" : "hors ligne"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(d)}
                      disabled={deletingId === d.id}
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(240, 97, 107, 0.3)",
                        borderRadius: 6,
                        color: "var(--accent-alert)",
                        fontSize: 11.5,
                        padding: "5px 10px",
                        cursor: deletingId === d.id ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {deletingId === d.id ? "…" : "Supprimer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {rows.length > 200 && (
          <div className="panel-meta" style={{ marginTop: 10 }}>
            Affichage des 200 sessions les plus récentes sur {rows.length}. Affinez votre recherche
            pour en voir davantage.
          </div>
        )}
      </div>
    </>
  )
}
