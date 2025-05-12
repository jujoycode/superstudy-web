import { format } from 'date-fns';
import { useGetUnreadFeedback } from 'src/container/ib-feedback';
import { FeedbackReferenceTable } from 'src/generated/model';
import { IBBlank } from '../common/IBBlank';
import { Typography } from '../common/Typography';
import ColorSVGIcon from '../icon/ColorSVGIcon';
import SolidSVGIcon from '../icon/SolidSVGIcon';

interface FeedbackViewerProps {
  referenceId: number;
  referenceTable: FeedbackReferenceTable;
  modalOpen: boolean;
  setModalClose: () => void;
}

export default function FeedbackViewer({ referenceId, referenceTable, modalOpen, setModalClose }: FeedbackViewerProps) {
  const { data, isLoading } = useGetUnreadFeedback({ referenceId, referenceTable });
  const date = data?.items[0].createdAt ? new Date(data.items[0].createdAt) : new Date();
  const sender = data?.items[0].sender;
  return (
    <div
      className={`fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black bg-opacity-50 ${
        !modalOpen && 'hidden'
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className={`relative w-[632px] overflow-hidden rounded-xl bg-white p-8`}>
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <IBBlank type="section" />
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pb-6 backdrop-blur-[20px]">
              <Typography variant="title1">
                {sender
                  ? sender.role === 'USER'
                    ? '학생 댓글을 확인하세요'
                    : '피드백을 확인하세요'
                  : '피드백을 확인하세요'}
              </Typography>
              <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
            </div>
            <div
              className={`flex flex-col gap-3 rounded-xl ${
                sender === null
                  ? 'bg-primary-gray-50'
                  : data?.items[0].sender.role === 'USER'
                  ? 'bg-primary-gray-50'
                  : 'bg-primary-orange-50'
              } p-5`}
            >
              {sender === null ? (
                <div className="flex flex-row items-center justify-between">
                  <span className="flex flex-row items-center gap-2">
                    <SolidSVGIcon.Bell size={24} color="gray700" />
                    <Typography variant="title3">알림</Typography>
                  </span>
                  <Typography variant="caption">{format(date, 'yyyy.MM.dd')}</Typography>
                </div>
              ) : data?.items[0].sender.role === 'USER' ? (
                <div className="flex flex-row items-center justify-between">
                  <span className="flex flex-row items-center gap-2">
                    <SolidSVGIcon.Talk size={24} color="gray700" />
                    <Typography variant="title3">학생이 남긴 댓글</Typography>
                  </span>
                  <Typography variant="caption">{format(date, 'yyyy.MM.dd HH:mm')}</Typography>
                </div>
              ) : (
                <div className="flex flex-row items-center justify-between">
                  <span className="flex flex-row items-center gap-2">
                    <SolidSVGIcon.Talk size={24} color="orange800" />
                    <Typography variant="title3" className="text-primary-orange-800">
                      {data?.items[0].sender.name}선생님의 피드백
                    </Typography>
                  </span>
                  <Typography variant="caption">{format(date, 'yyyy.MM.dd HH:mm')}</Typography>
                </div>
              )}

              {sender === null ? (
                <div className="flex flex-col gap-1">
                  {data?.items[0].content.includes('\n') ? (
                    <>
                      <Typography variant="body2" className="whitespace-pre-line">
                        {data.items[0].content.split('\n')[0]}
                      </Typography>
                      <Typography variant="caption" className="whitespace-pre-line text-primary-gray-500">
                        {data.items[0].content.split('\n')[1]}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" className="whitespace-pre-line">
                      {data?.items[0].content}
                    </Typography>
                  )}
                </div>
              ) : (
                <Typography variant="body2" className="whitespace-pre-line">
                  {data?.items[0].content}
                </Typography>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
