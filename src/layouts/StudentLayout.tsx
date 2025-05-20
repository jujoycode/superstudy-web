import clsx from 'clsx'
import { useEffect, useMemo } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { Blank } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { Role } from '@/legacy/generated/model'

export function StudentLayout() {
  const { me } = useUserStore()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (pathname === '/student') {
      navigate(`/student/canteen`)
    }
  }, [pathname, me, navigate])

  const tabs = useMemo(
    () => [
      { path: '/student/activity', icon: Icon.Activity, name: '활동', hidden: me?.role === Role.PARENT },
      {
        path: '/student/apply',
        icon: Icon.Planner,
        name: '출결',
        extra: ['/student/outing', '/student/absent', '/student/fieldtrip', '/student/pointlogs'],
      },
      { path: '/student/canteen', icon: Icon.Home, name: '홈' },
      {
        path: '/student/notice',
        icon: Icon.Notice,
        name: '공지',
        extra: ['/student/board', '/student/newsletter'],
      },
      { path: '/student/mypage', icon: Icon.MoreVertical, name: '더보기', extra: ['/student/announcement'] },
    ],
    [me?.role],
  )

  if (!me) {
    return <Blank />
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex h-full w-full flex-col overflow-y-auto">
          <Outlet />
        </div>
        <nav className="flex w-full border-t bg-white py-1">
          {tabs.map((tab) => {
            const active = [tab.path, ...(tab.extra ?? [])].some((path) => pathname.startsWith(path))
            return tab.hidden ? null : (
              <Link key={tab.path} to={tab.path} className={clsx('bottom-nav-item', active && 'text-darkgray')}>
                <tab.icon className="stroke-current" />
                <span>{tab.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
