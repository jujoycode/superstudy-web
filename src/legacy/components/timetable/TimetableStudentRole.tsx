import { useEffect, useState } from 'react'

import { Icon } from '@/legacy/components/common/icons'
import { TextInput } from '@/legacy/components/common/TextInput'
import { makeStudNum5 } from '@/legacy/util/status'

interface TimetableStudentRoleProps {
  editmode: boolean
  student: any
  order: number
  setOrder: (order: number, isUpDir: boolean) => void
}

export function TimetableStudentRole({ editmode, student, order, setOrder }: TimetableStudentRoleProps) {
  const [stateRole, setStateRole] = useState(student.role)
  const [stateJob, setStateJob] = useState(student.job)

  useEffect(() => {
    setStateRole(student.role)
    setStateJob(student.job)
  }, [student])

  return (
    <>
      {editmode && (
        <div>
          <div className="flex w-full items-center justify-between px-4 py-2">
            <div className="flex w-full items-center">
              <div className="flex w-1/4 min-w-fit items-center justify-start">
                <div
                  onClick={() => setOrder(order, true)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2"
                >
                  <Icon.ChevronUp />
                </div>
                <div
                  onClick={() => setOrder(order, false)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2"
                >
                  <Icon.ChevronDown />
                </div>
                <div className="ml-2 text-sm md:text-lg">
                  {makeStudNum5(student.klassname + student.student_number)}
                </div>
                <div className="ml-2 text-sm md:text-lg">{student.name}</div>
              </div>
              <TextInput
                placeholder="역할"
                value={stateRole}
                onChange={(e) => {
                  setStateRole(e.target.value)
                  student.role = e.target.value
                }}
                className="ml-2 w-1/4"
              />
              <TextInput
                placeholder="하는 일"
                value={stateJob}
                onChange={(e) => {
                  setStateJob(e.target.value)
                  student.job = e.target.value
                }}
                className="ml-1 w-2/4"
              />
            </div>
          </div>
        </div>
      )}

      {!editmode && (
        <div>
          <div className="flex w-full items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-40 truncate rounded bg-blue-100 px-2.5 py-1.5 text-sm text-blue-600 md:text-base">
                {student.role ? student.role : '미지정'}
              </div>
              <div className="text-sm md:text-lg">{makeStudNum5(student.klassname + student.student_number)}</div>
              <div className="text-sm md:text-lg">{student.name}</div>
            </div>
          </div>
          {student.job !== '' && <div className="px-4 text-sm md:text-base">하는 일 : {student.job}</div>}
        </div>
      )}
    </>
  )
}
