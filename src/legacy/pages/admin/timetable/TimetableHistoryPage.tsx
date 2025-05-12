import { useContext } from 'react'
import { useRecoilValue } from 'recoil'
import { Label } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { meState } from '@/legacy/store'
import { AdminContext } from '../AdminMainPage'

interface TimetableHistoryProps {
  onCloseClick: () => void
}

export function TimetableHistoryPage({ onCloseClick }: TimetableHistoryProps) {
  const me = useRecoilValue(meState)
  const { year } = useContext(AdminContext)
  const { t } = useLanguage()

  return (
    <Admin.Section className="w-1/2">
      <Admin.H2>수업교환 이력</Admin.H2>
      <div>
        <Label.Text children="수업교환 이력" />
        <div></div>
      </div>

      <Button.lg children="일괄등록 종료" onClick={() => onCloseClick()} className="filled-gray w-full" />
    </Admin.Section>
  )
}
