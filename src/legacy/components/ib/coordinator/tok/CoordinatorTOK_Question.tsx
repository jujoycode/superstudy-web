import { concat } from 'lodash'
import { useState } from 'react'
import NODATA from '@/assets/images/no-data.png'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import FrontPaginatedList from '@/legacy/components/FrontPaginatedList '
import { PopupModal } from '@/legacy/components/PopupModal'
import { useCoordinatorCheck } from '@/legacy/container/ib-coordinator'
import { useThemeQuestionGetThemeQuestionItemsByType } from '@/legacy/generated/endpoint'
import { ThemeQuestionGetThemeQuestionItemsByTypeType } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

import { ModalType } from '../FAQList'

import { CoordinatorTOK_Question_AddQuestion } from './CoordinatorTOK_Question_AddQuestion'

export const THEME_QUESTION_TYPE_KOR: Record<string, string> = {
  TOK_ESSAY: '에세이',
  TOK_EXHIBITION: '전시회',
}
export const CoordinatorTOK_Question = () => {
  const { permission } = useCoordinatorCheck()
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [type, setType] = useState<ThemeQuestionGetThemeQuestionItemsByTypeType>('TOK_ESSAY')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const { data: essayData, refetch: essayRefetch } = useThemeQuestionGetThemeQuestionItemsByType({ type: 'TOK_ESSAY' })

  const { data: exhibitionData, refetch: exhibitionRefetch } = useThemeQuestionGetThemeQuestionItemsByType({
    type: 'TOK_EXHIBITION',
  })

  const questions = concat(
    [],
    essayData?.map((el) => ({ ...el, type: 'TOK_ESSAY' })) || [],
    exhibitionData?.map((el) => ({ ...el, type: 'TOK_EXHIBITION' })) || [],
  )

  const refetch = () => {
    essayRefetch()
    exhibitionRefetch()
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
          {THEME_QUESTION_TYPE_KOR[item.type]}
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
    setActiveModal('Category')
  }

  const handleEditClick = (item: any) => {
    setActiveModal('Add')
    setType(item?.type)
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
    setAlertMessage(`${THEME_QUESTION_TYPE_KOR[type]}가 저장되었습니다.`)
  }

  return (
    <div className="min-h-[664px] rounded-xl bg-white">
      <div className="m-6 flex h-10 flex-row items-center justify-between">
        <Typography variant="title1">양식</Typography>
        {permission === 'IB_TOK' && questions.length > 0 && (
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
          {permission === 'IB_TOK' ? (
            <>
              <Typography variant="body2" className="text-primary-gray-700 text-center font-medium">
                생성된 양식이 없습니다.
                <br />
                양식을 추가해주세요.
              </Typography>
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={handleCreateClick}>
                추가하기
              </ButtonV2>
            </>
          ) : (
            <Typography variant="body2" className="text-primary-gray-700 text-center font-medium">
              생성된 양식이 없습니다.
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
            <RadioV2.Box
              value={ThemeQuestionGetThemeQuestionItemsByTypeType.TOK_ESSAY}
              disabled={!!essayData?.length}
              title="에세이"
            />
            <RadioV2.Box
              value={ThemeQuestionGetThemeQuestionItemsByTypeType.TOK_EXHIBITION}
              disabled={!!exhibitionData?.length}
              title="전시회"
            />
          </RadioV2.Group>
        </PopupModal>
      )}
      {activeModal === 'Add' && (
        <CoordinatorTOK_Question_AddQuestion
          type={type}
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
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
