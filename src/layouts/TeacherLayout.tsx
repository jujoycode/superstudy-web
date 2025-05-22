import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { TeacherLNB } from '@/organisms/LNB/TeacherLNB'
import { useUserStore } from '@/stores/user'
import { Blank } from '@/legacy/components/common'
import { Toast } from '@/legacy/components/Toast'
import { DateUtil } from '@/legacy/util/date'
import { DateFormat } from '@/legacy/util/date'

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
    <Grid col={12}>
      <GridItem colSpan={2}>
        <TeacherLNB HeaderProps={{ name: me.name, email: me.email || '', school: me.school.name }} />
      </GridItem>

      <GridItem colSpan={10}>
        <Outlet />
      </GridItem>

      <Toast />
    </Grid>
  )
}
