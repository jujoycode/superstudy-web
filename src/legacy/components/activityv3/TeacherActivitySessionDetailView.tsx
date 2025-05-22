import React, { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { Section } from '@/legacy/components/common'
import { PdfCard } from '@/legacy/components/common/PdfCard'
import { Constants } from '@/legacy/constants'
import { ActivitySession, StudentActivitySession } from '@/legacy/generated/model'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

import { SuperSurveyComponent } from '../survey/SuperSurveyComponent'

interface TeacherActivitySessionDetailView {
  activitySession: ActivitySession
  studentActivitySession?: StudentActivitySession
}

export const TeacherActivitySessionDetailView: React.FC<TeacherActivitySessionDetailView> = ({
  activitySession: activity,
  studentActivitySession: studentActivity,
}) => {
  const files = studentActivity?.files || []
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [, setPdfModalOpen] = useState(false)
  const [, setFocusPdfFile] = useState('')

  const images = studentActivity?.images?.filter((image) => !isPdfFile(image)) || []
  const Pdfs = studentActivity?.images?.filter((image) => isPdfFile(image)) || []

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  let surveyContent = {}
  try {
    surveyContent = JSON.parse(studentActivity?.content || '{}')
  } catch (err) {}

  return (
    <>
      <Section className="bg-gray-50">
        {activity.type === 'SURVEY' && (
          <SuperSurveyComponent
            surveyContent={activity?.surveyContent || '[]'}
            setContent={() => {}}
            content={surveyContent}
            readOnly
          />
        )}
        {images?.map((image: string, i: number) => (
          <div key={image}>
            <div
              onClick={() => {
                setActiveIndex(i)
                setImagesModalOpen(true)
              }}
              className="w-full"
            >
              <div className="aspect-5/3 rounded-sm bg-gray-50">
                <LazyLoadImage
                  src={`${Constants.imageUrl}${image}`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full rounded-sm object-cover"
                />
              </div>
            </div>
          </div>
        ))}
        {Pdfs?.map((pdfFile: string) => {
          return (
            <>
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
                    ></PdfCard>
                  </div>
                </div>
              </div>
            </>
          )
        })}
        {files?.map((fileUrl: string, index) => (
          <div key={index} className="relative m-2 flex items-center justify-between overflow-x-hidden bg-white p-2">
            <span>{getFileNameFromUrl(fileUrl)}</span>
            <div className="min-w-max bg-white px-2 text-indigo-500">
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
        {activity.type !== 'SURVEY' && <p className="whitespace-pre-line">{studentActivity?.content}</p>}
      </Section>
    </>
  )
}
