import clsx from 'clsx'
import { useState, useEffect, type ChangeEvent } from 'react'
import { useRecoilValue } from 'recoil'

import { ReactComponent as SvgUser } from '@/assets/svg/user.svg'
import { CloseButton, Label, Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Tabs } from '@/legacy/components/common/Tabs'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Constants } from '@/legacy/constants'
import {
  Role,
  UploadFileTypeEnum,
  type RequestUpdateChatroomInfoDto,
  type ResponseChatAttendeeDto,
  type ResponseChatroomInfoDetailDto,
} from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { getRoleTitle } from '@/legacy/util/permission'
import { getNickName } from '@/legacy/util/status'
import { getHoursfromHHmmString, getMinutesfromHHmmString, makeHHmmString } from '@/legacy/util/time'
import { meState } from '@/stores'

enum contentType {
  setting = 1,
  member,
}

interface ChatSettingProps {
  modalOpen: boolean
  showAttendees?: boolean
  setUpdateInfo: (roominfo: RequestUpdateChatroomInfoDto) => void
  removeUser: (userId: number) => void
  addUser: (userIds: number[]) => void
  setModalClose: () => void
  setCloseChat: () => void
  onSearchUser: (searchName: string) => void
  searchUserList?: ResponseChatAttendeeDto[]
  info?: ResponseChatroomInfoDetailDto
}

export function ChatSetting({
  modalOpen,
  showAttendees,
  setUpdateInfo,
  removeUser,
  addUser,
  setModalClose,
  setCloseChat,
  onSearchUser,
  searchUserList,
  info,
}: ChatSettingProps) {
  const me = useRecoilValue(meState)

  const [isStudentView] = useState(me?.role === Role.USER || me?.role === Role.PARENT)

  const { handleUploadFile } = useFileUpload()

  const [selContent, setSelContent] = useState(contentType.setting)
  const [chatroomName, setChatroomName] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [profile, setProfile] = useState('')
  const [startH, setStartH] = useState(0)
  const [startM, setStartM] = useState(0)
  const [endH, setEndH] = useState(0)
  const [endM, setEndM] = useState(0)
  const [editable, setEditable] = useState(false)
  const [showSearchList, setShowSearchList] = useState(false)

  const [enableChatTime, setEnableChatTime] = useState(true)

  useEffect(() => {
    if (info?.roomData) {
      setStartH(getHoursfromHHmmString(info?.roomData?.chatStartTime, 10))
      setStartM(getMinutesfromHHmmString(info?.roomData?.chatStartTime, 11))

      setEndH(getHoursfromHHmmString(info?.roomData?.chatEndTime, 10))
      setEndM(getMinutesfromHHmmString(info?.roomData?.chatEndTime, 11))

      setEnableChatTime(info?.roomData?.chatStartTime !== info?.roomData?.chatEndTime)

      setChatroomName(info?.roomData?.name || '')

      setProfile(info?.roomData?.roomImage || '')

      setEditable(info?.roomData?.createdUserId === me?.id)
    }
  }, [info, me?.id])

  useEffect(() => {
    setEnableChatTime(startH !== endH || startM !== endM)
  }, [startH, startM, endH, endM])

  useEffect(() => {
    modalOpen && showAttendees ? setSelContent(contentType.member) : setSelContent(contentType.setting)
  }, [modalOpen, showAttendees])

  const OnSaveInfo = () => {
    let cst = '00:00'
    let cet = '00:00'
    if (enableChatTime && (startH !== endH || startM !== endM)) {
      cst = makeHHmmString(startH, startM)
      cet = makeHHmmString(endH, endM)
    }

    const info: RequestUpdateChatroomInfoDto = {
      name: chatroomName,
      chatStartTime: cst,
      chatEndTime: cet,
      roomImage: profile,
    }

    setUpdateInfo(info)
  }

  const OnAdduser = (userid: number) => {
    addUser([userid])
  }

  const handleChangeImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    const selectedImageFiles = (e.target as HTMLInputElement).files
    if (!selectedImageFiles || !selectedImageFiles.length) {
      return
    }

    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['profiles'], [selectedImageFiles[0]])

    setProfile(imageFileNames[0])
  }

  return (
    <div
      className={clsx(
        'fixed inset-y-0 right-0 z-100 w-80 translate-x-0 transform border border-gray-500 bg-gray-200 shadow-lg transition-all duration-500',
        !modalOpen && 'translate-x-full',
      )}
    >
      <div className="h-10 w-full bg-white">
        <div className="float-left bg-white">
          <Tabs>
            {[
              { name: '대화상대', type: contentType.member },
              { name: '설정', type: contentType.setting },
            ].map((tab) => (
              <Tabs.Button
                key={tab.name}
                children={tab.name}
                selected={selContent === tab.type}
                onClick={() => {
                  setShowSearchList(false)
                  setUserSearch('')
                  setSelContent(tab.type)
                }}
                className="flex-none px-5"
              />
            ))}
          </Tabs>
        </div>
        <div className="bg-brand-1 float-right">
          <CloseButton
            onClick={() => {
              setShowSearchList(false)
              setUserSearch('')
              setModalClose()
            }}
          />
        </div>
      </div>
      {selContent === contentType.setting && (
        <div className="w-full flex-col">
          <Section>
            <label className="text-sm text-gray-800">대화방 대표이미지</label>
            <div className="mx-auto h-40 w-40 flex-1 flex-shrink-0 items-start rounded-full">
              {editable ? (
                <>
                  <label htmlFor="imageupload">
                    <div className="w-full rounded bg-white">
                      <div className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                        <img
                          src={`${Constants.imageUrl}${profile}`}
                          alt=""
                          loading="lazy"
                          onError={({ currentTarget }) => {
                            currentTarget.onerror = null // prevents looping
                            currentTarget.src = SvgUser
                            currentTarget.className = 'w-full'
                          }}
                        />
                      </div>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="imageupload"
                    accept=".png, .jpeg, .jpg"
                    onChange={(e) => handleChangeImage(e)}
                    className="hidden"
                  />
                </>
              ) : (
                <img
                  src={`${Constants.imageUrl}${profile}`}
                  alt=""
                  loading="lazy"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null // prevents looping
                    currentTarget.src = SvgUser
                    currentTarget.className = 'w-full'
                  }}
                />
              )}
            </div>
            <div className="w-full">
              <Label.col>
                <Label.Text children="대화방 이름" />
                <TextInput
                  readOnly={!editable}
                  placeholder="대화방 이름을 입력하세요."
                  value={chatroomName}
                  onChange={(e) => setChatroomName(e.target.value)}
                />
              </Label.col>
              <span className="float-right text-sm text-gray-800"> 상대방에게도 동일하게 표시됩니다.</span>
            </div>
            <div className="w-full pb-6">
              <div className="flex w-full justify-between">
                <label className="mb-1 text-sm text-gray-800">* 대화 가능 시간</label>
                {/* <ToggleSwitch checked={enableChatTime} onChange={() => setEnableChatTime(!enableChatTime)} /> */}
              </div>

              <div className="space-y-3 pb-6">
                <div className="flex items-center space-x-2">
                  <select
                    value={startH}
                    disabled={!editable}
                    onChange={(e) => setStartH(Number(e.target.value))}
                    className="focus:border-brand-1 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                  >
                    {new Array(24).fill(null).map((_, num: number) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <span>시</span>
                  <select
                    value={startM}
                    disabled={!editable}
                    onChange={(e) => setStartM(Number(e.target.value))}
                    className="focus:border-brand-1 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                  >
                    <option value={0}>0</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                  </select>
                  <span>분 부터</span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    disabled={!editable}
                    value={endH}
                    onChange={(e) => setEndH(Number(e.target.value))}
                    className="focus:border-brand-1 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                  >
                    {new Array(24).fill(null).map((_, num: number) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <span>시</span>
                  <select
                    disabled={!editable}
                    className="focus:border-brand-1 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                    onChange={(e) => setEndM(Number(e.target.value))}
                    value={endM}
                  >
                    <option value={0}>0</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                  </select>
                  <span>분 까지</span>
                </div>
                {!enableChatTime && (
                  <div className="text-sm text-red-400">
                    {' '}
                    시작시간과 종료시간을 동일하게 설정하여 대화가 차단됩니다.
                  </div>
                )}
              </div>
            </div>

            {editable && <Button.lg children="저장하기" onClick={() => OnSaveInfo()} className="filled-primary" />}
          </Section>
        </div>
      )}
      {selContent === contentType.member && (
        <div className="w-full flex-col">
          <Section>
            {editable && (
              <>
                <label className="text-sm text-gray-800">대화상대 추가</label>
                <div className="w-full cursor-pointer text-sm">
                  <div className="flex items-center space-x-2">
                    <SearchInput
                      placeholder="추가할 이름을 입력하세요."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onSearch={() => {
                        setShowSearchList(true)
                        onSearchUser(userSearch)
                      }}
                      className="w-full"
                    />
                    <Icon.Search
                      onClick={() => {
                        setShowSearchList(true)
                        onSearchUser(userSearch)
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {showSearchList ? (
              <>
                <div
                  className={` ${isStudentView ? 'h-screen-16' : editable ? 'h-screen-22' : 'h-screen-12'} scroll-box overflow-y-scroll`}
                >
                  {searchUserList && searchUserList.length > 0 ? (
                    searchUserList
                      ?.sort((a, b) => {
                        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
                      })
                      .map((AttendeeInfo: ResponseChatAttendeeDto) => (
                        <div
                          key={AttendeeInfo.id}
                          onClick={() => OnAdduser(AttendeeInfo?.id)}
                          className="my-1 flex cursor-pointer items-center"
                        >
                          <div className="relative">
                            <img
                              className="mx-auto mr-1 h-10 w-10 flex-2 flex-shrink-0 items-start rounded-full"
                              src={`${Constants.imageUrl}${AttendeeInfo?.customProfile || AttendeeInfo.profile}`}
                              alt=""
                              onError={({ currentTarget }) => {
                                currentTarget.onerror = null // prevents looping
                                currentTarget.src = SvgUser
                                //currentTarget.className = 'w-full ';
                              }}
                            />
                          </div>

                          <div>
                            {AttendeeInfo?.role === Role.USER ? (
                              <div className="text-brand-1 text-sm">
                                {AttendeeInfo?.name} {AttendeeInfo?.studentNumber}
                              </div>
                            ) : AttendeeInfo?.role === Role.PARENT ? (
                              <div className="text-brandblue-1 text-sm">
                                {AttendeeInfo?.name} {'보호자 '}
                                {AttendeeInfo?.children &&
                                  '(' +
                                    AttendeeInfo?.children[0]?.name +
                                    ' ' +
                                    AttendeeInfo?.children[0]?.studentNumber +
                                    ')'}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-900">
                                {AttendeeInfo?.name} {AttendeeInfo?.klass}{' '}
                                {getRoleTitle(AttendeeInfo?.role || Role.TEACHER, AttendeeInfo?.headNumber)}
                                {AttendeeInfo?.position} {AttendeeInfo?.department}
                              </div>
                            )}
                          </div>

                          <div className="bg-brand-1 float-right ml-3 rounded-md text-white">추가</div>
                        </div>
                      ))
                  ) : (
                    <span>검색 결과가 없습니다.</span>
                  )}
                </div>
                <Button.lg
                  children="검색결과 닫기"
                  onClick={() => {
                    setUserSearch('')
                    setShowSearchList(false)
                  }}
                  className="filled-primary"
                />
              </>
            ) : (
              <>
                <label className="text-sm text-gray-800">대화상대 목록</label>
                <div
                  className={` ${isStudentView ? 'h-screen-16' : editable ? 'h-screen-22' : 'h-screen-12'} scroll-box overflow-y-scroll`}
                >
                  {info?.attendeeList
                    ?.sort((a, b) => {
                      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
                    })
                    .map((AttendeeInfo: ResponseChatAttendeeDto) => (
                      <div key={AttendeeInfo.id} className="my-1 flex cursor-pointer items-center">
                        <div className="relative">
                          <img
                            className="mx-auto mr-1 h-10 w-10 flex-2 flex-shrink-0 items-start rounded-full"
                            src={`${Constants.imageUrl}${AttendeeInfo.customProfile}`}
                            alt=""
                            onError={({ currentTarget }) => {
                              currentTarget.onerror = null // prevents looping
                              currentTarget.src = SvgUser
                              //currentTarget.className = 'w-full ';
                            }}
                          />
                        </div>

                        <div>
                          {AttendeeInfo?.role === Role.USER ? (
                            <div className="text-brand-1 text-sm">
                              {AttendeeInfo?.name}
                              {getNickName(AttendeeInfo?.nickName)} {AttendeeInfo?.studentNumber}
                            </div>
                          ) : AttendeeInfo?.role === Role.PARENT ? (
                            <div className="text-brandblue-1 text-sm">
                              {AttendeeInfo?.name}{' '}
                              {AttendeeInfo?.children &&
                                '[' +
                                  AttendeeInfo?.children[0]?.name +
                                  getNickName(AttendeeInfo?.children[0]?.nickName) +
                                  ' ' +
                                  AttendeeInfo?.children[0]?.studentNumber +
                                  ' 보호자]'}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900">
                              {AttendeeInfo?.name}
                              {getNickName(AttendeeInfo?.nickName)} {AttendeeInfo?.klass}{' '}
                              {getRoleTitle(AttendeeInfo?.role || Role.TEACHER, AttendeeInfo?.headNumber)}
                              {AttendeeInfo?.position} {AttendeeInfo?.department}
                            </div>
                          )}
                        </div>

                        {info?.roomData?.createdUserId === AttendeeInfo.id ? (
                          <div className="bg-brand-1 float-right ml-3 rounded-md text-white">{'방장'}</div>
                        ) : (
                          editable && (
                            <div className="float-right">
                              <CloseButton onClick={() => removeUser(AttendeeInfo?.id)} />
                            </div>
                          )
                        )}
                      </div>
                    ))}
                </div>
                {editable && (
                  <Button.lg children="채팅방 나가기" onClick={() => setCloseChat()} className="filled-primary" />
                )}
              </>
            )}
          </Section>
        </div>
      )}
    </div>
  )
}
