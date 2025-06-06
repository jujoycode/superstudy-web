// src/legacy/util/hooks.ts
import { useBrowserStorage } from '@/hooks/useBrowserStorage'
import { useAuthStore } from '@/stores/auth'
import { useSchoolStore } from '@/stores/school'
import { useUserStore } from '@/stores/user'
import { RN } from '@/legacy/lib/rn'

export function useAuth() {
  const { token, twoFactor } = useAuthStore()
  return { authenticated: token !== null, twoFactorAuthenticated: twoFactor !== null && twoFactor !== 'false' }
}

export function useLogout() {
  const { removeStorage } = useBrowserStorage()
  const { reset: resetUserStore } = useUserStore()
  const { reset: resetAuthStore } = useAuthStore()
  const { reset: resetSchoolStore } = useSchoolStore()

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
    resetUserStore()
    resetSchoolStore()

    window.location.replace('/login')
  }
}
