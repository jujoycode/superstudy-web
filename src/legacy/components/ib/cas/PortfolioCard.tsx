import { useTranslation } from 'react-i18next'

import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import { Typography } from '@/legacy/components/common/Typography'
import { ResponseIBPortfolioListDto } from '@/legacy/generated/model'

import CASPercent from './CASPercent'

interface PortfolioCardProps {
  data: ResponseIBPortfolioListDto
}

function PortfolioCard({ data }: PortfolioCardProps) {
  const { push } = useHistory()
  const { t } = useTranslation()

  const trueLearningOutcomes = Object.entries(data.projectInfo.learningOutcome || {})
    .filter(([_, value]) => value === true) // 값이 true인 항목만 필터링
    .map(([key]) => key)
  return (
    <div
      className={`border-primary-gray-200 box-border flex h-[380px] w-[308px] cursor-pointer flex-col rounded-xl border bg-white shadow-[0_4px_8px_0_rgb(244,246,248)]`}
    >
      {/* flag 영역 */}
      <div className="border-b-primary-gray-100 box-border flex flex-row items-center justify-between border-b px-5 py-2">
        <div className="flex flex-row items-center">
          <Typography variant="body3" className="text-primary-gray-700">
            {data.user.studentGroup.group.grade}
            {String(data.user.studentGroup.group.klass).padStart(2, '0')}
            {String(data.user.studentGroup.studentNumber).padStart(2, '0')}
          </Typography>
          <span className="mx-1">·</span>
          <Typography variant="body3" className="text-primary-gray-700">
            {data.user.name}
          </Typography>
        </div>
        <div className="border-primary-gray-400 flex h-5 flex-row items-center rounded-[4px] border px-1.5 py-0.5">
          <Typography variant="caption2" className="text-primary-gray-700 font-medium">
            진행중인 활동
          </Typography>
          &nbsp;
          <Typography variant="caption2" className="text-primary-800 font-medium">
            {data.projectInfo.count}개
          </Typography>
        </div>
      </div>
      <div className="w-[308px] flex-1 px-5 pt-5 pb-5">
        {/* info 영역 */}
        <main
          className="box-border flex h-full flex-col gap-5"
          onClick={() => push(`/teacher/ib/cas/portfolio/${data.user.id}`)}
        >
          {data.projectInfo.count === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-20">
              <div className="h-12 w-12 px-[2.50px]">
                <img src={NODATA} className="h-12 w-[43px] object-cover" />
              </div>
              <Typography variant="body2" className="text-center">{`진행중인 CAS 활동이 없습니다`}</Typography>
            </div>
          ) : (
            <>
              <CASPercent data={data.projectInfo.strands} />
              <div className="flex flex-col gap-2">
                <Typography variant="body3" className="font-medium">
                  7가지 학습성과
                </Typography>
                <div className="flex flex-wrap items-center gap-1.5">
                  {trueLearningOutcomes.length === 0 ? (
                    <Typography variant="caption">학생이 진행중인 CAS 활동이 없습니다.</Typography>
                  ) : (
                    <>
                      {trueLearningOutcomes.map((outcome) => (
                        <span
                          className="bg-primary-gray-100 text-13 text-primary-gray-700 rounded-[4px] px-2 py-[3px] font-medium"
                          key={outcome}
                        >
                          {t(`trueLearningOutcomes.${outcome}`)}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className="mt-auto flex flex-col gap-2">
                <span className="flex flex-row items-center justify-between gap-4">
                  <Typography variant="body3" className="font-medium">
                    성찰일지
                  </Typography>
                  <div className="mx-2 h-[1px] flex-1 border-t border-dashed border-gray-300"></div>
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded ${
                      data.reflectionDiaryCount === 0 ? 'bg-primary-gray-500' : 'bg-primary-800'
                    } text-11 px-1 py-px font-medium text-white`}
                  >
                    {data.reflectionDiaryCount}
                  </span>
                </span>
                <span className="flex flex-row items-center justify-between gap-4">
                  <Typography variant="body3" className="font-medium">
                    인터뷰일지
                  </Typography>
                  <div className="mx-2 h-[1px] flex-1 border-t border-dashed border-gray-300"></div>
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded ${
                      data.interviewCount === 0 ? 'bg-primary-gray-500' : 'bg-primary-800'
                    } text-11 px-1 py-px font-medium text-white`}
                  >
                    {data.interviewCount}
                  </span>
                </span>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default PortfolioCard
