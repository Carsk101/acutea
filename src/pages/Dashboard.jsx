import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({ 
    classes: 0, 
    students: 0, 
    assignments: 0, 
    categories: 0,
    avgGrade: 0,
    gradedAssignments: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [
        { data: classRows, error: cErr },
        { data: studentRows, error: sErr },
        { count: aCount, error: aErr },
        { data: categoryRows, error: catErr },
        { data: gradeRows, error: gErr }
      ] = await Promise.all([
        supabase.from('classes').select('*').order('created_at', { ascending: false }),
        supabase.from('students').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('assignments').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*').limit(20),
        supabase.from('grades').select('points_earned').gt('points_earned', 0)
      ])
      
      if (cErr || sErr || aErr || catErr || gErr) {
        console.error('Dashboard error:', cErr || sErr || aErr || catErr || gErr)
      }
      
      if (!mounted) return
      
      const avgGrade = gradeRows?.length > 0 
        ? gradeRows.reduce((sum, g) => sum + (g.points_earned || 0), 0) / gradeRows.length
        : 0
      
      setClasses(classRows || [])
      setStudents(studentRows || [])
      setCategories(categoryRows || [])
      setGrades(gradeRows || [])
      setStats({ 
        classes: (classRows || []).length, 
        students: (studentRows || []).length, 
        assignments: aCount || 0,
        categories: (categoryRows || []).length,
        avgGrade: Math.round(avgGrade * 10) / 10,
        gradedAssignments: (gradeRows || []).length
      })
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>📊 Dashboard</h2>
        <p className="text-muted">Overview of your gradebook system</p>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px',
        justifyItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto 32px auto'
      }}>
        <div className="panel stat-card hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong className="brand-accent">Total Classes</strong>
              <div className="stat-value">
                <span className="stat-icon">📚</span>
                {stats.classes}
              </div>
            </div>
          </div>
        </div>
        <div className="panel stat-card hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong className="brand-accent">Total Students</strong>
              <div className="stat-value">
                <span className="stat-icon">👥</span>
                {stats.students}
              </div>
            </div>
          </div>
        </div>
        <div className="panel stat-card hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong className="brand-accent">Assignments</strong>
              <div className="stat-value">
                <span className="stat-icon">✏️</span>
                {stats.assignments}
              </div>
            </div>
          </div>
        </div>
        <div className="panel stat-card hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong className="brand-accent">Categories</strong>
              <div className="stat-value">
                <span className="stat-icon">🗂️</span>
                {stats.categories}
              </div>
            </div>
          </div>
        </div>
        <div className="panel stat-card hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong className="brand-accent">Average Grade</strong>
              <div className="stat-value">
                <span className="stat-icon">📈</span>
                {stats.avgGrade > 0 ? `${stats.avgGrade}%` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
        <div className="panel stat-card hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong className="brand-accent">Graded Work</strong>
              <div className="stat-value">
                <span className="stat-icon">✅</span>
                {stats.gradedAssignments}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Quick Actions */}
        <div className="panel hover-lift">
          <div className="panel-header">
            <strong className="brand-accent">⚡ Quick Actions</strong>
          </div>
          <div className="panel-body">
            <div style={{ display: 'grid', gap: '12px' }}>
              <a href="/classes" className="class-pill" style={{ textDecoration: 'none' }}>
                <span className="class-icon">🏫</span>
                Manage Classes & Students
              </a>
              <a href="/categories" className="class-pill" style={{ textDecoration: 'none' }}>
                <span className="class-icon">🗂️</span>
                Setup Grade Categories
              </a>
              <a href="/grading" className="class-pill" style={{ textDecoration: 'none' }}>
                <span className="class-icon">✏️</span>
                Grade Assignments
              </a>
              <a href="/student-grades" className="class-pill" style={{ textDecoration: 'none' }}>
                <span className="class-icon">📊</span>
                View Student Progress
              </a>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="panel hover-lift">
          <div className="panel-header">
            <strong className="brand-accent">📋 System Status</strong>
          </div>
          <div className="panel-body">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Classes Setup</span>
                <span style={{ 
                  color: stats.classes > 0 ? '#2e7d32' : '#f57c00',
                  fontWeight: '600'
                }}>
                  {stats.classes > 0 ? '✅ Complete' : '⚠️ Pending'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Categories Configured</span>
                <span style={{ 
                  color: stats.categories > 0 ? '#2e7d32' : '#f57c00',
                  fontWeight: '600'
                }}>
                  {stats.categories > 0 ? '✅ Ready' : '⚠️ Setup Needed'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Students Enrolled</span>
                <span style={{ 
                  color: stats.students > 0 ? '#2e7d32' : '#f57c00',
                  fontWeight: '600'
                }}>
                  {stats.students > 0 ? '✅ Active' : '⚠️ Add Students'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Grading Activity</span>
                <span style={{ 
                  color: stats.gradedAssignments > 0 ? '#2e7d32' : '#d32f2f',
                  fontWeight: '600'
                }}>
                  {stats.gradedAssignments > 0 ? '✅ In Progress' : '❌ Not Started'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Overview */}
      <div className="panel hover-lift">
        <div className="panel-header">
          <strong className="brand-accent">🎓 Classes Overview</strong>
          <a href="/classes" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px' }}>
            View All →
          </a>
        </div>
        <div className="panel-body">
          {classes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No classes yet. <a href="/classes" style={{ color: 'var(--accent)' }}>Create your first class</a> to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {classes.slice(0, 6).map((c) => (
                <div key={c.id} className="class-pill" style={{ 
                  padding: '16px', 
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(149, 213, 178, 0.15), rgba(45, 106, 79, 0.08))'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="class-icon" style={{ fontSize: '20px' }}>🎒</span>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--accent)' }}>{c.name}</div>
                      {c.term && (
                        <div style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>{c.term}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Students */}
      {students.length > 0 && (
        <div className="panel hover-lift" style={{ marginTop: '24px' }}>
          <div className="panel-header">
            <strong className="brand-accent">👥 Recently Added Students</strong>
          </div>
          <div className="panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {students.slice(0, 8).map((student) => (
                <div key={student.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'rgba(149, 213, 178, 0.1)',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}>
                  <span>👤</span>
                  {student.first_name} {student.last_name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
