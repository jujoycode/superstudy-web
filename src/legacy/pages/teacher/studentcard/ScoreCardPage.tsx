import clsx from 'clsx';
import { Link, Route, Switch, useLocation, useParams } from 'react-router-dom';
import { AllScore } from 'src/components/score/AllScore';
import { ScoreAnalysis } from 'src/components/score/ScoreAnalysis';
import { TargetScore } from 'src/components/score/TargetScore';
import { useTeacherStudentCard } from 'src/container/teacher-studentcard';
import { twMerge } from 'tailwind-merge';

export type ScoreType = 'EXAM' | 'MOCKEXAM';

export const ScoreCardPage = () => {
  const { id, groupId } = useParams<{ id: string; groupId: string }>();
  const { studentInfo } = useTeacherStudentCard(Number(id));
  const { pathname } = useLocation();

  const grade = studentInfo?.student.klassGroupName?.match(/\d+/)?.[0];

  return (
    <div className="scroll-box mt-6 h-screen-12 overflow-y-auto px-4 pb-4 md:h-screen-5">
      <div className="flex flex-col gap-10 rounded-xl border border-primary-gray-200 bg-white py-4">
        <div className="flex h-12 w-full flex-row items-end gap-4 border-b border-b-primary-gray-200 px-8">
          <Link
            to={`/teacher/studentcard/${groupId}/${id}/score`}
            className={twMerge(
              clsx(
                'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                pathname.includes('score') && !pathname.includes('target-score') && !pathname.includes('analysis')
                  ? 'border-b-2 border-[#121316] text-[#121316]'
                  : 'mb-[2px] text-[#898d94]',
              ),
            )}
          >
            <div className="shrink grow basis-0 text-center text-[16px] font-semibold leading-[24px]">내신성적</div>
          </Link>
          <Link
            to={`/teacher/studentcard/${groupId}/${id}/score/analysis`}
            className={twMerge(
              clsx(
                'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                pathname.includes('analysis')
                  ? 'border-b-2 border-[#121316] text-[#121316]'
                  : 'mb-[2px] text-[#898d94]',
              ),
            )}
          >
            <div className="shrink grow basis-0 text-center text-[16px] font-semibold leading-[24px]">성적분석</div>
          </Link>
          <Link
            to={`/teacher/studentcard/${groupId}/${id}/score/target-score`}
            className={twMerge(
              clsx(
                'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                pathname.includes('target-score')
                  ? 'border-b-2 border-[#121316] text-[#121316]'
                  : 'mb-[2px] text-[#898d94]',
              ),
            )}
          >
            <div className="shrink grow basis-0 text-center text-[16px] font-semibold leading-[24px]">목표성적</div>
          </Link>
        </div>
        <div className="px-8 pb-4">
          <Switch>
            <Route
              exact
              path={`/teacher/studentcard/${groupId}/${id}/score`}
              render={() => <AllScore studentId={id} grade={Number(grade)} />}
            />
            <Route
              exact
              path={`/teacher/studentcard/${groupId}/${id}/score/analysis`}
              render={() => <ScoreAnalysis studentId={id} />}
            />
            <Route
              path={`/teacher/studentcard/${groupId}/${id}/score/target-score`}
              render={() => <TargetScore studentId={id} grade={Number(grade)} />}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
};
