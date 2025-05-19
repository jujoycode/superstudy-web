import { useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'

import { Typography } from '@/legacy/components/common/Typography'
import IBLayout from '@/legacy/components/ib/IBLayout'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { Constants } from '@/legacy/constants'
import { downloadFile } from '@/legacy/util/download-image'
import { getFileNameFromUrl } from '@/legacy/util/file'

interface FAQItem {
  question: string
  answer: string
}

interface FAQData {
  title: string
  content: FAQItem[]
}

interface ImageItem {
  image: string | File
}

interface REFData {
  title: string
  content: string
  images?: Map<number, ImageItem>
  files?: Array<string | File>
}

type PreviewDataType = 'FAQ' | 'REF'

interface PreviewData {
  type: PreviewDataType
  data: FAQData | REFData
}

const urlDecorator = (decoratedHref: string, decoratedText: string, key: number) => (
  <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className="underline">
    {decoratedText}
  </a>
)

export const CoordinatorPreviewPage = () => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)

  useEffect(() => {
    if (window.opener && 'previewData' in window.opener) {
      const openerWindow = window.opener as { previewData?: PreviewData }
      if (openerWindow.previewData) {
        setPreviewData(openerWindow.previewData)
      }
    }
  }, [])

  if (!previewData) {
    return <div>데이터를 불러오는 중...</div>
  }

  const { type, data } = previewData

  return (
    <div className="col-span-6">
      <div className="h-screen w-full bg-gray-50 pt-10 pb-20">
        <IBLayout
          topContent={null}
          hasContour={false}
          bottomContent={
            <>
              <div className="bg-primary-100 text-primary-800 sticky top-0 z-10 mb-4 flex h-10 items-center gap-2 rounded-lg px-4 py-[11px]">
                <SolidSVGIcon.Info size={16} color="orange800" weight="bold" />
                <Typography variant="caption" className="text-primary-800 font-medium">
                  학생/교사에게 보여지는 화면의 예시입니다.
                </Typography>
              </div>
              <div className="flex flex-grow flex-col rounded-xl bg-white p-6">
                {type === 'FAQ' ? (
                  <div className="flex flex-col">
                    <div className="flex flex-col items-start gap-1 border-b border-b-gray-100 pb-6">
                      <Typography variant="title1" className="text-gray-900">
                        {data.title}
                      </Typography>
                      <Typography variant="body3" className="text-gray-500">
                        2024.09.01 · 관리자
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-10 pt-6">
                      {(data as FAQData).content.map((item: FAQItem, index: number) => (
                        <div key={index} className="flex flex-col gap-2">
                          <div className="flex flex-row items-center">
                            <Typography variant="title3" className="text-primary-800">
                              Q{index + 1}.&nbsp;
                            </Typography>
                            <Typography variant="title3">{item.question}</Typography>
                          </div>
                          <div>
                            <Typography variant="body2" className="font-medium">
                              {item.answer}
                            </Typography>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : type === 'REF' ? (
                  // REF 렌더링
                  <div className="flex flex-col">
                    <div className="flex flex-col items-start gap-1 border-b border-b-gray-100 bg-white pb-6">
                      <Typography variant="title1" className="text-gray-900">
                        {data.title}
                      </Typography>
                      <Typography variant="body3" className="text-gray-500">
                        2024.09.01 · 관리자
                      </Typography>
                    </div>
                    <div className="pt-6">
                      <Typography variant="body1">
                        <Linkify componentDecorator={urlDecorator}>{(data as REFData).content}</Linkify>
                      </Typography>
                    </div>
                    {!!(data as REFData).images || !!(data as REFData).files ? (
                      <div className="flex flex-col gap-4 py-10">
                        {/* 이미지 컨테이너 */}
                        {!!(data as REFData).images && (
                          <div className="flex w-full gap-3">
                            {[...(data as REFData).images!].map(([key, value]) => (
                              <div className="relative aspect-square h-30 w-30 rounded-lg" key={key}>
                                <LazyLoadImage
                                  src={
                                    typeof value.image == 'string'
                                      ? `${Constants.imageUrl}${value.image}`
                                      : URL.createObjectURL(value.image)
                                  }
                                  alt=""
                                  loading="lazy"
                                  className="object-fit absolute h-full w-full rounded-lg"
                                />
                              </div>
                            ))}
                            {/* {data.images.map((image: string, i: number) => (
                            <div key={i} className="h-30 w-30">
                              <div className="aspect-square cursor-pointer rounded-lg">
                                <LazyLoadImage
                                  src={`${Constants.imageUrl}${image}`}
                                  alt=""
                                  loading="lazy"
                                  className="object-fit h-full w-full rounded-lg"
                                />
                              </div>
                            </div>
                          ))} */}
                          </div>
                        )}

                        {/* 파일 컨테이너 */}
                        {!!(data as REFData).files && (
                          <div className="flex flex-col gap-3">
                            {(data as REFData).files!.map((fileUrl: string | File, index: number) => (
                              <div
                                key={index}
                                className="flex h-12 w-max items-center gap-2 rounded-lg border border-gray-200 bg-white px-4"
                              >
                                <SVGIcon.Link size={16} weight="bold" color="gray700" />
                                <button
                                  onClick={() =>
                                    downloadFile(
                                      typeof fileUrl == 'string'
                                        ? `${Constants.imageUrl}${fileUrl}`
                                        : URL.createObjectURL(fileUrl),
                                      typeof fileUrl == 'string' ? getFileNameFromUrl(fileUrl) : fileUrl.name,
                                    )
                                  }
                                  className="text-[15px] font-normal text-gray-900"
                                >
                                  {typeof fileUrl == 'string' ? getFileNameFromUrl(fileUrl) : fileUrl.name}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div>유효한 데이터를 찾을 수 없습니다.</div>
                )}
              </div>
            </>
          }
          bottomBgColor="bg-gray-50"
        />
      </div>
    </div>
  )
}
