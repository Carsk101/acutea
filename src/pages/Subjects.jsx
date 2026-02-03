import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from '../components/Toaster'

export default function Subjects() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  // Matrix states
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [weights, setWeights] = useState({}) // assignmentId -> weight string
  const [grades, setGrades] = useState({})   // `${studentId}_${assignmentId}` -> string
  const cellRefs = useRef({}) // key -> ref

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Load classes for selector
  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: true })
      if (error) return
      setClasses(data || [])
      if (!classId && data && data.length > 0) setClassId(data[0].id)
    })()
  }, [])

  // Load students when class changes
  useEffect(() => {
    if (!classId) { setStudents([]); return }
    ;(async () => {
      const { data, error } = await supabase.from('students').select('*').eq('class_id', classId).order('last_name')
      if (error) return
      setStudents(data || [])
    })()
  }, [classId])

  // Load assignments for class + subject
  useEffect(() => {
    if (!classId || !subjectId) { setAssignments([]); setWeights({}); return }
    ;(async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: true })
      if (error) return
      setAssignments(data || [])
      const w = {}
      ;(data || []).forEach((a) => { w[a.id] = String(a.weight ?? 1) })
      setWeights(w)
    })()
  }, [classId, subjectId])

  // Load grades when assignments or students change
  useEffect(() => {
    if (assignments.length === 0 || students.length === 0) { setGrades({}); return }
    ;(async () => {
      const aIds = assignments.map((a) => a.id)
      const sIds = students.map((s) => s.id)
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .in('assignment_id', aIds)
        .in('student_id', sIds)
      if (error) return
      const map = {}
      data?.forEach((g) => { map[`${g.student_id}_${g.assignment_id}`] = g.points_earned != null ? String(g.points_earned) : '' })
      setGrades(map)
    })()
  }, [assignments, students])

  const addSubject = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Subject name is required')
    const { error } = await supabase.from('subjects').insert({ name: name.trim() })
    if (error) { setError(error.message); toast('Failed to add subject', 'error'); return }
    setName('')
    load()
    toast('Subject added')
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setEditName(s.name)
  }

  const saveEdit = async (id) => {
    setError('')
    if (!editName.trim()) return setError('Subject name is required')
    const { error } = await supabase.from('subjects').update({ name: editName.trim() }).eq('id', id)
    if (error) { setError(error.message); toast('Failed to save subject', 'error'); return }
    setEditingId(null)
    load()
    toast('Subject saved')
  }

  const remove = async (id) => {
    setError('')
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) { setError(error.message); toast('Failed to delete subject', 'error'); return }
    load()
    toast('Subject deleted', 'info')
  }

  const saveWeight = async (assignmentId) => {
    const val = Number(weights[assignmentId])
    if (Number.isNaN(val) || val <= 0) { toast('Weight must be > 0', 'error'); return }
    const { error } = await supabase.from('assignments').update({ weight: val }).eq('id', assignmentId)
    if (error) { toast('Failed to save weight', 'error'); return }
    toast('Weight saved')
  }

  const setGradeLocal = (studentId, assignmentId, value) => {
    setGrades((prev) => ({ ...prev, [`${studentId}_${assignmentId}`]: value }))
  }

  const saveAllGrades = async () => {
    if (!classId || !subjectId) return
    // Build upserts from grades map
    const upserts = []
    for (const s of students) {
      for (const a of assignments) {
        const key = `${s.id}_${a.id}`
        const vRaw = grades[key]
        if (vRaw === undefined) continue
        const v = vRaw === '' ? null : Number(vRaw)
        if (v !== null && (Number.isNaN(v) || v < 0)) {
          toast('Invalid grade value', 'error')
          return
        }
        upserts.push({ student_id: s.id, assignment_id: a.id, points_earned: v })
      }
    }
    if (upserts.length === 0) { toast('Nothing to save', 'info'); return }
    const { error } = await supabase.from('grades').upsert(upserts, { onConflict: 'student_id,assignment_id' })
    if (error) { toast('Failed to save grades', 'error'); return }
    toast('Grades saved')
  }

  // Autosave a single grade on blur
  const saveOneGrade = async (studentId, assignmentId) => {
    const key = `${studentId}_${assignmentId}`
    const vRaw = grades[key]
    const v = vRaw === '' ? null : Number(vRaw)
    if (v !== null && (Number.isNaN(v) || v < 0)) { toast('Invalid grade value', 'error'); return }
    const { error } = await supabase.from('grades').upsert({ student_id: studentId, assignment_id: assignmentId, points_earned: v }, { onConflict: 'student_id,assignment_id' })
    if (error) { toast('Failed to save grade', 'error'); return }
    toast('Saved', 'info')
  }

  return (
    <div style={{ padding: 16, maxWidth: 980 }}>
      <h2>Subjects</h2>
      <form onSubmit={addSubject} className="panel hover-lift" style={{ display: 'flex', gap: 8, marginBottom: 16, padding: 12 }}>
        <input placeholder="Subject name" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, padding: 8 }} />
        <button type="submit">Add</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="panel hover-lift" style={{ marginBottom: 24 }}>
          <div className="panel-header"><strong className="brand-accent">Subjects</strong></div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Name</th>
                  <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: 8 }}>
                      {editingId === s.id ? (
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      ) : (
                        s.name
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
          </div>
        </div>
      )}
      <hr />
      <h3>Grade by Subject</h3>
      <div className="panel hover-lift" style={{ display: 'flex', gap: 12, marginBottom: 12, padding: 12 }}>
        <label>
          Class:{' '}
          <select value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.term ? ` (${c.term})` : ''}</option>
            ))}
          </select>
        </label>
        <label>
          Subject:{' '}
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Select subject</option>
            {items.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <button onClick={saveAllGrades} disabled={!classId || !subjectId}>Save All</button>
      </div>

      {classId && subjectId && (
        assignments.length === 0 ? (
          <p>No assignments for this subject yet.</p>
        ) : (
          <div className="panel matrix-wrapper hover-lift">
            <div className="panel-body" style={{ padding: 0 }}>
            <table className="table matrix-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8, position: 'sticky', left: 0, background: 'white' }}>Student</th>
                  {assignments.map((a) => (
                    <th key={a.id} style={{ borderBottom: '1px solid #eee', padding: 8, minWidth: 160 }}>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
                        <small>Weight</small>
                        <input style={{ width: 70 }} value={weights[a.id] ?? ''} onChange={(e) => setWeights((w) => ({ ...w, [a.id]: e.target.value }))} />
                        <button onClick={() => saveWeight(a.id)}>Save</button>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <small>Max: {a.max_points}</small>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, rowIdx) => (
                  <tr key={s.id}>
                    <td style={{ padding: 8, position: 'sticky', left: 0, background: 'white' }}>{s.last_name}, {s.first_name}</td>
                    {assignments.map((a, colIdx) => {
                      const key = `${s.id}_${a.id}`
                      return (
                        <td key={a.id} style={{ padding: 8 }}>
                          <input
                            ref={(el) => { cellRefs.current[key] = el }}
                            style={{ width: 90 }}
                            placeholder="—"
                            value={grades[key] ?? ''}
                            onChange={(e) => setGradeLocal(s.id, a.id, e.target.value)}
                            onBlur={() => saveOneGrade(s.id, a.id)}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )
      )}
    </div>
  )
}
