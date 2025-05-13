import clsx from 'clsx'
import preval from 'preval.macro'
import { useEffect, useMemo, useState } from 'react'
import { Link, LinkProps, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useHistory } from '@/hooks/useHistory'
import RightArrow from '@/assets/svg/RightFillArrow.svg'
import Logo from '@/asset/svg/logo.svg'
import SvgUser from '@/asset/svg/user.svg'
import { Toast } from '@/legacy/components/Toast'
import { AuthRoute, Blank } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { NotificationModal } from '@/legacy/components/notification/NotificationModal'
import { Constants } from '@/legacy/constants'
import {
  externalCreateToken,
  useDashboardGetDashBoardData,
  useNotificationLogFindRecent,
} from '@/legacy/generated/endpoint'
import { OutingUse, ResponseDashboardDto, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { cn } from '@/legacy/lib/tailwind-merge'
import { meState, newMsgCntState } from '@/stores'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { globalEnv } from '@/legacy/util/global-env'
import { useAuth, useLogout } from '@/legacy/util/hooks'
import { getNickName } from '@/legacy/util/status'
import CASInterviewDetailPage from '@/legacy/pages/ib/teacher/CAS/CASInterviewDetailPage'
import { CASMainPage } from '@/legacy/pages/ib/teacher/CAS/CASMainPage'
import CASPortfolioPage from '@/legacy/pages/ib/teacher/CAS/CASPortfolioPage'
import { CASReflectionDiaryDetailPage } from '@/legacy/pages/ib/teacher/CAS/CASReflectionDiaryDetailPage'
import { EEEssayPage } from '@/legacy/pages/ib/teacher/EE/EEEssayPage'
import { EEMainPage } from '@/legacy/pages/ib/teacher/EE/EEMainPage'
import { EEProposalDetailPage } from '@/legacy/pages/ib/teacher/EE/EEProposalDetailPage'
import { EERppfDetailPage } from '@/legacy/pages/ib/teacher/EE/EERppfDetailPage'
import { EERppfInterviewDetailPage } from '@/legacy/pages/ib/teacher/EE/EERppfInterviewDetailPage'
import EERrsDetailPage from '@/legacy/pages/ib/teacher/EE/EERrsDetailPage'
import IBTeacherMainPage from '@/legacy/pages/ib/teacher/IBTeacherMainPage'
import { IBTeacherReferenceDetailPage } from '@/legacy/pages/ib/teacher/IBTeacherReferenceDetailPage'
import { IBTeacherReferencePage } from '@/legacy/pages/ib/teacher/IBTeacherReferencePage'
import { EssayDetailPage } from '@/legacy/pages/ib/teacher/TOK_ESSAY/EssayDetailPage'
import { EssayMainPage } from '@/legacy/pages/ib/teacher/TOK_ESSAY/EssayMainPage'
import { OutlineDetailPage } from '@/legacy/pages/ib/teacher/TOK_ESSAY/OutlineDetailPage'
import RRSDetailPage from '@/legacy/pages/ib/teacher/TOK_ESSAY/RRSDetailPage'
import { TKPPFDetailPage } from '@/legacy/pages/ib/teacher/TOK_ESSAY/TKPPFDetailPage'
import { ExhibitionDetailPage } from '@/legacy/pages/ib/teacher/TOK_EXHIBITION/ExhibitionDetailPage'
import { ExhibitionMainPage } from '@/legacy/pages/ib/teacher/TOK_EXHIBITION/ExhibitionMainPage'
import { ExhibitionPlanDetailPage } from '@/legacy/pages/ib/teacher/TOK_EXHIBITION/ExhibitionPlanDetailPage'
import { CoordinatorPage } from '@/legacy/pages/ib/teacher/coordinator/CoordinatorPage'
import AbsentComparisonPage from '@/legacy/pages/teacher/absent/AbsentComparisonPage'
import { AbsentPage } from '@/legacy/pages/teacher/absent/AbsentPage'
import { TeacherApplyPage } from '@/legacy/pages/teacher/absent/TeacherApplyPage'
import { ActivityDetailPage } from './activity/ActivityDetailPage'
import { ActivityV3AddPage } from './activityv3/ActivityV3AddPage'
import { ActivityPage } from './activity/ActivityPage'
import { ActivityV3DetailPage } from './activityv3/ActivityV3DetailPage'
import { ActivityV3Page } from './activityv3/ActivityV3Page'
import { ActivityV3ReportPage } from './activityv3/ActivityV3ReportPage'
import { ActivityV3SessionAddPage } from './activityv3/ActivityV3SessionAddPage'
import { ActivityV3SessionDetailPage } from './activityv3/ActivityV3SessionDetailPage'
import { ActivityV3SessionReportPage } from './activityv3/ActivityV3SessionReportPage'
import { ActivityV3SessionUpdatePage } from './activityv3/ActivityV3SessionUpdatePage'
import { ActivityV3UpdatePage } from './activityv3/ActivityV3UpdatePage'
import AnnouncementPage from './announcement/AnnouncementPage'
import { AttendancePage } from './attendance/AttendancePage'
import { BoardsPage } from './board/BoardPage'
import { CalendarPage } from './calendar/CalendarPage'
import { CanteenPage } from './canteen/CanteenPage'
import { ChatListPage } from './chat/ChatListPage'
import { FieldtripMainPage } from './fieldtrip/FieldtripMainPage'
import { FieldtripNoticePage } from './fieldtrip/FieldtripNoticePage'
import { FieldtripResultPage } from './fieldtrip/FieldtripResultPage'
import { GroupPage } from './group/GroupPage'
import { HistoryPage } from './history/HistoryPage'
import { LoginPage } from './login/LoginPage'
import { TeacherFirstLoginPage } from './login/TeacherFirstLoginPage'
import { NotificationSettingsPage } from './mypage/NotificationSettingsPage'
import { TeacherInfoPage } from './mypage/TeacherInfoPage'
import { TeacherMyPage } from './mypage/TeacherMyPage'
import { NewsletterPage } from './newsletter/NewsletterPage'
import { NoticePage } from './notice/NoticePage'
import { OutingPage } from './outing/OutingPage'
import { PointDashboard } from './pointlogs/PointDashboard'
import { RecordPage } from './record/RecordPage'
import { StudentCardPage } from './studentcard/StudentCardPage'
import { TimetablePage } from './timetable/TimetablePage'

export function TeacherMainPage() {
  const { replace } = useHistory()
  const { pathname } = useLocation()
  const { t, changeLanguage, currentLang } = useLanguage()

  const setNewMsgCnt = useSetRecoilState(newMsgCntState)
  const me = useRecoilValue(meState)
  const manuals = [
    {
      id: 1,
      url: 'https://superschoolofficial.notion.site/f9bae37feef94ee7b9f886b5e074fdac',
      title: t('teacher_usage_guide'),
    },
    {
      id: 2,
      url: 'https://superschoolofficial.notion.site/e8ebd5829e2846ab8e97417c7ab589f7',
      title: t('student_usage_guide'),
    },
    {
      id: 3,
      url: 'https://superschoolofficial.notion.site/70491392ea96454f8688cffee395c1c7',
      title: t('parent_usage_guide'),
    },
    {
      id: 4,
      url: 'https://web.superschool.link/AboutSuperSchool',
      title: t('video_usage_guide'),
    },
    // {
    //   id: 1,
    //   url: 'https://www.notion.so/signed/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fb072a08c-df63-4eb5-84fa-2e084026f390%2Fstarting.pdf?table=block&id=9873b81d-5059-4043-9471-ad187bfd8f46&spaceId=8612a4a1-fd50-4ddd-9f79-e0df30e67f9e&name=starting.pdf&userId=625b3019-b1d4-48ee-a73f-fc5f93cb5b0a&cache=v2',
    //   title: '시작하기',
    // },
    // {
    //   id: 2,
    //   url: 'https://superstudy-image.s3.ap-northeast-2.amazonaws.com/tutorials/%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC%20%EC%B6%9C%EA%B2%B0%281%29_2022.11.01.pdf',
    //   title: '출결관리',
    // },
    // {
    //   id: 3,
    //   url: 'https://superstudy-image.s3.ap-northeast-2.amazonaws.com/tutorials/%EC%B6%9C%EA%B2%B0%282%29_%EC%98%A8%EB%9D%BC%EC%9D%B8%EC%B6%9C%EC%84%9D%EB%B6%80_2022.11.01.pdf',
    //   title: '출석부',
    // },
    // {
    //   id: 4,
    //   url: 'https://superstudy-image.s3.ap-northeast-2.amazonaws.com/tutorials/%EC%B2%B4%ED%97%98%ED%95%99%EC%8A%B5_2022.11.01.pdf',
    //   title: '체험학습',
    // },
    // {
    //   id: 5,
    //   url: 'https://superstudy-image.s3.ap-northeast-2.amazonaws.com/tutorials/%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC%20%ED%99%9C%EB%8F%99%281%29_2022.11.01.pdf',
    //   title: '활동기록부',
    // },
    // {
    //   id: 6,
    //   url: 'https://superstudy-image.s3.ap-northeast-2.amazonaws.com/tutorials/%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC%20%ED%95%99%EB%B6%80%EB%AA%A8%EC%9A%A9_2022.10.31.pdf',
    //   title: '보호자용',
    // },
  ]

  const logout = useLogout()
  const [openFieldTrip, setOpenFieldTrip] = useState(false)
  const [openGuide, setOpenGuide] = useState(false)
  const [blankOpen, setBlankOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const { authenticated } = useAuth()
  const { data: notificationLog } = useNotificationLogFindRecent()

  if (me?.role === 'USER' || me?.role === 'PARENT') {
    replace('/student')
  }

  if (me?.firstVisit && !pathname.startsWith('/teacher/first-login')) {
    replace('/teacher/first-login')
  }

  // TODO 채팅 머지 후, 재 수정, 신규 메시지
  const newMsgCnt = useRecoilValue(newMsgCntState)

  const tabs = useMemo(
    () => [
      { path: '/teacher/activityv3', icon: Icon.Activity, name: '활동' },
      {
        path: '/teacher/apply',
        icon: Icon.Planner,
        name: '출결',
        extra: [
          '/teacher/absent',
          '/teacher/outing',
          '/teacher/fieldtrip',
          '/teacher/attendance',
          '/teacher/studentcard',
          '/teacher/timetable',
        ],
      },
      {
        path: `/teacher/canteen/${DateUtil.formatDate(new Date().toISOString(), DateFormat['YYYY-MM-DD'])}`,
        icon: Icon.Home,
        name: '홈',
        extra: ['/teacher/canteen', '/teacher/chat'],
      },
      {
        path: '/teacher/notice',
        icon: Icon.Notice,
        name: '공지',
        extra: ['/teacher/board', '/teacher/newsletter'],
      },
      {
        path: '/teacher/mypage',
        icon: Icon.MoreVertical,
        name: '더보기',
        extra: ['/teacher/update', '/teacher/announcement'],
      },
    ],
    [me?.role, authenticated, pathname],
  )

  const adminPermission = useMemo(
    () =>
      me?.teacherPermission?.adminApprovalLine ||
      me?.teacherPermission?.adminClass ||
      me?.teacherPermission?.adminGroup ||
      me?.teacherPermission?.adminParent ||
      me?.teacherPermission?.adminSms ||
      me?.teacherPermission?.adminScore ||
      me?.teacherPermission?.adminStudent ||
      me?.teacherPermission?.adminTeacher ||
      me?.teacherPermission?.adminTimetable ||
      me?.teacherPermission?.adminIb,
    [me],
  )

  useEffect(() => {
    if (!pathname.startsWith('/teacher/fieldtrip')) setOpenFieldTrip(false)
    setOpenGuide(false)
  }, [pathname])

  function openSugang() {
    externalCreateToken().then((token) => {
      // 실서버
      let url = `https://${window.location.hostname}/course/teacher?sso=${token}`
      if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.startsWith('http://')) {
        // 로컬
        url = `http://localhost:3100/course/teacher?sso=${token}`
      }

      window.open(url, '_self')
    })
  }

  useDashboardGetDashBoardData<ResponseDashboardDto>({
    query: {
      onSuccess: (res) => {
        setNewMsgCnt(res?.unreadChatMessageCount || 0)
      },
    },
  })

  const hasConfirmedAll = !notificationLog

  return (
    <div className="flex">
      {blankOpen && <Blank />}

      <div className="hidden w-[270px] flex-shrink-0 md:block">
        <div className="flex flex-grow flex-col border-r border-gray-200 bg-gray-50 pt-1 pb-4">
          <div className="flex items-center justify-between px-4">
            <Link to={`/teacher/canteen/${DateUtil.formatDate(new Date().toISOString(), DateFormat['YYYY-MM-DD'])}`}>
              <Logo className="w-20" />
            </Link>
            <div className="flex items-center space-x-4">
              {me?.schoolId === 2 || me?.schoolId === 171 || me?.schoolId === 183 ? (
                <div onClick={() => changeLanguage()} className="text-brand-1 cursor-pointer text-sm">
                  {t('select_language')}
                </div>
              ) : (
                <div
                  onClick={() => {
                    setBlankOpen(true)
                    window?.location?.reload()
                  }}
                  className="text-brand-1 cursor-pointer text-sm"
                >
                  새로고침
                </div>
              )}
              <div className="relative h-6 w-6">
                <Icon.Bell className="h-6 w-6 cursor-pointer" onClick={() => setModalOpen(!modalOpen)} />
                {!hasConfirmedAll && <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />}
                {modalOpen && (
                  <div className="scroll-box absolute -top-2 left-12 z-50 h-128 w-96 overflow-x-hidden overflow-y-auto">
                    <NotificationModal />
                    <Icon.Close
                      className="absolute top-2 left-[22.5rem] h-4 w-4 cursor-pointer"
                      onClick={() => setModalOpen(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 선생님 프로필 */}
          <div className="mx-4 flex items-center gap-4 py-2 select-none">
            <div className="flex h-[72px] w-[60px] rounded-xl">
              <img
                className="mx-auto rounded-xl"
                src={`${Constants.imageUrl}${me?.profile}`}
                alt=""
                loading="lazy"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null // prevents looping
                  currentTarget.src = SvgUser
                  currentTarget.className = 'w-full rounded-xl'
                }}
              />
            </div>
            <div className="flex h-[72px] flex-1 flex-col justify-between gap-3 py-1 lg:px-2">
              <div>
                <div
                  className="flex cursor-pointer items-center justify-between"
                  onClick={() => replace('/teacher/update')}
                >
                  <p className="text-14 font-bold">
                    {me?.name}
                    {getNickName(me?.nickName)} {t(`teacher`)}
                  </p>
                  <RightArrow />
                </div>
                <p className="flex-1 overflow-hidden text-xs leading-none font-medium text-ellipsis whitespace-nowrap">
                  {me?.email}
                </p>
              </div>
              <div className="flex-1 overflow-hidden text-xs leading-none font-normal text-ellipsis whitespace-nowrap">
                {me?.school?.name}
              </div>
            </div>
          </div>

          {/* 메뉴바 */}
          <div className="scroll-box h-screen-13 mt-5 flex flex-grow flex-col overflow-y-auto tracking-tighter">
            <nav
              className={`flex-1 space-y-1 px-4 ${currentLang === 'en' ? 'text-14' : 'text-16'}`}
              aria-label="Sidebar"
            >
              {/* 출결 start */}
              <div className="flex">
                <div className="text-darkgray w-20 self-center text-center font-bold">{t(`attendance`)}</div>
                <div className="border-grey-6 my-2.5 mr-2 ml-3 border" />
                <div className="w-40">
                  <TeacherMainPageLink to="/teacher/attendance">{t(`attendance_register`)}</TeacherMainPageLink>
                  <TeacherMainPageLink to="/teacher/timetable">
                    {currentLang === 'en'
                      ? `${t(`timetable`)}\n/ ${t(`attendance_check`)}`
                      : `${t(`timetable`)}/${t(`attendance_check`)}`}
                  </TeacherMainPageLink>
                  {me?.school?.isOutingActive !== OutingUse.NONE && (
                    <TeacherMainPageLink to="/teacher/outing">{t(`certificate`)}</TeacherMainPageLink>
                  )}
                  <div>
                    {pathname.startsWith('/teacher/absent') ? (
                      <div className="rounded-md bg-gray-200">
                        <TeacherMainPageLink
                          to="/teacher/absent"
                          selected={!pathname.startsWith('/teacher/absent/comparison')}
                        >
                          {t(`absentTitle`, '결석신고서')}
                        </TeacherMainPageLink>
                        {me?.schoolId !== 171 && (
                          <TeacherMainPageLink to="/teacher/absent/comparison" className="py-2">
                            - {t(`compare_neis_data`)}
                          </TeacherMainPageLink>
                        )}
                      </div>
                    ) : (
                      <TeacherMainPageLink to="/teacher/absent">{t(`absentTitle`, '결석신고서')}</TeacherMainPageLink>
                    )}
                  </div>

                  <div
                    onClick={() => setOpenFieldTrip(!openFieldTrip)}
                    className={
                      openFieldTrip
                        ? 'font-base group text-darkgray flex cursor-pointer items-center rounded-t-md bg-gray-200 px-3 pt-3 pb-1 text-sm select-none'
                        : 'font-base group text-darkgray flex cursor-pointer items-center rounded-t-md px-3 py-3 text-sm select-none hover:bg-gray-100 hover:text-gray-900'
                    }
                  >
                    {t(`experiential_learning_activity`)}
                  </div>
                  {openFieldTrip && (
                    <div className="rounded-b-md bg-gray-200">
                      <TeacherMainPageLink
                        to="/teacher/fieldtrip"
                        selected={
                          pathname.startsWith('/teacher/fieldtrip') &&
                          !pathname.includes('notice') &&
                          !pathname.includes('result')
                        }
                        className="py-2"
                      >
                        - {t(`application_form`)}
                      </TeacherMainPageLink>
                      <TeacherMainPageLink to="/teacher/fieldtrip/notice" className="py-2">
                        - {t(`notification_form`)}
                      </TeacherMainPageLink>
                      <TeacherMainPageLink to="/teacher/fieldtrip/result" className="py-2">
                        - {t(`report_form`)}
                      </TeacherMainPageLink>
                    </div>
                  )}
                  {(me?.role === Role.ADMIN ||
                    me?.role === Role.HEAD ||
                    me?.role === Role.PRE_HEAD ||
                    me?.role === Role.PRE_PRINCIPAL ||
                    me?.role === Role.PRINCIPAL ||
                    me?.role === Role.VICE_PRINCIPAL ||
                    me?.role === Role.HEAD_PRINCIPAL ||
                    me?.klassGroupId) && (
                    <TeacherMainPageLink to="/teacher/history">
                      {t(`attendance_documents_management`)}
                    </TeacherMainPageLink>
                  )}
                </div>
              </div>
              <div className="border-grey-6 w-full border" />
              {/* 출결 end */}

              {/* 정보 start */}
              <div className="flex">
                <div className="text-darkgray w-20 self-center text-center font-bold">{t(`information`)}</div>

                <div className="border-grey-6 my-2.5 mr-2 ml-3 border" />

                <div className="w-40">
                  <TeacherMainPageLink to="/teacher/studentcard">{t(`student_information`)}</TeacherMainPageLink>
                  <TeacherMainPageLink to="/teacher/groups">{t(`group_information`)}</TeacherMainPageLink>
                  <TeacherMainPageLink to="/teacher/pointlogs">{t(`상벌점관리`)}</TeacherMainPageLink>
                </div>
              </div>
              <div className="border-grey-6 w-full border" />
              {/* 정보 end */}

              {/* 활동 start*/}
              <div className="flex">
                <div className="text-darkgray w-20 self-center text-center font-bold">{t(`activity`)}</div>
                <div className="border-grey-6 my-2.5 mr-2 ml-3 border" />
                <div className="w-40">
                  <TeacherMainPageLink
                    to="/teacher/activityv3"
                    selected={pathname.startsWith('/teacher/activityv3') && !pathname.includes('analyze')}
                  >
                    {t(`활동기록`)}
                  </TeacherMainPageLink>
                  {me?.email === 'superstudy@korea.kr' && (
                    <Link
                      to="/teacher/activity"
                      className={
                        pathname.startsWith('/teacher/groups')
                          ? 'group bg-darkgray flex items-center rounded-md px-3 py-3 text-sm font-bold text-white'
                          : 'font-base group text-darkgray flex cursor-pointer items-center rounded-md px-3 py-3 text-sm hover:bg-gray-100 hover:text-gray-900'
                      }
                    >
                      활동 기록부(old)
                    </Link>
                  )}

                  {(me?.schoolId === 2 || me?.schoolId === 106) && (
                    <TeacherMainPageLink to="/teacher/project">{t(`프로젝트`)}</TeacherMainPageLink>
                  )}

                  {me?.schoolId === 2 && (
                    <TeacherMainPageLink to="/teacher/activityv3/analyze">{t(`과제 활동분석`)}</TeacherMainPageLink>
                  )}

                  {me?.email === 'superstudy@korea.kr' && (
                    <Link
                      to="/teacher/record"
                      className={
                        pathname.startsWith('/teacher/record')
                          ? 'group bg-darkgray flex items-center rounded-md px-3 py-3 text-sm font-bold text-white'
                          : 'font-base group text-darkgray flex cursor-pointer items-center rounded-md px-3 py-3 text-sm hover:bg-gray-100 hover:text-gray-900'
                      }
                    >
                      생활 기록부(old)
                    </Link>
                  )}
                </div>
              </div>
              <div className="border-grey-6 w-full border" />
              {/* 활동 end*/}

              {/* 일정 start */}
              <div className="flex">
                <div className="text-darkgray w-20 self-center text-center font-bold">{t(`schedule`)}</div>

                <div className="border-grey-6 my-2.5 mr-2 ml-3 border" />

                <div className="w-40">
                  <TeacherMainPageLink to="/teacher/calendar">{t(`calendar`)}</TeacherMainPageLink>
                  <TeacherMainPageLink
                    to={`/teacher/canteen/${DateUtil.formatDate(new Date().toISOString(), DateFormat['YYYY-MM-DD'])}`}
                    selected={pathname.startsWith('/teacher/canteen')}
                  >
                    {t(`meal_plan`)}
                  </TeacherMainPageLink>
                </div>
              </div>
              <div className="border-grey-6 w-full border" />
              {/* 일정 end */}

              {/* 공지 start */}
              <div className="flex">
                <div className="text-darkgray w-20 self-center text-center font-bold">{t(`notice`)}</div>

                <div className="border-grey-6 my-2.5 mr-2 ml-3 border" />

                <div className="w-40">
                  <TeacherMainPageLink to="/teacher/notice">{t(`announcement`)}</TeacherMainPageLink>
                  <TeacherMainPageLink to="/teacher/board">{t(`class_bulletin_board`)}</TeacherMainPageLink>
                  <TeacherMainPageLink to="/teacher/newsletter">{t(`parent_letters`)}</TeacherMainPageLink>
                  <TeacherMainPageLink to="/teacher/chat">
                    <div className="flex-1 text-left">{t(`messages`)}</div>
                    <div className="text-right">
                      {Number(newMsgCnt) > 0 ? (
                        <small className="inline-block h-6 w-6 rounded-full bg-red-500 text-center text-xs leading-6 text-white">
                          N {/* {Number(newMsgCnt)} */}
                        </small>
                      ) : (
                        <></>
                      )}
                    </div>
                  </TeacherMainPageLink>
                </div>
              </div>
              <div className="border-grey-6 w-full border" />
              {/*공지 end*/}

              {/* 서비스 start */}
              <div className="flex">
                <div className="text-darkgray w-20 self-center text-center font-bold">{t(`more`)}</div>
                <div className="border-grey-6 my-2.5 mr-2 ml-3 border" />
                <div className="w-40">
                  <TeacherMainPageLink to="/teacher/update">{t(`my_information`)}</TeacherMainPageLink>
                  <a
                    href="http://superstudy.channel.io/"
                    target="blank"
                    className="font-base group text-darkgray flex cursor-pointer items-center rounded-md px-3 py-3 text-sm hover:bg-gray-100 hover:text-gray-900"
                  >
                    {t(`contact_us`)}
                  </a>
                  <div
                    onClick={() => setOpenGuide(!openGuide)}
                    className={
                      openGuide
                        ? 'font-base group text-darkgray flex cursor-pointer items-center rounded-t-md bg-gray-200 px-3 py-3 text-sm select-none'
                        : 'font-base group text-darkgray flex cursor-pointer items-center rounded-t-md px-3 py-3 text-sm select-none hover:bg-gray-100 hover:text-gray-900'
                    }
                  >
                    {t(`usage_guide`)}
                  </div>
                  {openGuide && (
                    <div className="rounded-b-md bg-gray-200">
                      {manuals.map(({ id, url, title }) => (
                        <a key={id} href={url} target="_blank" rel="noreferrer">
                          <div className="font-base group text-darkgray flex cursor-pointer items-center px-3 py-3 text-sm select-none hover:bg-gray-100 hover:text-gray-900">
                            {title}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  <TeacherMainPageLink to="/teacher/announcement">{t(`superschool_announcement`)}</TeacherMainPageLink>
                  <div
                    className="font-base group text-darkgray flex cursor-pointer items-center rounded-md px-3 py-3 text-sm hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => logout()}
                  >
                    {t(`logout`)}
                  </div>
                </div>
              </div>
              <div className="border-grey-6 w-full border" />
              {/* 서비스 end */}

              {(me?.role === Role.ADMIN || adminPermission) && (
                <Link
                  to="/admin"
                  className="border-darkgray flex items-center justify-between rounded-md border-2 py-3 text-sm font-semibold"
                >
                  <div className="flex w-full justify-center">{t('admin_mode')}</div>
                  <Icon.ChevronRight />
                </Link>
              )}

              {me?.school?.isCourseActive && (
                <div
                  onClick={() => {
                    openSugang()
                  }}
                  className="border-darkgray flex cursor-pointer items-center justify-between rounded-md border-2 py-3 text-sm font-semibold"
                >
                  <div className="flex w-full justify-center">신청관리모드</div>
                  <Icon.ChevronRight />
                </div>
              )}

              <div className="text-12 py-2 text-gray-400">
                <div className="text-white">
                  v{globalEnv.version} build at <br />
                  {preval`module.exports = new Date().toLocaleString().split("├")[0]`}
                </div>
                Copyright 2023. SUPERSCHOOL <br />
                all right reserved.
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/*/!* Mobile V *!/*/}
      <nav className="bottom-nav z-100 md:hidden">
        {tabs.map((tab) => {
          const active = [tab.path, ...(tab.extra ?? [])].some((path) => pathname.startsWith(path))
          return (
            <Link key={tab.path} to={tab.path} className={clsx('bottom-nav-item', active && 'text-darkgray')}>
              <tab.icon className="stroke-current" />
              <span>{tab.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="scroll-box h-screen w-full grid-cols-6 overflow-x-hidden overflow-y-scroll md:grid md:overflow-y-hidden">
        <Routes>
          <Route path="/teacher/canteen" Component={CanteenPage} />
          <Route path="/teacher/timetable" Component={TimetablePage} />
          <Route path="/teacher/attendance" Component={AttendancePage} />
          <Route path="/teacher/absent/comparison" Component={AbsentComparisonPage} />
          <Route path="/teacher/absent" Component={AbsentPage} />
          <Route path="/teacher/history" Component={HistoryPage} />
          <Route path="/teacher/update" Component={TeacherInfoPage} />
          <AuthRoute path="/teacher/first-login" component={TeacherFirstLoginPage} />
          <Route path="/teacher/fieldtrip/notice" Component={FieldtripNoticePage} />
          <Route path="/teacher/fieldtrip/result" Component={FieldtripResultPage} />
          <Route path="/teacher/board" Component={BoardsPage} />
          <Route path="/teacher/chat" Component={ChatListPage} />
          <Route path="/teacher/fieldtrip" Component={FieldtripMainPage} />
          <Route path="/teacher/calendar" Component={CalendarPage} />
          <Route path="/teacher/project" Component={IBTeacherMainPage} />
          <Route
            path="/teacher/ib/portfolio/:studentId/reflection-diary/:id"
            Component={CASReflectionDiaryDetailPage}
          />
          <Route path="/teacher/ib/portfolio/:studentId/interview/:id/:qnaId" Component={CASInterviewDetailPage} />
          <Route path="/teacher/ib/cas/portfolio/:id" Component={CASPortfolioPage} />
          <Route path="/teacher/ib/cas/:id" Component={CASMainPage} />
          <Route path="/teacher/ib/ee/:id/proposal/:proposalId" Component={EEProposalDetailPage} />
          <Route path="/teacher/ib/ee/:id/essay/:essayId" Component={EEEssayPage} />
          <Route path="/teacher/ib/ee/:id/rppf/:rppfId" Component={EERppfDetailPage} />
          <Route path="/teacher/ib/ee/:id/interview/:qnaId" Component={EERppfInterviewDetailPage} />
          <Route path="/teacher/ib/ee/:id/rrs/:rrsId" Component={EERrsDetailPage} />
          <Route path="/teacher/ib/ee/:id" Component={EEMainPage} />
          <Route path="/teacher/ib/coordinatorPage/:type" Component={CoordinatorPage} />
          <Route path="/teacher/ib/reference/:id" Component={IBTeacherReferenceDetailPage} />
          <Route path="/teacher/ib/reference" Component={IBTeacherReferencePage} />
          <Route path="/teacher/ib/tok/exhibition/:ibId/detail/:exhibitionId" Component={ExhibitionDetailPage} />
          <Route path="/teacher/ib/tok/exhibition/:ibId" Component={ExhibitionMainPage} />
          <Route path="/teacher/ib/tok/plan/:ibId" Component={ExhibitionPlanDetailPage} />
          <Route path="/teacher/ib/tok/essay/:ibId/detail/:essayId" Component={EssayDetailPage} />
          <Route path="/teacher/ib/tok/essay/:ibId" Component={EssayMainPage} />
          <Route path="/teacher/ib/tok/outline/:ibId/detail/:outlineId" Component={OutlineDetailPage} />
          <Route path="/teacher/ib/tok/tkppf/:ibId/detail/:tkppfId" Component={TKPPFDetailPage} />
          <Route path="/teacher/ib/tok/rrs/:ibId/detail/:rrsId" Component={RRSDetailPage} />
          <Route path="/teacher/activityv3/:id/session/add" Component={ActivityV3SessionAddPage} />
          <Route path="/teacher/activityv3/:id/session/:sessionId/update" Component={ActivityV3SessionUpdatePage} />
          <Route path="/teacher/activityv3/:id/session/:sessionId/:studentId" Component={ActivityV3SessionReportPage} />
          <Route path="/teacher/activityv3/:id/session/:sessionId" Component={ActivityV3SessionDetailPage} />
          <Route path="/teacher/activityv3/add" Component={ActivityV3AddPage} />
          <Route path="/teacher/activityv3/:id/update" Component={ActivityV3UpdatePage} />
          <Route path="/teacher/activityv3/:id/:studentId" Component={ActivityV3ReportPage} />
          <Route path="/teacher/activityv3/:id" Component={ActivityV3DetailPage} />
          <Route path="/teacher/activityv3" Component={ActivityV3Page} />
          <Route path="/teacher/activity/:id" Component={ActivityDetailPage} />
          <Route path="/teacher/activity" Component={ActivityPage} />
          <Route path="/teacher/record" Component={RecordPage} />
          <Route path="/teacher/outing" Component={OutingPage} />
          <Route path="/teacher/studentcard" Component={StudentCardPage} />
          <Route path="/teacher/groups" Component={GroupPage} />
          <Route path="/teacher/pointlogs" Component={PointDashboard} />
          <Route path="/teacher/notice" Component={NoticePage} />
          <Route path="/teacher/newsletter" Component={NewsletterPage} />
          <Route path="/teacher/apply" Component={TeacherApplyPage} />
          <Route path="/teacher/mypage" Component={TeacherMyPage} />
          <Route path="/teacher/notification-settings" Component={NotificationSettingsPage} />
          <Route path="/teacher/login" Component={LoginPage} />
          <Route path="/teacher/announcement" Component={AnnouncementPage} />

          <Route path="/teacher">
            {process.env.REACT_APP_MENU_TYPE === '2' ? (
              <Navigate to="/teacher/absent" />
            ) : (
              <Navigate
                to={`/teacher/canteen/${DateUtil.formatDate(new Date().toISOString(), DateFormat['YYYY-MM-DD'])}`}
              />
            )}
          </Route>
        </Routes>
      </div>

      <Toast />
    </div>
  )
}

interface TeacherMainPageLinkProps extends LinkProps {
  selected?: boolean
}

function TeacherMainPageLink({ selected, to, className, ...props }: TeacherMainPageLinkProps) {
  const { pathname } = useLocation()

  const active = selected ?? (typeof to === 'string' && pathname.startsWith(to))

  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center rounded-md px-3 py-3 text-sm',
        active ? 'bg-darkgray font-bold text-white' : 'text-darkgray hover:bg-gray-100 hover:text-gray-900',
        className,
      )}
      {...props}
    />
  )
}
