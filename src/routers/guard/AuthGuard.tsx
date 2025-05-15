import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/legacy/util/hooks'

interface AuthGuardProps {
  children: ReactNode
  guestOnly?: boolean
}

export function AuthGuard({ children, guestOnly }: AuthGuardProps) {
  const { authenticated } = useAuth()
  const location = useLocation()

  // 리다이렉션 로직
  if (guestOnly && authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }
  if (!guestOnly && !authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
