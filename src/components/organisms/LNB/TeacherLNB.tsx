import { MenuConstant } from '@/constants/menuConstant'
import { Box } from '@/atoms/Box'
import { Divider } from '@/atoms/Divider'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ScrollArea } from '@/atoms/ScrollArea'
import { Text } from '@/atoms/Text'
import { NavigationFooter } from '@/molecules/navigation/NavigationFooter'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'
import { NavigationContainer } from '@/molecules/navigation/NavigationContainer'
import type { NavigationProfileProps } from '@/molecules/navigation/NavigationProfile'

export type TeacherLNBProps = {
  HeaderProps: NavigationProfileProps
}

export function TeacherLNB({ HeaderProps }: TeacherLNBProps) {
  return (
    <Grid col={1} row={12} className="h-screen max-w-[240px] min-w-[230px] border-r-1 border-gray-200">
      {/* Header */}
      <GridItem rowSpan={2} className="max-h-[150px]">
        <NavigationHeader ProfileProps={HeaderProps} />
      </GridItem>

      <GridItem className="row-span-10">
        <Divider marginY="0" className="mt-2" />
        <ScrollArea>
          <Box width="full" padding="5" className="mt-4 pt-0">
            {MenuConstant.TEACHER_MENU.map((section, sectionIndex) => {
              return (
                <Box key={sectionIndex} padding="3">
                  <Text variant="sub" className="mb-1" size="sm">
                    {section.name}
                  </Text>
                  <NavigationContainer items={section.children || []} />
                  {sectionIndex < MenuConstant.TEACHER_MENU.length - 1 && <Divider marginY="0" className="mt-2" />}
                </Box>
              )
            })}
            <NavigationFooter />
          </Box>
        </ScrollArea>
      </GridItem>
    </Grid>
  )
}
