import { useAbsentsDownloadAbsents } from 'src/generated/endpoint';
import { useLanguage } from 'src/hooks/useLanguage';
import { downloadExcel } from 'src/util/download-excel';
import { makeDateToString } from 'src/util/time';
import { Button } from '../common/Button';

interface AbsentsExcelDownloadViewProps {
  startDate: string;
  endDate: string;
  selectedGroupId: number;
  year?: string;
}

export function AbsentsExcelDownloadView({ startDate, endDate, selectedGroupId, year }: AbsentsExcelDownloadViewProps) {
  const { t } = useLanguage();
  const { refetch: refetchExcelData } = useAbsentsDownloadAbsents(
    { startDate, endDate, selectedGroupId, year },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(
            data,
            `월출결현황(${makeDateToString(new Date(startDate))}~${makeDateToString(new Date(endDate))})`,
          );
        },
      },
    },
  );

  return (
    <Button.lg
      children={t('monthly_attendance_status', '월별출결현황')}
      onClick={() => refetchExcelData()}
      className="filled-green"
    />
  );
}
