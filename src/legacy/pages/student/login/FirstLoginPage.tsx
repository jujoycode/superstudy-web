import { cn } from '@/utils/commonUtil'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

import { ReactComponent as Logo } from '@/assets/svg/logo.svg'
import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { BackButton, Blank, Label, PhoneNumberField, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useStudentFirstLogin } from '@/legacy/container/student-first-login'
import { useLogout } from '@/legacy/util/hooks'
import { Validator } from '@/legacy/util/validator'

export function FirstLoginPage() {
  const { push } = useHistory()
  const { pathname } = useLocation()
  const { me: meRecoil } = useUserStore()

  const { isLoading, isChannelTalk, handleStudentFirstLogin } = useStudentFirstLogin()

  const logout = useLogout()
  const [name, setName] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [phone, setPhone] = useState('')
  const [nokName, setNokName] = useState('')
  const [nokPhone, setNokPhone] = useState('')
  // TODO birthDate 사용 여부 확인 필요
  const [birthDate, setBirthDate] = useState('2000-01-01')

  const [privacy, setPrivacy] = useState(false)
  const [policy, setPolicy] = useState(false)
  const [hopePath, setHopePath] = useState('')
  const [hopeMajor, setHopeMajor] = useState('')

  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    //setName(meRecoil?.name ?? '');
    setNokName(meRecoil?.nokName ?? '')
    setNokPhone(meRecoil?.nokPhone ?? '')
    if (meRecoil && !meRecoil?.firstVisit) {
      push('/student')
    }
  }, [pathname, meRecoil])

  const buttonDisabled =
    !password1 ||
    !password2 ||
    !name ||
    !privacy ||
    !policy ||
    !phone ||
    !Validator.phoneNumberRule(phone) ||
    !nokName ||
    !nokPhone ||
    !birthDate ||
    birthDate === '2000-01-01' ||
    password1 !== password2

  return (
    <div className="scroll-box box-border h-screen w-full overflow-auto">
      {isLoading && <Blank />}

      <TopNavbar
        title="첫 로그인"
        left={
          <div className="h-15">
            <BackButton
              onClick={() => {
                logout()
                push('/')
              }}
              className="h-15"
            />
          </div>
        }
      />
      <div className="mt-6 mb-3">
        <div className="mx-auto mb-4">
          <Logo />
        </div>
        <span className="flex justify-center text-center text-sm sm:text-base">
          슈퍼스쿨에 오신 것을 환영합니다.
          <br />
          처음 로그인하시나요? 아래 정보를 입력해주세요.
        </span>
      </div>
      <Section>
        <Label.col>
          <Label.Text children="*이름" />
          <TextInput
            placeholder="이름을 입력해주세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              const specialCharacters = /[~`!@#$%^&*()_+|<>?:/;'".,]/
              if (specialCharacters.test(e.key)) {
                e.preventDefault()
              }
            }}
            className={cn(name ? 'border-gray-300' : 'border-red-700')}
          />
        </Label.col>

        <Label.col>
          <Label.Text children="이메일" />
          <TextInput value={meRecoil?.email || ''} disabled />
        </Label.col>
        <Label.col>
          <Label.Text children="학교" />
          <TextInput value={meRecoil?.school?.name} disabled />
        </Label.col>
        <Label.col>
          <Label.Text children="학년 / 반" />
          <TextInput value={meRecoil?.klassGroupName || ''} disabled />
        </Label.col>
        <Label.col>
          <Label.Text children="출석번호" />
          <TextInput value={meRecoil?.studentNumber} disabled />
        </Label.col>
        <Label.col>
          <Label.Text children="*비밀번호" />
          <TextInput
            type="password"
            placeholder="비밀번호 (문자,숫자,특수문자를 포함한 8자 이상)"
            value={password1}
            onChange={(e) => setPassword1(Validator.removeSpace(String(e.target.value)))}
            className={cn(password1 && password1 === password2 ? 'border-gray-300' : 'border-red-700')}
          />
          <TextInput
            type="password"
            placeholder="동일한 비밀번호를 한번 더 입력해주세요."
            value={password2}
            onChange={(e) => setPassword2(Validator.removeSpace(String(e.target.value)))}
            className={cn(password2 && password1 === password2 ? 'border-gray-300' : 'border-red-700')}
          />
          {password2 && password1 !== password2 && (
            <div className="text-red-600">비밀번호 확인이 일치하지 않습니다.</div>
          )}
          <div className="text-gray-3">
            &nbsp; 안전한 개인정보의 보호를 위해 문자,숫자,특수문자가 포함된 8자 이상의 비밀번호를 입력하세요.
            <br />
            &nbsp; 사용 가능한 특수문자는 ! @ # $ % & * ? 입니다.
          </div>
        </Label.col>
        <Label.col>
          <Label.Text children="*전화번호" />
          <PhoneNumberField
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={Validator.phoneNumberRule(phone) ? 'border-gray-300' : 'border-red-700'}
          />
          <div className="text-gray-3">&nbsp; 전화번호가 없는 학생은 보호자의 전화번호를 입력하세요.</div>
        </Label.col>

        <Label.col>
          <Label.Text children="*생년월일" />
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
          {(!birthDate || birthDate === '2000-01-01') && (
            <div className="text-red-600">올바른 생년월일을 입력하세요.</div>
          )}
        </Label.col>

        <Label.col>
          <Label.Text children="희망진로" />
          <TextInput value={hopePath} onChange={(e) => setHopePath(e.target.value)} />
        </Label.col>
        <Label.col>
          <Label.Text children="희망학과" />
          <TextInput value={hopeMajor} onChange={(e) => setHopeMajor(e.target.value)} />
        </Label.col>

        <Label.col>
          <Label.Text children="*보호자 이름" />
          <TextInput
            value={nokName}
            onChange={(e) => setNokName(e.target.value)}
            className={nokName ? 'border-gray-300' : 'border-red-700'}
          />
        </Label.col>

        <Label.col>
          <Label.Text children="*보호자 전화번호" />
          <PhoneNumberField
            value={nokPhone}
            onChange={(e) => setNokPhone(e.target.value)}
            className={nokPhone ? 'border-gray-300' : 'border-red-700'}
          />
          <div className="text-gray-3">
            &nbsp; 작성하신 보호자 연락처로 보호자 가입요청 메시지가 전달됩니다. 학교에 제출한 보호자의 정보와 상이할
            경우 추후 학교 제출 연락처로 변경되니, 꼭 학교에 제출한 보호자의 정보로 입력하시기 바랍니다.
          </div>
        </Label.col>
        <div className="space-y-2">
          <Label.row>
            <Checkbox
              checked={privacy && policy}
              onChange={() => {
                const allChecked = privacy && policy
                setPrivacy(!allChecked)
                setPolicy(!allChecked)
              }}
            />
            <p className="font-bold">전체 동의</p>
          </Label.row>
          <div className="flex items-center space-x-2">
            <Checkbox checked={policy} onChange={() => setPolicy(!policy)} />
            <Link to={`/terms-of-use`} target="_blank">
              <span className="cursor-pointer text-base font-semibold">슈퍼스쿨이용약관 (필수)</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox checked={privacy} onChange={() => setPrivacy(!privacy)} />
            <Link to={`/privacy-policy/${meRecoil?.schoolId}`} target="_blank">
              <span className="cursor-pointer text-base font-semibold">개인정보처리방침 (필수)</span>
            </Link>
          </div>
        </div>
        <div className="text-pink-600">{errorMessage}</div>
        {isChannelTalk && (
          <a target="_blank" rel="noreferrer" href="http://superstudy.channel.io/">
            <Button.lg children="문의하기" />
          </a>
        )}
        <Button.lg
          children="정보 입력하고 시작하기"
          disabled={buttonDisabled}
          onClick={() => {
            // TODO 에러처러 추가 필요
            if (!Validator.phoneNumberRule(phone)) {
              setErrorMessage('전화번호를 확인해 주세요.')
              return
            }
            if (password1 !== password2) {
              setErrorMessage('비밀번호와 비밀번호 확인이 다릅니다.')
              return
            }
            if (!Validator.passwordRule(password1)) {
              setErrorMessage('안전한 비밀번호를 입력하세요.')
              return
            }
            handleStudentFirstLogin({
              name,
              password: password1,
              phone,
              nokName,
              nokPhone,
              hopeMajor,
              hopePath,
              birthDate,
            })
          }}
          className="filled-primary"
        />
      </Section>
    </div>
  )
}
