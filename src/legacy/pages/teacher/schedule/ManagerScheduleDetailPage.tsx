import { useRef, useState } from 'react';
import { Blank, Section } from 'src/components/common';
import { Button } from 'src/components/common/Button';
import { Checkbox } from 'src/components/common/Checkbox';

export function ManagerScheduleDetailPage() {
  const ref = useRef(null);

  const [changeMode, setChangeMode] = useState(false);
  const [isLoading] = useState(false);

  return (
    <div className="h-screen-14 rounded-lg border bg-white py-5">
      {isLoading && <Blank reversed />}
      <div className="h-full w-auto overflow-scroll">
        <div ref={ref} className="h-[792px] w-[560px] bg-white">
          <div className=" flex w-full items-end justify-end pt-12"></div>
          <Section className="h-[792px] w-[560px] space-y-6">
            <div className="w-full min-w-max text-3xl font-bold">타이틀</div>
            <div className="text-lg text-gray-400">2021.10.01(금)</div>
            <div className="mb-1 flex items-center space-x-2">
              <Checkbox id="agree" />
              <label htmlFor="agree">
                <span className="cursor-pointer  text-lg">체험학습 신청 불가</span>
              </label>
            </div>
            <div className="mt-8 px-5">
              <span className="text-lg font-semibold"></span>
            </div>
            <div className="mt-3 flex w-full items-center space-x-2 overflow-x-auto">
              <Button.xl
                children="수정"
                onClick={() => setChangeMode(true)}
                className="filled-primary w-full min-w-max"
              />
              <Button.xl children="삭제" className="outlined-primary w-full min-w-max" />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
