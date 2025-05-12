import { twMerge } from 'tailwind-merge';

interface SelectValueItem {
  value: string;
  text: string;
}

interface SelectValuesProps {
  label?: string;
  selectValues: SelectValueItem[] | string[];
  placeholder?: string;
  value?: any;
  onChange?: (group: any) => void;
  border?: string;
  borderColor?: string;
  paddingY?: string;
  marginY?: string;
  className?: string;
}

export function SelectValues({ label, selectValues, placeholder, value, onChange, className = '' }: SelectValuesProps) {
  return (
    <div>
      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={twMerge(
          'mt-1 block w-full rounded-md border border-gray-300 px-1 py-3 text-base focus:border-black focus:outline-none focus:ring-indigo-500 sm:text-sm',
          className,
        )}
      >
        {placeholder && (
          <option selected hidden>
            {placeholder}
          </option>
        )}

        {selectValues?.map((value: any) => {
          if (typeof value === 'string') {
            return <option value={value || ''}>{value}</option>;
          } else if (typeof value === 'object') {
            return <option value={value.value}>{value.text}</option>;
          }
        })}
      </select>
    </div>
  );
}
