import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { useHistory } from '@/hooks/useHistory'
import { useUserGetUser, useUserParentSignUp } from '@/legacy/generated/endpoint'
import { RequestParentSignUpDto } from '@/legacy/generated/model'
import { useBrowserStorage } from '@/legacy/hooks/useBrowserStorage'
import { NotNullable } from '@/legacy/types'
import { useUserStore } from '@/stores2/user'

export function useParentSignUp(uuid: string | null) {
  const { push } = useHistory()
  const { setStorage } = useBrowserStorage()

  const [errorMessage1, setErrorMessage] = useState('')
  const { me: meRecoil } = useUserStore()

  const { data: student, isLoading } = useUserGetUser(uuid || '', {
    query: {
      enabled: !!uuid,
    },
  })

  const { mutateAsync: parentSignUpMutateAsync } = useUserParentSignUp()

  const handleChildAddButtonClick = () => {
    push(`/add-child/${uuid}`)
  }

  const handleSubmit = async ({
    email,
    name,
    password,
    phone,
    schoolId,
    hopeMajor = '',
    hopePath = '',
  }: NotNullable<RequestParentSignUpDto> & { schoolId: number }) => {
    try {
      const result = await parentSignUpMutateAsync({
        schoolId,
        data: {
          email,
          name,
          password,
          phone,
          hopeMajor,
          hopePath,
        },
      })
      if (!result?.token) {
        setErrorMessage('회원가입에 실패했습니다.')
        return false
      }
      setStorage('token', result.token)
      //window.location.reload();
      return true
    } catch (err: any) {
      // TODO 학부모 회원가입 에러 메시지 추가 작업 필요
      switch (err.response.data.code) {
        case '1001002':
          alert(err.response.data.message)
          setErrorMessage(err.response.data.message)
          break
        default:
          alert('회원가입에 실패했습니다.')
          break
      }
      setErrorMessage('회원가입에 실패했습니다.')
    }
  }

  return {
    student,
    isLoading,
    errorMessage1,
    meRecoil,
    setErrorMessage,
    handleChildAddButtonClick,
    handleSubmit,
  }
}
