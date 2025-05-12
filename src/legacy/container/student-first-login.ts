import { useState } from 'react'
import { useUserUpdateMyInfoAtFirstLogin } from '@/legacy/generated/endpoint'
import type { RequestUpdateMyInfoAtFirstLoginDto } from '@/legacy/generated/model'
import type { errorType } from '@/legacy/types'

export function useStudentFirstLogin() {
  const [isChannelTalk, setChannelTalk] = useState(false)

  const { mutate: studentFirstLoginMutate, isLoading: isStudentFirstLoginMutateLoading } =
    useUserUpdateMyInfoAtFirstLogin({
      mutation: {
        onSuccess: () => {
          alert('정보 설정이 완료되었습니다.')
          window.location.reload()
        },
        onError: (error) => {
          const errorMsg: errorType | undefined = error?.response?.data
            ? (error?.response?.data as errorType)
            : undefined

          setChannelTalk(true)
          alert(errorMsg?.message || '정보 설정에 실패했습니다.')
        },
      },
    })

  const isLoading = isStudentFirstLoginMutateLoading

  const handleStudentFirstLogin = ({
    name,
    password,
    phone,
    nokName,
    nokPhone,
    hopeMajor,
    hopePath,
    birthDate,
  }: RequestUpdateMyInfoAtFirstLoginDto) => {
    studentFirstLoginMutate({
      data: {
        password,
        name,
        phone,
        nokName,
        nokPhone,
        hopeMajor,
        hopePath,
        birthDate,
      },
    })
  }

  return {
    isLoading,
    isChannelTalk,
    handleStudentFirstLogin,
  }
}
