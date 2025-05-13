import { useState } from 'react'

import { Typography } from '@/legacy/components/common/Typography'
import { SchoolScore } from '@/legacy/container/student-score'

import SVGIcon from '../icon/SVGIcon'

import BottomSheetListSelection from './BottomSheetListSelection'

import NODATA from '@/legacy/assets/images/no-data.png'

interface BottomSheetProps {
  data?: SchoolScore[]
  onChange: (data: SchoolScore) => void
}

export function ScoreBottomSheet({ data, onChange }: BottomSheetProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = (data: SchoolScore, index: number) => {
    setSelectedIndex(index)
    setIsOpen(false)
    onChange(data)
  }

  if (data?.length === 0 || !data) {
    return (
      <>
        <div className="border-primary-gray-200 bg-primary-gray-100 flex h-12 cursor-pointer flex-row items-center justify-between rounded-lg border px-4 py-3">
          <Typography variant="body2" className="text-primary-gray-400 font-medium">
            시험 선택
          </Typography>
        </div>
        <div className="flex flex-col items-center gap-2 py-20">
          <div className="h-12 w-12 px-[2.50px]">
            <img src={NODATA} className="h-12 w-[43px] object-cover" />
          </div>
          <Typography variant="body1" className="text-primary-gray-700">
            성적내역이 없습니다.
          </Typography>
        </div>
      </>
    )
  }

  return (
    <>
      <div
        className="border-primary-gray-200 flex h-12 cursor-pointer flex-row items-center justify-between rounded-lg border bg-white px-4 py-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="body2" className="font-medium">
          {data[selectedIndex].year}년 {data[selectedIndex].grade}학년 {data[selectedIndex].semester}학기{' '}
          {data[selectedIndex].step === 'final' ? '종합성적' : '중간고사'}
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
                className={isSelected ? 'text-primary-orange-800 font-semibold' : 'text-primary-gray-700'}
                onClick={() => handleClick(item, index)}
              >
                {item.year}년 {item.grade}학년 {item.semester}학기 {item.step === 'final' ? '종합성적' : '중간고사'}
              </Typography>
              {isSelected && <SVGIcon.Check color="orange800" size={20} />}
            </div>
          )
        })}
      </BottomSheetListSelection>
    </>
  )
}
