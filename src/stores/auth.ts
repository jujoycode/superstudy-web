// src/stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  isStayLoggedIn: boolean
  setIsStayLoggedIn: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isStayLoggedIn: localStorage.getItem('isStayLoggedIn') === 'true' || false,
      setIsStayLoggedIn: (value) => set({ isStayLoggedIn: value }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isStayLoggedIn: state.isStayLoggedIn }),
    },
  ),
)
