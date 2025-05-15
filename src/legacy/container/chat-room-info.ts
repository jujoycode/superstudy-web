import { useEffect, useState } from 'react'

import {
  useChatroomAddUser,
  useChatroomGetChatroomDetailInfo,
  useChatroomRemoveUser,
  useChatroomSearchUsers,
  useChatroomUpdateChatroomInfo,
} from '@/legacy/generated/endpoint'
import {
  ChatroomReadInfo,
  RequestUpdateChatroomInfoDto,
  ResponseChatAttendeeDto,
  ResponseChatroomInfoDetailDto,
} from '@/legacy/generated/model'
import { errorType } from '@/legacy/types'
import { getNickName } from '@/legacy/util/status'
import { useUserStore } from '@/stores/user'

export function useChatRoomInfo(chatroomId: number) {
  const { me } = useUserStore()

  const [chatRoomInfo, setChatRoomInfo] = useState<ResponseChatroomInfoDetailDto>()
  const [chatRoomTitle, setChatRoomTitle] = useState<string>()
  const [chatRoomAttendees, setChatRoomAttendees] = useState<ResponseChatAttendeeDto[]>()
  const [chatReadInfo] = useState<ChatroomReadInfo[]>()
  const [chatRoomAttendeeCount, setChatRoomAttendeeCount] = useState('')

  const [chatSearchUserName, setChatSearchUserName] = useState('')
  const [chatSearchUserList, setChatSearchUserList] = useState<ResponseChatAttendeeDto[]>([])

  const { refetch: refetchRoomInfo } = useChatroomGetChatroomDetailInfo<ResponseChatroomInfoDetailDto>(chatroomId, {
    query: {
      enabled: !!chatroomId,
      onSuccess: (res) => {
        setChatRoomInfo(res)
      },
    },
  })

  useEffect(() => {
    if (chatRoomInfo) {
      const attendees = chatRoomInfo?.attendeeList?.filter((value) => value.id !== me?.id)
      setChatRoomAttendees(attendees)

      let title = ''
      if (chatRoomInfo?.roomData.name) {
        title = chatRoomInfo?.roomData.name
        setChatRoomAttendeeCount(chatRoomInfo?.attendeeList.length.toString())
      } else {
        attendees?.map((value, i) => {
          if (i < 4) {
            if (title !== '') {
              title = title + ',' + value.name + getNickName(value.nickName)
            } else {
              title = value.name + getNickName(value.nickName)
            }

            if (i === 3) {
              title = title + '...'
            }
          }
        })
        setChatRoomAttendeeCount(
          chatRoomInfo?.attendeeList.length > 2 ? chatRoomInfo?.attendeeList.length.toString() : '',
        )
      }

      title =
        title +
        (chatRoomInfo?.attendeeList?.length > 2 ? '  (' + chatRoomInfo?.attendeeList?.length.toString() + '명)' : '')

      setChatRoomTitle(title)
    }
  }, [chatRoomInfo])

  const { refetch: refetchSearchUser } = useChatroomSearchUsers<ResponseChatAttendeeDto[]>(
    chatroomId,
    {
      name: chatSearchUserName,
    },
    {
      query: {
        enabled: !!chatSearchUserName,
        onSuccess: (res) => {
          setChatSearchUserList(res)
        },
      },
    },
  )

  const onSearchUser = (searchName?: string) => {
    setChatSearchUserName(searchName || '')
    refetchSearchUser()
  }

  const { mutate: addChatroomUserMutate } = useChatroomAddUser({
    mutation: {
      onSuccess: () => {
        alert('초대를 성공하였습니다.')
        refetchSearchUser()
        refetchRoomInfo()
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType

        alert(errorMsg?.message || '초대를 성공하지 못했습니다. ')
      },
    },
  })

  const addChatroomUser = (userIds: number[]) => {
    addChatroomUserMutate({
      id: chatroomId,
      data: { userIdList: userIds },
    })
  }

  const { mutate: removeChatroomUserMutate } = useChatroomRemoveUser({
    mutation: {
      onSuccess: () => {
        alert('내보내기를 성공하였습니다.')
        refetchRoomInfo()
          .then(() => { })
          .catch(() => {
            // refetch 중에 발생한 에러를 처리하는 작업
            //alert(error?.message);
          })
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType

        alert(errorMsg?.message || '내보내기를 성공하지 못했습니다. ')
      },
    },
  })

  const removeChatroomUser = (userId: number) => {
    removeChatroomUserMutate({
      id: chatroomId,
      userid: userId,
    })
  }

  const { mutate: updateChatroomInfoMutate } = useChatroomUpdateChatroomInfo({
    mutation: {
      onSuccess: () => {
        alert('대화방 정보를 설정하였습니다.')
        refetchRoomInfo()
          .then(() => { })
          .catch(() => {
            // refetch 중에 발생한 에러를 처리하는 작업
            //alert(error?.message);
          })
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType

        alert(errorMsg?.message || '대화방 정보를 설정하지 못했습니다. ')
      },
    },
  })

  const updateChatroomInfo = (roominfo: RequestUpdateChatroomInfoDto) => {
    updateChatroomInfoMutate({
      id: chatroomId,
      data: roominfo,
    })
  }

  return {
    chatRoomInfo,
    chatRoomTitle,
    chatRoomAttendees,
    chatRoomAttendeeCount,
    chatReadInfo,
    setChatRoomInfo,
    updateChatroomInfo,
    removeChatroomUser,
    onSearchUser,
    chatSearchUserList,
    addChatroomUser,
  }
}
