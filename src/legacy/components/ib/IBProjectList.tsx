import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useIBGetByStudent } from '@/legacy/container/ib-project-get-student'
import { ResponseIBDto } from '@/legacy/generated/model'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '../icon/SVGIcon'

interface IBProjectListProps {
  studentId: number
  currentProjectId: number
  children: React.ReactNode
}

function IBProjectList({ studentId, currentProjectId, children }: IBProjectListProps) {
  const { data, isLoading } = useIBGetByStudent(studentId)
  const history = useHistory()
  const [open, setOpen] = useState<boolean>(false)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const handleProjectClick = (project: ResponseIBDto) => {
    let path = ''

    if (project.ibType.startsWith('CAS')) {
      path = `/ib/student/cas/${project.id}/plan`
    } else if (project.ibType.startsWith('EE')) {
      path = `/ib/student/ee/${project.id}`
    } else if (project.ibType === 'TOK_ESSAY') {
      path = `/ib/student/tok/essay/${project.id}`
    } else if (project.ibType === 'TOK_EXHIBITION') {
      path = `/ib/student/tok/exhibition/${project.id}`
    }

    if (path) {
      history.push(path)
      setOpen(false)
    }
  }

  const groupedProjects = data?.items.reduce(
    (acc, project) => {
      if (project.ibType.startsWith('CAS')) {
        acc.CAS.push(project)
      } else if (project.ibType.startsWith('EE')) {
        acc.EE.push(project)
      } else if (project.ibType.startsWith('TOK')) {
        acc.TOK.push(project)
      }
      return acc
    },
    { CAS: [], EE: [], TOK: [] } as Record<'CAS' | 'EE' | 'TOK', typeof data.items>,
  )

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setTooltipStyle({
        position: 'absolute',
        top: rect.bottom,
        left: rect.left,
        transform: 'none',
      })
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const tooltipRoot = document.getElementById('tooltip-root') || document.body
  const tooltipContent = open && (
    <div
      style={tooltipStyle}
      ref={tooltipRef}
      className={`border-primary-gray-200 z-100 mt-2 flex w-[632px] flex-col rounded-lg border shadow-[0px_0px_16px_0px_rgba(0,0,0,0.08)]`}
    >
      <div className={`relative flex w-[632px] flex-col rounded-xl bg-white p-1.5`}>
        {isLoading ? (
          <IBBlank type="section" />
        ) : (
          <>
            {groupedProjects &&
              Object.entries(groupedProjects).map(
                ([category, projects]) =>
                  projects.length > 0 && (
                    <div key={category} className="flex flex-col gap-3 px-2.5 py-1.5">
                      {/* 카테고리 태그 */}
                      <BadgeV2
                        color={category === 'CAS' ? 'navy' : category === 'EE' ? 'dark_green' : 'brown'}
                        size={24}
                        type="solid_strong"
                      >
                        {category}
                      </BadgeV2>

                      {/* 프로젝트 리스트 */}
                      <ul className="flex flex-col">
                        {projects.map((project) => {
                          const selectProject = project.id === currentProjectId
                          const casTitle =
                            project.ibType === 'CAS_PROJECT' ? `[프로젝트] ${project.title}` : `[일반] ${project.title}`
                          const approvedProposal = project.proposals?.find((proposal) => proposal.status === 'ACCEPT')

                          const tokTitle =
                            project.status === 'PENDING' || project.status === 'WAIT_MENTOR'
                              ? project.title
                              : project.ibType === 'TOK_ESSAY'
                                ? `[에세이] ${project.tokOutline?.themeQuestion}`
                                : `[전시회] ${project.tokExhibitionPlan?.themeQuestion}`

                          const displayTitle = project.ibType.startsWith('CAS')
                            ? casTitle
                            : project.ibType.startsWith('EE')
                              ? approvedProposal?.researchTopic || project.title
                              : tokTitle
                          const truncatedTitle =
                            displayTitle.length > 45 ? displayTitle.slice(0, 45) + '...' : displayTitle
                          return (
                            <div
                              key={project.id}
                              className="hover:bg-primary-gray-100 flex max-w-[600px] cursor-pointer items-center justify-between px-[10px] py-[6px] hover:rounded-lg"
                              onClick={() => handleProjectClick(project)}
                            >
                              <Typography
                                variant="body2"
                                className={`font-medium ${
                                  selectProject ? 'text-primary-orange-800' : ''
                                } max-w-[550px] overflow-hidden text-ellipsis whitespace-nowrap`}
                                title={displayTitle}
                              >
                                {truncatedTitle}
                              </Typography>
                              {selectProject && <SVGIcon.Check color="orange800" weight="bold" size={16} />}
                            </div>
                          )
                        })}
                      </ul>
                    </div>
                  ),
              )}
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="relative" ref={triggerRef}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {children}
      </div>
      {open && createPortal(tooltipContent, tooltipRoot)}
    </div>
  )
}

export default IBProjectList
