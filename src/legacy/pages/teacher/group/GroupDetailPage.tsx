import { useState } from 'react'
import { useParams } from 'react-router'
import { useUserStore } from '@/stores/user'
import { ErrorBlank, SuperModal } from '@/legacy/components'
import { Divider, Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TeacharAllGroup } from '@/legacy/container/teacher-group-all'
import { useTeacherGroupDetail } from '@/legacy/container/teacher-group-detail'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getNickName, makeStudNum5 } from '@/legacy/util/status'
import { GroupAddPage } from './GroupAddPage'

interface GroupDetailPageProps {
  selectedGroup?: TeacharAllGroup
}

export function GroupDetailPage({ selectedGroup }: GroupDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const { t, currentLang } = useLanguage()
  const { me } = useUserStore()
  const { group, studentGroups, teacherGroups, errorMessage, handleGroupDelete } = useTeacherGroupDetail(Number(id))
  const [updateState, setUpdateState] = useState(false)
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)

  if (errorMessage) return <ErrorBlank />

  if (updateState) {
    return (
      <GroupAddPage
        groupData={group}
        //groupStudentsData={studentGroups.map((el) => el.user)}
        onSubmit={() => {
          setUpdateState(false)
        }}
      />
    )
  }

  return (
    <div className="h-screen overflow-auto bg-gray-50 p-4">
      <SuperModal modalOpen={isDeleteModalOpen} setModalClose={() => setDeleteModalOpen(false)} className="w-max">
        {group && group.activityCount && Number(group.activityCount) > 0 ? (
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-600">
              {t(
                'cannot_delete_group_due_to_linked_activities',
                '해당 그룹에 연관된 활동이 존재하여 삭제가 불가능합니다.',
              )}
              <br />
              {t('please_delete_linked_activities_first', '해당 그룹에 연관된 활동을 삭제해 주시기 바랍니다.')}
            </div>
          </Section>
        ) : (
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              {t(
                'confirm_delete_group',
                '이 그룹을 삭제하면 그룹에 연관된 데이터(활동,출석,시간표 등)도 같이 삭제됩니다.',
              )}
              <br />
              {t('confirm_delete_select_group', '정말 선택된 그룹을 삭제하시겠습니까?')}
            </div>
            <Button.xl
              children={t('delete', '삭제하기')}
              onClick={() => handleGroupDelete()}
              className="filled-primary"
            />
          </Section>
        )}
      </SuperModal>
      <div className="flex items-center justify-between px-3 pt-6">
        <div className="text-xl font-semibold">{selectedGroup?.name}</div>
        {selectedGroup?.origin === 'USER' ? (
          <div className="mb-1 flex cursor-pointer space-x-2">
            <Button.sm children={t('edit', '수정')} onClick={() => setUpdateState(true)} className="filled-yellow" />
            <Button.sm children={t('delete', '삭제')} onClick={() => setDeleteModalOpen(true)} className="filled-red" />
          </div>
        ) : (
          <div className="text-gray-700">{currentLang === 'ko' ? selectedGroup?.originKor : selectedGroup?.origin}</div>
        )}
      </div>
      <Divider className="bg-black" />

      <div className="my-6">
        <label className="text-sm text-gray-800">{t('supervising_teacher', '담당선생님')}</label>
        {teacherGroups && teacherGroups.length > 0 ? (
          teacherGroups.map((teacher) => (
            <div key={teacher.id} className="border-gray-6 m-1 w-full rounded-lg border-2 px-3 py-3">
              <div className="">
                {t('supervisor', '담당')} : {teacher.user.name}
                {getNickName(teacher.user.nickName)} {t('teacher', '선생님')}
              </div>
              <div className="">
                {t('subject', '과목')} : {teacher.subject || selectedGroup?.subject}
              </div>
              <div className="">
                {t('classroom', '교실')} : {teacher.room || selectedGroup?.room}
              </div>
            </div>
          ))
        ) : (
          <div key={selectedGroup?.id} className="border-gray-6 m-1 w-full rounded-lg border-2 px-3 py-3">
            <div className="">
              {t('supervisor', '담당')} : {me?.name}
              {getNickName(me?.nickName)} {t('teacher', '선생님')}
            </div>
            <div className="">
              {t('subject', '과목')} : {selectedGroup?.subject}
            </div>
            <div className="">
              {t('classroom', '교실')} : {selectedGroup?.room}
            </div>
          </div>
        )}
      </div>

      <div className="my-6">
        <label className="text-sm text-gray-800">
          {t('students_in_group', '소속 학생')} ({studentGroups.length}
          {t('count', '명')})
        </label>
        <div className="grid w-full grid-flow-row grid-cols-2 gap-2 pr-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {studentGroups.map((student) => (
            <div key={student.id} className="border-gray-6 w-full rounded-lg border-2 px-3 py-1">
              <div className="w-full">{makeStudNum5(student.klass + student.studentNumber.toString())}</div>
              <div className="w-full">
                {student.userName}
                {getNickName(student.userNickName)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
