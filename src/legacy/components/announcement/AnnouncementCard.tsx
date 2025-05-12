import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Constants } from '@/legacy/constants'
import { ResponseAnnouncementDto } from '@/legacy/generated/model'
import { isHTML, jsonParseSafe } from '@/legacy/util/validator'
import { Label } from '@/legacy/components/common'

interface AnnouncementCardProps {
  ann: ResponseAnnouncementDto
  leftPosition?: string
  topPosition?: string
  index?: number
  type: string
}

export default function AnnouncementCard({
  ann,
  leftPosition = '',
  topPosition = '',
  index = 0,
  type,
}: AnnouncementCardProps) {
  const [show, setShow] = useState(true)
  const { push } = useHistory()
  const dismissAnnouncement = (duration: number, id: number) => {
    const until = new Date()
    until.setDate(until.getDate() + duration)
    const dismissed = { id: id, until }
    const currentDismissals = jsonParseSafe(localStorage.getItem('serviceNoticeShow'), [])
    localStorage.setItem('serviceNoticeShow', JSON.stringify([...currentDismissals, dismissed]))
    setShow(false)
  }
  return (
    <>
      {/* Mobile V */}
      <div
        className={`absolute top-1/2 left-1/2 block -translate-x-1/2 -translate-y-1/2 md:hidden`}
        style={{ zIndex: 60 - index }}
      >
        <div
          className={`relative flex items-center justify-center rounded-lg border bg-white p-6 shadow-lg ${
            !show && 'hidden'
          }`}
        >
          <div className="h-96 w-[300px]">
            {ann?.content && (
              <div
                className="scroll-box h-[336px] cursor-pointer overflow-y-scroll"
                onClick={() => push(`/${type}/announcement/${ann.id}`)}
              >
                <h1 className="mb-4">
                  안녕하세요. <b className="text-brand-1">슈퍼스쿨</b>입니다.
                </h1>
                {isHTML(ann.content) ? (
                  <div className="text-xs" dangerouslySetInnerHTML={{ __html: ann.content }}></div>
                ) : (
                  <pre className="text-base break-words whitespace-pre-wrap">{ann.content}</pre>
                )}
              </div>
            )}
            {!ann.content && ann?.images && (
              <img
                src={`${Constants.imageUrl}${ann.images[0]}`}
                className="mx-auto h-[336px] cursor-pointer"
                onClick={() => push(`/${type}/announcement/${ann.id}`)}
              />
            )}
            <div className="mt-2 flex h-12 items-center justify-between space-x-2">
              <button onClick={() => setShow(false)} className="w-full rounded-md bg-gray-100 py-2 font-semibold">
                닫기
              </button>
              <button
                onClick={() => dismissAnnouncement(999, ann.id)}
                className="bg-brand-1 w-full rounded-md py-2 font-semibold text-white"
              >
                다시보지 않기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop V */}
      <div
        className={`absolute hidden md:block`}
        style={{ left: leftPosition, top: topPosition, transform: 'translate(-50%, -50%)', zIndex: 60 - index }}
      >
        <div
          className={`relative flex items-center justify-center rounded-lg border bg-white p-6 shadow-lg ${
            !show && 'hidden'
          }`}
        >
          <div className="h-[500px] w-[500px]">
            <h1 className="bg-brand-1 mb-2 h-[30px] px-1 text-xl font-bold text-white">{ann.title}</h1>
            <div
              className="scroll-box h-[440px] cursor-pointer overflow-y-scroll"
              onClick={() => push(`/${type}/announcement/${ann.id}`)}
            >
              {ann?.content && (
                <>
                  <h1 className="mb-4">
                    안녕하세요. <b className="text-brand-1">슈퍼스쿨</b>입니다.
                  </h1>

                  {isHTML(ann.content) ? (
                    <div className="text-xl" dangerouslySetInnerHTML={{ __html: ann.content }}></div>
                  ) : (
                    <pre className="text-xl break-words whitespace-pre-line">{ann.content}</pre>
                  )}
                </>
              )}
              {!ann.content && ann?.images && (
                <img
                  src={`${Constants.imageUrl}${ann.images[0]}`}
                  className="mx-auto w-full cursor-pointer"
                  onClick={() => push(`/${type}/announcement/${ann.id}`)}
                />
              )}
            </div>
            <div className="scroll-box h-0.5 bg-gray-100"></div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <button onClick={() => dismissAnnouncement(999, ann.id)} className="flex items-center gap-2">
                  <input type="checkbox" className="cursor-pointer" />
                  <Label.Text children="다시보지 않기" />
                </button>
                <button onClick={() => dismissAnnouncement(7, ann.id)} className="flex items-center gap-2">
                  <input type="checkbox" className="cursor-pointer" />
                  <Label.Text children="7일간 보지 않기" />
                </button>
              </div>
              <button onClick={() => setShow(false)} className="bg-brand-1 rounded-md px-2 font-semibold text-white">
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
