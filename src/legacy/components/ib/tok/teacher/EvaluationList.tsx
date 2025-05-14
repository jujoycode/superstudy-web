import { omit } from 'lodash'
import { FC, useEffect, useState } from 'react'
import NODATA from '@/assets/images/no-data.png'
import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useTokEvaluationCreate } from '@/legacy/container/ib-evaluation'
import { useTKPPFGetByIBId } from '@/legacy/container/ib-tok-essay'
import {
  ResponseIBDtoStatus,
  ResponseTokEvaluationInitialDataDto,
  ResponseTokEvaluationSummaryDto,
} from '@/legacy/generated/model'
import { useUserStore } from '@/stores2/user'
import Evaluation from './Evaluation'

interface EvaluationListProps {
  evaluationData?: ResponseTokEvaluationInitialDataDto
  ibId: number
  ibStatus?: ResponseIBDtoStatus
  type: 'essay' | 'exhibition'
  disabled?: boolean
  finalDisabled?: boolean
}

export interface EvaluationData {
  id: number
  score: number
  comment: string
  isFinal: boolean
  hasError?: boolean
}

export const EvaluationList: FC<EvaluationListProps> = ({
  evaluationData,
  ibId,
  ibStatus,
  type,
  disabled = false,
  finalDisabled = false,
}) => {
  const { me } = useUserStore()
  const [hasError, setHasError] = useState<boolean>(false)

  const myData = evaluationData?.evaluations.find(
    (evaluation) => !evaluation.isFinal && evaluation.evaluator.id === me?.id,
  )

  const { data: tkppf } = useTKPPFGetByIBId(ibId, {
    enabled: type === 'essay',
  })

  const isTKPPFInfoComplete = tkppf?.academicIntegrityConsent

  const getPlaceholder = () => {
    if (ibStatus === 'COMPLETE') {
      return ''
    }

    if (type === 'essay') {
      if (ibStatus !== 'WAIT_COMPLETE') {
        return '학생이 활동 종료를 요청하면, 선생님이 TKPPF 지도 의견 작성 후 에세이 평가가 가능합니다'
      }

      return isTKPPFInfoComplete
        ? '평가 사유를 입력하세요'
        : '학생이 활동 종료를 요청하면, 선생님이 TKPPF 지도 의견 작성 후 에세이 평가가 가능합니다'
    }

    if (type === 'exhibition') {
      return ibStatus === 'WAIT_COMPLETE'
        ? '평가 사유를 입력하세요'
        : '학생이 활동 종료를 요청하면, 전시회 평가가 가능합니다'
    }
  }

  const getDisabled = () => {
    // TODO: TOK 선생님이 아닌 경우 평가 비활성화
    if (disabled) {
      return true
    }

    if (ibStatus !== 'WAIT_COMPLETE') {
      return true
    }

    if (type === 'essay') {
      return !isTKPPFInfoComplete
    }

    return false
  }

  const [myEvaluation, setMyEvaluation] = useState<ResponseTokEvaluationSummaryDto>(
    myData ||
      ({
        evaluator: { id: me?.id, name: me?.name },
        id: 0,
        score: 0,
        comment: '',
        createdAt: '',
        updatedAt: '',
        isFinal: false,
      } as ResponseTokEvaluationSummaryDto),
  )

  const finalData = evaluationData?.evaluations.find((evaluation) => evaluation.isFinal)

  const [finalEvaluation, setFinalEvaluation] = useState<ResponseTokEvaluationSummaryDto>(
    finalData ||
      ({
        evaluator: { id: me?.id, name: me?.name },
        id: 0,
        score: 0,
        comment: '',
        createdAt: '',
        updatedAt: '',
        isFinal: true,
      } as ResponseTokEvaluationSummaryDto),
  )
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  // 최종 평가, 현재 로그인한 선생님 평가 제외
  const evaluations =
    evaluationData?.evaluations.filter((evaluation) => !evaluation.isFinal && evaluation.evaluator.id !== me?.id) || []

  // 평가 내용 저장 state (id는 평가자 id)
  const [data, setData] = useState<EvaluationData>({ id: 0, score: 0, comment: '', isFinal: false })

  const [isResetting, setIsResetting] = useState(false)

  const handleDataChange = ({ id, score, comment, isFinal, hasError }: EvaluationData) => {
    if (isResetting) return // 리셋 중에는 데이터 변경 무시

    const prevIsFinal = data.isFinal

    // 평가 타입이 변경된 경우
    if (prevIsFinal !== isFinal) {
      setIsResetting(true) // 리셋 시작

      if (isFinal) {
        setMyEvaluation(
          myData ||
            ({
              evaluator: { id: me?.id, name: me?.name },
              id: 0,
              score: 0,
              comment: '',
              createdAt: '',
              updatedAt: '',
              isFinal: false,
            } as ResponseTokEvaluationSummaryDto),
        )
        // 최종 평가의 현재 입력값 설정
        setFinalEvaluation((prev) => ({
          ...prev,
          score,
          comment,
        }))
      } else {
        setFinalEvaluation(
          finalData ||
            ({
              evaluator: { id: me?.id, name: me?.name },
              id: 0,
              score: 0,
              comment: '',
              createdAt: '',
              updatedAt: '',
              isFinal: true,
            } as ResponseTokEvaluationSummaryDto),
        )
        // 내 평가의 현재 입력값 설정
        setMyEvaluation((prev) => ({
          ...prev,
          score,
          comment,
        }))
      }

      // 리셋 완료 후 상태 업데이트
      setTimeout(() => {
        setData({ id, score, comment, isFinal })
        setHasError(hasError || false)
        setIsResetting(false) // 리셋 종료
      }, 0)
      return
    }

    // 일반적인 데이터 업데이트
    if (isFinal) {
      setFinalEvaluation((prev) => ({ ...prev, score, comment }))
    } else {
      setMyEvaluation((prev) => ({ ...prev, score, comment }))
    }
    setData({ id, score, comment, isFinal })
    setHasError(hasError || false)
  }

  // 객체의 내용을 비교하는 함수
  const isEvaluationChanged = (
    prev: ResponseTokEvaluationSummaryDto | undefined,
    current: ResponseTokEvaluationSummaryDto,
  ) => {
    if (!prev) return true
    return prev.score !== current.score || prev.comment !== current.comment
  }

  // 평가 저장 버튼 활성화 여부 확인 로직 수정
  const hasMyEvaluationChanges = isEvaluationChanged(myData, myEvaluation) && Boolean(myEvaluation?.score)
  const hasFinalEvaluationChanges = isEvaluationChanged(finalData, finalEvaluation) && Boolean(finalEvaluation?.score)
  const hasValidChanges = hasMyEvaluationChanges || hasFinalEvaluationChanges

  const isSaveEnabled = hasValidChanges && !hasError

  // 평가 저장 api 호출
  const { createTokEvaluation, isLoading: isCreatingTokEvaluation } = useTokEvaluationCreate({
    onSuccess: () => {
      setAlertMessage(`평가를\n저장하였습니다`)
    },
    onError: (error) => {
      console.error('평가 저장 중 오류 발생:', error)
    },
  })

  // 평가 타입 변경 감지 및 리셋 처리
  useEffect(() => {
    const currentIsFinal = data.isFinal

    if (currentIsFinal) {
      // 최종 평가로 전환 시 내 평가 초기화
      setMyEvaluation(
        myData ||
          ({
            evaluator: { id: me?.id, name: me?.name },
            id: 0,
            score: 0,
            comment: '',
            createdAt: '',
            updatedAt: '',
            isFinal: false,
          } as ResponseTokEvaluationSummaryDto),
      )
    } else {
      // 내 평가로 전환 시 최종 평가 초기화
      setFinalEvaluation(
        finalData ||
          ({
            evaluator: { id: me?.id, name: me?.name },
            id: 0,
            score: 0,
            comment: '',
            createdAt: '',
            updatedAt: '',
            isFinal: true,
          } as ResponseTokEvaluationSummaryDto),
      )
    }
  }, [data.isFinal])

  if (!me) {
    return <Blank />
  }

  return (
    <div className="flex h-full w-full flex-col justify-between">
      {evaluationData ? (
        <>
          <div className="scroll-box flex max-h-[544px] flex-col gap-3 overflow-y-scroll">
            {/* 최종 평가 점수 */}
            <Evaluation
              accordionTitle="최종 평가 점수"
              evaluationData={finalEvaluation}
              isFinal
              onChange={handleDataChange}
              score={finalEvaluation?.score}
              evaluationComment={finalEvaluation?.comment}
              criteria={evaluationData.criteria}
              disabled={getDisabled() || finalDisabled}
              placeholder={getPlaceholder()}
            />

            {/* 선생님 평가 점수 */}
            <div className="border-primary-gray-200 rounded-lg border">
              <div className="[&>*]:border-primary-gray-200 [&>*:not(:last-child)]:border-b">
                <Evaluation
                  accordionTitle={me.name}
                  evaluationData={myEvaluation}
                  onChange={handleDataChange}
                  score={myEvaluation?.score}
                  evaluationComment={myEvaluation?.comment}
                  criteria={evaluationData.criteria}
                  disabled={getDisabled()}
                  placeholder={getPlaceholder()}
                />
                {evaluations.map((evaluation) => (
                  <Evaluation
                    key={evaluation.id}
                    accordionTitle={evaluation.evaluator.name}
                    evaluationData={evaluation}
                    score={evaluation.score}
                    disabled
                    evaluationComment={evaluation.comment}
                    criteria={evaluationData.criteria}
                  />
                ))}
              </div>
            </div>
          </div>
          {!getDisabled() && (
            <ButtonV2
              size={40}
              color="orange100"
              variant="solid"
              className="mr-0 ml-auto w-[80px]"
              disabled={!isSaveEnabled}
              onClick={() => {
                if (isCreatingTokEvaluation) return
                createTokEvaluation({
                  ibId,
                  criteriaId: evaluationData?.criteria.id,
                  data: omit(data, 'id'),
                })
              }}
            >
              저장
            </ButtonV2>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="h-12 w-12 px-[2.50px]">
            <img src={NODATA} className="h-12 w-[43px] object-cover" />
          </div>
          <Typography variant="body2" className="text-center">
            코디네이터 선생님께서
            <br />
            아직 평가 기준을 입력하지 않으셨습니다
          </Typography>
        </div>
      )}

      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
