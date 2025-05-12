import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Blank } from 'src/components/common';
import AlertV2 from 'src/components/common/AlertV2';
import { ButtonV2 } from 'src/components/common/ButtonV2';
import { Typography } from 'src/components/common/Typography';
import ColorSVGIcon from 'src/components/icon/ColorSVGIcon';
import { useGetFeedbackBatchExist, useGetUnreadFeedbackCount } from 'src/container/ib-feedback';
import { useIBGetById } from 'src/container/ib-project-get-student';
import { ResponseIBDto } from 'src/generated/model';
import { meState } from 'src/store';
import FeedbackViewer from '../../FeedbackViewer';

interface OutlineListProps {
  data: ResponseIBDto;
  refetch: () => void;
  isLoading: boolean;
}

export default function OutlineList({ data, refetch, isLoading }: OutlineListProps) {
  const { push } = useHistory();
  const me = useRecoilValue(meState);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { data: ibData, klassNum } = useIBGetById(Number(data.id));
  const outlineData = ibData?.tokOutline;

  const { data: Feedback } = useGetFeedbackBatchExist(
    {
      referenceIds: String(data.id),
      referenceTable: 'IB',
    },
    { enabled: !!data },
  );

  const { data: count } = useGetUnreadFeedbackCount(
    { referenceId: data.id, referenceTable: 'IB' },
    {
      enabled: !!data,
    },
  );

  const handleFeedbackOpen = () => {
    setFeedbackOpen(true);
    if (unreadCount && unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (count !== undefined) {
      setUnreadCount(count);
    }
  }, [count]);

  if (data === undefined || outlineData === undefined) return null;

  // console.log('outlineData :>> ', outlineData);

  return (
    <section className="h-[664px]">
      {isLoading && <Blank />}
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1" className="text-primary-gray-900">
          아웃라인
        </Typography>
      </header>
      <main>
        <table className="w-full">
          <thead className="border-y border-y-primary-gray-100 text-[15px] font-medium text-primary-gray-500">
            <tr>
              <td className="w-[964px] py-[9px] pl-6 pr-2 text-center">주제</td>
              <td className="w-[150px] px-2 py-[9px] text-center">수정일</td>
              <td className="w-[166px] py-[9px] pl-2 pr-6 text-center">피드백</td>
            </tr>
          </thead>
          <tbody className="text-[15px] font-medium text-primary-gray-900">
            <tr className="border-b border-b-primary-gray-100">
              <td
                className="cursor-pointer py-4 pl-6 pr-2 text-center"
                onClick={() =>
                  push(`/teacher/ib/tok/outline/${data.id}/detail/${data.tokOutline?.id}`, {
                    project: data,
                  })
                }
              >
                {outlineData.themeQuestion}
              </td>
              <td className="px-2 py-4 text-center">{format(new Date(outlineData.updatedAt), 'yyyy.MM.dd')}</td>
              <td className="flex items-center justify-center py-4 pl-2 pr-6 align-middle">
                {Feedback?.items[0].totalCount && Feedback?.items[0].totalCount > 0 ? (
                  <ButtonV2
                    variant="outline"
                    color="gray400"
                    size={32}
                    className={`${unreadCount && unreadCount > 0 && 'flex flex-row items-center gap-1'}`}
                    onClick={() => {
                      if (unreadCount) {
                        handleFeedbackOpen();
                      } else {
                        push(`/teacher/ib/tok/outline/${data.id}/detail/${data.tokOutline?.id}`);
                      }
                    }}
                  >
                    {unreadCount && unreadCount > 0 ? (
                      <>
                        <ColorSVGIcon.New color="orange800" />
                        보기
                      </>
                    ) : (
                      '보기'
                    )}
                  </ButtonV2>
                ) : (
                  <>-</>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </main>
      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={data?.id || 0}
          referenceTable="IB"
        />
      )}
      {alertMessage && (
        <AlertV2
          confirmText="확인"
          message={alertMessage}
          onConfirm={() => {
            setAlertMessage(null);
          }}
        />
      )}
    </section>
  );
}
