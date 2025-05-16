import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { HomePage } from '@/legacy/pages/HomePage'
import { CoordinatorPreviewPage } from '@/legacy/pages/ib/teacher/coordinator/CoordinatorPreviewPage'
import DetailResultPopup from '@/legacy/pages/plagiarismInspect/DetailResultPopup'
import { AbsentApprovalPage } from '@/legacy/pages/student/absent/AbsentApprovalPage'
import { ConsentForPromotionalAndMarketingPurposes } from '@/legacy/pages/student/ConsentForPromotionalAndMarketingPurposes'
import { ConsentToProvidePersonalInformationToThirdParties } from '@/legacy/pages/student/ConsentToProvidePersonalInformationToThirdParties'
import { ConsentToUseOfPersonalInformation } from '@/legacy/pages/student/ConsentToUseOfPersonalInformation'
import { FieldtripApprovalPage } from '@/legacy/pages/student/fieldtrip/FieldtripApprovalPage'
import { FieldtripParentNoticePage } from '@/legacy/pages/student/fieldtrip/FieldtripParentNoticePage'
import { FieldtripResultApprovalPage } from '@/legacy/pages/student/fieldtrip/FieldtripResultApprovalPage'
import { AboutSuperSchoolPage } from '@/legacy/pages/student/login/AboutSuperSchool'
import { FirstLoginPage } from '@/legacy/pages/student/login/FirstLoginPage'
import { LoginV2 } from '@/legacy/pages/student/login/LoginPageV2'
import { SelectSchool } from '@/legacy/pages/student/login/SelectSchool'
import { Signup } from '@/legacy/pages/student/login/Signup'
import { TwoFactor } from '@/legacy/pages/student/login/TwoFactor'
import { StudentNewsletterApprovalPage } from '@/legacy/pages/student/newsletter/StudentNewsletterApprovalPage'
import { OutingApprovalPage } from '@/legacy/pages/student/outing/OutingApprovalPage'
import { AddChildrenPage } from '@/legacy/pages/student/parent/AddChildrenPage'
import { ParentSignupPage } from '@/legacy/pages/student/parent/ParentSignupPage'
import { FindIdPageV2 } from '@/legacy/pages/student/password/FindIdPageV2'
import { FindPasswordPageV2 } from '@/legacy/pages/student/password/FindPasswordPageV2'
import { ResetPasswordPageV1 } from '@/legacy/pages/student/password/ResetPasswordPageV1'
import { PrivacyPolicy } from '@/legacy/pages/student/PrivacyPolicy'
import { TermsOfUse } from '@/legacy/pages/student/TermsOfUse'
import { adminRoutes } from './admin.router'
import { AuthRouter } from './guard/AuthRouter'
import { studentRoutes } from './student.router'
import { teacherRoutes } from './teacher.router'

/**
 * Router
 * @desc Super School 전체 라우터
 * @author Suh Jihun
 */
export const routers: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
    index: true,
  },
  {
    path: '/two-factor',
    element: (
      <AuthRouter>
        <TwoFactor />
      </AuthRouter>
    ),
  },
  {
    path: '/terms-of-use',
    element: <TermsOfUse />,
  },
  {
    path: '/privacy-policy/:schoolId',
    element: <PrivacyPolicy />,
  },
  {
    path: '/reference/preview',
    element: <CoordinatorPreviewPage />,
  },
  {
    path: '/consent-to-use-of-personal-information',
    element: <ConsentToUseOfPersonalInformation />,
  },
  {
    path: '/consent-to-provide-personal-information-to-third-parties',
    element: <ConsentToProvidePersonalInformationToThirdParties />,
  },
  {
    path: '/consent-for-promotional-and-marketing-purposes',
    element: <ConsentForPromotionalAndMarketingPurposes />,
  },
  {
    path: '/fieldtrip/result/approve/:uuid',
    element: <FieldtripResultApprovalPage />,
  },
  {
    path: '/fieldtrip/approve/:uuid',
    element: <FieldtripApprovalPage />,
  },
  {
    path: '/fieldtrip/parent/notice/:uuid',
    element: <FieldtripParentNoticePage />,
  },
  {
    path: '/studentnewsletter/approve/:uuid',
    element: <StudentNewsletterApprovalPage />,
  },
  {
    path: '/absent/approve/:uuid',
    element: <AbsentApprovalPage />,
  },
  {
    path: '/outing/approve/:uuid',
    element: <OutingApprovalPage />,
  },
  adminRoutes,
  studentRoutes,
  teacherRoutes,
  {
    path: '/reset-password/:id',
    element: <ResetPasswordPageV1 />,
  },
  {
    path: '/find-password',
    element: <FindPasswordPageV2 />,
  },
  {
    path: '/find-id',
    element: <FindIdPageV2 />,
  },
  {
    path: '/AboutSuperSchool',
    element: <AboutSuperSchoolPage />,
  },
  {
    path: '/add-child/:uuid',
    element: (
      <AuthRouter>
        <AddChildrenPage />
      </AuthRouter>
    ),
  },
  {
    path: '/parent-signup',
    element: <ParentSignupPage />,
  },
  {
    path: '/first-login',
    element: <FirstLoginPage />,
  },
  {
    path: '/login',
    element: (
      <AuthRouter guestOnly={true}>
        <LoginV2 />
      </AuthRouter>
    ),
  },
  {
    path: '/select-school',
    element: (
      <AuthRouter guestOnly={true}>
        <SelectSchool />
      </AuthRouter>
    ),
  },
  {
    path: '/signup',
    element: (
      <AuthRouter guestOnly={true}>
        <Signup />
      </AuthRouter>
    ),
  },
  {
    path: '/plagiarism-inspect/detail/:id',
    element: <DetailResultPopup />,
  },
]

export const router = createBrowserRouter(routers)
