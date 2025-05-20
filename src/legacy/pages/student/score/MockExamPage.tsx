import { useEffect, useState } from 'react'

import { useOutletContext } from 'react-router-dom'
import { MockBottomSheet } from '@/legacy/components/bottomSheet/MockBottomSheet'
import { MobileBlank } from '@/legacy/components/common/MobileBlank'
import { MockScore, useMockExamScoreByStudent, useSchoolExamScoreByParent } from '@/legacy/container/student-score'

interface MockExamParams extends MockScore {
  studentId: number
}

export function MockExamPage() {
  const { studentId } = useOutletContext<{ studentId: number }>()
  const { data, isLoading } = useSchoolExamScoreByParent(studentId, 'MOCK')
  const [params, setParams] = useState<MockExamParams | undefined>()

  useEffect(() => {
    if (!isLoading && data && data.length > 0) {
      setParams({
        studentId,
        year: data[0].year,
        grade: data[0].grade,
        month: data[0].month,
      })
    }
  }, [studentId, isLoading])

  const { data: scores, isLoading: scoreLoading } = useMockExamScoreByStudent(
    params ?? {
      studentId,
      year: 0,
      grade: 0,
      month: 0,
    },
    {
      enabled: !!params,
    },
  )

  const simpleScores = scores?.scores?.filter((score: any) => !('sub_subject' in score)) ?? []
  const detailedScores = scores?.scores?.filter((score: any) => 'sub_subject' in score) ?? []

  const handleScoreChange = (score: MockScore) => {
    const newParams = {
      studentId,
      year: score.year,
      grade: score.grade,
      month: score.month,
    }

    setParams((prev) => (JSON.stringify(prev) === JSON.stringify(newParams) ? prev : newParams))
  }
  return (
    <main className="flex flex-col px-5 pt-5">
      {isLoading ? (
        <MobileBlank />
      ) : (
        <>
          <MockBottomSheet data={data} onChange={handleScoreChange} />
          {scoreLoading ? (
            <MobileBlank />
          ) : (
            scores &&
            params && (
              <div className="w-full pt-4">
                <table className="w-full table-fixed border-collapse">
                  <thead className="text-15 text-center font-normal text-gray-600">
                    <tr>
                      <td className="w-[129px] border-b border-b-gray-200 bg-gray-50 px-2 py-[9px]">영역</td>
                      <td className="w-1/4 border-x border-b border-gray-200 bg-gray-50 px-2 py-[9px]">점수</td>
                      <td className="w-1/4 border-x border-b border-gray-200 bg-gray-50 px-2 py-[9px]">표준</td>
                      <td className="w-1/4 border-x border-b border-gray-200 bg-gray-50 px-2 py-[9px]">백분</td>
                      <td className="w-1/4 border-b border-l border-gray-200 bg-gray-50 px-2 py-[9px]">등급</td>
                    </tr>
                  </thead>
                  <tbody className="text-15 text-center text-gray-900">
                    {simpleScores.map((score: any, index: number) => (
                      <tr key={score.subject}>
                        <td
                          className={`w-[129px] border-r border-b border-r-gray-100 px-2 py-[11px] font-medium ${
                            index === simpleScores.length - 1 ? 'border-b-gray-200' : 'border-b-gray-100'
                          }`}
                        >
                          {score.subject}
                        </td>
                        <td
                          className={`w-1/4 border border-gray-100 px-2 py-[11px] font-medium ${
                            index === simpleScores.length - 1 ? 'border-b-gray-200' : 'border-b-gray-100'
                          }`}
                        >
                          {score.score || '-'}
                        </td>
                        <td
                          className={`w-1/4 border border-gray-100 px-2 py-[11px] font-medium ${
                            index === simpleScores.length - 1 ? 'border-b-gray-200' : 'border-b-gray-100'
                          }`}
                        >
                          {score.standard_score || '-'}
                        </td>
                        <td
                          className={`w-1/4 border border-gray-100 px-2 py-[11px] font-medium ${
                            index === simpleScores.length - 1 ? 'border-b-gray-200' : 'border-b-gray-100'
                          }`}
                        >
                          {score.percentage || '-'}
                        </td>
                        <td
                          className={`w-1/4 border-b border-l border-gray-100 px-2 py-[11px] font-medium ${
                            index === simpleScores.length - 1 ? 'border-b-gray-200' : 'border-b-gray-100'
                          }`}
                        >
                          {score.rank || '-'}
                        </td>
                      </tr>
                    ))}
                    {detailedScores.map((score: any) => {
                      const isOptional = score.subject === '탐구1' || score.subject === '탐구2'
                      return (
                        <tr key={score.subject}>
                          <td className="w-[129px] border-r border-b border-r-gray-100 border-b-gray-100 px-2 py-[11px]">
                            {score.subject}&nbsp;{isOptional ? `(${score.sub_subject})` : ''}
                          </td>
                          <td className="w-1/4 border border-gray-100 px-2 py-[11px]">{score.score || '-'}</td>
                          <td className="w-1/4 border border-gray-100 px-2 py-[11px]">{score.standard_score || '-'}</td>
                          <td className="w-1/4 border border-gray-100 px-2 py-[11px]">{score.percentage || '-'}</td>
                          <td className="w-1/4 border-b border-l border-gray-100 px-2 py-[11px]">
                            {score.rank || '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}
    </main>
  )
}
