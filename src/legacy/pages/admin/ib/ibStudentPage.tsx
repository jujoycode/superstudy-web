import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { Admin } from '@/legacy/components/common/Admin'
import { twMerge } from 'tailwind-merge'

export function IbStudentPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  return (
    <Admin.Section>
      <Admin.H2>{t('ib_management')}</Admin.H2>
      <div className="flex h-12 w-max flex-row items-end gap-4">
        <Link
          to={`/admin/ib`}
          className={twMerge(
            clsx(
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
            clsx(
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
            clsx(
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
      <Admin.H1 className="pt-10">IB 학생 정보 관리</Admin.H1>
    </Admin.Section>
  )
}
