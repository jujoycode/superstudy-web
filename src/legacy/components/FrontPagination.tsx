import { Link, useHistory } from 'react-router-dom';
import { ReactComponent as ArrowLeftIcon } from 'src/assets/svg/icon-arrow-left.svg';
import { ReactComponent as ArrowRightIcon } from 'src/assets/svg/icon-arrow-right.svg';

export interface FrontPaginationProps {
  basePath: string;
  total: number;
  limit: number;
  maxPageSetLength?: number;
  studentName?: string;
  page: number;
  setPage: (b: number) => void;
}

export function FrontPagination({
  basePath,
  total,
  limit = 25,
  maxPageSetLength = 10,
  studentName = '',
  page,
  setPage,
}: FrontPaginationProps) {
  const { push } = useHistory();
  const pageCount = Math.ceil(total / limit);
  const pageSet = Math.ceil(page / maxPageSetLength);
  const pageSetLength = Math.min(pageCount - (pageSet - 1) * maxPageSetLength, maxPageSetLength);
  const prevPage = (pageSet - 2) * pageSetLength + 1;
  const nextPage = pageSet * maxPageSetLength + 1;

  function range(length: number, start = 0) {
    return Array.from({ length }, (_, i) => i + start);
  }

  return (
    <div className="flex border-t p-1">
      <div className="max-w-container flex">
        {prevPage >= 1 && (
          <div className=" h-10 items-center space-x-4">
            <Link
              to={`${basePath}?page=${prevPage}&limit=${limit}%username=${studentName}`}
              className="grid h-10 w-8 place-items-center text-gray-500"
              onClick={() => setPage(prevPage)}
            >
              <ArrowLeftIcon />
            </Link>
          </div>
        )}

        <div className="flex">
          {range(pageSetLength, (pageSet - 1) * maxPageSetLength + 1).map((i) => (
            <Link
              key={i}
              to={`${basePath}?page=${i}&limit=${limit}%username=${studentName}`}
              className={`grid h-10 w-8 place-items-center text-gray-500 ${
                i === page ? 'border-t-2 border-gray-900 text-gray-900' : ''
              }`}
              onClick={() => setPage(i)}
            >
              {i}
            </Link>
          ))}
        </div>
        {nextPage <= pageCount && (
          <div className=" h-10 items-center space-x-4">
            <Link
              to={`${basePath}?page=${nextPage}&limit=${limit}%username=${studentName}`}
              className="grid h-10 w-8 place-items-center text-gray-500"
              onClick={() => setPage(nextPage)}
            >
              <ArrowRightIcon />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
