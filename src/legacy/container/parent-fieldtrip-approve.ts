import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import {
  useFieldtripsApproveByParent,
  useFieldtripsApproveByParentApp,
  useFieldtripsFindOne,
  useFieldtripsFindOneByUUID,
} from '@/legacy/generated/endpoint'
import { childState } from '@/stores'
import { errorType } from '@/legacy/types'

export function useParentFieldtripApprove({ sigPadData, uuid }: { sigPadData: string; uuid: string }) {
  const [isShowSignModal, setIsShowSignModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setSuccess] = useState(false)
  const child = useRecoilValue(childState)

  const {
    data: fieldtrip,
    isLoading: isGetFieldtripLoading,
    error: fieldtripError,
  } = uuid.length > 20
    ? useFieldtripsFindOneByUUID(uuid)
    : useFieldtripsFindOne(Number(uuid), {
        request: {
          headers: {
            'child-user-id': child?.id,
          },
        },
      })

  const { mutate: approveFieldtripMutate, isLoading: isApproveFieldtripLoading } = useFieldtripsApproveByParent({
    mutation: {
      onSuccess: () => {
        hideSignModal()
        setSuccess(true)
      },
      onError: (err) => {
        hideSignModal()

        const errorMsg: errorType | undefined = err?.response?.data as errorType

        setErrorMessage(errorMsg.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const { mutate: approveFieldtripMutateApp } = useFieldtripsApproveByParentApp({
    mutation: {
      onSuccess: () => {
        hideSignModal()
        setSuccess(true)
      },
      onError: (err) => {
        hideSignModal()

        const errorMsg: errorType | undefined = err?.response?.data as errorType

        setErrorMessage(errorMsg.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const hideSignModal = () => {
    setIsShowSignModal(false)
  }

  const openSignModal = () => {
    setIsShowSignModal(true)
  }

  const approveFieldtrip = () => {
    uuid.length > 20
      ? approveFieldtripMutate({
          uuid,
          data: { signature: sigPadData },
        })
      : approveFieldtripMutateApp({
          id: Number(uuid),
          data: { signature: sigPadData },
        })
  }

  const isLoading = isApproveFieldtripLoading || isGetFieldtripLoading

  return {
    hideSignModal,
    openSignModal,
    isShowSignModal,
    fieldtripError,
    isSuccess,
    isLoading,
    errorMessage,
    approveFieldtrip,
    fieldtrip,
  }
}
