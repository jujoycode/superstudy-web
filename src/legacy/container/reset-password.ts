import { useState } from 'react'

// ! 개선 필요

import { useUserResetPassword } from '@/legacy/generated/endpoint'
import type { errorType } from '@/legacy/types'

export function useResetPassword() {
  const { push } = useHistory()
  const [errorMessage, setErrorMessage] = useState('')
  const { mutate, isLoading } = useUserResetPassword({
    mutation: {
      onSuccess: () => {
        alert('비밀번호 변경이 완료되었습니다. 다시 로그인해주세요.')
        push('/login')
      },
      onError: (err) => {
        const errorMsg: errorType | undefined = err?.response?.data ? (err?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  return { mutate, isLoading, errorMessage }
}
