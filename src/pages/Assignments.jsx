import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from '../components/Toaster'

export default function Assignments() {
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [categories, setCategories] = useState([])
  const [subjects, setSubjects] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [maxPoints, setMaxPoints] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [weight, setWeight] = useState('1')

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editSubjectId, setEditSubjectId] = useState('')
  const [editMaxPoints, setEditMaxPoints] = useState('')
  const [editDueAt, setEditDueAt] = useState('')
  const [editWeight, setEditWeight] = useState('1')

  const loadClasses = async () => {
    const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    setClasses(data || [])
    if (!classId && data && data.length > 0) setClassId(data[0].id)
  }

  const loadCategories = async (cid) => {
    if (!cid) { setCategories([]); setCategoryId(''); return }
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('class_id', cid)
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    const rows = data || []
    setCategories(rows)
    setCategoryId(rows[0]?.id || '')
  }

  const loadAssignments = async (cid) => {
    if (!cid) return
    setLoading(true)
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', cid)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const [{ data: classRows }, { data: catRows }, { data: subjRows }] = await Promise.all([
        supabase.from('classes').select('*').order('created_at', { ascending: true }),
        supabase.from('categories').select('*').order('created_at', { ascending: true }),
        supabase.from('subjects').select('*').order('created_at', { ascending: true }),
      ])
      if (!mounted) return
      setClasses(classRows || [])
      setCategories(catRows || [])
      setSubjects(subjRows || [])
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    // when class changes, reset selection then reload related data
    setCategoryId('')
    loadCategories(classId)
    loadAssignments(classId)
  }, [classId])

  const addAssignment = async (e) => {
    e.preventDefault()
    setError('')
    if (!classId) return setError('Select a class first')
    if (!categoryId) return setError('Select a category')
    if (!subjectId) return setError('Select a subject')
    if (!title.trim()) return setError('Title is required')
    const mp = Number(maxPoints)
    if (Number.isNaN(mp) || mp <= 0) return setError('Max points must be > 0')
    const w = Number(weight)
    if (Number.isNaN(w) || w <= 0) return setError('Weight must be > 0')
    const { error } = await supabase.from('assignments').insert({
      class_id: classId,
      category_id: categoryId,
      subject_id: subjectId,
      title: title.trim(),
      max_points: mp,
      weight: w,
      due_at: dueAt || null,
    })
    if (error) { setError(error.message); toast('Failed to add assignment', 'error'); return }
    setTitle(''); setMaxPoints(''); setDueAt(''); setWeight('1'); setSubjectId('')
    loadAssignments(classId)
    toast('Assignment added')
  }

  const startEdit = (a) => {
    setEditingId(a.id)
    setEditTitle(a.title)
    setEditCategoryId(a.category_id)
    setEditSubjectId(a.subject_id)
    setEditMaxPoints(String(a.max_points))
    setEditDueAt(a.due_at ? a.due_at.substring(0, 16) : '')
    setEditWeight(String(a.weight ?? 1))
  }

  const saveEdit = async (id) => {
    setError('')
    if (!editTitle.trim()) return setError('Title is required')
    if (!editCategoryId) return setError('Select a category')
    if (!editSubjectId) return setError('Select a subject')
    const mp = Number(editMaxPoints)
    if (Number.isNaN(mp) || mp <= 0) return setError('Max points must be > 0')
    const w = Number(editWeight)
    if (Number.isNaN(w) || w <= 0) return setError('Weight must be > 0')
    const { error } = await supabase
      .from('assignments')
      .update({ title: editTitle.trim(), category_id: editCategoryId, subject_id: editSubjectId, max_points: mp, weight: w, due_at: editDueAt || null })
      .eq('id', id)
    if (error) { setError(error.message); toast('Failed to save assignment', 'error'); return }
    setEditingId(null)
    loadAssignments(classId)
    toast('Assignment saved')
  }

  const remove = async (id) => {
    setError('')
    const { error } = await supabase.from('assignments').delete().eq('id', id)
    if (error) { setError(error.message); toast('Failed to delete assignment', 'error'); return }
    loadAssignments(classId)
    toast('Assignment deleted', 'info')
  }

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h2>Assignments</h2>

      <div style={{ marginBottom: 12 }}>
        <label>
          Class:{' '}
          <select value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select a class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.term ? ` (${c.term})` : ''}</option>
            ))}
          </select>
        </label>
      </div>

      {classId && (
        <>
          <form onSubmit={addAssignment} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'center', marginBottom: 16 }}>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: 8 }} required />
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Category</option>
              {categories.filter((c) => c.class_id === classId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input placeholder="Max points" value={maxPoints} onChange={(e) => setMaxPoints(e.target.value)} style={{ padding: 8 }} inputMode="numeric" />
            <input placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ padding: 8 }} inputMode="decimal" />
            <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} style={{ padding: 8 }} />
            <button type="submit">Add</button>
          </form>

          {error && <p style={{ color: 'crimson' }}>{error}</p>}

          {loading ? (
            <p>Loading…</p>
          ) : items.length === 0 ? (
            <p>No assignments yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Title</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Category</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Subject</th>
                  <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 8, width: 120 }}>Max</th>
                  <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 8, width: 120 }}>Weight</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8, width: 220 }}>Due</th>
                  <th style={{ borderBottom: '1px solid #eee', padding: 8, width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td style={{ padding: 8 }}>
                      {editingId === a.id ? (
                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      ) : (
                        a.title
                      )}
                    </td>
                    <td style={{ padding: 8 }}>
                      {editingId === a.id ? (
                        <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
                          {categories.filter((c) => c.class_id === classId).map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        categories.find((c) => c.id === a.category_id)?.name || '—'
                      )}
                    </td>
                    <td style={{ padding: 8 }}>
                      {editingId === a.id ? (
                        <select value={editSubjectId} onChange={(e) => setEditSubjectId(e.target.value)}>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      ) : (
                        subjects.find((s) => s.id === a.subject_id)?.name || '—'
                      )}
                    </td>
                    <td style={{ padding: 8, textAlign: 'right' }}>
                      {editingId === a.id ? (
                        <input style={{ width: 80 }} value={editMaxPoints} onChange={(e) => setEditMaxPoints(e.target.value)} />
                      ) : (
                        Number(a.max_points)
                      )}
                    </td>
                    <td style={{ padding: 8, textAlign: 'right' }}>
                      {editingId === a.id ? (
                        <input style={{ width: 80 }} value={editWeight} onChange={(e) => setEditWeight(e.target.value)} />
                      ) : (
                        Number(a.weight ?? 1)
                      )}
                    </td>
                    <td style={{ padding: 8 }}>
                      {editingId === a.id ? (
                        <input type="datetime-local" value={editDueAt} onChange={(e) => setEditDueAt(e.target.value)} />
                      ) : (
                        a.due_at ? new Date(a.due_at).toLocaleString() : '—'
                      )}
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      {editingId === a.id ? (
                        <>
                          <button onClick={() => saveEdit(a.id)} style={{ marginRight: 8 }}>Save</button>
                          <button onClick={() => setEditingId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(a)} style={{ marginRight: 8 }}>Edit</button>
                          <button onClick={() => remove(a.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}
