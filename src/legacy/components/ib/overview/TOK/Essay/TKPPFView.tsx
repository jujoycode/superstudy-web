import { useEffect, useState } from 'react'

import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import IBSubmitPdfPreviewPopup from '@/legacy/components/ib/overview/IBSubmitPdfPreviewPopup'

import {
  useIBTOKPPFNotSubmittedNotification,
  useIBTOKPPFStatusCount,
  useIBTOKPPFSubmissionStatus,
} from '@/legacy/container/ib-overview'
import { TKPPFGetSubmissionStatusCountParams, TKPPFGetSubmissionStatusStatus } from '@/legacy/generated/model'
import { handleBatchBlobDownload } from '@/legacy/hooks/useBatchDownload'
import { BlobDownloadItem } from '@/legacy/hooks/useBatchDownload'
import { modifyTkppfPdf } from '@/legacy/util/ib_tkppf_pdf'

import TKPPFOverviewPanel from './TKPPFOverviewPanel'

export default function TKPPFView({ grade, klass }: TKPPFGetSubmissionStatusCountParams) {
  const { push } = useHistory()

  const [status, setStatus] = useState<TKPPFGetSubmissionStatusStatus>(
    () => (sessionStorage.getItem('PROJECT_TOK_TKPPF_STATUS') as TKPPFGetSubmissionStatusStatus) || 'NOT_SUBMITTED',
  )
  const [previewPopup, setPreviewPopup] = useState<boolean>(false)
  const [pdfData, setPdfData] = useState<any>({})
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const { data } = useIBTOKPPFStatusCount({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
  })

  const { students = [] } = useIBTOKPPFSubmissionStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    status,
  })

  const openPreviewPopup = (studentIbId: number) => {
    setPreviewPopup(true)
    const studentData = students.find((data) => data.id === studentIbId)
    setPdfData({ ...studentData?.tkppf, ...studentData?.leader })
  }

  const pdfAllDownload = async () => {
    const pdfPath = '/TKPPF_en.pdf'
    const pdfFiles: BlobDownloadItem[] = []

    setIsDownloading(true)

    try {
      await Promise.all(
        students.map(async (student) => {
          const data = { ...student.tkppf, ...student.leader }
          const pdfBlob = await modifyTkppfPdf({ pdfPath, data })

          const klassNum = `${student.leader.studentGroup.group.grade}${String(student.leader.studentGroup.group.klass).padStart(2, '0')}${String(student.leader.studentGroup.studentNumber).padStart(2, '0')}`

          if (!pdfBlob) {
            console.error(`PDF 생성 실패: 학생 ID ${student.id}`)
            return
          }

          pdfFiles.push({
            blob: pdfBlob,
            fileName: `TOK_TKPPF_${klassNum}_${student.leader.name}.pdf`,
          })
        }),
      )

      await handleBatchBlobDownload(pdfFiles, '최종 TOK TKPPF')
    } catch (error) {
      console.error('PDF 일괄 다운로드 실패:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const { mutate: notiMutate, isLoading: notiLoading } = useIBTOKPPFNotSubmittedNotification({
    params: {
      grade,
      klass,
    },
    onError: (error) => {
      console.error('미제출자 알림 발송 실패:', error)
    },
  })

  useEffect(() => {
    sessionStorage.setItem('PROJECT_TOK_TKPPF_STATUS', status)
  }, [status])

  return (
    <div>
      {(isDownloading || notiLoading) && <Blank />}
      <RadioV2.Group
        selectedValue={status}
        onChange={(value: TKPPFGetSubmissionStatusStatus) => setStatus(value)}
        className="mb-4 flex flex-row gap-4 py-6"
      >
        <RadioV2.Label
          title="미작성"
          currentNum={data?.notSubmitted || 0}
          TotalNum={data?.total || 0}
          value="NOT_SUBMITTED"
        />
        <RadioV2.Label
          title="진행중"
          currentNum={data?.inProgress || 0}
          TotalNum={data?.total || 0}
          value="IN_PROGRESS"
        />
        <RadioV2.Label
          title="지도의견"
          currentNum={data?.ibTeacherFeedback || 0}
          TotalNum={data?.total || 0}
          value="IB_TEACHER_FEEDBACK"
        />
        <RadioV2.Label title="완료" currentNum={data?.completed || 0} TotalNum={data?.total || 0} value="COMPLETED" />
      </RadioV2.Group>

      {status === 'NOT_SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-gray-900">
            TKPPF 미작성
          </Typography>
          <TKPPFOverviewPanel
            title="미작성"
            buttonText="미작성자 알림 보내기"
            buttonHandler={() => notiMutate()}
            data={students}
          />
        </div>
      )}
      {status === 'IN_PROGRESS' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-gray-900">
            TKPPF 진행중
          </Typography>
          <TKPPFOverviewPanel
            title="1차 완료"
            action={(studentIbId, tkppfId) => push(`/teacher/ib/tok/tkppf/${studentIbId}/detail/${tkppfId}`)}
            data={students}
            type="FIRST_DRAFT"
          />
          <TKPPFOverviewPanel
            action={(studentIbId, tkppfId) => push(`/teacher/ib/tok/tkppf/${studentIbId}/detail/${tkppfId}`)}
            title="2차 완료"
            data={students}
            type="SECOND_DRAFT"
          />
          <TKPPFOverviewPanel
            action={(studentIbId, tkppfId) => push(`/teacher/ib/tok/tkppf/${studentIbId}/detail/${tkppfId}`)}
            title="3차 완료"
            data={students}
            type="THIRD_DRAFT"
          />
        </div>
      )}
      {status === 'IB_TEACHER_FEEDBACK' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-gray-900">
            TKPPF 지도의견
          </Typography>
          <TKPPFOverviewPanel
            title="작성 전"
            data={students}
            action={(studentIbId, tkppfId) => push(`/teacher/ib/tok/tkppf/${studentIbId}/detail/${tkppfId}`)}
            type="IB_TEACHER_FEEDBACK_NOT_YET"
          />
          <TKPPFOverviewPanel
            title="작성 후"
            data={students}
            action={openPreviewPopup}
            type="IB_TEACHER_FEEDBACK_COMPLETED"
          />
        </div>
      )}
      {status === 'COMPLETED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-gray-900">
            TKPPF 완료
          </Typography>
          <TKPPFOverviewPanel
            title="완료"
            buttonText="최종 TKPPF 전체 다운로드"
            buttonHandler={pdfAllDownload}
            data={students}
            action={openPreviewPopup}
          />
        </div>
      )}

      {previewPopup && (
        <IBSubmitPdfPreviewPopup
          type="TKPPF"
          modalOpen={previewPopup}
          setModalClose={() => setPreviewPopup(false)}
          data={pdfData}
          noButton={status === 'IB_TEACHER_FEEDBACK'}
        />
      )}
    </div>
  )
}
