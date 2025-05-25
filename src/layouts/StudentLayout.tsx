import clsx from 'clsx'
import { useEffect, useMemo } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { Button } from '@/atoms/Button'
import { Icon } from '@/atoms/Icon'
import { useUserStore } from '@/stores/user'
import { useResponsive } from '@/hooks/useResponsive'
import { Blank } from '@/legacy/components/common'
import { Icon as LegacyIcon } from '@/legacy/components/common/icons'
import { Role } from '@/legacy/generated/model'
import { Flex } from '@/atoms/Flex'
import { Box } from '@/atoms/Box'

export function StudentLayout() {
  const { me } = useUserStore()
  const { pathname } = useLocation()
  const { isCustom: isIbActive } = useResponsive({ custom: 960 })
  const navigate = useNavigate()

  useEffect(() => {
    if (pathname === '/student') {
      navigate(`/student/canteen`)
    }
  }, [pathname, me, navigate])

  const tabs = useMemo(
    () => [
      { path: '/student/activity', icon: LegacyIcon.Activity, name: '활동', hidden: me?.role === Role.PARENT },
      {
        path: '/student/apply',
        icon: LegacyIcon.Planner,
        name: '출결',
        extra: ['/student/outing', '/student/absent', '/student/fieldtrip', '/student/pointlogs'],
      },
      { path: '/student/canteen', icon: LegacyIcon.Home, name: '홈' },
      {
        path: '/student/notice',
        icon: LegacyIcon.Notice,
        name: '공지',
        extra: ['/student/board', '/student/newsletter'],
      },
      { path: '/student/mypage', icon: LegacyIcon.MoreVertical, name: '더보기', extra: ['/student/announcement'] },
    ],
    [me?.role],
  )

  if (!me) {
    return <Blank />
  }

  const ibLayout = (
    <Box width="[256px]">
      <Flex direction="col" items="center" justify="center" gap="4">
        <Icon name="logo" customSize={{ width: '152px', height: '81px' }} />

        <span className="text-sm">
          학교를 쉽고 빠르게, <b>슈퍼스쿨!</b>
        </span>
        {me?.school.isIbActive && (
          <Button
            variant="outline"
            className="text-color-black rounded-md border border-gray-300"
            onClick={() => navigate('/ib/student')}
          >
            슈퍼스쿨 IB 바로가기
          </Button>
        )}
      </Flex>
    </Box>
  )

  return (
    <>
      <div className="flex h-full w-full flex-row items-center justify-center">
        {isIbActive && ibLayout}

        <div className="relative flex h-screen min-h-screen w-full flex-col border-x border-gray-300 bg-white md:max-w-md">
          <div className="scroll-box h-full w-full overflow-scroll">
            <Outlet />
          </div>

          <nav className="flex w-full border-t border-gray-300 bg-white py-1">
            {tabs.map((tab) => {
              const active = [tab.path, ...(tab.extra ?? [])].some((path) => pathname.startsWith(path))
              return tab.hidden ? null : (
                <Link key={tab.path} to={tab.path} className={clsx('bottom-nav-item', active && 'text-slate-600')}>
                  <tab.icon className="stroke-current" />
                  <span>{tab.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
