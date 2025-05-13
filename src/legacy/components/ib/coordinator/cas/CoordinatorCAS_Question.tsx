import { concat, sortBy } from 'lodash'
import { useState } from 'react'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import FrontPaginatedList from '@/legacy/components/FrontPaginatedList '
import { PopupModal } from '@/legacy/components/PopupModal'
import { useCoordinatorCheck } from '@/legacy/container/ib-coordinator'
import { useIBInterview } from '@/legacy/container/ib-interview'
import { useChecklistGetitems, useIBProfileGetTemplateItemByStudent } from '@/legacy/generated/endpoint'
import { RequestCreateInterviewDtoCategory } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

import { CoordinatorEE_Form_AddCheckList } from '../ee/CoordinatorEE_Form_AddCheckList'
import { ModalType } from '../FAQList'

import { CoordinatorCAS_Question_AddQuestion } from './CoordinatorCAS_Question_AddQuestion'

import NODATA from '@/assets/images/no-data.png'

export const CAS_QUESTION_TYPES: Record<string, string> = {
  CAS_PROFILE: 'CAS 프로필',
  INTERVIEW: '인터뷰',
  CHECKLIST: '체크리스트',
  RISK_ASSESSMENT: '위험평가',
}

export const CoordinatorCAS_Question = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [activeModalType, setActiveModalType] = useState<'Create' | 'Update'>()
  const [type, setType] = useState<string>('CAS_PROFILE')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const { data: interviews, refetch: interviewRefetch } = useIBInterview()
  const { data: checklists } = useChecklistGetitems({
    location: 'CAS',
  })
  const { data: profile, refetch: profileRefetch } = useIBProfileGetTemplateItemByStudent()
  const { permission } = useCoordinatorCheck()
  const [selectedInterviewType, setSelectedInterviewType] = useState<RequestCreateInterviewDtoCategory>()

  const questions = concat(
    [] as any[],
    interviews?.filter((el) => el.category !== 'CAS_RISK_ASSESSMENT').map((el) => ({ ...el, type: 'INTERVIEW' })) || [],
    interviews
      ?.filter((el) => el.category === 'CAS_RISK_ASSESSMENT')
      .map((el) => ({ ...el, type: 'RISK_ASSESSMENT' })) || [],
    profile ? { ...profile, type: 'CAS_PROFILE' } : [],
    checklists?.total
      ? [{ ...sortBy(checklists.items, 'createdAt')[0], id: 0, title: '체크리스트', type: 'CHECKLIST' }]
      : [],
  )

  const refetch = () => {
    interviewRefetch()
    profileRefetch()
  }

  const Header = () => (
    <>
      <div className="w-[68px] text-center">번호</div>
      <div className="w-[92px] text-center">유형</div>
      <div className="w-[632px] text-center">제목</div>
      <div className="w-[188px] text-center">수정일</div>
      <div className="w-[188px] text-center">관리</div>
    </>
  )

  // Item 컴포넌트
  const Item = ({ item, index }: { item: any; index: number }) => (
    <>
      <div className="w-[68px] text-center">{index}</div>
      <div className="flex w-[92px] justify-center">
        <BadgeV2 color="gray" type="solid_regular">
          {CAS_QUESTION_TYPES[item.type]}
        </BadgeV2>
      </div>
      <div className="w-[632px] text-left">{item.type === 'CAS_PROFILE' ? 'CAS 프로필 양식' : item.title}</div>
      <div className="w-[188px] text-center">{DateUtil.formatDate(item.updatedAt, DateFormat['YYYY.MM.DD'])}</div>
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
      </div>
    </>
  )

  const handleCreateClick = () => {
    setActiveModal('Category')
  }

  const handleEditClick = (item: any) => {
    if (item.type === 'CHECKLIST') {
      setActiveModal('CHECKLIST')
      setType('CHECKLIST')
      setActiveModalType('Update')
    } else {
      setActiveModal('Add')
      setType(item?.type)
      if (item.type === 'INTERVIEW' || item.type === 'RISK_ASSESSMENT') {
        setSelectedInterviewType(item.category)
      }
    }
  }

  const handleNext = () => {
    if (type === 'CHECKLIST') {
      setActiveModal('CHECKLIST')
    } else {
      setActiveModal('Add')
    }
  }

  const handleBackToProjectSelection = () => {
    setActiveModal(null)
    setSelectedInterviewType(undefined)
  }

  const handleSuccess = () => {
    setActiveModal(null)
    refetch()
    setSelectedInterviewType(undefined)
    setAlertMessage(`${CAS_QUESTION_TYPES[type]} 양식이 저장되었습니다.`)
  }

  return (
    <div className="min-h-[664px] rounded-xl bg-white">
      <div className="m-6 flex flex-row items-center justify-between">
        <Typography variant="title1">양식</Typography>
        {permission === 'IB_CAS' && questions?.length > 0 && (
          <ButtonV2 variant="solid" size={40} color="orange800" onClick={handleCreateClick}>
            추가하기
          </ButtonV2>
        )}
      </div>

      {questions?.length ? (
        <FrontPaginatedList
          headerComponent={<Header />}
          itemComponent={(item, index) => <Item item={item} index={index} />}
          page={1}
          pageSize={10}
          totalItems={questions.length}
          items={questions}
          onSelect={(item) => console.log('선택된 항목:', item)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="h-12 w-12 px-[2.50px]">
            <img src={NODATA} className="h-12 w-[43px] object-cover" />
          </div>
          {permission === 'IB_CAS' ? (
            <>
              <Typography variant="body2" className="text-primary-gray-700 text-center font-medium">
                생성한 양식이 없습니다.
                <br />
                양식을 추가해주세요.
              </Typography>
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => setActiveModal('Category')}>
                추가하기
              </ButtonV2>
            </>
          ) : (
            <Typography variant="body2" className="text-primary-gray-700 text-center font-medium">
              생성한 양식이 없습니다.
            </Typography>
          )}
        </div>
      )}

      {activeModal === 'Category' && (
        <PopupModal
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          title={'유형을 선택해주세요'}
          footerButtons={
            <div className="flex gap-2">
              <ButtonV2 variant="solid" color="orange800" size={48} onClick={handleNext}>
                {'다음'}
              </ButtonV2>
            </div>
          }
        >
          <RadioV2.Group selectedValue={type} onChange={(value) => setType(value)} className="flex flex-col gap-3">
            {Object.entries(CAS_QUESTION_TYPES).map(([value, name]) => (
              <RadioV2.Box value={value} title={name} />
            ))}
          </RadioV2.Group>
        </PopupModal>
      )}
      {activeModal === 'Add' && (
        <CoordinatorCAS_Question_AddQuestion
          type={type}
          interviews={interviews}
          profile={profile}
          selectedInterviewType={selectedInterviewType}
          modalOpen={true}
          setModalClose={() => {
            setActiveModal(null)
            setSelectedInterviewType(undefined)
          }}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
        />
      )}
      {activeModal === 'CHECKLIST' && (
        <CoordinatorEE_Form_AddCheckList
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          checkListItems={activeModalType === 'Create' ? [] : checklists?.items || []}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          type={'CAS'}
        />
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
