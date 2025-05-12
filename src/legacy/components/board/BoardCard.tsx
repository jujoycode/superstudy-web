import { useHistory, useLocation } from 'react-router-dom';
import { Board } from 'src/generated/model';
import { useLanguage } from 'src/hooks/useLanguage';
import { getNickName } from 'src/util/status';
import { Badge } from '../common';
import { Time } from '../common/Time';

interface BoardCardProps {
  board: Board;
  isNew?: boolean;
}

export function BoardCard({ board, isNew }: BoardCardProps) {
  const { push } = useHistory();
  const { pathname, search } = useLocation();
  const { t } = useLanguage();

  return (
    <>
      <div
        className={
          pathname === `/teacher/board/${board.id}` ? 'cursor-pointer bg-gray-50 px-6 py-4' : 'cursor-pointer px-6 py-4'
        }
        onClick={() => push(`/teacher/board/${board.id}${search}`)}
      >
        {/* PC */}
        <div className="hidden md:block">
          <div className="flex justify-between">
            <div className="space-x-2">
              <Badge
                children={t(`${board.category}`) || t('class_bulletin_board')}
                className="rounded-md bg-brand-1 text-brand-5"
              />
              {(board.toStudent || board.toParent) && (
                <Badge className="rounded-md bg-purple-100 text-purple-700">
                  {board.toStudent && t('student')} {board.toParent && t('parent')}
                </Badge>
              )}
            </div>
            <Time date={board.createdAt} />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="mt-2 whitespace-pre-line break-all text-lg font-semibold">{board.title}</div>
            <div className="min-w-max text-sm text-gray-500">
              {board.writer?.name}
              {getNickName(board.writer?.nickName)}
            </div>
          </div>
        </div>

        {/* mobile */}
        <div className="md:hidden">
          <div className="flex flex-col space-y-1 text-left">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Badge
                  children={t(`${board.category}`) || t('class_bulletin_board')}
                  className="rounded-md bg-brand-1 text-brand-5"
                />
                {(board.toStudent || board.toParent) && (
                  <Badge className="rounded-md bg-purple-100 text-purple-700">
                    {board.toStudent && t('student')} {board.toParent && t('parent')}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-lg font-bold text-grey-1">
              {board.title}{' '}
              {isNew && (
                <small className="inline-block h-6 w-6 rounded-full bg-red-500 text-center text-xs leading-6 text-white">
                  N
                </small>
              )}
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Time date={board.createdAt} />
              <div className="min-w-max text-sm text-gray-500">{board.writer?.name}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-0.5 w-full bg-gray-100"></div>
    </>
  );
}
