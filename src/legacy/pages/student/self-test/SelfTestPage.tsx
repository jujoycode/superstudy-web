import { useState } from 'react'

import { BackButton, Blank, TopNavbar } from '@/legacy/components/common'
import { StudentSelfAssessmentUpdate } from '@/legacy/components/studentCard/StudentSelfAssessmentUpdate'
import { StudentSelfAssessmentView } from '@/legacy/components/studentCard/StudentSelfAssessmentView'
import { useStudentSelfAssessmentFindMyAssessment } from '@/legacy/generated/endpoint'

export const SelfTestPage = () => {
  const { data: studentSelfAssessment, isLoading } = useStudentSelfAssessmentFindMyAssessment()

  const [view, setView] = useState('view')

  return (
    <>
      {isLoading && <Blank />}
      <TopNavbar
        title="자기 평가"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <div className="flex flex-col space-y-4 p-6">
        <h1 className="text-gray-600">
          학생의 행동특성에 대한 기록를 위한 자기평가입니다. 본인과 담임선생님만 확인이 가능합니다.
        </h1>
        {view === 'view' && (
          <StudentSelfAssessmentView
            studentSelfAssessment={studentSelfAssessment}
            goToUpdate={() => setView('update')}
          />
        )}
        {view === 'update' && (
          <StudentSelfAssessmentUpdate studentSelfAssessment={studentSelfAssessment} goToView={() => setView('view')} />
        )}
      </div>
    </>
  )
}
