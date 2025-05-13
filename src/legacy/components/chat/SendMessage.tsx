import { useMemo, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { twMerge } from 'tailwind-merge'

import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { Icon } from '@/legacy/components/common/icons'
import { Constants } from '@/legacy/constants'
import {
  useActivityV3FindTitleByIds,
  useBoardFindTitleByIds,
  useNewsLettersFindTitleByIds,
  useNoticesFindTitleByIds,
} from '@/legacy/generated/endpoint'
import { Chat } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { downloadFile } from '@/legacy/util/download-image'
import { getFileNameFromUrl } from '@/legacy/util/file'
import { isSameMinute } from '@/legacy/util/time'

interface SendMessageProps {
  PreMessageData?: Chat
  MessageData: Chat
  PostMessageData: Chat
  userRole: 'student' | 'teacher'
  openDeleteModal: () => void
  isDeleteMode?: boolean
}

export function SendMessage({
  PreMessageData,
  MessageData,
  PostMessageData,
  userRole,
  openDeleteModal,
  isDeleteMode = false,
}: SendMessageProps) {
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const isFirst = PreMessageData?.senderId !== MessageData?.senderId
  const isLast =
    PostMessageData?.senderId !== MessageData?.senderId ||
    !isSameMinute(MessageData?.createdAt || '', PostMessageData?.createdAt || '')

  const urlsInContent = useMemo(
    () => [...MessageData.content.matchAll(/https:\/\/web\.dev\.superschool\.link\/teacher\/([^\/]+)\/(\d+)/g)],
    [MessageData],
  )

  const activityIds = urlsInContent.filter((el) => el[1] === 'activityv3').map((el) => Number(el[2])) || []
  const noticeIds = urlsInContent.filter((el) => el[1] === 'notice').map((el) => Number(el[2])) || []
  const boardIds = urlsInContent.filter((el) => el[1] === 'board').map((el) => Number(el[2])) || []
  const newsletterIds = urlsInContent.filter((el) => el[1] === 'newsletter').map((el) => Number(el[2])) || []

  const { data: activities } = useActivityV3FindTitleByIds(
    { activityIds },
    { query: { enabled: !!activityIds.length } },
  )

  const { data: notices } = useNoticesFindTitleByIds({ noticeIds }, { query: { enabled: !!noticeIds.length } })

  const { data: boards } = useBoardFindTitleByIds({ boardIds }, { query: { enabled: !!boardIds.length } })

  const { data: newsletters } = useNewsLettersFindTitleByIds(
    { newsletterIds },
    { query: { enabled: !!newsletterIds.length } },
  )

  const content = MessageData?.content
  const images = MessageData?.images
  const imagesLen = images?.length || 0

  const viewerImages: ImageDecorator[] = []
  if (images?.length) {
    for (const image of images) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  const isMobile = () => {
    return (
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    )
  }

  return (
    <>
      <div className={twMerge('message w-full pr-3', isFirst ? 'mt-2' : 'mt-1', isLast ? 'pl-3' : 'pl-20')}>
        <div className="flex w-full flex-row-reverse items-end space-x-0 px-2">
          <div className="overflow-hidden">
            {content && (
              <div className="bg-brand-1 rounded-md p-1 px-6 text-white">
                <p className="feedback_space text-left text-sm break-all whitespace-pre-wrap">
                  <Linkify>{content}</Linkify>
                </p>
              </div>
            )}
            {!!imagesLen && (
              <div className="ml-auto w-full pt-1 text-right">
                {images.map((image: string, i: number) => (
                  <div
                    key={image}
                    className={twMerge(
                      'relative m-1 inline-block cursor-pointer',
                      imagesLen === 1
                        ? 'w-full max-w-[160px] lg:max-w-[200px]'
                        : imagesLen === 2 || imagesLen === 4
                          ? 'w-1/2-2'
                          : imagesLen === 3 || imagesLen === 5
                            ? 'w-1/3-2'
                            : 'w-1/4-2 lg:w-1/6-2',
                    )}
                    onClick={() => {
                      setActiveIndex(i)
                      setImagesModalOpen(true)
                    }}
                  >
                    <div className="aspect-square rounded border border-neutral-200">
                      <LazyLoadImage
                        src={`${Constants.imageUrl}${image}`}
                        alt=""
                        loading="lazy"
                        className="object-fit h-full w-full rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!!MessageData?.files?.length && (
              <div className="flex flex-col items-end gap-1 pt-1">
                {MessageData.files.map((fileUrl: string, index) => (
                  <div
                    key={fileUrl}
                    className="flex h-8 w-full items-center space-x-2 overflow-hidden rounded bg-stone-50 px-3 py-1"
                  >
                    <FileItemIcon className="min-w-[14px]" />
                    <a
                      className="ml-2 line-clamp-2 max-w-[160px] text-xs break-words text-neutral-500"
                      href={`${Constants.imageUrl}${fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      download={getFileNameFromUrl(fileUrl)}
                      title={getFileNameFromUrl(fileUrl)}
                    >
                      {getFileNameFromUrl(fileUrl)}
                    </a>
                  </div>
                ))}
              </div>
            )}
            {!!activities?.length && (
              <div className="mt-1 flex flex-col items-end space-y-1 pr-2">
                {activities.map((el) => (
                  <a
                    key={el.id}
                    href={`https://web.dev.superschool.link/${userRole}/activityv3/` + el.id}
                    className="block w-min max-w-2/3 cursor-pointer overflow-hidden rounded-md bg-white px-4 py-2 whitespace-pre"
                  >
                    <p className="truncate text-lg text-gray-700">{el.title}</p>
                    <p className="text-sm text-gray-500">
                      {DateUtil.formatDate(el.createdAt, DateFormat['YYYY년 MM월 DD일'])}
                    </p>
                  </a>
                ))}
              </div>
            )}
            {!!boards?.length && (
              <div className="mt-1 flex flex-col items-end space-y-1 pr-2">
                {boards.map((el) => (
                  <a
                    key={el.id}
                    href={`https://web.dev.superschool.link/${userRole}/board/` + el.id}
                    className="block w-min max-w-2/3 cursor-pointer overflow-hidden rounded-md bg-white px-4 py-2 whitespace-pre"
                  >
                    <p className="truncate text-lg text-gray-700">{el.title}</p>
                    <p className="text-sm text-gray-500">
                      {DateUtil.formatDate(el.createdAt, DateFormat['YYYY년 MM월 DD일'])}
                    </p>
                  </a>
                ))}
              </div>
            )}
            {!!newsletters?.length && (
              <div className="mt-1 flex flex-col items-end space-y-1 pr-2">
                {newsletters.map((el) => (
                  <a
                    key={el.id}
                    href={`https://web.dev.superschool.link/${userRole}/newsletter/` + el.id}
                    className="block w-min max-w-2/3 cursor-pointer overflow-hidden rounded-md bg-white px-4 py-2 whitespace-pre"
                  >
                    <p className="truncate text-lg text-gray-700">{el.title}</p>
                    <p className="text-sm text-gray-500">
                      {DateUtil.formatDate(el.createdAt, DateFormat['YYYY년 MM월 DD일'])}
                    </p>
                  </a>
                ))}
              </div>
            )}
            {!!notices?.length && (
              <div className="mt-1 flex flex-col items-end space-y-1 pr-2">
                {notices.map((el) => (
                  <a
                    key={el.id}
                    href={`https://web.dev.superschool.link/${userRole}/notice/` + el.id}
                    className="block w-min max-w-2/3 cursor-pointer overflow-hidden rounded-md bg-white px-4 py-2 whitespace-pre"
                  >
                    <p className="truncate text-lg text-gray-700">{el.title}</p>
                    <p className="text-sm text-gray-500">
                      {DateUtil.formatDate(el.createdAt, DateFormat['YYYY년 MM월 DD일'])}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>
          {isLast && (
            <div className="pr-2 pl-7">
              <small className="text-gray-500">
                {MessageData?.createdAt && DateUtil.formatDate(MessageData?.createdAt, DateFormat['HH:mm'])}
              </small>
            </div>
          )}
          {isDeleteMode && (
            <Icon.Close
              className="h-6 min-h-[24px] w-6 min-w-[24px] cursor-pointer"
              onClick={openDeleteModal}
              stroke="#ef4444"
            />
          )}
        </div>
      </div>
      <div className="absolute">
        {hasImagesModalOpen &&
          (isMobile() ? (
            <a
              className="bg-littleblack fixed top-0 left-0 z-[1100] h-10 w-10 cursor-pointer rounded-br-full"
              href={viewerImages[activeIndex].src}
              target="_blank"
              rel="noreferrer"
              download={viewerImages[activeIndex].src}
            >
              <Icon.Download className="mt-1 ml-1" stroke="#FFF" />
            </a>
          ) : (
            <div
              className="bg-littleblack fixed top-0 left-0 z-[1100] h-10 w-10 cursor-pointer rounded-br-full"
              onClick={() => downloadFile(viewerImages[activeIndex].src)}
            >
              <Icon.Download className="mt-1 ml-1" stroke="#FFF" />
            </div>
          ))}
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
    </>
  )
}
