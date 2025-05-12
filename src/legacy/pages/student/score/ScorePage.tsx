import clsx from 'clsx'
import { Link, Route, Switch, useParams } from 'react-router-dom'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { twMerge } from 'tailwind-merge'
import { MockExamPage } from './MockExamPage'
import { SchoolExamPage } from './SchoolExamPage'

export function ScorePage() {
  const { id, type } = useParams<{ id: string; type: string }>()
  return (
    <>
      <TopNavbar
        title={`성적확인`}
        borderless
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <div className="border-b-primary-gray-200 flex h-12 w-full flex-row items-end gap-4 border-b px-5">
        <Link
          to={`/student/score/${id}/school-exam`}
          className={twMerge(
            clsx(
              'flex w-full cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
              type === 'school-exam' ? 'border-b-2 border-[#121316] text-[#121316]' : 'mb-[2px] text-[#898d94]',
            ),
          )}
        >
          <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">내신성적</div>
        </Link>
        <Link
          to={`/student/score/${id}/mock-exam`}
          className={twMerge(
            clsx(
              'flex w-full cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
              type === 'mock-exam' ? 'border-b-2 border-[#121316] text-[#121316]' : 'mb-[2px] text-[#898d94]',
            ),
          )}
        >
          <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">모의고사</div>
        </Link>
      </div>
      <div className="scroll-box h-screen-12 overflow-y-auto">
        <Switch>
          <Route exact path="/student/score/:id/school-exam" render={() => <SchoolExamPage studentId={+id} />} />
          <Route path="/student/score/:id/mock-exam" render={() => <MockExamPage studentId={+id} />} />
        </Switch>
      </div>
    </>
  )
}
