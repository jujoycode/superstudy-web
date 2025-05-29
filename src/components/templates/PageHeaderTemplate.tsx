import { Button, type ButtonProps } from '@/atoms/Button'
import type { DateRange } from '@/atoms/Calendar'
import { Flex } from '@/atoms/Flex'
import type { IconName, IconProps } from '@/atoms/Icon'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/atoms/Select'
import { Text } from '@/atoms/Text'
import { DatePicker } from '@/molecules/DatePicker'
import { DateRangePicker } from '@/molecules/DateRangePicker'
import { IconButton } from '@/molecules/IconButton'
import { SearchInput } from '@/molecules/SearchInput'

interface PageHeaderTemplateProps {
  title: string
  description?: string
  config: {
    topBtn?: BtnConfig | BtnConfig[]
    dateSearchBar?: DateSearchBarConfig
    filters?: FilterConfig[]
    searchBar?: SearchBarConfig
    sort?: SortConfig
    bottomBtn?: BtnConfig | BtnConfig[]
  }
}

type BtnConfig = {
  label: string
  color: ButtonProps['color']
  variant: ButtonProps['variant']
  icon?: IconProps
  action: () => void
}

type DateSearchBarConfig = {
  type: 'single' | 'range'
  searchState: {
    value: Date | DateRange
    setValue: React.Dispatch<React.SetStateAction<Date | DateRange>>
  }
}

type FilterConfig = {
  items: {
    label: string
    value: string
  }[]
  filterState: {
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
  }
}

type SearchBarConfig = {
  placeholder: string
  searchState: {
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
  }
}

type SortConfig = {
  mode: 'client' | 'server'
  items: string[]
  defaultValue?: string
  defaultDirection?: 'asc' | 'desc'
  sortState: {
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
  }
}

/**
 * PageHeaderTemplate
 * @desc 페이지 헤더 표준화 및 간편화 템플릿
 * @author jujoycode
 */
export function PageHeaderTemplate({ title, description, config }: PageHeaderTemplateProps) {
  const topBtn = config?.topBtn ? (Array.isArray(config.topBtn) ? config.topBtn : [config.topBtn]).filter(Boolean) : []
  const bottomBtn = config?.bottomBtn
    ? (Array.isArray(config.bottomBtn) ? config.bottomBtn : [config.bottomBtn]).filter(Boolean)
    : []

  return (
    <Flex width="full" direction="col" items="center" gap="4" className="p-2">
      <Flex width="full" direction="row" justify="between" items="center">
        <Flex direction="col" items="start" justify="center" gap="2">
          {/* 제목 */}
          <Text variant="title">{title}</Text>

          {/* 설명 (optional) */}
          {description && (
            <Text size="sm" weight="sm" variant="dim">
              {description}
            </Text>
          )}
        </Flex>

        {/* 상단 버튼 영역 */}
        <Flex direction="row" items="center" justify="end" gap="2">
          {topBtn.map((btn, index) =>
            btn.icon ? (
              <IconButton
                key={index}
                iconName={btn.icon.name}
                variant={btn?.variant}
                onClick={btn?.action}
                position="front"
                className="max-w-[240px] min-w-[120px]"
              >
                {btn?.label}
              </IconButton>
            ) : (
              <Button key={index} variant={btn?.variant} onClick={btn?.action} className="max-w-[240px] min-w-[120px]">
                {btn?.label}
              </Button>
            ),
          )}
        </Flex>
      </Flex>

      <Flex width="full" direction="col" items="center" justify="start" gap="2">
        {/* Tab이나 custom 컴포넌트 */}

        {/* 날짜 검색 바 */}
        {config?.dateSearchBar &&
          (config.dateSearchBar.type === 'single' ? (
            <DatePicker.Default
              date={config.dateSearchBar.searchState.value as Date}
              setDate={config.dateSearchBar.searchState.setValue}
            />
          ) : (
            <DateRangePicker.Default
              dateRange={config.dateSearchBar.searchState.value as DateRange}
              setDateRange={config.dateSearchBar.searchState.setValue}
            />
          ))}

        <Flex direction="row" items="center" gap="2">
          {/* 필터 영역 */}
          {config?.filters?.map((filter, index) => (
            <Select key={index} value={filter.filterState.value} onValueChange={filter.filterState.setValue}>
              <SelectTrigger>
                {filter.items.find((item) => item.value === filter.filterState.value)?.label}
              </SelectTrigger>
              <SelectContent>
                {filter.items.map((item, index) => (
                  <SelectItem key={index} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* 검색 영역 */}
          {config?.searchBar && (
            <SearchInput
              placeholder={config.searchBar.placeholder}
              value={config.searchBar.searchState.value}
              onChange={(e) => e.target.value}
            />
          )}
        </Flex>
      </Flex>

      {/* 하단 영역 */}
      <Flex>
        {/* 정렬 영역 */}

        {/* 버튼 영역 */}
        <Flex direction="row" items="center" justify="end" gap="2">
          {bottomBtn.map((btn, index) =>
            btn.icon ? (
              <IconButton
                key={index}
                iconName={btn.icon.name}
                variant={btn?.variant}
                onClick={btn?.action}
                position="front"
                className="max-w-[240px] min-w-[120px]"
              >
                {btn?.label}
              </IconButton>
            ) : (
              <Button key={index} variant={btn?.variant} onClick={btn?.action} className="max-w-[240px] min-w-[120px]">
                {btn?.label}
              </Button>
            ),
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
