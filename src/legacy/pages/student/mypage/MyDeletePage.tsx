import { useState } from 'react'
import { SetterOrUpdater } from 'recoil'

import { BackButton, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { userDeleteUser } from '@/legacy/generated/endpoint'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useLogout } from '@/legacy/util/hooks'

interface MyDeletePageProps {
  setIsDeleteMe: SetterOrUpdater<boolean>
}

export function MyDeletePage({ setIsDeleteMe }: MyDeletePageProps) {
  const { t } = useLanguage()
  const [deleteReason, setDeleteReason] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const logout = useLogout()

  async function deleteExpiredUser() {
    if (password.length === 0) {
      alert('비밀번호를 입력해주세요.')
      return
    } else {
      if (password !== password2) {
        alert('비밀번호와 비밀번호 확인이 다릅니다.')
        return
      }
    }

    if (deleteReason === '') {
      alert('탈퇴이유는 필수로 적어주세요.')
      return
    }

    if (!confirm(`탈퇴한 계정은 복구할 수 없습니다.\n탈퇴하시겠습니까?`)) return

    await userDeleteUser({ password: password, reason: deleteReason })
      .then((result) => {
        alert('회원탈퇴가 완료되었습니다.')
        logout()
      })
      .catch((result) => {
        if (result?.response?.data?.code == '1001100') {
          alert(result?.response?.data?.msg?.ko ?? '비밀번호가 일치하지 않습니다.')
        } else {
          alert('회원탈퇴에 실패했습니다.')
        }
      })
  }

  return (
    <div>
      <TopNavbar
        title="회원 탈퇴"
        left={
          <div className="h-15">
            <BackButton className="h-15" onClick={() => setIsDeleteMe(false)} />
          </div>
        }
      />

      <Section>
        <div>
          <div className="px-4 py-4 md:px-10 md:py-5">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Button className="h-8 w-16 border border-gray-600" onClick={() => setIsDeleteMe(false)}>
                    {t('cancel')}
                  </Button>
                  <Button className="h-8 w-16 bg-zinc-800 text-white" onClick={deleteExpiredUser}>
                    {t('account_deletion')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>
              <div>
                <div className="text-lg font-bold text-gray-800">{t('password')}</div>
                <input
                  className="w-full rounded-md border border-zinc-300 underline underline-offset-4 focus:border-zinc-300 focus:ring-0"
                  type="password"
                  placeholder={`${t('enter_password')}`}
                  value={password}
                  onChange={(e) => setPassword(String(e.target.value))}
                />
              </div>

              <div>
                <div className="text-lg font-bold text-gray-800">{t('confirm_password')}</div>
                <input
                  className="w-full rounded-md border border-zinc-300 underline underline-offset-4 focus:border-zinc-300 focus:ring-0"
                  type="password"
                  placeholder={`${t('enter_password_again')}`}
                  value={password2}
                  onChange={(e) => setPassword2(String(e.target.value))}
                />
              </div>

              <div>
                <div className="mt-2 text-lg font-bold text-gray-800"> {t(`account_deletion_reason`)}</div>
                <input
                  className="w-full rounded-md border border-zinc-300 underline underline-offset-4 focus:border-zinc-300 focus:ring-0"
                  type="password"
                  placeholder={`${t(`account_deletion_reason`)}`}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
