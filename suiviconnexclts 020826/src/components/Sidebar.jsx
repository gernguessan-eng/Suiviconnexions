import { useState } from "react"
import { NavLink } from "react-router-dom"
import { GripVertical, ChevronUp, ChevronDown, LayoutGrid, Check } from "lucide-react"
import { logout } from "../hooks/useAuth"
import { usePersistedState } from "../hooks/usePersistedState"

const DEFAULT_NAV_ITEMS = [
  { to: "/", label: "Utilisateurs connectés", icon: "●" },
  { to: "/historique", label: "Historique des connexions", icon: "◷" },
  { to: "/entreprises", label: "Entreprises", icon: "▦" },
  { to: "/statistiques", label: "Statistiques", icon: "▲" },
  { to: "/alertes", label: "Alertes", icon: "!" },
  { to: "/carnet-adresses", label: "Carnet d'adresses", icon: "▤" },
  { to: "/comptes", label: "Comptes", icon: "◉" },
  { to: "/prospects", label: "Prospects", icon: "★" },
]

function moveItem(list, fromIndex, toIndex) {
  const copy = [...list]
  const [item] = copy.splice(fromIndex, 1)
  copy.splice(toIndex, 0, item)
  return copy
}

// Réconcilie l'ordre enregistré (juste une liste de chemins) avec la liste
// réelle des menus : garde l'ordre choisi, ajoute à la fin tout nouveau menu
// pas encore connu, et retire ceux qui n'existent plus.
function reconcileOrder(savedPaths) {
  const known = new Map(DEFAULT_NAV_ITEMS.map((i) => [i.to, i]))
  const ordered = savedPaths.map((p) => known.get(p)).filter(Boolean)
  const missing = DEFAULT_NAV_ITEMS.filter((i) => !savedPaths.includes(i.to))
  return [...ordered, ...missing]
}

export default function Sidebar({ connectedCount, user }) {
  const [savedOrder, setSavedOrder] = usePersistedState(
    "rise_sidebar_order",
    DEFAULT_NAV_ITEMS.map((i) => i.to)
  )
  const [reordering, setReordering] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)

  const items = reconcileOrder(savedOrder)

  function persist(newItems) {
    setSavedOrder(newItems.map((i) => i.to))
  }

  function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    persist(moveItem(items, index, target))
  }

  function handleDrop(index) {
    if (dragIndex === null || dragIndex === index) return
    persist(moveItem(items, dragIndex, index))
    setDragIndex(null)
  }

  return (
    <aside className="sidebar no-print">
      <div className="brand">
        <div className="brand-mark">RISE · PRESENCE</div>
        <div className="brand-sub">riseappli-prod</div>
      </div>

      <button
        onClick={() => setReordering(!reordering)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: reordering ? "var(--accent-live-dim)" : "var(--panel)",
          border: `1px solid ${reordering ? "rgba(47, 217, 166, 0.3)" : "var(--panel-border-soft)"}`,
          color: reordering ? "var(--accent-live)" : "var(--text-muted)",
          borderRadius: 8,
          padding: "8px 10px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          margin: "0 8px",
        }}
      >
        {reordering ? <Check size={14} /> : <LayoutGrid size={14} />}
        {reordering ? "Terminer le réaménagement" : "Réaménager les onglets"}
      </button>

      <ul className="nav-list">
        {items.map((item, index) =>
          reordering ? (
            <li
              key={item.to}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="nav-item nav-item-reorder"
            >
              <span className="nav-icon" style={{ cursor: "grab", color: "var(--text-faint)" }}>
                <GripVertical size={15} />
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="nav-reorder-btn"
                  title="Monter"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="nav-reorder-btn"
                  title="Descendre"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </li>
          ) : (
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
          )
        )}
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
