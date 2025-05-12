import { useUserUpdateMyInfoAtFirstLogin } from '@/legacy/generated/endpoint'

export function useTeacherFirstLogin() {
  const { mutate: teacherFirstLoginMutate, isLoading: isTeacherFirstLoginMutateLoading } =
    useUserUpdateMyInfoAtFirstLogin({
      mutation: {
        onSuccess: () => {
          alert('정보 설정이 완료되었습니다.')
          window.location.reload()
        },
        onError: () => {
          alert(
            '정보 설정에 실패했습니다. 회원가입 정보가 정확하지 않거나 이미 가입된 이메일입니다. 정보를 다시 확인해주세요.',
          )
        },
      },
    })

  const isLoading = isTeacherFirstLoginMutateLoading

  const handleTeacherFirstLogin = ({ password, name, phone }: { password: string; name: string; phone: string }) => {
    teacherFirstLoginMutate({
      data: {
        password,
        name,
        phone,
        nokName: '',
        nokPhone: '',
        hopeMajor: '',
        hopePath: '',
        birthDate: '',
      },
    })
  }

  return {
    isLoading,
    handleTeacherFirstLogin,
  }
}
