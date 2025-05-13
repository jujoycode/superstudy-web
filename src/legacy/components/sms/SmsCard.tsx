import { Time } from '@/legacy/components/common/Time'

interface SmsCardProps {
  receiverName: string
  sendAt: string
  content: string
  result: boolean
  retryCount: number
}

export function SmsCard({ receiverName, sendAt, content, result, retryCount }: SmsCardProps) {
  return (
    <div className="w-full border-b-2 border-gray-100 px-2 py-4">
      <div className="flex items-center space-x-2">
        <div className="flex min-w-max flex-col">
          <div className="text-lg font-semibold">수신 : {receiverName}</div>
          <Time date={sendAt} format="전송일 : yyyy-MM-dd HH:mm:ss" className="text-xs font-normal text-gray-500" />
        </div>
        <div className="flex-grow">{content}</div>
        <div className="min-w-max">
          <div
            className={`${
              result ? 'filled-green' : retryCount >= 100 ? 'filled-red' : 'filled-primary'
            } w-12 rounded-md p-2 text-center text-sm`}
          >
            {result ? '전송성공' : retryCount >= 100 ? '전송실패' : '전송중'}
          </div>
        </div>
      </div>
    </div>
  )
}
