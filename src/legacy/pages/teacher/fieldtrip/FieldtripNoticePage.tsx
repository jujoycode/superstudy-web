import { useState } from 'react'
import { toDate } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Outlet } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { SortState } from '@/constants/enumConstant'
import { Divider } from '@/atoms/Divider'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { ErrorBlank, FrontPagination } from '@/legacy/components'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { FieldtripNoticeCard } from '@/legacy/components/fieldtrip/FieldtripNoticeCard'
import { useTeacherFieldtripNotice } from '@/legacy/container/teacher-fieldtrip-notice'
import { UserContainer } from '@/legacy/container/user'
import { DateUtil } from '@/legacy/util/date'
import { getCurrentSchoolYear } from '@/legacy/util/time'

export function FieldtripNoticePage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: toDate(DateUtil.getAMonthAgo(new Date())),
    to: new Date(),
  })

  const [frontSortType, setFrontSortType] = useState('period')
  const [sortOrder, setSortOrder] = useState<SortState>(SortState.DESC)
  const schoolYear = getCurrentSchoolYear()

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

  const { replace } = useHistory()

  return (
    <>
      {error && <ErrorBlank />}
      <Grid>
        <GridItem colSpan={6}>
          <ResponsiveRenderer mobile={<TopNavbar title="체험학습 통보서" left={<BackButton />} />} />
          <PageHeaderTemplate
            title="체험학습 통보서"
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
              searchBar: {
                placeholder: '이름 검색',
                searchState: {
                  value: _studentName,
                  setValue: (v) => {
                    set_studentName(v)
                    if (v === '') replace(`/teacher/fieldtrip/notice`)
                    setPage(1)
                  },
                },
                onSearch: () => _studentName && replace(`/teacher/fieldtrip/notice?username=${_studentName}`),
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
            }}
          />
          <Divider height="0.5" color="bg-gray-100" />
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
        </GridItem>
        <GridItem colSpan={6} className="bg-gray-50">
          <Outlet context={{ school: me?.school }} />
        </GridItem>
      </Grid>
    </>
  )
}
