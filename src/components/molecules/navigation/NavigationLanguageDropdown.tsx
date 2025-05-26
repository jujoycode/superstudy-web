import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/commonUtil'
import { useLanguageStore } from '@/stores/language'
import { Box } from '@/atoms/Box'
import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import { Dropdown, DropdownItem } from '@/molecules/Dropdown'

export function NavigationLanguageDropdown() {
  const { currentLanguage, changeLanguage } = useLanguage()
  const { supportedLanguages } = useLanguageStore()

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
        {supportedLanguages.map((language) => (
          <DropdownItem key={language} className="h-[32px] p-0" onClick={() => changeLanguage(language)}>
            <Flex className="h-full w-full px-2" direction="row" justify="between" items="center">
              <Text
                size="md"
                copyable={false}
                className={cn(language === currentLanguage ? 'text-primary-800' : 'text-gray-900')}
              >
                {lang[language]}
              </Text>
              {language === currentLanguage && <Icon name="check" size="sm" color="primary" strokeWidth={1.5} />}
            </Flex>
          </DropdownItem>
        ))}
      </Box>
    </Dropdown>
  )
}
