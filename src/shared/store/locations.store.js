import { create } from 'zustand'

export const useLocationsStore = create((set, get) => ({
  locations:  [],
  filters:    { category: '', cuisine_types: [], price_range: [], min_rating: 0, dietary_options: [], tags: [] },
  city:       'Krakow',

  setLocations: (locations) => set({ locations }),
  setCity:      (city)      => set({ city }),
  setFilters:   (filters)   => set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: ()          => set({ filters: { category: '', cuisine_types: [], price_range: [], min_rating: 0, dietary_options: [], tags: [] } }),

  /** Used by AI tool: search_locations */
  searchForAI: ({ city, cuisine_types, tags, category, price_range, dietary_options, min_rating, keyword, max_results = 5 }) => {
    return get().locations.filter((loc) => {
      if (city && loc.city?.toLowerCase() !== city.toLowerCase()) return false
      if (category && loc.category !== category) return false
      if (cuisine_types?.length && !cuisine_types.some((c) => loc.cuisine_types?.includes(c))) return false
      if (tags?.length && !tags.some((t) => loc.tags?.includes(t))) return false
      if (price_range?.length && !price_range.includes(loc.price_range)) return false
      if (dietary_options?.length && !dietary_options.every((d) => loc.dietary_options?.includes(d))) return false
      if (min_rating && (loc.google_rating || 0) < min_rating) return false
      if (keyword) {
        const kw = keyword.toLowerCase()
        const searchable = `${loc.title} ${loc.description} ${loc.ai_context} ${loc.ai_keywords?.join(' ')}`.toLowerCase()
        if (!searchable.includes(kw)) return false
      }
      return true
    }).slice(0, max_results)
  },
}))
