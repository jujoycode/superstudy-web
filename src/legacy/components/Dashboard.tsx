import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import dashboard1 from 'src/assets/images/dashboard1.png';
import dashboard2 from 'src/assets/images/dashboard2.png';
import { ReactComponent as RightArrow } from 'src/assets/svg/mypage-right-arrow.svg';
import { useDashboard } from 'src/container/dashboard';
import { Role } from 'src/generated/model';
import { meState } from 'src/store';
import { dashboardNewItem } from 'src/types';

export function Dashboard() {
  const { push } = useHistory();
  const [showAll, setShowAll] = useState(false);
  const { dashboardItem } = useDashboard();

  const me = useRecoilValue(meState);

  const showParentInfo = me?.role === Role.PARENT && localStorage.getItem('parentNoticeShow') === null;

  return (
    <>
      {((dashboardItem && dashboardItem?.length > 0) || showParentInfo) && (
        <div className="bg-orange-3  pb-5 shadow-lg">
          <div className="flex justify-between px-5 pt-3">
            <div className="flex items-center space-x-2 pt-5">
              <div className=" text-lg font-bold"> 주요 알림을 확인하세요.</div>
            </div>
            <div className="flex">
              <img className="mx-auto h-auto w-auto pt-2" src={dashboard1} alt="" />
              <img className="mx-auto h-7 w-auto " src={dashboard2} alt="" />
            </div>
          </div>
          <div className="flex flex-col space-y-2 px-5">
            {showParentInfo && (
              <Link to={'/student/mypage'}>
                <div className="flex  w-full cursor-pointer items-center justify-between rounded-lg bg-white">
                  <div className="px-5 text-gray-800 ">
                    <span className="mb-0.5 mr-2 inline-block h-2 w-2 rounded-full bg-red-500"></span>
                    <span>상단에 표시된 자녀의 학교 정보를 조회할 수 있습니다.</span>
                    <br />
                    <span className="mb-0.5 mr-2 inline-block h-2 w-2 rounded-full bg-red-500"></span>
                    <span>
                      다자녀이거나 타학교로 전학/진학한 자녀의 보호자께서는 상단의{' '}
                      <span className="filled-primary rounded-md text-sm">자녀 선택</span> 버튼을 클릭하여 조회할 자녀를
                      선택하세요.
                    </span>
                  </div>
                </div>
              </Link>
            )}
            {dashboardItem &&
              dashboardItem.slice(0, showAll ? undefined : 3).map((item: dashboardNewItem, i) => (
                <Link key={i} to={item.url}>
                  <div className="radio flex h-12 w-full cursor-pointer items-center justify-between rounded-lg bg-white">
                    <div className="px-5 text-gray-800 ">
                      <span className="mb-0.5 mr-2 inline-block h-2 w-2 rounded-full bg-red-500"></span>
                      <span>{item.messagePre}</span>
                      <span className="font-bold underline">{item.count}</span>
                      <span>{item.messagePost}</span>
                    </div>
                    {item.url && <RightArrow />}
                  </div>
                </Link>
              ))}
          </div>

          {!showAll && dashboardItem && dashboardItem?.length > 3 && (
            <div
              className=" mx-5 mt-2 flex h-12 cursor-pointer items-center justify-center rounded-lg bg-orange-1 font-bold text-gray-500"
              onClick={() => setShowAll(true)}
            >
              더보기 +
            </div>
          )}
        </div>
      )}
    </>
  );
}
