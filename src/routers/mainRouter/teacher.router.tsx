/* eslint-disable import/order */
import { TeacherLayout } from '@/layouts/TeacherLayout'
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
import AbsentComparisonPage from '@/legacy/pages/teacher/absent/AbsentComparisonPage'
import { AbsentPage } from '@/legacy/pages/teacher/absent/AbsentPage'
import { TeacherApplyPage } from '@/legacy/pages/teacher/absent/TeacherApplyPage'
import { ActivityV3AddPage } from '@/legacy/pages/teacher/activityv3/ActivityV3AddPage'
import { ActivityV3DetailPage } from '@/legacy/pages/teacher/activityv3/ActivityV3DetailPage'
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
import { FieldtripNoticePage } from '@/legacy/pages/teacher/fieldtrip/FieldtripNoticePage'
import { CASReflectionDiaryDetailPage } from '@/legacy/pages/ib/teacher/CAS/CASReflectionDiaryDetailPage'
import CASInterviewDetailPage from '@/legacy/pages/ib/teacher/CAS/CASInterviewDetailPage'
import { ExhibitionDetailPage } from '@/legacy/pages/ib/teacher/TOK_EXHIBITION/ExhibitionDetailPage'
import { ExhibitionPlanDetailPage } from '@/legacy/pages/ib/teacher/TOK_EXHIBITION/ExhibitionPlanDetailPage'

import { TKPPFDetailPage } from '@/legacy/pages/ib/teacher/TOK_ESSAY/TKPPFDetailPage'
import RRSDetailPage from '@/legacy/pages/ib/teacher/TOK_ESSAY/RRSDetailPage'
import { ChatListPage } from '@/legacy/pages/teacher/chat/ChatListPage'
import { NoticePage } from '@/legacy/pages/teacher/notice/NoticePage'
import { CanteenPage } from '@/legacy/pages/teacher/canteen/CanteenPage'
import AnnouncementPage from '@/legacy/pages/teacher/announcement/AnnouncementPage'
import { NotificationSettingsPage } from '@/legacy/pages/teacher/mypage/NotificationSettingsPage'
import { ActivityDetailPage } from '@/legacy/pages/teacher/activity/ActivityDetailPage'
import { OutingPage } from '@/legacy/pages/teacher/outing/OutingPage'
import { CASMainPage } from '@/legacy/pages/ib/teacher/CAS/CASMainPage'
import { OutlineDetailPage } from '@/legacy/pages/ib/teacher/TOK_ESSAY/OutlineDetailPage'
import { TimetablePage } from '@/legacy/pages/teacher/timetable/TimetablePage'
import { GroupPage } from '@/legacy/pages/teacher/group/GroupPage'
import { OutingDetailPage } from '@/legacy/pages/teacher/outing/OutingDetailPage'
import { OutingAddPage } from '@/legacy/pages/teacher/outing/OutingAddPage'
import { AbsentAddPage } from '@/legacy/pages/teacher/absent/AbsentAddPage'
import { AbsentDetailPage } from '@/legacy/pages/teacher/absent/AbsentDetailPage'
import { FieldtripDetailPage } from '@/legacy/pages/teacher/fieldtrip/FieldtripDetailPage'
import { FieldtripNoticeDetailPage } from '@/legacy/pages/teacher/fieldtrip/FieldtripNoticeDetailPage'
import { FieldtripResultDetailPage } from '@/legacy/pages/teacher/fieldtrip/FieldtripResultDetailPage'
import { StudentCardDetailPage } from '@/legacy/pages/teacher/studentcard/StudentCardDetailPage'
import { StudyInfoCard2 } from '@/legacy/components/studentCard/StudyInfoCard2'
import { ScoreCardPage } from '@/legacy/pages/teacher/studentcard/ScoreCardPage'
import Counselingv3Card from '@/legacy/components/studentCard/Counselingv3Card'
import { GeneralCardPage } from '@/legacy/pages/teacher/studentcard/GeneralCardPage'
import { AllCardPage } from '@/legacy/pages/teacher/studentcard/AllCardPage'
import { PointLogsPage } from '@/legacy/pages/teacher/studentcard/PointLogsPage'
import { ActivityV3Page } from '@/legacy/pages/teacher/activityv3/ActivityV3Page'

import { ActivityV3Page as ActivityV3CardPage } from '@/legacy/pages/teacher/studentcard/ActivityV3Page'
import { AuthRouter } from '../AuthRouter'
import { AuthGuard } from '../guard/AuthGuard'

export const teacherRoutes = {
  path: '/teacher',
  element: (
    <AuthRouter>
      <AuthGuard>
        <TeacherLayout />
      </AuthGuard>
    </AuthRouter>
  ),
  children: [
    // 출석부
    { path: 'attendance', element: <AttendancePage /> },

    // 시간표/출석체크
    { path: 'timetable', element: <TimetablePage /> },

    // 모바일 페이지 > 출결 Home
    { path: 'apply', element: <TeacherApplyPage /> },

    // 확인증
    {
      path: 'outing',
      element: <OutingPage />,
      children: [
        { path: ':id', element: <OutingDetailPage /> },
        { path: 'add', element: <OutingAddPage /> },
      ],
    },
    // 결석신고서
    {
      path: 'absent',
      element: <AbsentPage />,
      children: [
        { path: ':id', element: <AbsentDetailPage /> },
        { path: 'add', element: <AbsentAddPage /> },
      ],
    },
    { path: 'comparison', element: <AbsentComparisonPage /> },

    // 체험학습
    {
      path: 'fieldtrip/notice',
      element: <FieldtripNoticePage />,
      children: [{ path: ':id', element: <FieldtripNoticeDetailPage /> }],
    },
    {
      path: 'fieldtrip/result',
      element: <FieldtripResultPage />,
      children: [{ path: ':id', element: <FieldtripResultDetailPage /> }],
    },
    {
      path: 'fieldtrip',
      element: <FieldtripMainPage />,
      children: [{ path: ':id', element: <FieldtripDetailPage /> }],
    },

    // 출결서류관리
    { path: 'history', element: <HistoryPage /> },

    // 학생정보
    {
      path: 'studentcard',
      element: <StudentCardPage />,
      children: [
        {
          path: ':groupId',
          element: <StudentCardDetailPage />,
          children: [
            { path: ':id/all', element: <StudyInfoCard2 /> },
            { path: ':id/activityv3', element: <ActivityV3CardPage /> },
            { path: ':id/score', element: <ScoreCardPage /> },
            { path: ':id/counseling', element: <Counselingv3Card /> },
            { path: ':id/general', element: <GeneralCardPage /> },
            { path: ':id/default', element: <AllCardPage /> },
            { path: ':id/pointlogs', element: <PointLogsPage /> },
          ],
        },
      ],
    },

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
    { path: 'notice/*', element: <NoticePage /> },
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
