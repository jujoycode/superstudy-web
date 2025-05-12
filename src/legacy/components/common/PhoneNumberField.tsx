import { ChangeEvent, InputHTMLAttributes, useEffect, useState } from 'react';
import { TextInput } from './TextInput';

interface PhoneNumberFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function PhoneNumberField({ value, onChange, ...props }: PhoneNumberFieldProps) {
  const [number1, setNumber1] = useState('010');
  const [number2, setNumber2] = useState('');
  const [number3, setNumber3] = useState('');

  useEffect(() => {
    if (!number2 && !number3 && value) {
      setNumber1(value.substring(0, 3));
      setNumber2(value.substring(3, 7));
      setNumber3(value.substring(7, 11));
    }
  }, [value]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <TextInput
          type="tel"
          pattern="[0-9]{3}"
          maxLength={3}
          placeholder={'010'}
          value={number1}
          onChange={(e) => {
            setNumber1(e.target.value);
            e.target.value = `${e.target.value}${number2}${number3}`;
            onChange?.(e);
          }}
          {...props}
        />
        <TextInput
          type="tel"
          pattern="[0-9]{4}"
          maxLength={4}
          placeholder={'0000'}
          value={number2}
          onChange={(e) => {
            setNumber2(e.target.value);
            e.target.value = `${number1}${e.target.value}${number3}`;
            onChange?.(e);
          }}
          {...props}
        />
        <TextInput
          type="tel"
          pattern="[0-9]{4}"
          maxLength={4}
          placeholder={'0000'}
          value={number3}
          onChange={(e) => {
            setNumber3(e.target.value);
            e.target.value = `${number1}${number2}${e.target.value}`;
            onChange?.(e);
          }}
          {...props}
        />
      </div>
    </div>
  );
}
