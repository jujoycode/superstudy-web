import { useState } from 'react'
import { Alert, BackButton, Label, PhoneNumberField, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useFindId } from '@/legacy/container/find-id'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { FindIdSuccessPage } from './FindIdSuccessPage'

export function FindIdPage() {
  const { result, errorMessage, setErrorMessage, findId } = useFindId()
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  if (result) {
    return <FindIdSuccessPage phone={phone} />
  }

  const buttonDisabled = phone.length != 11 || !name

  return (
    <>
      <div className="box-border flex w-full items-center justify-center">
        <div className="w-full max-w-xl">
          <TopNavbar
            title={`${t('find_id')}`}
            left={
              <div className="h-15">
                <BackButton className="h-15" />
              </div>
            }
          />
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}
          <Section>
            {/* <div>{t('enter_name_phone')}</div> */}
            <Label.col>
              <Label.Text children={'*' + t('name')} />
              <TextInput
                placeholder={`${t('enter_name')}`}
                value={name}
                onChange={(e) => setName(String(e.target.value).replace(/ /g, '').replace(/•/g, '').replace(/\t/g, ''))}
                onKeyDown={(e) => {
                  const specialCharacters = /[~`!@#$%^&*()_+|<>?:/;'".,]/
                  const whitespaceCharacters = /[ ]/
                  if (specialCharacters.test(e.key) || whitespaceCharacters.test(e.key)) {
                    e.preventDefault()
                  }
                }}
              />
            </Label.col>
            <Label.col>
              <Label.Text children={'*' + t('phone_number')} />
              <PhoneNumberField value={phone} onChange={(e) => setPhone(e.target.value)} />
              <p className="text-gray-400">* {t('contact_us_if_phone_number_changed')}</p>
            </Label.col>
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
              children={t('find_id')}
              disabled={buttonDisabled}
              onClick={() => findId({ name, phone })}
              className="filled-primary"
            />
          </Section>
        </div>
      </div>
    </>
  )
}
