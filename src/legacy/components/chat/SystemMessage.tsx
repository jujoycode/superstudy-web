import { Chat } from '@/legacy/generated/model'

interface SystemMessageProps {
  MessageData?: Chat
}

export function SystemMessage({ MessageData }: SystemMessageProps) {
  return (
    <div className="message mb-4 flex px-3 text-center">
      <div className="flex-1 px-2">
        <div className="inline-block rounded-xl bg-gray-500 p-1 px-6 text-white">
          <p className="text-left text-sm whitespace-pre-wrap">{MessageData?.content}</p>
        </div>
      </div>
    </div>
  )
}
