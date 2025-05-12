import { useState } from 'react'

// ! 개선 필요

import { Routes } from '@/legacy/constants/routes'

import { useChatroomCreateChatRoom, useChatroomGetChatroomInfo } from '@/legacy/generated/endpoint'
import type { ResponseChatroomInfoDto } from '@/legacy/generated/model'
import type { UserDatas, errorType } from '@/legacy/types'

export function useTeacherChatRoomList() {
  const { push } = useHistory()
  const [chatRooms, setChatRooms] = useState<ResponseChatroomInfoDto[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserDatas[]>([])

  const { refetch: refetchRoomList } = useChatroomGetChatroomInfo<ResponseChatroomInfoDto[]>({
    query: {
      onSuccess: (res) => {
        if (!res?.length) {
          setChatRooms([])
          return
        }
        setChatRooms(res)
      },
    },
  })

  const { mutate: createNewRoomMutate } = useChatroomCreateChatRoom({
    mutation: {
      onSuccess: (result) => {
        setSelectedUsers([])
        push(`${Routes.teacher.chat}/${result}`)
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType
        alert(errorMsg?.message || '대화방을 생성하지 못했습니다.')
      },
    },
  })

  const createNewRoom = () => {
    const userIds = selectedUsers.map((el) => el.id)
    if (userIds && userIds.length) {
      createNewRoomMutate({
        data: {
          attendeeUserIdList: userIds,
        },
      })
    }
  }

  return { selectedUsers, setSelectedUsers, chatRooms, createNewRoom, refetchRoomList }
}
