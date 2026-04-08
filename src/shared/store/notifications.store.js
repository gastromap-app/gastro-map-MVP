import { create } from 'zustand'

let _id = 0
export const useNotificationStore = create((set) => ({
  toasts: [],
  show: ({ type = 'info', message, duration = 3000 }) => {
    const id = ++_id
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), duration)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
