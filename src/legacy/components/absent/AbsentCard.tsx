import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Absent, AbsentStatus, ResponsePaginatedAbsentDto } from 'src/generated/model';
import { useLanguage } from 'src/hooks/useLanguage';
import { getNickName, getPeriodStr } from 'src/util/status';
import { makeStartEndToString, makeTimeToString } from 'src/util/time';

interface AbsentCardProps {
  absent: ResponsePaginatedAbsentDto['items'][number];
  submitAbsent: ({ id, submitted, callback }: { id: Absent['id']; submitted: boolean; callback: () => void }) => void;
  submitNiceAbsent: (params: { id: Absent['id']; submitted: boolean; callback: () => void }) => void;
  page: number;
  limit: number;
  type: string;
}

export function AbsentCard({ absent, submitAbsent, submitNiceAbsent, page, limit, type }: AbsentCardProps) {
  const { t } = useLanguage();
  const { pathname, search } = useLocation();
  const { push } = useHistory();
  const [clicked, setClicked] = useState(false);

  let text = <div className="text-sm text-red-500"></div>;

  switch (absent?.absentStatus) {
    case AbsentStatus.BEFORE_PARENT_CONFIRM:
      text = <div className="text-xs text-red-500 md:text-sm">{t('before_parent_approval', '학부모 승인 전')}</div>;
      break;
    case AbsentStatus.PROCESSING:
      text = (
        <div className="text-xs text-red-500 md:text-sm">
          {absent?.nextApproverTitle} {t('pending_approval', '승인 전')}
        </div>
      );
      break;
    case AbsentStatus.PROCESSED:
      text = <div className="text-xs text-gray-600 md:text-sm">{t('approved', '승인 완료')}</div>;
      break;
    case AbsentStatus.RETURNED:
      text = <div className="text-xs text-brand-1 md:text-sm">{t('rejected', '반려됨')}</div>;
      break;
    case AbsentStatus.DELETE_APPEAL:
      text = <div className="text-xs text-red-800 md:text-sm">{t('delete_request', '삭제 요청')}</div>;
      break;
  }

  const handleCheckboxChange = () => {
    setClicked(true);
    submitAbsent({
      id: absent.id,
      submitted: !absent.submitted,
      callback: () => {
        setClicked(false);
      },
    });
  };

  return (
    <div
      className={
        pathname.startsWith(`/teacher/absent/${absent.id}`)
          ? 'w-full bg-gray-100 py-4'
          : 'w-full cursor-pointer border-b border-gray-100 py-4'
      }
      onClick={() => push(`/teacher/${type}/${absent.id}${search}`)}
    >
      {/* Mobile V */}
      <div className="mx-5 flex items-center justify-between md:hidden">
        <div className="flex items-center ">
          <div>
            <h3 className="mb-1 text-lg font-semibold">
              [{absent.description} {absent?.reportType}] {absent.student?.name}
              {getNickName(absent?.student?.nickName)} {absent.studentGradeKlass} {absent.studentNumber}번
            </h3>
            <div className="text-xs text-gray-500">
              기간 :{' '}
              {absent.startAt &&
                absent.endAt &&
                absent.reportType &&
                makeStartEndToString(absent.startAt, absent.endAt, absent.reportType)}
            </div>
            <div className="text-xs text-gray-500">신고일 : {absent.reportedAt}</div>
          </div>
        </div>
        <div>{text}</div>
      </div>

      {/* Desktop V */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[8fr_2fr_3fr_3fr] items-center px-2">
          <div className="flex flex-col">
            <div className="text-lg font-semibold">
              [{absent.description} {absent?.reportType}] {absent.student?.name}
              {getNickName(absent?.student?.nickName)} {absent.studentGradeKlass} {absent.studentNumber}번
            </div>

            <div className="overflow-x-hidden text-xs text-gray-500">
              {t('period', '기간')} :{' '}
              {absent.startAt &&
                absent.endAt &&
                absent.reportType &&
                makeStartEndToString(absent.startAt, absent.endAt, absent.reportType)}{' '}
              {(absent?.reportType === '지각' || absent?.reportType === '결과' || absent?.reportType === '조퇴') && (
                <>
                  {absent?.startPeriod !== 0 && absent?.endPeriod !== 0
                    ? getPeriodStr(absent?.startPeriod) + '교시~' + getPeriodStr(absent?.endPeriod) + '교시'
                    : makeTimeToString(absent?.startAt || '') === '00:00' &&
                      makeTimeToString(absent?.endAt || '') === '00:00'
                    ? ' '
                    : makeTimeToString(absent?.startAt || '') + ' ~ ' + makeTimeToString(absent?.endAt || '')}
                </>
              )}
            </div>
            <div className="overflow-x-hidden text-xs text-gray-500">
              {t('application_date', '신청일')} : {absent.reportedAt}
            </div>
            {/* <Time date={absent.createdAt} format="신청일 : yyyy-MM-dd" className="text-xs font-normal text-gray-500" /> */}
          </div>
          <div className="text-center" onClick={() => push(`/teacher/absent/${absent.id}?page=${page}&limit=${limit}`)}>
            {text}
          </div>
          <div className="flex h-full items-center justify-center gap-2">
            <div>나이스</div>
            <input
              type="checkbox"
              className="h-5 w-5 md:h-6 md:w-6"
              checked={absent.niceSubmitted}
              disabled={clicked}
              onChange={() => {
                setClicked(true);
                submitNiceAbsent({
                  id: absent.id,
                  submitted: !absent.niceSubmitted,
                  callback: () => setClicked(false),
                });
              }}
            />
          </div>
          <div className="flex h-full items-center justify-center gap-2 text-center text-xs md:text-sm">
            <div>
              {absent?.evidenceType === '진료확인서류(진료확인서, 진단서, 의사소견서, 처방전, 약봉투 등)'
                ? '진료확인서류'
                : absent?.evidenceType}
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 md:h-6 md:w-6"
              checked={absent.submitted || absent?.evidenceType === '학부모 확인서'}
              disabled={clicked || absent?.evidenceType === '학부모 확인서'}
              onChange={handleCheckboxChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
