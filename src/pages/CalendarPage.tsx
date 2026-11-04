import React, { useState, useEffect } from 'react'
import type { Language, CalendarEvent } from '../types'
import { isDemoMode, supabase } from '../lib/supabase'
import { useAuth } from '../App'

interface Props { language: Language }

export default function CalendarPage({ language }: Props) {
  const t = language === 'fr'
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [date, setDate] = useState('')
  const [occasion, setOccasion] = useState('quotidien')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    load()
  }, [user])

  const load = async () => {
    if (isDemoMode || !supabase || !user) {
      setEvents([
        { id: '1', user_id: 'demo', event_date: '2026-11-05', occasion: 'Réunion', notes: 'Blazer noir' },
        { id: '2', user_id: 'demo', event_date: '2026-11-08', occasion: 'Mariage', notes: 'Tenue formelle' }
      ])
      return
    }
    const { data } = await supabase.from('calendar_events').select('*').eq('user_id', user.id).order('event_date')
    setEvents(data || [])
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDemoMode || !supabase || !user) {
      setEvents(p => [...p, { id: Date.now().toString(), user_id: 'demo', event_date: date, occasion, notes }])
    } else {
      await supabase.from('calendar_events').insert({ user_id: user.id, event_date: date, occasion, notes })
      await load()
    }
    setDate(''); setOccasion('quotidien'); setNotes('')
  }

  return (
    <div>
      <h1>{t ? 'Calendrier' : 'Calendar'}</h1>
      <div className="card">
        <h3>{t ? 'Ajouter un événement' : 'Add event'}</h3>
        <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          <input placeholder={t ? 'Occasion' : 'Occasion'} value={occasion} onChange={e => setOccasion(e.target.value)} />
          <input placeholder={t ? 'Notes' : 'Notes'} value={notes} onChange={e => setNotes(e.target.value)} />
          <button className="btn" type="submit">{t ? 'Ajouter' : 'Add'}</button>
        </form>
      </div>
      {events.map(ev => (
        <div key={ev.id} className="card" style={{ padding: 12 }}>
          <strong>{ev.event_date}</strong> — {ev.occasion}
          {ev.notes && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{ev.notes}</p>}
        </div>
      ))}
    </div>
  )
}
