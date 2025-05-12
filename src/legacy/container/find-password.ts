import { useState } from 'react'
import { useUserFindPassword } from '@/legacy/generated/endpoint'
import type { RequestFindPasswordDto } from '@/legacy/generated/model'
import type { errorType } from '@/legacy/types'

export function useFindPassword() {
  const [isSuccess, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { mutate: findPasswordMutate, isLoading: isFindPasswordLoading } = useUserFindPassword({
    mutation: {
      onSuccess: () => {
        setSuccess(true)
      },
      onError: (err) => {
        console.log('err', err)
        const errorMsg: errorType | undefined = err?.response?.data as errorType

        setErrorMessage(
          errorMsg.message || '입력하신 정보가 맞지 않거나, 일시적 오류 입니다. 잠시 후 다시 시도해주세요.',
        )
      },
    },
  })

  const findPassword = ({ email, name, phone }: RequestFindPasswordDto) => {
    findPasswordMutate({ data: { email, name: name.trim(), phone } })
  }

  return { isFindPasswordLoading, isSuccess, errorMessage, setErrorMessage, findPassword }
}
