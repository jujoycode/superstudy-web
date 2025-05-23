import { MenuConstant } from '@/constants/menuConstant'
import { Box } from '@/atoms/Box'
import { Divider } from '@/atoms/Divider'
import { Flex } from '@/atoms/Flex'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ScrollArea } from '@/atoms/ScrollArea'
import { Text } from '@/atoms/Text'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'
import { NavigationItem } from '@/molecules/navigation/NavigationItem'
import type { NavigationProfileProps } from '@/molecules/navigation/NavigationProfile'

export type TeacherLNBProps = {
  HeaderProps: NavigationProfileProps
}

export function TeacherLNB({ HeaderProps }: TeacherLNBProps) {
  return (
    <Grid col={1} row={12} className="h-screen border-r-1 border-gray-200">
      {/* Header */}
      <GridItem rowSpan={2}>
        <NavigationHeader ProfileProps={HeaderProps} />
        <Divider marginY="0" />
      </GridItem>

      <GridItem className="row-span-10">
        <ScrollArea>
          <Box width="full" padding="5" className="mt-4 pt-0">
            {MenuConstant.TEACHER_MENU.map((items) => {
              return (
                <>
                  <Box padding="3">
                    <Text variant="sub" className="mb-1" size="sm">
                      {items.name}
                    </Text>
                    <Flex direction="col" gap="0.5">
                      {items.children?.map((menu) => {
                        return <NavigationItem {...menu} />
                      })}
                    </Flex>
                  </Box>

                  <Divider marginY="0" />
                </>
              )
            })}
            <Divider marginY="0" />
            <Flex width="full" justify="between" items="center" gap="3">
              <Text variant="sub" className="mb-1" size="sm">
                내 정보 관리
              </Text>
              <Divider orientation="vertical" marginY="0" />
              <Text variant="sub" className="mb-1" size="sm">
                로그아웃
              </Text>
            </Flex>
          </Box>
        </ScrollArea>
      </GridItem>
    </Grid>
  )
}
