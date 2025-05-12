import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { BackButton, Label, PhoneNumberField, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Toast } from '@/legacy/components/Toast'
import { useOtp } from '@/legacy/container/otp'
import { useLogout } from '@/legacy/util/hooks'
import { Validator } from '@/legacy/util/validator'

export function TwoFactor() {
  const [phone, setPhone] = useState('')
  const { sendOtp, checkOtp, remainSecString, otpCheckResult } = useOtp()
  const [otpNumber, setOtpNumber] = useState('')

  const history = useHistory()
  const logout = useLogout()

  return (
    <div className="box-border flex w-full items-center justify-center">
      <div className="w-full max-w-xl">
        <TopNavbar
          left={
            <div className="h-15">
              <BackButton
                className="h-15"
                onClick={() => {
                  // 2차인증에서 뒤로가기 시 로그아웃 처리
                  logout()
                  history.push('/')
                }}
              />
            </div>
          }
          title="2차 인증"
        />
        <Section>
          <Label.col>
            <Label.Text children="*2차 인증을 위해 가입 시 입력 한 휴대폰 번호를 입력해주세요." />
            <PhoneNumberField value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div>
              <div className="flex space-x-2">
                <TextInput
                  maxLength={6}
                  placeholder="인증번호를 입력해주세요."
                  value={otpNumber}
                  onChange={(e) => setOtpNumber(String(e.target.value))}
                  className="mb-2"
                />
                {!!remainSecString ? (
                  <Button.lg
                    children="인증번호 확인"
                    disabled={otpNumber.length !== 6}
                    onClick={() => checkOtp(phone, otpNumber)}
                    className="filled-primary"
                  />
                ) : (
                  <Button.lg
                    children="인증번호 받기"
                    disabled={!Validator.phoneNumberRule(phone) || otpCheckResult}
                    onClick={() => sendOtp(phone, 'alim')}
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
        </Section>

        <div className="fixed right-0 bottom-3 left-0 w-full text-center text-gray-600">슈퍼스쿨</div>
      </div>
      <Toast />
    </div>
  )
}
