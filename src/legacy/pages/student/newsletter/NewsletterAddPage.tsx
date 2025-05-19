import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { useUserStore } from '@/stores/user'
import {
  BackButton,
  Blank,
  BottomFixed,
  CloseButton,
  Label,
  PhoneNumberField,
  Section,
  TopNavbar,
} from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { PdfCard } from '@/legacy/components/common/PdfCard'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Typography } from '@/legacy/components/common/Typography'
import { SuperSurveyComponent } from '@/legacy/components/survey/SuperSurveyComponent'
import { Constants } from '@/legacy/constants'
import { useStudentNewsletterAdd } from '@/legacy/container/student-newsletter-add'
import {
  NewsletterType,
  RequestUpsertStudentNewsletterDto,
  ResponseNewsletterDetailDto,
  Role,
  StudentNewsletter,
} from '@/legacy/generated/model'
import { useSignature } from '@/legacy/hooks/useSignature'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'
import { makeDateToString } from '@/legacy/util/time'

interface NewsletterAddPageProps {
  newsletterData: ResponseNewsletterDetailDto
  studentNewsletterData?: StudentNewsletter
  setUpdateState: (b: boolean) => void
}

// TODO : 본 파일 삭제

export function NewsletterAddPage({ studentNewsletterData, newsletterData, setUpdateState }: NewsletterAddPageProps) {
  const { me } = useUserStore()

  const { canvasRef, sigPadData, clearSignature } = useSignature()

  const { upsertStudentNewsletter, isLoading, errorMessage } = useStudentNewsletterAdd(newsletterData.id)

  const [content, setContent] = useState<any>(() => {
    return studentNewsletterData?.content ? JSON.parse(studentNewsletterData.content) : {}
  })
  const [nokName] = useState(
    me?.role === Role.PARENT ? me?.name : me?.nokName || '', // 학부모 이름
  )
  const [nokPhone] = useState(me?.role === Role.PARENT ? me?.phone : me?.nokPhone || '')

  const [openSignModal, setOpenSignModal] = useState(false)

  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')

  const images = newsletterData?.images.filter((image) => !isPdfFile(image)) || []
  const Pdfs = newsletterData?.images.filter((image) => isPdfFile(image)) || []
  const documents = newsletterData?.files || []

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  const buttonDisabled = newsletterData?.surveyContent ? Object.values(content).some((v) => v === '') : false

  const handleSubmit = () => {
    const regExp = /^010(?:\d{4})\d{4}$/
    if (nokPhone && !regExp.test(nokPhone.replace(/-/g, ''))) {
      alert('보호자 연락처를 확인해 주세요.')
      return
    }

    // if (studentNewsletterData) {
    //   upsertStudentNewsletter(data);
    //   setUpdateState(false);
    // } else {
    setOpenSignModal(true)
    //}
  }

  const handleSubmitWithSign = () => {
    if (!sigPadData) {
      alert('서명이 없습니다. 서명을 해주세요.')
      return
    }

    const data: RequestUpsertStudentNewsletterDto = {
      nokName: nokName,
      nokPhone: nokPhone,
      newsletterId: newsletterData.id,
      content: JSON.stringify(content),
      studentSignature: sigPadData,
    }
    upsertStudentNewsletter(data)
    setOpenSignModal(false)
    setUpdateState(false)
  }

  return (
    <>
      {isLoading && <Blank />}
      <TopNavbar
        title="가정통신문"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <Section>
        <div className="flex items-center">
          <div className="w-max rounded-md bg-red-50 px-3 py-1 text-sm font-bold text-red-500">
            {newsletterData?.category || '가정통신문'}
          </div>
          <div className="w-min-10 ml-3 rounded-md bg-purple-100 px-1 py-1 text-sm text-purple-700">
            {newsletterData?.toStudent && '학생'} {newsletterData?.toParent && '보호자'}{' '}
            {newsletterData?.type === NewsletterType.NOTICE ? '- 공지' : '- 설문'}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{newsletterData?.title}</h1>
          <div className="text-sm text-gray-500">
            {newsletterData?.createdAt && makeDateToString(new Date(newsletterData.createdAt), '.')}
          </div>
        </div>
      </Section>
      <div className="h-0.5 w-full bg-gray-100" />
      <Section>
        <div className="feedback_space text-gray-2 text-sm break-words break-all whitespace-pre-line">
          <Linkify>{newsletterData?.content}</Linkify>
        </div>
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
            <>
              <div key={pdfFile}>
                <div className="h-full">
                  <div className="relative aspect-auto">
                    <PdfCard
                      fileUrl={`${Constants.imageUrl}${pdfFile}`}
                      visibleButton
                      onClick={() => {
                        setFocusPdfFile(`${Constants.imageUrl}${pdfFile}`)
                        setPdfModalOpen(true)
                      }}
                    ></PdfCard>
                  </div>
                </div>
              </div>
            </>
          )
        })}
        <br />
        {newsletterData?.files?.length ? (
          <>
            {documents?.map((fileUrl: string, index) => (
              <div
                key={index}
                className="relative mb-8 flex items-center justify-between overflow-x-auto bg-white pb-6"
              >
                <div className="flex items-center space-x-2">
                  <FileItemIcon /> &nbsp; <span>{getFileNameFromUrl(fileUrl)}</span>
                  <div className="text-lightpurple-4 min-w-max bg-white px-2">
                    <a
                      href={`${Constants.imageUrl}${fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      download={getFileNameFromUrl(fileUrl)}
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : null}

        {newsletterData?.type === 'STUDENT_PARENTS_SURVEY' && (
          <>
            {newsletterData?.toParent && me?.role === Role.USER && (
              <>
                {(nokName === '' || nokPhone === '') && (
                  <Typography variant="body2" className="text-red-700">
                    * 보호자 정보를 확인해주세요.
                  </Typography>
                )}
                <Label.col>
                  <Label.Text children="보호자 이름" />
                  <TextInput value={nokName} disabled={true} className="border-gray-300" />
                </Label.col>
                <Label.col>
                  <Label.Text children="보호자 연락처" />
                  <PhoneNumberField value={nokPhone || '010'} disabled={true} />
                </Label.col>
              </>
            )}
            <SuperSurveyComponent
              surveyContent={newsletterData?.surveyContent || ''}
              setContent={(c: any) => setContent(c)}
              content={content}
              readOnly={!!newsletterData?.endAt && new Date(newsletterData?.endAt) < new Date()}
            />
            <Button.lg
              children="제출하기"
              disabled={buttonDisabled}
              onClick={handleSubmit}
              className="filled-primary mt-2"
            />
            {errorMessage && <div className="text-red-600">{errorMessage}</div>}
          </>
        )}
      </Section>
      <div className={openSignModal ? '' : 'hidden'}>
        <Blank text="" />
        <BottomFixed className="-bottom-4 z-100 rounded-xl">
          <div className="absolute top-2 right-3" onClick={() => setOpenSignModal(false)}>
            <CloseButton
              onClick={() => {
                setOpenSignModal(false)
                clearSignature()
              }}
            />
          </div>
          <Section>
            <div>
              <div className="text-xl font-bold text-gray-700">서명란</div>
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
              <Button.lg children="서명 제출하기" onClick={handleSubmitWithSign} className="filled-primary w-full" />
            </div>
          </Section>
          {isLoading && <Blank />}
        </BottomFixed>
      </div>

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
    </>
  )
}
