import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useParams } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank, Td } from '@/legacy/components'
import { Blank, BottomFixed, CloseButton, Label, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { PdfCard } from '@/legacy/components/common/PdfCard'
import { Constants } from '@/legacy/constants'
import { useParentFieldtripApprove } from '@/legacy/container/parent-fieldtrip-approve'
import { FieldtripType } from '@/legacy/generated/model'
import { useSignature } from '@/legacy/hooks/useSignature'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { isPdfFile } from '@/legacy/util/file'
import { fieldtripPeriodDayCnt, makeStartEndToString } from '@/legacy/util/time'

export function FieldtripApprovalPage() {
  const { uuid = '' } = useParams<{ uuid: string }>()
  const { push } = useHistory()

  const { clearSignature, canvasRef, sigPadData } = useSignature()
  const {
    hideSignModal,
    openSignModal,
    isShowSignModal,
    isSuccess,
    isLoading,
    errorMessage,
    approveFieldtrip,
    fieldtrip,
    fieldtripError,
  } = useParentFieldtripApprove({ sigPadData, uuid })
  const [agree, setAgree] = useState(false)

  const student = fieldtrip?.student
  const school = student?.school
  const type = fieldtrip?.type

  const { sHalfUsedDayCnt, wholeUsedDayCnt, eHalfUsedDayCnt } = fieldtripPeriodDayCnt(
    fieldtrip?.usedDays,
    fieldtrip?.startPeriodS,
    fieldtrip?.endPeriodE,
  )

  const isSigned = () => {
    return fieldtrip?.parentSignature
  }

  const getContent = () => {
    // content가 string이거나 Array<Object>인 경우가 있어서 분기
    if (type === FieldtripType.HOME) {
      return fieldtrip?.content ? JSON.parse(fieldtrip.content) : []
    }

    return fieldtrip?.content
  }

  const images = fieldtrip?.applyFiles.filter((image) => !isPdfFile(image)) || []
  const Pdfs = fieldtrip?.applyFiles.filter((image) => isPdfFile(image)) || []

  return (
    <>
      {isLoading && <Blank />}
      {isSuccess && (
        <Blank>
          <div className="flex flex-col">
            <div className="mb-5 text-white">정상적으로 제출되었습니다.</div>
            <Button.lg children="확인" onClick={() => push('/')} className="filled-gray-dark" />
          </div>
        </Blank>
      )}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      {fieldtripError && <ErrorBlank text="이미 삭제되었거나 더 이상 유효하지 않습니다." />}
      <TopNavbar
        title="체험학습 신청서"
        left={<div className="h-15 w-10" />}
        right={
          <div className="text-primary-800" onClick={() => push('/')}>
            취소
          </div>
        }
      />
      {fieldtrip && (
        <Section className="scroll-box h-screen-4 overflow-auto">
          {!isSigned() ? (
            <div className="bg-primary-50 mb-4 rounded-lg p-4 whitespace-pre-line">
              {`[${school?.name || ''} 슈퍼스쿨의 서명 요청]
      ${student?.nokName || ''}님, 귀하의 자녀 ${student?.name || ''} 학생이
      체험학습 신청서를 신청하였습니다.
      내용확인 후 서명을 부탁드립니다.

      서명 요청자 :
      ${school?.name || ''} ${fieldtrip?.studentGradeKlass || ''} ${student?.name || ''} 학생

      서명 참여자 :
      ${student?.nokName || ''} 보호자님 (${student?.nokPhone || ''})
      `}
            </div>
          ) : (
            <>
              <div>
                <div className="bg-primary-50 mb-4 rounded-lg p-4 whitespace-pre-line">
                  {`${student?.name || ''} 학생의 체험학습 신청서가 ${student?.nokName || ''}님의 서명을 받았습니다.
              체험학습 신청서의 처리 상태를 밑에서 확인 가능합니다.`}
                </div>
              </div>
              <div className="h-0.5 bg-gray-200" />
            </>
          )}
          <div className="flex">
            <div className="w-1/3 shrink-0 text-gray-800">학생 이름</div>
            <div className="w-2/3 shrink-0 text-gray-800">{student?.name}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 shrink-0 text-gray-800">학번</div>
            <div className="w-2/3 shrink-0 text-gray-800">{fieldtrip?.studentGradeKlass}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 shrink-0 text-gray-800">신고종류</div>
            <div className="w-2/3 shrink-0 text-gray-800">{fieldtrip?.type === 'HOME' ? '가정' : '교외'}</div>
          </div>
          {type === 'SUBURBS' && (
            <div className="flex">
              <div className="w-1/3 shrink-0 text-gray-800">체험학습 종류</div>
              <div className="w-2/3 shrink-0 text-gray-800">{fieldtrip?.form}</div>
            </div>
          )}
          <div className="flex">
            <div className="w-1/3 shrink-0 text-gray-800">기간</div>
            <div className="w-2/3 shrink-0 text-gray-800">
              {fieldtrip && makeStartEndToString(fieldtrip.startAt, fieldtrip.endAt)}
            </div>
          </div>
          <div>
            <div className="flex">
              <div className="w-1/3 shrink-0 text-gray-800">총 기간</div>
              <div className="w-2/3 shrink-0 text-gray-800">{fieldtrip?.usedDays}일</div>
            </div>
            <div className="border border-black p-3">
              {sHalfUsedDayCnt > 0 && (
                <div className="text-sm whitespace-pre-line">
                  반일기준 : {DateUtil.formatDate(fieldtrip?.startAt || '', DateFormat['YYYY-MM-DD'])}{' '}
                  {fieldtrip?.usedDays && fieldtrip?.usedDays < 1 && fieldtrip?.endPeriodE > 0 ? (
                    <>
                      {fieldtrip?.startPeriodS}
                      교시~
                      {fieldtrip?.endPeriodE}교시
                    </>
                  ) : (
                    <>
                      {fieldtrip?.startPeriodS}
                      교시부터
                    </>
                  )}{' '}
                  ({sHalfUsedDayCnt}
                  일)
                </div>
              )}
              {wholeUsedDayCnt > 0 && (
                <div className="text-sm whitespace-pre-line">
                  1일 기준 :{' '}
                  {(sHalfUsedDayCnt > 0 || eHalfUsedDayCnt > 0) && wholeUsedDayCnt > 0 && (
                    <>
                      {fieldtrip?.wholeDayPeriod} ({wholeUsedDayCnt}
                      일)
                    </>
                  )}
                  {sHalfUsedDayCnt === 0 && eHalfUsedDayCnt === 0 && (
                    <>
                      {DateUtil.formatDate(fieldtrip?.startAt || '', DateFormat['YYYY-MM-DD'])}~
                      {DateUtil.formatDate(fieldtrip?.endAt || '', DateFormat['YYYY-MM-DD'])} ({fieldtrip?.usedDays})
                      일간
                    </>
                  )}
                </div>
              )}
              {eHalfUsedDayCnt > 0 && (
                <div className="text-sm whitespace-pre-line">
                  반일기준 : {DateUtil.formatDate(fieldtrip?.endAt || '', DateFormat['YYYY-MM-DD'])}{' '}
                  {fieldtrip?.endPeriodE}
                  교시까지 ({eHalfUsedDayCnt}
                  일)
                </div>
              )}
            </div>
          </div>
          <div className="flex">
            <div className="w-1/3 shrink-0 text-gray-800">목적지</div>
            <div className="w-2/3 shrink-0 text-gray-800">{fieldtrip?.destination}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 shrink-0 text-gray-800">목적</div>
            <div className="w-2/3 shrink-0 text-gray-800">{fieldtrip?.purpose}</div>
          </div>
          {type === 'SUBURBS' && (
            <>
              <div className="flex">
                <div className="w-1/3 shrink-0 text-gray-800">인솔자명</div>
                <div className="w-2/3 shrink-0 text-gray-800">{fieldtrip?.guideName}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 shrink-0 text-gray-800">관계</div>
                <div className="w-2/3 shrink-0 text-gray-800">{fieldtrip?.relationship}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 shrink-0 text-gray-800">인솔자 연락처</div>
                <div className="w-2/3 shrink-0 text-gray-800">{fieldtrip?.guidePhone}</div>
              </div>
              <div>
                <div className="text-base">*현장학습계획</div>
                <div className="w-full border border-black p-3 whitespace-pre-line">{fieldtrip?.content}</div>
              </div>
              <Section className="bg-gray-50">
                {images?.map((image: string, i: number) => (
                  <div key={i} className="w-full">
                    <div className="rounded-sm bg-gray-50">
                      <LazyLoadImage
                        src={`${Constants.imageUrl}${image}`}
                        alt=""
                        loading="lazy"
                        className="h-full w-full rounded-sm object-cover"
                      />
                    </div>
                  </div>
                ))}
                {Pdfs?.map((pdfFile: string) => {
                  return (
                    <>
                      <div key={pdfFile}>
                        <div className="w-full">
                          <div className="rounded-sm bg-gray-50">
                            <PdfCard fileUrl={`${Constants.imageUrl}${pdfFile}`} visibleButton={false} />
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })}
              </Section>
            </>
          )}
          {type === 'HOME' && (
            <div className="w-full">
              {getContent()?.map((el: any, i: number) => (
                <table key={i} className="w-full">
                  <>
                    <tr className="w-full">
                      <Td colSpan={3} className="bg-[#C4C4C4] text-center">
                        {i + 1}일차
                      </Td>
                    </tr>
                    {el.day ? (
                      <>
                        <tr>
                          <Td innerClassName="mx-2">{el.content}</Td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <Td innerClassName="w-11">교시</Td>
                          <Td innerClassName="min-w-max">교과</Td>
                          <Td innerClassName="min-w-max">학습할 내용</Td>
                        </tr>
                        {new Array(7).fill('').map((_: any, index: number) => (
                          <>
                            {el['subject' + (index + 1)] && (
                              <tr>
                                <Td>{index + 1}교시</Td>
                                <Td>{el['subject' + (index + 1)]}</Td>
                                <Td>{el['content' + (index + 1)]}</Td>
                              </tr>
                            )}
                          </>
                        ))}
                      </>
                    )}
                  </>
                </table>
              ))}
            </div>
          )}
          <div className="flex">
            <div className="w-1/3 shrink-0 text-gray-800">보호자명</div>
            <div className="w-2/3 shrink-0 text-gray-800">{student?.nokName}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 shrink-0 text-gray-800">보호자 연락처</div>
            <div className="w-2/3 shrink-0 text-gray-800">{student?.nokPhone}</div>
          </div>
          <Label.row>
            <Checkbox id="agree" checked={agree} onChange={() => setAgree((prev) => !prev)} />
            <p className="text-lg font-semibold">아래 내용을 체크하셨습니까?</p>
          </Label.row>
          <p className="mt-1 rounded-lg border border-gray-300 px-4 py-3 whitespace-pre-line">-보호자로 서명합니다.</p>
          {isSigned() ? (
            <>
              <div className="text-sm text-gray-500">승인 요청되었습니다.</div>
              <Button.lg children="서명 완료" disabled={!agree} className="filled-gray w-full" />
            </>
          ) : (
            <Button.lg
              children="내용 확인하고 서명하기"
              disabled={!agree}
              onClick={openSignModal}
              className="filled-primary w-full"
            />
          )}
        </Section>
      )}

      <div className={isShowSignModal ? '' : 'hidden'}>
        <Blank text="" />
        <BottomFixed className="-bottom-4 z-100 rounded-xl">
          <div className="absolute top-2 right-3">
            <CloseButton
              onClick={() => {
                hideSignModal()
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
                disabled={isLoading || !sigPadData || !agree}
                onClick={() => approveFieldtrip()}
                className="filled-primary w-full"
              />
            </div>
          </Section>
        </BottomFixed>
      </div>
    </>
  )
}
