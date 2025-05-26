import { useMemo } from 'react'
import { Link } from 'react-router'
import { useLanguage } from '@/hooks/useLanguage'
import { useLogout } from '@/hooks/useLogout'
import { useUserStore } from '@/stores/user'
import { Box } from '@/atoms/Box'
import { Button } from '@/atoms/Button'
import { Divider } from '@/atoms/Divider'
import { Flex } from '@/atoms/Flex'
import { Text } from '@/atoms/Text'
import { Role } from '@/legacy/generated/model'

export function NavigationFooter() {
  const { me } = useUserStore()
  const { t } = useLanguage()

  const adminPermission = useMemo(
    () =>
      me?.teacherPermission?.adminApprovalLine ||
      me?.teacherPermission?.adminClass ||
      me?.teacherPermission?.adminGroup ||
      me?.teacherPermission?.adminParent ||
      me?.teacherPermission?.adminSms ||
      me?.teacherPermission?.adminScore ||
      me?.teacherPermission?.adminStudent ||
      me?.teacherPermission?.adminTeacher ||
      me?.teacherPermission?.adminTimetable ||
      me?.teacherPermission?.adminIb,
    [me],
  )

  return (
    <Box className="pb-4">
      <Flex direction="col" width="full" justify="between" items="center" gap="4">
        {(me?.role === Role.ADMIN || adminPermission) && (
          <Link to="/admin" className="w-full">
            <Button variant="solid" size="full" className="bg-gray-200 hover:bg-gray-300">
              <Text size="sm">{t('admin_mode')}</Text>
            </Button>
          </Link>
        )}

        <Flex direction="row" items="center" justify="center">
          <Button variant="link" size="full" className="text-gray-600 hover:text-gray-700">
            <Text size="xs" weight="sm">
              내 정보 관리
            </Text>
          </Button>

          <Divider orientation="vertical" />

          <Button variant="link" size="full" className="text-gray-600 hover:text-gray-700" onClick={useLogout()}>
            <Text size="xs" weight="sm">
              로그아웃
            </Text>
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
