import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Auth from './components/Auth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Classes from './pages/Classes'
import Students from './pages/Students'
import Categories from './pages/Categories'
import Grading from './pages/Grading'
import StudentGrades from './pages/StudentGrades'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import AccessibilityStatement from './pages/AccessibilityStatement'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route element={<ProtectedRoute />}> 
        <Route element={<Layout />}> 
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/students" element={<Students />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/grading" element={<Grading />} />
          <Route path="/student-grades" element={<StudentGrades />} />
        </Route>
      </Route>
      {/* Legal pages - accessible without authentication */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/accessibility" element={<AccessibilityStatement />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
