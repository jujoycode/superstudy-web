import { useQueryClient } from 'react-query'
import { QueryKey } from '@/legacy/constants/query-key'
import { useUserUpdateMe } from '@/legacy/generated/endpoint'
import { UpdateUserDto } from '@/legacy/generated/model'
import { useUserStore } from '@/stores/user'

export function useStudentParentMyInfoUpdate() {
  const queryClient = useQueryClient()
  const { setIsUpdateMe: setIsUpdateMe } = useUserStore()

  const { mutate: updateMeMutate, isLoading: isUpdateMeLoading } = useUserUpdateMe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.me)
        setIsUpdateMe(false)
      },
    },
  })

  const handleParentMyInfoUpdate = ({
    name,
    password,
    phone,
    nokName,
    nokPhone,
    birthDate,
  }: Partial<UpdateUserDto>) => {
    const newData = {
      name,
      password,
      phone,
      nokName,
      nokPhone,
      birthDate,
    }
    if (!password) {
      delete newData.password
    }
    updateMeMutate({ data: newData as UpdateUserDto })
  }

  const handleStudentMyInfoUpdate = ({
    name,
    nickName,
    password,
    phone,
    birthDate,
    hopePath,
    hopeMajor,
  }: Partial<UpdateUserDto>) => {
    const newData = {
      name,
      nickName,
      password,
      phone,
      birthDate,
      hopePath,
      hopeMajor,
    }
    if (!password) {
      delete newData.password
    }
    updateMeMutate({ data: newData as UpdateUserDto })
  }

  return {
    isLoading: isUpdateMeLoading,
    handleParentMyInfoUpdate,
    handleStudentMyInfoUpdate,
  }
}
