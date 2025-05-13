import { useRef, useState } from 'react';
import { Blank, Section } from 'src/components/common';
import { Button } from 'src/components/common/Button';
import { TextInput } from 'src/components/common/TextInput';
import { makeDateToString, weekAgo } from 'src/util/time';

export function ManagerScheduleMainPage() {
  const [startDate, setStartDate] = useState(makeDateToString(weekAgo(new Date())));
  const [changeMode, setChangeMode] = useState(false);
  const [isLoading] = useState(false);
  const ref = useRef(null);

  return (
    <div className="h-screen-14 rounded-lg border bg-white py-5">
      {isLoading && <Blank reversed />}
      <div className="h-full w-auto overflow-scroll">
        <div ref={ref} className="h-[792px] w-[560px] bg-white">
          <div className=" flex w-full items-end justify-end pt-12"></div>
          <Section className="h-[792px] w-[560px] space-y-6">
            <div className="w-full min-w-max text-3xl font-bold">타이틀</div>
            <TextInput type="text" />
            <div className="w-full min-w-max text-3xl font-bold">날짜</div>
            <div className="my-4 flex items-center space-x-3">
              <TextInput
                type="date"
                value={makeDateToString(new Date(startDate))}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="mt-8 px-5">
              <span className="text-lg font-semibold"></span>
            </div>
            <div className="mt-3 flex w-full items-center space-x-2 overflow-x-auto">
              <Button.xl
                children="수정 완료"
                onClick={() => setChangeMode(true)}
                className="filled-primary w-full min-w-max"
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
