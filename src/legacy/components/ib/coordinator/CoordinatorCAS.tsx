import { useState } from 'react'

import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'

import { CoordinatorCAS_Question } from './cas/CoordinatorCAS_Question'
import CoordinatorCAS_Teacher from './cas/CoordinatorCAS_Teacher'
import Coordinator_Schedule from './Coordinator_Schedule'
import { IBPreference } from './CoordinatorTOK'
import FAQList from './FAQList'

export default function CoordinatorCAS() {
  const [CASType, setCASType] = useState<IBPreference>('FAQ')

  return (
    <main className="w-full">
      <header className="flex flex-row gap-3 py-5">
        <div>
          <LayeredTabs.ThirdDepth onChange={(selectedType: IBPreference) => setCASType(selectedType)} value={CASType}>
            <Tab value="FAQ">
              <p className="text-[15px]">참고자료 및 FAQ</p>
            </Tab>
            <Tab value="FORM">
              <p className="text-[15px]">양식</p>
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
        {CASType === 'FAQ' && <FAQList type="IB_CAS" />}
        {CASType === 'FORM' && <CoordinatorCAS_Question />}
        {CASType === 'SCHEDULE' && <Coordinator_Schedule type="IB_CAS" />}
        {CASType === 'TEACHER' && <CoordinatorCAS_Teacher />}
      </section>
    </main>
  )
}
