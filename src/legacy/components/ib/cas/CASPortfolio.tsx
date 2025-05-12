import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import NODATA from 'src/assets/images/no-data.png';
import { PopupModal } from 'src/components/PopupModal';
import AlertV2 from 'src/components/common/AlertV2';
import { ButtonV2 } from 'src/components/common/ButtonV2';
import { IBBlank } from 'src/components/common/IBBlank';
import { RadioV2 } from 'src/components/common/RadioV2';
import { Typography } from 'src/components/common/Typography';
import { useIBPortfolioGetById } from 'src/container/ib-cas';
import { meState } from 'src/store';
import CASChart from './CASChart';
import CASPortfolioDataList from './CASPortfolioDataList';
import CASPortfolioTimeline from './CASPortfolioTimeline';
import CASProfile from './CASProfile';
import CASRefNInt from './CASRefNInt';
import { IbCASNormal } from './IbCASNormal';
import { IbCASProject } from './IbCASProject';

type ModalType = 'SELECT' | 'IBCAS' | 'IBPROJECT' | null;
type CategoryType = 'IBCAS' | 'IBPROJECT' | null;

export default function CASPortfolio() {
  const me = useRecoilValue(meState);
  const location = useLocation<{ alertMessage?: string }>();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const { data, refetch, isLoading } = useIBPortfolioGetById(me?.id || 0);

  const handleSuccess = (action: 'CAS_NORMAL' | 'CAS_PROJECT') => {
    setActiveModal(null);
    setSelectedCategory(null);
    switch (action) {
      case 'CAS_NORMAL':
        setAlertMessage(`CAS 일반 계획서가\n저장되었습니다`);
        break;
      case 'CAS_PROJECT':
        setAlertMessage(`CAS 프로젝트 계획서가\n저장되었습니다`);
        break;
    }
    refetch();
  };

  useEffect(() => {
    if (location.state?.alertMessage) {
      setAlertMessage(location.state.alertMessage);
    }
  }, [location.state]);

  if (me == null) {
    return <IBBlank />;
  }

  return (
    <div className="flex h-full flex-row gap-4 pt-6">
      {isLoading && <IBBlank />}
      <section className="flex w-[848px] flex-col gap-4">
        <article className="flex flex-col gap-6 rounded-xl bg-white p-6">
          <Typography variant="title1">활동비율 및 7가지 학습성과</Typography>
          <CASChart data={data} />
        </article>
        <article className="flex flex-col gap-6 rounded-xl bg-white p-6">
          <Typography variant="title1">타임라인</Typography>
          {data?.projects.length === 0 || data === undefined ? (
            <div className="flex flex-col items-center justify-center gap-6 py-20">
              <div className="h-12 w-12 px-[2.50px]">
                <img src={NODATA} className="h-12 w-[43px] object-cover" />
              </div>
              <Typography
                variant="body2"
                className="text-center"
              >{`진행중인 CAS 활동이 없습니다.\n활동을 생성해주세요.`}</Typography>
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => setActiveModal('SELECT')}>
                프로젝트 생성
              </ButtonV2>
            </div>
          ) : (
            <>
              <CASPortfolioTimeline data={data} />
              <CASPortfolioDataList data={data} user={me} />
            </>
          )}
        </article>
        <article className="flex flex-col gap-6 rounded-xl bg-white p-6">
          <CASRefNInt data={data} user={me} />
        </article>
      </section>
      <CASProfile data={data} me={me} refetch={refetch} />
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
      {activeModal === 'SELECT' && (
        <PopupModal
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          title={'활동 유형을 선택해주세요'}
          bottomBorder={false}
          footerButtons={
            <div className="flex gap-2">
              <ButtonV2
                variant="solid"
                color="orange800"
                size={48}
                onClick={() => setActiveModal(selectedCategory)}
                disabled={selectedCategory === null}
              >
                다음
              </ButtonV2>
            </div>
          }
        >
          <RadioV2.Group
            selectedValue={selectedCategory}
            onChange={(value: CategoryType) => setSelectedCategory(value)}
            className="flex flex-col gap-3"
          >
            <RadioV2.Box value="IBCAS" title="일반" />
            <RadioV2.Box value="IBPROJECT" title="프로젝트" />
          </RadioV2.Group>
        </PopupModal>
      )}
      {activeModal === 'IBCAS' && (
        <IbCASNormal
          modalOpen={true}
          handleBack={() => setActiveModal('SELECT')}
          onSuccess={handleSuccess}
          setModalClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'IBPROJECT' && (
        <IbCASProject
          modalOpen={true}
          handleBack={() => setActiveModal('SELECT')}
          onSuccess={handleSuccess}
          setModalClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
