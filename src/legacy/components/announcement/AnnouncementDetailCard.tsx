import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'

import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { PdfCard } from '@/legacy/components/common/PdfCard'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import { AnnouncementType, ResponseAnnouncementDto } from '@/legacy/generated/model'
import { getFileNameFromUrlToAnn } from '@/legacy/util/file'
import { isHTML } from '@/legacy/util/validator'

interface AnnouncementProps {
  announcement: ResponseAnnouncementDto
}

export default function AnnouncementDetailCard({ announcement }: AnnouncementProps) {
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')

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

  const getTypeName = (type: AnnouncementType) => {
    if (type === 'SERVICE') {
      return '서비스'
    } else if (type === 'UPDATE') {
      return '업데이트'
    } else {
      return '작업'
    }
  }

  const recipients = [
    { label: '관리자', isActive: announcement?.toAdmin, color: 'bg-blue-600' },
    { label: '선생님', isActive: announcement?.toTeacher, color: 'bg-emerald-600' },
    { label: '학생', isActive: announcement?.toStudent, color: 'bg-amber-400' },
    { label: '보호자', isActive: announcement?.toParent, color: 'bg-amber-400' },
  ]

  return (
    <div className="my-2 p-3">
      {announcement && (
        <div className="flex items-center space-x-2 pb-2">
          {recipients
            .filter((recipient) => recipient.isActive)
            .map((recipient, index) => (
              <span key={index} className={`text-sm text-white ${recipient.color} rounded-sm px-1 py-0.5`}>
                {recipient.label}
              </span>
            ))}
        </div>
      )}
      <h1 className="truncate text-2xl font-bold">{announcement.title}</h1>
      <div className="my-4 flex items-center gap-2 border-b-2 pb-6">
        <Time date={announcement.createdAt} format={'yyyy-MM-dd'} className="text-lg" />
        <p>|</p>
        <p className="text-lg">{getTypeName(announcement.type)}</p>
      </div>

      {/* 텍스트 영역 */}
      {announcement?.content && (
        <div className="my-4">
          <h1 className="mb-4">
            안녕하세요. <b className="text-primary-800">슈퍼스쿨</b>입니다.
          </h1>
          {isHTML(announcement.content) ? (
            <div className="text-xl" dangerouslySetInnerHTML={{ __html: announcement.content }}></div>
          ) : (
            <pre className="text-base break-words whitespace-pre-line">
              <Linkify>{announcement.content}</Linkify>
            </pre>
          )}
        </div>
      )}

      {/* 이미지 영역 */}
      {announcement?.images &&
        announcement.images.map((image) => (
          <div className="mb-4 rounded-sm bg-gray-50" key={image}>
            <LazyLoadImage
              src={`${Constants.imageUrl}${image}`}
              alt=""
              loading="lazy"
              className="h-full w-full rounded-sm object-cover"
            />
          </div>
        ))}

      {/* PDF 영역 */}
      {announcement?.files?.map((pdfFile: string) => {
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

      {announcement?.files?.map((pdfFile: string, index) => (
        <div key={index} className="flex h-8 items-center space-x-2 rounded-sm bg-stone-50 px-3 py-1">
          <FileItemIcon />
          <a
            className="ml-2 text-xs text-neutral-500"
            href={`${Constants.imageUrl}${pdfFile}`}
            target="_blank"
            rel="noreferrer"
            download={getFileNameFromUrlToAnn(pdfFile)}
          >
            {getFileNameFromUrlToAnn(pdfFile)}
          </a>
        </div>
      ))}
      <div>
        <PdfViewer isOpen={hasPdfModalOpen} fileUrl={focusPdfFile} onClose={() => setPdfModalOpen(false)} />
      </div>

      <br />
      <br />
    </div>
  )
}
