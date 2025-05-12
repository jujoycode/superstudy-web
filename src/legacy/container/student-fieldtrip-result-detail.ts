import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { useFieldtripResultResend, useFieldtripsFindOne } from '@/legacy/generated/endpoint'
import { childState } from '@/stores'
import type { errorType } from '@/legacy/types'

type Props = {
  id: number
}

export function useFieldtripResultDetail({ id }: Props) {
  const { push } = useHistory()
  const [errorMessage, setErrorMessage] = useState('')
  const child = useRecoilValue(childState)

  const {
    data: fieldtrip,
    isLoading: isGetFieldtrip,
    isError: isGetFieldtripError,
  } = useFieldtripsFindOne(id, {
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const {
    mutateAsync: resendAlimtalkMutate,
    isLoading: isResendAlimtalk,
    isError: isResendAlimtalkError,
  } = useFieldtripResultResend({
    mutation: {
      onSuccess: () => {
        alert('결과보고서 알림톡이 재전송되었습니다.')
        push('/student/fieldtrip')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const resendAlimtalk = async () => {
    if (!fieldtrip) return

    const { id } = fieldtrip
    await resendAlimtalkMutate({ id })
  }

  const isLoading = isGetFieldtrip || isResendAlimtalk
  const isError = isGetFieldtripError || isResendAlimtalkError
  return {
    isLoading,
    isError,
    resendAlimtalk,
    fieldtrip,
    errorMessage,
  }
}
