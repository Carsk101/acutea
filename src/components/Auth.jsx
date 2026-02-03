import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Auth() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      if (data.session) navigate('/dashboard', { replace: true })
      setChecking(false)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/dashboard', { replace: true })
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  if (checking) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fffe 0%, #e8f5f0 100%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    )
  }

  const signIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/dashboard', { replace: true })
    setLoading(false)
  }

  const signUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else {
      setError('') 
      alert('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fffe 0%, #e8f5f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '300px',
        height: '300px',
        background: 'linear-gradient(135deg, rgba(149, 213, 178, 0.1), rgba(45, 106, 79, 0.05))',
        borderRadius: '50%',
        filter: 'blur(60px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(135deg, rgba(45, 106, 79, 0.08), rgba(149, 213, 178, 0.05))',
        borderRadius: '50%',
        filter: 'blur(40px)',
        zIndex: 0
      }} />

      {/* Main Auth Container */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(45, 106, 79, 0.1), 0 8px 32px rgba(149, 213, 178, 0.15)',
        border: '1px solid rgba(149, 213, 178, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            borderRadius: '20px',
            marginBottom: '20px',
            fontSize: '28px',
            color: 'white',
            boxShadow: '0 8px 24px rgba(45, 106, 79, 0.3)'
          }}>
            📚
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--accent)',
            marginBottom: '4px',
            letterSpacing: '-0.5px'
          }}>
            ACUTEA
          </h1>
          <div style={{
            color: 'var(--fg-muted)',
            fontSize: '11px',
            fontWeight: '500',
            marginBottom: '12px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            opacity: 0.8
          }}>
            Aiza's Classroom Utility for Tracking Education & Assessments
          </div>
          <p style={{
            color: 'var(--fg-muted)',
            fontSize: '15px',
            fontWeight: '400',
            margin: 0
          }}>
            {isSignUp ? 'Create your educator account' : 'Welcome back, educator'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={isSignUp ? signUp : signIn} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--accent)',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 46px',
                  border: '2px solid rgba(149, 213, 178, 0.2)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid var(--accent-pastel)'
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(45, 106, 79, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid rgba(149, 213, 178, 0.2)'
                  e.target.style.transform = 'translateY(0px)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--accent)',
                fontSize: '16px'
              }}>
                📧
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--accent)',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 46px',
                  border: '2px solid rgba(149, 213, 178, 0.2)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid var(--accent-pastel)'
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(45, 106, 79, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid rgba(149, 213, 178, 0.2)'
                  e.target.style.transform = 'translateY(0px)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--accent)',
                fontSize: '16px'
              }}>
                🔒
              </div>
            </div>
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            style={{
              width: '100%',
              padding: '16px',
              background: loading 
                ? 'rgba(149, 213, 178, 0.7)' 
                : 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading 
                ? 'none' 
                : '0 6px 20px rgba(45, 106, 79, 0.3)',
              transform: loading ? 'none' : 'translateY(0px)',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 25px rgba(45, 106, 79, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0px)'
                e.target.style.boxShadow = '0 6px 20px rgba(45, 106, 79, 0.3)'
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isSignUp ? '🚀 Create Account' : '🔓 Sign In'}
              </div>
            )}
          </button>
        </form>

        {/* Toggle Sign In/Sign Up */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              textDecoration: 'none',
              padding: '12px 20px',
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              boxShadow: '0 4px 15px rgba(45, 106, 79, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 6px 20px rgba(45, 106, 79, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0px)'
                e.target.style.boxShadow = '0 4px 15px rgba(45, 106, 79, 0.3)'
              }
            }}
          >
            {isSignUp 
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"
            }
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(248, 215, 218, 0.3))',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span style={{
              color: '#721c24',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {error}
            </span>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(149, 213, 178, 0.2)'
        }}>
          <p style={{
            color: 'var(--fg-muted)',
            fontSize: '13px',
            margin: 0
          }}>
            Secure educator platform • Built with 💚
          </p>
        </div>
      </div>
    </div>
  )
}
