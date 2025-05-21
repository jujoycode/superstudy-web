import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { cn } from '@/utils/commonUtil'

import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import SelectBar from '@/legacy/components/common/SelectBar'

import ExamChart from '../studentCard/ExamChart'
import { ExamScoreBoard } from '../studentCard/ExamScoreBoard'
import { INDIExamScoreBoard } from '../studentCard/INDIExamScoreBoard'

interface AllScoreProps {
  studentId: string
  grade: number
}

type ScoreType = 'ALL' | 'TEST'

const grades = [
  { id: 0, value: 1, text: '1학년' },
  { id: 1, value: 2, text: '2학년' },
  { id: 2, value: 3, text: '3학년' },
]

export const AllScore = () => {
  const { studentId, grade: initialGrade } = useOutletContext<{ studentId: string; grade: number }>()
  const [type, setType] = useState<ScoreType>('ALL')
  const [grade, setGrade] = useState(initialGrade)

  const handleOptionChange = (value: number) => {
    setGrade(value)
  }
  return (
    <main className="flex flex-col gap-10">
      <ExamChart studentId={studentId} />
      <div className="flex flex-col">
        <div className="flex flex-row items-center gap-2 pb-6">
          <LayeredTabs.TwoDepth onChange={(selectedType: ScoreType) => setType(selectedType)} value={type}>
            <Tab
              value="ALL"
              childrenWrapperClassName={cn(
                type === 'ALL' ||
                  type === 'TEST' ||
                  'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-gray-200 after:content-[""] after:z-10',
              )}
            >
              <p className={cn({ 'text-gray-700': type === 'ALL' })}>종합성적</p>
            </Tab>
            <Tab
              value="TEST"
              childrenWrapperClassName={cn(
                type === 'ALL' ||
                  type === 'TEST' ||
                  'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-gray-200 after:content-[""] after:z-10',
              )}
            >
              <p className={cn({ 'text-gray-700': type === 'TEST' })}>지필평가</p>
            </Tab>
          </LayeredTabs.TwoDepth>
          {type === 'TEST' && (
            <SelectBar
              options={grades}
              value={grade}
              onChange={handleOptionChange}
              placeholder="학년 선택"
              size={40}
              containerWidth="w-30"
              dropdownWidth="w-40"
              priorityFontClass="text-gray-900"
            />
          )}
        </div>
        {type === 'ALL' && <ExamScoreBoard studentId={studentId} />}
        {type === 'TEST' && <INDIExamScoreBoard studentId={studentId} grade={grade} />}
      </div>
    </main>
  )
}
