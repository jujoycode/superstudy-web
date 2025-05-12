import { t } from 'i18next'
import { useHistory, useParams } from 'react-router'
import { ReactComponent as FileItemIcon } from '@/legacy/assets/svg/file-item-icon.svg'
import { ErrorBlank, Td2 } from '@/legacy/components'
import { Blank, BottomFixed, CloseButton, Label, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Constants } from '@/legacy/constants'
import { useStudentAbsentApprove } from '@/legacy/container/student-absent-approve'
import { useSignedUrl } from '@/legacy/lib/query'
import { getPeriodStr } from '@/legacy/util/status'
import { makeStartEndToString, makeTimeToString } from '@/legacy/util/time'

export function AbsentApprovalPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const { push } = useHistory()

  const {
    clearSignature,
    canvasRef,
    absent,
    sigPadData,
    signAbsent,
    isSuccess,
    errorMessage,
    isGetAbsentError,
    comment,
    setComment,
    setSign,
    openSign,
    isLoading,
  } = useStudentAbsentApprove(uuid)

  const { data: approver1Signature } = useSignedUrl(absent?.approver1Signature)
  const { data: approver2Signature } = useSignedUrl(absent?.approver2Signature)
  const { data: approver3Signature } = useSignedUrl(absent?.approver3Signature)
  const { data: approver4Signature } = useSignedUrl(absent?.approver4Signature)
  const { data: approver5Signature } = useSignedUrl(absent?.approver5Signature)

  const student = absent?.student
  const school = student?.school

  let isSigned = false
  if (absent?.parentSignature) {
    isSigned = true
  }

  const isConfirmType = absent?.evidenceType === '학부모 확인서'

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
        title={`${isConfirmType ? '학부모 확인서' : t(`Custom.SID${school?.id}.absentTitle`, '결석신고서')}`}
        left={<div className="h-15 w-10" />}
        right={
          <div className="text-brand-1" onClick={() => push('/')}>
            취소
          </div>
        }
      />
      {isGetAbsentError ? (
        <ErrorBlank text="이미 삭제되었거나 더 이상 유효하지 않습니다." />
      ) : (
        <>
          <Section className="scroll-box h-screen-4 overflow-auto">
            {!isSigned ? (
              <div className="bg-light_orange mb-4 rounded-lg p-4 whitespace-pre-line">
                {`[${school?.name || ''} 슈퍼스쿨의 서명 요청]
      ${student?.nokName || ''}님, 귀하의 자녀 ${student?.name || ''} 학생이
      ${t(`Custom.SID${student?.schoolId}.absentTitle`, '결석신고서')}를 신청하였습니다.
      내용확인 후 서명을 부탁드립니다.

      서명 요청자 :
      ${school?.name || ''} ${absent?.studentGradeKlass || ''} ${student?.name || ''} 학생

      서명 참여자 :
      ${student?.nokName || ''} 학부모님 (${student?.nokPhone || ''})
      `}
              </div>
            ) : (
              <>
                <div>
                  <div className="bg-light_orange mb-4 rounded-lg p-4 whitespace-pre-line">
                    {`${student?.name || ''} 학생의 ${t(`Custom.SID${student?.schoolId}.absentTitle`, '결석신고서')}가 ${
                      student?.nokName || ''
                    }님의 서명을 받았습니다.`}
                  </div>
                  {!isConfirmType && (
                    <table>
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
                              <img
                                src={approver1Signature}
                                alt=""
                                crossOrigin="anonymous"
                                className="m-auto w-[50px]"
                              />
                            )}
                          </Td2>
                        )}
                        {absent?.approver2Title && (
                          <Td2 className="h-10">
                            {approver2Signature && (
                              <img
                                src={approver2Signature}
                                alt=""
                                crossOrigin="anonymous"
                                className="m-auto w-[50px]"
                              />
                            )}
                          </Td2>
                        )}
                        {absent?.approver3Title && (
                          <Td2 className="h-10">
                            {approver3Signature && (
                              <img
                                src={approver3Signature}
                                alt=""
                                crossOrigin="anonymous"
                                className="m-auto w-[50px]"
                              />
                            )}
                          </Td2>
                        )}
                        {absent?.approver4Title && (
                          <Td2 className="h-10">
                            {approver4Signature && (
                              <img
                                src={approver4Signature}
                                alt=""
                                crossOrigin="anonymous"
                                className="m-auto w-[50px]"
                              />
                            )}
                          </Td2>
                        )}
                        {absent?.approver5Title && (
                          <Td2 className="h-10">
                            {approver5Signature && (
                              <img
                                src={approver5Signature}
                                alt=""
                                crossOrigin="anonymous"
                                className="m-auto w-[50px]"
                              />
                            )}
                          </Td2>
                        )}
                      </tr>
                    </table>
                  )}
                </div>
                <div className="h-0.5 bg-gray-200" />
              </>
            )}
            <div className="flex">
              <div className="w-1/3 flex-shrink-0 text-gray-800">학생 이름</div>
              <div className="w-2/3 text-gray-500">{student?.name}</div>
            </div>
            <div className="h-0.5 bg-gray-200" />
            <div className="flex">
              <div className="w-1/3 flex-shrink-0 text-gray-800">학생 이름</div>
              <div className="w-2/3 text-gray-500">{student?.name}</div>
            </div>
            <div className="flex">
              <div className="w-1/3 flex-shrink-0 text-gray-800">학번</div>
              <div className="w-2/3 text-gray-500">
                {absent?.studentGradeKlass} {absent?.studentNumber}번
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 flex-shrink-0 text-gray-800">신고유형</div>
              <div className="w-2/3 text-gray-500">
                {absent?.description}
                {absent?.reportType}
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 flex-shrink-0 text-gray-800">기간</div>
              <div className="w-2/3 text-gray-500">
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
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3 flex-shrink-0 text-gray-800">신고사유</div>
              <div className="w-2/3 text-gray-500">{absent?.reason}</div>
            </div>
            {!!absent?.studentComment && (
              <div className="flex">
                <div className="w-1/3 flex-shrink-0 text-gray-800">신고사유상세</div>
                <div className="w-2/3 text-gray-500">{absent?.studentComment}</div>
              </div>
            )}
            <div className="flex">
              <div className="w-1/3 flex-shrink-0 text-gray-800">증빙서류</div>
              <div className="w-2/3 text-gray-500">
                {absent?.evidenceType}
                {!!absent?.evidenceType2 && ', ' + absent.evidenceType2}
              </div>
            </div>
            {absent?.evidenceType === '담임교사 확인서' && (
              <div className="pb-12 whitespace-pre-line">{`*증빙서류를 담임교사 확인서로 선택한 경우 보호자와 담임교사의 승인 후, 앱에서 증빙서류 확인이 가능합니다.`}</div>
            )}

            {!isConfirmType && absent?.evidenceFiles?.length !== undefined && absent?.evidenceFiles?.length > 0 && (
              <div>
                <div className="flex-shrink-0 text-gray-800">증빙서류 파일</div>
                {absent.evidenceFiles.map((evidenceFile: string) => (
                  <div
                    key={evidenceFile}
                    className="relative m-2 flex items-center justify-between overflow-x-hidden bg-white p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <FileItemIcon />
                      <div className="text-lightpurple-4 min-w-max bg-white px-2">
                        <a href={`${Constants.imageUrl}${evidenceFile}`} target="_blank" rel="noreferrer" download>
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex">
              <div className="w-1/3 flex-shrink-0 text-gray-800">증빙서류 2</div>
              <div className="w-2/3 text-gray-500">{absent?.evidenceType2}</div>
            </div>
            {absent?.evidenceType === '담임교사 확인서' && (
              <div className="pb-12 whitespace-pre-line">{`*증빙서류를 담임교사 확인서로 선택한 경우 보호자와 담임교사의 승인 후, 앱에서 증빙서류 확인이 가능합니다.`}</div>
            )}

            {!isConfirmType && absent?.evidenceFiles2?.length !== undefined && absent?.evidenceFiles2?.length > 0 && (
              <div>
                <div className="flex-shrink-0 text-gray-800">증빙서류 파일</div>
                {absent.evidenceFiles2.map((evidenceFile: string) => (
                  <div
                    key={evidenceFile}
                    className="relative m-2 flex items-center justify-between overflow-x-hidden bg-white p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <FileItemIcon />
                      <div className="text-lightpurple-4 min-w-max bg-white px-2">
                        <a href={`${Constants.imageUrl}${evidenceFile}`} target="_blank" rel="noreferrer" download>
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex">
              <div className="w-1/3 flex-shrink-0 text-gray-800">보호자 이름</div>
              <div className="w-2/3 text-gray-500">{student?.nokName}</div>
            </div>
            <div className="flex">
              <div className="w-1/3 flex-shrink-0 text-gray-800">보호자 연락처</div>
              <div className="w-2/3 text-gray-500">{student?.nokPhone}</div>
            </div>

            {isConfirmType && (
              <>
                <div className="whitespace-pre-line">
                  *{student?.name} 학생이{' '}
                  {absent?.startAt &&
                    absent?.endAt &&
                    absent?.reportType &&
                    makeStartEndToString(absent.startAt, absent.endAt, absent.reportType)}{' '}
                  동안 학교에{' '}
                  {absent?.reportType === '지각' || absent?.reportType === '결과' || absent?.reportType === '조퇴'
                    ? absent?.reportType
                    : '미출석'}
                  함을 확인
                  {isSigned ? '합' : '하였습'}니다.
                </div>
              </>
            )}

            {isSigned && (
              <div className="flex w-full flex-col items-end">
                <div className="mt-4 min-w-max text-right font-bold">보호자: {student?.nokName} (인)</div>
                <img src={absent?.parentSignature ?? undefined} alt="" className="mt-2 w-[100px]" />
              </div>
            )}

            <div className="pb-10 whitespace-pre-line">
              {`*개인정보 수집 및 이용 동의
- 신고자는 학생 본인입니다.
- ${t(`Custom.SID${absent?.schoolId}.absentTitle`, '결석신고서')}는 학교에 보관됩니다.
- ${t(
                `Custom.SID${absent?.schoolId}.absentTitle`,
                '결석신고서',
              )}(증빙서류를 포함)를 제출하여, 사유 발생 5일 이내에 전결 승인까지 받아야 인정됩니다.`}
            </div>

            {isConfirmType && (
              <Label.col>
                <p children="학부모 확인서 내용 등록" className="text-gray-800" />
                <textarea
                  placeholder="예) 어젯밤부터 감기 몸살 증상이 보여 약을 먹었으나 나아지지 않아 가정에서 안정을 찾기 위해 결석하였습니다."
                  value={comment}
                  rows={3}
                  disabled={!!isSigned}
                  onChange={(e) => setComment(e.target.value)}
                  className="focus:border-brand-1 rounded-lg focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </Label.col>
            )}

            {isSigned ? (
              <>
                <div className="text-sm text-gray-500">승인 요청되었습니다.</div>
                <Button.lg
                  children="서명 완료"
                  disabled={isConfirmType ? !comment : false}
                  className="filled-gray-dark w-full"
                />
              </>
            ) : (
              <Button.lg
                children="내용 확인하고 서명하기"
                onClick={() => setSign(true)}
                disabled={isConfirmType ? !comment : false}
                className="filled-primary w-full"
              />
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
