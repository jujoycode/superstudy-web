import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router'
import { useRecoilValue, useResetRecoilState } from 'recoil'
import { useSchoolPropertyGetProperties } from '@/legacy/generated/endpoint'
import { useBrowserStorage } from '@/legacy/hooks/useBrowserStorage'
import { RN } from '@/legacy/lib/rn'
import { childState, isStayLoggedInState, meState, refreshTokenState, tokenState, twoFactorState } from '@/stores'

export function useAuth() {
  const token = useRecoilValue(tokenState)
  const twoFactor = useRecoilValue(twoFactorState)

  return { authenticated: token !== null, twoFactorAutㅔhenticated: twoFactor !== null && twoFactor !== 'false' }
}

export function useLogout() {
  const { removeStorage } = useBrowserStorage()
  const resetToken = useResetRecoilState(tokenState)
  const resetRefreshToken = useResetRecoilState(refreshTokenState)
  const resetTwoFactor = useResetRecoilState(twoFactorState)
  const resetStayedLoggedIn = useResetRecoilState(isStayLoggedInState)
  const resetChild = useResetRecoilState(childState)
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
    resetToken()
    resetRefreshToken()
    resetTwoFactor()
    resetStayedLoggedIn()
    resetChild()

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
  const me = useRecoilValue(meState)

  const { data } = useSchoolPropertyGetProperties({
    query: {
      enabled: !!me?.schoolId,
    },
  })

  return data || {}
}
