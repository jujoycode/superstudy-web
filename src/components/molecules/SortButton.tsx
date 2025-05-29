import { useMemo } from 'react'
import { cn } from '@/utils/commonUtil'
import { SortState } from '@/constants/enumConstant'
import { Button } from '@/atoms/Button'
import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Select, SelectContent, SelectValue, SelectItem, SelectTrigger } from '@/atoms/Select'

export interface SortButtonProps {
  items: { label: string; value: string }[]
  itemState: {
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>
  }
  sortState: {
    value: SortState
    setValue: React.Dispatch<React.SetStateAction<SortState>>
  }
}

/**
 * SortButton
 * @desc 정렬 버튼
 * @author jujoycode
 */
export function SortButton({ items, itemState, sortState }: SortButtonProps) {
  const onToggle = () => {
    sortState.setValue((prev) => {
      switch (prev) {
        case SortState.DEFAULT: {
          return SortState.ASC
        }
        case SortState.ASC: {
          return SortState.DESC
        }
        case SortState.DESC: {
          return SortState.DEFAULT
        }

        default: {
          return SortState.DEFAULT
        }
      }
    })
  }

  const iconComponent = useMemo(() => {
    switch (sortState.value) {
      case 'asc': {
        return (
          <Icon
            name="ArrowUpWideNarrow"
            stroke
            size="sm"
            className="text-primary-700 font-bold transition-colors duration-200"
          />
        )
      }
      case 'desc': {
        return (
          <Icon
            name="ArrowDownWideNarrow"
            stroke
            size="sm"
            className="text-primary-700 font-bold transition-colors duration-200"
          />
        )
      }

      default:
        return (
          <Icon name="ArrowDownUp" stroke size="sm" className="text-muted-foreground transition-colors duration-200" />
        )
    }
  }, [sortState.value])

  const selectedItem = items.find((item) => item.value === itemState.value)
  const isActive = sortState.value === 'asc' || sortState.value === 'desc'

  return (
    <Flex direction="row" items="center" gap="1">
      <Select
        value={itemState.value}
        onValueChange={(value) => {
          itemState.setValue(value)
          sortState.setValue(SortState.DEFAULT)
        }}
      >
        <SelectTrigger>
          <SelectValue>{selectedItem?.label}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {items.map((item, index) => (
            <SelectItem key={index} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        color="tertiary"
        size="sm"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md border-1 border-gray-200 p-0 transition-colors duration-200 hover:bg-gray-50',
          isActive && 'border-primary-400 shadow-sm',
        )}
        onClick={onToggle}
      >
        {iconComponent}
      </Button>
    </Flex>
  )
}
