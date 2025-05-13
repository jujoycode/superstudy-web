import React, { useState } from 'react'

// 인터페이스 정의
interface CustomSelectBoxProps {
  options: string[]
  initial?: string | null
  onSelectedValue: (value: string) => void
}

const CustomSelectBox: React.FC<CustomSelectBoxProps> = ({ options, initial = null, onSelectedValue }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(initial)
  const [customInput, setCustomInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (value: string) => {
    setSelectedValue(value)
    onSelectedValue(value)
    setIsOpen(false)
  }

  const handleCustomInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInput(event.target.value)
  }

  const handleConfirm = () => {
    setSelectedValue(customInput)
    onSelectedValue(customInput)
    setIsOpen(false)
  }

  return (
    <div className="text-13 relative inline-block h-13 w-full">
      <div>
        {/* 버튼에 아이콘 추가 */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between border border-gray-300 bg-white px-4 py-2 text-left"
        >
          {/* 선택된 값 또는 기본 텍스트 */}
          {selectedValue || '선택하세요'}
          {/* 꺽쇠 아이콘: isOpen 상태에 따라 아이콘 변경 */}
          <span className="mr-2">
            {isOpen ? (
              // TODO : 디자인된 아이콘 생성시 교체
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17 14L12.0503 9.05025L7.10051 14"
                  stroke="black"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            ) : (
              // TODO : 디자인된 아이콘 생성시 교체
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7 10L11.9497 14.9497L16.8995 10"
                  stroke="black"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            )}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full border border-gray-300 bg-white shadow-lg">
          <ul className="py-1 text-gray-700">
            {options.map((option, index) => (
              <li
                key={index}
                className="cursor-pointer px-4 py-1 hover:bg-gray-100"
                onClick={() => handleSelect(option)}
              >
                {option}
              </li>
            ))}
            <li className="flex h-8 px-2">
              <input
                type="text"
                value={customInput}
                onChange={handleCustomInput}
                placeholder="직접입력"
                className="text-13 w-full border border-gray-300 px-2"
              />
              <button onClick={handleConfirm} className="w-[42px] bg-[#333333] text-white">
                확인
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default CustomSelectBox
