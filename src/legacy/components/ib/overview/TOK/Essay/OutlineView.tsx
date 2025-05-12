import { useEffect, useState } from 'react'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import {
  useIBTOKOutlineNotSubmittedNotification,
  useIBTOKOutlineStatusCount,
  useIBTOKOutlineSubmissionStatus,
} from '@/legacy/container/ib-overview'
import {
  IBGetTokOutlineSubmissionStatusCountParams,
  IBGetTokOutlineSubmissionStatusStatus,
  ResponseIBTokOutlineSubmissionStatusDto,
  ResponseIBTokOutlineSubmissionStatusDtoDetailStatus,
} from '@/legacy/generated/model'
import { useHistory } from '@/hooks/useHistory'
import OutlineOverviewPanel from './OutlineOverviewPanel'
import { handleBatchBlobDownload } from '@/legacy/hooks/useBatchDownload'
import { createTokOutlinePdf } from '@/legacy/util/ib/tok-outline-pdf'
import { Blank } from '@/legacy/components/common/Blank'

export default function OutlineView({ grade, klass }: IBGetTokOutlineSubmissionStatusCountParams) {
  const { push } = useHistory()

  const [status, setStatus] = useState<IBGetTokOutlineSubmissionStatusStatus>(
    () =>
      (sessionStorage.getItem('PROJECT_TOK_OUTLINE_STATUS') as IBGetTokOutlineSubmissionStatusStatus) ||
      'NOT_SUBMITTED',
  )
  const [isDownloading, setIsDownloading] = useState(false)

  const { data } = useIBTOKOutlineStatusCount({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
  })

  const { students = [] } = useIBTOKOutlineSubmissionStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    status,
  })

  const submitStudents = (students as ResponseIBTokOutlineSubmissionStatusDto[]).filter(
    (student) => student.detailStatus === ResponseIBTokOutlineSubmissionStatusDtoDetailStatus.SUBMIT,
  )

  const handleBulkDownload = async () => {
    setIsDownloading(true)
    const pdfFiles: { blob: Blob; fileName: string }[] = []

    try {
      await Promise.all(
        submitStudents.map(async (student) => {
          const klassNum = `${student.leader.studentGroup.group.grade}${String(student.leader.studentGroup.group.klass).padStart(2, '0')}${String(student.leader.studentGroup.studentNumber).padStart(2, '0')}`

          const doc = await createTokOutlinePdf(
            {
              klassNum,
              name: student.leader.name,
            },
            student.tokOutline,
          )

          if (!doc) {
            console.error(`PDF 생성 실패: 학생 ID ${student.id}`)
            return
          }

          pdfFiles.push({
            blob: new Blob([doc]),
            fileName: `TOK_아웃라인_${klassNum}_${student.leader.name}_${student.tokOutline?.themeQuestion}.pdf`,
          })
        }),
      )

      await handleBatchBlobDownload(pdfFiles, 'TOK 아웃라인')
    } catch (error) {
      console.error('PDF 일괄 다운로드 실패:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const { mutate: notiMutate, isLoading: notiLoading } = useIBTOKOutlineNotSubmittedNotification({
    params: {
      grade,
      klass,
    },
    onError: (error) => {
      console.error('미제출자 알림 발송 실패:', error)
    },
  })

  useEffect(() => {
    sessionStorage.setItem('PROJECT_TOK_OUTLINE_STATUS', status)
  }, [status])

  return (
    <div>
      {(isDownloading || notiLoading) && <Blank />}
      <RadioV2.Group
        selectedValue={status}
        onChange={(value: IBGetTokOutlineSubmissionStatusStatus) => setStatus(value)}
        className="mb-4 flex flex-row gap-4 py-6"
      >
        <RadioV2.Label
          title="미제출"
          currentNum={data?.notSubmitted || 0}
          TotalNum={data?.total || 0}
          value="NOT_SUBMITTED"
        />
        <RadioV2.Label
          title="승인 전"
          currentNum={data?.submitted || 0}
          TotalNum={data?.total || 0}
          value="SUBMITTED"
        />
        <RadioV2.Label
          title="승인 완료"
          currentNum={data?.approved || 0}
          TotalNum={data?.total || 0}
          value="APPROVED"
        />
      </RadioV2.Group>

      {status === 'NOT_SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            아웃라인 미제출
          </Typography>
          <OutlineOverviewPanel
            title="미제출"
            buttonText="미제출자 알림 보내기"
            buttonHandler={() => notiMutate()}
            data={students as ResponseIBTokOutlineSubmissionStatusDto[]}
          />
        </div>
      )}
      {status === 'SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            아웃라인 승인 전
          </Typography>
          <OutlineOverviewPanel
            title="제출"
            goDetailPage={(studentIbId, outlineId) =>
              push(`/teacher/ib/tok/outline/${studentIbId}/detail/${outlineId}`)
            }
            data={students as ResponseIBTokOutlineSubmissionStatusDto[]}
            type="SUBMITTED"
            buttonText="아웃라인 전체 다운로드"
            buttonHandler={handleBulkDownload}
          />
          <OutlineOverviewPanel
            title="보완 필요"
            goDetailPage={(studentIbId, outlineId) =>
              push(`/teacher/ib/tok/outline/${studentIbId}/detail/${outlineId}`)
            }
            data={students as ResponseIBTokOutlineSubmissionStatusDto[]}
            type="REJECT_PLAN"
          />
        </div>
      )}
      {status === 'APPROVED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            아웃라인 승인 완료
          </Typography>
          <OutlineOverviewPanel
            goDetailPage={(studentIbId, outlineId) =>
              push(`/teacher/ib/tok/outline/${studentIbId}/detail/${outlineId}`)
            }
            title="승인 완료"
            data={students as ResponseIBTokOutlineSubmissionStatusDto[]}
          />
        </div>
      )}
    </div>
  )
}
