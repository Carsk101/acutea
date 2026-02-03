import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from '../components/Toaster'

function TotalWeightDisplay({ categories, onAddRemaining }) {
  const totalWeight = categories.reduce((sum, cat) => sum + Number(cat.weight), 0);
  const remaining = 100 - totalWeight;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>{totalWeight.toFixed(1)}%</span>
      {totalWeight !== 100 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          fontSize: '13px',
          padding: '2px 8px',
          borderRadius: '4px',
          background: totalWeight < 100 ? 'rgba(25, 118, 210, 0.1)' : 'rgba(220, 53, 69, 0.1)',
          color: totalWeight < 100 ? '#1976d2' : '#dc3545'
        }}>
          {totalWeight < 100 ? (
            <>
              <span>Need {remaining.toFixed(1)}% more</span>
              <button 
                style={{ 
                  padding: '2px 6px', 
                  fontSize: '12px',
                  marginLeft: '4px'
                }}
                onClick={() => onAddRemaining(remaining)}
              >
                Add Remaining
              </button>
            </>
          ) : (
            <span>Exceeds 100% by {Math.abs(remaining).toFixed(1)}%</span>
          )}
        </div>
      )}
      {totalWeight === 100 && (
        <span style={{ color: '#2e7d32', fontSize: '14px' }}>✓ Perfect!</span>
      )}
    </div>
  );
}

export default function Categories() {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // New category form
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('Other')
  const [newWeight, setNewWeight] = useState('33.3')
  
  // Edit state for categories
  const [editingCategory, setEditingCategory] = useState(null)
  const [editWeight, setEditWeight] = useState('')
  
  // Category types
  const categoryTypes = ['Exams', 'Quizzes', 'Assignments', 'Participation', 'Projects', 'Other']
  
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
    const { data, error } = await supabase.from('subjects').select('*')
    if (error) {
      toast('Failed to load subjects', 'error')
      return
    }
    setSubjects(data)
  }
  
  const loadCategories = async () => {
    if (!selectedClass || !selectedSubject) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('class_id', selectedClass.id)
      .eq('subject_id', selectedSubject.id)
    
    if (error) {
      toast('Failed to load categories', 'error')
      setLoading(false)
      return
    }
    
    setCategories(data || [])
    setLoading(false)
  }
  
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadCategories()
    } else {
      setCategories([])
    }
  }, [selectedClass, selectedSubject])
  
  const selectClass = (classObj) => {
    setSelectedClass(classObj)
    setSelectedSubject(null)
  }
  
  const selectSubject = (subject) => {
    setSelectedSubject(subject)
  }
  
  const addCategory = async (e) => {
    e.preventDefault()
    if (!selectedClass || !selectedSubject) return
    if (!newName.trim()) { toast('Name required', 'error'); return }
    
    const weight = Number(newWeight)
    if (Number.isNaN(weight) || weight <= 0 || weight > 100) { 
      toast('Weight must be between 0% and 100%', 'error')
      return 
    }
    
    // Calculate current total weight
    const currentTotal = categories.reduce((sum, cat) => sum + Number(cat.weight), 0)
    
    // If this is the first category or we're adding the final category to reach 100%
    const isCompletingTo100 = Math.abs((currentTotal + weight) - 100) < 0.01
    
    if (currentTotal + weight > 100) {
      toast(`Total weight cannot exceed 100% (current: ${currentTotal.toFixed(1)}%, adding: ${weight.toFixed(1)}%)`, 'error')
      return
    }
    
    // If we already have categories but this won't make it 100%, inform the user
    if (categories.length > 0 && !isCompletingTo100) {
      const remaining = 100 - (currentTotal + weight)
      toast(`Category added. Total now: ${(currentTotal + weight).toFixed(1)}%. You'll need ${remaining.toFixed(1)}% more to reach 100%.`, 'info')
    } else if (isCompletingTo100) {
      toast('Perfect! Categories now total exactly 100%', 'success')
    }
    
    const { error } = await supabase.from('categories').insert({
      class_id: selectedClass.id,
      subject_id: selectedSubject.id,
      name: newName.trim(),
      type: newType,
      weight
    })
    
    if (error) {
      console.error('Category creation error:', error)
      toast('Failed to add category: ' + error.message, 'error')
      return
    }
    
    setNewName('')
    setNewType('Other')
    setNewWeight('33.3')
    setShowNewCategory(false)
    loadCategories()
    toast('Category added')
  }
  
  const updateCategoryWeight = async (categoryId, newWeight) => {
    const weight = Number(newWeight)
    if (Number.isNaN(weight) || weight <= 0 || weight > 100) { 
      toast('Weight must be between 0% and 100%', 'error')
      return false
    }
    
    // Calculate current total weight excluding this category
    const currentTotal = categories
      .filter(cat => cat.id !== categoryId)
      .reduce((sum, cat) => sum + Number(cat.weight), 0)
    
    // Check if this update will make the total exactly 100%
    const isCompletingTo100 = Math.abs((currentTotal + weight) - 100) < 0.01
      
    if (currentTotal + weight > 100) {
      toast(`Total weight cannot exceed 100% (other categories: ${currentTotal}%, this: ${weight}%)`, 'error')
      return false
    }
    
    // If we have multiple categories but this won't make it 100%, warn the user
    if (categories.length > 1 && !isCompletingTo100) {
      const remaining = 100 - (currentTotal + weight)
      toast(`Note: After this update, total weight will be ${currentTotal + weight}%. You need to adjust other categories by ${remaining.toFixed(1)}% to reach 100%`, 'info')
    }
    
    const { error } = await supabase
      .from('categories')
      .update({ weight })
      .eq('id', categoryId)
      
    if (error) {
      toast('Failed to update weight', 'error')
      return false
    }
    
    loadCategories()
    toast('Weight updated')
    return true
  }
  
  const deleteCategory = async (categoryId) => {
    // Check if category has assignments
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id')
      .eq('category_id', categoryId)
      
    if (assignments && assignments.length > 0) {
      toast(`Cannot delete: Category has ${assignments.length} assignments`, 'error')
      return
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      
    if (error) {
      toast('Failed to delete category', 'error')
      return
    }
    
    loadCategories()
    toast('Category deleted')
  }
  
  const calculateRemainingWeight = () => {
    const currentTotal = categories.reduce((sum, cat) => sum + Number(cat.weight), 0)
    return Math.max(0, 100 - currentTotal).toFixed(1)
  }
  
  return (
    <div style={{ padding: '16px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>📊 Grade Categories</h2>
      
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
                {subjects.map(s => (
                  <button 
                    key={s.id}
                    style={{ 
                      opacity: selectedSubject?.id === s.id ? 1 : 0.7,
                      transform: selectedSubject?.id === s.id ? 'scale(1.05)' : 'none'
                    }}
                    onClick={() => selectSubject(s)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Categories Management */}
      {selectedClass && selectedSubject && (
        <div className="panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>
              Categories for {selectedSubject.name} - {selectedClass.name}
            </strong>
            <button onClick={() => setShowNewCategory(!showNewCategory)}>
              {showNewCategory ? 'Cancel' : '+ Add Category'}
            </button>
          </div>
          
          {/* New Category Form */}
          {showNewCategory && (
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <form onSubmit={addCategory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
                <input 
                  placeholder="Category name" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  required 
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                >
                  {categoryTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input 
                  placeholder="Weight (%)" 
                  value={newWeight} 
                  onChange={(e) => setNewWeight(e.target.value)} 
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <button type="submit">Add</button>
              </form>
              <div style={{ marginTop: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Remaining weight: {calculateRemainingWeight()}%</span>
                <div style={{ marginTop: '4px' }}>
                  {categories.length === 0 ? (
                    'You can add categories with any weight to start. The total should eventually sum to 100%.'
                  ) : calculateRemainingWeight() > 0 ? (
                    <span>Add more categories until the total reaches 100%. <strong>{calculateRemainingWeight()}%</strong> remaining.</span>
                  ) : (
                    <span style={{ color: '#2e7d32' }}>✓ Perfect! Categories total 100%</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="panel-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : categories.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                No categories yet. Click "Add Category" to get started.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Weight</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{category.type}</td>
                        <td>
                          {editingCategory === category.id ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input
                                style={{ width: '60px' }}
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                                onBlur={async () => {
                                  const success = await updateCategoryWeight(category.id, editWeight)
                                  if (success) {
                                    setEditingCategory(null)
                                    setEditWeight('')
                                  }
                                }}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    const success = await updateCategoryWeight(category.id, editWeight)
                                    if (success) {
                                      setEditingCategory(null)
                                      setEditWeight('')
                                    }
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCategory(null)
                                    setEditWeight('')
                                  }
                                }}
                                autoFocus
                              />
                              <button
                                style={{ fontSize: '12px', padding: '4px 8px' }}
                                onClick={async () => {
                                  const success = await updateCategoryWeight(category.id, editWeight)
                                  if (success) {
                                    setEditingCategory(null)
                                    setEditWeight('')
                                  }
                                }}
                              >
                                ✓
                              </button>
                              <button
                                style={{ fontSize: '12px', padding: '4px 8px' }}
                                onClick={() => {
                                  setEditingCategory(null)
                                  setEditWeight('')
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span>{category.weight}%</span>
                              <button
                                style={{ fontSize: '12px', padding: '4px 8px' }}
                                onClick={() => {
                                  setEditingCategory(category.id)
                                  setEditWeight(category.weight.toString())
                                }}
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          <button 
                            onClick={() => deleteCategory(category.id)}
                            style={{ 
                              background: 'var(--error)', 
                              color: 'white', 
                              fontSize: '12px' 
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                    <td colSpan="2" style={{ fontWeight: 'bold' }}>
                      <TotalWeightDisplay 
                        categories={categories}
                        onAddRemaining={(remaining) => {
                          setNewWeight(remaining.toFixed(1));
                          setShowNewCategory(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
