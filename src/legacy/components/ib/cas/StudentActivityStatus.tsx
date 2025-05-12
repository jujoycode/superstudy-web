import { useEffect, useMemo } from 'react'
import NODATA from 'src/assets/images/no-data.png'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { useGetIBProject } from '@/legacy/container/ib-project-get-filter'
import { ResponseIBCasDtoLearningOutcome, ResponseIBDto } from '@/legacy/generated/model'
import StudentActivityLearingOutcome from './StudentActivityLearingOutcome'
import StudentActivityRatio from './StudentActivityRatio'
import StudentActivityTimeline from './StudentActivityTimeline'
interface StudentActivityStatusProps {
  data: ResponseIBDto
  mentor?: string
}

function StudentActivityStatus({ data, mentor }: StudentActivityStatusProps) {
  const { data: projects, getIBProject, isLoading } = useGetIBProject()
  useEffect(() => {
    getIBProject({
      studentId: data.leader.id,
      ibTypes: 'CAS_NORMAL,CAS_PROJECT',
      statuses: 'IN_PROGRESS,REJECT_COMPLETE,WAIT_COMPLETE,COMPLETE',
    })
  }, [])

  const before = useMemo(() => {
    if (!projects) return { activity: 0, creativity: 0, service: 0 }

    return projects.items.reduce(
      (acc, project) => {
        const { strands } = project.cas || {}
        if (strands) {
          acc.activity += strands.activity || 0
          acc.creativity += strands.creativity || 0
          acc.service += strands.service || 0
        }
        return acc
      },
      { activity: 0, creativity: 0, service: 0 },
    )
  }, [projects])

  const after = useMemo(() => {
    const { strands } = data.cas || {}
    if (!strands) return before

    return {
      activity: before.activity + (strands.activity || 0),
      creativity: before.creativity + (strands.creativity || 0),
      service: before.service + (strands.service || 0),
    }
  }, [before, data])

  const learningOutcomes = useMemo(() => {
    if (!projects) return []

    const outcomeCounts: Record<keyof ResponseIBCasDtoLearningOutcome, number> = {
      ethicalChoices: 0,
      globalIssues: 0,
      initiativePlanning: 0,
      newSkills: 0,
      perseverance: 0,
      strengthsDevelopment: 0,
      teamworkBenefits: 0,
    }

    projects.items.forEach((project) => {
      const { learningOutcome } = project.cas || {}
      if (learningOutcome) {
        ;(Object.keys(outcomeCounts) as Array<keyof ResponseIBCasDtoLearningOutcome>).forEach((key) => {
          if (learningOutcome[key]) {
            outcomeCounts[key] += 1
          }
        })
      }
    })

    return Object.entries(outcomeCounts).map(([key, count]) => ({
      name: key,
      count,
    }))
  }, [projects])

  return (
    <div className="relative flex h-full flex-col gap-6">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <IBBlank type="section" />
        </div>
      )}
      <header className="flex flex-row items-center justify-between gap-4">
        <Typography variant="title1" className="font-bold">
          활동현황
        </Typography>
        <Typography variant="body3" className="text-primary-gray-700">
          희망 감독교사 · {mentor ? `${mentor} 선생님` : '미정'}
        </Typography>
      </header>
      <Typography variant="title3" className="bg-primary-orange-50 rounded-lg px-4 py-3 font-medium">
        {data.leader.studentGroup.group.grade}
        {String(data.leader.studentGroup.group.klass).padStart(2, '0')}
        {String(data.leader.studentGroup.studentNumber).padStart(2, '0')}
        &nbsp;{data.leader.name}
      </Typography>
      <main className="flex flex-col gap-5">
        <section className="flex flex-col gap-2">
          <Typography variant="body3" className="font-medium">
            활동비율
          </Typography>
          <StudentActivityRatio before={before} after={after} />
        </section>
        <section className="flex flex-col gap-2">
          <Typography variant="body3" className="font-medium">
            진행중인 7가지 학습성과
          </Typography>
          <StudentActivityLearingOutcome data={learningOutcomes} />
        </section>
        <section className="flex flex-col gap-2">
          <Typography variant="body3" className="font-medium">
            타임라인
          </Typography>
          {projects && projects.total > 0 ? (
            <StudentActivityTimeline data={projects?.items} user={data.leader} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 py-20">
              <div className="h-12 w-12 px-[2.50px]">
                <img src={NODATA} className="h-12 w-[43px] object-cover" />
              </div>
              <Typography variant="body2" className="text-center">{`활동현황이 없습니다.`}</Typography>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default StudentActivityStatus
