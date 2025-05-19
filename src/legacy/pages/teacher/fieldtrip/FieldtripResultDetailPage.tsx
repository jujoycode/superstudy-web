import { useEffect, useRef, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'

import { SuperModal } from '@/legacy/components'
import { Blank, Section, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { FieldtripPaper } from '@/legacy/components/fieldtrip/FieldtripPaper'
import { FieldtripSeparatePaper } from '@/legacy/components/fieldtrip/FieldtripSeparatePaper'
import { FieldtripSuburbsSeparatePaper } from '@/legacy/components/fieldtrip/FieldtripSuburbsSeparatePaper'
import { FieldtripSuburbsTextSeparatePaper } from '@/legacy/components/fieldtrip/FieldtripSuburbsTextSeparatePaper'
import { useTeacherFieldtripResultDetail } from '@/legacy/container/teacher-fieldtrip-result-detail'
import { ResponseUserDto } from '@/legacy/generated/model'
import { useQueryParams } from '@/legacy/hooks/useQueryParams'
import { approveButtonType } from '@/legacy/types'
import { splitStringByUnicode } from '@/legacy/util/fieldtrip'
import { extractReactData, getDoc } from '@/legacy/util/pdf'
import { buttonEnableState } from '@/legacy/util/permission'
import { getNickName } from '@/legacy/util/status'
import { makeDateToString, makeStartEndToString, makeTimeToString } from '@/legacy/util/time'

import { FieldtripResultUpdatePage } from './FieldtripResultUpdatePage'

interface FieldtripResultDetailPageProps {
  school: ResponseUserDto['school'] | undefined
  setOpen: (b: boolean) => void
  setAgreeAll: (b: boolean) => void
  setFieldtripId?: (n: number) => void
  me: ResponseUserDto | undefined
}

export function FieldtripResultDetailPage() {
  const { me, setOpen, setFieldtripId, setAgreeAll, school } = useOutletContext<FieldtripResultDetailPageProps>()
  const { pushWithQueryParams } = useQueryParams()
  const { id = '' } = useParams<{ id: string }>()
  const ref = useRef(null)
  const refTextPageRemain = useRef<any[]>([])
  const planRef = useRef(null)
  const separatePaperRefs = useRef<any[]>([])

  const [notApprovedReason, setNotApprovedReason] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [clicked, setClicked] = useState(false)
  const [readState, setReadState] = useState(true)

  const [resultTextPages, setResultTextPages] = useState<string[]>([])

  const [download, setDownload] = useState(false)

  const {
    denyFieldtripResult,
    deleteAppealFieldtripResult,
    isLoading,
    fieldtrip,
    deleteAppeal,
    loading,
    deny,
    setDeleteAppeal,
    setDeny,
    setLoading,
    resendAlimtalk,
  } = useTeacherFieldtripResultDetail({ id })

  const separateResultText = (resultText: string | undefined, maxLine = 21, charsOfLine = 42) => {
    if (resultText) {
      resultText = resultText.replace(/\n{2,}/g, '\n') // 줄바꿈하나로 합치기
      resultText += '\n'

      const sentences = resultText.split('\n')

      const lines: string[][] = []

      sentences.map((str) => {
        const chunks = splitStringByUnicode(str, charsOfLine)
        lines.push(chunks)
      })

      let textPage1 = ''
      let textPage2 = ''

      let lineIndexLength = 0

      lines.forEach((lineArr) => {
        lineArr.forEach((line) => {
          if (lineIndexLength < maxLine) {
            textPage1 += line
          } else {
            textPage2 += line
          }
          lineIndexLength += 1
        })
        if (lineIndexLength < maxLine) {
          textPage1 += '\n'
        } else {
          textPage2 += '\n'
        }
      })

      setResultTextPages((pages) => pages.concat(textPage1))
      if (textPage2) {
        separateResultText(textPage2, 28, 40)
      }
    }
  }

  useEffect(() => {
    separateResultText(fieldtrip?.resultText)
  }, [fieldtrip])

  useEffect(() => {
    setFieldtripId && setFieldtripId(Number(id))
  }, [id])

  let homeplans: Record<string, string>[] = []
  let content
  const resultFilesWithTwo: string[][] = []

  try {
    if (fieldtrip?.type === 'HOME') {
      const _content = JSON.parse(fieldtrip?.resultText || '[]')
      content = _content[0]
      if (content.subject1) {
        homeplans = _content?.slice(1)
      } else {
        const subContent = _content?.slice(5)
        homeplans = Array.from({ length: Math.ceil(subContent.length / 10) }, (_, index) =>
          subContent.slice(index * 10, index * 10 + 10),
        )
      }
    }
  } catch (err) {
    console.log(err)
  }

  try {
    if (fieldtrip?.resultFiles instanceof Array) {
      let chunk = []

      for (let i = 0; i < fieldtrip?.resultFiles?.length; i++) {
        chunk.push(fieldtrip?.resultFiles[i])
        if (i % 2 === 1) {
          resultFilesWithTwo.push(chunk)
          chunk = []
        }
      }
      if (chunk.length > 0) {
        resultFilesWithTwo.push(chunk)
      }
    }
  } catch (err) {
    console.log(err)
  }

  // 결재권자 인지. 결재라인에 있으면 true, 없으면 false
  const approver =
    fieldtrip?.resultApprover1Id === me?.id ||
    fieldtrip?.resultApprover2Id === me?.id ||
    fieldtrip?.resultApprover3Id === me?.id ||
    fieldtrip?.resultApprover4Id === me?.id ||
    fieldtrip?.resultApprover5Id === me?.id

  const approvedLine = [
    fieldtrip?.resultApprover1Signature && fieldtrip?.resultApprover1Id,
    fieldtrip?.resultApprover2Signature && fieldtrip?.resultApprover2Id,
    fieldtrip?.resultApprover3Signature && fieldtrip?.resultApprover3Id,
    fieldtrip?.resultApprover4Signature && fieldtrip?.resultApprover4Id,
    fieldtrip?.resultApprover5Signature && fieldtrip?.resultApprover5Id,
  ]
  // 승인할 차례 : true, 승인전/승인후 : false
  const nowApprove = fieldtrip?.nextResultApproverId === me?.id

  // 내가 승인한 건 : ture , 승인 안한 건 : false
  const isApproved = nowApprove ? false : approvedLine.includes(me?.id)

  // 승인 전 = !isApproved && !nowApprove
  // 승인 후 = isApproved && !nowApprove

  const checkButtonDisable = (bottonType: approveButtonType) => {
    return !buttonEnableState(
      bottonType,
      approver,
      nowApprove,
      fieldtrip?.fieldtripResultStatus || '',
      fieldtrip?.studentGradeKlass === me?.klassGroupName,
    )
  }

  if (!fieldtrip || fieldtrip?.fieldtripResultStatus === 'BEFORE_PARENT_CONFIRM') {
    return (
      <div className="h-screen-7 relative flex items-center justify-center rounded-lg border bg-white py-5 text-center">
        <div className="absolute top-5 left-0">
          <div className="flex w-full items-center justify-start space-x-2 px-5">
            <div
              className="text-brand-1 cursor-pointer underline"
              onClick={() => fieldtrip && pushWithQueryParams(`/teacher/fieldtrip/${fieldtrip.id}`)}
            >
              신청서
            </div>
            <div
              className="text-brand-1 cursor-pointer underline"
              onClick={() => fieldtrip && pushWithQueryParams(`/teacher/fieldtrip/notice/${fieldtrip.id}`)}
            >
              통보서
            </div>
            <div className="text-brand-1 cursor-pointer underline">결과보고서</div>
          </div>
        </div>
        {fieldtrip ? (
          <div className="bg-white p-5 text-lg">
            학생이 작성한 결과보고서의 보호자 승인이 필요합니다.
            <div className="relative flex items-center justify-center pt-2">
              {fieldtrip?.fieldtripResultStatus.toString() === 'BEFORE_PARENT_CONFIRM' && (
                <Button.lg
                  children="알림톡 재전송"
                  onClick={() => resendAlimtalk()}
                  className="bg-blue-500 text-white"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 text-lg">아직 결과보고서가 작성되지 않았습니다.</div>
        )}
      </div>
    )
  }

  if (!readState) {
    return (
      <FieldtripResultUpdatePage
        school={school}
        fieldtrip={fieldtrip}
        setReadState={() => setReadState(true)}
        isConfirmed={isApproved}
      />
    )
  }

  return (
    <div className="h-screen-10">
      {loading && <Blank reversed />}
      {isLoading && <Blank reversed />}

      <div className="h-screen-10 md:h-screen-7 bg-white py-5 md:rounded-lg md:border">
        <div className="relative h-full w-auto overflow-scroll">
          <div className="flex w-full items-center justify-start space-x-2 px-5">
            <div
              className="text-brand-1 cursor-pointer underline"
              onClick={() => pushWithQueryParams(`/teacher/fieldtrip/${fieldtrip.id}`)}
            >
              신청서
            </div>
            <div
              className="text-brand-1 cursor-pointer underline"
              onClick={() => pushWithQueryParams(`/teacher/fieldtrip/notice/${fieldtrip.id}`)}
            >
              통보서
            </div>
            <div className="text-brand-1 cursor-pointer underline">결과보고서</div>
          </div>
          {fieldtrip?.fieldtripResultStatus === 'RETURNED' && fieldtrip?.notApprovedReason && fieldtrip?.updatedAt && (
            <div className="bg-brand-5 mx-5 flex items-center justify-between rounded-lg px-5 py-2">
              <div className="text-brand-1">{fieldtrip?.notApprovedReason}</div>
              <div className="text-sm text-gray-500">
                {makeDateToString(new Date(fieldtrip?.updatedAt))} {makeTimeToString(new Date(fieldtrip?.updatedAt))}에
                마지막으로 수정
              </div>
            </div>
          )}
          {fieldtrip?.updateReason && fieldtrip?.updatedAt && (
            <div className="bg-brand-5 flex items-center justify-between rounded-lg px-5 py-2">
              <div className="text-brand-1">{fieldtrip?.updateReason}</div>
              <div className="text-sm text-gray-500">
                {makeDateToString(fieldtrip?.updatedAt)} {makeTimeToString(fieldtrip?.updatedAt)}에 마지막으로 수정
              </div>
            </div>
          )}

          <div ref={ref} className={`md:h-[1100px] ${download ? 'w-[778px]' : 'w-full p-5 md:p-0'} bg-white`}>
            <FieldtripPaper
              school={school}
              fieldtrip={fieldtrip}
              content={content}
              type="결과보고서"
              resultTextPage1={resultTextPages[0]}
              isPaper={download}
            />
          </div>

          {fieldtrip?.type === 'HOME' && (
            <>
              {homeplans?.map((content, i: number) => (
                <div
                  key={i}
                  ref={separatePaperRefs.current[i]}
                  className={` ${download ? 'h-[1100px] w-[778px] p-15' : 'w-full p-5 md:p-12'} bg-white`}
                >
                  <FieldtripSeparatePaper
                    studentName={fieldtrip?.student?.name + getNickName(fieldtrip?.student?.nickName)}
                    studentGradeKlass={fieldtrip?.studentGradeKlass + ' ' + fieldtrip?.studentNumber + '번'}
                    fieldtrip={fieldtrip}
                    index={i + 1}
                    content={content}
                    type="결과보고서"
                  />
                </div>
              ))}
            </>
          )}

          {fieldtrip?.type === 'SUBURBS' && resultTextPages.length > 1 && (
            <>
              {resultTextPages.slice(1).map((el: string, i: number) => (
                <div
                  key={i}
                  ref={refTextPageRemain.current[i]}
                  className={` ${download ? 'h-[1100px] w-[778px] p-15' : 'w-full p-5 md:p-12'} bg-white`}
                >
                  <FieldtripSuburbsTextSeparatePaper
                    studentName={(fieldtrip?.student?.name || '') + getNickName(fieldtrip?.student?.nickName)}
                    fieldtrip={fieldtrip}
                    resultTextPage={el}
                  />
                </div>
              ))}
            </>
          )}
          {fieldtrip?.type === 'SUBURBS' && (
            <>
              {resultFilesWithTwo.map((el: string[], i: number) => (
                <div
                  key={i}
                  ref={separatePaperRefs.current[i]}
                  className={` ${download ? 'h-[1100px] w-[778px] p-15' : 'w-full p-5 md:p-12'} bg-white`}
                >
                  <FieldtripSuburbsSeparatePaper
                    studentName={(fieldtrip?.student?.name || '') + getNickName(fieldtrip?.student?.nickName)}
                    fieldtrip={fieldtrip}
                    resultFile1={el[0]}
                    resultFile2={el[1]}
                  />
                </div>
              ))}
            </>
          )}
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 overflow-x-auto px-2 md:mt-8 md:px-0">
          <Button.xl
            children="다운로드"
            disabled={clicked || checkButtonDisable(approveButtonType.DOWNLOAD)}
            onClick={async () => {
              if (ref?.current) {
                setDownload(true)
              }
            }}
            className="filled-green max-md:hidden"
          />
          <Button.xl
            children={fieldtrip?.fieldtripResultStatus === 'RETURNED' ? '반려됨' : '반려'}
            disabled={checkButtonDisable(approveButtonType.RETURN)}
            onClick={() => setDeny(true)}
            className="filled-blue"
          />
          <Button.xl
            children={isApproved ? '승인 후 수정' : '수정'}
            disabled={checkButtonDisable(approveButtonType.EDIT)}
            onClick={() => setReadState(false)}
            className="filled-yellow"
          />
          <Button.xl
            children={nowApprove ? '승인' : isApproved ? '승인 완료' : '승인 대기'}
            disabled={checkButtonDisable(approveButtonType.APPROVE)}
            onClick={() => {
              setOpen(true)
              setAgreeAll(false)
            }}
            className="filled-primary"
          />
        </div>
        <SuperModal modalOpen={download} setModalClose={() => setDownload(false)} className="w-max">
          <div className="px-12 py-6">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              체험학습 결과보고서를 다운로드 하시겠습니까?
            </div>
            <div className="flex space-x-2">
              <Button.lg
                children="다운로드"
                disabled={clicked}
                onClick={async () => {
                  setClicked(true)
                  if (ref?.current) {
                    const { addPage, download } = getDoc()

                    const imgData = await extractReactData(ref.current)
                    await addPage(imgData)

                    if (planRef?.current) {
                      const planImgData = await extractReactData(planRef.current)
                      await addPage(planImgData)
                    }

                    for (const ref of refTextPageRemain.current) {
                      if (ref) {
                        const paperImgData = await extractReactData(ref)
                        await addPage(paperImgData)
                      }
                    }

                    for (const ref of separatePaperRefs.current) {
                      if (ref) {
                        const paperImgData = await extractReactData(ref)
                        await addPage(paperImgData)
                      }
                    }

                    const fileName = `체험학습 결과보고서_${
                      fieldtrip?.startAt && fieldtrip?.endAt && makeStartEndToString(fieldtrip.startAt, fieldtrip.endAt)
                    }_${fieldtrip?.student?.name}.pdf`
                    await download(fileName)
                  }
                  setClicked(false)
                  setDownload(false)
                }}
                className="filled-green w-full"
              />
              <Button.lg
                children="취소"
                onClick={async () => {
                  setClicked(false)
                  setDownload(false)
                }}
                className="filled-gray w-full"
              />
            </div>
          </div>
        </SuperModal>
        <SuperModal modalOpen={deny} setModalClose={() => setDeny(false)} className="w-max">
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              이 학생의 체험학습 결과보고서를 반려하시겠습니까?
            </div>
            <Textarea
              placeholder="반려 이유"
              value={notApprovedReason}
              onChange={(e) => setNotApprovedReason(e.target.value)}
            />
            <Button.xl
              children="반려하기"
              disabled={!notApprovedReason}
              onClick={() => {
                setLoading(true)
                denyFieldtripResult({ id: Number(id), data: { reason: notApprovedReason } })
              }}
              className="filled-primary"
            />
          </Section>
        </SuperModal>

        {/* 삭제요청 버튼이 없기 때문에 아래 SuperModal은 실제로 사용되지는 않음, 코드 베이스 유지를 위해서 삭제는 하지않음 */}
        <SuperModal modalOpen={deleteAppeal} setModalClose={() => setDeleteAppeal(false)} className="w-max">
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              이 체험학습 결과보고서를 삭제하도록 요청하시겠습니까?
            </div>
            <Textarea placeholder="삭제 이유" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
            <span className="text-sm text-red-400">* 교사가 삭제요청하면 학생 또는 보호자가 삭제할 수 있습니다.</span>
            <Button.xl
              children="삭제 요청하기"
              disabled={!deleteReason}
              onClick={() => {
                setLoading(true)
                deleteAppealFieldtripResult({ id: Number(id), data: { reason: deleteReason } })
              }}
              className="filled-red"
            />
          </Section>
        </SuperModal>
      </div>
    </div>
  )
}
