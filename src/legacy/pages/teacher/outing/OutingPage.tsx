import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { cn } from '@/utils/commonUtil'
import { ErrorBlank, FrontPagination, SelectMenus, SuperModal } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { OutingCard } from '@/legacy/components/outing/OutingCard'
import { OutingsExcelDownloadView } from '@/legacy/components/outing/OutingExcelDownloadView'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherOutgoing } from '@/legacy/container/teacher-outgoing'
import { UserContainer } from '@/legacy/container/user'
import { ResponseCreateOutingDto, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { compareOutings } from '@/legacy/util/document'
import { PermissionUtil } from '@/legacy/util/permission'
import { getCurrentSchoolYear, isValidDate, makeDateToString } from '@/legacy/util/time'

export function OutingPage() {
  const { replace } = useHistory()
  const { me } = UserContainer.useContext()
  const { t, currentLang } = useLanguage()
  const userRole = me?.role

  const [agreeAll, setAgreeAll] = useState(false)
  const [_studentName, set_studentName] = useState('')

  const [frontSortType, setFrontSortType] = useState('')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')
  const { allKlassGroups: groups } = GroupContainer.useContext()
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
    signature: { canvasRef, sigPadData, clearSignature },
    stamp: { stamp, stampMode, stampImgUrl, updateStamp, setStampMode },
    filters,
    filter,
    setFilter,
    outingTypes,
    type,
    setType,
    startDate,
    setStartDate,
    endDate,
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

  const { pathname } = useLocation()
  const isDetail = !pathname.endsWith('/teacher/outing')

  const searchAlert = () => {
    const confirmed = window.confirm(
      '승인 전 상태의 내용만 일괄 승인이 가능합니다. \n승인 전 상태인 건들을 조회하시겠습니까?',
    )
    if (confirmed) {
      setFilter(filters[1])
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
      <div className={`h-screen-6 col-span-3 md:h-screen ${isDetail ? 'hidden' : 'block'} md:block`}>
        <div className="md:hidden">
          <TopNavbar title="확인증" left={<BackButton />} />
        </div>

        <div className="scroll-box flex flex-col overflow-x-scroll px-3 py-2 md:px-6 md:py-4">
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">{t('certificate', '확인증')}</h1>
              <Link
                children={t('write', '작성하기')}
                to="/teacher/outing/add"
                className="bg-primary-50 text-primary-800 hover:bg-primary-800 hover:text-primary-50 rounded-md px-4 py-2 text-sm focus:outline-hidden"
              />
            </div>
            <div className="mb-5 text-sm text-gray-500">
              ※ {t('early_leave_pass_outpass_certificate', '조퇴증,외출증,확인증')}
              {currentLang === 'ko' ? ' / ' : <br />}
              {t('documents_before_early_leave_outpass_certificate', '조퇴,외출,확인 전 작성 서류')}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center md:justify-start md:space-x-3">
              <input
                type="date"
                value={makeDateToString(new Date(startDate))}
                min={schoolYear.start}
                max={schoolYear.end}
                className="focus:border-primary-800 h-12 w-full rounded-lg border border-gray-200 p-2 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 md:p-4"
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
                className="focus:border-primary-800 h-12 w-full rounded-lg border border-gray-200 p-2 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 md:p-4"
                type="date"
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
              <div className="min-w-max cursor-pointer">
                <SelectMenus
                  allText={t('show_all', '전체보기')}
                  items={filters}
                  onChange={(e) => setFilter(e)}
                  value={filter}
                  tooltip={t('approval_state', '승인 상태')}
                ></SelectMenus>
              </div>
              <div className="min-w-max cursor-pointer">
                <SelectMenus
                  allText={t('show_all', '전체보기')}
                  items={outingTypes}
                  onChange={(e) => setType(e)}
                  value={type}
                  tooltip={t('category', '분류')}
                ></SelectMenus>
              </div>
              {outings &&
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
                        items={groups.filter((el) =>
                          me?.role === Role.PRE_HEAD || me?.role === Role.HEAD
                            ? el.name?.startsWith(me?.headNumber.toString())
                            : true,
                        )}
                        value={selectedGroup}
                        onChange={(group: any) => setSelectedGroup(group)}
                        tooltip={t('class', '학급')}
                      />
                    </div>
                  </>
                )}
              <div className="flex w-full items-center space-x-2">
                <SearchInput
                  placeholder={t('search_by_name', '이름 검색')}
                  value={_studentName}
                  onChange={(e) => {
                    set_studentName(e.target.value)
                    if (e.target.value === '') replace(`/teacher/outing`)
                    setPage(1)
                  }}
                  onSearch={() => _studentName && replace(`/teacher/outing?username=${_studentName}`)}
                  className="w-full"
                />
                <Icon.Search
                  className="scale-150 cursor-pointer"
                  onClick={() => {
                    _studentName.trim() === ''
                      ? alert('텍스트 내용을 입력해주세요.')
                      : replace(`/teacher/outing?username=${_studentName.trim()}`)
                  }}
                />
              </div>
            </div>
          </div>
          <div className="grid auto-cols-fr grid-flow-col gap-2 max-md:hidden">
            {/* 확인증현황 Excel 버튼 */}
            <OutingsExcelDownloadView
              startDate={startDate}
              endDate={endDate}
              selectedGroupId={undefined}
              username={_studentName}
              outingStatus={filter.value}
            />
            <Button.lg
              children={t('bulk_approve', '일괄 승인하기')}
              disabled={!PermissionUtil.hasOutingAuthorization(userRole)}
              onClick={() => {
                if (filter.value === 'BEFORE_APPROVAL') {
                  if (outings && outings.total > 0) {
                    setOpen(true)
                    setAgreeAll(true)
                  } else {
                    alert('승인할 서류가 없습니다.')
                  }
                } else {
                  searchAlert()
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

        <div className="h-screen-18 overflow-y-auto">
          {outings?.items
            ?.sort((a, b) => compareOutings(a, b, frontSortType, sortOrder))
            .map((outing: ResponseCreateOutingDto) => <OutingCard key={outing.id} outing={outing} type={'outing'} />)}
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
      </div>
      <div className="col-span-3 bg-gray-50 md:h-screen md:overflow-y-auto">
        <Outlet context={{ isLoading, setOutingId, setOpen, setAgreeAll, userRole }} />
        {/* <Routes>
          <Route path="/teacher/outing/add" Component={() => <OutingAddPage />} />
          <Route
            path="/teacher/outing/:id"
            Component={() => (
              <OutingDetailPage
                isLoading={isLoading}
                setOutingId={(n: number) => setOutingId(n)}
                setOpen={(b: boolean) => setOpen(b)}
                setAgreeAll={(b: boolean) => setAgreeAll(b)}
                userRole={userRole}
                // {...props} // URL 매개변수 전달
              />
            )}
          />
        </Routes> */}
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
            <label>
              <div className="flex h-13 w-full cursor-pointer items-center justify-center rounded-lg border border-blue-500 bg-white px-6 font-bold text-current">
                도장등록
              </div>
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
                className={cn('text-white', stampImgUrl ? 'border-4 border-red-500 bg-blue-500' : 'bg-brandblue-5')}
              />
            )}
            <Button.xl
              children="서명 다시하기"
              onClick={() => {
                setStampMode(false)
                clearSignature()
              }}
              className="outlined-primary"
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
                    agreeAll ? approveOutings() : approveOuting()
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
