import { concat, sortBy } from 'lodash'
import { useState } from 'react'

import NODATA from '@/assets/images/no-data.png'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useCoordinatorCheck } from '@/legacy/container/ib-coordinator'
import { useChecklistGetitems, useInterviewFindAllInterview } from '@/legacy/generated/endpoint'
import { DateFormat, DateUtil } from '@/legacy/util/date'

import FrontPaginatedList from '../../FrontPaginatedList '
import { PopupModal } from '../../PopupModal'

import { CoordinatorEE_Form_AddCheckList } from './ee/CoordinatorEE_Form_AddCheckList'
import { CoordinatorEE_Form_AddInterview } from './ee/CoordinatorEE_Form_AddInterview'

export type ModalType = 'Category' | 'Add' | null
export type CategoryType = 'CheckList' | 'Interview' | ''

interface FormListProps {
  type?: string
}

export default function FormList({ type = 'EE_RPPF' }: FormListProps) {
  const { permission } = useCoordinatorCheck()

  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('')
  const [activeModalType, setActiveModalType] = useState<'Create' | 'Update'>()
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const { data: interviews, refetch: interviewRefetch } = useInterviewFindAllInterview({
    category: type,
  })

  const { data: checklists, refetch: checkListRefetch } = useChecklistGetitems({
    location: 'ESSAY',
  })

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
          {item.category || item.location}
        </BadgeV2>
      </div>
      <div className="w-[632px] text-left">{item.title}</div>
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
    setActiveModalType('Create')
    setActiveModal('Category')
  }

  const handleEditClick = (item: any) => {
    setActiveModal('Add')
    setActiveModalType('Update')
    setSelectedCategory(item.commonQuestion ? 'Interview' : 'CheckList')
  }

  const handleNext = () => {
    if (selectedCategory !== '') {
      setActiveModal('Add')
    }
  }

  const handleBackToProjectSelection = () => {
    setActiveModal(null)
  }

  const handleSuccess = () => {
    setActiveModal(null)
    interviewRefetch()
    checkListRefetch()
    if (selectedCategory === 'CheckList') {
      setAlertMessage('체크리스트가 저장되었습니다.')
    }
  }

  const items = concat(
    [] as any[],
    interviews?.items || [],
    checklists?.total ? [{ ...sortBy(checklists.items, 'createdAt')[0], id: 0, title: '체크리스트' }] : [],
  )

  return (
    <div className="flex min-h-[664px] flex-col rounded-xl bg-white">
      <div className="flex flex-row items-center justify-between p-6">
        <Typography variant="title1">양식</Typography>
        {permission === 'IB_EE' && items.length > 0 && (
          <ButtonV2 variant="solid" size={40} color="orange800" onClick={handleCreateClick}>
            추가하기
          </ButtonV2>
        )}
      </div>

      {items.length > 0 ? (
        <FrontPaginatedList
          headerComponent={<Header />}
          itemComponent={(item, index) => <Item item={item} index={index} />}
          page={1}
          pageSize={10}
          totalItems={items.length}
          items={items}
          onSelect={(item) => console.log('선택된 항목:', item)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="h-12 w-12 px-[2.50px]">
            <img src={NODATA} className="h-12 w-[43px] object-cover" />
          </div>
          {permission === 'IB_EE' ? (
            <>
              <Typography variant="body2" className="text-center font-medium text-gray-700">
                작성한 양식이 없습니다.
                <br />
                양식을 추가해주세요.
              </Typography>
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={handleCreateClick}>
                추가하기
              </ButtonV2>
            </>
          ) : (
            <Typography variant="body2" className="text-center font-medium text-gray-700">
              작성한 양식이 없습니다.
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
              <ButtonV2
                variant="solid"
                color="orange800"
                size={48}
                onClick={handleNext}
                disabled={selectedCategory === ''}
              >
                {'다음'}
              </ButtonV2>
            </div>
          }
        >
          <RadioV2.Group
            selectedValue={selectedCategory}
            onChange={(value: CategoryType) => setSelectedCategory(value)}
            className="flex flex-col gap-3"
          >
            <RadioV2.Box value="CheckList" title="체크리스트" />
            <RadioV2.Box value="Interview" title="인터뷰" />
          </RadioV2.Group>
        </PopupModal>
      )}
      {activeModal === 'Add' && selectedCategory === 'CheckList' && (
        <CoordinatorEE_Form_AddCheckList
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          checkListItems={activeModalType === 'Create' ? [] : checklists?.items || []}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          type={'ESSAY'}
        />
      )}
      {activeModal === 'Add' && selectedCategory === 'Interview' && (
        <CoordinatorEE_Form_AddInterview
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          interviewItems={activeModalType === 'Create' ? [] : interviews?.items || []}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
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
