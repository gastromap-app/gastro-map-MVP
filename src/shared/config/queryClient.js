import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:         1000 * 60 * 5,  // 5 min
      gcTime:            1000 * 60 * 10, // 10 min
      retry:             1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (err) => console.error('[Mutation error]', err),
    },
  },
})

// Query key factory — single source of truth for all cache keys
export const keys = {
  locations:   { all: ['locations'], list: (f) => ['locations', 'list', f], detail: (id) => ['locations', id] },
  user:        { profile: (id) => ['user', id], favorites: (id) => ['favorites', id], visits: (id) => ['visits', id] },
  leaderboard: { all: ['leaderboard'] },
  submissions: { all: ['submissions'], mine: (uid) => ['submissions', 'mine', uid] },
  featureFlags:{ all: ['feature-flags'] },
  donations:   { all: ['donations'] },
}
