import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ReactComponent as Refresh } from '@/assets/svg/refresh.svg'
import { useAuthStore } from '@/stores/auth'
import { BackButton, Blank, Label, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { TextInput } from '@/legacy/components/common/TextInput'
import { NoticePopup } from '@/legacy/components/NoticePopup'
import { NoticePopup2 } from '@/legacy/components/NoticePopup2'
import { UserContainer } from '@/legacy/container/user'
import { useLanguage } from '@/legacy/hooks/useLanguage'

export function Login() {
  const { isStayLoggedIn, setIsStayLoggedIn } = useAuthStore()
  const { handleLogin, errorMessage, errorCode } = UserContainer.useContext()
  const { t } = useLanguage()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [blankOpen, setBlankOpen] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(true)
  const [noticeOpen2, setNoticeOpen2] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('noticeShow')) {
      setNoticeOpen(true)
    }
    if (!localStorage.getItem('noticeShow2')) {
      setNoticeOpen2(true)
    }
  }, [])

  const handleStayLoggedIn = () => {
    setIsStayLoggedIn(!isStayLoggedIn)
  }

  return (
    <div className="box-border flex w-full items-center justify-center">
      <div className="w-full max-w-xl">
        {blankOpen && <Blank />}
        <TopNavbar
          left={
            <div className="h-15">
              <BackButton className="h-15" />
            </div>
          }
          title={`${t('login')}`}
          right={
            <div
              onClick={() => {
                setBlankOpen(true)
                window?.location?.reload()
              }}
              className="text-primary-800 text-sm"
            >
              <Refresh />
            </div>
          }
        />
        <Section>
          <Label.col>
            <Label.Text children={t('username')} />
            <TextInput
              placeholder={`${t('enter_id_email')}`}
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/[ •\t]/g, '').toLowerCase())}
            />
          </Label.col>

          <Label.col className="mt-6">
            <Label.Text children={t('password')} />
            <TextInput
              type="password"
              placeholder={`${t('enter_password')}`}
              value={password}
              onChange={(e) =>
                setPassword(String(e.target.value).replace(/ /g, '').replace(/•/g, '').replace(/\t/g, ''))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin(email, password)
              }}
            />
          </Label.col>

          <div className="flex justify-between">
            <div>
              <button onClick={handleStayLoggedIn} className="border-primary-800 rounded-full border px-4 py-2">
                <div className="flex space-x-3">
                  <Checkbox checked={isStayLoggedIn} onChange={handleStayLoggedIn} />
                  <Label.Text children={t('auto_login')} />
                </div>
              </button>
            </div>
            <div className="flex space-x-3 text-xs">
              <Link to="/find-id">
                <div className="border-primary-800 rounded-full border px-4 py-2 text-gray-400">{t('find_id')}</div>
              </Link>
              <Link to="/find-password">
                <div className="border-primary-800 rounded-full border px-4 py-2 text-gray-400">
                  {t('find_password')}
                </div>
              </Link>
            </div>
          </div>
          <div className="text-red-600">{errorMessage}</div>

          {errorCode === '1001102' && (
            <Link to="/find-password">
              <div className="filled-primary border-primary-800 rounded-lg border px-4 py-2 text-center">
                {t('unlock_password')}
              </div>
            </Link>
          )}

          <Button.lg
            children={t('login')}
            disabled={!email || !password}
            onClick={() => handleLogin(email, password)}
            className="filled-primary"
          />

          <Link to="/AboutSuperSchool">
            <Button.xl children={t('superschool_preview')} className="outlined-primary w-full" />
          </Link>

          <div className="flex justify-center">
            <a href="https://superstudy.channel.io/lounge" target="blank">
              <div className="border-primary-800 mt-5 rounded-full border px-4 py-2 text-center">{t('contact_us')}</div>
            </a>
          </div>
        </Section>

        {/* <div className="fixed bottom-3 left-0 right-0 w-full text-center text-gray-600">슈퍼스쿨</div> */}
      </div>
      <NoticePopup noticeOpen={noticeOpen} setNoticeClose={() => setNoticeOpen(false)} width="w-max" />
      <NoticePopup2 noticeOpen={noticeOpen2} setNoticeClose={() => setNoticeOpen2(false)} width="w-max" />
    </div>
  )
}
