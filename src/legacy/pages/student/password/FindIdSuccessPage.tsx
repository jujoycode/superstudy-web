import { useHistory } from '@/hooks/useHistory'
import { BackButton, BottomFixed, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { Routes } from '@/legacy/constants/routes'

interface FindIdSuccessPageProps {
  phone: string
}

export function FindIdSuccessPage({ phone }: FindIdSuccessPageProps) {
  const { push } = useHistory()
  const { t } = useLanguage()

  return (
    <>
      <TopNavbar
        title={`${t('find_id')}`}
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />

      <Section>
        <h1 className="text-2xl font-bold">{t('find_id')}</h1>

        <div className="w-full text-xl">
          {/* &nbsp;등록된 휴대전화로({phone}) 아이디를 보냈습니다. */}
          &nbsp;{t('id_sent_registered_phone')}
          <br />
          {/* &nbsp;카카오톡을 확인해주세요. */}
          &nbsp;{t('check_kakao')}
        </div>
        <div className="w-full text-red-500">* {t('contact_superschool_if_no_id_kakao')}</div>
      </Section>
      <BottomFixed>
        <Section>
          <Button.lg children={t('login')} onClick={() => push(Routes.auth.login)} className="filled-primary" />
        </Section>
      </BottomFixed>
    </>
  )
}
