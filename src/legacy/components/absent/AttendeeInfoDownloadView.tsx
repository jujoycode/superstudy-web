import { useAbsentsDownloadAttendee } from 'src/generated/endpoint';
import { useLanguage } from 'src/hooks/useLanguage';
import { downloadExcel } from 'src/util/download-excel';
import { makeDateToString } from 'src/util/time';
import { Button } from '../common/Button';

interface AttendeeInfoDownloadViewProps {
  startDate: string;
  endDate: string;
  selectedGroupId: number;
}

export function AttendeeInfoDownloadView({ startDate, endDate, selectedGroupId }: AttendeeInfoDownloadViewProps) {
  const { t } = useLanguage();
  const { refetch: refetchExcelData } = useAbsentsDownloadAttendee(
    { startDate, endDate, selectedGroupId },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(data, `학급별출결현황 (${makeDateToString(new Date())})`);
        },
      },
    },
  );

  return (
    <Button.lg
      children={t('class_attendance_status', '학급별출결현황')}
      onClick={() => refetchExcelData()}
      className="bg-green-400 text-white"
    />
  );
}
