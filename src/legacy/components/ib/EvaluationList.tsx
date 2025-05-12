import _ from 'lodash'
import { FC, useEffect, useState } from 'react'
import {
  useEEEvaluationEvaluationCheckByStudent,
  useEEEvaluationGetEEEvaluationByStudent,
} from '@/legacy/generated/endpoint'
import { ResponseEEEvaluationRelationByStudentDto } from '@/legacy/generated/model'
import { Blank } from '@/legacy/components/common'
import AccordionV2 from '@/legacy/components/common/AccordionV2'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { TooltipV2 } from '@/legacy/components/common/TooltipV2'
import { Typography } from '@/legacy/components/common/Typography'

interface EvaluationListProps {
  evaluationData?: ResponseEEEvaluationRelationByStudentDto
  studentId: number
  disabled?: boolean
  academicIntegrityConsent?: boolean
}

export const EvaluationList: FC<EvaluationListProps> = ({
  evaluationData,
  studentId,
  disabled,
  academicIntegrityConsent,
}) => {
  if (!evaluationData) return <></>

  const { data } = useEEEvaluationGetEEEvaluationByStudent(studentId, {
    location: 'ESSAY',
  })

  const { mutate: evaluateStudent, isLoading } = useEEEvaluationEvaluationCheckByStudent()

  const [memo, setMemo] = useState<string>('')
  const [isModified, setIsModified] = useState<boolean>(false)
  const criterias = evaluationData?.criterias || []
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  // 평가 아코디언 기준 뱃지를 만들기 위한 알파벳 배열 생성
  const alphabetArray = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

  const [selectedLevelItemIds, setSelectedLevelItemIds] = useState<number[]>([])

  useEffect(() => {
    if (data) {
      setMemo(data.comment.comment)
      const ids = _.chain(data.criterias || [])
        .flatMap((el) => el.levels)
        .flatMap((el) => el?.items)
        .filter((el) => !!el?.check)
        .map((el) => el?.id || 0)
        .value()
      setSelectedLevelItemIds(ids)
    }
  }, [data])

  const maxScore = criterias.reduce((prev, cur) => prev + cur.score, 0)

  // 현재 점수를 계산하는 함수
  const calculateScore = (): {
    totalScore: number
    criteriaScores: { [criteriaId: number]: number }
  } => {
    if (!criterias.length) {
      return { totalScore: 0, criteriaScores: {} }
    }

    let totalScore = 0
    const criteriaScores: { [criteriaId: number]: number } = {}

    criterias.forEach((criteria) => {
      if (!criteria.levels) {
        criteriaScores[criteria.id] = 0 // Default to 0 if no levels
        return
      }

      // Find level for this criteria that have selected items
      const selectedLevel = criteria.levels.filter((level) =>
        level.items?.some((item) => selectedLevelItemIds.includes(item.id)),
      )[0]

      if (!selectedLevel) {
        criteriaScores[criteria.id] = 0 // Default to 0 if no levels are selected
        return
      }

      const selectedLevelItems = selectedLevel.items?.filter((item) => selectedLevelItemIds.includes(item.id)) || []

      // Calculate the score for this criteria
      const score = Math.min(
        selectedLevel.minScore + selectedLevelItems.length - 1, // Increment score for each selected level
        selectedLevel.maxScore, // Cap at maxScore for the level
      )

      criteriaScores[criteria.id] = score
      totalScore += score
    })

    return { totalScore, criteriaScores }
  }

  // 평가기준을 선택하는 함수
  const selectItemId = (itemId: number) => {
    if (selectedLevelItemIds.includes(itemId)) {
      setSelectedLevelItemIds(selectedLevelItemIds.filter((el) => el !== itemId))
      setIsModified(true)
      return
    }

    // Find the level containing the current itemId
    const currentCriteria = criterias.find((criteria) =>
      criteria.levels?.some((level) => level.items?.some((item) => itemId === item.id)),
    )

    const currentLevel = criterias
      .flatMap((criteria) => criteria.levels || [])
      .find((level) => level.items?.some((item) => item.id === itemId))

    if (!currentLevel || !currentCriteria) {
      // If itemId does not belong to any level, just add it
      setSelectedLevelItemIds([...selectedLevelItemIds, itemId])
      setIsModified(true)
      return
    }
    const currentCriteriaId = currentCriteria.id
    const currentLevelId = currentLevel.id

    const currentLevelItemIds = selectedLevelItemIds.filter((itemId) => {
      const itemCriteriaId = criterias.find((criteria) =>
        criteria.levels?.some((level) => level.items?.some((item) => itemId === item.id)),
      )?.id

      if (itemCriteriaId !== currentCriteriaId) return true

      const itemLevelId = criterias
        .flatMap((criteria) => criteria.levels || [])
        .find((level) => level.items?.some((item) => itemId === item.id))?.id

      return itemLevelId === currentLevelId
    })

    setSelectedLevelItemIds([...currentLevelItemIds, itemId])
    setIsModified(true)
  }

  const { totalScore, criteriaScores } = calculateScore()

  // 평가 항목의 id와 name 정보
  const evaluationItems = data?.criterias
    ?.map((criteria) => criteria.levels?.map((level) => level.items))
    .flat(2)
    .map((item) => ({
      id: item?.id,
      name: item?.name,
    }))

  // 선택한 평가 항목의 이름을 항목 id 순서대로 memo에 저장
  useEffect(() => {
    const selectItemInform = selectedLevelItemIds
      .sort((a, b) => a - b)
      .map((id) => evaluationItems?.find((item) => item.id === id))
    setMemo(selectItemInform.map((item) => item?.name).join(' '))
  }, [selectedLevelItemIds, evaluationItems])

  return (
    <>
      {isLoading && <Blank />}
      <div className="flex flex-col gap-3">
        <div className="bg-primary-orange-50 flex items-center justify-between gap-1 rounded-lg px-4 py-3">
          <div className="flex items-center gap-1">
            <Typography variant="title3" className="font-medium">
              채점 점수
            </Typography>
            <Typography variant="caption">
              {/* TODO: 각 기준별 score의 만점 총합 계산 필요 */}
              (만점 {maxScore}점)
            </Typography>
          </div>
          <Typography variant="title3" className="text-primary-orange-800 max-w-[206px] text-right">
            {/* TODO: 각 기준별 채점한 score의 총합 계산 필요*/}
            {totalScore}점
          </Typography>
        </div>
        <div className="scroll-box border-primary-gray-200 max-h-[456px] overflow-y-scroll rounded-lg border">
          {criterias.map((criteria, index) => (
            <AccordionV2
              key={criteria.id}
              tagText={`기준 ${alphabetArray[index]}`}
              title={criteria.area}
              // TODO: 채점이 하나라도 되어 있으면 점수 계산해서 보여줘야 함
              rightText={criteriaScores[criteria.id] ? criteriaScores[criteria.id] + '점' : '채점 전'}
              className="border-b-primary-gray-200 [&:not(:last-child)]:border-b"
              arrowColor="gray400"
              parentClassName="p-4"
            >
              <div className="bg-primary-gray-50">
                {criteria.levels?.map((level) => (
                  <div
                    key={level.id}
                    className="border-primary-gray-200 bg-primary-gray-50 flex flex-col gap-2 border-t px-4 pb-2 first:pt-4 last:pb-4 [&:not(:first-child)]:pt-2"
                  >
                    <div className="flex flex-row items-center justify-between">
                      <Typography variant="caption" className="text-primary-gray-500">
                        {level.name} ({level.minScore}~{level.maxScore})
                      </Typography>
                      {level.description && <TooltipV2 content={level.description} />}
                    </div>
                    <div key={level.id} className="flex flex-col gap-2">
                      {level.items?.map((item) => (
                        <Check.BoxNB
                          size={20}
                          key={item.id}
                          label={item.name}
                          checked={selectedLevelItemIds.includes(item.id)}
                          onChange={() => selectItemId(item.id)}
                          disabled={disabled || !academicIntegrityConsent}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionV2>
          ))}
        </div>
      </div>
      <TextareaV2
        className="h-24 w-full resize-none rounded-lg p-4"
        placeholder={
          academicIntegrityConsent
            ? '채점 후 자동으로 입력됩니다.'
            : '학생이 활동 종료를 요청하면, 선생님이 RPPF 지도의견 작성 후 에세이 평가가 가능합니다'
        }
        disabled
        onChange={(e) => {
          setMemo(e.target.value)
          setIsModified(true)
        }}
        value={memo}
      />
      {!disabled && academicIntegrityConsent && (
        <ButtonV2
          size={40}
          color="orange100"
          variant="solid"
          className="mr-0 ml-auto w-[80px]"
          disabled={!isModified || memo.length === 0}
          onClick={() => {
            evaluateStudent({
              eeEvaluationId: evaluationData.id,
              studentId,
              data: {
                location: 'ESSAY',
                comment: memo,
                checkedIds: selectedLevelItemIds,
              },
            })
            setAlertMessage(`평가를\n저장하였습니다`)
            setIsModified(false)
          }}
        >
          저장
        </ButtonV2>
      )}
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </>
  )
}
