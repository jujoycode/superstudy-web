import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import SVGIcon from '../icon/SVGIcon';
import { ButtonV2 } from './ButtonV2';
import { LayeredTabs, Tab } from './LayeredTabs';
import SelectBar from './SelectBar';
import { Typography } from './Typography';

const hourOptions = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  value: String(i + 1).padStart(2, '0'),
  text: String(i + 1).padStart(2, '0'),
}));

const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  value: String(i * 5).padStart(2, '0'),
  text: String(i * 5).padStart(2, '0'),
}));

interface ScheduleAndTimePickerProps {
  initialDeadline?: Date | undefined;
  onSave?: (deadline: Date | undefined) => void;
  onCancel?: () => void;
}

const ScheduleAndTimePicker: React.FC<ScheduleAndTimePickerProps> = ({ initialDeadline, onSave, onCancel }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [localDeadline, setLocalDeadline] = useState(initialDeadline);

  useEffect(() => {
    if (initialDeadline) {
      const date = new Date(initialDeadline);
      setCurrentDate(date);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHour = String(hours % 12 || 12).padStart(2, '0');
      const formattedMinute = String(minutes).padStart(2, '0');

      setSelectedHour(formattedHour);
      setSelectedMinute(formattedMinute);
      setSelectedPeriod(period);
    } else {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      // 다음 정시로 설정
      let nextHour = hours;
      if (minutes > 0) {
        nextHour = (hours + 1) % 24;
      }
      const formattedHour = String(nextHour % 12 || 12).padStart(2, '0');
      const formattedMinute = '00';

      setSelectedHour(formattedHour);
      setSelectedMinute(formattedMinute);
      setSelectedPeriod(nextHour >= 12 ? 'PM' : 'AM');
    }
  }, [initialDeadline]);

  const [selectedHour, setSelectedHour] = useState<string | undefined>('09');
  const [selectedMinute, setSelectedMinute] = useState<string | undefined>('00');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('AM');

  const handleDateSelect = (selectedDate: Date) => {
    setLocalDeadline((prev) => {
      const newDeadline = new Date(prev || selectedDate);
      newDeadline.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      let hour = parseInt(selectedHour!, 10);
      if (selectedPeriod === 'PM' && hour !== 12) {
        hour += 12;
      } else if (selectedPeriod === 'AM' && hour === 12) {
        hour = 0;
      }
      newDeadline.setHours(hour, parseInt(selectedMinute!, 10));

      return newDeadline;
    });
  };

  const handleTimeChange = (newHour: string, newMinute: string, newPeriod: string) => {
    setLocalDeadline((prev) => {
      const newDeadline = new Date(prev || currentDate);
      let hour = parseInt(newHour, 10);
      if (newPeriod === 'PM' && hour !== 12) {
        hour += 12;
      } else if (newPeriod === 'AM' && hour === 12) {
        hour = 0;
      }
      newDeadline.setHours(hour, parseInt(newMinute, 10));
      return newDeadline;
    });
  };

  // 이전 달로 이동
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prevMonth);
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(nextMonth);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localDeadline); // 최종 저장 시 상위로 전달
    }
  };

  // 달력 날짜 배열 생성 (이전 달 마지막 날짜와 다음 달 첫날 포함)
  const generateCalendarDates = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDayOfWeek = startOfMonth.getDay();
    const endDayOfWeek = endOfMonth.getDay();

    const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const nextMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    const dates: { date: Date; isCurrentMonth: boolean }[] = [];

    // 이전 달 날짜 채우기
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      dates.push({
        date: new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - i),
        isCurrentMonth: false,
      });
    }

    // 현재 달 날짜 채우기
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      dates.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), isCurrentMonth: true });
    }

    // 다음 달 날짜 채우기
    for (let i = 1; i < 7 - endDayOfWeek; i++) {
      dates.push({ date: new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth(), i), isCurrentMonth: false });
    }

    return dates;
  };

  const dates = generateCalendarDates();

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="flex w-[280px] flex-col items-center gap-4 rounded-lg border border-primary-gray-200 bg-white py-4 text-13 shadow-[0px_0px_16px_0px_rgba(0,0,0,0.08)]">
      {/* 달력 */}
      <div className="flex w-[248px] flex-col items-center gap-2">
        <div className="flex w-full items-center justify-around gap-1">
          <button onClick={handlePrevMonth} className="p-2">
            <SVGIcon.Arrow weight="bold" color="gray700" size={16} />
          </button>
          <Typography variant="title3" className="flex-1 text-center">
            {currentDate.getFullYear()}. {String(currentDate.getMonth() + 1).padStart(2, '0')}
          </Typography>
          <button onClick={handleNextMonth} className="p-2">
            <SVGIcon.Arrow weight="bold" color="gray700" size={16} rotate={180} />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid w-full grid-cols-7 gap-2">
          {weekdays.map((day, index) => (
            <Typography
              variant="caption"
              key={day}
              className={`text-center ${
                index === 0 ? 'text-primary-red-400' : index === 6 ? 'text-primary-blue-400' : 'text-primary-gray-500'
              }`}
            >
              {day}
            </Typography>
          ))}
        </div>

        {/* 날짜 */}
        <div className="relative grid w-[248px] grid-cols-7 gap-y-1">
          {dates.map(({ date: calendarDate, isCurrentMonth }) => (
            <div key={calendarDate.toISOString()} className={`relative flex items-center justify-center`}>
              <Typography
                variant="body3"
                className={`z-10 flex h-8 w-8 cursor-pointer items-center justify-center font-medium 
                ${isCurrentMonth ? 'text-primary-gray-900' : 'text-primary-gray-400'}
                ${isSameDay(calendarDate, new Date()) ? 'rounded-full border border-primary-orange-400' : ''}
                ${
                  localDeadline && isSameDay(calendarDate, localDeadline)
                    ? 'rounded-full bg-primary-orange-800 text-white'
                    : ''
                }`}
                onClick={() => handleDateSelect(calendarDate)}
              >
                {calendarDate.getDate()}
              </Typography>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full border-t border-gray-200"></div>
      <div className="flex w-[248px] flex-row items-center gap-2">
        <div className="flex flex-row items-center gap-1">
          <SelectBar
            options={hourOptions}
            value={selectedHour}
            onChange={(value: string) => {
              setSelectedHour(value);
              handleTimeChange(value, selectedMinute!, selectedPeriod);
            }}
            placeholder="시간 선택"
            size={32}
            containerWidth="w-[58px]"
            dropdownWidth="w-[100px]"
          />
          <Typography variant="body2" className="font-medium text-primary-gray-700">
            :
          </Typography>
          <SelectBar
            options={minuteOptions}
            value={selectedMinute}
            onChange={(value: string) => {
              setSelectedMinute(value);
              handleTimeChange(selectedHour!, value, selectedPeriod);
            }}
            placeholder="분 선택"
            size={32}
            containerWidth="w-[58px]"
            dropdownWidth="w-[100px]"
          />
        </div>
        <div className="h-8">
          <LayeredTabs.TwoDepth
            onChange={(selectedType: string) => {
              setSelectedPeriod(selectedType);
              handleTimeChange(selectedHour!, selectedMinute!, selectedType);
            }}
            value={selectedPeriod}
            size="small"
          >
            <Tab value="AM">
              <p className={clsx({ 'text-primary-gray-700': selectedPeriod === 'AM' })}>오전</p>
            </Tab>
            <Tab value="PM">
              <p className={clsx({ 'text-primary-gray-700': selectedPeriod === 'PM' })}>오후</p>
            </Tab>
          </LayeredTabs.TwoDepth>
        </div>
      </div>
      <div className="w-full border-t border-gray-200"></div>
      <footer className="flex w-full flex-row items-center justify-end gap-2 px-4">
        <ButtonV2 color="gray100" variant="solid" size={32} onClick={onCancel}>
          취소
        </ButtonV2>
        <ButtonV2 color="orange800" variant="solid" size={32} onClick={handleSave}>
          적용
        </ButtonV2>
      </footer>
    </div>
  );
};

export default ScheduleAndTimePicker;
