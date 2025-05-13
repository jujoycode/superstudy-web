import clsx from 'clsx'
import { uniqBy } from 'lodash'
import { useEffect, useState } from 'react'
import { CoachMark } from 'react-coach-mark'
import { useHistory, useLocation } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { ReactComponent as Close } from '@/asset/svg/close.svg'
import { ChatRoomList } from '@/legacy/components/chat/ChatRoomList'
import { BackButton, Blank, Divider, Label, Section, Select, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Guide, useCoachMark } from '@/legacy/components/common/CoachMark'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Icon } from '@/legacy/components/common/icons'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import { useTeacherChatRoomList } from '@/legacy/container/teacher-chat-room-list'
import { MergedGroupType, useTeacherChatUserList } from '@/legacy/container/teacher-chat-user-list'
import { GroupType, ResponseGroupDto, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { Routes } from 'src/routes'
import { meState, toastState } from '@/stores'
import { MenuType, UserDatas } from 'src/types'
import { exportCSVToExcel } from '@/legacy/util/download-excel'
import { Validator } from '@/legacy/util/validator'
import * as XLSX from 'xlsx'
import { ChatDetailPage } from './ChatDetailPage'
import { ChatSMSPage } from './ChatSMSPage'

const headers = ['id', '이름', '전화번호', '문구1', '문구2', '문구3']

interface ChatListPageProps {
  groupData?: ResponseGroupDto
}

export function ChatListPage({ groupData }: ChatListPageProps) {
  const { push } = useHistory()

  const meRecoil = useRecoilValue(meState)

  const pathname = useLocation().pathname
  const [chatRoomId, setChatRoomId] = useState('')
  const pathRoomId = pathname.replace('/teacher/chat', '').replace('/', '')
  const [mobileSmsSendView, setMobileSmsSendView] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDragIn, setDragIn] = useState(false)

  const setToastMsg = useSetRecoilState(toastState)

  const [selectedMenu, setSelectedMenu] = useState<MenuType>(MenuType.List)
  const [, setStudentName] = useState('')
  const [_studentName, set_studentName] = useState('')

  const [content, setContent] = useState(groupData ? groupData.name : '')

  const [nameInput, setNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const { t } = useLanguage()

  const {
    allGroups,
    lectureGroups,
    selectedGroup,
    setStudentGroups,
    setSelectedGroup,
    selectedUserType,
    setSelectedUserType,
    selectedUserDatas,
    //setKeyword,
    reSearch,
  } = useTeacherChatUserList(selectedMenu)

  const everyGroup = uniqBy(allGroups.concat(lectureGroups), 'id')

  const [selectedGroupType, setSelectedGroupType] = useState<GroupType | 'LECTURE'>()

  const { selectedUsers, setSelectedUsers, createNewRoom, refetchRoomList } = useTeacherChatRoomList()

  useEffect(() => {
    refetchRoomList()
    setChatRoomId(pathRoomId)
  }, [pathRoomId])

  const userIds = selectedUsers.map((el) => el.id)

  const getTitle = (ud: UserDatas) => {
    if (ud.role === '') {
      return '직접입력 : ' + ud.name + ' ' + ud.title
    } else if (ud.role === Role.USER) {
      return '학생 : ' + ud.klass + ' ' + ud.studNum + '번 ' + ud.name
    } else if (ud.role === Role.PARENT) {
      return '보호자 : ' + ud.klass
    } else {
      return ud.klass ? '선생님 : ' + ud.klass : '선생님'
    }
  }

  const coachList: Array<Guide> = [
    {
      comment: (
        <div>
          인원구분에석 직접입력을 선택한 후, 슈퍼스쿨에 등록되지 않은 사용자에게 문자메시지를 보낼 수 있습니다.
          <br /> 단, 수신인의 개인정보보호를 위해 연락처 저장 기능은 지원하지 않습니다.
        </div>
      ),
    },
    // {
    //   comment: (
    //     <div>
    //       문자메시지에 발신인의 이름이 포함됩니다.
    //       <br /> 하단 메시지 내용에서 발신인 이름을 확인하세요.
    //     </div>
    //   ),
    // },
    // {
    //   comment: (
    //     <div>
    //       수신인 개인별 내용으로 변환됩니다.
    //       <br /> 하단 메시지 내용에서 확인하세요.
    //     </div>
    //   ),
    // },
  ]
  const { coach, refs } = useCoachMark('sms', coachList)

  async function downloadAsExcel() {
    const content =
      '주의사항\n' +
      '1. id 열은 수정(입력)하지마세요.\n' +
      '2. 6행부터 작성해주세요.\n' +
      '\n' +
      headers.join(',') +
      '\n' +
      selectedUsers
        .sort((a: UserDatas, b: UserDatas) => {
          return a?.name < b?.name ? -1 : 1
        })
        .map((item) =>
          [
            item.id,
            item.name,
            Validator.phoneNumberRule(item.title) ? item.title : '',
            item.userText1,
            item.userText2,
            item.userText3,
          ].join(),
        )
        .join('\n')
    exportCSVToExcel(content, 'SMS수신자등록양식')
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      if (!e.target) return
      const wb = XLSX.read(e.target.result)
      const wsname = wb.SheetNames[0]
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname], {
        header: 1,
        defval: '',
      })

      const fileHeaders = data[4]
      if (!Array.isArray(fileHeaders) || !areHeadersMatching(fileHeaders, headers)) {
        setToastMsg('업로드 양식이 맞지 않습니다.')
      } else {
        readExcel(data.slice(5))
      }

      setLoading(false)
      setDragIn(false)
    }
    reader.readAsArrayBuffer(file)
  }

  const areHeadersMatching = (fileHeaders: string[], expectedHeaders: string[]): boolean => {
    if (fileHeaders.length !== expectedHeaders.length) return false
    return fileHeaders.every((header, index) => header.trim() === expectedHeaders[index])
  }

  const readExcel = (data: any[]) => {
    const readData: any[] = [...selectedUsers]

    data.map((row: any) => {
      const filteredArr = Array.from<string>(row).filter((value) => value !== '')
      const obj: { [key: string]: any } = {}

      for (let i = 0; i < headers.length; i++) {
        const key = headers[i]
        const value = row[i]
        obj[key] = value
      }

      let phoneNum = String(obj['전화번호']).replaceAll('-', '')

      phoneNum = phoneNum.startsWith('10') ? `0${phoneNum}` : phoneNum

      const updateItem = readData?.find(
        (el) => el.id === Number(obj['id']) || (el.title !== '' && el.title === phoneNum),
      )

      if (updateItem) {
        updateItem.userText1 = obj['문구1']
        updateItem.userText2 = obj['문구2']
        updateItem.userText3 = obj['문구3']
      } else {
        // 신규 사용자의 경우 전화번호 유효성 검증
        // 아이디와 이름이 있는 경우에는 신규 사용자가 아니므로 전화번호 유효성 검증x
        if ((obj['id'] && obj['이름']) || Validator.phoneNumberRule(phoneNum)) {
          let inputUser = {
            id: obj['id'] ? Number(obj['id']) : Number(phoneNum),
            name: obj['이름'],
            role: '',
            title: phoneNum,
            studNum: -1,
            klass: '',
            useNokInfo: false,
            userText1: obj['문구1'],
            userText2: obj['문구2'],
            userText3: obj['문구3'],
          }

          readData.push(inputUser)
        } else {
          // 아이디와 이름이 없고 전화번호 유효성 검증 실패
          setToastMsg('전화번호가 규칙에 맞지않습니다. : ' + phoneNum)
        }
      }
    })

    setSelectedUsers(readData)
  }

  const handleDrop: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (loading) return
    setLoading(true)
    const f = e.dataTransfer.files[0]
    handleFileUpload(f)
  }

  return (
    <>
      {selectedMenu === MenuType.SMS && <CoachMark {...coach} />}
      {/* Desktop V */}
      {loading && <Blank reversed />}
      {/* {error && <ErrorBlank />} */}
      {(selectedMenu === MenuType.SMS && mobileSmsSendView) || (
        <div className={`col-span-3 h-screen ${!chatRoomId || chatRoomId === '' ? '' : 'hidden md:block'}`}>
          <div className="md:hidden">
            <div className="block md:hidden">
              <TopNavbar title={`${t('messages')}`} left={<BackButton />} />
            </div>
          </div>
          <div className="flex justify-between px-6 py-1 md:py-6">
            <h1 className="hidden text-2xl font-semibold md:block">{t('messages')}</h1>
          </div>
          <div className="flex space-x-2 px-6 pb-3">
            <Button.xl
              children={t('chat_list')}
              onClick={() => {
                setChatRoomId('')
                setSelectedMenu(MenuType.List)
              }}
              className={clsx(
                selectedMenu === MenuType.List ? 'bg-brand-1 text-light_orange' : 'bg-light_orange text-brand-1',
              )}
            />
            <Button.xl
              children={t('new_chat')}
              onClick={() => {
                setSelectedMenu(MenuType.Chat)
                setSelectedUsers([])
                setSelectedUserType(-1)
                setSelectedGroup(null)
                setChatRoomId('')
                setStudentGroups([])
                setContent('')
                set_studentName('')
                push(`${Routes.teacher.chat}`)
              }}
              className={clsx(
                selectedMenu === MenuType.Chat ? 'bg-brand-1 text-light_orange' : 'bg-light_orange text-brand-1',
              )}
            />
            <Button.xl
              children="SMS"
              onClick={() => {
                setSelectedMenu(MenuType.SMS)
                setSelectedUsers([])
                setSelectedUserType(-1)
                setSelectedGroup(null)
                setChatRoomId('')
                setStudentGroups([])
                setContent('')
                set_studentName('')
                push(`${Routes.teacher.chat}`)
              }}
              className={clsx(
                selectedMenu === MenuType.SMS ? 'bg-brand-1 text-light_orange' : 'bg-light_orange text-brand-1',
              )}
            />
          </div>
          <div className="scroll-box h-screen-12 overflow-y-auto">
            <div className="px-4">
              {/* Chat list */}
              {selectedMenu === MenuType.List && <ChatRoomList />}

              {(selectedMenu === MenuType.Chat || selectedMenu === MenuType.SMS) && (
                <>
                  <Section>
                    <div className="flex items-center space-x-3">
                      <div className="mt-1 min-w-max cursor-pointer">
                        <Select.lg
                          placeholder={`${t('group_type')}`}
                          ref={refs[0]}
                          value={selectedUserType}
                          onChange={(e) => {
                            setSelectedUserType(Number(e.target.value))
                            if (e.target.value === '2') {
                              setSelectedGroup(null)
                            }

                            reSearch(Number(e.target.value), _studentName, selectedGroup?.id)
                          }}
                        >
                          <option value={-1}>{t('group_type')}</option>
                          <option value={0}>{t('student')}</option>
                          <option value={1}>{t('parent')}</option>
                          <option value={2}>{t('teacher')}</option>
                          {selectedMenu === MenuType.SMS && <option value={3}>{t('direct_input')}</option>}
                        </Select.lg>
                      </div>
                      {selectedUserType === 3 ? (
                        <>
                          <div className="w-2/5 cursor-pointer text-sm">
                            <TextInput
                              placeholder={`${t('name')}`}
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                            />
                          </div>
                          <div className="w-2/5 cursor-pointer text-sm">
                            <TextInput
                              placeholder={`${t('phone_number')}`}
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                            />
                          </div>
                          <Button
                            className="filled-primary h-12 w-1/5"
                            children={t('add')}
                            onClick={() => {
                              if (phoneInput && !Validator.phoneNumberRule(phoneInput)) {
                                setToastMsg('전화번호가 규칙에 맞지않습니다.')
                                return
                              }

                              if (!selectedUsers?.find((el) => el.id === Number(phoneInput))) {
                                let inputUser = {
                                  id: Number(phoneInput),
                                  name: nameInput,
                                  role: '',
                                  title: phoneInput,
                                  studNum: -1,
                                  klass: '',
                                  useNokInfo: false,
                                }

                                setSelectedUsers(selectedUsers.concat(inputUser))
                              }
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <div className="mt-1 flex min-w-max cursor-pointer space-x-2">
                            <Select.lg
                              value={selectedGroupType}
                              disabled={selectedUserType === 2}
                              onChange={(e) => {
                                setSelectedGroupType(e.target.value as GroupType)
                              }}
                            >
                              <option selected disabled value={undefined}>
                                {t('type', '유형')}
                              </option>
                              <option value={GroupType.KLASS}>{t('klass_group', '학급소속 그룹')}</option>
                              <option value={'LECTURE'}>{t('timetable_group', '강의시간표 그룹')}</option>
                              <option value={GroupType.KLUB}>{t('klub_group', '사용자정의 그룹')}</option>
                            </Select.lg>

                            <Select.lg
                              value={selectedGroup?.id || ''}
                              disabled={selectedUserType === 2}
                              onChange={(e) => {
                                setSelectedGroup(
                                  everyGroup?.find((tg: MergedGroupType) => tg.id === Number(e.target.value)) || null,
                                )
                                reSearch(selectedUserType, _studentName, Number(e.target.value))
                              }}
                            >
                              <option value={-1}>{t('select_class')}</option>
                              {(selectedGroupType === 'LECTURE'
                                ? lectureGroups
                                : allGroups?.filter((g) => (selectedGroupType ? g.type === selectedGroupType : true))
                              )?.map((group: MergedGroupType) => (
                                <option key={group.id} value={group.id}>
                                  {group.name}
                                </option>
                              ))}
                            </Select.lg>
                          </div>
                          <div className="w-full cursor-pointer text-sm">
                            <div className="flex items-center space-x-2 pt-3 pb-2">
                              <SearchInput
                                placeholder={`${t('name')}`}
                                value={_studentName}
                                onChange={(e) => {
                                  set_studentName(e.target.value)
                                  if (e.target.value === '') setStudentName('')
                                }}
                                onSearch={() => {
                                  //setKeyword(_studentName);
                                  reSearch(selectedUserType, _studentName, selectedGroup?.id)
                                }}
                                className="w-full"
                              />
                              <Icon.Search
                                className="cursor-pointer"
                                onClick={() => {
                                  //setKeyword(_studentName);
                                  reSearch(selectedUserType, _studentName, selectedGroup?.id)
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {selectedUserType === 3 && (
                      <div className="hidden md:block">
                        <div className="flex items-center space-x-3">
                          <div className="w-4/5">
                            <label
                              htmlFor="excel-file"
                              className={clsx(
                                'my-3 block w-full rounded-lg border-2 border-dotted py-2 text-center hover:bg-yellow-50',
                                isDragIn ? 'border-yellow-600 bg-yellow-50' : 'border-gray-600 bg-slate-50',
                              )}
                              onDrop={handleDrop}
                              onDragOver={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setDragIn(true)
                              }}
                              onDragEnter={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setDragIn(true)
                              }}
                              onDragLeave={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setDragIn(false)
                              }}
                            >
                              {loading ? '업로드 중...' : '문자 수신자 등록 양식 파일을 선택(드래그)해주세요.'}
                            </label>

                            <input
                              id="excel-file"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setDragIn(false)
                                  setLoading(true)
                                  handleFileUpload(file)
                                }

                                e.target.value = ''
                              }}
                            />
                          </div>
                          <Button
                            className="outlined-gray h-12 w-1/5"
                            children={t('download_form')}
                            onClick={downloadAsExcel}
                          />
                        </div>
                      </div>
                    )}
                  </Section>

                  {selectedUserType !== 3 && (
                    <>
                      {selectedUserType !== 2 && selectedUserDatas.length === 0 && (
                        <div className="text-center">{t('select_group_type_and_class')}</div>
                      )}

                      <div className="w-full px-5 py-2">
                        {selectedUserDatas && selectedUserDatas.length > 0 && (
                          <Label.row>
                            <Checkbox
                              checked={!selectedUserDatas?.filter((el) => !userIds.includes(el.id)).length}
                              onChange={() =>
                                !selectedUserDatas?.filter((el) => !userIds.includes(el.id)).length
                                  ? setSelectedUsers(
                                      selectedUsers.filter(
                                        (el) => !selectedUserDatas?.map((sg) => sg.id).includes(el.id),
                                      ),
                                    )
                                  : setSelectedUsers(
                                      selectedUsers.concat(
                                        selectedUserDatas
                                          ?.filter((el) => selectedMenu === MenuType.Chat || el.phone)
                                          ?.filter((el) => !selectedUsers.map((u) => u.id).includes(el.id))
                                          .map((el) => el) || [],
                                      ),
                                    )
                              }
                            />
                            <p>{t('select_all')}</p>
                          </Label.row>
                        )}
                      </div>

                      {selectedUserDatas.length > 0 && (
                        <div className="grid w-full grid-flow-row grid-cols-2 gap-1 px-3 pr-4 pb-4 lg:grid-cols-3 xl:grid-cols-4">
                          {selectedUserDatas?.map((item: UserDatas) => (
                            <div
                              key={item.id}
                              title={getTitle(item)}
                              className={`flex w-full cursor-pointer items-center justify-between rounded-lg border-2 px-3 py-1 ${
                                userIds.includes(item.id) ? 'border-brand-1 bg-light_orange' : 'border-grey-6'
                              }`}
                              onClick={() => {
                                if (userIds.includes(item.id)) {
                                  setSelectedUsers(selectedUsers.filter((u) => u.id !== item.id))
                                } else {
                                  if (selectedMenu === MenuType.Chat || item.phone) {
                                    setSelectedUsers(selectedUsers.concat(item))
                                  } else {
                                    setToastMsg('전화번호가 없어 수신자로 지정할 수 없습니다.')
                                  }
                                }
                              }}
                            >
                              <div className="text-sm font-bold">{item.title}</div>
                              <div className="font-base text-sm">{item.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <Section>
                    <div>
                      <div className="flex items-center space-x-3">
                        <Label
                          children={selectedMenu === MenuType.Chat ? t('selected_contacts') : t('selected_recipients')}
                        />
                        <Button.xs
                          children={'전체삭제'}
                          onClick={() => setSelectedUsers([])}
                          className="outlined-gray"
                        />
                      </div>
                      <div className="mt-1 flex flex-wrap">
                        {selectedUsers
                          ?.slice()
                          ?.sort((a: UserDatas, b: UserDatas) => {
                            return a?.name < b?.name ? -1 : 1
                          })
                          .map((el) => (
                            <div
                              key={el.id}
                              title={getTitle(el)}
                              onClick={() => setSelectedUsers(selectedUsers.filter((u) => u.id !== el.id))}
                              className={clsx(
                                'm-1s text-2sm mt-2 mr-2 flex w-max cursor-pointer items-center space-x-2 rounded-full border-2 bg-white px-2.5 py-1.5 font-bold whitespace-nowrap',
                                el.role === ''
                                  ? 'border-green-400 text-green-400'
                                  : el.role === Role.USER
                                    ? 'border-brand-1 text-brand-1'
                                    : el.role === Role.PARENT
                                      ? 'border-brandblue-1 text-brandblue-1'
                                      : 'border-black text-black',
                              )}
                            >
                              <div className="whitespace-pre">{el.name}</div>
                              <Close />
                            </div>
                          ))}
                      </div>
                    </div>
                  </Section>

                  <Divider />

                  {selectedMenu === MenuType.Chat && (
                    <div className="my-6 text-center">
                      <Button.lg
                        children={t('start_new_chat')}
                        disabled={!selectedUsers.length}
                        onClick={() => createNewRoom()}
                        className="filled-primary w-full"
                      />
                    </div>
                  )}

                  {selectedMenu === MenuType.SMS && (
                    <div className="my-6 text-center md:hidden">
                      <Button.lg
                        children={t('send_text_message')}
                        disabled={!selectedUsers.length}
                        onClick={() => setMobileSmsSendView(true)}
                        className="filled-primary w-full"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {(selectedMenu === MenuType.List || selectedMenu === MenuType.Chat) && (
        <>
          {chatRoomId && chatRoomId !== '' ? (
            <div className="scroll-box col-span-3 h-screen overflow-y-scroll bg-gray-200 p-0 md:p-6">
              <ChatDetailPage id={chatRoomId} />
            </div>
          ) : (
            <div className="col-span-3 hidden h-full w-full flex-col items-center justify-center space-y-4 md:flex">
              <div className="text-grey-2">
                {meRecoil?.teacherProperty?.chatStartTime &&
                meRecoil?.teacherProperty?.chatEndTime &&
                meRecoil?.teacherProperty?.chatStartTime !== meRecoil?.teacherProperty?.chatEndTime ? (
                  <div>
                    <div className="mb-3 text-xl font-bold">
                      {t('available_chat_time')} : {meRecoil?.teacherProperty?.chatStartTime} ~{' '}
                      {meRecoil?.teacherProperty?.chatEndTime}
                    </div>
                    <div className="text-sm text-red-400">* {t('start_new_chat_time')}</div>
                    <div className="text-sm text-red-400">* {t('separate_time_for_each_chat')}</div>
                  </div>
                ) : (
                  <div className="flex w-full flex-col items-center justify-center space-y-4">
                    <div className="text-xl">{t('chat_unavailable')}</div>

                    <div>
                      <span className="font-bold">{t('set_chat_time_in_profile')}</span>
                    </div>

                    <Button
                      children={t('set_available_chat_time')}
                      onClick={() => push('/teacher/update')}
                      className="filled-primary"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {selectedMenu === MenuType.SMS && (
        <div className={` ${mobileSmsSendView ? '' : 'hidden md:col-span-3 md:block'} `}>
          <div className="block md:hidden">
            <TopNavbar
              title={`${t('messages')}`}
              left={<BackButton onClick={() => setMobileSmsSendView(false)} />}
              right={
                <Button.sm
                  children={
                    <div className="flex items-center gap-1">
                      <SolidSVGIcon.Tooltip />
                      {t('mail_merge_manual')}
                    </div>
                  }
                  className="outlined-gray mr-2"
                  onClick={() =>
                    window.open('https://superschoolofficial.notion.site/1d6e90ac0a9980dcb027c1c73a3cf44d', '_blank')
                  }
                />
              }
            />
          </div>
          <div className="h-screen-6 p-0 md:h-screen md:py-6">
            <ChatSMSPage
              isMobileView={mobileSmsSendView}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
            />
          </div>
        </div>
      )}
    </>
  )
}
