import { ButtonHTMLAttributes } from 'react';
import { useHistory } from 'react-router-dom';

interface ListItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  fullBorder?: boolean;
}

export function ListItem({ children, to, fullBorder = false, onClick, ...props }: ListItemProps) {
  const { push } = useHistory();
  const borderOuter = fullBorder ? 'border-b' : 'border-0';
  const borderInner = fullBorder ? 'border-0' : 'border-b';

  return (
    <li className={`bg-white ${borderOuter} focus:outline-none focus:ring-0`}>
      <button className="w-full px-5" onClick={to ? () => push(to) : onClick} {...props}>
        <div className={`py-4 ${borderInner}`}>{children}</div>
      </button>
    </li>
  );
}
