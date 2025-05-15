import { useEffect, useMemo, useState } from 'react'
import { Link, LinkProps, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { ReactComponent as Logo } from '@/assets/svg/logo.svg'
import { ReactComponent as RightArrow } from '@/assets/svg/RightFillArrow.svg'
import { ReactComponent as SvgUser } from '@/assets/svg/user.svg'
import { useHistory } from '@/hooks/useHistory'
import { useLogout } from '@/hooks/useLogout'
import { Blank } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { NotificationModal } from '@/legacy/components/notification/NotificationModal'
import { Toast } from '@/legacy/components/Toast'
import { Constants } from '@/legacy/constants'
import {
  useDashboardGetDashBoardData,
  externalCreateToken,
  useNotificationLogFindRecent,
} from '@/legacy/generated/endpoint'
import { OutingUse, ResponseDashboardDto, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { cn } from '@/legacy/lib/tailwind-merge'
import { DateFormat } from '@/legacy/util/date'
import { DateUtil } from '@/legacy/util/date'
import { globalEnv } from '@/legacy/util/global-env'
import { getNickName } from '@/legacy/util/status'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'

export function TeacherMainPage() {
  const { replace } = useHistory()
  const { pathname } = useLocation()
  const { me } = useUserStore()
  const { t, changeLanguage, currentLang } = useLanguage()
  // TODO 채팅 머지 후, 재 수정, 신규 메시지
  const { newMsgCnt, setNewMsgCnt } = useNotificationStore()

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
  const { data: notificationLog } = useNotificationLogFindRecent()

  if (me?.role === 'USER' || me?.role === 'PARENT') {
    replace('/student')
  }

  if (me?.firstVisit && !pathname.startsWith('/teacher/first-login')) {
    replace('/teacher/first-login')
  }

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
    [],
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
                onError={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = event.currentTarget
                  target.onerror = null // prevents looping
                  target.src = SvgUser as unknown as string
                  target.className = 'w-full rounded-xl'
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
                  {__BUILD_TIME__.split('T')[0] + ' ' + __BUILD_TIME__.split('T')[1].substring(0, 8)}
                </div>
                Copyright 2023. SUPERSCHOOL <br />
                all right reserved.
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/*/!* Mobile V *!/*/}
      {/* <nav className="bottom-nav z-100 md:hidden">
        {tabs.map((tab) => {
          const active = [tab.path, ...(tab.extra ?? [])].some((path) => pathname.startsWith(path))
          return (
            <Link key={tab.path} to={tab.path} className={clsx('bottom-nav-item', active && 'text-darkgray')}>
              <tab.icon className="stroke-current" />
              <span>{tab.name}</span>
            </Link>
          )
        })}
      </nav> */}

      <div className="scroll-box h-screen w-full grid-cols-6 overflow-x-hidden overflow-y-scroll md:grid md:overflow-y-hidden">
        <Outlet />
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
