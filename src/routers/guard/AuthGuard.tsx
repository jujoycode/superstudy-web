import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { Role } from '@/legacy/generated/model'

// role별 접근 가능한 URL 패턴 정의
const ROLE_ACCESS_PATTERNS: Record<Role, RegExp[]> = {
  [Role.ADMIN]: [/^\/admin/, /^\/teacher/],
  [Role.USER]: [/^\/student/],
  [Role.PARENT]: [/^\/student/],
  [Role.TEACHER]: [/^\/teacher/],
  [Role.PRE_HEAD]: [/^\/teacher/],
  [Role.HEAD]: [/^\/teacher/],
  [Role.PRE_PRINCIPAL]: [/^\/teacher/],
  [Role.PRINCIPAL]: [/^\/teacher/],
  [Role.VICE_PRINCIPAL]: [/^\/teacher/],
  [Role.HEAD_PRINCIPAL]: [/^\/teacher/],
  [Role.SECURITY]: [/^\/teacher/],
  [Role.STAFF]: [/^\/teacher/],
  [Role.GUEST_LECTURER]: [/^\/teacher/],
}

/**
 * getDefaultPath
 * @desc 권한에 맞는 기본 경로 반환
 * @author jh.ryu
 */
export function getDefaultPath(role: Role) {
  switch (role) {
    case Role.ADMIN: {
      return '/admin'
    }

    case Role.USER:
    case Role.PARENT: {
      return '/student'
    }

    case Role.TEACHER:
    case Role.PRE_HEAD:
    case Role.HEAD:
    case Role.PRE_PRINCIPAL:
    case Role.PRINCIPAL:
    case Role.VICE_PRINCIPAL:
    case Role.HEAD_PRINCIPAL:
    case Role.SECURITY:
    case Role.STAFF:
    case Role.GUEST_LECTURER: {
      return '/teacher'
    }
  }
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { me } = useUserStore()

  useEffect(() => {
    const checkAccess = () => {
      if (!me) {
        navigate('/login', { replace: true })
        return
      }

      const { role } = me
      const currentPath = location.pathname

      // 현재 URL이 role의 접근 가능한 URL 패턴과 일치하는지 확인
      const hasAccess = ROLE_ACCESS_PATTERNS[role].some((pattern) => {
        return pattern.test(currentPath)
      })

      if (!hasAccess) {
        navigate(getDefaultPath(role), { replace: true })
      }
    }

    checkAccess()
  }, [me, location.pathname, navigate])

  if (!me) {
    return null
  }

  return <>{children}</>
}
