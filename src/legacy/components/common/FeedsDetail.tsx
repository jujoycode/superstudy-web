import parse from 'html-react-parser'
import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { useRecoilValue } from 'recoil'

import FileItemIcon from '@/assets/svg/file-item-icon.svg'
import { Constants } from '@/legacy/constants'
import { Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'
import { childState, meState } from '@/stores'

import { PdfCard } from './PdfCard'
import { PdfViewer } from './PdfViewer'
import { SuperSurveyComponent } from '../survey/SuperSurveyComponent'

interface FeedsDetailProps {
  category1?: string
  category1Color?: string
  category2?: string
  category2Color?: string
  sendTo?: string
  sendToColor?: string
  useSubmit?: boolean
  submitDate?: string
  submitYN?: boolean
  submitText?: string
  title?: string
  newYN?: boolean
  contentText?: string
  contentFiles?: string[]
  contentImages?: string[]
  contentSurvey?: string
  setSurveyResult?: (surveyResult: any) => void
  surveyResult?: any
  writer?: string | null
  createAt?: string
  isPreview?: boolean
}

export function FeedsDetail({
  category1,
  category1Color,
  category2,
  category2Color,
  sendTo,
  sendToColor,
  useSubmit,
  submitDate,
  submitYN,
  submitText,
  title,
  contentText,
  contentFiles,
  contentImages,
  contentSurvey,
  setSurveyResult,
  surveyResult,
  writer,
  createAt,
  isPreview = false,
}: FeedsDetailProps) {
  const meRecoil = useRecoilValue(meState)
  const myChild = useRecoilValue(childState)
  const { t } = useLanguage()

  const schoolName = meRecoil?.role === Role.PARENT ? myChild?.school.name : meRecoil?.school.name
  const schoolMark = meRecoil?.role === Role.PARENT ? myChild?.school.mark : meRecoil?.school.mark

  const Pdfs = contentImages?.filter((image) => isPdfFile(image)) || []
  const images = contentImages?.filter((image) => !isPdfFile(image)) || []

  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const contentJson = contentText?.startsWith(`{"content"`) ? JSON.parse(contentText || '[]') : undefined

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
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

  const removeStyleAttribute = (htmlString: string) => {
    // 스타일 속성을 정규 표현식을 사용하여 제거
    const cleanedHTML = htmlString.replace(/style="[^"]*"/g, '')
    return cleanedHTML
  }

  return (
    <div className="my-2 w-full p-3">
      <div className="flex flex-col space-y-2 text-left">
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <div
              className={` ${
                category1Color ? 'bg-' + category1Color : 'bg-brand-5'
              } text-text_black rounded-md px-2 py-1 text-sm font-bold`}
            >
              {t(`${category1}`)}
            </div>
            {category2 && (
              <div
                className={` ${
                  category2Color ? 'bg-' + category2Color : 'bg-brand-5'
                } text-text_black rounded-md px-2 py-1 text-sm font-bold`}
              >
                {t(`${category2}`)}
              </div>
            )}
            {sendTo && (
              <div
                className={` ${
                  sendToColor ? 'bg-' + sendToColor : 'bg-brand-5'
                } text-text_black rounded-md px-2 py-1 text-sm font-bold`}
              >
                {t(`${sendTo}`)}
              </div>
            )}
          </div>

          {useSubmit && (
            <div>
              <div className="flex space-x-2">
                {submitText == undefined && submitYN != undefined && !submitYN && (
                  <>
                    {submitDate != undefined && submitDate != '' && (
                      <div className="rounded-md py-1 text-sm font-bold text-red-500">~{submitDate}</div>
                    )}
                    {submitDate && new Date(submitDate) < new Date() ? (
                      <div className="bg-grey-7 rounded-md px-2 py-1 text-sm">{t('expired')}</div>
                    ) : (
                      <div className="filled-red rounded-md px-2 py-1 text-sm">{t('submission_required')}</div>
                    )}
                  </>
                )}
                {submitText && <div className="bg-grey-7 rounded-md px-2 py-1 text-sm">{submitText}</div>}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center">
          <span className="text-18 font-bold">{title}</span>
        </div>

        {contentJson && (
          <div className="mt-5 p-3">
            {/* <div dangerouslySetInnerHTML={{ __html: removeStyleAttribute(contentJson.content) }}></div> */}
            <div>{parse(removeStyleAttribute(contentJson.content))}</div>
            <div className="mt-5 text-xs text-red-500">
              * {myChild?.school.name} {t('post_on_website')} {t('click_link_for_details')}
            </div>
            <div className="feedback_space filled-gray-light text-15 rounded-lg px-3 py-2 break-all whitespace-pre-line">
              <Linkify
                componentDecorator={(decoratedHref: string, decoratedText: string, key: number) => (
                  <a href={decoratedHref} key={key} target="_blank">
                    {decoratedText}
                  </a>
                )}
              >
                {t('attachments_and_view_more')} : {contentJson.content_url}
              </Linkify>
            </div>
          </div>
        )}

        {!contentJson && (
          <div className="feedback_space text-15 break-all whitespace-pre-line">
            <Linkify>{contentText}</Linkify>
          </div>
        )}

        {images?.length > 0 && (
          <div className="w-full space-y-2">
            {images.map((image, index) => (
              <div
                key={`image-${index}`}
                className="overflow-hidden rounded-lg"
                onClick={(event) => {
                  if (isPreview) {
                    event.preventDefault()
                    return
                  }
                  setActiveIndex(index)
                  setImagesModalOpen(true)
                }}
              >
                <div className="relative rounded bg-gray-50">
                  <LazyLoadImage
                    src={getUrl(image)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full rounded object-cover"
                  />
                </div>
              </div>

              // <div key={`image-${index}`} className="overflow-hidden rounded-lg">
              //   <img
              //     src={`${Constants.imageUrl}${image}`}
              //     className="rounded-lg"
              //     onError={({ currentTarget }) => {
              //       currentTarget.src = SvgImage;
              //     }}
              //   />
              // </div>
            ))}
          </div>
        )}

        {Pdfs?.map((pdfFile: string) => {
          return (
            <>
              <div key={pdfFile}>
                <div className="mb-10 w-full">
                  <div className="relative">
                    <PdfCard
                      fileUrl={getUrl(pdfFile)}
                      visibleButton
                      onClick={() => {
                        setFocusPdfFile(getUrl(pdfFile))
                        setPdfModalOpen(true)
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )
        })}

        {contentFiles?.map((fileUrl: string, index) => (
          <div key={index} className="filled-gray-light rounded-lg px-3 py-2">
            <div className="text-13 flex items-center space-x-2">
              <FileItemIcon />
              <div className="text-lightpurple-4 w-full px-2 whitespace-pre-wrap">
                <a
                  href={`${Constants.imageUrl}${fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  download={getFileNameFromUrl(fileUrl)}
                >
                  {getFileNameFromUrl(fileUrl)}
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* react-native 에서 동작하지 않기때문에 보류 */}
        {/* {[...images, ...Pdfs].map((fileUrl: string, index) => (
          <div key={index} className="filled-gray-light rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2 text-13">
              <FileItemIcon />
              <div
                className="w-full  whitespace-pre-wrap px-2 text-lightpurple-4"
                onClick={() => handleDownload(Constants.imageUrl + fileUrl)}
              >
                {getFileNameFromUrl(fileUrl)}
              </div>
            </div>
          </div>
        ))} */}

        {contentSurvey && contentSurvey.length > 2 && (
          <>
            <SuperSurveyComponent
              surveyContent={contentSurvey}
              setContent={(c: any) => setSurveyResult && setSurveyResult(c)}
              content={surveyResult}
              readOnly={(!!submitDate && new Date(submitDate) < new Date()) || isPreview}
            />
            {/* <div className="test-xs ml-4 text-red-400">* 모든 설문 항목은 필수 입력해야 합니다.</div> */}
            <br />
          </>
        )}

        <div className="text-13 mt-1 flex items-center space-x-1 text-gray-500">
          <img className="w-6 rounded-md" src={`${Constants.imageUrl}${schoolMark}`} />
          <div>{schoolName}</div>
          <div>{writer}</div>
          <div> | </div>
          <div>{createAt}</div>
        </div>
      </div>

      <div className="absolute">
        <Viewer
          visible={hasImagesModalOpen}
          rotatable
          noImgDetails
          scalable={false}
          images={viewerImages}
          onChange={(activeImage, index) => setActiveIndex(index)}
          onClose={() => setImagesModalOpen(false)}
          activeIndex={activeIndex}
        />
      </div>
      <div className="">
        <PdfViewer isOpen={hasPdfModalOpen} fileUrl={focusPdfFile} onClose={() => setPdfModalOpen(false)} />
      </div>
    </div>
  )
}
