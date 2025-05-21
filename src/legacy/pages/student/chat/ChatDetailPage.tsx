import { useEffect, useRef, useState } from 'react'

import { ReactComponent as ChatSendDisabled } from '@/assets/svg/chat-send-disabled.svg'
import { ReactComponent as ChatSendEnabled } from '@/assets/svg/chat-send-enabled.svg'
import { useUserStore } from '@/stores/user'
import { ChatSetting } from '@/legacy/components/chat/ChatSetting'
import { DateMessage } from '@/legacy/components/chat/DateMessage'
import { ReceiveMessage } from '@/legacy/components/chat/ReceiveMessage'
import { SendMessage } from '@/legacy/components/chat/SendMessage'
import { SystemMessage } from '@/legacy/components/chat/SystemMessage'
import { BackButton, Blank, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { DocumentObjectComponentDel } from '@/legacy/components/DocumentObjectComponentDel'
import { ImageObjectComponentDel } from '@/legacy/components/ImageObjectComponentDel'
import { useChatRoomInfo } from '@/legacy/container/chat-room-info'
import { useStudentChatMessageList } from '@/legacy/container/student-chat-message-list'
import { Chat, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { useSocket } from '@/legacy/lib/socket'
import { isNowOrFuture } from '@/legacy/util/time'

interface ChatDetailPageProps {
  id: string
}

export function ChatDetailPage({ id }: ChatDetailPageProps) {
  id = id.split('/')[0]

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { me } = useUserStore()

  const [isSettingOpen, setSettingOpen] = useState(false)
  const [isSettingAttendee, setSettingAttendee] = useState(false)

  const { chatRoomInfo, chatRoomTitle, chatRoomAttendees, chatReadInfo } = useChatRoomInfo(Number(id))

  const {
    newMessage,
    setNewMessage,
    chatMessages,
    createNewMessage,
    refetch: refetchChatMessages,
    isLoading,
  } = useStudentChatMessageList(Number(id))

  const {
    imageObjectMap,
    documentObjectMap,
    toggleImageDelete,
    addFiles,
    toggleDocumentDelete,
    resetDocuments,
    resetImages,
  } = useImageAndDocument({})

  const { isUploadLoading, handleUploadFile } = useFileUpload()

  const [socket, disconnect] = useSocket(`chat-${id}`)

  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  const [myReadTime, setMyReadTime] = useState('')
  const [chatCloseMsg, setChatCloseMsg] = useState('')
  const [chatOpenTime, setChatOpenTime] = useState(true)

  useEffect(() => {
    setMyReadTime('')
  }, [id])

  useEffect(() => {
    if (chatRoomInfo?.roomData.chatStartTime && chatRoomInfo?.roomData.chatEndTime) {
      if (
        (!isNowOrFuture(chatRoomInfo?.roomData.chatStartTime) && isNowOrFuture(chatRoomInfo?.roomData.chatEndTime)) ||
        chatRoomInfo?.roomData.chatStartTime === chatRoomInfo?.roomData.chatEndTime
      ) {
        if (chatRoomInfo?.roomData.chatStartTime === chatRoomInfo?.roomData.chatEndTime) {
          setChatOpenTime(false)
          setChatCloseMsg('상대방이 대화가 불가능한 상태입니다.')
        } else {
          setChatOpenTime(true)
        }
        setNewMessage('')
      } else {
        setChatOpenTime(false)
        setNewMessage('')
        setChatCloseMsg(
          '대화 가능 시간은 ' +
            chatRoomInfo?.roomData.chatStartTime +
            '~' +
            chatRoomInfo?.roomData.chatEndTime +
            '입니다.',
        )
      }
    }
  }, [chatRoomInfo, setNewMessage])

  useEffect(() => {
    if (me && chatReadInfo && chatMessages) {
      if (!myReadTime) {
        setMyReadTime(chatReadInfo?.find((item) => item.attendeeId === me.id)?.updatedAt || '')
      }

      chatMessages?.items
        ?.slice()
        ?.sort((a: Chat, b: Chat) => (a.createdAt > b.createdAt ? -1 : 1))
        .map((item, i) => {
          if (i > 5 && item.createdAt > myReadTime) {
            setMyReadTime(item.createdAt)
          }
        })
    }
  }, [me, chatReadInfo, chatMessages, myReadTime])

  useEffect(() => {
    if (id && socket) {
      socket?.emit('in', { id: Number(me?.id) })
    }

    socket?.on('chat', (_: Chat) => {
      refetchChatMessages()
        .then(() => {
          //
        })
        .catch(() => {
          //alert(error?.message);
        })
    })

    // return () => {
    //   socket?.off('onlineList');
    // };
  }, [id, me?.id, refetchChatMessages, socket])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [id, disconnect])

  // 메시지 입력
  const OnSendMessage = async () => {
    if (isSubmitLoading) return

    try {
      setIsSubmitLoading(true)
      // file image 처리
      const imageFiles = [...imageObjectMap.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[]
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['activityv3/images'], imageFiles)
      // url image 처리
      const imageUrlNames = [...imageObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.image === 'string')
        .map((value) => value.image) as string[]
      const allImageNames = [...imageUrlNames, ...imageFileNames]
      // file document 처리
      const documentFiles = [...documentObjectMap.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[]
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['activityv3/files'], documentFiles)
      const documentUrlNames = [...documentObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.document === 'string')
        .map((value) => value.document) as string[]
      const allDocumentNames = [...documentUrlNames, ...documentFileNames]

      await createNewMessage({
        content: newMessage,
        images: allImageNames,
        files: allDocumentNames,
      })

      resetDocuments()
      resetImages()
      if (textareaRef.current) {
        textareaRef.current.setAttribute('scrollHeight', '64')
      }
    } finally {
      setIsSubmitLoading(false)
    }
  }

  // 채팅이 업데이트될 때마다 아래로 스크롤
  const chatListRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    chatListRef.current?.scrollTo(0, chatListRef.current.scrollHeight)
  }, [chatMessages, myReadTime])

  return (
    <>
      {(isLoading || isUploadLoading) && <Blank />}
      <div className="relative bg-gray-50">
        <div className="block">
          <TopNavbar
            title={chatRoomTitle}
            left={<BackButton className="h-15" />}
            right={
              <div
                onClick={() => {
                  setSettingAttendee(true)
                  setSettingOpen(true)
                }}
                className="flex h-15 w-10 items-center"
              >
                <Icon.MoreHorizontal />
              </div>
            }
          />
        </div>

        <div className="h-screen-16 bg-gray-200">
          <div className="h-full overflow-y-auto p-2" ref={chatListRef}>
            {chatMessages?.items?.map((c: Chat, idx: number) => (
              <>
                <DateMessage key={idx} PreMessageData={chatMessages?.items[idx - 1]} MessageData={c} />

                {c.type === 'SYSTEM' ? (
                  <SystemMessage key={c.id} MessageData={c} />
                ) : c.senderId === me?.id ? (
                  <SendMessage
                    key={c.id}
                    PreMessageData={chatMessages?.items[idx - 1]}
                    MessageData={c}
                    PostMessageData={chatMessages?.items[idx + 1]}
                    userRole="student"
                    openDeleteModal={() => {}}
                  />
                ) : (
                  <ReceiveMessage
                    key={c.id}
                    PreMessageData={chatMessages?.items[idx - 1]}
                    MessageData={c}
                    PostMessageData={chatMessages?.items[idx + 1]}
                    AttendeeInfo={chatRoomAttendees?.find((item) => item.id === c.senderId)}
                    userRole="student"
                  />
                )}
              </>
            ))}
          </div>
        </div>

        <div className="flex-2 px-3 py-2">
          <div className="write flex flex-col rounded-2xl border-2 bg-white shadow">
            <textarea
              name="message"
              ref={textareaRef}
              placeholder={chatOpenTime ? '메시지를 입력하세요.' : chatCloseMsg}
              disabled={!chatOpenTime}
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) OnSendMessage()
              }}
              className="block h-auto w-full resize-none border-none bg-transparent px-3 py-2 outline-hidden"
              style={{ height: textareaRef?.current ? `${textareaRef.current.scrollHeight}px` : 'auto' }}
            />
            <div className="px-3">
              {/* 이미지 */}
              {[...imageObjectMap].length > 0 && (
                <div className="grid w-full grid-flow-row grid-cols-4 gap-2 pb-2 md:grid-cols-6">
                  {[...imageObjectMap].map(([key, value]) => (
                    <ImageObjectComponentDel key={key} id={key} imageObjet={value} onDeleteClick={toggleImageDelete} />
                  ))}
                </div>
              )}
              {/* 문서 */}
              {[...documentObjectMap].length > 0 && (
                <div className="flex flex-col gap-1 pb-2">
                  {[...documentObjectMap].map(([key, value]) => (
                    <DocumentObjectComponentDel
                      key={key}
                      id={key}
                      documentObjet={value}
                      onDeleteClick={toggleDocumentDelete}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-2">
              <label htmlFor="file-upload">
                <Icon.Plus className="h-8 w-8 cursor-pointer rounded-full p-2 hover:bg-gray-50" />
              </label>
              <input
                type="file"
                id="file-upload"
                name="file-upload"
                className="sr-only"
                multiple
                onChange={(e) => {
                  const files = e.target.files
                  if (!files || files.length === 0) return
                  addFiles(files)
                }}
              />
              {(newMessage || imageObjectMap.size || documentObjectMap.size) && chatOpenTime ? (
                <ChatSendEnabled onClick={OnSendMessage} />
              ) : (
                <ChatSendDisabled />
              )}
            </div>
          </div>
        </div>
      </div>

      <ChatSetting
        modalOpen={isSettingOpen}
        showAttendees={isSettingAttendee}
        setUpdateInfo={() => setSettingOpen(false)}
        removeUser={() => setSettingOpen(false)}
        addUser={() => setSettingOpen(false)}
        setModalClose={() => setSettingOpen(false)}
        setCloseChat={() => setSettingOpen(false)}
        onSearchUser={() => setSettingOpen(false)}
        searchUserList={undefined}
        info={chatRoomInfo}
      />
    </>
  )
}
