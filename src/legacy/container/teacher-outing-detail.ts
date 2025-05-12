import { useState } from 'react'

// ! 개선 필요

import {
  useOutingsDelete,
  useOutingsDeny,
  useOutingsFindOne,
  useOutingsRequestDelete,
  useOutingsResend,
} from '@/legacy/generated/endpoint'
import type { errorType } from '@/legacy/types'

export function useTeacherOutingDetail(id: number) {
  const { push } = useHistory()
  const [deny, setDeny] = useState(false)
  const [notApprovedReason, setNotApprovedReason] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteAppeal, setDeleteAppeal] = useState(false)
  const [errM, setErrM] = useState('')

  const {
    data: outing,
    isLoading: isLoadingDoc,
    error: errorDoc,
  } = useOutingsFindOne(id, {
    query: {
      enabled: !!id,
    },
  })

  const { mutate: denyOutingMutate, isLoading: isDenyOutingLoading } = useOutingsDeny({
    mutation: {
      onSuccess: () => {
        setDeny(false)
        setErrM('')
      },
      onError: (err) => {
        setErrM(err?.message)
      },
    },
  })

  // TODO: reason -> notApprovedReason 으로 변경필요
  const denyOuting = () => {
    denyOutingMutate({
      id,
      data: {
        reason: notApprovedReason,
      },
    })
  }

  const { mutate: requestDeleteOutingMutate, isLoading: isRequestDeleteOutingLoading } = useOutingsRequestDelete({
    mutation: {
      onSuccess: () => {
        setDeleteAppeal(false)
      },
    },
  })

  const requestDeleteOuting = () => {
    requestDeleteOutingMutate({
      id,
      data: {
        deleteReason,
      },
    })
  }

  const { mutate: deleteOutingMutate } = useOutingsDelete({
    mutation: {
      onSuccess: () => {
        alert('삭제되었습니다')
        push('/teacher/outing')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        alert(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })
  const deleteOuting = () => {
    deleteOutingMutate({
      id,
    })
  }

  const isLoading = isDenyOutingLoading || isRequestDeleteOutingLoading

  const { refetch: resendAlimtalk } = useOutingsResend(id, {
    query: {
      enabled: false,
      onSuccess: () => {
        alert('확인증 승인요청 알림톡이 전송되었습니다.')
        push('/teacher/outing')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrM(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  return {
    deny,
    setDeny,
    notApprovedReason,
    setNotApprovedReason,
    deleteReason,
    setDeleteReason,
    deleteAppeal,
    setDeleteAppeal,
    errM,
    setErrM,
    requestDeleteOuting,
    deleteOuting,
    denyOuting,
    isLoading,
    outing,
    isLoadingDoc,
    errorDoc,
    resendAlimtalk,
  }
}
