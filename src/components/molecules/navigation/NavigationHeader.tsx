import { useNavigate } from 'react-router'
import { Flex } from '@/atoms/Flex'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { Icon } from '@/atoms/Icon'
import { NavigationLanguageDropdown } from '@/molecules/navigation/NavigationLanguageDropdown'
import { NavigationProfile, type NavigationProfileProps } from '@/molecules/navigation/NavigationProfile'

interface NavigationHeaderProps {
  ProfileProps: NavigationProfileProps
}

export function NavigationHeader({ ProfileProps }: NavigationHeaderProps) {
  const navigate = useNavigate()

  const handleLogoClick = () => {
    navigate('/teacher')
  }

  return (
    <Grid col={12}>
      <GridItem colSpan={1} empty />
      <GridItem colSpan={10}>
        <Grid col={1} row={2}>
          <GridItem>
            <Flex direction="row" justify="between" items="center" gap="3" className="pt-8">
              <Icon name="logo" customSize={{ width: '70px', height: '40px' }} onClick={handleLogoClick} />

              <Flex direction="row" justify="end" items="center" gap="3">
                <NavigationLanguageDropdown />
                <Icon name="bell" customSize={{ width: '20px', height: '20px' }} />
              </Flex>
            </Flex>
          </GridItem>

          <GridItem>
            <NavigationProfile {...ProfileProps} />
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem colSpan={1} empty />
    </Grid>
  )
}
