import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { toDate } from 'date-fns'
import { t } from 'i18next'
import { concat } from 'lodash'
import { Outlet, useLocation } from 'react-router'
import { Link } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { ReactComponent as Refresh } from '@/assets/svg/refresh.svg'
import { useHistory } from '@/hooks/useHistory'
import { cn } from '@/utils/commonUtil'
import { SortState } from '@/constants/enumConstant'
import { Button } from '@/atoms/Button'
import type { DateRange } from '@/atoms/Calendar'
import { Divider } from '@/atoms/Divider'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { Input } from '@/atoms/Input'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { ErrorBlank, FrontPagination, SelectMenus, SuperModal } from '@/legacy/components'
import { AbsentCard } from '@/legacy/components/absent/AbsentCard'
import { AbsentsExcelDownloadView } from '@/legacy/components/absent/AbsentsExcelDownloadView'
import { AttendeeInfoDownloadView } from '@/legacy/components/absent/AttendeeInfoDownloadView'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { AbsentsDownloadView } from '@/legacy/components/pdfDocs/AbsentsDownloadView'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherAbsent } from '@/legacy/container/teacher-absent'
import { UserContainer } from '@/legacy/container/user'
import { useAbsentsDownloadAbsents, useAbsentsDownloadAttendee } from '@/legacy/generated/endpoint'
import { AbsentStatus, FilterAbsentStatus, Role } from '@/legacy/generated/model'
import { DateUtil } from '@/legacy/util/date'
import { compareAbsents } from '@/legacy/util/document'
import { downloadExcel } from '@/legacy/util/download-excel'
import { getCurrentSchoolYear, isValidDate, makeDateToString, makeStartEndToString } from '@/legacy/util/time'

export function AbsentPage() {
  const { replace } = useHistory()
  const { me } = UserContainer.useContext()
  const { allKlassGroupsUnique: groups } = GroupContainer.useContext()
  const [agreeAll, setAgreeAll] = useState(false)
  const [isPdfDownloadOpen, setIsPdfDownloadOpen] = useState(false)
  const [_studentName, set_studentName] = useState('')
  const [frontSortType, setFrontSortType] = useState('period')
  const [sortOrder, setSortOrder] = useState<SortState>(SortState.DESC)
  const [userSearchVisible, setUserSearchVisible] = useState(false)
  const [isFilterOpen, setFilterOpen] = useState(true)
  const schoolYear = getCurrentSchoolYear()

  // [2025. 05. 30] DateRange 리팩토링
  const [dateRange, setDateRange] = useState<DateRange>({
    from: toDate(DateUtil.getAMonthAgo(new Date())),
    to: new Date(),
  })

  const {
    absents,
    isLoading,
    error,
    filters,
    filtersMobile,
    isApprovalAuth,
    isViewAuth,
    state: {
      startDate,
      endDate,
      filter,
      selectedGroup,
      page,
      isCsvData,
      open,
      limit,
      report,
      reportType,
      description,
      descriptionType,
    },
    setState: {
      setStartDate,
      setEndDate,
      setFilter,
      setSelectedGroup,
      setPage,
      setAbsentId,
      setCsvData,
      setOpen,
      searchAlert,
      setReport,
      setDescription,
    },
    sign: { sigPadData, clearSignature, canvasRef },
    stamp: { stamp, stampImgUrl, stampMode, setStampMode, updateStamp },
    approveAbsents,
    approveAbsent,
    submitAbsent,
    submitNiceAbsent,
    refetch,
  } = useTeacherAbsent()

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

  const { refetch: refetchAttendeeExcelData } = useAbsentsDownloadAttendee(
    {
      startDate,
      endDate,
      selectedGroupId:
        selectedGroup && selectedGroup.id ? selectedGroup.id : me?.role === Role.TEACHER ? me?.klassGroupId : undefined,
    },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(data, `학급별출결현황 (${makeDateToString(new Date())})`)
        },
      },
    },
  )

  const { pathname } = useLocation()
  const isDetail = !pathname.endsWith('/teacher/absent')

  const sortedAbsents = useMemo(() => {
    if (sortOrder === 'default') {
      return absents?.items
    }
    return absents?.items?.sort((a, b) =>
      compareAbsents(a, b, frontSortType, sortOrder.toUpperCase() as 'ASC' | 'DESC'),
    )
  }, [absents, frontSortType, sortOrder])

  const handleStampSetting = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return
    updateStamp(e.target.files[0])
    setStampMode(true)
  }

  function makeStudentNumber(studentGradeKlass: string, studentNumber: string): number {
    const grade = parseInt(studentGradeKlass.split(' ')[0])
    const klass = parseInt(studentGradeKlass.split(' ')[1])
    return grade * 10000 + klass * 100 + parseInt(studentNumber)
  }

  const handleApproveAll = () => {
    if (!isApprovalAuth) {
      alert('권한이 없습니다.')
    }

    if (filter.value !== FilterAbsentStatus.BEFORE_APPROVAL) {
      searchAlert()
      return
    }

    if (!absents || absents?.total === 0) {
      alert('승인할 서류가 없습니다.')
    }

    setOpen(true)
    setAgreeAll(true)
  }

  useEffect(() => {
    if (open) {
      if (stamp) {
        setStampMode(true)
      } else {
        setStampMode(false)
      }
    }
  }, [open, stamp, setStampMode])

  if (isLoading) {
    return <Blank reversed />
  }

  if (error) {
    return <ErrorBlank />
  }

  return (
    <>
      <Grid>
        <GridItem colSpan={6}>
          <ResponsiveRenderer
            mobile={
              <TopNavbar
                title={`${t(`absentTitle`, '결석신고서')}`}
                left={<BackButton />}
                right={
                  <div onClick={() => refetch()} className="text-primary-800 text-sm">
                    <Refresh />
                  </div>
                }
              />
            }
          />
          <PageHeaderTemplate
            title={t(`absentTitle`, '결석신고서')}
            description="학생이 제출했거나 선생님이 작성한 조퇴/외출/결과/지각/결석 신고서를 확인할 수 있어요."
            config={{
              topBtn: {
                label: '작성하기',
                variant: 'solid',
                color: 'secondary',
                action: () => replace('/teacher/absent/add'),
              },
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
                    { label: '결재 전체', value: 'ALL' },
                    { label: '승인 전', value: 'BEFORE_APPROVAL' },
                    { label: '승인 완료', value: 'PROCESSED' },
                    { label: '반려됨', value: 'RETURNED' },
                    { label: '외부서류 미제출', value: 'UNSUBMITTED' },
                    { label: '외부서류 제출', value: 'SUBMITTED' },
                  ],
                  filterState: {
                    value: filter.value,
                    setValue: (v) => setFilter(filters.find((f) => f.value === v) || filters[0]),
                  },
                },
                {
                  items: [
                    { label: '출결 구분 전체', value: 'ALL' },
                    { label: '결석', value: '결석' },
                    { label: '지각', value: '지각' },
                    { label: '조퇴', value: '조퇴' },
                    { label: '결과', value: '결과' },
                  ],
                  filterState: {
                    value: report.value,
                    setValue: (v) => setReport(reportType.find((f) => f.value === v) || filters[0]),
                  },
                },
                {
                  items: [
                    { label: '결석 유형 전체', value: 'ALL' },
                    { label: '인정', value: '인정' },
                    { label: '질병', value: '질병' },
                    { label: '기타', value: '기타' },
                    { label: '미인정', value: '미인정' },
                  ],
                  filterState: {
                    value: description.value,
                    setValue: (v) => setDescription(descriptionType.find((f) => f.value === v) || filters[0]),
                  },
                },
                {
                  items: concat(
                    [{ name: '전체보기', value: 'ALL' }],
                    groups.filter((el) =>
                      me?.role === Role.PRE_HEAD || me?.role === Role.HEAD
                        ? el.name?.startsWith(me?.headNumber.toString())
                        : true,
                    ),
                  ),
                  filterState: {
                    value: selectedGroup,
                    setValue: (v) => setSelectedGroup(v),
                  },
                  hidden: !(
                    absents &&
                    (me?.role === Role.PRE_HEAD ||
                      me?.role === Role.HEAD ||
                      me?.role === Role.PRE_PRINCIPAL ||
                      me?.role === Role.PRINCIPAL ||
                      me?.role === Role.VICE_PRINCIPAL ||
                      me?.role === Role.HEAD_PRINCIPAL ||
                      me?.role === Role.SECURITY ||
                      me?.role === Role.ADMIN)
                  ),
                },
              ],
              searchBar: {
                placeholder: '이름 검색',
                searchState: {
                  value: _studentName,
                  setValue: (v) => {
                    set_studentName(v)
                    if (v === '') replace(`/teacher/absent`)
                    setPage(1)
                  },
                },
                onSearch: () => _studentName && replace(`/teacher/absent?username=${_studentName}`),
              },
              sort: {
                mode: 'client',
                items: [
                  { label: '기간순', value: 'period' },
                  { label: '요청순', value: 'request' },
                  { label: '이름순', value: 'name' },
                  { label: '학번순', value: 'num' },
                ],
                itemState: {
                  value: frontSortType,
                  setValue: (v) => setFrontSortType(v),
                },
                sortState: {
                  value: sortOrder,
                  setValue: (v) => setSortOrder(v),
                },
              },
              bottomBtn: [
                {
                  label: '결석신고서',
                  variant: 'solid',
                  color: 'tertiary',
                  icon: { name: 'ssDownload' },
                  action: () => {
                    !isCsvData && setCsvData(true)
                    setIsPdfDownloadOpen(true)
                  },
                },
                {
                  label: '월별출결현황',
                  variant: 'solid',
                  color: 'tertiary',
                  customWidth: '140px',
                  icon: { name: 'ssDownload' },
                  action: refetchMonthlyExcelData,
                },
                {
                  label: '학급별출결현황',
                  variant: 'solid',
                  color: 'tertiary',
                  customWidth: '150px',
                  icon: { name: 'ssDownload' },
                  action: refetchAttendeeExcelData,
                },
                {
                  label: '모두 승인하기',
                  variant: 'solid',
                  color: 'primary',
                  action: handleApproveAll,
                },
              ],
            }}
          />

          <Divider height="0.5" color="bg-gray-100" />

          <div className="h-screen-18 overflow-y-auto pb-10">
            {sortedAbsents?.map((absent) => (
              <AbsentCard
                key={absent.id}
                absent={absent}
                submitAbsent={submitAbsent}
                submitNiceAbsent={submitNiceAbsent}
                page={page}
                limit={limit}
                type={'absent'}
              />
            ))}
          </div>

          {absents && absents?.total > limit && (
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
        </GridItem>

        <GridItem colSpan={6} className="bg-gray-50">
          <Outlet context={{ setOpen, setAbsentId, setAgreeAll, me, userId: me?.id }} />
        </GridItem>
      </Grid>

      <AbsentsDownloadView
        fileName={`결석신고서_${makeStartEndToString(startDate, endDate)}`}
        absents={absents?.items
          ?.slice()
          .filter((absent) =>
            selectedGroup
              ? absent?.studentGradeKlass === selectedGroup?.name &&
                // absent?.absentStatus === AbsentStatus.PROCESSED &&
                isViewAuth
              : // : absent?.absentStatus === AbsentStatus.PROCESSED &&
                isViewAuth,
          )
          .filter((absent) => absent.absentStatus === AbsentStatus.PROCESSED)
          .filter(
            (absent) =>
              new Date(absent.endAt).setHours(0, 0, 0, 0) >= new Date(startDate).setHours(0, 0, 0, 0) &&
              new Date(absent.startAt).setHours(0, 0, 0, 0) <= new Date(endDate).setHours(0, 0, 0, 0),
          )
          .sort((a, b) => {
            if (frontSortType === 'period') {
              return a.startAt < b.startAt ? -1 : a.startAt > b.startAt ? 1 : 0
            } else if (frontSortType === 'request') {
              return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
            } else if (frontSortType === 'num') {
              const studentNumberA = makeStudentNumber(a.studentGradeKlass, a.studentNumber.toString())
              const studentNumberB = makeStudentNumber(b.studentGradeKlass, b.studentNumber.toString())
              return studentNumberA < studentNumberB ? -1 : studentNumberA > studentNumberB ? 1 : 0
              //return a.studentNumber < b.studentNumber ? -1 : a.studentNumber > b.studentNumber ? 1 : 0;
            } else if (frontSortType === 'name') {
              return a.student?.name < b.student?.name ? -1 : a.student?.name > b.student?.name ? 1 : 0
            }
            return 0
          })}
        setCsvData={(b: boolean) => setCsvData(b)}
        isCsvData={isCsvData}
        open={isPdfDownloadOpen}
        setOpen={setIsPdfDownloadOpen}
      />

      {/* 모달 */}
      <SuperModal
        modalOpen={open}
        setModalClose={() => {
          setStampMode(false)
          clearSignature()
          setOpen(false)
        }}
        className="w-max"
        ablePropragation
      >
        <Section className="mt-7">
          <div>
            <div className="text-xl font-bold text-gray-700">서명란</div>
            <div className="text-gray-500">아래 네모칸에 이름을 바르게 적어주세요.</div>
          </div>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={window.innerWidth * 0.6 > 420 ? 420 : window.innerWidth * 0.6}
              height={window.innerWidth * 0.4 > 280 ? 280 : window.innerWidth * 0.4}
              className="m-auto rounded-[30px] bg-[#F2F2F2]"
            />
            {stampMode ? (
              stampImgUrl ? (
                <div
                  className="absolute inset-0 z-10 overflow-hidden rounded-sm bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url("${stampImgUrl}")` }}
                ></div>
              ) : (
                <div className="absolute inset-0 z-10 overflow-hidden rounded bg-gray-400">
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="min-w-max text-center">도장을 등록해주세요.</div>
                  </div>
                </div>
              )
            ) : (
              ''
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input.File
              size="lg"
              accept=".png, .jpeg, .jpg"
              onChange={(e) => {
                if (!e.target?.files) return
                updateStamp(e.target.files[0])
                setStampMode(true)
              }}
            >
              <Button size="lg" color="sub" className="w-full">
                도장 등록
              </Button>
            </Input.File>
            {!stampMode ? (
              <Button
                size="lg"
                color="tertiary"
                onClick={() => {
                  setStampMode(true)
                  clearSignature()
                }}
              >
                도장 사용하기
              </Button>
            ) : (
              <Button
                size="lg"
                color="primary"
                disabled={!stampImgUrl}
                onClick={async () => {
                  if (!stampImgUrl) {
                    alert('도장이 등록되어 있지 않습니다.')
                  } else {
                    if (agreeAll) {
                      approveAbsents()
                    } else {
                      approveAbsent()
                    }
                    setStampMode(false)
                  }
                }}
              >
                도장으로 승인
              </Button>
            )}
            <Button
              size="lg"
              color="tertiary"
              onClick={() => {
                setStampMode(false)
                clearSignature()
              }}
            >
              서명 다시하기
            </Button>
            {stampMode ? (
              <Button size="lg" color="tertiary" onClick={() => setStampMode(false)}>
                서명 사용하기
              </Button>
            ) : (
              <Button
                size="lg"
                color="primary"
                onClick={() => {
                  if (!sigPadData) {
                    alert('서명 후 승인해 주세요.')
                  } else {
                    agreeAll ? approveAbsents() : approveAbsent()
                  }
                }}
              >
                서명으로 승인
              </Button>
            )}
          </div>
        </Section>
      </SuperModal>
    </>
  )
}
