import { Link } from 'react-router-dom'

import type { Manager } from '@/legacy/types'

interface ManagerScheduleCardProps {
  manager: Manager
  userRole: string
}

export function ManagerScheduleCard({ manager }: ManagerScheduleCardProps) {
  return (
    <>
      <Link to={`/teacher/manager/${manager.id}`}>
        <div className="relative flex w-full items-center justify-between p-4">
          <div>
            <h3 className="text-lg font-semibold">학교 개교기념일</h3>
            <div className="text-xs text-gray-500">2021.10.01(금) {manager.reportedAt}</div>
          </div>
          <div></div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
      </Link>
    </>
  )
}
