import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { ReactComponent as FileItemIcon } from '@/legacy/assets/svg/file-item-icon.svg'
import { ErrorBlank } from '@/legacy/components'
import AnnouncementDetailCard from '@/legacy/components/announcement/AnnouncementDetailCard'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { PdfCard } from '@/legacy/components/common/PdfCard'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import { useAnnouncementDetail } from '@/legacy/container/announcement-detail'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { languageState } from '@/legacy/store'
import { getFileNameFromUrl, getFileNameFromUrlToAnn } from '@/legacy/util/file'
import { isHTML } from '@/legacy/util/validator'

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { errorMessage, isLoading, announcement } = useAnnouncementDetail(+id)
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')
  const { t } = useLanguage()
  const language = useRecoilValue(languageState)

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

  const handleDownload = (pdfFile: string) => {
    fetch(getUrl(pdfFile)) // PDF 파일에 대한 URL 가져오기
      .then((response) => response.blob()) // 파일 데이터를 Blob 형식으로 변환
      .then((blob) => {
        // Blob 데이터로부터 URL 생성
        const url = window.URL.createObjectURL(new Blob([blob]))
        // 가상 링크 생성
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', getFileNameFromUrl(pdfFile)) // 파일명 설정
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
      })
      .catch((error) => console.error('Error downloading PDF:', error))
  }

  const recipients = [
    { label: t('administrator'), isActive: announcement?.toAdmin, color: 'bg-users-admin' },
    { label: t('teacher'), isActive: announcement?.toTeacher, color: 'bg-users-teacher' },
    { label: t('student'), isActive: announcement?.toStudent, color: 'bg-users-student' },
    { label: t('parent'), isActive: announcement?.toParent, color: 'bg-users-parent' },
  ]

  return (
    <>
      {/* Mobile V */}
      <div className="block bg-white md:hidden">
        {isLoading && <Blank />}
        {errorMessage && <ErrorBlank text={errorMessage} />}
        <TopNavbar left={<BackButton />} title={`${t('superschool_announcement')}`} />
        {announcement && <AnnouncementDetailCard announcement={announcement} />}
      </div>

      {/* Desktop V */}
      <div className="hidden rounded-lg border bg-white p-5 md:block">
        {isLoading && <Blank reversed text={`${t('loading_post')}`} />}
        {errorMessage && <ErrorBlank text={`${t('failed_to_load_post')}`} />}
        <Section>
          <div className="flex w-full justify-center">
            <div className="w-full p-6">
              {announcement && (
                <div className="flex items-center space-x-2 pb-2">
                  {recipients
                    .filter((recipient) => recipient.isActive)
                    .map((recipient, index) => (
                      <span key={index} className={`text-sm text-white ${recipient.color} rounded px-1 py-0.5`}>
                        {recipient.label}
                      </span>
                    ))}
                </div>
              )}
              <h1 className="truncate text-2xl font-bold">{announcement?.title}</h1>
              <div className="my-4 flex items-center gap-2 border-b-2 pb-4">
                <Time date={announcement?.createdAt} format={'yyyy-MM-dd'} className="text-lg" />
                <p>|</p>
                <p className="text-lg">{t(`${announcement?.type.toLowerCase()}`)}</p>
              </div>

              {/* 텍스트 영역 */}
              {announcement?.content && (
                <div className="my-4">
                  <h1 className="mb-4">
                    {language === 'ko' ? (
                      <>
                        안녕하세요. <b className="text-brand-1">슈퍼스쿨</b> 입니다.
                      </>
                    ) : (
                      <>Hello. this is Super School.</>
                    )}
                  </h1>
                  {isHTML(announcement.content) ? (
                    <div className="text-xl" dangerouslySetInnerHTML={{ __html: announcement.content }}></div>
                  ) : (
                    <pre className="text-base break-words whitespace-pre-wrap">
                      <Linkify>{announcement.content}</Linkify>
                    </pre>
                  )}
                </div>
              )}

              {/* 이미지 영역 */}
              {announcement?.images &&
                announcement.images.map((image, index) => (
                  <div className="relative mb-4 rounded bg-gray-50" key={index}>
                    <LazyLoadImage
                      src={`${Constants.imageUrl}${image}`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full rounded object-cover"
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
                <div key={index} className="flex h-8 items-center space-x-2 rounded bg-stone-50 px-3 py-1">
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
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}
