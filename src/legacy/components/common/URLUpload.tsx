import { InputHTMLAttributes, useState } from 'react'

export interface URLUploadProps extends InputHTMLAttributes<HTMLInputElement> {
  addURL: (url: string) => void
}

export function URLUpload({ addURL, ...props }: URLUploadProps) {
  const [inputValue, setInputValue] = useState('')
  const handleAddURL = () => {
    if (inputValue.match(/^https:\/\/.*/)) {
      // 유효성 검사
      addURL(inputValue)
      setInputValue('')
    } else {
      alert('유효한 URL을 입력해주세요.')
    }
  }

  return (
    <label className="flex w-max items-center border border-gray-200">
      <input
        className="focus:border-primary-800 border-none placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400"
        type="url"
        pattern="https://.*"
        placeholder="URL을 입력해주세요."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        {...props}
      />
      <button type="button" className="h-10 border-l border-l-gray-200 px-4" onClick={handleAddURL}>
        추가
      </button>
    </label>
  )
}
