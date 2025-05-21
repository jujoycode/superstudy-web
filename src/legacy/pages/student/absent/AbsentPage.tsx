import { t } from 'i18next'
import { useState } from 'react'

import { ReactComponent as RightArrow } from '@/assets/svg/mypage-right-arrow.svg'
import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { useStudentAbsent } from '@/legacy/container/student-absent'
import { AbsentStatus, Role } from '@/legacy/generated/model'
import { getPeriodStr } from '@/legacy/util/status'
import { makeStartEndToString, makeTimeToString } from '@/legacy/util/time'

export function AbsentPage() {
  const { push } = useHistory()
  const { isLoading, data, me, error } = useStudentAbsent()
  const [blankOpen, setBlankOpen] = useState(false)
  const isParent = me?.role === 'PARENT'

  const absents = data
    ?.slice()
    .sort(
      (a, b) =>
        (a.absentStatus === AbsentStatus.DELETE_APPEAL ? -1 : 0) -
        (b.absentStatus === AbsentStatus.DELETE_APPEAL ? -1 : 0),
    )
    .sort(
      (a, b) =>
        (a.absentStatus === AbsentStatus.RETURNED ? -1 : 0) - (b.absentStatus === AbsentStatus.RETURNED ? -1 : 0),
    )

  return (
    <>
      {isLoading && <Blank reversed />}
      {error && <ErrorBlank />}
      {blankOpen && <Blank />}
      <TopNavbar
        title={`${t(`absentTitle`, '결석신고서')}`}
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
        right={
          <div
            className="text-brand-1"
            onClick={() => {
              setBlankOpen(true)
              window?.location?.reload()
            }}
          >
            새로고침
          </div>
        }
      />

      <div className="scroll-box h-screen-12 overflow-y-auto">
        <Section>
          <div className="space-y-4 pb-12">
            {absents?.map((absent) => {
              const isDeleteAppealed = absent?.absentStatus === AbsentStatus.DELETE_APPEAL
              const isReturned = absent?.absentStatus === AbsentStatus.RETURNED
              const isNotApprovedByParent = absent?.absentStatus === AbsentStatus.BEFORE_PARENT_CONFIRM
              const isNotApprovedByTeacher =
                absent?.absentStatus === AbsentStatus.RETURNED ||
                absent?.absentStatus === AbsentStatus.BEFORE_PARENT_CONFIRM ||
                absent?.absentStatus === AbsentStatus.BEFORE_TEACHER_APPROVAL
              const isNotApprovedBySchool = absent?.absentStatus !== AbsentStatus.PROCESSED

              return (
                <div
                  key={absent.id}
                  className="flex cursor-pointer items-center justify-between border-b border-gray-50 pb-4"
                  onClick={() => push(`/student/absent/${absent.id}`)}
                >
                  <div>
                    <div className="font-bold text-gray-800">
                      {absent?.startAt &&
                        absent?.endAt &&
                        absent?.reportType &&
                        makeStartEndToString(absent.startAt, absent.endAt, absent.reportType)}{' '}
                      {absent.reportType}
                      {(absent?.reportType === '지각' ||
                        absent?.reportType === '결과' ||
                        absent?.reportType === '조퇴') && (
                        <>
                          {absent?.startPeriod !== 0 && absent?.endPeriod !== 0
                            ? '(' +
                              getPeriodStr(absent?.startPeriod) +
                              '교시~' +
                              getPeriodStr(absent?.endPeriod) +
                              '교시)'
                            : makeTimeToString(absent?.startAt || '') === '00:00' &&
                                makeTimeToString(absent?.endAt || '') === '00:00'
                              ? ' '
                              : '(' +
                                makeTimeToString(absent?.startAt || '') +
                                ' ~ ' +
                                makeTimeToString(absent?.endAt || '') +
                                ')'}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {absent.reportedAt}{' '}
                      {isReturned ? (
                        <span className="text-brand-1 font-bold">반려됨</span>
                      ) : isNotApprovedByParent ? (
                        <span
                          className={` ${
                            me?.role === Role.PARENT ? 'text-brand-1 font-bold' : 'font-bold text-blue-600'
                          } `}
                        >
                          보호자 승인 대기
                        </span>
                      ) : isNotApprovedByTeacher ? (
                        <span className="font-bold text-blue-600">담임 승인 대기</span>
                      ) : isDeleteAppealed ? (
                        <span className="font-bold text-red-500">삭제 요청</span>
                      ) : isNotApprovedBySchool ? (
                        <span className="font-bold text-blue-600">학교 승인 대기</span>
                      ) : (
                        '처리됨'
                      )}
                    </div>
                  </div>
                  <div className="flex">
                    {isNotApprovedByParent && me?.role === Role.PARENT && (
                      <span className="text-brand-1 pt-1 text-sm font-bold">승인해주세요.</span>
                    )}
                    <RightArrow />
                  </div>
                </div>
              )
            })}
            {!absents?.length && (
              <div className="h-screen-10 flex w-full items-center justify-center text-center">
                <div className="text-gray-600">
                  아직 신청하신 {t(`absentTitle`, '결석신고서')}가 없습니다.
                  <br />
                  {!isParent && <div>아래 버튼을 눌러 신청해주세요.</div>}
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      <div className="w-full px-4">
        <button
          children={`${t(`absentTitle`, '결석신고서')} 작성하기`}
          onClick={() => {
            //if (!isParent && isPrimaryGuardian === -1) {
            if (me?.role === Role.USER && (!me?.nokName || !me?.nokPhone)) {
              alert('지정된 주 보호자가 존재하지 않습니다. [MY-내 정보]에서 주 보호자를 설정해 주세요.')
              return
            }
            push('/student/absent/add')
          }}
          className="bg-brand-1 h-14 w-full rounded-lg px-4 text-white"
        />
      </div>
    </>
  )
}
