import { useState } from 'react'
import {
  useFieldtripsDeny,
  useFieldtripsFindOne,
  useFieldtripsRequestDelete,
  useFieldtripsResend,
} from '@/legacy/generated/endpoint'
import { errorType } from '@/legacy/types'

interface UseFieldtripDetailProps {
  id: string
}

export function useTeacherFieldtripDetail({ id }: UseFieldtripDetailProps) {
  const [deleteAppeal, setDeleteAppeal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deny, setDeny] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    data: fieldtrip,
    isLoading,
    refetch,
  } = useFieldtripsFindOne(Number(id), {
    query: {
      onError: () => {
        setErrorMessage('이미 삭제되었거나 더 이상 유효하지 않습니다.')
      },
    },
  })

  const { mutate: denyFieldtrip } = useFieldtripsDeny({
    mutation: {
      onSuccess: () => {
        setDeny(false)
        setLoading(false)
      },
      onError: (e) => {
        setLoading(false)
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined
        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const { mutate: deleteAppealFieldtrip } = useFieldtripsRequestDelete({
    mutation: {
      onSuccess: () => {
        setDeleteAppeal(false)
        setLoading(false)
      },
      onError: (error) => {
        setLoading(false)
        const errorMsg: errorType | undefined = error?.response?.data ? (error?.response?.data as errorType) : undefined
        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const { refetch: resendAlimtalk } = useFieldtripsResend(Number(id), {
    query: {
      enabled: false,
      onSuccess: () => {
        alert('신청서 알림톡이 재전송되었습니다.')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  return {
    // api
    denyFieldtrip,
    deleteAppealFieldtrip,
    refetch,
    isLoading,
    fieldtrip,

    // state
    deleteAppeal,
    loading,
    deny,
    errorMessage,

    // set state
    setDeleteAppeal,
    setDeny,
    setLoading,
    resendAlimtalk,
  }
}
