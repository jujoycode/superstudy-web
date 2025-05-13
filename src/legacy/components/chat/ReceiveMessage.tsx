import { useMemo, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { twMerge } from 'tailwind-merge'

import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { ReactComponent as SvgUser } from '@/assets/svg/user.svg'
import { Icon } from '@/legacy/components/common/icons'
import { Constants } from '@/legacy/constants'
import {
  useActivityV3FindTitleByIds,
  useBoardFindTitleByIds,
  useNewsLettersFindTitleByIds,
  useNoticesFindTitleByIds,
} from '@/legacy/generated/endpoint'
import { Chat, ResponseChatAttendeeDto, Role } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { downloadFile } from '@/legacy/util/download-image'
import { getFileNameFromUrl } from '@/legacy/util/file'
import { getRoleTitle } from '@/legacy/util/permission'
import { getNickName } from '@/legacy/util/status'
import { isSameMinute } from '@/legacy/util/time'

interface ReceiveMessageProps {
  PreMessageData?: Chat
  MessageData?: Chat
  PostMessageData?: Chat
  AttendeeInfo?: ResponseChatAttendeeDto
  userRole: 'student' | 'teacher'
}

export function ReceiveMessage({
  PreMessageData,
  MessageData,
  PostMessageData,
  AttendeeInfo,
  userRole,
}: ReceiveMessageProps) {
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const isFirst = PreMessageData?.senderId !== MessageData?.senderId
  const isLast =
    PostMessageData?.senderId !== MessageData?.senderId ||
    !isSameMinute(MessageData?.createdAt || '', PostMessageData?.createdAt || '')

  const urlsInContent = useMemo(
    () =>
      MessageData
        ? [...MessageData.content.matchAll(/https:\/\/web\.superschool\.link\/teacher\/([^\/]+)\/(\d+)/g)]
        : [],
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

  const isMobile = () => {
    return (
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    )
  }

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

  return (
    <>
      <div className={`message ${isFirst ? 'mt-2' : 'mt-2'} flex px-3`}>
        <div className="w-12">
          {isFirst ? (
            <img
              className="mx-auto mr-1 h-12 w-12 rounded-xl"
              src={`${Constants.imageUrl}${AttendeeInfo?.customProfile || AttendeeInfo?.profile}`}
              alt=""
              onError={({ currentTarget }) => {
                currentTarget.onerror = null // prevents looping
                currentTarget.src = SvgUser
                currentTarget.className = 'rounded-full mr-1 w-12 h-12 mx-auto'
              }}
            />
          ) : (
            <div className="mx-auto mr-1 h-1 w-12 items-start" />
          )}
        </div>
        <div className="flex-1 px-2">
          {isFirst &&
            (AttendeeInfo ? (
              AttendeeInfo?.role === Role.USER ? (
                <h4 className="text-brand-1 text-sm">
                  {AttendeeInfo?.name}
                  {getNickName(AttendeeInfo?.nickName)} {AttendeeInfo?.studentNumber}
                </h4>
              ) : AttendeeInfo?.role === Role.PARENT ? (
                <h4 className="text-brandblue-1 text-sm">
                  {AttendeeInfo?.name}{' '}
                  {AttendeeInfo?.children &&
                    '[' +
                      AttendeeInfo?.children[0]?.name +
                      getNickName(AttendeeInfo?.children[0]?.nickName) +
                      ' ' +
                      AttendeeInfo?.children[0]?.studentNumber +
                      ' 보호자]'}
                </h4>
              ) : (
                <h4 className="text-sm text-gray-900">
                  {AttendeeInfo?.name}
                  {getNickName(AttendeeInfo?.nickName)} {AttendeeInfo?.klass}{' '}
                  {getRoleTitle(AttendeeInfo?.role || Role.TEACHER, AttendeeInfo?.headNumber)}
                  {AttendeeInfo?.position} {AttendeeInfo?.department}
                </h4>
              )
            ) : (
              <h4 className="text-sm text-red-500">퇴장한 사용자입니다.</h4>
            ))}
          <div className="flex flex-row items-end">
            <div className="flex flex-col items-start gap-1">
              {content && (
                <div className="mr-2 rounded-md bg-white p-1 px-6 text-gray-700">
                  <p className="feedback_space text-sm break-all whitespace-pre-wrap">
                    <Linkify>{MessageData?.content}</Linkify>
                  </p>
                </div>
              )}
              {!!imagesLen && (
                <div
                  className={twMerge(
                    'grid w-full grid-flow-row gap-2',
                    imagesLen === 1
                      ? 'max-w-[160px] grid-cols-1 lg:max-w-[200px]'
                      : imagesLen === 2 || imagesLen === 4
                        ? 'grid-cols-2'
                        : imagesLen === 3 || imagesLen === 5
                          ? 'grid-cols-3'
                          : 'grid-cols-4 lg:grid-cols-6',
                  )}
                >
                  {images?.map((image: string, i: number) => (
                    <div
                      key={image}
                      className="relative w-full cursor-pointer"
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
                <div className="flex flex-col gap-1">
                  {MessageData.files.map((fileUrl: string) => (
                    <div key={fileUrl} className="flex h-8 w-max items-center space-x-2 rounded bg-stone-50 px-3 py-1">
                      <FileItemIcon />
                      <a
                        className="ml-2 line-clamp-2 max-w-[140px] text-xs break-words text-neutral-500"
                        href={`${Constants.imageUrl}${fileUrl}`}
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
                <div className="mt-1 flex flex-col items-start space-y-1 pr-2">
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
                <div className="mt-1 flex flex-col items-start space-y-1 pr-2">
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
                <div className="mt-1 flex flex-col items-start space-y-1 pr-2">
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
                <div className="mt-1 flex flex-col items-start space-y-1 pr-2">
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
            <div className="w-20 pl-2">
              {isLast && (
                <small className="text-gray-500">
                  {MessageData?.createdAt && DateUtil.formatDate(MessageData?.createdAt, DateFormat['HH:mm'])}
                </small>
              )}
            </div>
          </div>
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
          onChange={(_, index) => setActiveIndex(index)}
          onClose={() => setImagesModalOpen(false)}
          activeIndex={activeIndex}
        />
      </div>
    </>
  )
}
