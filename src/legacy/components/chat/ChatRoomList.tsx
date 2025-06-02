import { Link, useLocation } from 'react-router'
import { useNotificationStore } from '@/stores/notification'
import { Avatar } from '@/atoms/Avatar'
import { MessageBox } from '@/legacy/components/chat/MessageBox'
import { useTeacherChatRoomList } from '@/legacy/container/teacher-chat-room-list'
import { useDashboardGetDashBoardData } from '@/legacy/generated/endpoint'
import { ResponseChatroomInfoDto, ResponseDashboardDto } from '@/legacy/generated/model'

interface ChatRoomListProps {
  name: string
}

export function ChatRoomList({ name }: ChatRoomListProps) {
  const { chatRooms } = useTeacherChatRoomList()

  const { setNewMsgCnt } = useNotificationStore()

  let userType = ''
  const { pathname } = useLocation()

  if (pathname?.split('/').length > 2) {
    userType = pathname?.split('/')[1]
  }

  useDashboardGetDashBoardData<ResponseDashboardDto>({
    query: {
      onSuccess: (res) => {
        setNewMsgCnt(res?.unreadChatMessageCount || 0)
      },
    },
  })

  return (
    <div className="h-screen-16">
      {chatRooms
        ?.filter(
          (item: ResponseChatroomInfoDto) =>
            name === '' || item.attendeeNames?.includes(name) || item.chatroomName?.includes(name),
        )
        ?.slice()
        ?.sort((a: ResponseChatroomInfoDto, b: ResponseChatroomInfoDto) =>
          !a.lastMessageCreatedAt
            ? 1
            : !b.lastMessageCreatedAt
              ? -1
              : a.lastMessageCreatedAt > b.lastMessageCreatedAt
                ? -1
                : 1,
        )
        ?.map((cr: ResponseChatroomInfoDto) => (
          <div
            key={cr.chatroomId}
            className={
              pathname === `/${userType}/chat/${cr.chatroomId}` ? 'cursor-pointer bg-gray-50 p-2' : 'cursor-pointer p-2'
            }
          >
            <div>
              <button className="w-full focus:outline-hidden focus-visible:bg-indigo-50">
                <Link to={`/${userType}/chat/${cr.chatroomId}`}>
                  <div className="flex cursor-pointer items-center">
                    <div className="relative">
                      <Avatar src={cr.roomImage || ''} size="md" rounded="sm" className="mr-4" />
                    </div>
                    {/* 대화정보 (마지막 메시지, 시간, 안 읽은 갯수) */}
                    <MessageBox info={cr} />
                  </div>
                </Link>
              </button>
            </div>
          </div>
        ))}
    </div>
  )
}
