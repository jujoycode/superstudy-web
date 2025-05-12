import { ChangeEvent, Children, cloneElement, HTMLAttributes, isValidElement } from 'react';
import { Radio } from './Radio';

interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function RadioGroup({ children, onChange, ...props }: RadioGroupProps) {
  return (
    <div className="flex flex-col" {...props}>
      {Children.map(children, (child) => {
        if (isValidElement(child) && child.type === Radio) {
          // @ts-ignore
          return cloneElement(child, { name, onChange });
        }
        return child;
      })}
    </div>
  );
}
