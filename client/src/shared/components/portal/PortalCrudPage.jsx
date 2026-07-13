import { useEffect, useState } from 'react'

export default function PortalCrudPage({
  title,
  icon,
  theme,
  api,
  fields,
  columns,
  emptyHint,
  allowCreate,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const canCreate = allowCreate !== false && typeof api.create === 'function'
  const css = theme?.css || {
    card: 'inst-card',
    input: 'inst-input',
    btn: 'inst-btn',
    btnPrimary: 'inst-btn inst-btn-primary',
  }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.list({ limit: 100 })
      setItems(data.items || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    const init = {}
    fields.forEach(f => { init[f.key] = f.default ?? '' })
    setForm(init)
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (row) => {
    const init = {}
    fields.forEach(f => { init[f.key] = row[f.key] ?? '' })
    setForm(init)
    setEditing(row._id)
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form }
      fields.forEach(f => {
        if (f.type === 'number') payload[f.key] = Number(payload[f.key]) || 0
      })
      if (editing) await api.update(editing, payload)
      else await api.create(payload)
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this record?')) return
    try {
      await api.delete(id)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: theme.accentLight }}>{icon} {title}</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.6, fontSize: '0.85rem' }}>{emptyHint}</p>
        </div>
        {canCreate && (
          <button type="button" onClick={openCreate} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: theme.accent, color: theme.id === 'company' ? '#fff' : '#1a1208', fontWeight: 700, cursor: 'pointer' }}>
            + Add New
          </button>
        )}
      </div>

      {error && <div style={{ color: '#F87171', marginBottom: 12, fontSize: '0.85rem' }}>{error}</div>}

      {showForm && (
        <form onSubmit={save} className={css.card} style={{ marginBottom: 20, display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {fields.map(f => (
              <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.78rem', color: theme.accentLight }}>
                {f.label}
                {f.type === 'textarea' ? (
                  <textarea className={css.input} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} rows={3} />
                ) : f.type === 'select' ? (
                  <select className={css.input} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                    {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className={css.input} type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                )}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className={css.btnPrimary}>Save</button>
            <button type="button" className={css.btn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className={css.card} style={{ overflowX: 'auto' }}>
        {loading ? <p style={{ opacity: 0.6 }}>Loading...</p> : items.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No records yet.{canCreate ? ' Add your first entry.' : ''}</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.accent}22`, textAlign: 'left' }}>
                {columns.map(c => <th key={c.key} style={{ padding: '10px 8px', color: theme.accent }}>{c.label}</th>)}
                <th style={{ padding: '10px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(row => (
                <tr key={row._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {columns.map(c => (
                    <td key={c.key} style={{ padding: '10px 8px' }}>
                      {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                    </td>
                  ))}
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                    {api.update && <button type="button" className={css.btn} style={{ marginRight: 6 }} onClick={() => openEdit(row)}>Edit</button>}
                    {api.delete && <button type="button" className={css.btn} onClick={() => remove(row._id)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
