import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react"

// Bouton de bascule "plus récent d'abord" / "plus ancien d'abord",
// réutilisé sur les pages Historique des connexions et Comptes.
export default function SortToggleButton({ order, onToggle }) {
  const isDesc = order === "desc"
  return (
    <button
      onClick={onToggle}
      className="btn"
      style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
    >
      {isDesc ? <ArrowDownNarrowWide size={14} /> : <ArrowUpNarrowWide size={14} />}
      {isDesc ? "Plus récent d'abord" : "Plus ancien d'abord"}
    </button>
  )
}
