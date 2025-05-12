import { useAbsentsDownloadAbsents } from '@/legacy/generated/endpoint'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { downloadExcel } from '@/legacy/util/download-excel'
import { makeDateToString } from '@/legacy/util/time'
import { Button } from '@/legacy/components/common/Button'

interface AbsentsExcelDownloadViewProps {
  startDate: string
  endDate: string
  selectedGroupId: number
  year?: string
}

export function AbsentsExcelDownloadView({ startDate, endDate, selectedGroupId, year }: AbsentsExcelDownloadViewProps) {
  const { t } = useLanguage()
  const { refetch: refetchExcelData } = useAbsentsDownloadAbsents(
    { startDate, endDate, selectedGroupId, year },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(
            data,
            `월출결현황(${makeDateToString(new Date(startDate))}~${makeDateToString(new Date(endDate))})`,
          )
        },
      },
    },
  )

  return (
    <Button.lg
      children={t('monthly_attendance_status', '월별출결현황')}
      onClick={() => refetchExcelData()}
      className="filled-green"
    />
  )
}
