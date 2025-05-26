import AcitivityLogDetail from '@/legacy/components/ib/cas/AcitivityLogDetail'
import ActivityLogList from '@/legacy/components/ib/cas/ActivityLogList'
import CASPortfolio from '@/legacy/components/ib/cas/CASPortfolio'
import StudentIBStatus from '@/legacy/components/ib/StudentIBStatus'
import { CASDetailPage } from '@/legacy/pages/ib/student/CAS/CASDetailPage'
import CASInterviewDetailPage from '@/legacy/pages/ib/student/CAS/CASInterviewDetailPage'
import { CASMainPage } from '@/legacy/pages/ib/student/CAS/CASMainPage'
import { CASReflectionDiaryDetailPage } from '@/legacy/pages/ib/student/CAS/CASReflectionDiaryDetailPage'
import { EeEssayDetailPage } from '@/legacy/pages/ib/student/EE/EeEssayDetailPage'
import { EEMainPage } from '@/legacy/pages/ib/student/EE/EEMainPage'
import InterviewDetailPage from '@/legacy/pages/ib/student/EE/InterviewDetailPage'
import { ProposalDetailPage } from '@/legacy/pages/ib/student/EE/ProposalDetailPage'
import RPPFDetailPage from '@/legacy/pages/ib/student/EE/RPPFDetailPage'
import RRSDetailPage from '@/legacy/pages/ib/student/EE/RRSDetailPage'
import { IBStudentMainPage } from '@/legacy/pages/ib/student/IBStudentMainPage'
import { IBStudentPage } from '@/legacy/pages/ib/student/IBStudentPage'
import { IBStudentReferenceDetailPage } from '@/legacy/pages/ib/student/IBStudentReferenceDetailPage'
import { IBStudentReferencePage } from '@/legacy/pages/ib/student/IBStudentReferencePage'
import { EssayMainPage } from '@/legacy/pages/ib/student/TOK_ESSAY/EssayMainPage'
import { OutlineDetailPage } from '@/legacy/pages/ib/student/TOK_ESSAY/OutlineDetailPage'
import TKPPFDetailPage from '@/legacy/pages/ib/student/TOK_ESSAY/TKPPFDetailPage'
import { TOKEssayDetailPage } from '@/legacy/pages/ib/student/TOK_ESSAY/TOKEssayDetailPage'
import TOKRRSDetailPage from '@/legacy/pages/ib/student/TOK_ESSAY/TOKRRSDetailPage'
import { ExhibitionDetailPage } from '@/legacy/pages/ib/student/TOK_EXHIBITION/ExhibitionDetailPage'
import { ExhibitionMainPage } from '@/legacy/pages/ib/student/TOK_EXHIBITION/ExhibitionMainPage'
import { ExhibitionPlanDetailPage } from '@/legacy/pages/ib/student/TOK_EXHIBITION/ExhibitionPlanDetailPage'
import PlagiarismInspectPage from '@/legacy/pages/plagiarismInspect/student/PlagiarismInspectPage'
import { AuthRouter } from '../AuthRouter'
import { AuthGuard } from '../guard/AuthGuard'

/**
 * IB Router
 * @author Sukjin So
 */
export const ibRoutes = {
  path: '/ib/student',
  element: (
    <AuthRouter>
      <AuthGuard>
        <IBStudentPage />
      </AuthGuard>
    </AuthRouter>
  ),
  children: [
    // IB 메인
    {
      path: '',
      element: <IBStudentMainPage />,
      children: [
        { index: true, element: <StudentIBStatus /> },
        {
          path: 'portfolio',
          element: <CASPortfolio />,
        },
      ],
    },
    {
      path: 'portfolio/interview/:id/:qnaId',
      element: <CASInterviewDetailPage />,
    },
    {
      path: 'portfolio/reflection-diary/:id',
      element: <CASReflectionDiaryDetailPage />,
    },
    // CAS 상세
    {
      path: 'cas/:id',
      element: <CASMainPage />,
      children: [
        { path: 'plan', element: <CASDetailPage /> },
        { path: 'activitylog/:activitylogId', element: <AcitivityLogDetail /> },
        { path: 'activitylog', element: <ActivityLogList /> },
      ],
    },

    // EE
    {
      path: 'ee',
      children: [
        { path: ':id', element: <EEMainPage /> },
        { path: ':id/essay/:essayId', element: <EeEssayDetailPage /> },
        { path: ':id/interview/:qnaId', element: <InterviewDetailPage /> },
        { path: ':id/proposal/:proposalId', element: <ProposalDetailPage /> },
        { path: ':id/rppf/:rppfId', element: <RPPFDetailPage /> },
        { path: ':id/rrs/:rrsId', element: <RRSDetailPage /> },
      ],
    },

    // TOK
    {
      path: 'tok',
      children: [
        {
          path: 'essay',
          children: [
            { path: 'detail/:id', element: <TOKEssayDetailPage /> },
            { path: 'outline/:id', element: <OutlineDetailPage /> },
            {
              path: ':id',
              children: [
                { index: true, element: <EssayMainPage /> },
                { path: 'rrs/:rrsId', element: <TOKRRSDetailPage /> },
                { path: 'tkppf/:tkppfId', element: <TKPPFDetailPage /> },
              ],
            },
          ],
        },
        {
          path: 'exhibition',
          children: [
            { path: 'plan/:id', element: <ExhibitionPlanDetailPage /> },
            {
              path: ':id',
              children: [
                { index: true, element: <ExhibitionMainPage /> },
                { path: 'detail/:exhibitionId', element: <ExhibitionDetailPage /> },
              ],
            },
          ],
        },
      ],
    },

    // 자료실
    {
      path: 'reference',
      children: [
        { index: true, element: <IBStudentReferencePage /> },
        { path: ':id', element: <IBStudentReferenceDetailPage /> },
      ],
    },

    // 표절률 검사
    { path: 'plagiarism-inspection', element: <PlagiarismInspectPage /> },
  ],
}
