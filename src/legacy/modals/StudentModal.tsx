import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// ! 개선 필요
import { Link, useHistory } from 'react-router'

import SvgUser from '@/legacy/assets/svg/user.svg'
import { SuperModal } from '@/legacy/components'
import { Button } from '@/legacy/components/common/Button'
import { Constants } from '@/legacy/constants'
import { chatroomCreateChatRoom, useTeacherStudentGroupGet, useTeacherUserGetOne } from '@/legacy/generated/endpoint'
import { GroupType } from '@/legacy/generated/model'
import { getNickName } from '@/legacy/util/status'
import { getThisYear } from '@/legacy/util/time'
import { useModals } from '@/legacy/modals/ModalStack'

export interface StudentModalProps {
  id: number
}

export function StudentModal({ id }: StudentModalProps) {
  const { push } = useHistory()
  const { popModal } = useModals()
  const { t: tm } = useTranslation('modal', { keyPrefix: 'student_modal' })

  const { data: student } = useTeacherUserGetOne(id, { join: ['parents'] })
  const { data: studentGroups } = useTeacherStudentGroupGet({ userId: id, size: 10000, join: ['group'] })

  const studentGroup = useMemo(
    () => studentGroups?.items.find(({ group }) => group.type === GroupType.KLASS && group.year === getThisYear()),
    [studentGroups],
  )

  return (
    <SuperModal
      modalOpen
      setModalClose={popModal}
      className="max-md:h-screen-3.5 md:max-h-screen-48 flex w-96 flex-col justify-around gap-8 py-20 max-md:w-full max-md:self-start max-md:rounded-none"
    >
      <div className="flex min-h-64 flex-col items-center justify-center">
        <img
          src={`${Constants.imageUrl}${student?.profile}`}
          alt="학생 프로필"
          className="aspect-square w-20 rounded-[8px] object-fill"
          onError={({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.src = SvgUser
          }}
        />
        <p className="text-18 mt-4 font-medium">
          {student?.name} {getNickName(student?.nickName)}
        </p>
        <p className="mt-2">
          {studentGroup?.group.name} {studentGroup?.studentNumber}번
        </p>
      </div>

      <div className="flex justify-center gap-4 px-6">
        <Button
          onClick={async () => {
            const chatroomId = await chatroomCreateChatRoom({ attendeeUserIdList: [id] })
            push(`/teacher/chat/${chatroomId}`)
          }}
          className="border hover:bg-gray-100"
        >
          {tm('chat')}
        </Button>
        <Button
          as={Link}
          to={`/teacher/studentcard/${studentGroup?.groupId}/${id}/pointlogs`}
          className="border hover:bg-gray-100"
        >
          {tm('point_logs')}
        </Button>
      </div>

      {student?.parents?.[0] && (
        <div className="flex flex-col gap-3 px-6">
          <h3 className="font-semibold">{tm('parents')}</h3>
          {student?.parents?.map((parent) => (
            <div key={parent.id} className="flex items-center justify-between">
              <div>{parent.name}</div>
              <Button
                onClick={async () => {
                  const chatroomId = await chatroomCreateChatRoom({ attendeeUserIdList: [parent.id] })
                  push(`/teacher/chat/${chatroomId}`)
                }}
                className="border hover:bg-gray-100"
              >
                {tm('chat')}
              </Button>
            </div>
          ))}
        </div>
      )}
    </SuperModal>
  )
}
