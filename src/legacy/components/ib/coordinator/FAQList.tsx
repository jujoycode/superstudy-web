import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import NODATA from '@/assets/images/no-data.png'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import {
  useCoordinatorCheck,
  useCoordinatorGetFAQ,
  useCoordinatorGetReference,
  useIBFAQDelete,
  useIBReferenceDelete,
} from '@/legacy/container/ib-coordinator'
import { ReferenceInfoGetReferenceInfoListCategory } from '@/legacy/generated/model'

import FrontPaginatedList from '../../FrontPaginatedList '
import { PopupModal } from '../../PopupModal'

import { CoordinatorEE_FAQ_AddFaq } from './ee/CoordinatorEE_FAQ_AddFaq'
import { CoordinatorEE_FAQ_AddRef } from './ee/CoordinatorEE_FAQ_AddRef'

export type ModalType = 'Category' | 'Add' | 'Update' | 'CHECKLIST' | null
export type CategoryType = 'Ref' | 'FAQ' | ''

interface FAQListProps {
  type?: ReferenceInfoGetReferenceInfoListCategory
}

export default function FAQList({ type = 'IB_ALL' }: FAQListProps) {
  const { data: References, getIBReference } = useCoordinatorGetReference()
  const { data: FAQs, getIBFAQ } = useCoordinatorGetFAQ()
  const { permission } = useCoordinatorCheck()
  const [mergedItems, setMergedItems] = useState<any[]>([])
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [confirmAlert, setConfirmAlert] = useState<boolean>(false)
  const [updateData, setUpdateData] = useState<any>()
  const [deleteData, setDeleteData] = useState<any>()

  const { deleteIBReference } = useIBReferenceDelete({
    onSuccess: () => {
      setConfirmAlert(!confirmAlert)
      setAlertMessage(`참고자료를\n삭제하였습니다`)
    },
    onError: (error) => {
      console.error('참고자료 삭제 중 오류 발생:', error)
    },
  })

  const { deleteIBFAQ } = useIBFAQDelete({
    onSuccess: () => {
      setConfirmAlert(!confirmAlert)
      setAlertMessage(`FAQ를\n삭제하였습니다`)
    },
    onError: (error) => {
      console.error('FAQ 삭제 중 오류 발생:', error)
    },
  })

  useEffect(() => {
    getIBReference({ category: type })
    getIBFAQ({ category: type })

    if (References && FAQs) {
      // 데이터 병합 및 정렬
      const mergedData = [
        ...References.items.map((ref: any) => ({ ...ref, category: '참고자료' })),
        ...FAQs.items.map((faq: any) => ({ ...faq, category: 'FAQ' })),
      ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      setMergedItems(mergedData)
    }
  }, [References, FAQs])

  const Header = () => (
    <>
      <div className="text-primary-gray-500 w-[68px] text-center font-medium">번호</div>
      <div className="text-primary-gray-500 w-[92px] text-center font-medium">유형</div>
      <div className="text-primary-gray-500 w-[632px] text-center font-medium">제목</div>
      <div className="text-primary-gray-500 w-[188px] text-center font-medium">수정일</div>
      <div className="text-primary-gray-500 w-[188px] text-center font-medium">관리</div>
    </>
  )

  // Item 컴포넌트
  const Item = ({ item, index }: { item: any; index: number }) => (
    <>
      <div className="text-primary-gray-900 w-[68px] text-center font-medium">{index}</div>
      <div className="flex w-[92px] justify-center">
        <BadgeV2 color="gray" type="solid_regular">
          {item.category === '참고자료' ? '참고자료' : 'FAQ'}
        </BadgeV2>
      </div>
      <div className="text-primary-gray-900 w-[632px] text-left font-medium">{item.title}</div>
      <div className="text-primary-gray-900 w-[188px] text-center font-medium">
        {format(new Date(item.updatedAt), 'yyyy.MM.dd')}
      </div>
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
        <ButtonV2 variant="outline" size={32} color="gray400" onClick={() => handleDelete(item)}>
          삭제
        </ButtonV2>
      </div>
    </>
  )

  const handleEditClick = (item: any) => {
    const { category, ...dataWithoutCategory } = item

    setUpdateData(dataWithoutCategory)

    setActiveModal('Update')
    if (item.category === 'FAQ') {
      setSelectedCategory('FAQ')
    } else {
      setSelectedCategory('Ref')
    }
  }

  const handleDelete = (item: any) => {
    setDeleteData(item)
    setConfirmAlert(!confirmAlert)
  }

  const confirmDelete = () => {
    if (deleteData.category === '참고자료') {
      deleteIBReference(deleteData.id)
    } else {
      deleteIBFAQ(deleteData.id)
    }
  }

  const handleNext = () => {
    if (selectedCategory !== '') {
      setActiveModal('Add')
    }
  }

  const handleBackToProjectSelection = () => {
    setActiveModal('Category')
  }

  const handleSuccess = () => {
    setActiveModal(null)
    //    refetch();
    setAlertMessage(`참고자료가\n저장되었습니다`)
  }

  const isIBPermission = {
    IB_ALL: permission === 'IB_ALL',
    IB_EE: permission === 'IB_EE',
    IB_TOK: permission === 'IB_TOK',
    IB_CAS: permission === 'IB_CAS',
  }

  return (
    <div className="min-h-[664px] rounded-xl bg-white">
      <div className="flex flex-row items-center justify-between p-6">
        <Typography variant="title1" className="text-primary-gray-900">
          참고자료 및 FAQ
        </Typography>
        {isIBPermission[type] && mergedItems.length > 0 && (
          <ButtonV2 variant="solid" size={40} color="orange800" onClick={() => setActiveModal('Category')}>
            추가하기
          </ButtonV2>
        )}
      </div>

      {mergedItems.length > 0 ? (
        <FrontPaginatedList
          headerComponent={<Header />}
          itemComponent={(item, index) => <Item item={item} index={index} />}
          page={1}
          pageSize={10}
          totalItems={mergedItems.length}
          items={mergedItems}
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
                작성한 참고자료 및 FAQ가 없습니다.
                <br />
                참고자료 및 FAQ를 추가해주세요.
              </Typography>
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => setActiveModal('Category')}>
                추가하기
              </ButtonV2>
            </>
          ) : (
            <Typography variant="body2" className="text-primary-gray-700 text-center font-medium">
              작성한 참고자료 및 FAQ가 없습니다.
            </Typography>
          )}
        </div>
      )}

      {activeModal === 'Category' && (
        <PopupModal
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          title={'유형을 선택해주세요'}
          bottomBorder={false}
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
          <div className="p-[6px]">
            <RadioV2.Group
              selectedValue={selectedCategory}
              onChange={(value: CategoryType) => setSelectedCategory(value)}
              className="flex flex-col gap-3"
            >
              <RadioV2.Box value="Ref" title="참고 자료" />
              <RadioV2.Box value="FAQ" title="FAQ" />
            </RadioV2.Group>
          </div>
        </PopupModal>
      )}
      {activeModal === 'Add' && selectedCategory === 'Ref' && (
        <CoordinatorEE_FAQ_AddRef
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          category={type}
        />
      )}

      {activeModal === 'Update' && selectedCategory === 'Ref' && (
        <CoordinatorEE_FAQ_AddRef
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          handleBack={() => setActiveModal(null)}
          onSuccess={handleSuccess}
          data={updateData}
          type="update"
        />
      )}
      {activeModal === 'Add' && selectedCategory === 'FAQ' && (
        <CoordinatorEE_FAQ_AddFaq
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          category={type}
        />
      )}

      {activeModal === 'Update' && selectedCategory === 'FAQ' && (
        <CoordinatorEE_FAQ_AddFaq
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          handleBack={() => setActiveModal(null)}
          onSuccess={handleSuccess}
          type="update"
          data={updateData}
        />
      )}
      {alertMessage && (
        <AlertV2
          message={alertMessage}
          confirmText="확인"
          onConfirm={() => setAlertMessage(null)} // closes the AlertV2 by resetting the message
        />
      )}
      {confirmAlert && (
        <AlertV2
          message={`삭제하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          onConfirm={confirmDelete}
          description="삭제하시면 다시 되돌릴 수 없습니다"
          onCancel={() => setConfirmAlert(!confirmAlert)}
        />
      )}
    </div>
  )
}
