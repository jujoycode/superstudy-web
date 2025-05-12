import { useEffect, useState } from 'react'

// ! 개선 필요
import { useHistory } from 'react-router'

import { useRecoilValue } from 'recoil'
import { useOutingsApproveByParentApp, useOutingsDelete, useOutingsFindOne } from '@/legacy/generated/endpoint'
import { childState, meState } from '@/stores'
import type { errorType } from '@/legacy/types'

export function useStudentOutingDetail(id: number) {
  const { push } = useHistory()
  const [errorMessage, setErrorMessage] = useState('')
  const meRecoil = useRecoilValue(meState)
  const child = useRecoilValue(childState)

  const [openSignModal, setSignModal] = useState(false)

  const {
    data: outing,
    isLoading,
    refetch: refetchOutings,
    error,
  } = useOutingsFindOne(id, {
    query: {
      enabled: !!id && !!meRecoil && (meRecoil.role === 'USER' || !!child),
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  useEffect(() => {
    if (!!child) {
      refetchOutings()
    }
  }, [child])

  const { mutate: deleteOutingMutate } = useOutingsDelete({
    mutation: {
      onSuccess: () => {
        alert('삭제되었습니다')
        push('/student/outing')
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
  const deleteOuting = () => {
    deleteOutingMutate({
      id,
    })
  }

  const { mutate: signOutingMutate } = useOutingsApproveByParentApp({
    mutation: {
      onSuccess: () => {
        setSignModal(false)
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

  const signOuting = (sigPadData: string) => {
    signOutingMutate({
      id,
      data: {
        signature: sigPadData,
      },
    })
  }

  return { outing, isLoading, error, deleteOuting, errorMessage, openSignModal, setSignModal, signOuting }
}
