import { useEffect, useMemo, useState } from 'react'
import { ReactComponent as Close } from '@/assets/svg/close.svg'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { ErrorBlank, SelectMenus } from '@/legacy/components'
import { Blank, Label } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherGroupAdd } from '@/legacy/container/teacher-group-add'
import { Category, GroupType, ResponseGroupDto, StudentGroup, SubjectType, User } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getNickName } from '@/legacy/util/status'
import { getThisYear } from '@/legacy/util/time'

interface GroupAddPageProps {
  groupData?: ResponseGroupDto
  onSubmit?: () => void
}

interface userTeacher {
  id: number
  name: string
}

export function GroupAddPage({ groupData, onSubmit }: GroupAddPageProps) {
  const { me } = useUserStore()
  const { t } = useLanguage()

  const SubjectTypes = [
    { id: 0, name: t('subject'), value: SubjectType.LECTURE },
    { id: 1, name: t('creative_activity'), value: SubjectType.ACTIVITY },
    { id: 2, name: t('other'), value: SubjectType.ETC },
  ]

  const { setToast: setToastMsg } = useNotificationStore()

  const { allKlassGroupsUnique: allKlassGroups } = GroupContainer.useContext()
  const {
    teachers,
    teacherGroups,
    studentGroups,
    handleSubmit,
    isCreateOrUpdateLoading,
    errorMessage,
    groupStudentsData,
    selectedGroup,
    setSelectedGroup,
  } = useTeacherGroupAdd({ groupId: groupData?.id, onSubmit })

  const uniqueTeacher = useMemo(() => {
    return teachers?.reduce((acc: any[], current) => {
      const x = acc.find((item) => item.id === current.id)
      if (!x) {
        acc.push(current)
      }
      return acc
    }, [])
  }, [teachers])

  const { categoryData: codeCreativeActivities } = useCodeByCategoryName(Category.creativeActivity)

  const { categoryData: codeSubjects } = useCodeByCategoryName(Category.subjectType)

  const [nowYear] = useState(getThisYear())
  const [subject, setSubject] = useState<string>(groupData?.teacherGroupSubject || '')
  const [room, setRoom] = useState<string>(groupData?.teacherGroupRoom || '')
  const [name, setName] = useState(groupData?.name || '')

  const [categoryType, setCategoryType] = useState<any>(SubjectTypes[0])

  const [selectedUsers, setSelectedUsers] = useState<User[]>(groupStudentsData || [])
  let userIds = selectedUsers.map((el) => el.id)

  const [selectedTeachers, setSelectedTeachers] = useState<userTeacher[]>(me ? [{ id: me.id, name: me.name }] : [])
  let teacherIds = selectedTeachers.map((el) => el.id)

  useEffect(() => {
    setSelectedUsers(groupStudentsData)
    userIds = groupStudentsData.map((el) => el.id)
  }, [groupStudentsData])

  useEffect(() => {
    if (teacherGroups && teacherGroups.length > 0) {
      setSelectedTeachers(
        teacherGroups.map((el) => {
          return { id: el.userId, name: el.user.name }
        }),
      )
      const subjectType = SubjectTypes.find((item) => item.value === teacherGroups[0].subjectType)
      setCategoryType(subjectType)
    }
  }, [teacherGroups])

  if (errorMessage) return <ErrorBlank />

  return (
    <div className="h-screen overflow-auto bg-gray-50 p-4">
      {isCreateOrUpdateLoading && <Blank />}

      <div className="space-y-4">
        <Label.col>
          <Label.Text children={t('year', '연도')} />
          <TextInput value={nowYear} disabled />
        </Label.col>
        <Label.col>
          <Label.Text children={t('group_name', '그룹명')} />
          <TextInput
            placeholder={t(
              'enter_group_name',
              '그룹명을 입력해주세요. 예) 통역봉사, 독서 토론 동아리, 2학년 4반 생명과학',
            )}
            value={name || undefined}
            onChange={(e) => setName(e.target.value)}
          />
        </Label.col>
        <Label.col>
          <Label.Text children={`* ${t('category', '분류')}`} />
          <div className="flex space-x-2">
            <div className="w-36">
              <SelectMenus
                allText={t('selection', '선택')}
                items={SubjectTypes}
                value={SubjectTypes ? categoryType : null}
                onChange={(type) => setCategoryType(type)}
              />
            </div>
            {categoryType.value === SubjectType.LECTURE && (
              <div className="w-36">
                <SelectMenus
                  allText={t('selection', '선택')}
                  value={codeSubjects?.find((item) => item.name === subject)}
                  items={codeSubjects?.sort((a, b) => {
                    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
                  })}
                  onChange={(item) => setSubject(item.name)}
                />
              </div>
            )}

            {categoryType.value === SubjectType.ACTIVITY && (
              <div className="w-36">
                <SelectMenus
                  allText={t('selection', '선택')}
                  value={codeCreativeActivities?.find((item) => item.name === subject)}
                  items={codeCreativeActivities}
                  onChange={(item) => setSubject(item.name)}
                />
              </div>
            )}

            {categoryType.value === SubjectType.ETC && (
              <TextInput
                placeholder={t('enter_content', '내용을 입력해주세요.')}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            )}
          </div>
        </Label.col>
        <Label.col>
          <Label.Text children={t('classroom', '교실')} />
          <TextInput
            placeholder={t('example_classroom', '예) 3학년 2반  또는  음악실')}
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </Label.col>
        <Label.col className="text-sm text-gray-800">
          <Label.Text children={`* ${t('select_teacher', '선생님 선택')}`} />
          <div className="w-36">
            <SelectMenus
              allText={t('select_teacher', '선생님 선택')}
              items={uniqueTeacher?.map((tg) => ({ id: tg.id, name: tg.name }))}
              onChange={({ id }: { id: number }) => {
                const tc = teachers?.find((item) => item?.id === id)
                if (tc) {
                  const userT: userTeacher = { id: tc.id, name: tc.name }
                  if (selectedTeachers.find((item) => item?.id === userT.id)) {
                    setToastMsg('이미 선택된 선생님 입니다.')
                  } else {
                    setSelectedTeachers(selectedTeachers.concat(userT))
                  }
                }
              }}
            />
          </div>
          <div>
            <Label children={t('selected_teachers', '선택된 선생님들')} />
            <div className="mt-2 flex flex-wrap">
              {selectedTeachers.map((el) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedTeachers(selectedTeachers.filter((u) => u.id !== el.id))}
                  className="m-1s text-2sm border-primary-800 text-primary-800 mt-2 mr-2 flex w-max cursor-pointer items-center space-x-2 rounded-full border-2 bg-white px-2.5 py-1.5 font-bold whitespace-nowrap"
                >
                  <div className="whitespace-pre">{el.name}</div>
                  <Close />
                </div>
              ))}
            </div>
          </div>
        </Label.col>
        <Label.col className="text-sm text-gray-800">
          <Label.Text children={`* ${t('select_student', '학생 선택')}`} />
          <div className="w-36">
            <SelectMenus
              allText={t('selection', '학급 선택 ')}
              items={allKlassGroups.map((tg) => ({ id: tg.id, name: tg.name }))}
              value={selectedGroup || undefined}
              onChange={({ id }: { id: number }) => setSelectedGroup(allKlassGroups.find((tg) => tg.id === id) || null)}
            />
          </div>
        </Label.col>
        {!!studentGroups?.length && (
          <Label.row>
            <Checkbox
              checked={!studentGroups?.filter((el) => !userIds.includes(el.user?.id)).length}
              onChange={() =>
                !studentGroups?.filter((el) => !userIds.includes(el.user?.id)).length
                  ? setSelectedUsers(
                      selectedUsers.filter((el) => !studentGroups?.map((sg) => sg.user?.id).includes(el.id)),
                    )
                  : setSelectedUsers(
                      selectedUsers.concat(
                        studentGroups
                          ?.filter((el) => !selectedUsers.map((u) => u.id).includes(el.user?.id))
                          .map((el) => el.user) || [],
                      ),
                    )
              }
            />
            <Label.Text children={t('select_all', '전체 선택')} />
          </Label.row>
        )}
        <div className="grid grid-flow-row grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
          {studentGroups
            ?.slice()
            ?.sort((a, b) => a.studentNumber - b.studentNumber)
            ?.map((el: StudentGroup) => (
              <div
                key={el.id}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg border-2 px-3 py-3 ${
                  userIds.includes(el.user?.id) ? 'border-primary-800 bg-primary-50' : 'border-gray-200'
                }`}
                onClick={() => {
                  if (el?.user) {
                    if (userIds.includes(el.user.id)) {
                      setSelectedUsers(selectedUsers.filter((u) => u.id !== el.user?.id))
                    } else {
                      setSelectedUsers(selectedUsers.concat(el.user))
                    }
                  }
                }}
              >
                {selectedGroup?.type === GroupType.KLASS && <div className="font-bold">{el.studentNumber}</div>}
                <div className="font-base overflow-hidden whitespace-pre">
                  {el.user?.name}
                  {getNickName(el.user?.nickName)}
                </div>
              </div>
            ))}
        </div>
        <div>
          <Label children={t('selected_students', '선택된 학생들')} />
          <div className="mt-2 flex flex-wrap">
            {selectedUsers.map((el) => (
              <div
                key={el.id}
                onClick={() => setSelectedUsers(selectedUsers.filter((u) => u.id !== el.id))}
                className="m-1s text-2sm border-primary-800 text-primary-800 mt-2 mr-2 flex w-max cursor-pointer items-center space-x-2 rounded-full border-2 bg-white px-2.5 py-1.5 font-bold whitespace-nowrap"
              >
                <div className="whitespace-pre">{el.name}</div>
                <Close />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Button.lg
          children="등록하기"
          disabled={!name || !subject || !selectedTeachers.length}
          onClick={() =>
            handleSubmit({
              name,
              year: nowYear,
              subject,
              subjectType: categoryType.value,
              room,
              studentIds: userIds,
              teacherIds: teacherIds,
            })
          }
          className="filled-primary mx-auto w-[70%]"
        />
      </div>
    </div>
  )
}
