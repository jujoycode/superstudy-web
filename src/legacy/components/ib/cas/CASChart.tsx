import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { useEffect, useRef, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Typography } from '@/legacy/components/common/Typography'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import { ResponseIBPortfolioDto } from '@/legacy/generated/model'
import LearningOutcomeChart from './LearingOutcomeChart'

interface CASChartProps {
  data?: ResponseIBPortfolioDto
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

function CASChart({ data }: CASChartProps) {
  const chartRef = useRef<any>(null)

  const projects =
    data?.projects?.filter((el) =>
      ['IN_PROGRESS', 'WAIT_COMPLETE', 'REJECT_COMPLETE', 'COMPLETE'].includes(el.status),
    ) || []

  const totalStrands = projects.reduce(
    (acc, project) => {
      const strands = project.cas?.strands || { creativity: 0, activity: 0, service: 0 }
      return {
        creativity: acc.creativity + (strands.creativity || 0),
        activity: acc.activity + (strands.activity || 0),
        service: acc.service + (strands.service || 0),
      }
    },
    { creativity: 0, activity: 0, service: 0 },
  )

  const options = {
    responsive: true,
    cutout: '68%', // 도넛 그래프의 중심 영역 크기
    plugins: {
      tooltip: {
        enabled: false, // 기본 툴팁 비활성화
      },
      legend: {
        display: false, // 기본 범례 숨기기
      },
    },
  }
  const totalSum = (totalStrands?.creativity || 0) + (totalStrands?.activity || 0) + (totalStrands?.service || 0)
  const hasData = totalSum > 0
  const creativityPercent = ((totalStrands?.creativity || 0) / totalSum) * 100 || 0
  const activityPercent = ((totalStrands?.activity || 0) / totalSum) * 100 || 0
  const servicePercent = ((totalStrands?.service || 0) / totalSum) * 100 || 0

  const [chartData, setChartData] = useState<ChartData<'doughnut', number[], unknown>>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    const chartInstance = chartRef.current
    if (chartInstance) {
      const ctx = chartInstance.ctx

      // 각 색상의 그라디언트를 생성
      const gradientOrange = ctx.createLinearGradient(0, 0, 200, 0)
      gradientOrange.addColorStop(0, '#FF803D')
      gradientOrange.addColorStop(1, '#FFBC99')

      const gradientBlue = ctx.createLinearGradient(0, 0, 200, 0)
      gradientBlue.addColorStop(0, '#356FFF')
      gradientBlue.addColorStop(1, '#66BDFF')

      const gradientGreen = ctx.createLinearGradient(0, 0, 200, 0)
      gradientGreen.addColorStop(0, '#00BE85')
      gradientGreen.addColorStop(1, '#76DABC')

      // Chart 데이터 설정
      setChartData({
        labels: ['C', 'A', 'S'],
        datasets: [
          {
            data: [creativityPercent, activityPercent, servicePercent],
            backgroundColor: [gradientOrange, gradientBlue, gradientGreen],
            borderWidth: 1,
          },
        ],
      })
    }
  }, [data])

  return (
    <div className="flex flex-row gap-15 px-6 pb-4">
      <div className="relative flex items-center justify-center" style={{ width: '200px', height: '200px' }}>
        {hasData ? (
          <Doughnut ref={chartRef} data={chartData} options={options} />
        ) : (
          <div className="relative flex h-[200px] w-[200px] items-center justify-center">
            {/* 바깥 원 */}
            <div className="bg-primary-gray-200 absolute h-full w-full rounded-full"></div>
            {/* 안쪽 투명 영역 */}
            <div className="absolute h-[68%] w-[68%] rounded-full bg-white"></div>
          </div>
        )}

        <div className="absolute flex flex-col gap-1.5 text-center">
          <div className="flex flex-row items-center gap-1.5">
            <SolidSVGIcon.C size={16} color="orange800" />
            <Typography variant="caption" className="font-medium">
              {Math.round(creativityPercent)}%
            </Typography>
          </div>
          <div className="flex flex-row items-center gap-1.5">
            <SolidSVGIcon.A size={16} color="orange800" />
            <Typography variant="caption" className="font-medium">
              {Math.round(activityPercent)}%
            </Typography>
          </div>
          <div className="flex flex-row items-center gap-1.5">
            <SolidSVGIcon.S size={16} color="orange800" />
            <Typography variant="caption" className="font-medium">
              {Math.round(servicePercent)}%
            </Typography>
          </div>
        </div>
      </div>
      <LearningOutcomeChart projects={projects} />
    </div>
  )
}

export default CASChart
