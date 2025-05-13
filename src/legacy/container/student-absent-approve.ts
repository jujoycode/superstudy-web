import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'

import {
  useAbsentsApproveByParent,
  useAbsentsApproveByParentApp,
  useAbsentsFindOne,
  useAbsentsFindOneByUUID,
} from '@/legacy/generated/endpoint'
import { useSignature } from '@/legacy/hooks/useSignature'
import type { errorType } from '@/legacy/types'
import { childState } from '@/stores'

export function useStudentAbsentApprove(uuid: string) {
  const { sigPadData, clearSignature, canvasRef } = useSignature()
  const [openSign, setSign] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [comment, setComment] = useState('')
  const child = useRecoilValue(childState)
  const {
    data: absent,
    isError: isGetAbsentError,
    refetch,
    isLoading: isGetAbsentLoading,
  } = uuid.length > 20
    ? useAbsentsFindOneByUUID(uuid, {
        // UUID 로 조회
        query: {
          onSuccess: (res) => {
            setComment(res.parentComment)
          },
        },
        request: {
          headers: {
            'child-user-id': child?.id,
          },
        },
      })
    : useAbsentsFindOne(Number(uuid), {
        request: {
          headers: {
            'child-user-id': child?.id,
          },
        },
      })

  const {
    mutate: signAbsentMutate,
    isSuccess,
    isLoading: isSignAbsentLoading,
  } = useAbsentsApproveByParent({
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
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const {
    mutate: signAbsentMutateApp,
    isSuccess: isSuccessApp,
    isLoading: isSignAbsentLoadingApp,
  } = useAbsentsApproveByParentApp({
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
    uuid.length > 20
      ? signAbsentMutate({
          uuid,
          data: {
            comment,
            signature: sigPadData,
          },
        })
      : signAbsentMutateApp({
          id: Number(uuid),
          data: {
            comment,
            signature: sigPadData,
          },
        })
  }

  useEffect(() => {
    absent?.parentComment && setComment(absent.parentComment)
  }, [absent])

  const isLoading = isGetAbsentLoading || isSignAbsentLoading || isSignAbsentLoadingApp

  return {
    clearSignature,
    canvasRef,
    absent,
    sigPadData,
    signAbsent,
    isSuccess: isSuccess || isSuccessApp,
    errorMessage,
    isGetAbsentError,
    comment,
    setComment,
    setSign,
    openSign,
    isLoading,
  }
}
