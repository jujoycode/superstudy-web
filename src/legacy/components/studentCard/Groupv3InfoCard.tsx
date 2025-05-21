import { Group } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'

interface GroupInfoCard {
  groupNames?: Group[]
}
export default function Groupv3InfoCard({ groupNames }: GroupInfoCard) {
  const { t } = useLanguage()
  const groups = new Map<string, Group[]>()

  groupNames?.map((item: Group) => {
    if (item.year && item.name) {
      if (!groups.has(item.year)) {
        groups.set(item.year, [])
      }
      groups.get(item.year)?.push(item)
    }
  })
  return (
    <div className="relative mt-4 rounded-md border-2 bg-white p-4">
      <h6 className="pt-3 text-xl font-semibold md:pt-0">{t('group_information', '그룹 정보')}</h6>
      <div className="mt-2">
        {Array.from(groups?.keys())
          .sort()
          .map((year, index, array) => {
            return (
              <div
                key={`${year}-${index}`}
                className={`flex items-start py-4 md:items-center ${
                  index === array.length - 1 ? '' : 'md:border-b-2'
                } flex-col gap-2 md:flex-row md:gap-0`}
              >
                <p className="mr-4 min-w-[60px] font-semibold">{year}</p>
                <div className="flex flex-wrap items-center space-y-2 space-x-1">
                  {groups
                    .get(year)
                    ?.sort((a: Group, b: Group) => {
                      if (a.type === 'KLASS' && b.type !== 'KLASS') return -1
                      if (a.type !== 'KLASS' && b.type === 'KLASS') return 1
                      return 0
                    })
                    .map((gr: Group) => (
                      <div
                        key={gr.id}
                        className={`flex w-max items-center rounded-full px-4 py-1 ${
                          gr.type === 'KLASS'
                            ? 'border-primary-800 text-primary-800 border-2 bg-white font-bold'
                            : 'bg-gray-100'
                        } text-sm whitespace-nowrap`}
                      >
                        <div className="whitespace-pre">{gr.name}</div>
                      </div>
                    ))}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
