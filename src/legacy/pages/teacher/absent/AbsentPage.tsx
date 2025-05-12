import clsx from 'clsx'
import { t } from 'i18next'
import { concat } from 'lodash'
import { ChangeEvent, useEffect, useState } from 'react'
import { Route, Switch, useLocation } from 'react-router'
import { Link, useHistory } from 'react-router-dom'
import { ReactComponent as Refresh } from '@/legacy/assets/svg/refresh.svg'
import { ErrorBlank, FrontPagination, SelectMenus, SuperModal } from '@/legacy/components'
import { AbsentCard } from '@/legacy/components/absent/AbsentCard'
import { AbsentsExcelDownloadView } from '@/legacy/components/absent/AbsentsExcelDownloadView'
import { AttendeeInfoDownloadView } from '@/legacy/components/absent/AttendeeInfoDownloadView'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Icon } from '@/legacy/components/common/icons'
import { AbsentsDownloadView } from '@/legacy/components/pdfDocs/AbsentsDownloadView'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherAbsent } from '@/legacy/container/teacher-absent'
import { UserContainer } from '@/legacy/container/user'
import { AbsentStatus, FilterAbsentStatus, Role } from '@/legacy/generated/model'
import { compareAbsents } from '@/legacy/util/document'
import { getCurrentSchoolYear, isValidDate, makeStartEndToString } from '@/legacy/util/time'
import { twMerge } from 'tailwind-merge'
import { AbsentAddPage } from './AbsentAddPage'
import { AbsentDetailPage } from './AbsentDetailPage'

export function AbsentPage() {
  const { replace } = useHistory()
  const { me } = UserContainer.useContext()

  const { allKlassGroupsUnique: groups } = GroupContainer.useContext()

  const [agreeAll, setAgreeAll] = useState(false)
  const [_studentName, set_studentName] = useState('')

  const [frontSortType, setFrontSortType] = useState('')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')
  const [userSearchVisible, setUserSearchVisible] = useState(false)
  const [isFilterOpen, setFilterOpen] = useState(true)
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

  const { pathname } = useLocation()
  const isDetail = !pathname.endsWith('/teacher/absent')

  const handleStampSetting = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return
    console.log('handleStampSetting - e.target.files: ', e.target.files[0])
    updateStamp(e.target.files[0])
    setStampMode(true)
  }

  const frontSort = (sortType: string) => {
    setFrontSortType(sortType)
  }

  function makeStudentNumber(studentGradeKlass: string, studentNumber: string): number {
    const grade = parseInt(studentGradeKlass.split(' ')[0])
    const klass = parseInt(studentGradeKlass.split(' ')[1])
    return grade * 10000 + klass * 100 + parseInt(studentNumber)
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

      <div className={`h-screen-6 col-span-3 md:h-screen ${isDetail ? 'hidden' : 'block'} md:block`}>
        <div className="md:hidden">
          <TopNavbar
            title={`${t(`absentTitle`, '결석신고서')}`}
            left={<BackButton />}
            right={
              <div onClick={() => refetch()} className="text-brand-1 text-sm">
                <Refresh />
              </div>
            }
          />
        </div>
        <div className="overflow-y-auto">
          <div className="scroll-box flex flex-col overflow-x-scroll px-3 py-2 md:px-6 md:py-4">
            <div className="hidden md:block">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{t(`absentTitle`, '결석신고서')}</h1>
                <Link
                  children={t('write', '작성하기')}
                  to="/teacher/absent/add"
                  className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-4 py-2 text-sm focus:outline-none"
                />
              </div>
              <div className="text-grey-5 mb-5 text-sm">
                ※ {t('sick_leave_absence_report', '구,결석계 / 조퇴,외출,결과,지각,결석 후 작성 서류')}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="mb-2 flex items-center justify-center space-x-2 md:justify-start">
                <input
                  type="date"
                  value={startDate}
                  min={schoolYear.start}
                  max={schoolYear.end}
                  className="focus:border-brand-1 h-12 w-full rounded-lg border border-gray-200 p-2 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 md:p-4"
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
                <div className="w-full max-w-[12px] px-2 text-center text-xl font-bold">~</div>
                <input
                  type="date"
                  value={endDate}
                  min={schoolYear.start}
                  max={schoolYear.end}
                  className="focus:border-brand-1 h-12 w-full rounded-lg border border-gray-200 p-2 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 md:p-4"
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
              <div
                className="mb-2 flex cursor-pointer items-center space-x-2 md:hidden"
                onClick={() => setFilterOpen(!isFilterOpen)}
              >
                <div className="text-brand-1">상세 검색</div>
                {isFilterOpen ? <Icon.ChevronDown stroke="#ee853a" /> : <Icon.ChevronUp stroke="#ee853a" />}
              </div>
              <div
                className={twMerge(
                  'block items-center gap-2 md:mb-2 md:flex md:gap-0 md:space-x-2',
                  !isFilterOpen && 'hidden',
                )}
              >
                <div className="hidden min-w-max cursor-pointer md:block">
                  <SelectMenus
                    allText={t('show_all', '전체보기')}
                    items={filters}
                    value={filters ? filter : null}
                    onChange={(group) => setFilter(group)}
                    tooltip={`${t('approval_state', '승인상태')}`}
                  />
                </div>

                <div className="min-w-max cursor-pointer md:hidden">
                  <SelectMenus
                    allText={t('show_all', '전체보기')}
                    items={filtersMobile}
                    value={filtersMobile ? filter : null}
                    onChange={(group) => setFilter(group)}
                    tooltip={`${t('approval_state', '승인상태')}`}
                  />
                </div>
                <SelectMenus
                  allText={t('show_all', '전체보기')}
                  items={reportType}
                  value={reportType ? report : null}
                  onChange={(group) => setReport(group)}
                  tooltip={`${t('report_type', '신고유형')}`}
                />
                <SelectMenus
                  allText={t('show_all', '전체보기')}
                  items={descriptionType}
                  value={descriptionType ? description : null}
                  onChange={(group) => setDescription(group)}
                  tooltip={`${t('description', '신고사유')}`}
                />

                {absents &&
                  (me?.role === Role.PRE_HEAD ||
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
                          items={concat(
                            [{ id: 1, name: t('show_all', '전체보기'), value: '' }],
                            groups.filter((el) =>
                              me?.role === Role.PRE_HEAD || me?.role === Role.HEAD
                                ? el.name?.startsWith(me?.headNumber.toString())
                                : true,
                            ),
                          )}
                          value={selectedGroup}
                          onChange={(group: any) => setSelectedGroup(group)}
                          tooltip={`${t('class', '학급')}`}
                        />
                      </div>
                    </>
                  )}
                <div
                  className="hidden cursor-pointer items-center md:flex"
                  onClick={() => setUserSearchVisible(!userSearchVisible)}
                >
                  <Icon.Search />
                  {userSearchVisible ? <Icon.ChevronDown /> : <Icon.ChevronUp />}
                </div>
              </div>
              <div
                className={twMerge(
                  'hidden w-full items-center space-x-2 pb-2',
                  userSearchVisible && 'flex',
                  isFilterOpen && 'mt-1 flex',
                  isFilterOpen && !userSearchVisible && 'md:hidden',
                )}
              >
                <SearchInput
                  placeholder={`${t('search_by_name', '이름 검색')}`}
                  value={_studentName}
                  onChange={(e) => {
                    set_studentName(e.target.value)
                    if (e.target.value === '') replace(`/teacher/absent`)
                    setPage(1)
                  }}
                  onSearch={() => _studentName && replace(`/teacher/absent?username=${_studentName}`)}
                  className="w-full"
                />
                <Icon.Search
                  className="scale-120 cursor-pointer"
                  onClick={() => {
                    _studentName === ''
                      ? alert('텍스트 내용을 입력해주세요.')
                      : replace(`/teacher/absent?username=${_studentName}`)
                  }}
                />
              </div>
              <div className="md:hidden">
                <Button.lg
                  children={t('bulk_approve', '일괄 승인하기')}
                  onClick={() => {
                    if (isApprovalAuth) {
                      if (filter.value === FilterAbsentStatus.BEFORE_APPROVAL) {
                        if (absents && absents?.total > 0) {
                          setOpen(true)
                          setAgreeAll(true)
                        } else {
                          alert('승인할 서류가 없습니다.')
                        }
                      } else {
                        searchAlert()
                      }
                    } else {
                      alert('권한이 없습니다.')
                    }
                  }}
                  className="filled-primary w-full"
                />
              </div>
            </div>
            <div className="grid auto-cols-fr grid-flow-col gap-2 max-md:hidden">
              {/* PDF 버튼 */}
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
              />
              {/* Excel 버튼 */}
              <AbsentsExcelDownloadView
                startDate={startDate}
                endDate={endDate}
                selectedGroupId={selectedGroup && selectedGroup.id ? selectedGroup.id : undefined}
              />
              {/* 학급별출결현황 버튼 */}
              <AttendeeInfoDownloadView
                startDate={startDate}
                endDate={endDate}
                selectedGroupId={
                  selectedGroup && selectedGroup.id
                    ? selectedGroup.id
                    : me?.role === Role.TEACHER
                      ? me?.klassGroupId
                      : undefined
                }
              />
              <Button.lg
                children={t('bulk_approve', '일괄 승인하기')}
                onClick={() => {
                  if (isApprovalAuth) {
                    if (filter.value === FilterAbsentStatus.BEFORE_APPROVAL) {
                      if (absents && absents?.total > 0) {
                        setOpen(true)
                        setAgreeAll(true)
                      } else {
                        alert('승인할 서류가 없습니다.')
                      }
                    } else {
                      searchAlert()
                    }
                  } else {
                    alert('권한이 없습니다.')
                  }
                }}
                className="filled-primary"
              />
            </div>
          </div>
          <div className="h-0.5 bg-gray-100"></div>
          <div className="grid grid-cols-4 bg-gray-100 max-md:hidden">
            <button
              onClick={() => toggleSort('period')}
              className={clsx(
                'flex items-center justify-center',
                frontSortType !== 'period' && 'text-[#aaa] hover:underline hover:underline-offset-4',
              )}
            >
              <span className={clsx(frontSortType === 'period' && 'font-bold')}>{t('by_date', '기간순')}</span>
              {frontSortType === 'period' && <Icon.ChevronDown className={sortOrder === 'DESC' ? 'rotate-180' : ''} />}
            </button>
            <button
              onClick={() => toggleSort('request')}
              className={clsx(
                'flex items-center justify-center',
                frontSortType !== 'request' && 'text-[#aaa] hover:underline hover:underline-offset-4',
              )}
            >
              <span className={clsx(frontSortType === 'request' && 'font-bold')}>
                {t('by_application_date', '신청일순')}
              </span>
              {frontSortType === 'request' && <Icon.ChevronDown className={sortOrder === 'DESC' ? 'rotate-180' : ''} />}
            </button>
            <button
              onClick={() => toggleSort('name')}
              className={clsx(
                'flex items-center justify-center',
                frontSortType !== 'name' && 'text-[#aaa] hover:underline hover:underline-offset-4',
              )}
            >
              <span className={clsx(frontSortType === 'name' && 'font-bold')}>{t('by_name', '이름순')}</span>
              {frontSortType === 'name' && <Icon.ChevronDown className={sortOrder === 'DESC' ? 'rotate-180' : ''} />}
            </button>
            <button
              onClick={() => toggleSort('num')}
              className={clsx(
                'flex items-center justify-center',
                frontSortType !== 'num' && 'text-[#aaa] hover:underline hover:underline-offset-4',
              )}
            >
              <span className={clsx(frontSortType === 'num' && 'font-bold')}>{t('by_student_id', '학번순')}</span>
              {frontSortType === 'num' && <Icon.ChevronDown className={sortOrder === 'DESC' ? 'rotate-180' : ''} />}
            </button>
          </div>

          <div className="h-screen-18 overflow-y-auto pb-10">
            {absents?.items
              ?.sort((a, b) => compareAbsents(a, b, frontSortType, sortOrder))
              .map((absent) => (
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
        </div>
      </div>

      <div className="col-span-3 bg-gray-50 md:overflow-y-auto">
        <Switch>
          <Route path="/teacher/absent/add" component={() => <AbsentAddPage />} />
          <Route
            path={`/teacher/absent/:id`}
            component={() => (
              <AbsentDetailPage
                userId={me?.id}
                setOpen={(b: boolean) => setOpen(b)}
                setAbsentId={(n: number) => setAbsentId(n)}
                setAgreeAll={(b: boolean) => setAgreeAll(b)}
                me={me}
              />
            )}
          />
        </Switch>
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
                  className="absolute inset-0 z-10 overflow-hidden rounded bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url("${stampImgUrl}")` }}
                ></div>
              ) : (
                <div className="bg-grey-4 absolute inset-0 z-10 overflow-hidden rounded">
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
            <label htmlFor="stamp-upload">
              <div className="border-brandblue-1 flex h-13 w-full cursor-pointer items-center justify-center rounded-lg border bg-white px-6 font-bold text-current">
                도장등록
              </div>
            </label>
            <input
              id="stamp-upload"
              name="stamp-upload"
              type="file"
              className="sr-only"
              accept=".pdf, .png, .jpeg, .jpg"
              onChange={(e) => handleStampSetting(e)}
            />
            {!stampMode ? (
              <Button.xl
                children="도장 사용하기"
                onClick={() => {
                  setStampMode(true)
                  clearSignature()
                }}
                className="outlined-blue"
              />
            ) : (
              <Button.xl
                children="도장으로 승인"
                onClick={async () => {
                  if (!stampImgUrl) {
                    alert('도장이 등록되어 있지 않습니다.')
                  } else {
                    if (agreeAll) {
                      await approveAbsents()
                    } else {
                      await approveAbsent()
                    }
                    await setStampMode(false)
                  }
                }}
                className={clsx(
                  'text-white',
                  stampImgUrl ? 'bg-brandblue-1 border-4 border-red-500' : 'bg-brandblue-5',
                )}
              />
            )}
            <Button.xl
              children="서명 다시하기"
              onClick={() => {
                setStampMode(false)
                clearSignature()
              }}
              className="border-brand-1 border bg-white text-current"
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
                    agreeAll ? approveAbsents() : approveAbsent()
                  }
                }}
                className={clsx(sigPadData ? 'bg-brand-1 border-4 border-green-500' : 'bg-brand-5 text-brand-1')}
              />
            )}
          </div>
        </Section>
      </SuperModal>
    </>
  )
}
