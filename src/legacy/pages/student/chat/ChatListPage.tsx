import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

import { ReactComponent as Close } from '@/assets/svg/close.svg'
import { useHistory } from '@/hooks/useHistory'
import { ChatRoomList } from '@/legacy/components/chat/ChatRoomList'
import { BackButton, Divider, Label, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Routes } from '@/legacy/constants/routes'
import { useStudentChatRoomList } from '@/legacy/container/student-chat-room-list'
import { useStudentChatUserList } from '@/legacy/container/student-chat-user-list'
import { UserDatas } from '@/legacy/types'

import { ChatDetailPage } from './ChatDetailPage'

export function ChatListPage() {
  const { push } = useHistory()
  const { pathname } = useLocation()
  const [chatRoomId, setChatRoomId] = useState('')
  const pathRoomId = pathname.replace('/student/chat', '').replace('/', '')
  useEffect(() => {
    setChatRoomId(pathRoomId)
  }, [pathRoomId])

  const { selectedUserDatas } = useStudentChatUserList()

  const { selectedUsers, setSelectedUsers, createNewRoom } = useStudentChatRoomList()
  const userIds = selectedUsers.map((el) => el.id)

  const [selectedMenu, setSelectedMenu] = useState(false)
  const [, setStudentName] = useState('')
  const [_studentName, set_studentName] = useState('')

  return (
    <>
      <div
        className={`scroll-box h-screen-4 w-full overflow-y-scroll bg-white ${
          !chatRoomId || chatRoomId === '' ? '' : 'hidden'
        }`}
      >
        <TopNavbar title="채팅" left={<BackButton className="h-15" onClick={() => push('/')} />} />

        <div className="flex px-6 py-3">
          <Button.lg
            children="대화목록"
            onClick={() => {
              setChatRoomId('')
              setSelectedMenu(false)
            }}
            className={clsx(selectedMenu === false ? 'bg-brand-1 text-light_orange' : 'bg-light_orange text-brand-1')}
          />{' '}
          &nbsp;
          <Button.lg
            children="새 대화"
            onClick={() => {
              setSelectedMenu(true)
              setSelectedUsers([])
              set_studentName('')
              push(`${Routes.student.chat}`)
            }}
            className={clsx(selectedMenu === false ? 'bg-light_orange text-brand-1' : 'bg-brand-1 text-light_orange')}
          />
        </div>
        <Divider />
        <div className="scroll-box h-screen-12 overflow-y-auto">
          <div className="px-4">
            {/* Chat list */}
            {!selectedMenu && <ChatRoomList />}

            {selectedMenu && (
              <>
                <Section>
                  <div className="flex items-center space-x-3">
                    <div className="w-full cursor-pointer text-sm">
                      <div className="flex items-center space-x-2 pt-3 pb-2">
                        <SearchInput
                          placeholder={'이름을 입력해 주세요.'}
                          value={_studentName}
                          onChange={(e) => {
                            set_studentName(e.target.value)
                            if (e.target.value === '') {
                              setStudentName('')
                            }
                          }}
                          className="w-full"
                        />
                        <Icon.Search />
                      </div>
                    </div>
                  </div>
                </Section>

                <div className="grid w-full grid-flow-row grid-cols-2 gap-2 px-3 pr-4 pb-4">
                  {selectedUserDatas
                    ?.filter((item: UserDatas) => _studentName === '' || item.name.includes(_studentName))
                    ?.sort((a, b) => {
                      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
                    })
                    ?.map((item: UserDatas) => (
                      <div
                        key={item.id}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg border-2 px-3 py-1 ${
                          userIds.includes(item.id) ? 'border-brand-1 bg-light_orange' : 'border-gray-6'
                        }`}
                        onClick={() => {
                          // 학생은 선생님 한명에게만 대화할 수 있음
                          if (userIds.includes(item.id)) {
                            setSelectedUsers(selectedUsers.filter((u) => u.id !== item.id))
                          } else {
                            setSelectedUsers([item])
                          }
                        }}
                      >
                        <div className="text-sm font-bold">{item.title}</div>
                        <div className="font-base overflow-hidden text-sm whitespace-pre">{item.name}</div>
                      </div>
                    ))}
                </div>

                <Section>
                  <div>
                    <Label children="선택된 대화상대" />
                    <div className="mt-1 flex flex-wrap">
                      {selectedUsers.map((el: UserDatas) => (
                        <div
                          key={el.id}
                          onClick={() => setSelectedUsers(selectedUsers.filter((u) => u.id !== el.id))}
                          className="m-1s text-2sm mt-2 mr-2 flex w-max cursor-pointer items-center space-x-2 rounded-full border-2 border-black bg-white px-2.5 py-1.5 font-bold whitespace-nowrap text-black"
                        >
                          <div className="whitespace-pre">{el.name}</div>
                          <Close />
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                <Divider />

                <div className="mt-2 mb-20">
                  <Button.lg
                    children="새 대화 시작"
                    disabled={!selectedUsers.length}
                    onClick={() => createNewRoom()}
                    className="filled-primary mx-auto w-[70%]"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {chatRoomId && chatRoomId !== '' && (
        <div className="scroll-box h-screen-4 col-span-3 overflow-hidden overflow-y-scroll bg-gray-50 p-0">
          <ChatDetailPage id={chatRoomId} />
        </div>
      )}
    </>
  )
}
