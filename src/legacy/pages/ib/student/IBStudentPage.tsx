import { Link, Outlet, useLocation } from 'react-router-dom'

import Logo from '@/assets/images/logo_color.png'
import SvgUser from '@/assets/images/no_profile.png'
import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank } from '@/legacy/components'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { Constants } from '@/legacy/constants'
import { useIBProfileGetById } from '@/legacy/container/ib-cas'
import { useLogout } from '@/legacy/util/hooks'
import { makeStudNum5 } from '@/legacy/util/status'
import { useSchoolStore } from '@/stores/school'
import { useUserStore } from '@/stores/user'

export const IBStudentPage = () => {
  const { pathname } = useLocation()
  const { push } = useHistory()
  const logout = useLogout()
  const { me } = useUserStore()
  const { schoolProperties } = useSchoolStore()
  const { data } = useIBProfileGetById(me?.id || 0)

  // 표절 검사 활성화 여부
  const enabledPlagiarismInspect = !!schoolProperties?.find((property) => property.key === 'COPYKILLER_LICENSE_KEY')
    ?.value

  if (me == null) {
    return <div>접속 정보를 불러올 수 없습니다.</div>
  }

  if (!me?.klassGroupName || me?.studentNumber === null) {
    return <ErrorBlank text="학급 정보를 불러올 수 없습니다. 관리자에게 문의해 주세요." />
  }

  const match = me?.klassGroupName.match(/(\d)학년 (\d{1,2})반/)
  if (!match) {
    return <ErrorBlank text="학급 정보를 불러올 수 없습니다. 관리자에게 문의해 주세요." />
  }
  const [_, gradeStr, classNumStr] = match
  const grade = parseInt(gradeStr, 10)
  const classNum = parseInt(classNumStr, 10)

  return (
    <div className="flex">
      <div className="w-[224px] flex-shrink-0">
        <div className="border-primary-gray-200 flex h-screen flex-grow flex-col gap-6 border-r bg-white py-10">
          {/* 로고 영역 */}
          <div className="h-10 w-full px-5">
            <img src={Logo} className="h-10 w-[70px] object-cover" />
          </div>
          {/* 학생 프로필 영역 */}
          <div className="border-b-primary-gray-100 flex items-center gap-3 border-b px-5 pb-6 select-none">
            <div className="flex h-12 w-12 overflow-hidden rounded-xl">
              <img
                className="mx-auto h-12 w-12 rounded-xl"
                src={`${Constants.imageUrl}${me?.profile}`}
                alt=""
                loading="lazy"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null // prevents looping
                  currentTarget.src = SvgUser
                  currentTarget.className = 'w-full'
                }}
              />
            </div>
            <div className="flex h-12 flex-1 flex-col justify-between gap-1">
              <div className="flex items-center">
                <Typography variant="title3">{me?.name.length > 5 ? `${me?.name.slice(0, 5)}` : me?.name}</Typography>
                <span className="mx-1">·</span>
                <Typography variant="title3">
                  {makeStudNum5({ grade, classNum, studentNum: me?.studentNumber })}
                </Typography>
              </div>
              {/* <Typography variant="caption2" className="font-medium text-primary-gray-500">
                응시코드 18472
              </Typography> */}
              <Typography variant="caption2" className="text-primary-gray-500 font-medium">
                응시코드 {data?.ibCode || '-'}
              </Typography>
            </div>
          </div>
          {/* 메뉴바 */}
          <div className="scroll-box h-screen-13 flex flex-grow flex-col overflow-y-auto px-3 tracking-tighter">
            <nav className={`flex-1`} aria-label="Sidebar">
              <Link
                className="hover:bg-primary-gray-50 flex flex-row items-center gap-2 px-2 py-4 hover:rounded-lg"
                to={'/ib/student'}
              >
                <ColorSVGIcon.Project size={24} color={pathname === '/ib/student' ? 'orange800' : 'gray400'} />
                <Typography
                  variant="title3"
                  className={pathname === '/ib/student' ? 'text-primary-orange-800' : 'text-primary-gray-900'}
                >
                  프로젝트
                </Typography>
              </Link>
              <div
                className="hover:bg-primary-gray-50 flex cursor-pointer flex-row items-center gap-2 px-2 py-4 hover:rounded-lg"
                onClick={() => {
                  window.open(
                    'https://essayreview.co.kr/apa-citation-generator',
                    '_blank',
                    'width=800,height=600,scrollbars=yes',
                  )
                }}
              >
                <ColorSVGIcon.Reference size={24} color="gray400" />
                <Typography variant="title3" className="flex-1">
                  APA 출처생성기
                </Typography>
                <SVGIcon.TopRightFillArrow size={24} color="gray400" />
              </div>

              {enabledPlagiarismInspect && (
                <Link
                  className="hover:bg-primary-gray-50 flex flex-row items-center gap-2 px-2 py-4 hover:rounded-lg"
                  to={'/ib/student/plagiarism-inspection'}
                >
                  <ColorSVGIcon.CopyCheck
                    size={24}
                    color={pathname.startsWith('/ib/student/plagiarism-inspection') ? 'orange' : 'gray400'}
                  />
                  <Typography
                    variant="title3"
                    className={
                      pathname.startsWith('/ib/student/plagiarism-inspection')
                        ? 'text-primary-orange-800'
                        : 'text-primary-gray-900'
                    }
                  >
                    표절률 검사
                  </Typography>
                </Link>
              )}
            </nav>
          </div>
          {/* 하단 버튼 영역 */}
          <div className="flex flex-col gap-4 px-5">
            <ButtonV2 color="gray100" size={40} variant="solid" onClick={() => push('/student')}>
              슈퍼스쿨 바로가기
            </ButtonV2>
            <div className="flex w-full items-center">
              <Typography
                variant="caption"
                className="text-primary-gray-600 w-1/2 cursor-pointer text-center"
                onClick={() => alert('내정보 관리')}
              >
                내정보 관리
              </Typography>
              <div className="h-3 w-px bg-[#e8eaec]" />
              <Typography
                variant="body3"
                className="text-primary-gray-600 w-1/2 cursor-pointer text-center text-[13px]"
                onClick={logout}
              >
                로그아웃
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <div className="scroll-box h-screen w-full grid-cols-6 overflow-x-hidden overflow-y-scroll md:grid md:overflow-y-hidden">
        <Outlet />
      </div>
    </div>
  )
}
