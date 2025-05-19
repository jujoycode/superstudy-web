import clsx from 'clsx'
import { PropsWithChildren, useState } from 'react'

import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { Typography } from '@/legacy/components/common/Typography'
import { ResponseChecklistDto } from '@/legacy/generated/model'

import ColorSVGIcon from '../../icon/ColorSVGIcon'

interface IbCASCheckListProps {
  modalOpen: boolean
  setModalClose: () => void
  onSuccess: () => void
  ablePropragation?: boolean
  checkList: ResponseChecklistDto[]
}

// const CHECKLIST = [
//   {
//     id: 1,
//     content: '계획한 활동은 C,A,S 요소에 적합하게 선택되었으며 C,A,S의 조화가 중요함을 확인했습니다.',
//     check: false,
//   },
//   {
//     id: 2,
//     content: '교과 평가(DP 그룹 내) 에 들어가는 활동을 입력하는 것은 안된다는 것을 확인했습니다.',
//     check: false,
//   },
//   {
//     id: 3,
//     content: '7가지 학습성과 18개월 내에 꼭 달성되어야 함을 확인했습니다.',
//     check: false,
//   },
//   { id: 4, content: '봉사는 실제적으로 주변에 도움이 될 수 있는 활동을 계획 실행해야함을 확인했습니다.', check: false },
//   {
//     id: 5,
//     content: '1달을 기준으로 2주에 1번 이상 기록, 각 활동 당 3회의 일지는 필수라는 점을 확인했습니다.',
//     check: false,
//   },
//   {
//     id: 6,
//     content: '모든 활동은 학생 본인이 직접 계획 활동한 것으로 증거 등에 대해 ‘학문적 진실성’을 담보하고 있습니다.',
//     check: false,
//   },
// ];

export function IbCASCheckList({
  modalOpen,
  setModalClose,
  onSuccess,
  ablePropragation = false,
  checkList,
}: PropsWithChildren<IbCASCheckListProps>) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [check, setChecked] = useState<boolean>(false)
  const handleGroupChange = (selectedValues: number[]) => {
    setSelectedIds(selectedValues)
    setChecked(selectedValues.length === checkList.length)
  }

  const handleAllCheck = () => {
    setChecked((prev) => {
      const newCheckState = !prev
      if (newCheckState) {
        // 모든 아이템 선택
        setSelectedIds(checkList.map((item) => item.id))
      } else {
        // 모든 아이템 선택 해제
        setSelectedIds([])
      }
      return newCheckState
    })
  }

  return (
    <div
      className={`bg-opacity-50 fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black ${
        !modalOpen && 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div className={`relative w-[632px] overflow-hidden rounded-xl bg-white`}>
        <div className=".backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 px-8 pt-8 pb-6">
          <Typography variant="title1">체크리스트 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <div className="scroll-box flex max-h-[616px] flex-col gap-4 overflow-auto px-8 pt-4 pb-8">
          <div className="flex flex-col gap-4">
            <Check.Group selectedValues={selectedIds} onChange={handleGroupChange} className="flex flex-col gap-3">
              {checkList?.map((item) => (
                <Check.Box key={item.id} label={item.content} size={20} value={item.id} checked={item.check} />
              ))}
            </Check.Group>
            <div className="flex items-center gap-2">
              <Check.Basic checked={check} onChange={handleAllCheck} />
              <Typography
                variant="title3"
                className="cursor-pointer font-medium text-gray-900"
                onClick={handleAllCheck}
              >
                모든 내용을 확인하였습니다.
              </Typography>
            </div>
          </div>
        </div>
        <div
          className={clsx(
            '.backdrop-blur-20 sticky bottom-0 flex h-[104px] items-center justify-end gap-3 border-t border-t-gray-100 bg-white/70 px-8 pt-6 pb-8',
          )}
        >
          <ButtonV2
            variant="solid"
            color="orange800"
            size={48}
            onClick={onSuccess}
            disabled={selectedIds.length !== checkList.length}
          >
            제출하기
          </ButtonV2>
        </div>
      </div>
    </div>
  )
}
