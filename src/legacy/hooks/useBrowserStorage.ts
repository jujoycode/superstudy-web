import { useAuthStore } from '@/stores2/auth'

/**
 * 브라우저 스토리지(localStorage/sessionStorage)를 관리하는 훅
 * isStayLoggedIn 상태에 따라 localStorage 또는 sessionStorage를 사용합니다.
 */
const useBrowserStorage = () => {
  // Zustand에서 로그인 유지 상태값 가져오기
  const { isStayLoggedIn } = useAuthStore()

  // 스토리지에서 값 가져오기
  const getStorage = (key: string) => {
    if (typeof window === 'undefined') return undefined
    return isStayLoggedIn ? localStorage.getItem(key) : sessionStorage.getItem(key)
  }

  // 스토리지에 값 저장하기
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

  // 스토리지에서 값 제거하기
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
