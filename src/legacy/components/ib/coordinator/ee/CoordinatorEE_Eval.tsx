import { map, max, orderBy } from 'lodash'
import { useState } from 'react'

import { useCoordinatorCheck } from '@/legacy/container/ib-coordinator'
import { useEEEvaluationGetItems } from '@/legacy/generated/endpoint'
import { ResponseEEEvaluationDto } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

import FrontPaginatedList from '../../../FrontPaginatedList '
import AlertV2 from '../@/legacy/components/common/AlertV2'
import { ButtonV2 } from '../@/legacy/components/common/ButtonV2'
import { Typography } from '../@/legacy/components/common/Typography'

import { CoordinatorEE_Eval_AddEval } from './CoordinatorEE_Eval_AddEval'
import { CoordinatorEE_Eval_UpdateEval } from './CoordinatorEE_Eval_UpdateEval'

import NODATA from '@/legacy/assets/images/no-data.png'

export type ModalType = 'Update' | 'Add' | null
export type CategoryType = 'Ref' | 'FAQ' | ''

export default function CoordinatorEE_Eval() {
  const { data } = useEEEvaluationGetItems({ location: 'ESSAY' })
  const { permission } = useCoordinatorCheck()

  const items = orderBy(data?.items || [], 'id', 'desc')

  const lastId = max(map(items, 'id'))

  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedEval, setSelectedEval] = useState<ResponseEEEvaluationDto>()
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'VIEW' | 'UPDATE'>('UPDATE')

  const Header = () => (
    <>
      <div className="flex-[1] px-2 text-center">번호</div>
      <div className="flex-[10] px-2 text-center">제목</div>
      <div className="flex-[2] px-2 text-center">작성일</div>
      <div className="flex-[2] px-2 text-center">관리</div>
    </>
  )

  // Item 컴포넌트
  const Item = ({ item, index }: { item: any; index: number }) => (
    <>
      <div className="flex-[1] p-2 text-center">{index}</div>
      <div className="flex-[10] p-2 text-left">{item.title}</div>
      <div className="flex-[2] p-2 text-center">{DateUtil.formatDate(item.createdAt, DateFormat['YYYY.MM.DD'])}</div>
      <div className="flex-[2] p-2 text-center">
        <ButtonV2
          variant="outline"
          size={32}
          color="gray400"
          onClick={(e) => {
            e.stopPropagation()
            if (item.id !== lastId) {
              setViewType('VIEW')
              handleEditClick(item)
            } else {
              setViewType('UPDATE')
              handleEditClick(item)
            }
          }}
        >
          {item.id !== lastId ? '보기' : '수정'}
        </ButtonV2>
      </div>
    </>
  )

  const handleEditClick = (item: any) => {
    setSelectedEval(item)
    setActiveModal('Update')
  }

  return (
    <div className="min-h-[664px] rounded-xl bg-white">
      <div className="flex flex-row items-center justify-between p-6">
        <Typography variant="title1">평가</Typography>
        {permission === 'IB_EE' && items.length > 0 && (
          <ButtonV2 variant="solid" size={40} color="orange800" onClick={() => setActiveModal('Add')}>
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
          {permission === 'IB_EE' ? (
            <>
              <Typography variant="body2" className="text-primary-gray-700 text-center font-medium">
                작성한 평가가 없습니다.
                <br />
                평가를 추가해주세요.
              </Typography>
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => setActiveModal('Add')}>
                추가하기
              </ButtonV2>
            </>
          ) : (
            <Typography variant="body2" className="text-primary-gray-700 text-center font-medium">
              작성한 평가가 없습니다.
            </Typography>
          )}
        </div>
      )}

      <CoordinatorEE_Eval_AddEval
        modalOpen={activeModal === 'Add'}
        setModalClose={() => setActiveModal(null)}
        onSuccess={() => setActiveModal(null)}
      />
      {selectedEval && (
        <CoordinatorEE_Eval_UpdateEval
          viewType={viewType}
          modalOpen={activeModal === 'Update'}
          setModalClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null)
          }}
          evaluationData={selectedEval}
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
