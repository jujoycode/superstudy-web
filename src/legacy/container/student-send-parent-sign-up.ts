import { useState } from 'react'
import { useUserSendParentSignUp } from '@/legacy/generated/endpoint'
import type { errorType } from '@/legacy/types'

export function useStudentSendParentSignUp() {
  const [enableSendParentSignUp, setEnableSendParentSignUp] = useState(false)
  useUserSendParentSignUp({
    query: {
      enabled: enableSendParentSignUp,
      onSuccess: () => {
        alert('보호자 회원가입 메시지 발송이 완료되었습니다.')
        setEnableSendParentSignUp(false)
        window?.location?.reload()
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType

        alert(errorMsg?.message || '메시지 발송 중 오류가 발생하였습니다.')
        setEnableSendParentSignUp(false)
      },
    },
  })

  const handleSendParentSignUp = () => {
    setEnableSendParentSignUp(true)
  }

  return { handleSendParentSignUp }
}
