import { useState } from 'react'

import { Alert, BackButton, Blank, Label, PhoneNumberField, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useFindPassword } from '@/legacy/container/find-password'
import { useLanguage } from '@/legacy/hooks/useLanguage'

import { FindPasswordSuccessPageV1 } from './FindPasswordSuccessPageV1'

// TODO 카카오톡 수신 확인 필요
export function FindPasswordPage() {
  const [email, setEmail] = useState('')
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const { isFindPasswordLoading, isSuccess, errorMessage, setErrorMessage, findPassword } = useFindPassword()

  const buttonDisabled = !email || phone.length != 11 || !name

  if (isSuccess) {
    return <FindPasswordSuccessPageV1 />
  }

  return (
    <div className="box-border flex w-full items-center justify-center">
      <div className="w-full max-w-xl">
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
          <Label.col>
            <Label.Text children={'* ' + t('username')} />
            <TextInput
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/[ •\t]/g, '').toLowerCase())}
            />
          </Label.col>
          <Label.col>
            <Label.Text children={'* ' + t('name')} />
            <TextInput
              placeholder={`${t('enter_name')}`}
              value={name}
              onChange={(e) => setName(String(e.target.value).replace(/•/g, '').replace(/\t/g, ''))}
              onKeyDown={(e) => {
                const specialCharacters = /[~`!@#$%^&*()_+|<>?:/;'".,]/
                if (specialCharacters.test(e.key)) {
                  e.preventDefault()
                }
              }}
            />
          </Label.col>

          <Label.col>
            <Label.Text children={'* ' + t('phone_number')} />
            <PhoneNumberField value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Label.col>

          <div className="text-gray-400">* {t('password_change_message_sent')}</div>
          <p className="text-gray-400">* {t('contact_us_if_phone_number_changed')}</p>
        </Section>
        <Section>
          <a
            target="_blank"
            rel="noreferrer"
            href="http://superstudy.channel.io/"
            className="flex w-full items-center justify-center"
          >
            <button children={t('contact_us')} className="border-b-2 hover:border-b-black hover:font-semibold" />
          </a>
          <Button.lg
            children={t('find_password')}
            disabled={buttonDisabled}
            onClick={() => findPassword({ email, name, phone })}
            className="filled-primary"
          />
        </Section>
      </div>
    </div>
  )
}
