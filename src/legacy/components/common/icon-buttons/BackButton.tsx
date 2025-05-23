import { ButtonHTMLAttributes } from 'react'

import { useHistory } from '@/hooks/useHistory'

import { IconButton } from '../IconButton'
import { Icon } from '../icons'

interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void
}

export function BackButton({ onClick, ...props }: BackButtonProps) {
  const history = useHistory()

  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick()
    } else {
      if (history.location.pathname !== '/') {
        history.goBack()
      } else {
        history.push('/')
      }
    }
  }

  return <IconButton data-cy="back" children={<Icon.Back />} onClick={handleClick} {...props} />
}
