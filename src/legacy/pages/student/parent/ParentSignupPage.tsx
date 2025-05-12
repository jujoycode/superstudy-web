import { useEffect, useState } from 'react'
import { use100vh } from 'react-div-100vh'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { ReactComponent as Logo } from '@/legacy/assets/svg/logo.svg'
import { Toast } from '@/legacy/components/Toast'
import { BackButton, Blank, Label, PhoneNumberField, Section, Select, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useOtp } from '@/legacy/container/otp'
import { useParentSignUp } from '@/legacy/container/parent-sign-up'
import { UserContainer } from '@/legacy/container/user'
import { isStayLoggedInState } from 'src/store'
import { useLogout } from '@/legacy/util/hooks'
import { Validator } from '@/legacy/util/validator'

export function ParentSignupPage() {
  const { push } = useHistory()
  const vh = use100vh()
  const height = vh ? `${vh}px` : '100vh'

  const logout = useLogout()

  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const uuid = searchParams.get('uuid')
  const name = searchParams.get('name')
  const nokName = searchParams.get('nokName')
  const phone = searchParams.get('phone')

  const { student, isLoading, meRecoil, errorMessage1, setErrorMessage, handleSubmit, handleChildAddButtonClick } =
    useParentSignUp(uuid)

  const { otpSendResult, sendOtp, checkOtp, remainSecString, otpCheckResult } = useOtp()

  const [isShowModal, setIsShowModal] = useState(false)
  const [isLogined, setIsLogined] = useState(true)
  const [email, setEmail] = useState('')
  const [emailId, setEmailId] = useState('')
  const [emailUrl, setEmailUrl] = useState('')
  const [emailUrlType, setEmailUrlType] = useState('직접입력')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [parentName, setParentName] = useState(nokName || '')
  const [parentPhone, setParentPhone] = useState(phone || '')
  const [studentPhone, setStudentPhone] = useState('')
  const [otpNum, setOtpNum] = useState('')

  const [privacy, setPrivacy] = useState(false)
  const [policy, setPolicy] = useState(false)
  const [privacy3, setPrivacy3] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [password, setPassword] = useState('')

  const [isStayLoggedIn, setIsStayLoggedIn] = useRecoilState(isStayLoggedInState)
  const { handleLogin, errorMessage } = UserContainer.useContext()
  const [blankOpen, setBlankOpen] = useState(false)

  useEffect(() => {
    if (meRecoil) {
      setIsLogined(true)
      setIsShowModal(true)
    }
  }, [meRecoil])

  const handleStayLoggedIn = () => {
    setIsStayLoggedIn((prevState) => !prevState)
  }

  const buttonDisabled =
    !email || !password1 || !password2 || !parentName || !privacy3 || !privacy || !policy || !parentPhone

  const handleParentSignUpButtonClick = () => {
    // OTP 인증을 추가하는대신 학생전화번호 제외
    // 초등학교인 경우 학생이 전화가 없을 수 있음.
    // if (studentPhone && !Validator.phoneNumberRule(studentPhone)) {
    //   alert('학생 전화번호를 확인해 주세요.');
    //   return;
    // }
    // if (student?.phone.replace(/-/g, '') !== studentPhone.replace(/-/g, '')) {
    //   setErrorMessage('학생전화번호가 맞지 않습니다!');
    //   alert('학생전화번호가 맞지 않습니다!');
    //   return;
    // }

    if (!Validator.onlyEngAndHan(parentName)) {
      alert('이름은 한글과 영문만 가능합니다.')
      return
    }

    if (parentPhone && !Validator.phoneNumberRule(parentPhone)) {
      alert('보호자 전화번호를 확인해 주세요.')
      return
    }

    if (password1 !== password2) {
      alert('비밀번호와 비밀번호 확인이 다릅니다.')
      return
    }
    if (!Validator.passwordRule(password1)) {
      alert('안전한 비밀번호를 입력하세요.')
      return
    }
    if (!Validator.emailRule(email)) {
      setErrorMessage('이메일이 형식에 맞지 않습니다.')
      alert('이메일이 형식에 맞지 않습니다.')
    } else if (!student?.school?.id) {
      setErrorMessage('학교 정보를 확인할 수 없습니다.')
    } else {
      handleSubmit({
        email,
        name: parentName,
        password: password1,
        phone: parentPhone,
        hopeMajor: '',
        hopePath: '',
        schoolId: student.school.id,
      })
        .then((result) => {
          if (result) {
            window.location.href = `/add-child/${uuid}`
            //return <Alert onClose={() => push(`/add-kids/${uuid}`)} text="보호자 회원가입이 완료되었습니다." />;
          }
        })
        .catch(() => {
          setErrorMessage('회원가입에 실패했습니다.')
        })
    }
  }

  const redirectToStore = () => {
    const userAgent = navigator.userAgent

    if (/android/i.test(userAgent)) {
      // 안드로이드인 경우 Google Play Store로 연결
      window.location.href = 'https://play.google.com/store/apps/details?id=com.superstudyapp'
    } else if (/iPad|iPhone|iPod/i.test(userAgent)) {
      // iOS인 경우 App Store로 연결
      window.location.href = 'https://apps.apple.com/app/id1611178586' // 여기에 애플 앱의 URL을 넣으세요.
    }
  }

  return (
    <div className="box-border w-full">
      {isLoading && <Blank />}

      {isShowModal && (
        <div
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="bg-littleblack fixed inset-0 z-100 m-0 flex h-screen w-full items-center justify-center"
          style={{ height }}
        >
          {/* TODO 수정 필요 */}
          <div className="relative rounded-lg bg-white opacity-100 shadow-sm">
            {isLogined ? (
              <Section>
                {meRecoil?.role === 'PARENT' ? (
                  <>
                    <div className="text-center text-2xl font-bold">자녀 추가 안내</div>
                    <div className="text-lg">
                      <span className="font-bold">{meRecoil.name}</span> 계정에 로그인되어 있습니다. <br />이 계정에{' '}
                      <span className="font-bold">{name}</span> 자녀를 추가하시겠습니까?
                    </div>
                    <div className="h-4"></div>
                    <Button.lg children="추가하기" onClick={handleChildAddButtonClick} className="filled-blue" />
                    {/* <Button.lg
                      children="새 계정으로 회원가입하기"
                      onClick={() => {
                        logout();
                        setIsShowModal(false);
                      }}
                      className="filled-red"
                    /> */}
                  </>
                ) : (
                  <>
                    <div className="text-center text-2xl font-bold">경고</div>
                    <div className="text-lg">
                      <span className="font-bold">{meRecoil?.name}</span> 계정에 이미 로그인되어 있지만, <br />이 계정은
                      보호자 계정이 아니기 때문에 <span className="font-bold">{name}</span> 자녀를 추가할 수 없습니다.
                      <br />새 계정으로 회원가입해 주시기 바랍니다.
                    </div>
                    <div className="h-4"></div>
                    <Button.lg
                      children="새 계정으로 회원가입하기"
                      onClick={() => {
                        logout()
                        setIsShowModal(false)
                      }}
                      className="filled-red"
                    />
                  </>
                )}
              </Section>
            ) : (
              <Section>
                <div className="text-center text-2xl font-bold">이미 슈퍼스쿨 회원이신가요?</div>
                <div className="h-4"></div>
                <div className="text-lg">
                  <span className="font-bold"> </span> 슈퍼스쿨 회원이신 보호자께서는 <br />
                  로그인하기 버튼을 눌러 로그인 후,
                  <br />
                  자녀를 추가하실 수 있습니다. <br />
                  비회원이시라면 회원가입해 주세요.
                </div>
                <div className="h-4"></div>
                <Button.lg
                  children="로그인하기"
                  onClick={() => {
                    setIsShowModal(false)
                    setIsLogined(false)
                  }}
                  className="filled-blue"
                />
                <Button.lg
                  children="회원가입하기"
                  onClick={() => {
                    setIsShowModal(false)
                    setIsLogined(true)
                  }}
                  className="filled-red"
                />
              </Section>
            )}
          </div>
        </div>
      )}

      {!isLogined ? (
        <div className="box-border flex w-full items-center justify-center">
          <div className="w-full max-w-xl">
            {blankOpen && <Blank />}
            <TopNavbar
              left={
                <div className="h-15">
                  <BackButton className="h-15" />
                </div>
              }
              title="로그인"
              right={
                <div
                  onClick={() => {
                    setBlankOpen(true)
                    window?.location?.reload()
                  }}
                  className="text-brand-1 text-sm"
                >
                  새로고침
                </div>
              }
            />
            <Section>
              <Link to="/Login" className="mx-20">
                <Button.lg children="모바일 Web 으로 로그인 하기" className="filled-primary w-full py-20" />
              </Link>
              <div className="h-0.5 bg-gray-100"></div>

              <Button.lg
                children="슈퍼스쿨 App 사용하기"
                onClick={redirectToStore}
                className="filled-primary mx-20 py-20"
              />

              <Link to="/AboutSuperSchool">
                <Button.xl children="슈퍼스쿨 미리보기" className="outlined-primary mt-20 w-full" />
              </Link>
            </Section>

            <div className="fixed right-0 bottom-3 left-0 w-full text-center text-gray-600">슈퍼스쿨</div>
          </div>
        </div>
      ) : (
        <>
          <TopNavbar title="보호자 회원가입" right={<div className="h-15 w-15" />} />
          <div className="mt-6 mb-3">
            <Logo className="mx-auto mb-4" />
            <div className="flex flex-col items-center justify-center text-center text-sm sm:text-base">
              <div className="text-lg font-bold">
                학생명 : {student?.name}
                <br />
              </div>
              <div className="mt-2 px-4 text-gray-500">
                해당 학생의 보호자가 맞는지 꼭 체크해주시고, 학생정보가 상이하다면{' '}
                <a href="http://superstudy.channel.io/" target="_blank" rel="noreferrer">
                  고객센터
                </a>
                로 문의주세요.
              </div>
            </div>
          </div>
          <Section>
            <Label.col>
              <Label.Text children="*이름" />
              <TextInput
                placeholder="이름을 입력해주세요"
                value={parentName}
                onChange={(e) => setParentName(Validator.removeSpace(String(e.target.value)))}
                // onKeyDown={(e) => {
                //   if (Validator.onlyEngAndHan(e.key) === false) {
                //     e.preventDefault();
                //   }
                // }}
              />
              {parentName && !Validator.onlyEngAndHan(parentName) && (
                <div className="text-red-600">이름은 한글과 영문만 가능합니다.</div>
              )}
            </Label.col>
            <div className="flex w-full items-end">
              <Label.col>
                <Label.Text children="*이메일" />
                <TextInput
                  placeholder="이메일"
                  value={emailId}
                  onChange={(e) => {
                    const v = Validator.removeSpace(e.target.value).toLowerCase()
                    setEmailId(v)
                    setEmail(v + '@' + emailUrl)
                  }}
                  className="w-40"
                />
              </Label.col>
              <div className="pb-2 text-xl">@</div>
              <TextInput
                autoComplete="off"
                placeholder="직접입력"
                value={emailUrl}
                disabled={emailUrlType !== '직접입력'}
                onChange={(e) => {
                  const v = Validator.removeSpace(e.target.value).toLowerCase()
                  setEmailUrl(v)
                  setEmail(emailId + '@' + v)
                }}
              />
              <Select.lg
                value={emailUrlType}
                onChange={(e) => {
                  const v = e.target.value
                  setEmailUrlType(v)
                  if (v === '직접입력') {
                    setEmailUrl('')
                  } else {
                    setEmailUrl(v)
                    setEmail(emailId + '@' + v)
                  }
                }}
              >
                <option selected hidden>
                  직접입력
                </option>
                {['직접입력', 'naver.com', 'gmail.com', 'daum.net', 'nate.com'].map((subject: string) => (
                  <option value={subject} key={subject}>
                    {subject}
                  </option>
                ))}
              </Select.lg>
            </div>
            <Label.col>
              <Label.Text children="*비밀번호" />
              <TextInput
                type="password"
                placeholder="비밀번호 (문자,숫자,특수문자를 포함한 8자 이상)"
                value={password1}
                onChange={(e) => setPassword1(Validator.removeSpace(String(e.target.value)))}
              />
              {password1 && !Validator.passwordRule(password1) && (
                <div className="text-red-600">안전한 비밀번호를 입력하세요.</div>
              )}
              <TextInput
                type="password"
                placeholder="동일한 비밀번호를 한번 더 입력해주세요."
                value={password2}
                onChange={(e) => setPassword2(Validator.removeSpace(String(e.target.value)))}
                className="mb-2"
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
              <Label.Text children="*보호자전화번호" />
              <PhoneNumberField value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
              <div>
                <div className="flex space-x-2">
                  <TextInput
                    maxLength={6}
                    placeholder="인증번호를 입력해주세요."
                    value={otpNum}
                    onChange={(e) => setOtpNum(String(e.target.value))}
                    className="mb-2"
                  />
                  {!!remainSecString ? (
                    <Button.lg
                      children="인증번호 확인"
                      disabled={otpNum.length !== 6}
                      onClick={() => checkOtp(parentPhone, otpNum)}
                      className="filled-primary"
                    />
                  ) : (
                    <Button.lg
                      children="인증번호 받기"
                      disabled={!Validator.phoneNumberRule(parentPhone) || otpCheckResult}
                      onClick={() => sendOtp(parentPhone, 'sms')}
                      className="filled-primary"
                    />
                  )}
                </div>
                {!otpCheckResult && !!remainSecString && (
                  <div className="text-sm text-red-600">
                    * 3분안에 인증번호를 입력하세요. 남은시간 - {remainSecString}{' '}
                  </div>
                )}
                {otpCheckResult && <div className="text-sm text-red-600">인증번호 확인 완료</div>}
              </div>
            </Label.col>
            {/* <Label.col>
              <Label.Text children="*학생전화번호" />
              <PhoneNumberField value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} />
            </Label.col> */}
            <div className="space-y-2">
              <Label.row>
                <Checkbox
                  checked={privacy3 && privacy && policy && marketing}
                  onChange={() => {
                    const allChecked = privacy3 && privacy && policy && marketing
                    setPrivacy3(!allChecked)
                    setPrivacy(!allChecked)
                    setMarketing(!allChecked)
                    setPolicy(!allChecked)
                  }}
                />
                <p className="font-bold">전체 동의</p>
              </Label.row>
              <div className="flex items-center space-x-2">
                <Checkbox checked={privacy} onChange={() => setPrivacy(!privacy)} />
                <Link to={`/consent-to-use-of-personal-information`} target="_blank">
                  <span className="cursor-pointer text-base font-semibold">
                    개인정보/민감정보 수집 및 이용에 관한 동의(필수)
                  </span>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox checked={policy} onChange={() => setPolicy(!policy)} />
                <Link to={`/privacy-policy/${student?.schoolId}`} target="_blank">
                  <span className="cursor-pointer text-base font-semibold">개인정보처리방침 (필수)</span>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox checked={privacy3} onChange={() => setPrivacy3(!privacy3)} />
                <Link to={`/consent-to-provide-personal-information-to-third-parties`} target="_blank">
                  <span className="cursor-pointer text-base font-semibold">
                    개인정보/민감정보 제3자 제공에 관한 동의(필수)
                  </span>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox checked={marketing} onChange={() => setMarketing(!marketing)} />
                <Link to={`/consent-for-promotional-and-marketing-purposes`} target="_blank">
                  <span className="cursor-pointer text-base font-semibold">
                    홍보 및 마케팅을 위한 개인정보 제공 동의(선택)
                  </span>
                </Link>
              </div>
            </div>
            <div className="text-pink-600">{errorMessage1}</div>
            {errorMessage1 && (
              <a target="_blank" rel="noreferrer" href="http://superstudy.channel.io/">
                <Button.lg children="문의하기" className="w-full" />
              </a>
            )}
            <Button.lg
              children="회원가입"
              disabled={buttonDisabled}
              onClick={handleParentSignUpButtonClick}
              className="filled-primary"
            />
          </Section>
        </>
      )}
      <Toast />
    </div>
  )
}
