import { ButtonHTMLAttributes } from 'react'

import { useHistory } from '@/hooks/useHistory'

interface ListItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string
  fullBorder?: boolean
}

export function ListItem({ children, to, fullBorder = false, onClick, ...props }: ListItemProps) {
  const { push } = useHistory()
  const borderOuter = fullBorder ? 'border-b' : 'border-0'
  const borderInner = fullBorder ? 'border-0' : 'border-b'

  return (
    <li className={`bg-white ${borderOuter} focus:ring-0 focus:outline-hidden`}>
      <button className="w-full px-5" onClick={to ? () => push(to) : onClick} {...props}>
        <div className={`py-4 ${borderInner}`}>{children}</div>
      </button>
    </li>
  )
}
