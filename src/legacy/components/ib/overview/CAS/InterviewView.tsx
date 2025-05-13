import { useEffect, useState } from 'react'

import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common/Blank'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import {
  useIBInterviewNotSubmittedNotification,
  useIBInterviewStatus,
  useIBInterviewSubmissionStatus,
} from '@/legacy/container/ib-overview'
import {
  IBCasPortfolioGetSubmissionStatusByReflectionDiaryStatus,
  IBGetSubmissionStatusCountParams,
} from '@/legacy/generated/model'

import InterviewOverviewPanel from './InterviewOverviewPanel'

export default function InterviewView({ grade, klass }: IBGetSubmissionStatusCountParams) {
  const { push } = useHistory()

  const [status, setStatus] = useState<IBCasPortfolioGetSubmissionStatusByReflectionDiaryStatus>(
    () =>
      (sessionStorage.getItem(
        'PROJECT_INTERVIEW_STATUS',
      ) as IBCasPortfolioGetSubmissionStatusByReflectionDiaryStatus) || 'NOT_SUBMITTED',
  )

  const { data } = useIBInterviewStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
  })

  const { students = [] } = useIBInterviewSubmissionStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    status,
  })

  const { mutate: notiMutate, isLoading: notiLoading } = useIBInterviewNotSubmittedNotification({
    params: { grade, klass },
    onError: (error) => {
      console.error('CAS 인터뷰 미제출자 알림 발송 실패:', error)
    },
  })

  useEffect(() => {
    sessionStorage.setItem('PROJECT_INTERVIEW_STATUS', status)
  }, [status])

  return (
    <div>
      {notiLoading && <Blank />}
      <Typography variant="title1" className="text-primary-gray-900">
        인터뷰일지
      </Typography>
      <RadioV2.Group
        selectedValue={status}
        onChange={(value: IBCasPortfolioGetSubmissionStatusByReflectionDiaryStatus) => setStatus(value)}
        className="mb-4 flex flex-row gap-4 py-6"
      >
        <RadioV2.Label
          title="미작성"
          currentNum={data?.notSubmitted || 0}
          TotalNum={data?.total || 0}
          value="NOT_SUBMITTED"
        />
        <RadioV2.Label title="작성" currentNum={data?.submitted || 0} TotalNum={data?.total || 0} value="SUBMITTED" />
      </RadioV2.Group>

      {status === 'NOT_SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            인터뷰일지 미작성
          </Typography>
          <InterviewOverviewPanel
            title="미작성"
            buttonText="미제출자 알림 보내기"
            buttonHandler={() => notiMutate()}
            data={students}
          />
        </div>
      )}
      {status === 'SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            인터뷰일지 작성
          </Typography>
          <InterviewOverviewPanel
            title="1차 완료"
            goDetailPage={(studentIbId) => push(`/teacher/ib/cas/portfolio/${studentIbId}`)}
            data={students}
            type={1}
          />
          <InterviewOverviewPanel
            title="2차 완료"
            goDetailPage={(studentIbId) => push(`/teacher/ib/cas/portfolio/${studentIbId}`)}
            data={students}
            type={2}
          />
          <InterviewOverviewPanel
            title="3차 완료"
            goDetailPage={(studentIbId) => push(`/teacher/ib/cas/portfolio/${studentIbId}`)}
            data={students}
            type={3}
          />
        </div>
      )}
    </div>
  )
}
