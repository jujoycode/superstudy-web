interface LnbCalendarsItemProps {
  value: any
  checked: boolean
  color: string
  text: string
  onClick?: () => void
}

export function LnbCalendarsItem({ value, checked, color, text, onClick }: LnbCalendarsItemProps) {
  return (
    <div onClick={onClick}>
      <label className="cursor-pointer">
        <input type="checkbox" className="tui-full-calendar-checkbox-round" value={value} checked={checked} />
        <span style={{ borderColor: color, backgroundColor: color }}></span>
        <span style={{ lineHeight: '1.5rem' }}>{text}</span>
      </label>
    </div>
  )
}
