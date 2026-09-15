import { Trash2 } from "lucide-react"

// Équivalent du DeleteGuardButton de FleetGest : demande toujours
// confirmation avant de supprimer, avec le libellé de l'élément concerné.
export default function DeleteGuardButton({ label, onDelete, className, style }) {
  function handleClick(e) {
    e.stopPropagation()
    const ok = window.confirm(`Supprimer ${label} ?\n\nCette action est irréversible.`)
    if (ok) onDelete()
  }

  return (
    <button onClick={handleClick} className={className} style={style} title="Supprimer">
      <Trash2 size={14} />
    </button>
  )
}
