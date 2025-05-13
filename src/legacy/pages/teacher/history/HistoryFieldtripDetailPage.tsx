import { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { ErrorBlank, SuperModal } from 'src/components';
import { Blank, Section, Textarea } from 'src/components/common';
import { Button } from 'src/components/common/Button';
import { FieldtripPaper } from 'src/components/fieldtrip/FieldtripPaper';
import { FieldtripSeparatePaper } from 'src/components/fieldtrip/FieldtripSeparatePaper';
import { useTeacherFieldtripDetail } from 'src/container/teacher-fieldtrip-detail';
import { ResponseUserDto } from 'src/generated/model';
import { approveButtonType } from 'src/types';
import { extractReactData, getDoc } from 'src/util/pdf';
import { buttonEnableState } from 'src/util/permission';
import { getNickName } from 'src/util/status';
import { makeDateToString, makeStartEndToString, makeTimeToString } from 'src/util/time';

interface HistoryFieldtripDetailPageProps {
  setOpen: (b: boolean) => void;
  setFieldtripId: (n: number) => void;
  setAgreeAll: (b: boolean) => void;
  me: ResponseUserDto | undefined;
}

export function HistoryFieldtripDetailPage({
  setOpen,
  setFieldtripId,
  setAgreeAll,
  me,
}: HistoryFieldtripDetailPageProps) {
  const { push } = useHistory();
  const { id } = useParams<{ id: string }>();
  const ref = useRef(null);
  const separatePaperRefs = useRef<any[]>([]);
  const planRef = useRef(null);

  const [notApprovedReason, setNotApprovedReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [clicked, setClicked] = useState(false);
  const [readState, setReadState] = useState(true);

  const [confirmHalfSubmit, setConfirmHalfSubmit] = useState(false);

  const [download, setDownload] = useState(false);

  const {
    denyFieldtrip,
    deleteAppealFieldtrip,
    isLoading,
    fieldtrip,
    deleteAppeal,
    loading,
    deny,
    errorMessage,
    setDeleteAppeal,
    setDeny,
    setLoading,
  } = useTeacherFieldtripDetail({ id });

  useEffect(() => {
    setFieldtripId(Number(id));
  }, [id, setFieldtripId]);

  // 결재권자 인지. 결재라인에 있으면 true, 없으면 false
  const approver =
    fieldtrip?.approver1Id === me?.id ||
    fieldtrip?.approver2Id === me?.id ||
    fieldtrip?.approver3Id === me?.id ||
    fieldtrip?.approver4Id === me?.id ||
    fieldtrip?.approver5Id === me?.id;

  const approvedLine = [
    fieldtrip?.approver1Signature && fieldtrip?.approver1Id,
    fieldtrip?.approver2Signature && fieldtrip?.approver2Id,
    fieldtrip?.approver3Signature && fieldtrip?.approver3Id,
    fieldtrip?.approver4Signature && fieldtrip?.approver4Id,
    fieldtrip?.approver5Signature && fieldtrip?.approver5Id,
  ];
  // 내가 승인한 건 : ture , 승인 안한 건 : false
  const isApproved = approvedLine.includes(me?.id);

  // 승인할 차례 : true, 승인전/승인후 : false
  const nowApprove = fieldtrip?.nextApproverId === me?.id;

  // 승인 전 = !isApproved && !nowApprove
  // 승인 후 = isApproved && !nowApprove

  const checkButtonDisable = (bottonType: approveButtonType) => {
    return !buttonEnableState(
      bottonType,
      approver,
      isApproved,
      nowApprove,
      fieldtrip?.fieldtripStatus || '',
      fieldtrip?.studentGradeKlass === me?.klassGroupName,
    );
  };

  let homeplans: any = [];

  try {
    if (fieldtrip?.type === 'HOME') {
      const content = JSON.parse(fieldtrip?.content || '[]');
      if (content[0].subject1) {
        homeplans = content?.slice(1);
      } else {
        const subContent = content?.slice(5);
        homeplans = Array.from({ length: Math.ceil(subContent.length / 10) }, (_, index) =>
          subContent.slice(index * 10, index * 10 + 10),
        );
      }
    }
  } catch (err) {
    console.log(err);
  }

  return (
    <div className="h-screen-10 bg-white py-5 md:h-screen-10 md:rounded-lg md:border">
      {loading && <Blank reversed />}
      {isLoading && <Blank reversed />}
      {errorMessage && <ErrorBlank text={errorMessage} />}

      <div className="relative h-full w-auto overflow-scroll">
        <div className="flex w-full items-center justify-start space-x-2 px-5">
          <div className="cursor-pointer text-brand-1 underline">신청서</div>
          <div
            className="cursor-pointer text-brand-1 underline"
            onClick={() => fieldtrip && push(`/teacher/fieldtrip/notice/${fieldtrip.id}`)}
          >
            통보서
          </div>
          <div
            className="cursor-pointer text-brand-1 underline"
            onClick={() => fieldtrip && push(`/teacher/fieldtrip/result/${fieldtrip.id}`)}
          >
            결과보고서
          </div>
        </div>

        {fieldtrip?.fieldtripStatus === 'RETURNED' && fieldtrip?.notApprovedReason && fieldtrip?.updatedAt && (
          <div className="mx-5 flex items-center justify-between rounded-lg bg-brand-5 px-5 py-2">
            <div className="text-brand-1">{fieldtrip?.notApprovedReason}</div>
            <div className="text-sm text-gray-500">
              {makeDateToString(fieldtrip?.updatedAt)} {makeTimeToString(fieldtrip?.updatedAt)}에 마지막으로 수정
            </div>
          </div>
        )}
        {fieldtrip?.updateReason && fieldtrip?.updatedAt && (
          <div className="flex items-center justify-between rounded-lg bg-brand-5 px-5 py-2">
            <div className="text-brand-1">{fieldtrip?.updateReason}</div>
            <div className="text-sm text-gray-500">
              {makeDateToString(fieldtrip?.updatedAt)} {makeTimeToString(fieldtrip?.updatedAt)}에 마지막으로 수정
            </div>
          </div>
        )}

        <div className="mx-5 mt-2">
          ※ 연간 {me?.school?.fieldtripDays} 일 중, 금회 {fieldtrip?.usedDays} 일, 누적{' '}
          {me?.school?.fieldtripDays &&
            fieldtrip?.currentRemainDays &&
            fieldtrip?.usedDays &&
            me?.school.fieldtripDays - fieldtrip.currentRemainDays + fieldtrip.usedDays}{' '}
          일 사용하여 잔여{' '}
          {fieldtrip?.currentRemainDays && fieldtrip?.usedDays && fieldtrip?.currentRemainDays - fieldtrip?.usedDays} 일
          남았습니다.
        </div>
        {fieldtrip?.type === 'HOME' && fieldtrip?.usedDays > 1 && homeplans?.length === 0 && (
          <div className="mx-5 mt-2 text-red-500">※ 전 일정 동일한 계획으로 가정학습을 신청합니다.</div>
        )}

        <div ref={ref} className={`h-[1100px] ${download ? 'w-[778px] p-5' : 'w-full'} bg-white`}>
          <FieldtripPaper school={me?.school} fieldtrip={fieldtrip} type="신청서" />
        </div>
        {fieldtrip?.type === 'HOME' && (
          <>
            {homeplans?.map((content: any, i: number) => (
              <div
                key={i}
                ref={(el) => (separatePaperRefs.current[i] = el)}
                className="h-[1058px] w-[760px] bg-white p-5"
              >
                <FieldtripSeparatePaper
                  studentName={fieldtrip?.student?.name + getNickName(fieldtrip?.student?.nickName)}
                  studentGradeKlass={fieldtrip?.studentGradeKlass + ' ' + fieldtrip?.studentNumber + '번'}
                  fieldtrip={fieldtrip}
                  index={i + 1}
                  content={content}
                  type="신청서"
                />
              </div>
            ))}
          </>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 pt-3 md:grid-cols-1 md:pt-8">
        <Button.xl
          children="다운로드"
          disabled={clicked || checkButtonDisable(approveButtonType.DOWNLOAD)}
          onClick={async () => {
            if (ref?.current) {
              setDownload(true);
            }
          }}
          className="filled-green max-md:hidden"
        />
        {/* <Button.xl
          children={fieldtrip?.fieldtripStatus === 'DELETE_APPEAL' ? '삭제대기' : '삭제요청'}
          disabled={checkButtonDisable(approveButtonType.DELETE)}
          onClick={() => setDeleteAppeal(true)}
          className="filled-red"
        />
        <Button.xl
          children={fieldtrip?.fieldtripStatus === 'RETURNED' ? '반려됨' : '반려'}
          disabled={checkButtonDisable(approveButtonType.RETURN)}
          onClick={() => setDeny(true)}
          className="filled-blue"
        />
        <Button.xl
          children={isApproved ? '승인 후 수정' : '수정'}
          disabled={checkButtonDisable(approveButtonType.EDIT)}
          onClick={() => setReadState(false)}
          className="filled-yellow"
        />
        <Button.xl
          children={nowApprove ? '승인' : isApproved ? '승인 완료' : '승인 대기'}
          disabled={checkButtonDisable(approveButtonType.APPROVE)}
          onClick={() => {
            if (
              (fieldtrip?.startPeriodS &&
                fieldtrip?.endPeriodE &&
                (fieldtrip?.startPeriodS > 0 || fieldtrip?.endPeriodE > 0)) ||
              (fieldtrip?.usedDays && fieldtrip?.usedDays < 1)
            ) {
              setConfirmHalfSubmit(true);
            } else {
              setOpen(true);
              setAgreeAll(false);
            }
          }}
          className="filled-primary"
        /> */}
      </div>
      <SuperModal modalOpen={download} setModalClose={() => setDownload(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            체험학습 신청서를 다운로드 하시겠습니까?
          </div>
          <div className="flex space-x-2">
            <Button.lg
              children="다운로드"
              disabled={clicked}
              onClick={async () => {
                setClicked(true);
                if (ref?.current) {
                  const { addPage, download } = getDoc();
                  const imgData = await extractReactData(ref.current);
                  await addPage(imgData, 'JPEG');

                  if (planRef?.current) {
                    const planImgData = await extractReactData(planRef.current);
                    await addPage(planImgData);
                  }

                  for (const ref of separatePaperRefs.current) {
                    if (ref) {
                      const paperImgData = await extractReactData(ref);
                      await addPage(paperImgData);
                    }
                  }

                  const fileName = `체험학습 신청서_${
                    fieldtrip?.startAt && fieldtrip?.endAt && makeStartEndToString(fieldtrip.startAt, fieldtrip.endAt)
                  }_${fieldtrip?.student?.name}.pdf`;
                  await download(fileName);
                }
                setClicked(false);
                setDownload(false);
              }}
              className="filled-green w-full"
            />
            <Button.lg
              children="취소"
              onClick={async () => {
                setClicked(false);
                setDownload(false);
              }}
              className="filled-gray w-full"
            />
          </div>
        </div>
      </SuperModal>
      <SuperModal modalOpen={deny} setModalClose={() => setDeny(false)} className="w-max">
        <Section className="mt-7">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            이 학생의 체험학습 신청서를 반려하시겠습니까?
          </div>
          <Textarea
            placeholder="반려 이유"
            value={notApprovedReason}
            onChange={(e) => setNotApprovedReason(e.target.value)}
          />
          <Button.xl
            children="반려하기"
            disabled={!notApprovedReason}
            onClick={() => {
              setLoading(true);
              denyFieldtrip({ id: Number(id), data: { reason: notApprovedReason } });
            }}
            className="filled-primary"
          />
        </Section>
      </SuperModal>
      <SuperModal modalOpen={deleteAppeal} setModalClose={() => setDeleteAppeal(false)} className="w-max">
        <Section className="mt-7">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            이 체험학습 신청서를 삭제하도록 요청하시겠습니까?
          </div>
          <Textarea placeholder="삭제 이유" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
          <span className="text-sm text-red-400">* 교사가 삭제요청하면 학생 또는 보호자가 삭제할 수 있습니다.</span>
          <Button.xl
            children="삭제 요청하기"
            disabled={!deleteReason}
            onClick={() => {
              setLoading(true);
              deleteAppealFieldtrip({ id: Number(id), data: { reason: deleteReason } });
            }}
            className="filled-red"
          />
        </Section>
      </SuperModal>

      <SuperModal modalOpen={confirmHalfSubmit} setModalClose={() => setConfirmHalfSubmit(false)} className="w-max">
        <Section className="mt-7">
          <div className="w-full text-sm font-bold text-gray-900 md:mb-6 md:text-lg">
            신청기간에 반일이 포함되어 있습니다. 반일 기준에 맞는지 확인 후 결재바랍니다.
            <br />
            <div className="mb-6 ml-6 mr-6 mt-6 whitespace-pre-line text-xs">
              {`* 교외체험학습 신청시, 수업중 일부만 출석하고 일부는 결석하는 경우에 반일 신청을 합니다. 
            ex1) 아침에 등교 후 조퇴하고 할머니댁에 가는 경우
            ex2) 여행을 다녀와서 늦게 등교하는 경우
                
            * 시작일과 종료일에 반일을 지정할 수 있으며, 반일은 0.5일로 계산합니다. 
            단, 반일 사용 여부는 소속 학교 규정을 따릅니다. 	
            
            * 반일 신청은 하루 동안의 전체 수업 중 절반 이상을 참석해야 합니다. 
             - 5교시 수업일 : 2시간(교시)까지 불참 가능
                - 6교시 수업일 : 3시간(교시)까지 불참 가능
                - 7교시 수업일 : 3시간(교시)까지 불참 가능`}
            </div>
            반일기준 체험활동 신청 시간이 교칙에 맞습니까?
          </div>
          <Button.xl
            children="교칙에 맞습니다. 승인함"
            onClick={() => {
              setConfirmHalfSubmit(false);
              setOpen(true);
              setAgreeAll(false);
            }}
            className="filled-primary"
          />
          <Button.xl
            children="교칙에 맞지 않습니다. 승인취소"
            onClick={() => {
              setConfirmHalfSubmit(false);
            }}
            className="filled-gray"
          />
        </Section>
      </SuperModal>
    </div>
  );
}
