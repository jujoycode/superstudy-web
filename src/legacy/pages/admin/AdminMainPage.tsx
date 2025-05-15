import clsx from 'clsx'
import { range } from 'lodash'
import { createContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'

import { ReactComponent as ExitAdmin } from '@/assets/svg/exit-admin.svg'
import { ReactComponent as LogoAdmin } from '@/assets/svg/logo-admin.svg'
import { Select } from '@/legacy/components/common'
import { Toast } from '@/legacy/components/Toast'
import { Routes as RouterConstant } from '@/legacy/constants/routes'
import { useSchoolManagementGetSchoolInfo } from '@/legacy/generated/endpoint'
import { Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getDayOfYear, getThisYear } from '@/legacy/util/time'
import { useUserStore } from '@/stores/user'
import { ApprovalLinePage } from './approval-line/ApprovalLinePage'
import { ExpiredUserPage } from './expired-user/ExpiredUserPage'
import { GroupEditPage } from './group/GroupEditPage'
import { GroupPage } from './group/GroupPage'
import { IbCoordinatorPage } from './ib/IbCoordinatorPage'
import { IbPage } from './ib/IbPage'
import { IbStudentPage } from './ib/ibStudentPage'
import { KlassEditPage } from './klass/KlassEditPage'
import { KlassPage } from './klass/KlassPage'
import { ParentDetailsPage } from './parent/ParentDetailsPage'
import { ParentEditPage } from './parent/ParentEditPage'
import { ParentPage } from './parent/ParentPage'
import { PointDetailsPage } from './point/PointDetailsPage'
import { PointEditPage } from './point/PointEditPage'
import { PointPage } from './point/PointPage'
import { SchoolPage } from './school/SchoolPage'
import { ScorePage } from './score/ScorePage'
import { SmsPage } from './sms/SmsPage'
import { StudentBatchAdvancePage } from './student/StudentBatchAdvancePage'
import { StudentBatchPage } from './student/StudentBatchPage'
import { StudentDetailsPage } from './student/StudentDetailsPage'
import { StudentEditPage } from './student/StudentEditPage'
import { StudentPage } from './student/StudentPage'
import { StudentPhotosPage } from './student/StudentPhotosPage'
import { TeacherBatchPage } from './teacher/TeacherBatchPage'
import { TeacherDetailsPage } from './teacher/TeacherDetailsPage'
import { TeacherEditPage } from './teacher/TeacherEditPage'
import { TeacherPage } from './teacher/TeacherPage'
import { TimetablePage } from './timetable/TimetablePage'

export const AdminContext = createContext({ year: +getThisYear() })

export function AdminMainPage() {
  const { me } = useUserStore()

  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }

  const { pathname } = useLocation()
  const thisYear = +getThisYear()
  const [startYear, setStartYear] = useState(thisYear)
  const [year, setYear] = useState(+getThisYear())

  const { data: school } = useSchoolManagementGetSchoolInfo()
  const { t, changeLanguage } = useLanguage()
  const { t: ta } = useTranslation('admin', { keyPrefix: 'admin_main_page' })

  const adminRoutes = [
    { path: RouterConstant.admin.school, component: SchoolPage, name: t('basic_information') },
    { path: RouterConstant.admin.teacher.edit, component: TeacherEditPage },
    { path: RouterConstant.admin.teacher.batch, component: TeacherBatchPage },
    { path: RouterConstant.admin.teacher.new, component: TeacherEditPage },
    { path: RouterConstant.admin.teacher.details, component: TeacherDetailsPage },
    { path: RouterConstant.admin.teacher.index, component: TeacherPage, name: t('teacher') },
    { path: RouterConstant.admin.student.edit, component: StudentEditPage },
    { path: RouterConstant.admin.student.batch, component: StudentBatchPage },
    { path: RouterConstant.admin.student.advance, component: StudentBatchAdvancePage },
    { path: RouterConstant.admin.student.photos, component: StudentPhotosPage },
    { path: RouterConstant.admin.student.new, component: StudentEditPage },
    { path: RouterConstant.admin.student.details, component: StudentDetailsPage },
    { path: RouterConstant.admin.student.index, component: StudentPage, name: t('student') },
    { path: RouterConstant.admin.parent.edit, component: ParentEditPage },
    { path: RouterConstant.admin.parent.details, component: ParentDetailsPage },
    { path: RouterConstant.admin.parent.index, component: ParentPage, name: t('parent') },
    { path: RouterConstant.admin.expiredUser.index, component: ExpiredUserPage, name: t('expired_user') },
    { path: RouterConstant.admin.klass.new, component: KlassEditPage },
    { path: RouterConstant.admin.klass.details, component: KlassPage },
    { path: RouterConstant.admin.klass.index, component: KlassPage, name: t('class') },
    { path: RouterConstant.admin.group.new, component: GroupEditPage },
    { path: RouterConstant.admin.group.details, component: GroupPage },
    { path: RouterConstant.admin.group.index, component: GroupPage, name: t('group') },
    { path: RouterConstant.admin.approvalLine, component: ApprovalLinePage, name: t('approval_line') },
    { path: RouterConstant.admin.timetable, component: TimetablePage, name: t('class_schedule') },
    { path: RouterConstant.admin.sms, component: SmsPage, name: t('sms_cost_management') },
    { path: RouterConstant.admin.score.index, component: ScorePage, name: t('grade_management') },
    { path: RouterConstant.admin.ib.teacher, component: IbCoordinatorPage },
    { path: RouterConstant.admin.ib.student, component: IbStudentPage },
    { path: RouterConstant.admin.ib.index, component: IbPage, name: t('ib_management') },
    { path: RouterConstant.admin.point.edit, component: PointEditPage },
    { path: RouterConstant.admin.point.new, component: PointEditPage },
    { path: RouterConstant.admin.point.details, component: PointDetailsPage },
    { path: RouterConstant.admin.point.index, component: PointPage, name: ta('points') },
  ]

  useEffect(() => {
    if (!school?.createdAt) return
    setStartYear(+getDayOfYear(new Date(school.createdAt)))
  }, [school?.createdAt])

  function checkPermission(name: string) {
    let permitted = me?.role === Role.ADMIN

    if (me && !permitted) {
      if (name === t('basic_information')) {
        permitted = me?.role === Role.ADMIN
      } else if (name === t('teacher')) {
        permitted = me?.teacherPermission.adminTeacher || false
      } else if (name === t('student')) {
        permitted = me?.teacherPermission.adminStudent || false
      } else if (name === t('parent')) {
        permitted = me?.teacherPermission.adminParent || false
      } else if (name === t('class')) {
        permitted = me?.teacherPermission.adminClass || false
      } else if (name === t('group')) {
        permitted = me?.teacherPermission.adminGroup || false
      } else if (name === t('approval_line')) {
        permitted = me?.teacherPermission.adminApprovalLine || false
      } else if (name === t('class_schedule')) {
        permitted = me?.teacherPermission.adminTimetable || false
      } else if (name === t('sms_cost_management')) {
        permitted = me?.teacherPermission.adminSms || false
      } else if (name === t('grade_management')) {
        permitted = me?.teacherPermission.adminScore || false
      } else if (name === t('ib_management')) {
        permitted = me?.teacherPermission.adminIb || false
      } else if (name === '만료된 사용자') {
        permitted = false
      }
    }

    scrollToTop()

    return permitted
  }

  // const adminRoutesPermitted = useMemo(
  //   () => adminRouterConstant.filter((route) => route.name && checkPermission(route.name)),
  //   [me, adminRoutes],
  // );

  const adminRoutesPermitted = useMemo(
    () =>
      adminRoutes.filter((route) => {
        const isPermitted = route.name && checkPermission(route.name)

        // score 관련 기능은 me.school.schoolType === 'HS' 인 경우만 허용
        const isScoreRelated =
          route.path.startsWith(RouterConstant.admin.score.index) ||
          route.path.startsWith(RouterConstant.admin.score.new.batch)

        if (isScoreRelated) {
          return isPermitted && me?.school.schoolType === 'HS'
        }

        // IB 관련 라우트 체크
        if (route.path.startsWith(RouterConstant.admin.ib.index)) {
          // 메인 IB 페이지이고, 권한이 있고, 허용된 학교인 경우만 표시
          return (
            route.path === RouterConstant.admin.ib.index && isPermitted && (me?.schoolId === 2 || me?.schoolId === 106)
          )
        }

        return isPermitted
      }),
    [adminRoutes, checkPermission, me?.school.schoolType, me?.schoolId],
  )

  return (
    <AdminContext.Provider value={{ year }}>
      <header className="sticky top-0 z-20 flex h-16 justify-center border-b bg-white">
        <nav className="max-w-screen-3xl flex w-full items-center justify-evenly px-6">
          <div className="flex flex-1">
            <Link to="/" className="flex items-center space-x-1">
              <ExitAdmin />
              <span className="text-14 font-medium text-gray-500">{t('exit_admin_mode')}</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-center">
            <Link to={RouterConstant.admin.index}>
              <LogoAdmin />
            </Link>
          </div>
          <div className="flex flex-1 justify-end">
            {me?.schoolId === 2 || me?.schoolId === 171 ? (
              <button onClick={changeLanguage}>{t('select_language')}</button>
            ) : (
              <a
                href={`https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/admin_manual.pdf`}
                target="_blank"
                download
                className="flex items-center gap-1 pr-1"
              >
                <div className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#ffe7db] bg-[#fff8f5] px-4 py-2">
                  <div className="font-semibold text-[#ff600c]">관리자모드 매뉴얼</div>
                </div>
              </a>
            )}
          </div>
        </nav>
      </header>

      <div className="max-w-screen-3xl relative mx-auto flex">
        <aside className="sticky top-16 h-[calc(100vh-4rem)] flex-shrink-0 overflow-y-auto">
          <nav className="flex w-60 flex-col p-4">
            <div className="mb-4 flex h-14 w-full items-center justify-center rounded-lg bg-blue-600">
              <p className="text-lg font-bold text-white">관리자모드 입니다.</p>
            </div>
            <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {range(thisYear + 1, startYear - 1, -1).map((year) => (
                <option key={year} value={year}>
                  {year}&nbsp;
                  {t('school_year')}
                </option>
              ))}
            </Select>
            <div className="mt-4 flex flex-col space-y-1">
              {adminRoutesPermitted.map((route) => (
                <Link
                  children={route.name}
                  key={route.path}
                  to={route.path}
                  className={clsx(
                    'text-14 flex h-10 items-center rounded-lg px-4',
                    pathname.startsWith(route.path) ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50',
                  )}
                />
              ))}
            </div>
          </nav>
        </aside>

        <main ref={scrollRef} className="h-screen-4 flex-1 overflow-auto bg-white px-6">
          <Outlet />
          {/* <Routes>
            {adminRoutes.map((route) => (
              <Route key={route.path} path={route.path} Component={route.component} />
            ))}
            <Route path={RouterConstant.admin.index}>
              <Navigate
                to={adminRoutesPermitted.length > 0 ? adminRoutesPermitted[0].path : RouterConstant.admin.index}
              />
            </Route>
          </Routes> */}
        </main>
      </div>

      <Toast />
    </AdminContext.Provider>
  )
}
