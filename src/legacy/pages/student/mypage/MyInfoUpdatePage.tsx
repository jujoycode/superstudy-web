import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { cn } from '@/utils/commonUtil'
import { BackButton, Blank, Label, PhoneNumberField, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useStudentKlassHistory } from '@/legacy/container/student-klass-history'
import { useStudentParentMyInfoUpdate } from '@/legacy/container/student-parent-my-info-update'
import { ResponseUserDto, Role } from '@/legacy/generated/model'
import { Validator } from '@/legacy/util/validator'

interface MyInfoUpdatePageProps {
  me: ResponseUserDto
  setIsUpdateMe: (isUpdate: boolean) => void
}

export function MyInfoUpdatePage({ me, setIsUpdateMe }: MyInfoUpdatePageProps) {
  const { handleParentMyInfoUpdate, handleStudentMyInfoUpdate, isLoading } = useStudentParentMyInfoUpdate()
  const { klassHistoryList } = useStudentKlassHistory()

  const [name, setName] = useState(me?.name)
  const [nickName, setNickName] = useState(me?.nickName)
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [phone, setPhone] = useState(me?.phone || '')
  const [nokName, setNokName] = useState('')
  const [nokPhone, setNokPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [hopePath, setHopePath] = useState('')
  const [hopeMajor, setHopeMajor] = useState('')

  const handleSubmit = () => {
    me.role === Role.PARENT
      ? handleParentMyInfoUpdate({ name, password, phone, nokName, nokPhone, birthDate })
      : handleStudentMyInfoUpdate({
          name,
          nickName,
          password,
          phone,
          birthDate,
          hopePath,
          hopeMajor,
        })
  }

  useEffect(() => {
    if (!name) {
      setName(me?.name || '')
    }
    if (!nokName) {
      setNokName(me?.nokName || '')
    }
    if (!nokPhone) {
      setNokPhone(me?.nokPhone || '')
    }
    if (!birthDate) {
      setBirthDate(me?.birthDate || '')
    }
    if (!hopePath) {
      setHopePath(me?.hopePath || '')
    }
    if (!hopeMajor) {
      setHopeMajor(me?.hopeMajor || '')
    }
  }, [])

  const buttonDisabled = !name || !phone || password !== password2

  return (
    <div>
      <TopNavbar
        title="내 정보 수정"
        left={
          <div className="h-15">
            <BackButton className="h-15" onClick={() => setIsUpdateMe(false)} />
          </div>
        }
      />
      {isLoading && <Blank />}
      <Section>
        <Label.col>
          <Label.Text children="이름" />
          <TextInput
            placeholder="이름을 입력해주세요."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled
            onKeyDown={(e) => {
              const specialCharacters = /[~`!@#$%^&*()_+|<>?:/;'".,]/
              const whitespaceCharacters = /[ ]/
              if (specialCharacters.test(e.key) || whitespaceCharacters.test(e.key)) {
                e.preventDefault()
              }
            }}
          />
        </Label.col>
        {me.role === Role.USER && (
          <Label.col>
            <Label.Text children={t(`nickName`, '별명')} />
            <TextInput
              placeholder={`${t(`nickName`, '별명')}을 입력하세요.`}
              autoComplete="off"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
            />
          </Label.col>
        )}
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
          <div className="text-gray-3">
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
            onChange={(e) => setPhone(Validator.removeSpace(String(e.target.value)))}
            style={{ borderColor: !phone ? 'rgba(185, 28, 28)' : '' }}
          />
        </Label.col>
        {klassHistoryList
          ?.sort((a, b) => +(a?.group?.year || 0) - +(b?.group?.year || 0))
          .map((klass) => (
            <div className="w-full items-center" key={klass.id}>
              <Label.col>
                <Label.Text children="연도 / 학교 / 학년 / 반 / 번호" />
                <TextInput
                  value={`${klass?.group?.year} ${me?.school?.name} ${klass?.group?.name} ${klass?.studentNumber}번`}
                  disabled
                />
              </Label.col>
            </div>
          ))}

        {me?.role !== 'PARENT' && (
          <>
            <Label.col>
              <Label.Text children="생년월일" />
              {/* <TextInput value={birthDate} disabled /> */}
              <div className="flex items-center">
                <input
                  id="startAt"
                  type="date"
                  value={birthDate}
                  className="focus:border-primary-800 h-12 w-full min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                  onChange={(e) => {
                    setBirthDate(e.target.value)
                  }}
                />
              </div>
              <div className="text-gray-3">&nbsp; * 생년월일 수정은 담임선생님의 학생카드 페이지에서 가능합니다.</div>
            </Label.col>
            {/* <Label.col>
              <Label.Text children="희망진로" />
              <TextInput value={hopePath} onChange={(e) => setHopePath(e.target.value)} />
            </Label.col>
            <Label.col>
              <Label.Text children="희망학과" />
              <TextInput value={hopeMajor} onChange={(e) => setHopeMajor(e.target.value)} />
            </Label.col> */}

            <Label.col>
              <Label.Text children="보호자 이름" />
              <TextInput
                value={nokName}
                disabled
                onChange={(e) => setNokName(e.target.value)}
                className={cn(nokName ? 'border-gray-300' : 'border-red-700')}
              />
            </Label.col>
            <Label.col>
              <Label.Text children="보호자 연락처" />
              <PhoneNumberField
                value={nokPhone}
                disabled
                onChange={(e) => setNokPhone(e.target.value)}
                className={cn(nokPhone ? 'border-gray-300' : 'border-red-700')}
              />
              {me.parents?.length === 0 ? (
                <div className="text-gray-3">
                  &nbsp; * 보호자 정보 수정은 &quot;보호자가 가입대기중일 경우&quot; 담임선생님의 학생카드 페이지에서
                  가능합니다.
                </div>
              ) : (
                <div className="text-gray-3">&nbsp; * 보호자 정보 수정은 보호자의 MY페이지에서 가능합니다.</div>
              )}
            </Label.col>
          </>
        )}

        <Button.lg
          children="내 정보 수정하기"
          disabled={buttonDisabled}
          onClick={() => {
            if (!Validator.phoneNumberRule(phone)) {
              alert('전화번호를 확인해 주세요.')
              return
            }
            if (nokPhone && !Validator.phoneNumberRule(nokPhone)) {
              alert('보호자 연락처를 확인해 주세요.')
              return
            }
            if (password.length === 0) {
              alert('비밀번호를 공백으로 기입할 시 기존 비밀번호가 유지됩니다.')
              handleSubmit()
            } else {
              if (password !== password2) {
                alert('비밀번호와 비밀번호 확인이 다릅니다.')
                return
              }
              if (!Validator.passwordRule(password)) {
                alert('안전한 비밀번호를 입력하세요.')
                return
              }
              handleSubmit()
            }
          }}
          className="filled-primary"
        />
      </Section>
    </div>
  )
}
