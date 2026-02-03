import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from '../components/Toaster'

export default function StudentGrades() {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [students, setStudents] = useState([])
  const [categories, setCategories] = useState([])
  const [assignments, setAssignments] = useState([])
  const [grades, setGrades] = useState({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadClasses()
    loadSubjects()
  }, [])
  
  const loadClasses = async () => {
    const { data, error } = await supabase.from('classes').select('*')
    if (error) {
      toast('Failed to load classes', 'error')
      return
    }
    setClasses(data)
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
    
    // Set grades
    const newGrades = {}
    gradesData.forEach(g => {
      newGrades[`${g.student_id}_${g.assignment_id}`] = g.points_earned
    })
    
    setStudents(studentsData)
    setCategories(categoriesData)
    setAssignments(assignmentsData)
    setGrades(newGrades)
    setLoading(false)
  }
  
  const selectClass = (cls) => {
    setSelectedClass(cls)
    setSelectedSubject(null)
    setStudents([])
    setAssignments([])
    setGrades({})
  }
  
  const selectSubject = (subject) => {
    setSelectedSubject(subject)
    if (selectedClass) {
      loadClassData(selectedClass.id, subject.id)
    }
  }
  
  // Calculate student's category average
  const calculateCategoryAverage = (student, category) => {
    const categoryAssignments = assignments.filter(a => a.category_id === category.id)
    let totalWeightedScore = 0
    let totalWeight = 0
    
    categoryAssignments.forEach(assignment => {
      const score = grades[`${student.id}_${assignment.id}`]
      if (score !== undefined && score !== '') {
        totalWeightedScore += Number(score) * Number(assignment.weight)
        totalWeight += Number(assignment.weight)
      }
    })
    
    return totalWeight > 0 ? totalWeightedScore / totalWeight : null
  }
  
  // Calculate student's overall grade
  const calculateOverallGrade = (student) => {
    let totalWeightedCategoryScore = 0
    let totalCategoryWeight = 0
    
    categories.forEach(category => {
      const categoryAverage = calculateCategoryAverage(student, category)
      if (categoryAverage !== null) {
        totalWeightedCategoryScore += categoryAverage * Number(category.weight)
        totalCategoryWeight += Number(category.weight)
      }
    })
    
    return totalCategoryWeight > 0 ? totalWeightedCategoryScore / totalCategoryWeight : null
  }
  
  // Get letter grade based on percentage
  const getLetterGrade = (percentage) => {
    if (percentage === null) return '-'
    if (percentage >= 80) return 'A'
    if (percentage >= 65) return 'B'
    if (percentage >= 50) return 'C'
    return 'F'
  }
  
  // Get color based on percentage
  const getGradeColor = (percentage) => {
    if (percentage === null) return '#666'
    if (percentage >= 80) return '#28a745'
    if (percentage >= 65) return '#4d9221'
    if (percentage >= 50) return '#ffc107'
    return '#dc3545'
  }
  
  return (
    <div style={{ padding: '16px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>📊 Student Grades</h2>
      
      {/* Class & Subject Selection */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <strong>Select Class & Subject</strong>
        </div>
        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {classes.map(c => (
              <div 
                key={c.id} 
                className={`panel hover-lift ${selectedClass?.id === c.id ? 'selected' : ''}`}
                style={{ 
                  padding: '16px', 
                  cursor: 'pointer',
                  border: selectedClass?.id === c.id ? '2px solid var(--accent)' : '1px solid var(--glass-border)'
                }}
                onClick={() => selectClass(c)}
              >
                <strong>{c.name}</strong>
              </div>
            ))}
          </div>
          
          {selectedClass && (
            <div style={{ marginTop: '24px' }}>
              <h4>Select Subject</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                {subjects.map(subject => (
                  <button 
                    key={subject.id}
                    style={{ 
                      opacity: selectedSubject?.id === subject.id ? 1 : 0.7,
                      transform: selectedSubject?.id === subject.id ? 'scale(1.05)' : 'none'
                    }}
                    onClick={() => selectSubject(subject)}
                  >
                    <strong>{subject.name}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Student Grades Overview */}
      {selectedClass && selectedSubject && (
        <div className="panel hover-lift">
          <div className="panel-header" style={{ justifyContent: 'space-between' }}>
            <strong className="brand-accent">
              {selectedSubject.name} - {selectedClass.name} - Overall Grades
            </strong>
          </div>
          
          <div className="panel-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : categories.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                No categories defined. Please <a href="/categories">create categories</a> first.
              </div>
            ) : (
              <div className="matrix-wrapper">
                {/* Student count indicator */}
                <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  <div>
                    <strong>{students.length}</strong> students
                  </div>
                  {students.length > 15 && (
                    <div style={{ fontSize: '13px', color: 'var(--accent)' }}>
                      ⚡ Tip: Use browser search (Ctrl+F/Cmd+F) to find students quickly
                    </div>
                  )}
                </div>
                
                <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
                  <table className="table matrix-table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: '160px', position: 'sticky', top: 0, zIndex: 2 }}>Student</th>
                        {categories.map(category => (
                          <th key={category.id} style={{ minWidth: '140px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 1 }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px' }}>{category.name}</div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>{category.weight}% of grade</div>
                          </th>
                        ))}
                        <th style={{ minWidth: '120px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 1, background: 'rgba(240,255,240,0.95)' }}>
                          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Overall</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, i) => {
                        const overallGrade = calculateOverallGrade(student)
                        const formattedOverall = overallGrade !== null ? overallGrade.toFixed(1) : '-'
                        const letterGrade = getLetterGrade(overallGrade)
                        
                        return (
                          <tr key={student.id}>
                            <td style={{ position: 'sticky', left: 0, zIndex: 1 }}>
                              {student.first_name} {student.last_name}
                            </td>
                            {categories.map(category => {
                              const categoryAverage = calculateCategoryAverage(student, category)
                              const formattedAverage = categoryAverage !== null ? categoryAverage.toFixed(1) : '-'
                              
                              return (
                                <td key={category.id} style={{ textAlign: 'center' }}>
                                  <div style={{ 
                                    fontWeight: 'bold', 
                                    color: getGradeColor(categoryAverage)
                                  }}>
                                    {formattedAverage}
                                  </div>
                                </td>
                              )
                            })}
                            <td style={{ 
                              textAlign: 'center', 
                              fontWeight: 'bold'
                            }}>
                              <div style={{ 
                                fontSize: '18px', 
                                fontWeight: 'bold',
                                color: getGradeColor(overallGrade)
                              }}>
                                {formattedOverall}
                              </div>
                              <div style={{ 
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: getGradeColor(overallGrade),
                                marginTop: '4px'
                              }}>
                                {letterGrade}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
