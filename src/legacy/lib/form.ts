import type { RegisterOptions } from 'react-hook-form'

function minLength(value: number) {
  const message = `최소 ${value} 글자 이상 입력해주세요`
  return { required: { value: value > 0, message }, minLength: { value, message } } satisfies RegisterOptions
}

function maxLength(value: number) {
  return { maxLength: { value, message: `최대 ${value} 글자를 넘을 수 없습니다` } } satisfies RegisterOptions
}

function length(min: number, max: number) {
  return { ...minLength(min), ...maxLength(max) } satisfies RegisterOptions
}

function min(value: number) {
  return {
    min: { value, message: `최소 ${value} 이상이어야 합니다` },
    valueAsNumber: true,
    validate: (v) => !Number.isNaN(v),
  } satisfies RegisterOptions
}

function max(value: number) {
  return {
    max: { value, message: `최대 ${value} 이하이어야 합니다` },
    valueAsNumber: true,
    validate: (v) => !Number.isNaN(v),
  } satisfies RegisterOptions
}

function minmax(minValue: number, maxValue: number) {
  return { ...min(minValue), ...max(maxValue) } satisfies RegisterOptions
}

function email() {
  return {
    pattern: { value: /\S+@\S+\.\S+/, message: '이메일 형식에 맞지 않습니다' },
    ...length(1, 100),
  } satisfies RegisterOptions
}

function password() {
  return {
    ...maxLength(40),
    pattern: {
      value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,40}$/,
      message:
        '문자, 숫자, 특수문자가 포함된 8자 이상의 비밀번호를 입력하세요\n사용 가능한 특수문자는 ! @ # $ % & * ? 입니다',
    },
  } satisfies RegisterOptions
}

function repeatPassword(originalPassword: string) {
  return {
    ...password(),
    validate: (value) => value === originalPassword || '비밀번호가 일치하지 않습니다',
  } satisfies RegisterOptions
}

export const form = { minLength, maxLength, length, min, max, minmax, email, password, repeatPassword }
