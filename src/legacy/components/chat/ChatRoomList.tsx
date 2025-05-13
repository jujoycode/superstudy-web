import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useSetRecoilState } from 'recoil'

import { ReactComponent as SvgUser } from '@/assets/svg/user.svg'
import { MessageBox } from '@/legacy/components/chat/MessageBox'
import { Section } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Constants } from '@/legacy/constants'
import { useTeacherChatRoomList } from '@/legacy/container/teacher-chat-room-list'
import { useDashboardGetDashBoardData } from '@/legacy/generated/endpoint'
import { ResponseChatroomInfoDto, ResponseDashboardDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { newMsgCntState } from '@/stores'

interface ChatRoomListProps {}

export function ChatRoomList({}: ChatRoomListProps) {
  const { chatRooms } = useTeacherChatRoomList()
  const { t } = useLanguage()

  const setNewMsgCnt = useSetRecoilState(newMsgCntState)

  const [_name, set_Name] = useState('')

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
      <Section>
        <div className="flex items-center space-x-3">
          <div className="w-full cursor-pointer text-sm">
            <div className="flex items-center space-x-2 pt-3">
              <SearchInput
                placeholder={`${t('search_chat_partners')}`}
                value={_name}
                onChange={(e) => set_Name(e.target.value)}
                className="w-full"
              />
              <Icon.Search />
            </div>
          </div>
        </div>
      </Section>

      {chatRooms
        ?.filter(
          (item: ResponseChatroomInfoDto) =>
            _name === '' || item.attendeeNames?.includes(_name) || item.chatroomName?.includes(_name),
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
              <button className="w-full focus:outline-none focus-visible:bg-indigo-50">
                <Link to={`/${userType}/chat/${cr.chatroomId}`}>
                  <div className="flex cursor-pointer items-center">
                    <div className="relative">
                      <img
                        className="mx-auto mr-6 h-15 w-15 flex-2 flex-shrink-0 items-start rounded-xl bg-gray-100"
                        src={`${Constants.imageUrl}${cr.roomImage}`}
                        alt=""
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null // prevents looping
                          currentTarget.src = SvgUser as unknown as string
                          //currentTarget.className = 'w-full ';
                        }}
                      />
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
