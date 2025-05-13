import { ChangeEvent, useContext } from 'react'
import { Link, useParams } from 'react-router'

import { Label } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Routes } from '@/legacy/constants/routes'
import { studentManagementUpdateStudent, useStudentManagementGetStudentInfo } from '@/legacy/generated/endpoint'
import { GroupType, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSignedUrl } from '@/legacy/lib/query'

import { AdminContext } from '@/legacy/pages/admin/AdminMainPage'

export function StudentDetailsPage() {
  const { t } = useLanguage()
  const { year } = useContext(AdminContext)
  const { id: idString } = useParams<{ id: string }>()
  const id = Number(idString)

  const { handleUploadFile } = useFileUpload()

  const { data: student } = useStudentManagementGetStudentInfo(id, { year })
  const { data: profile } = useSignedUrl(student?.studentData.profile)

  async function uploadProfile(e: ChangeEvent<HTMLInputElement>) {
    const [profile] = await handleUploadFile(UploadFileTypeEnum.profiles, [...(e.target.files ?? [])])
    await studentManagementUpdateStudent(id, { profile })
  }

  return (
    <>
      <Admin.Section>
        <Admin.H2>{t('student_information')}</Admin.H2>
        <div className="flex gap-2">
          <Button.sm as={Link} children={t('edit')} to={`${id}/edit`} className="outlined-gray" />
        </div>
        <Admin.Card className="grid grid-cols-3 divide-x">
          <Admin.Cell>
            <Label.Text children={t('photo')} />
            <div className="mt-2 flex h-40 items-center justify-center">
              {student?.studentData.profile ? (
                <img src={profile} className="aspect-square h-full object-cover" />
              ) : (
                <p className="text-gray-500">{t('no_image_registered')}</p>
              )}
            </div>
            {student?.studentData.profile ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  children={t('delete')}
                  onClick={() => {
                    const text = t('confirm_delete_profile_image')
                    confirm(text) && studentManagementUpdateStudent(id, { profile: '' })
                  }}
                  className="filled-red-light"
                />
                <Button as="label" className="outlined-gray cursor-pointer">
                  <p>{t('edit_image')}</p>
                  <input type="file" accept=".png, .jpeg, .jpg" onChange={uploadProfile} className="sr-only" />
                </Button>
              </div>
            ) : (
              <Button as="label" className="filled-gray-light mt-4 cursor-pointer">
                <p>{t('image_upload')}</p>
                <input type="file" accept=".png, .jpeg, .jpg" onChange={uploadProfile} className="sr-only" />
              </Button>
            )}
          </Admin.Cell>
          <Admin.Cell className="grid grid-rows-4">
            <div>
              <Label.Text children={t('name')} />
              <p className="mt-2">{student?.studentData.name}</p>
            </div>
            <div>
              <Label.Text children={t('nickname')} />
              <p className="mt-2">{student?.studentData.nickName}</p>
            </div>
            <div>
              <Label.Text children={t('email')} />
              <p className="mt-2">{student?.studentData.email}</p>
            </div>
            <div>
              <Label.Text children={t('phone_number')} />
              <p className="mt-2">{student?.studentData.phone}</p>
            </div>
            <div>
              <Label.Text children={t('status')} />
              <div className="mt-2 flex items-center space-x-2">
                <p className="">
                  {student?.studentData.firstVisit
                    ? t('not_joined')
                    : t(`Student_Status.${student?.studentData.expiredReason}`) || t('signup_complete')}
                </p>
                {!!student?.studentData.loginFailCount && student?.studentData.loginFailCount >= 5 && (
                  <Button.sm
                    children={t('unlock_password')}
                    onClick={() => {
                      const text = t('confirm_unlock_password')
                      confirm(text) && studentManagementUpdateStudent(id, { loginFailCount: 0 })
                    }}
                    className="filled-red-light"
                  />
                )}
              </div>
            </div>
          </Admin.Cell>
          <Admin.Cell className="grid grid-rows-3">
            <div>
              <Label.Text children={t('parent_name')} />
              <p className="mt-2">{student?.studentData.nokName}</p>
            </div>
            <div>
              <Label.Text children={t('parent_phone_number')} />
              <p className="mt-2">{student?.studentData.nokPhone}</p>
            </div>
            <div>
              <Label.Text children={t('member_barcode')} />
              <p className="mt-2">{student?.studentData.barcode}</p>
            </div>
          </Admin.Cell>
        </Admin.Card>
      </Admin.Section>

      <Admin.Section>
        <Admin.H2>{t('affiliated_group')}</Admin.H2>
        <Admin.Table>
          <Admin.TableHead>
            <Admin.TableRow>
              <Admin.TableHCell children={t('year')} />
              <Admin.TableHCell children={t('type')} />
              <Admin.TableHCell children={t('name')} />
              <Admin.TableHCell children={t('attendance_number')} />
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {student?.studentGroups?.map((studentGroup) => (
              <Admin.TableRow
                key={studentGroup.id}
                to={
                  studentGroup.group.type === GroupType.KLASS
                    ? `${Routes.admin.klass.index}/${studentGroup.groupId}`
                    : `${Routes.admin.group.index}/${studentGroup.groupId}`
                }
              >
                <Admin.TableCell children={studentGroup.group.year} />
                <Admin.TableCell children={t(`GroupType.${studentGroup.group.type}`)} />
                <Admin.TableCell children={studentGroup.group.name} />
                <Admin.TableCell children={studentGroup.studentNumber} />
              </Admin.TableRow>
            ))}
          </Admin.TableBody>
        </Admin.Table>
      </Admin.Section>
    </>
  )
}
