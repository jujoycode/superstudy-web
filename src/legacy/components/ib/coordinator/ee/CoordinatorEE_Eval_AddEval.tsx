import clsx from 'clsx'
import { PropsWithChildren } from 'react'
import { Blank } from '@/legacy/components/common'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useCreateEvaluation } from '@/legacy/container/ib/create-evaluation'
import { useEEEvaluationCreateEEEvaluation } from '@/legacy/generated/endpoint'
import { RequestEEEvaluationLevelByItemsDto } from '@/legacy/generated/model'
import { EvalInputField } from '../../EvalInputField'

interface CoordinatorEE_Eval_AddEvalProps {
  modalOpen: boolean
  setModalClose: () => void
  onSuccess: () => void
  ablePropragation?: boolean
}

export function CoordinatorEE_Eval_AddEval({
  modalOpen,
  setModalClose,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<CoordinatorEE_Eval_AddEvalProps>) {
  // 평가 아코디언 기준 뱃지를 만들기 위한 알파벳 배열 생성
  const alphabetArray = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

  const {
    evaluation,
    selectedCriteria,
    selectedCriteriaIndex,
    setSelectedCriteriaIndex,
    handleCreateCriteria,
    handleUpdateCriteria,
    handleDeleteCriteria,
    handleCreateLevel,
    handleUpdateLevel,
    handleDeleteLevel,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    reset,
  } = useCreateEvaluation()

  const { mutate: createEvaluation, isLoading: createLoading } = useEEEvaluationCreateEEEvaluation({
    mutation: {
      onSuccess: () => {
        onSuccess()
        reset()
      },
    },
  })

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
        onClick={() =>
          createEvaluation({
            data: evaluation,
          })
        }
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
        title="평가기준 작성"
        footerButtons={footerButtons}
        size="large"
        bottomBorder={false}
      >
        <div className="flex items-start justify-between space-x-4 pb-4">
          <div className="flex w-full flex-row items-center gap-2 overflow-x-auto">
            {evaluation.criterias?.map((criteria: any, index: number) => (
              <div
                key={JSON.stringify(criteria) + index}
                onClick={() => setSelectedCriteriaIndex(index)}
                className={clsx(
                  'flex cursor-pointer items-center justify-center rounded-lg px-4 py-[9px] whitespace-pre',
                  index === selectedCriteriaIndex
                    ? 'bg-primary-gray-700 text-white'
                    : 'bg-primary-gray-50 text-primary-gray-700 hover:bg-primary-gray-200',
                )}
              >
                {`기준 ${alphabetArray[index]}`}
              </div>
            ))}
          </div>
          <ButtonV2
            variant="outline"
            size={40}
            color="gray400"
            onClick={handleCreateCriteria}
            className="flex items-center justify-center gap-1 whitespace-pre"
          >
            <SVGIcon.Plus color="gray700" size={16} weight="bold" />
            추가
          </ButtonV2>
        </div>
        <div className="space-y-2 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between py-2">
            <Typography variant="title2">{`기준 ${alphabetArray[selectedCriteriaIndex]}`}</Typography>
            <ColorSVGIcon.Close className="cursor-pointer" color="gray700" size={32} onClick={handleDeleteCriteria} />
          </div>
          <div className="flex w-full space-x-4">
            <EvalInputField
              label="평가영역"
              value={selectedCriteria?.area}
              className="w-2/3"
              onChange={(e) => handleUpdateCriteria({ area: e.target.value })}
            />
            <EvalInputField
              label="영역점수"
              value={selectedCriteria?.score}
              className="w-1/3"
              afterLabel="점"
              min={0}
              type="number"
              onChange={(e) => handleUpdateCriteria({ score: Number(e.target.value) })}
            />
          </div>
          <EvalInputField
            label="평가 주요요소"
            value={selectedCriteria?.factor}
            onChange={(e) => handleUpdateCriteria({ factor: e.target.value })}
          />
        </div>
        {selectedCriteria?.levels?.map((level: RequestEEEvaluationLevelByItemsDto, levelIndex: number) => {
          return (
            <div className="space-y-2 rounded-lg bg-gray-50 p-4" key={`new-${levelIndex}`}>
              <div className="flex items-center justify-between py-2">
                <Typography variant="title3">평가등급 {levelIndex + 1}</Typography>
                <ColorSVGIcon.Close
                  className="cursor-pointer"
                  color="gray700"
                  size={32}
                  onClick={() => handleDeleteLevel(levelIndex)}
                />
              </div>
              <div className="flex w-full space-x-4">
                <EvalInputField
                  label="등급명"
                  value={level.name}
                  className="w-2/3"
                  onChange={(e) => handleUpdateLevel({ name: e.target.value }, levelIndex)}
                />
                <EvalInputField.Score
                  label="점수범위"
                  minScoreProps={{
                    value: Number(level.minScore),
                    onChange: (e) => handleUpdateLevel({ minScore: Number(e.target.value) }, levelIndex),
                  }}
                  maxScoreProps={{
                    value: Number(level.maxScore),
                    onChange: (e) => handleUpdateLevel({ maxScore: Number(e.target.value) }, levelIndex),
                  }}
                  className="w-1/3"
                />
              </div>
              {level.items?.map((item, itemIndex) => {
                return (
                  <div className="flex items-center space-x-4" key={`new-${itemIndex}`}>
                    <EvalInputField
                      label={`평가항목 ${itemIndex + 1}`}
                      value={item.name}
                      onChange={(e) => handleUpdateItem({ name: e.target.value }, levelIndex, itemIndex)}
                    />
                    {itemIndex === 0 ? (
                      <ButtonV2
                        variant="outline"
                        size={40}
                        color="gray400"
                        onClick={() => handleCreateItem(levelIndex)}
                        className="flex items-center justify-center gap-1 bg-white whitespace-pre"
                      >
                        <SVGIcon.Plus color="gray700" size={16} weight="bold" />
                        추가
                      </ButtonV2>
                    ) : (
                      <div className="w-16">
                        <ColorSVGIcon.Close
                          className="cursor-pointer"
                          color="gray700"
                          size={24}
                          onClick={() => handleDeleteItem(levelIndex, itemIndex)}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
              <TextareaV2
                className="h-40 bg-white"
                placeholder="세부 평가 지표를 입력하세요."
                onChange={(e) => handleUpdateLevel({ description: e.target.value }, levelIndex)}
              />
            </div>
          )
        })}
        <div className="flex w-full justify-center py-2">
          <ButtonV2
            variant="outline"
            size={40}
            color="gray400"
            onClick={(e) => {
              e.stopPropagation()
              handleCreateLevel()
            }}
            className="flex items-center justify-center gap-1"
          >
            <SVGIcon.Plus color="gray700" size={16} weight="bold" />
            등급 추가하기
          </ButtonV2>
        </div>
      </PopupModal>
    </>
  )
}
