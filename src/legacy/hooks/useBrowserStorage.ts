import { useRecoilValue } from 'recoil'
import { isStayLoggedInState } from '@/stores'

const useBrowserStorage = () => {
  const isStayLoggedIn = useRecoilValue(isStayLoggedInState)

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

export { useBrowserStorage }
