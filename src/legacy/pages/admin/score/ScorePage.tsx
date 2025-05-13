import { useState } from 'react'

import { Admin } from '@/legacy/components/common/Admin'
import { AcademicRecordsComponent } from '@/legacy/components/score/AcademicRecordsComponent'
import { ExamScoresComponent } from '@/legacy/components/score/ExamScoresComponent'

type ScoreType = 'ACADEMIC' | 'MOCK'

export function ScorePage() {
  const [type, setType] = useState<ScoreType>('ACADEMIC')

  return (
    <main className="scroll-box flex h-full w-full flex-col overflow-auto bg-[#eaf2fe] p-14">
      <Admin.Box className="flex items-center justify-between pb-10">
        <Admin.H2 className="pt-4 text-2xl font-bold">성적관리</Admin.H2>
        <nav className="flex h-10 items-center rounded-lg bg-[#e1e9f3] text-center text-[15px] font-bold text-[#111111]">
          <button
            onClick={() => setType('ACADEMIC')}
            className={`min-w-[120px] flex-1 rounded-lg whitespace-nowrap ${type === 'ACADEMIC' && 'bg-white'} h-full`}
          >
            내신
          </button>
          <button
            onClick={() => setType('MOCK')}
            className={`min-w-[120px] flex-1 rounded-lg whitespace-nowrap ${type === 'MOCK' && 'bg-white'} h-full`}
          >
            모의고사
          </button>
        </nav>
      </Admin.Box>
      <section>
        {type === 'ACADEMIC' && <AcademicRecordsComponent />}
        {type === 'MOCK' && <ExamScoresComponent />}
      </section>
    </main>
  )
}
