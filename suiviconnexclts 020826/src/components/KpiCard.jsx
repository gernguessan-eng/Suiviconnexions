export default function KpiCard({ icon, label, value, accent = "var(--accent-live)" }) {
  return (
    <div className="kpi-card">
      <div className="kpi-accent-bar" style={{ background: accent }} />
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  )
}
