import { useEffect, useState } from 'react'
import { toDate } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Outlet } from 'react-router'
import { useHistory } from '@/hooks/useHistory'

import { SortState } from '@/constants/enumConstant'
import { Button } from '@/atoms/Button'
import { Divider } from '@/atoms/Divider'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { Input } from '@/atoms/Input'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { ErrorBlank, FrontPagination, SuperModal } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { FieldtripCard } from '@/legacy/components/fieldtrip/FieldtripCard'
import { FieldtripsDownloadView } from '@/legacy/components/pdfDocs/FieldtripsDownloadView'
import { useTeacherFieldTrip } from '@/legacy/container/teacher-fieldtrip'
import { UserContainer } from '@/legacy/container/user'
import { useFieldtripsDownloadFieldtrips } from '@/legacy/generated/endpoint'
import { FieldtripStatus, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSignature } from '@/legacy/hooks/useSignature'
import { useStamp } from '@/legacy/hooks/useStamp'
import { DateUtil } from '@/legacy/util/date'
import { compareFieldTrips } from '@/legacy/util/document'
import { downloadExcel } from '@/legacy/util/download-excel'
import { PermissionUtil } from '@/legacy/util/permission'
import { getCurrentSchoolYear, makeDateToString, makeStartEndToString } from '@/legacy/util/time'

export function FieldtripMainPage() {
  const { canvasRef, sigPadData, clearSignature } = useSignature()
  const [isCsvData, setCsvData] = useState(false)
  const [isPdfDownloadOpen, setIsPdfDownloadOpen] = useState(false)
  const { t } = useLanguage()
  const { replace } = useHistory()
  const filters = [
    { id: 1, name: t('show_all', '전체보기'), value: 'ALL' },
    { id: 2, name: t('pending_approval', '승인 전'), value: 'BEFORE_APPROVAL' },
    { id: 3, name: t('approved', '승인 완료'), value: 'PROCESSED' },
    { id: 4, name: t('rejected', '반려됨'), value: 'RETURNED' },
  ]
  const [dateRange, setDateRange] = useState<DateRange>({
    from: toDate(DateUtil.getAMonthAgo(new Date())),
    to: new Date(),
  })

  const { me } = UserContainer.useContext()
  const userRole = me?.role
  const { stamp, stampImgUrl, stampMode, setStampMode, updateStamp, isUploadStampLoading } = useStamp()

  const [frontSortType, setFrontSortType] = useState('period')
  const [sortOrder, setSortOrder] = useState<SortState>(SortState.DESC)
  const schoolYear = getCurrentSchoolYear()

  const {
    params,
    classGroups,
    error,
    errorMessage,
    isLoading,
    startDate,
    endDate,

    filter,

    _studentName,
    data,
    limit,
    page,

    agreeAll,
    open,
    isViewAuth,
    isApprovalAuth,
    selectedGroup,
    setSelectedGroup,
    setLoading,
    setPage,
    setStartDate,
    setEndDate,
    setFilter,
    setOpen,
    setAgreeAll,
    set_studentName,
    setFieldtripId,
    approveFieldtrip,
    approveFieldtrips,
    searchAlert,
  } = useTeacherFieldTrip({ clearSignature, sigPadData, stampMode, stampImgUrl, stamp })

  useEffect(() => {
    setPage(Number(params.get('page') ?? '1'))
  }, [params])

  useEffect(() => {
    if (open) {
      if (stamp) {
        setStampMode(true)
      } else {
        setStampMode(false)
      }
    }
  }, [open])

  const onClickApproveByStamp = () => {
    setLoading(true)
    if (!stamp) {
      alert('도장이 등록되어 있지 않습니다.')
      setLoading(false)
    } else {
      if (agreeAll) {
        approveFieldtrips()
      } else {
        approveFieldtrip()
      }
      setStampMode(false)
    }
  }

  const handleApproveAll = () => {
    if (filter.value === 'BEFORE_APPROVAL') {
      if (data && data.total > 0) {
        setOpen(true)
        setAgreeAll(true)
      } else {
        alert('승인할 서류가 없습니다.')
      }
    } else {
      searchAlert()
    }
  }

  function makeStudentNumber(studentGradeKlass: string, studentNumber: string): number {
    const grade = parseInt(studentGradeKlass.split(' ')[0])
    const klass = parseInt(studentGradeKlass.split(' ')[1])
    return grade * 10000 + klass * 100 + parseInt(studentNumber)
  }

  const { refetch: refetchExcelData } = useFieldtripsDownloadFieldtrips(
    { startDate, endDate, fieldtripStatus: filter.value },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(
            data,
            `체험학습현황(${makeDateToString(new Date(startDate))}~${makeDateToString(new Date(endDate))})`,
          )
        },
      },
    },
  )

  return (
    <>
      {error && <ErrorBlank />}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      {(isLoading || isUploadStampLoading) && <Blank reversed />}
      <Grid>
        <GridItem colSpan={6}>
          <ResponsiveRenderer mobile={<TopNavbar title="체험학습 신청서" left={<BackButton />} />} />
          <PageHeaderTemplate
            title="체험학습 신청서"
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
                    { label: '전체보기', value: 'ALL' },
                    { label: '승인 전', value: 'BEFORE_APPROVAL' },
                    { label: '승인 완료', value: 'PROCESSED' },
                    { label: '반려됨', value: 'RETURNED' },
                  ],
                  filterState: {
                    value: filter.value,
                    setValue: (v) => setFilter(filters.find((f) => f.value === v) || filters[0]),
                  },
                },
                {
                  items: [
                    { label: '전체보기', value: 'ALL' },
                    ...(classGroups
                      ?.filter((el: any) =>
                        me?.role === Role.PRE_HEAD || me?.role === Role.HEAD
                          ? el.name?.startsWith(me?.headNumber.toString())
                          : true,
                      )
                      ?.map((el) => ({ label: el.name || '', value: el.id.toString() })) || []),
                  ],
                  filterState: {
                    value: selectedGroup?.id.toString() || 'ALL',
                    setValue: (v) => setSelectedGroup(classGroups?.find((el) => String(el.id) === v) || null),
                  },
                },
              ],
              searchBar: {
                placeholder: '이름 검색',
                searchState: {
                  value: _studentName,
                  setValue: (v) => {
                    set_studentName(v)
                    if (v === '') replace(`/teacher/fieldtrip`)
                    setPage(1)
                  },
                },
                onSearch: () => _studentName && replace(`/teacher/fieldtrip?username=${_studentName}`),
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
                  label: '체험학습 신청서',
                  variant: 'solid',
                  color: 'tertiary',
                  icon: { name: 'ssDownload' },
                  customWidth: '150px',
                  action: () => {
                    !isCsvData && setCsvData(true)
                    setIsPdfDownloadOpen(true)
                  },
                },
                {
                  label: '체험학습 현황',
                  variant: 'solid',
                  color: 'tertiary',
                  customWidth: '140px',
                  icon: { name: 'ssDownload' },
                  action: refetchExcelData,
                },
                {
                  label: '모두 승인하기',
                  variant: 'solid',
                  color: 'primary',
                  disabled: !PermissionUtil.hasFieldtripAuthorization(userRole),
                  action: handleApproveAll,
                },
              ],
            }}
          />
          <Divider height="0.5" color="bg-gray-100" />
          {isViewAuth && (
            <div className="h-screen-18 overflow-y-auto pb-10">
              {data?.items
                ?.sort((a, b) => compareFieldTrips(a, b, frontSortType, sortOrder))
                .map(
                  (fieldtrip) =>
                    me?.role && <FieldtripCard key={fieldtrip.id} fieldtrip={fieldtrip} type={'fieldtrip'} />,
                )}
            </div>
          )}
          {data && data.total > limit && (
            <div className="grid place-items-center">
              <FrontPagination
                basePath="/teacher/fieldtrip"
                total={data.total}
                limit={limit}
                page={page}
                setPage={setPage}
              />
            </div>
          )}
        </GridItem>
        <GridItem colSpan={6} className="bg-gray-50">
          <Outlet context={{ setOpen, setFieldtripId, setAgreeAll, me }} />
        </GridItem>
      </Grid>
      <div className="h-screen-18 overflow-y-auto pb-10">
        <FieldtripsDownloadView
          fileName={`체험학습_${makeStartEndToString(startDate, endDate)}`}
          fieldtrips={data?.items
            ?.slice()
            .filter((fieldtrip) => fieldtrip.fieldtripStatus === FieldtripStatus.PROCESSED)
            .filter(
              (fieldtrip) =>
                new Date(fieldtrip.endAt).setHours(0, 0, 0, 0) >= new Date(startDate).setHours(0, 0, 0, 0) &&
                new Date(fieldtrip.startAt).setHours(0, 0, 0, 0) <= new Date(endDate).setHours(0, 0, 0, 0),
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
              } else if (frontSortType === 'name') {
                return a.student?.name < b.student?.name ? -1 : a.student?.name > b.student?.name ? 1 : 0
              }
              return 0
            })
            .filter(
              (_) => me?.role,
              // && fieldtrip?.fieldtripResultStatus === 'PROCESSED'
            )}
          setCsvData={(b: boolean) => setCsvData(b)}
          isCsvData={isCsvData}
          open={isPdfDownloadOpen}
          setOpen={setIsPdfDownloadOpen}
        />
      </div>
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
              <Button size="lg" color="primary" disabled={!stampImgUrl} onClick={onClickApproveByStamp}>
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
                    agreeAll ? approveFieldtrips() : approveFieldtrip()
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
