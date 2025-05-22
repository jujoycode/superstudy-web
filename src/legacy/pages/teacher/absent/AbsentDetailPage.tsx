import { t } from 'i18next'
import moment from 'moment'
import { useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { useOutletContext, useParams } from 'react-router'

import { ErrorBlank, SuperModal } from '@/legacy/components'
import { AbsentPaper } from '@/legacy/components/absent/AbsentPaper'
import { ParentConfirmPaper } from '@/legacy/components/absent/ParentConfirmPaper'
import { TeacherConfirmPaper } from '@/legacy/components/absent/TeacherConfirmPaper'
import CertificationBadge from '@/legacy/components/blockchain/CertificationBadge'
import { BackButton, Blank, Section, Textarea, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Constants } from '@/legacy/constants'
import { useBlockChainDocument } from '@/legacy/container/block-chain-document-status'
import { useTeacherAbsentDeatil } from '@/legacy/container/teacher-absent-detail'
import { AbsentStatus, ResponseUserDto } from '@/legacy/generated/model'
import { AbsentUpdatePage } from '@/legacy/pages/teacher/absent/AbsentUpdatePage'

import { AbsentEvidenceType, approveButtonType } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { extractImageData, extractReactData, extractReactDataArray, getDoc, getPdfImageSize } from '@/legacy/util/pdf'
import { buttonEnableState } from '@/legacy/util/permission'
import { makeStartEndToString } from '@/legacy/util/time'

interface AbsentDetailPageProps {
  setOpen: (b: boolean) => void
  setAbsentId: (n: number) => void
  setAgreeAll: (b: boolean) => void
  userId?: number
  me?: ResponseUserDto
}

export function AbsentDetailPage() {
  const { setOpen, setAbsentId, setAgreeAll, userId, me } = useOutletContext<AbsentDetailPageProps>()
  const { id } = useParams<{ id: string }>()
  const ref = useRef(null)
  const parentRef = useRef(null)
  const pdfPaperRefs = useRef<any[]>([])
  const parent2Ref = useRef(null)
  const pdf2PaperRefs = useRef<any[]>([])
  const { data } = useBlockChainDocument({ referenceTable: 'ABSENT', referenceId: Number(id) })

  const [changeMode, setChangeMode] = useState(false)
  const [clicked, setClicked] = useState(false)

  const [download, setDownload] = useState(false)

  const [numPages, setNumPages] = useState(0)

  const {
    deny,
    setDeny,
    deleteAppeal,
    setDeleteAppeal,
    notApprovedReason,
    setNotApprovedReason,
    deleteReason,
    setDeleteReason,
    absent,
    menses,
    denyAbsent,
    deleteAppealAbsent,
    deleteAbsent,
    isLoading,
    resendAlimtalk,
    comment,
    setComment,
    mensesDialog,
    setMensesDialog,
    teacherCommentAbsent,
    teacherComment,
    setTeacherComment,
    errorMessage,
  } = useTeacherAbsentDeatil({ id: Number(id), setAbsentId })

  if (!isLoading && !absent) {
    return <ErrorBlank text="이미 삭제되었거나 더 이상 유효하지 않습니다." />
  }

  if (changeMode) {
    return (
      <AbsentUpdatePage
        absentData={absent}
        isConfirmed={absent?.absentStatus === AbsentStatus.PROCESSED}
        setChangeMode={(b: boolean) => setChangeMode(b)}
      />
    )
  }

  // 결재권자 인지. 결재라인에 있으면 true, 없으면 false
  const approver =
    absent?.approver1Id === userId ||
    absent?.approver2Id === userId ||
    absent?.approver3Id === userId ||
    absent?.approver4Id === userId ||
    absent?.approver5Id === userId

  const approvedLine = [
    absent?.approver1Signature && absent?.approver1Id,
    absent?.approver2Signature && absent?.approver2Id,
    absent?.approver3Signature && absent?.approver3Id,
    absent?.approver4Signature && absent?.approver4Id,
    absent?.approver5Signature && absent?.approver5Id,
  ]
  // 승인할 차례 : true, 승인전/승인후 : false
  const nowApprove = absent?.nextApproverId === userId

  // 내가 승인한 건 : ture , 승인 안한 건 : false
  const isApproved = nowApprove ? false : approvedLine.includes(me?.id)

  // 승인 전 = !isApproved && !nowApprove
  // 승인 후 = isApproved && !nowApprove

  const checkButtonDisable = (bottonType: approveButtonType) => {
    return !buttonEnableState(
      bottonType,
      approver,
      nowApprove,
      absent?.absentStatus || '',
      absent?.studentGradeKlass === me?.klassGroupName,
    )
  }

  const getUrl = (fileName: string) => {
    let url = ''

    if (fileName.includes('blob')) {
      const index = fileName.indexOf('?')

      if (index !== -1) {
        url = fileName.substring(0, index) // 0부터 ? 이전까지 문자열 추출
      } else {
        url = fileName
      }
    } else {
      url = Constants.imageUrl + fileName
    }

    return url
  }

  const getMensesMessage = () => {
    const now = moment(absent?.startAt)
    const monthNum = now.month() + 1
    const studentName = absent?.student.name

    if (menses && menses.length > 1) {
      const mensesText = menses
        .filter((f) => f.studentId === absent?.studentId && f.id !== absent.id)
        .map((mense) => {
          const statusText = mense.absentStatus === AbsentStatus.PROCESSED ? '결재완료' : '결재중'
          return `${makeStartEndToString(mense.startAt, mense.endAt, mense.reportType)} ${mense.description}${
            mense.reportType
          } ${mense.reason} ${statusText}`
        })

      return (
        <div>
          <div className="w-full text-center text-lg font-bold text-gray-900">
            {monthNum}월 중, {studentName}학생의 생리 관련 출결신청 된 이전 서류가 {mensesText.length}건 있습니다.
          </div>
          <div className="my-10 w-full text-center text-base text-gray-900">
            {mensesText.map((m) => (
              <span>
                {m}
                <br />
              </span>
            ))}
          </div>
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">계속 결재를 진행하시겠습니까?</div>
        </div>
      )
    } else {
      return (
        <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
          {monthNum}월 중, {studentName}학생의 생리 관련 출결신청 된 이전 서류가 0건 있습니다.
          <br />
          계속 결재를 진행하시겠습니까?
        </div>
      )
    }
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  return (
    <>
      {isLoading && <Blank reversed />}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      <div className="block md:hidden">
        <TopNavbar title="상세보기" left={<BackButton />} />
      </div>
      <div className="relative rounded-lg border bg-white md:m-6">
        {/* Desktop V */}
        <div className="h-screen-10 md:h-screen-6 relative w-auto overflow-scroll md:mb-0">
          {absent?.updateReason && (
            <div className="bg-primary-100 m-2 flex items-center justify-between rounded-lg px-5 py-2">
              <div className="text-primary-800">{absent?.updateReason}</div>
              <div className="text-sm text-gray-500">
                {DateUtil.formatDate(absent?.updatedAt, DateFormat['YYYY-MM-DD HH:mm'])}에 마지막으로 수정
              </div>
            </div>
          )}
          {absent?.absentStatus === AbsentStatus.RETURNED && (
            <div className="bg-primary-100 m-2 flex items-center justify-between rounded-lg px-5 py-2">
              <div className="text-primary-800 text-sm">{absent?.notApprovedReason}</div>
              <div className="text-red-500">반려 이유</div>
            </div>
          )}
          {absent?.absentStatus === AbsentStatus.BEFORE_PARENT_CONFIRM && (
            <div className="bg-primary-100 m-2 flex items-center justify-between rounded-lg px-5 py-2">
              <div className="text-primary-800 text-sm">학부모 승인 전</div>
              <Button.sm
                children="학부모 승인 요청 다시하기"
                onClick={() => resendAlimtalk()}
                className="bg-blue-500 text-white"
              />
            </div>
          )}
          {data?.status && data?.status !== 'NO_DATA' && (
            <div className="m-2 flex justify-end px-5 py-2">
              <CertificationBadge status={data?.status} />
            </div>
          )}
          {/* <div className="w-full overflow-x-scroll md:w-auto md:overflow-auto"> */}
          <div ref={ref} className={`${download ? 'h-[1100px] w-[778px]' : 'w-full'} bg-white`}>
            <AbsentPaper ref={ref} absent={absent} />
            {absent?.evidenceType === '학부모 확인서' && <ParentConfirmPaper ref={parentRef} absent={absent} />}
            {absent?.evidenceType === '담임교사 확인서' && <TeacherConfirmPaper ref={parentRef} absent={absent} />}
            {absent?.evidenceType2 === '학부모 확인서' && <ParentConfirmPaper ref={parent2Ref} absent={absent} />}
            {absent?.evidenceType2 === '담임교사 확인서' && <TeacherConfirmPaper ref={parent2Ref} absent={absent} />}
          </div>

          {absent?.evidenceFiles &&
            absent?.evidenceType !== '학부모 확인서' &&
            absent.evidenceFiles.map((evidenceFile: string, i: number) =>
              evidenceFile.split('.').pop()?.toLowerCase() === 'pdf' ? (
                <Document
                  file={getUrl(evidenceFile)} // 여기는 가지고 계신 pdf 주소
                  onLoadSuccess={onDocumentLoadSuccess}
                  key={String(absent.id) + '-evidenceFile'}
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div
                      key={index}
                      ref={(el: HTMLDivElement | null): void => {
                        if (pdfPaperRefs.current !== null && el !== null) {
                          pdfPaperRefs.current[index] = el
                        }
                      }}
                      className="h-[1100px] w-[778px] overflow-hidden bg-white"
                    >
                      <Page
                        width={pdfPaperRefs.current[index]?.clientWidth}
                        height={pdfPaperRefs.current[index]?.clientHeight}
                        key={index}
                        pageNumber={index + 1}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  ))}
                </Document>
              ) : (
                <div
                  key={i}
                  className={` ${download ? 'h-[1100px] w-[778px]' : 'w-full p-5'} overflow-hidden bg-white`}
                >
                  <img className="object-cover" src={`${Constants.imageUrl}${evidenceFile}`} alt="" />
                </div>
              ),
            )}

          {absent?.evidenceFiles2?.length &&
            absent?.evidenceType2 !== '학부모 확인서' &&
            absent.evidenceFiles2.map((evidenceFile: string, i: number) =>
              evidenceFile.split('.').pop()?.toLowerCase() === 'pdf' ? (
                <Document
                  file={getUrl(evidenceFile)} // 여기는 가지고 계신 pdf 주소
                  onLoadSuccess={onDocumentLoadSuccess}
                  key={String(absent.id) + '-evidenceFile2'}
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div
                      key={index}
                      ref={(el: HTMLDivElement | null): void => {
                        if (pdf2PaperRefs.current !== null && el !== null) {
                          pdf2PaperRefs.current[index] = el
                        }
                      }}
                      className="h-[1100px] w-[778px] overflow-hidden bg-white"
                    >
                      <Page
                        width={pdf2PaperRefs.current[index]?.clientWidth}
                        height={pdf2PaperRefs.current[index]?.clientHeight}
                        key={index}
                        pageNumber={index + 1}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  ))}
                </Document>
              ) : (
                <div
                  key={i}
                  className={` ${download ? 'h-[1100px] w-[778px]' : 'w-full p-5'} overflow-hidden bg-white`}
                >
                  <img className="object-cover" src={`${Constants.imageUrl}${evidenceFile}`} alt="" />
                </div>
              ),
            )}

          <div className="my-3 px-3 pb-10">
            {absent?.evidenceType !== '학부모 확인서' &&
              absent?.evidenceFiles?.map((evidenceFile: string, index) => (
                <div key={index}>
                  <div className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <a href={`${Constants.imageUrl}${evidenceFile}`} target="_blank" rel="noreferrer" download>
                      <ul className="rounded-md border border-gray-200 bg-white">
                        <li className="flex items-center justify-between px-4 py-3 text-sm">
                          <div className="flex w-0 flex-1 items-center">
                            <svg
                              className="h-5 w-5 shrink-0 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                            >
                              <path d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" />
                            </svg>
                            <span className="ml-2 w-0 flex-1 truncate">
                              {absent?.evidenceType + (index + 1).toString()}
                            </span>
                          </div>
                          <div className="ml-4 shrink-0">
                            <span className="font-medium text-indigo-600 hover:text-indigo-500">Download</span>
                          </div>
                        </li>
                      </ul>
                    </a>
                  </div>
                  <span className="text-lg font-semibold"></span>
                </div>
              ))}
          </div>
          <div className="my-3 px-3 pb-10">
            {absent?.evidenceType2 !== '학부모 확인서' &&
              absent?.evidenceFiles2?.map((evidenceFile: string, index) => (
                <div key={index}>
                  <div className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <a href={`${Constants.imageUrl}${evidenceFile}`} target="_blank" rel="noreferrer" download>
                      <ul className="rounded-md border border-gray-200 bg-white">
                        <li className="flex items-center justify-between px-4 py-3 text-sm">
                          <div className="flex w-0 flex-1 items-center">
                            <svg
                              className="h-5 w-5 shrink-0 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                            >
                              <path d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" />
                            </svg>
                            <span className="ml-2 w-0 flex-1 truncate">
                              {absent?.evidenceType + (index + 1).toString()}
                            </span>
                          </div>
                          <div className="ml-4 shrink-0">
                            <span className="font-medium text-indigo-600 hover:text-indigo-500">Download</span>
                          </div>
                        </li>
                      </ul>
                    </a>
                  </div>
                  <span className="text-lg font-semibold"></span>
                </div>
              ))}
          </div>
        </div>
        <div className="fixed bottom-16 w-full bg-gray-50 md:absolute md:bottom-0">
          <div className="bottom-0 -ml-1 block md:sticky md:ml-0" style={{ width: 'inherit', maxWidth: 'inherit' }}>
            <div className="mt-3 grid auto-cols-fr grid-flow-col gap-2 px-2 md:px-0">
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
              {absent?.writerName === me?.name && absent?.absentStatus !== AbsentStatus.PROCESSED ? (
                <Button.xl
                  children={'삭제'}
                  onClick={() => {
                    if (confirm(`${t(`absentTitle`, '결석신고서')}를 삭제하시겠습니까?`)) {
                      deleteAbsent()
                    }
                  }}
                  className="filled-red"
                />
              ) : (
                <Button.xl
                  children={absent?.absentStatus === AbsentStatus.DELETE_APPEAL ? '삭제대기' : '삭제요청'}
                  disabled={checkButtonDisable(approveButtonType.DELETE)}
                  onClick={() => setDeleteAppeal(true)}
                  className="filled-red"
                />
              )}

              <Button.xl
                children={absent?.absentStatus === AbsentStatus.RETURNED ? '반려됨' : '반려'}
                disabled={checkButtonDisable(approveButtonType.RETURN)}
                onClick={() => setDeny(true)}
                className="filled-blue"
              />
              <Button.xl
                children={isApproved ? '승인 후 수정' : '수정'}
                disabled={checkButtonDisable(approveButtonType.EDIT)}
                onClick={() => setChangeMode(true)}
                className="filled-yellow"
              />
              <Button.xl
                children={nowApprove ? '승인' : isApproved ? '승인 완료' : '승인 대기'}
                disabled={checkButtonDisable(approveButtonType.APPROVE)}
                onClick={() => {
                  if (absent?.reason === '생리') {
                    setMensesDialog(true)
                  } else if (absent?.evidenceType === '담임교사 확인서' && absent?.teacherComment === '') {
                    /// 증빙서류가 담임교사 확인서면 코멘트 입력창 띄우기
                    /// 코멘트 작성 후 승인하기 클릭하면 서명하기
                    setComment(true)
                  } else {
                    setOpen(true)
                    setAgreeAll(false)
                  }
                }}
                className="filled-primary"
              />
            </div>
          </div>
        </div>
        <SuperModal modalOpen={download} setModalClose={() => setDownload(false)} className="w-max">
          <div className="px-12 py-6">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              {`${t(`absentTitle`, '결석신고서')}를 다운로드 하시겠습니까?`}
            </div>
            <div className="flex space-x-2">
              <Button.lg
                children="다운로드"
                disabled={clicked}
                onClick={async () => {
                  setClicked(true)
                  if (ref?.current) {
                    const { addPage, download } = getDoc()

                    const absentPdfData = await extractReactData(ref.current)
                    await addPage(absentPdfData)

                    if (absent?.evidenceType === AbsentEvidenceType.PARENT && parentRef?.current) {
                      const parentPdfData = await extractReactData(parentRef.current)
                      await addPage(parentPdfData)
                    }
                    if (absent?.evidenceType === AbsentEvidenceType.TEACHER && parentRef?.current) {
                      const parentPdfData = await extractReactData(parentRef.current)
                      await addPage(parentPdfData)
                    }
                    if (absent?.evidenceType !== AbsentEvidenceType.PARENT && absent?.evidenceFiles?.length) {
                      // PDF 출력
                      if (pdfPaperRefs.current !== null) {
                        const absentPdfDataArray = await extractReactDataArray(pdfPaperRefs.current)
                        if (absentPdfDataArray) {
                          for (const absentPdfData of absentPdfDataArray) {
                            addPage(absentPdfData)
                          }
                        }
                      }

                      // 이미지 출력
                      for (const ef of absent.evidenceFiles) {
                        if (ef.split('.').pop()?.toLowerCase() !== 'pdf') {
                          const evidenceFile = `${Constants.imageUrl}${ef}`
                          const imgData = await extractImageData(evidenceFile)
                          if (!imgData) continue
                          const { width: imageWidth = 0, height: imageHeight = 0, data } = imgData
                          const [width, height] = getPdfImageSize(imageWidth, imageHeight)
                          await addPage(data, 'JPEG', width, height)
                        }
                      }
                    }

                    if (absent?.evidenceType2 === AbsentEvidenceType.PARENT && parent2Ref?.current) {
                      const parent2PdfData = await extractReactData(parent2Ref.current)
                      await addPage(parent2PdfData)
                    }
                    if (absent?.evidenceType2 === AbsentEvidenceType.TEACHER && parent2Ref?.current) {
                      const parent2PdfData = await extractReactData(parent2Ref.current)
                      await addPage(parent2PdfData)
                    }
                    if (absent?.evidenceType2 !== AbsentEvidenceType.PARENT && absent?.evidenceFiles2?.length) {
                      // PDF 출력
                      if (pdf2PaperRefs.current !== null) {
                        const absentPdfDataArray = await extractReactDataArray(pdf2PaperRefs.current)
                        if (absentPdfDataArray) {
                          for (const absentPdfData of absentPdfDataArray) {
                            addPage(absentPdfData)
                          }
                        }
                      }

                      // 이미지 출력
                      for (const ef of absent.evidenceFiles2) {
                        if (ef.split('.').pop()?.toLowerCase() !== 'pdf') {
                          const evidenceFile = `${Constants.imageUrl}${ef}`
                          const imgData = await extractImageData(evidenceFile)
                          if (!imgData) continue
                          const { width: imageWidth = 0, height: imageHeight = 0, data } = imgData
                          const [width, height] = getPdfImageSize(imageWidth, imageHeight)
                          await addPage(data, 'JPEG', width, height)
                        }
                      }
                    }

                    const fileName = `결석신고서_${
                      absent?.startAt && absent?.endAt && makeStartEndToString(absent.startAt, absent.endAt)
                    }_${absent?.student?.name}.pdf`
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
              {`이 학생의 ${t(`absentTitle`, '결석신고서')}를 반려하시겠습니까?`}
            </div>
            <Textarea
              placeholder="반려 이유"
              value={notApprovedReason}
              onChange={(e) => setNotApprovedReason(e.target.value)}
            />
            <Button.lg
              children="반려하기"
              disabled={!notApprovedReason}
              onClick={() => denyAbsent()}
              className="filled-primary"
            />
          </Section>
        </SuperModal>
        <SuperModal modalOpen={comment} setModalClose={() => setComment(false)} className="w-max">
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              담임교사 확인서 내용을 등록하세요.
            </div>
            <Textarea
              placeholder="학생의 상태를 구체적으로 적어주세요."
              value={teacherComment}
              onChange={(e) => setTeacherComment(e.target.value)}
            />
            <Button.lg
              children="등록하기"
              disabled={!teacherComment}
              onClick={() => {
                teacherCommentAbsent()
                setOpen(true)
                setAgreeAll(false)
              }}
              className="filled-primary"
            />
          </Section>
        </SuperModal>
        <SuperModal modalOpen={mensesDialog} setModalClose={() => setMensesDialog(false)} className="w-max">
          <Section className="mt-7">
            {getMensesMessage()}

            <div className="flex space-x-2">
              <Button.lg
                children="확인"
                onClick={() => {
                  setMensesDialog(false)
                  setOpen(true)
                  setAgreeAll(false)
                }}
                className="filled-green w-full"
              />
              <Button.lg
                children="취소"
                onClick={() => {
                  setMensesDialog(false)
                }}
                className="filled-gray w-full"
              />
            </div>
          </Section>
        </SuperModal>

        <SuperModal modalOpen={deleteAppeal} setModalClose={() => setDeleteAppeal(false)} className="w-max">
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              {`이 ${t(`absentTitle`, '결석신고서')}를 삭제하도록 요청하시겠습니까?`}
            </div>
            <Textarea placeholder="삭제 이유" onChange={(e) => setDeleteReason(e.target.value)} value={deleteReason} />
            <span className="text-sm text-red-400">* 교사가 삭제요청하면 학생 또는 보호자가 삭제할 수 있습니다.</span>
            <Button.lg
              children="삭제 요청하기"
              disabled={!deleteReason}
              onClick={() => deleteAppealAbsent()}
              className="filled-red"
            />
          </Section>
        </SuperModal>
      </div>
    </>
  )
}
