import clsx from 'clsx'
import { ChangeEvent, useContext } from 'react'
import { Link, useParams } from 'react-router'

import { Label } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Routes } from '@/legacy/constants/routes'
import { teacherManagementUpdateTeacher, useTeacherManagementGetTeacherInfo } from '@/legacy/generated/endpoint'
import { GroupType, Role, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSignedUrl } from '@/legacy/lib/query'
import { getNickName } from '@/legacy/util/status'

import { AdminContext } from '../AdminMainPage'

export function TeacherDetailsPage() {
  const { t } = useLanguage()
  const { year } = useContext(AdminContext)
  const { id: idString } = useParams<{ id: string }>()
  const id = Number(idString)

  const { handleUploadFile } = useFileUpload()

  const { data: teacher } = useTeacherManagementGetTeacherInfo(id, { year })
  const { data: profile } = useSignedUrl(teacher?.teacherData.profile)

  async function uploadProfile(e: ChangeEvent<HTMLInputElement>) {
    const [profile] = await handleUploadFile(UploadFileTypeEnum.profiles, [...(e.target.files ?? [])])
    await teacherManagementUpdateTeacher(id, { profile })
  }

  return (
    <>
      <Admin.Section>
        <Admin.H2>{t('teacher_information')}</Admin.H2>
        <div className="flex gap-2">
          <Button.sm as={Link} children={t('edit')} to={`${id}/edit`} className="outlined-gray" />
        </div>
        <Admin.Card className="grid grid-cols-5 divide-x">
          <Admin.Cell>
            <Label.Text children={t('photo')} />
            <div className="mt-2 flex h-40 items-center justify-center">
              {teacher?.teacherData.profile ? (
                <img src={profile} className="aspect-square h-full object-cover" />
              ) : (
                <p className="text-gray-500">{t('no_image_registered')}</p>
              )}
            </div>
            {teacher?.teacherData.profile ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  children={t('delete')}
                  onClick={() =>
                    confirm('프로필 이미지를 삭제하시겠습니까?') && teacherManagementUpdateTeacher(id, { profile: '' })
                  }
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
          <Admin.Cell className="grid grid-rows-5">
            <div>
              <Label.Text children={t('name')} />

              <p className="mt-2">{teacher?.teacherData.name + getNickName(teacher?.teacherData.nickName)}</p>
            </div>
            <div>
              <Label.Text children={t('email')} />
              <p className="mt-2">{teacher?.teacherData.email}</p>
            </div>
            <div>
              <Label.Text children={t('phone_number')} />
              <p className="mt-2">{teacher?.teacherData.phone}</p>
            </div>
            <div>
              <Label.Text children={t('status')} />
              <div className="mt-2 flex items-center space-x-2">
                <p className="">
                  {teacher?.teacherData.firstVisit
                    ? t('not_joined')
                    : teacher?.teacherData.expiredReason || t('employed')}
                </p>
                {!!teacher?.teacherData.loginFailCount && teacher?.teacherData.loginFailCount >= 5 && (
                  <Button.sm
                    children={t('unlock_password')}
                    onClick={() => {
                      const text = t('confirm_unlock_password')
                      confirm(text) && teacherManagementUpdateTeacher(id, { loginFailCount: 0 })
                    }}
                    className="filled-red-light"
                  />
                )}
              </div>
            </div>
          </Admin.Cell>
          <Admin.Cell className="grid grid-rows-5">
            <div>
              <Label.Text children={t('role')} />
              <p className="mt-2">
                {(teacher?.teacherData.role === Role.HEAD || teacher?.teacherData.role === Role.PRE_HEAD) &&
                  teacher?.teacherData.headNumber}
                {t(`Role.${teacher?.teacherData.role}`)}
              </p>
            </div>
            <div>
              <Label.Text children={t('department')} />
              <p className="mt-2">{teacher?.teacherData.department}</p>
            </div>
            <div>
              <Label.Text children={t('approval_position')} />
              <p className="mt-2">{teacher?.teacherData.position}</p>
            </div>
            <div>
              <Label.Text children={t('homeroom_teacher')} />
              <p className="mt-2">{teacher?.teacherKlass?.group.name}</p>
            </div>
          </Admin.Cell>
          <Admin.Cell className="grid grid-rows-5">
            <div>
              <Label.Text children={t('notice_management')} />
              <p className={clsx('mt-2', !teacher?.teacherData?.canEditNotice && 'text-gray-300')}>
                {teacher?.teacherData?.canEditNotice ? t('exists') : t('none')}
              </p>
            </div>
            <div>
              <Label.Text children={t('newsletter_management')} />
              <p className={clsx('mt-2', !teacher?.teacherData?.canEditNewsletter && 'text-gray-300')}>
                {teacher?.teacherData?.canEditNewsletter ? t('exists') : t('none')}
              </p>
            </div>
            <div>
              <Label.Text children={t('schedule_management')} />
              <p className={clsx('mt-2', !teacher?.teacherData?.canEditTimetable && 'text-gray-300')}>
                {teacher?.teacherData?.canEditTimetable ? t('exists') : t('none')}
              </p>
            </div>
            <div>
              <Label.Text children={t('meal_menu_management')} />
              <p className={clsx('mt-2', !teacher?.teacherData?.canEditCanteen && 'text-gray-300')}>
                {teacher?.teacherData?.canEditCanteen ? t('exists') : t('none')}
              </p>
            </div>
          </Admin.Cell>
          <Admin.Cell className="grid grid-rows-5 space-y-2">
            <div className="font-bold">관리자 권한</div>
            {teacher?.teacherData?.adminTeacher && (
              <div>
                <Label.Text children="선생님 관리 권한" />
                <p className={clsx('mt-2', !teacher?.teacherData?.adminTeacher && 'text-gray-300')}>
                  {teacher?.teacherData?.adminTeacher ? '있음' : '없음'}
                </p>
              </div>
            )}
            {teacher?.teacherData?.adminStudent && (
              <div>
                <Label.Text children="학생 관리 권한" />
                <p className={clsx('mt-2', !teacher?.teacherData?.adminStudent && 'text-gray-300')}>
                  {teacher?.teacherData?.adminStudent ? '있음' : '없음'}
                </p>
              </div>
            )}
            {teacher?.teacherData?.adminParent && (
              <div>
                <Label.Text children="보호자 관리 권한" />
                <p className={clsx('mt-2', !teacher?.teacherData?.adminParent && 'text-gray-300')}>
                  {teacher?.teacherData?.adminParent ? '있음' : '없음'}
                </p>
              </div>
            )}
            {teacher?.teacherData?.adminClass && (
              <div>
                <Label.Text children="학급 관리 권한" />
                <p className={clsx('mt-2', !teacher?.teacherData?.adminClass && 'text-gray-300')}>
                  {teacher?.teacherData?.adminClass ? '있음' : '없음'}
                </p>
              </div>
            )}
            {teacher?.teacherData?.adminGroup && (
              <div>
                <Label.Text children="그룹 관리 권한" />
                <p className={clsx('mt-2', !teacher?.teacherData?.adminGroup && 'text-gray-300')}>
                  {teacher?.teacherData?.adminGroup ? '있음' : '없음'}
                </p>
              </div>
            )}
            {teacher?.teacherData?.adminApprovalLine && (
              <div>
                <Label.Text children="결재라인 관리 권한" />
                <p className={clsx('mt-2', !teacher?.teacherData?.adminApprovalLine && 'text-gray-300')}>
                  {teacher?.teacherData?.adminApprovalLine ? '있음' : '없음'}
                </p>
              </div>
            )}
            {teacher?.teacherData?.adminTimetable && (
              <div>
                <Label.Text children="시간표 관리 권한" />
                <p className={clsx('mt-2', !teacher?.teacherData?.adminTimetable && 'text-gray-300')}>
                  {teacher?.teacherData?.adminTimetable ? '있음' : '없음'}
                </p>
              </div>
            )}
            {teacher?.teacherData?.adminSms && (
              <div>
                <Label.Text children="문자비용 관리 권한" />
                <p className={clsx('mt-2', !teacher?.teacherData?.adminSms && 'text-gray-300')}>
                  {teacher?.teacherData?.adminSms ? '있음' : '없음'}
                </p>
              </div>
            )}
            {teacher?.teacherData?.adminScore && (
              <div>
                <Label.Text children="성적 관리 권한" />
                <p className={clsx('mt-2', !teacher?.teacherData?.adminScore && 'text-gray-300')}>
                  {teacher?.teacherData?.adminScore ? '있음' : '없음'}
                </p>
              </div>
            )}
            {teacher?.teacherData?.adminIb && (
              <div>
                <Label.Text children="IB 관리 권한" />
                <p className={clsx('mt-2', !teacher?.teacherData?.adminIb && 'text-gray-300')}>
                  {teacher?.teacherData?.adminIb ? '있음' : '없음'}
                </p>
              </div>
            )}
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
              <Admin.TableHCell children={t('subject')} />
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {teacher?.teacherGroups?.map((teacherGroup) => (
              <Admin.TableRow
                key={teacherGroup.id}
                to={
                  teacherGroup.group.type === GroupType.KLASS
                    ? `${Routes.admin.klass.index}/${teacherGroup.groupId}`
                    : `${Routes.admin.group.index}/${teacherGroup.groupId}`
                }
              >
                <Admin.TableCell children={teacherGroup.group.year} />
                <Admin.TableCell children={t(`GroupType.${teacherGroup.group.type}`)} />
                <Admin.TableCell children={teacherGroup.group.name} />
                <Admin.TableCell
                  children={teacherGroup.subject === '우리반' ? t('homeroom_teacher') : teacherGroup.subject}
                />
              </Admin.TableRow>
            ))}
          </Admin.TableBody>
        </Admin.Table>
      </Admin.Section>
    </>
  )
}
