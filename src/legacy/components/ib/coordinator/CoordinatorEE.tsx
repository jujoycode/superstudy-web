import { useState } from 'react';
import { LayeredTabs, Tab } from 'src/components/common/LayeredTabs';
import Coordinator_Schedule from './Coordinator_Schedule';
import { IBPreference } from './CoordinatorTOK';
import Coordinator_Teacher from './ee/Coordinator_Teacher';
import CoordinatorEE_Eval from './ee/CoordinatorEE_Eval';
import FAQList from './FAQList';
import FormList from './FormList';

export default function CoordinatorEE() {
  const [EEType, setEEType] = useState<IBPreference>('FAQ');

  return (
    <main className="w-full">
      <header className="flex flex-row gap-3 py-5">
        <div>
          <LayeredTabs.ThirdDepth onChange={(selectedType: IBPreference) => setEEType(selectedType)} value={EEType}>
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
        {EEType === 'FAQ' && <FAQList type="IB_EE" />}
        {EEType === 'FORM' && <FormList type="EE_RPPF" />}
        {EEType === 'EVAL' && <CoordinatorEE_Eval />}
        {EEType === 'SCHEDULE' && <Coordinator_Schedule />}
        {EEType === 'TEACHER' && <Coordinator_Teacher />}
      </section>
    </main>
  );
}
