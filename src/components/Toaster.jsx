import { useEffect, useState } from 'react'

// Simple global toast emitter
export function toast(message, type = 'success', timeout = 2500) {
  window.dispatchEvent(new CustomEvent('app_toast', { detail: { id: Date.now() + Math.random(), message, type, timeout } }))
}

export default function Toaster() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const onToast = (e) => {
      const { id, message, type, timeout } = e.detail
      setItems((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id))
      }, timeout || 2500)
    }
    window.addEventListener('app_toast', onToast)
    return () => window.removeEventListener('app_toast', onToast)
  }, [])

  const getToastStyles = (type) => {
    switch(type) {
      case 'error':
        return {
          background: '#ffebee',
          color: '#c62828',
          borderLeft: '4px solid #c62828'
        };
      case 'info':
        return {
          background: '#e3f2fd',
          color: '#0d47a1',
          borderLeft: '4px solid #1976d2'
        };
      default: // success
        return {
          background: '#e8f5e9',
          color: '#2e7d32',
          borderLeft: '4px solid #2e7d32'
        };
    }
  };

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000 }}>
      {items.map((t) => {
        const styles = getToastStyles(t.type);
        return (
          <div 
            key={t.id} 
            style={{ 
              ...styles,
              padding: '12px 16px', 
              borderRadius: 8, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontWeight: 500,
              minWidth: '240px',
              maxWidth: '400px'
            }}
          >
            {t.type === 'error' && <span style={{ marginRight: '8px' }}>⚠️</span>}
            {t.type === 'info' && <span style={{ marginRight: '8px' }}>ℹ️</span>}
            {t.type === 'success' && <span style={{ marginRight: '8px' }}>✅</span>}
            {t.message}
          </div>
        );
      })}
    </div>
  )
}
