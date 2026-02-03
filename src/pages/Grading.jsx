import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from '../components/Toaster'

export default function Grading() {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [grades, setGrades] = useState({})
  const [weights, setWeights] = useState({})
  const [loading, setLoading] = useState(true)

  // New assignment form
  const [showNewAssignment, setShowNewAssignment] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newWeight, setNewWeight] = useState('10')
  const [newDueAt, setNewDueAt] = useState('')

  useEffect(() => {
    loadClasses()
    loadSubjects()
  }, [])

  const loadClasses = async () => {
    const { data, error } = await supabase.from('classes').select('*').order('name')
    if (error) { toast('Failed to load classes', 'error'); return }
    setClasses(data || [])
    setLoading(false)
  }

  const loadSubjects = async () => {
    const { data, error } = await supabase.from('subjects').select('*').order('name')
    if (error) { toast('Failed to load subjects', 'error'); return }
    setSubjects(data || [])
  }

  const loadClassData = async (classId, subjectId) => {
    setLoading(true)
    
    // Load students
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('last_name', { ascending: true })
    
    if (studentsError) {
      toast('Failed to load students', 'error')
      setLoading(false)
      return
    }
    
    // Load categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .order('weight', { ascending: false })
    
    if (categoriesError) {
      toast('Failed to load categories', 'error')
      setLoading(false)
      return
    }
    
    // Load assignments
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: true })
    
    if (assignmentsError) {
      toast('Failed to load assignments', 'error')
      setLoading(false)
      return
    }
    
    // Load grades
    const { data: gradesData, error: gradesError } = await supabase
      .from('grades')
      .select('*')
      .in('student_id', studentsData.map(s => s.id))
      .in('assignment_id', assignmentsData.map(a => a.id))
    
    if (gradesError) {
      toast('Failed to load grades', 'error')
      setLoading(false)
      return
    }
    
    // Set weights
    const newWeights = {}
    assignmentsData.forEach(a => {
      newWeights[a.id] = a.weight
    })
    
    // Set grades
    const newGrades = {}
    gradesData.forEach(g => {
      newGrades[`${g.student_id}_${g.assignment_id}`] = g.points_earned
    })
    
    setStudents(studentsData)
    setCategories(categoriesData)
    setAssignments(assignmentsData)
    setGrades(newGrades)
    setWeights(newWeights)
    
    // If categories exist, select the first one by default
    if (categoriesData.length > 0) {
      setSelectedCategory(categoriesData[0])
    } else {
      setSelectedCategory(null)
    }
    
    setLoading(false)
  }

  const saveGrade = async (studentId, assignmentId) => {
    const key = `${studentId}_${assignmentId}`
    const vRaw = grades[key]
    const v = vRaw === '' ? null : Number(vRaw)
    if (v !== null && (Number.isNaN(v) || v < 0)) { 
      toast('Invalid grade value', 'error')
      return 
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast('Not authenticated', 'error')
      return
    }
    
    const { error } = await supabase.from('grades').upsert({ 
      student_id: studentId, 
      assignment_id: assignmentId, 
      points_earned: v,
      grader_id: user.id
    }, { onConflict: 'student_id,assignment_id' })
    
    if (error) { 
      console.error('Grade save error:', error)
      toast('Failed to save grade: ' + error.message, 'error')
      return 
    }
    toast('Saved', 'info')
  }

  const saveWeight = async (assignmentId) => {
    const w = Number(weights[assignmentId])
    if (Number.isNaN(w) || w < 0 || w > 100) { 
      toast('Weight must be between 0% and 100%', 'error')
      return 
    }
    
    const { error } = await supabase.from('assignments').update({ weight: w }).eq('id', assignmentId)
    if (error) { 
      toast('Failed to save weight', 'error')
      return 
    }
    toast('Weight saved')
  }

  const addAssignment = async (e) => {
    e.preventDefault()
    if (!selectedClass || !selectedSubject) return
    if (!newTitle.trim()) { toast('Title required', 'error'); return }
    if (!selectedCategory) { toast('Please select a category', 'error'); return }
    
    const w = Number(newWeight)
    if (Number.isNaN(w) || w < 0 || w > 100) { toast('Weight must be between 0% and 100%', 'error'); return }
    
    // Calculate current total weight for this category
    const categoryAssignments = assignments.filter(a => a.category_id === selectedCategory.id)
    const currentTotal = categoryAssignments.reduce((sum, a) => sum + Number(a.weight), 0)
    
    if (currentTotal + w > 100) {
      toast(`Total weight within category cannot exceed 100% (current: ${currentTotal}%, adding: ${w}%)`, 'error')
      return
    }

    const { error } = await supabase.from('assignments').insert({
      class_id: selectedClass.id,
      subject_id: selectedSubject.id,
      category_id: selectedCategory.id,
      title: newTitle.trim(),
      weight: w,
      due_at: newDueAt || null,
    })

    if (error) { 
      console.error('Assignment creation error:', error)
      toast('Failed to add assignment: ' + error.message, 'error')
      return 
    }

    setNewTitle('')
    setNewWeight('10')
    setNewDueAt('')
    setShowNewAssignment(false)
    loadClassData(selectedClass.id, selectedSubject.id)
    toast('Assignment added')
  }

  return (
    <div style={{ padding: '16px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>✏️ Grade Assignments</h2>
        <p className="text-muted">Enter grades for students across all assignments and subjects</p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(149, 213, 178, 0.1), rgba(45, 106, 79, 0.05))',
        borderRadius: '20px',
        border: '1px solid rgba(149, 213, 178, 0.2)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>{classes.length}</div>
          <div style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>🏫 Classes</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>{assignments.length}</div>
          <div style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>📝 Assignments</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>{students.length}</div>
          <div style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>👥 Students</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>
            {Object.keys(grades).filter(key => grades[key] && grades[key] !== '').length}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>✅ Graded</div>
        </div>
      </div>

      {/* Enhanced Class & Subject Selection */}
      <div className="panel hover-lift" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <strong className="brand-accent">🎓 Select Class & Subject for Grading</strong>
          <span style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>Choose class and subject to grade</span>
        </div>
        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--accent)' }}>Available Classes</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {classes.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                    No classes found. <a href="/classes" style={{ color: 'var(--accent)' }}>Create classes first</a>
                  </p>
                ) : (
                  classes.map(c => (
                    <div 
                      key={c.id}
                      className="class-pill"
                      style={{ 
                        padding: '12px 16px',
                        cursor: 'pointer',
                        background: selectedClass?.id === c.id 
                          ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' 
                          : 'linear-gradient(135deg, rgba(149, 213, 178, 0.15), rgba(45, 106, 79, 0.08))',
                        color: selectedClass?.id === c.id ? 'white !important' : 'var(--fg)',
                        border: `2px solid ${selectedClass?.id === c.id ? 'var(--accent)' : 'rgba(149, 213, 178, 0.3)'}`,
                        borderRadius: '12px'
                      }}
                      onClick={() => {
                        setSelectedClass(c)
                        setSelectedSubject(null)
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🎒</span>
                        <span style={{ fontWeight: '600' }}>{c.name}</span>
                        {c.term && <span style={{ fontSize: '12px', opacity: 0.8 }}>({c.term})</span>}
                        {selectedClass?.id === c.id && <span style={{ marginLeft: 'auto' }}>✓</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--accent)' }}>Available Subjects</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {!selectedClass ? (
                  <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Select a class first</p>
                ) : subjects.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No subjects found</p>
                ) : (
                  subjects.map(s => (
                    <button 
                      key={s.id}
                      className="class-pill"
                      style={{ 
                        padding: '12px 16px',
                        background: selectedSubject?.id === s.id 
                          ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' 
                          : 'rgba(255,255,255,0.8)',
                        color: selectedSubject?.id === s.id ? 'white !important' : 'var(--fg)',
                        border: `2px solid ${selectedSubject?.id === s.id ? 'var(--accent)' : 'rgba(149, 213, 178, 0.2)'}`,
                        borderRadius: '12px',
                        width: '100%',
                        textAlign: 'left'
                      }}
                      onClick={() => {
                        setSelectedSubject(s)
                        if (selectedClass) {
                          loadClassData(selectedClass.id, s.id)
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📖</span>
                        <span style={{ fontWeight: '600' }}>{s.name}</span>
                        {selectedSubject?.id === s.id && <span style={{ marginLeft: 'auto' }}>✓</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category and Assignment Management */}
      {selectedClass && selectedSubject && (
        <div className="panel hover-lift" style={{ marginBottom: '24px' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong className="brand-accent">📁 Categories & Assignments</strong>
              <div style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                Manage assignment categories and weights
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href="/categories" style={{ 
                color: 'var(--accent)', 
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--accent-pastel)',
                fontSize: '13px'
              }}>Manage Categories</a>
              <button 
                className="btn-outline"
                onClick={() => setShowNewAssignment(!showNewAssignment)}
                style={{ fontSize: '13px' }}
              >
                {showNewAssignment ? 'Cancel' : '+ Add Assignment'}
              </button>
            </div>
          </div>
          
          {/* Category Selection */}
          {categories.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid rgba(149, 213, 178, 0.2)' }}>
              <div style={{ marginBottom: '12px', fontSize: '16px' }}>📂</div>
              <p style={{ color: 'var(--fg-muted)' }}>No categories defined. Please <a href="/categories" style={{ color: 'var(--accent)' }}>create categories</a> first.</p>
            </div>
          ) : (
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(149, 213, 178, 0.2)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map(category => (
                  <button 
                    key={category.id}
                    className={selectedCategory?.id === category.id ? 'btn-primary' : 'btn-outline'}
                    onClick={() => setSelectedCategory(category)}
                    style={{ 
                      fontSize: '13px',
                      padding: '8px 12px'
                    }}
                  >
                    {category.name} ({category.weight}%)
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* New Assignment Form */}
          {showNewAssignment && selectedCategory && (
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(149, 213, 178, 0.2)', background: 'rgba(149, 213, 178, 0.05)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--accent)' }}>Add Assignment to {selectedCategory.name}</h4>
              <form onSubmit={addAssignment} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '12px', alignItems: 'center' }}>
                <input 
                  placeholder="Assignment title" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  required 
                  style={{ padding: '8px 12px' }}
                />
                <input 
                  placeholder="Weight (%)" 
                  value={newWeight} 
                  onChange={(e) => setNewWeight(e.target.value)} 
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  max="100"
                  style={{ padding: '8px 12px' }}
                />
                <button type="submit" className="btn-primary">Add</button>
              </form>
              
              {/* Show remaining weight within category */}
              {selectedCategory && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--accent)' }}>
                  {(() => {
                    const categoryAssignments = assignments.filter(a => a.category_id === selectedCategory.id)
                    const currentTotal = categoryAssignments.reduce((sum, a) => sum + Number(a.weight), 0)
                    return `Remaining weight: ${Math.max(0, 100 - currentTotal).toFixed(1)}%`
                  })()}
                </div>
              )}
            </div>
          )}
          
          <div className="panel-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : categories.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                No categories yet. Please create categories first.
              </div>
            ) : selectedCategory && assignments.filter(a => a.category_id === selectedCategory.id).length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                No assignments in this category yet. Click "Add Assignment" to get started.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Weight (within category)</th>
                    <th>Effective Weight</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCategory && assignments
                    .filter(assignment => assignment.category_id === selectedCategory.id)
                    .map(assignment => (
                      <tr key={assignment.id}>
                        <td>{assignment.title}</td>
                        <td>{assignment.weight}%</td>
                        <td>{(assignment.weight * selectedCategory.weight / 100).toFixed(1)}%</td>
                        <td>{assignment.due_at ? new Date(assignment.due_at).toLocaleDateString() : 'None'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Grading Matrix */}
      {selectedClass && selectedSubject && (
        <div className="panel hover-lift">
          <div className="panel-header" style={{ justifyContent: 'space-between' }}>
            <div>
              <strong className="brand-accent">
                📊 {selectedSubject.name} - {selectedClass.name}
              </strong>
              <div style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                Grade students for assignments in this subject
              </div>
            </div>
          </div>
          
          <div className="panel-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : assignments.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                No assignments yet. Click "Add Assignment" to get started.
              </div>
            ) : (
              <div className="matrix-wrapper">
                {/* Student count indicator */}
                <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(149, 213, 178, 0.2)' }}>
                  <div>
                    <strong>{students.length}</strong> students
                  </div>
                  {students.length > 15 && (
                    <div style={{ fontSize: '13px', color: 'var(--accent)' }}>
                      ⚡ Tip: Use browser search (Ctrl+F/Cmd+F) to find students quickly
                    </div>
                  )}
                </div>
                
                {selectedCategory && assignments.filter(a => a.category_id === selectedCategory.id).length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    No assignments in this category yet.
                  </div>
                ) : (
                  <table className="table matrix-table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: '160px', position: 'sticky', top: 0, zIndex: 2 }}>Student</th>
                        {assignments
                          .filter(a => a.category_id === selectedCategory.id)
                          .map(a => (
                            <th key={a.id} style={{ minWidth: '140px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 1 }}>
                              <div style={{ fontWeight: '600', marginBottom: '8px' }}>{a.title}</div>
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                                <input 
                                  style={{ width: '60px', fontSize: '12px', padding: '4px 6px' }} 
                                  value={weights[a.id] ?? ''} 
                                  onChange={(e) => setWeights(prev => ({ ...prev, [a.id]: e.target.value }))} 
                                  placeholder="%" 
                                  inputMode="decimal" 
                                  step="0.1" 
                                  min="0" 
                                  max="100"
                                  onBlur={() => saveWeight(a.id)}
                                />
                                <span style={{ fontSize: '12px' }}>%</span>
                              </div>
                              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                                {(a.weight * selectedCategory.weight / 100).toFixed(1)}% of total
                              </div>
                            </th>
                          ))}
                        <th style={{ minWidth: '100px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 1 }}>
                          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Category Avg</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        // Calculate category average for this student
                        const categoryAssignments = assignments.filter(a => a.category_id === selectedCategory.id)
                        let totalWeightedScore = 0
                        let totalWeight = 0
                        
                        categoryAssignments.forEach(assignment => {
                          const score = grades[`${student.id}_${assignment.id}`]
                          if (score !== undefined && score !== '') {
                            totalWeightedScore += Number(score) * Number(assignment.weight)
                            totalWeight += Number(assignment.weight)
                          }
                        })
                        
                        const categoryAverage = totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(1) : '-'
                        
                        return (
                          <tr key={student.id}>
                            <td style={{ position: 'sticky', left: 0, zIndex: 1 }}>
                              {student.first_name} {student.last_name}
                            </td>
                            {categoryAssignments.map(assignment => (
                              <td key={assignment.id} style={{ textAlign: 'center' }}>
                                <input 
                                  style={{ width: '60px', textAlign: 'center' }} 
                                  value={grades[`${student.id}_${assignment.id}`] ?? ''} 
                                  onChange={(e) => setGrades(prev => ({ ...prev, [`${student.id}_${assignment.id}`]: e.target.value }))} 
                                  placeholder="-" 
                                  inputMode="decimal"
                                  onBlur={() => saveGrade(student.id, assignment.id)}
                                />
                              </td>
                            ))}
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                              {categoryAverage}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
