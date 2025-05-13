import { useLanguage } from '@/legacy/hooks/useLanguage'

import { Label, Select } from './common'

interface Item {
  id?: number
  name?: string | null
}

interface SelectMenusProps {
  label?: string
  tooltip?: string
  items?: (Item | string)[]
  allText?: string
  value?: Item | string
  onChange?: (item: any) => void
  allTextVisible?: boolean
}

export function SelectMenus({ label, tooltip, items, allText, value, onChange, allTextVisible }: SelectMenusProps) {
  const { t } = useLanguage()
  return (
    <Label.col className={label ? '' : 'gap-0'}>
      <Label.Text children={label} />
      <Select.lg
        value={typeof value === 'string' ? value : value?.id}
        onChange={(e) =>
          onChange?.(
            items?.filter((el) =>
              typeof el === 'string' ? el === e.target.value : el.id === Number(e.target.value),
            )[0],
          )
        }
        title={tooltip}
      >
        {allText && (
          <option selected disabled hidden={!allTextVisible} value={undefined}>
            {allText}
          </option>
        )}
        {items?.map((item, i: number) => {
          if (typeof item === 'string') {
            return (
              <option key={i} value={item || ''}>
                {t(`${item}`)}
              </option>
            )
          } else {
            return (
              <option key={i} value={item?.id || 0}>
                {item.name}
              </option>
            )
          }
        })}
      </Select.lg>
    </Label.col>
  )
}
