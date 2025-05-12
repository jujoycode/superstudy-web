import { ButtonHTMLAttributes } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { IconButton } from '../IconButton';
import { Icon } from '../icons';

interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function CloseButton({ onClick, ...props }: CloseButtonProps) {
  const { goBack } = useHistory();

  return <IconButton children={<Icon.Close />} onClick={onClick ?? (() => goBack())} {...props} />;
}
