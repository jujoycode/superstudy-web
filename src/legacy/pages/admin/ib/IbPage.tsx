import { cn } from '@/utils/commonUtil'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { twMerge } from 'tailwind-merge'

import { Admin } from '@/legacy/components/common/Admin'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { InputField } from '@/legacy/components/ib/InputField'
import { useCreateIBSchool, useGetIBSchoolInfo, useUpateIBSchool } from '@/legacy/container/ib-admin'
import { type RequestIBSchoolManagementDto } from '@/legacy/generated/model'

export function IbPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [editMode, setEditMode] = useState(false)
  const { data, isLoading, refetch } = useGetIBSchoolInfo()
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const formatSession = (session?: string) => {
    if (!session) return 'Session 정보를 입력해주세요.'
    return moment(session).locale('en').format('MMMM YYYY')
  }

  const { createIBSchool } = useCreateIBSchool({
    onSuccess: () => {
      setAlertMessage(`IB 학교 정보가\n저장되었습니다`)
      refetch()
    },
    onError: (error) => {
      console.error('IB 학교 정보 저장 중 오류 발생:', error)
    },
  })

  const { updateIBSchool } = useUpateIBSchool({
    onSuccess: () => {
      setAlertMessage(`IB 학교 정보가\n수정되었습니다`)
      refetch()
    },
    onError: (error) => {
      console.error('IB 학교 정보 수정 중 오류 발생:', error)
    },
  })
  const { handleSubmit, control, reset } = useForm<RequestIBSchoolManagementDto>({
    defaultValues: data,
  })

  const onSubmit = (formData: RequestIBSchoolManagementDto) => {
    console.log(formData)
    if (isLoading) return

    if (data === undefined) {
      createIBSchool(formData)
    } else {
      updateIBSchool(formData)
    }
    setEditMode(!editMode)
  }

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        code: data.code,
        session: data.session,
      })
    }
  }, [data, reset])

  return (
    <Admin.Section>
      <Admin.H2>{t('ib_management')}</Admin.H2>
      <div className="flex h-12 w-max flex-row items-end gap-4">
        <Link
          to={`/admin/ib`}
          className={twMerge(
            cn(
              'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
              pathname.startsWith('/admin/ib') && !pathname.includes('teacher') && !pathname.includes('student')
                ? 'border-b-2 border-[#121316] text-[#121316]'
                : 'mb-[2px] text-[#898d94]',
            ),
          )}
        >
          <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
            IB 학교 정보 관리
          </div>
        </Link>
        <Link
          to={`/admin/ib/teacher`}
          className={twMerge(
            cn(
              'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
              pathname.startsWith('/admin/ib/teacher')
                ? 'border-b-2 border-[#121316] text-[#121316]'
                : 'mb-[2px] text-[#898d94]',
            ),
          )}
        >
          <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
            IB 관리자 및 코디 지정
          </div>
        </Link>
        <Link
          to={`/admin/ib/student`}
          className={twMerge(
            cn(
              'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
              pathname.startsWith('/admin/ib/student')
                ? 'border-b-2 border-[#121316] text-[#121316]'
                : 'mb-[2px] text-[#898d94]',
            ),
          )}
        >
          <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
            응시생 코드 관리
          </div>
        </Link>
      </div>
      <Admin.H1 className="pt-10">IB 학교 정보 관리</Admin.H1>
      <div className="flex justify-end">
        {editMode ? (
          <nav className="flex flex-row items-center gap-2">
            <ButtonV2 variant="outline" color="gray400" size={32} onClick={() => setEditMode(!editMode)}>
              취소
            </ButtonV2>
            <ButtonV2 variant="solid" color="gray700" size={32} onClick={handleSubmit(onSubmit)}>
              저장
            </ButtonV2>
          </nav>
        ) : (
          <ButtonV2 variant="solid" color="gray700" size={32} onClick={() => setEditMode(!editMode)}>
            {data === undefined ? '등록' : '수정'}
          </ButtonV2>
        )}
      </div>
      <Admin.Box className="flex flex-col border-y border-y-gray-300">
        {editMode ? (
          <>
            <div className="flex flex-row items-center border-b border-gray-300 p-4">
              <Typography variant="body3" className="min-w-[117px] font-medium">
                학교 이름
              </Typography>
              <InputField name="name" placeholder="학교 이름을 입력해주세요." control={control} className="flex-1" />
            </div>
            <div className="flex flex-row items-center border-b border-gray-300 p-4">
              <Typography variant="body3" className="min-w-[117px] font-medium">
                학교 번호
              </Typography>
              <InputField name="code" placeholder="학교 번호를 입력해주세요." control={control} className="flex-1" />
            </div>
            <div className="flex flex-row items-center p-4">
              <Typography variant="body3" className="min-w-[117px] font-medium">
                Session
              </Typography>
              <InputField
                name="session"
                inputType="month"
                placeholder="Session 정보를 입력해주세요."
                control={control}
                className="flex-1"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-row items-center border-b border-gray-300 p-4">
              <Typography variant="body3" className="min-w-[117px] font-medium">
                학교 이름
              </Typography>
              <Typography variant="body3" className="text-gray-700">
                {data?.name || '학교 이름을 입력해주세요.'}
              </Typography>
            </div>
            <div className="flex flex-row items-center border-b border-gray-300 p-4">
              <Typography variant="body3" className="min-w-[117px] font-medium">
                학교 번호
              </Typography>
              <Typography variant="body3" className="text-gray-700">
                {data?.code || '학교 번호를 입력해주세요.'}
              </Typography>
            </div>
            <div className="flex flex-row items-center p-4">
              <Typography variant="body3" className="min-w-[117px] font-medium">
                Session
              </Typography>
              <Typography variant="body3" className="text-gray-700">
                {data && formatSession(data?.session)}
              </Typography>
            </div>
          </>
        )}
      </Admin.Box>
      {alertMessage && (
        <AlertV2
          message={alertMessage}
          confirmText="확인"
          onConfirm={() => {
            setAlertMessage(null)
          }}
        />
      )}
    </Admin.Section>
  )
}
