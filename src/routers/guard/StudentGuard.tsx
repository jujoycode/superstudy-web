import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useUserStore } from '@/stores/user'

export function StudentGuard({ children }: { children: ReactNode }) {
  const { me, child } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(me?.school.isCourseActive || child?.school.isCourseActive ? '/student/courseentrance' : '/student/canteen')
  }, [navigate, me, child])

  return <>{children}</>
}
