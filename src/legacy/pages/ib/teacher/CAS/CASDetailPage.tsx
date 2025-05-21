import { useOutletContext } from 'react-router-dom'
import { Typography } from '@/legacy/components/common/Typography'
import ProjectActivityPlan from '@/legacy/components/ib/cas/ProjectActivityPlan'
import TeacherActivityPlan from '@/legacy/components/ib/cas/TeacherActivityPlan'
import { ResponseIBDto } from '@/legacy/generated/model'

interface CASDetailPageProps {
  data: ResponseIBDto
  refetch: () => void
  hasPermission: boolean
  setEdit: (value: boolean) => void
}

export const CASDetailPage = () => {
  const { data, refetch, setEdit, hasPermission } = useOutletContext<CASDetailPageProps>()

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
        <TeacherActivityPlan data={data} refetch={refetch} hasPermission={hasPermission} />
      ) : data.ibType === 'CAS_PROJECT' ? (
        <ProjectActivityPlan
          data={data}
          refetch={refetch}
          type="teacher"
          setEdit={setEdit}
          hasPermission={hasPermission}
        />
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
