import React, { useEffect, useState } from 'react'
import { useStudentTestScore } from '@/legacy/container/student-semesters-score'
import { List } from '@/legacy/components/common'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'

interface ExamScoreBoardProps {
  studentId: string
  grade: number
}

const semesterOptions = ['1학기 1차 지필', '1학기 2차 지필', '2학기 1차 지필', '2학기 2차 지필']

export function INDIExamScoreBoard({ studentId, grade }: ExamScoreBoardProps) {
  const { scores, isLoading } = useStudentTestScore(Number(studentId))
  const [selectedSemester, setSelectedSemester] = useState<string>('1학기 1차 지필')
  const [structuredScores, setStructuredScores] = useState<any>({})
  useEffect(() => {
    if (scores) {
      const newScoreDatas = scores.reduce((acc: any, scoreData: any) => {
        const gradeLabel = `${scoreData.grade}학년`
        const firstSemesterLabel = `${scoreData.semester}학기 1차 지필`
        const secondSemesterLabel = `${scoreData.semester}학기 2차 지필`

        // 1차 지필 점수 추가
        if (scoreData.first_test_scores) {
          acc[`${gradeLabel} ${firstSemesterLabel}`] = scoreData.first_test_scores
        }

        // 2차 지필 점수 추가
        if (scoreData.second_test_scores) {
          acc[`${gradeLabel} ${secondSemesterLabel}`] = scoreData.second_test_scores
        }

        return acc
      }, {})

      setStructuredScores(newScoreDatas)
    }
  }, [scores])

  const currentKey = `${grade}학년 ${selectedSemester}`
  const currentScores = structuredScores[currentKey] || {}

  const formatSubject = (subject: string) => {
    if (subject === 'total_score') return '총점'
    if (subject === 'average_score') return '평균'
    return subject
  }

  return (
    <>
      <List className="flex flex-row gap-2 md:m-0">
        {semesterOptions.map((sem, index) => (
          <React.Fragment key={sem}>
            <span
              onClick={() => setSelectedSemester(sem)}
              className={`${
                selectedSemester === sem ? 'font-bold' : 'text-gray-300'
              } cursor-pointer transition-all hover:font-bold hover:text-black`}
            >
              {sem}
            </span>
            {index < semesterOptions.length - 1 && <span className="mx-2 text-gray-300">|</span>}
          </React.Fragment>
        ))}
      </List>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <IBBlank type="section" />
          <Typography variant="body3" className="font-medium">
            성적 데이터를 불러오고 있습니다.
          </Typography>
        </div>
      ) : (
        <div className="text-14 relative mt-4 overflow-x-auto rounded-lg shadow-md">
          <table className="w-full text-left text-gray-500 rtl:text-right">
            <thead className="bg-gray-200 text-gray-700 uppercase">
              <tr>
                <th scope="col" className="h-4 w-1/6 border-r border-gray-300 p-2 text-center">
                  과목
                </th>
                <th scope="col" className="w-1/6 border-r border-gray-300 px-2 py-2 text-center">
                  점수
                </th>
                <th scope="col" className="w-1/6 border-r border-gray-300 px-2 py-2 text-center">
                  학급 평균
                </th>
                <th scope="col" className="w-1/6 border-r border-gray-300 px-2 py-2 text-center">
                  학년 평균
                </th>
                <th scope="col" className="w-1/6 border-r border-gray-300 px-2 py-2 text-center">
                  학급 응시생
                </th>
                <th scope="col" className="w-1/6 px-2 py-2 text-center">
                  학년 응시생
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(currentScores).length > 0 ? (
                Object.entries(currentScores).map(([subject, details]: [string, any]) => (
                  <tr key={subject} className="hover:bg-gray-5 border-b bg-white">
                    <td className="border-r border-gray-300 px-2 py-2 text-center">{formatSubject(subject)}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center">{details.score}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center">{details.class_score_mean}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center">{details.total_score_mean}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center">
                      {details.class_enrolled_student_num}
                    </td>
                    <td className="px-2 py-2 text-center">{details.total_enrolled_student_num}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border-r border-gray-300 px-2 py-4 text-center">
                    데이터가 추가되지 않았습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
