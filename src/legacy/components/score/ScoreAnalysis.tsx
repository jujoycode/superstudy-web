import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import clsx from 'clsx'
import _ from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chart } from 'react-chartjs-2'

import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { Typography } from '@/legacy/components/common/Typography'
import { SubjectEnum, SubjectGroups } from '@/legacy/constants/score.enum'
import { useStudentAnalysisScore } from '@/legacy/container/student-score'
import { useStudentMockScore, useStudentSemetsersScore } from '@/legacy/container/student-semesters-score'
import { calculateAverageGrades } from '@/legacy/util/exam-score'

import SolidSVGIcon from '../icon/SolidSVGIcon'
import { PopupModal } from '../PopupModal'

import MockRankTable from './MockRankTable'
import MockScoreTable from './MockScoreTable'

interface ScoreAnalysisProps {
  studentId: string
}
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
)

interface Score {
  구분: string
  등급: number
  z점: number
  원점: number
}

interface AnalysedExamScore {
  subjects: string
  scores: Score[]
}

const chartEvents: ('mousemove' | 'mouseout' | 'click')[] = ['mousemove', 'mouseout', 'click']

const SCORE_FILTER = [
  { label: '등급', value: '등급' },
  { label: 'Z점수', value: 'z점' },
  { label: '원점수', value: '원점' },
]

const SCORE_LABELS = ['전교과', '국영수사과', '국영수사', '국영수과', '국영수', '국영사', '영수과', '국영']
const MOCK_SCORE_LABELS = [
  '국어영역',
  '수학영역',
  '영어영역',
  '탐구영역(과목별)',
  '국영수사과',
  '국영수사',
  '국영수과',
  '국영수',
]
const SUBJECT_GROUPS = {
  국영수사과: '국영수사과',
  국영수사: '국영수사',
  국영수과: '국영수과',
  국영수: '국영수',
} as const

const transformData = (data: AnalysedExamScore[]) => {
  return data.reduce(
    (acc, curr) => {
      acc[curr.subjects] = curr.scores
      return acc
    },
    {} as Record<string, Score[]>,
  )
}

export const ScoreAnalysis = ({ studentId }: ScoreAnalysisProps) => {
  return (
    <main className="flex flex-col gap-10">
      <AcademicScore studentId={studentId} />
      <MockExamScore studentId={studentId} />
    </main>
  )
}

const AcademicScore = ({ studentId }: ScoreAnalysisProps) => {
  const { data, isLoading, error } = useStudentAnalysisScore(Number(studentId))
  const { scores, isLoading: isLoading2 } = useStudentSemetsersScore(Number(studentId))
  const score = data?.analysed_exam_scores
  const transformedData = !isLoading && score ? transformData(score) : {}
  const [openModal, setOpenModal] = useState(false)

  if (isLoading || isLoading2) {
    return (
      <div className="flex flex-col gap-6">
        <Typography variant="title1">내신성적</Typography>
        <div className="flex flex-col items-center justify-center gap-4">
          <IBBlank type="section" />
          <Typography variant="body3" className="font-medium">
            내신성적 데이터를 불러오고 있습니다.
          </Typography>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-6">
        <Typography variant="title1">내신성적</Typography>
        <div className="scrollable-wide">
          <table className="w-full table-auto border-collapse">
            <thead className="text-13 text-primary-gray-600 text-center font-normal">
              <tr>
                <td className="bg-primary-gray-50 min-w-[80px] p-2" rowSpan={2}>
                  구분
                </td>
                <td colSpan={3} className={`bg-primary-orange-50 border-x border-gray-200 p-2`}>
                  전교과
                </td>
                <td colSpan={3} className={`bg-primary-gray-50 border-x border-gray-200 p-2`}>
                  국영수사과
                </td>
                <td colSpan={3} className={`bg-primary-gray-50 border-x border-gray-200 p-2`}>
                  국영수사
                </td>
                <td colSpan={3} className={`bg-primary-gray-50 border-x border-gray-200 p-2`}>
                  국영수과
                </td>
                <td colSpan={3} className={`bg-primary-gray-50 border-x border-gray-200 p-2`}>
                  국영수
                </td>
                <td colSpan={3} className={`bg-primary-gray-50 border-x border-gray-200 p-2`}>
                  국영사
                </td>
                <td colSpan={3} className={`bg-primary-gray-50 border-x border-gray-200 p-2`}>
                  영수과
                </td>
                <td colSpan={3} className={`bg-primary-gray-50 border-l border-gray-200 p-2`}>
                  국영
                </td>
              </tr>
              <tr>
                {Array(8)
                  .fill(null)
                  .map((_, index) => (
                    <React.Fragment key={index}>
                      <td
                        className={`border border-gray-200 whitespace-nowrap ${
                          index === 0 ? 'bg-primary-orange-50' : 'bg-primary-gray-50'
                        } p-2`}
                      >
                        등급
                      </td>
                      <td
                        className={`border border-gray-200 whitespace-nowrap ${
                          index === 0 ? 'bg-primary-orange-50' : 'bg-primary-gray-50'
                        } p-2`}
                      >
                        Z점수
                      </td>
                      <td
                        className={`border-gray-200 whitespace-nowrap ${
                          index === 0 ? 'bg-primary-orange-50' : 'bg-primary-gray-50'
                        } ${index === 7 ? 'border-y border-l' : 'border'} p-2`}
                      >
                        원점수
                      </td>
                    </React.Fragment>
                  ))}
              </tr>
            </thead>
            <tbody className="text-13 text-primary-gray-900 text-center">
              <tr>
                <td className="border-t-primary-gray-200 border-t border-r border-r-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
                <td className="border border-gray-100 p-2">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const averages = scores ? calculateAverageGrades(scores) : []

  return (
    <section className="flex flex-col gap-6">
      <nav className="flex flex-row items-center justify-between gap-4">
        <Typography variant="title1">내신성적</Typography>
        <ButtonV2 variant="outline" size={32} color="gray400" disabled={isLoading} onClick={() => setOpenModal(true)}>
          그래프 보기
        </ButtonV2>
      </nav>

      <div className="scrollable-wide">
        <table className="w-full table-fixed border-collapse">
          <thead className="text-13 text-primary-gray-600 text-center font-normal">
            <tr>
              <td className="bg-primary-gray-50 p-2">학기</td>
              <td className={`bg-primary-gray-50 border-x border-gray-200 p-2`}>국영수사과</td>
              <td className={`bg-primary-gray-50 border-x border-gray-200 p-2`}>국영수사</td>
              <td className={`bg-primary-gray-50 border-x border-gray-200 p-2`}>국영수과</td>
              <td className={`bg-primary-gray-50 border-gray-200 p-2`}>국영수</td>
            </tr>
          </thead>
          <tbody className="text-13 text-primary-gray-900 text-center">
            {['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'].map((semester, index) => (
              <tr key={semester}>
                <td className={`border-t border-r border-gray-100 p-2 ${index === 5 ? 'border-b' : ''}`}>{semester}</td>
                {Object.keys(SUBJECT_GROUPS).map((groupKey) => {
                  const semesterData = averages?.find((score) => score.semester === semester)
                  const groupAverage = semesterData?.averages[groupKey]?.[0]?.average

                  return (
                    <td key={groupKey} className="border border-gray-100 p-2">
                      {groupAverage || '-'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="scrollable-wide">
        <table className="w-full table-auto border-collapse">
          <thead className="text-13 text-primary-gray-600 text-center font-normal">
            <tr>
              <td className="bg-primary-gray-50 w-20 p-2" rowSpan={2}>
                구분
              </td>
              {Object.keys(transformedData).map((subject, index) => (
                <td
                  key={subject}
                  colSpan={3}
                  className={`border-gray-200 p-2 ${index === 0 ? 'bg-primary-orange-50' : 'bg-primary-gray-50'} ${
                    index === Object.keys(transformedData).length - 1 ? 'border-l' : 'border-x'
                  }`}
                >
                  {subject}
                </td>
              ))}
            </tr>
            <tr>
              {Object.keys(transformedData).map((subject, index) => (
                <React.Fragment key={subject}>
                  <td
                    className={`border border-gray-200 whitespace-nowrap ${
                      index === 0 ? 'bg-primary-orange-50' : 'bg-primary-gray-50'
                    } p-2`}
                  >
                    등급
                  </td>
                  <td
                    className={`border border-gray-200 whitespace-nowrap ${
                      index === 0 ? 'bg-primary-orange-50' : 'bg-primary-gray-50'
                    } p-2`}
                  >
                    Z점수
                  </td>
                  <td
                    className={`border-gray-200 whitespace-nowrap ${
                      index === 0 ? 'bg-primary-orange-50' : 'bg-primary-gray-50'
                    } ${index === Object.keys(transformedData).length - 1 ? 'border-y border-l' : 'border'} p-2`}
                  >
                    원점수
                  </td>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="text-13 text-primary-gray-900 text-center">
            {transformedData['전교과'].map((score, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border-t-primary-gray-200 border-t border-r border-r-gray-100 p-2">{score.구분}</td>
                {Object.keys(transformedData).map((subject) => (
                  <React.Fragment key={subject}>
                    <td className="border border-gray-100 p-2">{transformedData[subject][rowIndex].등급}</td>
                    <td className="border border-gray-100 p-2">{transformedData[subject][rowIndex].z점}</td>
                    <td className="border border-gray-100 p-2">{transformedData[subject][rowIndex].원점}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {openModal && (
        <PopupModal
          modalOpen={openModal}
          setModalClose={() => setOpenModal(false)}
          title="내신성적"
          size="large"
          bottomBorder={false}
        >
          <ScoreAnalysisModal studentId={studentId} data={data} averages={averages} />
        </PopupModal>
      )}
    </section>
  )
}

const MockExamScore = ({ studentId }: ScoreAnalysisProps) => {
  const { scores, isLoading } = useStudentMockScore(Number(studentId))

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Typography variant="title1">모의고사</Typography>
        <div className="flex flex-col items-center justify-center gap-4">
          <IBBlank type="section" />
          <Typography variant="body3" className="font-medium">
            모의고사 데이터를 불러오고 있습니다.
          </Typography>
        </div>
      </div>
    )
  }

  if (!scores || scores.length === 0) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Typography variant="title1">모의고사 최저/최고 등급 비교</Typography>
          <div className="scrollable-wide">
            <table className="w-full table-fixed border-collapse">
              <thead className="text-13 text-primary-gray-600 text-center font-normal">
                <tr>
                  <td className="bg-primary-gray-50 w-[80px] p-2">과목</td>
                  <td className="bg-primary-gray-50 border-x border-b border-gray-200 p-2">국어영역</td>
                  <td className="bg-primary-gray-50 border-x border-b border-gray-200 p-2">수학영역</td>
                  <td className="bg-primary-gray-50 border-x border-b border-gray-200 p-2">영어영역</td>
                  <td className="bg-primary-gray-50 border-x border-b border-gray-200 p-2">
                    탐구영역
                    <br />
                    (과목별)
                  </td>
                  <td className="bg-primary-gray-50 border-x border-b border-gray-200 p-2">전과목</td>
                  <td className="bg-primary-gray-50 border-x border-b border-gray-200 p-2">국영수사</td>
                  <td className="bg-primary-gray-50 border-x border-b border-gray-200 p-2">국영수과</td>
                  <td className="bg-primary-gray-50 border-b border-l border-gray-200 p-2">국영수</td>
                </tr>
              </thead>
              <tbody className="text-13 text-primary-gray-900 text-center">
                <tr>
                  <td className="border-t-primary-gray-200 border-t border-r border-r-gray-100 p-2">최고등급</td>
                  {Array(8)
                    .fill(null)
                    .map((_, index) => (
                      <td key={index} className={`border-gray-100 p-2 ${index === 7 ? 'border-y' : 'border'}`}>
                        -
                      </td>
                    ))}
                </tr>
                <tr>
                  <td className="border-y border-r border-gray-100 p-2">평균등급</td>
                  {Array(8)
                    .fill(null)
                    .map((_, index) => (
                      <td key={index} className={`border-gray-100 p-2 ${index === 7 ? 'border-y' : 'border'}`}>
                        -
                      </td>
                    ))}
                </tr>
                <tr>
                  <td className="border-r border-b border-gray-100 p-2">최저등급</td>
                  {Array(8)
                    .fill(null)
                    .map((_, index) => (
                      <td key={index} className={`border-gray-100 p-2 ${index === 7 ? 'border-y' : 'border'}`}>
                        -
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Typography variant="title1">모의고사 점수</Typography>
          <div className="scrollable-wide">
            <table className="table-auto border-collapse">
              <thead className="text-13 text-primary-gray-600 text-center font-normal">
                <tr>
                  <td className="bg-primary-gray-50 min-w-[120px] p-2" rowSpan={2}>
                    구분
                  </td>
                  <td colSpan={3} className="bg-primary-gray-50 border-x border-gray-200 p-2">
                    국영수탐
                  </td>
                  <td colSpan={3} className="bg-primary-gray-50 border-x border-gray-200 p-2">
                    국영수
                  </td>
                  <td colSpan={3} className="bg-primary-gray-50 border-x border-gray-200 p-2">
                    국수탐
                  </td>
                  <td colSpan={3} className="bg-primary-gray-50 border-x border-gray-200 p-2">
                    국어영역
                  </td>
                  <td colSpan={3} className="bg-primary-gray-50 border-x border-gray-200 p-2">
                    영어영역
                  </td>
                  <td colSpan={3} className="bg-primary-gray-50 border-x border-gray-200 p-2">
                    수학영역
                  </td>
                  <td colSpan={3} className="bg-primary-gray-50 border-x border-gray-200 p-2">
                    탐구1
                  </td>
                  <td colSpan={3} className="bg-primary-gray-50 border-x border-gray-200 p-2">
                    탐구2
                  </td>
                  <td colSpan={3} className="bg-primary-gray-50 border-l border-gray-200 p-2">
                    한국사
                  </td>
                </tr>
                <tr>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">표점</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">등급</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">백분</td>

                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">표점</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">등급</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">백분</td>

                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">표점</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">등급</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">백분</td>

                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">표점</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">등급</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">백분</td>

                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">표점</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">등급</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">백분</td>

                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">표점</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">등급</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">백분</td>

                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">표점</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">등급</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">백분</td>

                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">표점</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">등급</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">백분</td>

                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">표점</td>
                  <td className="bg-primary-gray-50 border border-gray-200 p-2 whitespace-nowrap">등급</td>
                  <td className="bg-primary-gray-50 border-y border-l border-gray-200 p-2 whitespace-nowrap">백분</td>
                </tr>
              </thead>
              <tbody className="text-13 text-primary-gray-900 text-center">
                <tr>
                  <td className="border-t-primary-gray-200 border-t border-r border-r-gray-100 p-2">-</td>
                  {Array(27)
                    .fill(null)
                    .map((_, index) => (
                      <td key={index} className={`border-gray-100 p-2 ${index === 26 ? 'border-y' : 'border'}`}>
                        -
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
  return (
    <section className="flex flex-col gap-10">
      <MockRankTable scores={scores} isLoading={isLoading} />
      <MockScoreTable scores={scores} />
    </section>
  )
}

const ScoreAnalysisModal = ({ data, averages }: any) => {
  const [scoreType, setScoreType] = useState(SCORE_FILTER[0].value)

  const [chartData, setChartData] = useState<ChartData<'bar', number[], string>>({
    labels: SCORE_LABELS,
    datasets: [],
  })
  const chartRef = useRef<any>(null)

  const getOrCreateTooltip = (chart: any) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div')

    if (!tooltipEl) {
      tooltipEl = document.createElement('div')
      tooltipEl.style.background = 'white'
      tooltipEl.style.borderRadius = '8px'
      tooltipEl.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.08)'
      tooltipEl.style.color = '#121417'
      tooltipEl.style.opacity = 1
      tooltipEl.style.pointerEvents = 'none'
      tooltipEl.style.position = 'absolute'
      tooltipEl.style.transform = 'translate(-50%, 0)'
      tooltipEl.style.transition = 'all .1s ease'
      tooltipEl.style.border = '1px solid #E8EAED'

      const table = document.createElement('table')
      table.style.margin = '0px'

      tooltipEl.appendChild(table)
      chart.canvas.parentNode.appendChild(tooltipEl)
    }

    return tooltipEl
  }

  const externalTooltipHandler = (context: any) => {
    const { chart, tooltip } = context
    const tooltipEl = getOrCreateTooltip(chart)

    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0
      return
    }

    if (tooltip.body) {
      const titleLines = tooltip.title || []
      const bodyLines = tooltip.body.map((b: any) => b.lines)
      const extractedData = bodyLines.flat().map((line: string) => {
        const [key] = line.split(': ')
        return key
      })
      const formattedValue = tooltip.dataPoints[0]?.formattedValue || ''
      const adjustedValue =
        scoreType === '등급'
          ? Math.floor((10 - Number(formattedValue)) * 10) / 10 // 소수점 첫째 자리에서 끊기
          : formattedValue
      const dataIndex = tooltip.dataPoints[0]?.dataset.label

      let color = '#000'
      switch (dataIndex) {
        case '100(1/2/3)':
          color = '#06F'
          break
        case '20:30:50':
          color = '#00A876'
          break
        case '20:40:40':
          color = '#FF600C'
          break
        default:
          color = '#000'
      }

      const tableHead = document.createElement('thead')

      titleLines.forEach((title: any) => {
        const tr = document.createElement('tr')
        tr.style.borderWidth = '0'

        const th = document.createElement('th')
        th.style.borderWidth = '0'
        th.style.fontSize = '16px'
        th.style.fontWeight = '600'
        th.style.textAlign = 'left'
        th.style.padding = '16px 16px 8px 16px'

        const titleText = document.createElement('span')
        titleText.style.color = '#121417'
        titleText.style.marginRight = '8px'
        titleText.textContent = title

        // FormattedValue 스타일
        const valueText = document.createElement('span')
        valueText.style.fontSize = '16px'
        valueText.style.color = color
        valueText.textContent = adjustedValue

        th.appendChild(titleText)
        th.appendChild(valueText)
        tr.appendChild(th)
        tableHead.appendChild(tr)
      })

      const tableBody = document.createElement('tbody')
      extractedData.forEach((body: any, i: number) => {
        const span = document.createElement('span')
        span.style.borderWidth = '1px'
        span.style.borderRadius = '4px'
        span.style.border = '1px solid #E0E0E0'
        span.style.height = '12px'
        span.style.width = '12px'
        span.style.marginRight = '6px'
        span.style.display = 'inline-block'

        switch (body) {
          case '100(1/2/3)':
            span.style.background = 'linear-gradient(to right, #356FFF, #66BDFF)'
            break
          case '20:30:50':
            span.style.background = 'linear-gradient(to right, #00BE85, #76DABC)'
            break
          case '20:40:40':
            span.style.background = 'linear-gradient(to right, #FF803D, #FFBC99)'
            break
          default:
            span.style.background = 'linear-gradient(to right, #CCCCCC, #EEEEEE)'
        }

        const tr = document.createElement('tr')
        tr.style.backgroundColor = 'inherit'
        tr.style.borderWidth = '0'

        const td = document.createElement('td')
        td.style.borderWidth = '0'
        td.style.fontSize = '12px'
        td.style.fontFamily = 'Pretendard'
        td.style.padding = '0 16px 16px 16px'
        td.style.color = '#121417'
        td.style.fontWeight = '500'
        td.style.textAlign = 'left'
        td.style.display = 'flex'
        td.style.alignItems = 'center'
        const text = document.createTextNode(body)

        td.appendChild(span)
        td.appendChild(text)
        tr.appendChild(td)
        tableBody.appendChild(tr)
      })

      const tableRoot = tooltipEl.querySelector('table')

      while (tableRoot.firstChild) {
        tableRoot.firstChild.remove()
      }

      tableRoot.appendChild(tableHead)
      tableRoot.appendChild(tableBody)
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas
    const tooltipWidth = tooltipEl.offsetWidth
    const tooltipHeight = tooltipEl.offsetHeight
    const chartWidth = chart.width
    const chartHeight = chart.height

    let left = positionX + tooltip.caretX
    let top = positionY + tooltip.caretY

    // 화면의 오른쪽을 넘어가는 경우
    if (left + tooltipWidth > chartWidth) {
      left = chartWidth - tooltipWidth + 60 // 10px 여유를 두고 조정
    }

    // 화면의 아래쪽을 넘어가는 경우
    if (top + tooltipHeight > chartHeight) {
      top = chartHeight - tooltipHeight + 60 // 10px 여유를 두고 조정
    }

    // 화면의 왼쪽을 넘어가는 경우
    if (left < 0) {
      left = 4 // 10px 여유를 두고 조정
    }

    // 화면의 위쪽을 넘어가는 경우
    if (top < 0) {
      top = 10 // 10px 여유를 두고 조정
    }

    tooltipEl.style.opacity = 1
    tooltipEl.style.left = left + 'px'
    tooltipEl.style.top = top + 'px'
    tooltipEl.style.font = tooltip.options.bodyFont.string
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px'
  }

  const options = useMemo(
    () => ({
      spanGaps: false,
      responsive: true,
      maxBarThickness: 12,
      maintainAspectRatio: false,
      interaction: {
        mode: 'point' as const,
        intersect: true,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
          position: 'nearest' as const,
          external: externalTooltipHandler,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          offset: true,
          ticks: {
            font: {
              size: 13,
              family: 'Pretendard',
              weight: 400,
            },
            color: '#121417',
            padding: 2,
            callback: function (value: string | number, index: number, values: any) {
              const label = chartData?.labels?.[index]
              const maxLength = 6
              if (label && typeof label === 'string' && label.length > maxLength) {
                return label.substring(0, maxLength) + '...'
              }
              return label
            },
          },
        },
        y: {
          reverse: false,
          grid: {
            color: '#DDDDDD',
            drawBorder: false,
          },
          axis: 'y' as const,
          display: true,
          max: scoreType === '등급' ? 9 : scoreType === '원점' ? 100 : undefined,
          min: scoreType === '등급' ? 1 : undefined,
          beginAtZero: false,
          ticks: {
            font: {
              size: 10,
              family: 'Pretendard',
              weight: 500,
            },
            color: '#c7cbd1',
            stepSize: scoreType === '등급' ? 1 : scoreType === 'z점' ? 0.25 : null,
            callback: function (tickValue: number | string) {
              if (scoreType === '등급') {
                return 10 - Number(tickValue) // 0~9를 9~1로 변환
              }
              return tickValue
            },
          },
        },
      },
    }),
    [scoreType],
  )

  useEffect(() => {
    const chartInstance = chartRef.current
    if (chartInstance) {
      const ctx = chartInstance.ctx

      const getGradient = (ctx: any, chartArea: any, colorStart: string, colorEnd: string) => {
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
        gradient.addColorStop(0, colorStart)
        gradient.addColorStop(1, colorEnd)
        return gradient
      }

      // "구분" 값에 따른 색상 매핑
      const colorMap = {
        '100(1/2/3)': getGradient(ctx, chartInstance.chartArea, '#356FFF', '#66BDFF'),
        '20:30:50': getGradient(ctx, chartInstance.chartArea, '#00BE85', '#76DABC'),
        '20:40:40': getGradient(ctx, chartInstance.chartArea, '#FF803D', '#FFBC99'),
      }

      // Chart 데이터 설정
      setChartData({
        labels: SCORE_LABELS,
        datasets: ['100(1/2/3)', '20:30:50', '20:40:40'].map((label, dIndex) => ({
          label,
          data: data.analysed_exam_scores.map((subjectData: any) => {
            const score = subjectData.scores.find((s: any) => s.구분 === label)
            return score ? (scoreType === '등급' ? 10 - score[scoreType] : score[scoreType]) : null // '등급'일 경우 반전
          }),
          borderColor: 'rgba(0, 0, 0, 0.08)',
          backgroundColor: data.analysed_exam_scores.map(() => colorMap[label as keyof typeof colorMap]), // 기본 색상
          // hoverBackgroundColor: function (context: any) {
          //   const isActive = context.active;

          //   return isActive
          //     ? colorMap[context.dataset.label as keyof typeof colorMap] // 현재 hover된 바는 원래 색상 유지
          //     : 'rgba(0, 0, 0, 0.2)'; // 나머지는 불투명하게
          // },
          borderWidth: 1,
          // barThickness: 12,
          barThickness: 'flex',
          borderRadius: 4,
          barPercentage: 0.7,
          categoryPercentage: 0.7,
        })),
      })
    }
  }, [data, scoreType])

  return (
    <div className="flex flex-col items-center gap-6">
      <nav className="flex items-center justify-center">
        <LayeredTabs.TwoDepth onChange={(selectedType: string) => setScoreType(selectedType)} value={scoreType}>
          <Tab
            value="등급"
            childrenWrapperClassName={clsx(
              scoreType === '등급' ||
                scoreType === 'z점' ||
                'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-primary-gray-200 after:content-[""] after:z-10',
            )}
          >
            <p className={clsx({ 'text-primary-gray-700': scoreType === '등급' })}>등급</p>
          </Tab>
          <Tab
            value="z점"
            childrenWrapperClassName={clsx(
              scoreType === '등급' ||
                scoreType === 'z점' ||
                'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-primary-gray-200 after:content-[""] after:z-10',
            )}
          >
            <p className={clsx({ 'text-primary-gray-700': scoreType === 'z점' })}>Z점수</p>
          </Tab>
          <Tab
            value="원점"
            childrenWrapperClassName={clsx(
              scoreType === '등급' ||
                scoreType === 'z점' ||
                'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-primary-gray-200 after:content-[""] after:z-10',
            )}
          >
            <p className={clsx({ 'text-primary-gray-700': scoreType === '원점' })}>원점수</p>
          </Tab>
        </LayeredTabs.TwoDepth>
      </nav>

      <div className="h-[400px] w-full">
        <Chart type="bar" options={options} datasetIdKey="id" data={chartData} ref={chartRef} />
      </div>
      <div className="flex w-full flex-row items-center">
        <div className="min-w-0 flex-1"></div>
        <div className="bg-primary-gray-100 mx-auto flex w-fit items-center justify-center gap-4 rounded-lg px-5 py-2">
          <div className="flex flex-row items-center gap-1.5">
            <span className="border-dim-8 bg-gradient-blue-400 h-3 w-3 rounded-[4px]" />
            <Typography variant="caption2" className="font-medium">
              100(1/2/3)
            </Typography>
          </div>
          <div className="flex flex-row items-center gap-1.5">
            <span className="border-dim-8 bg-gradient-green-400 h-3 w-3 rounded-[4px]" />
            <Typography variant="caption2" className="font-medium">
              20:30:50
            </Typography>
          </div>
          <div className="flex flex-row items-center gap-1.5">
            <span className="border-dim-8 bg-gradient-orange-400 h-3 w-3 rounded-[4px]" />
            <Typography variant="caption2" className="font-medium">
              20:40:40
            </Typography>
          </div>
        </div>
        <span className="flex flex-1 flex-row items-center justify-end gap-1">
          <SolidSVGIcon.Info color="gray400" size={16} />
          <div className="flex flex-row items-center">
            <Typography variant="caption2" className="text-primary-gray-400">
              근거자료 : {averages.map((average: any) => average.semester).join(', ')}
            </Typography>
          </div>
        </span>
      </div>
    </div>
  )
}

export const MockExamScoreModal = ({ data, examDates }: any) => {
  const [chartData, setChartData] = useState<ChartData<'radar', number[], string>>({
    labels: MOCK_SCORE_LABELS,
    datasets: [],
  })

  const [selectedLabels, setSelectedLabels] = useState<string[]>(['최고등급', '평균등급', '최저등급'])

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))
  }

  const chartRef = useRef<any>(null)
  const getOrCreateTooltip = (chart: any) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div')

    if (!tooltipEl) {
      tooltipEl = document.createElement('div')
      tooltipEl.style.background = 'white'
      tooltipEl.style.borderRadius = '8px'
      tooltipEl.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.08)'
      tooltipEl.style.color = '#121417'
      tooltipEl.style.opacity = 1
      tooltipEl.style.pointerEvents = 'none'
      tooltipEl.style.position = 'absolute'
      tooltipEl.style.transform = 'translate(-50%, 0)'
      tooltipEl.style.transition = 'all .1s ease'
      tooltipEl.style.border = '1px solid #E8EAED'

      const table = document.createElement('table')
      table.style.margin = '0px'

      tooltipEl.appendChild(table)
      chart.canvas.parentNode.appendChild(tooltipEl)
    }

    return tooltipEl
  }

  const externalTooltipHandler = (context: any) => {
    const { chart, tooltip } = context
    const tooltipEl = getOrCreateTooltip(chart)

    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0
      return
    }

    if (tooltip.body) {
      const titleLines = tooltip.title || []
      const bodyLines = tooltip.body.map((b: any) => b.lines)
      const extractedData = bodyLines.flat().map((line: string) => {
        const [key] = line.split(': ')
        return key
      })
      const formattedValue = tooltip.dataPoints[0]?.formattedValue
        ? Number(tooltip.dataPoints[0].formattedValue).toFixed(1)
        : ''
      const dataIndex = tooltip.dataPoints[0]?.dataset.label

      let color = '#000'
      switch (dataIndex) {
        case '최고등급':
          color = '#06F'
          break
        case '평균등급':
          color = '#00A876'
          break
        case '최저등급':
          color = '#FF600C'
          break
        default:
          color = '#000'
      }

      const tableHead = document.createElement('thead')

      titleLines.forEach((title: any) => {
        const tr = document.createElement('tr')
        tr.style.borderWidth = '0'

        const th = document.createElement('th')
        th.style.borderWidth = '0'
        th.style.fontSize = '16px'
        th.style.fontWeight = '600'
        th.style.textAlign = 'left'
        th.style.padding = '16px 16px 8px 16px'

        const titleText = document.createElement('span')
        titleText.style.color = '#121417'
        titleText.style.marginRight = '8px'
        titleText.textContent = title

        // FormattedValue 스타일
        const valueText = document.createElement('span')
        valueText.style.fontSize = '16px'
        valueText.style.color = color
        valueText.textContent = (11 - Number(formattedValue)).toFixed(1)

        th.appendChild(titleText)
        th.appendChild(valueText)
        tr.appendChild(th)
        tableHead.appendChild(tr)
      })

      const tableBody = document.createElement('tbody')
      extractedData.forEach((body: any, i: number) => {
        const span = document.createElement('span')
        span.style.borderWidth = '1px'
        span.style.borderRadius = '4px'
        span.style.border = '1px solid #E0E0E0'
        span.style.height = '12px'
        span.style.width = '12px'
        span.style.marginRight = '6px'
        span.style.display = 'inline-block'

        switch (body) {
          case '최고등급':
            span.style.background = 'linear-gradient(to right, #356FFF, #66BDFF)'
            break
          case '평균등급':
            span.style.background = 'linear-gradient(to right, #00BE85, #76DABC)'
            break
          case '최저등급':
            span.style.background = 'linear-gradient(to right, #FF803D, #FFBC99)'
            break
          default:
            span.style.background = 'linear-gradient(to right, #CCCCCC, #EEEEEE)'
        }

        const tr = document.createElement('tr')
        tr.style.backgroundColor = 'inherit'
        tr.style.borderWidth = '0'

        const td = document.createElement('td')
        td.style.borderWidth = '0'
        td.style.fontSize = '12px'
        td.style.fontFamily = 'Pretendard'
        td.style.padding = '0 16px 16px 16px'
        td.style.color = '#121417'
        td.style.fontWeight = '500'
        td.style.textAlign = 'left'
        td.style.display = 'flex'
        td.style.alignItems = 'center'
        const text = document.createTextNode(body)

        td.appendChild(span)
        td.appendChild(text)
        tr.appendChild(td)
        tableBody.appendChild(tr)
      })

      const tableRoot = tooltipEl.querySelector('table')

      while (tableRoot.firstChild) {
        tableRoot.firstChild.remove()
      }

      tableRoot.appendChild(tableHead)
      tableRoot.appendChild(tableBody)
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas
    const tooltipWidth = tooltipEl.offsetWidth
    const tooltipHeight = tooltipEl.offsetHeight
    const chartWidth = chart.width
    const chartHeight = chart.height

    let left = positionX + tooltip.caretX
    let top = positionY + tooltip.caretY

    // 화면의 오른쪽을 넘어가는 경우
    if (left + tooltipWidth > chartWidth) {
      left = chartWidth - tooltipWidth + 60 // 10px 여유를 두고 조정
    }

    // 화면의 아래쪽을 넘어가는 경우
    if (top + tooltipHeight > chartHeight) {
      top = chartHeight - tooltipHeight + 60 // 10px 여유를 두고 조정
    }

    // 화면의 왼쪽을 넘어가는 경우
    if (left < 0) {
      left = 4 // 10px 여유를 두고 조정
    }

    // 화면의 위쪽을 넘어가는 경우
    if (top < 0) {
      top = 10 // 10px 여유를 두고 조정
    }

    tooltipEl.style.opacity = 1
    tooltipEl.style.left = left + 'px'
    tooltipEl.style.top = top + 'px'
    tooltipEl.style.font = tooltip.options.bodyFont.string
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px'
  }

  const options = useMemo(
    () => ({
      spanGaps: false,
      responsive: true,
      maintainAspectRatio: false,
      events: chartEvents,
      interaction: {
        mode: 'nearest' as const,
        // axis: 'xy' as const,
        intersect: false,
      },
      onHover: (_: any, elements: any) => {
        const chart = chartRef.current
        if (!chart) return // chartRef가 null인지 확인

        if (elements && elements.length > 0) {
          const datasetIndex = elements[0].datasetIndex
          const datasets = [...chart.data.datasets]
          const datasetToMove = datasets[datasetIndex]
          datasets.splice(datasetIndex, 1)
          datasets.unshift(datasetToMove)

          chart.data.datasets = datasets
          chart.update()
        }
      },
      hover: {
        mode: 'dataset' as const,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
          position: 'nearest' as const,
          external: externalTooltipHandler,
        },
      },
      scales: {
        r: {
          type: 'radialLinear' as const,
          min: 0,
          max: 10,
          reverse: false,
          ticks: {
            stepSize: 2,
            callback: (value: number | string) => {
              if (value === 10) return '1' // 외곽을 1로 표시
              if (value === 0) return '11' // 중앙을 11로 표시
              return 11 - Number(value) // 변환된 값 출력
            },
            font: {
              size: 12,
              weight: 500,
              family: 'Pretendard',
              lineHeight: '12px',
            },
            color: '#4C5057',
          },
          pointLabels: {
            font: {
              size: 13,
              weight: 400,
              family: 'Pretendard',
              lineHeight: '18px',
            },
            color: '#121417',
          },
          grid: {
            color: 'rgba(232, 234, 237, 1)', // 그리드 라인 색상
            lineWidth: 1, // 그리드 라인 두께
            circular: true, // 원형 그리드
          },
          border: {
            display: true, // 이전의 drawBorder
            width: 1, // 이전의 borderWidth
            color: 'rgba(232, 234, 237, 1)', // 이전의 borderColor
            dash: [], // 이전의 borderDash
            dashOffset: 0, // 이전의 borderDashOffset
          },
          angleLines: {
            display: true, // 각 레이블에서 중앙으로 선을 그리기
            color: '#E8EAED', // 선 색상
            lineWidth: 1, // 선 두께
          },
        },
      },
    }),
    [],
  )

  useEffect(() => {
    if (data) {
      const labelMap: Record<string, string> = {
        국어영역: '국어',
        수학영역: '수학',
        영어영역: '영어',
      }
      const chartInstance = chartRef.current
      if (chartInstance) {
        const ctx = chartInstance.ctx

        const hexToRGBA = (hex: string, opacity: number) => {
          const r = parseInt(hex.slice(1, 3), 16)
          const g = parseInt(hex.slice(3, 5), 16)
          const b = parseInt(hex.slice(5, 7), 16)
          return `rgba(${r}, ${g}, ${b}, ${opacity})`
        }

        const getGradient = (ctx: any, chartArea: any, colorStart: string, colorEnd: string, opacity: number) => {
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
          gradient.addColorStop(0, hexToRGBA(colorStart, opacity))
          gradient.addColorStop(1, hexToRGBA(colorEnd, opacity))
          return gradient
        }

        // "구분" 값에 따른 색상 매핑
        const colorMap = {
          최고등급: getGradient(ctx, chartInstance.chartArea, '#356FFF', '#66BDFF', 0.6),
          평균등급: getGradient(ctx, chartInstance.chartArea, '#00BE85', '#76DABC', 0.6),
          최저등급: getGradient(ctx, chartInstance.chartArea, '#FF803D', '#FFBC99', 0.6),
        }

        const calculateValue = (subjects: string[], type: 'maxRank' | 'minRank' | 'avgRank') => {
          const values = subjects
            .map((subject) => data[subject]?.[0]?.[type])
            .filter((value) => value !== undefined && value !== null)

          if (values.length === 0) return null

          switch (type) {
            case 'maxRank':
              return Math.max(...values)
            case 'minRank':
              return Math.min(...values)
            case 'avgRank':
              return _.mean(values)
            default:
              return null
          }
        }

        const maxRankData = MOCK_SCORE_LABELS.map((label) => {
          if (label === '탐구영역(과목별)') {
            return calculateValue(SubjectGroups[SubjectEnum.사회].concat(SubjectGroups[SubjectEnum.과학]), 'maxRank')
          }
          const key = labelMap[label] || label
          const subjectData = data[key]?.[0]
          return subjectData ? subjectData.maxRank : null
        })

        const minRankData = MOCK_SCORE_LABELS.map((label) => {
          if (label === '탐구영역(과목별)') {
            return calculateValue(SubjectGroups[SubjectEnum.사회].concat(SubjectGroups[SubjectEnum.과학]), 'minRank')
          }
          const key = labelMap[label] || label
          const subjectData = data[key]?.[0]
          return subjectData ? subjectData.minRank : null
        })

        const avgRankData = MOCK_SCORE_LABELS.map((label) => {
          if (label === '탐구영역(과목별)') {
            return calculateValue(SubjectGroups[SubjectEnum.사회].concat(SubjectGroups[SubjectEnum.과학]), 'avgRank')
          }
          const key = labelMap[label] || label
          const subjectData = data[key]?.[0]
          return subjectData ? subjectData.avgRank : null
        })

        const transformDataValue = (value: number) => {
          return 11 - value // 1을 10으로, 10을 1로 변환
        }

        const datasets = [
          {
            label: '최저등급',
            data: maxRankData.map(transformDataValue),
            borderWidth: 0,
            backgroundColor: colorMap['최저등급'],
            hoverBackgroundColor: getGradient(ctx, chartInstance.chartArea, '#FF803D', '#FFBC99', 1),
            pointRadius: 0,
            hoverRadius: 0,
          },
          {
            label: '평균등급',
            data: avgRankData.map(transformDataValue),
            backgroundColor: colorMap['평균등급'],
            hoverBackgroundColor: getGradient(ctx, chartInstance.chartArea, '#00BE85', '#76DABC', 1),
            pointRadius: 0,
            borderWidth: 0,
            hoverRadius: 0,
          },
          {
            label: '최고등급',
            data: minRankData.map(transformDataValue),
            backgroundColor: colorMap['최고등급'],
            hoverBackgroundColor: getGradient(ctx, chartInstance.chartArea, '#356FFF', '#66BDFF', 1),
            pointRadius: 0,
            borderWidth: 0,
            hoverRadius: 0,
          },
        ].filter((dataset) => selectedLabels.includes(dataset.label))
        setChartData({
          labels: MOCK_SCORE_LABELS,
          datasets: datasets,
        })
      }
    }
  }, [data, selectedLabels])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="h-[400px] w-full">
        <Chart type="radar" options={options} datasetIdKey="id" data={chartData} ref={chartRef} />
      </div>
      <div className="flex w-full flex-row items-center">
        <div className="min-w-0 flex-1"></div>
        <div className="bg-primary-gray-100 mx-auto flex w-fit items-center justify-center gap-4 rounded-lg px-5 py-2">
          <div className="flex cursor-pointer flex-row items-center gap-1.5" onClick={() => toggleLabel('최고등급')}>
            <span className="border-dim-8 bg-gradient-blue-400 h-3 w-3 rounded-[4px]" />
            <Typography variant="caption2" className="font-medium">
              최고등급
            </Typography>
            <Check.Basic
              checked={selectedLabels.includes('최고등급')}
              onChange={() => toggleLabel('최고등급')}
              size={16}
            />
          </div>
          <div className="flex cursor-pointer flex-row items-center gap-1.5" onClick={() => toggleLabel('평균등급')}>
            <span className="border-dim-8 bg-gradient-green-400 h-3 w-3 rounded-[4px]" />
            <Typography variant="caption2" className="font-medium">
              평균등급
            </Typography>
            <Check.Basic
              checked={selectedLabels.includes('평균등급')}
              onChange={() => toggleLabel('평균등급')}
              size={16}
            />
          </div>
          <div className="flex cursor-pointer flex-row items-center gap-1.5" onClick={() => toggleLabel('최저등급')}>
            <span className="border-dim-8 bg-gradient-orange-400 h-3 w-3 rounded-[4px]" />
            <Typography variant="caption2" className="font-medium">
              최저등급
            </Typography>
            <Check.Basic
              checked={selectedLabels.includes('최저등급')}
              onChange={() => toggleLabel('최저등급')}
              size={16}
            />
          </div>
        </div>
        <span className="flex flex-1 flex-row items-center justify-end gap-1">
          <SolidSVGIcon.Info color="gray400" size={16} />
          <div className="flex flex-row items-center">
            <Typography variant="caption2" className="text-primary-gray-400">
              근거자료 : {examDates.join(', ')}
            </Typography>
          </div>
        </span>
      </div>
    </div>
  )
}
