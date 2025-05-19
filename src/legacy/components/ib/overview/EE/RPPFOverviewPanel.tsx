import clsx from 'clsx'
import { useMemo } from 'react'

import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import {
  ResponseIBRPPFSubmissionStatusDto,
  ResponseIBRPPFSubmissionStatusDtoDetailStatus,
} from '@/legacy/generated/model'

interface OverviewPanelProps {
  data: ResponseIBRPPFSubmissionStatusDto[]
  title: string
  buttonText?: string
  type?: ResponseIBRPPFSubmissionStatusDtoDetailStatus
  buttonHandler?: () => void
  buttonDisabled?: boolean
  className?: string
  action?: (studentIbId: number, rppfId: number) => void
}

export default function RPPFOverviewPanel(props: OverviewPanelProps) {
  const { action, data, title, buttonText, buttonHandler, type, className, buttonDisabled } = props

  const studentsToDisplay = useMemo(() => {
    if (!type) {
      return data
    }

    return data.filter((student) => student.detailStatus === type)
  }, [data, type])

  const groupedByKlass = useMemo(() => {
    return studentsToDisplay.reduce(
      (acc, student) => {
        const grade = student.leader.studentGroup.group.grade
        const klass = student.leader.studentGroup.group.klass
        const groupKey = `${grade}-${klass}` // 학년-반 형식의 키 생성

        if (!acc[groupKey]) {
          acc[groupKey] = {
            name: student.leader.studentGroup.group.name,
            grade,
            klass,
            students: [],
          }
        }
        acc[groupKey].students.push(student)
        return acc
      },
      {} as Record<
        string,
        {
          name: string
          grade: number
          klass: number
          students: ResponseIBRPPFSubmissionStatusDto[]
        }
      >,
    )
  }, [studentsToDisplay])

  const renderGroupedStudents = () => {
    return Object.entries(groupedByKlass)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // 학년-반 순으로 정렬
      .map(([groupKey, group]) => (
        <div key={groupKey}>
          {/* 반 이름 출력 */}
          <div className="mb-4 flex items-center gap-3">
            <Typography variant="body3" className="text-primary-gray-500 font-medium">
              {group.name}
            </Typography>
            <hr className="border-primary-gray-100 flex-1 border-t" />
          </div>

          {/* 해당 반의 학생 목록 출력 */}
          <div className="grid grid-cols-6 gap-3">
            {group.students
              .sort((a, b) => Number(a.leader.studentGroup.studentNumber) - Number(b.leader.studentGroup.studentNumber))
              .map((student) => (
                <div
                  key={student.id}
                  className={`bg-primary-gray-50 text-14 text-primary-gray-700 flex h-[48px] w-[195px] items-center justify-between rounded-lg py-[14px] pr-4 pl-4 ${
                    action && 'hover:cursor-pointer'
                  }`}
                  onClick={action ? () => action(student.id, student.rppf.id) : undefined}
                >
                  <div className="flex flex-row items-center">
                    <Typography variant="body3" className="text-primary-gray-700">
                      {student.leader.studentGroup.group.grade}
                      {String(student.leader.studentGroup.group.klass).padStart(2, '0')}
                      {String(student.leader.studentGroup.studentNumber).padStart(2, '0')}
                    </Typography>
                    <span className="mx-1">·</span>
                    <Typography variant="body3" className="text-primary-gray-700">
                      {student.leader.name}
                    </Typography>
                  </div>
                  {action && <SVGIcon.Arrow size={16} rotate={180} weight="bold" color="gray400" />}
                </div>
              ))}
          </div>
        </div>
      ))
  }

  const totalStudents = useMemo(() => studentsToDisplay.length, [studentsToDisplay])
  const containerStyles = clsx('w-full rounded-xl border border-primary-gray-200 p-6 flex flex-col gap-6', className)

  return (
    <div className={containerStyles}>
      <div className="flex justify-between">
        <Typography variant="title3">
          {title} <span className="text-primary-800">{totalStudents}명</span>
        </Typography>
        {buttonText && data.length > 0 && (
          <ButtonV2 variant="outline" color="gray400" size={32} onClick={buttonHandler} disabled={buttonDisabled}>
            {buttonText}
          </ButtonV2>
        )}
      </div>
      {renderGroupedStudents()}
    </div>
  )
}
