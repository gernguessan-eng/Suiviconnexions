import { useEffect, useState } from "react"
import { formatTime } from "../utils/date"

export default function TopBar({ title, subtitle, lastSync }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="topbar">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      <div className="live-status no-print">
        <span className="pulse-dot" />
        <span className="label">LIVE</span>
        <span>{formatTime(now)}</span>
        {lastSync && <span style={{ color: "var(--text-faint)" }}>· sync {formatTime(lastSync)}</span>}
      </div>
    </div>
  )
}
