import { useQueryClient } from 'react-query'
import { useSetRecoilState } from 'recoil'
import { isUpdateMeState } from '@/stores'
import { QueryKey } from '@/legacy/constants/query-key'
import { useUserUpdateMe } from '@/legacy/generated/endpoint'
import type { UpdateUserDto } from '@/legacy/generated/model'

export function useStudentParentMyInfoUpdate() {
  const queryClient = useQueryClient()
  const setIsUpdateMe = useSetRecoilState(isUpdateMeState)

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
