import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Input } from '@/atoms/Input'

type SearchFieldProps = {
  value: string
  placeholder?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function SearchField({ placeholder, value, onChange, onKeyDown }: SearchFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e)
  }

  return (
    <div className="focus-within:ring-primary-800 relative flex w-full items-center rounded-lg border border-gray-200 focus-within:ring-1">
      <Flex items="center" justify="start">
        <Icon
          name="ssSearch"
          color="gray-700"
          className="ml-3"
          stroke
          strokeWidth={1.5}
          customSize={{ width: '20px', height: '20px' }}
        />
        <Input placeholder={placeholder} value={value} onChange={handleChange} className="border-0" />
      </Flex>
    </div>
  )
}
