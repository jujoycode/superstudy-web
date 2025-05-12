import { useOutingsDownloadOutings } from 'src/generated/endpoint';
import { Outing, OutingStatus } from 'src/generated/model';
import { useLanguage } from 'src/hooks/useLanguage';
import { downloadExcel } from 'src/util/download-excel';
import { makeDateToString } from 'src/util/time';
import { Button } from '../common/Button';

interface OutingsExcelDownloadViewProps {
  outings?: Outing[];
  startDate: string;
  endDate: string;
  selectedGroupId: number | undefined;
  username?: string | undefined;
  outingStatus?: OutingStatus;
}

export function OutingsExcelDownloadView({
  startDate,
  endDate,
  selectedGroupId,
  username,
  outingStatus,
}: OutingsExcelDownloadViewProps) {
  const { t } = useLanguage();
  const { refetch: refetchExcelData } = useOutingsDownloadOutings(
    { startDate, endDate, selectedGroupId, username, outingStatus },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(
            data,
            `확인증현황(${makeDateToString(new Date(startDate))}~${makeDateToString(new Date(endDate))})`,
          );
        },
      },
    },
  );

  return (
    <Button.lg
      children={t('certificate_status', '확인증현황')}
      onClick={() => refetchExcelData()}
      className="filled-green"
    />
  );
}
