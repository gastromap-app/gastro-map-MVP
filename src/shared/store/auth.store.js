import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/shared/api/client'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      session:         null,
      isAuthenticated: false,
      isLoading:       true,

      init: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        set({ session, user: session?.user ?? null, isAuthenticated: !!session, isLoading: false })

        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null, isAuthenticated: !!session })
        })
      },

      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        set({ session: data.session, user: data.user, isAuthenticated: true })
        return data
      },

      signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/dashboard` }
        })
        if (error) throw error
      },

      signUp: async (email, password, name) => {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name } }
        })
        if (error) throw error
        return data
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, isAuthenticated: false })
      },

      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, session: s.session, isAuthenticated: s.isAuthenticated }) }
  )
)
