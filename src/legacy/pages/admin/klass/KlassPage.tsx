import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { Label, Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox, useCheckbox } from '@/legacy/components/common/Checkbox'
import { NumberInput } from '@/legacy/components/common/NumberInput'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Routes } from '@/legacy/constants/routes'
import {
  groupManagementAddStudent,
  groupManagementAddTeachers,
  groupManagementDeleteStudent,
  groupManagementDeleteTeacher,
  klassManagementChangeHomeroomTeacher,
  klassManagementDeleteKlass,
  useAdminCommonFindAllKlassBySchool,
  useAdminCommonSearchStudents,
  useAdminCommonSearchTeachers,
  useKlassManagementGetKlassInfo,
} from '@/legacy/generated/endpoint'
import { RequestGroupTeacherDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { AdminContext } from '@/legacy/pages/admin/AdminMainPage'
import { getNickName } from '@/legacy/util/status'
import { useNotificationStore } from '@/stores/notification'

export function KlassPage() {
  const { t } = useLanguage()
  const { push, replace } = useHistory()
  const { id: idString } = useParams<{ id: string }>()
  const klassId = Number(idString ?? 0)
  const { setToast: setToastMsg, setWarning: setWarningMsg } = useNotificationStore()
  const { year } = useContext(AdminContext)
  const [homeroomTeacherId, setHomeroomTeacherId] = useState<number>()
  const [editHomeroomTeacher, setEditHomeroomTeacher] = useState(false)
  const [editTeachers, setEditTeachers] = useState(false)
  const [editStudents, setEditStudents] = useState(false)
  const [studentKeyword, setStudentKeyword] = useState('')
  const [groupStudents, setGroupStudents] = useState(new Map())

  useEffect(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    if (currentMonth === 2 && year !== currentYear) {
      setWarningMsg(`주의 : ${year} 학년도가 선택되어 있습니다.`)
    }
  }, [year])

  const { data: klassInfo } = useKlassManagementGetKlassInfo(klassId, {
    query: { keepPreviousData: true, enabled: !!klassId },
  })

  const { data: klasses, isLoading } = useAdminCommonFindAllKlassBySchool({ year })

  useEffect(() => {
    if (klassId || isLoading) return
    klasses?.[0] ? replace(`${Routes.admin.klass.index}/${klasses[0].id}`) : replace(Routes.admin.klass.new)
  }, [isLoading, klasses])

  const klass = klasses?.find((k) => k.id === klassId)
  useEffect(() => setHomeroomTeacherId(klass?.homeRoomTeacherId ?? undefined), [klass?.homeRoomTeacherId])

  const { data: allTeachers } = useAdminCommonSearchTeachers({ year })
  const homeroomTeacher = allTeachers?.items.find((t) => t.id === homeroomTeacherId)
  const { data: allStudents } = useAdminCommonSearchStudents(
    { year, keyword: studentKeyword },
    { query: { enabled: !!studentKeyword } },
  )

  const {
    handleSubmit: handleGroupTeacherSubmit,
    register: registerGroupTeacher,
    reset: resetGroupTeacher,
  } = useForm<RequestGroupTeacherDto>()

  async function deleteKlass() {
    if (!klassId || !klass) return
    if (!confirm(`${klass.name} 학급을 삭제할까요?`)) return
    await klassManagementDeleteKlass(klassId)
    setToastMsg(`${klass.grade}학년 ${klass.klass}반 학급이 삭제되었습니다`)
  }

  async function changeHomeroomTeacher() {
    if (!klassId || !homeroomTeacherId) return
    if (!homeroomTeacher) return
    if (!confirm(`담임선생님을 ${homeroomTeacher.name} 으로 변경할까요?`)) return
    setEditHomeroomTeacher(false)
    await klassManagementChangeHomeroomTeacher(klassId, { teacherId: homeroomTeacherId })
  }

  async function addGroupTeacher(params: any) {
    if (!klassId) return
    await groupManagementAddTeachers(klassId, { groupTeachers: [params] })
    resetGroupTeacher({ userId: undefined, subject: '', room: '' })
  }

  const unregisteredStudents = allStudents?.items
    .filter((s) => !s.klassGroupName)
    .filter((s) => klassInfo?.studentInfo?.every((si) => s.id !== si.userId))
    .slice(0, 10)

  const unregisteredStudentsCb = useCheckbox(unregisteredStudents)
  const registeredStudentsCb = useCheckbox(klassInfo?.studentInfo ?? [])
  const registeredStudentIds = registeredStudentsCb.items.map(({ userId }) => userId)

  async function addGroupStudent() {
    if (!klassId) return
    await groupManagementAddStudent(klassId, { groupStudents: [...groupStudents.values()] })
    unregisteredStudentsCb.clear()
    setGroupStudents(new Map())
  }

  async function removeGroupStudent() {
    if (!klassId) return
    await Promise.all(registeredStudentIds.map((id) => groupManagementDeleteStudent(klassId, id)))
    registeredStudentsCb.clear()
  }

  if (!klassId) return null
  return (
    <>
      <Admin.Section>
        <div className="flex gap-2">
          <Admin.H2>{t('class')}</Admin.H2>
          <Button.sm as={Link} children={t('add')} to={Routes.admin.klass.new} className="outlined-gray" />
        </div>

        <div className="flex items-center gap-2">
          <Select value={klassId} onChange={(e) => push(`${Routes.admin.klass.index}/${e.target.value}`)}>
            {klasses
              ?.reduce((acc: any[], current: any) => {
                if (!acc.find((item) => item.id === current.id)) {
                  acc.push(current)
                }
                return acc
              }, [])
              .map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
          </Select>
          <Button.sm children={t('delete')} onClick={deleteKlass} className="outlined-gray" />
        </div>
      </Admin.Section>

      <Admin.Section>
        <div className="flex items-center gap-2">
          <Admin.H2>{t('homeroom_teacher_info')}</Admin.H2>
          <div className="flex space-x-2">
            {editHomeroomTeacher ? (
              <>
                <Button.sm
                  children={t('cancel')}
                  onClick={() => setEditHomeroomTeacher(false)}
                  className="outlined-gray"
                />
                <Button.sm children={t('save')} onClick={changeHomeroomTeacher} className="filled-gray-dark" />
              </>
            ) : (
              <Button.sm children={t('edit')} onClick={() => setEditHomeroomTeacher(true)} className="outlined-gray" />
            )}
          </div>
        </div>
        {editHomeroomTeacher ? (
          <Admin.Card>
            <Select
              placeholder={`${t('select_teacher')}`}
              value={homeroomTeacherId}
              onChange={(e) => setHomeroomTeacherId(Number(e.target.value))}
            >
              {allTeachers?.items
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {getNickName(t.nickName)} {t.email}
                  </option>
                ))}
            </Select>
          </Admin.Card>
        ) : (
          <Admin.Card className="grid grid-cols-3 divide-x">
            <Admin.Cell>
              <Label.Text children={t('role')} />
              <p className="mt-2">
                {klassInfo?.homeroomTeacherInfo?.teacherData?.role &&
                  t(`Role.${klassInfo?.homeroomTeacherInfo?.teacherData?.role}`)}
              </p>
            </Admin.Cell>
            <Admin.Cell>
              <Label.Text children={t('name')} />
              <p className="mt-2">
                {klassInfo?.homeroomTeacherInfo?.teacherData?.name +
                  getNickName(klassInfo?.homeroomTeacherInfo?.teacherData?.nickName)}
              </p>
            </Admin.Cell>
            <Admin.Cell>
              <Label.Text children={t('email')} />
              <p className="mt-2">{klassInfo?.homeroomTeacherInfo?.teacherData?.email}</p>
            </Admin.Cell>
          </Admin.Card>
        )}
      </Admin.Section>

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
          <div className="flex items-center gap-2">
            <Select {...registerGroupTeacher('userId', { valueAsNumber: true })}>
              {allTeachers?.items
                .filter((t) => klassInfo?.subjectTeacherInfo?.every((ti) => t.id !== ti.id))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {getNickName(t.nickName)} {t.email}
                  </option>
                ))}
            </Select>
            <TextInput
              placeholder={`${t('subject')}`}
              {...registerGroupTeacher('subject')}
              className="h-9 max-w-[200px]"
            />
            <Button children={t('add')} onClick={handleGroupTeacherSubmit(addGroupTeacher)} className="filled-gray" />
          </div>
        )}
        <Admin.Table>
          <Admin.TableHead>
            <Admin.TableRow>
              <Admin.TableHCell children={t('role')} />
              <Admin.TableHCell children={t('name')} />
              <Admin.TableHCell children={t('subject')} />
              {editTeachers && <Admin.TableHCell />}
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {klassInfo?.subjectTeacherInfo?.map((teacher, i) => (
              <Admin.TableRow key={`${teacher.id}-${i}`} to={`${Routes.admin.teacher.index}/${teacher.id}`}>
                <Admin.TableCell children={t(`Role.${teacher.role}`)} />
                <Admin.TableCell children={teacher.name + getNickName(teacher.nickName)} />
                <Admin.TableCell children={teacher.subject} />
                {editTeachers && (
                  <Admin.TableCell>
                    <Button.sm
                      children={t('delete')}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!klassId) return
                        groupManagementDeleteTeacher(klassId, teacher.id)
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
                disabled={groupStudents.size === 0}
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
                <Admin.TableHCell children={t('name')} />
                <Admin.TableHCell children={t('email')} />
                <Admin.TableHCell children={t('insert_attendance_number')} />
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
                  <Admin.TableCell children={student.name + getNickName(student.nickName)} />
                  <Admin.TableCell children={student.email} />
                  <Admin.TableCell onClick={(e) => e.stopPropagation()}>
                    {unregisteredStudentsCb.checked(i) && (
                      <NumberInput
                        placeholder={`${t('insert_attendance_number')}`}
                        className="-my-2 h-7 max-w-[200px] rounded"
                        onChange={(e) =>
                          setGroupStudents((prev) =>
                            new Map(prev).set(student.id, {
                              userId: student.id,
                              studentNumber: Number(e.target.value),
                            }),
                          )
                        }
                      />
                    )}
                  </Admin.TableCell>
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
            {klassInfo?.studentInfo?.map((student, i) => (
              <Admin.TableRow key={student.id} to={`${Routes.admin.student.index}/${student.user.id}`}>
                {editStudents && (
                  <Admin.TableCell onClick={(e) => (e.stopPropagation(), registeredStudentsCb.click(i))}>
                    <Checkbox
                      checked={registeredStudentsCb.checked(i)}
                      onChange={() => registeredStudentsCb.click(i)}
                    />
                  </Admin.TableCell>
                )}
                <Admin.TableCell
                  children={student?.user?.studentGroups && student?.user?.studentGroups[0]?.group.name}
                />
                <Admin.TableCell
                  children={student?.user?.studentGroups && student?.user?.studentGroups[0]?.studentNumber}
                />
                <Admin.TableCell children={student.user.name + getNickName(student.user.nickName)} />
              </Admin.TableRow>
            ))}
          </Admin.TableBody>
        </Admin.Table>
      </Admin.Section>
    </>
  )
}
