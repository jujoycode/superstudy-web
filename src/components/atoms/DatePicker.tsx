interface DatePickerProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e)}
      className="focus:border-primary-800 w-full rounded-md border border-gray-300 p-2 focus:ring-0"
      aria-label="Select a date"
      tabIndex={0}
    />
  )
}
