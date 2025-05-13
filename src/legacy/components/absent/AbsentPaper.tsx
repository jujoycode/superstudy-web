import { t } from 'i18next'
import { forwardRef } from 'react'

import { Absent } from '@/legacy/generated/model'
import { useSignedUrl } from '@/legacy/lib/query'
import { cn } from '@/legacy/lib/tailwind-merge'
import { getNickName, getPeriodStr } from '@/legacy/util/status'
import { makeStartEndToString, makeTimeToString } from '@/legacy/util/time'

import { Td } from '../Td'
import { Td2 } from '../Td2'

interface AbsentPaperProps {
  absent?: Absent
  isMobileView?: boolean
}

export const AbsentPaper = forwardRef(({ absent, isMobileView = false }: AbsentPaperProps, ref: any) => {
  const { data: approver1Signature } = useSignedUrl(absent?.approver1Signature)
  const { data: approver2Signature } = useSignedUrl(absent?.approver2Signature)
  const { data: approver3Signature } = useSignedUrl(absent?.approver3Signature)
  const { data: approver4Signature } = useSignedUrl(absent?.approver4Signature)
  const { data: approver5Signature } = useSignedUrl(absent?.approver5Signature)

  return (
    <div ref={ref} className={cn('w-full bg-white', !isMobileView && 'md:h-[1100px]')}>
      <div className={cn('flex w-full flex-col space-y-6 p-5', !isMobileView && 'md:p-20 md:pt-[67px]')}>
        <div className="flex w-full items-end justify-end">
          <table className="min-w-max">
            <tr>
              {absent?.approver1Title && <Td2 className="h-4">{absent?.approver1Title}</Td2>}
              {absent?.approver2Title && <Td2 className="h-4">{absent?.approver2Title}</Td2>}
              {absent?.approver3Title && <Td2 className="h-4">{absent?.approver3Title}</Td2>}
              {absent?.approver4Title && <Td2 className="h-4">{absent?.approver4Title}</Td2>}
              {absent?.approver5Title && <Td2 className="h-4">{absent?.approver5Title}</Td2>}
            </tr>
            <tr>
              {absent?.approver1Title && (
                <Td2 className="h-10">
                  {approver1Signature && (
                    <img src={approver1Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {absent?.approver2Title && (
                <Td2 className="h-10">
                  {approver2Signature && (
                    <img src={approver2Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {absent?.approver3Title && (
                <Td2 className="h-10">
                  {approver3Signature && (
                    <img src={approver3Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {absent?.approver4Title && (
                <Td2 className="h-10">
                  {approver4Signature && (
                    <img src={approver4Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {absent?.approver5Title && (
                <Td2 className="h-10">
                  {approver5Signature && (
                    <img src={approver5Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
            </tr>
          </table>
        </div>
        <div className="w-full min-w-max text-center text-xl font-bold md:text-3xl">
          {t(`absentTitle`, '결석신고서')}
        </div>
        <div className="flex justify-between">
          <table className="w-full text-center text-sm font-bold md:text-base"></table>
          <div className="min-w-max text-right">
            <div className="flex space-x-1 text-gray-600">
              <div className="w-12"> 학번:</div>
              <div className="min-w-[100px] whitespace-pre">
                {absent?.studentGradeKlass} {absent?.studentNumber}번
              </div>
            </div>
            <div className="flex space-x-1 text-gray-600">
              <div className="w-12"> 이름:</div>
              <div className="min-w-[100px] whitespace-pre">
                {absent?.student?.name}
                {getNickName(absent?.student?.nickName)}
              </div>
            </div>
          </div>
        </div>
        <div>
          <table className="w-full text-center text-sm font-bold md:text-base">
            <tr>
              <Td className="w-1/3 border border-gray-900 p-2">출결 구분</Td>
              <Td className="w-2/3 border border-gray-900 p-2">
                {absent?.description}
                {absent?.reportType}
              </Td>
            </tr>
            <tr>
              <Td innerClassName="min-w-max">해당 기간</Td>
              <Td>
                {absent?.startAt &&
                  absent?.endAt &&
                  absent?.reportType &&
                  makeStartEndToString(absent.startAt, absent.endAt, absent.reportType)}{' '}
                {absent?.startPeriod !== 0 && absent?.endPeriod !== 0
                  ? getPeriodStr(absent?.startPeriod) + '교시~' + getPeriodStr(absent?.endPeriod) + '교시'
                  : makeTimeToString(absent?.startAt || '') === '00:00' &&
                      makeTimeToString(absent?.endAt || '') === '00:00'
                    ? ' '
                    : makeTimeToString(absent?.startAt || '') + ' ~ ' + makeTimeToString(absent?.endAt || '')}
              </Td>
            </tr>
            <tr>
              <Td innerClassName="min-w-max">신고 사유</Td>
              <Td>{absent?.reason}</Td>
            </tr>
            {!!absent?.studentComment && (
              <tr>
                <Td innerClassName="">신고 사유 상세</Td>
                <Td>{absent?.studentComment}</Td>
              </tr>
            )}
            <tr>
              <Td innerClassName="min-w-max">증빙 서류</Td>
              <Td>
                {absent?.evidenceType}
                {!!absent?.evidenceType2 &&
                  !(absent?.evidenceType2 === '기타' && !absent?.evidenceFiles2?.length) &&
                  ', ' + absent.evidenceType2}
              </Td>
            </tr>
          </table>
          <div className="mt-2 w-full">*위와 같이 본인의 출결 상황에 대하여 보호자 연서로 신고합니다.</div>
        </div>
        <div>
          {!absent?.parentSignature && (absent?.nextApprover || absent?.approver1Signature) ? (
            <>
              <div className="flex w-full items-center space-x-4">
                <div className="w-full min-w-max text-right text-gray-600">신고일:</div>
                <div className="min-w-[150px] text-right font-bold whitespace-pre text-gray-800">
                  {absent?.reportedAt}
                </div>
              </div>
              <div className="flex w-full items-center space-x-4">
                <div className="w-full min-w-max text-right text-gray-600">신고자:</div>
                <div className="min-w-[150px] text-right font-bold text-gray-800">{absent?.writerName} 선생님</div>
              </div>
            </>
          ) : (
            <>
              <div className="flex w-full items-center">
                <div className="w-full min-w-max text-right text-gray-600">신고일:</div>
                <div className="min-w-[150px] text-right font-bold whitespace-pre text-gray-800">
                  {absent?.reportedAt}
                </div>
              </div>
              <div className="flex w-full items-center">
                <div className="w-full min-w-max text-right text-gray-600">신고자:</div>
                <div className="min-w-[100px] text-right font-bold text-gray-800">
                  {absent?.student?.name}
                  {getNickName(absent?.student?.nickName)}
                </div>
                {absent?.studentSignature ? (
                  <img src={absent.studentSignature} alt="" className="w-[50px]" />
                ) : (
                  <div className="h-[5px] min-w-[50px]" />
                )}
              </div>
              <div className="flex w-full items-center">
                <div className="w-full min-w-max text-right text-gray-600">보호자:</div>
                <div className="min-w-[100px] text-right font-bold text-gray-800">{absent?.student?.nokName}</div>
                {absent?.parentSignature ? (
                  <img src={absent.parentSignature} alt="" className="w-[50px]" />
                ) : (
                  <div className="h-[5px] min-w-[50px]" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
})
