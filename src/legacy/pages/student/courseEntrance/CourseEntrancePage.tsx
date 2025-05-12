// @ts-ignore
import { addHours, differenceInSeconds, format } from 'date-fns'
import { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import sugang from '@/legacy/assets/images/sugang.png'
import { ReactComponent as Logo } from '@/legacy/assets/svg/logo.svg'
import { Blank, Section } from '@/legacy/components/common'
import { externalCreateToken, externalUpdateQueue, useCourseSeasonGet } from '@/legacy/generated/endpoint'
import { childState, toastState } from '@/legacy/store'

export function CourseEntrancePage() {
  const { push } = useHistory()
  const location = useLocation()

  const myChild = useRecoilValue(childState)

  const [waiting, setWaiting] = useState(false)
  const [waitingPosition, setWaitingPosition] = useState(0)
  const [waitingTime, setWaitingTime] = useState(0)
  const [applyTerm, setApplyTerm] = useState('')
  const [applyStartTime, setApplyStartTime] = useState(new Date())
  const [seasonName, setSeasonName] = useState('')
  const [isSeason, setIsSeason] = useState(false)

  const [toastMsg, setToastMsg] = useRecoilState(toastState)

  const params = new URLSearchParams(location.search)

  const [showLoading, setShowLoading] = useState(false)
  const [isJumping, setIsJumping] = useState(false)

  useCourseSeasonGet({
    request: {
      headers: { 'child-user-id': myChild?.id },
    },
    query: {
      enabled: !isSeason,
      onSuccess: (CourseSeason) => {
        const sortOrder = ['InApply', 'InExtraApply', 'Post']
        const courseSeasonData = CourseSeason.filter((c) => sortOrder.includes(c.status)).sort(
          (a, b) => sortOrder.indexOf(a.status) - sortOrder.indexOf(b.status),
        )

        if (courseSeasonData.length === 0 && params.get('enter') !== 'true') {
          push('/student/canteen')
        } else {
          setIsSeason(courseSeasonData.length > 0)
          setSeasonName(courseSeasonData[0].name)
          const startTime = addHours(new Date(courseSeasonData[0].applyStartedAt), 9)
          setApplyStartTime(startTime)

          setApplyTerm(
            format(startTime, 'yyyy-MM-dd HH:mm') +
              ' - ' +
              format(addHours(new Date(courseSeasonData[0].applyEndedAt), 9), 'MM-dd HH:mm'),
          )
        }
      },
    },
  })

  function openSugang(retryCount = 0) {
    const diffSeconds = differenceInSeconds(applyStartTime, new Date())

    if (diffSeconds > 0 && diffSeconds <= 60 * 60) {
      // 60분 = 60 * 60초
      alert(`잠시 후 ${format(applyStartTime, 'HH시 mm분')}에 [수강신청 바로가기] 버튼을 눌러주세요.`)
      setShowLoading(false)
      return
    }

    if (!waiting) {
      setWaiting(true)
    }

    externalUpdateQueue({
      headers: { 'child-user-id': myChild?.id },
      skipRefetch: true,
    })
      .then((ticket: any) => {
        if (ticket && retryCount < 3) {
          if (ticket.status === 'ready') {
            externalCreateToken({
              headers: { 'child-user-id': myChild?.id },
            })
              .then((token) => {
                setShowLoading(false) // 대기표시 삭제
                setIsJumping(true) // 수강신청 이동 대기화면 표시
                if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.startsWith('http://')) {
                  // 로컬
                  window.open(`http://localhost:3300/course/student?sso=${token}`, '_self')
                } else {
                  window.open(`https://${window.location.hostname}/course/student?sso=${token}`, '_self')
                }
              })
              .catch(() => {
                alert('수강신청 접속에 실패했습니다. 잠시후 다시 시도해주세요.')
                push('/student/canteen')
                //setTimeout(() => openSugang(retryCount + 1), 5000);
              })
          } else {
            setShowLoading(false) // 대기표시 삭제
            setWaitingPosition(ticket.position)
            setWaitingTime(ticket.estimatedWaitTime)
            setTimeout(() => openSugang(retryCount), 5000)
          }
        } else {
          alert('수강신청 대기 번호를 받지 못했습니다.')
          push('/student/canteen')
        }
      })
      .catch(() => {
        if (retryCount < 3) {
          setToastMsg('수강신청 대기번호를 다시 요청합니다.')
          setTimeout(() => openSugang(retryCount + 1), 5000)
        } else {
          alert('수강신청 대기 번호를 받지 못했습니다.')
          push('/student/canteen')
        }
      })
  }

  // useEffect(() => {
  //   const params = new URLSearchParams(location.search);
  //   if (params.get('enter') === 'true') {
  //     openSugang();
  //   }
  // }, [location.search]); // URL 변경될 때만 실행

  //if (me?.role === Role.PARENT ? myChild?.school?.isCourseActive : me?.school?.isCourseActive) {
  return (
    <>
      {showLoading && <Blank />}
      {isJumping && <Blank text="수강신청 화면으로 이동합니다. 잠시만 기다려주세요." />}
      <div className="mx-10">
        {waiting ? (
          <>
            <Section className="mt-20">
              <div className="flex justify-center">
                <Logo className="w-[70px]" />
              </div>

              <div className="text-center text-2xl font-bold">
                접속자가 많아 대기 중 입니다
                <br />
                잠시만 기다려주세요
              </div>
            </Section>
            <Section className="mt-5">
              <div className="flex w-full justify-center">
                <div className="h-28 w-60 rounded-xl bg-gray-50 p-5 text-center">
                  <span className="text-base">현재 대기인원</span>
                  <br />
                  <div className="flex items-center justify-center space-x-1 text-center">
                    <span className="text-[32px] font-bold text-orange-400">{waitingPosition}</span>
                    <span className="text-base text-gray-400">명</span>
                  </div>
                </div>
              </div>
              <div className="text-15 text-center text-gray-400">
                <span>예상 대기시간은 </span>
                <span className="text-orange-400">{waitingTime}초</span>
                <span>입니다.</span>
              </div>
            </Section>

            <Section className="fixed bottom-30 left-1/2 -translate-x-1/2 transform">
              <div
                onClick={() => {
                  push('/student/canteen')
                }}
                className="h-12 w-40 cursor-pointer rounded-md border border-gray-400 py-3 text-center text-base"
              >
                슈퍼스쿨로 돌아가기
              </div>
            </Section>
          </>
        ) : (
          <>
            <Section className="mt-20">
              <Logo className="w-[70px] opacity-50" />

              <div>
                <div className="text-2xl font-bold">{isSeason ? '수강신청 기간' : '수강신청 기간이 아닙니다.'}</div>
                <div className="text-16 mt-2 font-semibold text-orange-500">{applyTerm}</div>
                <div className="text-16 text-right font-bold">{seasonName}</div>
              </div>
            </Section>
            <Section className="mt-2">
              <div
                onClick={() => {
                  setShowLoading(true)
                  openSugang()
                }}
                className="flex h-24 cursor-pointer items-center justify-between rounded-xl border border-orange-400 p-5 shadow-lg"
              >
                <div className="flex">
                  <img className="mx-auto h-6 w-auto" src={sugang} alt="" />
                  <div className="ml-2">
                    <span className="text-18 font-bold text-orange-500">수강신청 바로가기</span>
                    <br />
                    <span className="text-14 text-gray-500">슈퍼스쿨에서 쉽고 편하게!</span>
                  </div>
                </div>
                <div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6 13L10.6447 8.40105C10.8409 8.20675 10.8425 7.89016 10.6482 7.69393L6 3"
                      stroke="#FFBC99"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div
                onClick={() => {
                  push('/student/canteen')
                }}
                className="flex h-[76px] cursor-pointer items-center justify-between rounded-xl border border-gray-400 p-5 text-lg font-bold"
              >
                <div className="flex">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="12" fill="#898D94" />
                    <path
                      d="M12.0379 5L7.71379 9.31351L9.00345 10.6L12.0379 7.57297L14.9966 10.5243L16.2862 9.23784L12.0379 5Z"
                      fill="white"
                    />
                    <path d="M6.5 13.4757V11.8108H11.2034V16.8811H9.38276V13.4757H6.5Z" fill="white" />
                    <path d="M17.5 13.4757V11.8108H12.7966V19H14.6172V13.4757H17.5Z" fill="white" />
                  </svg>
                  <span className="text-18 ml-2 font-bold text-gray-500">슈퍼스쿨 바로가기</span>
                </div>
                <div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6 13L10.6447 8.40105C10.8409 8.20675 10.8425 7.89016 10.6482 7.69393L6 3"
                      stroke="#C7CBD1"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </Section>
          </>
        )}
      </div>
    </>
  )
  //}
}
