import React, { useState } from 'react'
import type { Language } from '../types'
import { isDemoMode, supabase } from '../lib/supabase'
import { useAuth } from '../App'
import { getDemoWardrobe } from '../lib/ai'

interface Props { language: Language }

type BeautyMode = 'wardrobe' | 'photo' | 'occasion' | 'face' | null

export default function BeautyPage({ language }: Props) {
  const t = language === 'fr'
  const { user } = useAuth()
  const [mode, setMode] = useState<BeautyMode>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [occasion, setOccasion] = useState('quotidien')

  const analyze = async (prompt: string, imageBase64?: string) => {
    setLoading(true)
    setResult('')
    try {
      if (isDemoMode || !supabase) {
        setResult(t
          ? `Rapport (démo)\n\nScore : 84/100\n\nÉvaluation : Tenue harmonieuse et adaptée.\n\nRecommandations : Ajouter une montre discrète.\n\nConseils : Privilégier des couleurs neutres.`
          : `Report (demo)\n\nScore: 84/100\n\nEvaluation: Harmonious and suitable outfit.\n\nRecommendations: Add a discreet watch.\n\nTips: Prefer neutral colors.`)
        return
      }
      const { data } = await supabase.functions.invoke('analyze-outfit', {
        body: { prompt, imageBase64 }
      })
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || (t ? 'Pas de réponse' : 'No response')
      setResult(text)
    } catch (e) {
      setResult(t ? 'Erreur lors de l’analyse' : 'Analysis error')
    } finally {
      setLoading(false)
    }
  }

  const modes = [
    { id: 'wardrobe' as const, icon: '👗', title: t ? 'Tenue garde-robe' : 'Wardrobe outfit', desc: t ? 'Analyser une tenue à partir de mes vêtements' : 'Analyze an outfit from my clothes' },
    { id: 'photo' as const, icon: '📸', title: t ? 'Photo habillée' : 'Dressed photo', desc: t ? 'Analyser une photo de moi habillé(e)' : 'Analyze a photo of me dressed' },
    { id: 'occasion' as const, icon: '✨', title: t ? '3 tenues pour une occasion' : '3 outfits for an occasion', desc: t ? 'Beauty Coach propose 3 tenues' : 'Beauty Coach suggests 3 outfits' },
    { id: 'face' as const, icon: '💄', title: t ? 'Analyse faciale' : 'Facial analysis', desc: t ? 'Maquillage & conseils visage' : 'Makeup & face advice' }
  ]

  return (
    <div>
      <h1>Beauty</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        {t ? 'Analyse, conseils et scores' : 'Analysis, advice and scores'}
      </p>

      {!mode && (
        <div className="grid-2">
          {modes.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} className="card" style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}>
              <div style={{ fontSize: 32 }}>{m.icon}</div>
              <h3 style={{ margin: '8px 0 4px' }}>{m.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{m.desc}</p>
            </button>
          ))}
        </div>
      )}

      {mode && (
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: 16, width: 'auto' }} onClick={() => { setMode(null); setResult('') }}>
            ← {t ? 'Retour' : 'Back'}
          </button>

          {mode === 'wardrobe' && (
            <div className="card">
              <h3>{t ? 'Analyser une tenue (garde-robe)' : 'Analyze outfit (wardrobe)'}</h3>
              <button className="btn" style={{ marginTop: 12 }} disabled={loading} onClick={() => {
                const items = getDemoWardrobe().map(i => i.name).join(', ')
                analyze(t
                  ? `Analyse cette tenue composée de : ${items}. Donne un score /100, une évaluation, des recommandations et des conseils.`
                  : `Analyze this outfit made of: ${items}. Give a score /100, evaluation, recommendations and tips.`)
              }}>
                {loading ? (t ? 'Analyse...' : 'Analyzing...') : (t ? 'Lancer l’analyse' : 'Start analysis')}
              </button>
            </div>
          )}

          {mode === 'photo' && (
            <div className="card">
              <h3>{t ? 'Analyser une photo de moi habillé(e)' : 'Analyze a dressed photo'}</h3>
              <input type="file" accept="image/*" style={{ margin: '12px 0' }} onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  const base64 = (reader.result as string).split(',')[1]
                  analyze(t
                    ? 'Analyse cette photo de personne habillée : fit, visage, coiffure, chaussures, accessoires, élégance globale. Donne un score /100, évaluation, recommandations et conseils.'
                    : 'Analyze this dressed person photo: fit, face, hairstyle, shoes, accessories, overall elegance. Give a score /100, evaluation, recommendations and tips.',
                    base64)
                }
                reader.readAsDataURL(file)
              }} />
            </div>
          )}

          {mode === 'occasion' && (
            <div className="card">
              <h3>{t ? '3 tenues pour une occasion' : '3 outfits for an occasion'}</h3>
              <select value={occasion} onChange={e => setOccasion(e.target.value)} style={{ margin: '12px 0' }}>
                <option value="quotidien">{t ? 'Quotidien' : 'Everyday'}</option>
                <option value="travail">{t ? 'Travail' : 'Work'}</option>
                <option value="mariage">{t ? 'Mariage' : 'Wedding'}</option>
                <option value="messe">{t ? 'Messe' : 'Church'}</option>
                <option value="date">{t ? 'Rendez-vous' : 'Date'}</option>
              </select>
              <button className="btn" disabled={loading} onClick={() => {
                const items = getDemoWardrobe().map(i => i.name).join(', ')
                analyze(t
                  ? `Propose exactement 3 tenues différentes pour l'occasion "${occasion}" en utilisant ces vêtements : ${items}. Pour chaque tenue, donne un score /100 et une courte description.`
                  : `Propose exactly 3 different outfits for "${occasion}" using these clothes: ${items}. For each outfit give a score /100 and a short description.`)
              }}>
                {loading ? (t ? 'Génération...' : 'Generating...') : (t ? 'Proposer 3 tenues' : 'Suggest 3 outfits')}
              </button>
            </div>
          )}

          {mode === 'face' && (
            <div className="card">
              <h3>{t ? 'Analyse faciale & maquillage' : 'Facial analysis & makeup'}</h3>
              <input type="file" accept="image/*" style={{ margin: '12px 0' }} onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  const base64 = (reader.result as string).split(',')[1]
                  analyze(t
                    ? 'Analyse ce visage : forme, teint, traits. Donne un score /100, une évaluation, des recommandations et des conseils de maquillage adaptés.'
                    : 'Analyze this face: shape, complexion, features. Give a score /100, evaluation, recommendations and suitable makeup advice.',
                    base64)
                }
                reader.readAsDataURL(file)
              }} />
            </div>
          )}

          {result && (
            <div className="card" style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>
              {result}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
