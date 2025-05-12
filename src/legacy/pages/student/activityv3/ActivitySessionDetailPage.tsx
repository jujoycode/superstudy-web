import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { ActivitySessionDetailView } from '@/legacy/components/activityv3/ActivitySessionDetailView'
import { StudentActivitySessionDetailView } from '@/legacy/components/activityv3/StudentActivitySessionDetailView'
import { StudentActivitySessionSubmitView } from '@/legacy/components/activityv3/StudentActivitySessionSubmitView'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { Constants } from '@/legacy/constants'
import {
  useActivitySessionFindOneByStudent,
  useStudentActivitySessionFindOneByStudent,
} from '@/legacy/generated/endpoint'
import { isPdfFile } from '@/legacy/util/file'

export function ActivitySessionDetailPage() {
  const { asid } = useParams<{ id: string; asid: string }>()
  const { data: activity } = useActivitySessionFindOneByStudent(Number(asid), {
    query: { enabled: !!asid },
  })

  const {
    data: studentActivity,
    isLoading,
    refetch,
  } = useStudentActivitySessionFindOneByStudent(
    { sessionId: Number(asid) },
    {
      query: { enabled: !!asid },
    },
  )
  const [submitView, setSubmitView] = useState(false)

  const viewerImages: ImageDecorator[] = []
  if (activity?.images) {
    for (const image of activity.images) {
      if (isPdfFile(image) == false) {
        viewerImages.push({
          src: `${Constants.imageUrl}${image}`,
        })
      }
    }
  }

  if (!activity)
    return (
      <>
        <TopNavbar title={'차시'} left={<BackButton />} /> <div className="w-full py-2 text-center">로딩중...</div>
      </>
    )

  return (
    <div className="scroll-box h-screen-4 absolute top-0 w-full overflow-y-scroll">
      <TopNavbar title={activity?.title || '차시'} left={<BackButton />} leftFlex="flex-1" rightFlex="flex-1" />
      {/* 선생님이 작성한 차시 정보 출력 컴포넌트 */}
      <ActivitySessionDetailView activitySession={activity} studentActivitySession={studentActivity} />
      <div className="h-0.5 bg-gray-100" />

      {/* 작성한 내용 여부에 따라 */}
      {!studentActivity || submitView ? (
        <StudentActivitySessionSubmitView
          activitySession={activity}
          studentActivitySession={studentActivity}
          refetch={() => {
            setSubmitView(false)
          }}
        />
      ) : (
        <StudentActivitySessionDetailView
          activitySession={activity}
          studentActivitySession={studentActivity}
          changeSubmitView={() => setSubmitView(true)}
          isLoading={isLoading}
          refetch={() => refetch()}
        />
      )}
    </div>
  )
}
