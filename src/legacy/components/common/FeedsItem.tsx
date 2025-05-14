import clsx from 'clsx'
import parse from 'html-react-parser'
import { RefObject, useEffect, useRef, useState } from 'react'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { ReactComponent as SvgImage } from '@/assets/svg/upload-image.svg'
import { useHistory } from '@/hooks/useHistory'
import { ListItem } from '@/legacy/components/common'
import { Constants } from '@/legacy/constants'
import { Role } from '@/legacy/generated/model'
import useIntersectionObserver from '@/legacy/hooks/useIntersectionObserver'
import { isPdfFile } from '@/legacy/util/file'
import { Icon } from './icons'
import { PdfCard } from './PdfCard'
import { useUserStore } from '@/stores2/user'

interface FeedsItemProps {
  to: string
  pageType: string
  id: number
  category1?: string
  category1Color?: string
  category2?: string
  category2Color?: string
  useSubmit?: boolean
  submitDate?: string
  submitYN?: boolean
  submitText?: string
  title?: string
  newYN?: boolean
  contentText?: string
  contentFiles?: string[]
  contentImages?: string[]
  writer?: string
  createAt?: string
}

export function FeedsItem({
  to,
  pageType,
  id,
  category1,
  category1Color,
  category2,
  category2Color,
  useSubmit,
  submitDate,
  submitYN,
  submitText,
  title,
  newYN,
  contentText,
  contentFiles,
  contentImages,
  writer,
  createAt,
}: FeedsItemProps) {
  const { push } = useHistory()

  const { me: meRecoil, child: myChild } = useUserStore()

  const itemRef = useRef<HTMLDivElement>(null)

  const [isVisibled, setIsVisibled] = useState(false)

  const isVisible = useIntersectionObserver(itemRef as RefObject<HTMLElement>, { threshold: 0.1 })

  useEffect(() => {
    if (isVisible) {
      setIsVisibled(true)
    }
  }, [isVisible])

  const schoolName = meRecoil?.role === Role.PARENT ? myChild?.school.name : meRecoil?.school.name
  const schoolMark = meRecoil?.role === Role.PARENT ? myChild?.school.mark : meRecoil?.school.mark

  const Pdfs = contentImages?.filter((image) => isPdfFile(image)) || []
  const images = contentImages?.filter((image) => !isPdfFile(image)) || []

  const contentJson = contentText?.startsWith(`{"content"`) ? JSON.parse(contentText || '[]') : undefined

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  const removeStyleAttribute = (htmlString: string) => {
    // 스타일 속성을 정규 표현식을 사용하여 제거
    const cleanedHTML = htmlString.replace(/style="[^"]*"/g, '')
    return cleanedHTML
  }

  return (
    <ListItem onClick={() => push(`/${to}/${pageType}/${id}`)}>
      {/* mobile */}
      <div className="my-2" ref={itemRef}>
        <div className="flex flex-col space-y-2 text-left">
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <div
                className={clsx(
                  'rounded-md px-2 py-1 text-sm font-bold',
                  newYN
                    ? category1Color
                      ? `bg-${category1Color} text-text_black`
                      : 'bg-brand-5 text-text_black'
                    : 'bg-[#ccc] text-[#aaa]',
                )}
              >
                {category1}
              </div>
              {category2 && (
                <div
                  className={clsx(
                    'rounded-md px-2 py-1 text-sm font-bold',
                    newYN
                      ? category2Color
                        ? `bg-${category2Color} text-text_black`
                        : 'bg-brand-5 text-text_black'
                      : 'bg-[#ccc] text-[#aaa]',
                  )}
                >
                  {category2}
                </div>
              )}
            </div>

            {useSubmit && (
              <div>
                <div className="flex space-x-2">
                  {submitText == undefined && submitYN != undefined && !submitYN ? (
                    <>
                      {submitDate != undefined && submitDate != '' && (
                        <div className="py-1 text-sm font-bold text-red-500">~{submitDate}</div>
                      )}
                      {submitDate && new Date(submitDate) < new Date() ? (
                        <div className="bg-grey-7 rounded-md px-2 py-1 text-sm">기간만료</div>
                      ) : (
                        <div className="filled-red rounded-md px-2 py-1 text-sm">제출필요</div>
                      )}
                    </>
                  ) : (
                    <div className="bg-grey-7 rounded-md px-2 py-1 text-sm">제출완료</div>
                  )}
                  {submitText && <div className="bg-grey-7 rounded-md px-2 py-1 text-sm">{submitText}</div>}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start justify-between">
            <span className={clsx('text-18 w-[90%] font-bold', newYN ? 'text-black' : 'text-[#aaa]')}>{title}</span>
            {newYN ? <Icon.Unread className="scale-75" /> : <Icon.Read className="scale-75" />}
          </div>

          {contentJson && (
            <div className="h-40 overflow-hidden">
              {/* <div dangerouslySetInnerHTML={{ __html: removeStyleAttribute(contentJson.content) }}></div> */}
              <div className={clsx(newYN ? 'text-black' : 'text-[#aaa]')}>
                {parse(removeStyleAttribute(contentJson.content))}
              </div>
            </div>
          )}

          {!contentJson && (
            <div className="feedback_space break-all whitespace-pre-line">
              {Pdfs?.length === 0 && images?.length === 0 ? (
                <span className={clsx('text-15 line-clamp-5', newYN ? 'text-black' : 'text-[#aaa]')}>
                  {contentText}
                </span>
              ) : (
                <span className={clsx('text-15 line-clamp-3', newYN ? 'text-black' : 'text-[#aaa]')}>
                  {contentText}
                </span>
              )}
              {/* <span className="text-15 text-gray-500 ">더보기</span> */}
            </div>
          )}

          {(isVisible || isVisibled) && (
            <>
              {Pdfs?.length > 0 ? (
                <div className="my-2 aspect-1/1 w-full grid-flow-row grid-cols-1 gap-2">
                  <div className="relative aspect-auto rounded border-2">
                    <PdfCard fileUrl={`${Constants.imageUrl}${Pdfs[0]}`} visibleButton={false} />
                  </div>
                </div>
              ) : (
                <>
                  {images?.length > 0 && (
                    <div className={`grid h-56 w-full gap-2 grid-cols-${images.length >= 2 ? 2 : 1} `}>
                      {images.slice(0, images.length >= 2 ? 2 : 1).map((image, index) => (
                        <div
                          key={`image-${index}`}
                          className="flex items-center justify-center overflow-hidden rounded-lg"
                        >
                          <img
                            src={`${Constants.imageUrl}${image}`}
                            className="rounded-lg"
                            onError={({ currentTarget }) => {
                              currentTarget.src = SvgImage as unknown as string
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {!contentJson && contentFiles?.length != undefined && contentFiles?.length > 0 && (
            <div className="filled-gray-light rounded-lg px-3 py-2">
              <div className="text-13 flex items-center space-x-2">
                <FileItemIcon /> &nbsp; 첨부파일 {contentFiles?.length}개
              </div>
            </div>
          )}

          <div className="text-13 mt-1 flex items-center space-x-1 text-gray-500">
            <img className="w-6 rounded-md" src={`${Constants.imageUrl}${schoolMark}`} />
            <div>{schoolName}</div>
            <div>{writer}</div>
            <div> | </div>
            <div>{createAt}</div>
          </div>
        </div>
      </div>
    </ListItem>
  )
}
