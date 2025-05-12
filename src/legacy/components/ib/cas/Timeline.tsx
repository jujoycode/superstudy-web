import { BadgeV2 } from 'src/components/common/BadgeV2';
import { Typography } from 'src/components/common/Typography';
import ColorSVGIcon from 'src/components/icon/ColorSVGIcon';
import SolidSVGIcon from 'src/components/icon/SolidSVGIcon';
import { ResponseIBDto } from 'src/generated/model';
import { DateFormat, DateUtil } from 'src/util/date';

interface TimelineProps {
  data: ResponseIBDto;
}

const MONTHS_IN_A_YEAR = 12;

const getLastDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const Timeline = ({ data }: TimelineProps) => {
  const startYear =
    data.leader.studentGroup.group.grade === 2 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  // const startYear = data.startAt ? new Date(data.startAt ?? '').getFullYear() : new Date().getFullYear();
  const endYear = startYear + 1;

  const timelineStartDate = new Date(`${startYear}-03-01`);
  const timelineEndDate = new Date(`${endYear}-12-31`);
  const totalMonths =
    (timelineEndDate.getFullYear() - timelineStartDate.getFullYear()) * MONTHS_IN_A_YEAR +
    timelineEndDate.getMonth() -
    timelineStartDate.getMonth() +
    1;

  const startAtDate = new Date(data.startAt ?? timelineStartDate);
  const endAtDate = new Date(data.endAt ?? timelineEndDate);

  endAtDate.setDate(getLastDayOfMonth(endAtDate.getFullYear(), endAtDate.getMonth() + 1));

  const calculatePosition = (date: Date) => {
    const totalOffset =
      (date.getFullYear() - timelineStartDate.getFullYear()) * MONTHS_IN_A_YEAR +
      date.getMonth() -
      timelineStartDate.getMonth();
    const dayPercentage = date.getDate() / getLastDayOfMonth(date.getFullYear(), date.getMonth() + 1);
    return ((totalOffset + dayPercentage) / totalMonths) * 100;
  };

  const timelineYears = Array.from(
    { length: timelineEndDate.getFullYear() - timelineStartDate.getFullYear() + 1 },
    (_, i) => timelineStartDate.getFullYear() + i,
  );

  const startPercent = Math.max(0, calculatePosition(startAtDate));
  const endPercent = Math.min(100, calculatePosition(endAtDate));

  // 현재 날짜 계산
  const currentDate = new Date();
  const isCurrentInRange = currentDate >= timelineStartDate && currentDate <= timelineEndDate;
  const currentPercent = isCurrentInRange ? calculatePosition(currentDate) : null;

  return (
    <main className="flex w-full flex-row items-center justify-between gap-4 rounded-xl border border-primary-gray-100 bg-primary-gray-50 p-5">
      <div className="flex w-[264px] min-w-[264px] shrink-0 flex-col gap-2">
        <span className="flex flex-row items-center gap-1">
          {data.cas?.strands.activity || data.cas?.strands.activity || data.cas?.strands.service ? (
            <>
              {data.cas?.strands.creativity && data.cas.strands.creativity > 0 ? <SolidSVGIcon.C size={24} /> : null}
              {data.cas?.strands.activity && data.cas.strands.activity > 0 ? <SolidSVGIcon.A size={24} /> : null}
              {data.cas?.strands.service && data.cas.strands.service > 0 ? <SolidSVGIcon.S size={24} /> : null}
            </>
          ) : (
            <BadgeV2 color="gray" size={20} type="line">
              입력전
            </BadgeV2>
          )}
        </span>
        <Typography variant="body3" className="text-primary-gray-700">
          {data.startAt && data.endAt
            ? `${DateUtil.formatDate(new Date(data.startAt), DateFormat['YYYY.MM.DD'])} ~ ${DateUtil.formatDate(
                new Date(data.endAt),
                DateFormat['YYYY.MM.DD'],
              )}`
            : '-'}
        </Typography>
      </div>
      {/* 타임라인 영역 */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex h-6 items-center">
          {/* 막대 영역 */}
          <div className="relative h-2 w-full">
            <div
              className={`absolute h-full rounded-sm ${
                data.startAt && data.endAt ? 'border-dim-8 bg-gradient-navy-400' : 'bg-primary-gray-200'
              }`}
              style={{
                left: `${startPercent}%`,
                width: `${endPercent - startPercent}%`,
              }}
            ></div>

            {/* 현재 월에 해당하는 아이콘 */}
            {isCurrentInRange && (
              <div
                className="absolute -top-2 flex items-center justify-center"
                style={{
                  left: `${currentPercent}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <ColorSVGIcon.Pin size={24} color="gray700" />
              </div>
            )}
          </div>
        </div>

        {/* 연도와 월 출력 */}
        <div className="flex">
          {timelineYears.map((year) => (
            <div key={year}>
              <div className="flex">
                {Array.from({ length: MONTHS_IN_A_YEAR }, (_, i) => i + 1).map((month) => {
                  const isWithinRange =
                    new Date(`${year}-${month.toString().padStart(2, '0')}-01`) >= timelineStartDate &&
                    new Date(`${year}-${month.toString().padStart(2, '0')}-01`) <= timelineEndDate;

                  return isWithinRange ? (
                    <Typography variant="body3" key={`${year}-${month}`} className="w-11 text-primary-gray-400">
                      {month}
                    </Typography>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Timeline;
