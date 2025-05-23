import { useEffect, useState } from 'react'
import {
  useSchoolPropertyGetProperties,
  useUserLogin,
  useUserMe,
  useUserMeWithChildren,
} from '@/legacy/generated/endpoint'
import { Role } from '@/legacy/generated/model'
import { useBrowserStorage } from '@/legacy/hooks/useBrowserStorage'
import { useLogoutOnIdle } from '@/legacy/hooks/useLogoutOnIdle'
import { RN } from '@/legacy/lib/rn'
import { errorType } from '@/legacy/types'
import { isEmail } from '@/legacy/util/validator'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useSchoolStore } from '@/stores/school'
import { createContainer } from './createContainer'
import { useLogout } from '@/hooks/useLogout'

export function userHook() {
  const logout = useLogout()
  const { setStorage, getStorage } = useBrowserStorage()
  const { me, setMe, setChild } = useUserStore()
  const { token, isStayLoggedIn, setToken, setRefreshToken, setTwoFactor: setTwoFactorState } = useAuthStore()
  const { schoolProperties, setSchoolProperties } = useSchoolStore()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [errorCode, setErrorCode] = useState('')

  // 로그인 시 자동로그인 체크하지 않으면 30분 후 자동 로그아웃
  useLogoutOnIdle(logout, isStayLoggedIn, 30)

  const {
    data: meData,
    refetch: refetchMe,
    isLoading: isMeLoading,
  } = useUserMe({
    query: {
      queryKey: ['me'],
      onSuccess: (res) => {
        setMe(res)
        if (
          !res.school.enhancedSecurity &&
          (getStorage('two-factor') === null || getStorage('two-factor') === 'false')
        ) {
          setStorage('two-factor', 'true')
          setTwoFactorState('true')
        }
        if (res.role === Role.PARENT) {
          refetchMeWithChildren()
        }
        if (res.schoolId) {
          refetchSchoolProperties()
        }

        const tagValue = {
          schoolId: res?.schoolId,
          role: res?.role,
        }
        RN.flareLane('setUserId', res?.email)
        RN.flareLane('setTags', tagValue)
      },
      enabled: !!token && !me,
    },
  })

  const { refetch: refetchMeWithChildren, isLoading: isMeWithChildrenLoading } = useUserMeWithChildren({
    query: {
      enabled: !!token && !!meData,
      onSuccess: (parent) => {
        if (meData?.role !== Role.PARENT) {
          return
        }
        const localChildId = +(localStorage.getItem('child-user-id') || '0')
        const _child = !localChildId
          ? parent?.children?.[0]
          : parent?.children?.find((child) => child.id === localChildId)

        if (_child?.id) {
          localStorage.setItem('child-user-id', JSON.stringify(_child.id))
        }
        setChild(_child)
      },
    },
  })

  const { mutate: loginMutation } = useUserLogin({
    mutation: {
      onSuccess: (res) => {
        if (!res.token || !res.refresh_token) {
          throw new Error('No token')
        }
        setToken(res.token)
        setRefreshToken(res.refresh_token)
        setStorage('token', res.token)
        setStorage('refreshToken', res.refresh_token)
        refetchSchoolProperties()
      },
      onError: (err) => {
        const errorMsg: errorType | undefined = err?.response?.data as unknown as errorType

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
        setErrorCode(errorMsg?.code || '')
      },
    },
  })

  const handleLogin = (email: string, password: string) => {
    if (!isEmail(email)) {
      setErrorMessage('올바른 이메일 형식이 아닙니다.')
      return
    }
    loginMutation({ data: { email, password } })
  }

  const { refetch: refetchSchoolProperties } = useSchoolPropertyGetProperties({
    query: {
      enabled: !!token && !!meData?.schoolId,
      onSuccess: (data) => {
        setSchoolProperties(data)
      },
    },
  })

  useEffect(() => {
    if (!me && token) {
      refetchMe()
    }
  }, [])

  return {
    me,
    refetchMe,
    isMeLoading,
    handleLogin,
    errorMessage,
    errorCode,
    setErrorMessage,
    isMeWithChildrenLoading,
    schoolProperties,
    refetchSchoolProperties,
  }
}

export const UserContainer = createContainer(userHook)
