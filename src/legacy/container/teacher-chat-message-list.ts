import { useState } from 'react'
import { useHistory } from '@/hooks/useHistory'
import { Routes } from '@/legacy/constants/routes'
import {
  useChatCreateMessage,
  useChatDeleteMessage,
  useChatroomExpiredChatRoom,
  useChatroomGetMessageList,
} from '@/legacy/generated/endpoint'
import { Chat, RequestCreateChatMessageDto, ResponsePaginatedChatMessageDto } from '@/legacy/generated/model'
// ! 지훈쌤 개선안 적용
import { errorType } from '@/legacy/types'

export function useTeacherChatMessageList(chatroomId: number) {
  const { push } = useHistory()
  const [pageInfo] = useState({ page: 1, limit: 500 })
  const [chatMessages, setChatMessages] = useState<ResponsePaginatedChatMessageDto>()
  const [newMessage, setNewMessage] = useState('')

  // 대화 목록
  const { refetch: refetchChatMessages, isLoading: getMessageLoading } =
    useChatroomGetMessageList<ResponsePaginatedChatMessageDto>(chatroomId, pageInfo, {
      query: {
        enabled: !!chatroomId,
        onSuccess: (res) => {
          res.items = res?.items?.slice()?.sort((a: Chat, b: Chat) => (a.createdAt > b.createdAt ? 1 : -1))

          setChatMessages(res)
        },
      },
    })

  const { mutate: createNewMessageMutate, isLoading: createMessageLoading } = useChatCreateMessage({
    mutation: {
      onSuccess: () => {
        setNewMessage('')
        refetchChatMessages()
          .then(() => {})
          .catch(() => {
            // refetch 중에 발생한 에러를 처리하는 작업
            //alert(error?.message);
          })
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType

        alert(errorMsg?.message || '메시지를 보내지 못했습니다.')
      },
    },
  })

  const { mutate: deleteMessageMutate, isLoading: deleteMessageLoading } = useChatDeleteMessage({
    mutation: {
      onSuccess: () => {
        refetchChatMessages()
          .then(() => {})
          .catch(() => {})
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType

        alert(errorMsg?.message || '메시지 삭제에 실패하였습니다.')
      },
    },
  })

  const createNewMessage = (_data?: RequestCreateChatMessageDto) => {
    createNewMessageMutate({
      id: chatroomId,
      data: {
        content: newMessage,
        images: [],
        files: [],
        ..._data,
      },
    })
  }

  const deleteMessage = (roomId: number, chatId: number) => {
    deleteMessageMutate({ id: roomId, chatid: chatId })
  }

  const { mutate: expiredChatRoomMutate } = useChatroomExpiredChatRoom({
    mutation: {
      onSuccess: () => {
        alert('대화방 및 대화내용이 삭제되었습니다.')
        push(`${Routes.teacher.chat}`)
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType

        alert(errorMsg?.message || '대화방 나가기를 실패하였습니다.')
      },
    },
  })

  const expiredChatRoom = () => {
    expiredChatRoomMutate({
      id: chatroomId,
    })
  }

  return {
    newMessage,
    setNewMessage,
    chatMessages,
    createNewMessage,
    refetchChatMessages,
    expiredChatRoom,
    deleteMessage,
    isLoading: createMessageLoading || getMessageLoading || deleteMessageLoading,
  }
}
