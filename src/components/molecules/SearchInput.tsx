import { Icon } from '@/atoms/Icon'
import { Input } from '@/atoms/Input'

type SearchInputProps = {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function SearchInput({ placeholder = 'Search...', value, onChange, onKeyDown }: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative flex items-center rounded-md border p-2 focus-within:ring-2 focus-within:ring-blue-500">
      <Icon name="Search" className="mr-2 text-gray-400" />
      <Input placeholder={placeholder} value={value} onChange={handleChange} />
    </div>
  )
}
