import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useStudentSemetsersScore } from '@/legacy/container/student-semesters-score'
import { List } from '@/legacy/components/common'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'

interface ExamScoreBoardProps {
  studentId: string
}

export function ExamScoreBoard({ studentId }: ExamScoreBoardProps) {
  const { scores, isLoading } = useStudentSemetsersScore(Number(studentId))
  const semesterOptions = [
    '성적분석',
    '1학년 1학기',
    '1학년 2학기',
    '2학년 1학기',
    '2학년 2학기',
    '3학년 1학기',
    '3학년 2학기',
  ]
  const [selectedSemester, setSelectedSemester] = useState<string>('성적분석')

  useEffect(() => {
    if (scores) {
      const newScoreDatas: any = {}

      scores.forEach((scoreData: any) => {
        const label = `${scoreData.grade}학년 ${scoreData.semester}학기`

        if (!newScoreDatas[label]) {
          newScoreDatas[label] = []
        }

        newScoreDatas[label].push(...scoreData.scores)
      })

      setScoreDatas(newScoreDatas)
    }
  }, [scores])
  const [scoreDatas, setScoreDatas] = useState<any>({})

  // 교과별 성적 데이터 추출
  const groupedData = _.chain(scores)
    .map('scores')
    .flatten()
    .groupBy('subject_group')
    .mapValues((subjectScores) => _.groupBy(subjectScores, (score) => `${score.grade}학년 ${score.semester}학기`))
    .value()

  return (
    <>
      <List className="scrollable-wide flex w-full flex-row gap-2 md:m-0">
        {semesterOptions.map((sem, index) => (
          <React.Fragment key={sem}>
            <span
              onClick={() => setSelectedSemester(sem)}
              className={`${
                selectedSemester === sem ? 'font-bold' : 'text-gray-300'
              } min-w-max cursor-pointer transition-all hover:font-bold hover:text-black`}
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
        <>
          {selectedSemester === '성적분석' ? (
            <div className="scrollable-wide text-12 mt-4">
              <table className="border-primary-gray-200 w-full table-auto border text-left text-gray-500 rtl:text-right">
                <thead className="bg-gray-200 text-gray-700 uppercase">
                  <tr>
                    <th scope="col" className="h-4 min-w-[120px] border-r border-gray-300 p-2 text-center">
                      교과
                    </th>
                    <th scope="col" className="min-w-[120px] border-r border-gray-300 px-2 py-2 text-center">
                      과목
                    </th>
                    <th scope="col" className="min-w-[80px] border-r border-gray-300 px-2 py-2 text-center">
                      학년
                    </th>
                    <th scope="col" className="min-w-[80px] border-r border-gray-300 px-2 py-2 text-center">
                      학기
                    </th>
                    <th scope="col" className="min-w-[60px] border-r border-gray-300 px-2 py-2 text-center">
                      단위
                    </th>
                    <th scope="col" className="min-w-[80px] border-r border-gray-300 px-2 py-2 text-center">
                      원 점수
                    </th>
                    <th scope="col" className="min-w-[80px] border-r border-gray-300 px-2 py-2 text-center">
                      Z 점수
                    </th>
                    <th scope="col" className="min-w-[100px] border-r border-gray-300 px-2 py-2 text-center">
                      등급
                    </th>
                    <th scope="col" className="min-w-[60px] border-r border-gray-300 px-2 py-2 text-center">
                      성취도
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedData).length > 0 ? (
                    Object.keys(groupedData).map((subjectGroup) => (
                      <React.Fragment key={subjectGroup}>
                        {Object.keys(groupedData[subjectGroup]).map((semester, semesterIndex) => (
                          <React.Fragment key={semester}>
                            {groupedData[subjectGroup][semester].map((score, index) => (
                              <tr
                                key={`${score.subject_name}-${score.grade}-${score.semester}-${index}`}
                                className="border-b bg-white"
                              >
                                {index === 0 && semesterIndex === 0 && (
                                  <td
                                    className="border-r border-b border-gray-300 px-2 py-2 text-center"
                                    rowSpan={Object.values(groupedData[subjectGroup]).flat().length}
                                  >
                                    {subjectGroup}
                                  </td>
                                )}
                                <td className="border-r border-gray-300 px-2 py-2 font-medium">{score.subject_name}</td>
                                <td className="border-r border-gray-300 px-2 py-2">{`${score.grade}학년`}</td>
                                <td className="border-r border-gray-300 px-2 py-2">{`${score.semester}학기`}</td>
                                <td className="border-r border-gray-300 px-2 py-2 text-center">{score.credit}</td>
                                <td className="border-r border-gray-300 px-2 py-2 text-center">{score.score}</td>
                                <td className="border-r border-gray-300 px-2 py-2 text-center">
                                  {Number(score.zscore).toFixed(2)}
                                </td>
                                <td className="border-r border-gray-300 px-2 py-2 text-center">
                                  {score.rank_score || '-'}
                                </td>
                                <td className="px-2 py-2 text-center">{score.rank_alphabet || '-'}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="border-r border-gray-300 px-2 py-4 text-center">
                        데이터가 추가되지 않았습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="scrollable-wide text-12 mt-4">
              <table className="border-primary-gray-200 w-full table-auto border text-left text-gray-500 rtl:text-right">
                <thead className="bg-gray-200 text-gray-700 uppercase">
                  <tr>
                    <th scope="col" className="h-4 min-w-[120px] border-r border-gray-300 p-2 text-center">
                      교과
                    </th>
                    <th scope="col" className="min-w-[120px] border-r border-gray-300 px-2 py-2 text-center">
                      과목
                    </th>
                    <th scope="col" className="min-w-[80px] border-r border-gray-300 px-2 py-2 text-center">
                      과목 종류
                    </th>
                    <th scope="col" className="min-w-[60px] border-r border-gray-300 px-2 py-2 text-center">
                      단위
                    </th>
                    <th scope="col" className="min-w-[80px] border-r border-gray-300 px-2 py-2 text-center">
                      원 점수
                    </th>
                    <th scope="col" className="min-w-[80px] border-r border-gray-300 px-2 py-2 text-center">
                      Z 점수
                    </th>
                    <th scope="col" className="min-w-[100px] border-r border-gray-300 px-2 py-2 text-center">
                      등급
                    </th>
                    <th scope="col" className="min-w-[60px] border-r border-gray-300 px-2 py-2 text-center">
                      성취도
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scoreDatas[selectedSemester]?.length > 0 ? (
                    scoreDatas[selectedSemester].map((score: any, index: number) => (
                      <tr
                        key={`${score.subject_name}-${score.grade}-${score.semester}-${index}`}
                        className="border-b bg-white hover:bg-gray-50"
                      >
                        <td className="border-r border-gray-300 px-2 py-2 font-medium">{score.subject_group}</td>
                        <td className="border-r border-gray-300 px-2 py-2">{score.subject_name}</td>
                        <td className="border-r border-gray-300 px-2 py-2">{score.subject_type}</td>
                        <td className="border-r border-gray-300 px-2 py-2 text-center">{score.credit}</td>
                        <td className="border-r border-gray-300 px-2 py-2 text-center">{score.score}</td>
                        <td className="border-r border-gray-300 px-2 py-2 text-center">
                          {Number(score.zscore).toFixed(2)}
                        </td>
                        <td className="border-r border-gray-300 px-2 py-2 text-center">{score.rank_score || '-'}</td>
                        <td className="px-2 py-2 text-center">{score.rank_alphabet || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="border-r border-gray-300 px-2 py-4 text-center">
                        데이터가 추가되지 않았습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
