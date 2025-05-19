import { ChangeEvent, useEffect, useState } from 'react'

import { ReactComponent as SvgUser } from '@/assets/svg/user.svg'
import { BackButton, Blank, Label, PhoneNumberField, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ToggleSwitch } from '@/legacy/components/common/ToggleSwitch'
import { Constants } from '@/legacy/constants'
import { useTeacherInfoUpdate } from '@/legacy/container/teacher-info-update'
import { ResponseUserDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { checkFileSizeLimit100MB } from '@/legacy/util/file'
import { getHoursfromHHmmString, getMinutesfromHHmmString } from '@/legacy/util/time'
import { Validator } from '@/legacy/util/validator'

interface TeacherInfoUpdatePageProps {
  me: ResponseUserDto
  setIsUpdateMe: (isUpdateMe: boolean) => void
}

export function TeacherInfoUpdatePage({ me, setIsUpdateMe }: TeacherInfoUpdatePageProps) {
  const [name, setName] = useState(me?.name)
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [phone, setPhone] = useState(me?.phone || '')
  const [profile, setProfile] = useState(me?.profile || '')
  const { handleUploadFile } = useFileUpload()

  const [department, setDepartment] = useState(me?.teacherProperty?.department || '')
  const [position, setPosition] = useState(me?.teacherProperty?.position || '')

  const { isUpdateMeLoading, updateMe } = useTeacherInfoUpdate()

  const [enableChatTime, setEnableChatTime] = useState(true)
  const [startH, setStartH] = useState(0)
  const [startM, setStartM] = useState(0)
  const [endH, setEndH] = useState(0)
  const [endM, setEndM] = useState(0)

  useEffect(() => {
    if (me?.teacherProperty) {
      setStartH(getHoursfromHHmmString(me?.teacherProperty?.chatStartTime, 9))
      setStartM(getMinutesfromHHmmString(me?.teacherProperty?.chatStartTime, 0))

      setEndH(getHoursfromHHmmString(me?.teacherProperty?.chatEndTime, 18))
      setEndM(getMinutesfromHHmmString(me?.teacherProperty?.chatEndTime, 0))

      setEnableChatTime(me?.teacherProperty?.chatStartTime !== me?.teacherProperty?.chatEndTime)
    }
  }, [me])

  const buttonDisabled = !name || !phone || password !== password2

  const handleUpdate = () => {
    updateMe({
      name,
      phone,
      password,
      profile: profile || '',
      position,
      department,
      chatStartTime: enableChatTime ? startH + ':' + startM.toString().padStart(2, '0') : '00:00',
      chatEndTime: enableChatTime ? endH + ':' + endM.toString().padStart(2, '0') : '00:00',
    })
      .then(() => {
        setIsUpdateMe(false)
      })
      .catch((e) => {
        console.log('update error', e)
      })
  }

  const handleChangeImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    const selectedImageFiles = (e.target as HTMLInputElement).files
    if (!selectedImageFiles || !selectedImageFiles.length) {
      return
    }

    if (!Validator.fileNameRule(selectedImageFiles[0].name)) {
      alert('특수문자(%, &, ?, ~, +)가 포함된 파일명은 사용할 수 없습니다.')
      return
    }

    if (!checkFileSizeLimit100MB([selectedImageFiles[0]])) {
      alert('한번에 최대 100MB까지만 업로드 가능합니다.')
      return
    }

    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['userpictures'], [selectedImageFiles[0]])

    setProfile(imageFileNames[0])
  }

  return (
    <>
      {/* Mobile V */}
      <div className="block md:hidden">
        <TopNavbar title="내 정보" left={<BackButton />} />
      </div>
      <div className="scroll-box col-span-6 h-full max-w-lg overflow-y-auto px-6 py-6">
        {isUpdateMeLoading && <Blank />}
        <Section>
          <label className="text-sm text-gray-800">사진</label>
          <div className="mx-auto h-60 w-60 flex-1 flex-shrink-0 items-start rounded-full">
            <label htmlFor="imageupload">
              <div className="w-full rounded bg-white">
                <div className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                  <img
                    className="mx-auto mr-1 rounded-xl"
                    src={`${Constants.imageUrl}${profile}`}
                    alt=""
                    loading="lazy"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null // prevents looping
                      currentTarget.src = SvgUser as unknown as string
                      currentTarget.className = 'w-full'
                    }}
                  />
                  <div className="text-brand-1">사진을 선택해주세요.</div>
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
          </div>
          <Label.col>
            <Label.Text children="이름" />
            <TextInput
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled
            />
          </Label.col>
          <Label.col>
            <Label.Text children="이메일" />
            <TextInput value={me.email || ''} disabled />
          </Label.col>
          <Label.col>
            <Label.Text children="비밀번호" />
            <TextInput
              type="password"
              placeholder="비밀번호 (문자,숫자,특수문자를 포함한 8자 이상)"
              value={password}
              onChange={(e) => setPassword(Validator.removeSpace(String(e.target.value)))}
            />
            {password && !Validator.passwordRule(password) && (
              <div className="text-red-600">안전한 비밀번호를 입력하세요.</div>
            )}
            <TextInput
              type="password"
              placeholder="동일한 비밀번호를 한번 더 입력해주세요."
              value={password2}
              onChange={(e) => setPassword2(Validator.removeSpace(String(e.target.value)))}
            />
            {password2 && password !== password2 && (
              <div className="text-red-600">비밀번호 확인이 일치하지 않습니다.</div>
            )}
            <div className="text-gray-3 text-sm">
              &nbsp; 안전한 개인정보의 보호를 위해 문자,숫자,특수문자가 포함된 8자 이상의 비밀번호를 입력하세요.
              <br />
              &nbsp; 사용 가능한 특수문자는 ! @ # $ % & * ? 입니다.
              <br />
              &nbsp; 비밀번호를 입력하지 않으면 기존 비밀번호가 유지 됩니다.
            </div>
          </Label.col>
          <Label.col>
            <Label.Text children="전화번호" />
            <PhoneNumberField
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ borderColor: !phone ? 'rgba(185, 28, 28)' : '' }}
            />
          </Label.col>

          <Label.col>
            <Label.Text children="부서" />
            <TextInput
              placeholder="부서명을 입력해주세요"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </Label.col>

          <Label.col>
            <Label.Text children="직책" />
            <TextInput
              placeholder="직책을 입력해주세요"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </Label.col>

          <Label.col>
            <div className="flex w-full justify-between">
              <Label.Text children="대화가능시간" />
              <ToggleSwitch checked={enableChatTime} onChange={() => setEnableChatTime(!enableChatTime)} />
            </div>
            {enableChatTime ? (
              <>
                <div className="flex items-center space-x-2">
                  <select
                    value={startH}
                    onChange={(e) => setStartH(Number(e.target.value))}
                    className="focus:border-brand-1 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                  >
                    {new Array(24).fill(null).map((_, num: number) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <span>:</span>
                  <select
                    value={startM}
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
                  <span> 부터</span>

                  <select
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
                  <span>:</span>
                  <select
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
                  <span>까지</span>
                </div>
                <div className="text-sm text-red-400"> 새 대화 시작시 대화방에 설정되는 시간입니다.</div>
              </>
            ) : (
              <div className="text-sm text-red-400"> 대화가능 시간을 설정해야 대화(채팅)가 가능합니다.</div>
            )}
          </Label.col>

          <div className="flex justify-between space-x-2">
            <Button.xl children="취소" onClick={() => setIsUpdateMe(false)} className="filled-gray w-full" />

            <Button.xl
              children="내 정보 수정하기"
              disabled={buttonDisabled}
              onClick={() => {
                if (!Validator.phoneNumberRule(phone)) {
                  alert('전화번호를 확인해 주세요.')
                  return
                }
                if (password.length === 0) {
                  alert('비밀번호를 공백으로 기입할 시 기존 비밀번호가 유지됩니다.')
                  handleUpdate()
                } else {
                  if (password !== password2) {
                    alert('비밀번호와 비밀번호 확인이 다릅니다.')
                    return
                  }
                  if (!Validator.passwordRule(password)) {
                    alert('안전한 비밀번호를 입력하세요.')
                    return
                  }
                  handleUpdate()
                }
              }}
              className="filled-primary w-full"
            />
          </div>
        </Section>
        <div className="h-20"></div>
      </div>
    </>
  )
}
