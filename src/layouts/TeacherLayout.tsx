import { Outlet, useLocation } from 'react-router'
import { Container } from '@/atoms/Container'
import { TeacherMainPage } from '@/legacy/pages/teacher/TeacherMainPage'
import { TeacherLNB } from '@/organisms/LNB/TeacherLNB'

export function TeacherLayout() {
  const location = useLocation()

  return (
    <Container flex direction="row" justify="start" items="start" gap="2">
      <TeacherLNB />
      {location.pathname === '/teacher' ? <TeacherMainPage /> : <Outlet />}
    </Container>
  )
}
