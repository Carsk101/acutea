import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from '../components/Toaster'

export default function Students() {
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [studentId, setStudentId] = useState('')
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editStudentId, setEditStudentId] = useState('')
  const [editFirst, setEditFirst] = useState('')
  const [editLast, setEditLast] = useState('')

  const loadClasses = async () => {
    const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    setClasses(data || [])
    if (!classId && data && data.length > 0) setClassId(data[0].id)
  }

  const loadStudents = async (cid) => {
    if (!cid) return
    setLoading(true)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', cid)
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { loadClasses() }, [])
  useEffect(() => { loadStudents(classId) }, [classId])

  const addStudent = async (e) => {
    e.preventDefault()
    setError('')
    if (!classId) return setError('Select a class first')
    if (!studentId.trim() || !first.trim() || !last.trim()) return setError('All fields are required')
    const { error } = await supabase
      .from('students')
      .insert({ class_id: classId, student_identifier: studentId.trim(), first_name: first.trim(), last_name: last.trim() })
    if (error) { setError(error.message); toast('Failed to add student', 'error'); return }
    setStudentId(''); setFirst(''); setLast('')
    loadStudents(classId)
    toast('Student added')
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setEditStudentId(s.student_identifier)
    setEditFirst(s.first_name)
    setEditLast(s.last_name)
  }

  const saveEdit = async (id) => {
    setError('')
    if (!editStudentId.trim() || !editFirst.trim() || !editLast.trim()) return setError('All fields are required')
    const { error } = await supabase
      .from('students')
      .update({ student_identifier: editStudentId.trim(), first_name: editFirst.trim(), last_name: editLast.trim() })
      .eq('id', id)
    if (error) { setError(error.message); toast('Failed to save student', 'error'); return }
    setEditingId(null)
    loadStudents(classId)
    toast('Student saved')
  }

  const remove = async (id) => {
    setError('')
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) { setError(error.message); toast('Failed to delete student', 'error'); return }
    loadStudents(classId)
    toast('Student deleted', 'info')
  }

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>Students</h2>

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

      <form onSubmit={addStudent} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ width: 160, padding: 8 }} required />
        <input placeholder="First name" value={first} onChange={(e) => setFirst(e.target.value)} style={{ flex: 1, padding: 8 }} required />
        <input placeholder="Last name" value={last} onChange={(e) => setLast(e.target.value)} style={{ flex: 1, padding: 8 }} required />
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>No students yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8, width: 160 }}>Student ID</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>First</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Last</th>
              <th style={{ borderBottom: '1px solid #eee', padding: 8, width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: 8 }}>
                  {editingId === s.id ? (
                    <input value={editStudentId} onChange={(e) => setEditStudentId(e.target.value)} />
                  ) : (
                    s.student_identifier
                  )}
                </td>
                <td style={{ padding: 8 }}>
                  {editingId === s.id ? (
                    <input value={editFirst} onChange={(e) => setEditFirst(e.target.value)} />
                  ) : (
                    s.first_name
                  )}
                </td>
                <td style={{ padding: 8 }}>
                  {editingId === s.id ? (
                    <input value={editLast} onChange={(e) => setEditLast(e.target.value)} />
                  ) : (
                    s.last_name
                  )}
                </td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  {editingId === s.id ? (
                    <>
                      <button onClick={() => saveEdit(s.id)} style={{ marginRight: 8 }}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(s)} style={{ marginRight: 8 }}>Edit</button>
                      <button onClick={() => remove(s.id)}>Delete</button>
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
