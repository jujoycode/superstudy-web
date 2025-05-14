import clsx from 'clsx'
import { useMemo } from 'react'
import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { useHistory } from '@/hooks/useHistory'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { Toast } from '@/legacy/components/Toast'
import { Role } from '@/legacy/generated/model'
import { AbsentAddPage } from '@/legacy/pages/student/absent/AbsentAddPage'
import { AbsentDetailPage } from '@/legacy/pages/student/absent/AbsentDetailPage'
import { AbsentPage } from '@/legacy/pages/student/absent/AbsentPage'
import { useAuth } from '@/legacy/util/hooks'
import { PermissionUtil } from '@/legacy/util/permission'
import { childState } from '@/stores'
import { ActivitySessionDetailPage } from './activityv3/ActivitySessionDetailPage'
import { ActivitySessionPage } from './activityv3/ActivitySessionPage'
import { ActivityV3Page } from './activityv3/ActivityV3Page'
import AnnouncementPage from './announcement/AnnouncementPage'
import { BoardDetailPage } from './board/BoardDetailPage'
import { CanteenPage } from './canteen/CanteenPage'
import { ChatListPage } from './chat/ChatListPage'
import { CourseEntrancePage } from './courseEntrance/CourseEntrancePage'
import { FieldtripAddPage } from './fieldtrip/FieldtripAddPage'
import { FieldtripApprovalPage } from './fieldtrip/FieldtripApprovalPage'
import { FieldtripDetailPage } from './fieldtrip/FieldtripDetailPage'
import { FieldtripHomeReportAddPage } from './fieldtrip/FieldtripHomeReportAddPage'
import { FieldtripNoticePage } from './fieldtrip/FieldtripNoticePage'
import { FieldtripPage } from './fieldtrip/FieldtripPage'
import { FieldtripResultDetailPage } from './fieldtrip/FieldtripResultDetailPage'
import { FieldtripSuburbsReportAddPage } from './fieldtrip/FieldtripSuburbsReportAddPage'
import { FieldtripSuburbsReportDetailPage } from './fieldtrip/FieldtripSuburbsReportDetailPage'
import { MyInfoPage } from './mypage/MyInfoPage'
import { MyPage } from './mypage/MyPage'
import { MyStudyPage } from './mypage/MyStudyPage'
import { NotificationSettingsPage } from './mypage/NotificationSettingsPage'
import { NewsletterDetailPage } from './newsletter/NewsletterDetailPage'
import { NoticeDetailPage } from './notice/NoticeDetailPage'
import { NoticePage } from './notice/NoticePage'
import { NotificationPage } from './notification/NotificationPage'
import { OutingAddPage } from './outing/OutingAddPage'
import { OutingDetailPage } from './outing/OutingDetailPage'
import { OutingPage } from './outing/OutingPage'
import { PointLogsPage } from './point/PointLogsPage'
import { ScorePage } from './score/ScorePage'
import { SelfTestPage } from './self-test/SelfTestPage'
import { TimetableDetailPage } from './timetable/TimetableDetailPage'
import { ReactComponent as Logo } from '@/assets/svg/logo.svg'
import { ApplyPage } from '@/legacy/pages/teacher/absent/ApplyPage'
import { useUserStore } from '@/stores2/user'

export function StudentMainPage() {
  const { replace } = useHistory()
  const { me } = useUserStore()
  const myChild = useRecoilValue(childState)
  const { pathname } = useLocation()
  const { authenticated } = useAuth()
  const { push } = useHistory()

  if (PermissionUtil.isNotStudentNotParent(me?.role)) {
    replace('/teacher')
  } else {
    if (me?.role === Role.USER && me?.firstVisit) {
      replace('/first-login')
    }
  }

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
    [me?.role, authenticated],
  )

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#FAFAFA] md:space-x-4">
      <div className="mx:flex hidden flex-col items-center justify-center space-y-4">
        <Logo className="w-64" />
        <span className="text-sm">
          학교를 쉽고 빠르게, <b>슈퍼스쿨!</b>
        </span>
        {me?.school.isIbActive && (
          <Button.lg className="rounded-md border border-gray-300 font-normal" onClick={() => push('/ib/student')}>
            슈퍼스쿨 IB 바로가기
          </Button.lg>
        )}
      </div>
      <div className="relative flex h-screen min-h-screen w-full flex-col border-x border-gray-300 bg-white md:max-w-md">
        <div className="scroll-box h-full w-full overflow-scroll">
          <Routes>
            <Route path="/student/notice/:id" Component={NoticeDetailPage} />
            <Route path="/student/board/:id" Component={BoardDetailPage} />
            <Route path="/student/notification" Component={NotificationPage} />
            <Route path="/student/newsletter/:id" Component={NewsletterDetailPage} />
            <Route path="/student/fieldtrip/notice/:id" Component={FieldtripNoticePage} />
            <Route path="/student/fieldtrip/result/:id" Component={FieldtripResultDetailPage} />
            <Route path="/student/fieldtrip/add/report/suburbs/:id" Component={FieldtripSuburbsReportAddPage} />
            <Route path="/student/fieldtrip/add/report/home/:id" Component={FieldtripHomeReportAddPage} />
            <Route path="/student/fieldtrip/detail/report/suburbs" Component={FieldtripSuburbsReportDetailPage} />
            <Route path="/student/fieldtrip/add/:type" Component={FieldtripAddPage} />
            <Route path="/student/fieldtrip/approve/:id" Component={FieldtripApprovalPage} />
            <Route path="/student/fieldtrip/:id" Component={FieldtripDetailPage} />
            <Route path="/student/fieldtrip" Component={FieldtripPage} />
            <Route path="/student/absent/add" Component={AbsentAddPage} />
            <Route path="/student/absent/:id" Component={AbsentDetailPage} />
            <Route path="/student/absent" Component={AbsentPage} />
            <Route path="/student/pointlogs" Component={PointLogsPage} />
            <Route path="/student/apply" Component={ApplyPage} />
            <Route path="/student/activity/:id/session/:asid" Component={ActivitySessionDetailPage} />
            <Route path="/student/activity/:id" Component={ActivitySessionPage} />
            <Route path="/student/activity" Component={ActivityV3Page} />
            <Route path="/student/canteen" Component={CanteenPage} />
            <Route path="/student/courseentrance" Component={CourseEntrancePage} />
            <Route path="/student/timetable" Component={TimetableDetailPage} />
            <Route path="/student/mypage" Component={MyPage} />
            <Route path="/student/info" Component={MyInfoPage} />
            <Route path="/student/study" Component={MyStudyPage} />
            <Route path="/student/notice" Component={NoticePage} />
            <Route path="/student/board" Component={NoticePage} />
            <Route path="/student/newsletter" Component={NoticePage} />
            <Route path="/student/outing/add" Component={OutingAddPage} />
            <Route path="/student/outing/:id" Component={OutingDetailPage} />
            <Route path="/student/outing" Component={OutingPage} />
            <Route path="/student/chat" Component={ChatListPage} />
            <Route path="/student/announcement" Component={AnnouncementPage} />
            <Route path="/student/self-test" Component={SelfTestPage} />
            <Route path="/student/notification-settings" Component={NotificationSettingsPage} />
            <Route path="/student/score/:id/:type" Component={ScorePage} />
            <Route path="/student">
              {me?.school.isCourseActive || myChild?.school.isCourseActive ? (
                <Navigate to="/student/courseentrance" />
              ) : (
                <Navigate to="/student/canteen" />
              )}
            </Route>
          </Routes>
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

        <Toast />
      </div>
    </div>
  )
}
