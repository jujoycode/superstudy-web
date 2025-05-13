import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import { TextInput } from '@/legacy/components/common/TextInput'
import { ManagerScheduleCard } from '@/legacy/components/timetable/ManagerScheduleCard'
import { Manager } from '@/legacy/types'
import { makeDateToString, weekAgo } from '@/legacy/util/time'

import { ManagerScheduleDetailPage } from './ManagerScheduleDetailPage'

const manager = [{ id: 1 } as Manager, { id: 2 } as Manager, { id: 3 } as Manager]

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
          {manager?.map((manager: Manager) => <ManagerScheduleCard userRole={userRole} manager={manager} />)}
        </div>
      </div>
      <div className="scroll-box col-span-3 bg-gray-50 p-6">
        <Routes>
          {/* <Route path="/teacher/fieldtrip/add" component={AddNoticePage} /> */}
          <Route path="/teacher/manager/:id" Component={ManagerScheduleDetailPage} />
        </Routes>
      </div>
    </>
  )
}
