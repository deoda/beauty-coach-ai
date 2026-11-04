import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Sparkles, Calendar, ChevronRight } from 'lucide-react'
import type { Language } from '../types'
import { useAuth } from '../App'
import { getDemoWardrobe } from '../lib/ai'

interface Props { language: Language }

export default function HomePage({ language }: Props) {
  const t = language === 'fr'
  const { user } = useAuth()
  const wardrobe = getDemoWardrobe().slice(0, 4)

  const demoOutfits = [
    { date: t ? 'Demain' : 'Tomorrow', occasion: t ? 'Réunion professionnelle' : 'Professional meeting', items: 'Chemise blanche + Blazer noir + Jean bleu' },
    { date: t ? 'Samedi' : 'Saturday', occasion: t ? 'Mariage' : 'Wedding', items: 'Robe noire + Escarpins + Collier' },
    { date: t ? 'Lundi' : 'Monday', occasion: t ? 'Quotidien' : 'Everyday', items: 'T-shirt gris + Jean + Baskets' },
    { date: t ? 'Vendredi' : 'Friday', occasion: t ? 'Sortie amis' : 'Friends outing', items: 'Chemise bleue + Pantalon beige' }
  ]

  const topOutfits = [
    { score: 92, items: 'Blazer noir + Chemise blanche + Jean', user: 'Demo' },
    { score: 88, items: 'Robe élégante + Escarpins', user: 'Demo' },
    { score: 85, items: 'Costume + Chemise + Cravate', user: 'Demo' }
  ]

  return (
    <div>
      <h1>{t ? `Bonjour${user?.email ? ' ' + user.email.split('@')[0] : ''} 👋` : `Hello${user?.email ? ' ' + user.email.split('@')[0] : ''} 👋`}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        {t ? 'Votre coach personnel de beauté et de style' : 'Your personal beauty & style coach'}
      </p>

      {/* Ma garde-robe */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>{t ? 'Ma garde-robe' : 'My Wardrobe'}</h2>
        <Link to="/wardrobe" style={{ color: 'var(--violet)', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          {t ? 'Voir tout' : 'See all'} <ChevronRight size={16} />
        </Link>
      </div>
      <Link to="/wardrobe" className="btn btn-secondary" style={{ marginBottom: 12, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
        <Plus size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        {t ? 'Ajouter un vêtement' : 'Add a clothing item'}
      </Link>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {wardrobe.map(item => (
            <div key={item.id} style={{ textAlign: 'center' }}>
              <div className="item-image" style={{ height: 72, borderRadius: 10, fontSize: 12 }}>{item.primary_color}</div>
              <p style={{ fontSize: 11, marginTop: 4, color: 'var(--muted)' }}>{item.name}</p>
            </div>
          ))}
        </div>
        <Link to="/wardrobe" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: 'var(--violet)', fontSize: 14, textDecoration: 'none' }}>
          More...
        </Link>
      </div>

      {/* Mes Tenues */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 8px' }}>
        <h2 style={{ margin: 0 }}>{t ? 'Mes Tenues' : 'My Outfits'}</h2>
        <Link to="/stylist" style={{ color: 'var(--violet)', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          {t ? 'Voir tout' : 'See all'} <ChevronRight size={16} />
        </Link>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Link to="/stylist" className="btn" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>
          <Sparkles size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {t ? 'Composer une tenue' : 'Compose an outfit'}
        </Link>
        <Link to="/calendar" className="btn btn-secondary" style={{ width: 'auto', padding: '13px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={18} />
          {t ? 'Calendrier' : 'Calendar'}
        </Link>
      </div>

      <div className="card" style={{ padding: 12 }}>
        {demoOutfits.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
            <div className="item-image" style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 10 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>{o.date} • {o.occasion}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{o.items}</p>
            </div>
          </div>
        ))}
        <Link to="/stylist" style={{ display: 'block', textAlign: 'center', marginTop: 8, color: 'var(--violet)', fontSize: 14, textDecoration: 'none' }}>
          More...
        </Link>
      </div>

      {/* TOP OUTFITS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 8px' }}>
        <h2 style={{ margin: 0 }}>TOP OUTFITS</h2>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{t ? 'Meilleures notes IA' : 'Best AI scores'}</span>
      </div>
      <div className="card">
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          {t
            ? 'Zone où les utilisateurs peuvent publier leurs tenues les mieux notées après analyse.'
            : 'Area where users can publish their highest-rated outfits after analysis.'}
        </p>
        {topOutfits.map((o, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
            <div>
              <p style={{ fontWeight: 600 }}>{o.items}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{o.user}</p>
            </div>
            <span style={{ background: 'var(--gold)', color: 'var(--black)', fontWeight: 700, padding: '4px 10px', borderRadius: 20, fontSize: 14 }}>
              {o.score}
            </span>
          </div>
        ))}
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 14, color: 'var(--violet)' }}>More...</p>
      </div>
    </div>
  )
}
