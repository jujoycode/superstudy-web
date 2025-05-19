import { useHistory } from '@/hooks/useHistory'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { Typography } from '@/legacy/components/common/Typography'
import { ResponseCoordinatorSelfCheckDtoType, ResponseIBDto, ResponseUserDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { DateFormat, DateUtil } from '@/legacy/util/date'

import { STATUS_GROUPS } from './TeacherIBStatus'
import ColorSVGIcon from '../icon/ColorSVGIcon'
import SolidSVGIcon from '../icon/SolidSVGIcon'
import SVGIcon from '../icon/SVGIcon'

interface ProjectCardProps {
  data: ResponseIBDto
  user: ResponseUserDto
  permission?: ResponseCoordinatorSelfCheckDtoType
}

export default function ProjectCard({ data, user, permission }: ProjectCardProps) {
  switch (data.ibType) {
    case 'CAS_NORMAL':
      return <CasProjectCard data={data} user={user} />
    case 'CAS_PROJECT':
      return <CasProjectCard data={data} user={user} />
    case 'EE':
      return <EeProjectCard data={data} user={user} permission={permission} />
    case 'TOK_EXHIBITION':
      return <TokExProjectCard data={data} user={user} />
    case 'TOK_ESSAY':
      return <TokEsProjectCard data={data} user={user} />
    default:
      return null
  }
}

function CasProjectCard({ data, user }: ProjectCardProps) {
  const { t } = useLanguage()
  const { push } = useHistory()
  const message = user.role === 'USER' ? data.studentShortNotice : data.teacherShortNotice
  return (
    <div
      className={`flex ${
        user.role === 'USER' ? 'h-[294px]' : 'h-[338px]'
      } w-[308px] cursor-pointer flex-col rounded-xl border border-gray-200 bg-white shadow-[0_4px_8px_0_rgb(244,246,248)]`}
    >
      {/* flag 영역 */}
      {user.role !== 'USER' && data.leader.studentGroup && (
        <div className="flex flex-row items-center justify-between border-b border-b-gray-100 px-5 py-2">
          <div className="flex flex-row items-center">
            <Typography variant="body3" className="text-gray-700">
              {data.leader.studentGroup.group.grade}
              {String(data.leader.studentGroup.group.klass).padStart(2, '0')}
              {String(data.leader.studentGroup.studentNumber).padStart(2, '0')}
            </Typography>
            <span className="mx-1">·</span>
            <Typography variant="body3" className="text-gray-700">
              {data.leader.name} {data.ibType === 'CAS_PROJECT' && data.members && `외 ${data.members?.length}명`}
            </Typography>
          </div>
          {data.status === 'WAIT_MENTOR' && data.mentor !== null && (
            <div className="flex flex-row items-center gap-1">
              <SVGIcon.Check color="orange800" size={12} weight="bold" />
              <Typography variant="caption" className="text-primary-800 font-medium">
                감독교사 요청함
              </Typography>
            </div>
          )}
          {data.status === 'WAIT_COMPLETE' && (
            <div className="flex flex-row items-center gap-1">
              <SVGIcon.Check color="orange800" size={12} weight="bold" />
              <Typography variant="caption" className="text-primary-800 font-medium">
                완료승인 요청함
              </Typography>
            </div>
          )}
        </div>
      )}
      <div className="flex w-[308px] flex-1 flex-col justify-between pt-5">
        <div className="flex flex-col px-5">
          <nav className="flex w-full flex-row items-center justify-between">
            <nav className="flex flex-row items-center gap-1">
              <BadgeV2 color="navy" size={24} type="solid_strong">
                CAS
              </BadgeV2>
              {data.cas?.strands.creativity && data.cas.strands.creativity > 0 ? <SolidSVGIcon.C size={24} /> : null}
              {data.cas?.strands.activity && data.cas.strands.activity > 0 ? <SolidSVGIcon.A size={24} /> : null}
              {data.cas?.strands.service && data.cas.strands.service > 0 ? <SolidSVGIcon.S size={24} /> : null}
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
              size={24}
              type="line"
            >
              {data.status === 'WAIT_PLAN_APPROVE' ? '보완완료' : t(`IBStatus.${data.status}`)}
            </BadgeV2>
          </nav>
          {/* info 영역 */}
          <main
            className="flex flex-col gap-3 py-6"
            onClick={() =>
              push(user.role !== 'USER' ? `/teacher/ib/cas/${data.id}/plan` : `/ib/student/cas/${data.id}/plan`)
            }
          >
            <Typography variant="title2" className="line-clamp-2">
              {data.ibType === 'CAS_NORMAL' ? '[일반]' : '[프로젝트]'}&nbsp;
              {data.title}
            </Typography>
            <div className="flex w-full flex-col gap-1">
              {data.status === 'PENDING' || data.status === 'WAIT_MENTOR' ? (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      활동기간
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.startAt && data.endAt
                        ? `${DateUtil.formatDate(
                            new Date(data.startAt),
                            DateFormat['YYYY.MM.DD'],
                          )} ~ ${DateUtil.formatDate(new Date(data.endAt), DateFormat['YYYY.MM.DD'])}`
                        : '-'}
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      감독교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.mentor ? `${data.mentor.name} 선생님` : '미정'}
                    </Typography>
                  </span>
                </>
              ) : (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      활동기간
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.startAt && data.endAt
                        ? `${DateUtil.formatDate(
                            new Date(data.startAt),
                            DateFormat['YYYY.MM.DD'],
                          )} ~ ${DateUtil.formatDate(new Date(data.endAt), DateFormat['YYYY.MM.DD'])}`
                        : '-'}
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      감독교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.mentor ? `${data.mentor.name} 선생님` : '미정'}
                    </Typography>
                  </span>
                </>
              )}
            </div>
          </main>
        </div>
        <footer className="flex flex-col border-t border-t-gray-100">
          {message && (
            <div className="flex flex-row items-center justify-between gap-3 px-5 py-3">
              <div className="flex flex-row items-center gap-1">
                <ColorSVGIcon.New color="orange800" size={16} />
                <Typography variant="caption" className="text-gray-700">
                  {message}
                </Typography>
              </div>
              <SVGIcon.Arrow size={12} color="gray700" rotate={180} />
            </div>
          )}
          <div className="flex flex-row items-center justify-between gap-3 border-t border-t-gray-100 px-5 py-4">
            <Typography variant="body3" className="font-medium">
              작성한 활동일지
            </Typography>
            <div className="mx-2 h-[1px] flex-1 border-t border-dashed border-gray-300"></div>
            <span
              className={`flex h-4 w-4 items-center justify-center rounded ${
                data.activityLog?.length === 0 ? 'bg-gray-500' : 'bg-primary-800'
              } text-11 px-1 py-px font-medium text-white`}
            >
              {data.activityLog ? data.activityLog.length : 0}
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
function EeProjectCard({ data, user }: ProjectCardProps) {
  const { t } = useLanguage()
  const { push } = useHistory()
  const approvedProposal = data.proposals?.find((proposal) => proposal.status === 'ACCEPT')
  const message = user.role === 'USER' ? data.studentShortNotice : data.teacherShortNotice

  const setTitle = () => {
    // 학생 화면에서 제출 전이거나 담당교사 지정대기 상태인 경우
    if (user.role === 'USER') {
      if (data.status === 'PENDING' || STATUS_GROUPS.담당교사_지정대기.includes(data.status)) {
        return 'EE 제안서'
      }
    }

    // 선생님 화면에서 제안서가 채택되지 않은 경우
    if (
      STATUS_GROUPS.담당교사_지정대기.includes(data.status) ||
      (data.status === 'WAIT_PLAN_APPROVE' && !approvedProposal)
    ) {
      return `${data.leader.name}의 EE 제안서`
    }

    // 채택된 제안서가 있는 경우
    return approvedProposal?.researchTopic
  }

  return (
    <div
      className={`flex ${
        user.role === 'USER' ? 'h-[294px]' : 'h-[338px]'
      } w-[308px] cursor-pointer flex-col rounded-xl border border-gray-200 bg-white shadow-[0_4px_8px_0_rgb(244,246,248)]`}
    >
      {/* flag 영역 */}
      {user.role !== 'USER' && data.leader.studentGroup && (
        <div className="flex flex-row items-center justify-between border-b border-b-gray-100 px-5 py-2">
          <div className="flex flex-row items-center">
            <Typography variant="body3" className="text-gray-700">
              {data.leader.studentGroup.group.grade}
              {String(data.leader.studentGroup.group.klass).padStart(2, '0')}
              {String(data.leader.studentGroup.studentNumber).padStart(2, '0')}
            </Typography>
            <span className="mx-1">·</span>
            <Typography variant="body3" className="text-gray-700">
              {data.leader.name}
            </Typography>
          </div>
          {data.status === 'WAIT_COMPLETE' && (
            <div className="flex flex-row items-center gap-1">
              <SVGIcon.Check color="orange800" size={12} weight="bold" />
              <Typography variant="caption" className="text-primary-800 font-medium">
                완료승인 요청함
              </Typography>
            </div>
          )}
        </div>
      )}
      <div className="flex w-[308px] flex-1 flex-col justify-between pt-5">
        <div className="px-5">
          <nav className="flex w-full flex-row items-center justify-between">
            <BadgeV2 color="dark_green" size={24} type="solid_strong" className="px-[12.5px]">
              EE
            </BadgeV2>
            <BadgeV2
              color={
                data.status === 'WAIT_PLAN_APPROVE' && approvedProposal
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
              size={24}
              type="line"
            >
              {data.status === 'WAIT_PLAN_APPROVE' && approvedProposal ? '보완완료' : t(`IBStatus.${data.status}`)}
            </BadgeV2>
          </nav>
          {/* info 영역 */}
          <main
            className="flex flex-col gap-3 py-6"
            onClick={() => push(user.role !== 'USER' ? `/teacher/ib/ee/${data.id}` : `/ib/student/ee/${data.id}`)}
          >
            <Typography variant="title2" className="line-clamp-2">
              {setTitle()}
            </Typography>
            <div className="flex w-full flex-col gap-1">
              {data.status === 'PENDING' && data.proposals && (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      1순위
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.proposals[0].subject}
                    </Typography>
                  </span>
                  {data.proposals.length > 1 && (
                    <span className="flex flex-row gap-1">
                      <Typography variant="body3" className="w-14 font-normal text-gray-500">
                        2순위
                      </Typography>
                      <Typography variant="body3" className="font-normal">
                        {data.proposals[1].subject}
                      </Typography>
                    </span>
                  )}
                </>
              )}

              {data.status === 'WAIT_MENTOR' && data.proposals && (
                <>
                  {data.proposals.length > 2 ? (
                    <>
                      <span className="flex flex-row gap-1">
                        <Typography variant="body3" className="w-14 font-normal text-gray-500">
                          후순위
                        </Typography>
                        <Typography variant="body3" className="font-normal">
                          -
                        </Typography>
                      </span>
                      <span className="flex flex-row gap-1">
                        <Typography variant="body3" className="w-14 font-normal text-gray-500">
                          지도교사
                        </Typography>
                        <Typography variant="body3" className="font-normal">
                          미정
                        </Typography>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex flex-row gap-1">
                        <Typography variant="body3" className="w-14 font-normal text-gray-500">
                          1순위
                        </Typography>
                        <Typography variant="body3" className="font-normal">
                          {data.proposals[0].subject}
                        </Typography>
                      </span>
                      {data.proposals.length > 1 && (
                        <span className="flex flex-row gap-1">
                          <Typography variant="body3" className="w-14 font-normal text-gray-500">
                            2순위
                          </Typography>
                          <Typography variant="body3" className="font-normal">
                            {data.proposals[1].subject}
                          </Typography>
                        </span>
                      )}
                    </>
                  )}
                </>
              )}

              {data.status === 'WAITING_FOR_NEXT_PROPOSAL' && data.proposals && (
                <>
                  {data.proposals.length > 2 ? (
                    <>
                      <span className="flex flex-row gap-1">
                        <Typography variant="body3" className="w-14 font-normal text-gray-500">
                          후순위
                        </Typography>
                        <Typography variant="body3" className="font-normal">
                          {data.proposals[2].subject}
                        </Typography>
                      </span>
                      <span className="flex flex-row gap-1">
                        <Typography variant="body3" className="w-14 font-normal text-gray-500">
                          지도교사
                        </Typography>
                        <Typography variant="body3" className="font-normal">
                          미정
                        </Typography>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex flex-row gap-1">
                        <Typography variant="body3" className="w-14 font-normal text-gray-500">
                          후순위
                        </Typography>
                        <Typography variant="body3" className="font-normal">
                          -
                        </Typography>
                      </span>
                      {data.proposals.length > 1 && (
                        <span className="flex flex-row gap-1">
                          <Typography variant="body3" className="w-14 font-normal text-gray-500">
                            지도교사
                          </Typography>
                          <Typography variant="body3" className="font-normal">
                            미정
                          </Typography>
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
              {data.status === 'REJECT_PLAN' && data.proposals && approvedProposal && (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      과목
                    </Typography>
                    {/* TODO 제안서 반려 시 반려된 과목 정보 불러오기 */}
                    <Typography variant="body3" className="font-normal">
                      {approvedProposal.subject}
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    {/* TODO 제안서 반려 시 지정된 멘토 정보 불러오기 */}
                    <Typography variant="body3" className="font-normal">
                      {data.mentor.name}&nbsp;선생님
                    </Typography>
                  </span>
                </>
              )}

              {data.status === 'IN_PROGRESS' && data.proposals && approvedProposal && (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      과목
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {approvedProposal.subject}
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.mentor.name}&nbsp;선생님
                    </Typography>
                  </span>
                </>
              )}

              {data.status === 'WAIT_COMPLETE' && data.proposals && approvedProposal && (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      과목
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {approvedProposal.subject}
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.mentor.name}&nbsp;선생님
                    </Typography>
                  </span>
                </>
              )}

              {data.status === 'WAIT_PLAN_APPROVE' && data.proposals && approvedProposal && (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      과목
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {approvedProposal.subject}
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.mentor.name}&nbsp;선생님
                    </Typography>
                  </span>
                </>
              )}

              {data.status === 'WAIT_PLAN_APPROVE' && data.proposals && !approvedProposal && (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      1순위
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.proposals[0].subject}
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.mentor.name}&nbsp;선생님
                    </Typography>
                  </span>
                </>
              )}
              {data.status === 'COMPLETE' && data.proposals && approvedProposal && (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      과목
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {approvedProposal.subject}
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.mentor.name}&nbsp;선생님
                    </Typography>
                  </span>
                </>
              )}
              {data.status === 'REJECT_COMPLETE' && data.proposals && approvedProposal && (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      과목
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {approvedProposal.subject}
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.mentor.name}&nbsp;선생님
                    </Typography>
                  </span>
                </>
              )}
            </div>
          </main>
        </div>
        {message && (
          <div className="flex flex-row items-center justify-between gap-3 border-t border-t-gray-100 px-5 py-3">
            <div className="flex flex-row items-center gap-1">
              <ColorSVGIcon.New color="orange800" size={16} />
              <Typography variant="caption" className="text-gray-700">
                {message}
              </Typography>
            </div>
            <SVGIcon.Arrow size={12} color="gray700" rotate={180} />
          </div>
        )}
      </div>
    </div>
  )
}
function TokExProjectCard({ data, user }: ProjectCardProps) {
  const { t } = useLanguage()
  const { push } = useHistory()

  const message = user.role === 'USER' ? data.studentShortNotice : data.teacherShortNotice
  return (
    <div
      className={`flex ${
        user.role === 'USER' ? 'h-[294px]' : 'h-[338px]'
      } w-[308px] cursor-pointer flex-col rounded-xl border border-gray-200 bg-white shadow-[0_4px_8px_0_rgb(244,246,248)]`}
    >
      {/* flag 영역 */}
      {user.role !== 'USER' && data.leader.studentGroup && (
        <div className="flex flex-row items-center justify-between border-b border-b-gray-100 px-5 py-2">
          <div className="flex flex-row items-center">
            <Typography variant="body3" className="text-gray-700">
              {data.leader.studentGroup.group.grade}
              {String(data.leader.studentGroup.group.klass).padStart(2, '0')}
              {String(data.leader.studentGroup.studentNumber).padStart(2, '0')}
            </Typography>
            <span className="mx-1">·</span>
            <Typography variant="body3" className="text-gray-700">
              {data.leader.name}
            </Typography>
          </div>
          {data.status === 'WAIT_COMPLETE' && (
            <div className="flex flex-row items-center gap-1">
              <SVGIcon.Check color="orange800" size={12} weight="bold" />
              <Typography variant="caption" className="text-primary-800 font-medium">
                완료승인 요청함
              </Typography>
            </div>
          )}
        </div>
      )}
      <div className="flex w-[308px] flex-1 flex-col justify-between pt-5">
        <div className="flex flex-col px-5">
          <nav className="flex w-full flex-row items-center justify-between">
            <BadgeV2 color="brown" size={24} type="solid_strong">
              TOK
            </BadgeV2>
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
              size={24}
              type="line"
            >
              {data.status === 'WAIT_PLAN_APPROVE' ? '보완완료' : t(`IBStatus.${data.status}`)}
            </BadgeV2>
          </nav>
          {/* info 영역 */}
          <main
            className="flex flex-col gap-3 py-6"
            onClick={() =>
              push(
                user.role !== 'USER'
                  ? `/teacher/ib/tok/exhibition/${data.id}`
                  : `/ib/student/tok/exhibition/${data.id}`,
              )
            }
          >
            <Typography variant="title2" className="line-clamp-2">
              {data.status === 'PENDING' || data.status === 'WAIT_MENTOR'
                ? data.title
                : `[전시회] ${data.tokExhibitionPlan?.themeQuestion}`}
            </Typography>
            <div className="flex w-full flex-col gap-1">
              {data.status === 'PENDING' || data.status === 'WAIT_MENTOR' ? (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      분류
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      기획안
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      미정
                    </Typography>
                  </span>
                </>
              ) : (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      분류
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      기획안
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.mentor ? `${data.mentor.name} 선생님` : '미정'}
                    </Typography>
                  </span>
                </>
              )}
            </div>
          </main>
        </div>
        {message && (
          <div className="flex flex-row items-center justify-between gap-3 border-t border-t-gray-100 px-5 py-3">
            <div className="flex flex-row items-center gap-1">
              <ColorSVGIcon.New color="orange800" size={16} />
              <Typography variant="caption" className="text-gray-700">
                {message}
              </Typography>
            </div>
            <SVGIcon.Arrow size={12} color="gray700" rotate={180} />
          </div>
        )}
      </div>
    </div>
  )
}
function TokEsProjectCard({ data, user }: ProjectCardProps) {
  const { t } = useLanguage()
  const { push } = useHistory()
  const message = user.role === 'USER' ? data.studentShortNotice : data.teacherShortNotice
  return (
    <div
      className={`flex ${
        user.role === 'USER' ? 'h-[294px]' : 'h-[338px]'
      } w-[308px] flex-col rounded-xl border border-gray-200 bg-white shadow-[0_4px_8px_0_rgb(244,246,248)]`}
    >
      {/* flag 영역 */}
      {user.role !== 'USER' && data.leader.studentGroup && (
        <div className="flex flex-row items-center justify-between border-b border-b-gray-100 px-5 py-2">
          <div className="flex flex-row items-center">
            <Typography variant="body3" className="text-gray-700">
              {data.leader.studentGroup.group.grade}
              {String(data.leader.studentGroup.group.klass).padStart(2, '0')}
              {String(data.leader.studentGroup.studentNumber).padStart(2, '0')}
            </Typography>
            <span className="mx-1">·</span>
            <Typography variant="body3" className="text-gray-700">
              {data.leader.name}
            </Typography>
          </div>
          {data.status === 'WAIT_COMPLETE' && (
            <div className="flex flex-row items-center gap-1">
              <SVGIcon.Check color="orange800" size={12} weight="bold" />
              <Typography variant="caption" className="text-primary-800 font-medium">
                완료승인 요청함
              </Typography>
            </div>
          )}
        </div>
      )}
      <div className="flex w-[308px] flex-1 flex-col justify-between pt-5">
        <div
          className="flex cursor-pointer flex-col px-5"
          onClick={() =>
            push(user.role !== 'USER' ? `/teacher/ib/tok/essay/${data.id}` : `/ib/student/tok/essay/${data.id}`)
          }
        >
          <nav className="flex w-full flex-row items-center justify-between">
            <BadgeV2 color="brown" size={24} type="solid_strong">
              TOK
            </BadgeV2>
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
              size={24}
              type="line"
            >
              {data.status === 'WAIT_PLAN_APPROVE' ? '보완완료' : t(`IBStatus.${data.status}`)}
            </BadgeV2>
          </nav>
          {/* info 영역 */}
          <main className="flex flex-col gap-3 py-6">
            <Typography variant="title2" className="line-clamp-2">
              {data.status === 'PENDING' || data.status === 'WAIT_MENTOR'
                ? data.title
                : `[에세이] ${data.tokOutline?.themeQuestion}`}
            </Typography>
            <div className="flex w-full flex-col gap-1">
              {data.status === 'PENDING' || data.status === 'WAIT_MENTOR' ? (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      분류
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      아웃라인
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      미정
                    </Typography>
                  </span>
                </>
              ) : (
                <>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      분류
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      아웃라인
                    </Typography>
                  </span>
                  <span className="flex flex-row gap-1">
                    <Typography variant="body3" className="w-14 font-normal text-gray-500">
                      지도교사
                    </Typography>
                    <Typography variant="body3" className="font-normal">
                      {data.mentor ? `${data.mentor.name} 선생님` : '미정'}
                    </Typography>
                  </span>
                </>
              )}
            </div>
          </main>
        </div>
        {message && (
          <div className="flex flex-row items-center justify-between gap-3 border-t border-t-gray-100 px-5 py-3">
            <div className="flex flex-row items-center gap-1">
              <ColorSVGIcon.New color="orange800" size={16} />
              <Typography variant="caption" className="text-gray-700">
                {message}
              </Typography>
            </div>
            <SVGIcon.Arrow size={12} color="gray700" rotate={180} />
          </div>
        )}
      </div>
    </div>
  )
}
