import { cn } from '@/utils/commonUtil'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { twMerge } from 'tailwind-merge'

import { Admin } from '@/legacy/components/common/Admin'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { Typography } from '@/legacy/components/common/Typography'
import ConfirmSelectBar from '@/legacy/components/ib/coordinator/ConfirmSelectBar'
import { useGetIBCoordinators, useUpateIBCoordinator } from '@/legacy/container/ib-admin'
import { useUserGetAllTeachers } from '@/legacy/generated/endpoint'
import { RequestCoordinatorDto } from '@/legacy/generated/model'

export function IbCoordinatorPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [ibAdmin, setIbAdmin] = useState<number | null>(null)
  const [casCoordinator, setCasCoordinator] = useState<number | null>(null)
  const [eeCoordinator, setEeCoordinator] = useState<number | null>(null)
  const [tokCoordinator, setTokCoordinator] = useState<number | null>(null)
  const { data, refetch } = useGetIBCoordinators()
  const { data: teachersData } = useUserGetAllTeachers()

  const { updateIBCoordinator } = useUpateIBCoordinator({
    onSuccess: () => {
      setAlertMessage(`정보가\n저장되었습니다`)
      refetch()
    },
    onError: (error) => {
      console.error('정보 저장 중 오류 발생:', error)
    },
  })

  const teachers = _(teachersData)
    .map((teacher) => ({
      id: teacher.id,
      value: teacher.id,
      text: teacher.name || '이름 없음',
    }))
    .value()

  useEffect(() => {
    if (data?.items) {
      data.items.forEach((item) => {
        if (!item) return
        switch (item.type) {
          case 'IB_ALL':
            setIbAdmin(item.teacher.id)
            break
          case 'IB_CAS':
            setCasCoordinator(item.teacher.id)
            break
          case 'IB_EE':
            setEeCoordinator(item.teacher.id)
            break
          case 'IB_TOK':
            setTokCoordinator(item.teacher.id)
            break
          default:
            break
        }
      })
    }
  }, [data])

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
      <Admin.H1 className="pt-10">IB 관리자 및 코디 지정</Admin.H1>
      <Admin.Box className="flex flex-col border-y border-y-gray-300">
        <div className="flex items-center gap-4 border-b border-b-gray-300 p-4">
          <Typography variant="body3" className="w-[200px] text-center font-semibold">
            구분
          </Typography>
          <Typography variant="body3" className="w-30 text-center font-semibold">
            교사 지정
          </Typography>
        </div>
        <div className="flex items-center gap-4 border-b border-b-gray-300 p-4">
          <Typography variant="body3" className="w-[200px] font-medium">
            IB 관리자
          </Typography>
          <ConfirmSelectBar
            options={teachers}
            value={ibAdmin}
            onChange={setIbAdmin}
            onConfirm={(mentorId) => {
              const payload: RequestCoordinatorDto = { teacherId: mentorId, type: 'IB_ALL' }
              updateIBCoordinator(payload)
            }}
            placeholder="교사 지정하기"
            size={32}
            containerWidth="w-30"
            dropdownWidth="w-[176px]"
          />
        </div>
        <div className="flex items-center gap-4 border-b border-b-gray-300 p-4">
          <Typography variant="body3" className="w-[200px] font-medium">
            CAS 코디네이터
          </Typography>
          <ConfirmSelectBar
            options={teachers}
            value={casCoordinator}
            onChange={setCasCoordinator}
            onConfirm={(mentorId) => {
              const payload: RequestCoordinatorDto = { teacherId: mentorId, type: 'IB_CAS' }
              updateIBCoordinator(payload)
            }}
            placeholder="교사 지정하기"
            size={32}
            containerWidth="w-30"
            dropdownWidth="w-[176px]"
          />
        </div>
        <div className="flex items-center gap-4 border-b border-b-gray-300 p-4">
          <Typography variant="body3" className="w-[200px] font-medium">
            EE 코디네이터
          </Typography>
          <ConfirmSelectBar
            options={teachers}
            value={eeCoordinator}
            onChange={setEeCoordinator}
            onConfirm={(mentorId) => {
              const payload: RequestCoordinatorDto = { teacherId: mentorId, type: 'IB_EE' }
              updateIBCoordinator(payload)
            }}
            placeholder="교사 지정하기"
            size={32}
            containerWidth="w-30"
            dropdownWidth="w-[176px]"
          />
        </div>
        <div className="flex items-center gap-4 p-4">
          <Typography variant="body3" className="w-[200px] font-medium">
            TOK 코디네이터
          </Typography>
          <ConfirmSelectBar
            options={teachers}
            value={tokCoordinator}
            onChange={setTokCoordinator}
            onConfirm={(mentorId) => {
              const payload: RequestCoordinatorDto = { teacherId: mentorId, type: 'IB_TOK' }
              updateIBCoordinator(payload)
            }}
            placeholder="교사 지정하기"
            size={32}
            containerWidth="w-30"
            dropdownWidth="w-[176px]"
          />
        </div>
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
