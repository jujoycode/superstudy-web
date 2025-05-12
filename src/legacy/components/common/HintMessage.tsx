import { useState } from 'react';

interface HintMessageProps {
  message: string;
  direction?: 'left' | 'right';
}

const HintMessage = ({ message, direction = 'right' }: HintMessageProps) => {
  const [showCoachMark, setShowCoachMark] = useState(false);

  return (
    <div
      className="text-md relative flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-primary-gray-900 text-sm text-primary-gray-900"
      onClick={() => setShowCoachMark(!showCoachMark)}
    >
      {showCoachMark && (
        <span
          className={`absolute ${
            direction === 'right' ? 'right-7 translate-x-full' : 'left-2 -translate-x-full'
          } top-full z-10 mt-4 flex w-[340px] transform rounded-sm border border-black bg-white p-2.5 text-13 text-black
          ${direction === 'right' ? 'after:left-1' : 'after:right-0'}
          after:absolute after:bottom-full after:block after:-translate-x-1/2 after:border-8 after:border-transparent after:border-b-black`}
        >
          <p
            className="whitespace-pre-wrap text-left text-12 font-normal leading-5 text-[#121417]"
            dangerouslySetInnerHTML={{
              __html: message.replace(/\n/g, '<br />'),
            }}
          ></p>
        </span>
      )}
      <p>?</p>
    </div>
  );
};

export default HintMessage;
