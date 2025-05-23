// src/legacy/util/hooks.ts
import { useNavigate } from 'react-router'
import { useBrowserStorage } from '@/hooks/useBrowserStorage'
import { useAuthStore } from '@/stores/auth'
import { RN } from '@/legacy/lib/rn'

export function useAuth() {
  const token = useAuthStore((state) => state.token)
  const twoFactor = useAuthStore((state) => state.twoFactor)

  return { authenticated: token !== null, twoFactorAuthenticated: twoFactor !== null && twoFactor !== 'false' }
}

export function useLogout() {
  const { removeStorage } = useBrowserStorage()
  const navigate = useNavigate()
  const { resetAuthStore, setIsStayLoggedIn } = useAuthStore()

  return () => {
    const tagValue = { schoolId: null, role: null }
    RN.flareLane('setUserId', null)
    RN.flareLane('setTags', tagValue)
    removeStorage('token')
    removeStorage('refreshToken')
    removeStorage('twoFactor')
    localStorage.removeItem('isStayLoggedIn')
    localStorage.removeItem('childToken')
    localStorage.removeItem('child-user-id')
    localStorage.removeItem('tabType')
    localStorage.removeItem('reqParent_userInfo')
    resetAuthStore()
    setIsStayLoggedIn(false)

    navigate('/login')
  }
}
