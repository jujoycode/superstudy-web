import { PropsWithChildren, useRef, useState } from 'react'
import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useTokEvaluationCreateCriteria } from '@/legacy/generated/endpoint'
import { RequestCreateTokEvaluationDtoType, TokEvaluationGradeDto } from '@/legacy/generated/model'
import { EvalInputField } from '../../EvalInputField'

const TOK_TYPE_KOR = {
  [RequestCreateTokEvaluationDtoType.ESSAY]: '에세이',
  [RequestCreateTokEvaluationDtoType.EXHIBITION]: '전시회',
}

interface CoordinatorTOK_Eval_AddEvalProps {
  type: RequestCreateTokEvaluationDtoType
  modalOpen: boolean
  setModalClose: () => void
  onSuccess: () => void
  ablePropragation?: boolean
}

export function CoordinatorTOK_Eval_AddEval({
  type,
  modalOpen,
  setModalClose,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<CoordinatorTOK_Eval_AddEvalProps>) {
  // 평가 아코디언 기준 뱃지를 만들기 위한 알파벳 배열 생성
  const alphabetArray = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

  const [isOpen, setIsOpen] = useState(false)
  const [grades, setGrades] = useState<TokEvaluationGradeDto[]>([
    { name: '', maxScore: 0, minScore: 0, description: '' },
  ])

  const reset = () => {
    setGrades([{ name: '', maxScore: 0, minScore: 0, description: '' }])
  }

  const scrollRef = useRef<HTMLDivElement>(null)

  const { mutate: createCriteria, isLoading: createLoading } = useTokEvaluationCreateCriteria({
    mutation: {
      onSuccess: () => {
        onSuccess()
        reset()
      },
    },
  })

  const updateGrades = (index: number, updateDto: Partial<TokEvaluationGradeDto>) => {
    setGrades((prevGrades) => prevGrades.map((g, i) => (i === index ? { ...g, ...updateDto } : g)))
  }

  const footerButtons = (
    <div className="flex justify-end gap-3">
      <ButtonV2 variant="solid" color="gray100" size={48} onClick={setModalClose}>
        취소
      </ButtonV2>
      <ButtonV2
        type="submit"
        variant="solid"
        color="orange800"
        size={48}
        onClick={() => createCriteria({ data: { type, grades } })}
      >
        저장하기
      </ButtonV2>
    </div>
  )

  return (
    <>
      {createLoading && <Blank />}
      <PopupModal
        modalOpen={modalOpen}
        setModalClose={() => {
          setModalClose()
          reset()
        }}
        title={`${TOK_TYPE_KOR[type]} 평가기준 작성`}
        footerButtons={footerButtons}
        size="large"
        bottomBorder={false}
      >
        <div className="space-y-2 rounded-lg bg-gray-50 p-4">
          {grades?.map((grade, index) => {
            return (
              <div className="space-y-2 rounded-lg bg-gray-50 p-4" key={index}>
                <div className="flex items-center justify-between py-2">
                  <Typography variant="title3">평가등급 {index + 1}</Typography>
                  <ColorSVGIcon.Close
                    className="cursor-pointer"
                    color="gray700"
                    size={32}
                    onClick={() =>
                      setGrades((grades) => {
                        const newGrades = structuredClone(grades)
                        newGrades.splice(index, 1)
                        return newGrades
                      })
                    }
                  />
                </div>
                <div className="flex w-full space-x-4">
                  <EvalInputField
                    label="등급명"
                    value={grade.name}
                    className="w-2/3"
                    onChange={(e) => updateGrades(index, { name: e.target.value })}
                  />
                  <EvalInputField.Score
                    label="점수범위"
                    minScoreProps={{
                      value: Number(grade.minScore).toString(),
                      max: 99,
                      onChange: (e) => updateGrades(index, { minScore: Number(e.target.value) }),
                    }}
                    maxScoreProps={{
                      value: Number(grade.maxScore).toString(),
                      max: 99,
                      onChange: (e) => updateGrades(index, { maxScore: Number(e.target.value) }),
                    }}
                    className="w-1/3"
                  />
                </div>
                <TextareaV2
                  className="h-40 bg-white"
                  placeholder="세부 평가 지표를 입력하세요."
                  value={grade.description}
                  onChange={(e) => updateGrades(index, { description: e.target.value })}
                />
              </div>
            )
          })}
          <div className="flex w-full justify-center py-2">
            <ButtonV2
              variant="outline"
              size={40}
              color="gray400"
              className="flex items-center justify-center gap-1"
              onClick={(e) => {
                e.stopPropagation()
                setGrades(grades.concat({ name: '', maxScore: 0, minScore: 0, description: '' }))
              }}
            >
              <SVGIcon.Plus color="gray700" size={16} weight="bold" />
              등급 추가하기
            </ButtonV2>
          </div>
        </div>
      </PopupModal>
      {isOpen && (
        <AlertV2 confirmText="확인" message={`평가기준이 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
      )}
    </>
  )
}
