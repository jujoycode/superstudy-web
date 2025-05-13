import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { AuthGuard } from './guard/AuthGuard'

// Home
// import { HomePage } from '@/legacy/pages/HomePage'

// admin
import { ApprovalLinePage } from '@/legacy/pages/admin/approval-line/ApprovalLinePage'
import { ExpiredUserPage } from '@/legacy/pages/admin/expired-user/ExpiredUserPage'
import { GroupEditPage } from '@/legacy/pages/admin/group/GroupEditPage'
import { GroupPage } from '@/legacy/pages/admin/group/GroupPage'
import { IbCoordinatorPage } from '@/legacy/pages/admin/ib/IbCoordinatorPage'
import { IbPage } from '@/legacy/pages/admin/ib/IbPage'
import { IbStudentPage } from '@/legacy/pages/admin/ib/ibStudentPage'
import { KlassEditPage } from '@/legacy/pages/admin/klass/KlassEditPage'
import { KlassPage } from '@/legacy/pages/admin/klass/KlassPage'
import { ParentDetailsPage } from '@/legacy/pages/admin/parent/ParentDetailsPage'
import { ParentEditPage } from '@/legacy/pages/admin/parent/ParentEditPage'
import { ParentPage } from '@/legacy/pages/admin/parent/ParentPage'
import { PointDetailsPage } from '@/legacy/pages/admin/point/PointDetailsPage'
import { PointEditPage } from '@/legacy/pages/admin/point/PointEditPage'
import { PointPage } from '@/legacy/pages/admin/point/PointPage'
import { SchoolPage } from '@/legacy/pages/admin/school/SchoolPage'
import { ScorePage } from '@/legacy/pages/admin/score/ScorePage'
import { SmsPage } from '@/legacy/pages/admin/sms/SmsPage'
import { StudentBatchAdvancePage } from '@/legacy/pages/admin/student/StudentBatchAdvancePage'
import { StudentBatchPage } from '@/legacy/pages/admin/student/StudentBatchPage'
import { StudentDetailsPage } from '@/legacy/pages/admin/student/StudentDetailsPage'
import { StudentEditPage } from '@/legacy/pages/admin/student/StudentEditPage'
import { StudentPage } from '@/legacy/pages/admin/student/StudentPage'
import { StudentPhotosPage } from '@/legacy/pages/admin/student/StudentPhotosPage'
import { TeacherBatchPage } from '@/legacy/pages/admin/teacher/TeacherBatchPage'
import { TeacherDetailsPage } from '@/legacy/pages/admin/teacher/TeacherDetailsPage'
import { TeacherEditPage } from '@/legacy/pages/admin/teacher/TeacherEditPage'
import { TeacherPage } from '@/legacy/pages/admin/teacher/TeacherPage'
import { TimetablePage } from '@/legacy/pages/admin/timetable/TimetablePage'

// plagiarismInspect
// import DetailResultPopup from '@/legacy/pages/plagiarismInspect/DetailResultPopup'
// import { CoordinatorPreviewPage } from '@/legacy/pages/ib/teacher/coordinator/CoordinatorPreviewPage'
// import { NoticeDetailPage, MyInfoPage, ActivityDetailPage } from '@/legacy/pages/student'

import { AbsentAddPage } from '@/legacy/pages/student/absent/AbsentAddPage'
import { AbsentApprovalPage } from '@/legacy/pages/student/absent/AbsentApprovalPage'
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

// student
import { SelectSchool } from '@/legacy/pages/student/login/SelectSchool'
import { CourseEntrancePage } from '@/legacy/pages/student/courseEntrance/CourseEntrancePage'
// import { ConsentForPromotionalAndMarketingPurposes } from '@/legacy/pages/student/ConsentForPromotionalAndMarketingPurposes'
// import { ConsentToProvidePersonalInformationToThirdParties } from '@/legacy/pages/student/ConsentToProvidePersonalInformationToThirdParties'
// import { ConsentToUseOfPersonalInformation } from '@/legacy/pages/student/ConsentToUseOfPersonalInformation'
// import { FieldtripAddPage } from '@/legacy/pages/student/fieldtrip/FieldtripAddPage'
// import { FieldtripApprovalPage } from '@/legacy/pages/student/fieldtrip/FieldtripApprovalPage'
// import { FieldtripDetailPage } from '@/legacy/pages/student/fieldtrip/FieldtripDetailPage'
// import { FieldtripHomeReportAddPage } from '@/legacy/pages/student/fieldtrip/FieldtripHomeReportAddPage'
// import { FieldtripNoticePage } from '@/legacy/pages/student/fieldtrip/FieldtripNoticePage'
// import { FieldtripPage } from '@/legacy/pages/student/fieldtrip/FieldtripPage'
// import { FieldtripParentNoticePage } from '@/legacy/pages/student/fieldtrip/FieldtripParentNoticePage'
// import { FieldtripResultApprovalPage } from '@/legacy/pages/student/fieldtrip/FieldtripResultApprovalPage'
// import { FieldtripResultDetailPage } from '@/legacy/pages/student/fieldtrip/FieldtripResultDetailPage'
// import { FieldtripSuburbsReportAddPage } from '@/legacy/pages/student/fieldtrip/FieldtripSuburbsReportAddPage'
// import { FieldtripSuburbsReportDetailPage } from '@/legacy/pages/student/fieldtrip/FieldtripSuburbsReportDetailPage'
// import { AboutSuperSchoolPage } from '@/legacy/pages/student/login/AboutSuperSchool'
// import { FirstLoginPage } from '@/legacy/pages/student/login/FirstLoginPage'
// import { LoginV2 } from '@/legacy/pages/student/login/LoginPageV2'
// import { Signup } from '@/legacy/pages/student/login/Signup'
// import { TwoFactor } from '@/legacy/pages/student/login/TwoFactor'
// import { MyPage } from '@/legacy/pages/student/mypage/MyPage'
// import { MyStudyPage } from '@/legacy/pages/student/mypage/MyStudyPage'
// import { NotificationSettingsPage } from '@/legacy/pages/student/mypage/NotificationSettingsPage'
// import { NewsletterDetailPage } from '@/legacy/pages/student/newsletter/NewsletterDetailPage'
// import { StudentNewsletterApprovalPage } from '@/legacy/pages/student/newsletter/StudentNewsletterApprovalPage'
// import { NoticePage } from '@/legacy/pages/student/notice/NoticePage'
// import { NotificationPage } from '@/legacy/pages/student/notification/NotificationPage'
// import { OutingAddPage } from '@/legacy/pages/student/outing/OutingAddPage'
// import { OutingApprovalPage } from '@/legacy/pages/student/outing/OutingApprovalPage'
// import { OutingDetailPage } from '@/legacy/pages/student/outing/OutingDetailPage'
// import { OutingPage } from '@/legacy/pages/student/outing/OutingPage'
// import { AddChildrenPage } from '@/legacy/pages/student/parent/AddChildrenPage'
// import { ParentSignupPage } from '@/legacy/pages/student/parent/ParentSignupPage'
// import { FindIdPageV2 } from '@/legacy/pages/student/password/FindIdPageV2'
// import { FindPasswordPageV2 } from '@/legacy/pages/student/password/FindPasswordPageV2'
// import { ResetPasswordPageV1 } from '@/legacy/pages/student/password/ResetPasswordPageV1'
// import { PointLogsPage } from '@/legacy/pages/student/point/PointLogsPage'
// import { PrivacyPolicy } from '@/legacy/pages/student/PrivacyPolicy'
// import { SelfTestPage } from '@/legacy/pages/student/self-test/SelfTestPage'
// import { TermsOfUse } from '@/legacy/pages/student/TermsOfUse'
// import { TimetableDetailPage } from '@/legacy/pages/student/timetable/TimetableDetailPage'
// import { StudentRedirect } from '@/legacy/pages/student/StudentRedirect'

// ib
import CASInterviewDetailPage from '@/legacy/pages/ib/student/CAS/CASInterviewDetailPage'
import { CASMainPage } from '@/legacy/pages/ib/student/CAS/CASMainPage'
import { CASReflectionDiaryDetailPage } from '@/legacy/pages/ib/student/CAS/CASReflectionDiaryDetailPage'
import RRSDetailPage from '@/legacy/pages/ib/student/EE/RRSDetailPage'
import { OutlineDetailPage } from '@/legacy/pages/ib/student/TOK_ESSAY/OutlineDetailPage'
import TKPPFDetailPage from '@/legacy/pages/ib/student/TOK_ESSAY/TKPPFDetailPage'
import { ExhibitionDetailPage } from '@/legacy/pages/ib/student/TOK_EXHIBITION/ExhibitionDetailPage'
import { ExhibitionPlanDetailPage } from '@/legacy/pages/ib/student/TOK_EXHIBITION/ExhibitionPlanDetailPage'
// import CASPortfolioPage from '@/legacy/pages/ib/teacher/CAS/CASPortfolioPage'
// import { CoordinatorPage } from '@/legacy/pages/ib/teacher/coordinator/CoordinatorPage'
// import { EEEssayPage } from '@/legacy/pages/ib/teacher/EE/EEEssayPage'
// import { EEProposalDetailPage } from '@/legacy/pages/ib/teacher/EE/EEProposalDetailPage'
// import { EERppfDetailPage } from '@/legacy/pages/ib/teacher/EE/EERppfDetailPage'
// import { EERppfInterviewDetailPage } from '@/legacy/pages/ib/teacher/EE/EERppfInterviewDetailPage'
// import EERrsDetailPage from '@/legacy/pages/ib/teacher/EE/EERrsDetailPage'
// import IBTeacherMainPage from '@/legacy/pages/ib/teacher/IBTeacherMainPage'
// import { IBTeacherReferenceDetailPage } from '@/legacy/pages/ib/teacher/IBTeacherReferenceDetailPage'
// import { EssayDetailPage } from '@/legacy/pages/ib/teacher/TOK_ESSAY/EssayDetailPage'

import AbsentComparisonPage from '@/legacy/pages/teacher/absent/AbsentComparisonPage'
import { TeacherApplyPage } from '@/legacy/pages/teacher/absent/TeacherApplyPage'

// teacher
// import { ActivityV3AddPage } from '@/legacy/pages/teacher/activityv3/ActivityV3AddPage'
// import { ActivityV3ReportPage } from '@/legacy/pages/teacher/activityv3/ActivityV3ReportPage'
// import { ActivityV3SessionAddPage } from '@/legacy/pages/teacher/activityv3/ActivityV3SessionAddPage'
// import { ActivityV3SessionReportPage } from '@/legacy/pages/teacher/activityv3/ActivityV3SessionReportPage'
// import { ActivityV3SessionUpdatePage } from '@/legacy/pages/teacher/activityv3/ActivityV3SessionUpdatePage'
// import { ActivityV3UpdatePage } from '@/legacy/pages/teacher/activityv3/ActivityV3UpdatePage'
// import { AttendancePage } from '@/legacy/pages/teacher/attendance/AttendancePage'
// import { BoardsPage } from '@/legacy/pages/teacher/board/BoardPage'
// import { CalendarPage } from '@/legacy/pages/teacher/calendar/CalendarPage'
// import { FieldtripResultPage } from '@/legacy/pages/teacher/fieldtrip/FieldtripResultPage'
// import { HistoryPage } from '@/legacy/pages/teacher/history/HistoryPage'
// import { LoginPage } from '@/legacy/pages/teacher/login/LoginPage'
// import { TeacherInfoPage } from '@/legacy/pages/teacher/mypage/TeacherInfoPage'
// import { TeacherMyPage } from '@/legacy/pages/teacher/mypage/TeacherMyPage'
// import { NewsletterPage } from '@/legacy/pages/teacher/newsletter/NewsletterPage'
// import { PointDashboard } from '@/legacy/pages/teacher/pointlogs/PointDashboard'
// import { RecordPage } from '@/legacy/pages/teacher/record/RecordPage'
// import { StudentCardPage } from '@/legacy/pages/teacher/studentcard/StudentCardPage'
// import { TeacherFirstLoginPage } from '@/legacy/pages/teacher/login/TeacherFirstLoginPage'

import { EeEssayDetailPage } from '@/legacy/pages/ib/student/EE/EeEssayDetailPage'
import { EEMainPage } from '@/legacy/pages/ib/student/EE/EEMainPage'
import InterviewDetailPage from '@/legacy/pages/ib/student/EE/InterviewDetailPage'
import { ProposalDetailPage } from '@/legacy/pages/ib/student/EE/ProposalDetailPage'
import RPPFDetailPage from '@/legacy/pages/ib/student/EE/RPPFDetailPage'
import { IBStudentReferenceDetailPage } from '@/legacy/pages/ib/student/IBStudentReferenceDetailPage'
import { IBStudentReferencePage } from '@/legacy/pages/ib/student/IBStudentReferencePage'
import { EssayMainPage } from '@/legacy/pages/ib/student/TOK_ESSAY/EssayMainPage'
import { TOKEssayDetailPage } from '@/legacy/pages/ib/student/TOK_ESSAY/TOKEssayDetailPage'
import TOKRRSDetailPage from '@/legacy/pages/ib/student/TOK_ESSAY/TOKRRSDetailPage'
import { ExhibitionMainPage } from '@/legacy/pages/ib/student/TOK_EXHIBITION/ExhibitionMainPage'
import PlagiarismInspectPage from '@/legacy/pages/plagiarismInspect/student/PlagiarismInspectPage'

/**
 * Router
 * @desc Super School 전체 라우터
 * @author Suh Jihun
 */
export const routers: RouteObject[] = [
  {
    path: '/',
    // element: <HomePage />,
    index: true,
  },
  {
    path: '/two-factor',
    // element: <AuthGuard path="/two-factor" component={TwoFactor} />,
  },
  {
    path: '/terms-of-use',
    // element: <TermsOfUse />,
  },
  {
    path: '/privacy-policy/:schoolId',
    // element: <PrivacyPolicy />,
  },
  {
    path: '/reference/preview',
    // element: <CoordinatorPreviewPage />,
  },
  {
    path: '/consent-to-use-of-personal-information',
    // element: <ConsentToUseOfPersonalInformation />,
  },
  {
    path: '/consent-to-provide-personal-information-to-third-parties',
    // element: <ConsentToProvidePersonalInformationToThirdParties />,
  },
  {
    path: '/consent-for-promotional-and-marketing-purposes',
    // element: <ConsentForPromotionalAndMarketingPurposes />,
  },
  {
    path: '/fieldtrip/result/approve/:uuid',
    // element: <FieldtripResultApprovalPage />,
  },
  {
    path: '/fieldtrip/approve/:uuid',
    // element: <FieldtripApprovalPage />,
  },
  {
    path: '/fieldtrip/parent/notice/:uuid',
    // element: <FieldtripParentNoticePage />,
  },
  {
    path: '/studentnewsletter/approve/:uuid',
    // element: <StudentNewsletterApprovalPage />,
  },
  {
    path: '/absent/approve/:uuid',
    // element: <AbsentApprovalPage />,
  },
  {
    path: '/outing/approve/:uuid',
    // element: <OutingApprovalPage />,
  },
  {
    path: '/admin',
    // element: <AuthGuard>{/* <AdminLayout /> */}</AuthGuard>,
    children: [
      { path: '/school', element: <SchoolPage /> },
      {
        path: '/teacher',
        children: [
          { index: true, element: <TeacherPage /> },
          {
            path: '/:id',
            children: [
              { index: true, element: <TeacherDetailsPage /> },
              { path: '/edit', element: <TeacherEditPage /> },
            ],
          },
          { path: '/new', element: <TeacherEditPage /> },
          {
            path: '/batch/new',
            element: <TeacherBatchPage />,
          },
        ],
      },
      {
        path: '/student',
        children: [
          { index: true, element: <StudentPage /> },
          {
            path: '/batch',
            children: [
              { path: '/new', element: <StudentBatchPage /> },
              { path: '/advance', element: <StudentBatchAdvancePage /> },
            ],
          },
          { path: '/photos', element: <StudentPhotosPage /> },
          { path: '/new', element: <StudentEditPage /> },
          {
            path: '/:id',
            children: [
              { index: true, element: <StudentDetailsPage /> },
              { path: '/edit', element: <StudentEditPage /> },
            ],
          },
        ],
      },
      {
        path: '/parent',
        children: [
          { index: true, element: <ParentPage /> },
          {
            path: '/:id',
            children: [
              { index: true, element: <ParentDetailsPage /> },
              { path: '/edit', element: <ParentEditPage /> },
            ],
          },
        ],
      },
      { path: '/expired-user', element: <ExpiredUserPage /> },
      {
        path: '/class',
        children: [
          { index: true, element: <KlassPage /> },
          { path: '/new', element: <KlassEditPage /> },
          { path: '/:id', element: <KlassPage /> },
        ],
      },
      {
        path: '/group',
        children: [
          { index: true, element: <GroupPage /> },
          { path: '/new', element: <GroupEditPage /> },
          { path: '/:id', element: <GroupPage /> },
        ],
      },
      { path: '/approval-line', element: <ApprovalLinePage /> },
      { path: '/timetable', element: <TimetablePage /> },
      { path: 'sms', element: <SmsPage /> },
      { path: 'score', element: <ScorePage /> },
      {
        path: '/ib',
        children: [
          { index: true, element: <IbPage /> },
          { path: '/student', element: <IbStudentPage /> },
          { path: '/teacher', element: <IbCoordinatorPage /> },
        ],
      },
      {
        path: '/point',
        children: [
          { index: true, element: <PointPage /> },
          { path: '/new', element: <PointEditPage /> },
          {
            path: '/:id',
            children: [
              { index: true, element: <PointDetailsPage /> },
              { path: '/edit', element: <PointEditPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/student',
    // element: <AuthGuard>{/* <StudentLayout /> */}</AuthGuard>,
    // children: [
    //   {
    //     path: '/notice',
    //     children: [
    //       { index: true, element: <NoticePage /> },
    //       { path: '/:id', element: <NoticeDetailPage /> },
    //     ],
    //   },
    //   {
    //     path: '/board',
    //     children: [
    //       { index: true, element: <NoticePage /> },
    //       { path: '/:id', element: <BoardDetailPage /> },
    //     ],
    //   },
    //   { path: '/notification', element: <NotificationPage /> },
    //   {
    //     path: '/activity',
    //     children: [
    //       { index: true, element: <ActivityV3Page /> },
    //       {
    //         path: '/:id',
    //         children: [
    //           { index: true, element: <ActivitySessionPage /> },
    //           { path: '/session/:asid', element: <ActivitySessionDetailPage /> },
    //         ],
    //       },
    //     ],
    //   },
    //   {
    //     path: '/newsletter',
    //     children: [
    //       { index: true, element: <NoticePage /> },
    //       { path: '/:id', element: <NewsletterDetailPage /> },
    //     ],
    //   },
    //   {
    //     path: '/absent',
    //     children: [
    //       { index: true, element: <AbsentPage /> },
    //       { path: '/:id', element: <AbsentDetailPage /> },
    //       { path: '/add', element: <AbsentAddPage /> },
    //     ],
    //   },
    //   {
    //     path: '/fieldtrip',
    //     children: [
    //       { index: true, element: <FieldtripPage /> },
    //       { path: '/:id', element: <FieldtripDetailPage /> },
    //       {
    //         path: '/add',
    //         children: [
    //           { path: '/:type', element: <FieldtripAddPage /> },
    //           {
    //             path: '/report',
    //             children: [
    //               { path: '/home/:id', element: <FieldtripHomeReportAddPage /> },
    //               { path: '/suburbs/:id', element: <FieldtripSuburbsReportAddPage /> },
    //             ],
    //           },
    //         ],
    //       },
    //       { path: '/approve/:id', element: <FieldtripApprovalPage /> },
    //       { path: '/result/:id', element: <FieldtripResultDetailPage /> },
    //       { path: '/notice/:id', element: <FieldtripNoticePage /> },
    //       { path: '/detail/report/suburbs', element: <FieldtripSuburbsReportDetailPage /> },
    //     ],
    //   },
    //   {
    //     path: '/outing',
    //     children: [
    //       { index: true, element: <OutingPage /> },
    //       { path: '/:id', element: <OutingDetailPage /> },
    //       { path: '/add', element: <OutingAddPage /> },
    //     ],
    //   },
    //   { path: '/apply', element: <ApplyPage /> },
    //   { path: '/canteen', element: <CanteenPage /> },
    //   { path: '/courseentrance', element: <CourseEntrancePage /> },
    //   { path: '/timetable', element: <TimetableDetailPage /> },
    //   { path: '/mypage', element: <MyPage /> },
    //   { path: '/info', element: <MyInfoPage /> },
    //   { path: '/study', element: <MyStudyPage /> },
    //   { path: '/chat', element: <ChatListPage /> },
    //   { path: '/announcement', element: <AnnouncementPage /> },
    //   { path: '/self-test', element: <SelfTestPage /> },
    //   { path: '/notification-settings', element: <NotificationSettingsPage /> },
    //   { path: '/pointlogs', element: <PointLogsPage /> },
    //   { path: '/score/:id/:type', element: <ScorePage /> },
    //   {
    //     index: true,
    //     element: <StudentRedirect />,
    //   },
    // ],
  },
  {
    path: '/teacher',
    // element: <AuthGuard>{/* <TeacherLayout/> */}</AuthGuard>,
    children: [
      { path: '/canteen', element: <CanteenPage /> },
      { path: '/timetable', element: <TimetablePage /> },
      // { path: '/attendance', element: <AttendancePage /> },
      { path: '/absent/comparison', element: <AbsentComparisonPage /> },
      // { path: '/history', element: <HistoryPage /> },
      // { path: '/update', element: <TeacherInfoPage /> },
      // { path: '/first-login', element: <TeacherFirstLoginPage /> },
      {
        path: '/fieldtrip',
        children: [
          // { path: '/notice', element: <FieldtripNoticePage /> },
          // { path: '/result', element: <FieldtripResultPage /> },
        ],
      },
      // { path: '/board', element: <BoardsPage /> },
      { path: '/chat', element: <ChatListPage /> },
      // { path: '/calendar', element: <CalendarPage /> },
      // { path: '/project', element: <IBTeacherMainPage /> },
      {
        path: '/ib',
        children: [
          {
            path: '/portfolio/:studentId',
            children: [
              {
                path: '/reflection-diary/:id',
                element: <CASReflectionDiaryDetailPage />,
              },
              {
                path: '/interview/:id/:qnaId',
                element: <CASInterviewDetailPage />,
              },
            ],
          },
          {
            path: '/cas',
            children: [
              // { path: '/portfolio/:id', element: <CASPortfolioPage /> },
              { path: '/:id', element: <CASMainPage /> },
            ],
          },
          {
            path: '/ee/:id',
            children: [
              {
                path: '/proposal/:proposalId',
                // element: <EEProposalDetailPage />,
              },
              // { path: '/essay/:essayId', element: <EEEssayPage /> },
              // { path: '/rppf/:rppfId', element: <EERppfDetailPage /> },
              {
                path: '/interview/:qnaId',
                // element: <EERppfInterviewDetailPage />,
              },
              // { path: '/rrs/:rrsId', element: <EERrsDetailPage /> },
            ],
          },
          // { path: '/coordinatorPage/:type', element: <CoordinatorPage /> },
          // { path: '/reference/:id', element: <IBTeacherReferenceDetailPage /> },
          {
            path: '/tok',
            children: [
              {
                path: '/exhibition/:ibId/detail/:exhibitionId',
                element: <ExhibitionDetailPage />,
              },
              { path: '/plan/:ibId', element: <ExhibitionPlanDetailPage /> },
              {
                path: '/essay/:ibId/detail/:essayId',
                // element: <EssayDetailPage />,
              },
              {
                path: '/outline/:ibId/detail/:outlineId',
                element: <OutlineDetailPage />,
              },
              {
                path: '/tkppf/:ibId/detail/:tkppfId',
                element: <TKPPFDetailPage />,
              },
              {
                path: '/rrs/:ibId/detail/:rrsId',
                element: <RRSDetailPage />,
              },
            ],
          },
        ],
      },
      {
        path: '/activityv3',
        children: [
          {
            path: '/:id',
            // children: [
            //   {
            //     path: '/session',
            //     children: [
            //       { path: '/add', element: <ActivityV3SessionAddPage /> },
            //       {
            //         path: '/:sessionId',
            //         children: [
            //           { path: '/update', element: <ActivityV3SessionUpdatePage /> },
            //           { path: '/:studentId', element: <ActivityV3SessionReportPage /> },
            //         ],
            //       },
            //     ],
            //   },
            //   { path: '/update', element: <ActivityV3UpdatePage /> },
            //   { path: '/:studentId', element: <ActivityV3ReportPage /> },
            // ],
          },
          // { path: '/add', element: <ActivityV3AddPage /> },
        ],
      },
      // { path: '/activity/:id', element: <ActivityDetailPage /> },
      // { path: '/record', element: <RecordPage /> },
      // { path: '/outing', element: <OutingPage /> },
      // { path: '/studentcard', element: <StudentCardPage /> },
      // { path: '/groups', element: <GroupPage /> },
      // { path: '/pointlogs', element: <PointDashboard /> },
      // { path: '/notice', element: <NoticePage /> },
      // { path: '/newsletter', element: <NewsletterPage /> },
      // { path: '/apply', element: <TeacherApplyPage /> },
      // { path: '/mypage', element: <TeacherMyPage /> },
      // { path: '/notification-settings', element: <NotificationSettingsPage /> },
      // { path: '/login', element: <LoginPage /> },
      { path: '/announcement', element: <AnnouncementPage /> },
    ],
  },
  {
    path: '/ib/student',
    // element: <AuthGuard>{/* <IBLayout/> */}</AuthGuard>,
    children: [
      {
        path: '/ee/:id',
        children: [
          {
            index: true,
            element: <EEMainPage />,
          },
          {
            path: '/rrs/:rrsId',
            element: <RRSDetailPage />,
          },
          { path: '/interview/:qnaId', element: <InterviewDetailPage /> },
          { path: '/rppf/:rppfId', element: <RPPFDetailPage /> },
          { path: '/essay/:essayId', element: <EeEssayDetailPage /> },
          { path: '/proposal/:proposalId', element: <ProposalDetailPage /> },
        ],
      },
      { path: '/cas/:id', element: <CASMainPage /> },
      {
        path: '/tok/exhibition',
        children: [
          {
            path: '/plan/:id',
            element: <ExhibitionPlanDetailPage />,
          },
          {
            path: '/:id',
            children: [
              { index: true, element: <ExhibitionMainPage /> },
              { path: '/detail/:exhibitionId', element: <ExhibitionDetailPage /> },
            ],
          },
        ],
      },
      {
        path: '/tok/essay',
        children: [
          {
            path: '/:id',
            children: [
              { index: true, element: <EssayMainPage /> },
              { path: '/tkppf/:tkppfId', element: <TKPPFDetailPage /> },
              { path: '/rrs/:rrsId', element: <TOKRRSDetailPage /> },
            ],
          },
          { path: '/outline/:id', element: <OutlineDetailPage /> },
          { path: '/detail/:id', element: <TOKEssayDetailPage /> },
        ],
      },

      {
        path: '/reference',
        children: [
          { index: true, element: <IBStudentReferencePage /> },
          { path: '/:id', element: <IBStudentReferenceDetailPage /> },
        ],
      },

      {
        path: '/portfolio',
        children: [
          { path: '/reflection-diary/:id', element: <CASReflectionDiaryDetailPage /> },
          { path: '/interview/:id/:qnaId', element: <CASInterviewDetailPage /> },
        ],
      },

      { path: '/plagiarism-inspection', element: <PlagiarismInspectPage /> },
    ],
  },
  {
    path: '/plagiarism-inspect/detail/:id',
    // element: <DetailResultPopup />,
  },
  {
    path: '/reset-password/:id',
    // element: <ResetPasswordPageV1 />,
  },
  {
    path: '/find-password',
    // element: <FindPasswordPageV2 />,
  },
  {
    path: '/find-id',
    // element: <FindIdPageV2 />,
  },
  {
    path: '/AboutSuperSchool',
    // element: <AboutSuperSchoolPage />,
  },
  {
    path: '/add-child/:uuid',
    // element: <AuthGuard path="/add-child/:uuid" component={AddChildrenPage} />,
  },
  {
    path: '/parent-signup',
    // element: <ParentSignupPage />,
  },
  {
    path: '/first-login',
    // element: <FirstLoginPage />,
  },
  {
    path: '/login',
    // element: <AuthGuard path="/login" guestOnly={true} component={LoginV2} />,
  },
  {
    path: '/select-school',
    // element: <AuthGuard path="/select-school" guestOnly={true} component={SelectSchool} />,
  },
  {
    path: '/signup',
    // element: <AuthGuard path="/signup" guestOnly={true} component={Signup} />,
  },
]

export const router = createBrowserRouter(routers)
