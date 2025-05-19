import { useEffect, useState } from 'react'

import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import EssayOverviewPanel from '@/legacy/components/ib/overview/EE/EssayOverviewPanel'
import {
  useIBEssayNotSubmittedNotification,
  useIBEssayStatus,
  useIBEssaySubmissionStatus,
} from '@/legacy/container/ib-overview'
import {
  EssayGetSubmissionStatusCountParams,
  EssayGetSubmissionStatusStatus,
  EssayUnsubmitNotificationType,
} from '@/legacy/generated/model'
import { handleBatchBlobDownload } from '@/legacy/hooks/useBatchDownload'
import { getUrlFromFile } from '@/legacy/util/file'

export default function EssayView({ grade, klass, ibType }: EssayGetSubmissionStatusCountParams) {
  const { push } = useHistory()

  const [status, setStatus] = useState<EssayGetSubmissionStatusStatus>(
    () => (sessionStorage.getItem('PROJECT_ESSAY_STATUS') as EssayGetSubmissionStatusStatus) || 'NOT_SUBMITTED',
  )
  const [isDownloading, setIsDownloading] = useState(false)

  const { data } = useIBEssayStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    ibType,
  })

  const { students = [] } = useIBEssaySubmissionStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    ibType,
    status,
  })

  const filePathArray = students.map((student) => student.essay?.filePath)

  // TODO: 파일명 응시코드로 수정 필요
  const finalSubmittedDownload = async () => {
    setIsDownloading(true)
    const pdfFiles = await Promise.all(
      filePathArray.map(async (filePath, index) => {
        const url = getUrlFromFile(filePath)
        const response = await fetch(url)
        const blob = await response.blob()

        return {
          blob,
          fileName: `EE_T${211 + index}_Essay.pdf`,
        }
      }),
    )

    await handleBatchBlobDownload(pdfFiles, '최종 EE 에세이')
    setIsDownloading(false)
  }

  const { mutate: notiMutate, isLoading: notiLoading } = useIBEssayNotSubmittedNotification({
    params: {
      type: EssayUnsubmitNotificationType.EE_ESSAY,
      grade,
      klass,
    },
    onError: (error) => {
      console.error('미제출자 알림 발송 실패:', error)
    },
  })

  useEffect(() => {
    sessionStorage.setItem('PROJECT_ESSAY_STATUS', status)
  }, [status])

  return (
    <div>
      {(isDownloading || notiLoading) && <Blank />}
      <Typography variant="title1" className="text-gray-900">
        에세이
      </Typography>
      <RadioV2.Group
        selectedValue={status}
        onChange={(value: EssayGetSubmissionStatusStatus) => setStatus(value)}
        className="mb-4 flex flex-row gap-4 py-6"
      >
        <RadioV2.Label
          title="미제출"
          currentNum={data?.notSubmitted || 0}
          TotalNum={data?.total || 0}
          value="NOT_SUBMITTED"
        />
        <RadioV2.Label
          title="진행중"
          currentNum={data?.inProgress || 0}
          TotalNum={data?.total || 0}
          value="SUBMITTED"
        />
        <RadioV2.Label title="평가" currentNum={data?.evaluating || 0} TotalNum={data?.total || 0} value="EVALUATING" />
        <RadioV2.Label title="완료" currentNum={data?.complete || 0} TotalNum={data?.total || 0} value="COMPLETE" />
      </RadioV2.Group>

      {status === 'NOT_SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-gray-900">
            에세이 미제출
          </Typography>
          <EssayOverviewPanel
            title="미제출"
            buttonText="미제출자 알림 보내기"
            buttonHandler={() => notiMutate()}
            data={students}
          />
        </div>
      )}
      {status === 'SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-gray-900">
            에세이 진행중
          </Typography>
          <EssayOverviewPanel
            title="진행중"
            goDetailPage={(studentId, essayId) => push(`/teacher/ib/ee/${studentId}/essay/${essayId}`)}
            data={students}
          />
        </div>
      )}
      {status === 'EVALUATING' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-gray-900">
            에세이 평가
          </Typography>
          <EssayOverviewPanel
            title="평가 전"
            goDetailPage={(studentId, essayId) =>
              push(`/teacher/ib/ee/${studentId}/essay/${essayId}`, { type: 'evaluation' })
            }
            data={students}
            type="NOT_EVALUATED"
          />
          <EssayOverviewPanel
            title="평가 후"
            goDetailPage={(studentId, essayId) =>
              push(`/teacher/ib/ee/${studentId}/essay/${essayId}`, { type: 'evaluation' })
            }
            data={students}
            type="EVALUATED"
          />
        </div>
      )}
      {status === 'COMPLETE' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-gray-900">
            에세이 완료
          </Typography>
          <EssayOverviewPanel
            title="완료"
            buttonText="최종 에세이 전체 다운로드"
            goDetailPage={(studentId, essayId) => push(`/teacher/ib/ee/${studentId}/essay/${essayId}`)}
            buttonHandler={() => finalSubmittedDownload()}
            data={students}
          />
        </div>
      )}
    </div>
  )
}
