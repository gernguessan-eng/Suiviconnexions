import { useState } from "react"
import { loginWithEmail, loginWithGoogle } from "../hooks/useAuth"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await loginWithEmail(email, password)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setBusy(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--panel)",
          border: "1px solid var(--panel-border-soft)",
          borderRadius: "var(--radius-lg)",
          padding: 32,
        }}
      >
        <div className="brand-mark" style={{ marginBottom: 4 }}>
          RISE · PRESENCE
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 26 }}>
          Connectez-vous avec votre compte R.I.S.E pour accéder au tableau de bord.
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={fieldStyle}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            style={fieldStyle}
          />
          <button type="submit" disabled={busy} style={primaryButtonStyle}>
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--panel-border-soft)" }} />
          <span style={{ color: "var(--text-faint)", fontSize: 11 }}>OU</span>
          <div style={{ flex: 1, height: 1, background: "var(--panel-border-soft)" }} />
        </div>

        <button onClick={handleGoogle} disabled={busy} style={secondaryButtonStyle}>
          Continuer avec Google
        </button>

        {error && (
          <div style={{ color: "var(--accent-alert)", fontSize: 12.5, marginTop: 16 }}>{error}</div>
        )}
      </div>
    </div>
  )
}

const fieldStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--panel-border-soft)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "var(--text-primary)",
  fontSize: 13.5,
}

const primaryButtonStyle = {
  ...fieldStyle,
  background: "var(--accent-live-dim)",
  color: "var(--accent-live)",
  fontWeight: 600,
  border: "1px solid rgba(47, 217, 166, 0.3)",
  cursor: "pointer",
  marginTop: 4,
}

const secondaryButtonStyle = {
  ...fieldStyle,
  width: "100%",
  cursor: "pointer",
  fontWeight: 500,
}

function friendlyError(err) {
  const code = err?.code || ""
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Email ou mot de passe incorrect."
  }
  if (code.includes("too-many-requests")) {
    return "Trop de tentatives. Réessayez dans un instant."
  }
  if (code.includes("popup-closed-by-user")) {
    return null
  }
  return "Connexion impossible : " + (err?.message || "erreur inconnue")
}
