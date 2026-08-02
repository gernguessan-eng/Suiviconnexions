import { NavLink } from "react-router-dom"
import { logout } from "../hooks/useAuth"

const NAV_ITEMS = [
  { to: "/", label: "Utilisateurs connectés", icon: "●" },
  { to: "/historique", label: "Historique des connexions", icon: "◷" },
  { to: "/entreprises", label: "Entreprises", icon: "▦" },
  { to: "/statistiques", label: "Statistiques", icon: "▲" },
  { to: "/alertes", label: "Alertes", icon: "!" },
  { to: "/carnet-adresses", label: "Carnet d'adresses", icon: "▤" },
  { to: "/comptes", label: "Comptes", icon: "◉" },
  { to: "/prospects", label: "Prospects", icon: "★" },
]

export default function Sidebar({ connectedCount, user }) {
  return (
    <aside className="sidebar no-print">
      <div className="brand">
        <div className="brand-mark">RISE · PRESENCE</div>
        <div className="brand-sub">riseappli-prod</div>
      </div>

      <ul className="nav-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span className={"pulse-dot" + (connectedCount > 0 ? "" : " offline")} />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>
            {connectedCount > 0 ? "Flux temps réel actif" : "Aucune connexion en direct"}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
          Synchronisé avec Firestore
        </div>

        {user && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--panel-border-soft)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: 6,
              }}
            >
              {user.email}
            </div>
            <button
              onClick={() => logout()}
              style={{
                background: "transparent",
                border: "1px solid var(--panel-border-soft)",
                borderRadius: 6,
                color: "var(--text-faint)",
                fontSize: 11.5,
                padding: "5px 10px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

