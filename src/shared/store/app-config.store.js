import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppConfigStore = create(
  persist(
    (set) => ({
      theme:       'dark',      // 'light' | 'dark'
      language:    'en',
      ai: {
        model:        '',      // override from AdminAIPage; empty = use server default
        systemPrompt: '',
      },
      toggleTheme: () => set((s) => {
        const next = s.theme === 'dark' ? 'light' : 'dark'
        document.documentElement.classList.toggle('dark', next === 'dark')
        return { theme: next }
      }),
      setLanguage: (lang) => set({ language: lang }),
      setAIConfig: (cfg)  => set((s) => ({ ai: { ...s.ai, ...cfg } })),
    }),
    { name: 'app-config' }
  )
)
