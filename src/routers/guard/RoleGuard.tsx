import { ReactNode, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useUserStore } from '@/stores/user'
import { Role } from '@/legacy/generated/model/role'

// 각 Role이 접근할 수 있는 URL 패턴 정의
const ROLE_URL_PATTERNS: Partial<Record<Role, RegExp[]>> = {
  [Role.ADMIN]: [/^\/admin/, /^\/teacher/],
  [Role.TEACHER]: [/^\/teacher/],
  [Role.USER]: [/^\/student/],
  [Role.PARENT]: [/^\/student/],
  // 다른 역할들은 기본적으로 접근할 수 있는 URL 패턴이 없음
}

// 각 Role의 기본 리다이렉션 URL
const DEFAULT_REDIRECT_URLS: Partial<Record<Role, string>> = {
  // ROLE - Admin
  [Role.ADMIN]: '/admin',
  // ROLE - Student
  [Role.USER]: '/student',
  [Role.PARENT]: '/student',
  // ROLE - Teacher
  [Role.TEACHER]: '/teacher',
  [Role.PRE_HEAD]: '/teacher',
  [Role.HEAD]: '/teacher',
  [Role.PRE_PRINCIPAL]: '/teacher',
  [Role.PRINCIPAL]: '/teacher',
  [Role.VICE_PRINCIPAL]: '/teacher',
  [Role.HEAD_PRINCIPAL]: '/teacher',
  [Role.SECURITY]: '/teacher',
  [Role.STAFF]: '/teacher',
  [Role.GUEST_LECTURER]: '/teacher',
}

export function RoleGuard({ children }: { children: ReactNode }) {
  const { me } = useUserStore()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  useEffect(() => {
    if (!me && currentPath !== '/login') {
      // navigate('/login')
      return
    } else {
      // 현재 사용자의 Role에 맞는 URL 패턴
      const allowedPatterns = ROLE_URL_PATTERNS[me!.role] || []

      // URL이 현재 Role의 허용 패턴과 일치하는지 확인
      const isAllowedUrl = allowedPatterns.some((pattern) => pattern.test(currentPath))

      // URL이 허용되지 않은 경우 리다이렉션
      if (!isAllowedUrl) {
        // 해당 Role의 기본 URL로 리다이렉션
        const redirectUrl = DEFAULT_REDIRECT_URLS[me!.role] || '/'
        navigate(redirectUrl)
      }
    }
  }, [me, navigate, currentPath])

  return children
}
