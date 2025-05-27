import { IconButton } from '@/molecules/IconButton'
import { useOutingsDownloadOutings } from '@/legacy/generated/endpoint'
import { Outing, OutingStatus } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { downloadExcel } from '@/legacy/util/download-excel'
import { makeDateToString } from '@/legacy/util/time'

interface OutingsExcelDownloadViewProps {
  outings?: Outing[]
  startDate: string
  endDate: string
  selectedGroupId: number | undefined
  username?: string | undefined
  outingStatus?: OutingStatus
}

export function OutingsExcelDownloadView({
  startDate,
  endDate,
  selectedGroupId,
  username,
  outingStatus,
}: OutingsExcelDownloadViewProps) {
  const { t } = useLanguage()
  const { refetch: refetchExcelData } = useOutingsDownloadOutings(
    { startDate, endDate, selectedGroupId, username, outingStatus },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(
            data,
            `확인증현황(${makeDateToString(new Date(startDate))}~${makeDateToString(new Date(endDate))})`,
          )
        },
      },
    },
  )

  return (
    <IconButton
      iconName="ssDownload"
      iconColor="gray-700"
      stroke={true}
      strokeWidth={4}
      position="front"
      color="tertiary"
      onClick={() => refetchExcelData()}
    >
      {t('certificate_status', '확인증현황')}
    </IconButton>
  )
}
