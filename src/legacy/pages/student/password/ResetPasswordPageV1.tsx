import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { BackButton, Blank, BottomFixed, Label, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useResetPassword } from '@/legacy/container/reset-password'
import { Validator } from '@/legacy/util/validator'

// TODO API 수정 필요
export function ResetPasswordPageV1() {
  const { id = '' } = useParams<{ id: string }>()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { mutate, isLoading, errorMessage } = useResetPassword()

  const handleResetPassword = (password: string) => {
    if (!password) {
      alert('안전한 비밀번호를 입력하세요.')
      return
    }
    if (!Validator.passwordRule(password)) {
      alert('안전한 비밀번호를 입력하세요.')
      return
    }
    mutate({ data: { token: id, newPassword } })
  }

  return (
    <>
      <TopNavbar
        title="비밀번호 변경"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      {isLoading && <Blank />}
      <Section>
        <h1 className="text-2xl font-bold">새로운 비밀번호 입력</h1>
        <Label.col>
          <Label.Text children="새 비밀번호" />
          <TextInput
            type="password"
            placeholder="새로운 비밀번호를 입력해주세요"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Label.col>
        {newPassword && !Validator.passwordRule(newPassword) && (
          <div className="text-red-600">안전한 비밀번호를 입력하세요.</div>
        )}
        <Label.col>
          <Label.Text children="비밀번호 확인" />
          <TextInput
            type="password"
            placeholder="동일한 비밀번호를 한번 더 입력해주세요."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Label.col>
        {confirmPassword && confirmPassword !== newPassword && (
          <div className="text-red-600">비밀번호 확인이 일치하지 않습니다.</div>
        )}
        <div className="text-gray-3">
          &nbsp; 안전한 개인정보의 보호를 위해 문자,숫자,특수문자가 포함된 8자 이상의 비밀번호를 입력하세요.
          <br />
          &nbsp; 사용 가능한 특수문자는 ! @ # $ % & * ? 입니다.
        </div>
        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      </Section>
      <BottomFixed>
        <Section>
          <Button.lg
            children="비밀번호 재설정하기"
            disabled={!newPassword}
            onClick={() => handleResetPassword(newPassword)}
            className="filled-primary"
          />
        </Section>
      </BottomFixed>
    </>
  )
}
