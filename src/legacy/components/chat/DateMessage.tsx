import { Chat } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { isSameDay } from '@/legacy/util/time'

interface DateMessageProp {
  PreMessageData?: Chat
  MessageData?: Chat
}

export function DateMessage({ PreMessageData, MessageData }: DateMessageProp) {
  return (
    <div className="flex w-full justify-center">
      {!isSameDay(MessageData?.createdAt || '', PreMessageData?.createdAt || '') && (
        <div className="my-4 rounded-xl bg-gray-300 px-5 text-center text-sm">
          {MessageData?.createdAt && DateUtil.formatDate(MessageData?.createdAt, DateFormat['YYYY-MM-DD'])}
        </div>
      )}
    </div>
  )
}
