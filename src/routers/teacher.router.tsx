import { TeacherLayout } from '@/layouts/TeacherLayout'
import { GroupPage } from '@/legacy/pages/admin/group/GroupPage'
import { TimetablePage } from '@/legacy/pages/admin/timetable/TimetablePage'
import CASInterviewDetailPage from '@/legacy/pages/ib/student/CAS/CASInterviewDetailPage'
import { CASMainPage } from '@/legacy/pages/ib/student/CAS/CASMainPage'
import { CASReflectionDiaryDetailPage } from '@/legacy/pages/ib/student/CAS/CASReflectionDiaryDetailPage'
import RRSDetailPage from '@/legacy/pages/ib/student/EE/RRSDetailPage'
import { OutlineDetailPage } from '@/legacy/pages/ib/student/TOK_ESSAY/OutlineDetailPage'
import TKPPFDetailPage from '@/legacy/pages/ib/student/TOK_ESSAY/TKPPFDetailPage'
import { ExhibitionDetailPage } from '@/legacy/pages/ib/student/TOK_EXHIBITION/ExhibitionDetailPage'
import { ExhibitionPlanDetailPage } from '@/legacy/pages/ib/student/TOK_EXHIBITION/ExhibitionPlanDetailPage'
import CASPortfolioPage from '@/legacy/pages/ib/teacher/CAS/CASPortfolioPage'
import { CoordinatorPage } from '@/legacy/pages/ib/teacher/coordinator/CoordinatorPage'
import { EEEssayPage } from '@/legacy/pages/ib/teacher/EE/EEEssayPage'
import { EEProposalDetailPage } from '@/legacy/pages/ib/teacher/EE/EEProposalDetailPage'
import { EERppfDetailPage } from '@/legacy/pages/ib/teacher/EE/EERppfDetailPage'
import { EERppfInterviewDetailPage } from '@/legacy/pages/ib/teacher/EE/EERppfInterviewDetailPage'
import EERrsDetailPage from '@/legacy/pages/ib/teacher/EE/EERrsDetailPage'
import IBTeacherMainPage from '@/legacy/pages/ib/teacher/IBTeacherMainPage'
import { IBTeacherReferenceDetailPage } from '@/legacy/pages/ib/teacher/IBTeacherReferenceDetailPage'
import { EssayDetailPage } from '@/legacy/pages/ib/teacher/TOK_ESSAY/EssayDetailPage'
import { ActivityDetailPage } from '@/legacy/pages/student'
import AnnouncementPage from '@/legacy/pages/student/announcement/AnnouncementPage'
import { CanteenPage } from '@/legacy/pages/student/canteen/CanteenPage'
import { ChatListPage } from '@/legacy/pages/student/chat/ChatListPage'
import { FieldtripNoticePage } from '@/legacy/pages/student/fieldtrip/FieldtripNoticePage'
import { NotificationSettingsPage } from '@/legacy/pages/student/mypage/NotificationSettingsPage'
import { NoticePage } from '@/legacy/pages/student/notice/NoticePage'
import { OutingPage } from '@/legacy/pages/student/outing/OutingPage'
import AbsentComparisonPage from '@/legacy/pages/teacher/absent/AbsentComparisonPage'
import { AbsentPage } from '@/legacy/pages/teacher/absent/AbsentPage'
import { TeacherApplyPage } from '@/legacy/pages/teacher/absent/TeacherApplyPage'
import { ActivityV3AddPage } from '@/legacy/pages/teacher/activityv3/ActivityV3AddPage'
import { ActivityV3DetailPage } from '@/legacy/pages/teacher/activityv3/ActivityV3DetailPage'
import { ActivityV3Page } from '@/legacy/pages/teacher/activityv3/ActivityV3Page'
import { ActivityV3ReportPage } from '@/legacy/pages/teacher/activityv3/ActivityV3ReportPage'
import { ActivityV3SessionAddPage } from '@/legacy/pages/teacher/activityv3/ActivityV3SessionAddPage'
import { ActivityV3SessionDetailPage } from '@/legacy/pages/teacher/activityv3/ActivityV3SessionDetailPage'
import { ActivityV3SessionReportPage } from '@/legacy/pages/teacher/activityv3/ActivityV3SessionReportPage'
import { ActivityV3SessionUpdatePage } from '@/legacy/pages/teacher/activityv3/ActivityV3SessionUpdatePage'
import { ActivityV3UpdatePage } from '@/legacy/pages/teacher/activityv3/ActivityV3UpdatePage'
import { AttendancePage } from '@/legacy/pages/teacher/attendance/AttendancePage'
import { BoardsPage } from '@/legacy/pages/teacher/board/BoardPage'
import { CalendarPage } from '@/legacy/pages/teacher/calendar/CalendarPage'
import { FieldtripMainPage } from '@/legacy/pages/teacher/fieldtrip/FieldtripMainPage'
import { FieldtripResultPage } from '@/legacy/pages/teacher/fieldtrip/FieldtripResultPage'
import { HistoryPage } from '@/legacy/pages/teacher/history/HistoryPage'
import { TeacherFirstLoginPage } from '@/legacy/pages/teacher/login/TeacherFirstLoginPage'
import { TeacherInfoPage } from '@/legacy/pages/teacher/mypage/TeacherInfoPage'
import { TeacherMyPage } from '@/legacy/pages/teacher/mypage/TeacherMyPage'
import { NewsletterPage } from '@/legacy/pages/teacher/newsletter/NewsletterPage'
import { PointDashboard } from '@/legacy/pages/teacher/pointlogs/PointDashboard'
import { RecordPage } from '@/legacy/pages/teacher/record/RecordPage'
import { StudentCardPage } from '@/legacy/pages/teacher/studentcard/StudentCardPage'
import { RoleGuard } from './guard/RoleGuard'

export const teacherRoutes = {
  path: '/teacher',
  element: (
    <RoleGuard>
      <TeacherLayout />
    </RoleGuard>
  ),
  children: [
    // 출석부
    { path: 'attendance', element: <AttendancePage /> },

    // 시간표/출석체크
    { path: 'timetable', element: <TimetablePage /> },

    // 모바일 페이지 > 출결 Home
    { path: 'apply', element: <TeacherApplyPage /> },

    // 확인증
    { path: 'outing', element: <OutingPage /> },

    // 결석신고서
    {
      path: 'absent',
      children: [
        { index: true, element: <AbsentPage /> },
        { path: 'comparison', element: <AbsentComparisonPage /> },
      ],
    },

    // 체험학습
    {
      path: 'fieldtrip',
      children: [
        { index: true, element: <FieldtripMainPage /> },
        { path: 'notice', element: <FieldtripNoticePage /> },
        { path: 'result', element: <FieldtripResultPage /> },
      ],
    },

    // 출결서류관리
    { path: 'history', element: <HistoryPage /> },

    // 학생정보
    { path: 'studentcard', element: <StudentCardPage /> },

    // 생활기록부
    { path: 'record', element: <RecordPage /> },

    // 그룹정보
    { path: 'groups', element: <GroupPage /> },

    // 상벌점관리
    { path: 'pointlogs', element: <PointDashboard /> },

    // 활동기록
    {
      path: 'activityv3',
      children: [
        { index: true, element: <ActivityV3Page /> },
        { path: 'add', element: <ActivityV3AddPage /> },
        {
          path: ':id',
          children: [
            { index: true, element: <ActivityV3DetailPage /> },
            {
              path: 'session',
              children: [
                { path: 'add', element: <ActivityV3SessionAddPage /> },
                {
                  path: ':sessionId',
                  children: [
                    { index: true, element: <ActivityV3SessionDetailPage /> },
                    { path: 'update', element: <ActivityV3SessionUpdatePage /> },
                    { path: ':studentId', element: <ActivityV3SessionReportPage /> },
                  ],
                },
              ],
            },
            { path: 'update', element: <ActivityV3UpdatePage /> },
            { path: ':studentId', element: <ActivityV3ReportPage /> },
          ],
        },
      ],
    },

    // 프로젝트
    { path: 'project', element: <IBTeacherMainPage /> },

    // IB
    {
      path: 'ib',
      children: [
        // CAS 포트폴리오
        {
          path: 'portfolio/:studentId',
          children: [
            { path: 'reflection-diary/:id', element: <CASReflectionDiaryDetailPage /> },
            { path: 'interview/:id/:qnaId', element: <CASInterviewDetailPage /> },
          ],
        },

        // CAS 상세
        {
          path: 'cas',
          children: [
            { path: 'portfolio/:id', element: <CASPortfolioPage /> },
            { path: ':id', element: <CASMainPage /> },
          ],
        },

        // EE
        {
          path: 'ee/:id',
          children: [
            { path: 'proposal/:proposalId', element: <EEProposalDetailPage /> },
            { path: 'essay/:essayId', element: <EEEssayPage /> },
            { path: 'rppf/:rppfId', element: <EERppfDetailPage /> },
            { path: 'interview/:qnaId', element: <EERppfInterviewDetailPage /> },
            { path: 'rrs/:rrsId', element: <EERrsDetailPage /> },
          ],
        },

        // TOK
        {
          path: 'tok',
          children: [
            { path: 'exhibition/:ibId/detail/:exhibitionId', element: <ExhibitionDetailPage /> },
            { path: 'plan/:ibId', element: <ExhibitionPlanDetailPage /> },
            { path: 'essay/:ibId/detail/:essayId', element: <EssayDetailPage /> },
            { path: 'outline/:ibId/detail/:outlineId', element: <OutlineDetailPage /> },
            { path: 'tkppf/:ibId/detail/:tkppfId', element: <TKPPFDetailPage /> },
            { path: 'rrs/:ibId/detail/:rrsId', element: <RRSDetailPage /> },
          ],
        },

        // 프로젝트 관리
        { path: 'coordinatorPage/:type', element: <CoordinatorPage /> },

        // 자료실
        { path: 'reference/:id', element: <IBTeacherReferenceDetailPage /> },
      ],
    },

    // 캘린더
    { path: 'calendar', element: <CalendarPage /> },

    // 급식표
    { path: 'canteen/:date', element: <CanteenPage /> },

    // 공지사항
    { path: 'notice', element: <NoticePage /> },

    // 학급게시판
    { path: 'board', element: <BoardsPage /> },

    // 가정통신문
    { path: 'newsletter', element: <NewsletterPage /> },

    // 메시지
    { path: 'chat', element: <ChatListPage /> },

    // 내 정보
    { path: 'update', element: <TeacherInfoPage /> },

    // 슈퍼스쿨 공지사항
    { path: 'announcement', element: <AnnouncementPage /> },

    // 첫 로그인
    { path: 'first-login', element: <TeacherFirstLoginPage /> },

    // 모바일 페이지 > 더보기
    // 내 정보
    { path: 'mypage', element: <TeacherMyPage /> },

    // 알림 설정
    { path: 'notification-settings', element: <NotificationSettingsPage /> },

    // Deprecated
    { path: 'activity/:id', element: <ActivityDetailPage /> },
  ],
}
