import { addYears, format } from 'date-fns'
import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { useHistory } from '@/hooks/useHistory'
import {
  useFieldtripsDelete,
  useFieldtripsFindOne,
  useFieldtripsResend,
  useSchedulesFindRejectSchedule,
} from '@/legacy/generated/endpoint'
import { errorType } from '@/legacy/types'
import { childState } from '@/stores'
import { useUserStore } from '@/stores2/user'

export function useStudentFieldtripDetail(id: number) {
  const { push } = useHistory()
  const [errorMessage, setErrorMessage] = useState('')
  const { child } = useUserStore()

  const {
    data: fieldtrip,
    isLoading: isGetFieldtripLoading,
    error,
    refetch: refetchFieldtrip,
  } = useFieldtripsFindOne(id, {
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const { data: cannotSchedules } = useSchedulesFindRejectSchedule(
    {
      startDate: fieldtrip?.startAt
        ? format(new Date(fieldtrip?.startAt).setDate(1), 'yyyy-MM-dd')
        : format(new Date().setDate(1), 'yyyy-MM-dd'),
      endDate: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
    },
    {
      request: {
        headers: {
          'child-user-id': child?.id,
        },
      },
    },
  )

  const { mutate: deleteFieldtripMutate, isLoading: isDeleteFieldtripLoading } = useFieldtripsDelete({
    mutation: {
      onSuccess: () => {
        alert('삭제되었습니다.')
        push('/student/fieldtrip')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const deleteFieldtrip = () => {
    deleteFieldtripMutate({ id })
  }

  const { refetch: resendAlimtalk, isLoading: isResendAlimtalkLoading } = useFieldtripsResend(id, {
    query: {
      enabled: false,
      onSuccess: () => {
        alert('신청서 알림톡이 재전송되었습니다.')
        push('/student/fieldtrip')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const isFieldtripLoading = isGetFieldtripLoading || isDeleteFieldtripLoading || isResendAlimtalkLoading

  return {
    cannotSchedules,
    isFieldtripLoading,
    fieldtrip,
    error,
    errorMessage,
    refetchFieldtrip,
    deleteFieldtrip,
    resendAlimtalk,
  }
}
