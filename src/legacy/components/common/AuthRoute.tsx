import { ComponentType } from 'react'
import { Navigate, Route, useLocation } from 'react-router-dom'

import { useAuth } from '@/legacy/util/hooks'

interface AuthRouteProps {
  path?: string
  component: ComponentType
  guestOnly?: boolean
}

function Redirect({ to }: { to: string }) {
  const location = useLocation()
  return <Route element={<Navigate to={to} state={{ from: location }} replace />} />
}

export function AuthRoute({ component: Component, guestOnly }: AuthRouteProps) {
  const { authenticated } = useAuth()

  if (guestOnly && authenticated) {
    return <Redirect to="/" />
  }

  if (!guestOnly && !authenticated) {
    return <Redirect to="/login" />
  }

  // Role에 따른 불법 접근 차단

  return <Component />
}
