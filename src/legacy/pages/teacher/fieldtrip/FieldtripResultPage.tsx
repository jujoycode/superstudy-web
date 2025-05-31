import { useEffect, useState } from 'react'
import { toDate } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Outlet } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { cn } from '@/utils/commonUtil'
import { SortState } from '@/constants/enumConstant'
import { Divider } from '@/atoms/Divider'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { ErrorBlank, FrontPagination, SuperModal } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { FieldtripResultCard } from '@/legacy/components/fieldtrip/FieldtripResultCard'
import { useTeacherFieldtripResult } from '@/legacy/container/teacher-fieldtrip-result'
import { UserContainer } from '@/legacy/container/user'
import { Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSignature } from '@/legacy/hooks/useSignature'
import { useStamp } from '@/legacy/hooks/useStamp'
import { DateUtil } from '@/legacy/util/date'
import { PermissionUtil } from '@/legacy/util/permission'
import { getCurrentSchoolYear } from '@/legacy/util/time'

export function FieldtripResultPage() {
  const { replace } = useHistory()
  const { canvasRef, sigPadData, clearSignature } = useSignature()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: toDate(DateUtil.getAMonthAgo(new Date())),
    to: new Date(),
  })
  const { t } = useLanguage()

  const filters = [
    { id: 1, name: t('show_all', '전체보기'), value: 'ALL' },
    { id: 2, name: t('pending_approval', '승인 전'), value: 'BEFORE_APPROVAL' },
    { id: 3, name: t('approved', '승인 완료'), value: 'PROCESSED' },
    { id: 4, name: t('rejected', '반려됨'), value: 'RETURNED' },
  ]

  const { me } = UserContainer.useContext()
  const userRole = me?.role

  const { stamp, stampImgUrl, stampMode, setStampMode, updateStamp } = useStamp()

  const [frontSortType, setFrontSortType] = useState('period')
  const [sortOrder, setSortOrder] = useState<SortState>(SortState.DESC)
  const schoolYear = getCurrentSchoolYear()

  function makeStudentNumber(studentGradeKlass: string, studentNumber: string): number {
    const grade = parseInt(studentGradeKlass.split(' ')[0])
    const klass = parseInt(studentGradeKlass.split(' ')[1])
    return grade * 10000 + klass * 100 + parseInt(studentNumber)
  }

  const {
    classGroups,
    error,
    errorMessage,
    isLoading,
    filter,
    _studentName,
    data,
    limit,
    page,
    agreeAll,
    open,
    isViewAuth,
    isApprovalAuth,
    setLoading,
    setPage,
    setFilter,
    setOpen,
    setAgreeAll,
    selectedGroup,
    setSelectedGroup,
    set_studentName,
    setFieldtripId,
    approveFieldtripResult,
    approveFieldtripResults,
    searchAlert,
  } = useTeacherFieldtripResult({ clearSignature, sigPadData, stampMode, stampImgUrl, stamp })

  const onClickApproveByStamp = () => {
    setLoading(true)
    if (!stamp) {
      alert('도장이 등록되어 있지 않습니다.')
      setLoading(false)
    } else {
      if (agreeAll) {
        approveFieldtripResults()
      } else {
        approveFieldtripResult()
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

  useEffect(() => {
    if (open) {
      if (stamp) {
        setStampMode(true)
      } else {
        setStampMode(false)
      }
    }
  }, [open])

  return (
    <>
      {error && <ErrorBlank />}
      {isLoading && <Blank reversed />}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      <Grid>
        <GridItem colSpan={6}>
          <ResponsiveRenderer mobile={<TopNavbar title="체험학습 결과보고서" left={<BackButton />} />} />
          <PageHeaderTemplate
            title="체험학습 결과보고서"
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
                    if (v === '') replace(`/teacher/fieldtrip/result`)
                    setPage(1)
                  },
                },
                onSearch: () => _studentName && replace(`/teacher/fieldtrip/result?username=${_studentName}`),
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
          {!isViewAuth && !isApprovalAuth && <div className="text-center">권한이 없습니다.</div>}
          {isViewAuth && (
            <div className="h-screen-16 overflow-y-auto pb-10 md:pb-0">
              {data?.items
                ?.sort((a, b) => {
                  if (frontSortType === 'period') {
                    return a.startAt < b.startAt ? 1 : a.startAt > b.startAt ? -1 : 0
                  } else if (frontSortType === 'request') {
                    return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
                  } else if (frontSortType === 'num') {
                    const studentNumberA = makeStudentNumber(a.studentGradeKlass, a.studentNumber.toString())
                    const studentNumberB = makeStudentNumber(b.studentGradeKlass, b.studentNumber.toString())
                    return studentNumberA < studentNumberB ? -1 : studentNumberA > studentNumberB ? 1 : 0
                  } else if (frontSortType === 'name') {
                    return a.student?.name < b.student?.name ? -1 : a.student?.name > b.student?.name ? 1 : 0
                  }
                  return 0
                })
                .map((fieldtrip) => <FieldtripResultCard key={fieldtrip.id} fieldtrip={fieldtrip} />)}
            </div>
          )}
          {data && data.total > limit && (
            <div className="grid min-w-max place-items-center">
              <FrontPagination
                basePath="/teacher/fieldtrip/result"
                total={data?.total}
                limit={limit}
                page={page}
                setPage={setPage}
              />
            </div>
          )}
        </GridItem>
        <GridItem colSpan={6}>
          <Outlet context={{ me, setOpen, setFieldtripId, setAgreeAll, school: me?.school }} />
        </GridItem>
      </Grid>
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
            <label>
              <Button.xl as="p" className="cursor-pointer border border-blue-500 bg-white text-current">
                도장등록
              </Button.xl>
              <input
                type="file"
                accept=".png, .jpeg, .jpg"
                onChange={(e) => {
                  if (!e.target?.files) return
                  updateStamp(e.target.files[0])
                  setStampMode(true)
                }}
                className="sr-only"
              />
            </label>
            {!stampMode ? (
              <Button.xl
                children="도장 사용하기"
                onClick={() => {
                  setStampMode(true)
                  clearSignature()
                }}
                className="text-primary-800 min-w-max border border-blue-500 bg-white"
              />
            ) : (
              <Button.xl
                children="도장으로 승인"
                onClick={onClickApproveByStamp}
                className={cn('text-white', stampImgUrl ? 'border-4 border-red-500 bg-blue-500' : 'bg-blue-100')}
              />
            )}
            <Button.xl
              children="서명 다시하기"
              onClick={() => {
                setStampMode(false)
                clearSignature()
              }}
              className="outlined-primary text-current"
            />
            {stampMode ? (
              <Button.xl children="서명 사용하기" onClick={() => setStampMode(false)} className="outlined-primary" />
            ) : (
              <Button.xl
                children="서명으로 승인"
                onClick={() => {
                  if (!sigPadData) {
                    alert('서명 후 승인해 주세요.')
                  } else {
                    setLoading(true)
                    agreeAll ? approveFieldtripResults() : approveFieldtripResult()
                  }
                }}
                className={cn('text-white', sigPadData ? 'bg-primary-800 border-4 border-green-500' : 'bg-primary-100')}
              />
            )}
          </div>
        </Section>
      </SuperModal>
    </>
  )
}
