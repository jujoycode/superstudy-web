import { useState } from 'react'

import { useChatCreateMessage, useChatroomGetMessageList } from '@/legacy/generated/endpoint'
import type { Chat, RequestCreateChatMessageDto, ResponsePaginatedChatMessageDto } from '@/legacy/generated/model'
import type { errorType } from '@/legacy/types'

export function useStudentChatMessageList(chatroomId: number) {
  const [pageInfo] = useState({ page: 1, limit: 500 })
  const [chatMessages, setChatMessages] = useState<ResponsePaginatedChatMessageDto>()
  const [newMessage, setNewMessage] = useState('')

  // 대화 목록
  const { refetch, isLoading: getMessageLoading } = useChatroomGetMessageList<ResponsePaginatedChatMessageDto>(
    chatroomId,
    pageInfo,
    {
      query: {
        enabled: !!chatroomId,
        onSuccess: (res) => {
          res.items = res?.items?.slice()?.sort((a: Chat, b: Chat) => (a.createdAt > b.createdAt ? 1 : -1))

          setChatMessages(res)
        },
      },
    },
  )

  const { mutate: createNewMessageMutate, isLoading: createMessageLoading } = useChatCreateMessage({
    mutation: {
      onSuccess: () => {
        setNewMessage('')
        refetch()
          .then(() => {})
          .catch((_) => {
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

  return {
    newMessage,
    setNewMessage,
    chatMessages,
    createNewMessage,
    refetch,
    isLoading: createMessageLoading || getMessageLoading,
  }
}
