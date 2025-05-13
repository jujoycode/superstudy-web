export const Validator = {
  removeSpace: (value: string) => value.replace(/\s/g, ''),
  passwordRule: (value: string) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(value),
  phoneNumberRule: (value: string) => /^010(?:\d{4})\d{4}$/.test(value),
  emailRule: (value: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
  fileNameRule: (value: string) => /[%&?~+]/.test(value) === false,
  nameRule: (value: string) => /[~`!@#$%^&*()_+|<>?:/;'".,]/.test(value) || /[ ]/.test(value),
  onlyEngAndHan: (value: string) => /[^\uAC00-\uD7A3a-zA-Z]/g.test(value) === false,
}

export function removeControlCharacters(str: string) {
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
}

export function jsonParseSafe<T>(jsonString: string | null, defaultValue: T): T {
  try {
    if (!jsonString || jsonString.trim() === '') {
      return defaultValue
    }
    const jsonObj = JSON.parse(jsonString) as T
    return jsonObj
  } catch (error) {
    return defaultValue
  }
}

export function isHTML(str: string) {
  const htmlRegex = /<\/?[a-z][\s\S]*>/i
  return htmlRegex.test(str)
}

export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+|^[^\s@]+@[^\s@]+$/
  return emailRegex.test(email)
}

export function convertClassFormat(input: string | undefined | null) {
  const match = input?.match(/(\d+)학년\s*(\d+)반/) // 숫자 학년, 숫자 반 형식 추출
  if (match) {
    const grade = match[1]
    const classNum = match[2]
    return `${grade}-${classNum}`
  }
  return input // 형식이 맞지 않으면 원래 문자열 반환
}
