import { concat, find, map } from 'lodash'
import { PropsWithChildren, useState } from 'react'

import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { PopupModal } from '@/legacy/components/PopupModal'
import { SuperModal } from '@/legacy/components/SuperModal'
import { useTokEvaluationUpdateCriteria } from '@/legacy/generated/endpoint'
import {
  ResponseTokEvaluationCriteriaDto,
  TokEvaluationGradeDto,
  UpdateTokEvaluationGradeDto,
} from '@/legacy/generated/model'

import { useTokEvaluationGetCriteriaById } from '../../../../generated/endpoint'
import ColorSVGIcon from '../../../icon/ColorSVGIcon'
import { EvalInputField } from '../../EvalInputField'

interface CoordinatorTOK_Eval_UpdateEvalProps {
  modalOpen: boolean
  setModalClose: () => void
  onSuccess: () => void
  evaluationData: ResponseTokEvaluationCriteriaDto
  ablePropragation?: boolean
  viewType?: 'VIEW' | 'UPDATE'
}

export function CoordinatorTOK_Eval_UpdateEval({
  modalOpen,
  setModalClose,
  onSuccess,
  evaluationData,
  viewType = 'UPDATE',
}: PropsWithChildren<CoordinatorTOK_Eval_UpdateEvalProps>) {
  // 평가 아코디언 기준 뱃지를 만들기 위한 알파벳 배열 생성

  const [isOpen, setIsOpen] = useState(false)
  const [createGrades, setCreateGrades] = useState<TokEvaluationGradeDto[]>([])
  const [updateGrades, setUpdateGrades] = useState<UpdateTokEvaluationGradeDto[]>([])
  const [deleteGradeIds, setDeleteGradeIds] = useState<number[]>([])

  const reset = () => {
    setCreateGrades([])
    setUpdateGrades([])
    setDeleteGradeIds([])
  }

  const { mutate: updateEvaluation, isLoading: updateLoading } = useTokEvaluationUpdateCriteria({
    mutation: {
      onSuccess: () => {
        setIsOpen(true)
        onSuccess()
        reset()
      },
    },
  })

  const { data: evaluation } = useTokEvaluationGetCriteriaById(evaluationData.id)

  const [isContinue, setContinue] = useState(false)

  if (modalOpen && !isContinue && viewType === 'UPDATE') {
    return (
      <SuperModal modalOpen={modalOpen} setModalClose={setModalClose} hasClose={false} className="w-[416px] rounded-xl">
        <div className="p-8 pb-5">
          <div className="w-full text-center text-lg leading-[26px] font-semibold text-gray-900">
            평가 항목을 수정하면
            <br />
            지금까지 평가된 학생의 데이터가 변경됩니다.
            <br />
            그래도 수정하시겠습니까?
          </div>
        </div>
        <div className="flex w-full gap-3 px-5 pb-5">
          <ButtonV2 variant="solid" color="gray100" size={48} onClick={setModalClose} className="w-[182px]">
            취소
          </ButtonV2>
          <ButtonV2 variant="solid" color="orange800" size={48} onClick={() => setContinue(true)} className="w-[182px]">
            수정하기
          </ButtonV2>
        </div>
      </SuperModal>
    )
  }

  const updateGrade = (grade: UpdateTokEvaluationGradeDto, updateDto: Partial<UpdateTokEvaluationGradeDto>) => {
    setUpdateGrades((grades) => {
      const newGrades = structuredClone(grades)
      if (map(grades, 'id').includes(grade.id)) {
        const updateIndex = grades.findIndex(({ id }) => id === grade.id)
        newGrades[updateIndex] = {
          ...grades[updateIndex],
          ...updateDto,
        }
      } else {
        newGrades.push({ ...grade, ...updateDto })
      }
      return newGrades
    })
  }

  if (!evaluation) return <Blank />

  const grades = evaluation.grades
    .filter((el) => !deleteGradeIds.includes(el.id))
    .map((el) =>
      map(updateGrades, 'id').includes(el.id) ? { ...el, ...find(updateGrades, ({ id }) => id === el.id) } : el,
    )

  const disabled = viewType === 'VIEW'

  const footerButtons = disabled ? (
    <ButtonV2
      variant="solid"
      color="gray100"
      size={48}
      onClick={() => {
        setModalClose()
        setContinue(false)
        reset()
      }}
    >
      확인
    </ButtonV2>
  ) : (
    <div className="flex justify-end gap-3">
      <ButtonV2
        variant="solid"
        color="gray100"
        size={48}
        onClick={() => {
          setModalClose()
          setContinue(false)
          reset()
        }}
      >
        취소
      </ButtonV2>
      <ButtonV2
        type="submit"
        variant="solid"
        color="orange800"
        size={48}
        onClick={() => {
          setModalClose()
          setContinue(false)
          evaluation?.id &&
            updateEvaluation({
              id: evaluation.id,
              data: {
                createGrades,
                updateGrades,
                deleteGradeIds,
              },
            })
        }}
      >
        저장하기
      </ButtonV2>
    </div>
  )

  return (
    <>
      {updateLoading && <Blank />}
      <PopupModal
        modalOpen={modalOpen}
        setModalClose={() => {
          setModalClose()
          reset()
        }}
        title={evaluation?.title}
        footerButtons={footerButtons}
        size="large"
        bottomBorder={false}
      >
        <div className="space-y-2 rounded-lg bg-gray-50 p-4">
          {grades.map((grade, index) => (
            <div className="space-y-2 rounded-lg bg-gray-50 p-4" key={grade.id}>
              <div className="flex items-center justify-between py-2">
                <Typography variant="title3">평가등급 {index + 1}</Typography>
                {!disabled && (
                  <ColorSVGIcon.Close
                    className="cursor-pointer"
                    color="gray700"
                    size={32}
                    onClick={() => {
                      setDeleteGradeIds(deleteGradeIds.concat(grade.id))
                    }}
                  />
                )}
              </div>
              <div className="flex w-full space-x-4">
                <EvalInputField
                  label="등급명"
                  value={grade.name}
                  className="w-2/3"
                  disabled={disabled}
                  onChange={(e) => updateGrade(grade, { name: e.target.value })}
                />
                <EvalInputField.Score
                  label="점수범위"
                  disabled={disabled}
                  minScoreProps={{
                    value: Number(grade.minScore).toString(),
                    onChange: (e) =>
                      Number(e.target.value) <= grade.maxScore &&
                      updateGrade(grade, { minScore: Number(e.target.value) }),
                  }}
                  maxScoreProps={{
                    value: Number(grade.maxScore).toString(),
                    max: 99,
                    onChange: (e) =>
                      Number(e.target.value) <= 99 && updateGrade(grade, { maxScore: Number(e.target.value) }),
                  }}
                  className="w-1/3"
                />
              </div>

              <TextareaV2
                disabled={disabled}
                value={grade.description}
                className="h-40 bg-white"
                placeholder="세부 평가 지표를 입력하세요."
                onChange={(e) => updateGrade(grade, { description: e.target.value })}
              />
            </div>
          ))}
          {createGrades.map((grade, index) => (
            <div className="space-y-2 rounded-lg bg-gray-50 p-4" key={`create-grade-${index}`}>
              <div className="flex items-center justify-between py-2">
                <Typography variant="title3">평가등급 {grades.length + index + 1}</Typography>
                {!disabled && (
                  <ColorSVGIcon.Close
                    className="cursor-pointer"
                    color="gray700"
                    size={32}
                    onClick={() =>
                      setCreateGrades((grades) => {
                        const newGrades = structuredClone(grades)
                        newGrades.splice(index, 1)
                        return newGrades
                      })
                    }
                  />
                )}
              </div>
              <div className="flex w-full space-x-4">
                <EvalInputField
                  label="등급명"
                  value={grade.name}
                  disabled={disabled}
                  className="w-2/3"
                  onChange={(e) =>
                    setCreateGrades((grades) => {
                      const newGrades = structuredClone(grades)
                      newGrades[index].name = e.target.value
                      return newGrades
                    })
                  }
                />
                <EvalInputField.Score
                  label="점수범위"
                  disabled={disabled}
                  minScoreProps={{
                    value: Number(grade.minScore).toString(),
                    onChange: (e) =>
                      Number(e.target.value) <= grade.maxScore &&
                      setCreateGrades((grades) => {
                        const newGrades = structuredClone(grades)
                        newGrades[index].minScore = Number(e.target.value)
                        return newGrades
                      }),
                  }}
                  maxScoreProps={{
                    value: Number(grade.maxScore).toString(),
                    max: 99,
                    onChange: (e) =>
                      Number(e.target.value) <= 99 &&
                      setCreateGrades((grades) => {
                        const newGrades = structuredClone(grades)
                        newGrades[index].maxScore = Number(e.target.value)
                        return newGrades
                      }),
                  }}
                  className="w-1/3"
                />
              </div>

              <TextareaV2
                disabled={disabled}
                value={grade.description}
                className="h-40 bg-white"
                placeholder="세부 평가 지표를 입력하세요."
                onChange={(e) =>
                  setCreateGrades((grades) => {
                    const newGrades = structuredClone(grades)
                    newGrades[index].description = e.target.value
                    return newGrades
                  })
                }
              />
            </div>
          ))}
          {!disabled && (
            <div className="flex w-full justify-center py-2">
              <ButtonV2
                variant="outline"
                size={40}
                color="gray400"
                className="flex items-center justify-center gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setCreateGrades(concat(createGrades, { name: '', minScore: 0, maxScore: 0, description: '' }))
                }}
              >
                <SVGIcon.Plus color="gray700" size={16} weight="bold" />
                등급 추가하기
              </ButtonV2>
            </div>
          )}
        </div>
      </PopupModal>
      {isOpen && (
        <AlertV2 confirmText="확인" message={`평가기준이 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
      )}
    </>
  )
}
