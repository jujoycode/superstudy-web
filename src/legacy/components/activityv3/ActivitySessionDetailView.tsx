import React, { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import { ActivitySession, StudentActivitySession } from '@/legacy/generated/model'
import { DocumentObject } from '@/legacy/types/document-object'
import type { ImageObject } from '@/legacy/types/image-object'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

import { DocumentObjectComponent } from '../DocumentObjectComponent'
import { ImageObjectComponent } from '../ImageObjectComponent'

interface ActivitySessionDetailViewProps {
  activitySession: ActivitySession
  studentActivitySession?: StudentActivitySession
  dummyImages?: Map<number, ImageObject>
  dummyFiles?: Map<number, DocumentObject>
}

export const ActivitySessionDetailView: React.FC<ActivitySessionDetailViewProps> = ({
  activitySession: activity,
  dummyImages,
  dummyFiles,
}) => {
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const viewerImages: ImageDecorator[] = []
  if (activity?.images) {
    for (const image of activity.images) {
      if (isPdfFile(image) == false) {
        viewerImages.push({
          src: `${Constants.imageUrl}${image}`,
        })
      }
    }
  }

  return (
    <>
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
      <div>
        <div className="flex flex-col space-y-2 bg-gray-50 p-4">
          <div>
            <div className="text-lg font-semibold break-words">{activity?.title}</div>
            {activity?.endDate && (
              <div className="flex gap-1 text-sm font-normal text-red-400">
                <span className="font-semibold">마감기한</span>
                <Time date={activity.endDate} format="yyyy.MM.dd" className="text-inherit" />
                <span>까지</span>
              </div>
            )}
          </div>

          {(activity?.images?.length > 0 || activity?.files?.length > 0 || dummyFiles || dummyImages) && (
            <div className="text-16 font-semibold">첨부파일</div>
          )}
          {dummyImages &&
            [...dummyImages].map(([key, value]) => <ImageObjectComponent key={key} id={key} imageObjet={value} />)}
          {activity?.images?.map((image: string, i: number) => (
            <div
              key={i}
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
          ))}

          <div>
            {dummyFiles &&
              [...dummyFiles].map(([key, value]) => (
                <DocumentObjectComponent key={key} id={key} documentObjet={value} />
              ))}
            {activity?.files?.map((fileUrl: string, index) => (
              <div key={index} className="flex h-8 items-center space-x-2 rounded-sm bg-stone-50 px-3 py-1">
                <FileItemIcon />
                <a
                  className="ml-2 max-w-xs truncate text-xs text-neutral-500"
                  href={`${Constants.imageUrl}${fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  download={getFileNameFromUrl(fileUrl)}
                >
                  {getFileNameFromUrl(fileUrl)}
                </a>
              </div>
            ))}
          </div>
          {activity.content && (
            <div className="mb-2">
              <div className="text-16 font-semibold">활동 설명</div>
              <div className="text-15 w-full break-words whitespace-pre-line">
                <Linkify>{activity.content}</Linkify>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
