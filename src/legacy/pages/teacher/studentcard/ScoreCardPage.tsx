import { cn } from '@/utils/commonUtil'
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { AllScore } from '@/legacy/components/score/AllScore'
import { ScoreAnalysis } from '@/legacy/components/score/ScoreAnalysis'
import { TargetScore } from '@/legacy/components/score/TargetScore'
import { useTeacherStudentCard } from '@/legacy/container/teacher-studentcard'

export type ScoreType = 'EXAM' | 'MOCKEXAM'

export const ScoreCardPage = () => {
  const { id, groupId } = useParams<{ id: string; groupId: string }>()
  const { studentInfo } = useTeacherStudentCard(Number(id))
  const { pathname } = useLocation()

  const grade = studentInfo?.student.klassGroupName?.match(/\d+/)?.[0]

  return (
    <div className="scroll-box h-screen-12 md:h-screen-5 mt-6 overflow-y-auto px-4 pb-4">
      <div className="flex flex-col gap-10 rounded-xl border border-gray-200 bg-white py-4">
        <div className="flex h-12 w-full flex-row items-end gap-4 border-b border-b-gray-200 px-8">
          <Link
            to={`/teacher/studentcard/${groupId}/${id}/score`}
            className={twMerge(
              cn(
                'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                pathname.includes('score') && !pathname.includes('target-score') && !pathname.includes('analysis')
                  ? 'border-b-2 border-[#121316] text-[#121316]'
                  : 'mb-[2px] text-[#898d94]',
              ),
            )}
          >
            <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">내신성적</div>
          </Link>
          <Link
            to={`/teacher/studentcard/${groupId}/${id}/score/analysis`}
            className={twMerge(
              cn(
                'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                pathname.includes('analysis')
                  ? 'border-b-2 border-[#121316] text-[#121316]'
                  : 'mb-[2px] text-[#898d94]',
              ),
            )}
          >
            <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">성적분석</div>
          </Link>
          <Link
            to={`/teacher/studentcard/${groupId}/${id}/score/target-score`}
            className={twMerge(
              cn(
                'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                pathname.includes('target-score')
                  ? 'border-b-2 border-[#121316] text-[#121316]'
                  : 'mb-[2px] text-[#898d94]',
              ),
            )}
          >
            <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">목표성적</div>
          </Link>
        </div>
        <div className="px-8 pb-4">
          <Routes>
            <Route
              path={`/teacher/studentcard/${groupId}/${id}/score`}
              Component={() => <AllScore studentId={id || ''} grade={Number(grade)} />}
            />
            <Route
              path={`/teacher/studentcard/${groupId}/${id}/score/analysis`}
              Component={() => <ScoreAnalysis studentId={id || ''} />}
            />
            <Route
              path={`/teacher/studentcard/${groupId}/${id}/score/target-score`}
              Component={() => <TargetScore studentId={id || ''} grade={Number(grade)} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  )
}
