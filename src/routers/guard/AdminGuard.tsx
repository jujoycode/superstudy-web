import { useNavigate } from 'react-router'
import { Routes } from '@/legacy/constants/routes'
import { Role } from '@/legacy/generated/model'
import { useUserStore } from '@/stores/user'

interface Props {
  children: React.ReactNode
  requiredPermission?: string
}

export function AdminGuard({ children, requiredPermission }: Props) {
  const { me } = useUserStore()
  const navigate = useNavigate()

  // 관리자가 아닌 경우 접근 불가
  if (!me || (me.role !== Role.ADMIN && !me.teacherPermission)) {
    return navigate('/', { replace: true })
  }

  // 특정 권한이 필요한 경우 체크
  if (requiredPermission) {
    let hasPermission = me.role === Role.ADMIN

    if (!hasPermission && me.teacherPermission) {
      switch (requiredPermission) {
        case 'teacher':
          hasPermission = me.teacherPermission.adminTeacher || false
          break
        case 'student':
          hasPermission = me.teacherPermission.adminStudent || false
          break
        case 'parent':
          hasPermission = me.teacherPermission.adminParent || false
          break
        case 'class':
          hasPermission = me.teacherPermission.adminClass || false
          break
        case 'group':
          hasPermission = me.teacherPermission.adminGroup || false
          break
        case 'approvalLine':
          hasPermission = me.teacherPermission.adminApprovalLine || false
          break
        case 'timetable':
          hasPermission = me.teacherPermission.adminTimetable || false
          break
        case 'sms':
          hasPermission = me.teacherPermission.adminSms || false
          break
        case 'score':
          hasPermission = me.teacherPermission.adminScore || false
          break
        case 'ib':
          hasPermission = me.teacherPermission.adminIb || false
          break
      }
    }

    if (!hasPermission) {
      return navigate(Routes.admin.index, { replace: true })
    }
  }

  return <>{children}</>
}
