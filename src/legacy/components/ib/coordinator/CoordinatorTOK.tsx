import { useState } from 'react';
import { LayeredTabs, Tab } from 'src/components/common/LayeredTabs';
import Coordinator_Schedule from './Coordinator_Schedule';
import FAQList from './FAQList';
import CoordinatorTOK_Eval from './tok/CoordinatorTOK_Eval';
import { CoordinatorTOK_Question } from './tok/CoordinatorTOK_Question';
import CoordinatorTOK_Teacher from './tok/CoordinatorTOK_Teacher';

// TODO : 이미 등록된 타입 파일 찾을 시 변경 필요
export type IBPreference = 'FAQ' | 'FORM' | 'EVAL' | 'SCHEDULE' | 'TEACHER';

export default function CoordinatorTOK() {
  const [TOKType, setTOKType] = useState<IBPreference>('FAQ');

  return (
    <main className="w-full">
      <header className="flex flex-row gap-3 py-5">
        <div>
          <LayeredTabs.ThirdDepth onChange={(selectedType: IBPreference) => setTOKType(selectedType)} value={TOKType}>
            <Tab value="FAQ">
              <p className="text-[15px]">참고자료 및 FAQ</p>
            </Tab>
            <Tab value="FORM">
              <p className="text-[15px]">양식</p>
            </Tab>
            <Tab value="EVAL">
              <p className="text-[15px]">평가</p>
            </Tab>
            <Tab value="SCHEDULE">
              <p className="text-[15px]">일정 및 알림발송</p>
            </Tab>
            <Tab value="TEACHER">
              <p className="text-[15px]">담당교사 지정</p>
            </Tab>
          </LayeredTabs.ThirdDepth>
        </div>
      </header>
      <section className="flex flex-col">
        {TOKType === 'FAQ' && <FAQList type={'IB_TOK'} />}
        {TOKType === 'FORM' && <CoordinatorTOK_Question />}
        {TOKType === 'EVAL' && <CoordinatorTOK_Eval />}
        {TOKType === 'SCHEDULE' && <Coordinator_Schedule type="IB_TOK" />}
        {TOKType === 'TEACHER' && <CoordinatorTOK_Teacher />}
      </section>
    </main>
  );
}
