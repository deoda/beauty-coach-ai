import React, { useState, useEffect } from 'react'
import type { Language, PublishedOutfit } from '../types'
import { isDemoMode, supabase } from '../lib/supabase'

interface Props { language: Language }

export default function AdminPage({ language }: Props) {
  const t = language === 'fr'
  const [outfits, setOutfits] = useState<PublishedOutfit[]>([])
  const [stats, setStats] = useState({ users: 0, outfits: 0, analyses: 0 })

  useEffect(() => {
    if (isDemoMode || !supabase) {
      setOutfits([
        { id: '1', user_id: 'demo', occasion: 'Mariage', score: 92, explanation: 'Look élégant', items: [], created_at: new Date().toISOString() }
      ])
      setStats({ users: 12, outfits: 34, analyses: 156 })
      return
    }
    supabase.from('published_outfits').select('*').order('created_at', { ascending: false }).limit(20).then(({ data }) => setOutfits(data || []))
    // Simple stats
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('published_outfits').select('id', { count: 'exact', head: true }),
      supabase.from('outfit_recommendations').select('id', { count: 'exact', head: true })
    ]).then(([u, o, a]) => {
      setStats({ users: u.count || 0, outfits: o.count || 0, analyses: a.count || 0 })
    })
  }, [])

  return (
    <div>
      <h1>{t ? 'Tableau de bord Admin' : 'Admin Dashboard'}</h1>
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center' }}><h2>{stats.users}</h2><p>{t ? 'Utilisateurs' : 'Users'}</p></div>
        <div className="card" style={{ textAlign: 'center' }}><h2>{stats.outfits}</h2><p>TOP OUTFITS</p></div>
        <div className="card" style={{ textAlign: 'center' }}><h2>{stats.analyses}</h2><p>{t ? 'Analyses' : 'Analyses'}</p></div>
      </div>
      <h2>{t ? 'Tenues publiées' : 'Published outfits'}</h2>
      {outfits.map(o => (
        <div key={o.id} className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{o.occasion}</strong>
            <span style={{ background: 'var(--gold)', padding: '2px 8px', borderRadius: 12 }}>{o.score}</span>
          </div>
          <p style={{ fontSize: 13, marginTop: 6 }}>{o.explanation}</p>
        </div>
      ))}
    </div>
  )
}
