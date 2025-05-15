import { Navigate, useLocation } from 'react-router-dom'
import { Routes } from '@/legacy/constants/routes'
import { Role } from '@/legacy/generated/model'
import { useUserStore } from '@/stores/user'

interface Props {
  children: React.ReactNode
}

type TeacherPermission = {
  adminTeacher?: boolean
  adminStudent?: boolean
  adminParent?: boolean
  adminClass?: boolean
  adminGroup?: boolean
  adminApprovalLine?: boolean
  adminTimetable?: boolean
  adminSms?: boolean
  adminScore?: boolean
  adminIb?: boolean
}

type User = {
  school?: { schoolType: string }
  schoolId?: number
}

type PathKey =
  | '/admin/school'
  | '/admin/teacher'
  | '/admin/student'
  | '/admin/parent'
  | '/admin/class'
  | '/admin/group'
  | '/admin/approval-line'
  | '/admin/timetable'
  | '/admin/sms'
  | '/admin/score'
  | '/admin/ib'

const PERMISSION_MAP: Record<PathKey, (permission?: TeacherPermission, user?: User) => boolean> = {
  '/admin/school': () => false,
  '/admin/teacher': (permission) => permission?.adminTeacher || false,
  '/admin/student': (permission) => permission?.adminStudent || false,
  '/admin/parent': (permission) => permission?.adminParent || false,
  '/admin/class': (permission) => permission?.adminClass || false,
  '/admin/group': (permission) => permission?.adminGroup || false,
  '/admin/approval-line': (permission) => permission?.adminApprovalLine || false,
  '/admin/timetable': (permission) => permission?.adminTimetable || false,
  '/admin/sms': (permission) => permission?.adminSms || false,
  '/admin/score': (permission, user) => (permission?.adminScore && user?.school?.schoolType === 'HS') || false,
  '/admin/ib': (permission, user) => (permission?.adminIb && (user?.schoolId === 2 || user?.schoolId === 106)) || false,
}

export function AdminGuard({ children }: Props) {
  const { me } = useUserStore()
  const location = useLocation()

  // 관리자가 아닌 경우 접근 불가
  if (!me || (me.role !== Role.ADMIN && !me.teacherPermission)) {
    return <Navigate to="/" replace />
  }

  // 관리자는 모든 권한 있음
  if (me.role === Role.ADMIN) {
    return <>{children}</>
  }

  // 현재 경로에 따른 권한 체크
  const checkPermissionByPath = () => {
    const path = Object.keys(PERMISSION_MAP).find((p) => location.pathname.startsWith(p)) as PathKey | undefined
    if (!path) return true // 매핑되지 않은 경로는 접근 허용

    return PERMISSION_MAP[path](me.teacherPermission, me)
  }

  // 권한이 없는 경우 접근 가능한 첫 페이지로 리다이렉션
  if (!checkPermissionByPath() && location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />
  }

  // 루트 경로에서 접근 가능한 첫 번째 페이지로 리다이렉션
  if (location.pathname === '/admin') {
    const availableRoutes = [
      me.teacherPermission?.adminTeacher && Routes.admin.teacher.index,
      me.teacherPermission?.adminStudent && Routes.admin.student.index,
      me.teacherPermission?.adminParent && Routes.admin.parent.index,
      me.teacherPermission?.adminClass && Routes.admin.klass.index,
      me.teacherPermission?.adminGroup && Routes.admin.group.index,
      me.teacherPermission?.adminApprovalLine && Routes.admin.approvalLine,
      me.teacherPermission?.adminTimetable && Routes.admin.timetable,
      me.teacherPermission?.adminSms && Routes.admin.sms,
      me.teacherPermission?.adminScore && me.school?.schoolType === 'HS' && Routes.admin.score.index,
      me.teacherPermission?.adminIb && (me.schoolId === 2 || me.schoolId === 106) && Routes.admin.ib.index,
    ].filter(Boolean)[0]

    if (availableRoutes) {
      return <Navigate to={availableRoutes} replace />
    }
  }

  return <>{children}</>
}
