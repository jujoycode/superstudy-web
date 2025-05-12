import { useState } from 'react'
import { useHistory } from '@/hooks/useHistory'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { useThemeQuestionFindAll } from '@/legacy/container/ib-themequestion'
import { ThemeQuestionGetThemeQuestionItemsByTypeType } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import FrontPaginatedList from '../../FrontPaginatedList '
import { PopupModal } from '../../PopupModal'
import { CoordinatorEE_Form_AddCheckList } from './ee/CoordinatorEE_Form_AddCheckList'

export type ModalType = 'Category' | 'Add' | null

interface QuestionListProps {
  type?: ThemeQuestionGetThemeQuestionItemsByTypeType
}

export default function QuestionList({ type = 'TOK_ESSAY' }: QuestionListProps) {
  const { push } = useHistory()

  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedCategory, setSelectedCategory] = useState<ThemeQuestionGetThemeQuestionItemsByTypeType>()
  const [activeModalType, setActiveModalType] = useState<'Create' | 'Update'>()
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const { data: Questions, isLoading: isFetching, refetch } = useThemeQuestionFindAll(type)

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
        <ButtonV2 variant="outline" size={32} color="gray400">
          삭제
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
    setSelectedCategory('TOK_EXHIBITION')
  }

  const handleNext = () => {
    setActiveModal('Add')
  }

  const handleBackToProjectSelection = () => {
    setActiveModal(null)
  }

  const handleSuccess = () => {
    setActiveModal(null)
    refetch()
    setAlertMessage('체크리스트가 저장되었습니다.')
  }

  return (
    <div className="rounded-lg bg-white">
      <div className="m-6 flex flex-row items-center justify-between">
        <Typography variant="title1">양식</Typography>
        <ButtonV2 variant="solid" size={40} color="orange800" onClick={handleCreateClick}>
          추가하기
        </ButtonV2>
      </div>

      {Questions?.length && (
        <FrontPaginatedList
          headerComponent={<Header />}
          itemComponent={(item, index) => <Item item={item} index={index} />}
          page={1}
          pageSize={20}
          totalItems={Questions.length}
          items={Questions}
          onSelect={(item) => console.log('선택된 항목:', item)}
        />
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
          <RadioV2.Group
            selectedValue={selectedCategory}
            onChange={(value: ThemeQuestionGetThemeQuestionItemsByTypeType) => setSelectedCategory(value)}
            className="flex flex-col gap-3"
          >
            <RadioV2.Box value="CheckList" title="체크리스트" />
            <RadioV2.Box value="Interview" title="인터뷰" />
          </RadioV2.Group>
        </PopupModal>
      )}
      {activeModal === 'Add' && (
        <CoordinatorEE_Form_AddCheckList
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          checkListItems={[]}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          type={type}
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
