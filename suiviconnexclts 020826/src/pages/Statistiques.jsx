import { usePresenceContext } from "../context/PresenceContext"
import TopBar from "../components/TopBar"
import { SetupBanner, ErrorBanner } from "../components/Banners"
import { connectionsByDay, topEntreprisesByConnections, topUsersByDuration, withDuration } from "../utils/presenceStats"
import { formatDayLabel, formatDuration } from "../utils/date"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function Statistiques() {
  const { docs, loading, error, lastSync } = usePresenceContext()

  const dailyData = connectionsByDay(docs, 7).map((b) => ({
    label: formatDayLabel(b.day),
    connexions: b.count,
  }))

  const topEntreprises = topEntreprisesByConnections(docs, 6).map((e) => ({
    name: e.entrepriseName,
    sessions: e.totalSessions,
  }))

  const topUsers = topUsersByDuration(withDuration(docs), 8).map((u) => ({
    name: u.userName,
    hours: Math.round((u.totalDurationMs / 3600000) * 10) / 10,
    durationMs: u.totalDurationMs,
    sessions: u.totalSessions,
  }))

  return (
    <>
      <TopBar
        title="Statistiques"
        subtitle="Tendances de connexion calculées à partir de la collection presence"
        lastSync={lastSync}
      />

      <SetupBanner />
      <ErrorBanner error={error} />

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Connexions par jour (7 derniers jours)</h2>
        </div>
        {loading ? (
          <div className="spinner-row">Chargement…</div>
        ) : (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={dailyData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--panel-border-soft)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-faint)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--panel-border-soft)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--text-faint)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--panel-border-soft)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--text-primary)" }}
                />
                <Bar dataKey="connexions" fill="#2fd9a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Entreprises les plus actives</h2>
        </div>
        {loading ? (
          <div className="spinner-row">Chargement…</div>
        ) : topEntreprises.length === 0 ? (
          <div className="empty-state">Pas encore de données.</div>
        ) : (
          <div style={{ width: "100%", height: Math.max(topEntreprises.length * 42, 120) }}>
            <ResponsiveContainer>
              <BarChart
                data={topEntreprises}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--panel-border-soft)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fill: "var(--text-primary)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--panel-border-soft)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="sessions" fill="#5b9df2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Utilisateurs les plus actifs (temps total connecté)</h2>
        </div>
        {loading ? (
          <div className="spinner-row">Chargement…</div>
        ) : topUsers.length === 0 ? (
          <div className="empty-state">Pas encore de données.</div>
        ) : (
          <div style={{ width: "100%", height: Math.max(topUsers.length * 42, 120) }}>
            <ResponsiveContainer>
              <BarChart
                data={topUsers}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--panel-border-soft)" horizontal={false} />
                <XAxis
                  type="number"
                  unit="h"
                  tick={{ fill: "var(--text-faint)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fill: "var(--text-primary)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--panel-border-soft)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(_value, _name, props) => [
                    formatDuration(props.payload.durationMs) + ` · ${props.payload.sessions} session(s)`,
                    "Temps connecté",
                  ]}
                />
                <Bar dataKey="hours" fill="#f2b84b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  )
}
