import { useState } from 'react'
import { useOutingsApproveByParent, useOutingsFindOneByUUID } from '@/legacy/generated/endpoint'
import { useSignature } from '@/legacy/hooks/useSignature'
import type { errorType } from '@/legacy/types'

export function useStudentOutingApprove(uuid: string) {
  const { sigPadData, clearSignature, canvasRef } = useSignature()
  const [openSign, setSign] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [comment, setComment] = useState('')

  const {
    data: outing,
    isError: isGetOutingError,
    refetch,
    isLoading: isGetOutingLoading,
  } = useOutingsFindOneByUUID(uuid)

  const {
    mutate: signOutingMutate,
    isSuccess,
    isLoading: isSignOutingLoading,
  } = useOutingsApproveByParent({
    mutation: {
      onSuccess: () => {
        setSign(false)
        refetch()
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const signAbsent = () => {
    signOutingMutate({
      uuid,
      data: {
        signature: sigPadData,
      },
    })
  }

  const isLoading = isGetOutingLoading || isSignOutingLoading

  return {
    clearSignature,
    canvasRef,
    outing,
    sigPadData,
    signAbsent,
    isSuccess,
    errorMessage,
    isGetOutingError,
    comment,
    setComment,
    setSign,
    openSign,
    isLoading,
  }
}
