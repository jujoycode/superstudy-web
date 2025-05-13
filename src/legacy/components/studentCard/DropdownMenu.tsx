import { useEffect, useRef, useState } from 'react'

import { ResponseParentUserDto } from '@/legacy/generated/model'

interface DropdownMenuProps {
  icon: string
  studentId: number
  parent: ResponseParentUserDto
  updateStudentParent: (studentId: number, nokName: string, nokPhone: string) => void
}

export function DropdownMenu({ icon, studentId, parent, updateStudentParent }: DropdownMenuProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModalOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [modalOpen])

  return (
    <div className="relative h-6 w-6 cursor-pointer" onClick={() => setModalOpen(!modalOpen)} ref={dropdownRef}>
      <img src={icon} className="object-cover transition-all hover:scale-125" loading="lazy" />
      <div
        className={`${
          modalOpen ? 'block' : 'hidden'
        } absolute right-2 -bottom-10 rounded-md border bg-white px-1 py-0.5`}
      >
        <button
          className="hover:bg-darkgray w-30 rounded-md px-0.5 py-1 transition-all hover:text-white"
          onClick={(e) => {
            e.stopPropagation()
            alert(
              `학생정보의 보호자 전화번호가 ${parent?.name} 님의 전화번호로 변경되며, 학생의 결재요청도 ${parent?.name}님 에게 보내집니다.`,
            )
            studentId && updateStudentParent(studentId, parent?.name, parent?.phone)
            setModalOpen(false)
          }}
        >
          주 보호자 변경
        </button>
      </div>
    </div>
  )
}
