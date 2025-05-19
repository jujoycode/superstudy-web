import { useState } from 'react'

import NODATA from '@/assets/images/no-data.png'
import { Typography } from '@/legacy/components/common/Typography'
import { MockScore } from '@/legacy/container/student-score'

import SVGIcon from '../icon/SVGIcon'
import BottomSheetListSelection from './BottomSheetListSelection'

interface BottomSheetProps {
  data?: MockScore[]
  onChange: (data: MockScore) => void
}

export function MockBottomSheet({ data, onChange }: BottomSheetProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = (data: MockScore, index: number) => {
    setSelectedIndex(index)
    setIsOpen(false)
    onChange(data)
  }

  if (data?.length === 0 || !data) {
    return (
      <>
        <div className="flex h-12 cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-100 px-4 py-3">
          <Typography variant="body2" className="font-medium text-gray-400">
            시험 선택
          </Typography>
        </div>
        <div className="flex flex-col items-center gap-2 py-20">
          <div className="h-12 w-12 px-[2.50px]">
            <img src={NODATA} className="h-12 w-[43px] object-cover" />
          </div>
          <Typography variant="body1" className="text-gray-700">
            성적내역이 없습니다.
          </Typography>
        </div>
      </>
    )
  }

  return (
    <>
      <div
        className="flex h-12 cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="body2" className="font-medium">
          {data[selectedIndex].year}년 {data[selectedIndex].grade}학년 {data[selectedIndex].month}월 모의고사
        </Typography>
        <SVGIcon.Arrow color="gray700" size={16} rotate={270} />
      </div>

      <BottomSheetListSelection isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {data.map((item, index) => {
          const isSelected = selectedIndex === index
          return (
            <div key={index} className="flex flex-row items-center justify-between py-4">
              <Typography
                variant={isSelected ? 'title3' : 'body1'}
                className={isSelected ? 'text-primary-800 font-semibold' : 'text-gray-700'}
                onClick={() => handleClick(item, index)}
              >
                {item.year}년 {item.grade}학년 {item.month}월 모의고사
              </Typography>
              {isSelected && <SVGIcon.Check color="orange800" size={20} />}
            </div>
          )
        })}
      </BottomSheetListSelection>
    </>
  )
}
