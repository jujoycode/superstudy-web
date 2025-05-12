import { useHistory } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { Toast } from '@/legacy/components/Toast'
import { Alert, BackButton, Blank, BottomFixed, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { useFindPassword } from '@/legacy/container/find-password'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { toastState } from 'src/store'

// TODO 카카오톡 수신 확인 필요
// TODO 메일 발송 api 확인 필요
export function FindPasswordSuccessPageV1() {
  const { push } = useHistory()
  const { isFindPasswordLoading, errorMessage, setErrorMessage } = useFindPassword()
  const setToastMsg = useSetRecoilState(toastState)
  const { t } = useLanguage()

  return (
    <>
      <TopNavbar
        title={`${t('find_password')}`}
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      {isFindPasswordLoading && <Blank />}
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}
      <Section>
        <h1 className="text-2xl font-bold">
          {t('password_reset_notification_sent')}
          {/* 비밀번호 재설정 <br /> 알림톡과 이메일을 보냈습니다. */}
        </h1>
        <div className="text-gray-400">
          {t('check_kakao_email')} <br />
          {/* 카카오톡 또는 이메일을 확인해 주세요. <br /> */}
        </div>
      </Section>
      <BottomFixed className="pb-20">
        <Section>
          {/* <Button.lg
            children="이메일 전송"
            className="outlined-primary"
            onClick={() => setToastMsg('비밀번호 재설정 이메일을 전송했습니다. 이메일을 확인해주세요.')}
          /> */}
          <Button.lg children={t('go_to_home')} onClick={() => push('/')} className="filled-primary" />
        </Section>
      </BottomFixed>

      <Toast />
    </>
  )
}
