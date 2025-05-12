import { useEffect, useState } from 'react';
import { RadioV2 } from 'src/components/common/RadioV2';
import { Typography } from 'src/components/common/Typography';
import {
  useIBProposalNotSubmittedNotification,
  useIBProposalStatus,
  useIBProposalSubmissionStatus,
} from 'src/container/ib-overview';
import {
  IBGetSubmissionStatusCountParams,
  IBGetSubmissionStatusStatus,
  IBUnsubmitNotificationType,
  ResponseIBProposalSubmissionStatusDtoDetailStatus,
} from 'src/generated/model';
import ProposalOverviewPanel from './ProposalOverviewPanel';
import { useHistory } from 'react-router-dom';
import { createEeProposalPdf } from 'src/util/ib/ee-proposal-pdf';
import { handleBatchBlobDownload } from 'src/hooks/useBatchDownload';
import { Blank } from 'src/components/common';

export default function ProposalView({ grade, klass }: IBGetSubmissionStatusCountParams) {
  const { push } = useHistory();

  const [status, setStatus] = useState<IBGetSubmissionStatusStatus>(
    () => (sessionStorage.getItem('PROJECT_PROPOSAL_STATUS') as IBGetSubmissionStatusStatus) || 'NOT_SUBMITTED',
  );

  const [isDownloading, setIsDownloading] = useState(false);

  const { data } = useIBProposalStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
  });

  const { students = [] } = useIBProposalSubmissionStatus({
    grade: grade === 0 ? undefined : grade,
    klass: klass === 0 ? undefined : klass,
    status,
  });

  const startDownload = () => {
    setIsDownloading(true);
    const pdfFiles: { blob: Blob; fileName: string }[] = [];
    const downloadGroups: { [key: string]: number[] } = {};

    try {
      const submitStudents = students.filter(
        (student) => student.detailStatus === ResponseIBProposalSubmissionStatusDtoDetailStatus.SUBMIT,
      );

      let fileIndex = 0;

      Promise.all(
        submitStudents.map(async (student) => {
          const klassNum = `${student.leader.studentGroup.group.grade}${String(student.leader.studentGroup.group.klass).padStart(2, '0')}${String(student.leader.studentGroup.studentNumber).padStart(2, '0')}`;

          if (student.proposals?.length > 0) {
            // 학생 당 여러 제안서가 있는 경우 그룹화
            if (student.proposals.length > 1) {
              const studentIndices: number[] = [];

              for (const proposal of student.proposals) {
                const doc = await createEeProposalPdf(
                  {
                    klassNum,
                    name: student.leader.name,
                  },
                  proposal,
                );

                if (!doc) {
                  console.error(`PDF 생성 실패: 학생 ID ${student.id}, 제안서 ID ${proposal.id}`);
                  continue;
                }

                pdfFiles.push({
                  blob: new Blob([doc]),
                  fileName: `EE_제안서_${klassNum}_${student.leader.name}_${proposal.researchTopic}.pdf`,
                });

                studentIndices.push(fileIndex);
                fileIndex++;
              }

              // 학생 이름으로 그룹화
              downloadGroups[`EE_제안서_${klassNum}_${student.leader.name}`] = studentIndices;
            } else {
              // 단일 제안서인 경우
              const proposal = student.proposals[0];
              const klassNum = `${student.leader.studentGroup.group.grade}${String(student.leader.studentGroup.group.klass).padStart(2, '0')}${String(student.leader.studentGroup.studentNumber).padStart(2, '0')}`;

              const doc = await createEeProposalPdf(
                {
                  klassNum,
                  name: student.leader.name,
                },
                proposal,
              );

              if (!doc) {
                console.error(`PDF 생성 실패: 학생 ID ${student.id}, 제안서 ID ${proposal.id}`);
                return;
              }

              pdfFiles.push({
                blob: new Blob([doc]),
                fileName: `EE_제안서_${klassNum}_${student.leader.name}_${proposal.researchTopic}.pdf`,
              });
              fileIndex++;
            }
          }
        }),
      )
        .then(async () => {
          await handleBatchBlobDownload(pdfFiles, 'EE 제안서', downloadGroups);
          setIsDownloading(false);
        })
        .catch((error) => {
          console.error('PDF 일괄 다운로드 실패:', error);
          setIsDownloading(false);
        });
    } catch (error) {
      console.error('PDF 일괄 다운로드 실패:', error);
      setIsDownloading(false);
    }
  };

  const { mutate: notiMutate, isLoading: notiLoading } = useIBProposalNotSubmittedNotification({
    type: IBUnsubmitNotificationType.IB_PROPOSAL,

    onError: (error) => {
      console.error('미제출자 알림 발송 실패:', error);
    },
  });

  useEffect(() => {
    sessionStorage.setItem('PROJECT_PROPOSAL_STATUS', status);
  }, [status]);

  return (
    <div>
      {notiLoading && <Blank />}
      <Typography variant="title1" className="text-primary-gray-900">
        제안서
      </Typography>
      <RadioV2.Group
        selectedValue={status}
        onChange={(value: IBGetSubmissionStatusStatus) => setStatus(value)}
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
        <>
          <div className="flex flex-col gap-4">
            <Typography variant="title2" className="text-primary-gray-900">
              제안서 미제출
            </Typography>
            <ProposalOverviewPanel
              title="미제출"
              buttonText="미제출자 알림 보내기"
              buttonHandler={() => notiMutate()}
              data={students}
            />
          </div>
        </>
      )}
      {status === 'SUBMITTED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            제안서 승인 전
          </Typography>
          <ProposalOverviewPanel
            title="제출"
            goDetailPage={(studentIbId) => push(`/teacher/ib/ee/${studentIbId}`)}
            data={students}
            type="SUBMIT"
            buttonText="제안서 전체 다운로드"
            buttonHandler={() => startDownload()}
          />
          <ProposalOverviewPanel
            title="보완 필요"
            goDetailPage={(studentIbId, proposalId) => push(`/teacher/ib/ee/${studentIbId}/proposal/${proposalId}`)}
            data={students}
            type="REJECT_PLAN"
          />
          {isDownloading && <Blank />}
        </div>
      )}
      {status === 'APPROVED' && (
        <div className="flex flex-col gap-4">
          <Typography variant="title2" className="text-primary-gray-900">
            제안서 승인 완료
          </Typography>
          <ProposalOverviewPanel
            goDetailPage={(studentIbId, proposalId) => push(`/teacher/ib/ee/${studentIbId}/proposal/${proposalId}`)}
            title="승인 완료"
            data={students}
          />
        </div>
      )}
    </div>
  );
}
