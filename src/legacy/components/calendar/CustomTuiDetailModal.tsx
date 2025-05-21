import { FC } from 'react'
import { cn } from '@/utils/commonUtil'

interface CustomTuiDetailModalProps {
  title: string
  date: string
  type: string
  backgroundColor: string
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export const CustomTuiDetailModal: FC<CustomTuiDetailModalProps> = ({
  title,
  date,
  type,
  backgroundColor,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-littleblack fixed inset-0 z-60 flex h-screen w-full items-center justify-center">
      <div className="tui-full-calendar-popup tui-full-calendar-popup-detail">
        <div className="tui-full-calendar-popup-container">
          <div className="flex items-start justify-between">
            <div className="tui-full-calendar-popup-section tui-full-calendar-section-header">
              <div>
                <span className="tui-full-calendar-schedule-private tui-full-calendar-icon tui-full-calendar-ic-private"></span>
                <span className="tui-full-calendar-schedule-title">{title}</span>
              </div>
              <div className="tui-full-calendar-popup-detail-date tui-full-calendar-content">{date}</div>
            </div>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden focus:ring-inset"
              onClick={() => onClose()}
            >
              <span className="sr-only">Close menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="tui-full-calendar-section-detail">
            <div className="tui-full-calendar-popup-detail-item">
              <span
                className={cn('tui-full-calendar-icon tui-full-calendar-calendar-dot', `bg-[${backgroundColor}]`)}
              ></span>
              <span className="tui-full-calendar-content">{type}</span>
            </div>
          </div>
          <div className="tui-full-calendar-section-button">
            <button className="tui-full-calendar-popup-edit" onClick={onEdit}>
              <span className="tui-full-calendar-icon tui-full-calendar-ic-edit"></span>
              <span className="tui-full-calendar-content">수정</span>
            </button>
            <div className="tui-full-calendar-popup-vertical-line"></div>
            <button className="tui-full-calendar-popup-delete" onClick={onDelete}>
              <span className="tui-full-calendar-icon tui-full-calendar-ic-delete"></span>
              <span className="tui-full-calendar-content">삭제</span>
            </button>
          </div>
        </div>
        <div className={cn('tui-full-calendar-popup-top-line', `bg-[${backgroundColor}]`)}></div>
      </div>
    </div>
  )
}
