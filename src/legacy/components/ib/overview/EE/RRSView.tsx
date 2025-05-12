import { useEffect, useState } from 'react'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useIBRRSNotSubmittedNotification, useIBRRSSubmissionStatus } from '@/legacy/container/ib-overview'
import { useRRSGetSubmissionStatusCount } from '@/legacy/generated/endpoint'
import { RRSGetSubmissionStatusCountParams, RRSGetSubmissionStatusStatus } from '@/legacy/generated/model'
import RRSOverviewPanel from './RRSOverviewPanel'
import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common/Blank'

export default function RRSView({ grade, klass }: RRSGetSubmissionStatusCountParams) {
  const { push } = useHistory()

  const [status, setStatus] = useState<RRSGetSubmissionStatusStatus>(
    () => (sessionStorage.getItem('PROJECT_RRS_STATUS') as RRSGetSubmissionStatusStatus) || 'NOT_SUBMITTED',
  )

  const { data } = useRRSGetSubmissionStatusCount({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    ibType: 'EE',
  })

  const { students = [] } = useIBRRSSubmissionStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    status,
    ibType: 'EE',
  })

  const { mutate: notiMutate, isLoading: notiLoading } = useIBRRSNotSubmittedNotification({
    params: {
      grade,
      klass,
      ibType: 'EE',
    },
    onError: (error) => {
      console.error('미제출자 알림 발송 실패:', error)
    },
  })

  useEffect(() => {
    sessionStorage.setItem('PROJECT_RRS_STATUS', status)
  }, [status])

  return (
    <div>
      {notiLoading && <Blank />}
      <Typography variant="title1" className="text-primary-gray-900">
        RRS
      </Typography>
      <RadioV2.Group
        selectedValue={status}
        onChange={(value: RRSGetSubmissionStatusStatus) => setStatus(value)}
        className="mb-4 flex flex-row gap-4 py-6"
      >
        <RadioV2.Label
          title="미작성"
          currentNum={data?.notSubmitted || 0}
          TotalNum={data?.total || 0}
          value="NOT_SUBMITTED"
        />
        <RadioV2.Label title="진행중" currentNum={data?.submitted || 0} TotalNum={data?.total || 0} value="SUBMITTED" />
      </RadioV2.Group>

      {status === 'NOT_SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            RRS 미작성
          </Typography>
          <RRSOverviewPanel
            title="미작성"
            buttonText="미작성자 알림 보내기"
            buttonHandler={() => notiMutate()}
            data={students}
          />
        </div>
      )}
      {status === 'SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            RRS 진행중
          </Typography>
          <RRSOverviewPanel
            title="3개 미만 작성"
            data={students}
            type="LESS_THAN_THREE"
            goDetailPage={(studentId) => push(`/teacher/ib/ee/${studentId}/`, { type: 'RRS' })}
          />
          <RRSOverviewPanel
            title="3개 이상 작성"
            data={students}
            type="GREATER_THAN_THREE"
            goDetailPage={(studentId) => push(`/teacher/ib/ee/${studentId}/`, { type: 'RRS' })}
          />
        </div>
      )}
    </div>
  )
}
