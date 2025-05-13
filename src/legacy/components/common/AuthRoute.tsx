import { ComponentType } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/legacy/util/hooks'

interface AuthRouteProps {
  path?: string
  component: ComponentType
  guestOnly?: boolean
}

export function AuthRoute({ component: Component, guestOnly }: AuthRouteProps) {
  const { authenticated } = useAuth()
  const location = useLocation()

  if (guestOnly && authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (!guestOnly && !authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Component />
}
