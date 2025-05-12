import { clsx } from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { ReactComponent as Refresh } from '@/legacy/assets/svg/refresh.svg'
import { FrontPagination } from '@/legacy/components'
import { Blank, Label, Section, Select, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { Tabs } from '@/legacy/components/common/Tabs'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ToggleSwitch } from '@/legacy/components/common/ToggleSwitch'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import { SmsCard } from '@/legacy/components/sms/SmsCard'
import { useTeacherSms } from '@/legacy/container/teacher-sms'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { meState } from '@/stores'
import { UserDatas } from '@/legacy/types'
import { isValidDate, makeDateToString } from '@/legacy/util/time'

type SmsInfoType = {
  receiverId: number
  receiverNum: string
  receiverName: string
  userText1: string
  userText2: string
  userText3: string
  message: string
  useNokInfo: boolean
}

interface SmsPageProps {
  isMobileView: boolean
  selectedUsers: UserDatas[]
  setSelectedUsers: (data: UserDatas[]) => void
}

export function ChatSMSPage({ isMobileView, selectedUsers, setSelectedUsers }: SmsPageProps) {
  const me = useRecoilValue(meState)
  const { t } = useLanguage()

  const [smsInfos, setSmsInfos] = useState<SmsInfoType[]>([])
  const [messageFormat, setMessageFormat] = useState<string>('')
  const [userText1, setUserText1] = useState<string[]>([])
  const [userText2, setUserText2] = useState<string[]>([])
  const [userText3, setUserText3] = useState<string[]>([])
  const [addSender, setAddSender] = useState<boolean>(false)
  const [isSecret, setIsSecret] = useState<boolean>(false)
  const [typeSMS, setTypeSMS] = useState<boolean>(true)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    wait,
    isSendPage,
    creditLoading,
    remainCredit,
    setIsSendPage,
    createNewMessage,
    smsHistoryList,
    refetchHistory,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    page,
    setPage,
    limit,
    listResultType,
    setListResultType,
  } = useTeacherSms()

  const getSenderName = () => {
    const schoolName =
      me?.school.smsHeader === '' ? me?.school.name.replace('등학교', '').replace('학교', '') : me?.school.smsHeader

    if (addSender) {
      return '[' + schoolName + ' ' + me?.name + '] '
    } else {
      return '[' + schoolName + '] '
    }
  }

  const checkSMSType = (message: string) => {
    let charBytes = 0

    for (const char of message) {
      const charCode = char.charCodeAt(0)

      charBytes += charCode > 127 ? 2 : 1
    }

    return charBytes < 90
  }

  useEffect(() => {
    let isSMSType = true

    const smsInfoTemp = selectedUsers
      .map((item, index) => ({
        id: item.id,
        receiverNum: item.title,
        name: item.name,
        klass: item.klass,
        useNokInfo: item.useNokInfo,
        userText1: item.userText1,
        userText2: item.userText2,
        userText3: item.userText3,
      }))
      .sort((a, b) => {
        return a.receiverNum > b.receiverNum ? 1 : -1
      })
      .map((item, index) => {
        const itemText1 = item.userText1 ? item.userText1 : userText1[index]
        const itemText2 = item.userText2 ? item.userText2 : userText2[index]
        const itemText3 = item.userText3 ? item.userText3 : userText3[index]

        const personalMessage =
          getSenderName() +
          messageFormat
            .replace(new RegExp('{이름}', 'g'), item.name || '')
            .replace(new RegExp('{학급}', 'g'), item.klass || '')
            .replace(new RegExp('{번호}', 'g'), item.receiverNum || '')
            .replace(new RegExp('{문구1}', 'g'), itemText1 || '')
            .replace(new RegExp('{문구2}', 'g'), itemText2 || '')
            .replace(new RegExp('{문구3}', 'g'), itemText3 || '')

        isSMSType = checkSMSType(personalMessage)

        return {
          receiverId: item.id,
          receiverNum: item.receiverNum,
          receiverName: item.name,
          userText1: itemText1 || '',
          userText2: itemText2 || '',
          userText3: itemText3 || '',
          message: personalMessage,
          useNokInfo: item.useNokInfo,
        }
      })

    setTypeSMS(isSMSType)

    console.log('smsInfoTemp', smsInfoTemp)

    setSmsInfos(smsInfoTemp)
  }, [selectedUsers, messageFormat, userText1, userText2, userText3, addSender])

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const startPos = textarea.selectionStart
      const endPos = textarea.selectionEnd

      const text = textarea.value
      const newText = text.substring(0, startPos) + textToInsert + text.substring(endPos, text.length)

      setMessageFormat(newText)
      // textarea.value = newText;
      // // 커서 위치 설정
      // textarea.selectionStart = startPos + textToInsert.length;
      // textarea.selectionEnd = startPos + textToInsert.length;
    }

    textarea?.focus()
  }

  const sendSMSMessage = () => {
    const temp = smsInfos.map((item) => ({
      receiverPhone: item.receiverNum,
      receiverName: item.receiverName,
      receiverId: item.receiverId,
      isSecret: isSecret,
      content: item.message,
      useNokInfo: item.useNokInfo,
    }))
    createNewMessage(temp)
  }

  const handlePaste = async (textNum: number) => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      console.log('클립보드 내용:', clipboardText)
      const rows = clipboardText.split('\n')

      if (textNum === 1) {
        setUserText1(rows)
      } else if (textNum === 2) {
        setUserText2(rows)
      } else if (textNum === 3) {
        setUserText3(rows)
      }
    } catch (err) {
      console.error('클립보드 가져오기 실패:', err)
    }
  }

  return (
    <div className="h-screen-10 border-l-2 px-2">
      {creditLoading && <Blank />}
      <div className={clsx(`flex`, { 'justify-between': !isMobileView })}>
        <Tabs className="w-full">
          <Tabs.Button
            children={t('compose_new_message')}
            selected={isSendPage}
            onClick={() => {
              setIsSendPage(true)
            }}
            className="md:flex-none md:px-5"
          />
          <Tabs.Button
            children={t('send_results')}
            selected={!isSendPage}
            onClick={() => {
              refetchHistory()
              setIsSendPage(false)
            }}
            className="md:flex-none md:px-5"
          />
        </Tabs>
        <Button.sm
          children={
            <div className="flex items-center gap-1">
              <SolidSVGIcon.Tooltip />
              {t('bulk_recipient_registration_and_mail_merge_manual')}
            </div>
          }
          className="outlined-gray mr-5 hidden md:block"
          onClick={() =>
            window.open('https://superschoolofficial.notion.site/1d0e90ac0a99808488e9f5447920a7e7', '_blank')
          }
        />
      </div>

      <div className="scroll-box h-screen-9 overflow-y-auto md:h-screen">
        {isSendPage && (
          <Section>
            {wait && <Blank text={`${t('sending_text_message')}`} />}
            <Label.col>
              <Label.Text>
                <div className="flex justify-between">
                  <div>
                    *<span className="text-red-500">({t('required')})</span> {t('content')}
                  </div>
                  <div>
                    {typeSMS ? (
                      <span className="text-blue-500">{t('short_message')}</span>
                    ) : (
                      <span className="text-red-500">{t('long_message')}</span>
                    )}
                  </div>
                </div>
              </Label.Text>
              {remainCredit?.remainCredit && remainCredit?.remainCredit > 0 ? (
                <Textarea
                  ref={textareaRef}
                  placeholder={`${t('enter_message_content')}`}
                  value={messageFormat}
                  onChange={(e) => setMessageFormat(e.target.value)}
                  className="border"
                />
              ) : (
                <div className="rounded-md border border-red-500 py-20 text-center text-lg font-bold text-red-400">
                  {t('insufficient_sms_credits')}
                  <br />
                  {t('contact_school_admin_for_credits')}
                </div>
              )}
            </Label.col>
            <div className="flex justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <div className="mr-3">{t('add_sender')}</div>
                <ToggleSwitch
                  checked={addSender}
                  onChange={() => {
                    setAddSender(!addSender)
                  }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="mr-3">{t('secret_message', '비밀문자')}</div>
                <ToggleSwitch
                  checked={isSecret}
                  onChange={() => {
                    setIsSecret(!isSecret)
                  }}
                />
              </div>
            </div>
            {isSecret && <div className="flex justify-end text-red-400">전송 이력에 문자 내용이 남지 않습니다.</div>}
            <div className="flex space-x-2">
              <div className="mr-3">{t('individual_text')}</div>
              <Button.sm children="{번호}" onClick={() => insertTextAtCursor(' {번호}')} className="outlined-gray" />
              <Button.sm children="{학급}" onClick={() => insertTextAtCursor(' {학급}')} className="outlined-gray" />
              <Button.sm children="{이름}" onClick={() => insertTextAtCursor(' {이름}')} className="outlined-gray" />
              {!isMobileView && (
                <>
                  <Button.sm
                    children="{문구1}"
                    onClick={() => insertTextAtCursor(' {문구1}')}
                    className="filled-blue"
                  />
                  <Button.sm
                    children="{문구2}"
                    onClick={() => insertTextAtCursor(' {문구2}')}
                    className="filled-green"
                  />
                  <Button.sm
                    children="{문구3}"
                    onClick={() => insertTextAtCursor(' {문구3}')}
                    className="filled-yellow"
                  />
                </>
              )}
            </div>

            <div className="my-6 text-center">
              <Button.lg
                children={t('send_sms')}
                disabled={!selectedUsers.length || !remainCredit?.remainCredit || remainCredit?.remainCredit <= 0}
                onClick={() => sendSMSMessage()}
                className="filled-primary w-full"
              />
            </div>

            <Label.col>
              <Label.Text>* {t('review_recipients_and_messages')}</Label.Text>
              <div className="h-screen-32 overflow-y-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="w-14 border border-gray-300">번호</th>
                      <th className="w-14 min-w-max border-gray-300">이름</th>
                      {!isMobileView && (
                        <>
                          <th className="hidden w-20 border border-gray-300">
                            <Button.sm children="미사용" onClick={() => handlePaste(0)} />
                          </th>
                          <th className="w-20 border border-gray-300">
                            <Button.sm children="문구1등록" onClick={() => handlePaste(1)} className="filled-blue" />
                          </th>
                          <th className="w-20 border border-gray-300">
                            <Button.sm children="문구2등록" onClick={() => handlePaste(2)} className="filled-green" />
                          </th>
                          <th className="w-20 border border-gray-300">
                            <Button.sm children="문구3등록" onClick={() => handlePaste(3)} className="filled-yellow" />
                          </th>
                        </>
                      )}
                      <th className="border border-gray-300">메시지 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smsInfos.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="border border-gray-300">{row.receiverNum}</td>
                        <td className="border border-gray-300">{row.receiverName}</td>
                        {!isMobileView && (
                          <>
                            <td className="border border-gray-300 break-all">{row.userText1}</td>
                            <td className="border border-gray-300 break-all">{row.userText2}</td>
                            <td className="border border-gray-300 break-all">{row.userText3}</td>
                          </>
                        )}
                        <td className="border border-gray-300 break-all">{row.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Label.col>
          </Section>
        )}
        {!isSendPage && (
          <div className="scroll-box h-screen-6 pb-10">
            <div className="my-3 flex items-center space-x-3">
              <div className="mt-1 min-w-max cursor-pointer">
                <Select.lg
                  placeholder="전송결과"
                  value={listResultType}
                  onChange={(e) => {
                    setPage(1)
                    setListResultType(Number(e.target.value))
                  }}
                >
                  <option value={0}>{'전체'}</option>
                  <option value={1}>{'성공'}</option>
                  <option value={2}>{'실패(전송중)'}</option>
                </Select.lg>
              </div>
              <TextInput
                type="date"
                value={makeDateToString(new Date(startDate || ''))}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value)
                  if (!isValidDate(selectedDate)) {
                    return
                  }
                  if (endDate && selectedDate > new Date(endDate || '')) {
                    setEndDate(e.target.value)
                  }
                  setStartDate(e.target.value)
                  setPage(1)
                }}
              />
              <div className="px-4 text-xl font-bold">~</div>
              <TextInput
                type="date"
                value={makeDateToString(new Date(endDate || ''))}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value)
                  if (!isValidDate(selectedDate)) {
                    return
                  }
                  if (startDate && selectedDate < new Date(startDate || '')) {
                    setStartDate(e.target.value)
                  }
                  setEndDate(e.target.value)
                  setPage(1)
                }}
              />
              <div
                onClick={() => {
                  refetchHistory()
                }}
                className="text-brand-1 text-sm"
              >
                <Refresh />
              </div>
            </div>

            <div className="scroll-box h-screen-12 overflow-y-auto pb-10">
              {smsHistoryList?.items.map((sms) => (
                <SmsCard
                  key={sms.id}
                  receiverName={(sms.receiverName || '') + (sms.useNokInfo ? '보호자' : '')}
                  sendAt={sms.createdAt}
                  content={sms.content}
                  result={sms.success}
                  retryCount={sms.retryCount}
                />
              ))}
            </div>

            {smsHistoryList && smsHistoryList?.total > limit && (
              <div className="grid place-items-center">
                <FrontPagination
                  basePath="/teacher/chat"
                  total={smsHistoryList?.total}
                  limit={limit}
                  page={page}
                  setPage={setPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
