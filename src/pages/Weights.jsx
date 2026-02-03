import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Weights() {
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editWeight, setEditWeight] = useState('')

  const total = useMemo(() => (items || []).reduce((acc, it) => acc + Number(it.weight || 0), 0), [items])

  const loadClasses = async () => {
    const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    setClasses(data || [])
    if (!classId && data && data.length > 0) setClassId(data[0].id)
  }

  const loadCategories = async (cid) => {
    if (!cid) return
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('class_id', cid)
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    loadCategories(classId)
  }, [classId])

  const addCategory = async (e) => {
    e.preventDefault()
    setError('')
    if (!classId) return setError('Select a class first')
    if (!name.trim()) return setError('Name is required')
    const w = Number(weight)
    if (Number.isNaN(w) || w < 0 || w > 100) return setError('Weight must be between 0 and 100')
    const { error } = await supabase.from('categories').insert({ class_id: classId, name: name.trim(), weight: w })
    if (error) return setError(error.message)
    setName('')
    setWeight('')
    loadCategories(classId)
  }

  const startEdit = (it) => {
    setEditingId(it.id)
    setEditName(it.name)
    setEditWeight(String(it.weight))
  }

  const saveEdit = async (id) => {
    setError('')
    if (!editName.trim()) return setError('Name is required')
    const w = Number(editWeight)
    if (Number.isNaN(w) || w < 0 || w > 100) return setError('Weight must be between 0 and 100')
    const { error } = await supabase
      .from('categories')
      .update({ name: editName.trim(), weight: w })
      .eq('id', id)
    if (error) return setError(error.message)
    setEditingId(null)
    loadCategories(classId)
  }

  const remove = async (id) => {
    setError('')
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return setError(error.message)
    loadCategories(classId)
  }

  return (
    <div style={{ padding: 16, maxWidth: 800 }}>
      <h2>Category Weights</h2>

      <div style={{ marginBottom: 12 }}>
        <label>
          Class:{' '}
          <select value={classId} onChange={(e) => setClassId(e.target.value)}>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.term ? ` (${c.term})` : ''}</option>
            ))}
          </select>
        </label>
      </div>

      <form onSubmit={addCategory} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Category name (e.g., Assignments)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 2, padding: 8 }}
          required
        />
        <input
          placeholder="Weight (0-100)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{ width: 140, padding: 8 }}
          inputMode="numeric"
        />
        <button type="submit">Add</button>
      </form>

      <div style={{ marginBottom: 8 }}>
        <strong>Total weight:</strong> {total}%
        {total !== 100 && (
          <span style={{ color: 'crimson', marginLeft: 8 }}>(Must equal 100%)</span>
        )}
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>No categories yet. Add some above.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 8, width: 140 }}>Weight %</th>
              <th style={{ borderBottom: '1px solid #eee', padding: 8, width: 200 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td style={{ padding: 8 }}>
                  {editingId === it.id ? (
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  ) : (
                    it.name
                  )}
                </td>
                <td style={{ padding: 8, textAlign: 'right' }}>
                  {editingId === it.id ? (
                    <input style={{ width: 100 }} value={editWeight} onChange={(e) => setEditWeight(e.target.value)} />
                  ) : (
                    Number(it.weight)
                  )}
                </td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  {editingId === it.id ? (
                    <>
                      <button onClick={() => saveEdit(it.id)} style={{ marginRight: 8 }}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(it)} style={{ marginRight: 8 }}>Edit</button>
                      <button onClick={() => remove(it.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
