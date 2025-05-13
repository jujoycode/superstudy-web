import { format } from 'date-fns';
import _, { range } from 'lodash';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ActivityV3GPTModal } from 'src/components/activityv3/GPT/ActivityV3GPTModal';
import { Select } from 'src/components/common';
import { Button } from 'src/components/common/Button';
import { Checkbox } from 'src/components/common/Checkbox';
import { Icon } from 'src/components/common/icons';
import { ActivityV3Card } from 'src/components/studentCard/ActivityV3Card';
import { StudentRecordItem } from 'src/components/studentCard/StudentRecordItem';
import { ACTIVITYV3_TYPE_KOR } from 'src/constants/activityv3.enum';
import {
  useActivityV3FindStudentCard,
  useStudentActivityV3DownloadRecordSummary,
  useStudentCardFindStudent,
  useStudentRecordontrollerDownloadRecordSummary,
  useStudentRecordontrollerFindByStudentId,
} from 'src/generated/endpoint';
import { SubjectType } from 'src/generated/model';
import { meState } from 'src/store';
import { downloadExcel } from 'src/util/download-excel';
import { getThisYear } from 'src/util/time';

export const ActivityV3Page = () => {
  const { pathname } = useLocation();
  const { id } = useParams<{ id: string }>();
  const me = useRecoilValue(meState);

  const groupIdMatch = pathname.match(/\/teacher\/studentcard\/(\d+)/);
  const groupId = groupIdMatch ? groupIdMatch[1] : me?.klassGroupId || 0;

  const thisYear = +getThisYear();
  const _checkedCardIds = localStorage.getItem('checked_card_ids');

  const [year, setYear] = useState(new Date().getFullYear());
  const [subject, setSubject] = useState('');
  const [activityType, setActivityType] = useState<SubjectType>();
  const [openedCardIds, setOpenedCardIds] = useState<number[]>([]);
  const [open, setOpen] = useState(localStorage.getItem('is_record_modal_open') === 'true' ? true : false);
  const [coachmarkVisible, setCoachmarkVisible] = useState<boolean>(true);
  const [showDisabledActivity, setShowDisabledActivity] = useState<boolean>(false);
  const [showMyRecord, setShowMyRecord] = useState<boolean>(true);
  const [checkedCardIds, _setCheckedCardIds] = useState<number[]>(
    _checkedCardIds ? _checkedCardIds.split(',').map((el) => Number(el)) : [],
  );
  const setCheckedCardIds = (ids: number[]) => {
    _setCheckedCardIds(ids);
    localStorage.setItem('checked_card_ids', ids.join(','));
  };

  const { data: studentInfo } = useStudentCardFindStudent(Number(id), {
    query: {
      enabled: !!id,
    },
  });

  const { data: _activityV3s } = useActivityV3FindStudentCard(
    {
      studentId: Number(id),
      year,
    },
    {
      query: {
        enabled: !!id,
      },
    },
  );

  const { data: studentRecords, refetch } = useStudentRecordontrollerFindByStudentId(
    { studentId: Number(id) },
    {
      query: {
        onError: (err) => console.error(err),
      },
    },
  );
  useEffect(() => {
    const hasSeenCoachmark = localStorage.getItem('ACTIsFirst');
    if (hasSeenCoachmark) {
      setCoachmarkVisible(false);
    }
  }, []);

  const handleCoachmarkClose = () => {
    setCoachmarkVisible(false);
    localStorage.setItem('ACTIsFirst', 'not');
  };

  const handleCoachmarOpen = () => {
    setCoachmarkVisible(true);
    localStorage.removeItem('ACTIsFirst');
  };

  const activityV3s = _activityV3s?.filter((av3) => {
    if (subject) {
      return av3.subject === subject;
    }
    return true;
  });

  const { refetch: downloadSummary } = useStudentActivityV3DownloadRecordSummary(Number(groupId), {
    query: {
      enabled: false,
      onSuccess: (data) => {
        downloadExcel(data, `활동요약_총정리_${format(new Date(), 'yyyy_MM_dd_HH_mm')}`);
      },
    },
  });

  const { refetch: downloadRecord } = useStudentRecordontrollerDownloadRecordSummary(
    Number(groupId),
    {
      showMyRecord,
    },
    {
      query: {
        enabled: false,
        onSuccess: (data) => {
          downloadExcel(data, `활동기록_초안_총정리_${format(new Date(), 'yyyy_MM_dd_HH_mm')}`);
        },
      },
    },
  );

  const lectureAV3 =
    activityType && activityType !== SubjectType.LECTURE
      ? []
      : _.chain(activityV3s || [])
          .filter(['type', SubjectType.LECTURE])
          .sortBy(['subject'])
          .value();
  const activityAV3 =
    activityType && activityType !== SubjectType.ACTIVITY
      ? []
      : _.chain(activityV3s || [])
          .filter(['type', SubjectType.ACTIVITY])
          .sortBy(['subject'])
          .value();
  const etcAV3 =
    activityType && activityType !== SubjectType.ETC
      ? []
      : _.chain(activityV3s || [])
          .filter(['type', SubjectType.ETC])
          .sortBy(['subject'])
          .value();

  useEffect(() => {
    if (openedCardIds.length !== 0) {
      localStorage.setItem('openedCardIds', JSON.stringify(openedCardIds));
    }
  }, [openedCardIds]);

  useEffect(() => {
    if (openedCardIds.length === 0) {
      const openedCardIds = localStorage.getItem('openedCardIds') || '[]';
      setOpenedCardIds(JSON.parse(openedCardIds));
    }
  }, []);

  return (
    <>
      <div className="bg-gray relative mt-2 h-full w-auto border-t border-gray-300 py-4 pt-2">
        <div className="flex w-full items-center space-x-2">
          <Button.lg
            children="활동요약 다운로드"
            onClick={() => downloadSummary()}
            className="filled-primary hidden md:block"
          />
          <Button.lg
            children="활동기록 초안 다운로드"
            onClick={() => downloadRecord()}
            className="filled-primary hidden md:block"
          />
        </div>
        <div className="h-screen-7 space-y-4 overflow-y-scroll md:flex md:space-x-4 md:space-y-0 md:overflow-y-hidden md:p-4">
          <div className="flex w-full flex-col space-y-1 overflow-y-hidden rounded-xl border border-gray-300 bg-white p-4">
            <div className="flex w-full items-center space-x-2">
              <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {range(thisYear, thisYear - 3, -1).map((year) => (
                  <option value={year} key={year}>
                    {year}
                    학년도
                  </option>
                ))}
              </Select>
              <Select
                value={activityType}
                onChange={(e) => {
                  setActivityType(e.target.value as SubjectType);
                  setSubject('');
                }}
              >
                <option defaultChecked value={''}>
                  전체
                </option>
                {Object.keys(SubjectType).map((subjectType) => (
                  <option value={subjectType} key={subjectType}>
                    {ACTIVITYV3_TYPE_KOR[subjectType as SubjectType]}
                  </option>
                ))}
              </Select>
              <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option defaultChecked value={''}>
                  전체
                </option>
                {_.chain(_activityV3s)
                  .filter(activityType ? ['type', activityType] : () => true)
                  .map((av3) => av3.subject)
                  .uniq()
                  .map((subject) => (
                    <option value={subject} key={subject}>
                      {subject}
                    </option>
                  ))
                  .value()}
              </Select>
            </div>
            <label key={id} className="flex items-center space-x-2 py-1">
              <Checkbox
                checked={showDisabledActivity}
                onChange={() => setShowDisabledActivity(!showDisabledActivity)}
              />
              <div>비활성화된 활동 보기</div>
            </label>
            <div className="scroll-box w-full overflow-y-scroll" style={{ height: 'calc(90vh - 36px)' }}>
              <div className="mt-2 py-1 text-sm text-red-500">
                *활동 내역 (활동보고서/관찰기록/활동요약/차시정보) 중 하나가 있어야 활동기록 초안 작성을 위한 선택이
                가능합니다.
              </div>
              {!!lectureAV3?.length && <div className="mt-2 py-2 font-bold">교과활동</div>}
              <div className="flex flex-col space-y-2">
                {lectureAV3?.map((activityv3) => (
                  <ActivityV3Card
                    key={activityv3.id}
                    activityv3={activityv3}
                    studentId={Number(id)}
                    openedCardIds={openedCardIds}
                    setOpenedCardIds={setOpenedCardIds}
                    checkedCardIds={checkedCardIds}
                    setCheckedCardIds={setCheckedCardIds}
                    showDisabledActivity={showDisabledActivity}
                  />
                ))}
              </div>
              {!!activityAV3?.length && <div className="mt-4 py-2 font-bold">창체활동</div>}
              <div className="flex flex-col space-y-2">
                {activityAV3?.map((activityv3) => (
                  <ActivityV3Card
                    key={activityv3.id}
                    activityv3={activityv3}
                    studentId={Number(id)}
                    openedCardIds={openedCardIds}
                    setOpenedCardIds={setOpenedCardIds}
                    checkedCardIds={checkedCardIds}
                    setCheckedCardIds={setCheckedCardIds}
                    showDisabledActivity={showDisabledActivity}
                  />
                ))}
              </div>
              {!!etcAV3?.length && <div className="mt-4 py-2 font-bold">기타활동</div>}
              <div className="flex flex-col space-y-2">
                {etcAV3?.map((activityv3) => (
                  <ActivityV3Card
                    key={activityv3.id}
                    activityv3={activityv3}
                    studentId={Number(id)}
                    openedCardIds={openedCardIds}
                    setOpenedCardIds={setOpenedCardIds}
                    checkedCardIds={checkedCardIds}
                    setCheckedCardIds={setCheckedCardIds}
                    showDisabledActivity={showDisabledActivity}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col space-y-2 rounded-xl border border-gray-600 bg-white p-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex flex-row items-center gap-1">
                  <div className="text-18 font-bold">작성한 활동기록 초안</div>
                  <div
                    className="text-md flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-500 text-sm"
                    onClick={() => handleCoachmarOpen()}
                  >
                    ?
                  </div>
                </div>
                <Button.lg
                  className="filled-primary"
                  disabled={!checkedCardIds.length}
                  onClick={() => {
                    localStorage.setItem('is_record_modal_open', 'true');
                    setOpen(true);
                  }}
                >
                  작성하기
                </Button.lg>
              </div>
              <label className="flex items-center space-x-2">
                <Checkbox checked={showMyRecord} onChange={() => setShowMyRecord(!showMyRecord)} />
                <div>내가 작성한 초안 보기</div>
              </label>
            </div>
            <div className="scroll-box h-full overflow-y-scroll">
              {studentRecords
                ?.sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? 1 : -1))
                ?.filter((el) => !showMyRecord || el.writerId === me?.id)
                ?.map((record) => <StudentRecordItem key={record.id} record={record} refetch={() => refetch()} />)}
            </div>
          </div>
        </div>
      </div>

      {open && studentInfo && (
        <>
          <div className="fixed inset-0 z-10 bg-littleblack"></div>
          <div className="scroll-box fixed inset-x-0 inset-y-12 z-20 flex flex-col overflow-y-scroll rounded-3xl border border-gray-300 md:inset-x-6 md:inset-y-10 md:flex-row">
            <ActivityV3GPTModal
              activityV3s={_activityV3s}
              checkedCardIds={checkedCardIds}
              setCheckedCardIds={(cardIds: number[]) => setCheckedCardIds(cardIds)}
              onClose={() => {
                localStorage.removeItem('is_record_modal_open');
                setOpen(false);
              }}
              studentInfo={studentInfo}
              refetch={() => refetch()}
            />
          </div>
        </>
      )}
      {coachmarkVisible && (
        <>
          <div className="fixed inset-0 z-10 bg-littleblack"></div>
          <div className="scroll-box fixed inset-x-0 inset-y-12 z-20 flex flex-col overflow-y-scroll rounded-3xl border border-gray-300 md:inset-x-10 md:inset-y-10 md:flex-row">
            <div className="relative flex h-full w-full flex-row bg-white">
              <Icon.Close
                className="absolute right-6 top-4 cursor-pointer text-zinc-400"
                onClick={() => handleCoachmarkClose()}
              />
              <section className="flex h-full min-w-[65%] max-w-[500px] flex-col space-y-2 overflow-y-scroll rounded-l-lg bg-neutral-50 p-10">
                <img
                  src={'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_intro_1.png'}
                  className="h-auto w-full object-cover"
                />
              </section>
              <section className="flex h-full min-w-[35%] max-w-[400px] flex-col gap-10 overflow-y-scroll rounded-r-lg px-4 pb-6 pt-12 text-14">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-1 font-extrabold text-white">
                      1
                    </div>
                    <p className="font-bold">진로/진학 정보</p>
                  </div>
                  <div className="w-full">
                    <img
                      src={'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_1.png'}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-1 font-extrabold text-white">
                      2
                    </div>
                    <p className="font-bold">과목 정보</p>
                  </div>
                  <div className="w-full">
                    <img
                      src={'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_2.png'}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-1 font-extrabold text-white">
                      3
                    </div>
                    <p className="font-bold">성취 기준</p>
                  </div>
                  <div className="w-full">
                    <img
                      src={'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_3.png'}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-1 font-extrabold text-white">
                      4
                    </div>
                    <p className="font-bold">활동기록 정보</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-12 font-semibold">공통 문구</p>
                    <div className="w-full">
                      <img
                        src={
                          'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_4.png'
                        }
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-12 font-semibold">학생 활동 보고서</p>
                    <div className="w-full">
                      <img
                        src={
                          'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_5.png'
                        }
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-12 font-semibold">관찰 기록</p>
                    <div className="w-full">
                      <img
                        src={
                          'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_5.png'
                        }
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-12 font-semibold">활동 요약</p>
                    <div className="w-full">
                      <img
                        src={
                          'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_6.png'
                        }
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-12 font-semibold">차시 제출물</p>
                    <div className="w-full">
                      <img
                        src={
                          'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_7.png'
                        }
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-1 font-extrabold text-white">
                      5
                    </div>
                    <p className="font-bold">작성 유형</p>
                  </div>
                  <div className="w-full">
                    <img
                      src={'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_8.png'}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-1 font-extrabold text-white">
                      6
                    </div>
                    <p className="font-bold">활동</p>
                  </div>
                  <div className="w-full">
                    <img
                      src={'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_9.png'}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-1 font-extrabold text-white">
                      7
                    </div>
                    <p className="font-bold">성취 수준</p>
                  </div>
                  <div className="w-full">
                    <img
                      src={
                        'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_ui_10.png'
                      }
                      className="object-cover"
                    />
                  </div>
                </div>
                {/* <img
                  src={'https://kr.object.gov-ncloudstorage.com/superschool/production/tutorials/activity_intro_2.png'}
                  className="flex h-[2800px] w-[400px] items-center justify-center"
                /> */}
              </section>
            </div>
          </div>
        </>
      )}
    </>
  );
};
