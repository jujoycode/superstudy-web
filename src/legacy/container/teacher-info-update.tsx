import { useQueryClient } from 'react-query'
import { QueryKey } from '@/legacy/constants/query-key'
import { useUserUpdateMe } from '@/legacy/generated/endpoint'
import { UpdateUserDto } from '@/legacy/generated/model'
import { useUserStore } from '@/stores/user'

export function useTeacherInfoUpdate() {
  const queryClient = useQueryClient()
  const { setIsUpdateMe } = useUserStore()

  const { mutateAsync: updateMeMutateAsync, isLoading: isUpdateMeLoading } = useUserUpdateMe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.me)
        setIsUpdateMe(false)
      },
    },
  })

  const updateMe = async (data: Partial<UpdateUserDto>) => {
    const newData = {
      name: data.name,
      nickName: data.nickName,
      phone: data.phone,
      password: data.password,
      profile: data.profile,
      position: data.position || '',
      department: data.department || '',
      chatStartTime: data.chatStartTime || '00:00',
      chatEndTime: data.chatEndTime || '00:00',
    }
    if (!data.password) {
      delete newData.password
    }

    await updateMeMutateAsync({ data: newData as UpdateUserDto })
  }

  return {
    isUpdateMeLoading,
    updateMe,
  }
}
