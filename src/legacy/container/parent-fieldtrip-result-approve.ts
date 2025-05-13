import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import {
  useFieldtripResultApproveResultByParent,
  useFieldtripResultApproveResultByParentApp,
  useFieldtripsFindOne,
  useFieldtripsFindOneByUUID,
} from '@/legacy/generated/endpoint'
import { errorType } from '@/legacy/types'
import { childState } from '@/stores'

type Props = {
  uuid: string
  sigPadData: string
}

export function useParentFieldtripResultApprove({ uuid, sigPadData }: Props) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isShowSignModal, setIsShowSignModal] = useState(false)
  const child = useRecoilValue(childState)

  const {
    data: fieldtrip,
    isLoading: isGetFieldtrip,
    isError: isGetFieldtripError,
  } = uuid.length > 20
    ? useFieldtripsFindOneByUUID(uuid, {
        query: {
          onError: (err) => {
            const errorMsg: errorType | undefined = err?.response?.data as errorType

            const message = err.message?.includes('Could not find any entity')
              ? '해당하는 체험학습 결과보고서를 찾을 수 없습니다.'
              : errorMsg.message
            setErrorMessage(message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
          },
        },
        request: {
          headers: {
            'child-user-id': child?.id,
          },
        },
      })
    : useFieldtripsFindOne(Number(uuid), {
        query: {
          onError: (err) => {
            const errorMsg: errorType | undefined = err?.response?.data as unknown as errorType

            const message = err.message?.includes('Could not find any entity')
              ? '해당하는 체험학습 결과보고서를 찾을 수 없습니다.'
              : errorMsg.message
            setErrorMessage(message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
          },
        },
        request: {
          headers: {
            'child-user-id': child?.id,
          },
        },
      })

  const {
    mutateAsync: approveResultMutate,
    isLoading: isAppoveResultLoading,
    isError: isAppoveResultError,
    isSuccess: isApproveResultSuccess,
  } = useFieldtripResultApproveResultByParent({
    mutation: {
      onError: (err) => {
        const errorMsg: errorType | undefined = err?.response?.data as errorType

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const {
    mutateAsync: approveResultMutateApp,
    isLoading: isAppoveResultLoadingApp,
    isError: isAppoveResultErrorApp,
    isSuccess: isApproveResultSuccessApp,
  } = useFieldtripResultApproveResultByParentApp({
    mutation: {
      onError: (err) => {
        const errorMsg: errorType | undefined = err?.response?.data as errorType

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const isLoading = isGetFieldtrip || isAppoveResultLoading || isAppoveResultLoadingApp
  const isError = isGetFieldtripError || isAppoveResultError || isAppoveResultErrorApp
  const isSuccess = isApproveResultSuccess || isApproveResultSuccessApp

  const approveResult = async () => {
    uuid.length > 20
      ? await approveResultMutate({
          uuid,
          data: {
            signature: sigPadData,
          },
        })
      : await approveResultMutateApp({
          id: Number(uuid),
          data: {
            signature: sigPadData,
          },
        })
  }

  const hideSignModal = () => {
    setIsShowSignModal(false)
  }

  const openSignModal = () => {
    setIsShowSignModal(true)
  }

  return {
    isLoading,
    isError,
    fieldtrip,
    errorMessage,
    approveResult,
    isSuccess,
    hideSignModal,
    openSignModal,
    isShowSignModal,
  }
}
