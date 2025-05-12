import { useQueryClient } from 'react-query'
import { Route, Switch, useHistory, useLocation, useParams } from 'react-router'
import { ErrorBlank, Tab } from '@/legacy/components'
import { Blank } from '@/legacy/components/common'
import { SubmitterItem } from '@/legacy/components/record/SubmitterItem'
import { useTeacherActivitySubmit } from '@/legacy/container/teacher-activity-submit'
import { nameWithId } from '@/legacy/types'
import { ActivitySubmitDetailPage } from './ActivitySubmitDetailPage'

interface ActivitySubmitPageProps {
  group?: nameWithId | null
}

export function ActivitySubmitPage({ group }: ActivitySubmitPageProps) {
  const { push } = useHistory()
  const { id } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const queryClient = useQueryClient()
  const isDetail = !pathname.endsWith('/teacher/activity/submit/' + id)

  const { isError, isLoading, filteredUser, filterIndex, setFilterIndex } = useTeacherActivitySubmit(
    +id,
    group && group?.id === 0 ? undefined : group?.id,
  )

  if (isError) {
    return <ErrorBlank />
  }

  return (
    <div className="h-screen-8 ml-0.5 bg-white md:grid md:h-screen md:grid-cols-7">
      {isLoading && <Blank reversed />}
      <div className={`col-span-4 ${isDetail && 'hidden'} md:block`}>
        <div className="flex w-full items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg">제출자 리스트</h3>
            <div className="text-sm text-gray-500">총 {filteredUser?.length}명</div>
          </div>
          <div className="text-brand-1 cursor-pointer" onClick={() => queryClient.refetchQueries({ active: true })}>
            새로고침
          </div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
        <Tab
          type="submit"
          filter={filterIndex}
          setFilter={(n) => {
            localStorage.setItem('selectedFilter', n.toString())
            setFilterIndex(n)
          }}
        />
        <div className="h-screen-14 md:h-screen-8 overflow-y-scroll p-4">
          {filteredUser?.map((user) => (
            <SubmitterItem
              key={user.userId}
              user={user}
              id={id}
              onClick={() => push(`/teacher/activity/submit/${id}/${user.studentActivityId}`)}
            />
          ))}
        </div>
      </div>
      <div className="col-span-3">
        <Switch>
          <Route
            path={`/teacher/activity/submit/${id}/:said`}
            component={() => <ActivitySubmitDetailPage activityId={+id} />}
          />
        </Switch>
      </div>
    </div>
  )
}
