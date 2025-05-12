import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useIBRPPFUpdateInfo } from 'src/container/ib-rppf';
import { useRPPFGetById } from 'src/container/ib-rppf-findId';
import { RequestRPPFInfoUpdateDto, ResponseIBDto, ResponseRPPFDto } from 'src/generated/model';
import { PopupModal } from '../../PopupModal';
import AlertV2 from '../../common/AlertV2';
import { ButtonV2 } from '../../common/ButtonV2';
import { Check } from '../../common/Check';
import { Input } from '../../common/Input';
import Stepper from '../../common/Stepper';
import { TextareaV2 } from '../../common/TextareaV2';
import { Typography } from '../../common/Typography';

interface RppfListPopupProps {
  modalOpen: boolean;
  setModalClose: () => void;
  ibId: number;
  rppfId: number;
  rppfData?: ResponseRPPFDto;
  IBData: ResponseIBDto;
  type?: 'VIEW' | 'CREATE' | null;
}

export default function RppfIbSubmitInformPopup({
  modalOpen,
  setModalClose,
  ibId,
  rppfId,
  IBData,
  type = 'CREATE',
  rppfData,
}: RppfListPopupProps) {
  const [rppfState, setRppfState] = useState<ResponseRPPFDto | null>(rppfData || null);
  const { data: fetchedRppf, isLoading: isRppfLoading } = useRPPFGetById(Number(ibId), Number(rppfId), rppfData);
  const [guidanceTime, setGuidanceTime] = useState<number>(rppfState?.guidanceHours || 3);
  const [academicIntegrityConsent, setAcademicIntegrityConsent] = useState<boolean>(
    rppfState?.academicIntegrityConsent || false,
  );
  const [check, setChecked] = useState<boolean>(rppfState?.academicIntegrityConsent || false);
  const [teacherFeedback, setTeacherFeedback] = useState<string>(rppfState?.teacherFeedback || '');
  const [teacherSignature, setTeacherSignature] = useState<string>(rppfState?.teacherSignature || '');
  const [wordCounts, setWordCounts] = useState<number[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const { updateIBRPPFInfo } = useIBRPPFUpdateInfo({
    onSuccess: () => {
      setAlertMessage(`RPPF 정보가\n저장되었습니다`);
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error);
    },
  });

  useEffect(() => {
    if (!rppfData && fetchedRppf) {
      setRppfState(fetchedRppf);
    }
  }, [rppfData, fetchedRppf]);

  useEffect(() => {
    if (rppfState?.contents) {
      const initialWordCounts = rppfState.contents.map((content) => Number(content.wordCount) || 0);
      setWordCounts(initialWordCounts);
    }
  }, [rppfState]);

  if (!rppfState) {
    return <div>RPPF 정보를 불러오지 못하였습니다.</div>;
  }

  return (
    <PopupModal
      modalOpen={modalOpen}
      setModalClose={setModalClose}
      title="IB 제출정보 기입 및 확인"
      bottomBorder={false}
      containerClassName="px-0"
      headerClassName="px-8"
      footerClassName="px-8"
      {...(type !== 'VIEW' && {
        footerButtons: (
          <ButtonV2
            size={48}
            variant="solid"
            color="orange800"
            className="w-[88px]"
            disabled={!(academicIntegrityConsent && check && teacherFeedback && teacherSignature)}
            onClick={() => {
              const requestData: RequestRPPFInfoUpdateDto = {
                teacherSignature: teacherSignature || '',
                guidanceHours: guidanceTime,
                teacherFeedback: teacherFeedback || '',
                academicIntegrityConsent,
              };

              updateIBRPPFInfo({
                ibId,
                rppfId: rppfId,
                data: requestData,
              });
            }}
          >
            저장하기
          </ButtonV2>
        ),
      })}
    >
      <div className="flex flex-col">
        <div className="border-b border-b-primary-gray-100 px-8">
          {/* 학생 정보 */}
          <div className="flex items-center gap-[6px] rounded-lg border border-primary-gray-200 bg-primary-gray-50 px-4 py-[6px]">
            <Typography variant="title3" className="text-primary-gray-900">
              {IBData?.leader.studentGroup.group.grade}
              {String(IBData?.leader.studentGroup.group.klass).padStart(2, '0')}
              {String(IBData?.leader.studentGroup.studentNumber).padStart(2, '0')}
            </Typography>
            <Typography variant="title3" className="text-primary-gray-900">
              {IBData?.leader.name}
            </Typography>
            <Typography variant="caption" className="w-[428px] text-right text-primary-gray-500">
              Candidate personal code: {'IBPSH394_312'}
            </Typography>
          </div>

          {/* 학문적 진실성 지도교사 서약서 */}
          <div className="my-8 flex flex-col gap-3">
            <Typography variant="title3" className="text-primary-gray-900">
              학문적 진실성 지도교사 서약서
            </Typography>
            <Typography variant="body2" className="rounded-lg bg-primary-gray-50 px-4 py-[13px] text-primary-gray-700">
              에세이는 전적으로 학생 본인에 의해 쓰였으며, 인용하였다고 출처 표시를 한 부분을 제외하고 어떠한 부분도
              다른 저자(인공지능)의 자료를 사용하지 않았음을 약속합니다. 추후 학업적 진실성에 어긋난다고 확인되는 경우
              IB 졸업장이 취소될 수 있음을 인지하고 있습니다.
            </Typography>
            <div className="flex items-center gap-2">
              <Check.Basic
                checked={academicIntegrityConsent}
                onChange={() => setAcademicIntegrityConsent(!academicIntegrityConsent)}
                disabled={type === 'VIEW'}
              />
              <Typography variant="title3" className="font-medium text-primary-gray-900">
                위 내용을 확인 하였으며, 동의합니다.
              </Typography>
            </div>
          </div>
        </div>

        {/* 지도 시간 입력 */}
        <div className="mt-8 flex items-center justify-between border-b border-b-primary-gray-100 px-8 pb-8">
          <div className="flex flex-col gap-2">
            <Typography variant="title3" className="text-primary-gray-900">
              지도 시간 입력
            </Typography>
            <Typography variant="caption" className="text-primary-gray-500">
              IB에서는 3~5시간을 할애하기를 권장합니다. (필수성찰세션 3회 소요시간 포함)
            </Typography>
          </div>
          <div className="h-8 w-[104px]">
            <Stepper number={guidanceTime} setNumber={setGuidanceTime} disabled={type === 'VIEW'} />
          </div>
        </div>

        {/* 제출내역 */}
        <div className="mt-8 flex flex-col gap-3 border-b border-b-primary-gray-100 px-8">
          <div className="flex justify-between">
            <Typography variant="title3" className="text-primary-gray-900">
              제출내역
            </Typography>
            <Typography variant="caption" className="text-primary-gray-500">
              총 단어수{' '}
              <span className="text-primary-orange-800">{wordCounts.reduce((sum, count) => sum + count, 0)}</span>
            </Typography>
          </div>

          {/* RPPF 1차 */}
          <div className="flex flex-col gap-3 rounded-lg border border-primary-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Typography variant="title3" className="text-primary-gray-900">
                RPPF 1차
              </Typography>
              <Typography variant="caption" className="text-primary-gray-500">
                최초 제출일 : {format(new Date(rppfState?.contents[0].createdAt), 'yyyy.MM.dd')}
              </Typography>
            </div>
            <Typography variant="body2" className="text-primary-gray-700">
              {rppfState?.contents[0].text}
            </Typography>
            <Typography variant="caption" className="text-primary-gray-500">
              단어수 <span className="text-primary-orange-800">{rppfState?.contents[0].wordCount}</span>
            </Typography>
          </div>

          {/* RPPF 2차 */}
          <div className="flex flex-col gap-3 rounded-lg border border-primary-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Typography variant="title3" className="text-primary-gray-900">
                RPPF 2차
              </Typography>
              <Typography variant="caption" className="text-primary-gray-500">
                최초 제출일 : {format(new Date(rppfState?.contents[1].createdAt), 'yyyy.MM.dd')}
              </Typography>
            </div>
            <Typography variant="body2" className="text-primary-gray-700">
              {rppfState?.contents[1].text}
            </Typography>
            <Typography variant="caption" className="text-primary-gray-500">
              단어수 <span className="text-primary-orange-800">{rppfState?.contents[1].wordCount}</span>
            </Typography>
          </div>

          {/* RPPF 3차 */}
          <div className="flex flex-col gap-3 rounded-lg border border-primary-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Typography variant="title3" className="text-primary-gray-900">
                RPPF 3차
              </Typography>
              <Typography variant="caption" className="text-primary-gray-500">
                최초 제출일 : {format(new Date(rppfState?.contents[2].createdAt), 'yyyy.MM.dd')}
              </Typography>
            </div>
            <Typography variant="body2" className="text-primary-gray-700">
              {rppfState?.contents[2].text}
            </Typography>
            <Typography variant="caption" className="text-primary-gray-500">
              단어수 <span className="text-primary-orange-800">{rppfState?.contents[2].wordCount}</span>
            </Typography>
          </div>

          <div className="flex flex-col gap-3 ">
            <Typography variant="body2" className="rounded-lg bg-primary-gray-50 px-4 py-[13px] text-primary-gray-700">
              학생의 소논문이 학문적 진실성에 어긋나지 않고, 학생 스스로 힘으로 작성되었다는 것을 지도교사로서
              확인했습니다.
            </Typography>
            <div className="mb-8 flex items-center gap-2">
              <Check.Basic checked={check} onChange={() => setChecked(!check)} disabled={type === 'VIEW'} />
              <Typography variant="title3" className="font-medium text-primary-gray-900">
                위 내용을 확인 하였으며, 동의합니다.
              </Typography>
            </div>
          </div>
        </div>

        {/* 지도교사 의견 작성 */}
        <div className="mt-8 flex flex-col gap-3 px-8">
          <Typography variant="title3" className="text-primary-gray-900">
            지도교사 의견 작성
          </Typography>
          {type === 'VIEW' ? (
            <div className="flex flex-col gap-3 rounded-lg border border-primary-gray-200 bg-primary-gray-100 p-4">
              {teacherFeedback}
            </div>
          ) : (
            <TextareaV2
              placeholder="지도 의견을 작성해주세요."
              readonlyBackground="bg-primary-gray-100"
              className="h-[200px]"
              readonly={!academicIntegrityConsent}
              value={teacherFeedback}
              onChange={(e) => setTeacherFeedback(e.target.value)}
            />
          )}

          <Input.Label
            label="지도교사 서명"
            size={40}
            type="text"
            placeholder="지도 의견 작성 후 자동으로 입력됩니다."
            value={teacherSignature}
            onChange={(e) => setTeacherSignature(e.target.value)}
            readonly={!academicIntegrityConsent}
            disabled={type === 'VIEW'}
          />
        </div>
      </div>
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setModalClose()} />}
    </PopupModal>
  );
}
