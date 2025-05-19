import { StudentLayout } from '@/layouts/StudentLayout'
import { ScorePage } from '@/legacy/pages/admin/score/ScorePage'
import { NoticeDetailPage, MyInfoPage } from '@/legacy/pages/student'
import { AbsentAddPage } from '@/legacy/pages/student/absent/AbsentAddPage'
import { AbsentDetailPage } from '@/legacy/pages/student/absent/AbsentDetailPage'
import { AbsentPage } from '@/legacy/pages/student/absent/AbsentPage'
import { ApplyPage } from '@/legacy/pages/student/absent/ApplyPage'
import { ActivitySessionDetailPage } from '@/legacy/pages/student/activityv3/ActivitySessionDetailPage'
import { ActivitySessionPage } from '@/legacy/pages/student/activityv3/ActivitySessionPage'
import { ActivityV3Page } from '@/legacy/pages/student/activityv3/ActivityV3Page'
import AnnouncementPage from '@/legacy/pages/student/announcement/AnnouncementPage'
import { BoardDetailPage } from '@/legacy/pages/student/board/BoardDetailPage'
import { CanteenPage } from '@/legacy/pages/student/canteen/CanteenPage'
import { ChatListPage } from '@/legacy/pages/student/chat/ChatListPage'
import { CourseEntrancePage } from '@/legacy/pages/student/courseEntrance/CourseEntrancePage'
import { FieldtripAddPage } from '@/legacy/pages/student/fieldtrip/FieldtripAddPage'
import { FieldtripApprovalPage } from '@/legacy/pages/student/fieldtrip/FieldtripApprovalPage'
import { FieldtripDetailPage } from '@/legacy/pages/student/fieldtrip/FieldtripDetailPage'
import { FieldtripHomeReportAddPage } from '@/legacy/pages/student/fieldtrip/FieldtripHomeReportAddPage'
import { FieldtripNoticePage } from '@/legacy/pages/student/fieldtrip/FieldtripNoticePage'
import { FieldtripPage } from '@/legacy/pages/student/fieldtrip/FieldtripPage'
import { FieldtripResultDetailPage } from '@/legacy/pages/student/fieldtrip/FieldtripResultDetailPage'
import { FieldtripSuburbsReportAddPage } from '@/legacy/pages/student/fieldtrip/FieldtripSuburbsReportAddPage'
import { FieldtripSuburbsReportDetailPage } from '@/legacy/pages/student/fieldtrip/FieldtripSuburbsReportDetailPage'
import { MyPage } from '@/legacy/pages/student/mypage/MyPage'
import { MyStudyPage } from '@/legacy/pages/student/mypage/MyStudyPage'
import { NotificationSettingsPage } from '@/legacy/pages/student/mypage/NotificationSettingsPage'
import { NewsletterDetailPage } from '@/legacy/pages/student/newsletter/NewsletterDetailPage'
import { NoticePage } from '@/legacy/pages/student/notice/NoticePage'
import { NotificationPage } from '@/legacy/pages/student/notification/NotificationPage'
import { OutingAddPage } from '@/legacy/pages/student/outing/OutingAddPage'
import { OutingDetailPage } from '@/legacy/pages/student/outing/OutingDetailPage'
import { OutingPage } from '@/legacy/pages/student/outing/OutingPage'
import { PointLogsPage } from '@/legacy/pages/student/point/PointLogsPage'
import { SelfTestPage } from '@/legacy/pages/student/self-test/SelfTestPage'
import { TimetableDetailPage } from '@/legacy/pages/student/timetable/TimetableDetailPage'
import { RoleGuard } from './guard/RoleGuard'
import { StudentGuard } from './guard/StudentGuard'

export const studentRoutes = {
  path: '/student',
  element: (
    // TODO: 동작 테스트 필요
    // <RoleGuard>
    //   <StudentGuard>
        <StudentLayout />
    //   </StudentGuard>
    // </RoleGuard>
  ),
  children: [
    // 활동
    {
      path: 'activity',
      children: [
        { index: true, element: <ActivityV3Page /> },
        {
          path: ':id',
          children: [
            { index: true, element: <ActivitySessionPage /> },
            { path: 'session/:asid', element: <ActivitySessionDetailPage /> },
          ],
        },
      ],
    },

    // 출결
    { path: 'apply', element: <ApplyPage /> },

    // 확인증
    {
      path: 'outing',
      children: [
        { index: true, element: <OutingPage /> },
        { path: 'add', element: <OutingAddPage /> },
        { path: ':id', element: <OutingDetailPage /> },
      ],
    },

    // 결석신고서
    {
      path: 'absent',
      children: [
        { index: true, element: <AbsentPage /> },
        { path: ':id', element: <AbsentDetailPage /> },
        { path: 'add', element: <AbsentAddPage /> },
      ],
    },

    // 체험학습
    {
      path: 'fieldtrip',
      children: [
        { index: true, element: <FieldtripPage /> },
        {
          path: 'add',
          children: [
            { path: ':type', element: <FieldtripAddPage /> },
            {
              path: 'report',
              children: [
                { path: 'home/:id', element: <FieldtripHomeReportAddPage /> },
                { path: 'suburbs/:id', element: <FieldtripSuburbsReportAddPage /> },
              ],
            },
          ],
        },
        { path: ':id', element: <FieldtripDetailPage /> },
        { path: 'approve/:id', element: <FieldtripApprovalPage /> },
        { path: 'result/:id', element: <FieldtripResultDetailPage /> },
        { path: 'notice/:id', element: <FieldtripNoticePage /> },
        { path: 'detail/report/suburbs', element: <FieldtripSuburbsReportDetailPage /> },
      ],
    },

    // 상벌점기록
    { path: 'pointlogs', element: <PointLogsPage /> },

    // 홈
    // 급식표 (Home)
    { path: 'canteen', element: <CanteenPage /> },

    // 채팅
    { path: 'chat', element: <ChatListPage /> },

    // 시간표
    { path: 'timetable', element: <TimetableDetailPage /> },

    // 알림
    { path: 'notification', element: <NotificationPage /> },

    // 공지
    // 공지사항
    {
      path: 'notice',
      children: [
        { index: true, element: <NoticePage /> },
        { path: ':id', element: <NoticeDetailPage /> },
      ],
    },

    // 학급게시판
    {
      path: 'board',
      children: [
        { index: true, element: <NoticePage /> },
        { path: ':id', element: <BoardDetailPage /> },
      ],
    },

    // 가정통신문
    {
      path: 'newsletter',
      children: [
        { index: true, element: <NoticePage /> },
        { path: ':id', element: <NewsletterDetailPage /> },
      ],
    },

    // 더보기
    // 마이페이지
    { path: 'mypage', element: <MyPage /> },

    // 내정보
    { path: 'info', element: <MyInfoPage /> },

    // 성적확인
    { path: 'score/:id/:type', element: <ScorePage /> },

    // 자기 평가
    { path: 'self-test', element: <SelfTestPage /> },

    // 학습/진로 목표
    { path: 'study', element: <MyStudyPage /> },

    // 알림 설정
    { path: 'notification-settings', element: <NotificationSettingsPage /> },

    // 슈퍼스쿨 공지사항
    { path: 'announcement', element: <AnnouncementPage /> },

    // 수강신청 진입
    { path: 'courseentrance', element: <CourseEntrancePage /> },
  ],
}
