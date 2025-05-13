import { Group } from '@/legacy/generated/model'

interface GroupInfoCard {
  groupNames?: Group[]
}

export function GroupInfoCard({ groupNames }: GroupInfoCard) {
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
    <div className="mb-5">
      <div className="flex justify-between text-xl font-semibold">
        <p>그룹정보카드</p>
      </div>
      <div className="relative h-full rounded-lg border bg-white p-3">
        <table className="w-full">
          {Array.from(groups?.keys())
            .sort()
            .reverse()
            .map((year) => (
              <>
                <tr>
                  <td className="w-32 border-b-2 font-semibold">{year}년</td>
                  <td className="border-b-2"></td>
                </tr>
                <tr>
                  <td className="w-full">
                    <div className="mb-2 flex flex-row flex-wrap">
                      {groups.get(year)?.map((gr: Group) => (
                        <div
                          key={gr.id}
                          className={`m-1s mt-1 mr-2 flex w-max items-center space-x-2 rounded-full px-2.5 py-0.5 ${
                            gr.type === 'KLASS'
                              ? 'border-brand-1 text-brand-1 bg-white'
                              : 'border-brandblue-1 text-brandblue-1 bg-white'
                          } text-2sm border-2 font-bold whitespace-nowrap`}
                        >
                          <div className="whitespace-pre">{gr.name}</div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              </>
            ))}
        </table>
      </div>
    </div>
  )
}
