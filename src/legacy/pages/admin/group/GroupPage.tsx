import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router'
import { useSetRecoilState } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { Label, Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox, useCheckbox } from '@/legacy/components/common/Checkbox'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Routes } from '@/legacy/constants/routes'
import { useCodeByCategoryName } from '@/legacy/container/category'
import {
  groupManagementAddStudent,
  groupManagementAddTeachers,
  groupManagementDeleteGroup,
  groupManagementDeleteStudent,
  groupManagementDeleteTeacher,
  useAdminCommonSearchStudents,
  useAdminCommonSearchTeachers,
  useGroupManagementGetGroupDetailInfo,
  useGroupManagementGetGroupList,
} from '@/legacy/generated/endpoint'
import { Category, RequestGroupTeacherDto, RequestModifyGroupOnlyDto, SubjectType } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { AdminContext } from '@/legacy/pages/admin/AdminMainPage'
import { getErrorMsg, getNickName } from '@/legacy/util/status'
import { useNotificationStore } from '@/stores2/notification'

const SubjectTypes = [
  { id: 0, name: '과목', value: SubjectType.LECTURE },
  { id: 1, name: '창체', value: SubjectType.ACTIVITY },
  { id: 2, name: '기타', value: SubjectType.ETC },
]

export function GroupPage() {
  const { year } = useContext(AdminContext)
  const { push, replace } = useHistory()
  const { id: idString } = useParams<{ id: string }>()
  const groupId = Number(idString ?? 0)
  const { setToast: setToastMsg, setWarning: setWarningMsg } = useNotificationStore()
  const [editGroup, setEditGroup] = useState(false)
  const [editTeachers, setEditTeachers] = useState(false)
  const [editStudents, setEditStudents] = useState(false)
  const [studentKeyword, setStudentKeyword] = useState('')
  const { t } = useLanguage()

  useEffect(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    if (currentMonth === 2 && year !== currentYear) {
      setWarningMsg(`주의 : ${year} 학년도가 선택되어 있습니다.`)
    }
  }, [year])

  const [categoryType, setCategoryType] = useState<any>(SubjectTypes[0].value)

  const { categoryData: codeCreativeActivities } = useCodeByCategoryName(Category.creativeActivity)
  const { categoryData: codeSubjects } = useCodeByCategoryName(Category.subjectType)

  const { data: allTeachers } = useAdminCommonSearchTeachers({ year })
  const { data: allStudents } = useAdminCommonSearchStudents(
    { year, keyword: studentKeyword },
    { query: { enabled: !!studentKeyword } },
  )
  const { data: groups, isLoading } = useGroupManagementGetGroupList({ year })

  useEffect(() => {
    if (groupId || isLoading) return
    groups?.[0] ? replace(`${Routes.admin.group.index}/${groups[0].id}`) : replace(Routes.admin.group.new)
  }, [isLoading, groups])

  const { data: group } = useGroupManagementGetGroupDetailInfo(groupId, {
    query: { keepPreviousData: true, enabled: !!groupId },
  })

  const { handleSubmit, register } = useForm<RequestModifyGroupOnlyDto>()

  const {
    handleSubmit: handleGroupTeacherSubmit,
    register: registerGroupTeacher,
    reset: resetGroupTeacher,
  } = useForm<RequestGroupTeacherDto>()

  async function saveGroupName(params: RequestModifyGroupOnlyDto) {
    if (!groupId) return
    setToastMsg(`${params.name} 그룹명이 변경되었습니다`)
    setEditGroup(false)
  }

  async function addGroupTeacher(params: RequestGroupTeacherDto) {
    if (!groupId) return
    await groupManagementAddTeachers(groupId, { groupTeachers: [params] })
    resetGroupTeacher({ userId: undefined, subject: '', room: '' })
  }

  const unregisteredStudents = allStudents?.items
    .filter((s) => group?.studentList.every((sg) => s.id !== sg.userId))
    .slice(0, 10)

  const unregisteredStudentsCb = useCheckbox(unregisteredStudents)
  const unregisteredStudentIds = unregisteredStudentsCb.items.map(({ id }) => id)
  const registeredStudentsCb = useCheckbox(group?.studentList)
  const registeredStudentIds = registeredStudentsCb.items.map(({ userId }) => userId)

  async function addGroupStudent() {
    if (!groupId) return
    await groupManagementAddStudent(groupId, {
      groupStudents: unregisteredStudentIds.map((id) => ({ userId: id, studentNumber: null })),
    })
    unregisteredStudentsCb.clear()
  }

  async function removeGroupStudent() {
    if (!groupId) return
    await Promise.all(registeredStudentIds.map((id) => groupManagementDeleteStudent(groupId, id)))
    registeredStudentsCb.clear()
  }

  async function deleteGroup() {
    if (!groupId || !group) return
    if (!confirm(`${group.groupInfo.name} 그룹을 삭제할까요?`)) return
    await groupManagementDeleteGroup(groupId)
      .then((result) => {
        result
          ? setToastMsg(`${group.groupInfo.name} 그룹이 삭제되었습니다`)
          : setToastMsg(`${group.groupInfo.name} 그룹을 삭제할 수 없습니다`)
      })
      .catch((result) => {
        setToastMsg(getErrorMsg(result))
      })
  }

  if (!groupId) return null
  return (
    <>
      <Admin.Section>
        <div className="flex gap-2">
          <Admin.H2>{t('group')}</Admin.H2>
          <Button.sm as={Link} children={t('add')} to={Routes.admin.group.new} className="outlined-gray" />
        </div>

        <div className="flex items-center gap-2">
          {editGroup ? (
            <>
              <TextInput {...register('name')} className="h-9 max-w-[200px]" />
              <Button.sm children={t('save')} onClick={handleSubmit(saveGroupName)} className="filled-gray" />
              <Button.sm children={t('cancel')} onClick={() => setEditGroup(false)} className="outlined-gray" />
            </>
          ) : (
            <>
              <Select value={groupId} onChange={(e) => push(`${Routes.admin.group.index}/${e.target.value}`)}>
                {groups
                  ?.sort((a, b) => {
                    return a.name && b.name && a.name < b.name ? -1 : 0
                  })
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </Select>
              <Button.sm children={t('delete')} onClick={deleteGroup} className="outlined-gray" />
              <Button.sm children={t('edit')} onClick={() => setEditGroup(true)} className="outlined-gray" />
            </>
          )}
        </div>
      </Admin.Section>

      {/* <Admin.Section>
        <Admin.H2>그룹 정보</Admin.H2>
        <Admin.Card className="grid grid-cols-3 divide-x">
          <Admin.Cell>
            <Label.Text children="그룹명" />
            <p className="mt-2">{group?.groupInfo.name}</p>
          </Admin.Cell>
          <Admin.Cell>
            <Label.Text children="" />
            <p className="mt-2"></p>
          </Admin.Cell>
          <Admin.Cell>
            <Label.Text children="" />
            <p className="mt-2"></p>
          </Admin.Cell>
        </Admin.Card>
      </Admin.Section> */}

      <Admin.Section>
        <div className="flex gap-2">
          <Admin.H2>{t('teacher_list')}</Admin.H2>
          <div className="flex gap-2">
            {editTeachers ? (
              <Button.sm children={t('done')} onClick={() => setEditTeachers(false)} className="outlined-gray" />
            ) : (
              <Button.sm children={t('edit')} onClick={() => setEditTeachers(true)} className="outlined-gray" />
            )}
          </div>
        </div>
        {editTeachers && (
          <div className="flex items-end gap-2">
            <div>
              <Label.Text children={t('teacher')} />
              <Select {...registerGroupTeacher('userId', { valueAsNumber: true })}>
                {allTeachers?.items
                  .filter((t) => group?.teacherList.every((tg) => t.id !== tg.userId))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {getNickName(t.nickName)} {t.email}
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <Label.Text children={t('subject_category')} />
              <Select
                {...registerGroupTeacher('subjectType')}
                className="w-30"
                onChange={(type) => setCategoryType(type.target.value)}
              >
                {SubjectTypes?.map((k) => (
                  <option key={k.id} value={k.value}>
                    {k.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label.Text children={t('subject')} />
              {categoryType !== SubjectType.ETC ? (
                <Select {...registerGroupTeacher('subject')} className="w-30">
                  {(categoryType === SubjectType.LECTURE ? codeSubjects : codeCreativeActivities)
                    ?.sort((a, b) => {
                      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
                    })
                    .map((k) => (
                      <option key={k.id} value={k.name}>
                        {k.name}
                      </option>
                    ))}
                </Select>
              ) : (
                <TextInput
                  placeholder={`${t('subject')}`}
                  {...registerGroupTeacher('subject')}
                  className="h-9 max-w-[200px]"
                />
              )}
            </div>
            <div>
              <Label.Text children={t('classroom')} />
              <TextInput
                placeholder={`${t('classroom')}`}
                {...registerGroupTeacher('room')}
                className="h-9 max-w-[200px]"
              />
            </div>
            <Button children={t('add')} onClick={handleGroupTeacherSubmit(addGroupTeacher)} className="filled-gray" />
          </div>
        )}
        <Admin.Table>
          <Admin.TableHead>
            <Admin.TableRow>
              <Admin.TableHCell children={t('name')} />
              <Admin.TableHCell children={t('subject')} />
              <Admin.TableHCell children={t('classroom')} />
              {editTeachers && <Admin.TableHCell />}
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {group?.teacherList.map((teacherGroup) => (
              <Admin.TableRow key={teacherGroup.id} to={`${Routes.admin.teacher.index}/${teacherGroup.userId}`}>
                <Admin.TableCell children={teacherGroup.user.name + getNickName(teacherGroup.user.nickName)} />
                <Admin.TableCell children={teacherGroup.subject} />
                <Admin.TableCell children={teacherGroup.room} />
                {editTeachers && (
                  <Admin.TableCell>
                    <Button.sm
                      children={t('delete')}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!groupId) return
                        groupManagementDeleteTeacher(groupId, teacherGroup.userId)
                      }}
                      className="outlined-gray"
                    />
                  </Admin.TableCell>
                )}
              </Admin.TableRow>
            ))}
          </Admin.TableBody>
        </Admin.Table>
      </Admin.Section>

      <Admin.Section>
        <div className="flex gap-2">
          <Admin.H2>{t('student_list')}</Admin.H2>
          <div className="flex gap-2">
            {editStudents ? (
              <Button.sm children={t('done')} onClick={() => setEditStudents(false)} className="outlined-gray" />
            ) : (
              <Button.sm children={t('edit')} onClick={() => setEditStudents(true)} className="outlined-gray" />
            )}
          </div>
        </div>
        {editStudents && (
          <TextInput
            placeholder={`${t('search_student')}`}
            value={studentKeyword}
            onChange={(e) => setStudentKeyword(e.target.value)}
            className="h-9 max-w-[200px]"
          />
        )}
        {editStudents && (
          <div className="flex gap-2">
            <Admin.H3>{t('unregistered_student')}</Admin.H3>
            <div className="flex gap-2">
              <Button.sm
                children={t('add')}
                title="추가할 학생을 선택하고 클릭하세요."
                disabled={unregisteredStudentsCb.allUnchecked}
                onClick={addGroupStudent}
                className="outlined-gray"
              />
            </div>
          </div>
        )}
        {editStudents && (
          <Admin.Table>
            <Admin.TableHead>
              <Admin.TableRow>
                <Admin.TableHCell>
                  <Checkbox checked={unregisteredStudentsCb.allChecked} onChange={unregisteredStudentsCb.clickAll} />
                </Admin.TableHCell>
                <Admin.TableHCell children={t('grade_class')} />
                <Admin.TableHCell children={t('name')} />
                <Admin.TableHCell children={t('email')} />
              </Admin.TableRow>
            </Admin.TableHead>
            <Admin.TableBody>
              {unregisteredStudents?.map((student, i) => (
                <Admin.TableRow key={student.id} to={`${Routes.admin.student.index}/${student.id}`}>
                  <Admin.TableCell onClick={(e) => (e.stopPropagation(), unregisteredStudentsCb.click(i))}>
                    <Checkbox
                      checked={unregisteredStudentsCb.checked(i)}
                      onChange={() => unregisteredStudentsCb.click(i)}
                    />
                  </Admin.TableCell>
                  <Admin.TableCell children={student.klassGroupName} />
                  <Admin.TableCell children={student.name + getNickName(student.nickName)} />
                  <Admin.TableCell children={student.email} />
                </Admin.TableRow>
              ))}
            </Admin.TableBody>
          </Admin.Table>
        )}
        {editStudents && (
          <div className="flex gap-2">
            <Admin.H3>{t('registered_student')}</Admin.H3>
            <div className="flex gap-2">
              <Button.sm
                children={t('delete')}
                title="삭제할 학생을 선택하고 클릭하세요."
                disabled={registeredStudentsCb.allUnchecked}
                onClick={removeGroupStudent}
                className="outlined-gray"
              />
            </div>
          </div>
        )}
        <Admin.Table>
          <Admin.TableHead>
            <Admin.TableRow>
              {editStudents && (
                <Admin.TableHCell>
                  <Checkbox checked={registeredStudentsCb.allChecked} onChange={registeredStudentsCb.clickAll} />
                </Admin.TableHCell>
              )}
              <Admin.TableHCell children={t('grade_class')} />
              <Admin.TableHCell children={t('attendance_number')} />
              <Admin.TableHCell children={t('name')} />
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {group?.studentList.map((studentGroup, i) => (
              <Admin.TableRow key={studentGroup.userId} to={`${Routes.admin.student.index}/${studentGroup.userId}`}>
                {editStudents && (
                  <Admin.TableCell onClick={(e) => (e.stopPropagation(), registeredStudentsCb.click(i))}>
                    <Checkbox
                      checked={registeredStudentsCb.checked(i)}
                      onChange={() => registeredStudentsCb.click(i)}
                    />
                  </Admin.TableCell>
                )}
                <Admin.TableCell children={studentGroup.klass} />
                <Admin.TableCell children={studentGroup.studentNumber} />
                <Admin.TableCell children={studentGroup.userName + getNickName(studentGroup.userNickName)} />
              </Admin.TableRow>
            ))}
          </Admin.TableBody>
        </Admin.Table>
      </Admin.Section>
    </>
  )
}
