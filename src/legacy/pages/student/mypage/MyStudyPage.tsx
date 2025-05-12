import { useRecoilValue } from 'recoil'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { StudyInfoCard2 } from '@/legacy/components/studentCard/StudyInfoCard2'
import { Role } from '@/legacy/generated/model'
import { childState, meState } from '@/stores'

export function MyStudyPage() {
  const me = useRecoilValue(meState)
  const child = useRecoilValue(childState)

  if (!me) return null
  return (
    <div>
      <TopNavbar
        title="학습/진로 목표"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />

      {/* <StudyInfoCard studentId={me.role === Role.PARENT ? child?.id : me.id} isCard={false} /> */}
      <StudyInfoCard2 studentId={me.role === Role.PARENT ? child?.id : me.id} isCard={false} />
    </div>
  )
}
