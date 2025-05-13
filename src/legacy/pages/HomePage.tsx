import { Navigate } from 'react-router'
import preval from 'preval.macro'
import { useHistory } from '@/hooks/useHistory'
import superstudyLight from 'src/assets/images/superstudy-light.png'
import { BottomFixed, Screen, Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { globalEnv } from '@/legacy/util/global-env'
import { useAuth } from '@/legacy/util/hooks'
import Logo from 'src/assets/svg/logo.svg'

export function HomePage() {
  const { authenticated } = useAuth()
  const { push } = useHistory()
  const { t } = useLanguage()

  if (authenticated) return <Navigate to="/student" />

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
    <div className="font-spoqa text-md box-border flex h-screen min-h-screen w-full min-w-full items-center justify-center font-normal">
      <Screen>
        <div className="mt-16 flex items-center justify-center">
          <div>
            <Logo className="mx-auto" />
            <img className="mx-auto" src={superstudyLight} alt="" />
          </div>
        </div>
        <BottomFixed>
          <div className="mx-auto w-full text-center">
            <Section>
              <div className="hidden">
                <div className="bg-peach_orange" />
                <div className="bg-mint_green" />
                <div className="bg-light_golden" />
                <div className="bg-lavender_blue" />
                <div className="text-text_black" />
              </div>

              <div>
                <button onClick={redirectToStore} className="border-brand-1 rounded-lg border-2 px-4 py-2">
                  {t('app_download')}
                </button>
              </div>

              <div className="w-full text-center text-gray-600">
                <div className="text-white">
                  v{globalEnv.version} build at {preval`module.exports = new Date().toLocaleString().split("├")[0]`}
                </div>
                슈퍼스쿨 <br />
                Copyright 2022. SUPERSCHOOL all right reserved.
              </div>
              <Button.lg children={t('get_started')} onClick={() => push('/login')} className="filled-primary" />
            </Section>
          </div>
        </BottomFixed>
      </Screen>
    </div>
  )
}
