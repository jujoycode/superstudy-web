import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { FC, useState } from 'react'

import { Blank, Section } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { Button } from '@/legacy/components/common/Button'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { SuperModal } from '@/legacy/components/SuperModal'
import { useCoordinatorCheck } from '@/legacy/container/ib-coordinator'
import { useIBDeadline } from '@/legacy/container/ib-deadline'
import { useIBDeadlineDeleteDeadline } from '@/legacy/generated/endpoint'
import {
  DeadlineType,
  IBDeadlineGetItemsType,
  ResponseIBDeadlineDto,
  ResponseIBDeadlineitemsDto,
} from '@/legacy/generated/model'

import FrontPaginatedList from '../../FrontPaginatedList '

import { Coordinator_Schedule_AddSchedule } from './Coordinator_Schedule_AddSchedule'
import { Coordinator_Schedule_UpdateSchedule } from './Coordinator_Schedule_UpdateSchedule'

import NODATA from '@/legacy/assets/images/no-data.png'

// NOTE: 백엔드에서 마감기한 타입이 추가되면 그에 따라 항목 추가해야 함
export const DEADLINE_TYPE_KOR: Record<DeadlineType, string> = {
  EE_PROPOSAL: '제안서',
  EE_ESSAY: '에세이',
  EE_RPPF_1: 'RPPF 1차',
  EE_RPPF_2: 'RPPF 2차',
  EE_RPPF_3: 'RPPF 3차',
  EE_RRS: 'RRS',
  TOK_TKPPF_1: 'TKPPF 1차',
  TOK_TKPPF_2: 'TKPPF 2차',
  TOK_TKPPF_3: 'TKPPF 3차',
  TOK_MOCK_EXHIBITION: '모의 전시회',
  TOK_FINAL_EXHIBITION: '최종 전시회',
  TOK_EXHIBITION_PLAN: '전시회 기획안',
  TOK_ESSAY_OUTLINE: '에세이 아웃라인',
  TOK_ESSAY: '에세이',
  TOK_RRS: 'RRS',
  CAS_INTERVIEW_1: '인터뷰일지 1차',
  CAS_INTERVIEW_2: '인터뷰일지 2차',
  CAS_INTERVIEW_3: '인터뷰일지 3차',
  CAS_REFLECTION_DIARY: '성찰일지',
  CAS_ACTIVITY_LOG: '활동일지',
  CAS_PLAN: '계획서',
}

interface Coordinator_ScheduleProps {
  type?: IBDeadlineGetItemsType
}

const Coordinator_Schedule: FC<Coordinator_ScheduleProps> = ({ type = 'IB_EE' }) => {
  const [activeModal, setActiveModal] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<ResponseIBDeadlineDto>()
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)

  const { permission } = useCoordinatorCheck()

  const { data: deadlineData, isFetching, refetch } = useIBDeadline({ type })

  const { mutate: deleteDeadline, isLoading } = useIBDeadlineDeleteDeadline({
    mutation: {
      onSuccess: () => {
        setDeleteModalOpen(false)
        setSelectedSchedule(undefined)
        refetch()
      },
    },
  })

  const items = deadlineData?.items || []

  const formatRemindDays = (daysArr: number[]) => {
    const sortingArray = daysArr.sort((a, b) => b - a)
    return sortingArray.map((day) => (day === 0 ? '당일' : `${day}일전`))
  }

  const Header = () => (
    <>
      <Typography variant="body2" className="text-primary-gray-500 w-[68px] text-center font-medium">
        번호
      </Typography>
      <Typography variant="body2" className="text-primary-gray-500 w-[304px] text-center font-medium">
        항목
      </Typography>
      <Typography variant="body2" className="text-primary-gray-500 w-[304px] text-center font-medium">
        마감기한
      </Typography>
      <Typography variant="body2" className="text-primary-gray-500 w-[304px] text-center font-medium">
        알림주기
      </Typography>
      <Typography variant="body2" className="text-primary-gray-500 w-[188px] text-center font-medium">
        관리
      </Typography>
    </>
  )

  // Item 컴포넌트
  const Item = ({ item, index }: { item: ResponseIBDeadlineitemsDto['items'][0]; index: number }) => (
    <>
      <div className="w-[68px] text-center">{index}</div>
      <div className="w-[304px] text-center">{DEADLINE_TYPE_KOR[item.type]}</div>
      <div className="w-[304px] text-center">
        {format(new Date(item.deadlineTime), "yyyy.MM.dd a hh:mm'까지'", { locale: ko })}
      </div>
      <div className="w-[304px] text-center">{formatRemindDays(item.remindDays).join(', ')}</div>
      <div className="flex w-[188px] flex-row justify-center gap-2">
        <ButtonV2
          variant="outline"
          size={32}
          color="gray400"
          onClick={(e) => {
            e.stopPropagation()
            handleEditClick(item)
          }}
        >
          수정
        </ButtonV2>
        <ButtonV2
          variant="outline"
          size={32}
          color="gray400"
          onClick={() => {
            setSelectedSchedule(item)
            setDeleteModalOpen(true)
          }}
        >
          삭제
        </ButtonV2>
      </div>
    </>
  )

  const handleEditClick = (item: any) => {
    setActiveModal(true)
    setSelectedSchedule(item)
  }

  const isIBPermission = {
    IB_ALL: permission === 'IB_ALL',
    IB_EE: permission === 'IB_EE',
    IB_TOK: permission === 'IB_TOK',
    IB_CAS: permission === 'IB_CAS',
  }

  return (
    <div className="min-h-[664px] rounded-xl bg-white">
      {(isLoading || isFetching) && <Blank />}
      <div className="flex flex-row items-center justify-between p-6">
        <Typography variant="title1" className="text-primary-gray-900">
          일정 및 알림발송
        </Typography>
        {isIBPermission[type] && items.length > 0 && (
          <ButtonV2
            variant="solid"
            size={40}
            color="orange800"
            onClick={() => {
              setSelectedSchedule(undefined)
              setActiveModal(true)
            }}
          >
            추가하기
          </ButtonV2>
        )}
      </div>

      {items.length > 0 ? (
        <FrontPaginatedList
          headerComponent={<Header />}
          itemComponent={(item, index) => <Item item={item} index={index} />}
          page={1}
          pageSize={20}
          totalItems={items.length}
          items={items}
          onSelect={(item) => console.log('선택된 항목:', item)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="h-12 w-12 px-[2.50px]">
            <img src={NODATA} className="h-12 w-[43px] object-cover" />
          </div>
          {isIBPermission[type] ? (
            <>
              <Typography variant="body2" className="text-primary-gray-700 text-center font-medium">
                작성한 일정 및 알림발송이 없습니다.
                <br />
                일정 및 알림발송을 추가해주세요.
              </Typography>
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => setActiveModal(true)}>
                추가하기
              </ButtonV2>
            </>
          ) : (
            <Typography variant="body2" className="text-primary-gray-700 text-center font-medium">
              작성한 일정 및 알림발송이 없습니다.
            </Typography>
          )}
        </div>
      )}
      <Coordinator_Schedule_AddSchedule
        type={type}
        modalOpen={activeModal && !selectedSchedule}
        setModalClose={() => setActiveModal(false)}
        handleBack={() => setActiveModal(false)}
        onSuccess={() => {
          setActiveModal(false)
          refetch()
        }}
        items={items}
      />
      <Coordinator_Schedule_UpdateSchedule
        modalOpen={activeModal && !!selectedSchedule}
        setModalClose={() => setActiveModal(false)}
        handleBack={() => setActiveModal(false)}
        onSuccess={() => {
          setActiveModal(false)
          refetch()
        }}
        scheduleData={selectedSchedule}
      />
      {selectedSchedule && (
        <SuperModal modalOpen={isDeleteModalOpen} setModalClose={() => setDeleteModalOpen(false)} className="w-max">
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              해당 일정 및 알림발송 내역을 삭제하시겠습니까?
            </div>
            <Button.lg
              children="삭제하기"
              disabled={isLoading}
              onClick={() => deleteDeadline({ id: selectedSchedule.id })}
              className="bg-primary-orange-800 disabled:filled-gray-dark text-white"
            />
          </Section>
        </SuperModal>
      )}
      {alertMessage && (
        <AlertV2
          message={alertMessage}
          confirmText="확인"
          onConfirm={() => setAlertMessage(null)} // closes the AlertV2 by resetting the message
        />
      )}
    </div>
  )
}

export default Coordinator_Schedule
