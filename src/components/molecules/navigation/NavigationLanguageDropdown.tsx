import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import { Dropdown } from '@/molecules/Dropdown'

import { useLanguageStore } from '@/stores/language'
import { cn } from '@/utils/commonUtil'

export function NavigationLanguageDropdown() {
  const { currentLanguage, supportedLanguages, setLanguage } = useLanguageStore()

  return (
    <Dropdown
      trigger={
        <Flex direction="row" justify="between" items="center" gap="1" className="cursor-pointer">
          <Text>{currentLanguage.toUpperCase()}</Text>
          <Icon name="underFillArrow" size="sm" />
        </Flex>
      }
      width={80}
    >
      {supportedLanguages.map((language) => (
        <div
          key={language}
          className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          onClick={() => setLanguage(language)}
          tabIndex={0}
          role="menuitem"
          onKeyDown={(e) => e.key === 'Enter' && setLanguage(language)}
        >
          <Flex direction="row" justify="between" items="center" gap="1">
            <Text className={cn(language === currentLanguage ? 'text-primary-800' : 'text-gray-900')}>
              {language.toUpperCase()}
            </Text>
            {language === currentLanguage && <Icon name="check" size="sm" color="primary" strokeWidth={2} />}
          </Flex>
        </div>
      ))}
    </Dropdown>
  )
}
