import { cn } from '@/utils/commonUtil'
import { MenuConstant } from '@/constants/menuConstant'
import { Box } from '@/atoms/Box'
import { Divider } from '@/atoms/Divider'
import { Flex } from '@/atoms/Flex'
import { ScrollArea } from '@/atoms/ScrollArea'
import { Text } from '@/atoms/Text'
import { NavigationFooter } from '@/molecules/navigation/NavigationFooter'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'
import { NavigationItem } from '@/molecules/navigation/NavigationItem'
import type { NavigationProfileProps } from '@/molecules/navigation/NavigationProfile'

export type TeacherLNBProps = {
  HeaderProps: NavigationProfileProps
}

export function TeacherLNB({ HeaderProps }: TeacherLNBProps) {
  return (
    <Flex direction="col" className="h-screen w-full max-w-[280px] border-r border-gray-200 bg-gray-50">
      {/* Header */}
      <NavigationHeader ProfileProps={HeaderProps} />

      <Divider marginY="0" />

      {/* Body */}
      <ScrollArea className="w-full">
        <Box height="screen" width="full" padding="5" className="mt-4 pt-0">
          {MenuConstant.TEACHER_MENU.map((section, sectionIndex) => {
            return (
              <Box key={sectionIndex} className={cn('mb-6 px-2', sectionIndex === 0 && 'mt-7')}>
                <Text variant="dim" className="mb-1 px-2" size="sm" weight="sm">
                  {section.title}
                </Text>

                {section.child?.map((child, index) => {
                  return <NavigationItem key={index} {...child} />
                })}
              </Box>
            )
          })}

          {/* Footer */}
          <NavigationFooter />
        </Box>
      </ScrollArea>
    </Flex>
  )
}
