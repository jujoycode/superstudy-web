import { useEffect, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { twMerge } from 'tailwind-merge'

import ChatSendDisabled from '@/assets/svg/chat-send-disabled.svg'
import ChatSendEnabled from '@/assets/svg/chat-send-enabled.svg'
import SvgUser from '@/assets/svg/user.svg'
import { SuperModal } from '@/legacy/components'
import { ChatSetting } from '@/legacy/components/chat/ChatSetting'
import { DateMessage } from '@/legacy/components/chat/DateMessage'
import { ReceiveMessage } from '@/legacy/components/chat/ReceiveMessage'
import { SendMessage } from '@/legacy/components/chat/SendMessage'
import { SystemMessage } from '@/legacy/components/chat/SystemMessage'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { DocumentObjectComponentDel } from '@/legacy/components/DocumentObjectComponentDel'
import { ImageObjectComponentDel } from '@/legacy/components/ImageObjectComponentDel'
import { Constants } from '@/legacy/constants'
import { useChatRoomInfo } from '@/legacy/container/chat-room-info'
import { useTeacherChatMessageList } from '@/legacy/container/teacher-chat-message-list'
import { Chat, RequestUpdateChatroomInfoDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { useSocket } from '@/legacy/lib/socket'
import { isNowOrFuture } from '@/legacy/util/time'
import { meState } from '@/stores'

interface ChatDetailPageProps {
  id: string
}

export function ChatDetailPage({ id }: ChatDetailPageProps) {
  id = id.split('/')[0]

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const me = useRecoilValue(meState)

  const {
    chatRoomInfo,
    chatRoomTitle,
    chatRoomAttendees,
    chatReadInfo,
    updateChatroomInfo,
    removeChatroomUser,
    onSearchUser,
    chatSearchUserList,
    addChatroomUser,
  } = useChatRoomInfo(Number(id))

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

  const {
    newMessage,
    setNewMessage,
    chatMessages,
    createNewMessage,
    deleteMessage,
    refetchChatMessages,
    expiredChatRoom,
    isLoading,
  } = useTeacherChatMessageList(Number(id))

  const [socket, disconnect] = useSocket(`chat-${id}`)

  const [myReadTime, setMyReadTime] = useState('')
  const [chatCloseMsg, setChatCloseMsg] = useState('')
  const [chatOpenTime, setChatOpenTime] = useState(true)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  const [isDeleteMode, setDeleteMode] = useState(false)

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
          setChatCloseMsg('대화가 불가능한 상태입니다.\n상단 설정 버튼을 눌러 대화가능시간을 설정하세요.')
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
  }, [chatRoomInfo])

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
  }, [me, chatReadInfo, chatMessages])

  useEffect(() => {
    if (id && socket) {
      socket?.emit('in', { id: Number(me?.id) })
    }

    socket?.on('chat', (chatdata: Chat) => {
      console.log('chat', chatdata)
      refetchChatMessages()
        .then(() => {
          //
        })
        .catch(() => {
          // refetch 중에 발생한 에러를 처리하는 작업
          //alert(error?.message);
        })
    })
  }, [id, me?.id, socket])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [id, disconnect])

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteChatId, setDeleteChatId] = useState<number>()
  const [isExitModalOpen, setExitModalOpen] = useState(false)
  const [isSettingOpen, setSettingOpen] = useState(false)
  const [isSettingAttendee, setSettingAttendee] = useState(false)

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
    } catch (error) {
      console.log(error)
    } finally {
      setIsSubmitLoading(false)
    }
  }

  // 채팅이 업데이트될 때마다 아래로 스크롤
  const chatListRef = useRef<HTMLImageElement | null>(null)
  const chatReadRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    chatListRef.current?.scrollTo(0, chatListRef.current.scrollHeight)
  }, [chatMessages, myReadTime])

  return (
    <>
      {(isLoading || isUploadLoading) && <Blank />}
      <div className="relative h-full bg-gray-200">
        <div className="block md:hidden">
          <TopNavbar
            title="메시지"
            left={<BackButton />}
            right={
              <div onClick={() => setSettingOpen(true)} className="flex w-10 items-center">
                <Icon.MoreHorizontal />
              </div>
            }
          />
        </div>
        <div className="hidden h-18 overflow-hidden rounded-lg border bg-gray-50 p-2 md:block">
          <div className="float-left">
            <img
              className="mx-auto mr-1 h-12 w-12 flex-2 flex-shrink-0 rounded-full"
              src={`${Constants.imageUrl}${chatRoomInfo?.roomData?.roomImage}`}
              alt=""
              onError={({ currentTarget }) => {
                currentTarget.onerror = null // prevents looping
                currentTarget.src = SvgUser
              }}
            />
            {/* <span className="absolute w-4 h-4 bg-gray-500 rounded-full right-0 bottom-0 border-2 border-white"></span> */}
            {/* <span className="absolute w-4 h-4 bg-green-400 rounded-full right-0 bottom-0 border-2 border-white"></span> */}
          </div>
          <div
            className="text-brand-1 float-left m-1 mt-1 mr-2 cursor-pointer truncate px-1 py-0.5 text-sm font-bold"
            onClick={() => {
              setSettingAttendee(true)
              setSettingOpen(true)
            }}
          >
            {chatRoomTitle}
          </div>
          <div className="float-right mt-1">
            <button
              children="나가기"
              onClick={() => setExitModalOpen(true)}
              className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-2 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="float-right mt-1 mr-2">
            <button
              children="삭제"
              onClick={() => {
                setDeleteMode(!isDeleteMode)
              }}
              className={twMerge(
                'text-brand-1 rounded-md bg-red-50 px-2 py-2 text-sm hover:bg-red-300 hover:text-white focus:outline-none',
                isDeleteMode && 'bg-red-500 text-white hover:bg-red-500',
              )}
            />
          </div>
          <div className="float-right mt-1 mr-2">
            <button
              children="설정"
              onClick={() => {
                setSettingAttendee(false)
                setSettingOpen(true)
              }}
              className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-2 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div
          style={{
            height: textareaRef?.current
              ? `calc(100vh - 11rem - ${textareaRef.current.scrollHeight}px`
              : 'calc(100vh - 11rem)',
          }}
        >
          <div className="h-full overflow-y-auto py-3" ref={chatListRef}>
            {chatMessages?.items?.map((c: Chat, idx: number) => (
              <>
                {/* {myReadTime === c.createdAt && (
                    <div className="text-center text-red-500" ref={chatReadRef}>
                      여기까지 읽으셨습니다.
                    </div>
                  )} */}

                <DateMessage key={idx} PreMessageData={chatMessages?.items[idx - 1]} MessageData={c} />

                {c.type === 'SYSTEM' ? (
                  <SystemMessage key={c.id} MessageData={c} />
                ) : c.senderId === me?.id ? (
                  <SendMessage
                    key={c.id}
                    PreMessageData={chatMessages?.items[idx - 1]}
                    MessageData={c}
                    PostMessageData={chatMessages?.items[idx + 1]}
                    userRole="teacher"
                    isDeleteMode={isDeleteMode}
                    openDeleteModal={() => {
                      setDeleteModalOpen(true)
                      setDeleteChatId(c.id)
                    }}
                  />
                ) : (
                  <ReceiveMessage
                    key={c.id}
                    PreMessageData={chatMessages?.items[idx - 1]}
                    MessageData={c}
                    PostMessageData={chatMessages?.items[idx + 1]}
                    AttendeeInfo={chatRoomAttendees?.find((item) => item.id === c.senderId)}
                    userRole="teacher"
                  />
                )}
              </>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 mb-12 flex-2 px-3 pb-3 md:mb-0 md:px-0 md:pb-0">
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
              className="block h-auto w-full resize-none border-none bg-transparent px-3 py-2 outline-none"
              style={{ height: textareaRef?.current ? `${textareaRef.current.scrollHeight}px` : 'auto' }}
            />
            <div className="px-3">
              {/* 이미지 */}
              {[...imageObjectMap].length > 0 && (
                <div className="grid w-full grid-flow-row grid-cols-6 gap-2 pb-2">
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
                ref={inputRef}
                onChange={(e) => {
                  const files = e.target.files
                  if (!files || files.length === 0) return
                  addFiles(files)
                  if (inputRef?.current) {
                    inputRef.current.value = ''
                  }
                }}
              />
              {(newMessage || imageObjectMap.size || documentObjectMap.size) && chatOpenTime ? (
                <div onClick={() => OnSendMessage()}>
                  <ChatSendEnabled />
                </div>
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
        setUpdateInfo={(roominfo: RequestUpdateChatroomInfoDto) => updateChatroomInfo(roominfo)}
        removeUser={(userId: number) => removeChatroomUser(userId)}
        addUser={(userIds: number[]) => addChatroomUser(userIds)}
        setModalClose={() => setSettingOpen(false)}
        setCloseChat={() => {
          setSettingOpen(false)
          setExitModalOpen(true)
        }}
        onSearchUser={(searchName: string) => onSearchUser(searchName)}
        searchUserList={chatSearchUserList}
        info={chatRoomInfo}
      />
      <SuperModal modalOpen={isExitModalOpen} setModalClose={() => setExitModalOpen(false)} className="w-max">
        <Section className="mt-7">
          <div className="mb-6 w-full text-center text-sm font-bold text-gray-900">
            <p>채팅방을 나가면 대화는 모두 삭제됩니다.</p>
            <p>정말 채팅방을 나가시겠습니까?</p>
          </div>
          <Button.xl children="나가기" onClick={() => expiredChatRoom()} className="filled-primary" />
        </Section>
      </SuperModal>
      <SuperModal modalOpen={isDeleteModalOpen} setModalClose={() => setDeleteModalOpen(false)} className="w-max">
        <Section className="mt-8">
          <div className="mb-4 w-full text-center font-semibold text-gray-900">
            <p>해당 메시지를 삭제하시겠습니까?</p>
            <p className="text-sm">모든 대화 상대방의 채팅창에서 해당 메시지의 내용을 볼 수 없게 됩니다.</p>
          </div>
          <div className="flex space-x-2">
            <Button.xl children="취소하기" onClick={() => setDeleteModalOpen(false)} className="w-full" />
            <Button.xl
              children="삭제하기"
              disabled={!chatRoomInfo?.roomData?.id || !deleteChatId}
              onClick={() => {
                chatRoomInfo?.roomData?.id && deleteChatId && deleteMessage(chatRoomInfo.roomData.id, deleteChatId)
                setDeleteModalOpen(false)
                setDeleteChatId(undefined)
              }}
              className="w-full bg-red-500 text-white"
            />
          </div>
        </Section>
      </SuperModal>
    </>
  )
}
