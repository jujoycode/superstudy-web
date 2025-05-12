import { format } from 'date-fns'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Chip, HorizontalScrollView, List, ListItem, Section, TopNavbar } from '@/legacy/components/common'
import { ACTIVITYV3_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import { useActivityV3FindByStudent, useStudentGroupsFindByStudent } from '@/legacy/generated/endpoint'

export function ActivityV3Page() {
  const { push } = useHistory()

  const { data: studentGroups } = useStudentGroupsFindByStudent()
  const { data: activityv3s } = useActivityV3FindByStudent(
    {
      groupIds: studentGroups?.map((sg) => sg.groupId) || [],
    },
    { query: { enabled: !!studentGroups?.length } },
  )

  const [selectedGroupId, setSelectedGroupId] = useState<any>()

  return (
    <>
      <TopNavbar
        title="활동"
        left={<div className="h-15 w-10" />}
        right={
          <div
            onClick={() => {
              window?.location?.reload()
            }}
            className="text-brand-1"
          >
            새로고침
          </div>
        }
      />
      <Section className="px-0">
        <HorizontalScrollView>
          <Chip
            children="전체"
            onClick={() => setSelectedGroupId(undefined)}
            selected={!selectedGroupId}
            className="min-w-max rounded-md py-2"
          />
          {studentGroups?.map((studentGroup) => (
            <Chip
              key={studentGroup.id}
              children={studentGroup.group.name}
              selected={selectedGroupId === studentGroup.group.id}
              onClick={() => setSelectedGroupId(studentGroup.group.id)}
              className="min-w-max rounded-md py-3"
            />
          ))}
        </HorizontalScrollView>
      </Section>
      {/* <Tabs>
        {[
          { name: '활동별 보기', type: 'ACTIVITYV3', path: '/activity/activityv3' },
          { name: '차시별 보기', type: 'SESSION', path: '/activity/session' },
        ].map((tab) => (
          <div
            key={tab.name}
            onClick={() => setTabType(tab.type)}
            className={twMerge('tabs-item cursor-pointer', tabType === tab.type && 'tabs-item-selected')}
          >
            {tab.name}
          </div>
        ))}
      </Tabs> */}
      <List className="mt-2">
        {activityv3s
          ?.filter((activityv3) => {
            if (!selectedGroupId) return true
            return activityv3.groupActivityV3s?.map((el) => el.group.id).includes(selectedGroupId)
          })
          ?.map((activityv3) => (
            <ListItem onClick={() => push(`/student/activity/${activityv3.id}`)} key={activityv3.id}>
              <div className="flex flex-col space-y-2 text-left">
                <div className="flex items-center space-x-2">
                  {activityv3.groupActivityV3s?.map((el) => (
                    <div className="bg-brand-5 rounded-md px-2 py-1 text-sm font-bold text-gray-800">
                      {el.group?.name}
                    </div>
                  ))}
                  <div className="rounded-md bg-gray-300 px-2 py-1 text-sm font-bold text-gray-800">
                    {ACTIVITYV3_TYPE_KOR[activityv3.type]}
                  </div>
                </div>
                <div className={`text-18 font-bold`}>{activityv3.title}</div>
                <div className="text-13 text-gray-500">
                  기간: {activityv3.startDate && format(new Date(activityv3.startDate), 'yyyy.MM.dd')} ~{' '}
                  {activityv3.endDate && format(new Date(activityv3.endDate), 'yyyy.MM.dd')}
                </div>
              </div>
            </ListItem>
          ))}
      </List>
    </>
  )
}
