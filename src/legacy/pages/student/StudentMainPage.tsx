import clsx from 'clsx'
import { useMemo } from 'react'
import { Link, Redirect, Route, Switch, useHistory, useLocation } from 'react-router'
import { useRecoilValue } from 'recoil'
import { ReactComponent as Logo } from '@/legacy/assets/svg/logo.svg'
import { Toast } from '@/legacy/components/Toast'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { Role } from '@/legacy/generated/model'
import { childState, meState } from '@/stores'
import { useAuth } from '@/legacy/util/hooks'
import { PermissionUtil } from '@/legacy/util/permission'
import { AbsentAddPage } from './absent/AbsentAddPage'
import { AbsentDetailPage } from './absent/AbsentDetailPage'
import { AbsentPage } from './absent/AbsentPage'
import { ApplyPage } from './absent/ApplyPage'
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

export function StudentMainPage() {
  const { replace } = useHistory()
  const me = useRecoilValue(meState)
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
    // else if (me?.school.isCourseActive || myChild?.school.isCourseActive) {
    //   replace('/student/courseentrance');
    // }
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
          <Switch>
            <Route path="/student/notice/:id" component={NoticeDetailPage} />
            <Route path="/student/board/:id" component={BoardDetailPage} />
            <Route path="/student/notification" component={NotificationPage} />
            <Route path="/student/newsletter/:id" component={NewsletterDetailPage} />
            <Route path="/student/fieldtrip/notice/:id" component={FieldtripNoticePage} />
            <Route path="/student/fieldtrip/result/:id" component={FieldtripResultDetailPage} />
            <Route path="/student/fieldtrip/add/report/suburbs/:id" component={FieldtripSuburbsReportAddPage} />
            <Route path="/student/fieldtrip/add/report/home/:id" component={FieldtripHomeReportAddPage} />
            <Route path="/student/fieldtrip/detail/report/suburbs" component={FieldtripSuburbsReportDetailPage} />
            <Route path="/student/fieldtrip/add/:type" component={FieldtripAddPage} />
            <Route path="/student/fieldtrip/approve/:id" component={FieldtripApprovalPage} />
            <Route path="/student/fieldtrip/:id" component={FieldtripDetailPage} />
            <Route path="/student/fieldtrip" component={FieldtripPage} />
            <Route path="/student/absent/add" component={AbsentAddPage} />
            <Route path="/student/absent/:id" component={AbsentDetailPage} />
            <Route path="/student/absent" component={AbsentPage} />
            <Route path="/student/pointlogs" component={PointLogsPage} />
            <Route path="/student/apply" component={ApplyPage} />
            <Route path="/student/activity/:id/session/:asid" component={ActivitySessionDetailPage} />
            <Route path="/student/activity/:id" component={ActivitySessionPage} />
            <Route path="/student/activity" component={ActivityV3Page} />
            <Route path="/student/canteen" component={CanteenPage} />
            <Route path="/student/courseentrance" component={CourseEntrancePage} />
            <Route path="/student/timetable" component={TimetableDetailPage} />
            <Route path="/student/mypage" component={MyPage} />
            <Route path="/student/info" component={MyInfoPage} />
            <Route path="/student/study" component={MyStudyPage} />
            <Route path="/student/notice" component={NoticePage} />
            <Route path="/student/board" component={NoticePage} />
            <Route path="/student/newsletter" component={NoticePage} />
            <Route path="/student/outing/add" component={OutingAddPage} />
            <Route path="/student/outing/:id" component={OutingDetailPage} />
            <Route path="/student/outing" component={OutingPage} />
            <Route path="/student/chat" component={ChatListPage} />
            <Route path="/student/announcement" component={AnnouncementPage} />
            <Route path="/student/self-test" component={SelfTestPage} />
            <Route path="/student/notification-settings" component={NotificationSettingsPage} />
            <Route path="/student/score/:id/:type" component={ScorePage} />
            <Route path="/student">
              {me?.school.isCourseActive || myChild?.school.isCourseActive ? (
                <Redirect to="/student/courseentrance" />
              ) : (
                <Redirect to="/student/canteen" />
              )}
            </Route>
          </Switch>
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
