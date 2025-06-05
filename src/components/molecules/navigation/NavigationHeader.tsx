import { useNavigate } from 'react-router'
import LogoPink from '@/assets/images/logo_color_pink.png'
import { Flex } from '@/atoms/Flex'
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
    <Flex justify="center" items="center" direction="col">
      <Flex direction="row" justify="between" items="center" gap="3" className="p-5 pt-8">
        {/* <Icon
          name="logo"
          customSize={{ width: '70px', height: '40px' }}
          onClick={handleLogoClick}
          className="cursor-pointer"
        /> */}
        <img src={LogoPink} alt="logo" className="w-24 contain-content" onClick={handleLogoClick} />

        <Flex direction="row" justify="end" items="center" gap="3">
          <NavigationLanguageDropdown />
          <Icon name="bell" customSize={{ width: '20px', height: '20px' }} className="cursor-pointer" />
        </Flex>
      </Flex>

      <NavigationProfile {...ProfileProps} onClick={() => navigate('/teacher/update')} />
    </Flex>
  )
}
