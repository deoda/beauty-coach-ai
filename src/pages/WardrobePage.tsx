import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import type { Language, WardrobeItem } from '../types'
import { getDemoWardrobe } from '../lib/ai'
import { isDemoMode, supabase } from '../lib/supabase'
import { useAuth } from '../App'

interface Props { language: Language }

export default function WardrobePage({ language }: Props) {
  const t = language === 'fr'
  const { user } = useAuth()
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadItems()
  }, [user])

  const loadItems = async () => {
    if (isDemoMode || !supabase || !user) {
      setItems(getDemoWardrobe())
      return
    }
    setLoading(true)
    const { data, error } = await supabase!
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) {
      const withUrls = await Promise.all(data.map(async (item: any) => {
        if (item.image_path) {
          const { data: urlData } = supabase!.storage.from('wardrobe').getPublicUrl(item.image_path)
          return { ...item, image_url: urlData.publicUrl }
        }
        return item
      }))
      setItems(withUrls)
    }
    setLoading(false)
  }

  const categories = ['all', 'Haut', 'Bas', 'Veste', 'Chaussures', 'Accessoires']
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>{t ? 'Ma garde-robe' : 'My Wardrobe'}</h1>
        <button className="btn" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => setShowForm(true)}>
          <Plus size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: '8px 14px', borderRadius: 20, border: 'none',
            background: filter === cat ? 'var(--violet)' : 'var(--soft)',
            color: filter === cat ? 'white' : 'var(--text)', whiteSpace: 'nowrap', cursor: 'pointer'
          }}>
            {cat === 'all' ? (t ? 'Tous' : 'All') : cat}
          </button>
        ))}
      </div>

      {loading && <p>{t ? 'Chargement...' : 'Loading...'}</p>}

      {filtered.length === 0 && !loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p>{t ? 'Aucun vêtement' : 'No clothes yet'}</p>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>
            {t ? 'Ajouter le premier' : 'Add the first one'}
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(item => (
            <div key={item.id} className="item-card">
              <div className="item-image">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : item.primary_color}
              </div>
              <div style={{ padding: 12 }}>
                <h3 style={{ fontSize: 16 }}>{item.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{item.category}</p>
                <span className={`badge ${item.status === 'available' ? 'badge-available' : 'badge-other'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddItemModal
          language={language}
          onClose={() => setShowForm(false)}
          onAdd={async (item) => {
            setItems(p => [item, ...p])
            setShowForm(false)
            if (!isDemoMode) await loadItems()
          }}
        />
      )}
    </div>
  )
}

function AddItemModal({ language, onClose, onAdd }: { language: Language; onClose: () => void; onAdd: (i: WardrobeItem) => void }) {
  const t = language === 'fr'
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Haut')
  const [color, setColor] = useState('Noir')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    let image_path: string | undefined
    let image_url: string | undefined

    if (file && supabase && user && !isDemoMode) {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('wardrobe').upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
      if (!upErr) {
        image_path = path
        const { data } = supabase.storage.from('wardrobe').getPublicUrl(path)
        image_url = data.publicUrl
      }
    } else if (preview) {
      image_url = preview
    }

    const newItem: WardrobeItem = {
      id: Date.now().toString(),
      user_id: user?.id || 'demo',
      name,
      category,
      primary_color: color,
      secondary_colors: [],
      style: 'Classique',
      formality_level: 'smart-casual',
      status: 'available',
      image_path,
      image_url,
      created_at: new Date().toISOString()
    }

    if (!isDemoMode && supabase && user) {
      await supabase.from('wardrobe_items').insert({
        user_id: user.id,
        name,
        category,
        primary_color: color,
        image_path,
        status: 'available'
      })
    }

    onAdd(newItem)
    setUploading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{t ? 'Ajouter un vêtement' : 'Add clothing item'}</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <input placeholder={t ? 'Nom' : 'Name'} value={name} onChange={e => setName(e.target.value)} required />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option>Haut</option><option>Bas</option><option>Veste</option><option>Chaussures</option><option>Accessoires</option>
          </select>
          <input placeholder={t ? 'Couleur principale' : 'Primary color'} value={color} onChange={e => setColor(e.target.value)} />
          <input type="file" accept="image/*" onChange={onFile} />
          {preview && <img src={preview} alt="preview" style={{ maxHeight: 160, borderRadius: 12, objectFit: 'cover' }} />}
          <button type="submit" className="btn" disabled={uploading}>
            {uploading ? (t ? 'Envoi...' : 'Uploading...') : (t ? 'Enregistrer' : 'Save')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>{t ? 'Annuler' : 'Cancel'}</button>
        </form>
      </div>
    </div>
  )
}
