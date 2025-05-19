import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { Container } from '@/atoms/Container'
import { TeacherLNB } from '@/organisms/LNB/TeacherLNB'
import { MenuConstant } from '@/constants/MenuConstant'
import { Toast } from '@/legacy/components/Toast'
import { DateFormat, DateUtil } from '@/legacy/util/date'

export function TeacherLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // useEffect(() => {
  //   navigate(
  //     process.env.REACT_APP_MENU_TYPE === '2'
  //       ? '/teacher/absent'
  //       : `/teacher/canteen/${DateUtil.formatDate(new Date().toISOString(), DateFormat['YYYY-MM-DD'])}`,
  //   )
  // }, [navigate])

  return (
    <Container flex height="full" direction="row" justify="start" items="start" gap="2">
      <TeacherLNB
        HeaderProps={{ name: '김수학선생님', email: 'team@super.kr', school: '슈퍼고등학교' }}
        ItemProps={MenuConstant.MENU_ITEMS}
      />
      {pathname === '/teacher' ? <></> : <Outlet />}

      <Toast />
    </Container>
  )
}
