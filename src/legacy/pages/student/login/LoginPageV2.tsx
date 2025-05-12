import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useRecoilState } from 'recoil'
import { ReactComponent as Logo } from '@/legacy/assets/svg/logo_superschool.svg'
import { Label } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { InputDel } from '@/legacy/components/common/InputDel'
import { PasswordInputToggle } from '@/legacy/components/common/PasswordInputToggle'
import { NoticePopup } from '@/legacy/components/NoticePopup'
import { UserContainer } from '@/legacy/container/user'
import { isStayLoggedInState } from '@/stores'
import { isEmail } from '@/legacy/util/validator'

export function LoginV2() {
  const { t } = useTranslation(undefined, { keyPrefix: 'login_page' })
  const [isStayLoggedIn, setIsStayLoggedIn] = useRecoilState(isStayLoggedInState)
  const { handleLogin, errorMessage, errorCode, setErrorMessage } = UserContainer.useContext()

  const [frontError, setFrontError] = useState<string>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 로그인 페이지 팝업 숨김 처리
  const [noticeOpen, setNoticeOpen] = useState(true)
  // const [noticeOpen2, setNoticeOpen2] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('noticeShow')) {
      setNoticeOpen(true)
    }
    // if (!localStorage.getItem('noticeShow3')) {
    //   setNoticeOpen2(true);
    // }
  }, [])
  const handleLoginClick = () => {
    if (!isEmail(email)) {
      setFrontError('아이디는 이메일 형식으로 입력해 주세요.')
      return
    }
    setFrontError('')
    handleLogin(email, password)
  }

  useEffect(() => {
    setFrontError('')
    setErrorMessage('')
  }, [])

  const handleStayLoggedIn = () => {
    setIsStayLoggedIn((prevState) => !prevState)
  }

  return (
    <div className="box-border flex w-full items-center justify-center">
      <div className="w-full max-w-xl px-2 py-4 xl:px-5">
        {noticeOpen && (
          <NoticePopup noticeOpen={noticeOpen} setNoticeClose={() => setNoticeOpen(false)} width="w-max" />
        )}
        {/* {noticeOpen2 && (
          <NoticePopup2 noticeOpen={noticeOpen2} setNoticeClose={() => setNoticeOpen2(false)} width="w-max" />
        )} */}

        <header className="pt-14 pb-8 md:pt-16 xl:pt-[70px] 2xl:pt-20">
          <Logo className="w-full" />
        </header>
        <section className="mb-4 w-full p-6 md:rounded-lg md:border md:border-gray-300">
          <div className="flex flex-col gap-2 pb-4">
            <Label.col>
              <InputDel
                tabIndex={1}
                htmlId="email"
                label={t('email.label')}
                placeholder={t('email.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/[ •\t]/g, '').toLowerCase())}
              />
            </Label.col>
            {frontError ? (
              <div className="text-brand-1 text-sm">{frontError}</div>
            ) : errorMessage ? (
              <div className="text-brand-1 text-sm">{errorMessage}</div>
            ) : null}
            <Label.col>
              <PasswordInputToggle
                tabIndex={2}
                htmlId="password"
                label={t('password.label')}
                placeholder={t('password.placeholder')}
                value={password}
                onChange={(e) =>
                  setPassword(String(e.target.value).replace(/ /g, '').replace(/•/g, '').replace(/\t/g, ''))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLoginClick()
                }}
              />
            </Label.col>
          </div>

          <div className="pb-7">
            <button onClick={handleStayLoggedIn} tabIndex={3}>
              <div className="flex items-center space-x-2">
                <Checkbox checked={isStayLoggedIn} onChange={handleStayLoggedIn} />
                <p children={t('auto_login')} className="text-15 text-[#333333]" />
              </div>
            </button>
          </div>
          <div>
            <button
              children={t('login')}
              disabled={!email || !password}
              onClick={() => handleLoginClick()}
              className="filled-primary text-19 w-full rounded-lg py-4 font-bold text-white"
              tabIndex={4}
            />
          </div>
        </section>
        <div className="text-15 flex items-center justify-center space-x-4 pb-8 md:pb-10 xl:pb-12 2xl:pb-14">
          <Link to="/find-password">
            <div className="text-[#aaaaaa]">{t('find_password')}</div>
          </Link>
          <p className="text-[#dddddd]">|</p>
          <Link to="/find-id">
            <div className="text-[#aaaaaa]">{t('find_id')}</div>
          </Link>
          {/* <p className="text-[#dddddd]">|</p>
          <Link to="/select-school">
            <div className="text-[#aaaaaa]">{t('signup')}</div>
          </Link> */}
        </div>

        <section className="px-6">
          <div className="flex flex-col gap-2">
            {errorCode === '1001102' && (
              <Link to="/find-password">
                <Button.xl children={t('unlock_password')} className="outlined-primary w-full" />
              </Link>
            )}
            <Link to="/AboutSuperSchool">
              <Button.xl children={t('superschool_preview')} className="outlined-primary w-full" />
            </Link>
            <a href="https://superstudy.channel.io/lounge" target="blank">
              <Button.xl
                children={t('contact_us')}
                className="w-full border border-[#aaaaaa] font-semibold text-[#aaaaaa]"
              />
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
