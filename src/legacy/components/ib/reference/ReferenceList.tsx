import { format } from 'date-fns';
import { useHistory } from 'react-router-dom';
import { Typography } from 'src/components/common/Typography';
import { ResponseReferenceInfoDto, ResponseReferenceInfoDtoCategory } from 'src/generated/model';
import NODATA from 'src/assets/images/no-data.png';

interface EEReferenceListProps {
  data?: ResponseReferenceInfoDto[];
  type: ResponseReferenceInfoDtoCategory;
  user?: 'student' | 'teacher';
}

const referenceTitleMap: Record<ResponseReferenceInfoDtoCategory, string> = {
  IB_ALL: '공통 참고자료',
  IB_CAS: 'CAS 참고자료',
  IB_EE: 'EE 참고자료',
  IB_TOK: 'TOK 참고자료',
};

export default function ReferenceList({ data, type, user = 'student' }: EEReferenceListProps) {
  const { push } = useHistory();
  const headerTitle = referenceTitleMap[type] || '참고자료';
  return (
    <section className="flex h-[664px] flex-col">
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1">{headerTitle}</Typography>
      </header>
      <main>
        {data && data.length > 0 ? (
          <table className="w-full">
            <thead className="border-y border-y-primary-gray-100 text-[15px] font-medium text-primary-gray-500">
              <tr>
                <td className="w-[68px] py-[9px] pl-6 pr-2 text-center">번호</td>
                <td className="w-[956px] px-2 py-[9px] text-center">제목</td>
                <td className="w-[176px] py-[9px] pl-2 pr-6 text-center">수정일</td>
              </tr>
            </thead>
            <tbody>
              {data?.map((ref, index) => {
                return (
                  <tr key={ref.id} className="border-b border-b-primary-gray-100">
                    <td className="py-[11px] pl-6 pr-2 text-center">{index + 1}</td>
                    <td
                      className="max-w-[956px] cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap px-2 py-[11px] text-start"
                      onClick={() => {
                        if (user === 'student') {
                          push(`/ib/student/reference/${ref.id}`);
                        } else {
                          push(`/teacher/ib/reference/${ref.id}`);
                        }
                      }}
                    >
                      {ref.title}
                    </td>
                    <td className="py-[11px] pl-2 pr-6 text-center">{format(new Date(ref.updatedAt), 'yyyy.MM.dd')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <Typography variant="body2" className="text-center font-medium text-primary-gray-700">
              현재 등록된 자료가 없습니다.
            </Typography>
          </div>
        )}
      </main>
    </section>
  );
}
