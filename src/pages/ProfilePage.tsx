import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Language, Profile, UsageQuota } from '../types'
import { isDemoMode, supabase } from '../lib/supabase'
import { useAuth } from '../App'

interface Props { language: Language; setLanguage: (l: Language) => void }

export default function ProfilePage({ language, setLanguage }: Props) {
  const t = language === 'fr'
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [quota, setQuota] = useState<UsageQuota | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (isDemoMode || !supabase || !user) {
      setProfile({ display_name: 'Demo User', bio: 'Mode démo', preferred_language: language })
      setQuota({ analyses_used: 3, analyses_limit: 20, uploads_used: 5, uploads_limit: 50 })
      return
    }
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) {
        setProfile(data)
        setDisplayName(data.display_name || '')
        setBio(data.bio || '')
      }
    })
    supabase.from('usage_quotas').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) setQuota(data)
    })
  }, [user, language])

  const save = async () => {
    if (isDemoMode || !supabase || !user) return
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: displayName,
      bio,
      preferred_language: language
    })
    alert(t ? 'Profil enregistré' : 'Profile saved')
  }

  return (
    <div>
      <h1>{t ? 'Profil & Paramètres' : 'Profile & Settings'}</h1>

      <div className="card">
        <h3>{t ? 'Informations' : 'Information'}</h3>
        <input placeholder={t ? 'Nom affiché' : 'Display name'} value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ marginBottom: 8 }} />
        <textarea placeholder={t ? 'Bio' : 'Bio'} value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ marginBottom: 8 }} />
        <button className="btn" onClick={save}>{t ? 'Enregistrer' : 'Save'}</button>
      </div>

      {quota && (
        <div className="card">
          <h3>{t ? 'Quotas' : 'Quotas'}</h3>
          <p>{t ? 'Analyses' : 'Analyses'}: {quota.analyses_used} / {quota.analyses_limit}</p>
          <p>{t ? 'Uploads' : 'Uploads'}: {quota.uploads_used} / {quota.uploads_limit}</p>
        </div>
      )}

      <div className="card">
        <h3>{t ? 'Langue' : 'Language'}</h3>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className={`btn ${language === 'fr' ? '' : 'btn-secondary'}`} style={{ width: 'auto', flex: 1 }} onClick={() => setLanguage('fr')}>Français</button>
          <button className={`btn ${language === 'en' ? '' : 'btn-secondary'}`} style={{ width: 'auto', flex: 1 }} onClick={() => setLanguage('en')}>English</button>
        </div>
      </div>

      <div className="card">
        <h3>{t ? 'Compte' : 'Account'}</h3>
        <p>{user?.email || (t ? 'Mode démo' : 'Demo mode')}</p>
        {user && user.id !== 'demo' && (
          <button className="btn btn-secondary" onClick={signOut} style={{ marginTop: 8 }}>{t ? 'Se déconnecter' : 'Sign out'}</button>
        )}
        {!isDemoMode && profile.is_admin && (
          <Link to="/admin" className="btn" style={{ marginTop: 12, display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            {t ? 'Tableau de bord Admin' : 'Admin Dashboard'}
          </Link>
        )}
        <Link to="/admin" className="btn btn-secondary" style={{ marginTop: 12, display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          {t ? 'Voir le dashboard Admin (démo)' : 'View Admin dashboard (demo)'}
        </Link>
      </div>
    </div>
  )
}
