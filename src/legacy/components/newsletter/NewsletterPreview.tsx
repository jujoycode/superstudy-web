import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'

import { PdfCard } from '@/legacy/components/common/PdfCard'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { isPdfFile } from '@/legacy/util/file'

interface NewsletterPreviewProps {
  title: string
  images: string[]
  klasses: string[]
  endAt: string | null
  setPreview: (b: boolean) => void
}

export function NewsletterPreview({ title, images, klasses, endAt }: NewsletterPreviewProps) {
  const now = DateUtil.formatDate(new Date(), DateFormat['YYYY-MM-DD HH:mm'])
  const [, setActiveIndex] = useState(0)
  const [, setImagesModalOpen] = useState(false)
  const [, setPdfModalOpen] = useState(false)
  const [, setFocusPdfFile] = useState('')

  const Pdfs = images.filter((image) => isPdfFile(image)) || []
  images = images.filter((image) => !isPdfFile(image)) || []

  return (
    <>
      {/* Desktop V */}
      <div className="scroll-box overflow-x-auto overflow-y-auto">
        <div className="hidden md:block">
          <div>
            <div className="flex w-full justify-between space-x-2">
              <div className="w-max rounded-md bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
                가정통신문
              </div>
            </div>
            {endAt && (
              <div className="flex gap-1 text-sm font-normal text-red-400">
                <span className="font-semibold">마감기한</span>
                <Time date={endAt} className="text-inherit" />
                <span>까지</span>
              </div>
            )}
            <div className="mt-3 flex flex-wrap">
              {klasses
                ?.sort((a, b) => +a - +b)
                .map((klass) => (
                  <span
                    key={klass}
                    className="mr-2 mb-2 rounded-full border border-gray-400 px-3 py-2 text-sm font-semibold text-gray-500"
                  >
                    {klass}학년
                  </span>
                ))}
            </div>
            <div className="text-grey-1 flex text-lg font-bold">{title}</div>
            <div className="text-grey-3 flex text-sm">{now}</div>
            <Time date={endAt} />
            <div className="grid w-full grid-flow-row grid-cols-3 gap-2">
              {images?.map((image: string, i: number) => {
                return (
                  <>
                    <div key={image}>
                      <div
                        onClick={() => {
                          setActiveIndex(i)
                          setImagesModalOpen(true)
                        }}
                        className="w-full"
                      >
                        <div className="relative aspect-5/3 rounded bg-gray-50">
                          <LazyLoadImage
                            src={`${Constants.imageUrl}${image}`}
                            alt=""
                            loading="lazy"
                            className="absolute h-full w-full rounded object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )
              })}
            </div>
            <div>
              {Pdfs?.length
                ? Pdfs?.map((pdfFile: string) => {
                    return (
                      <>
                        <div key={pdfFile}>
                          <div className="w-full">
                            <div className="relative aspect-5/3 rounded bg-gray-50">
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
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
