import React, { useState, useEffect } from 'react'
import type { Language, Occasion, OutfitRecommendation, WardrobeItem } from '../types'
import { generateOutfit, getDemoWardrobe } from '../lib/ai'
import { isDemoMode, supabase } from '../lib/supabase'
import { useAuth } from '../App'

interface Props { language: Language }

const OCCASIONS = [
  { value: 'messe' as Occasion, fr: 'Messe / Célébration', en: 'Church' },
  { value: 'mariage' as Occasion, fr: 'Mariage', en: 'Wedding' },
  { value: 'travail' as Occasion, fr: 'Travail', en: 'Work' },
  { value: 'entretien' as Occasion, fr: 'Entretien', en: 'Interview' },
  { value: 'date' as Occasion, fr: 'Rendez-vous', en: 'Date' },
  { value: 'quotidien' as Occasion, fr: 'Quotidien', en: 'Everyday' },
  { value: 'sport' as Occasion, fr: 'Sport', en: 'Sport' },
  { value: 'traditionnel' as Occasion, fr: 'Traditionnel', en: 'Traditional' },
  { value: 'autre' as Occasion, fr: 'Autre', en: 'Other' }
]

export default function StylistPage({ language }: Props) {
  const t = language === 'fr'
  const { user } = useAuth()
  const [occasion, setOccasion] = useState<Occasion>('quotidien')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<OutfitRecommendation[]>([])
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([])

  useEffect(() => {
    const load = async () => {
      if (isDemoMode || !supabase || !user) {
        setWardrobe(getDemoWardrobe())
        return
      }
      const { data } = await supabase.from('wardrobe_items').select('*').eq('user_id', user.id)
      setWardrobe(data || [])
    }
    load()
  }, [user])

  const generate = async () => {
    setLoading(true)
    try {
      const recs = await generateOutfit(occasion, wardrobe, language)
      setResults(recs)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>{t ? 'Styliste IA' : 'AI Stylist'}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        {t ? 'Composez une tenue à partir de votre garde-robe.' : 'Compose an outfit from your wardrobe.'}
        {!isDemoMode && <span style={{ color: 'var(--success)', marginLeft: 8 }}>(Gemini)</span>}
      </p>

      <div className="card">
        <h3>{t ? 'Analyser une photo' : 'Analyze a photo'}</h3>
        <input type="file" accept="image/*" onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          if (isDemoMode || !supabase) {
            alert(t ? 'Analyse image (démo) : tenue élégante, score 85' : 'Image analysis (demo): elegant outfit, score 85')
            return
          }
          const reader = new FileReader()
          reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1]
            const { data } = await supabase!.functions.invoke('analyze-outfit', {
              body: { prompt: t ? 'Analyse cette tenue et donne un score sur 100 + une description courte.' : 'Analyze this outfit and give a score out of 100 + a short description.', imageBase64: base64 }
            })
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Pas de réponse'
            alert(text)
          }
          reader.readAsDataURL(file)
        }} />
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>{t ? 'Envoie une photo pour analyse Gemini' : 'Upload a photo for Gemini analysis'}</p>
      </div>

      <div className="card">
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>{t ? 'Occasion' : 'Occasion'}</label>
        <select value={occasion} onChange={e => setOccasion(e.target.value as Occasion)} style={{ marginBottom: 16 }}>
          {OCCASIONS.map(o => <option key={o.value} value={o.value}>{t ? o.fr : o.en}</option>)}
        </select>
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? (t ? 'Analyse...' : 'Analyzing...') : (t ? 'Proposer des tenues' : 'Suggest outfits')}
        </button>
      </div>

      {results.map(rec => (
        <div key={rec.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>
              {rec.id.startsWith('gemini') ? 'Suggestion Gemini' : (t ? 'Option recommandée' : 'Recommended option')}
            </h3>
            {rec.score !== undefined && (
              <span style={{ background: rec.score >= 80 ? 'var(--gold)' : 'var(--soft)', color: 'var(--black)', fontWeight: 700, padding: '6px 14px', borderRadius: 20, fontSize: 16 }}>
                {rec.score}/100
              </span>
            )}
          </div>
          <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{rec.explanation}</p>
          <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
            {rec.items.map(({ item, role }) => (
              <div key={item.id} style={{ textAlign: 'center', width: 80 }}>
                <div className="item-image" style={{ height: 72, borderRadius: 10, overflow: 'hidden' }}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : item.primary_color}
                </div>
                <p style={{ fontSize: 11, marginTop: 4 }}>{role}</p>
                <p style={{ fontSize: 10, color: 'var(--muted)' }}>{item.name}</p>
              </div>
            ))}
          </div>
          {rec.missingPieces && rec.missingPieces.length > 0 && (
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--warning)' }}>
              {t ? 'Manque : ' : 'Missing: '}{rec.missingPieces.join(', ')}
            </p>
          )}
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>{rec.colorHarmony}</p>
          {rec.score !== undefined && rec.score >= 80 && (
            <button className="btn btn-gold" style={{ marginTop: 12 }} onClick={async () => {
              if (isDemoMode || !supabase || !user) {
                alert(t ? 'Tenue publiée (démo)' : 'Published (demo)')
                return
              }
              await supabase.from('published_outfits').insert({
                user_id: user.id,
                occasion: rec.occasion,
                score: rec.score,
                explanation: rec.explanation,
                items: rec.items
              })
              alert(t ? 'Tenue publiée dans TOP OUTFITS' : 'Outfit published to TOP OUTFITS')
            }}>
              {t ? 'Publier dans TOP OUTFITS' : 'Publish to TOP OUTFITS'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
