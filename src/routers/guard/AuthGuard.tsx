import type { ComponentType } from 'react'
import { Navigate, useLocation } from 'react-router'

import { useAuth } from '@/legacy/util/hooks'

interface AuthGuardProps {
  component: ComponentType
  guestOnly?: boolean
}

export function AuthGuard({ component: Component, guestOnly }: AuthGuardProps) {
  const { authenticated } = useAuth()
  const location = useLocation()

  // 리다이렉션 로직
  if (guestOnly && authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }
  if (!guestOnly && !authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Component />
}
