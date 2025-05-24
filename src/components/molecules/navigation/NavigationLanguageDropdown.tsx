import { Box } from '@/atoms/Box'
import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import { Dropdown } from '@/molecules/Dropdown'
import { useLanguageStore } from '@/stores/language'
import { cn } from '@/utils/commonUtil'

export function NavigationLanguageDropdown() {
  const { currentLanguage, supportedLanguages, setLanguage } = useLanguageStore()

  const lang = {
    ko: 'KR',
    en: 'EN',
  }

  return (
    <Dropdown
      trigger={
        <Flex direction="row" justify="between" items="center" gap="1" className="cursor-pointer">
          <Text copyable={false} size="md">
            {lang[currentLanguage]}
          </Text>
          <Icon name="underFillArrow" size="sm" />
        </Flex>
      }
      width={80}
    >
      <Box padding="1" width="[74px]">
        <Flex direction="col" justify="between" items="center" gap="1">
          {supportedLanguages.map((language) => (
            <Flex
              className="h-[32px] w-[48px] cursor-pointer"
              direction="row"
              justify="between"
              items="center"
              onClick={() => setLanguage(language)}
            >
              <Text
                size="md"
                copyable={false}
                className={cn(language === currentLanguage ? 'text-primary-800' : 'text-gray-900')}
              >
                {lang[language]}
              </Text>
              {language === currentLanguage && <Icon name="check" size="sm" color="primary" strokeWidth={1.5} />}
            </Flex>
          ))}
        </Flex>
      </Box>
    </Dropdown>
  )
}
