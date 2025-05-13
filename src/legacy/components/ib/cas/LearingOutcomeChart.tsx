import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'

import { Typography } from '@/legacy/components/common/Typography'
import { CAS_LEARNINGOUTCOME } from '@/legacy/constants/ib'
import { ResponseIBCasDtoLearningOutcome, ResponseIBOnlyCasDto } from '@/legacy/generated/model'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface LearningOutcomeChartProps {
  projects?: ResponseIBOnlyCasDto[]
}

const LearningOutcomeChart = ({ projects }: LearningOutcomeChartProps) => {
  const calculateLearningOutcomes = (projects?: ResponseIBOnlyCasDto[]) => {
    if (!projects) return {}

    const counts: Record<string, number> = {}

    projects
      .filter((p) => p.status)
      .forEach((project) => {
        const outcomes = project.cas?.learningOutcome
        if (outcomes) {
          Object.keys(outcomes).map((key) => {
            if (!counts[key]) counts[key] = 0
            if (outcomes[key as keyof ResponseIBCasDtoLearningOutcome]) {
              counts[key]++
            }
          })
        }
      })

    return counts
  }

  const learningOutcomeCounts = calculateLearningOutcomes(projects)
  const hasData = Object.values(learningOutcomeCounts).some((count) => count > 0)
  const maxDataValue = 8
  const barWidthPerUnit = maxDataValue > 0 ? 100 / maxDataValue : 0

  return (
    <div className="relative flex w-full flex-col gap-2">
      {/* 기준선 배경 */}
      <div className="flex w-full flex-row gap-6">
        <div className="w-[192px]"></div>
        <div className="absolute top-2 left-[224px] h-[188px] w-[264px]">
          <div className="relative flex h-full w-full justify-between">
            {Array.from({ length: 9 }, (_, i) => (
              <div className="relative" key={i}>
                {/* 기준선 */}
                <div className="bg-primary-gray-100 absolute top-0 left-0 h-full w-[1px] -translate-x-1/2 transform" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {CAS_LEARNINGOUTCOME.map(({ value, name, id }) => (
        <div key={id} className="flex w-full flex-row items-center gap-6">
          {/* 라벨 */}
          <Typography variant="body3" className="min-w-[192px]">
            {value}
          </Typography>
          {/* 막대 그래프 */}
          <div className="z-10 ml-2 h-3 w-[264px]">
            <div
              className={`h-full ${
                hasData ? 'border-dim-8 bg-gradient-navy-400 rounded-r-[4px]' : 'bg-primary-gray-200'
              }`}
              style={{
                width: hasData
                  ? `${Math.min(learningOutcomeCounts[name], maxDataValue) * barWidthPerUnit}%` // 데이터가 8을 초과하지 않도록 제한
                  : '100%',
              }}
            />
          </div>
        </div>
      ))}
      <div className="flex w-full flex-row gap-6">
        <div className="min-w-[192px]"></div>
        <div className="relative flex w-[280px] flex-row justify-between">
          {Array.from({ length: 9 }, (_, i) => i).map((month) => {
            return (
              <div className="relative w-4 text-center" key={month}>
                <div className="bg-dim-300 absolute top-0 left-1/2 h-full w-px -translate-x-1/2 transform" />
                <Typography variant="caption3" className="text-primary-gray-400">
                  {month}
                </Typography>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LearningOutcomeChart
