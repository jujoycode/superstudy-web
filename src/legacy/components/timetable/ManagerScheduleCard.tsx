import { Link } from 'react-router-dom';
import { Manager } from 'src/types';

interface ManagerScheduleCardProps {
  manager: Manager;
  userRole: string;
}

export function ManagerScheduleCard({ manager, userRole }: ManagerScheduleCardProps) {
  let role = '담임';

  if (userRole === 'HEAD') {
    role = '학년부장';
  }
  if (userRole === 'PRINCIPAL') {
    role = '교무부장';
  }

  let text = <div className="text-sm text-red-500">{role} 승인 전</div>;

  switch (manager.managerStatus) {
    case 'BEFORE_PARENT_CONFIRM':
      text = <div className="text-sm text-red-500">학부모 승인 전</div>;
      break;
    case 'BEFORE_TEACHER_APPROVAL':
      text = <div className="text-sm text-red-500">담임 승인 전</div>;
      break;
    case 'BEFORE_HEAD_APPROVAL':
      text = <div className="text-sm text-red-500">학년부장 승인 전</div>;
      break;
    case 'BEFORE_PRINCIPAL_APPROVAL':
      text = <div className="text-sm text-red-500">교무부장 승인 전</div>;
      break;
    case 'PROCESSED':
      text = <div className="text-sm text-gray-600">승인 완료</div>;
      break;
    case 'RETURNED':
      text = <div className="text-sm text-brand-1">반려됨</div>;
      break;
    case 'DELETE_APPEAL':
      text = <div className="text-sm text-red-800">삭제 요청</div>;
      break;
  }
  return (
    <>
      <Link to={`/teacher/manager/${manager.id}`}>
        <div className="relative flex w-full items-center justify-between p-4">
          <div>
            <h3 className="text-lg font-semibold">학교 개교기념일</h3>
            <div className="text-xs text-gray-500">2021.10.01(금) {manager.reportedAt}</div>
          </div>
          <div></div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
      </Link>
    </>
  );
}
