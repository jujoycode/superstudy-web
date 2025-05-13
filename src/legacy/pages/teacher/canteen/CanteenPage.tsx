import { useEffect, useRef, useState } from 'react';
// @ts-ignore
import ExifOrientationImg from 'react-exif-orientation-img';
import { Link } from 'react-router-dom';
import Viewer from 'react-viewer';
import { useRecoilValue } from 'recoil';
import { ReactComponent as ChatIcon } from 'src/assets/svg/chat.svg';
import { ReactComponent as ClockIcon } from 'src/assets/svg/clock.svg';
import { ReactComponent as Refresh } from 'src/assets/svg/refresh.svg';
import { ErrorBlank } from 'src/components';
import { CanteenCalendar } from 'src/components/CanteenCalendar';
import { Dashboard } from 'src/components/Dashboard';
import AnnouncementPopup from 'src/components/announcement/Announcement';
import { Blank, TopNavbar } from 'src/components/common';
import { Icon } from 'src/components/common/icons';
import { NotificationModal } from 'src/components/notification/NotificationModal';
import { Constants } from 'src/constants';
import { useTeacherCanteen } from 'src/container/teacher-canteen';
import { useNotificationLogFindRecent } from 'src/generated/endpoint';
import { CalendarIdEnum } from 'src/generated/model';
import { useLanguage } from 'src/hooks/useLanguage';
import { meState, newMsgCntState } from 'src/store';
import { checkNewVersion } from 'src/util/status';
import { makeDateToString, makeMonthDayToString, makeMonthDayToStringEN } from 'src/util/time';
import { CanteenDetailPage } from './CanteenDetailPage';
import { CanteenSubmitPage } from './CanteenSubmitPage';

export function CanteenPage() {
  const me = useRecoilValue(meState);
  const newMsgCnt = useRecoilValue(newMsgCntState);
  const { t } = useLanguage();

  checkNewVersion();

  const {
    schedulesOrderByDay,
    errorMessage,
    selectedDate,
    setSelectedDate,
    selectedCanteen,
    selectedSchedules,
    isLoading,
  } = useTeacherCanteen();
  const { data: notificationLog } = useNotificationLogFindRecent();

  const [modalOpen, setModalOpen] = useState(false);
  const [readState, setReadState] = useState(true);
  const [blankOpen, setBlankOpen] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);

  const conteenRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    if (selectedCanteen) {
      conteenRef.current?.scrollIntoView();
    }
  }, [selectedCanteen]);

  if (!me?.id || isLoading) {
    return <Blank />;
  }

  const hasConfirmedAll = !notificationLog;

  return (
    <>
      {/* 팝업공지 출력 */}
      <AnnouncementPopup type="teacher" />
      {/* Mobile V */}
      <div className="relative block md:hidden">
        {blankOpen && <Blank />}
        <TopNavbar
          title={modalOpen ? '알림' : '일정'}
          left={
            <div className="relative h-6 w-6">
              {modalOpen ? (
                <Icon.Back className="h-6 w-6 cursor-pointer" onClick={() => setModalOpen(!modalOpen)} />
              ) : (
                <Icon.Bell className="h-6 w-6 cursor-pointer" onClick={() => setModalOpen(!modalOpen)} />
              )}
              {!hasConfirmedAll && <div className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />}
            </div>
          }
          right={
            <div
              onClick={() => {
                setBlankOpen(true);
                window?.location?.reload();
              }}
              className="text-sm text-brand-1"
            >
              <Refresh />
            </div>
          }
        />
        {modalOpen && (
          <div className="scroll-box fixed inset-x-0 bottom-0 top-14 z-50 h-screen-7 overflow-x-auto">
            <NotificationModal />
          </div>
        )}
        <Dashboard />
        <div className="px-4 py-4">
          <CanteenCalendar
            value={selectedDate}
            onChange={(value: any) => setSelectedDate(new Date(value))}
            onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setSelectedDate(activeStartDate)}
            tileContent={({ date }) => {
              const dateStr = makeDateToString(date);
              const schedules = schedulesOrderByDay[dateStr];
              return (
                <div className="absolute inset-x-0 flex justify-center space-x-0.5">
                  {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_0) && (
                    <div className="h-1 w-1 rounded-full bg-schedule-school" />
                  )}
                  {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_1) && (
                    <div className="h-1 w-1 rounded-full bg-schedule-teacher" />
                  )}
                  {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_2) && (
                    <div className="h-1 w-1 rounded-full bg-schedule-group" />
                  )}
                </div>
              );
            }}
          />
        </div>
        <div className="h-0.5 w-full bg-gray-50" />
        <div className="px-6 py-4">
          {/* <div className="pb-3 text-sm text-grey-5">{makeMonthDayToString(selectedDate)}</div> */}
          <div className="pb-3 text-sm text-grey-5">
            {t('language') === 'ko' ? makeMonthDayToString(selectedDate) : makeMonthDayToStringEN(selectedDate)}
          </div>
          <div className="flex flex-col space-y-3">
            {selectedSchedules?.map((schedule: any) => (
              <div key={schedule.id} id={schedule.id} className="flex w-full items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    schedule.calendarId === CalendarIdEnum.NUMBER_0
                      ? 'bg-schedule-teacher'
                      : schedule.calendarId === CalendarIdEnum.NUMBER_2
                        ? 'bg-schedule-group'
                        : 'bg-schedule-school'
                  }`}
                />
                <div className="font-bold">{schedule.title}</div>
              </div>
            ))}
          </div>
        </div>
        {selectedCanteen?.image && (
          <div onClick={() => setImageModalOpen(true)} ref={conteenRef}>
            <div className="aspect-5/3 rounded bg-gray-50">
              <ExifOrientationImg
                src={Constants.imageUrl + selectedCanteen.image}
                alt=""
                className="h-full w-full rounded-lg object-cover"
              />
            </div>

            <div className="ml-4 text-sm text-gray-400">이미지를 클릭해서 크게 볼 수 있습니다.</div>
          </div>
        )}
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
          <div className="mb-20 flex space-x-2 px-4 py-4">
            <div className="w-full flex-col space-y-2">
              <div className="text-lg font-bold">{t('lunch')}</div>
              <div className="whitespace-pre-line">{selectedCanteen?.lunch}</div>
            </div>
            <div className="w-full flex-col space-y-2">
              {/* <div className="text-lg font-bold">석식</div> */}
              <div className="text-lg font-bold">{selectedCanteen?.dinner ? t('dinner') : ''}</div>
              <div className="whitespace-pre-line">{selectedCanteen?.dinner}</div>
            </div>
          </div>
        ) : (
          <div className="h-20"></div>
        )}

        <div className="fixed bottom-16 right-4">
          <div className="relative mb-2 h-16 w-16 rounded-full bg-brand-1 bg-opacity-50">
            <Link className="flex h-full w-full flex-col items-center justify-center" to={'/teacher/chat'}>
              <ChatIcon />
              <div className="text-sm text-white">메시지</div>
            </Link>
            {newMsgCnt > 0 && (
              <small className="absolute right-0 top-0 h-6 w-6 rounded-full bg-red-500 text-center text-xs leading-6 text-white">
                N
              </small>
            )}
          </div>
          <div className="h-16 w-16 rounded-full bg-grey-8">
            <Link className="flex h-full w-full flex-col items-center justify-center" to={'/teacher/timetable'}>
              <ClockIcon />
              <div className="text-sm text-white">시간표</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop V */}
      <div className="col-span-6 hidden grid-cols-6 md:block xl:grid">
        {errorMessage && <ErrorBlank />}
        <div className="scroll-box col-span-3 h-screen overflow-y-auto">
          <div className="px-6 py-6">
            <CanteenCalendar
              value={selectedDate}
              onChange={(value: any) => setSelectedDate(new Date(value))}
              onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setSelectedDate(activeStartDate)}
              tileContent={({ date }) => {
                const dateStr = makeDateToString(date);
                const schedules = schedulesOrderByDay[dateStr];
                return (
                  <div className="absolute inset-x-0 flex justify-center space-x-0.5">
                    {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_0) && (
                      <div className="h-1 w-1 rounded-full bg-schedule-school" />
                    )}
                    {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_1) && (
                      <div className="h-1 w-1 rounded-full bg-schedule-teacher" />
                    )}
                    {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_2) && (
                      <div className="h-1 w-1 rounded-full bg-schedule-group" />
                    )}
                  </div>
                );
              }}
            />
          </div>

          <div className="h-0.5 w-full bg-gray-50" />
          <div className="px-6 py-4">
            <div className="pb-3 text-sm text-grey-5">
              {t('language') === 'ko' ? makeMonthDayToString(selectedDate) : makeMonthDayToStringEN(selectedDate)}
            </div>
            <div className="flex flex-col space-y-3">
              {selectedSchedules?.map((schedule: any) => (
                <div id={schedule.id} className="flex w-full items-center space-x-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      schedule.calendarId === CalendarIdEnum.NUMBER_1
                        ? 'bg-schedule-teacher'
                        : schedule.calendarId === CalendarIdEnum.NUMBER_2
                          ? 'bg-schedule-group'
                          : 'bg-schedule-school'
                    }`}
                  />
                  <div className="font-bold">{schedule.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="scroll-box col-span-3 h-screen bg-gray-50">
          {readState ? (
            <CanteenDetailPage
              selectedDate={selectedDate}
              canteen={selectedCanteen}
              setSubmitState={() => setReadState(false)}
            />
          ) : (
            <CanteenSubmitPage
              selectedDate={selectedDate}
              canteenData={selectedCanteen}
              refetch={() => {
                setReadState(true);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
