import { useEffect, useState } from 'react'

import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import {
  useIBRppfNotSubmittedNotification,
  useIBRPPFStatus,
  useIBRPPFSubmissionStatus,
} from '@/legacy/container/ib-overview'
import { IBGetSubmissionStatusCountParams, RPPFGetSubmissionStatusStatus } from '@/legacy/generated/model'
import { handleBatchBlobDownload, BlobDownloadItem } from '@/legacy/hooks/useBatchDownload'
import { modifyRppfPdf } from '@/legacy/util/ib_rppf_pdf'

import RPPFOverviewPanel from './RPPFOverviewPanel'
import IBSubmitPdfPreviewPopup from '@/legacy/pages/ibSubmitPdfPreviewPopup'

export default function RPPFView({ grade, klass }: IBGetSubmissionStatusCountParams) {
  const { push } = useHistory()

  const [status, setStatus] = useState<RPPFGetSubmissionStatusStatus>(
    () => (sessionStorage.getItem('PROJECT_RPPF_STATUS') as RPPFGetSubmissionStatusStatus) || 'NOT_SUBMITTED',
  )
  const [previewPopup, setPreviewPopup] = useState<boolean>(false)
  const [pdfData, setPdfData] = useState<any>({})
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const { data } = useIBRPPFStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
  })

  const { students = [] } = useIBRPPFSubmissionStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    status,
  })

  const openPreviewPopup = (studentIbId: number) => {
    setPreviewPopup(true)
    const studentData = students.find((data) => data.id === studentIbId)
    setPdfData({ ...studentData?.rppf, ...studentData?.leader })
  }

  const pdfAllDownload = async () => {
    const pdfPath = '/EE-RPPF.pdf'
    const pdfFiles: BlobDownloadItem[] = []

    setIsDownloading(true)

    try {
      await Promise.all(
        students.map(async (student) => {
          const data = { ...student.rppf, ...student.leader }
          const pdfBlob = await modifyRppfPdf({ pdfPath, data })

          const klassNum = `${student.leader.studentGroup.group.grade}${String(student.leader.studentGroup.group.klass).padStart(2, '0')}${String(student.leader.studentGroup.studentNumber).padStart(2, '0')}`

          if (!pdfBlob) {
            console.error(`PDF 생성 실패: 학생 ID ${student.id}`)
            return
          }

          pdfFiles.push({
            blob: pdfBlob,
            fileName: `EE_RPPF_${klassNum}_${student.leader.name}.pdf`,
          })
        }),
      )

      await handleBatchBlobDownload(pdfFiles, '최종 EE RPPF')
    } catch (error) {
      console.error('PDF 일괄 다운로드 실패:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const { mutate: notiMutate, isLoading: notiLoading } = useIBRppfNotSubmittedNotification({
    params: {
      grade,
      klass,
    },
    onError: (error) => {
      console.error('미제출자 알림 발송 실패:', error)
    },
  })

  useEffect(() => {
    sessionStorage.setItem('PROJECT_RPPF_STATUS', status)
  }, [status])

  return (
    <div>
      {(isDownloading || notiLoading) && <Blank />}
      <Typography variant="title1" className="text-primary-gray-900">
        RPPF
      </Typography>
      <RadioV2.Group
        selectedValue={status}
        onChange={(value: RPPFGetSubmissionStatusStatus) => setStatus(value)}
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
          <Typography variant="title2" className="text-primary-gray-900">
            RPPF 미작성
          </Typography>
          <RPPFOverviewPanel
            title="미작성"
            buttonText="미작성자 알림 보내기"
            buttonHandler={() => notiMutate()}
            data={students}
          />
        </div>
      )}
      {status === 'IN_PROGRESS' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            RPPF 진행중
          </Typography>
          <RPPFOverviewPanel
            title="1차 완료"
            action={(studentIbId, rppfId) => push(`/teacher/ib/ee/${studentIbId}/rppf/${rppfId}`)}
            data={students}
            type="FIRST_DRAFT"
          />
          <RPPFOverviewPanel
            action={(studentIbId, rppfId) => push(`/teacher/ib/ee/${studentIbId}/rppf/${rppfId}`)}
            title="2차 완료"
            data={students}
            type="SECOND_DRAFT"
          />
          <RPPFOverviewPanel
            action={(studentIbId, rppfId) => push(`/teacher/ib/ee/${studentIbId}/rppf/${rppfId}`)}
            title="3차 완료"
            data={students}
            type="THIRD_DRAFT"
          />
        </div>
      )}
      {status === 'IB_TEACHER_FEEDBACK' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            지도의견
          </Typography>
          <RPPFOverviewPanel
            title="작성 전"
            data={students}
            action={(studentIbId, rppfId) => push(`/teacher/ib/ee/${studentIbId}/rppf/${rppfId}`)}
            type="IB_TEACHER_FEEDBACK_NOT_YET"
          />
          <RPPFOverviewPanel
            title="작성 후"
            data={students}
            action={openPreviewPopup}
            type="IB_TEACHER_FEEDBACK_COMPLETED"
          />
        </div>
      )}
      {status === 'COMPLETED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            RPPF 완료
          </Typography>
          <RPPFOverviewPanel
            title="완료"
            data={students}
            action={openPreviewPopup}
            type="COMPLETED"
            buttonText="최종 RPPF 전체 다운로드"
            buttonHandler={pdfAllDownload}
          />
        </div>
      )}

      {previewPopup && (
        <IBSubmitPdfPreviewPopup
          type="RPPF"
          modalOpen={previewPopup}
          setModalClose={() => setPreviewPopup(false)}
          data={pdfData}
          noButton={status === 'IB_TEACHER_FEEDBACK'}
        />
      )}
    </div>
  )
}
