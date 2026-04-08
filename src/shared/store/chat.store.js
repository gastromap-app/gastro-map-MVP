import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useChatStore = create(
  persist(
    (set) => ({
      messages:    [],
      isStreaming: false,
      addMessage:  (msg) => set((s) => ({ messages: [...s.messages, { id: crypto.randomUUID(), ...msg, ts: Date.now() }] })),
      clearChat:   ()    => set({ messages: [] }),
      setStreaming: (v)  => set({ isStreaming: v }),
    }),
    { name: 'chat-storage', partialize: (s) => ({ messages: s.messages.slice(-50) }) }
  )
)
