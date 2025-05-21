import { Outlet } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { Role } from '@/legacy/generated/model'

export function MyStudyPage() {
  const { me, child } = useUserStore()

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

      <Outlet context={{ studentId: me.role === Role.PARENT ? child?.id : me.id }} />
    </div>
  )
}
