import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ReactComponent as Logo } from '@/assets/svg/logo_superschool.svg'
import { useHistory } from '@/hooks/useHistory'
import { Alert, BackButton, Blank, Label, TopNavbar } from '@/legacy/components/common'
import AlertDialog from '@/legacy/components/common/AlertDialog'
import { InputDel } from '@/legacy/components/common/InputDel'
import { useFindPassword } from '@/legacy/container/find-password'

// TODO 카카오톡 수신 확인 필요
export function FindPasswordPageV2() {
  const { t } = useTranslation(undefined, { keyPrefix: 'find_password_page' })
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const { isFindPasswordLoading, isSuccess, errorMessage, setErrorMessage, findPassword } = useFindPassword()
  const { push } = useHistory()

  const buttonDisabled = !email || phone.length != 11 || !name

  return (
    <>
      <div className="box-border flex w-full flex-col items-center justify-center">
        <div className="block w-full md:hidden">
          <TopNavbar
            borderless
            title={t('title')}
            left={
              <div className="h-15">
                <BackButton className="h-15" />
              </div>
            }
          />
        </div>
        <div className="w-full max-w-xl px-2 py-4 xl:px-5">
          {isFindPasswordLoading && <Blank />}
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}
          <header className="hidden pt-8 pb-8 md:block md:pt-14 xl:pt-16 2xl:pt-20">
            <Link to={'/login'} className="cursor-pointer">
              <Logo className="w-full" />
            </Link>
          </header>
          <section className="mb-6 w-full rounded-lg p-6 md:mb-8 md:border md:border-gray-300">
            <div className="flex flex-col gap-2 pb-6">
              <Label.col className="hidden pt-2 text-lg font-semibold md:block">{t('find_password')}</Label.col>
              <Label.col>
                <InputDel
                  htmlId="email"
                  label={t('email.label')}
                  placeholder={t('email.placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value.replace(/[ •\t]/g, '').toLowerCase())}
                />
              </Label.col>
              <Label.col>
                <InputDel
                  label={t('name.label')}
                  htmlId="name"
                  placeholder={t('name.placeholder')}
                  value={name}
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(/[^ㄱ-ㅎ가-힣a-zA-Z\s]/g, '')
                    setName(onlyLetters)
                  }}
                  onKeyDown={(e) => {
                    const invalidChars = /[0-9~`!@#$%^&*()_+|<>?:/;'".,\[\]{}\\-]/
                    if (invalidChars.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                />
              </Label.col>

              <Label.col>
                <InputDel
                  type="tel"
                  htmlId="phone"
                  label={t('phone.label')}
                  placeholder={t('phone.placeholder')}
                  value={phone}
                  maxLength={11}
                  pattern="[0-9]"
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '')
                    setPhone(onlyNumbers)
                  }}
                  onKeyDown={(e) => {
                    const isNumberKey = /^[0-9]$/
                    if (!isNumberKey.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                      e.preventDefault()
                    }
                  }}
                />
                {/* <PhoneNumberField value={phone} onChange={(e) => setPhone(e.target.value)} /> */}
              </Label.col>
              <Label.col className="text-sm text-[#777777]">{t('contact_us_if_phone_number_changed')}</Label.col>
            </div>
            <div>
              <button
                children={t('find_password')}
                disabled={buttonDisabled}
                onClick={() => findPassword({ email, name, phone })}
                className="filled-primary text-18 w-full rounded-lg py-4 font-bold text-white"
              />
            </div>
            {/* <p className="text-gray-400">* {t('contact_us_if_phone_number_changed')}</p> */}

            {/* <div className="text-gray-400">* {t('password_change_message_sent')}</div> */}
          </section>
          <a
            target="_blank"
            rel="noreferrer"
            href="http://superstudy.channel.io/"
            className="flex w-full items-center justify-center"
          >
            <button children={t('contact_us')} className="text-15 rounded-lg border px-4 py-2 text-[#aaaaaa]" />
          </a>
        </div>
      </div>
      {isSuccess && (
        <AlertDialog
          confirmText="확인"
          message={`등록된 정보로 알림톡을 보냈습니다. \n 카카오톡을 확인해 주세요.`}
          description="알림톡을 받지 못한 경우 <b>이메일</b>을 확인해주세요."
          onConfirm={() => push('/login')}
        />
      )}
    </>
  )
}
