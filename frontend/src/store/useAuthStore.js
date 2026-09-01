import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isDemo: false, // New flag for mock mode

      setAuth: (user, token, refreshToken, isDemo = false) => set({ user, token, refreshToken, isDemo }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, refreshToken: null, isDemo: false }),
    }),
    { name: 'orb-auth' }
  )
)
