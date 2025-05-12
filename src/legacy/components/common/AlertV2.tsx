import React from 'react';
import { ButtonV2 } from './ButtonV2';
import { Typography } from './Typography';

interface AlertV2Props {
  message: string;
  description?: string;
  confirmText: string;
  onConfirm: () => void;
  cancelText?: string;
  onCancel?: () => void;
  ratio?: '1' | '5/5' | '3/7';
}

/**
 * AlertV2 컴포넌트는 사용자에게 메시지를 출력하는 다이얼로그를 렌더링합니다.
 *
 * @property {string} message - 다이얼로그에 표시할 주요 메시지.
 * @property {string} description - 주요 메시지 아래에 표시할 설명 텍스트.
 * @property {string} confirmText - 확인 버튼에 표시할 텍스트.
 * @property {function} onConfirm - 확인 버튼이 클릭될 때 호출할 함수.
 * @property {string} cancelText - 취소 버튼에 표시할 텍스트 (선택 사항).
 * @property {function} onCancel - 취소 버튼이 클릭될 때 호출할 함수 (선택 사항).
 * @property {string} ratio - 버튼들의 출력 비율
 * @returns {JSX.Element} 렌더링된 AlertDialog 컴포넌트.
 */

const AlertV2: React.FC<AlertV2Props> = ({
  message,
  description,
  confirmText,
  onConfirm,
  cancelText,
  onCancel,
  ratio = '1',
}) => {
  const cancelButtonClass = ratio === '3/7' ? 'flex-grow-[3] basis-3/10' : 'flex-grow basis-1/2';
  const confirmButtonClass = ratio === '3/7' ? 'flex-grow-[7] basis-7/10' : 'flex-grow basis-1/2';
  return (
    <div className="fixed inset-0 z-100 flex h-screen w-full items-center justify-center bg-black bg-opacity-50">
      <div className="flex w-[416px] flex-col items-center justify-center rounded-xl bg-white">
        <div className="flex flex-col items-center gap-2 p-8">
          <Typography
            variant="title2"
            className="text-center"
            dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br />') }}
          ></Typography>
          {description && (
            <Typography
              variant="body2"
              className="text-center"
              dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }}
            ></Typography>
          )}
        </div>
        <div className={`flex w-full flex-row items-center px-5 pb-5 ${cancelText && onCancel ? 'gap-3' : ''}`}>
          {/* 조건부 취소 버튼 렌더링 */}
          {cancelText && onCancel && (
            <ButtonV2 variant="solid" color="gray100" size={48} onClick={onCancel} className={cancelButtonClass}>
              {cancelText}
            </ButtonV2>
          )}
          <ButtonV2 variant="solid" color="orange800" size={48} onClick={onConfirm} className={confirmButtonClass}>
            {confirmText}
          </ButtonV2>
        </div>
      </div>
    </div>
  );
};

export default AlertV2;
