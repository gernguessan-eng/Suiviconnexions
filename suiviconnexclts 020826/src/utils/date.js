// Convertit un Timestamp Firestore, une Date, ou une chaîne en objet Date JS
export function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === "function") return value.toDate() // Firestore Timestamp
  if (typeof value === "number") return new Date(value)
  if (typeof value === "string") {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

export function isSameDay(a, b) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isToday(date) {
  if (!date) return false
  return isSameDay(date, new Date())
}

export function formatDuration(ms) {
  if (!ms || ms < 0) return "0 min"
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours <= 0) return `${minutes} min`
  return `${hours} h ${String(minutes).padStart(2, "0")} min`
}

export function formatTime(date) {
  if (!date) return "—"
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export function formatDateTime(date) {
  if (!date) return "—"
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDayLabel(date) {
  if (!date) return "—"
  return date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" })
}

export function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}
