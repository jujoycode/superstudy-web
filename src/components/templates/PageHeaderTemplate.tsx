import { cn } from '@/utils/commonUtil'
import { Button, type ButtonProps } from '@/atoms/Button'
import type { DateRange } from '@/atoms/Calendar'
import { Flex } from '@/atoms/Flex'
import type { IconProps } from '@/atoms/Icon'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/atoms/Select'
import { Text } from '@/atoms/Text'
import { DatePicker } from '@/molecules/DatePicker'
import { DateRangePicker } from '@/molecules/DateRangePicker'
import { IconButton } from '@/molecules/IconButton'
import { SearchInput } from '@/molecules/SearchInput'
import { SortButton, SortButtonProps } from '@/molecules/SortButton'

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
  disabled?: boolean
  customWidth?: string
  icon?: IconProps
  action: () => void
}

type DateSearchBarConfig = {
  type: 'single' | 'range'
  minDate?: Date
  maxDate?: Date
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
  hidden?: boolean
}

type SearchBarConfig = {
  placeholder: string
  searchState: {
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
  }
  onSearch?: () => void
}

interface SortConfig extends SortButtonProps {
  mode: 'client' | 'server'
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
    <Flex direction="col" items="center" gap="4" className="p-8 pb-0">
      <Flex direction="row" justify="between" items="center">
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
        <Flex direction="row" items="center" justify="end" gap="2" width="fit-content">
          {topBtn.map((btn, index) =>
            btn.icon ? (
              <IconButton
                key={index}
                iconName={btn.icon.name}
                color={btn?.color}
                variant={btn?.variant}
                disabled={btn?.disabled}
                onClick={btn?.action}
                position="front"
                className={cn('max-w-[240px]', btn.customWidth ? `min-w-[${btn.customWidth}]` : 'min-w-[120px]')}
              >
                {btn?.label}
              </IconButton>
            ) : (
              <Button
                key={index}
                color={btn?.color}
                variant={btn?.variant}
                disabled={btn?.disabled}
                onClick={btn?.action}
                className={cn('max-w-[240px]', btn.customWidth ? `min-w-[${btn.customWidth}]` : 'min-w-[120px]')}
              >
                {btn?.label}
              </Button>
            ),
          )}
        </Flex>
      </Flex>

      <Flex direction="col" items="center" justify="start" gap="2">
        {/* Tab이나 custom 컴포넌트 */}

        {/* 날짜 검색 바 */}
        {config?.dateSearchBar &&
          (config.dateSearchBar.type === 'single' ? (
            <DatePicker.Default
              minDate={config.dateSearchBar.minDate}
              maxDate={config.dateSearchBar.maxDate}
              date={config.dateSearchBar.searchState.value as Date}
              setDate={config.dateSearchBar.searchState.setValue}
            />
          ) : (
            <DateRangePicker.Default
              minDate={config.dateSearchBar.minDate}
              maxDate={config.dateSearchBar.maxDate}
              dateRange={config.dateSearchBar.searchState.value as DateRange}
              setDateRange={config.dateSearchBar.searchState.setValue}
            />
          ))}

        <Flex direction="row" items="center" gap="2">
          {/* 필터 영역 */}
          {config?.filters?.map((filter, index) =>
            filter.hidden ? null : (
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
            ),
          )}

          {/* 검색 영역 */}
          {config?.searchBar && (
            <SearchInput
              placeholder={config.searchBar.placeholder}
              value={config.searchBar.searchState.value}
              onChange={(e) => {
                if (config.searchBar) {
                  config.searchBar.searchState.setValue(e.target.value)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && config.searchBar?.onSearch) {
                  config.searchBar.onSearch()
                }
              }}
            />
          )}
        </Flex>
      </Flex>

      {/* 하단 영역 */}
      <Flex className="pt-2">
        {/* 정렬 영역 */}
        {config?.sort && (
          <SortButton items={config.sort.items} itemState={config.sort.itemState} sortState={config.sort.sortState} />
        )}

        {/* 버튼 영역 */}
        <Flex direction="row" items="center" justify="end" gap="2">
          {bottomBtn.map((btn, index) =>
            btn.icon ? (
              <IconButton
                key={index}
                iconName={btn.icon.name}
                color={btn?.color}
                variant={btn?.variant}
                disabled={btn?.disabled}
                onClick={btn?.action}
                position="front"
                className={cn('max-w-[240px]', btn.customWidth ? `min-w-[${btn.customWidth}]` : 'min-w-[120px]')}
              >
                {btn?.label}
              </IconButton>
            ) : (
              <Button
                key={index}
                variant={btn?.variant}
                disabled={btn?.disabled}
                onClick={btn?.action}
                className={cn('max-w-[240px]', btn.customWidth ? `min-w-[${btn.customWidth}]` : 'min-w-[120px]')}
              >
                {btn?.label}
              </Button>
            ),
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
