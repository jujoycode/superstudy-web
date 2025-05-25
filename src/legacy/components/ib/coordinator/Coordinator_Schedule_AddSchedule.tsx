import { map } from 'lodash'
import { PropsWithChildren, useRef, useState } from 'react'
import NODATA from '@/assets/images/no-data.png'
import SelectBar from '@/legacy/components/common/SelectBar'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { useIBDeadlineCreateDeadline } from '@/legacy/generated/endpoint'
import {
  DeadlineType,
  IBDeadlineGetItemsType,
  RequestIBDeadlineDto,
  ResponseIBDeadlineDto,
} from '@/legacy/generated/model'
import AlertV2 from '../../common/AlertV2'
import { ButtonV2 } from '../../common/ButtonV2'
import { Typography } from '../../common/Typography'
import ColorSVGIcon from '../../icon/ColorSVGIcon'
import { CreateDeadlineField } from '../CreateDeadlineField'

interface Coordinator_Schedule_AddScheduleProps {
  type: IBDeadlineGetItemsType
  modalOpen: boolean
  setModalClose: () => void
  handleBack?: () => void
  scheduleData?: ResponseIBDeadlineDto
  onSuccess?: () => void
  items?: ResponseIBDeadlineDto[]
}

type Item = {
  id: number
  value: DeadlineType
  text: string
}

type DeadLineTypeItem = {
  id: number
  type: string
  value: DeadlineType
  text: string
  items?: Item[]
}

const DeadLineTypeItems: DeadLineTypeItem[] = [
  {
    id: 1,
    value: DeadlineType.EE_ESSAY,
    type: IBDeadlineGetItemsType.IB_EE,
    text: '에세이',
  },
  {
    id: 2,
    value: DeadlineType.EE_RRS,
    type: IBDeadlineGetItemsType.IB_EE,
    text: 'RRS',
  },
  {
    id: 3,
    value: DeadlineType.EE_PROPOSAL,
    type: IBDeadlineGetItemsType.IB_EE,
    text: '제안서',
  },
  {
    id: 4,
    value: DeadlineType.EE_RPPF_1,
    type: IBDeadlineGetItemsType.IB_EE,
    items: [
      {
        id: 1,
        value: DeadlineType.EE_RPPF_1,
        text: '1차',
      },
      {
        id: 2,
        value: DeadlineType.EE_RPPF_2,
        text: '2차',
      },
      {
        id: 3,
        value: DeadlineType.EE_RPPF_3,
        text: '3차',
      },
    ],
    text: 'RPPF',
  },
  {
    id: 5,
    value: DeadlineType.TOK_TKPPF_1,
    type: IBDeadlineGetItemsType.IB_TOK,
    items: [
      {
        id: 1,
        value: DeadlineType.TOK_TKPPF_1,
        text: '1차',
      },
      {
        id: 2,
        value: DeadlineType.TOK_TKPPF_2,
        text: '2차',
      },
      {
        id: 3,
        value: DeadlineType.TOK_TKPPF_3,
        text: '3차',
      },
    ],
    text: 'TKPPF',
  },
  {
    id: 6,
    value: DeadlineType.TOK_MOCK_EXHIBITION,
    type: IBDeadlineGetItemsType.IB_TOK,
    text: '모의 전시회',
  },
  {
    id: 7,
    value: DeadlineType.TOK_FINAL_EXHIBITION,
    type: IBDeadlineGetItemsType.IB_TOK,
    text: '최종 전시회',
  },
  {
    id: 8,
    value: DeadlineType.TOK_EXHIBITION_PLAN,
    type: IBDeadlineGetItemsType.IB_TOK,
    text: '전시회 기획안',
  },
  {
    id: 9,
    value: DeadlineType.TOK_ESSAY_OUTLINE,
    type: IBDeadlineGetItemsType.IB_TOK,
    text: '에세이 아웃라인',
  },
  {
    id: 10,
    value: DeadlineType.TOK_ESSAY,
    type: IBDeadlineGetItemsType.IB_TOK,
    text: '에세이',
  },
  {
    id: 11,
    value: DeadlineType.TOK_RRS,
    type: IBDeadlineGetItemsType.IB_TOK,
    text: 'RRS',
  },
  {
    id: 12,
    value: DeadlineType.CAS_INTERVIEW_1,
    type: IBDeadlineGetItemsType.IB_CAS,
    items: [
      {
        id: 1,
        value: DeadlineType.CAS_INTERVIEW_1,
        text: '1차',
      },
      {
        id: 2,
        value: DeadlineType.CAS_INTERVIEW_2,
        text: '2차',
      },
      {
        id: 3,
        value: DeadlineType.CAS_INTERVIEW_3,
        text: '3차',
      },
    ],
    text: '인터뷰일지',
  },
  {
    id: 13,
    value: DeadlineType.CAS_REFLECTION_DIARY,
    type: IBDeadlineGetItemsType.IB_CAS,
    text: '성찰일지',
  },
  {
    id: 14,
    value: DeadlineType.CAS_ACTIVITY_LOG,
    type: IBDeadlineGetItemsType.IB_CAS,
    text: '활동일지',
  },
  {
    id: 15,
    value: DeadlineType.CAS_PLAN,
    type: IBDeadlineGetItemsType.IB_CAS,
    text: '계획서',
  },
]

export function Coordinator_Schedule_AddSchedule({
  type,
  modalOpen,
  setModalClose,
  handleBack,
  onSuccess,
  items = [],
}: PropsWithChildren<Coordinator_Schedule_AddScheduleProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [deadlineType, setDeadlineType] = useState<DeadlineType>()
  const [item, setItem] = useState<DeadlineType>()
  const [createDeadlines, setCreateDeadlines] = useState<RequestIBDeadlineDto[]>([])

  const reset = () => {
    setCreateDeadlines([])
    setItem(undefined)
    setDeadlineType(undefined)
  }

  const { mutate: createDeadline } = useIBDeadlineCreateDeadline({ mutation: { onSuccess } })

  const handleUpdateDeadline = (dto: Partial<RequestIBDeadlineDto>, index: number) => {
    setCreateDeadlines((prev) => {
      const value = structuredClone(prev)
      value[index] = { ...prev[index], ...dto }
      return value
    })
  }

  const handleDeleteDeadline = (index: number) => {
    setCreateDeadlines((prev) => {
      const value = structuredClone(prev)
      value.splice(index, 1)
      return value
    })
  }

  const handleSubmit = () => {
    for (const deadline of createDeadlines) {
      createDeadline({ data: deadline })
    }
    reset()
  }

  const existTypes = items.map((el) => el.type)

  const selectBarOptions = DeadLineTypeItems.filter((el) => el.type === type && !existTypes.includes(el.value)).map(
    (el) => (el.items ? { ...el, items: el.items.filter((item) => !existTypes.includes(item.value)) } : el),
  )

  const disabled = !createDeadlines.every(
    (deadline) => deadline.deadlineTime && deadline.remindDays?.length && deadline.type,
  )

  return (
    <div
      className={`fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black/50 ${
        !modalOpen && 'hidden'
      }`}
    >
      <div className={`relative w-[632px] overflow-hidden rounded-xl bg-white px-8`}>
        <div className="backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6">
          <Typography variant="title1">마감기한 설정</Typography>
          <ColorSVGIcon.Close
            color="gray700"
            size={32}
            onClick={() => {
              setModalClose()
              reset()
            }}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex w-max flex-row items-center gap-2">
            <SelectBar
              options={selectBarOptions}
              value={deadlineType}
              onChange={(value: any) => {
                setDeadlineType(value)
                setItem(undefined)
              }}
              placeholder="항목"
              size={40}
              containerWidth="w-40"
            />
            {selectBarOptions.find((el) => el.value === deadlineType)?.items && (
              <SelectBar
                options={selectBarOptions.find((el) => el.value === deadlineType)?.items || []}
                value={item}
                onChange={(value: any) => setItem(value)}
                placeholder="차시"
                size={40}
              />
            )}
          </div>
          <ButtonV2
            variant="outline"
            size={40}
            color="gray400"
            disabled={!deadlineType}
            className="flex items-center justify-center gap-1 whitespace-pre"
            onClick={() => {
              const _deadlineType = item || deadlineType
              if (!_deadlineType) return
              if (map(createDeadlines, 'type').includes(_deadlineType)) return
              setCreateDeadlines(
                createDeadlines.concat({
                  type: _deadlineType,
                  deadlineTime: '',
                  remindDays: [],
                }),
              )
            }}
          >
            <SVGIcon.Plus color="gray700" size={16} weight="bold" />
            추가
          </ButtonV2>
        </div>

        <div ref={scrollRef} className="scroll-box flex max-h-[608px] flex-col gap-4 overflow-auto pt-4 pb-8">
          {!createDeadlines.length && (
            <div className="flex flex-col items-center space-y-4 p-4">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
              <div>설정할 항목을 추가해주세요.</div>
            </div>
          )}
          {createDeadlines.map((data, index) => (
            <CreateDeadlineField
              deadline={data}
              key={index}
              index={index}
              handleDeleteDeadline={handleDeleteDeadline}
              handleUpdateDeadline={handleUpdateDeadline}
            />
          ))}
        </div>

        <div
          className={
            'backdrop-blur-20 sticky bottom-0 flex h-[104px] justify-end gap-4 border-t border-t-gray-100 bg-white/70 pt-6 pb-8'
          }
        >
          <div className="flex justify-end gap-3">
            <ButtonV2
              variant="solid"
              color="gray100"
              size={48}
              onClick={() => {
                handleBack && handleBack()
                reset()
              }}
            >
              이전
            </ButtonV2>
            <ButtonV2
              type="submit"
              variant="solid"
              color="orange800"
              size={48}
              disabled={disabled}
              onClick={handleSubmit}
            >
              저장하기
            </ButtonV2>
          </div>
        </div>
      </div>
      {isOpen && (
        <AlertV2 confirmText="확인" message={`일정이 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
      )}
    </div>
  )
}
