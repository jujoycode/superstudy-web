import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { CounselingCard } from 'src/components/studentCard/CounselingCard';
import { GroupInfoCard } from 'src/components/studentCard/GroupInfoCard';
import { ParentInfoCard } from 'src/components/studentCard/ParentInfoCard';
import { StudentInfoCard } from 'src/components/studentCard/StudentInfoCard';
import { TimeTableCard } from 'src/components/studentCard/TimeTableCard';
import { useTeacherStudentCard } from 'src/container/teacher-studentcard';

export const BasicCardPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { studentInfo } = useTeacherStudentCard(Number(id));
  return (
    <div className="scroll-box mt-4 h-screen-12 overflow-y-auto pb-4 md:h-screen-4">
      <StudentInfoCard id={Number(id)} />
      <ParentInfoCard studentId={studentInfo?.student.id} parentInfo={studentInfo?.parents} />
      <GroupInfoCard groupNames={studentInfo?.groupNames} />
      <CounselingCard studentId={Number(id)} />
      <TimeTableCard studentId={Number(id)} />
    </div>
  );
};
