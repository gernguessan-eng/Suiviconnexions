import { useMemo, useState } from "react"
import {
  Plus, Search, Pencil, X, BookUser, Phone, Mail,
  MapPin, Building2, Globe, User, Briefcase,
} from "lucide-react"
import TopBar from "../components/TopBar"
import { SetupBanner, ErrorBanner } from "../components/Banners"
import DeleteGuardButton from "../components/DeleteGuardButton"
import { useContacts, addContact, updateContact, deleteContact } from "../hooks/useContacts"
import { usePersistedState } from "../hooks/usePersistedState"
import { TYPE_OPTIONS, TYPE_STYLES, emptyContact } from "../config/contactsSchema"

export default function CarnetAdresses() {
  const { contacts, loading, error } = useContacts()
  const [showForm, setShowForm] = useState(false)
  const [editContact, setEditContact] = useState(undefined)
  const [search, setSearch] = usePersistedState("rise_filter_contacts_search", "")
  const [typeFilter, setTypeFilter] = usePersistedState("rise_filter_contacts_type", "Tous")

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return contacts
      .filter((c) => {
        const matchSearch =
          !q ||
          (c.nom || "").toLowerCase().includes(q) ||
          (c.prenom || "").toLowerCase().includes(q) ||
          (c.societe || "").toLowerCase().includes(q) ||
          (c.telephone || "").toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q)
        const matchType = typeFilter === "Tous" || c.type_contact === typeFilter
        return matchSearch && matchType
      })
      .sort((a, b) =>
        (a.nom || a.societe || a.telephone || a.email || "").localeCompare(
          b.nom || b.societe || b.telephone || b.email || ""
        )
      )
  }, [contacts, search, typeFilter])

  const counts = useMemo(() => {
    const m = new Map()
    contacts.forEach((c) => m.set(c.type_contact, (m.get(c.type_contact) || 0) + 1))
    return m
  }, [contacts])

  async function handleSave(data, id) {
    if (id) {
      await updateContact(id, data)
    } else {
      await addContact(data)
    }
    setShowForm(false)
    setEditContact(undefined)
  }

  return (
    <>
      <TopBar
        title="Carnet d'adresses"
        subtitle="Fournisseurs, garages, assureurs, clients et tous vos contacts professionnels"
      />

      <SetupBanner />
      <ErrorBanner error={error} collection="contacts" />

      <div className="panel no-print">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un nom, une société, un téléphone, un email…"
              style={{
                width: "100%",
                background: "var(--bg-elevated)",
                border: "1px solid var(--panel-border-soft)",
                borderRadius: 8,
                padding: "9px 12px 9px 32px",
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setEditContact(undefined); setShowForm(true) }}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={15} /> Nouveau contact
            </button>
          </div>
        </div>

        <div className="pill-row" style={{ marginTop: 14 }}>
          <button
            onClick={() => setTypeFilter("Tous")}
            className={"pill" + (typeFilter === "Tous" ? " active" : "")}
          >
            Tous ({contacts.length})
          </button>
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={"pill" + (typeFilter === t ? " active" : "")}
            >
              {t} ({counts.get(t) || 0})
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Contacts</h2>
          <span className="panel-meta">{filtered.length} contact(s)</span>
        </div>

        {loading ? (
          <div className="spinner-row">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <BookUser size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
            <div>Aucun contact trouvé. Ajoutez votre premier contact au carnet d'adresses.</div>
          </div>
        ) : (
          <div className="contact-grid">
            {filtered.map((c) => (
              <ContactCard
                key={c.id}
                contact={c}
                onEdit={() => { setEditContact(c); setShowForm(true) }}
                onDelete={() => deleteContact(c.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ContactFormModal
          contact={editContact}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditContact(undefined) }}
        />
      )}
    </>
  )
}

function ContactCard({ contact: c, onEdit, onDelete }) {
  const style = TYPE_STYLES[c.type_contact] || TYPE_STYLES.Autre
  return (
    <div className="contact-card" onClick={onEdit}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <span className="contact-type-badge" style={{ color: style.color, background: style.bg }}>
            {c.type_contact}
          </span>
          <div className="contact-name">
            {c.nom
              ? `${c.civilite ? c.civilite + " " : ""}${c.prenom ? c.prenom + " " : ""}${c.nom}`
              : c.societe || c.telephone || c.email || "(Sans nom)"}
          </div>
          {c.fonction && (
            <div className="contact-meta-line"><Briefcase size={12} /> {c.fonction}</div>
          )}
          {c.societe && (
            <div className="contact-meta-line" style={{ fontWeight: 600 }}><Building2 size={12} /> {c.societe}</div>
          )}
        </div>
        <div className="contact-card-actions no-print" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="contact-icon-btn"><Pencil size={14} /></button>
          <DeleteGuardButton
            label={`le contact ${c.nom}${c.societe ? " (" + c.societe + ")" : ""}`}
            onDelete={onDelete}
            className="contact-icon-btn"
          />
        </div>
      </div>

      <div className="contact-detail-block">
        {c.telephone && <div className="contact-detail-line"><Phone size={13} /> {c.telephone}</div>}
        {c.telephone_secondaire && (
          <div className="contact-detail-line">
            <Phone size={13} /> {c.telephone_secondaire}{" "}
            <span style={{ color: "var(--text-faint)", fontSize: 11 }}>(secondaire)</span>
          </div>
        )}
        {c.email && <div className="contact-detail-line"><Mail size={13} /> {c.email}</div>}
        {(c.adresse || c.ville) && (
          <div className="contact-detail-line">
            <MapPin size={13} /> {[c.adresse, c.ville, c.pays].filter(Boolean).join(", ")}
          </div>
        )}
        {c.site_web && <div className="contact-detail-line"><Globe size={13} /> {c.site_web}</div>}
      </div>

      {c.notes && <div className="contact-notes">{c.notes}</div>}
    </div>
  )
}

function ContactFormModal({ contact, onSave, onClose }) {
  const [f, setF] = useState({
    type_contact: contact?.type_contact || emptyContact.type_contact,
    civilite: contact?.civilite || "",
    nom: contact?.nom || "",
    prenom: contact?.prenom || "",
    societe: contact?.societe || "",
    fonction: contact?.fonction || "",
    telephone: contact?.telephone || "",
    telephone_secondaire: contact?.telephone_secondaire || "",
    email: contact?.email || "",
    adresse: contact?.adresse || "",
    ville: contact?.ville || "",
    pays: contact?.pays || "Côte d'Ivoire",
    site_web: contact?.site_web || "",
    notes: contact?.notes || "",
    date_creation: contact?.date_creation || new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const up = (k, v) => setF((p) => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaveError(null)

    const hasIdentity = f.nom.trim() || f.societe.trim() || f.telephone.trim() || f.email.trim()
    if (!hasIdentity) {
      setSaveError("Renseignez au moins un nom, une société, un téléphone ou un email.")
      return
    }

    setSaving(true)
    try {
      await onSave(f, contact?.id)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><User size={17} /> {contact ? "Modifier le contact" : "Ajouter un contact"}</h3>
          <button onClick={onClose} className="contact-icon-btn"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-section-label">Identité</div>

          <label>
            <span className="field-label">Type de contact</span>
            <select className="field-input" value={f.type_contact} onChange={(e) => up("type_contact", e.target.value)}>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>
            <span className="field-label">Civilité</span>
            <select className="field-input" value={f.civilite} onChange={(e) => up("civilite", e.target.value)}>
              <option value="">—</option>
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
              <option value="Mlle">Mlle</option>
            </select>
          </label>
          <label>
            <span className="field-label">Nom</span>
            <input className="field-input" value={f.nom} onChange={(e) => up("nom", e.target.value)} />
          </label>
          <label>
            <span className="field-label">Prénom</span>
            <input className="field-input" value={f.prenom} onChange={(e) => up("prenom", e.target.value)} />
          </label>
          <label>
            <span className="field-label">Société / Organisation</span>
            <input className="field-input" value={f.societe} onChange={(e) => up("societe", e.target.value)} />
          </label>
          <label>
            <span className="field-label">Fonction</span>
            <input className="field-input" placeholder="Ex : Gestionnaire de flotte" value={f.fonction} onChange={(e) => up("fonction", e.target.value)} />
          </label>

          <div className="modal-section-label" style={{ color: "var(--accent-info)" }}>Coordonnées</div>

          <label>
            <span className="field-label">Téléphone</span>
            <input className="field-input" placeholder="+225 07 00 00 00 00" value={f.telephone} onChange={(e) => up("telephone", e.target.value)} />
          </label>
          <label>
            <span className="field-label">Téléphone secondaire</span>
            <input className="field-input" value={f.telephone_secondaire} onChange={(e) => up("telephone_secondaire", e.target.value)} />
          </label>
          <label>
            <span className="field-label">Email</span>
            <input type="email" className="field-input" value={f.email} onChange={(e) => up("email", e.target.value)} />
          </label>
          <label>
            <span className="field-label">Site web</span>
            <input className="field-input" placeholder="www.exemple.ci" value={f.site_web} onChange={(e) => up("site_web", e.target.value)} />
          </label>
          <label>
            <span className="field-label">Adresse</span>
            <input className="field-input" value={f.adresse} onChange={(e) => up("adresse", e.target.value)} />
          </label>
          <label>
            <span className="field-label">Ville</span>
            <input className="field-input" value={f.ville} onChange={(e) => up("ville", e.target.value)} />
          </label>
          <label>
            <span className="field-label">Pays</span>
            <input className="field-input" value={f.pays} onChange={(e) => up("pays", e.target.value)} />
          </label>
          <label>
            <span className="field-label">Date de création</span>
            <input type="date" className="field-input" value={f.date_creation} onChange={(e) => up("date_creation", e.target.value)} />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            <span className="field-label">Notes</span>
            <textarea
              className="field-input"
              rows={3}
              placeholder="Informations complémentaires, références contrat, remarques…"
              value={f.notes}
              onChange={(e) => up("notes", e.target.value)}
            />
          </label>

          {saveError && (
            <div style={{ gridColumn: "1 / -1", color: "var(--accent-alert)", fontSize: 12 }}>{saveError}</div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn">Annuler</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Enregistrement…" : contact ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
