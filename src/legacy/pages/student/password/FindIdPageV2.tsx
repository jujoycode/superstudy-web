import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ReactComponent as Logo } from '@/assets/svg/logo_superschool.svg'
import { useHistory } from '@/hooks/useHistory'
import { Alert, BackButton, Label, TopNavbar } from '@/legacy/components/common'
import AlertDialog from '@/legacy/components/common/AlertDialog'
import { InputDel } from '@/legacy/components/common/InputDel'
import { useFindId } from '@/legacy/container/find-id'

export function FindIdPageV2() {
  const { push } = useHistory()
  const { t } = useTranslation(undefined, { keyPrefix: 'find_id_page' })
  const { result, errorMessage, setErrorMessage, findId } = useFindId()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const buttonDisabled = phone.length != 11 || !name

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
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}
          <header className="hidden pt-8 pb-8 md:block md:pt-14 xl:pt-16 2xl:pt-20">
            <Link to={'/login'} className="cursor-pointer">
              <Logo />
            </Link>
          </header>
          <section className="mb-6 w-full rounded-lg p-6 md:mb-8 md:border md:border-gray-300">
            <div className="flex flex-col gap-2 pb-6">
              {/* <div>{t('enter_name_phone')}</div> */}
              <Label.col className="hidden pt-2 text-lg font-semibold md:block">{t('find_id')}</Label.col>
              <Label.col>
                <InputDel
                  htmlId="name"
                  label={t('name.label')}
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
                  label={t('phone.label')}
                  htmlId="phone"
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
              </Label.col>
              <Label.col className="text-sm text-[#777777]">{t('contact_us_if_phone_number_changed')}</Label.col>
            </div>
            <div>
              <button
                children={t('find_id')}
                disabled={buttonDisabled}
                onClick={() => findId({ name, phone })}
                className="filled-primary text-19 w-full rounded-lg py-4 font-bold text-white"
              />
            </div>
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
      {result && (
        <AlertDialog
          confirmText="확인"
          message={`비밀번호 재설정 알림톡을 보냈습니다.`}
          description="카카오톡을 확인해 주세요."
          onConfirm={() => push('/login')}
        />
      )}
    </>
  )
}
