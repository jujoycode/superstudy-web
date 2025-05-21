import { useEffect, useState } from 'react'

import { useOutletContext } from 'react-router-dom'
import { ScoreBottomSheet } from '@/legacy/components/bottomSheet/ScoreBottomSheet'
import { MobileBlank } from '@/legacy/components/common/MobileBlank'
import { FinalScoreTable } from '@/legacy/components/score/mobile/FinalScoreTable'
import { MiddleScoreTable } from '@/legacy/components/score/mobile/MiddleScoreTable'
import { SchoolScore, useSchoolExamScoreByParent, useSchoolExamScoreByStudent } from '@/legacy/container/student-score'

interface SchoolExamPageProps {
  studentId: number
}

export interface SchoolExamParams {
  studentId: number
  year: number
  grade: number
  semester: number
  step: string | number
}

export function SchoolExamPage() {
  const { studentId } = useOutletContext<{ studentId: number }>()
  const { data, isLoading } = useSchoolExamScoreByParent(studentId, 'SCHOOL')
  const [params, setParams] = useState<SchoolExamParams | undefined>()

  useEffect(() => {
    if (!isLoading && data && data.length > 0) {
      setParams({
        studentId,
        year: data[0].year,
        grade: data[0].grade,
        semester: data[0].semester,
        step: data[0].step,
      })
    }
  }, [studentId, isLoading])

  const { data: scores, isLoading: scoreLoading } = useSchoolExamScoreByStudent(
    params ?? {
      studentId,
      year: 0,
      grade: 0,
      semester: 0,
      step: '',
    },
    {
      enabled: !!params,
    },
  )

  const handleScoreChange = (score: SchoolScore) => {
    const newParams = {
      studentId,
      year: score.year,
      grade: score.grade,
      semester: score.semester,
      step: score.step,
    }

    setParams((prev) => (JSON.stringify(prev) === JSON.stringify(newParams) ? prev : newParams))
  }

  return (
    <main className="flex flex-col px-5 pt-5">
      {isLoading ? (
        <MobileBlank />
      ) : (
        <>
          <ScoreBottomSheet data={data} onChange={handleScoreChange} />
          {scoreLoading ? (
            <MobileBlank />
          ) : (
            <>
              {scores && params && (
                <>
                  {params.step === 'final' && <FinalScoreTable scores={scores?.scores} />}
                  {params.step === 1 && <MiddleScoreTable scores={scores?.scores} />}
                </>
              )}
            </>
          )}
        </>
      )}
    </main>
  )
}
