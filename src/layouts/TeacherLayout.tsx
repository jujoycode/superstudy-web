import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { Container } from '@/atoms/Container'
import { Toast } from '@/legacy/components/Toast'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { TeacherLNB } from '@/organisms/LNB/TeacherLNB'

export function TeacherLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    navigate(
      process.env.REACT_APP_MENU_TYPE === '2'
        ? '/teacher/absent'
        : `/teacher/canteen/${DateUtil.formatDate(new Date().toISOString(), DateFormat['YYYY-MM-DD'])}`,
    )
  }, [navigate])

  return (
    <Container flex height="full" direction="row" justify="start" items="start" gap="2">
      <TeacherLNB />
      {pathname === '/teacher' ? <></> : <Outlet />}

      <Toast />
    </Container>
  )
}
