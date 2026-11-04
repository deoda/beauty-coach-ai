export type Language = 'fr' | 'en'

export interface Profile {
  id: string
  display_name: string
  preferred_language: Language
  style_preferences: string[]
  avatar_url?: string
  bio?: string
  is_admin?: boolean
}

export interface CalendarEvent {
  id: string
  user_id: string
  event_date: string
  occasion: string
  notes?: string
}

export interface PublishedOutfit {
  id: string
  user_id: string
  occasion: string
  score: number
  explanation: string
  items: any
  image_url?: string
  created_at: string
}

export interface UsageQuota {
  analyses_used: number
  analyses_limit: number
  uploads_used: number
  uploads_limit: number
}

export interface WardrobeItem {
  id: string
  user_id: string
  name: string
  category: string
  subcategory?: string
  primary_color: string
  secondary_colors: string[]
  pattern?: string
  style: string
  formality_level: 'casual' | 'smart-casual' | 'formal' | 'sport'
  image_path?: string
  image_url?: string
  status: 'available' | 'washing' | 'repair' | 'archived'
  notes?: string
  created_at: string
}

export interface OutfitRecommendation {
  id: string
  occasion: string
  items: { item: WardrobeItem; role: string }[]
  explanation: string
  colorHarmony: string
  formality: string
  missingPieces?: string[]
  score?: number
  published?: boolean
}

export type Occasion =
  | 'messe' | 'mariage' | 'travail' | 'entretien'
  | 'date' | 'quotidien' | 'sport' | 'traditionnel' | 'autre'
