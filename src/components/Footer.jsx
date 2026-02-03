import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer style={{
      padding: '20px',
      backgroundColor: 'rgba(245, 245, 245, 0.8)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--accent-pastel)',
      marginTop: 'auto',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <Link to="/privacy-policy" style={{
            color: 'var(--accent)',
            textDecoration: 'none',
            fontSize: '14px'
          }}>Privacy Policy</Link>
          <Link to="/terms-of-service" style={{
            color: 'var(--accent)',
            textDecoration: 'none',
            fontSize: '14px'
          }}>Terms of Service</Link>
          <Link to="/accessibility" style={{
            color: 'var(--accent)',
            textDecoration: 'none',
            fontSize: '14px'
          }}>Accessibility</Link>
        </div>
        
        <div style={{ fontSize: '12px', color: '#666' }}>
          <p>© {currentYear} ACUTEA Gradebook. All rights reserved.</p>
          <p style={{ marginTop: '5px' }}>
            This system is for authorized use only. Use of this system constitutes consent to monitoring.
          </p>
        </div>
      </div>
    </footer>
  )
}
