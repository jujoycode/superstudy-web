import { useLocation, useNavigate } from 'react-router'
import { useUserStore } from '@/stores/user'
import { Role } from '@/legacy/generated/model'

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
  const navigate = useNavigate()
  const path = Object.keys(PERMISSION_MAP).find((p) => location.pathname.startsWith(p)) as PathKey | undefined

  // Role.ADMIN인 경우 /admin/school으로 리다이렉트
  if (me?.role === Role.ADMIN && location.pathname === '/admin') {
    navigate('/admin/school', { replace: true })
  }

  // Role.ADMIN이 아닌 경우 권한 체크
  if (me?.role !== Role.ADMIN) {
    // /admin 경로에서 권한이 있는 첫 번째 페이지로 리다이렉트
    if (location.pathname === '/admin') {
      const redirectPath = (Object.keys(PERMISSION_MAP) as PathKey[]).find((key) =>
        PERMISSION_MAP[key](me?.teacherPermission, me),
      )

      if (redirectPath) {
        navigate(redirectPath, { replace: true })
      }
      navigate('/', { replace: true })
    }

    // 특정 관리자 페이지 접근 시 권한 체크
    if (path && !PERMISSION_MAP[path](me?.teacherPermission, me)) {
      navigate('/admin', { replace: true })
    }
  }

  return children
}
