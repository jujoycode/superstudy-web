import { format } from 'date-fns'
import { useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { Button } from '@/legacy/components/common/Button'
import {
  useStudentActivityV3DownloadRecordSummary,
  useStudentRecordontrollerDownloadRecordSummary,
} from '@/legacy/generated/endpoint'
import { downloadExcel } from '@/legacy/util/download-excel'
import { useUserStore } from '@/stores2/user'

export const ActivityV3DownloadPage = () => {
  const { pathname } = useLocation()
  const { me } = useUserStore()
  const groupIdMatch = pathname.match(/\/teacher\/studentcard\/(\d+)/)
  const groupId = groupIdMatch ? groupIdMatch[1] : me?.klassGroupId || 0

  const { refetch: downloadSummary } = useStudentActivityV3DownloadRecordSummary(Number(groupId), {
    query: {
      enabled: false,
      onSuccess: (data) => {
        downloadExcel(data, `활동요약_총정리_${format(new Date(), 'yyyy_MM_dd_HH_mm')}`)
      },
    },
  })

  const { refetch: downloadRecord } = useStudentRecordontrollerDownloadRecordSummary(
    Number(groupId),
    {
      showMyRecord: false,
    },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(data, `활동기록_초안_총정리_${format(new Date(), 'yyyy_MM_dd_HH_mm')}`)
        },
      },
    },
  )

  return (
    <div className="h-full space-y-4 overflow-y-scroll py-4 md:flex md:space-y-0 md:space-x-4 md:overflow-y-hidden">
      <Button.lg
        children="활동요약 다운로드"
        onClick={() => downloadSummary()}
        className="filled-primary hidden md:block"
      />
      <Button.lg
        children="활동기록 초안 다운로드"
        onClick={() => downloadRecord()}
        className="filled-primary hidden md:block"
      />
    </div>
  )
}
