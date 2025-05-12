import React from 'react'
import { ActivitySession, StudentActivitySession } from '@/legacy/generated/model'
import { DocumentObject } from '@/legacy/types/document-object'
import type { ImageObject } from '@/legacy/types/image-object'
import { ActivitySessionDetailView } from './ActivitySessionDetailView'
import { StudentActivitySessionDetailView } from './StudentActivitySessionDetailView'
import { StudentActivitySessionSubmitView } from './StudentActivitySessionSubmitView'

interface ActivitySessionTeacherViewProps {
  activitySession: ActivitySession
  studentActivitySession?: StudentActivitySession
  page?: 'CREATE' | 'VIEW'
  dummyImages?: Map<number, ImageObject>
  dummyFiles?: Map<number, DocumentObject>
}

export const ActivitySessionTeacherView: React.FC<ActivitySessionTeacherViewProps> = ({
  activitySession,
  studentActivitySession,
  dummyImages,
  dummyFiles,
  page = 'VIEW',
}) => {
  return (
    <>
      <ActivitySessionDetailView
        activitySession={activitySession}
        studentActivitySession={studentActivitySession}
        dummyImages={dummyImages}
        dummyFiles={dummyFiles}
      />
      <div>
        <div className="h-0.5 bg-gray-100"></div>

        {page === 'VIEW' && (
          <StudentActivitySessionDetailView
            activitySession={activitySession}
            studentActivitySession={studentActivitySession}
          />
        )}
        {page === 'CREATE' && (
          <StudentActivitySessionSubmitView
            activitySession={activitySession}
            studentActivitySession={studentActivitySession}
            refetch={() => {}}
            readOnly
          />
        )}
      </div>
    </>
  )
}
