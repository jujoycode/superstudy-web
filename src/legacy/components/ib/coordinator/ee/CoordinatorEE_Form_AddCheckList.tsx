import { concat } from 'lodash'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'

import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useChecklistCreateChecklist, useChecklistDeleteChecklist } from '@/legacy/generated/endpoint'
import { ChecklistLocation, ResponseChecklistDto } from '@/legacy/generated/model'

import ColorSVGIcon from '../../../icon/ColorSVGIcon'
import SVGIcon from '../../../icon/SVGIcon'
import { FormInputField } from '../../FormInputField'

interface CoordinatorEE_Form_AddCheckListProps {
  modalOpen: boolean
  setModalClose: () => void
  checkListItems: ResponseChecklistDto[]
  onSuccess: () => void
  handleBack?: () => void
  type: ChecklistLocation
}

export interface QA {
  id: number // 각 질문/답변을 고유하게 식별하기 위한 ID
  question: string
  answer: string
}

export function CoordinatorEE_Form_AddCheckList({
  modalOpen,
  setModalClose,
  checkListItems,
  onSuccess,
  handleBack,
  type,
}: PropsWithChildren<CoordinatorEE_Form_AddCheckListProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [checkListContents, setCheckListContents] = useState<string[]>([])
  const [deleteCheckListIds, setDeleteCheckListIds] = useState<number[]>([])

  const hasEmptyFields = () => {
    return checkListContents.some((content) => content.trim() === '')
  }

  const { mutate: createCheckList, isLoading: createLoading } = useChecklistCreateChecklist()

  const { mutate: deleteCheckList, isLoading: deleteLoading } = useChecklistDeleteChecklist()

  const isLoading = createLoading || deleteLoading

  const filteredCheckListItems = checkListItems.filter((item) => !deleteCheckListIds.includes(item.id))

  useEffect(() => {
    if (!checkListItems.length && !checkListContents.length) {
      setCheckListContents([''])
    }
  }, [checkListItems])

  return (
    <>
      {isLoading && <Blank />}
      <div
        className={`fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black/50 ${
          !modalOpen && 'hidden'
        }`}
      >
        <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white px-8`}>
          <div className="backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6">
            <Typography variant="title1">체크리스트 작성</Typography>
            <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} />
          </div>

          <div ref={scrollRef} className="scroll-box flex max-h-[608px] flex-col gap-6 overflow-auto pt-4 pb-8">
            {concat([] as (ResponseChecklistDto | string)[], filteredCheckListItems, checkListContents).map(
              (checklist, index) =>
                typeof checklist === 'string' ? (
                  <FormInputField
                    key={index}
                    index={index}
                    label="항목"
                    question={checklist}
                    setQuestion={(question: string) =>
                      setCheckListContents((prev) => {
                        const value = structuredClone(prev)
                        value[index - filteredCheckListItems.length] = question
                        return value
                      })
                    }
                    deleteQuestion={() =>
                      setCheckListContents((prev) => {
                        const value = structuredClone(prev)
                        value.splice(index - filteredCheckListItems.length, 1)
                        return value
                      })
                    }
                  />
                ) : (
                  <FormInputField
                    key={index}
                    index={index}
                    label="항목"
                    question={checklist.content}
                    deleteQuestion={() => setDeleteCheckListIds(deleteCheckListIds.concat(checklist.id))}
                    readOnly
                  />
                ),
            )}

            <div className="flex justify-center">
              <ButtonV2
                variant="outline"
                size={40}
                color="gray400"
                className="flex flex-row items-center gap-1"
                onClick={() => setCheckListContents((prev) => [...prev, ''])}
              >
                <SVGIcon.Plus color="gray700" size={16} weight="bold" />
                항목 추가하기
              </ButtonV2>
            </div>
          </div>

          <div
            className={
              'backdrop-blur-20 sticky bottom-0 flex h-[104px] justify-end gap-4 border-t border-t-gray-100 bg-white/70 pt-6 pb-8'
            }
          >
            <div className="flex justify-end gap-3">
              <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
                이전
              </ButtonV2>
              <ButtonV2
                type="submit"
                variant="solid"
                color="orange800"
                size={48}
                disabled={hasEmptyFields()}
                onClick={() => {
                  createCheckList({ data: { location: type, checklistContents: checkListContents } })
                  deleteCheckListIds.length && deleteCheckList({ data: { ids: deleteCheckListIds } })
                  onSuccess()
                }}
              >
                저장하기
              </ButtonV2>
            </div>
          </div>
        </div>
        {isOpen && (
          <AlertV2 confirmText="확인" message={`참고자료가 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
        )}
      </div>
    </>
  )
}
