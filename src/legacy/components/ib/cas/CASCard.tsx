import { useHistory } from 'react-router-dom'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { Typography } from '@/legacy/components/common/Typography'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import { ResponseIBOnlyCasDto, ResponseUserDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { DateFormat, DateUtil } from '@/legacy/util/date'

interface CASCardProps {
  data: ResponseIBOnlyCasDto
  user: ResponseUserDto
}
function CASCard({ data, user }: CASCardProps) {
  const { t } = useLanguage()
  const { push } = useHistory()
  return (
    <div
      className={`border-primary-gray-200 box-border flex h-[198px] w-[256px] cursor-pointer flex-col rounded-xl border bg-white shadow-[0_4px_8px_0_rgb(244,246,248)]`}
    >
      <div className="flex h-[158px] flex-col gap-4 p-4">
        <nav className="box-border flex w-full flex-row items-center justify-between">
          <nav className="flex flex-row items-center gap-1">
            {data.cas?.strands.creativity && data.cas.strands.creativity > 0 ? <SolidSVGIcon.C size={16} /> : null}
            {data.cas?.strands.activity && data.cas.strands.activity > 0 ? <SolidSVGIcon.A size={16} /> : null}
            {data.cas?.strands.service && data.cas.strands.service > 0 ? <SolidSVGIcon.S size={16} /> : null}
          </nav>
          <BadgeV2
            color={
              data.status === 'WAIT_PLAN_APPROVE'
                ? 'blue'
                : data.status === 'IN_PROGRESS' || data.status === 'WAIT_COMPLETE'
                  ? 'blue'
                  : data.status === 'REJECT_MENTOR' ||
                      data.status === 'REJECT_PLAN' ||
                      data.status === 'REJECT_COMPLETE'
                    ? 'red'
                    : data.status === 'COMPLETE'
                      ? 'green'
                      : 'gray'
            }
            size={16}
            type="line"
          >
            {data.status === 'WAIT_PLAN_APPROVE' ? '보완완료' : t(`IBStatus.${data.status}`)}
          </BadgeV2>
        </nav>
        {/* info 영역 */}
        <main
          className="box-border flex flex-col gap-2"
          onClick={() =>
            push(user.role !== 'USER' ? `/teacher/ib/cas/${data.id}/plan` : `/ib/student/cas/${data.id}/plan`)
          }
        >
          <Typography variant="title3" className="line-clamp-2 overflow-hidden font-semibold break-words text-ellipsis">
            {data.ibType === 'CAS_NORMAL' ? '[일반]' : '[프로젝트]'}&nbsp;
            {data.title}
          </Typography>
          <div className="flex w-full flex-col gap-1">
            <span className="flex flex-row gap-1">
              <Typography variant="caption" className="text-primary-gray-500 w-14 font-normal">
                활동기간
              </Typography>
              <Typography variant="caption" className="font-normal">
                {data.startAt && data.endAt
                  ? `${DateUtil.formatDate(new Date(data.startAt), DateFormat['YYYY.MM.DD'])} ~ ${DateUtil.formatDate(
                      new Date(data.endAt),
                      DateFormat['YYYY.MM.DD'],
                    )}`
                  : '-'}
              </Typography>
            </span>
            <span className="flex flex-row gap-1">
              <Typography variant="caption" className="text-primary-gray-500 w-14 font-normal">
                감독교사
              </Typography>
              <Typography variant="caption" className="font-normal">
                {data.mentor ? `${data.mentor.name} 선생님` : '미정'}
              </Typography>
            </span>
          </div>
        </main>
      </div>
      <footer className="border-t-primary-gray-100 flex h-10 flex-row items-center justify-between gap-3 border-t px-4 py-3">
        <Typography variant="caption3" className="font-medium">
          작성한 활동일지
        </Typography>
        <div className="mx-2 h-[1px] flex-1 border-t border-dashed border-gray-300"></div>
        <span
          className={`flex h-4 w-4 items-center justify-center rounded ${
            data.activityLog?.length === 0 ? 'bg-primary-gray-500' : 'bg-primary-orange-800'
          } text-11 px-1 py-px font-medium text-white`}
        >
          {data.activityLog ? data.activityLog.length : 0}
        </span>
      </footer>
    </div>
  )
}

export default CASCard
