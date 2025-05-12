import { useState } from 'react'
import { useRecoilValue } from 'recoil'

// ! 개선 필요
import { useHistory } from '@/hooks/useHistory'

import { childState } from '@/stores'
import { useAbsentsDelete, useAbsentsFindOne, useAbsentsResend } from '@/legacy/generated/endpoint'
import type { errorType } from '@/legacy/types'

export function useStudentAbsentDetail(id: number) {
  const { push } = useHistory()
  const [errorMessage, setErrorMessage] = useState('')
  const child = useRecoilValue(childState)
  const {
    data: absent,
    error,
    isLoading: isGetAbsentLoading,
    refetch,
  } = useAbsentsFindOne(id, {
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const { mutate: deleteAbsentMutate, isLoading: isDeleteAbsentLoading } = useAbsentsDelete({
    mutation: {
      onSuccess: () => {
        alert('삭제되었습니다')
        push('/student/absent')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })
  const deleteAbsent = () => {
    deleteAbsentMutate({
      id,
    })
  }

  const { refetch: resendAlimtalk, isLoading: isResendAlimtalkLoading } = useAbsentsResend(id, {
    query: {
      enabled: false,
      onSuccess: () => {
        alert('신청서 알림톡이 재전송되었습니다.')
        push('/student/absent')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const isLoading = isGetAbsentLoading || isDeleteAbsentLoading || isResendAlimtalkLoading

  return {
    absent,
    error,
    isLoading,
    deleteAbsent,
    errorMessage,
    refetch,
    resendAlimtalk,
  }
}
