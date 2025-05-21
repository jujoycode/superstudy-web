import { cn } from '@/utils/commonUtil'
import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { ErrorBlank, FrontPagination, SelectMenus, SuperModal } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { FieldtripCard } from '@/legacy/components/fieldtrip/FieldtripCard'
import { FieldtripExcelDownloadView } from '@/legacy/components/fieldtrip/FieldtripExcelDownloadView'
import { FieldtripsDownloadView } from '@/legacy/components/pdfDocs/FieldtripsDownloadView'
import { SelectMenuFilterType, useTeacherFieldTrip } from '@/legacy/container/teacher-fieldtrip'
import { UserContainer } from '@/legacy/container/user'
import { FieldtripStatus, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useQueryParams } from '@/legacy/hooks/useQueryParams'
import { useSignature } from '@/legacy/hooks/useSignature'
import { useStamp } from '@/legacy/hooks/useStamp'
import { compareFieldTrips } from '@/legacy/util/document'
import { getCurrentSchoolYear, isValidDate, makeDateToString, makeStartEndToString } from '@/legacy/util/time'

import { FieldtripDetailPage } from './FieldtripDetailPage'

export function FieldtripMainPage() {
  const { replaceWithQueryParams } = useQueryParams()

  const { pathname } = useLocation()
  const isDetail = !pathname.endsWith('/teacher/fieldtrip')
  const { canvasRef, sigPadData, clearSignature } = useSignature()
  const [isCsvData, setCsvData] = useState(false)
  const { t } = useLanguage()

  const filters = [
    { id: 1, name: t('show_all', '전체보기'), value: 'ALL' },
    { id: 2, name: t('pending_approval', '승인 전'), value: 'BEFORE_APPROVAL' },
    { id: 3, name: t('approved', '승인 완료'), value: 'PROCESSED' },
    { id: 4, name: t('rejected', '반려됨'), value: 'RETURNED' },
  ]

  const { me } = UserContainer.useContext()
  const { stamp, stampImgUrl, stampMode, setStampMode, updateStamp, isUploadStampLoading } = useStamp()

  const [frontSortType, setFrontSortType] = useState('')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')
  const schoolYear = getCurrentSchoolYear()
  const toggleSort = (sortType: string) => {
    if (frontSortType === sortType) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setFrontSortType(sortType)
      setSortOrder('ASC')
    }
  }

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

  function makeStudentNumber(studentGradeKlass: string, studentNumber: string): number {
    const grade = parseInt(studentGradeKlass.split(' ')[0])
    const klass = parseInt(studentGradeKlass.split(' ')[1])
    return grade * 10000 + klass * 100 + parseInt(studentNumber)
  }

  return (
    <>
      {error && <ErrorBlank />}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      {(isLoading || isUploadStampLoading) && <Blank reversed />}
      <div className="md:hidden">
        <TopNavbar title="체험학습 신청서" left={<BackButton />} />
      </div>
      <div className={`h-screen-7 col-span-3 md:h-screen ${isDetail && 'hidden'} md:block`}>
        <div className="scroll-box flex flex-col overflow-x-scroll px-3 py-2 md:px-6 md:py-4">
          <div className="hidden md:block">
            <div className="flex justify-between">
              <h1 className="text-2xl font-semibold">{t('experiential_learning_application', '체험학습 신청서')}</h1>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center md:justify-start md:space-x-3">
              <input
                type="date"
                className="focus:border-brand-1 h-12 w-full rounded-lg border border-gray-200 p-2 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 md:p-4"
                value={makeDateToString(new Date(startDate))}
                min={schoolYear.start}
                max={schoolYear.end}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value)
                  if (!isValidDate(selectedDate)) {
                    return
                  }
                  if (endDate && selectedDate > new Date(endDate)) {
                    setEndDate(e.target.value)
                  }
                  setStartDate(e.target.value)
                  setPage(1)
                }}
              />
              <div className="px-4 text-xl font-bold">~</div>
              <input
                type="date"
                className="focus:border-brand-1 h-12 w-full rounded-lg border border-gray-200 p-2 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 md:p-4"
                value={makeDateToString(new Date(endDate))}
                min={schoolYear.start}
                max={schoolYear.end}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value)
                  if (!isValidDate(selectedDate)) {
                    return
                  }
                  if (startDate && selectedDate < new Date(startDate)) {
                    setStartDate(e.target.value)
                  }
                  setEndDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="flex items-center gap-2 md:mb-2 md:gap-0 md:space-x-2">
              <div className="min-w-max cursor-pointer py-2">
                <SelectMenus
                  allText={t('show_all', '전체보기')}
                  items={filters}
                  onChange={(item: SelectMenuFilterType) => setFilter(item)}
                  value={filter}
                  tooltip={`${t('approval_state', '승인상태')}`}
                />
              </div>

              {(me?.role === Role.PRE_HEAD ||
                me?.role === Role.HEAD ||
                me?.role === Role.PRE_PRINCIPAL ||
                me?.role === Role.PRINCIPAL ||
                me?.role === Role.VICE_PRINCIPAL ||
                me?.role === Role.HEAD_PRINCIPAL ||
                me?.role === Role.SECURITY ||
                me?.role === Role.ADMIN) && (
                <>
                  <div className="min-w-max cursor-pointer">
                    <SelectMenus
                      allText={t('show_all', '전체보기')}
                      allTextVisible
                      items={classGroups?.filter((el: any) =>
                        me?.role === Role.PRE_HEAD || me?.role === Role.HEAD
                          ? el.name?.startsWith(me?.headNumber.toString())
                          : true,
                      )}
                      value={selectedGroup}
                      onChange={(group: any) => setSelectedGroup(group)}
                      tooltip={`${t('class', '학급')}`}
                    />
                  </div>
                </>
              )}

              <div className="flex w-full items-center space-x-2">
                <SearchInput
                  placeholder={`${t('search_by_name', '이름 검색')}`}
                  value={_studentName}
                  onChange={(e) => {
                    set_studentName(e.target.value)
                    //if (e.target.value === '') replaceWithQueryParams(`/teacher/fieldtrip`);
                  }}
                  onSearch={() =>
                    _studentName && replaceWithQueryParams('/teacher/fieldtrip', { username: _studentName })
                  }
                  className="w-full"
                />
                <Icon.Search
                  onClick={() => {
                    _studentName === ''
                      ? alert('텍스트 내용을 입력해주세요.')
                      : replaceWithQueryParams('/teacher/fieldtrip', { username: _studentName })
                  }}
                  className="cursor-pointer"
                />
                {isApprovalAuth && (
                  <Button.lg
                    children={t('bulk_approve', '일괄 승인하기')}
                    onClick={() => {
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
                    }}
                    className="filled-primary md:hidden"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="hidden w-1/3 items-center md:block">
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
              />
            </div>
            <div className="hidden w-1/3 items-center md:block">
              {/* 체험학습현황 Excel 버튼 */}
              <FieldtripExcelDownloadView startDate={startDate} endDate={endDate} fieldtripStatus={filter.value} />
            </div>
            {isApprovalAuth && (
              <Button.lg
                children={t('bulk_approve', '일괄 승인하기')}
                onClick={() => {
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
                }}
                className="filled-primary hidden w-1/3 md:block"
              />
            )}
          </div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
        <div className="grid grid-cols-4 bg-gray-100 max-md:hidden">
          <button
            onClick={() => toggleSort('period')}
            className={cn(
              'flex items-center justify-center',
              frontSortType !== 'period' && 'text-[#aaa] hover:underline hover:underline-offset-4',
            )}
          >
            <span className={cn(frontSortType === 'period' && 'font-bold')}>{t('by_date', '기간순')}</span>
            {frontSortType === 'period' && <Icon.ChevronDown className={sortOrder === 'DESC' ? 'rotate-180' : ''} />}
          </button>
          <button
            onClick={() => toggleSort('request')}
            className={cn(
              'flex items-center justify-center',
              frontSortType !== 'request' && 'text-[#aaa] hover:underline hover:underline-offset-4',
            )}
          >
            <span className={cn(frontSortType === 'request' && 'font-bold')}>
              {t('by_application_date', '신청일순')}
            </span>
            {frontSortType === 'request' && <Icon.ChevronDown className={sortOrder === 'DESC' ? 'rotate-180' : ''} />}
          </button>
          <button
            onClick={() => toggleSort('name')}
            className={cn(
              'flex items-center justify-center',
              frontSortType !== 'name' && 'text-[#aaa] hover:underline hover:underline-offset-4',
            )}
          >
            <span className={cn(frontSortType === 'name' && 'font-bold')}>{t('by_name', '이름순')}</span>
            {frontSortType === 'name' && <Icon.ChevronDown className={sortOrder === 'DESC' ? 'rotate-180' : ''} />}
          </button>
          <button
            onClick={() => toggleSort('num')}
            className={cn(
              'flex items-center justify-center',
              frontSortType !== 'num' && 'text-[#aaa] hover:underline hover:underline-offset-4',
            )}
          >
            <span className={cn(frontSortType === 'num' && 'font-bold')}>{t('by_student_id', '학번순')}</span>
            {frontSortType === 'num' && <Icon.ChevronDown className={sortOrder === 'DESC' ? 'rotate-180' : ''} />}
          </button>
        </div>
        {!isViewAuth && !isApprovalAuth && <div className="text-center">권한이 없습니다.</div>}
        {isViewAuth && (
          <div className="h-screen-18 overflow-y-auto pb-10 md:pb-0">
            {data?.items
              ?.sort((a, b) => compareFieldTrips(a, b, frontSortType, sortOrder))
              .map(
                (fieldtrip) =>
                  me?.role && <FieldtripCard key={fieldtrip.id} fieldtrip={fieldtrip} type={'fieldtrip'} />,
              )}
          </div>
        )}
        {data && data.total > limit && (
          <div className="grid min-w-max place-items-center">
            <FrontPagination
              basePath="/teacher/fieldtrip"
              total={data.total}
              limit={limit}
              page={page}
              setPage={setPage}
            />
          </div>
        )}
      </div>
      {me?.school && (
        <div className="col-span-3 bg-gray-50 md:p-6">
          <Routes>
            <Route
              path="/teacher/fieldtrip/:id"
              Component={() => (
                <FieldtripDetailPage
                  setOpen={(b: boolean) => setOpen(b)}
                  setFieldtripId={(n: number) => setFieldtripId(n)}
                  setAgreeAll={(b: boolean) => setAgreeAll(b)}
                  me={me}
                />

                // <FieldtripNoticeDetailPage school={me?.school} />

                // <FieldtripResultDetailPage
                //   school={me?.school}
                //   setOpen={(b: boolean) => setOpen(b)}
                //   setAgreeAll={(b: boolean) => setAgreeAll(b)}
                //   setFieldtripId={(n: number) => setFieldtripId(n)}
                //   me={me}
                // />
              )}
            />
          </Routes>
        </div>
      )}
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
                <div className="bg-gray-4 absolute inset-0 z-10 overflow-hidden rounded">
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
              <Button.xl as="p" className="border-brandblue-1 cursor-pointer border bg-white text-current">
                도장등록
              </Button.xl>
              <input
                type="file"
                className="sr-only"
                accept=".png, .jpeg, .jpg"
                onChange={(e) => {
                  if (!e.target?.files) return
                  updateStamp(e.target.files[0])
                  setStampMode(true)
                }}
              />
            </label>
            {!stampMode ? (
              <Button.xl
                children="도장 사용하기"
                onClick={() => {
                  setStampMode(true)
                  clearSignature()
                }}
                className="filled-blue"
              />
            ) : (
              <Button.xl
                children="도장으로 승인"
                onClick={onClickApproveByStamp}
                className={cn('text-white', stampImgUrl ? 'bg-brandblue-1 border-4 border-red-500' : 'bg-brandblue-5')}
              />
            )}
            <Button.xl
              children="서명 다시하기"
              onClick={() => {
                clearSignature()
                setStampMode(false)
              }}
              className="outlined-primary text-current"
            />
            {stampMode ? (
              <Button.xl children="서명 사용하기" onClick={() => setStampMode(false)} className="filled-primary" />
            ) : (
              <Button.xl
                children="서명으로 승인"
                onClick={() => {
                  if (!sigPadData) {
                    alert('서명 후 승인해 주세요.')
                  } else {
                    setLoading(true)
                    agreeAll ? approveFieldtrips() : approveFieldtrip()
                  }
                }}
                className={cn('text-white', sigPadData ? 'bg-brand-1 border-4 border-green-500' : 'bg-brand-5')}
              />
            )}
          </div>
        </Section>
      </SuperModal>
    </>
  )
}
