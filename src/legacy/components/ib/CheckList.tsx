import { useEffect, useState } from 'react';
import { useCheckListGetByStudent } from 'src/container/ib-checklist-find';
import { ChecklistLocation, ResponseIBStudentDto } from 'src/generated/model';
import { Check } from '../common/Check';
import { Input } from '../common/Input';
import { Typography } from '../common/Typography';

interface CheckListProps {
  studentId: number;
  type: 'create' | 'update';
  location: ChecklistLocation;
}

export function CheckList({ studentId, type, location }: CheckListProps) {
  const { CheckList, isLoading } = useCheckListGetByStudent(studentId, location);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  useEffect(() => {
    if (type === 'update' && CheckList) {
      const preselectedValues = CheckList.filter((item) => item.check).map((item) => item.id);
      setSelectedIds(preselectedValues);
    }
  }, [type, CheckList]);

  return (
    <section className="flex flex-col gap-4">
      <Check.Group selectedValues={selectedIds} className="flex flex-col gap-2">
        {CheckList?.map((item) => (
          <Check.BoxNB key={item.id} label={item.content} size={20} value={item.id} checked={item.check} disabled />
        ))}
      </Check.Group>
    </section>
  );
}

interface TeacherCheckListProps {
  charCount: number;
  student: ResponseIBStudentDto;
}

CheckList.Teacher = ({ charCount, student }: TeacherCheckListProps) => {
  const { CheckList, isLoading } = useCheckListGetByStudent(student.id, 'ESSAY');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (CheckList) {
      const preselectedValues = CheckList.filter((item) => item.check).map((item) => item.id);
      setSelectedIds(preselectedValues);
    }
  }, [CheckList]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-[6px] rounded-lg border border-primary-gray-200 bg-primary-gray-50 px-4 py-[6px]">
        <Typography variant="body3" className="font-semibold text-primary-gray-700">
          {student.studentGroup.group.grade}
          {String(student.studentGroup.group.klass).padStart(2, '0')}
          {String(student.studentGroup.studentNumber).padStart(2, '0')}
        </Typography>
        <span className="mx-1 text-primary-gray-400">·</span>
        <Typography variant="body3" className="font-semibold text-primary-gray-700">
          {student.name}
        </Typography>
      </div>
      <Check.Group selectedValues={selectedIds} className="flex cursor-default flex-col gap-2">
        {CheckList?.map((item) => (
          <Check.Box key={item.id} label={item.content} size={20} value={item.id} checked={item.check} disabled />
        ))}
      </Check.Group>
      <div className="flex flex-row items-center justify-between rounded-lg bg-primary-gray-50 px-4 py-3">
        <Typography variant="body3">사용 단어 수</Typography>
        <Input.Basic size={32} type="number" value={charCount} readonly />
      </div>
    </section>
  );
};
