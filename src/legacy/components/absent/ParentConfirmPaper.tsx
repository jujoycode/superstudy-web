import { forwardRef } from 'react'
import { Absent } from '@/legacy/generated/model'
import { cn } from 'src/lib/tailwind-merge'
import { getNickName, getPeriodStr } from '@/legacy/util/status'
import { makeStartEndToString, makeTimeToString } from '@/legacy/util/time'
import { Td } from '../Td'

interface ParentConfirmPaperProps {
  absent: Absent
  isMobileView?: boolean
}

export const ParentConfirmPaper = forwardRef((props: ParentConfirmPaperProps, ref: any) => {
  const { absent, isMobileView = false } = props

  return (
    <div ref={ref} className={cn('w-full bg-white', !isMobileView && 'md:h-[1100px]')}>
      <div className={cn('flex w-full flex-col space-y-6 p-5', !isMobileView && 'md:p-20 md:pt-[67px]')}>
        <div className="mt-20 w-full min-w-max text-center text-xl font-bold md:text-3xl">학부모 확인서</div>
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
              {/* <Td innerClassName="md:w-[120px]">신고 유형</Td> */}
              <Td className="w-1/3 border border-gray-900 p-2">출결 구분</Td>
              <Td className="w-2/3 border border-gray-900 p-2">
                {absent?.description}
                {absent?.reportType}
              </Td>
            </tr>
            {/* <tr>
              <Td innerClassName="">상세 내용</Td>
              <Td>{absent?.description}</Td>
            </tr> */}
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
            <tr>
              <Td innerClassName="min-w-max">상세 내용</Td>
              <Td>{absent?.parentComment}</Td>
            </tr>
          </table>
          <div className="text-brand-1 pt-1 whitespace-pre-line">
            *{absent?.student?.name} 학생이 해당 기간동안&nbsp;
            {absent?.reportType === '지각' || absent?.reportType === '결과' || absent?.reportType === '조퇴'
              ? absent?.reportType
              : '미출석'}
            함을 확인하였습니다.
          </div>
        </div>
        <div>
          <div className="flex w-full items-center space-x-4 pr-4">
            <div className="w-full min-w-max text-right text-gray-600">신고일:</div>
            <div className="w-2/5 min-w-[150px] text-right font-bold whitespace-pre text-gray-800">
              {absent?.reportedAt}
            </div>
          </div>

          <div className="flex w-full items-center space-x-4">
            <div className="w-full min-w-max text-right text-gray-600">신고자:</div>
            <div className="w-2/5 min-w-[100px] text-right font-bold text-gray-800">
              {absent?.student?.name} {getNickName(absent?.student?.nickName)}
            </div>
            {absent?.studentSignature ? (
              <img src={absent.studentSignature} alt="" className="w-[50px]" />
            ) : (
              <div className="h-[5px] min-w-[50px]" />
            )}
          </div>
          <div className="flex w-full items-center space-x-4">
            <div className="w-full min-w-max text-right text-gray-600">보호자:</div>
            <div className="w-2/5 min-w-[100px] text-right font-bold text-gray-800">{absent?.student?.nokName}</div>
            {absent?.parentSignature ? (
              <img src={absent.parentSignature} alt="" className="w-[50px]" />
            ) : (
              <div className="h-[5px] min-w-[50px]" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
