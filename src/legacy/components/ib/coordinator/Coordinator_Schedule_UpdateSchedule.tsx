import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { Button } from '@/legacy/components/common/Button'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import ScheduleAndTimePicker from '@/legacy/components/common/ScheduleAndTimePicker'
import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { useIBDeadlineUpdateDeadline } from '@/legacy/generated/endpoint'
import { ResponseIBDeadlineDto } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

import { DEADLINE_TYPE_KOR } from './Coordinator_Schedule'
import ColorSVGIcon from '../../icon/ColorSVGIcon'

interface Coordinator_Schedule_UpdateScheduleProps {
  modalOpen: boolean
  setModalClose: () => void
  handleBack?: () => void
  scheduleData?: ResponseIBDeadlineDto
  onSuccess?: () => void
}

export function Coordinator_Schedule_UpdateSchedule({
  modalOpen,
  setModalClose,
  handleBack,
  scheduleData,
  onSuccess,
}: PropsWithChildren<Coordinator_Schedule_UpdateScheduleProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [deadline, setDeadline] = useState<ResponseIBDeadlineDto | undefined>(scheduleData)

  const { mutate: updateDeadline } = useIBDeadlineUpdateDeadline({ mutation: { onSuccess } })

  const handleSubmit = () => {
    if (!deadline) return
    updateDeadline({ id: deadline.id, data: deadline })
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  useEffect(() => {
    if (scheduleData) {
      setDeadline(scheduleData)
    }
  }, [scheduleData])

  return (
    <div
      className={`bg-opacity-50 fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black ${
        !modalOpen && 'hidden'
      }`}
    >
      <div className={`relative w-[632px] overflow-hidden rounded-xl bg-white px-8`}>
        <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6 backdrop-blur-[20px]">
          <Typography variant="title1">마감기한 설정</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} />
        </div>

        <div ref={scrollRef} className="scroll-box flex max-h-[608px] flex-col gap-6 overflow-auto pt-4 pb-8">
          {deadline && (
            <div className="rounded-lg bg-gray-50">
              <div className="flex items-center justify-between border-b border-gray-300 p-4">
                <Typography variant="title2">{DEADLINE_TYPE_KOR[deadline.type]}</Typography>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex w-[235px] flex-col gap-3">
                  <Typography variant="title3" className="font-semibold">
                    마감기한
                  </Typography>
                  <div className="relative">
                    <div
                      className={`flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-[9px] focus:ring-0 focus:outline-none ${
                        isFocused && 'border-gray-700'
                      }`}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      onClick={() => setCalendarOpen(!calendarOpen)}
                    >
                      <SVGIcon.Calendar size={20} color="gray700" />
                      <input
                        className="text-15 caret-ib-blue-800 w-full flex-1 border-none bg-white p-0 font-medium text-gray-900 placeholder-gray-400 focus:border-gray-700 focus:text-gray-700 focus:ring-0 focus:outline-none"
                        placeholder="마감기한 선택"
                        value={
                          deadline.deadlineTime
                            ? DateUtil.formatDate(new Date(deadline.deadlineTime), DateFormat['YYYY.MM.DD a hh:mm']) +
                              '까지'
                            : ''
                        }
                      />
                    </div>
                    {calendarOpen && (
                      <div className="fixed top-1/2 left-1/2 z-50 mt-2 -translate-x-1/2 -translate-y-1/2 transform">
                        <ScheduleAndTimePicker
                          initialDeadline={deadline.deadlineTime ? new Date(deadline.deadlineTime) : undefined}
                          onSave={(finalDate) => {
                            const finalDateString = finalDate?.toISOString() || ''
                            setDeadline({ ...deadline, deadlineTime: finalDateString })
                            setCalendarOpen(false)
                          }}
                          onCancel={() => setCalendarOpen(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Typography variant="title3" className="font-semibold">
                    알림주기
                  </Typography>
                  <div className="flex items-center space-x-2">
                    {[7, 3, 1, 0].map((day) => (
                      <Button.lg
                        key={day}
                        className={twMerge(
                          'h-[40px] border border-gray-300 bg-white text-gray-700 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400',
                          deadline.remindDays?.includes(day) && 'border-primary-400 bg-primary-100 text-primary-800',
                        )}
                        disabled={!deadline.deadlineTime}
                        onClick={() =>
                          setDeadline({
                            ...deadline,
                            remindDays: deadline.remindDays?.includes(day)
                              ? (deadline.remindDays || []).filter((el) => el !== day)
                              : (deadline.remindDays || []).concat(day),
                          })
                        }
                      >
                        {day === 0 ? '당일' : `${day}일전`}
                      </Button.lg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={
            'sticky bottom-0 flex h-[104px] justify-end gap-4 border-t border-t-gray-100 bg-white/70 pt-6 pb-8 backdrop-blur-[20px]'
          }
        >
          <div className="flex justify-end gap-3">
            <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
              이전
            </ButtonV2>
            <ButtonV2 type="submit" variant="solid" color="orange800" size={48} onClick={handleSubmit}>
              저장하기
            </ButtonV2>
          </div>
        </div>
      </div>
      {isOpen && (
        <AlertV2 confirmText="확인" message={`일정이 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
      )}
    </div>
  )
}
