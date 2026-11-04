import type { WardrobeItem, OutfitRecommendation, Occasion } from '../types'
import { isDemoMode, supabase } from './supabase'

const DEMO_ITEMS: WardrobeItem[] = [
  { id: '1', user_id: 'demo', name: 'Chemise blanche', category: 'Haut', primary_color: 'Blanc', secondary_colors: [], style: 'Classique', formality_level: 'smart-casual', status: 'available', created_at: new Date().toISOString() },
  { id: '2', user_id: 'demo', name: 'Jean bleu', category: 'Bas', primary_color: 'Bleu', secondary_colors: [], style: 'Décontracté', formality_level: 'casual', status: 'available', created_at: new Date().toISOString() },
  { id: '3', user_id: 'demo', name: 'Blazer noir', category: 'Veste', primary_color: 'Noir', secondary_colors: [], style: 'Professionnel', formality_level: 'formal', status: 'available', created_at: new Date().toISOString() },
  { id: '4', user_id: 'demo', name: 'Chaussures noires', category: 'Chaussures', primary_color: 'Noir', secondary_colors: [], style: 'Classique', formality_level: 'formal', status: 'available', created_at: new Date().toISOString() }
]

export function getDemoWardrobe(): WardrobeItem[] {
  return [...DEMO_ITEMS]
}

export async function callGeminiEdgeFunction(prompt: string, imageBase64?: string): Promise<string> {
  if (isDemoMode || !supabase) {
    throw new Error('Demo mode')
  }
  const { data, error } = await supabase.functions.invoke('analyze-outfit', {
    body: { prompt, imageBase64 }
  })
  if (error) throw error
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  return text || 'Aucune réponse de Gemini'
}

export async function generateOutfit(
  occasion: Occasion,
  wardrobe: WardrobeItem[],
  language: 'fr' | 'en' = 'fr'
): Promise<OutfitRecommendation[]> {
  const available = wardrobe.filter(i => i.status === 'available')
  if (available.length === 0) {
    return [{
      id: 'empty',
      occasion,
      items: [],
      explanation: language === 'fr' ? 'Ajoutez des vêtements pour obtenir des suggestions.' : 'Add clothes to get suggestions.',
      colorHarmony: '',
      formality: ''
    }]
  }

  // Real Gemini call when Supabase is configured
  if (!isDemoMode && supabase) {
    const wardrobeDesc = available.map(i => `${i.name} (${i.category}, ${i.primary_color})`).join(', ')
    const prompt = language === 'fr'
      ? `Propose une tenue élégante pour l'occasion "${occasion}" en utilisant uniquement ces vêtements : ${wardrobeDesc}. 
Réponds exactement dans ce format :
SCORE: XX
EXPLICATION: ta description en 2-3 phrases.`
      : `Suggest an elegant outfit for "${occasion}" using only these clothes: ${wardrobeDesc}.
Reply exactly in this format:
SCORE: XX
EXPLANATION: your description in 2-3 sentences.`

    try {
      const text = await callGeminiEdgeFunction(prompt)
      const scoreMatch = text.match(/SCORE:\s*(\d+)/i)
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 75
      const explanation = text.replace(/SCORE:\s*\d+\s*/i, '').replace(/EXPLICATION:|EXPLANATION:/i, '').trim()
      const top = available.find(i => i.category === 'Haut') || available[0]
      const bottom = available.find(i => i.category === 'Bas') || available[1] || available[0]
      const shoes = available.find(i => i.category === 'Chaussures')
      const items = [
        { item: top, role: language === 'fr' ? 'Haut' : 'Top' },
        { item: bottom, role: language === 'fr' ? 'Bas' : 'Bottom' }
      ]
      if (shoes) items.push({ item: shoes, role: language === 'fr' ? 'Chaussures' : 'Shoes' })

      return [{
        id: 'gemini-1',
        occasion,
        items,
        explanation,
        colorHarmony: language === 'fr' ? 'Suggestion Gemini' : 'Gemini suggestion',
        formality: 'smart-casual',
        score
      }]
    } catch (e) {
      console.error('Gemini error', e)
      // fall through to demo
    }
  }

  // Demo fallback
  await new Promise(r => setTimeout(r, 800))
  const top = available.find(i => i.category === 'Haut') || available[0]
  const bottom = available.find(i => i.category === 'Bas') || available[1] || available[0]
  const shoes = available.find(i => i.category === 'Chaussures')
  const items = [
    { item: top, role: language === 'fr' ? 'Haut' : 'Top' },
    { item: bottom, role: language === 'fr' ? 'Bas' : 'Bottom' }
  ]
  if (shoes) items.push({ item: shoes, role: language === 'fr' ? 'Chaussures' : 'Shoes' })

  const texts = {
    fr: { messe: 'Tenue sobre et élégante.', mariage: 'Look festif et raffiné.', travail: 'Tenue professionnelle.', default: 'Combinaison harmonieuse à partir de vos vêtements.' },
    en: { messe: 'Sober and elegant outfit.', mariage: 'Festive refined look.', travail: 'Professional outfit.', default: 'Harmonious combination from your clothes.' }
  }
  const explanation = texts[language][occasion as keyof typeof texts.fr] || texts[language].default

  return [{
    id: 'demo-1',
    occasion,
    items,
    explanation,
    colorHarmony: language === 'fr' ? 'Couleurs neutres et harmonieuses' : 'Neutral harmonious colors',
    formality: 'smart-casual',
    missingPieces: shoes ? [] : [language === 'fr' ? 'Chaussures adaptées' : 'Suitable shoes'],
    score: 82
  }]
}
