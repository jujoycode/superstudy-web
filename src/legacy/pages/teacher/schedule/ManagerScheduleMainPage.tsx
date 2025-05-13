import { useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ManagerScheduleCard } from '@/legacy/components/timetable/ManagerScheduleCard'
import { makeDateToString, weekAgo } from '@/legacy/util/time'
import { ManagerScheduleDetailPage } from './ManagerScheduleDetailPage'

let manager = [{ id: 1 }, { id: 2 }, { id: 3 }]

export function ManagerScheduleMainPage() {
  const [startDate, setStartDate] = useState(makeDateToString(weekAgo(new Date())))
  const userRole = 'teacher'

  return (
    <>
      <div className="col-span-3 hidden h-screen md:block">
        <div className="px-6 py-6">
          <div className="flex justify-between">
            <h1 className="text-2xl font-semibold">학사일정 관리</h1>
          </div>
          <div className="my-4 flex items-center space-x-3">
            <TextInput
              type="date"
              value={makeDateToString(new Date(startDate))}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <h1 className="text-2xl font-semibold">2021.10.01(금)</h1>
        </div>
        <div className="scroll-box h-screen-5 overflow-y-auto">
          {manager?.map((manager: any) => <ManagerScheduleCard userRole={userRole} manager={manager} />)}
        </div>
      </div>
      <div className="scroll-box col-span-3 bg-gray-50 p-6">
        <Switch>
          {/* <Route path="/teacher/fieldtrip/add" component={AddNoticePage} /> */}
          <Route path="/teacher/manager/:id" component={ManagerScheduleDetailPage} />
        </Switch>
      </div>
    </>
  )
}
