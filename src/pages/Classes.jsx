import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from '../components/Toaster'

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState({})
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('classes')

  // Class form
  const [name, setName] = useState('')
  const [term, setTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editTerm, setEditTerm] = useState('')

  // Student form
  const [selectedClassId, setSelectedClassId] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')

  // Subject form
  const [subjectName, setSubjectName] = useState('')
  const [editingSubjectId, setEditingSubjectId] = useState(null)
  const [editSubjectName, setEditSubjectName] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [classesRes, studentsRes, subjectsRes] = await Promise.all([
      supabase.from('classes').select('*').order('name'),
      supabase.from('students').select('*').order('last_name'),
      supabase.from('subjects').select('*').order('name')
    ])

    if (classesRes.error || studentsRes.error || subjectsRes.error) {
      toast('Failed to load data', 'error')
      setLoading(false)
      return
    }

    setClasses(classesRes.data || [])
    setSubjects(subjectsRes.data || [])
    
    // Group students by class
    const studentsByClass = {}
    ;(studentsRes.data || []).forEach(student => {
      if (!studentsByClass[student.class_id]) {
        studentsByClass[student.class_id] = []
      }
      studentsByClass[student.class_id].push(student)
    })
    setStudents(studentsByClass)
    setLoading(false)
  }

  // Class CRUD
  const addClass = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    
    const { error } = await supabase.from('classes').insert({ name: name.trim(), term: term.trim() || null })
    if (error) { toast('Failed to add class', 'error'); return }
    
    setName('')
    setTerm('')
    loadData()
    toast('Class added')
  }

  const startEditClass = (cls) => {
    setEditingId(cls.id)
    setEditName(cls.name)
    setEditTerm(cls.term || '')
  }

  const saveEditClass = async (id) => {
    if (!editName.trim()) return
    
    const { error } = await supabase.from('classes').update({ 
      name: editName.trim(), 
      term: editTerm.trim() || null 
    }).eq('id', id)
    
    if (error) { toast('Failed to save class', 'error'); return }
    
    setEditingId(null)
    loadData()
    toast('Class saved')
  }

  const removeClass = async (id) => {
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (error) { toast('Failed to delete class', 'error'); return }
    
    loadData()
    toast('Class deleted', 'info')
  }

  // Student CRUD
  const addStudent = async (e) => {
    e.preventDefault()
    if (!selectedClassId) { toast('Please select a class', 'error'); return }
    if (!firstName.trim()) { toast('First name is required', 'error'); return }
    if (!lastName.trim()) { toast('Last name is required', 'error'); return }
    
    const { error } = await supabase.from('students').insert({
      class_id: selectedClassId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      student_identifier: `${lastName.trim()}, ${firstName.trim()}`
    })
    
    if (error) { 
      console.error('Student creation error:', error)
      toast('Failed to add student: ' + error.message, 'error') 
      return 
    }
    
    setFirstName('')
    setLastName('')
    loadData()
    toast('Student added')
  }

  const startEditStudent = (student) => {
    setEditingStudentId(student.id)
    setEditFirstName(student.first_name)
    setEditLastName(student.last_name)
  }

  const saveEditStudent = async (id) => {
    if (!editFirstName.trim() || !editLastName.trim()) return
    
    const { error } = await supabase.from('students').update({
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      student_identifier: `${editLastName.trim()}, ${editFirstName.trim()}`
    }).eq('id', id)
    
    if (error) { toast('Failed to save student', 'error'); return }
    
    setEditingStudentId(null)
    loadData()
    toast('Student saved')
  }

  const removeStudent = async (id) => {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) { toast('Failed to delete student', 'error'); return }
    
    loadData()
    toast('Student deleted', 'info')
  }

  // Subject CRUD
  const addSubject = async (e) => {
    e.preventDefault()
    if (!subjectName.trim()) return
    
    const { error } = await supabase.from('subjects').insert({ name: subjectName.trim() })
    if (error) { toast('Failed to add subject', 'error'); return }
    
    setSubjectName('')
    loadData()
    toast('Subject added')
  }

  const startEditSubject = (subject) => {
    setEditingSubjectId(subject.id)
    setEditSubjectName(subject.name)
  }

  const saveEditSubject = async (id) => {
    if (!editSubjectName.trim()) return
    
    const { error } = await supabase.from('subjects').update({ name: editSubjectName.trim() }).eq('id', id)
    if (error) { toast('Failed to save subject', 'error'); return }
    
    setEditingSubjectId(null)
    loadData()
    toast('Subject saved')
  }

  const removeSubject = async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) { toast('Failed to delete subject', 'error'); return }
    
    loadData()
    toast('Subject deleted', 'info')
  }

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>🎓 Class Management</h2>

      {/* Tab Navigation */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div className="panel-body" style={{ padding: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'classes', label: '📚 Classes', count: classes.length },
              { key: 'students', label: '👥 Students', count: Object.values(students).flat().length },
              { key: 'subjects', label: '📖 Subjects', count: subjects.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {tab.label}
                <span style={{ 
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--accent)',
                  color: activeTab === tab.key ? 'white' : 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div>
          <div className="panel hover-lift" style={{ marginBottom: '20px' }}>
            <div className="panel-header">
              <strong className="brand-accent">Add New Class</strong>
            </div>
            <div className="panel-body">
              <form onSubmit={addClass} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '12px', alignItems: 'center' }}>
                <input 
                  placeholder="Class name (e.g., Math 101)" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
                <input 
                  placeholder="Term (optional)" 
                  value={term} 
                  onChange={(e) => setTerm(e.target.value)} 
                />
                <button type="submit">Add Class</button>
              </form>
            </div>
          </div>

          <div className="panel hover-lift">
            <div className="panel-header">
              <strong className="brand-accent">Your Classes</strong>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              {classes.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  No classes yet. Add your first class above.
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Class Name</th>
                      <th>Term</th>
                      <th>Students</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(cls => (
                      <tr key={cls.id}>
                        <td>
                          {editingId === cls.id ? (
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                          ) : (
                            <strong>{cls.name}</strong>
                          )}
                        </td>
                        <td>
                          {editingId === cls.id ? (
                            <input value={editTerm} onChange={(e) => setEditTerm(e.target.value)} />
                          ) : (
                            cls.term || '—'
                          )}
                        </td>
                        <td>
                          <span style={{ 
                            background: 'var(--accent)', 
                            color: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px' 
                          }}>
                            {students[cls.id]?.length || 0} students
                          </span>
                        </td>
                        <td>
                          {editingId === cls.id ? (
                            <>
                              <button onClick={() => saveEditClass(cls.id)} style={{ marginRight: '8px' }}>Save</button>
                              <button onClick={() => setEditingId(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditClass(cls)} style={{ marginRight: '8px' }}>Edit</button>
                              <button onClick={() => removeClass(cls.id)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          <div className="panel hover-lift" style={{ marginBottom: '20px' }}>
            <div className="panel-header">
              <strong className="brand-accent">Add New Student</strong>
            </div>
            <div className="panel-body">
              <form onSubmit={addStudent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
                <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
                  <option value="">Select class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                <input 
                  placeholder="First name" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                />
                <input 
                  placeholder="Last name" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                />
                <button type="submit">Add Student</button>
              </form>
            </div>
          </div>

          {classes.map(cls => (
            <div key={cls.id} className="panel hover-lift" style={{ marginBottom: '16px' }}>
              <div className="panel-header">
                <strong className="brand-accent">{cls.name} {cls.term && `(${cls.term})`}</strong>
                <span style={{ 
                  background: 'var(--accent)', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px' 
                }}>
                  {students[cls.id]?.length || 0} students
                </span>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                {!students[cls.id] || students[cls.id].length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No students in this class yet.
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students[cls.id].map(student => (
                        <tr key={student.id}>
                          <td>
                            {editingStudentId === student.id ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                                <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                              </div>
                            ) : (
                              <strong>{student.last_name}, {student.first_name}</strong>
                            )}
                          </td>
                          <td>
                            {editingStudentId === student.id ? (
                              <>
                                <button onClick={() => saveEditStudent(student.id)} style={{ marginRight: '8px' }}>Save</button>
                                <button onClick={() => setEditingStudentId(null)}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditStudent(student)} style={{ marginRight: '8px' }}>Edit</button>
                                <button onClick={() => removeStudent(student.id)}>Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div>
          <div className="panel hover-lift" style={{ marginBottom: '20px' }}>
            <div className="panel-header">
              <strong className="brand-accent">Add New Subject</strong>
            </div>
            <div className="panel-body">
              <form onSubmit={addSubject} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center' }}>
                <input 
                  placeholder="Subject name (e.g., Mathematics, English)" 
                  value={subjectName} 
                  onChange={(e) => setSubjectName(e.target.value)} 
                  required 
                />
                <button type="submit">Add Subject</button>
              </form>
            </div>
          </div>

          <div className="panel hover-lift">
            <div className="panel-header">
              <strong className="brand-accent">Available Subjects</strong>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              {subjects.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  No subjects yet. Add your first subject above.
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subject => (
                      <tr key={subject.id}>
                        <td>
                          {editingSubjectId === subject.id ? (
                            <input value={editSubjectName} onChange={(e) => setEditSubjectName(e.target.value)} />
                          ) : (
                            <strong>{subject.name}</strong>
                          )}
                        </td>
                        <td>
                          {editingSubjectId === subject.id ? (
                            <>
                              <button onClick={() => saveEditSubject(subject.id)} style={{ marginRight: '8px' }}>Save</button>
                              <button onClick={() => setEditingSubjectId(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditSubject(subject)} style={{ marginRight: '8px' }}>Edit</button>
                              <button onClick={() => removeSubject(subject.id)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
