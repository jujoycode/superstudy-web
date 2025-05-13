import { useState } from 'react'
import { Route, Switch, useHistory } from 'react-router-dom'
import { ErrorBlank, SelectMenus } from '@/legacy/components'
import { Button } from '@/legacy/components/common/Button'
import { useTeacherRecord } from '@/legacy/container/teacher-record'
import { makeStudNum5 } from '@/legacy/util/status'
import { RecordDetailPage } from './RecordDetailPage'

export function RecordPage() {
  const { push, goBack } = useHistory()
  const [selectedSGId, setSelectedSGId] = useState(0)

  const {
    studentGroups,
    selectedGroup,
    setSelectedGroup,
    uniqueGroups,
    errorGroups,
    downloadRecordSummary,
    downloadRecordActivity,
  } = useTeacherRecord()

  if (!selectedGroup) {
    return <ErrorBlank text="생활기록부는 수업을 맡은 선생님만 접근가능합니다." />
  }

  if (errorGroups) return <ErrorBlank />

  return (
    <div className="col-span-6 grid grid-cols-6">
      <div className="col-span-2 hidden h-screen border-r border-gray-200 md:block">
        <div className="px-6 py-6">
          <div className="mb-5 flex justify-between">
            <h1 className="text-2xl font-semibold">생활기록부</h1>
          </div>
          <div className="w-max">
            <div className="mr-3 mb-5 ml-3 flex items-center justify-between space-x-2">
              <SelectMenus
                items={uniqueGroups.map((tg) => ({ id: tg.id, name: tg.name }))}
                value={selectedGroup?.id?.toString()}
                allText="{학년/반}"
                onChange={(group) => setSelectedGroup(group)}
              />
            </div>
            <div>
              <div className="text-center text-gray-500">일괄 다운로드</div>
              <div className="flex items-center space-x-2">
                <Button.xl children="총정리" onClick={() => downloadRecordSummary()} className="filled-primary" />
                <Button.xl children="활동내역" onClick={() => downloadRecordActivity()} className="filled-primary" />
              </div>
            </div>
          </div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
        {/* 생기부 이름 리스트 */}
        <div className="scroll-box h-screen-12 w-full overflow-y-auto">
          <div className="mb-20 grid w-full grid-flow-row grid-cols-2 gap-2 px-5">
            {studentGroups?.map((sg) => (
              <div
                key={sg.id}
                className={`cursor-pointer rounded-lg border-2 py-2 text-center ${
                  sg.id === selectedSGId && 'border-brand-1 bg-light_orange'
                }`}
                onClick={() => {
                  localStorage.setItem('recordSummary', ' ')
                  setSelectedSGId(sg.id)
                  push(`/teacher/record/${sg?.user?.id}`)
                }}
              >
                {sg?.user?.studentGroups &&
                  makeStudNum5(
                    sg?.user?.studentGroups[0].group?.name + sg?.user?.studentGroups[0].studentNumber.toString(),
                  )}{' '}
                {sg?.user?.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="scroll-box col-span-4 h-screen overflow-y-scroll">
        <Switch>
          <Route
            path="/teacher/record/:id"
            component={() => <RecordDetailPage selectedGroup={selectedGroup} studentGroups={studentGroups} />}
          />
        </Switch>
      </div>
    </div>
  )
}
