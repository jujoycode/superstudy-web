import { ResponseChatroomInfoDto } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

interface MessageBoxProps {
  info: ResponseChatroomInfoDto
}

export function MessageBox({ info }: MessageBoxProps) {
  return (
    <div className="flex w-full cursor-pointer items-center">
      <div className="flex-1 px-1 py-2 text-left">
        <h4 className="text-base font-bold text-gray-900">
          {info.chatroomName ||
            (info.attendeeNames
              ? info.attendeeNames?.length < 40
                ? info.attendeeNames
                : info.attendeeNames?.slice(0, 30) + '...'
              : '무명대화방')}{' '}
          {info.attendeeIdList.length > 2 && info.attendeeIdList.length.toString() + '명'}
        </h4>
        <div className="text-sm">
          {info.lastMessage
            ? info.lastMessage?.length < 60
              ? info.lastMessage
              : info.lastMessage.slice(0, 50) + '...'
            : ''}
        </div>
      </div>
      <div className="flex-2 text-right">
        <div>
          <small className="text-gray-500">
            {info.lastMessageCreatedAt
              ? DateUtil.formatDate(new Date(info.lastMessageCreatedAt), DateFormat['YYYY-MM-DD HH:mm'])
              : ''}
          </small>
        </div>
        <div>
          {info.lastMessageCreatedAt && info.lastReadAt && info.lastMessageCreatedAt > info.lastReadAt && (
            <small className="inline-block h-6 w-6 rounded-full bg-red-500 text-center text-xs leading-6 text-white">
              N
            </small>
          )}
        </div>
      </div>
    </div>
  )
}
