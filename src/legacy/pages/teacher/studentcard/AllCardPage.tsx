import { FC } from 'react'
import { useParams } from 'react-router'
import Groupv3InfoCard from '@/legacy/components/studentCard/Groupv3InfoCard'
import Parentv3InfoCard from '@/legacy/components/studentCard/Parentv3InfoCard'
import Studentv3InfoCard from '@/legacy/components/studentCard/Studentv3InfoCard'
import { TimeTableCard } from '@/legacy/components/studentCard/TimeTableCard'
import { useTeacherStudentCard } from '@/legacy/container/teacher-studentcard'

export const AllCardPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const { studentInfo } = useTeacherStudentCard(Number(id))

  return (
    <div className="scroll-box h-screen-12 md:h-screen-4 mt-4 overflow-y-auto pb-4">
      {/* Mobile V */}
      <div className="block md:hidden md:p-0">
        <Studentv3InfoCard id={Number(id)} />
        <Parentv3InfoCard
          parentInfo={studentInfo?.parents}
          studentId={studentInfo?.student.id}
          nokName={studentInfo?.student.nokName}
          nokPhone={studentInfo?.student.nokPhone}
        />
        <Groupv3InfoCard groupNames={studentInfo?.groupNames} />
        <TimeTableCard studentId={studentInfo?.student.id} />
      </div>

      {/* Desktop V */}
      <div className="hidden md:block">
        <div className="flex flex-col gap-4 2xl:flex-row">
          <div className="basis-2/3">
            <Studentv3InfoCard id={Number(id)} />
          </div>
          <div className="basis-1/3">
            <Parentv3InfoCard
              parentInfo={studentInfo?.parents}
              studentId={studentInfo?.student.id}
              nokName={studentInfo?.student.nokName}
              nokPhone={studentInfo?.student.nokPhone}
            />
          </div>
        </div>
        <Groupv3InfoCard groupNames={studentInfo?.groupNames} />
        <TimeTableCard studentId={Number(id)} />
      </div>
    </div>
  )
}
