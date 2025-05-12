import { Typography } from 'src/components/common/Typography';
import SolidSVGIcon from 'src/components/icon/SolidSVGIcon';
import { ResponseIBDto, ResponseIBStudentDto } from 'src/generated/model';
import { DateFormat, DateUtil } from 'src/util/date';

interface StudentActivityTimelineProps {
  data: ResponseIBDto[];
  user: ResponseIBStudentDto;
}

const getLastDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

function StudentActivityTimeline({ data, user }: StudentActivityTimelineProps) {
  const startYear = user.studentGroup.group.grade === 2 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  // const startYear = new Date().getFullYear();
  const endYear = startYear + 1;
  const timelineStartDate = new Date(`${startYear}-03-01`);
  const timelineEndDate = new Date(`${endYear}-12-31`);
  const totalMonths =
    (timelineEndDate.getFullYear() - timelineStartDate.getFullYear()) * 12 +
    timelineEndDate.getMonth() -
    timelineStartDate.getMonth() +
    1;

  const calculatePositionUnified = (date: Date, timelineStartDate: Date, timelineEndDate: Date) => {
    const totalMonths =
      (timelineEndDate.getFullYear() - timelineStartDate.getFullYear()) * 12 +
      timelineEndDate.getMonth() -
      timelineStartDate.getMonth() +
      1;

    const totalOffset =
      (date.getFullYear() - timelineStartDate.getFullYear()) * 12 + date.getMonth() - timelineStartDate.getMonth();

    const dayPercentage = (date.getDate() - 1) / getLastDayOfMonth(date.getFullYear(), date.getMonth() + 1);

    return ((totalOffset + dayPercentage) / totalMonths) * 100;
  };

  const currentDate = new Date();
  const isCurrentInRange = currentDate >= timelineStartDate && currentDate <= timelineEndDate;
  const currentPercent = isCurrentInRange
    ? calculatePositionUnified(currentDate, timelineStartDate, timelineEndDate)
    : null;

  const projectHeight = 20;
  const projectGap = 8;
  const projectCount = data?.length ?? 0;
  const calculatedHeight = projectCount * projectHeight + (projectCount > 0 ? (projectCount - 1) * projectGap : 0);

  return (
    <div className="relative flex w-full flex-col gap-2 rounded-lg border border-primary-gray-200 px-4 pb-[7px] pt-4">
      {/* 텍스트 영역 */}
      <div className="flex w-full gap-3">
        <div className="flex min-w-[204px] flex-col gap-2 pb-[9px]">
          {data?.map((project, index) => (
            <div key={index} className="flex flex-row items-center gap-2">
              <Typography variant="body3" className="min-w-[140px] overflow-hidden truncate whitespace-nowrap">
                {project.title}
              </Typography>
              <span className="flex flex-row items-center gap-1">
                {project.cas?.strands.creativity && <SolidSVGIcon.C size={16} />}
                {project.cas?.strands.activity && <SolidSVGIcon.A size={16} />}
                {project.cas?.strands.service && <SolidSVGIcon.S size={16} />}
              </span>
            </div>
          ))}
          <Typography variant="caption3" className="flex h-5 items-center font-medium text-primary-gray-500">
            {`${DateUtil.formatDate(timelineStartDate, DateFormat['YYYY.MM.DD'])} ~ ${DateUtil.formatDate(
              timelineEndDate,
              DateFormat['YYYY.MM.DD'],
            )}`}
          </Typography>
        </div>

        <div className="scrollable relative h-full w-full px-1 pb-[9px]">
          {/* 기준선 */}
          <div className="absolute top-0 flex" style={{ height: `${calculatedHeight}px` }}>
            {Array.from({ length: 22 }, (_, i) => (
              <div
                key={i}
                className="relative"
                style={{
                  left: `${i * 16}px`,
                }}
              >
                <div
                  className={`absolute h-full w-[1px] -translate-x-1/2 transform ${
                    i === 0 || i === 21 ? 'bg-primary-gray-100' : ''
                  }`}
                  style={{
                    borderLeft: i === 0 || i === 21 ? 'none' : '1px dashed var(--Gray-200, #E8EAED)',
                  }}
                />
              </div>
            ))}
          </div>

          {/* 막대 그래프 */}
          <div className="flex flex-col gap-2">
            {data?.map((project, index) => {
              const startAtDate = new Date(project.startAt ?? timelineStartDate);
              const endAtDate = new Date(project.endAt ?? timelineEndDate);
              const totalDays = (timelineEndDate.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24);
              const startDays = (startAtDate.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24);
              const endDays = (endAtDate.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24);

              const startPixel = (startDays / totalDays) * 485;
              const endPixel = (endDays / totalDays) * 485;

              return (
                <div key={index} className="flex h-5 items-center">
                  <div className="relative z-10 h-2">
                    <div
                      className={`absolute h-full ${
                        project.startAt && project.endAt
                          ? 'rounded-[4px] border-dim-8 bg-gradient-navy-400'
                          : 'bg-primary-gray-200'
                      }`}
                      style={{
                        left: `${startPixel}px`,
                        width: `${endPixel - startPixel}px`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="relative flex h-5 w-full">
              {Array.from({ length: totalMonths }, (_, i) => {
                const currentMonth = new Date(timelineStartDate.getFullYear(), timelineStartDate.getMonth() + i, 1);
                const left = i * 16;

                return (
                  <div
                    key={i}
                    className="absolute w-4 text-center"
                    style={{ left: `${left}px`, transform: 'translateX(-50%)' }}
                  >
                    <Typography variant="body3" className="text-[11px] text-primary-gray-400">
                      {currentMonth.getMonth() + 1}
                    </Typography>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 현재 날짜 기준선 */}
          {isCurrentInRange && (
            <div
              className="absolute top-0 z-10 flex h-full w-[1px] bg-black"
              style={{
                left: `${(currentPercent || 0 / 100) * 485}px`,
                transform: 'translateX(-50%)',
              }}
            />
          )}
        </div>
      </div>
      <div
        className="pointer-events-none absolute right-4 top-0 z-10 w-6 bg-gradient-to-l from-white to-transparent"
        style={{ height: `${calculatedHeight}px` }}
      />
    </div>
  );
}

export default StudentActivityTimeline;
