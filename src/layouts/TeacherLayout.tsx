import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import { Container } from '@/atoms/Container'
import { TeacherLNB } from '@/organisms/LNB/TeacherLNB'
import { MenuConstant } from '@/constants/menuConstant'
import { useUserStore } from '@/stores/user'
import { Blank } from '@/legacy/components/common'
import { Toast } from '@/legacy/components/Toast'
import { DateFormat } from '@/legacy/util/date'
import { DateUtil } from '@/legacy/util/date'

export function TeacherLayout() {
  const { pathname } = useLocation()
  const { me } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (pathname === '/teacher') {
      navigate(`/teacher/canteen/${DateUtil.formatDate(new Date().toISOString(), DateFormat['YYYY-MM-DD'])}`)
    }
  }, [pathname, me, navigate])

  if (!me) {
    return <Blank />
  }

  return (
    <Container flex height="full" direction="row" justify="start" items="start" gap="2">
      <TeacherLNB
        HeaderProps={{ name: me.name, email: me.email || '', school: me.school.name }}
        ItemProps={MenuConstant.MENU_ITEMS}
      />
      <Outlet />
      <Toast />
    </Container>
  )
}
