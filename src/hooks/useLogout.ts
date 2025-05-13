// src/legacy/util/hooks.ts
import { useNavigate } from 'react-router'
import { useBrowserStorage } from '@/hooks/useBrowserStorage'
import { RN } from '@/legacy/lib/rn'
import { useAppStore } from '@/stores2/app'
import { useAuthStore } from '@/stores2/auth'

export function useAuth() {
  const token = useAppStore((state) => state.token)
  const twoFactor = useAppStore((state) => state.twoFactor)

  return { authenticated: token !== null, twoFactorAuthenticated: twoFactor !== null && twoFactor !== 'false' }
}

export function useLogout() {
  const { removeStorage } = useBrowserStorage()
  const resetAppState = useAppStore((state) => state.resetState)
  const setIsStayLoggedIn = useAuthStore((state) => state.setIsStayLoggedIn)
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
    resetAppState()
    setIsStayLoggedIn(false)

    navigate('/login')
  }
}
