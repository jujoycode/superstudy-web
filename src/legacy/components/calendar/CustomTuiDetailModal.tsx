import clsx from 'clsx'
import React, { FC } from 'react'

interface CustomTuiDetailModalProps {
  title: string
  date: string
  type: string
  backgroundColor: string
  onEdit: () => void
  onDelete: () => void
}

export const CustomTuiDetailModal: FC<CustomTuiDetailModalProps> = ({
  title,
  date,
  type,
  backgroundColor,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="tui-full-calendar-floating-layer tui-view-13 inset-[50%]">
      <div className="tui-full-calendar-popup tui-full-calendar-popup-detail translate-[-50%]">
        <div className="tui-full-calendar-popup-container">
          <div className="tui-full-calendar-popup-section tui-full-calendar-section-header">
            <div>
              <span className="tui-full-calendar-schedule-private tui-full-calendar-icon tui-full-calendar-ic-private"></span>
              <span className="tui-full-calendar-schedule-title">{title}</span>
            </div>
            <div className="tui-full-calendar-popup-detail-date tui-full-calendar-content">{date}</div>
          </div>
          <div className="tui-full-calendar-section-detail">
            <div className="tui-full-calendar-popup-detail-item">
              <span
                className={clsx('tui-full-calendar-icon tui-full-calendar-calendar-dot', `bg-[${backgroundColor}]`)}
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
        <div className={clsx('tui-full-calendar-popup-top-line', `bg-[${backgroundColor}]`)}></div>
      </div>
    </div>
  )
}
