import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from '../components/Toaster'

export default function Gradebook() {
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [assignments, setAssignments] = useState([])
  const [assignmentId, setAssignmentId] = useState('')
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState({}) // map student_id -> { id, points_earned }
  const [maxPoints, setMaxPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const inputsRef = useRef({}) // map student_id -> input element

  const loadClasses = async () => {
    const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    setClasses(data || [])
    if (!classId && data && data.length > 0) setClassId(data[0].id)
  }

  const loadAssignments = async (cid) => {
    if (!cid) { setAssignments([]); setAssignmentId(''); return }
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', cid)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    setAssignments(data || [])
    if (data && data.length > 0) setAssignmentId((prev) => prev || data[0].id)
  }

  const loadStudents = async (cid) => {
    if (!cid) return setStudents([])
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', cid)
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    setStudents(data || [])
  }

  const loadGrades = async (aid) => {
    if (!aid) { setGrades({}); setMaxPoints(0); return }
    setLoading(true)
    const [{ data: g, error: ge }, { data: a, error: ae }] = await Promise.all([
      supabase.from('grades').select('*').eq('assignment_id', aid),
      supabase.from('assignments').select('id,max_points').eq('id', aid).single(),
    ])
    if (ge) setError(ge.message)
    if (ae) setError(ae.message)
    const map = {}
    ;(g || []).forEach((row) => { map[row.student_id] = { id: row.id, points_earned: row.points_earned ?? '' } })
    setGrades(map)
    setMaxPoints(Number(a?.max_points || 0))
    setLoading(false)
  }

  useEffect(() => { loadClasses() }, [])
  useEffect(() => { loadAssignments(classId); loadStudents(classId) }, [classId])
  useEffect(() => { loadGrades(assignmentId) }, [assignmentId])

  const setGradeLocal = (studentId, val) => {
    setGrades((prev) => ({ ...prev, [studentId]: { id: prev[studentId]?.id, points_earned: val } }))
  }

  const saveGrade = async (studentId) => {
    setError('')
    if (!assignmentId) return setError('Select an assignment')
    const val = grades[studentId]?.points_earned
    if (val === '' || val === null || typeof val === 'undefined') return
    const num = Number(val)
    if (Number.isNaN(num) || num < 0) return setError('Points must be a non-negative number')
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      return
    }
    
    const existing = grades[studentId]?.id
    if (existing) {
      const { error } = await supabase.from('grades').update({ points_earned: num }).eq('id', existing)
      if (error) { setError(error.message); toast('Failed to save grade', 'error'); return }
    } else {
      const { data, error } = await supabase.from('grades').insert({ 
        assignment_id: assignmentId, 
        student_id: studentId, 
        points_earned: num,
        grader_id: user.id
      }).select('id').single()
      if (error) { setError(error.message); toast('Failed to save grade', 'error'); return }
      setGrades((prev) => ({ ...prev, [studentId]: { id: data.id, points_earned: num } }))
    }
    toast('Saved grade')
  }

  const saveAll = async () => {
    if (!assignmentId) { setError('Select an assignment'); return }
    try {
      const tasks = students.map(async (s) => {
        const val = grades[s.id]?.points_earned
        if (val === '' || val === null || typeof val === 'undefined') return
        const num = Number(val)
        if (Number.isNaN(num) || num < 0) throw new Error('Points must be a non-negative number')
        const existing = grades[s.id]?.id
        if (existing) {
          const { error } = await supabase.from('grades').update({ points_earned: num }).eq('id', existing)
          if (error) throw error
        } else {
          const { data, error } = await supabase.from('grades').insert({ assignment_id: assignmentId, student_id: s.id, points_earned: num }).select('id').single()
          if (error) throw error
          setGrades((prev) => ({ ...prev, [s.id]: { id: data.id, points_earned: num } }))
        }
      })
      await Promise.all(tasks)
      toast('All grades saved')
    } catch (e) {
      setError(e.message || 'Failed to save some grades')
      toast('Failed to save some grades', 'error')
    }
  }

  const header = useMemo(() => {
    const a = assignments.find((x) => x.id === assignmentId)
    if (!a) return '—'
    return `${a.title} (Max ${a.max_points})`
  }, [assignments, assignmentId])

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h2>Gradebook</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <label>
          Class:{' '}
          <select value={classId} onChange={(e) => setClassId(e.target.value)}>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.term ? ` (${c.term})` : ''}</option>
            ))}
          </select>
        </label>
        <label>
          Assignment:{' '}
          <select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)}>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </label>
        <div style={{ marginLeft: 'auto' }}>
          <strong>{header}</strong>
        </div>
        <button onClick={saveAll}>Save All</button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Student</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 8, width: 220 }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const val = grades[s.id]?.points_earned ?? ''
              return (
                <tr key={s.id}>
                  <td style={{ padding: 8 }}>{s.last_name}, {s.first_name} <span style={{ color: '#666' }}>({s.student_identifier})</span></td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <input
                      ref={(el) => { if (el) inputsRef.current[s.id] = el }}
                      style={{ width: 120, marginRight: 8 }}
                      value={val}
                      onChange={(e) => setGradeLocal(s.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault(); saveGrade(s.id)
                          const idx = students.findIndex((x) => x.id === s.id)
                          const nextId = students[Math.min(idx + 1, students.length - 1)]?.id
                          if (nextId && inputsRef.current[nextId]) inputsRef.current[nextId].focus()
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          const idx = students.findIndex((x) => x.id === s.id)
                          const nextId = students[Math.min(idx + 1, students.length - 1)]?.id
                          if (nextId && inputsRef.current[nextId]) inputsRef.current[nextId].focus()
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          const idx = students.findIndex((x) => x.id === s.id)
                          const prevId = students[Math.max(idx - 1, 0)]?.id
                          if (prevId && inputsRef.current[prevId]) inputsRef.current[prevId].focus()
                        }
                      }}
                      inputMode="decimal"
                      placeholder={`0 - ${maxPoints}`}
                    />
                    <button onClick={() => saveGrade(s.id)}>Save</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
