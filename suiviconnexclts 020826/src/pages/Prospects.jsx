import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import TopBar from "../components/TopBar"
import { SetupBanner, ErrorBanner } from "../components/Banners"
import DeleteGuardButton from "../components/DeleteGuardButton"
import KpiCard from "../components/KpiCard"
import { useProspects, addProspectRow, updateProspectField, deleteProspect } from "../hooks/useProspects"
import { PROSPECTEE_OPTIONS, DEMO_VIA_OPTIONS, RDV_OPTIONS, RDV_STYLES } from "../config/prospectsSchema"

const cellInputStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--panel-border-soft)",
  borderRadius: 6,
  padding: "6px 8px",
  color: "var(--text-primary)",
  fontSize: 12.5,
  width: "100%",
  minWidth: 120,
}

const CHART_COLORS = ["#5b9df2", "#2fd9a6", "#f2b84b", "#f0616b", "#a78bfa"]

export default function Prospects() {
  const { prospects, loading, error } = useProspects()
  const [adding, setAdding] = useState(false)

  async function handleAddRow() {
    setAdding(true)
    try {
      await addProspectRow()
    } catch (err) {
      alert("Impossible d'ajouter la ligne : " + err.message)
    } finally {
      setAdding(false)
    }
  }

  const stats = useMemo(() => computeProspectStats(prospects), [prospects])

  return (
    <>
      <TopBar title="Prospects" subtitle="Suivi de votre prospection commerciale — temps réel" />

      <SetupBanner />
      <ErrorBanner error={error} collection="prospects" />

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Prospects</h2>
          <button
            onClick={handleAddRow}
            disabled={adding}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} /> {adding ? "Ajout…" : "Ajouter une ligne"}
          </button>
        </div>

        {loading ? (
          <div className="spinner-row">Chargement…</div>
        ) : prospects.length === 0 ? (
          <div className="empty-state">
            Aucun prospect pour le moment. Cliquez sur "Ajouter une ligne" pour commencer.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Entreprise</th>
                  <th>Ese prospectée</th>
                  <th>Démo via</th>
                  <th>Date de démo</th>
                  <th>RDV</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((p) => (
                  <ProspectRow key={p.id} prospect={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Analyse des prospects</h2>
        </div>

        <div className="kpi-grid" style={{ marginBottom: 26 }}>
          <KpiCard icon="🏢" label="Prospects au total" value={stats.total} accent="var(--accent-info)" />
          <KpiCard
            icon="✅"
            label="Entreprises prospectées"
            value={`${stats.prospectees} / ${stats.total}`}
            accent="var(--accent-live)"
          />
          <KpiCard icon="🤝" label="RDV déjà obtenus" value={stats.rdvObtenus} accent="var(--accent-warn)" />
          <KpiCard icon="📅" label="Démos à venir" value={stats.demosAvenir} accent="var(--accent-alert)" />
        </div>

        <div className="two-col-grid">
          <div>
            <div className="panel-meta" style={{ marginBottom: 10 }}>Répartition "Démo via"</div>
            <BreakdownChart data={stats.demoViaBreakdown} />
          </div>
          <div>
            <div className="panel-meta" style={{ marginBottom: 10 }}>Répartition "RDV"</div>
            <BreakdownChart data={stats.rdvBreakdown} />
          </div>
        </div>
      </div>
    </>
  )
}

function ProspectRow({ prospect: p }) {
  const [entreprise, setEntreprise] = useState(p.entreprise || "")
  const [notes, setNotes] = useState(p.notes || "")
  const [deleting, setDeleting] = useState(false)

  function commitField(field, value) {
    updateProspectField(p.id, field, value).catch((err) => {
      console.error(`Impossible de mettre à jour ${field}`, err)
      alert("Échec de l'enregistrement : " + err.message)
    })
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteProspect(p.id)
    } catch (err) {
      alert("Impossible de supprimer : " + err.message)
      setDeleting(false)
    }
  }

  return (
    <tr style={{ opacity: deleting ? 0.4 : 1 }}>
      <td>
        <input
          style={cellInputStyle}
          value={entreprise}
          placeholder="Nom de l'entreprise"
          onChange={(e) => setEntreprise(e.target.value)}
          onBlur={() => commitField("entreprise", entreprise)}
        />
      </td>
      <td>
        <select
          style={cellInputStyle}
          value={p.prospectee || "Non"}
          onChange={(e) => commitField("prospectee", e.target.value)}
        >
          {PROSPECTEE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>
      <td>
        <select
          style={cellInputStyle}
          value={p.demoVia || "Teams"}
          onChange={(e) => commitField("demoVia", e.target.value)}
        >
          {DEMO_VIA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>
      <td>
        <input
          type="date"
          style={cellInputStyle}
          value={p.dateDemo || ""}
          onChange={(e) => commitField("dateDemo", e.target.value)}
        />
      </td>
      <td>
        <select
          style={{
            ...cellInputStyle,
            color: RDV_STYLES[p.rdv]?.color || "var(--text-primary)",
            fontWeight: 600,
          }}
          value={p.rdv || "En attente"}
          onChange={(e) => commitField("rdv", e.target.value)}
        >
          {RDV_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>
      <td>
        <input
          style={cellInputStyle}
          value={notes}
          placeholder="Commentaire…"
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => commitField("notes", notes)}
        />
      </td>
      <td>
        <DeleteGuardButton
          label={`la ligne "${p.entreprise || "sans nom"}"`}
          onDelete={handleDelete}
          className="contact-icon-btn"
          style={{ color: "var(--accent-alert)" }}
        />
      </td>
    </tr>
  )
}

function BreakdownChart({ data }) {
  if (data.every((d) => d.count === 0)) {
    return <div className="empty-state">Pas encore de données.</div>
  }
  return (
    <div style={{ width: "100%", height: Math.max(data.length * 42, 100) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid stroke="var(--panel-border-soft)" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
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
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function computeProspectStats(prospects) {
  const total = prospects.length
  const prospectees = prospects.filter((p) => p.prospectee === "Oui").length
  const rdvObtenus = prospects.filter((p) => p.rdv === "Déjà obtenu").length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const demosAvenir = prospects.filter((p) => {
    if (!p.dateDemo) return false
    const d = new Date(p.dateDemo)
    return !isNaN(d.getTime()) && d >= today
  }).length

  const demoViaBreakdown = DEMO_VIA_OPTIONS.map((label) => ({
    label,
    count: prospects.filter((p) => p.demoVia === label).length,
  }))

  const rdvBreakdown = RDV_OPTIONS.map((label) => ({
    label,
    count: prospects.filter((p) => p.rdv === label).length,
  }))

  return { total, prospectees, rdvObtenus, demosAvenir, demoViaBreakdown, rdvBreakdown }
}
