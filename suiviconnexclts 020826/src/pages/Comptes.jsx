import { useMemo, useState } from "react"
import { UserPlus, KeyRound } from "lucide-react"
import TopBar from "../components/TopBar"
import { SetupBanner, ErrorBanner } from "../components/Banners"
import DeleteGuardButton from "../components/DeleteGuardButton"
import SortToggleButton from "../components/SortToggleButton"
import { usePresenceContext } from "../context/PresenceContext"
import { useUsers, updateUserRole, deleteUserProfile, assignUserEntreprise } from "../hooks/useUsers"
import { useEntreprises } from "../hooks/useEntreprises"
import { createUserAccount, sendPasswordReset } from "../utils/adminAccounts"
import { groupByUser, withDuration } from "../utils/presenceStats"
import { formatDateTime } from "../utils/date"
import { USER_ROLE_OPTIONS, DEFAULT_ENTREPRISE } from "../config/presenceSchema"

const inputStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--panel-border-soft)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "var(--text-primary)",
  fontSize: 13,
}

export default function Comptes() {
  const { users, loading, error } = useUsers()
  const { entreprises } = useEntreprises()
  const { docs } = usePresenceContext()
  const [showForm, setShowForm] = useState(false)
  const [sortOrder, setSortOrder] = useState("desc")

  const appsByUser = useMemo(() => {
    const rows = groupByUser(withDuration(docs))
    return new Map(rows.map((r) => [r.userId, r.applications]))
  }, [docs])

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const at = a.createdAt ? a.createdAt.getTime() : 0
      const bt = b.createdAt ? b.createdAt.getTime() : 0
      return sortOrder === "desc" ? bt - at : at - bt
    })
  }, [users, sortOrder])

  return (
    <>
      <TopBar
        title="Comptes"
        subtitle="Gérez les comptes ayant accès aux applications RISE. Chaque personne se connecte avec sa propre adresse e-mail et son propre mot de passe."
      />

      <SetupBanner />
      <ErrorBanner error={error} collection="users" />

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Comptes</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <SortToggleButton order={sortOrder} onToggle={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")} />
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <UserPlus size={15} /> Ajouter un utilisateur
            </button>
          </div>
        </div>

        {loading ? (
          <div className="spinner-row">Chargement…</div>
        ) : sortedUsers.length === 0 ? (
          <div className="empty-state">Aucun compte pour le moment.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>Entreprise</th>
                <th>Créé le</th>
                <th>Applis connectées</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u) => (
                <UserRow
                  key={u.uid}
                  user={u}
                  entreprises={entreprises}
                  applications={appsByUser.get(u.uid) || []}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <AddUserModal entreprises={entreprises} onClose={() => setShowForm(false)} />
      )}
    </>
  )
}

function UserRow({ user, entreprises, applications }) {
  const [savingRole, setSavingRole] = useState(false)
  const [savingEntreprise, setSavingEntreprise] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg] = useState(null)

  async function handleRoleChange(e) {
    setSavingRole(true)
    try {
      await updateUserRole(user.uid, e.target.value)
    } finally {
      setSavingRole(false)
    }
  }

  async function handleEntrepriseChange(e) {
    setSavingEntreprise(true)
    try {
      await assignUserEntreprise(user.uid, e.target.value)
    } finally {
      setSavingEntreprise(false)
    }
  }

  async function handleReset() {
    setResetting(true)
    setResetMsg(null)
    try {
      await sendPasswordReset(user.email)
      setResetMsg("E-mail envoyé ✓")
    } catch (err) {
      setResetMsg("Échec : " + err.message)
    } finally {
      setResetting(false)
    }
  }

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600 }}>{user.email}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{user.displayName}</div>
      </td>
      <td>
        <select
          value={user.role}
          onChange={handleRoleChange}
          disabled={savingRole}
          style={{ ...inputStyle, padding: "6px 10px" }}
        >
          {USER_ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
          {!USER_ROLE_OPTIONS.includes(user.role) && (
            <option value={user.role}>{user.role}</option>
          )}
        </select>
      </td>
      <td>
        <select
          value={user.entrepriseId || DEFAULT_ENTREPRISE.id}
          onChange={handleEntrepriseChange}
          disabled={savingEntreprise}
          style={{ ...inputStyle, padding: "6px 10px" }}
        >
          {entreprises.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </td>
      <td style={{ fontFamily: "var(--font-mono)" }}>
        {user.createdAt ? formatDateTime(user.createdAt) : "—"}
      </td>
      <td>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {applications.length > 0 ? (
            applications.map((app) => <span key={app} className="tag info">{app}</span>)
          ) : (
            <span style={{ color: "var(--text-faint)" }}>—</span>
          )}
        </div>
      </td>
      <td>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, padding: "5px 10px" }}
          >
            <KeyRound size={12} /> {resetting ? "…" : "Réinitialiser mdp"}
          </button>
          <DeleteGuardButton
            label={`le profil de ${user.email} (le compte de connexion Firebase ne sera pas supprimé)`}
            onDelete={() => deleteUserProfile(user.uid)}
            className="contact-icon-btn"
            style={{ color: "var(--accent-alert)" }}
          />
        </div>
        {resetMsg && (
          <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 4 }}>{resetMsg}</div>
        )}
      </td>
    </tr>
  )
}

function AddUserModal({ entreprises, onClose }) {
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState(USER_ROLE_OPTIONS[USER_ROLE_OPTIONS.length - 1])
  const [entrepriseId, setEntrepriseId] = useState(DEFAULT_ENTREPRISE.id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await createUserAccount({ email, displayName, role, entrepriseId })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><UserPlus size={17} /> Ajouter un utilisateur</h3>
        </div>
        <form onSubmit={handleSubmit} className="modal-form" style={{ gridTemplateColumns: "1fr" }}>
          <label>
            <span className="field-label">E-mail *</span>
            <input required type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            <span className="field-label">Nom affiché</span>
            <input className="field-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </label>
          <label>
            <span className="field-label">Rôle</span>
            <select className="field-input" value={role} onChange={(e) => setRole(e.target.value)}>
              {USER_ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label>
            <span className="field-label">Entreprise</span>
            <select className="field-input" value={entrepriseId} onChange={(e) => setEntrepriseId(e.target.value)}>
              {entreprises.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>

          <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
            Un mot de passe temporaire est généré automatiquement, et un e-mail est envoyé à
            cette adresse pour que la personne définisse elle-même son mot de passe.
          </div>

          {error && <div style={{ color: "var(--accent-alert)", fontSize: 12 }}>{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn">Annuler</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Création…" : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
