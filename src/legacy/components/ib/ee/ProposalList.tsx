import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useHistory } from 'react-router-dom';
import NODATA from 'src/assets/images/no-data.png';
import { IBBlank } from 'src/components/common/IBBlank';
import { useGetFeedbackExist, useGetUnreadFeedbackCount } from 'src/container/ib-feedback';
import { useIBProposalRankChange } from 'src/container/ib-proposal-update';
import { ResponseIBDto } from 'src/generated/model';
import AlertV2 from '../../common/AlertV2';
import { BadgeV2, BadgeV2Color } from '../../common/BadgeV2';
import { ButtonV2 } from '../../common/ButtonV2';
import { Typography } from '../../common/Typography';
import ColorSVGIcon from '../../icon/ColorSVGIcon';
import SolidSVGIcon from '../../icon/SolidSVGIcon';
import { PopupModal } from '../../PopupModal';
import FeedbackViewer from '../FeedbackViewer';
import { IbEeProposal } from './IbEeProposal';

interface ProposalListProps {
  data: ResponseIBDto;
  refetch: () => void;
}

const statusBadge: Record<string, { color: BadgeV2Color; label: string }> = {
  SENT: { color: 'gray', label: '제안' },
  REJECT: { color: 'red', label: '반려' },
  ACCEPT: { color: 'blue', label: '채택' },
};

export default function ProposalList({ data, refetch }: ProposalListProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [proposalItems, setProposalItems] = useState(data?.proposals || []);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const { changeIBProposalRank, isLoading, error, isError } = useIBProposalRankChange({
    onSuccess: () => {
      setAlertMessage(`제안서 순위 변경이\n완료되었습니다`);
      setModalOpen(!modalOpen);
      refetch();
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error);
    },
  });

  const handleSuccess = (action: 'save' | 'requestApproval') => {
    setIsOpen(!isOpen);
    refetch();
    setAlertMessage(action === 'save' ? `제안서가 \n저장되었습니다` : `제안서 승인 요청이\n완료되었습니다`);
  };

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorderedItems = reorder(proposalItems, result.source.index, result.destination.index);
    setProposalItems(
      reorderedItems.map((item, index) => ({
        ...item,
        rank: index + 1,
      })),
    );
  };

  const handleSaveRank = () => {
    const rankItems = proposalItems.map(({ id, rank }) => ({
      id,
      rank,
    }));

    const requestData = {
      items: rankItems,
    };
    changeIBProposalRank({ id: data.id, data: requestData });
  };

  const approvedProposal = data.proposals?.find((proposal) => proposal.status === 'ACCEPT');

  const { data: count, isLoading: isCountFetch } = useGetUnreadFeedbackCount(
    approvedProposal ? { referenceId: data.id, referenceTable: 'IB' } : { referenceId: 0, referenceTable: 'IB' },
    {
      enabled: !!approvedProposal,
    },
  );
  const { data: feedback, isLoading: isFeedbackFetch } = useGetFeedbackExist({
    referenceId: data?.id || 0,
    referenceTable: 'IB',
  });

  useEffect(() => {
    setProposalItems(data?.proposals || []);
  }, [data.proposals]);

  useEffect(() => {
    if (count !== undefined) {
      setUnreadCount(count);
    }
  }, [count]);

  const handleFeedbackOpen = () => {
    setFeedbackOpen(true);
    if (unreadCount && unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  const { push } = useHistory();
  return (
    <section className="flex h-[664px] flex-col">
      {(isLoading || isCountFetch || isFeedbackFetch) && <IBBlank type="opacity" />}
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1">제안서</Typography>
        <nav className="flex flex-row items-center gap-2">
          {data?.proposals?.every((proposal) => proposal.status === 'PENDING') && (
            <ButtonV2 variant="outline" color="gray400" size={40} onClick={() => setModalOpen(!isOpen)}>
              순위 변경하기
            </ButtonV2>
          )}
          {data.proposals !== undefined &&
            !data.proposals.some((proposal) => proposal.status === 'SUBMIT') &&
            data.status !== 'COMPLETE' && (
              <ButtonV2
                variant="solid"
                color="orange800"
                size={40}
                disabled={data.status === 'WAIT_COMPLETE'}
                onClick={() => {
                  if (approvedProposal) {
                    return setAlertMessage(`이미 채택된 제안서가 있어\n새로운 제안서를 작성할 수 없습니다`);
                  }
                  const pendingProposals = data.proposals?.filter((proposal) => proposal.status === 'PENDING') || [];
                  if (pendingProposals.length >= 2) {
                    setAlertMessage(`최초 제출 가능한\n제안서는 2개 입니다`);
                  } else {
                    setIsOpen(!isOpen);
                  }
                }}
              >
                작성하기
              </ButtonV2>
            )}
        </nav>
      </header>
      <main>
        {data.proposals === undefined ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <Typography variant="body2">제안서를 추가해주세요.</Typography>
            <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => setIsOpen(!isOpen)}>
              작성하기
            </ButtonV2>
          </div>
        ) : (
          <table className="w-full text-center">
            <thead className="border-y border-y-primary-gray-100 text-[15px] font-medium text-primary-gray-500">
              <tr className="flex w-full items-center justify-between gap-[16px] px-[24px] py-[9px]">
                <td className="w-[68px]">순위</td>
                <td className="w-[200px]">과목</td>
                <td className="w-[416px]">연구주제</td>
                <td className="w-[156px]">수정일</td>
                <td className="w-[156px]">피드백</td>
                <td className="w-[156px]">상태</td>
              </tr>
            </thead>
            <tbody>
              {data?.proposals
                ?.sort((a, b) => a.rank - b.rank)
                .map((proposal) => {
                  return (
                    <tr
                      key={proposal.id}
                      className="flex w-full items-center justify-between gap-[16px] border-b border-b-primary-gray-100 px-[24px] py-[9px] text-15 font-medium"
                    >
                      <td className="w-[68px]">{proposal.rank}</td>
                      <td title={proposal.subject} className="line-clamp-1 w-[200px]">
                        {proposal.subject}
                      </td>
                      <td
                        className="line-clamp-1 w-[416px] cursor-pointer"
                        onClick={() => push(`/ib/student/ee/${data.id}/proposal/${proposal.id}`)}
                      >
                        {proposal.researchTopic}
                      </td>
                      <td className="w-[156px]">{format(new Date(proposal.updatedAt), 'yyyy.MM.dd')}</td>
                      <td className="w-[156px]">
                        {(proposal.status === 'ACCEPT' && feedback) ||
                        (proposal.status === 'SUBMIT' && data.status === 'REJECT_PLAN') ? (
                          <ButtonV2
                            variant="outline"
                            color="gray400"
                            size={32}
                            className={`${
                              unreadCount && unreadCount > 0 && 'mx-auto flex flex-row items-center gap-1'
                            }`}
                            onClick={() => {
                              if (unreadCount) {
                                handleFeedbackOpen();
                              } else {
                                push(`/ib/student/ee/${data.id}/proposal/${proposal.id}`);
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
                      <td className="m-auto flex w-[156px] items-center justify-center">
                        {proposal.status === 'ACCEPT' && data.status === 'REJECT_PLAN' ? (
                          <BadgeV2 color="gray" type="line" size={24}>
                            보완필요
                          </BadgeV2>
                        ) : proposal.status === 'PENDING' ? (
                          <>-</>
                        ) : proposal.status === 'ACCEPT' && data.status === 'WAIT_PLAN_APPROVE' ? (
                          <BadgeV2 color={'gray'} type="line" size={24}>
                            제안
                          </BadgeV2>
                        ) : (
                          <BadgeV2 color={statusBadge[proposal.status]?.color || 'gray'} type="line" size={24}>
                            {statusBadge[proposal.status]?.label || '제안'}
                          </BadgeV2>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </main>

      {isOpen && (
        <IbEeProposal
          modalOpen={isOpen}
          setModalClose={() => setIsOpen(!isOpen)}
          type="proposal"
          projectId={Number(data.id)}
          onSuccess={handleSuccess}
        />
      )}
      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={data.id}
          referenceTable="IB"
        />
      )}
      {modalOpen && (
        <PopupModal
          modalOpen={modalOpen}
          setModalClose={() => setModalOpen(!modalOpen)}
          title="제안서 순위 변경"
          bottomBorder={false}
          footerButtons={
            <ButtonV2 variant="solid" color="orange800" size={48} onClick={handleSaveRank}>
              저장하기
            </ButtonV2>
          }
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="proposals">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3">
                  {proposalItems.map((proposal, index) => (
                    <Draggable key={proposal.id} draggableId={String(proposal.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex flex-row items-center gap-4"
                        >
                          <Typography variant="title3" className="min-w-max">
                            {proposal.rank}순위
                          </Typography>
                          <div
                            className={`hover: flex w-full flex-row items-center gap-4 rounded-xl border border-primary-gray-200 p-6 hover:border-primary-orange-200 hover:bg-primary-orange-50 ${
                              snapshot.isDragging
                                ? 'border-primary-orange-400 bg-primary-orange-50 shadow-md'
                                : 'border-primary-gray-200 hover:border-primary-orange-200 hover:bg-primary-orange-50'
                            }`}
                          >
                            <div>
                              <SolidSVGIcon.Handle />
                            </div>
                            <div className="flex flex-1 flex-col">
                              <Typography variant="title3">{proposal.researchTopic}</Typography>
                              <Typography variant="body3" className="text-primary-gray-600">
                                {format(new Date(proposal.createdAt), 'yyyy.MM.dd')}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </PopupModal>
      )}
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </section>
  );
}
