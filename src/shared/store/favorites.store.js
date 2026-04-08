import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      ids: [],
      isFavorite:     (id) => get().ids.includes(id),
      addFavorite:    (id) => set((s) => ({ ids: [...new Set([...s.ids, id])] })),
      removeFavorite: (id) => set((s) => ({ ids: s.ids.filter((i) => i !== id) })),
      toggleFavorite: (id) => get().isFavorite(id) ? get().removeFavorite(id) : get().addFavorite(id),
    }),
    { name: 'favorites-storage' }
  )
)
