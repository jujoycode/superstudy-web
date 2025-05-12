import { useParams } from 'react-router'
import { useActivitySessionFindOne } from '@/legacy/generated/endpoint'
import { ActivityV3SessionAddPage } from './ActivityV3SessionAddPage'

interface ActivityV3SessionUpdatePageProps {}

export const ActivityV3SessionUpdatePage: React.FC<ActivityV3SessionUpdatePageProps> = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data: activitySession } = useActivitySessionFindOne(Number(sessionId))

  return <ActivityV3SessionAddPage activitySessionData={activitySession} />
}
