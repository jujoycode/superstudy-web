import { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { useActivitySessionOrderUpdate } from '@/legacy/generated/endpoint'
import {
  ActivitySession,
  ActivityType,
  ActivityV3,
  RequestUpdateActivitySessionOrderDto,
} from '@/legacy/generated/model'
import { twMerge } from 'tailwind-merge'
import { Button } from '@/legacy/components/common/Button'
import { SessionTableItem } from './SessionTableItem'

interface SesstionTableProps {
  activityv3: ActivityV3
  setSelectedSessionId: (value: number) => void
  setDownloadModalOpen: (value: boolean) => void
}

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

export const SessionTable = ({ activityv3, setSelectedSessionId, setDownloadModalOpen }: SesstionTableProps) => {
  const [sessionItems, setSessionItems] = useState<ActivitySession[]>([])

  const { mutate: updateActivitySessionOrder, isLoading } = useActivitySessionOrderUpdate()

  useEffect(() => {
    if (activityv3.activitySessions) {
      setSessionItems(
        activityv3.activitySessions?.sort(
          (a, b) => (a.activitySessionOrder?.order || 0) - (b.activitySessionOrder?.order || 0),
        ),
      )
    }
  }, [activityv3])

  const groupIds = useMemo(
    () => activityv3?.groupActivityV3s?.map((groupActivity) => groupActivity.groupId) || [],
    [activityv3],
  )

  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const items = reorder(sessionItems, result.source.index, result.destination.index)

    setSessionItems(items)
  }

  const sessionOrders = useMemo(() => {
    const newSessionOrders: RequestUpdateActivitySessionOrderDto[] = []
    let order = 1
    let viewOrder = 1

    sessionItems.forEach((session) => {
      if (!session.activitySessionOrder) return
      const { id } = session.activitySessionOrder

      newSessionOrders.push({
        id,
        viewOrder: session.type === ActivityType.NOTICE ? 0 : viewOrder,
        order,
      })

      order++

      if (session.type !== ActivityType.NOTICE) {
        viewOrder++
      }
    })
    return newSessionOrders
  }, [sessionItems])

  return (
    <div className="relative h-full">
      <table className="w-full border-separate border-spacing-0 text-center">
        <thead>
          <tr className="bg-white">
            <th className="w-12 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">순서</th>

            <th className="w-20 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">타입</th>
            <th className="w-28 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">차시</th>
            <th className="w-96 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">제목</th>
            <th className="w-48 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">기간</th>
            <th className="w-28 border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px]">제출/미제출</th>
            <th className="hidden border-t border-b border-[#AAAAAA] border-t-[#333333] px-2 py-[15px] md:table-cell"></th>
          </tr>
        </thead>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <tbody
                {...provided.droppableProps}
                ref={provided.innerRef}
                // style={getListStyle(snapshot.isDraggingOver)}
              >
                {sessionItems?.map((session, index: number) => (
                  <Draggable
                    isDragDisabled={isLoading}
                    key={String(session.id)}
                    draggableId={String(session.id)}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <tr
                        className={twMerge(`h-14 w-full`, isLoading && 'bg-gray-50')}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <SessionTableItem
                          key={session.id}
                          order={sessionOrders[index]}
                          groupIds={groupIds}
                          activityId={activityv3.id}
                          session={session}
                          index={index}
                          setDownloadModalOpen={setDownloadModalOpen}
                          setSelectedSessionId={setSelectedSessionId}
                        />
                      </tr>
                    )}
                  </Draggable>
                ))}
              </tbody>
            )}
          </Droppable>
        </DragDropContext>
      </table>
      <Button
        className="mt-2 h-8 w-36 rounded-lg bg-zinc-800 text-sm font-semibold text-white"
        onClick={() => updateActivitySessionOrder({ data: sessionOrders })}
      >
        순서 저장하기
      </Button>
    </div>
  )
}
