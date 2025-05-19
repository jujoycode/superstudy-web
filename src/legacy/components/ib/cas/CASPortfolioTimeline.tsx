import { Typography } from '@/legacy/components/common/Typography'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import { ResponseIBPortfolioDto } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

interface CASPortfolioTimelineProps {
  data?: ResponseIBPortfolioDto
}

const getLastDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate()
}

function CASPortfolioTimeline({ data }: CASPortfolioTimelineProps) {
  const startYear =
    data?.profile.user.studentGroup.group.grade === 2 ? new Date().getFullYear() : new Date().getFullYear() - 1
  // const startYear = new Date().getFullYear();
  const endYear = startYear + 1
  const timelineStartDate = new Date(`${startYear}-03-01`)
  const timelineEndDate = new Date(`${endYear}-12-31`)
  const totalMonths =
    (timelineEndDate.getFullYear() - timelineStartDate.getFullYear()) * 12 +
    timelineEndDate.getMonth() -
    timelineStartDate.getMonth() +
    1

  const calculatePositionUnified = (date: Date, timelineStartDate: Date, timelineEndDate: Date) => {
    const totalMonths =
      (timelineEndDate.getFullYear() - timelineStartDate.getFullYear()) * 12 +
      timelineEndDate.getMonth() -
      timelineStartDate.getMonth() +
      1

    const totalOffset =
      (date.getFullYear() - timelineStartDate.getFullYear()) * 12 + date.getMonth() - timelineStartDate.getMonth()

    const dayPercentage = (date.getDate() - 1) / getLastDayOfMonth(date.getFullYear(), date.getMonth() + 1)

    return ((totalOffset + dayPercentage) / totalMonths) * 100
  }

  const currentDate = new Date()
  const isCurrentInRange = currentDate >= timelineStartDate && currentDate <= timelineEndDate
  const currentPercent = isCurrentInRange
    ? calculatePositionUnified(currentDate, timelineStartDate, timelineEndDate)
    : null

  const projectHeight = 20
  const projectGap = 8
  const projectCount = data?.projects?.length ?? 0
  const calculatedHeight = projectCount * projectHeight + (projectCount > 0 ? (projectCount - 1) * projectGap : 0)

  return (
    <div className="relative flex w-full flex-col gap-2">
      {/* 기준선 배경 */}
      <div className="flex w-full flex-row gap-6">
        <div className="w-[284px]"></div>
        <div className="absolute top-2 left-[308px] w-[500px] px-2" style={{ height: `${calculatedHeight}px` }}>
          <div className="relative flex h-full w-full justify-between">
            {Array.from({ length: 22 }, (_, i) => (
              <div className="relative" key={i}>
                <div className="absolute top-0 left-0 h-full w-[1px] -translate-x-1/2 transform bg-gray-100" />
              </div>
            ))}
          </div>
          {isCurrentInRange && (
            <div
              className="absolute top-0 z-30 flex h-full w-[1px] items-center justify-center bg-black"
              style={{
                left: `${currentPercent}%`,
                transform: 'translateX(-50%)',
              }}
            ></div>
          )}
        </div>
      </div>
      {data?.projects.map((project, index) => {
        const startAtDate = new Date(project.startAt ?? timelineStartDate)
        const endAtDate = new Date(project.endAt ?? timelineEndDate)
        endAtDate.setDate(getLastDayOfMonth(endAtDate.getFullYear(), endAtDate.getMonth() + 1))
        const startPercent = Math.max(0, calculatePositionUnified(startAtDate, timelineStartDate, timelineEndDate))
        const endPercent = Math.min(100, calculatePositionUnified(endAtDate, timelineStartDate, timelineEndDate))

        return (
          <div key={index} className="flex w-full flex-row items-center gap-6">
            <div className="flex min-w-[284px] flex-row items-center gap-2">
              <Typography variant="body3" className="max-w-[220px] truncate overflow-hidden whitespace-nowrap">
                {project.ibType === 'CAS_NORMAL' ? '[일반]' : '[프로젝트]'}&nbsp;
                {project.title}
              </Typography>
              <span className="flex flex-row items-center gap-1">
                {project.cas?.strands.creativity && project.cas.strands.creativity > 0 ? (
                  <SolidSVGIcon.C size={16} />
                ) : null}
                {project.cas?.strands.activity && project.cas.strands.activity > 0 ? (
                  <SolidSVGIcon.A size={16} />
                ) : null}
                {project.cas?.strands.service && project.cas.strands.service > 0 ? <SolidSVGIcon.S size={16} /> : null}
              </span>
            </div>

            <div className="relative z-10 ml-2 h-2 w-[485px]">
              <div
                className={`absolute h-full ${
                  project.startAt && project.endAt ? 'border-dim-8 bg-gradient-navy-400 rounded-[4px]' : 'bg-gray-200'
                }`}
                style={{
                  left: `${startPercent}%`,
                  width: `${endPercent - startPercent}%`,
                }}
              />
            </div>
          </div>
        )
      })}
      <div className="flex w-full flex-row gap-6">
        <div className="min-w-[284px]">
          <Typography variant="caption3" className="font-medium text-gray-500">{`${DateUtil.formatDate(
            new Date(timelineStartDate),
            DateFormat['YYYY.MM.DD'],
          )} ~ ${DateUtil.formatDate(new Date(timelineEndDate), DateFormat['YYYY.MM.DD'])}`}</Typography>
        </div>
        <div className="relative ml-2 flex w-full flex-row items-center">
          {Array.from({ length: totalMonths }, (_, i) => {
            const currentMonth = new Date(timelineStartDate.getFullYear(), timelineStartDate.getMonth() + i, 1)
            const left = (i / (totalMonths - 1)) * 100

            return (
              <div
                key={i}
                className="absolute w-4 text-center text-gray-400"
                style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
              >
                <Typography variant="caption3" className="text-gray-400">
                  {currentMonth.getMonth() + 1}
                </Typography>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CASPortfolioTimeline
