import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Home, Shirt, Sparkles, User, Star } from 'lucide-react'
import HomePage from './pages/HomePage'
import WardrobePage from './pages/WardrobePage'
import StylistPage from './pages/StylistPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'
import CalendarPage from './pages/CalendarPage'
import AdminPage from './pages/AdminPage'
import BeautyPage from './pages/BeautyPage'
import { isDemoMode, supabase } from './lib/supabase'
import type { Language } from './types'
import './App.css'

interface AuthContextType {
  user: any | null
  loading: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signOut: () => {} })
export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode || !supabase) {
      setUser({ id: 'demo', email: 'demo@beautycoach.ai' })
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}

export default function App() {
  const [language, setLanguage] = useState<Language>('fr')
  const [showDemo, setShowDemo] = useState(isDemoMode)

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          {showDemo && (
            <div className="demo-banner">
              {language === 'fr' ? 'Mode démo — Connectez Supabase pour la sauvegarde et Gemini' : 'Demo mode — Connect Supabase for saving & Gemini'}
              <button onClick={() => setShowDemo(false)}>×</button>
            </div>
          )}
          <main className="main">
            <Routes>
              <Route path="/" element={<HomePage language={language} />} />
              <Route path="/wardrobe" element={<WardrobePage language={language} />} />
              <Route path="/stylist" element={<StylistPage language={language} />} />
              <Route path="/profile" element={<ProfilePage language={language} setLanguage={setLanguage} />} />
              <Route path="/auth" element={<AuthPage language={language} />} />
              <Route path="/calendar" element={<CalendarPage language={language} />} />
              <Route path="/admin" element={<AdminPage language={language} />} />
              <Route path="/beauty" element={<BeautyPage language={language} />} />
            </Routes>
          </main>
          <nav className="bottom-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              <Home size={22} /><span>{language === 'fr' ? 'Accueil' : 'Home'}</span>
            </NavLink>
            <NavLink to="/wardrobe" className={({ isActive }) => isActive ? 'active' : ''}>
              <Shirt size={22} /><span>{language === 'fr' ? 'Garde-robe' : 'Wardrobe'}</span>
            </NavLink>
            <NavLink to="/stylist" className={({ isActive }) => isActive ? 'active' : ''}>
              <Sparkles size={22} /><span>{language === 'fr' ? 'Styliste' : 'Stylist'}</span>
            </NavLink>
            <NavLink to="/beauty" className={({ isActive }) => isActive ? 'active' : ''}>
              <Star size={22} /><span>Beauty</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
              <User size={22} /><span>{language === 'fr' ? 'Profil' : 'Profile'}</span>
            </NavLink>
          </nav>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
