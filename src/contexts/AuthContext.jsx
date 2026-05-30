import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { syncToSupabase, restoreFromSupabase } from '../lib/sync'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const next = session?.user ?? null
        setUser(next)

        if (next) {
          if (event === 'SIGNED_IN') {
            // Primeira entrada: sobe localStorage → Supabase
            await syncToSupabase(next.id)
          }
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            // Novo dispositivo: restaura do Supabase se localStorage vazio
            await restoreFromSupabase(next.id)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
