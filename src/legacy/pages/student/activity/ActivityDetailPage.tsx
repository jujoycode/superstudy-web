import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useParams } from 'react-router-dom'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { useRecoilValue } from 'recoil'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { PdfCard } from '@/legacy/components/common/PdfCard'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import { useActivityFindOne, useStudentActivityFindOneByActivityId } from '@/legacy/generated/endpoint'
import { meState } from '@/legacy/store'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'
import { ActivityDetailReadPage } from './ActivityDetailReadPage'
import { ActivityDetailSubmitPage } from './ActivityDetailSubmitPage'

export function ActivityDetailPage() {
  const me = useRecoilValue(meState)
  let { id } = useParams<{ id: string }>()

  const { error, data: activity } = useActivityFindOne(+id, {
    query: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
    },
  })

  const { data: studentActivity } = useStudentActivityFindOneByActivityId(+id)

  const [readState, setReadState] = useState(true)
  const [isLoading, setLoading] = useState(false)

  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')

  const isActivityEnded = activity?.endDate ? new Date(activity.endDate) < new Date() : false

  const files = activity?.files || []

  const images = activity?.images?.filter((image) => !isPdfFile(image)) || []
  const Pdfs = activity?.images?.filter((image) => isPdfFile(image)) || []

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  if (error) return <ErrorBlank />

  if (activity?.type === 'NOTICE') {
    return (
      <div>
        {isLoading && <Blank />}
        {!activity && <Blank />}
        <TopNavbar
          left={
            <div className="h-20">
              <BackButton className="h-15" />
            </div>
          }
          title="활동기록부"
        />

        <Section className="space-y-2 bg-white">
          <div className="bg-brand-5 text-brand-1 w-max rounded-3xl px-3 py-1 text-sm font-bold">
            {activity?.subject || ''}
          </div>
          <div className="py-2">
            <div className="text-grey-1 text-xl font-bold">{activity?.title}</div>
            <Time date={activity.createdAt} />
          </div>
          {images?.map((image: string, i: number) => (
            <div
              key={i}
              onClick={() => {
                setActiveIndex(i)
                setImagesModalOpen(true)
              }}
              className="w-full"
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
          {Pdfs?.map((pdfFile: string, i: number) => {
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
          })}
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
          <div className="absolute">
            <PdfViewer isOpen={hasPdfModalOpen} fileUrl={focusPdfFile} onClose={() => setPdfModalOpen(false)} />
          </div>
          {files?.map((fileUrl: string, index) => (
            <div key={index} className="relative m-2 flex items-center justify-between overflow-x-hidden bg-white p-2">
              <span>{getFileNameFromUrl(fileUrl)}</span>
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
          ))}
          <div className="feedback_space break-all whitespace-pre-line">
            <Linkify>{activity?.content}</Linkify>
          </div>
          <div className="h-0.5 bg-gray-100"></div>
        </Section>
      </div>
    )
  }

  return (
    <div>
      {isLoading && <Blank />}
      {!activity && <Blank />}
      <TopNavbar
        title="활동"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
        right={
          readState ? (
            activity?.endDate && new Date(activity?.endDate).getTime() - new Date().getTime() < 0 ? (
              <span className="text-red-600">마감</span>
            ) : (
              <span onClick={() => setReadState(false)} className="text-brand-1 cursor-pointer">
                수정
              </span>
            )
          ) : (
            <></>
          )
        }
      />

      <Section className="space-y-2 bg-white">
        <div className="bg-brand-5 text-brand-1 w-max rounded-3xl px-3 py-1 text-sm font-bold">
          {activity?.subject || ''}
        </div>
        <div className="py-2">
          <div className="text-grey-1 text-xl font-bold">{activity?.title}</div>
          <Time date={activity?.createdAt} />
        </div>
        {activity?.type !== 'SURVEY' && (
          <div>
            <Section className="px-0">
              {images?.map((image: string, i: number) => (
                <div
                  key={i}
                  onClick={() => {
                    setActiveIndex(i)
                    setImagesModalOpen(true)
                  }}
                  className="w-full"
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
              {Pdfs?.map((pdfFile: string, i: number) => {
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
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )
              })}
              {files?.map((fileUrl: string, index) => (
                <div
                  key={index}
                  className="relative m-2 flex items-center justify-between overflow-x-hidden bg-white p-2"
                >
                  <span>{getFileNameFromUrl(fileUrl)}</span>
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
              ))}
              <div className="feedback_space break-all whitespace-pre-line">
                <Linkify>{activity?.content}</Linkify>
              </div>
            </Section>
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
            <div className="absolute">
              <PdfViewer isOpen={hasPdfModalOpen} fileUrl={focusPdfFile} onClose={() => setPdfModalOpen(false)} />
            </div>
          </div>
        )}

        <div className="h-0.5 bg-gray-100"></div>

        {activity?.endDate && (
          <div className="flex gap-1 text-sm font-normal text-red-500">
            <span className="font-semibold">마감 기한</span>
            <Time date={activity?.createdAt} className="text-inherit" />
            <span>까지</span>
          </div>
        )}
      </Section>

      {isActivityEnded ? (
        <ActivityDetailReadPage
          studentActivity={studentActivity}
          activity={activity}
          type={activity?.type}
          setSubmitState={() => setReadState(false)}
          setLoading={(state: boolean) => setLoading(state)}
          userId={me?.id}
        />
      ) : (
        <ActivityDetailSubmitPage
          studentActivity={studentActivity}
          activity={activity}
          setReadState={() => setReadState(true)}
          setLoading={(state: boolean) => setLoading(state)}
        />
      )}
    </div>
  )
}
