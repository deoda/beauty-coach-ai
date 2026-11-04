import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Language } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface Props { language: Language }

export default function AuthPage({ language }: Props) {
  const t = language === 'fr'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="card">
        <h2>{t ? 'Authentification' : 'Authentication'}</h2>
        <p>{t ? 'Configurez Supabase dans .env.local pour activer l’inscription et la connexion.' : 'Configure Supabase in .env.local to enable signup and login.'}</p>
      </div>
    )
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    const fn = mode === 'signup' ? supabase!.auth.signUp : supabase!.auth.signInWithPassword
    const { error } = await fn({ email, password })
    if (error) setMessage(error.message)
    else {
      setMessage(t ? 'Succès !' : 'Success!')
      navigate('/')
    }
  }

  return (
    <div className="card">
      <h2>{mode === 'signup' ? (t ? 'Créer un compte' : 'Create account') : (t ? 'Connexion' : 'Sign in')}</h2>
      <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder={t ? 'Mot de passe' : 'Password'} value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="btn">{mode === 'signup' ? (t ? 'S’inscrire' : 'Sign up') : (t ? 'Se connecter' : 'Sign in')}</button>
      </form>
      <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? (t ? 'Créer un compte' : 'Create account') : (t ? 'J’ai déjà un compte' : 'I already have an account')}
      </button>
      {message && <p style={{ marginTop: 12, color: message.includes('Succès') || message.includes('Success') ? 'var(--success)' : 'var(--warning)' }}>{message}</p>}
    </div>
  )
}
