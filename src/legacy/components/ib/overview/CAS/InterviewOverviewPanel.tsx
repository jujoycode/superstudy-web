import { useMemo } from 'react'
import { cn } from '@/utils/commonUtil'

import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { ResponseIBPortfolioInterviewSubmissionStatusDto } from '@/legacy/generated/model'

interface OverviewPanelProps {
  goDetailPage?: (studentIbId: number) => void
  data: ResponseIBPortfolioInterviewSubmissionStatusDto[]
  type?: number
  title: string
  buttonText?: string
  buttonHandler?: () => void
  className?: string
}

export default function InterviewOverviewPanel(props: OverviewPanelProps) {
  const { goDetailPage, data, title, buttonText, buttonHandler, type, className } = props

  const studentsToDisplay = useMemo(() => {
    if (!type) {
      return data
    }

    switch (type) {
      case 1:
        return data.filter((student) => student.interviewCount >= 1 && student.interviewCount < 2)
      case 2:
        return data.filter((student) => student.interviewCount >= 2 && student.interviewCount < 3)
      case 3:
        return data.filter((student) => student.interviewCount >= 3)
      default:
        return data
    }
  }, [data, type])

  const groupedByKlass = useMemo(() => {
    return studentsToDisplay.reduce(
      (acc, student) => {
        const grade = student.user.studentGroup.group.grade
        const klass = student.user.studentGroup.group.klass
        const groupKey = `${grade}-${klass}` // 학년-반 형식의 키 생성

        if (!acc[groupKey]) {
          acc[groupKey] = {
            name: student.user.studentGroup.group.name,
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
          students: ResponseIBPortfolioInterviewSubmissionStatusDto[]
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
            <Typography variant="body3" className="font-medium text-gray-500">
              {group.name}
            </Typography>
            <hr className="flex-1 border-t border-gray-100" />
          </div>

          {/* 해당 반의 학생 목록 출력 */}
          <div className="grid grid-cols-6 gap-3">
            {group.students
              .sort((a, b) => Number(a.user.studentGroup.studentNumber) - Number(b.user.studentGroup.studentNumber))
              .map((student) => (
                <div
                  key={student.id}
                  className={`text-14 flex h-[48px] w-[195px] items-center justify-between rounded-lg bg-gray-50 py-[14px] pr-4 pl-4 text-gray-700 ${
                    goDetailPage && 'hover:cursor-pointer'
                  }`}
                  onClick={goDetailPage ? () => goDetailPage(student.user.id) : undefined}
                >
                  <div className="flex flex-row items-center">
                    <Typography variant="body3" className="text-gray-700">
                      {student.user.studentGroup.group.grade}
                      {String(student.user.studentGroup.group.klass).padStart(2, '0')}
                      {String(student.user.studentGroup.studentNumber).padStart(2, '0')}
                    </Typography>
                    <span className="mx-1">·</span>
                    <Typography variant="body3" className="text-gray-700">
                      {student.user.name}
                    </Typography>
                  </div>
                  {goDetailPage && <SVGIcon.Arrow size={16} rotate={180} weight="bold" color="gray400" />}
                </div>
              ))}
          </div>
        </div>
      ))
  }

  const totalStudents = useMemo(() => studentsToDisplay.length, [studentsToDisplay])
  const containerStyles = cn('w-full rounded-xl border border-gray-200 p-6 flex flex-col gap-6', className)

  return (
    <div className={containerStyles}>
      <div className="flex justify-between">
        <Typography variant="title3" className="text-gray-900">
          {title} <span className="text-primary-800">{totalStudents}명</span>
        </Typography>
        {buttonText && totalStudents > 0 && (
          <ButtonV2 variant="outline" color="gray400" size={32} onClick={buttonHandler}>
            {buttonText}
          </ButtonV2>
        )}
      </div>
      {renderGroupedStudents()}
    </div>
  )
}
