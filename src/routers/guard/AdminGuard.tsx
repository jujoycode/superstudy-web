import { Navigate, useLocation } from 'react-router-dom'
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
  '/admin/teacher': (p) => p?.adminTeacher || false,
  '/admin/student': (p) => p?.adminStudent || false,
  '/admin/parent': (p) => p?.adminParent || false,
  '/admin/class': (p) => p?.adminClass || false,
  '/admin/group': (p) => p?.adminGroup || false,
  '/admin/approval-line': (p) => p?.adminApprovalLine || false,
  '/admin/timetable': (p) => p?.adminTimetable || false,
  '/admin/sms': (p) => p?.adminSms || false,
  '/admin/score': (p, u) => (p?.adminScore && u?.school?.schoolType === 'HS') || false,
  '/admin/ib': (p, u) => (p?.adminIb && (u?.schoolId === 2 || u?.schoolId === 106)) || false,
}

export function AdminGuard({ children }: Props) {
  const { me } = useUserStore()
  const location = useLocation()
  const path = Object.keys(PERMISSION_MAP).find((p) => location.pathname.startsWith(p)) as PathKey | undefined
  const hasPermission = !path || PERMISSION_MAP[path](me?.teacherPermission, me)

  if (!me || (me.role !== Role.ADMIN && !me.teacherPermission)) {
    return <Navigate to="/" replace />
  }

  if (me.role === Role.ADMIN) {
    return children
  }

  if (!hasPermission && location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />
  }

  if (location.pathname === '/admin') {
    const redirectPath = (Object.keys(PERMISSION_MAP) as PathKey[]).find((key) =>
      PERMISSION_MAP[key](me.teacherPermission, me),
    )

    if (redirectPath) {
      return <Navigate to={redirectPath} replace />
    }
  }

  return children
}
