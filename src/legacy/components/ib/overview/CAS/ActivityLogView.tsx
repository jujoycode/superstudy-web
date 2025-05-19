import { useEffect, useState } from 'react'

import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common/Blank'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import {
  useIBActivityLogNotSubmittedNotification,
  useIBActivityLogStatus,
  useIBActivityLogSubmissionStatus,
} from '@/legacy/container/ib-overview'
import {
  IBCasPortfolioGetSubmissionStatusByReflectionDiaryStatus,
  IBGetSubmissionStatusCountParams,
} from '@/legacy/generated/model'

import ActivityLogOverviewPanel from './ActivitLogOverviewPanel'

export default function ActivityLogView({ grade, klass }: IBGetSubmissionStatusCountParams) {
  const { push } = useHistory()

  const [status, setStatus] = useState<IBCasPortfolioGetSubmissionStatusByReflectionDiaryStatus>(
    () =>
      (sessionStorage.getItem(
        'PROJECT_ACTIVITYLOG_STATUS',
      ) as IBCasPortfolioGetSubmissionStatusByReflectionDiaryStatus) || 'NOT_SUBMITTED',
  )

  const { data } = useIBActivityLogStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
  })

  const { students = [] } = useIBActivityLogSubmissionStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    status,
  })

  const { mutate: notiMutate, isLoading: notiLoading } = useIBActivityLogNotSubmittedNotification({
    params: { grade, klass },
    onError: (error) => {
      console.error('CAS 성찰일지 미제출자 알림 발송 실패:', error)
    },
  })

  useEffect(() => {
    sessionStorage.setItem('PROJECT_ACTIVITYLOG_STATUS', status)
  }, [status])

  return (
    <div>
      {notiLoading && <Blank />}
      <Typography variant="title1" className="text-gray-900">
        성찰일지
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
          <Typography variant="title2" className="text-gray-900">
            성찰일지 미작성
          </Typography>
          <ActivityLogOverviewPanel
            title="미작성"
            buttonText="미제출자 알림 보내기"
            buttonHandler={() => notiMutate()}
            data={students}
          />
        </div>
      )}
      {status === 'SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-gray-900">
            성찰일지 작성
          </Typography>
          <ActivityLogOverviewPanel
            title="1개 이상~3개 미만 작성"
            goDetailPage={(studentIbId) => push(`/teacher/ib/cas/portfolio/${studentIbId}`)}
            data={students}
            type="LESS"
            buttonText="작성 알림 보내기"
            buttonHandler={() => alert('작성 알림 보내기')}
          />
          <ActivityLogOverviewPanel
            title="3개 이상 작성"
            goDetailPage={(studentIbId) => push(`/teacher/ib/cas/portfolio/${studentIbId}`)}
            buttonHandler={() => alert('알림 보내기')}
            data={students}
            type="MORE"
          />
        </div>
      )}
    </div>
  )
}
