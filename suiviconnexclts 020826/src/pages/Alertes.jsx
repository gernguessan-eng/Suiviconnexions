import { usePresenceContext } from "../context/PresenceContext"
import { useAlertesCollection } from "../hooks/useAlertesCollection"
import TopBar from "../components/TopBar"
import { SetupBanner, ErrorBanner } from "../components/Banners"
import { computeHeuristicAlerts } from "../utils/presenceStats"
import { formatDateTime } from "../utils/date"

const SEVERITY_COLOR = {
  alert: "var(--accent-alert)",
  warning: "var(--accent-warn)",
  info: "var(--accent-info)",
}

export default function Alertes() {
  const { docs, loading, error, lastSync } = usePresenceContext()
  const { alerts: liveAlerts, loading: alertsLoading } = useAlertesCollection()

  const usingFallback = !alertsLoading && liveAlerts.length === 0
  const alerts = usingFallback ? computeHeuristicAlerts(docs) : liveAlerts

  return (
    <>
      <TopBar
        title="Alertes & notifications"
        subtitle="Anomalies détectées dans l'activité de connexion"
        lastSync={lastSync}
      />

      <SetupBanner />
      <ErrorBanner error={error} />

      {usingFallback && (
        <div className="banner setup">
          ℹ Aucune collection <code>alertes</code> détectée dans Firestore — les alertes ci-dessous
          sont calculées automatiquement (sessions anormalement longues, entreprises inactives).
          Créez une collection <code>alertes</code> pour piloter ces notifications vous-même.
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Alertes récentes</h2>
          <span className="panel-meta">{alerts.length} alerte(s)</span>
        </div>

        {loading || alertsLoading ? (
          <div className="spinner-row">Analyse de l'activité…</div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">Aucune alerte — tout fonctionne normalement.</div>
        ) : (
          alerts.map((a) => (
            <div className="alert-item" key={a.id}>
              <span
                className="alert-dot"
                style={{ background: SEVERITY_COLOR[a.severity] ?? "var(--accent-info)" }}
              />
              <div>
                <div className="alert-title">{a.title}</div>
                <div className="alert-desc">{a.description}</div>
                <div className="alert-date">{formatDateTime(a.date)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
