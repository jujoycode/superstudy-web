import { useEffect, useState } from 'react';
import { RadioV2 } from 'src/components/common/RadioV2';
import { Typography } from 'src/components/common/Typography';
import {
  useIBTOKExhibitionNotSubmittedNotification,
  useIBTOKExhibitionStatusCount,
  useIBTOKExhibitionSubmissionStatus,
} from 'src/container/ib-overview';
import { ExhibitionGetSubmissionStatusCountParams, ExhibitionGetSubmissionStatusStatus } from 'src/generated/model';
import { useHistory } from 'react-router-dom';
import ExhibitionOverviewPanel from './ExhibitionOverviewPanel';
import { handleBatchBlobDownload } from 'src/hooks/useBatchDownload';
import { Blank } from 'src/components/common/Blank';
import { createTokExhibitionPdf } from 'src/util/ib/tok-exhibition-pdf';

export default function ExhibitionView({ grade, klass }: ExhibitionGetSubmissionStatusCountParams) {
  const { push } = useHistory();

  const [status, setStatus] = useState<ExhibitionGetSubmissionStatusStatus>(
    () =>
      (sessionStorage.getItem('PROJECT_EXHIBITION_EXHIBITION_STATUS') as ExhibitionGetSubmissionStatusStatus) ||
      'PENDING',
  );

  const [isDownloading, setIsDownloading] = useState(false);

  const { data } = useIBTOKExhibitionStatusCount({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
  });

  const { students = [] } = useIBTOKExhibitionSubmissionStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    status,
  });

  const handleBulkDownload = async () => {
    setIsDownloading(true);
    const pdfFiles: { blob: Blob; fileName: string }[] = [];

    try {
      await Promise.all(
        students.map(async (student) => {
          const klassNum = `${student.leader.studentGroup.group.grade}${String(student.leader.studentGroup.group.klass).padStart(2, '0')}${String(student.leader.studentGroup.studentNumber).padStart(2, '0')}`;

          const doc = await createTokExhibitionPdf(
            {
              klassNum,
              name: student.leader.name,
            },
            student.exhibition,
          );

          if (!doc) {
            console.error(`PDF 생성 실패: 학생 ID ${student.id}`);
            return;
          }

          pdfFiles.push({
            blob: new Blob([doc]),
            fileName: `TOK_전시회_${klassNum}_${student.leader.name}_${student.exhibition?.themeQuestion}.pdf`,
          });
        }),
      );

      await handleBatchBlobDownload(pdfFiles, '최종 TOK 전시회');
    } catch (error) {
      console.error('PDF 일괄 다운로드 실패:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const { mutate: notiMutate, isLoading: notiLoading } = useIBTOKExhibitionNotSubmittedNotification({
    params: {
      grade,
      klass,
    },
    onError: (error) => {
      console.error('미제출자 알림 발송 실패:', error);
    },
  });

  useEffect(() => {
    sessionStorage.setItem('PROJECT_EXHIBITION_EXHIBITION_STATUS', status);
  }, [status]);

  return (
    <div>
      {(isDownloading || notiLoading) && <Blank />}
      <RadioV2.Group
        selectedValue={status}
        onChange={(value: ExhibitionGetSubmissionStatusStatus) => setStatus(value)}
        className="mb-4 flex flex-row gap-4 py-6"
      >
        <RadioV2.Label title="미작성" currentNum={data?.pending || 0} TotalNum={data?.total || 0} value="PENDING" />
        <RadioV2.Label
          title="진행중"
          currentNum={data?.inProgress || 0}
          TotalNum={data?.total || 0}
          value="IN_PROGRESS"
        />
        <RadioV2.Label title="평가" currentNum={data?.evaluating || 0} TotalNum={data?.total || 0} value="EVALUATING" />
        <RadioV2.Label title="완료" currentNum={data?.completed || 0} TotalNum={data?.total || 0} value="COMPLETE" />
      </RadioV2.Group>

      {status === 'PENDING' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            전시회 미작성
          </Typography>
          <ExhibitionOverviewPanel
            title="미작성"
            buttonText="미작성자 알림 보내기"
            buttonHandler={() => notiMutate()}
            data={students}
          />
        </div>
      )}
      {status === 'IN_PROGRESS' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            전시회 진행중
          </Typography>
          <ExhibitionOverviewPanel
            title="진행중"
            goDetailPage={(studentIbId, exhibitionId) =>
              push(`/teacher/ib/tok/exhibition/${studentIbId}/detail/${exhibitionId}`)
            }
            data={students}
          />
        </div>
      )}
      {status === 'EVALUATING' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            전시회 평가
          </Typography>
          <ExhibitionOverviewPanel
            title="평가 전"
            goDetailPage={(studentIbId, exhibitionId) =>
              push(`/teacher/ib/tok/exhibition/${studentIbId}/detail/${exhibitionId}`)
            }
            data={students}
            type="NOT_EVALUATED"
          />
          <ExhibitionOverviewPanel
            title="평가 후"
            goDetailPage={(studentIbId, exhibitionId) =>
              push(`/teacher/ib/tok/exhibition/${studentIbId}/detail/${exhibitionId}`)
            }
            data={students}
            type="EVALUATED"
          />
        </div>
      )}
      {status === 'COMPLETE' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            전시회 완료
          </Typography>
          <ExhibitionOverviewPanel
            goDetailPage={(studentIbId, exhibitionId) =>
              push(`/teacher/ib/tok/exhibition/${studentIbId}/detail/${exhibitionId}`)
            }
            title="완료"
            buttonText="최종 전시회 전체 다운로드"
            buttonHandler={handleBulkDownload}
            data={students}
          />
        </div>
      )}
    </div>
  );
}
