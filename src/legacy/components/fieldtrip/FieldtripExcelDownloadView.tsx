import { useFieldtripsDownloadFieldtrips } from 'src/generated/endpoint';
import { FieldtripStatus } from 'src/generated/model/fieldtripStatus';
import { useLanguage } from 'src/hooks/useLanguage';
import { downloadExcel } from 'src/util/download-excel';
import { makeDateToString } from 'src/util/time';
import { Button } from '../common/Button';

interface FieldtripExcelDownloadViewProps {
  startDate: string;
  endDate: string;
  fieldtripStatus: FieldtripStatus;
}

export function FieldtripExcelDownloadView({ startDate, endDate, fieldtripStatus }: FieldtripExcelDownloadViewProps) {
  const { t } = useLanguage();
  const { refetch: refetchExcelData } = useFieldtripsDownloadFieldtrips(
    { startDate, endDate, fieldtripStatus },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(
            data,
            `체험학습현황(${makeDateToString(new Date(startDate))}~${makeDateToString(new Date(endDate))})`,
          );
        },
      },
    },
  );

  return (
    <Button.lg
      children={t('experiential_learning_status', '체험학습현황')}
      onClick={() => refetchExcelData()}
      className="filled-green w-full"
    />
  );
}
