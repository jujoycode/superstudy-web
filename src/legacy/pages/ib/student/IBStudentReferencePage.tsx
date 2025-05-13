// P-T-012 : 코디선생님 프로젝트 메인 화면
// /teacher/ib/coordinatorPage
// https://www.notion.so/superschoolofficial/P-T-012-126e90ac0a99800e94d4da062bdc5417
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { Typography } from '@/legacy/components/common/Typography'
import IBLayout from '@/legacy/components/ib/IBLayout'
import ReferenceList from '@/legacy/components/ib/reference/ReferenceList'
import { useCoordinatorGetReference } from '@/legacy/container/ib-coordinator'
import { ResponseReferenceInfoDtoCategory } from '@/legacy/generated/model'

export const IBStudentReferencePage = () => {
  const { type: initType } = useParams<{ type: string }>()
  const [type, setType] = useState<ResponseReferenceInfoDtoCategory>(
    ['IB_ALL', 'IB_CAS', 'IB_EE', 'IB_TOK'].includes(initType || '')
      ? (initType as ResponseReferenceInfoDtoCategory)
      : 'IB_ALL',
  )

  const { data: References, getIBReference, isLoading } = useCoordinatorGetReference()

  useEffect(() => {
    getIBReference({ category: type })
  }, [type])

  return (
    <div className="col-span-6">
      {isLoading && <IBBlank />}
      <div className="h-screen w-full">
        <div className="">
          <IBLayout
            topContent={
              <div>
                <div className="w-full pt-16 pb-6">
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex w-full flex-row items-center justify-between">
                      <div className="flex flex-row items-center gap-1"></div>
                      <Breadcrumb
                        data={{
                          자료실: '/ib/student/reference',
                        }}
                      />
                    </div>
                    <Typography variant="heading">자료실</Typography>
                  </div>
                </div>
                <LayeredTabs.OneDepth onChange={(selectedType) => setType(selectedType)} value={type}>
                  <Tab value="IB_ALL">
                    <p>공통</p>
                  </Tab>
                  <Tab value="IB_CAS">
                    <p>CAS</p>
                  </Tab>
                  <Tab value="IB_EE">
                    <p>EE</p>
                  </Tab>
                  <Tab value="IB_TOK">
                    <p>TOK</p>
                  </Tab>
                </LayeredTabs.OneDepth>
              </div>
            }
            bottomContent={
              <div className="flex h-full items-center pt-6">
                <div className="flex w-full flex-col rounded-xl bg-white">
                  {type === 'IB_ALL' && <ReferenceList data={References?.items} type={type} />}
                  {type === 'IB_CAS' && <ReferenceList data={References?.items} type={type} />}
                  {type === 'IB_EE' && <ReferenceList data={References?.items} type={type} />}
                  {type === 'IB_TOK' && <ReferenceList data={References?.items} type={type} />}
                </div>
              </div>
            }
            bottomBgColor="bg-gray-50"
          />
        </div>
      </div>
    </div>
  )
}
