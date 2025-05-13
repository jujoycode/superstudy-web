import { range } from 'lodash'
import { useMemo, useState } from 'react'
import { useQueryClient } from 'react-query'
import { Route, Routes, useLocation } from 'react-router'

import { ReactComponent as Refresh } from '@/assets/svg/refresh.svg'
import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank, FrontPagination } from '@/legacy/components'
import { AbsentCard } from '@/legacy/components/absent/AbsentCard'
import { AbsentsExcelDownloadView } from '@/legacy/components/absent/AbsentsExcelDownloadView'
import { BackButton, Blank, Select, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { FieldtripCard } from '@/legacy/components/fieldtrip/FieldtripCard'
import { FieldtripExcelDownloadView } from '@/legacy/components/fieldtrip/FieldtripExcelDownloadView'
import { OutingCard } from '@/legacy/components/outing/OutingCard'
import { OutingsExcelDownloadView } from '@/legacy/components/outing/OutingExcelDownloadView'
import { AbsentsDownloadView } from '@/legacy/components/pdfDocs/AbsentsDownloadView'
import { FieldtripsDownloadView } from '@/legacy/components/pdfDocs/FieldtripsDownloadView'
import { useTeacherHistory } from '@/legacy/container/teacher-history'
import { useTeacherKlassGroup } from '@/legacy/container/teacher-klass-groups'
import { UserContainer } from '@/legacy/container/user'
import { AbsentStatus, ResponseCreateOutingDto, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { PermissionUtil } from '@/legacy/util/permission'
import { getSearchYearByMonth, getThisYear, makeStartEndToString } from '@/legacy/util/time'

import { HistoryAbsentDetailPage } from './HistoryAbsentDetailPage'
import { HistoryFieldtripDetailPage } from './HistoryFieldtripDetailPage'
import { HistoryOutingDetailPage } from './HistoryOutingDetailPage'

export interface MergedGroupType {
  id: number
  name: string
  type: string
}

export function HistoryPage() {
  const queryClient = useQueryClient()
  const { t } = useLanguage()
  const { replace } = useHistory()
  const { pathname } = useLocation()

  const isDetail = !pathname.endsWith('/teacher/absent')
  const thisYear = +getThisYear()
  const { me } = UserContainer.useContext()

  const [_studentName, set_studentName] = useState('')

  const {
    outings,
    absents,
    fieldtrips,
    isLoading,
    error,
    state: { startDate, endDate, selectedYear, selectedMonth, selectedGroup, page, isCsvData, limit, selectedDocType },
    setState: {
      setStartDate,
      setEndDate,
      setSelectedYear,
      setSelectedMonth,
      setSelectedDocType,
      setSelectedGroup,
      setPage,
      setCsvData,
      setOutingId,
      setOpen,
      setAgreeAll,
      setAbsentId,
      setFieldtripId,
    },
    submitAbsent,
    submitNiceAbsent,
  } = useTeacherHistory()

  const { allKlassGroupsUnique: allKlassGroups, homeKlass } = useTeacherKlassGroup(selectedYear)

  const klassList = useMemo<MergedGroupType[]>(() => {
    if (allKlassGroups && allKlassGroups.length > 0) {
      const mergedGroups: MergedGroupType[] = []

      const gradeRegex = /(\d{1,2})학년/
      let preGrade = ''
      for (const klassGroup of allKlassGroups) {
        const match = klassGroup.name?.match(gradeRegex)

        if (match) {
          const grade = match[1]

          if (PermissionUtil.isExecutiveTeachers(me?.role) || me?.role === Role.ADMIN) {
            if ((me?.role === Role.PRE_HEAD || me?.role === Role.HEAD) && me?.headNumber.toString() !== grade) {
              continue
            }

            if (preGrade !== grade) {
              mergedGroups.push({
                id: Number('-' + grade + '00'),
                name: grade.toString() + '학년 전체',
                type: 'KLASS',
              })

              preGrade = grade
            }

            mergedGroups.push({
              id: klassGroup.id,
              name: klassGroup.name || '',
              type: klassGroup.type,
            })
          } else {
            if (homeKlass && klassGroup.id === homeKlass?.id) {
              mergedGroups.push({
                id: homeKlass.id,
                name: homeKlass.name || '',
                type: homeKlass.type,
              })
            }
          }
        }
      }

      return mergedGroups
    }
    return []
  }, [allKlassGroups])

  return (
    <>
      {/* Mobile V */}
      <div className="block md:hidden">
        <TopNavbar title="출결서류관리" left={<BackButton />} />
        <br />
        <div className="flex h-full w-full items-center text-center">
          <p>모바일 환경에서 지원하지 않는 메뉴입니다.</p>
        </div>

        <br />
        <br />
      </div>

      {/* Desktop V */}
      {error && <ErrorBlank />}
      {isLoading && <Blank reversed />}

      <div className={`h-screen-7 col-span-3 md:h-screen ${isDetail ? 'hidden' : 'block'} md:block`}>
        <div className="md:hidden">
          <TopNavbar
            title={t('attendance_documents_management', '출결서류관리')}
            left={<BackButton />}
            right={
              <div onClick={() => queryClient.refetchQueries({ active: true })} className="text-brand-1 text-sm">
                <Refresh />
              </div>
            }
          />
        </div>
        <div className="overflow-y-auto">
          <div className="scroll-box flex flex-col overflow-x-scroll px-6 py-4">
            <div className="hidden md:block">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{t('attendance_documents_management', '출결서류관리')}</h1>
                <div
                  className="text-brand-1 cursor-pointer text-lg"
                  onClick={() => queryClient.refetchQueries({ active: true })}
                >
                  {t('refresh', '새로고침')}
                </div>
              </div>
              <div className="text-grey-5 mb-5 text-sm">{`※ 확인증, ${t(
                `absentTitle`,
                '결석신고서',
              )}, 체험학습 과거이력관리`}</div>
            </div>
            <div className="mb-2 flex items-center space-x-3">
              <div className="flex items-center space-x-1" id="menu">
                <Select.lg
                  placeholder="출결서류"
                  value={selectedDocType}
                  onChange={(e) => {
                    setSelectedDocType(Number(e.target.value))
                    if (e.target.value === '2') {
                      setSelectedGroup(null)
                    }
                  }}
                  className="h-11 text-sm"
                >
                  <option value={-1}>{'서류선택'}</option>
                  <option value={0}>{'확인증'}</option>
                  <option value={1}>{t(`absentTitle`, '결석신고서')}</option>
                  <option value={2}>{'체험학습'}</option>
                </Select.lg>

                <Select.lg
                  className="text-sm"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value))
                    const year = Number(e.target.value)
                    const month = selectedMonth

                    if (month > 0 && year > 0) {
                      const startDate = new Date(year, month - 1, 1)
                      const endDate = new Date(year, month, 0)

                      setStartDate(DateUtil.formatDate(startDate || '', DateFormat['YYYY-MM-DD']))
                      setEndDate(DateUtil.formatDate(endDate || '', DateFormat['YYYY-MM-DD']))
                    }
                  }}
                >
                  <option value={-1}>{'년도선택'}</option>
                  {range(
                    thisYear,
                    PermissionUtil.isExecutiveTeachers(me?.role) || me?.role === Role.ADMIN
                      ? thisYear - 4
                      : thisYear - 2,
                    -1,
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}학년도
                    </option>
                  ))}
                </Select.lg>

                <Select.lg
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(Number(e.target.value))
                    const year = selectedYear
                    const month = Number(e.target.value)

                    if (year > 0 && month > 0) {
                      const searchYear = getSearchYearByMonth(year, month)
                      const startDate = new Date(searchYear, month - 1, 1)
                      const endDate = new Date(searchYear, month, 0)

                      setStartDate(DateUtil.formatDate(startDate || '', DateFormat['YYYY-MM-DD']))
                      setEndDate(DateUtil.formatDate(endDate || '', DateFormat['YYYY-MM-DD']))
                    }
                  }}
                >
                  <option value={-1}>월선택</option>
                  {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((month) => (
                    <option key={month} value={month}>
                      {month}월
                    </option>
                  ))}
                </Select.lg>

                <Select.lg
                  value={selectedGroup?.id || ''}
                  onChange={(e) => {
                    setSelectedGroup(klassList?.find((tg: any) => tg.id === Number(e.target.value)) || null)
                    if (selectedDocType < 0) return
                  }}
                >
                  <option value={-1}>{'반선택'}</option>
                  {klassList
                    ?.filter((group: MergedGroupType) => group.name !== '0학년 0반')
                    ?.map((group: MergedGroupType) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                </Select.lg>
              </div>
            </div>

            <div className="mb-2 ml-3 flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <SearchInput
                  placeholder="이름 검색"
                  value={_studentName}
                  onChange={(e) => {
                    set_studentName(e.target.value)
                    if (e.target.value === '') replace(`/teacher/history`)
                    setPage(1)
                  }}
                  onSearch={() => _studentName && replace(`/teacher/history?username=${_studentName}`)}
                  className="w-full"
                />
                <Icon.Search
                  onClick={() => {
                    if (selectedDocType === -1) {
                      alert('서류 종류를 선택해주세요.')
                      return
                    }

                    if (selectedYear === -1) {
                      alert('년도를 선택해주세요.')
                      return
                    }

                    if (selectedMonth === -1) {
                      alert('월을 선택해주세요.')
                      return
                    }

                    _studentName === ''
                      ? alert('텍스트 내용을 입력해주세요.')
                      : replace(`/teacher/history?username=${_studentName}`)
                  }}
                />
              </div>

              <div className="grid auto-cols-fr grid-flow-col gap-2 max-md:hidden">
                {/* 결석신고서 */}
                {selectedDocType === 1 && (
                  <>
                    {/* PDF 버튼 */}
                    <AbsentsDownloadView
                      fileName={`결석신고서_${makeStartEndToString(startDate, endDate)}`}
                      absents={absents?.items
                        ?.slice()
                        // .filter((absent) =>
                        //   selectedGroup
                        //     ? absent?.studentGradeKlass === selectedGroup?.name &&
                        //       absent?.absentStatus === AbsentStatus.PROCESSED &&
                        //       isViewAuth
                        //     : absent?.absentStatus === AbsentStatus.PROCESSED && isViewAuth,
                        // )
                        .filter((absent) => absent.absentStatus === AbsentStatus.PROCESSED)
                        .filter(
                          (absent) =>
                            new Date(absent.endAt).setHours(0, 0, 0, 0) >= new Date(startDate).setHours(0, 0, 0, 0) &&
                            new Date(absent.startAt).setHours(0, 0, 0, 0) <= new Date(endDate).setHours(0, 0, 0, 0),
                        )
                        .sort((a, b) => new Date(a?.startAt || '').getTime() - new Date(b?.startAt || '').getTime())}
                      setCsvData={(b: boolean) => setCsvData(b)}
                      isCsvData={isCsvData}
                    />
                    {/* Excel 버튼 */}
                    <AbsentsExcelDownloadView
                      startDate={startDate}
                      endDate={endDate}
                      selectedGroupId={selectedGroup && selectedGroup.id ? selectedGroup.id : undefined}
                      year={selectedYear ? selectedYear.toString() : undefined}
                    />
                  </>
                )}
                {/* 확인증 */}
                {selectedDocType === 0 && (
                  <>
                    {/* 확인증현황 Excel 버튼 */}
                    <div className="hidden items-center md:block">
                      <OutingsExcelDownloadView
                        startDate={startDate}
                        endDate={endDate}
                        selectedGroupId={selectedGroup && selectedGroup.id ? selectedGroup.id : undefined}
                        username={_studentName}
                      />
                    </div>
                  </>
                )}
                {/* 체험학습 */}
                {selectedDocType === 2 && (
                  <>
                    <div className="hidden items-center md:block">
                      <FieldtripsDownloadView
                        fileName={`체험학습_${makeStartEndToString(startDate, endDate)}`}
                        fieldtrips={fieldtrips?.items
                          ?.slice()
                          .sort((a, b) => {
                            return a.startAt < b.startAt ? -1 : a.startAt > b.startAt ? 1 : 0
                          })
                          .filter((fieldtrip) => me?.role && fieldtrip?.fieldtripResultStatus === 'PROCESSED')
                          .filter(
                            (fieldtrip) =>
                              new Date(fieldtrip.endAt).setHours(0, 0, 0, 0) >=
                                new Date(startDate).setHours(0, 0, 0, 0) &&
                              new Date(fieldtrip.startAt).setHours(0, 0, 0, 0) <=
                                new Date(endDate).setHours(0, 0, 0, 0),
                          )}
                        setCsvData={(b: boolean) => setCsvData(b)}
                        isCsvData={isCsvData}
                      />
                    </div>
                    <div className="hidden items-center md:block">
                      {/* 체험학습현황 Excel 버튼 */}
                      <FieldtripExcelDownloadView
                        startDate={startDate}
                        endDate={endDate}
                        fieldtripStatus={'PROCESSED'}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="h-0.5 bg-gray-100"></div>
          </div>

          <div className="scroll-box h-screen-16 overflow-y-auto">
            {/* 결석신고서 */}
            {selectedDocType === 1 &&
              absents?.items
                .filter(
                  (absent) =>
                    new Date(absent.endAt).setHours(0, 0, 0, 0) >= new Date(startDate).setHours(0, 0, 0, 0) &&
                    new Date(absent.startAt).setHours(0, 0, 0, 0) <= new Date(endDate).setHours(0, 0, 0, 0),
                )
                .sort((a, b) => new Date(a?.startAt || '').getTime() - new Date(b?.startAt || '').getTime())
                .map((absent) => (
                  <AbsentCard
                    key={absent.id}
                    absent={absent}
                    submitAbsent={submitAbsent}
                    submitNiceAbsent={submitNiceAbsent}
                    page={page}
                    limit={limit}
                    type={'history'}
                  />
                ))}
            {selectedDocType === 1 && absents && absents?.total > limit && (
              <div className="grid place-items-center">
                <FrontPagination
                  basePath="/teacher/absent"
                  total={absents?.total}
                  limit={limit}
                  page={page}
                  setPage={setPage}
                />
              </div>
            )}

            {/* 확인증 */}
            {selectedDocType === 0 &&
              outings?.items?.map((outing: ResponseCreateOutingDto) => (
                <OutingCard key={outing.id} outing={outing} type={'history'} />
              ))}
            {selectedDocType === 0 && outings && outings?.total > limit && (
              <div className="grid place-items-center">
                <FrontPagination
                  basePath="/teacher/outing"
                  total={outings?.total}
                  limit={limit}
                  page={page}
                  setPage={setPage}
                />
              </div>
            )}

            {/* 체험학습 */}

            {selectedDocType === 2 &&
              fieldtrips?.items
                ?.filter(
                  (fieldtrip) =>
                    new Date(fieldtrip.endAt).setHours(0, 0, 0, 0) >= new Date(startDate).setHours(0, 0, 0, 0) &&
                    new Date(fieldtrip.startAt).setHours(0, 0, 0, 0) <= new Date(endDate).setHours(0, 0, 0, 0),
                )
                .sort((a, b) => {
                  return a.startAt < b.startAt ? -1 : a.startAt > b.startAt ? 1 : 0
                })
                .map(
                  (fieldtrip) =>
                    me?.role && <FieldtripCard key={fieldtrip.id} fieldtrip={fieldtrip} type={'history'} />,
                )}

            {fieldtrips && fieldtrips.total > limit && (
              <div className="grid min-w-max place-items-center">
                <FrontPagination
                  basePath="/teacher/fieldtrip"
                  total={fieldtrips.total}
                  limit={limit}
                  page={page}
                  setPage={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="scroll-box col-span-3 overflow-y-auto md:bg-gray-50">
        <Routes>
          <Route
            path="/teacher/history/:id"
            Component={() =>
              selectedDocType === 0 ? (
                <HistoryOutingDetailPage
                  outings={outings}
                  setOutingId={(n: number) => setOutingId(n)}
                  setOpen={(b: boolean) => setOpen(b)}
                  setAgreeAll={(b: boolean) => setAgreeAll(b)}
                />
              ) : selectedDocType === 1 ? (
                <HistoryAbsentDetailPage userId={me?.id} setAbsentId={(n: number) => setAbsentId(n)} />
              ) : (
                <HistoryFieldtripDetailPage
                  setOpen={(b: boolean) => setOpen(b)}
                  setFieldtripId={(n: number) => setFieldtripId(n)}
                  setAgreeAll={(b: boolean) => setAgreeAll(b)}
                  me={me}
                />
              )
            }
          />
        </Routes>
      </div>
    </>
  )
}
