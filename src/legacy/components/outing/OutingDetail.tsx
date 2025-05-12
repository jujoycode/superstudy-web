import { useRecoilValue } from 'recoil';
import { OutingStatus, OutingTypeEnum, OutingUse, ResponseCreateOutingDto, Role } from 'src/generated/model';
import { useSignedUrl } from 'src/lib/query';
import { meState } from 'src/store';
import { DateFormat, DateUtil } from 'src/util/date';
import { getNickName, getPeriodStrEx } from 'src/util/status';
import { makeDateToString, makeDateToStringByFormat } from 'src/util/time';
import { Button } from '../common/Button';

interface OutingCardProps {
  outing: ResponseCreateOutingDto | undefined;
  onResendAlimtalk?: () => Promise<void>;
}

export function OutingDetail({ outing, onResendAlimtalk }: OutingCardProps) {
  const me = useRecoilValue(meState);

  const startAt = DateUtil.formatDate(outing?.startAt || '', DateFormat['YYYY-MM-DD HH:mm']);
  const endAt = DateUtil.formatDate(outing?.endAt || '', DateFormat['YYYY-MM-DD HH:mm']);

  const { data: parentSignature } = useSignedUrl(outing?.parentSignature);
  const { data: approver1Signature } = useSignedUrl(outing?.approver1Signature);
  const { data: approver2Signature } = useSignedUrl(outing?.approver2Signature);
  const { data: approver3Signature } = useSignedUrl(outing?.approver3Signature);
  const { data: approver4Signature } = useSignedUrl(outing?.approver4Signature);
  const { data: approver5Signature } = useSignedUrl(outing?.approver5Signature);

  return (
    <>
      <div className="mb-5 w-full min-w-max text-center text-xl font-bold md:text-3xl">
        {outing?.type ? outing.type + '증' : ''}
      </div>
      <div className="text-xl font-bold">
        [{outing?.type}] {outing?.studentName}
        {getNickName(outing?.studentNickName)} {outing?.studentGradeKlass} {outing?.studentNumber}번
      </div>

      <div className="relative">
        {/* 반투명 레이어 */}
        {outing?.outingStatus === 'PROCESSED' && new Date(endAt) < new Date() && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-30 text-3xl font-bold text-white">
            기 간 만 료
          </div>
        )}

        {/* 기존 테이블 */}
        <table className="w-full text-center text-sm md:text-base">
          <tbody>
            <tr>
              <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">이름</td>
              <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">
                {outing?.studentName}
                {getNickName(outing?.studentNickName)}
              </td>
            </tr>
            <tr>
              <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">학번</td>
              <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">
                {outing?.studentGradeKlass} {outing?.studentNumber}번
              </td>
            </tr>
            <tr>
              <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">유형</td>
              <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">
                {outing?.type === OutingTypeEnum.확인 && outing?.type2} {outing?.type}
              </td>
            </tr>
            <tr>
              <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">사유</td>
              <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">{outing?.reason}</td>
            </tr>
            <tr>
              <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">일시</td>
              <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">
                {outing?.startPeriod !== 0 && outing?.endPeriod !== 0
                  ? makeDateToString(startAt) +
                    ' ' +
                    getPeriodStrEx(outing?.startPeriod) +
                    ' ~ ' +
                    makeDateToString(endAt) +
                    ' ' +
                    getPeriodStrEx(outing?.endPeriod)
                  : `${startAt} ~ ${endAt}`}
              </td>
            </tr>
            <tr>
              <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">신청일</td>
              <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">
                {outing?.reportedAt && makeDateToStringByFormat(new Date(outing.reportedAt))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="my-1">
        {/* 작성자가 선생님일 경우 */}
        {outing?.writerName && (
          <div className="flex w-full items-center justify-end space-x-2">
            <div>
              <div className="flex w-full flex-col items-end">
                {
                  <div className="mr-10 mt-5 min-w-max text-right">
                    신고자 : <span className="font-bold"> {outing?.writerName}</span> 선생님
                  </div>
                }
              </div>
            </div>
          </div>
        )}
        {(outing?.outingStatus === OutingStatus.BEFORE_PARENT_APPROVAL || outing?.parentSignature) && (
          <div className="flex w-full items-center justify-end space-x-2">
            <div className="flex w-full flex-col items-end">
              {
                <div
                  className="h-20 bg-contain bg-right bg-no-repeat"
                  style={{ backgroundImage: `url(${parentSignature})` }}
                >
                  <div className="mr-10 mt-5 min-w-max text-right font-bold">
                    보호자 : {outing?.parentName} &nbsp;&nbsp;&nbsp;
                    {outing?.parentSignature ? ' (인)' : '승인 전'}
                  </div>
                </div>
              }
            </div>
          </div>
        )}
        {outing?.approver1Id !== 0 && outing?.approver1Title && (
          <div className="flex w-full items-center justify-end space-x-2">
            <div className="flex w-full flex-col items-end">
              {
                <div
                  className="h-20 bg-contain bg-right bg-no-repeat"
                  style={{ backgroundImage: `url(${approver1Signature})` }}
                >
                  <div className="mr-10 mt-5 min-w-max text-right font-bold">
                    {outing?.approver1Title}: {outing?.approver1Name} &nbsp;&nbsp;&nbsp;
                    {outing?.approver1Signature ? ' (인)' : '승인 전'}
                  </div>
                </div>
              }
            </div>
          </div>
        )}

        {outing?.approver2Id !== 0 && outing?.approver2Title && (
          <div className="flex w-full items-center justify-end space-x-2">
            <div>
              <div className="flex w-full flex-col items-end">
                {
                  <div
                    className="h-20 bg-contain bg-right bg-no-repeat"
                    style={{ backgroundImage: `url(${approver2Signature})` }}
                  >
                    <div className="mr-10 mt-5 min-w-max text-right font-bold">
                      {outing?.approver2Title}: {outing?.approver2Name} &nbsp;&nbsp;&nbsp;
                      {outing?.approver2Signature ? ' (인)' : '승인 전'}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        )}

        {outing?.approver3Id !== 0 && outing?.approver3Title && (
          <div className="flex w-full items-center justify-end space-x-2">
            <div>
              <div className="flex w-full flex-col items-end">
                {
                  <div
                    className="h-20 bg-contain bg-right bg-no-repeat"
                    style={{ backgroundImage: `url(${approver3Signature})` }}
                  >
                    <div className="mr-10 mt-5 min-w-max text-right font-bold">
                      {outing?.approver3Title}: {outing?.approver3Name} &nbsp;&nbsp;&nbsp;
                      {outing?.approver3Signature ? ' (인)' : '승인 전'}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        )}

        {outing?.approver4Id !== 0 && outing?.approver4Title && (
          <div className="flex w-full items-center justify-end space-x-2">
            <div>
              <div className="flex w-full flex-col items-end">
                {
                  <div
                    className="h-20 bg-contain bg-right bg-no-repeat"
                    style={{ backgroundImage: `url(${approver4Signature})` }}
                  >
                    <div className="mr-10 mt-5 min-w-max text-right font-bold">
                      {outing?.approver4Title}: {outing?.approver4Name} &nbsp;&nbsp;&nbsp;
                      {outing?.approver4Signature ? ' (인)' : '승인 전'}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        )}

        {outing?.approver5Id !== 0 && outing?.approver5Title && (
          <div className="flex w-full items-center justify-end space-x-2">
            <div className="flex w-full flex-col items-end">
              {
                <div
                  className="h-20 bg-contain bg-right bg-no-repeat"
                  style={{ backgroundImage: `url(${approver5Signature})` }}
                >
                  <div className="mr-10 mt-5 min-w-max text-right font-bold">
                    {outing?.approver5Title}: {outing?.approver5Name} &nbsp;&nbsp;&nbsp;
                    {outing?.approver5Signature ? ' (인)' : '승인 전'}
                  </div>
                </div>
              }
            </div>
          </div>
        )}
      </div>

      {outing?.outingStatus !== 'PROCESSED' && (
        <div className="text-14 text-gray-700">
          {`확인증 및 외출증 신청기간이 현재 시점보다 과거인 경우 자동으로 '기간만료'문구가 보여집니다. 이 경우 확인증 사유 수정 또는 교사의 승인은 정상적으로 작동됩니다.`}
        </div>
      )}

      {me?.role !== Role.USER &&
        me?.school.isOutingActive === OutingUse.USE_PARENT_APPROVE &&
        outing?.outingStatus !== OutingStatus.BEFORE_PARENT_APPROVAL &&
        outing?.outingStatus !== OutingStatus.PROCESSED &&
        !outing?.parentSignature && (
          <div className="flex w-full items-center justify-end space-x-2">
            <div className="mr-2 font-bold text-red-500"> *주의 : 보호자 승인을 요청하시겠습니까?</div>
            <Button.lg
              children="승인 요청"
              onClick={() => {
                if (onResendAlimtalk) {
                  onResendAlimtalk();
                }
              }}
              className="filled-primary"
            />
          </div>
        )}
    </>
  );
}
