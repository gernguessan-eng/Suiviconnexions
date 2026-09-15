import { useMemo, useState } from "react"
import { Plus, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts"
import TopBar from "../components/TopBar"
import { SetupBanner, ErrorBanner } from "../components/Banners"
import DeleteGuardButton from "../components/DeleteGuardButton"
import KpiCard from "../components/KpiCard"
import { useProspects, addProspectRow, updateProspectField, deleteProspect } from "../hooks/useProspects"
import { PROSPECTEE_OPTIONS, DEMO_VIA_OPTIONS, RDV_OPTIONS, RDV_STYLES, APPLICATION_PROPOSEE_OPTIONS } from "../config/prospectsSchema"

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

const COLUMNS = [
  { key: "entreprise", label: "Entreprise" },
  { key: "applicationProposee", label: "Application proposée" },
  { key: "prospectee", label: "Ese prospectée" },
  { key: "demoVia", label: "Démo via" },
  { key: "dateDemo", label: "Date de démo" },
  { key: "rdv", label: "RDV" },
]

export default function Prospects() {
  const { prospects, loading, error } = useProspects()
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState("")
  // Tri par défaut : ordre de création, pour que "Ajouter une ligne" fasse
  // toujours apparaître la nouvelle ligne au même endroit (à la fin),
  // au lieu de sauter à une position imprévisible.
  const [sortKey, setSortKey] = useState("createdAt")
  const [sortDir, setSortDir] = useState("asc")

  async function handleAddRow() {
    setAdding(true)
    try {
      await addProspectRow()
      setSortKey("createdAt")
      setSortDir("asc")
    } catch (err) {
      alert("Impossible d'ajouter la ligne : " + err.message)
    } finally {
      setAdding(false)
    }
  }

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const filteredRows = useMemo(() => {
    if (!search.trim()) return prospects
    const q = search.toLowerCase()
    return prospects.filter((p) =>
      [p.entreprise, p.applicationProposee, p.prospectee, p.demoVia, p.dateDemo, p.rdv, p.notes]
        .some((v) => (v || "").toString().toLowerCase().includes(q))
    )
  }, [prospects, search])

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows].sort((a, b) => compareValues(a, b, sortKey))
    return sortDir === "asc" ? sorted : sorted.reverse()
  }, [filteredRows, sortKey, sortDir])

  const stats = useMemo(() => computeProspectStats(prospects), [prospects])

  return (
    <>
      <TopBar title="Prospects" subtitle="Suivi de votre prospection commerciale — temps réel" />

      <SetupBanner />
      <ErrorBanner error={error} collection="prospects" />

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Prospects</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                style={{ ...cellInputStyle, padding: "8px 10px 8px 30px", width: 200 }}
              />
            </div>
            <button
              onClick={handleAddRow}
              disabled={adding}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={15} /> {adding ? "Ajout…" : "Ajouter une ligne"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="spinner-row">Chargement…</div>
        ) : prospects.length === 0 ? (
          <div className="empty-state">
            Aucun prospect pour le moment. Cliquez sur "Ajouter une ligne" pour commencer.
          </div>
        ) : sortedRows.length === 0 ? (
          <div className="empty-state">Aucun résultat pour "{search}".</div>
        ) : (
          <div className="sticky-table-wrap">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <SortableTh
                      key={col.key}
                      label={col.label}
                      colKey={col.key}
                      currentKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  ))}
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((p) => (
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

function SortableTh({ label, colKey, currentKey, dir, onSort }) {
  const active = colKey === currentKey
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <th>
      <button
        onClick={() => onSort(colKey)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: active ? "var(--text-primary)" : "var(--text-faint)",
          font: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          textTransform: "inherit",
          letterSpacing: "inherit",
          padding: 0,
        }}
        title="Trier par cette colonne"
      >
        {label} <Icon size={12} />
      </button>
    </th>
  )
}

function ApplicationProposeeCell({ value, onCommit }) {
  const knownOptions = APPLICATION_PROPOSEE_OPTIONS.filter((o) => o !== "Autres")
  const startsCustom = !!value && !knownOptions.includes(value)
  const [mode, setMode] = useState(startsCustom ? "Autres" : (value || knownOptions[0]))
  const [customText, setCustomText] = useState(startsCustom ? value : "")

  function handleSelectChange(e) {
    const v = e.target.value
    setMode(v)
    if (v === "Autres") {
      if (customText) onCommit(customText)
      // sinon on attend la saisie avant d'enregistrer quoi que ce soit
    } else {
      onCommit(v)
    }
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <select style={cellInputStyle} value={mode} onChange={handleSelectChange}>
        {APPLICATION_PROPOSEE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {mode === "Autres" && (
        <input
          style={cellInputStyle}
          placeholder="Préciser…"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onBlur={() => onCommit(customText)}
        />
      )}
    </div>
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
        <ApplicationProposeeCell
          value={p.applicationProposee || ""}
          onCommit={(v) => commitField("applicationProposee", v)}
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
  const total = data.reduce((sum, d) => sum + d.count, 0)
  if (total === 0) {
    return <div className="empty-state">Pas encore de données.</div>
  }
  const withPct = data.map((d) => ({ ...d, pct: Math.round((d.count / total) * 100) }))

  return (
    <div style={{ width: "100%", height: Math.max(withPct.length * 42, 100) }}>
      <ResponsiveContainer>
        <BarChart data={withPct} layout="vertical" margin={{ top: 0, right: 36, left: 10, bottom: 0 }}>
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
            formatter={(value, _name, props) => [`${value} (${props.payload.pct}%)`, "Nombre"]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {withPct.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(v) => `${v}%`}
              style={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function compareValues(a, b, key) {
  if (key === "dateDemo") {
    const av = a.dateDemo ? new Date(a.dateDemo).getTime() : Infinity
    const bv = b.dateDemo ? new Date(b.dateDemo).getTime() : Infinity
    return av - bv
  }
  if (key === "createdAt") {
    const av = a.createdAt ? a.createdAt.getTime() : 0
    const bv = b.createdAt ? b.createdAt.getTime() : 0
    return av - bv
  }
  const av = (a[key] || "").toString().toLowerCase()
  const bv = (b[key] || "").toString().toLowerCase()
  return av.localeCompare(bv)
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
