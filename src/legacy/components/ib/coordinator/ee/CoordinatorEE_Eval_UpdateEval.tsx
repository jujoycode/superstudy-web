import clsx from 'clsx';
import { map } from 'lodash';
import { PropsWithChildren, useState } from 'react';
import { PopupModal } from 'src/components/PopupModal';
import { SuperModal } from 'src/components/SuperModal';
import { Blank } from 'src/components/common';
import { TextareaV2 } from 'src/components/common/TextareaV2';
import SVGIcon from 'src/components/icon/SVGIcon';
import { useUpdateEvaluation } from 'src/container/ib/update-evaluation';
import { useEEEvaluationUpsertAndDeleteEEEvaluation } from 'src/generated/endpoint';
import { ResponseEEEvaluationDto } from 'src/generated/model';
import { ButtonV2 } from '../../../common/ButtonV2';
import { Typography } from '../../../common/Typography';
import ColorSVGIcon from '../../../icon/ColorSVGIcon';
import { EvalInputField } from '../../EvalInputField';

interface CoordinatorEE_Eval_UpdateEvalProps {
  modalOpen: boolean;
  setModalClose: () => void;
  onSuccess: () => void;
  evaluationData?: ResponseEEEvaluationDto;
  ablePropragation?: boolean;
  viewType?: 'VIEW' | 'UPDATE';
}

export function CoordinatorEE_Eval_UpdateEval({
  modalOpen,
  setModalClose,
  onSuccess,
  evaluationData,
  ablePropragation = false,
  viewType = 'UPDATE',
}: PropsWithChildren<CoordinatorEE_Eval_UpdateEvalProps>) {
  // 평가 아코디언 기준 뱃지를 만들기 위한 알파벳 배열 생성
  const alphabetArray = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  const {
    state: {
      selectedCriteriaId,
      createCriterias,
      updateCriterias,
      deleteCriteriaIds,
      createLevels,
      updateLevels,
      deleteLevelIds,
      createItems,
      updateItems,
      deleteItemIds,
    },
    setState: { setSelectedCriteriaId },
    isLoading: evalLoading,
    checkCriteriaSelected,
    selectedCriteria,
    selectedCriteriaIndex,
    criterias,
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
  } = useUpdateEvaluation(evaluationData?.id || 0);

  const { mutate: updateEvaluation, isLoading: updateLoading } = useEEEvaluationUpsertAndDeleteEEEvaluation({
    mutation: {
      onSuccess: () => {
        onSuccess();
        reset();
      },
    },
  });

  const [isContinue, setContinue] = useState(false);

  if (modalOpen && !isContinue && viewType === 'UPDATE') {
    return (
      <SuperModal modalOpen={modalOpen} setModalClose={setModalClose} hasClose={false} className="w-[416px] rounded-xl">
        <div className="p-8 pb-5">
          <div className="w-full text-center text-lg font-semibold leading-[26px] text-primary-gray-900">
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
    );
  }

  const maxScore = selectedCriteria?.score === undefined ? 99 : selectedCriteria.score;

  const disabled = viewType === 'VIEW';

  const footerButtons = disabled ? (
    <ButtonV2
      variant="solid"
      color="gray100"
      size={48}
      onClick={() => {
        setModalClose();
        setContinue(false);
        reset();
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
          setModalClose();
          setContinue(false);
          reset();
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
          setContinue(false);
          evaluationData?.id &&
            updateEvaluation({
              id: evaluationData.id,
              data: {
                createCriterias,
                updateCriterias,
                deleteCriteriaIds,
                createLevels,
                updateLevels,
                deleteLevelIds,
                createItems,
                updateItems,
                deleteItemIds,
              },
            });
        }}
      >
        저장하기
      </ButtonV2>
    </div>
  );

  return (
    <>
      {updateLoading && <Blank />}
      <PopupModal
        modalOpen={modalOpen}
        setModalClose={() => {
          setModalClose();
          reset();
        }}
        title={evaluationData?.title || ''}
        footerButtons={footerButtons}
        size="large"
        bottomBorder={false}
      >
        <div className="flex items-start justify-between space-x-4 pb-4">
          {evalLoading && <div>평가기준 불러오는 중...</div>}
          <div className="flex w-full flex-row items-center gap-2 overflow-x-auto">
            {criterias?.map((criteria, index) => (
              <div
                key={String(criteria.id) + criteria.area + index}
                onClick={() =>
                  criteria.id ? setSelectedCriteriaId(criteria.id) : setSelectedCriteriaId(String(index))
                }
                className={clsx(
                  'flex cursor-pointer items-center justify-center whitespace-pre rounded-lg px-4 py-[9px]',
                  checkCriteriaSelected(criteria.id ? criteria : index)
                    ? 'bg-primary-gray-700 text-white'
                    : 'bg-primary-gray-50 text-primary-gray-700 hover:bg-primary-gray-200',
                )}
              >
                {`기준 ${alphabetArray[index]}`}
              </div>
            ))}
          </div>
          {!disabled && (
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
          )}
        </div>
        {selectedCriteria && (
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between py-2">
              <Typography variant="title2">{`기준 ${alphabetArray[selectedCriteriaIndex]}`}</Typography>
              {!disabled && (
                <ColorSVGIcon.Close
                  className="cursor-pointer"
                  color="gray700"
                  size={32}
                  onClick={handleDeleteCriteria}
                />
              )}
            </div>
            <div className="flex w-full space-x-4">
              <EvalInputField
                label="평가영역"
                disabled={disabled}
                value={selectedCriteria?.area}
                className="w-2/3"
                onChange={(e) => handleUpdateCriteria({ area: e.target.value })}
              />
              <EvalInputField
                label="영역점수"
                disabled={disabled}
                value={Number(selectedCriteria?.score).toString()}
                className="w-1/3"
                afterLabel="점"
                min={0}
                max={100}
                type="number"
                onChange={(e) => handleUpdateCriteria({ score: Number(e.target.value) })}
              />
            </div>
            <EvalInputField
              disabled={disabled}
              label="평가 주요요소"
              value={selectedCriteria?.factor}
              onChange={(e) => handleUpdateCriteria({ factor: e.target.value })}
            />
          </div>
        )}
        {selectedCriteria?.levels
          ?.concat(createLevels.filter((level) => level.criteriaId === selectedCriteriaId))
          .map((_level: any, index: number) => {
            const updateLevel = updateLevels?.find((ul) => ul.id === _level.id);
            const level = { ..._level, ...updateLevel };

            if (level.id && deleteLevelIds.includes(level.id)) return <></>;

            return (
              <div className="space-y-2 rounded-lg bg-gray-50 p-4" key={level.id || `new-${index}`}>
                <div className="flex items-center justify-between py-2">
                  <Typography variant="title3">평가등급 {index + 1}</Typography>
                  {!disabled && (
                    <ColorSVGIcon.Close
                      className="cursor-pointer"
                      color="gray700"
                      size={32}
                      onClick={() => handleDeleteLevel(index, level.id)}
                    />
                  )}
                </div>
                <div className="flex w-full space-x-4">
                  <EvalInputField
                    label="등급명"
                    value={level.name}
                    disabled={disabled}
                    className="w-2/3"
                    onChange={(e) => handleUpdateLevel({ id: level.id, name: e.target.value }, index)}
                  />
                  <EvalInputField.Score
                    label="점수범위"
                    disabled={disabled}
                    minScoreProps={{
                      value: Number(level.minScore).toString(),
                      onChange: (e) =>
                        Number(e.target.value) <= level.maxScore &&
                        handleUpdateLevel({ id: level.id, minScore: Number(e.target.value) }, index),
                    }}
                    maxScoreProps={{
                      value: Number(level.maxScore).toString(),
                      max: maxScore,
                      onChange: (e) =>
                        Number(e.target.value) <= maxScore &&
                        handleUpdateLevel({ id: level.id, maxScore: Number(e.target.value) }, index),
                    }}
                    className="w-1/3"
                  />
                </div>
                {level?.items
                  ?.concat(
                    createItems.filter(
                      (item) => map(selectedCriteria?.levels, 'id').includes(item.levelId) && item.levelId === level.id,
                    ),
                  )
                  .map((_item: any, itemIndex: number) => {
                    const updateItem = updateItems?.find((ul) => ul.id === _item.id);
                    const item = { ..._item, ...updateItem };

                    if (item.id && deleteItemIds.includes(item.id)) return <></>;

                    return (
                      <div className="flex items-center space-x-4" key={item.id || `new-${itemIndex}`}>
                        <EvalInputField
                          label={`평가항목 ${itemIndex + 1}`}
                          value={item.name}
                          onChange={(e) =>
                            handleUpdateItem({ id: item.id, name: e.target.value }, level.id, index, itemIndex)
                          }
                        />
                        {disabled &&
                          (itemIndex === 0 ? (
                            <ButtonV2
                              variant="outline"
                              size={40}
                              color="gray400"
                              onClick={() => handleCreateItem(index, level.id)}
                              className="flex items-center justify-center gap-1 whitespace-pre bg-white"
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
                                onClick={() => handleDeleteItem(index, itemIndex, level.id, item.id)}
                              />
                            </div>
                          ))}
                      </div>
                    );
                  })}
                <TextareaV2
                  value={level.description}
                  className="h-40 bg-white"
                  disabled={disabled}
                  placeholder="세부 평가 지표를 입력하세요."
                  onChange={(e) => handleUpdateLevel({ id: level.id, description: e.target.value }, index)}
                />
              </div>
            );
          })}
        {!disabled && (
          <div className="flex w-full justify-center py-2">
            <ButtonV2
              variant="outline"
              size={40}
              color="gray400"
              className="flex items-center justify-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateLevel();
              }}
            >
              <SVGIcon.Plus color="gray700" size={16} weight="bold" />
              등급 추가하기
            </ButtonV2>
          </div>
        )}
      </PopupModal>
    </>
  );
}
