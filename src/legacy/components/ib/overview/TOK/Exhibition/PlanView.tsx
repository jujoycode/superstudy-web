import { useEffect, useState } from 'react';
import { RadioV2 } from 'src/components/common/RadioV2';
import { Typography } from 'src/components/common/Typography';
import {
  useIBTOKExhibitionPlanSubmissionStatus,
  useIBTOKStatusCount,
  useIBTOKExhibitionPlanNotSubmittedNotification,
} from 'src/container/ib-overview';
import {
  IBGetSubmissionStatusCountParams,
  IBGetTokExhibitionPlanSubmissionStatusStatus,
  ResponseIBTokExhibitionPlanSubmissionStatusDto,
  ResponseIBTokExhibitionPlanSubmissionStatusDtoDetailStatus,
} from 'src/generated/model';
import { useHistory } from 'react-router-dom';
import PlanOverviewPanel from './PlanOverviewPanel';
import { handleBatchBlobDownload } from 'src/hooks/useBatchDownload';
import { createTokExhibitionPlanPdf } from 'src/util/ib/tok-exhibition-plan-pdf';
import { Blank } from 'src/components/common/Blank';

export default function PlanView({ grade, klass }: IBGetSubmissionStatusCountParams) {
  const { push } = useHistory();

  const [status, setStatus] = useState<IBGetTokExhibitionPlanSubmissionStatusStatus>(
    () =>
      (sessionStorage.getItem('PROJECT_EXHIBITION_PLAN_STATUS') as IBGetTokExhibitionPlanSubmissionStatusStatus) ||
      'NOT_SUBMITTED',
  );

  const [isDownloading, setIsDownloading] = useState(false);

  const { data } = useIBTOKStatusCount({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
  });

  const { students = [] as ResponseIBTokExhibitionPlanSubmissionStatusDto[] } = useIBTOKExhibitionPlanSubmissionStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    status,
  });

  const submitStudents = (students as ResponseIBTokExhibitionPlanSubmissionStatusDto[]).filter(
    (student) => student.detailStatus === ResponseIBTokExhibitionPlanSubmissionStatusDtoDetailStatus.SUBMIT,
  );

  const handleBulkDownload = async () => {
    setIsDownloading(true);
    const pdfFiles: { blob: Blob; fileName: string }[] = [];

    try {
      await Promise.all(
        submitStudents.map(async (student) => {
          const klassNum = `${student.leader.studentGroup.group.grade}${String(student.leader.studentGroup.group.klass).padStart(2, '0')}${String(student.leader.studentGroup.studentNumber).padStart(2, '0')}`;

          const doc = await createTokExhibitionPlanPdf(
            {
              klassNum,
              name: student.leader.name,
            },
            student.tokExhibitionPlan,
          );

          if (!doc) {
            console.error(`PDF 생성 실패: 학생 ID ${student.id}`);
            return;
          }

          pdfFiles.push({
            blob: new Blob([doc]),
            fileName: `TOK_전시회_기획안_${klassNum}_${student.leader.name}_${student.tokExhibitionPlan?.themeQuestion}.pdf`,
          });
        }),
      );

      await handleBatchBlobDownload(pdfFiles, 'TOK 전시회 기획안');
    } catch (error) {
      console.error('PDF 일괄 다운로드 실패:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const { mutate: notiMutate, isLoading: notiLoading } = useIBTOKExhibitionPlanNotSubmittedNotification({
    params: {
      grade,
      klass,
    },
    onError: (error) => {
      console.error('미제출자 알림 발송 실패:', error);
    },
  });

  useEffect(() => {
    sessionStorage.setItem('PROJECT_EXHIBITION_PLAN_STATUS', status);
  }, [status]);

  return (
    <div>
      {(isDownloading || notiLoading) && <Blank />}
      <RadioV2.Group
        selectedValue={status}
        onChange={(value: IBGetTokExhibitionPlanSubmissionStatusStatus) => setStatus(value)}
        className="mb-4 flex flex-row gap-4 py-6"
      >
        <RadioV2.Label
          title="미제출"
          currentNum={data?.notSubmitted || 0}
          TotalNum={data?.total || 0}
          value="NOT_SUBMITTED"
        />
        <RadioV2.Label
          title="승인 전"
          currentNum={data?.submitted || 0}
          TotalNum={data?.total || 0}
          value="SUBMITTED"
        />
        <RadioV2.Label
          title="승인 완료"
          currentNum={data?.approved || 0}
          TotalNum={data?.total || 0}
          value="APPROVED"
        />
      </RadioV2.Group>

      {status === 'NOT_SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            기획안 미제출
          </Typography>
          <PlanOverviewPanel
            title="미제출"
            buttonText="미제출자 알림 보내기"
            buttonHandler={() => notiMutate()}
            data={students as ResponseIBTokExhibitionPlanSubmissionStatusDto[]}
          />
        </div>
      )}
      {status === 'SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            기획안 승인 전
          </Typography>
          <PlanOverviewPanel
            title="제출"
            goDetailPage={(studentIbId) => push(`/teacher/ib/tok/plan/${studentIbId}`)}
            data={students as ResponseIBTokExhibitionPlanSubmissionStatusDto[]}
            type="SUBMITTED"
            buttonText="기획안 전체 다운로드"
            buttonHandler={handleBulkDownload}
          />
          <PlanOverviewPanel
            title="보완 필요"
            goDetailPage={(studentIbId) => push(`/teacher/ib/tok/plan/${studentIbId}`)}
            data={students as ResponseIBTokExhibitionPlanSubmissionStatusDto[]}
            type="REJECT_PLAN"
          />
        </div>
      )}
      {status === 'APPROVED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            기획안 승인 완료
          </Typography>
          <PlanOverviewPanel
            goDetailPage={(studentIbId) => push(`/teacher/ib/tok/plan/${studentIbId}`)}
            title="승인 완료"
            data={students as ResponseIBTokExhibitionPlanSubmissionStatusDto[]}
          />
        </div>
      )}
    </div>
  );
}
