import { useState } from 'react'
// ! 개선 필요
import { useHistory } from '@/hooks/useHistory'
import {
  useFieldtripResultDenyResult,
  useFieldtripResultResend,
  useFieldtripsFindOne,
  useFieldtripsRequestDelete,
} from '@/legacy/generated/endpoint'
import type { errorType } from '@/legacy/types'

type UseFieldtripDetailProps = {
  id: string
}
export function useTeacherFieldtripResultDetail({ id }: UseFieldtripDetailProps) {
  const [deleteAppeal, setDeleteAppeal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deny, setDeny] = useState(false)
  const [_, setErrorMessage] = useState('')
  const { data: fieldtrip, isLoading } = useFieldtripsFindOne(Number(id))

  const { mutate: denyFieldtripResult } = useFieldtripResultDenyResult({
    mutation: {
      onSuccess: () => {
        setDeny(false)
        setLoading(false)
      },
      onError: () => {
        setLoading(false)
      },
    },
  })

  // 결과보고서 삭제는 신청서 삭제와 동일한 API 사용함
  const { mutate: deleteAppealFieldtripResult } = useFieldtripsRequestDelete({
    mutation: {
      onSuccess: () => {
        setDeleteAppeal(false)
        setLoading(false)
      },
      onError: () => {
        setLoading(false)
      },
    },
  })

  const { mutateAsync: resendAlimtalkMutate } = useFieldtripResultResend({
    mutation: {
      onSuccess: () => {
        alert('결과보고서 알림톡이 재전송되었습니다.')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const resendAlimtalk = async () => {
    if (!fieldtrip) return

    const { id } = fieldtrip
    await resendAlimtalkMutate({ id })
  }

  return {
    // api
    denyFieldtripResult,
    deleteAppealFieldtripResult,
    isLoading,
    fieldtrip,

    // state
    deleteAppeal,
    loading,
    deny,

    // set state
    setDeleteAppeal,
    setDeny,
    setLoading,
    resendAlimtalk,
  }
}
