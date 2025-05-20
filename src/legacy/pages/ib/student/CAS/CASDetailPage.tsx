import { useOutletContext } from 'react-router-dom'
import { Typography } from '@/legacy/components/common/Typography'
import ActivityPlan from '@/legacy/components/ib/cas/ActivityPlan'
import ProjectActivityPlan from '@/legacy/components/ib/cas/ProjectActivityPlan'
import { ResponseIBDto } from '@/legacy/generated/model'

interface CASDetailPageProps {
  data: ResponseIBDto
  refetch: () => void
  setEdit: (value: boolean) => void
}

export const CASDetailPage = () => {
  const { data, refetch, setEdit } = useOutletContext<CASDetailPageProps>()

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Typography variant="body1" className="text-gray-500">
          데이터를 불러올 수 없습니다.
        </Typography>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      {data.ibType === 'CAS_NORMAL' ? (
        <ActivityPlan data={data} refetch={refetch} setEdit={setEdit} />
      ) : data.ibType === 'CAS_PROJECT' ? (
        <ProjectActivityPlan data={data} refetch={refetch} setEdit={setEdit} />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Typography variant="body1" className="text-red-500">
            잘못된 IB 타입입니다.
          </Typography>
        </div>
      )}
    </div>
  )
}
