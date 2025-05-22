import { useParams } from 'react-router-dom'

import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank } from '@/legacy/components'
import { Blank, BottomFixed, CloseButton, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { useStudentOutingApprove } from '@/legacy/container/student-outing-approve'
import { OutingTypeEnum } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getPeriodStrEx } from '@/legacy/util/status'
import { makeDateToString, makeDateToStringByFormat } from '@/legacy/util/time'

export function OutingApprovalPage() {
  const { uuid = '' } = useParams<{ uuid: string }>()
  const { push } = useHistory()

  const {
    clearSignature,
    canvasRef,
    outing,
    sigPadData,
    isSuccess,
    signAbsent,
    isGetOutingError,
    setSign,
    openSign,
    isLoading,
  } = useStudentOutingApprove(uuid)

  const student = outing?.student
  const school = student?.school
  const startAt = DateUtil.formatDate(outing?.startAt || '', DateFormat['YYYY-MM-DD HH:mm'])
  const endAt = DateUtil.formatDate(outing?.endAt || '', DateFormat['YYYY-MM-DD HH:mm'])

  let isSigned = false
  if (outing?.parentSignature) {
    isSigned = true
  }

  return (
    <>
      {/* {loading && <Blank />} */}
      {isSuccess && (
        <Blank>
          <div className="flex flex-col">
            <div className="mb-5 text-white">정상적으로 제출되었습니다.</div>
            <Button.lg children="확인" onClick={() => push('/')} className="filled-gray-dark" />
          </div>
        </Blank>
      )}
      <TopNavbar
        title={'확인증'}
        left={<div className="h-15 w-10" />}
        right={
          <div className="text-primary-800" onClick={() => push('/')}>
            취소
          </div>
        }
      />
      {isGetOutingError ? (
        <ErrorBlank text="이미 삭제되었거나 더 이상 유효하지 않습니다." />
      ) : (
        <>
          <Section className="scroll-box h-screen-4 overflow-auto">
            {!isSigned ? (
              <div className="bg-primary-50 mb-4 rounded-lg p-4 whitespace-pre-line">
                {`[${school?.name || ''} 슈퍼스쿨의 서명 요청]
      ${student?.nokName || ''}님, 귀하의 자녀 ${student?.name || ''} 학생이
      확인증을 신청하였습니다.
      내용확인 후 서명을 부탁드립니다.

      서명 요청자 :
      ${school?.name || ''} ${outing?.studentGradeKlass || ''} ${student?.name || ''} 학생

      서명 참여자 :
      ${student?.nokName || ''} 학부모님 (${student?.nokPhone || ''})
      `}
              </div>
            ) : (
              <>
                <div>
                  <div className="bg-primary-50 mb-4 rounded-lg p-4 whitespace-pre-line">
                    {`${student?.name || ''} 학생의 확인증이 ${student?.nokName || ''}님의 서명을 받았습니다.`}
                  </div>
                </div>
                <div className="h-0.5 bg-gray-200" />
              </>
            )}

            <div className="flex">
              <div className="w-1/3 shrink-0 text-gray-800">학생 이름</div>
              <div className="w-2/3 text-gray-500">{student?.name}</div>
            </div>
            <div className="flex">
              <div className="w-1/3 shrink-0 text-gray-800">학번</div>
              <div className="w-2/3 text-gray-500">
                {outing?.studentGradeKlass} {outing?.studentNumber}번
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 shrink-0 text-gray-800">유형</div>
              <div className="w-2/3 text-gray-500">
                {outing?.type === OutingTypeEnum.확인 && outing?.type2} {outing?.type}
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 shrink-0 text-gray-800">사유</div>
              <div className="w-2/3 text-gray-500">{outing?.reason}</div>
            </div>
            <div className="flex">
              <div className="w-1/3 shrink-0 text-gray-800">기간</div>
              <div className="w-2/3 text-gray-500">
                {outing?.startPeriod !== 0 && outing?.endPeriod !== 0
                  ? makeDateToString(startAt) +
                    ' ' +
                    getPeriodStrEx(outing?.startPeriod) +
                    ' ~ ' +
                    makeDateToString(endAt) +
                    ' ' +
                    getPeriodStrEx(outing?.endPeriod)
                  : `${startAt} ~ ${endAt}`}
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 shrink-0 text-gray-800">신청일</div>
              <div className="w-2/3 text-gray-500">
                {outing?.reportedAt && makeDateToStringByFormat(new Date(outing.reportedAt))}
              </div>
            </div>

            <div className="pb-10 whitespace-pre-line">
              {`*개인정보 수집 및 이용 동의
- 신고자는 학생 본인입니다.
- 확인증은 학교에 보관됩니다.
`}
            </div>

            {isSigned ? (
              <div className="text-sm text-gray-500">서명 완료되었습니다.</div>
            ) : (
              <div>
                <Button.lg
                  children="내용 확인하고 서명하기"
                  onClick={() => setSign(true)}
                  className="filled-primary w-full"
                />
              </div>
            )}
          </Section>

          <div className={openSign ? '' : 'hidden'}>
            <Blank text="" />
            <BottomFixed className="-bottom-4 z-100 rounded-xl">
              <div className="absolute top-2 right-3" onClick={() => setSign(false)}>
                <CloseButton
                  onClick={() => {
                    setSign(false)
                    clearSignature()
                  }}
                />
              </div>
              <Section>
                <div>
                  <div className="text-xl font-bold text-gray-700">보호자 서명란</div>
                  <div className="text-gray-500">아래 네모칸에 이름을 바르게 적어주세요.</div>
                </div>
                <canvas
                  ref={canvasRef}
                  width={window.innerWidth * 0.9}
                  height={window.innerWidth * 0.4 > 280 ? 280 : window.innerWidth * 0.4}
                  className="m-auto rounded-[30px] bg-[#F2F2F2]"
                />
                <div className="flex items-center justify-between space-x-2">
                  <Button.lg children="다시하기" onClick={() => clearSignature()} className="outlined-primary w-full" />
                  <Button.lg
                    children="서명 제출하기"
                    disabled={isLoading}
                    onClick={() => {
                      if (!sigPadData) {
                        alert('서명이 없습니다. 아래 네모칸에 다시 서명을 해주세요.')
                        return
                      }
                      signAbsent()
                    }}
                    className="filled-primary w-full"
                  />
                </div>
              </Section>
            </BottomFixed>
          </div>
        </>
      )}
    </>
  )
}
