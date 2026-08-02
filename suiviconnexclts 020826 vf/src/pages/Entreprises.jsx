import { useState } from "react"
import { usePresenceContext } from "../context/PresenceContext"
import TopBar from "../components/TopBar"
import { SetupBanner, ErrorBanner } from "../components/Banners"
import { groupByEntreprise, groupByUser, withDuration } from "../utils/presenceStats"
import { formatDateTime, formatDuration } from "../utils/date"
import { createEntreprise } from "../hooks/useEntreprises"
import { assignUserEntreprise } from "../hooks/useUsers"
import { DEFAULT_ENTREPRISE } from "../config/presenceSchema"

const inputStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--panel-border-soft)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "var(--text-primary)",
  fontSize: 13,
}

export default function Entreprises() {
  const { docs, loading, error, lastSync, users, entreprises } = usePresenceContext()

  const stats = groupByEntreprise(docs)
  const statsById = new Map(stats.map((s) => [s.entrepriseId, s]))

  // Toutes les entreprises connues (y compris celles tout juste créées, sans
  // encore aucun utilisateur/session) fusionnées avec leurs statistiques.
  const rows = entreprises.map((e) => {
    const s = statsById.get(e.id)
    return {
      entrepriseId: e.id,
      entrepriseName: e.name,
      usersOnlineCount: s?.usersOnlineCount ?? 0,
      usersTotalCount: s?.usersTotalCount ?? 0,
      totalSessions: s?.totalSessions ?? 0,
      lastActivity: s?.lastActivity ?? null,
    }
  })

  return (
    <>
      <TopBar
        title="Entreprises"
        subtitle="Activité de connexion agrégée par entreprise cliente"
        lastSync={lastSync}
      />

      <SetupBanner />
      <ErrorBanner error={error} />

      <CreateEntrepriseForm />

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Entreprises clientes</h2>
          <span className="panel-meta">{rows.length} entreprise(s)</span>
        </div>

        {loading ? (
          <div className="spinner-row">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">Aucune entreprise pour le moment.</div>
        ) : (
          <div className="entreprise-grid">
            {rows.map((e) => (
              <div className="entreprise-card" key={e.entrepriseId}>
                <div className="name">
                  {e.entrepriseName}{" "}
                  {e.usersOnlineCount > 0 && <span className="pulse-dot" style={{ marginLeft: 4 }} />}
                </div>
                <div className="entreprise-stat-row">
                  <span>En ligne actuellement</span>
                  <span>{e.usersOnlineCount}</span>
                </div>
                <div className="entreprise-stat-row">
                  <span>Utilisateurs distincts</span>
                  <span>{e.usersTotalCount}</span>
                </div>
                <div className="entreprise-stat-row">
                  <span>Sessions totales</span>
                  <span>{e.totalSessions}</span>
                </div>
                <div className="entreprise-stat-row">
                  <span>Dernière activité</span>
                  <span>{e.lastActivity ? formatDateTime(e.lastActivity) : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UserAnalysisPanel docs={docs} loading={loading} />

      <AssignUsersPanel users={users} entreprises={entreprises} />
    </>
  )
}

function UserAnalysisPanel({ docs, loading }) {
  const userRows = groupByUser(withDuration(docs))
  const onlineCount = userRows.filter((u) => u.isOnline).length

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Analyse des utilisateurs connectés</h2>
        <span className="panel-meta">
          {userRows.length} utilisateur(s) au total · {onlineCount} en ligne
        </span>
      </div>

      {loading ? (
        <div className="spinner-row">Chargement…</div>
      ) : userRows.length === 0 ? (
        <div className="empty-state">Aucune activité de connexion pour le moment.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Entreprise</th>
              <th>Rôle</th>
              <th>Application</th>
              <th>Statut</th>
              <th>Dernière connexion</th>
              <th>Sessions</th>
              <th>Temps total connecté</th>
            </tr>
          </thead>
          <tbody>
            {userRows.map((u) => (
              <tr key={u.userId}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.userName}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{u.userEmail}</div>
                </td>
                <td>{u.entrepriseName}</td>
                <td>{u.role}</td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {u.applications.length > 0 ? (
                      u.applications.map((app) => (
                        <span key={app} className="tag info">{app}</span>
                      ))
                    ) : (
                      <span style={{ color: "var(--text-faint)" }}>—</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={"tag " + (u.isOnline ? "online" : "offline")}>
                    {u.isOnline ? "● en ligne" : "hors ligne"}
                  </span>
                </td>
                <td style={{ fontFamily: "var(--font-mono)" }}>
                  {u.lastConnection ? formatDateTime(u.lastConnection) : "—"}
                </td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{u.totalSessions}</td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{formatDuration(u.totalDurationMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function CreateEntrepriseForm() {
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMsg(null)
    setBusy(true)
    try {
      await createEntreprise(name)
      setName("")
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Ajouter une entreprise</h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de l'entreprise (ex : Acme Transport)"
          style={{ ...inputStyle, flex: "1 1 260px" }}
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          style={{
            ...inputStyle,
            background: "var(--accent-live-dim)",
            color: "var(--accent-live)",
            fontWeight: 600,
            cursor: busy || !name.trim() ? "not-allowed" : "pointer",
            border: "1px solid rgba(47, 217, 166, 0.3)",
          }}
        >
          {busy ? "Création…" : "+ Ajouter"}
        </button>
      </form>
      {errorMsg && (
        <div style={{ color: "var(--accent-alert)", fontSize: 12, marginTop: 8 }}>{errorMsg}</div>
      )}
      <div className="panel-meta" style={{ marginTop: 10 }}>
        Apparaît instantanément dans la liste ci-dessous et dans le sélecteur d'assignation.
      </div>
    </div>
  )
}

function AssignUsersPanel({ users, entreprises }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Assigner les utilisateurs à une entreprise</h2>
        <span className="panel-meta">{users.length} utilisateur(s)</span>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">Aucun utilisateur trouvé dans la collection users.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Entreprise</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.uid} user={u} entreprises={entreprises} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function UserRow({ user, entreprises }) {
  const [saving, setSaving] = useState(false)
  const currentValue = user.entrepriseId || DEFAULT_ENTREPRISE.id

  async function handleChange(e) {
    setSaving(true)
    try {
      await assignUserEntreprise(user.uid, e.target.value)
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600 }}>{user.displayName}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{user.email}</div>
      </td>
      <td>{user.role}</td>
      <td>
        <select
          value={currentValue}
          onChange={handleChange}
          disabled={saving}
          style={{ ...inputStyle, padding: "6px 10px" }}
        >
          {entreprises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </td>
    </tr>
  )
}
