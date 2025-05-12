import { useCoordinatorCheck } from 'src/container/ib-coordinator';
import { ResponseIBUserDto } from 'src/generated/model/responseIBUserDto';

/**
 * @param mentor 멘토 데이터
 * @param teacherId 선생님 id
 * @returns 멘토인지 아닌지, 코디네이터 권한 확인
 */
export const usePermission = (mentor: ResponseIBUserDto | null, teacherId: number) => {
  const { permission: coordinatorPermission } = useCoordinatorCheck();
  const permission = [];

  if (mentor) {
    permission.push(mentor.id === teacherId ? 'mentor' : 'notMentor');
  } else {
    permission.push('notMentor');
  }
  permission.push(coordinatorPermission);

  return permission;
};
