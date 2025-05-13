import { forwardRef } from 'react'

import { Absent } from '@/legacy/generated/model'
import { useSignedUrl } from '@/legacy/lib/query'
import { cn } from '@/legacy/lib/tailwind-merge'
import { getNickName } from '@/legacy/util/status'
import { makeStartEndToString } from '@/legacy/util/time'

import { Td } from '../Td'

interface TeacherConfirmPaperProps {
  absent: Absent
  isMobileView?: boolean
}

export const TeacherConfirmPaper = forwardRef((props: TeacherConfirmPaperProps, ref: any) => {
  const { absent, isMobileView = false } = props
  const { data: approver1Signature } = useSignedUrl(absent?.approver1Signature)

  return (
    <div ref={ref} className={cn('w-full bg-white', !isMobileView && 'md:h-[1100px]')}>
      <div className={cn('flex w-full flex-col space-y-6 p-5', !isMobileView && 'md:p-20 md:pt-[87px]')}>
        <div className="mt-20 w-full min-w-max text-center text-xl font-bold md:text-3xl">담임교사 확인서</div>
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
              <Td innerClassName="">신고 유형</Td>
              <Td>{absent?.reportType}</Td>
            </tr>
            <tr>
              <Td innerClassName="">상세 내용</Td>
              <Td>{absent?.description}</Td>
            </tr>
            <tr>
              <Td innerClassName="">기간</Td>
              <Td>
                {absent?.startAt &&
                  absent?.endAt &&
                  absent?.reportType &&
                  makeStartEndToString(absent.startAt, absent.endAt, absent.reportType)}
              </Td>
            </tr>
            <tr>
              <Td innerClassName="">신고사유</Td>
              <Td>{absent?.reason}</Td>
            </tr>
            <tr>
              <Td innerClassName="">담임교사 코멘트</Td>
              <Td innerClassName="text-left"> {absent?.teacherComment}</Td>
            </tr>
          </table>
          <div className="text-brand-1 pt-1 whitespace-pre-line">
            *{absent?.student?.name} 학생이{' '}
            {absent?.startAt &&
              absent?.endAt &&
              absent?.reportType &&
              makeStartEndToString(absent.startAt, absent.endAt, absent.reportType)}{' '}
            동안 학교에{' '}
            {absent?.reportType === '지각' || absent?.reportType === '결과' || absent?.reportType === '조퇴'
              ? absent?.reportType
              : '미출석'}
            함을 확인하였습니다.
          </div>
        </div>
        <div>
          <div className="flex w-full items-center space-x-4 pr-4">
            <div className="w-full min-w-max text-right text-gray-600">신고일:</div>
            <div className="w-2/5 min-w-max text-right font-bold whitespace-pre text-gray-800">
              {absent?.reportedAt}
            </div>
          </div>

          <div className="flex w-full items-center space-x-4">
            <div className="w-full min-w-max text-right text-gray-600">선생님:</div>
            <div className="w-2/5 min-w-max text-right font-bold text-gray-800">{absent?.teacher?.name}</div>
            {approver1Signature ? (
              <img src={approver1Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
            ) : (
              <div className="h-[5px] min-w-[50px]" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
