import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge, Blank } from 'src/components/common';
import { useActivityFindBySubject } from 'src/generated/endpoint';
import { Activity, ActivityType } from 'src/generated/model';
import { Time } from '../common/Time';

interface ActivitiesViewProps {
  groupId: number;
  loadActivitiesView: boolean;
  subjects: any;
  setUpdateState: () => void;
  subject?: string;
  searchWriter?: string;
  searchTitle?: string;
}

export function ActivitiesView({
  groupId,
  setUpdateState,
  subject,
  searchWriter = '',
  searchTitle,
}: ActivitiesViewProps) {
  const { pathname } = useLocation();
  const [activities, setActivities] = useState<Activity[]>([]);

  const { isLoading, error, refetch } = useActivityFindBySubject(subject || '', {
    query: {
      enabled: !!subject,
      onSuccess: (data) => {
        if (groupId) {
          data = data.filter((item) => {
            return item.groupActivities.some((activity) => activity.group.id === groupId);
          });
        }
        setActivities(data.sort((a, b) => b.id - a.id));
      },
    },
  });

  useEffect(() => {
    refetch();
  }, [groupId, subject]);

  if (error) return <div className="text-center">그룹 데이터를 불러오는 중 오류 발생</div>;
  if (!activities || activities.length === 0) return <div className="text-center">등록된 활동이 없습니다.</div>;

  return (
    <>
      {isLoading && <Blank reversed />}
      {activities
        ?.filter(
          (a) =>
            (subject ? subject == a.subject : true) &&
            (searchWriter === '' || (a && a.writer && a.writer.name && a.writer.name.includes(searchWriter))) &&
            (searchTitle === '' || (a && a.title && a.title.includes(searchTitle || ''))),
        )
        .map((activity) => (
          <div key={activity.id}>
            <div
              className={
                pathname.startsWith(`/teacher/activity/${activity.id}`) ||
                pathname.startsWith(`/teacher/activity/submit/${activity.id}`)
                  ? 'bg-gray-50 px-6 py-4'
                  : 'px-6 py-4'
              }
            >
              <div className="flex justify-between">
                <Badge children={activity.subject} className="bg-light_orange text-brand-1" />
                <Time date={activity.createdAt} />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="mt-2 text-lg font-semibold">{activity.title}</div>
                <div className="min-w-max text-sm text-gray-500">{activity.writer?.name}</div>
              </div>

              {activity?.endDate && (
                <div className="flex gap-1 text-sm font-normal text-red-400">
                  <span className="font-semibold">마감기한</span>
                  <Time date={activity.endDate} className="text-inherit" />
                  <span>까지</span>
                </div>
              )}
              <div className="mt-5 space-x-3">
                <Link to={`/teacher/activity/${activity.id}`}>
                  <button
                    children="상세보기"
                    onClick={() => setUpdateState()}
                    className={
                      pathname.startsWith(`/teacher/activity/${activity.id}`)
                        ? 'rounded-md border border-darkgray bg-darkgray px-4 py-2 text-sm text-white focus:outline-none'
                        : 'rounded-md border border-darkgray bg-white px-4 py-2 text-sm text-darkgray hover:bg-darkgray hover:text-white focus:outline-none'
                    }
                  />
                </Link>
                {activity.type !== ActivityType.NOTICE && (
                  <Link to={`/teacher/activity/submit/${activity.id}`}>
                    <button
                      children="제출자 보기"
                      className={
                        pathname.startsWith(`/teacher/activity/submit/${activity.id}`)
                          ? 'rounded-md border border-darkgray bg-darkgray px-4 py-2 text-sm text-white focus:outline-none'
                          : 'rounded-md border border-darkgray bg-white px-4 py-2 text-sm text-darkgray hover:bg-darkgray hover:text-white focus:outline-none'
                      }
                    />
                  </Link>
                )}

                {activity.type !== ActivityType.NOTICE && (
                  <Link to={`/teacher/activity/download/${activity.id}`}>
                    <button
                      children="다운로드"
                      className={
                        pathname.startsWith(`/teacher/activity/download/${activity.id}`)
                          ? 'rounded-md border border-darkgray bg-darkgray px-4 py-2 text-sm text-white focus:outline-none'
                          : 'rounded-md border border-darkgray bg-white px-4 py-2 text-sm text-darkgray hover:bg-darkgray hover:text-white focus:outline-none'
                      }
                    />
                  </Link>
                )}
              </div>
            </div>
            <div className="h-0.5 w-full bg-gray-100" />
          </div>
        ))}
    </>
  );
}
