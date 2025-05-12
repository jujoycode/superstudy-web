import { FC } from 'react';
import { StudentSelfAssessment } from 'src/generated/model';
import { Label } from '../common';
import { Button } from '../common/Button';

interface StudentSelfAssessmentViewProps {
  studentSelfAssessment?: StudentSelfAssessment;
  goToUpdate: () => void;
}

export const StudentSelfAssessmentView: FC<StudentSelfAssessmentViewProps> = ({
  studentSelfAssessment,
  goToUpdate,
}) => {
  return (
    <div>
      <Label.Text children="선택단어/근거" />
      <div className="mt-1 flex flex-col space-y-2">
        {studentSelfAssessment?.keywords &&
          Object.entries(studentSelfAssessment.keywords).map(([id, { keyword, reason }]) => (
            <div>
              {keyword} : {reason}
            </div>
          ))}
      </div>
      {studentSelfAssessment?.assessment && (
        <>
          <p className="mt-2 text-sm text-gray-500">자기 평가 내용</p>
          <div className="mt-1 w-full whitespace-pre-line rounded-lg border border-gray-300 p-2">
            {studentSelfAssessment.assessment}
          </div>
        </>
      )}
      <Button.lg className="filled-primary mt-6 w-full" onClick={goToUpdate}>
        자기 평가 수정하기
      </Button.lg>
    </div>
  );
};
