import { useEffect, useMemo } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { TeacherLNB } from '@/organisms/LNB/TeacherLNB'
import { useUserStore } from '@/stores/user'
import { Blank } from '@/legacy/components/common'
import { Toast } from '@/legacy/components/Toast'
import { DateUtil } from '@/legacy/util/date'
import { DateFormat } from '@/legacy/util/date'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { Icon } from '@/legacy/components/common/icons'
import { cn } from '@/utils/commonUtil'
import { useResponsive } from '@/hooks/useResponsive'

export function TeacherLayout() {
  const { me } = useUserStore()
  const { pathname } = useLocation()
  const { isMobile } = useResponsive()
  const navigate = useNavigate()

  useEffect(() => {
    if (pathname === '/teacher') {
      navigate(`/teacher/canteen/${DateUtil.formatDate(new Date().toISOString(), DateFormat['YYYY-MM-DD'])}`)
    }
  }, [pathname, me, navigate])

  if (!me) {
    return <Blank />
  }

  const tabs = useMemo(
    () => [
      { path: '/teacher/activityv3', icon: Icon.Activity, name: '활동' },
      {
        path: '/teacher/apply',
        icon: Icon.Planner,
        name: '출결',
        extra: [
          '/teacher/absent',
          '/teacher/outing',
          '/teacher/fieldtrip',
          '/teacher/attendance',
          '/teacher/studentcard',
          '/teacher/timetable',
        ],
      },
      {
        path: `/teacher/canteen/${DateUtil.formatDate(new Date().toISOString(), DateFormat['YYYY-MM-DD'])}`,
        icon: Icon.Home,
        name: '홈',
        extra: ['/teacher/canteen', '/teacher/chat'],
      },
      {
        path: '/teacher/notice',
        icon: Icon.Notice,
        name: '공지',
        extra: ['/teacher/board', '/teacher/newsletter'],
      },
      {
        path: '/teacher/mypage',
        icon: Icon.MoreVertical,
        name: '더보기',
        extra: ['/teacher/update', '/teacher/announcement'],
      },
    ],
    [me?.role, pathname],
  )

  const pcComponent = (
    <GridItem colSpan={2}>
      <TeacherLNB HeaderProps={{ name: me.name, email: me.email || '', school: me.school.name }} />
    </GridItem>
  )

  const mobileComponent = (
    <nav className="bottom-nav z-100 md:hidden">
      {tabs.map((tab) => {
        const active = [tab.path, ...(tab.extra ?? [])].some((path) => pathname.startsWith(path))
        return (
          <Link key={tab.path} to={tab.path} className={cn('bottom-nav-item', active && 'text-darkgray')}>
            <tab.icon className="stroke-current" />
            <span>{tab.name}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <Grid col={12}>
      <ResponsiveRenderer default={pcComponent} />

      <GridItem colSpan={isMobile ? 12 : 10}>
        <Outlet />
        <ResponsiveRenderer mobile={mobileComponent} />
      </GridItem>

      <Toast />
    </Grid>
  )
}
