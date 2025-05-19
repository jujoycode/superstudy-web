import clsx from 'clsx'
import { useMemo } from 'react'

import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { ResponseIBPortfolioReflectionDiarySubmissionStatusDto } from '@/legacy/generated/model'

interface OverviewPanelProps {
  goDetailPage?: (studentIbId: number) => void
  data: ResponseIBPortfolioReflectionDiarySubmissionStatusDto[]
  type?: 'LESS' | 'MORE'
  title: string
  buttonText?: string
  buttonHandler: () => void
  className?: string
}

export default function ActivityLogOverviewPanel(props: OverviewPanelProps) {
  const { goDetailPage, data, title, buttonText, buttonHandler, type, className } = props

  const studentsToDisplay = useMemo(() => {
    if (!type) {
      return data
    }

    switch (type) {
      case 'LESS':
        return data.filter((student) => student.reflectionDiaryCount >= 1 && student.reflectionDiaryCount < 3)
      case 'MORE':
        return data.filter((student) => student.reflectionDiaryCount >= 3)
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
          students: ResponseIBPortfolioReflectionDiarySubmissionStatusDto[]
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
              .sort((a, b) => Number(a.user.studentGroup.studentNumber) - Number(b.user.studentGroup.studentNumber))
              .map((student) => (
                <div
                  key={student.id}
                  className={`bg-primary-gray-50 text-14 text-primary-gray-700 flex h-[48px] w-[195px] items-center justify-between rounded-lg py-[14px] pr-4 pl-4 ${
                    goDetailPage && 'hover:cursor-pointer'
                  }`}
                  onClick={goDetailPage ? () => goDetailPage(student.user.id) : undefined}
                >
                  <div className="flex flex-row items-center">
                    <Typography variant="body3" className="text-primary-gray-700">
                      {student.user.studentGroup.group.grade}
                      {String(student.user.studentGroup.group.klass).padStart(2, '0')}
                      {String(student.user.studentGroup.studentNumber).padStart(2, '0')}
                    </Typography>
                    <span className="mx-1">·</span>
                    <Typography variant="body3" className="text-primary-gray-700">
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
  const containerStyles = clsx('w-full rounded-xl border border-primary-gray-200 p-6 flex flex-col gap-6', className)

  return (
    <div className={containerStyles}>
      <div className="flex justify-between">
        <Typography variant="title3" className="text-primary-gray-900">
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
