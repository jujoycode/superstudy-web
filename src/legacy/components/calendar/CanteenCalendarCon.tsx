import { useState } from 'react'
// @ts-ignore
import ExifOrientationImg from 'react-exif-orientation-img'
import Viewer from 'react-viewer'
// import DINNER from '@/legacy/assets/images/dinner.png'
// import LUNCH from '@/legacy/assets/images/lunch.png'
import { Typography } from '@/legacy/components/common/Typography'
import { Constants } from '@/legacy/constants'
import { useStudentCanteen } from '@/legacy/container/student-canteen'
import { useTeacherCanteen } from '@/legacy/container/teacher-canteen'
import { CalendarIdEnum, ResponseExtendedScheduleDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { makeDateToString, makeMonthDayToStringEN, makeMonthDayWithDayOfWeekToString } from '@/legacy/util/time'
import { ErrorBlank } from '../ErrorBlank'
import { CanteenCalendarM } from './CanteenCalendarM'

export function CanteenCalendarTeacher() {
  const { schedulesOrderByDay, selectedDate, setSelectedDate, selectedCanteen, selectedSchedules, isLoading } =
    useTeacherCanteen()
  const { t } = useLanguage()
  const [isImageModalOpen, setImageModalOpen] = useState(false)
  return (
    <main>
      <div className="flex flex-col gap-4 px-5 py-10">
        <CanteenCalendarM
          value={selectedDate}
          onChange={(value: any) => setSelectedDate(new Date(value))}
          onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setSelectedDate(activeStartDate)}
          tileContent={({ date }) => {
            const dateStr = makeDateToString(date)
            const schedules = schedulesOrderByDay[dateStr]
            return (
              <div className="flex justify-center space-x-0.5">
                {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_0) && (
                  <div className="bg-schedule-school h-1 w-1 rounded-full" />
                )}
                {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_1) && (
                  <div className="bg-schedule-teacher h-1 w-1 rounded-full" />
                )}
                {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_2) && (
                  <div className="bg-schedule-group h-1 w-1 rounded-full" />
                )}
              </div>
            )
          }}
        />
        <div className="bg-primary-gray-50 flex flex-col gap-1 rounded-lg p-4">
          <Typography variant="body3" className="text-primary-gray-600">
            {t('language') === 'ko'
              ? makeMonthDayWithDayOfWeekToString(selectedDate)
              : makeMonthDayToStringEN(selectedDate)}
          </Typography>
          {selectedSchedules && selectedSchedules?.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {selectedSchedules?.map((schedule) => (
                <div key={schedule.id} className="flex w-full items-center gap-1.5">
                  <div
                    className={`border-dim-8 h-3 w-3 rounded-[4px] border ${
                      schedule.calendarId === CalendarIdEnum.NUMBER_1
                        ? 'bg-schedule-teacher'
                        : schedule.calendarId === CalendarIdEnum.NUMBER_2
                          ? 'bg-schedule-group'
                          : 'bg-schedule-school'
                    }`}
                  />
                  <Typography variant="body3" className="font-medium">
                    {schedule.title}
                  </Typography>
                </div>
              ))}
            </div>
          ) : (
            <Typography variant="body3" className="font-medium">
              일정 없음
            </Typography>
          )}
        </div>
      </div>

      {/* 급식표 이미지 모달 */}
      <div className="absolute">
        {selectedCanteen?.image && (
          <Viewer
            visible={isImageModalOpen}
            rotatable
            noImgDetails
            scalable={false}
            images={[{ src: Constants.imageUrl + selectedCanteen.image, alt: '' }]}
            onClose={() => setImageModalOpen(false)}
          />
        )}
      </div>
      {selectedCanteen ? (
        <div className="flex flex-col">
          <div className="bg-primary-gray-100 mb-10 h-2.5 w-full" />
          <section className="flex flex-col gap-3 px-5">
            <Typography variant="mobileTitle">오늘의 급식</Typography>
            {selectedCanteen.lunch && (
              <span className="border-primary-gray-200 relative flex flex-col gap-1 rounded-xl border p-4">
                <Typography variant="title3" className="font-semibold">
                  중식
                </Typography>
                <div className="absolute top-4 right-4 h-12 w-12">
                  {/* <img src={LUNCH} className="h-12 w-12 object-cover" /> */}
                </div>
                <Typography variant="body2" className="whitespace-pre-line">
                  {selectedCanteen.lunch}
                </Typography>
              </span>
            )}
            {selectedCanteen.dinner && (
              <span className="border-primary-gray-200 relative flex flex-col gap-1 rounded-xl border p-4">
                <Typography variant="title3" className="font-semibold">
                  석식
                </Typography>
                <div className="absolute top-4 right-4 h-12 w-12">
                  {/* <img src={DINNER} className="h-12 w-12 object-cover" /> */}
                </div>
                <Typography variant="body2" className="whitespace-pre-line">
                  {selectedCanteen.dinner}
                </Typography>
              </span>
            )}
            {selectedCanteen.image && (
              <ExifOrientationImg
                src={`${Constants.imageUrl}${selectedCanteen.image}`}
                alt="메뉴 이미지"
                className="border-primary-gray-200 h-[276px] w-full rounded-xl border object-fill"
                onClick={() => setImageModalOpen(true)}
              />
            )}
          </section>
        </div>
      ) : (
        <div className="h-20"></div>
      )}
    </main>
  )
}

export function CanteenCalendarStudent() {
  const {
    daysWithSchedule,
    errorMessage,
    selectedDate,
    setSelectedDate,
    selectedCanteen,
    selectedSchedules,
    isLoading,
  } = useStudentCanteen()
  const { t } = useLanguage()
  const [isImageModalOpen, setImageModalOpen] = useState(false)

  return (
    <main>
      {errorMessage && <ErrorBlank text={errorMessage} />}
      <div className="flex flex-col gap-4 px-5 py-10">
        <CanteenCalendarM
          value={selectedDate}
          onChange={(value: any) => setSelectedDate(new Date(value))}
          onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setSelectedDate(activeStartDate)}
          tileContent={({ date }) => (
            <div className="flex justify-center space-x-0.5">
              {daysWithSchedule.includes(makeDateToString(date)) && (
                <div className="bg-primary-orange-800 h-1 w-1 rounded-full" />
              )}
            </div>
          )}
        />
        <div className="bg-primary-gray-50 flex flex-col gap-1 rounded-lg p-4">
          <Typography variant="body3" className="text-primary-gray-600">
            {t('language') === 'ko'
              ? makeMonthDayWithDayOfWeekToString(selectedDate)
              : makeMonthDayToStringEN(selectedDate)}
          </Typography>
          {selectedSchedules && selectedSchedules?.length > 0 ? (
            <div className="flex justify-center space-x-0.5">
              {selectedSchedules?.map((schedule: ResponseExtendedScheduleDto) => (
                <div key={schedule.id} className="flex w-full items-center gap-1.5">
                  <div className={`border-dim-8 bg-primary-orange-800 h-3 w-3 rounded-[4px] border`} />
                  <Typography variant="body3" className="font-medium">
                    {schedule.title}
                  </Typography>
                </div>
              ))}
            </div>
          ) : (
            <Typography variant="body3" className="font-medium">
              일정 없음
            </Typography>
          )}
        </div>
      </div>

      {/* 급식표 이미지 모달 */}
      <div className="absolute">
        {selectedCanteen?.image && (
          <Viewer
            visible={isImageModalOpen}
            rotatable
            noImgDetails
            scalable={false}
            images={[{ src: Constants.imageUrl + selectedCanteen.image, alt: '' }]}
            onClose={() => setImageModalOpen(false)}
          />
        )}
      </div>
      {selectedCanteen ? (
        <div className="flex flex-col">
          <div className="bg-primary-gray-100 mb-10 h-2.5 w-full" />
          <section className="flex flex-col gap-3 px-5">
            <Typography variant="mobileTitle">오늘의 급식</Typography>
            {selectedCanteen.lunch && (
              <span className="border-primary-gray-200 relative flex flex-col gap-1 rounded-xl border p-4">
                <Typography variant="title3" className="font-semibold">
                  중식
                </Typography>
                <div className="absolute top-4 right-4 h-12 w-12">
                  {/* <img src={LUNCH} className="h-12 w-12 object-cover" /> */}
                </div>
                <Typography variant="body2" className="whitespace-pre-line">
                  {selectedCanteen.lunch}
                </Typography>
              </span>
            )}
            {selectedCanteen.dinner && (
              <span className="border-primary-gray-200 relative flex flex-col gap-1 rounded-xl border p-4">
                <Typography variant="title3" className="font-semibold">
                  석식
                </Typography>
                <div className="absolute top-4 right-4 h-12 w-12">
                  {/* <img src={DINNER} className="h-12 w-12 object-cover" /> */}
                </div>
                <Typography variant="body2" className="whitespace-pre-line">
                  {selectedCanteen.dinner}
                </Typography>
              </span>
            )}
            {selectedCanteen.image && (
              <ExifOrientationImg
                src={`${Constants.imageUrl}${selectedCanteen.image}`}
                alt="메뉴 이미지"
                className="border-primary-gray-200 h-[276px] w-full rounded-xl border object-fill"
                onClick={() => setImageModalOpen(true)}
              />
            )}
          </section>
        </div>
      ) : (
        <div className="h-20"></div>
      )}
    </main>
  )
}
