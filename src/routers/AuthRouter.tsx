import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useLogout'

interface AuthRouterProps {
  children: React.ReactNode
  guestOnly?: boolean
}

export function AuthRouter({ children, guestOnly }: AuthRouterProps) {
  const { authenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (guestOnly && authenticated) {
      navigate('/')
    }

    if (!guestOnly && !authenticated) {
      navigate('/login')
    }
  }, [authenticated, guestOnly, navigate])

  return <>{children}</>
}
