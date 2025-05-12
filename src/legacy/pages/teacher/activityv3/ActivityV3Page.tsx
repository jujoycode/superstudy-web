import _, { range } from 'lodash'
import { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router'
import { SessionDownloadModal } from '@/legacy/components/activityv3/SessionDownloadModal'
import { BackButton, Select, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Icon } from '@/legacy/components/common/icons'
import { ACTIVITYV3_TYPE_KOR, ACTIVITY_SESSION_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import { useActivitySessionFindByTeacher, useActivityV3FindByTeacher } from '@/legacy/generated/endpoint'
import { ActivitySession, ActivitySessionWithCountDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getThisYear, makeDateToString, makeTimeToString } from '@/legacy/util/time'

export function ActivityV3Page() {
  const { push } = useHistory()
  const { t } = useLanguage()

  const [searchTitle, setSearchTitle] = useState('')
  const [openedActivityIds, setOpenedActivityIds] = useState<number[]>([])
  const [sessionDatas, setSessionDatas] = useState<Record<number, ActivitySessionWithCountDto[]>>({})
  const isMyActivityV3 = localStorage.getItem('isMyActivityV3') || ''
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<number>()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [subject, setSubject] = useState('')
  const [year, setYear] = useState<number>(0)
  const [_isMyActivityV3, _setMyActivityV3] = useState(isMyActivityV3 || '')

  const setMyActivityV3 = (isMyActivityV3: string) => {
    localStorage.setItem('isMyActivityV3', isMyActivityV3)
    _setMyActivityV3(isMyActivityV3)
  }

  const {
    data: activityv3s,
    refetch,
    isLoading,
    isError,
  } = useActivityV3FindByTeacher({
    title: title || undefined,
    subjectType: undefined,
    subject: undefined,
    isMyActivityV3,
    type,
    ...(year ? { year } : {}),
  })

  const { data: activitySessions, isLoading: sessionLoading } = useActivitySessionFindByTeacher(
    { ids: openedActivityIds },
    { query: { enabled: !!openedActivityIds && openedActivityIds.length > 0 } },
  )

  useEffect(() => {
    if (sessionLoading) return
    activitySessions &&
      setSessionDatas(
        activitySessions?.reduce((acc: any, cur: ActivitySession) => {
          return { ...acc, [cur.activityv3Id]: [...(acc[cur.activityv3Id] || []), cur] }
        }, []) || {},
      )
  }, [activitySessions])

  useEffect(() => {
    if (!_isMyActivityV3 && isMyActivityV3) {
      _setMyActivityV3(isMyActivityV3)
    }
  }, [isMyActivityV3])

  const thisYear = +getThisYear()

  return (
    <div className="col-span-6">
      <div className="md:hidden">
        <TopNavbar
          title="활동기록"
          left={<BackButton />}
          right={
            <Link to="/teacher/activityv3/add" className="text-brand-1">
              활동 추가
            </Link>
          }
        />
      </div>
      {/* 활동기록부 리스트 */}
      {/* 배경 */}
      <div className="h-screen-6 flex flex-col bg-gray-50 md:h-screen">
        {/* 활동기록 박스 */}
        <div className="3xl:mx-[208px] 3xl:my-[64px] 3xl:px-30 3xl:py-20 overflow-hidden bg-white p-2 md:h-screen md:px-10 md:py-5 lg:mx-10 lg:my-6">
          {/* 활동기록 Header */}
          <div className="flex w-full flex-row items-center justify-between gap-2 pb-2">
            <div className="flex flex-col">
              <div className="text-3xl font-bold">활동기록</div>
              <div className="text-lg font-normal text-[#444444]">
                교과, 창체, 기타 활동을 생성하고, 각 활동에 차시를 추가할 수 있습니다.
              </div>
            </div>
            {activityv3s?.length !== 0 && (
              <Button.lg
                children="활동 생성하기"
                onClick={() => push('/teacher/activityv3/add')}
                className="bg-orange-500 text-white"
              />
            )}
          </div>
          <div className="flex w-full items-center justify-between py-4">
            <div className="flex space-x-2">
              <Select.lg value={year} onChange={(e) => setYear(Number(e.target.value))}>
                <option defaultChecked hidden>
                  {t('year', '년도')}
                </option>
                <option value={0}>{t('all', '전체')}</option>
                {range(thisYear, thisYear - 3, -1).map((year) => (
                  <option value={year} key={year}>
                    {year}학년도
                  </option>
                ))}
              </Select.lg>
              <Select.lg
                placeholder="반 선택"
                value={_isMyActivityV3}
                onChange={(e) => setMyActivityV3(e.target.value)}
              >
                <option value={'my'}>{'내 활동'}</option>
                <option value={'myGroup'}>{'내 그룹 활동'}</option>
                <option value={''}>{'전체 활동'}</option>
              </Select.lg>
              <Select.lg
                placeholder="타입 선택"
                value={type}
                onChange={(e) => {
                  setType(e.target.value)
                  setSubject('')
                }}
              >
                <option value={''}>{'전체'}</option>
                {Object.entries(ACTIVITYV3_TYPE_KOR).map(([type, kor]) => (
                  <option key={type} value={type}>
                    {kor}
                  </option>
                ))}
              </Select.lg>
              <Select.lg placeholder="과목 선택" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value={''}>{'전체'}</option>
                {_.uniqBy(activityv3s, 'subject').map(({ subject }) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </Select.lg>
            </div>

            <div className="flex items-center space-x-2">
              <SearchInput
                placeholder="제목을 입력해주세요."
                value={searchTitle}
                onChange={(e) => {
                  setSearchTitle(e.target.value)
                  if (e.target.value === '') {
                    setTitle('')
                  }
                }}
                onSearch={() => setTitle(searchTitle)}
              />
              <Icon.Search className="h-6 w-6 cursor-pointer" onClick={() => setTitle(searchTitle)} />
            </div>
          </div>

          {/* 테이블 영역 */}
          <div className="scroll-box h-screen-18 md:h-screen-10 lg:h-screen-10 2xl:h-screen-12 3xl:h-screen-18 relative min-w-2/3 overflow-y-auto pb-20">
            <table className="text-10 w-full border-separate border-spacing-0 text-center md:text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-white">
                  <th className="w-20 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">타입</th>
                  <th className="w-30 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">
                    과목/차시
                  </th>
                  <th className="w-96 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">활동명</th>
                  <th className="w-48 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">
                    활동 기간
                  </th>
                  <th className="w-28 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">
                    제출/총인원
                  </th>
                  <th className="table-cell w-36 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="py-4 text-center" colSpan={6}>
                      로딩 중...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className="py-4 text-center" colSpan={6}>
                      데이터를 불러오지 못했습니다. 잠시 후 다시 접속해주세요.
                    </td>
                  </tr>
                )}
                {activityv3s?.length === 0 ? (
                  title === '' ? (
                    <tr>
                      <td colSpan={6} className="pt-14">
                        <div className="flex w-full flex-col items-center justify-center gap-4">
                          <Button.lg
                            children="활동 생성하기"
                            onClick={() => push('/teacher/activityv3/add')}
                            className="h-12 w-40 bg-orange-500 text-white"
                          />
                          <p className="text-center text-neutral-500">
                            &#39;활동 생성하기&#39; 버튼을 눌러 활동기록을 시작해 보세요.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={6} className="pt-14">
                        <div className="flex w-full flex-col items-center justify-center gap-4">
                          <p className="text-center text-lg text-neutral-500">검색 결과가 없습니다.</p>
                        </div>
                      </td>
                    </tr>
                  )
                ) : (
                  <>
                    {activityv3s
                      ?.filter((el) => (subject ? el.subject === subject : true))
                      ?.map((el) => (
                        <>
                          <tr key={el.id} className="h-14">
                            <td className="border-b border-[#EEEEEE] px-2 py-2 text-[#333333]">
                              {ACTIVITYV3_TYPE_KOR[el.type]}
                            </td>
                            <td className="border-b border-[#EEEEEE] px-2 py-2 text-[#333333]">{el.subject}</td>
                            <td
                              className="cursor-pointer border-b border-[#EEEEEE] px-2 py-2 text-[#333333] hover:underline hover:underline-offset-4"
                              onClick={() => push(`/teacher/activityv3/${el.id}`)}
                            >
                              {el.title}
                            </td>
                            <td className="border-b border-[#EEEEEE] px-2 py-2 text-[#333333]">
                              {el.startDate && el.endDate
                                ? `${makeDateToString(el.startDate, '.')} ~ ${makeDateToString(el.endDate, '.')}`
                                : '-'}
                            </td>
                            <td className="border-b border-[#EEEEEE] px-2 py-2 text-[#333333]">
                              <span className="text-brand-1">{el.submittedCount}</span> / {el.allCount}
                            </td>
                            <td
                              className="cursor-pointer border-b border-[#EEEEEE] px-2 py-2 text-[#333333]"
                              onClick={() =>
                                openedActivityIds.includes(el.id)
                                  ? setOpenedActivityIds(openedActivityIds.filter((id) => id !== el.id))
                                  : setOpenedActivityIds(openedActivityIds.concat(el.id))
                              }
                              style={{ textAlign: 'right' }}
                            >
                              <div className="flex items-center justify-end gap-2">
                                {openedActivityIds.includes(el.id) ? (
                                  <Icon.ChevronUp />
                                ) : (
                                  el.isSessionExist && <Icon.ChevronDown />
                                )}
                              </div>
                            </td>
                          </tr>
                          {openedActivityIds.includes(el.id) &&
                            (!sessionDatas[el.id] && sessionLoading ? (
                              <tr className="w-full py-2 text-center">차시 불러오는 중...</tr>
                            ) : (
                              _.chain(sessionDatas[el.id] || [])
                                .sortBy('activitySessionOrder_order')
                                .map((session) => (
                                  <tr key={session.id} className="bg-neutral-50">
                                    <td className="w-20 border-b border-[#EEEEEE] px-2 py-2 text-[#333333]">
                                      <div className="ml-0 flex items-center justify-center gap-0 md:ml-4 md:gap-2">
                                        <Icon.Reply />
                                        <div>{ACTIVITY_SESSION_TYPE_KOR[session.type]}</div>
                                      </div>
                                    </td>
                                    <td className="w-30 border-b border-[#EEEEEE] px-2 py-2 text-[#333333]">
                                      {session?.activitySessionOrder_view_order
                                        ? session.activitySessionOrder_view_order + '차시'
                                        : ''}
                                    </td>
                                    <td
                                      className="w-96 cursor-pointer border-b border-[#EEEEEE] px-2 py-2 text-[#333333] hover:underline hover:underline-offset-4"
                                      onClick={() => push(`/teacher/activityv3/${el.id}/session/${session.id}`)}
                                    >
                                      {session.title}
                                    </td>
                                    <td className="w-48 border-b border-[#EEEEEE] px-2 py-2 text-[#333333]">
                                      {session.endDate
                                        ? `~ ${makeDateToString(session.endDate)} ${makeTimeToString(session.endDate)}`
                                        : '-'}
                                    </td>
                                    <td className="w-28 border-b border-[#EEEEEE] px-2 py-2 text-[#333333]">
                                      <span className="text-brand-1">{session.submittedCount}&nbsp;</span>/&nbsp;
                                      {el.allCount}
                                    </td>
                                    <td
                                      className="table-cell w-36 border-b border-[#EEEEEE] px-2 py-2 text-[#333333]"
                                      style={{ textAlign: 'right' }}
                                    >
                                      <Button
                                        className="hidden rounded-lg border border-[#333333] bg-white md:inline-block"
                                        onClick={() => {
                                          setSelectedSessionId(session.id)
                                          setDownloadModalOpen(true)
                                        }}
                                      >
                                        제출현황 다운로드
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                                .value()
                            ))}
                        </>
                      ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SessionDownloadModal
        sessionId={selectedSessionId}
        modalOpen={isDownloadModalOpen}
        setModalClose={() => setDownloadModalOpen(false)}
      />
    </div>
  )
}
