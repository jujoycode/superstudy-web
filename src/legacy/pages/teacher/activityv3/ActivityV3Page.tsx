import { useEffect, useState } from 'react'
import _ from 'lodash'
import { useHistory } from '@/hooks/useHistory'
import { Button } from '@/atoms/Button'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { SessionDownloadModal } from '@/legacy/components/activityv3/SessionDownloadModal'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { ACTIVITYV3_TYPE_KOR, ACTIVITY_SESSION_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import { useActivitySessionFindByTeacher, useActivityV3FindByTeacher } from '@/legacy/generated/endpoint'
import { ActivitySession } from '@/legacy/generated/model'
import { getThisYear, makeDateToString, makeTimeToString } from '@/legacy/util/time'

interface ActivitySessionWithOrder extends ActivitySession {
  activitySessionOrder_view_order?: string | number
  submittedCount: number
}

export function ActivityV3Page() {
  const { push } = useHistory()
  const [searchTitle, setSearchTitle] = useState('')
  const [openedActivityIds, setOpenedActivityIds] = useState<number[]>([])
  const [sessionDatas, setSessionDatas] = useState<Record<number, ActivitySession[]>>({})
  const isMyActivityV3 = localStorage.getItem('isMyActivityV3') || ''
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<number>()
  const [title] = useState('')
  const [type, setType] = useState('')
  const [subject, setSubject] = useState('')
  const [year, setYear] = useState<number>(+getThisYear())
  const [_isMyActivityV3, _setMyActivityV3] = useState(isMyActivityV3 || 'all')

  const setMyActivityV3 = (isMyActivityV3: string) => {
    localStorage.setItem('isMyActivityV3', isMyActivityV3)
    _setMyActivityV3(isMyActivityV3)
  }

  const {
    data: activityv3s,
    isLoading,
    isError,
  } = useActivityV3FindByTeacher({
    title: title || undefined,
    subjectType: undefined,
    subject: undefined,
    isMyActivityV3: _isMyActivityV3 || undefined,
    type: type || undefined,
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
        activitySessions?.reduce(
          (acc: Record<number, ActivitySession[]>, cur: ActivitySession) => {
            return { ...acc, [cur.activityv3Id]: [...(acc[cur.activityv3Id] || []), cur] }
          },
          {} as Record<number, ActivitySession[]>,
        ) || {},
      )
  }, [activitySessions, sessionLoading])

  useEffect(() => {
    if (!_isMyActivityV3 && isMyActivityV3) {
      _setMyActivityV3(isMyActivityV3)
    }
  }, [isMyActivityV3, _isMyActivityV3])

  const thisYear = +getThisYear()

  return (
    <div className="w-full">
      <ResponsiveRenderer mobile={<TopNavbar title="활동기록" left={<BackButton />} />} />
      {/* 활동기록부 리스트 */}
      {/* 배경 */}
      <Grid>
        <GridItem colSpan={12}>
          {/* 활동기록 박스 */}
          <div className="3xl:mx-[208px] 3xl:my-[64px]overflow-hidden bg-white p-2 md:h-screen">
            <PageHeaderTemplate
              title="활동기록"
              description="교과, 창체, 기타 활동을 생성하고, 각 활동에 차시를 추가할 수 있습니다."
              config={{
                topBtn: {
                  label: '활동 생성',
                  color: 'primary',
                  variant: 'solid',
                  action: () => push('/teacher/activityv3/add'),
                },
                filters: [
                  {
                    items: _.range(thisYear, thisYear - 3, -1).map((year) => ({
                      label: `${year}학년도`,
                      value: `${year}`,
                    })),
                    filterState: { value: year.toString(), setValue: (v) => setYear(Number(v)) },
                  },
                  {
                    items: [
                      { label: '전체 활동', value: 'all' },
                      { label: '내 활동', value: 'my' },
                      { label: '내 그룹 활동', value: 'myGroup' },
                    ],
                    filterState: { value: _isMyActivityV3, setValue: (v) => setMyActivityV3(v as string) },
                  },
                  {
                    items: [
                      { label: '전체', value: 'all' },
                      ...Object.entries(ACTIVITYV3_TYPE_KOR).map(([type, kor]) => ({ label: kor, value: type })),
                    ],
                    filterState: {
                      value: type,
                      setValue: (v) => {
                        setType(v)
                        setSubject('all')
                      },
                    },
                  },
                  {
                    items: [
                      { label: '전체', value: 'all' },
                      ..._.uniqBy(activityv3s, 'subject').map(({ subject }) => ({ label: subject, value: subject })),
                    ],
                    filterState: { value: subject, setValue: (v) => setSubject(v) },
                  },
                ],
                searchBar: {
                  placeholder: '제목을 입력해주세요',
                  searchState: { value: searchTitle, setValue: setSearchTitle },
                },
              }}
            />

            {/* 테이블 영역 */}
            <div className="scroll-box relative min-w-2/3 overflow-y-auto px-8 pb-20">
              <table className="text-10 w-full border-separate border-spacing-0 text-center md:text-sm">
                <thead>
                  <tr className="sticky top-0 z-10 bg-white">
                    <th className="w-20 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">타입</th>
                    <th className="w-30 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">
                      과목/차시
                    </th>
                    <th className="w-96 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">
                      활동명
                    </th>
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
                        데이터를 불러오지 못했습니다.
                        <br />
                        잠시 후 다시 접속해주세요.
                      </td>
                    </tr>
                  )}
                  {activityv3s?.length === 0 ? (
                    title === '' ? (
                      <tr>
                        <td colSpan={6} className="pt-14">
                          <div className="flex w-full flex-col items-center justify-center gap-4">
                            <Button
                              size="lg"
                              children="활동 생성하기"
                              onClick={() => push('/teacher/activityv3/add')}
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
                                <span className="text-primary-800">{el.submittedCount}</span> / {el.allCount}
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
                                        {(session as ActivitySessionWithOrder)?.['activitySessionOrder_view_order']
                                          ? (session as ActivitySessionWithOrder)['activitySessionOrder_view_order'] +
                                            '차시'
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
                                        <span className="text-primary-800">
                                          {(session as ActivitySessionWithOrder).submittedCount}&nbsp;
                                        </span>
                                        /&nbsp;
                                        {el.allCount}
                                      </td>
                                      <ResponsiveRenderer
                                        default={
                                          <td
                                            className="table-cell w-36 border-b border-[#EEEEEE] px-2 py-2 text-[#333333]"
                                            style={{ textAlign: 'right' }}
                                          >
                                            <Button
                                              size="md"
                                              variant="outline"
                                              children="제출현황 다운로드"
                                              className="border-[#333] text-[#333]"
                                              onClick={() => {
                                                setSelectedSessionId(session.id)
                                                setDownloadModalOpen(true)
                                              }}
                                            />
                                          </td>
                                        }
                                      />
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
        </GridItem>
      </Grid>

      <SessionDownloadModal
        sessionId={selectedSessionId}
        modalOpen={isDownloadModalOpen}
        setModalClose={() => setDownloadModalOpen(false)}
      />
    </div>
  )
}
