import { useLocation } from 'react-router';

interface StudentItemProps {
  studentid: number;
  studentname: string;
  groupId: number | string;
  klass: string;
  klassnum: string;
  onClick: () => void;
}

export function StudentItem({ studentid, studentname, klass, klassnum, onClick, groupId }: StudentItemProps) {
  const { pathname } = useLocation();
  return (
    <div
      className={
        pathname.startsWith(`/teacher/studentcard/${groupId}/${studentid}`)
          ? 'w-full cursor-pointer border-b border-gray-100 bg-gray-100 py-4'
          : 'w-full cursor-pointer border-b border-gray-100 py-4'
      }
      onClick={onClick}
    >
      <table className="w-full table-fixed">
        <tr>
          <td className="text-md pl-4 font-semibold">
            {studentname}
            {klass.padStart(2, '0')}
            {klassnum.toString().padStart(2, '0')}
          </td>
        </tr>
      </table>
    </div>
  );
}
