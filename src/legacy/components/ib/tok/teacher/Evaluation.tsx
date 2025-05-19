import clsx from 'clsx'
import { useEffect, useState } from 'react'
import AccordionV2 from '@/legacy/components/common/AccordionV2'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import Stepper from '@/legacy/components/common/Stepper'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { TooltipV2 } from '@/legacy/components/common/TooltipV2'
import { ResponseTokEvaluationCriteriaDto, ResponseTokEvaluationSummaryDto } from '@/legacy/generated/model'
import { useUserStore } from '@/stores/user'

import { EvaluationData } from './EvaluationList'

interface EvaluationProps {
  accordionTitle: string
  evaluationData: ResponseTokEvaluationSummaryDto
  isFinal?: boolean
  score?: number
  disabled?: boolean
  onChange?: (data: EvaluationData) => void
  evaluationComment?: string
  criteria?: ResponseTokEvaluationCriteriaDto
  placeholder?: string
}

export default function Evaluation({
  accordionTitle,
  evaluationData,
  isFinal = false,
  score,
  disabled = false,
  onChange,
  evaluationComment,
  criteria = {} as ResponseTokEvaluationCriteriaDto,
  placeholder,
}: EvaluationProps) {
  const { me } = useUserStore()

  const [accordionIsOpen, setAccordionIsOpen] = useState<boolean>(false)
  const [gradeScores, setGradeScores] = useState<Record<number, number>>({})
  const [isError, setIsError] = useState<boolean>(false)
  const grades = criteria.grades || []
  const [comment, setComment] = useState<string>(evaluationComment || '')

  // 에러 체크
  const hasError = (gradeScores: Record<number, number>) =>
    grades.some((grade) => {
      const gradeScore = gradeScores[grade.id]
      return gradeScore ? gradeScore < grade.minScore || gradeScore > grade.maxScore : false
    })

  const handleScoreChange = (gradeId: number, score: number) => {
    if (!onChange) return

    // gradeScores만 업데이트
    const newGradeScores = {
      [gradeId]: score,
    }
    setGradeScores(newGradeScores)

    // 다른 grade 선택 시 이전 선택 초기화
    Object.keys(newGradeScores).forEach((key) => {
      if (Number(key) !== gradeId) {
        delete newGradeScores[Number(key)]
      }
    })

    setGradeScores(newGradeScores)
    setIsError(hasError(newGradeScores))
  }

  // gradeScores, comment, isError 변경 시 onChange 호출
  useEffect(() => {
    if (!onChange || disabled) return

    const currentScore = Object.values(gradeScores)[0]
    if (currentScore !== undefined) {
      setIsError(hasError(gradeScores))

      onChange({
        id: evaluationData.evaluator.id,
        score: currentScore,
        comment,
        isFinal,
        hasError: isError,
      })
    }
  }, [gradeScores, comment, isError])

  useEffect(() => {
    // 점수가 있으면 해당 점수에 맞는 grade를 찾아서 설정
    if (score) {
      const selectedGrade = grades.find((grade) => score >= grade.minScore && score <= grade.maxScore)
      if (selectedGrade) {
        setGradeScores({
          [selectedGrade.id]: score,
        })
      }
    }

    if (!score) {
      setGradeScores({})
      setComment('')
    }
  }, [score])

  useEffect(() => {
    setComment(evaluationComment || '')
  }, [evaluationComment])

  return (
    <div className="flex flex-col gap-3">
      <div
        className={clsx(
          'flex items-center justify-between gap-1 rounded-lg',
          isFinal ? 'bg-primary-50' : 'bg-white',
          accordionIsOpen ? 'pt-3' : 'py-3',
        )}
      >
        <div className="flex w-full items-center gap-1">
          <AccordionV2
            title={accordionTitle}
            rightText={
              isError
                ? '미입력'
                : Object.values(gradeScores).length > 0
                  ? `${Object.values(gradeScores)[0]}점`
                  : '미입력'
            }
            className="w-full py-0"
            parentClassName="px-4"
            arrowColor={isFinal ? 'orange800' : 'gray400'}
            rightTextClassName="text-primary-800"
            setAccordionIsOpen={setAccordionIsOpen}
            typographyVariant="title3"
            typographyClassName={clsx('font-medium', disabled ? 'text-primary-gray-500' : 'text-primary-gray-900')}
          >
            <div className={clsx('mt-4 p-4', { 'bg-primary-gray-50': !isFinal, 'border-t': !isFinal })}>
              <RadioV2.Group onChange={(value: number) => handleScoreChange(value, 0)} className="flex flex-col gap-2">
                {grades.map((grade) => (
                  <div className="flex items-center justify-between" key={grade.id}>
                    <div className="flex items-center justify-center gap-[6px]">
                      <RadioV2.Basic
                        size={20}
                        name={`${isFinal ? 'isFinal' : 'isNotFinal'}-${evaluationData?.evaluator?.id ?? me?.id ?? 0}-${
                          grade.id
                        }`}
                        value={grade.id}
                        checked={gradeScores[grade.id] !== undefined}
                        onChange={() => handleScoreChange(grade.id, grade.minScore)}
                        disabled={disabled}
                        className={clsx({ 'cursor-not-allowed': disabled })}
                        label={`${grade.name} (${grade.minScore}~${grade.maxScore})`}
                        labelClassName="text-primary-gray-900 ml-[6px]"
                      />
                      {grade.description && <TooltipV2 content={grade.description} />}
                    </div>
                    <Stepper
                      disabled={disabled || !score || !gradeScores[grade.id]}
                      number={gradeScores[grade.id] ?? grade.minScore}
                      setNumber={(value) => handleScoreChange(grade.id, value)}
                      range={{ min: grade.minScore, max: grade.maxScore }}
                    />
                  </div>
                ))}
              </RadioV2.Group>
              <TextareaV2
                className="mt-4 h-24 w-full resize-none rounded-lg p-4"
                wrapperClassName={clsx({ 'bg-white': !disabled && score })}
                placeholder={placeholder}
                onChange={(e) => {
                  setComment(e.target.value)
                }}
                value={comment}
                disabled={disabled || !score}
              />
            </div>
          </AccordionV2>
        </div>
      </div>
    </div>
  )
}
