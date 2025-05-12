import { FC } from 'react'
import { useParams } from 'react-router'
import { CounselingCard } from '@/legacy/components/studentCard/CounselingCard'
import { GroupInfoCard } from '@/legacy/components/studentCard/GroupInfoCard'
import { ParentInfoCard } from '@/legacy/components/studentCard/ParentInfoCard'
import { StudentInfoCard } from '@/legacy/components/studentCard/StudentInfoCard'
import { TimeTableCard } from '@/legacy/components/studentCard/TimeTableCard'
import { useTeacherStudentCard } from '@/legacy/container/teacher-studentcard'

export const BasicCardPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const { studentInfo } = useTeacherStudentCard(Number(id))
  return (
    <div className="scroll-box h-screen-12 md:h-screen-4 mt-4 overflow-y-auto pb-4">
      <StudentInfoCard id={Number(id)} />
      <ParentInfoCard studentId={studentInfo?.student.id} parentInfo={studentInfo?.parents} />
      <GroupInfoCard groupNames={studentInfo?.groupNames} />
      <CounselingCard studentId={Number(id)} />
      <TimeTableCard studentId={Number(id)} />
    </div>
  )
}
