import { isToday, daysAgo } from "./date"

// Durée au-delà de laquelle une session encore "Connecté" est considérée
// comme probablement fantôme (déconnexion jamais enregistrée côté client).
export const STALE_SESSION_MS = 8 * 60 * 60 * 1000 // 8h

export function isStaleSession(d) {
  return d.isOnline && d.durationMs > STALE_SESSION_MS
}


// ── KPI 1 : Utilisateurs connectés (actuellement en ligne) ─────────────────
export function countConnectedUsers(docs) {
  const onlineIds = new Set(docs.filter((d) => d.isOnline).map((d) => d.userId))
  return onlineIds.size
}

// ── KPI 2 : Connexions aujourd'hui (nombre d'évènements de connexion) ──────
export function countConnectionsToday(docs) {
  return docs.filter((d) => isToday(d.connectedAt)).length
}

// ── KPI 3 : Entreprises connectées (entreprises ayant ≥1 user en ligne) ────
export function countConnectedEntreprises(docs) {
  const ids = new Set(docs.filter((d) => d.isOnline).map((d) => d.entrepriseId))
  return ids.size
}

// ── KPI 4 : Temps moyen de connexion aujourd'hui ────────────────────────────
export function averageDurationTodayMs(docs) {
  const sessionsToday = docs.filter((d) => isToday(d.connectedAt))
  if (sessionsToday.length === 0) return 0
  const now = new Date()
  const total = sessionsToday.reduce((sum, d) => {
    const end = d.disconnectedAt ?? now
    const duration = end.getTime() - d.connectedAt.getTime()
    return sum + Math.max(duration, 0)
  }, 0)
  return total / sessionsToday.length
}

// ── Historique : liste triée des sessions avec durée calculée ──────────────
export function withDuration(docs) {
  const now = new Date()
  return docs.map((d) => {
    const end = d.disconnectedAt ?? (d.isOnline ? now : d.connectedAt)
    const durationMs = d.connectedAt ? Math.max(end.getTime() - d.connectedAt.getTime(), 0) : 0
    return { ...d, durationMs }
  })
}

// ── Entreprises : agrégation par entreprise ─────────────────────────────────
export function groupByEntreprise(docs) {
  const map = new Map()
  for (const d of docs) {
    const key = d.entrepriseId
    if (!map.has(key)) {
      map.set(key, {
        entrepriseId: key,
        entrepriseName: d.entrepriseName,
        totalSessions: 0,
        usersOnline: new Set(),
        allUsers: new Set(),
        lastActivity: null,
      })
    }
    const entry = map.get(key)
    entry.totalSessions += 1
    entry.allUsers.add(d.userId)
    if (d.isOnline) entry.usersOnline.add(d.userId)
    if (d.connectedAt && (!entry.lastActivity || d.connectedAt > entry.lastActivity)) {
      entry.lastActivity = d.connectedAt
    }
  }
  return Array.from(map.values())
    .map((e) => ({
      ...e,
      usersOnlineCount: e.usersOnline.size,
      usersTotalCount: e.allUsers.size,
    }))
    .sort((a, b) => b.usersOnlineCount - a.usersOnlineCount || b.totalSessions - a.totalSessions)
}

// ── Utilisateurs : agrégation par utilisateur (toutes entreprises) ─────────
// Attend des docs déjà passés par withDuration().
export function groupByUser(docsWithDuration) {
  const map = new Map()
  for (const d of docsWithDuration) {
    const key = d.userId
    if (!map.has(key)) {
      map.set(key, {
        userId: key,
        userName: d.userName,
        userEmail: d.userEmail,
        role: d.role,
        entrepriseName: d.entrepriseName,
        application: d.application,
        applications: new Set(),
        isOnline: false,
        totalSessions: 0,
        totalDurationMs: 0,
        lastConnection: null,
      })
    }
    const entry = map.get(key)
    entry.totalSessions += 1
    entry.totalDurationMs += d.durationMs || 0
    if (d.isOnline) entry.isOnline = true
    if (d.application) entry.applications.add(d.application)
    if (d.connectedAt && (!entry.lastConnection || d.connectedAt > entry.lastConnection)) {
      entry.lastConnection = d.connectedAt
      // On garde les infos (nom, rôle, entreprise) de la session la plus
      // récente, au cas où elles auraient changé entre-temps.
      entry.userName = d.userName
      entry.role = d.role
      entry.entrepriseName = d.entrepriseName
      entry.application = d.application
    }
  }
  return Array.from(map.values())
    .map((entry) => ({ ...entry, applications: Array.from(entry.applications) }))
    .sort((a, b) => b.isOnline - a.isOnline || b.totalSessions - a.totalSessions)
}

// ── Statistiques : utilisateurs les plus actifs (par temps total connecté) ─
export function topUsersByDuration(docsWithDuration, limit = 8) {
  return groupByUser(docsWithDuration)
    .sort((a, b) => b.totalDurationMs - a.totalDurationMs)
    .slice(0, limit)
}


export function connectionsByDay(docs, numDays = 7) {
  const buckets = []
  for (let i = numDays - 1; i >= 0; i--) {
    const day = daysAgo(i)
    buckets.push({ day, count: 0 })
  }
  for (const d of docs) {
    if (!d.connectedAt) continue
    for (const bucket of buckets) {
      const bucketEnd = new Date(bucket.day)
      bucketEnd.setDate(bucketEnd.getDate() + 1)
      if (d.connectedAt >= bucket.day && d.connectedAt < bucketEnd) {
        bucket.count += 1
        break
      }
    }
  }
  return buckets
}

// ── Statistiques : top entreprises par nombre de connexions ────────────────
export function topEntreprisesByConnections(docs, limit = 6) {
  return groupByEntreprise(docs)
    .sort((a, b) => b.totalSessions - a.totalSessions)
    .slice(0, limit)
}

// ── Alertes heuristiques calculées côté client (fallback) ──────────────────
// Si vous créez une vraie collection "alertes" dans Firestore, ces règles
// ne servent plus que de filet de sécurité / suggestions.
export function computeHeuristicAlerts(docs) {
  const alerts = []
  const withDur = withDuration(docs)

  // Sessions anormalement longues (> 8h) toujours actives
  const longSessions = withDur.filter(isStaleSession)
  for (const s of longSessions) {
    alerts.push({
      id: `long-${s.id}`,
      severity: "warning",
      title: "Session inhabituellement longue",
      description: `${s.userName} (${s.entrepriseName}) est connecté depuis plus de 8h sans déconnexion.`,
      date: s.connectedAt,
    })
  }

  // Entreprises inactives depuis plus de 7 jours
  const entreprises = groupByEntreprise(docs)
  for (const e of entreprises) {
    if (e.lastActivity) {
      const diffDays = (Date.now() - e.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays > 7) {
        alerts.push({
          id: `inactive-${e.entrepriseId}`,
          severity: "info",
          title: "Entreprise inactive",
          description: `${e.entrepriseName} n'a pas eu de connexion depuis ${Math.floor(diffDays)} jours.`,
          date: e.lastActivity,
        })
      }
    }
  }

  return alerts.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
}
