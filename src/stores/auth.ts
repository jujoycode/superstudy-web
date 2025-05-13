// src/stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  isStayLoggedIn: boolean
  token: string | null
  refreshToken: string | null
  twoFactor: string | null
  newsletterOpenedGroup: string[]
  newMsgCnt: number

  setIsStayLoggedIn: (value: boolean) => void
  setToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setTwoFactor: (value: string | null) => void
  setNewsletterOpenedGroup: (groups: string[]) => void
  setNewMsgCnt: (count: number) => void
  reset: () => void
}

const initialState = {
  isStayLoggedIn: typeof window !== 'undefined' ? localStorage.getItem('isStayLoggedIn') === 'true' : true,
  token: null,
  refreshToken: null,
  twoFactor: 'false',
  newsletterOpenedGroup: [],
  newMsgCnt: 0,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setIsStayLoggedIn: (isStayLoggedIn) => set({ isStayLoggedIn }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setTwoFactor: (twoFactor) => set({ twoFactor }),
      setNewsletterOpenedGroup: (newsletterOpenedGroup) => set({ newsletterOpenedGroup }),
      setNewMsgCnt: (newMsgCnt) => set({ newMsgCnt }),
      reset: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isStayLoggedIn: state.isStayLoggedIn,
        token: state.token,
        refreshToken: state.refreshToken,
        twoFactor: state.twoFactor,
        newsletterOpenedGroup: state.newsletterOpenedGroup,
      }),
    },
  ),
)

export const useBrowserStorage = () => {
  const isStayLoggedIn = useAuthStore((state) => state.isStayLoggedIn)

  const getStorage = (key: string) => {
    if (typeof window === 'undefined') return undefined
    return isStayLoggedIn ? localStorage.getItem(key) : sessionStorage.getItem(key)
  }

  const setStorage = (key: string, value: string) => {
    if (isStayLoggedIn) {
      localStorage.setItem(key, value)
      if (key === 'token') {
        localStorage.setItem('tokenIssue', new Date().toISOString())
      }
    } else {
      sessionStorage.setItem(key, value)
      localStorage.removeItem(key)
    }
  }

  const removeStorage = (key: string) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
    if (key === 'token') {
      localStorage.removeItem('tokenIssue')
    }
  }

  return { getStorage, setStorage, removeStorage }
}
