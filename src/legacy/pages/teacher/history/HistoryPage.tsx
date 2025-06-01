import { useEffect, useMemo, useState } from 'react'
import { toDate } from 'date-fns'
import { range } from 'lodash'
import { DateRange } from 'react-day-picker'
import { Outlet } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { Divider } from '@/atoms/Divider'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { BtnConfig, PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { ErrorBlank, FrontPagination } from '@/legacy/components'
import { AbsentCard } from '@/legacy/components/absent/AbsentCard'
import { BackButton, Blank, TopNavbar } from '@/legacy/components/common'
import { FieldtripCard } from '@/legacy/components/fieldtrip/FieldtripCard'
import { OutingCard } from '@/legacy/components/outing/OutingCard'
import { AbsentsDownloadView } from '@/legacy/components/pdfDocs/AbsentsDownloadView'
import { FieldtripsDownloadView } from '@/legacy/components/pdfDocs/FieldtripsDownloadView'
import { useTeacherHistory } from '@/legacy/container/teacher-history'
import { useTeacherKlassGroup } from '@/legacy/container/teacher-klass-groups'
import { UserContainer } from '@/legacy/container/user'
import { useAbsentsDownloadAbsents, useOutingsDownloadOutings } from '@/legacy/generated/endpoint'
import { AbsentStatus, ResponseCreateOutingDto, Role } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { downloadExcel } from '@/legacy/util/download-excel'
import { PermissionUtil } from '@/legacy/util/permission'
import {
  getCurrentSchoolYear,
  getSearchYearByMonth,
  getThisYear,
  makeDateToString,
  makeStartEndToString,
} from '@/legacy/util/time'
export interface MergedGroupType {
  id: number
  name: string
  type: string
}

export function HistoryPage() {
  const { replace } = useHistory()
  const thisYear = +getThisYear()
  const schoolYear = getCurrentSchoolYear()
  const { me } = UserContainer.useContext()

  const [_studentName, set_studentName] = useState('')
  const [isPdfDownloadOpen, setIsPdfDownloadOpen] = useState(false)
  const [isAbsentPdfDownloadOpen, setIsAbsentPdfDownloadOpen] = useState(false)
  const [bottomButtons, setBottomButtons] = useState<BtnConfig[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({
    from: toDate(DateUtil.getAMonthAgo(new Date())),
    to: new Date(),
  })

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

  useEffect(() => {
    const newButtons: BtnConfig[] = []

    switch (selectedDocType) {
      case 0: // 확인증
        newButtons.push({
          label: '확인증 현황',
          variant: 'solid',
          color: 'tertiary',
          icon: { name: 'ssDownload' },
          action: refetchExcelData,
        })
        break

      case 1: // 결석신고서
        newButtons.push({
          label: '결석신고서',
          variant: 'solid',
          color: 'tertiary',
          icon: { name: 'ssDownload' },
          action: () => {
            !isCsvData && setCsvData(true)
            setIsAbsentPdfDownloadOpen(true)
          },
        })

        newButtons.push({
          label: '월별출결현황',
          variant: 'solid',
          color: 'tertiary',
          customWidth: '140px',
          icon: { name: 'ssDownload' },
          action: refetchMonthlyExcelData,
        })
        break

      case 2: // 체험학습
        newButtons.push({
          label: '체험학습 신청서',
          variant: 'solid',
          color: 'tertiary',
          icon: { name: 'ssDownload' },
          customWidth: '150px',
          action: () => {
            !isCsvData && setCsvData(true)
            setIsPdfDownloadOpen(true)
          },
        })

        newButtons.push({
          label: '체험학습 현황',
          variant: 'solid',
          color: 'tertiary',
          customWidth: '140px',
          icon: { name: 'ssDownload' },
          action: refetchExcelData,
        })
        break

      default:
        break
    }

    setBottomButtons(newButtons)
  }, [selectedDocType])

  const { allKlassGroupsUnique: allKlassGroups, homeKlass } = useTeacherKlassGroup(selectedYear)

  const { refetch: refetchExcelData } = useOutingsDownloadOutings(
    {
      startDate: dateRange.from?.toString() || '',
      endDate: dateRange.to?.toString() || '',
      selectedGroupId: selectedGroup?.id,
      username: _studentName,
    },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          if (dateRange.from && dateRange.to) {
            downloadExcel(data, `확인증현황(${makeDateToString(dateRange.from)}~${makeDateToString(dateRange.to)})`)
          } else {
            alert('날짜를 선택해주세요.')
          }
        },
      },
    },
  )

  const { refetch: refetchMonthlyExcelData } = useAbsentsDownloadAbsents(
    {
      startDate,
      endDate,
      selectedGroupId: selectedGroup && selectedGroup.id ? selectedGroup.id : undefined,
    },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(
            data,
            `월출결현황(${makeDateToString(new Date(startDate))}~${makeDateToString(new Date(endDate))})`,
          )
        },
      },
    },
  )

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
      <Grid>
        <GridItem colSpan={6}>
          <ResponsiveRenderer mobile={<TopNavbar title="출결서류관리" left={<BackButton />} />} />
          <PageHeaderTemplate
            title="이력 관리"
            description="※ 확인증, 결석신고서, 체험학습 과거이력관리"
            config={{
              dateSearchBar: {
                type: 'range',
                minDate: toDate(schoolYear.start),
                maxDate: toDate(schoolYear.end),
                searchState: {
                  value: dateRange,
                  setValue: (value) => setDateRange(value as DateRange),
                },
              },
              filters: [
                {
                  items: [
                    { label: '서류선택', value: '-1' },
                    { label: '확인증', value: '0' },
                    { label: '결석신고서', value: '1' },
                    { label: '체험학습', value: '2' },
                  ],
                  filterState: {
                    value: selectedDocType.toString(),
                    setValue: (value) => {
                      setSelectedDocType(Number(value))
                      if (value === '2') {
                        setSelectedGroup(null)
                      }
                      replace(`/teacher/history`)
                    },
                  },
                },
                {
                  items: [
                    { label: '년도선택', value: '-1' },
                    ...range(
                      thisYear,
                      PermissionUtil.isExecutiveTeachers(me?.role) || me?.role === Role.ADMIN
                        ? thisYear - 4
                        : thisYear - 2,
                      -1,
                    ).map((year) => ({ label: year.toString(), value: year.toString() })),
                  ],
                  filterState: {
                    value: selectedYear.toString(),
                    setValue: (value) => {
                      setSelectedYear(Number(value))
                      const year = Number(value)
                      const month = selectedMonth

                      if (month > 0 && year > 0) {
                        const startDate = new Date(year, month - 1, 1)
                        const endDate = new Date(year, month, 0)

                        setStartDate(DateUtil.formatDate(startDate || '', DateFormat['YYYY-MM-DD']))
                        setEndDate(DateUtil.formatDate(endDate || '', DateFormat['YYYY-MM-DD']))
                      }
                    },
                  },
                },
                {
                  items: [
                    { label: '월선택', value: '-1' },
                    ...[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((month) => ({
                      label: month.toString() + '월',
                      value: month.toString(),
                    })),
                  ],
                  filterState: {
                    value: selectedMonth.toString(),
                    setValue: (value) => {
                      setSelectedMonth(Number(value))
                      const year = selectedYear
                      const month = Number(value)

                      if (year > 0 && month > 0) {
                        const searchYear = getSearchYearByMonth(year, month)
                        const startDate = new Date(searchYear, month - 1, 1)
                        const endDate = new Date(searchYear, month, 0)

                        setStartDate(DateUtil.formatDate(startDate || '', DateFormat['YYYY-MM-DD']))
                        setEndDate(DateUtil.formatDate(endDate || '', DateFormat['YYYY-MM-DD']))
                      }
                    },
                  },
                },
                {
                  items: [
                    { label: '반선택', value: '-1' },
                    ...klassList
                      ?.filter((group: MergedGroupType) => group.name !== '0학년 0반')
                      ?.map((group: MergedGroupType) => ({ label: group.name, value: group.id.toString() })),
                  ],
                  filterState: {
                    value: selectedGroup?.id.toString() || '-1',
                    setValue: (value) => {
                      setSelectedGroup(klassList?.find((tg: any) => tg.id === Number(value)) || null)
                      if (selectedDocType < 0) return
                    },
                  },
                },
              ],
              searchBar: {
                placeholder: '이름 검색',
                searchState: {
                  value: _studentName,
                  setValue: (value) => {
                    set_studentName(value)
                    if (value === '') replace(`/teacher/history`)
                    setPage(1)
                  },
                },
                onSearch: () => _studentName && replace(`/teacher/history?username=${_studentName}`),
              },
              bottomBtn: bottomButtons,
            }}
          />

          <Divider height="0.5" color="bg-gray-100" />
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
        </GridItem>
        <GridItem colSpan={6} className="bg-gray-50">
          <Outlet
            context={{
              selectedDocType,
              outings,
              setOutingId,
              setOpen,
              setAgreeAll,
              userId: me?.id,
              setAbsentId,
              setFieldtripId,
              me,
            }}
          />
        </GridItem>
      </Grid>
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
            open={isAbsentPdfDownloadOpen}
            setOpen={setIsAbsentPdfDownloadOpen}
          />
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
                    new Date(fieldtrip.endAt).setHours(0, 0, 0, 0) >= new Date(startDate).setHours(0, 0, 0, 0) &&
                    new Date(fieldtrip.startAt).setHours(0, 0, 0, 0) <= new Date(endDate).setHours(0, 0, 0, 0),
                )}
              setCsvData={(b: boolean) => setCsvData(b)}
              isCsvData={isCsvData}
              open={isPdfDownloadOpen}
              setOpen={setIsPdfDownloadOpen}
            />
          </div>
        </>
      )}
      {error && <ErrorBlank />}
      {isLoading && <Blank reversed />}
    </>
  )
}
