import { useEffect, useState } from 'react'
import { Route, Switch, useHistory, useLocation } from 'react-router'
import { SelectMenus } from '@/legacy/components'
import { ActivitiesView } from '@/legacy/components/activity/ActivitiesView'
import { BackButton, Label, Select, TopNavbar } from '@/legacy/components/common'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Icon } from '@/legacy/components/common/icons'
import { useTeacherActivity } from '@/legacy/container/teacher-activity'
import { nameWithId } from '@/legacy/types'
import { ActivityAddPage } from './ActivityAdd'
import { ActivityDetailPage } from './ActivityDetailPage'
import { ActivityDownloadPage } from './ActivityDownloadPage'
import { ActivitySubmitPage } from './ActivitySubmitPage'

const filters = ['제목', '작성자']

export function ActivityPage() {
  const { replace } = useHistory()
  const { pathname } = useLocation()
  const isDetail = !pathname.endsWith('/teacher/activity')

  const [loadActivitiesView, setLoadActivitiesView] = useState(false)
  const [isUpdateState, setUpdateState] = useState(false)
  const [filter, setFilter] = useState(filters[0])
  const [searchWriter, setSearchWriter] = useState('')
  const [searchTitle, setSearchTitle] = useState('')

  const {
    subject,
    setSubject,
    year,
    setYear,
    selectedGroup,
    setSelectedGroup,
    subjectArray,
    groupArray,
    errorMessage,
  } = useTeacherActivity()

  const handleFilterChange = (e: any) => {
    setSearchWriter('')
    setSearchTitle('')
    setFilter(e.target.value)
  }

  useEffect(() => {
    setSubject(subjectArray[0])
    setSelectedGroup(groupArray[0])
  }, [subjectArray])

  return (
    <div className="col-span-6 md:grid md:grid-cols-6">
      {/* {isLoadingGroups && <Blank />} */}
      <div className="md:hidden">
        <TopNavbar title="활동기록부" left={<BackButton />} />
      </div>
      {/* 활동기록부 리스트 */}
      <div className={`h-screen-14 ${isDetail && 'hidden'} md:col-span-2 md:block md:h-screen`}>
        <div className="hidden place-items-center justify-between px-6 pt-6 pb-3 md:flex">
          <h1 className="text-2xl font-semibold">활동기록부</h1>
          <Label.col>
            <Label.Text children={'년도'} />
            <Select.lg value={year} onChange={(e) => setYear(e.target.value)}>
              {[2023, 2024].map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </Select.lg>
          </Label.col>
        </div>
        <div className="flex items-center space-x-2 px-6 pt-3">
          <div className="cursor-pointer">
            <SelectMenus
              label="과목"
              items={subjectArray}
              value={subject}
              allText="선택하기"
              onChange={(sbj: string) => {
                setSubject(sbj === '전체' ? undefined : sbj)
                setSelectedGroup(groupArray[0])
              }}
            />
          </div>
          <div className="cursor-pointer">
            <SelectMenus
              label="그룹/학급"
              items={groupArray}
              value={selectedGroup || undefined}
              allText="선택하기"
              onChange={(group: nameWithId) => {
                setSelectedGroup(group)
                replace('/teacher/activity')
              }}
            />
          </div>
        </div>
        {subject && (
          <>
            <div className="mt-3 flex items-center space-x-2 px-6 pb-6">
              <div className="cursor-pointer">
                <Select.lg value={filter} onChange={handleFilterChange}>
                  {filters.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </Select.lg>
              </div>
              <div className="flex w-full items-center space-x-2">
                {filter === '제목' ? (
                  <SearchInput
                    placeholder="제목을 입력해주세요."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <SearchInput
                    placeholder="작성자를 입력해주세요."
                    value={searchWriter}
                    onChange={(e) => setSearchWriter(e.target.value)}
                    className="w-full"
                  />
                )}
                <Icon.Search />
              </div>
            </div>
          </>
        )}
        {/* 모바일에서 추가하기 막음 */}
        {/* <Link to="/teacher/activity/add">
          <button
            children="추가하기"
            className="rounded-md bg-light_orange px-4 py-4 text-sm text-brand-1 hover:bg-brand-1 hover:text-light_orange focus:outline-none md:hidden"
          />
        </Link> */}
        {subjectArray.length === 0 ? (
          <div className="text-center">할당된 과목이 없습니다.</div>
        ) : (
          <div className="scroll-box h-screen-16 overflow-y-auto">
            {selectedGroup && (
              <ActivitiesView
                groupId={selectedGroup.id}
                subject={subject}
                loadActivitiesView={loadActivitiesView}
                setUpdateState={() => setUpdateState(false)}
                subjects={subjectArray}
                searchWriter={searchWriter}
                searchTitle={searchTitle}
              />
            )}
          </div>
        )}
      </div>

      <div className="scroll-box bg-gray-50 md:col-span-4">
        <Switch>
          <Route
            path="/teacher/activity/add"
            component={() => (
              <ActivityAddPage
                refetch={() => {
                  setLoadActivitiesView(!loadActivitiesView)
                }}
              />
            )}
          />
          <Route path="/teacher/activity/submit/:id" component={() => <ActivitySubmitPage group={selectedGroup} />} />

          <Route
            path="/teacher/activity/download/:id"
            component={() => <ActivityDownloadPage group={selectedGroup} />}
          />

          <Route
            path="/teacher/activity/:id"
            component={() => (
              <ActivityDetailPage
                isUpdateState={isUpdateState}
                setUpdateState={(b: boolean) => setUpdateState(b)}
                refetch={() => {
                  setLoadActivitiesView(!loadActivitiesView)
                }}
              />
            )}
          />
          <Route
            path="/teacher/activity"
            component={() => <div className="flex h-full w-full items-center justify-center"></div>}
          />
        </Switch>
      </div>
    </div>
  )
}
