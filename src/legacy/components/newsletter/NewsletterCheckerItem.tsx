import { useLocation } from 'react-router';
import { ResponseChatAttendeeDto, StudentGroup } from 'src/generated/model';
import { cn } from 'src/lib/tailwind-merge';
import { useModals } from 'src/modals/ModalStack';
import { StudentModal } from 'src/modals/StudentModal';

interface NewsletterCheckerItemProps {
  filter: number;
  studentGroup: StudentGroup;
  studentNewsletter?: ResponseChatAttendeeDto;
  onClick: () => void;
  id: string;
}

export function NewsletterCheckerItem({
  filter,
  studentGroup,
  studentNewsletter,
  onClick,
  id,
}: NewsletterCheckerItemProps) {
  const { pathname } = useLocation();
  const { pushModal } = useModals();

  if (!studentNewsletter) return null;
  // 확인자
  if (filter === 1 && studentNewsletter) return null;
  if (filter === 2 && !studentNewsletter) return null;

  return (
    <div className="inline-block min-w-1/2-2 p-1 text-center">
      <div
        className={
          studentNewsletter?.id
            ? pathname.includes(`/teacher/activity/read/${id}/${studentNewsletter.id}`)
              ? 'flex items-center justify-between space-x-2 rounded-md border border-brand-1 bg-light_orange p-2'
              : 'flex items-center justify-between space-x-2 rounded-md border p-2'
            : 'flex items-center justify-between space-x-2 rounded-md border p-2'
        }
      >
        {/* {studentNewsletter?.isRead ? ( */}
        {!studentNewsletter ? (
          <div className="flex items-center">
            <span onClick={onClick} className="cursor-pointer rounded-md bg-brand-1 px-2 py-1 text-sm text-white">
              확인
            </span>
            <div className="ml-2 flex space-x-2">
              <span className="font-semibold">{studentGroup?.studentNumber}</span>
              <button onClick={() => pushModal(<StudentModal id={studentGroup.user.id} />)}>
                {studentGroup?.user.name}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <span
              onClick={onClick}
              className={cn(
                'cursor-pointer rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-500',
                pathname.startsWith(`/teacher/activity/read/${id}/${studentNewsletter}`) && 'border border-gray-200',
              )}
            >
              미확인
            </span>
            <div className="ml-2 flex space-x-2">
              <span className="font-semibold">{studentGroup?.studentNumber}</span>
              <button onClick={() => pushModal(<StudentModal id={studentGroup.user.id} />)}>
                {studentGroup?.user.name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
