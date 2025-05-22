import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'
import type { NavigationProfileProps } from '@/molecules/navigation/NavigationProfile'

export type TeacherLNBProps = {
  HeaderProps: NavigationProfileProps
}

export function TeacherLNB({ HeaderProps }: TeacherLNBProps) {
  return (
    <Grid>
      {/* Header */}
      <GridItem colSpan={10}>
        <NavigationHeader ProfileProps={HeaderProps} />
      </GridItem>
      {/* Body */}
      {/* Footer */}
    </Grid>
    // <Container
    //   noPadding
    //   flex
    //   direction="col"
    //   justify="start"
    //   items="center"
    //   height="screen"
    //   className="border-r-1 border-gray-200"
    // >
    //   <NavigationHeader ProfileProps={HeaderProps} />

    //   <></>

    //   <Container flex direction="row" items="center" justify="center" paddingX="5" paddingY="4">
    //     <Button variant="link" size="sm" className="text-gray-600">
    //       내 정보 관리
    //     </Button>

    //     <Divider orientation="vertical" height="h-3" />

    //     <Button variant="link" size="sm" className="text-gray-600">
    //       로그아웃
    //     </Button>
    //   </Container>
    // </Container>
  )
}
