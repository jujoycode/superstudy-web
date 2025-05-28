import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Input } from '@/atoms/Input'

type SearchInputProps = {
  value: string
  placeholder?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function SearchInput({ placeholder, value, onChange, onKeyDown }: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onKeyDown?.(e)
    }
  }

  return (
    <Flex
      items="center"
      justify="start"
      className="focus-within:ring-primary-800 relative flex w-full items-center rounded-lg border border-gray-200 focus-within:ring-1"
    >
      <Icon
        name="ssSearch"
        color="gray-700"
        className="ml-3"
        stroke
        strokeWidth={1.5}
        customSize={{ width: '20px', height: '20px' }}
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="border-0"
      />
    </Flex>
  )
}
