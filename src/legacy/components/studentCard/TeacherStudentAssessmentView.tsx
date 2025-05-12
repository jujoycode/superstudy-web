import { FC, useEffect } from 'react'
import { TeacherStudentAssessment } from '@/legacy/generated/model'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'

interface TeacherStudentAssessmentViewProps {
  teacherStudentAssessment?: TeacherStudentAssessment
  selectedTeacherIds: number[]
  setSelectedTeacherIds: (ids: number[]) => void
  goToUpdate: () => void
}

export const TeacherStudentAssessmentView: FC<TeacherStudentAssessmentViewProps> = ({
  teacherStudentAssessment,
  selectedTeacherIds,
  setSelectedTeacherIds,
  goToUpdate,
}) => {
  useEffect(() => {
    if (teacherStudentAssessment) {
      setSelectedTeacherIds(Object.keys(teacherStudentAssessment.keywords).map((el) => Number(el)))
    }
  }, [])
  return (
    <div>
      {teacherStudentAssessment?.keywords &&
        Object.entries(teacherStudentAssessment.keywords).map(([id, { keyword, reason }]) => (
          <label key={id} className="flex items-center space-x-2">
            <Checkbox
              checked={selectedTeacherIds.includes(Number(id))}
              onChange={() =>
                selectedTeacherIds.includes(Number(id))
                  ? setSelectedTeacherIds(selectedTeacherIds.filter((el) => el !== Number(id)))
                  : setSelectedTeacherIds(selectedTeacherIds.concat(Number(id)))
              }
            />
            <div>
              {keyword} : {reason}
            </div>
          </label>
        ))}
      {teacherStudentAssessment?.assessment && (
        <>
          <p className="mt-2 text-sm text-gray-500">교사 학생 평가 내용</p>
          <div className="mt-1 w-full rounded-lg border border-gray-300 p-2 whitespace-pre-line">
            {teacherStudentAssessment.assessment}
          </div>
        </>
      )}
      <Button.lg className="filled-primary mt-6 w-full" onClick={goToUpdate}>
        교사 학생 평가 수정하기
      </Button.lg>
    </div>
  )
}
