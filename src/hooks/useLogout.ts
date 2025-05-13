// src/legacy/util/hooks.ts
import { useNavigate } from 'react-router'
import { useBrowserStorage } from '@/hooks/useBrowserStorage'
import { RN } from '@/legacy/lib/rn'
import { useAuthStore } from '@/stores2/auth'

export function useAuth() {
  const token = useAuthStore((state) => state.token)
  const twoFactor = useAuthStore((state) => state.twoFactor)

  return { authenticated: token !== null, twoFactorAuthenticated: twoFactor !== null && twoFactor !== 'false' }
}

export function useLogout() {
  const { removeStorage } = useBrowserStorage()
  const setIsStayLoggedIn = useAuthStore((state) => state.setIsStayLoggedIn)
  const resetAuthStore = useAuthStore((state) => state.reset)
  const navigate = useNavigate()

  return () => {
    const tagValue = { schoolId: null, role: null }
    RN.flareLane('setUserId', null)
    RN.flareLane('setTags', tagValue)
    removeStorage('token')
    removeStorage('refreshToken')
    removeStorage('two-factor')
    localStorage.removeItem('childToken')
    localStorage.removeItem('child-user-id')
    localStorage.removeItem('tabType')
    localStorage.removeItem('isStayLoggedIn')
    localStorage.removeItem('reqParent_userInfo')
    resetAuthStore()
    setIsStayLoggedIn(false)

    navigate('/login')
  }
}
