import { Box } from '@/atoms/Box'
import { Divider } from '@/atoms/Divider'
import { Flex } from '@/atoms/Flex'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ScrollArea } from '@/atoms/ScrollArea'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'
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
      </GridItem>
      <Divider marginY="4" />

      {/* 여기서 남은 행을 모두 차지하도록 rowSpan 설정 */}
      <GridItem rowSpan={6} className="h-full">
        <ScrollArea>
          <Box className="bg-primary-50">
            테스트 value
            {/* 스크롤 테스트를 위한 추가 콘텐츠 */}
            {Array(20)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="py-4">
                  테스트 아이템 {i + 1}
                </div>
              ))}
          </Box>
        </ScrollArea>
      </GridItem>
    </Grid>
  )
}
