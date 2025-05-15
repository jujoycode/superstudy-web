import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router'
import { useSchoolPropertyGetProperties } from '@/legacy/generated/endpoint'
import { RN } from '@/legacy/lib/rn'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

export function useAuth() {
  const { token, twoFactor } = useAuthStore()

  return { authenticated: token !== null, twoFactorAuthenticated: twoFactor !== null && twoFactor !== 'false' }
}

export function useLogout() {
  const { reset: resetAuth } = useAuthStore()
  const { setChild } = useUserStore()

  return () => {
    RN.flareLane('setUserId', null)
    RN.flareLane('setTags', { schoolId: null, role: null })

    // TODO: 직접 set 하는 부분 없에기
    localStorage.removeItem('childToken')
    localStorage.removeItem('child-user-id')
    localStorage.removeItem('tabType')
    localStorage.removeItem('reqParent_userInfo')
    // localStorage.removeItem('isStayLoggedIn')

    resetAuth()
    setChild(undefined)

    Navigate({ to: '/login' })
  }
}

/**
 * 이전 값을 저장하고 반환하는 커스텀 훅
 * @param value 현재 값
 * @returns 이전 값 (첫 렌더링 시에는 undefined)
 */
export function usePrevious<T>(value: T): T | undefined {
  const previousRef = useRef<T | undefined>(undefined)
  const currentRef = useRef<T | undefined>(undefined)

  useEffect(() => {
    previousRef.current = currentRef.current
    currentRef.current = value
  }, [value])

  return previousRef.current
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener('resize', handleResize)
      handleResize()

      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])
  return windowSize
}

/**
 * 학교 속성 정보를 가져오는 hook
 * @returns 학교 속성 정보 데이터
 */
export function useSchoolProperties() {
  const { me } = useUserStore()

  const { data } = useSchoolPropertyGetProperties({
    query: {
      enabled: !!me?.schoolId,
    },
  })

  return data || {}
}
