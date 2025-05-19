import { create } from 'zustand'

type AuthState = {
  isStayLoggedIn: boolean
  token: string | null
  refreshToken: string | null
  twoFactor: string | null

  setIsStayLoggedIn: (value: boolean) => void
  setToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setTwoFactor: (value: string | null) => void
  reset: () => void
}

// 브라우저 스토리지에서 초기값 가져오기
const getInitialState = () => {
  const isServer = typeof window === 'undefined'
  return {
    isStayLoggedIn: !isServer ? localStorage.getItem('isStayLoggedIn') === 'true' : true,
    token: !isServer ? localStorage.getItem('token') : null,
    refreshToken: !isServer ? localStorage.getItem('refreshToken') : null,
    twoFactor: !isServer ? localStorage.getItem('twoFactor') : null,
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  ...getInitialState(),

  setIsStayLoggedIn: (isStayLoggedIn) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isStayLoggedIn', String(isStayLoggedIn))
    }
    set({ isStayLoggedIn })
  },
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        const storage = useAuthStore.getState().isStayLoggedIn ? localStorage : sessionStorage
        storage.setItem('token', token)
        storage.setItem('tokenIssue', new Date().toISOString())
      } else {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        localStorage.removeItem('tokenIssue')
        sessionStorage.removeItem('tokenIssue')
      }
    }
    set({ token })
  },
  setRefreshToken: (refreshToken) => {
    if (typeof window !== 'undefined') {
      if (refreshToken) {
        const storage = useAuthStore.getState().isStayLoggedIn ? localStorage : sessionStorage
        storage.setItem('refreshToken', refreshToken)
      } else {
        localStorage.removeItem('refreshToken')
        sessionStorage.removeItem('refreshToken')
      }
    }
    set({ refreshToken })
  },
  setTwoFactor: (twoFactor) => {
    if (typeof window !== 'undefined') {
      if (twoFactor) {
        const storage = useAuthStore.getState().isStayLoggedIn ? localStorage : sessionStorage
        storage.setItem('twoFactor', twoFactor)
      } else {
        localStorage.removeItem('twoFactor')
        sessionStorage.removeItem('twoFactor')
      }
    }
    set({ twoFactor })
  },
  reset: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('twoFactor')
      localStorage.removeItem('tokenIssue')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('refreshToken')
      sessionStorage.removeItem('twoFactor')
      sessionStorage.removeItem('tokenIssue')
    }
    set(getInitialState())
  },
}))

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
