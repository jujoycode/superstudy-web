export function numberWithSign(value?: number) {
  if (value === undefined) return ''
  return `${value > 0 ? '+' : ''}${value}`
}

export const roundToFirstDecimal = (value: number) => {
  return Math.floor(value * 10) / 10
}

export const getCustomString = (schoolId: number | undefined, value: string) => {
  return [`Custom.SID${schoolId}.${value}`, `${value}`]
}
