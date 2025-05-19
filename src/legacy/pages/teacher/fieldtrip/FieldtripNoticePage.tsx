import { useState } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'

import { ErrorBlank, FrontPagination } from '@/legacy/components'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { TextInput } from '@/legacy/components/common/TextInput'
import { FieldtripNoticeCard } from '@/legacy/components/fieldtrip/FieldtripNoticeCard'
import { useTeacherFieldtripNotice } from '@/legacy/container/teacher-fieldtrip-notice'
import { UserContainer } from '@/legacy/container/user'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useQueryParams } from '@/legacy/hooks/useQueryParams'
import { getCurrentSchoolYear, isValidDate, makeDateToString } from '@/legacy/util/time'

import { FieldtripNoticeDetailPage } from './FieldtripNoticeDetailPage'

export function FieldtripNoticePage() {
  const { pathname } = useLocation()
  const isDetail = !pathname.endsWith('/teacher/fieldtrip/notice')
  const { t } = useLanguage()

  const { replaceWithQueryParams } = useQueryParams()

  const [frontSortType, setFrontSortType] = useState('')
  const schoolYear = getCurrentSchoolYear()

  const frontSort = (sortType: string) => {
    setFrontSortType(sortType)
  }

  function makeStudentNumber(studentGradeKlass: string, studentNumber: string): number {
    const grade = parseInt(studentGradeKlass.split(' ')[0])
    const klass = parseInt(studentGradeKlass.split(' ')[1])
    return grade * 10000 + klass * 100 + parseInt(studentNumber)
  }

  const {
    error,
    startDate,
    endDate,
    data,
    page,
    limit,
    isViewAuth,
    isApprovalAuth,
    _studentName,
    set_studentName,
    setPage,
    setStartDate,
    setEndDate,
  } = useTeacherFieldtripNotice()
  const { me } = UserContainer.useContext()

  return (
    <>
      {error && <ErrorBlank />}
      <div className="md:hidden">
        <TopNavbar title="체험학습 통보서" left={<BackButton />} />
      </div>
      <div className={`h-screen-7 col-span-3 md:h-screen ${isDetail && 'hidden'} md:block`}>
        <div className="px-6 pb-4 md:pt-6">
          <div className="flex hidden justify-between md:block">
            <h1 className="text-2xl font-semibold">{t('experiential_learning_notification', '체험학습 통보서')}</h1>
          </div>
          <div className="my-3 flex items-center space-x-3">
            <TextInput
              type="date"
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
            <TextInput
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
          <div className="flex w-full items-center space-x-2">
            <SearchInput
              placeholder={`${t('search_by_name', '이름 검색')}`}
              value={_studentName}
              onChange={(e) => {
                set_studentName(e.target.value)
                //if (e.target.value === '') replace(`/teacher/fieldtrip`);
              }}
              onSearch={() =>
                _studentName && replaceWithQueryParams('/teacher/fieldtrip/notice', { username: _studentName })
              }
              className="w-full"
            />
            <Icon.Search
              onClick={() => {
                _studentName === ''
                  ? alert('텍스트 내용을 입력해주세요.')
                  : replaceWithQueryParams('/teacher/fieldtrip/notice', { username: _studentName })
              }}
            />
          </div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
        <div className="grid grid-cols-4 bg-gray-100 max-md:hidden">
          <button onClick={() => frontSort('period')} className="flex items-center justify-center">
            <span>{t('by_date', '기간순')}</span>
            {frontSortType === 'period' && <Icon.ChevronDown />}
          </button>
          <button onClick={() => frontSort('request')} className="flex items-center justify-center">
            <span>{t('by_application_date', '신청일순')}</span>
            {frontSortType === 'request' && <Icon.ChevronDown />}
          </button>
          <button onClick={() => frontSort('name')} className="flex items-center justify-center">
            <span>{t('by_name', '이름순')}</span>
            {frontSortType === 'name' && <Icon.ChevronDown />}
          </button>
          <button onClick={() => frontSort('num')} className="flex items-center justify-center">
            <span>{t('by_student_id', '학번순')}</span>
            {frontSortType === 'num' && <Icon.ChevronDown />}
          </button>
        </div>
        {!isViewAuth && !isApprovalAuth && <div className="text-center">권한이 없습니다.</div>}
        {isViewAuth && (
          <div className="h-screen-14 overflow-y-auto pb-10 md:pb-0">
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
              .map((fieldtrip) => <FieldtripNoticeCard key={fieldtrip.id} fieldtrip={fieldtrip} />)}
          </div>
        )}
        {data && data?.total > limit && (
          <div className="grid min-w-max place-items-center">
            <FrontPagination
              basePath="/teacher/fieldtrip/notice"
              total={data?.total}
              limit={limit}
              page={page}
              setPage={setPage}
            />
          </div>
        )}
      </div>
      <div className="col-span-3 bg-gray-50 md:p-6">
        <Outlet context={{ school: me?.school }} />
        {/* <Routes>
          <Route
            path="/teacher/fieldtrip/notice/:id"
            Component={() => <FieldtripNoticeDetailPage school={me?.school} />}
          />
        </Routes> */}
      </div>
    </>
  )
}
