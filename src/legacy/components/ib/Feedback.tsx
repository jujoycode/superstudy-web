import clsx from 'clsx'
import { format } from 'date-fns'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import NODATA from '@/assets/images/no-data.png'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { useFeedback } from '@/legacy/container/ib-feedback'
import { RequestFeedbackDto, ResponseFeedbackDtoReferenceTable, ResponseUserDto } from '@/legacy/generated/model'

import SolidSVGIcon from '../icon/SolidSVGIcon'

interface FeedbackProps {
  referenceId: number
  referenceTable: ResponseFeedbackDtoReferenceTable
  user: ResponseUserDto
  readonly?: boolean
  disabled?: boolean
  readonlyBackground?: 'bg-white' | 'bg-primary-gray-100'
  className?: string
  useTextarea?: boolean
}

export const Feedback: FC<FeedbackProps> = ({
  referenceId,
  referenceTable,
  user,
  readonly = false,
  disabled = false,
  readonlyBackground = 'bg-white',
  className,
  useTextarea = true,
}) => {
  const { feedback, isFetching, createFeedback, isCreating } = useFeedback({ referenceId, referenceTable })
  const [content, setContent] = useState<string>('')
  const [isFocused, setIsFocused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  const onSubmit = useCallback(() => {
    if (!content.trim() || isCreating || isFetching) return
    const feedbackData: RequestFeedbackDto = {
      content,
      referenceId,
      referenceTable,
    }

    createFeedback({ data: feedbackData })
    setContent('')
  }, [content, isCreating, createFeedback, referenceId, referenceTable])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [feedback])

  return (
    <div className={twMerge('relative flex h-full flex-col justify-between gap-6', className)}>
      {isFetching ? (
        <IBBlank type="section" />
      ) : (
        <div className="scroll-box flex h-[448px] flex-grow flex-col gap-3 overflow-y-auto" ref={scrollRef}>
          {feedback && feedback?.length > 0 ? (
            [...feedback].reverse().map((item) => {
              const date = item.createdAt ? new Date(item.createdAt) : new Date()
              return (
                <div
                  key={item.id}
                  className={`flex flex-col gap-3 rounded-xl p-5 ${
                    item.sender === null
                      ? 'bg-primary-gray-50'
                      : item.sender.role !== 'USER'
                        ? 'bg-primary-orange-50'
                        : 'bg-primary-gray-50'
                  }`}
                >
                  {item.sender === null ? (
                    <div className="flex flex-row items-center justify-between">
                      <span className="flex flex-row items-center gap-2">
                        <SolidSVGIcon.Bell size={24} color="gray700" />
                        <Typography variant="title3">알림</Typography>
                      </span>
                      <Typography variant="caption">{format(date, 'yyyy.MM.dd')}</Typography>
                    </div>
                  ) : item.sender.role !== 'USER' ? (
                    <div className="flex flex-row items-center justify-between">
                      <span className="flex flex-row items-center gap-2">
                        <SolidSVGIcon.Talk size={24} color="orange800" weight="bold" />
                        <Typography variant="title3" className="text-primary-orange-800">
                          {item.sender.name}선생님의 피드백
                        </Typography>
                      </span>
                      <Typography variant="caption" className="text-primary-gray-500">
                        {format(date, 'yyyy.MM.dd HH:mm')}
                      </Typography>
                    </div>
                  ) : (
                    <div className="flex flex-row items-center justify-between">
                      <span className="flex flex-row items-center gap-2">
                        <SolidSVGIcon.Talk size={24} color="gray700" weight="bold" />
                        <Typography variant="title3">학생이 남긴 댓글</Typography>
                      </span>
                      <Typography variant="caption" className="text-primary-gray-500">
                        {format(date, 'yyyy.MM.dd HH:mm')}
                      </Typography>
                    </div>
                  )}
                  {/* <Typography variant="body2" className="whitespace-pre-line">
                  {item.content}
                </Typography> */}
                  {item.sender === null ? (
                    <div className="flex flex-col gap-1">
                      {item.content.includes('\n') ? (
                        <>
                          <Typography variant="body2" className="whitespace-pre-line">
                            {item.content.split('\n')[0]}
                          </Typography>
                          <Typography variant="caption" className="text-primary-gray-500 whitespace-pre-line">
                            {item.content.split('\n')[1]}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" className="whitespace-pre-line">
                          {item.content}
                        </Typography>
                      )}
                    </div>
                  ) : (
                    <Typography variant="body2" className="whitespace-pre-line">
                      {item.content}
                    </Typography>
                  )}
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center gap-6 py-20">
              <div className="h-12 w-12 px-[2.50px]">
                <img src={NODATA} className="h-12 w-[43px] object-cover" />
              </div>
              <Typography variant="body2">진행기록이 없습니다.</Typography>
            </div>
          )}
        </div>
      )}
      {useTextarea && (
        <div
          className={clsx(
            'border-primary-gray-200 relative flex flex-col justify-between gap-4 rounded-lg border p-4 focus:ring-0 focus:outline-none',
            {
              'bg-white': readonly && readonlyBackground === 'bg-white',
              'bg-primary-gray-100':
                (readonly && readonlyBackground === 'bg-primary-gray-100') || disabled || isFetching,
              'cursor-not-allowed': readonly || disabled || isFetching,
              'cursor-pointer': !readonly && !disabled && !isFetching,
              'border-primary-gray-700': isFocused,
            },
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={clsx(
              `text-15 text-primary-gray-900 placeholder-primary-gray-400 caret-primary-blue-800 focus:text-primary-gray-700 h-16 resize-none border-none p-0 focus:border-none focus:ring-0 disabled:text-gray-400`,
              {
                'bg-white': readonly && readonlyBackground === 'bg-white',
                'bg-primary-gray-100':
                  (readonly && readonlyBackground === 'bg-primary-gray-100') || disabled || isFetching,
                'cursor-not-allowed': readonly || disabled || isFetching,
                'cursor-pointer': !readonly && !disabled && !isFetching,
              },
            )}
            disabled={disabled || isFetching}
            readOnly={readonly}
            placeholder={`${
              user.role === 'USER' ? '선생님에게 남길 말을 입력하세요.' : '학생에게 남길 말을 입력하세요.'
            }`}
          />
          <nav className="flex flex-row items-center justify-between">
            <Typography variant="caption" className="text-primary-gray-500">
              {content.length}&nbsp;/&nbsp;1,000
            </Typography>
            <ButtonV2
              variant="solid"
              color="orange100"
              size={32}
              disabled={isFetching || disabled || content.length === 0 ? true : false}
              onClick={onSubmit}
            >
              저장
            </ButtonV2>
          </nav>
        </div>
      )}
    </div>
  )
}
