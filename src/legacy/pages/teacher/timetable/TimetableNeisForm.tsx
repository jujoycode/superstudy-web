import { useMemo } from 'react'
import { makeStudNum5 } from '@/legacy/util/status'
import { AttendanceContent } from './TimetableAttendancePage'

type StudentType = {
  id: number
  name: string
  nick_name: string
  content: AttendanceContent[]
  comment: string
  type1: string
  type2: string
  focus: boolean
}

interface TimetableNeisFormProps {
  students: any[]
  lastPeriod: number
}

export function TimetableNeisForm({ students, lastPeriod }: TimetableNeisFormProps) {
  const studentsAbsent = useMemo(() => {
    return students
      .filter((student: any) => !student.expired && !student.not_attend) // expired가 false인 학생만 필터링
      .map((student: any) => {
        let content: AttendanceContent[] = []
        let comment = ''
        let type1 = ''
        let type2 = ''
        let focus = false

        if (student.content) {
          try {
            const parsedContent = JSON.parse(student.content)
            if (parsedContent.attendance) {
              content = parsedContent.attendance
            }
          } catch (error) {
            console.error('JSON parsing error:', error)
          }

          content.forEach((lecture) => {
            if (lecture.absent && lecture.type2 !== '인정') {
              focus = true
              type1 = lecture.type1
              type2 = lecture.type2
            } else if (lecture.type2 === '인정') {
              focus = true
              if (type1 === '' && type2 === '') {
                type1 = lecture.type1
                type2 = lecture.type2
              }
            }

            if (!comment && !!lecture.comment) {
              comment = lecture.comment
            }
          })
        }

        return {
          id: student.id,
          name: makeStudNum5(student.klassname + student.student_number) + ' ' + student.name,
          nick_name: '',
          content,
          comment,
          type1,
          type2,
          focus,
        } as StudentType
      })
  }, [students])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <table className="w-full">
          <thead>
            <tr className="border-y text-sm">
              <th className="p-1">이름</th>
              <th className="p-1">조회</th>
              {Array.from({ length: lastPeriod }).map((_, i) => (
                <th key={i} className="p-1">
                  {i + 1}교시
                </th>
              ))}
              <th className="p-1">종례</th>
              <th className="p-1">출결상태</th>
              <th className="p-1">비고</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {studentsAbsent
              .sort((a, b) => {
                if (a.focus !== b.focus) {
                  return a.focus ? -1 : 1
                }
                return a.name.localeCompare(b.name)
              })
              .map((student) => (
                <tr key={student.id} className={`border-y ${student.focus ? 'bg-red-50' : ''}`}>
                  <td className="text-left">{student.name}</td>
                  {Array.from({ length: lastPeriod + 1 }).map((_, i) => (
                    <td
                      key={i}
                      className={`border-l px-1 text-center ${student.content[i] && student.content[i].type2 === '인정' ? 'text-red-500' : ''} `}
                    >
                      {student.content[i] &&
                        (student.content[i].type2 === '인정' ? '-' : student.content[i].absent ? '/' : '')}
                    </td>
                  ))}
                  <td
                    className={`border-l px-1 text-center ${student.content[lastPeriod] && student.content[lastPeriod].type2 === '인정' ? 'text-red-500' : ''} `}
                  >
                    {student.content[lastPeriod] &&
                      (student.content[lastPeriod].type2 === '인정'
                        ? '-'
                        : student.content[lastPeriod].absent
                          ? '/'
                          : '')}
                  </td>
                  <td
                    className={`border-l px-1 text-center whitespace-pre-line ${student.type2 === '인정' ? 'text-red-500' : ''} `}
                  >
                    {student.focus ? `${student.type2}${student.type1}` : ''}
                  </td>
                  <td className="max-w- px-1">{student.comment}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
