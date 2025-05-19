import { filter, maxBy, orderBy } from 'lodash'
import { useState } from 'react'

import NODATA from '@/assets/images/no-data.png'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useCoordinatorCheck } from '@/legacy/container/ib-coordinator'
import { useTokEvaluationGetCriteriaItems } from '@/legacy/generated/endpoint'
import {
  RequestCreateTokEvaluationDtoType,
  ResponseTokEvaluationCriteriaDto,
  ResponseTokEvaluationCriteriaDtoType,
  TokEvaluationGetCriteriaItemsType,
} from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

import { CoordinatorTOK_Eval_AddEval } from './CoordinatorTOK_Eval_AddEval'
import { CoordinatorTOK_Eval_UpdateEval } from './CoordinatorTOK_Eval_UpdateEval'
import FrontPaginatedList from '../../../FrontPaginatedList '

export type ModalType = 'Category' | 'Update' | 'Add' | null
export type CategoryType = 'Ref' | 'FAQ' | ''

const EVALUATION_TYPE_KOR = {
  [TokEvaluationGetCriteriaItemsType.ESSAY]: '에세이',
  [TokEvaluationGetCriteriaItemsType.EXHIBITION]: '전시회',
}

export default function CoordinatorTOK_Eval() {
  const { data } = useTokEvaluationGetCriteriaItems()
  const { permission } = useCoordinatorCheck()
  const items = orderBy(data?.items || [], 'id', 'desc')

  const essayLastId = maxBy(
    filter(items, (el) => el.type === ResponseTokEvaluationCriteriaDtoType.ESSAY),
    'id',
  )?.id
  const exhibitionLastId = maxBy(
    filter(items, (el) => el.type === ResponseTokEvaluationCriteriaDtoType.EXHIBITION),
    'id',
  )?.id

  const [selectedType, setSelectedType] = useState<RequestCreateTokEvaluationDtoType>()
  const [viewType, setViewType] = useState<'VIEW' | 'UPDATE'>('UPDATE')

  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedEval, setSelectedEval] = useState<ResponseTokEvaluationCriteriaDto>()
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const Header = () => (
    <>
      <div className="flex-[1] px-2 text-center">번호</div>
      <div className="flex-[2] px-2 text-center">유형</div>
      <div className="flex-[10] px-2 text-center">제목</div>
      <div className="flex-[2] px-2 text-center">작성일</div>
      <div className="flex-[2] px-2 text-center">관리</div>
    </>
  )

  // Item 컴포넌트
  const Item = ({ item, index }: { item: any; index: number }) => (
    <>
      <div className="flex-[1] p-2 text-center">{index}</div>
      <div className="flex flex-[2] justify-center p-2">
        <BadgeV2 color="gray" type="solid_regular">
          {EVALUATION_TYPE_KOR[item.type as TokEvaluationGetCriteriaItemsType]}
        </BadgeV2>
      </div>
      <div className="flex-[10] p-2 text-left">{item.title}</div>
      <div className="flex-[2] p-2 text-center">{DateUtil.formatDate(item.createdAt, DateFormat['YYYY.MM.DD'])}</div>
      <div className="flex-[2] p-2 text-center">
        <ButtonV2
          variant="outline"
          size={32}
          color="gray400"
          onClick={(e) => {
            e.stopPropagation()
            if (item.id !== essayLastId && item.id !== exhibitionLastId) {
              setViewType('VIEW')
              handleEditClick(item)
            } else {
              setViewType('UPDATE')
              handleEditClick(item)
            }
          }}
        >
          {item.id !== essayLastId && item.id !== exhibitionLastId ? '보기' : '수정'}
        </ButtonV2>
      </div>
    </>
  )

  const handleNext = () => {
    if (selectedType) {
      setActiveModal('Add')
    }
  }

  const handleEditClick = (item: any) => {
    setSelectedEval(item)
    setActiveModal('Update')
  }

  return (
    <div className="min-h-[664px] rounded-xl bg-white">
      <div className="m-6 flex flex-row items-center justify-between">
        <Typography variant="title1">평가</Typography>
        {permission === 'IB_TOK' && items.length > 0 && (
          <ButtonV2 variant="solid" size={40} color="orange800" onClick={() => setActiveModal('Category')}>
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
          {permission === 'IB_TOK' ? (
            <>
              <Typography variant="body2" className="text-center font-medium text-gray-700">
                생성된 평가가 없습니다.
                <br />
                평가를 추가해주세요.
              </Typography>
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => setActiveModal('Category')}>
                추가하기
              </ButtonV2>
            </>
          ) : (
            <Typography variant="body2" className="text-center font-medium text-gray-700">
              생성된 평가가 없습니다.
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
              <ButtonV2 variant="solid" color="orange800" size={48} onClick={handleNext} disabled={!selectedType}>
                {'다음'}
              </ButtonV2>
            </div>
          }
        >
          <div className="p-[6px]">
            <RadioV2.Group
              selectedValue={selectedType}
              onChange={(value: RequestCreateTokEvaluationDtoType) => setSelectedType(value)}
              className="flex flex-col gap-3"
            >
              <RadioV2.Box value={RequestCreateTokEvaluationDtoType.EXHIBITION} title="전시회" />
              <RadioV2.Box value={RequestCreateTokEvaluationDtoType.ESSAY} title="에세이" />
            </RadioV2.Group>
          </div>
        </PopupModal>
      )}
      {selectedType && (
        <CoordinatorTOK_Eval_AddEval
          type={selectedType}
          modalOpen={activeModal === 'Add'}
          setModalClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
        />
      )}
      {selectedEval && (
        <CoordinatorTOK_Eval_UpdateEval
          viewType={viewType}
          evaluationData={selectedEval}
          modalOpen={activeModal === 'Update'}
          setModalClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null)
          }}
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
