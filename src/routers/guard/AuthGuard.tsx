import { ReactNode } from 'react'
import { useAuth } from '@/legacy/util/hooks'

interface AuthGuardProps {
  children: ReactNode
  guestOnly?: boolean
}

export function AuthGuard({ children, guestOnly }: AuthGuardProps) {
  const { authenticated } = useAuth()

  // 리다이렉션 로직
  if (guestOnly && authenticated) {
    window.location.replace('/')
  }
  if (!guestOnly && !authenticated) {
    window.location.replace('/login')
  }

  return <>{children}</>
}
