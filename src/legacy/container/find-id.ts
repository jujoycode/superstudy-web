import { useState } from 'react'
import { useUserFindId } from '@/legacy/generated/endpoint'
import type { UserFindIdParams } from '@/legacy/generated/model'

export function useFindId() {
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult] = useState(false)

  const [findIdParam, setFindIdParam] = useState<UserFindIdParams>({ name: '', phone: '' })

  useUserFindId(findIdParam, {
    query: {
      enabled: !!findIdParam.name && !!findIdParam.phone,
      onSuccess: (response) => {
        setResult(response)
      },
      onError: () => {
        setErrorMessage('이름과 전화번호를 확인할 수 없습니다.')
        setResult(false)
      },
    },
  })

  const findId = ({ name, phone }: UserFindIdParams) => {
    setFindIdParam({ name, phone })
  }

  return {
    result,
    errorMessage,
    findId,
    setErrorMessage,
  }
}
