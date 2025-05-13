import { t } from 'i18next'
import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useParams } from 'react-router'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank } from '@/legacy/components'
import { AbsentPaper } from '@/legacy/components/absent/AbsentPaper'
import { ParentConfirmPaper } from '@/legacy/components/absent/ParentConfirmPaper'
import { TeacherConfirmPaper } from '@/legacy/components/absent/TeacherConfirmPaper'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { PdfCard } from '@/legacy/components/common/PdfCard'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { Constants } from '@/legacy/constants'
import { useStudentAbsentDetail } from '@/legacy/container/student-absent-detail'
import { UserContainer } from '@/legacy/container/user'
import { AbsentStatus, Role } from '@/legacy/generated/model'
import { isPdfFile } from '@/legacy/util/file'

import { AbsentAddPage } from './AbsentAddPage'

export function AbsentDetailPage() {
  const { push } = useHistory()

  const { id } = useParams<{ id: string }>()
  const { me } = UserContainer.useContext()

  const { absent, error, isLoading, deleteAbsent, errorMessage, refetch, resendAlimtalk } = useStudentAbsentDetail(
    Number(id),
  )

  const isReturned = absent?.absentStatus === AbsentStatus.RETURNED

  const [mode, setMode] = useState(false)

  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')

  const images = absent?.evidenceFiles.filter((image) => !isPdfFile(image)) || []
  const Pdfs = absent?.evidenceFiles.filter((image) => isPdfFile(image)) || []

  const images2 = absent?.evidenceFiles2.filter((image) => !isPdfFile(image)) || []
  const Pdfs2 = absent?.evidenceFiles2.filter((image) => isPdfFile(image)) || []

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  if (mode) {
    return (
      <AbsentAddPage
        absentData={absent}
        returnToDetail={() => {
          setMode(false)
          refetch()
        }}
      />
    )
  }

  return (
    <>
      {isLoading && <Blank />}
      {error && <ErrorBlank />}
      {isLoading && <Blank />}

      <TopNavbar
        title={`${t(`absentTitle`, '결석신고서')} 상세`}
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <Section>
        <div className="">
          {isReturned && (
            <div className={'my-1 mr-2 inline-block rounded-md bg-red-500 px-4 py-2 text-sm font-bold text-white'}>
              반려됨
            </div>
          )}
          {absent?.absentStatus === AbsentStatus.BEFORE_PARENT_CONFIRM && (
            <>
              <div className={'bg-brand-1 my-1 mr-2 inline-block rounded-md px-4 py-2 text-sm text-white'}>
                보호자 승인 중
              </div>
              <div className={'my-1 mr-2 inline-block rounded-md bg-gray-500 px-4 py-2 text-sm text-white'}>
                학교 승인 대기
              </div>
              <div className={'my-1 mr-2 inline-block rounded-md bg-gray-500 px-4 py-2 text-sm text-white'}>
                승인 진행중
              </div>
            </>
          )}

          {absent?.absentStatus === AbsentStatus.PROCESSING && (
            <>
              <div className={'bg-brand-1 text-darkgray my-1 mr-2 inline-block rounded-md px-4 py-2 text-sm'}>
                보호자 승인 완료
              </div>
              <div className={'bg-brand-1 my-1 mr-2 inline-block rounded-md px-4 py-2 text-sm text-white'}>
                학교 승인 중
              </div>
              <div className={'my-1 mr-2 inline-block rounded-md bg-gray-500 px-4 py-2 text-sm text-white'}>
                승인 진행중
              </div>
            </>
          )}

          {absent?.absentStatus === AbsentStatus.PROCESSED && (
            <>
              <div className={'bg-brand-1 text-darkgray my-1 mr-2 inline-block rounded-md px-4 py-2 text-sm'}>
                보호자 승인 완료
              </div>
              <div className={'bg-brand-1 text-darkgray my-1 mr-2 inline-block rounded-md px-4 py-2 text-sm'}>
                학교 승인 완료
              </div>
              <div className={'bg-brand-1 my-1 mr-2 inline-block rounded-md px-4 py-2 text-sm text-white'}>
                승인 완료
              </div>
            </>
          )}

          {isReturned && (
            <div className="bg-brand-5 flex items-center justify-between rounded-lg px-5 py-2">
              <div className="text-brand-1 text-sm">{absent?.notApprovedReason}</div>
              <div className="text-red-500">반려 이유</div>
            </div>
          )}
          {absent?.absentStatus === AbsentStatus.DELETE_APPEAL && (
            <div className="bg-brand-5 flex items-center justify-between rounded-lg px-5 py-2">
              <div className="text-brand-1 text-sm">{absent?.deleteReason}</div>
              <div className="text-red-500">삭제 이유</div>
            </div>
          )}
        </div>

        <div className="w-full bg-white">
          <AbsentPaper absent={absent} isMobileView />
        </div>
        {absent?.evidenceType === '학부모 확인서' && (
          <div className="w-full bg-white">
            <ParentConfirmPaper absent={absent} isMobileView />
          </div>
        )}

        {absent?.evidenceType === '담임교사 확인서' && absent?.absentStatus !== AbsentStatus.BEFORE_PARENT_CONFIRM && (
          <div className="w-full bg-white">
            <TeacherConfirmPaper absent={absent} isMobileView />
          </div>
        )}

        {/* <Label.col>
          <Label.Text children="*보호자 이름" />
          <TextInput value={parentsName} disabled />
        </Label.col>
        <div className="w-full">
          <label className="mb-1 text-sm text-gray-800">*발생일</label>
          {absent?.reportType === '결석' ? (
            <div className="mb-3 flex items-center">
              {absent?.startAt &&
                absent?.endAt &&
                absent?.reportType &&
                makeStartEndToString(absent.startAt, absent.endAt, absent.reportType)}
            </div>
          ) : (
            <div className="mb-3 flex items-center">
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
          )}
        </div>

        <Label.col>
          <Label.Text children="*신고유형" />
          <TextInput value={absent?.description + ' ' + absent?.reportType} disabled />
        </Label.col>
        <Label.col>
          <Label.Text children="*신고사유 선택" />
          <TextInput value={absent?.reason} disabled />
        </Label.col> */}

        {!!absent?.evidenceFiles?.length && (
          <>
            <br />
            <br />
            <h1 className="pt-6 text-xl font-semibold">증빙 서류</h1>
            {images?.map((image: string, i: number) => (
              <div
                key={i}
                className="w-full"
                onClick={() => {
                  setActiveIndex(i)
                  setImagesModalOpen(true)
                }}
              >
                <div className="aspect-5/3 rounded bg-gray-50">
                  <LazyLoadImage
                    src={`${Constants.imageUrl}${image}`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full rounded object-cover"
                  />
                </div>
              </div>
            ))}
            {Pdfs?.map((pdfFile: string) => {
              return (
                <div key={pdfFile}>
                  <div className="w-full">
                    <div className="relative">
                      <PdfCard
                        fileUrl={`${Constants.imageUrl}${pdfFile}`}
                        visibleButton
                        onClick={() => {
                          setFocusPdfFile(`${Constants.imageUrl}${pdfFile}`)
                          setPdfModalOpen(true)
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
        {!!absent?.evidenceFiles2?.length && (
          <>
            {images2?.map((image: string, i: number) => (
              <div
                key={i}
                className="w-full"
                onClick={() => {
                  setActiveIndex(i)
                  setImagesModalOpen(true)
                }}
              >
                <div className="aspect-5/3 rounded bg-gray-50">
                  <LazyLoadImage
                    src={`${Constants.imageUrl}${image}`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full rounded object-cover"
                  />
                </div>
              </div>
            ))}
            {Pdfs2?.map((pdfFile: string) => {
              return (
                <div key={pdfFile}>
                  <div className="w-full">
                    <div className="relative">
                      <PdfCard
                        fileUrl={`${Constants.imageUrl}${pdfFile}`}
                        visibleButton
                        onClick={() => {
                          setFocusPdfFile(`${Constants.imageUrl}${pdfFile}`)
                          setPdfModalOpen(true)
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
        <br />
        <div className="text-red-500">{errorMessage}</div>
        {me?.role === Role.PARENT && absent?.absentStatus === AbsentStatus.BEFORE_PARENT_CONFIRM && (
          <Button.lg
            children="승인하기"
            onClick={() => push(`/absent/approve/${absent?.id}`)}
            className={'bg-brand-1 text-white'}
          />
        )}

        {(absent?.absentStatus === AbsentStatus.BEFORE_PARENT_CONFIRM ||
          absent?.absentStatus === AbsentStatus.RETURNED ||
          absent?.nextApprover === 'approver1') && (
          <Button.lg children="수정하기" onClick={() => setMode(true)} className={'bg-yellow-500 text-white'} />
        )}

        {me?.role != Role.PARENT && absent?.absentStatus === AbsentStatus.BEFORE_PARENT_CONFIRM && (
          <Button.lg children="알림톡 재전송하기" onClick={() => resendAlimtalk()} className="bg-blue-500 text-white" />
        )}

        {(absent?.absentStatus === AbsentStatus.DELETE_APPEAL ||
          absent?.absentStatus === AbsentStatus.RETURNED ||
          absent?.absentStatus === AbsentStatus.BEFORE_PARENT_CONFIRM ||
          absent?.nextApprover === 'approver1') && (
          <Button.lg children="삭제하기" onClick={() => deleteAbsent()} className="bg-red-500 text-white" />
        )}

        <input type="file" id="fileupload" className="hidden" accept="thumbnail/*" disabled />

        <div className="h-32 w-full" />
        <div className="absolute">
          <Viewer
            visible={hasImagesModalOpen}
            rotatable
            noImgDetails
            scalable={false}
            images={viewerImages}
            onChange={(_, index) => setActiveIndex(index)}
            onClose={() => setImagesModalOpen(false)}
            activeIndex={activeIndex}
          />
        </div>
        <div className="absolute">
          <PdfViewer isOpen={hasPdfModalOpen} fileUrl={focusPdfFile} onClose={() => setPdfModalOpen(false)} />
        </div>
      </Section>
    </>
  )
}
