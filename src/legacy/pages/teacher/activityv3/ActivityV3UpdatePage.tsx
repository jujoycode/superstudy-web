import { useParams } from 'react-router'
import { useActivityV3FindOne } from '@/legacy/generated/endpoint'
import { ActivityV3AddPage } from './ActivityV3AddPage'

interface ActivityV3UpdatePageProps {}

export const ActivityV3UpdatePage: React.FC<ActivityV3UpdatePageProps> = () => {
  const { id } = useParams<{ id: string }>()
  const { data: activityv3 } = useActivityV3FindOne(Number(id))

  return <ActivityV3AddPage activityv3Data={activityv3} />
}
