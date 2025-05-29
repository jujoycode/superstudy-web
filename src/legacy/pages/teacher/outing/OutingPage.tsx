import { useEffect, useMemo, useState } from 'react'
import { toDate } from 'date-fns'
import { Outlet } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { SortState } from '@/constants/enumConstant'
import { Button } from '@/atoms/Button'
import type { DateRange } from '@/atoms/Calendar'
import { Divider } from '@/atoms/Divider'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { Input } from '@/atoms/Input'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { ErrorBlank, FrontPagination, SuperModal } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { OutingCard } from '@/legacy/components/outing/OutingCard'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherOutgoing } from '@/legacy/container/teacher-outgoing'
import { UserContainer } from '@/legacy/container/user'
import { useOutingsDownloadOutings } from '@/legacy/generated/endpoint'
import { ResponseCreateOutingDto, Role } from '@/legacy/generated/model'
import { DateUtil } from '@/legacy/util/date'
import { compareOutings } from '@/legacy/util/document'
import { downloadExcel } from '@/legacy/util/download-excel'
import { PermissionUtil } from '@/legacy/util/permission'
import { getCurrentSchoolYear, makeDateToString } from '@/legacy/util/time'

export function OutingPage() {
  const { replace } = useHistory()
  const { me } = UserContainer.useContext()
  const userRole = me?.role

  const [agreeAll, setAgreeAll] = useState(false)
  const [_studentName, set_studentName] = useState('')
  const [frontSortType, setFrontSortType] = useState('period')
  const [sortOrder, setSortOrder] = useState<SortState>(SortState.DESC)

  // [2025. 05. 28] DateRange 리팩토링
  const [dateRange, setDateRange] = useState<DateRange>({
    from: toDate(DateUtil.getAMonthAgo(new Date())),
    to: new Date(),
  })

  const { allKlassGroups: groups } = GroupContainer.useContext()
  const schoolYear = getCurrentSchoolYear()

  const {
    signature: { canvasRef, sigPadData, clearSignature },
    stamp: { stamp, stampMode, stampImgUrl, updateStamp, setStampMode },
    filters,
    filter,
    setFilter,
    outingTypes,
    type,
    setType,
    setStartDate,
    setEndDate,
    page,
    setPage,
    limit,
    open,
    setOpen,
    setOutingId,
    isLoading,
    outings,
    error,
    selectedGroup,
    setSelectedGroup,
    approveOuting,
    approveOutings,
  } = useTeacherOutgoing()

  const { refetch: refetchExcelData } = useOutingsDownloadOutings(
    {
      startDate: dateRange.from?.toString() || '',
      endDate: dateRange.to?.toString() || '',
      selectedGroupId: selectedGroup?.id,
      username: _studentName,
      outingStatus: filter.value,
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

  const sortedOutings = useMemo(() => {
    if (sortOrder === 'default') {
      return outings?.items
    }
    return outings?.items?.sort((a, b) =>
      compareOutings(a, b, frontSortType, sortOrder.toUpperCase() as 'ASC' | 'DESC'),
    )
  }, [outings, frontSortType, sortOrder])

  const handleApproveAll = () => {
    if (filter.value === 'BEFORE_APPROVAL') {
      if (!outings || outings.total === 0) {
        alert('승인할 서류가 없습니다.')
        return
      }

      setOpen(true)
      setAgreeAll(true)

      return
    }

    const confirmed = window.confirm(
      '승인 전 상태의 내용만 일괄 승인이 가능합니다. \n승인 전 상태인 건들을 조회하시겠습니까?',
    )
    if (confirmed) setFilter(filters[1])
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

  // [2025. 05. 28] DateRange 리팩토링
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      setStartDate(dateRange.from?.toString())
      setEndDate(dateRange.to?.toString())

      setPage(1)
    }
  }, [dateRange, setDateRange, setStartDate, setEndDate, setPage])

  if (error) {
    return <ErrorBlank />
  }

  if (isLoading) {
    return <Blank reversed />
  }

  return (
    <>
      <Grid>
        {/* <div className={`h-screen-6 col-span-3 md:h-screen ${isDetail ? 'hidden' : 'block'} md:block`}> */}
        <GridItem colSpan={6}>
          <ResponsiveRenderer mobile={<TopNavbar title="확인증" left={<BackButton />} />} />

          <PageHeaderTemplate
            title="확인증"
            description="학생이 제출했거나 선생님이 작성한 조퇴증/외출증/확인증을 확인할 수 있어요."
            config={{
              topBtn: [
                {
                  label: '작성하기',
                  variant: 'solid',
                  color: 'secondary',
                  action: () => replace('/teacher/outing/add'),
                },
              ],
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
                    { label: '전체', value: 'ALL' },
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
                    { label: '조퇴', value: '조퇴' },
                    { label: '외출', value: '외출' },
                    { label: '확인', value: '확인' },
                  ],
                  filterState: {
                    value: type.value,
                    setValue: (v) => setType(outingTypes.find((t) => t.value === v) || outingTypes[0]),
                  },
                },
                {
                  items: [
                    { label: '전체보기', value: 'ALL' },
                    ...groups
                      .filter((el) =>
                        me?.role === Role.PRE_HEAD || me?.role === Role.HEAD
                          ? el.name?.startsWith(me?.headNumber.toString())
                          : true,
                      )
                      .map((el) => ({ label: el.name || '', value: el.id.toString() })),
                  ],
                  filterState: {
                    value: selectedGroup?.id.toString() || 'ALL',
                    setValue: (v) => setSelectedGroup(groups.find((el) => el.id.toString() === v) || null),
                  },
                },
              ],
              searchBar: {
                placeholder: '이름 검색',
                searchState: {
                  value: _studentName,
                  setValue: (v) => set_studentName(v),
                },
                onSearch: () => _studentName && replace(`/teacher/outing?username=${_studentName}`),
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
                  label: '확인증 현황',
                  variant: 'solid',
                  color: 'tertiary',
                  icon: { name: 'ssDownload' },
                  action: refetchExcelData,
                },
                {
                  label: '모두 승인하기',
                  variant: 'solid',
                  color: 'primary',
                  disabled: !PermissionUtil.hasOutingAuthorization(userRole),
                  action: handleApproveAll,
                },
              ],
            }}
          />

          <Divider height="0.5" color="bg-gray-100" />

          <div className="overflow-y-auto">
            {sortedOutings?.map((outing: ResponseCreateOutingDto) => (
              <OutingCard key={outing.id} outing={outing} type={'outing'} />
            ))}
            {outings && outings?.total > limit && (
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
          </div>
        </GridItem>

        <GridItem colSpan={6} className="bg-gray-50">
          <Outlet context={{ isLoading, setOutingId, setOpen, setAgreeAll, userRole }} />
        </GridItem>
      </Grid>

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
                onClick={() => {
                  if (!stampImgUrl) {
                    alert('도장이 등록되어 있지 않습니다.')
                  } else {
                    if (agreeAll) {
                      approveOutings()
                    } else {
                      approveOuting()
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
                    agreeAll ? approveOutings() : approveOuting()
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
