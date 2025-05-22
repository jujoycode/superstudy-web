import { Flex } from '@/atoms/Flex'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { Icon } from '@/atoms/Icon'
import { NavigationProfile, type NavigationProfileProps } from '@/molecules/navigation/NavigationProfile'

export type NavigationHeaderProps = {
  ProfileProps: NavigationProfileProps
}

export function NavigationHeader({ ProfileProps }: NavigationHeaderProps) {
  return (
    <Grid col={12} gap={5}>
      <GridItem colSpan={1}>{''}</GridItem>
      <GridItem colSpan={10}>
        <Grid col={1} row={2}>
          <GridItem>
            <Flex direction="row" justify="between" items="center" gap="3">
              <Icon name="logo" customSize={{ width: '70px', height: '40px' }} />

              <Flex direction="row" justify="end" items="center" gap="3">
                {/* 추후 dropdown으로 대체 */}
                <Icon name="world" customSize={{ width: '20px', height: '20px' }} />
                <Icon name="bell" customSize={{ width: '20px', height: '20px' }} />
              </Flex>
            </Flex>
          </GridItem>

          <GridItem>
            <NavigationProfile {...ProfileProps} />
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem colSpan={1}>{''}</GridItem>
    </Grid>
  )
}
