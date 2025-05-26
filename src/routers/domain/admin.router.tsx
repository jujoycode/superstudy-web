import { AdminMainPage } from '@/legacy/pages/admin/AdminMainPage'
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
import { AuthRouter } from '../AuthRouter'
import { AdminGuard } from '../guard/AdminGuard'

/**
 * Admin Router
 * @author Suh Jihun
 */
export const adminRoutes = {
  path: '/admin',
  element: (
    <AuthRouter>
      <AdminGuard>
        <AdminMainPage />
      </AdminGuard>
    </AuthRouter>
  ),
  children: [
    { path: 'school', element: <SchoolPage /> },

    // 선생님
    {
      path: 'teacher',
      children: [
        { index: true, element: <TeacherPage /> },
        { path: 'new', element: <TeacherEditPage /> },
        { path: 'batch/new', element: <TeacherBatchPage /> },
        { path: ':id', element: <TeacherDetailsPage /> },
        { path: ':id/edit', element: <TeacherEditPage /> },
      ],
    },

    // 학생
    {
      path: 'student',
      children: [
        { index: true, element: <StudentPage /> },
        { path: 'new', element: <StudentEditPage /> },
        {
          path: 'batch',
          children: [
            { path: 'new', element: <StudentBatchPage /> },
            { path: 'advance', element: <StudentBatchAdvancePage /> },
          ],
        },
        { path: 'photos', element: <StudentPhotosPage /> },
        { path: ':id', element: <StudentDetailsPage /> },
        { path: ':id/edit', element: <StudentEditPage /> },
      ],
    },

    // 보호자
    {
      path: 'parent',
      children: [
        { index: true, element: <ParentPage /> },
        { path: ':id', element: <ParentDetailsPage /> },
        { path: ':id/edit', element: <ParentEditPage /> },
      ],
    },

    // 만료된 사용자
    { path: 'expired-user', element: <ExpiredUserPage /> },

    // 학급
    {
      path: 'class',
      children: [
        { index: true, element: <KlassPage /> },
        { path: 'new', element: <KlassEditPage /> },
        { path: ':id', element: <KlassPage /> },
      ],
    },

    // 그룹
    {
      path: 'group',
      children: [
        { index: true, element: <GroupPage /> },
        { path: 'new', element: <GroupEditPage /> },
        { path: ':id', element: <GroupPage /> },
      ],
    },

    // 결제라인
    { path: 'approval-line', element: <ApprovalLinePage /> },

    // 시간표
    { path: 'timetable', element: <TimetablePage /> },

    // 문자비용관리
    { path: 'sms', element: <SmsPage /> },

    // 성적관리
    { path: 'score', element: <ScorePage /> },

    // IB 관리
    {
      path: 'ib',
      children: [
        { index: true, element: <IbPage /> },
        { path: 'student', element: <IbStudentPage /> },
        { path: 'teacher', element: <IbCoordinatorPage /> },
      ],
    },

    // 상벌점
    {
      path: 'point',
      children: [
        { index: true, element: <PointPage /> },
        { path: 'new', element: <PointEditPage /> },
        { path: ':id', element: <PointDetailsPage /> },
        { path: ':id/edit', element: <PointEditPage /> },
      ],
    },
  ],
}
