// P-T-012 : 코디선생님 프로젝트 메인 화면
// /teacher/ib/coordinatorPage
// https://www.notion.so/superschoolofficial/P-T-012-126e90ac0a99800e94d4da062bdc5417
import { useParams } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { Typography } from '@/legacy/components/common/Typography'
import CoordinatorCAS from '@/legacy/components/ib/coordinator/CoordinatorCAS'
import CoordinatorEE from '@/legacy/components/ib/coordinator/CoordinatorEE'
import CoordinatorIB from '@/legacy/components/ib/coordinator/CoordinatorIB'
import CoordinatorTOK from '@/legacy/components/ib/coordinator/CoordinatorTOK'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { useIBCoordinatorGetCoordinatorPermission } from '@/legacy/generated/endpoint'

type ProjectType = 'IB' | 'CAS' | 'EE' | 'TOK'

export const CoordinatorPage = () => {
  const { replace } = useHistory()

  const { type } = useParams<{ type: ProjectType }>()

  const { data } = useIBCoordinatorGetCoordinatorPermission()

  const myIBType = data?.type || 'UNAUTHORIZED'

  const avaliableIBCategories = ['IB', 'CAS', 'EE', 'TOK'].filter(
    (el) => myIBType !== 'UNAUTHORIZED' && (myIBType === 'IB_ALL' || myIBType.includes(el)),
  )

  return (
    <div className="col-span-6">
      <div className="h-screen w-full">
        <div className="">
          <IBLayout
            topContent={
              <div>
                <div className="w-full pt-16">
                  <div className="float-right mb-3">
                    <Breadcrumb
                      data={{
                        '프로젝트 관리': '/teacher/ib/coordinatorPage/EE',
                      }}
                    />
                  </div>
                  <div className="mb-6 flex h-10 w-full flex-row items-center justify-between">
                    <Typography variant="heading" className="text-primary-gray-900">
                      프로젝트 관리
                    </Typography>
                  </div>
                </div>
                <LayeredTabs.OneDepth
                  onChange={(type) => replace(`/teacher/ib/coordinatorPage/${type}`)}
                  value={type}
                  inActiveClassName="text-primary-gray-900 border-primary-gray-900"
                >
                  {avaliableIBCategories.map((el) => (
                    <Tab value={el} key={el}>
                      <p>{el}</p>
                    </Tab>
                  ))}
                </LayeredTabs.OneDepth>
              </div>
            }
            bottomContent={
              <div className="flex h-full items-center">
                {type === 'IB' && avaliableIBCategories.includes('IB') && <CoordinatorIB />}
                {type === 'CAS' && avaliableIBCategories.includes('CAS') && <CoordinatorCAS />}
                {type === 'EE' && avaliableIBCategories.includes('EE') && <CoordinatorEE />}
                {type === 'TOK' && avaliableIBCategories.includes('TOK') && <CoordinatorTOK />}
              </div>
            }
            bottomBgColor="bg-gray-50"
          />
        </div>
      </div>
    </div>
  )
}
