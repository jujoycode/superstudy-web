import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { Blank, Label, PhoneNumberField, Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { TextInput } from '@/legacy/components/common/TextInput'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherFirstLogin } from '@/legacy/container/teacher-first-login'
import { ResponseGroupDto } from '@/legacy/generated/model'
import { Validator } from '@/legacy/util/validator'
import { useUserStore } from '@/stores2/user'

export function TeacherFirstLoginPage() {
  const { push } = useHistory()
  const { pathname } = useLocation()
  const { me: meRecoil } = useUserStore()

  const { teacherKlassGroups } = GroupContainer.useContext()
  const { isLoading, handleTeacherFirstLogin } = useTeacherFirstLogin()

  const [name, setName] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [phone, setPhone] = useState('')

  const [privacy, setPrivacy] = useState(false)
  const [policy, setPolicy] = useState(false)
  const [showTeacherGroups, setShowTeacherGroups] = useState(true)

  const [errorMessage, setErrorMessage] = useState('')

  const buttonDisabled =
    !password1 ||
    !password2 ||
    !name ||
    !privacy ||
    !policy ||
    !phone ||
    !Validator.phoneNumberRule(phone) ||
    password1 !== password2

  useEffect(() => {
    setName(meRecoil?.name ?? '')
    setPhone(meRecoil?.phone ?? '')
    if (meRecoil && !meRecoil?.firstVisit) {
      push('/teacher/canteen')
    }
  }, [pathname, meRecoil])

  if (isLoading) return null

  return (
    <div className="h-screen-5 col-span-6 max-w-lg overflow-auto px-6 py-6">
      {isLoading && <Blank reversed />}
      <Section>
        <h1 className="text-2xl font-semibold">첫 로그인</h1>
        <span className="flex justify-center text-center text-sm sm:text-base">
          슈퍼스쿨에 오신 것을 환영합니다.
          <br />
          처음 로그인하시나요? 아래 정보를 입력해주세요.
        </span>
        <div />
        <Label.col>
          <Label.Text children="*이름" />
          <TextInput
            placeholder="이름을 입력해주세요"
            value={name}
            onChange={(e) => setName(Validator.removeSpace(String(e.target.value)))}
            onKeyDown={(e) => {
              const specialCharacters = /[~`!@#$%^&*()_+|<>?:/;'".,]/
              const whitespaceCharacters = /[ ]/
              if (specialCharacters.test(e.key) || whitespaceCharacters.test(e.key)) {
                e.preventDefault()
              }
            }}
            className={name ? 'border-gray-300' : 'border-red-700'}
          />
        </Label.col>
        <Label.col>
          <Label.Text children="이메일" />
          <TextInput value={meRecoil?.email || ''} disabled />
        </Label.col>
        <Label.col>
          <Label.Text children="학교" />
          <TextInput value={meRecoil?.school?.name || ''} disabled />
        </Label.col>
        <Label.col>
          <Label.Text children="*비밀번호" />
          <TextInput
            type="password"
            placeholder="비밀번호 (문자,숫자,특수문자를 포함한 8자 이상)"
            value={password1}
            onChange={(e) => setPassword1(Validator.removeSpace(String(e.target.value)))}
            className={clsx('mb-2', !password1 || password1 !== password2 ? 'border-red-700' : 'border-gray-300')}
          />
          <TextInput
            type="password"
            placeholder="동일한 비밀번호를 한번 더 입력해주세요."
            value={password2}
            onChange={(e) => setPassword2(Validator.removeSpace(String(e.target.value)))}
            className={!password2 || password1 !== password2 ? 'border-red-700' : 'border-gray-300'}
          />
          {password2 && password1 !== password2 && (
            <div className="text-red-600">비밀번호 확인이 일치하지 않습니다.</div>
          )}
          <div className="text-grey-3">
            &nbsp; 안전한 개인정보의 보호를 위해 문자,숫자,특수문자가 포함된 8자 이상의 비밀번호를 입력하세요.
            <br />
            &nbsp; 사용 가능한 특수문자는 ! @ # $ % & * ? 입니다.
          </div>
        </Label.col>
        <Label.col>
          <Label.Text children="*전화번호" />
          <PhoneNumberField
            value={phone}
            onChange={(e) => setPhone(Validator.removeSpace(String(e.target.value)))}
            className={Validator.phoneNumberRule(phone) ? 'border-gray-300' : 'border-red-700'}
          />
        </Label.col>
        <div
          className="flex cursor-pointer items-center space-x-2"
          onClick={() => setShowTeacherGroups(!showTeacherGroups)}
        >
          <div className="-mt-6 -mb-5 text-4xl">{showTeacherGroups ? <>&#x025BE;</> : <>&#x025B4;</>}</div>
          <div className="text-lg font-bold text-gray-800">과목/담당 학년</div>
        </div>
        {showTeacherGroups &&
          teacherKlassGroups?.map((group: ResponseGroupDto) => (
            <div key={group.id} className="flex w-full items-center justify-between space-x-2">
              <TextInput disabled value={group?.teacherGroupSubject || ''} />
              <TextInput disabled value={group.name || ''} />
            </div>
          ))}
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
            <Link to={`/privacy-policy/${meRecoil?.schoolId || ''}`} target="_blank">
              <span className="cursor-pointer text-base font-semibold">개인정보처리방침 (필수)</span>
            </Link>
          </div>
        </div>
        <div className="text-pink-600">{errorMessage}</div>

        <Button.xl
          children="정보 입력하고 시작하기"
          disabled={buttonDisabled}
          onClick={() => {
            // TODO 에러 처리 수정 필요
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
            handleTeacherFirstLogin({ password: password1, phone: phone, name: name })
          }}
          className="filled-primary"
        />
      </Section>
    </div>
  )
}
