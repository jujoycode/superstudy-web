import { Autocomplete, TextField } from '@mui/material'
import { FC, useState } from 'react'
import { Label, Radio, RadioGroup } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { StudentActivityV3 } from '@/legacy/generated/model'

interface GenerateGPTPage1Props {
  selectedStudentActivityV3s?: StudentActivityV3[]
  checkedCardIds: number[]
  setCheckedCardIds: (cardIds: number[]) => void
  goNextPage: () => void
}

export const GenerateGPTPage1: FC<GenerateGPTPage1Props> = ({
  selectedStudentActivityV3s = [],
  setCheckedCardIds,
  checkedCardIds,
  goNextPage,
}) => {
  const [type, setType] = useState<string>('')
  return (
    <div className="w-full p-4">
      <div className="flex w-full items-center space-x-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600 bg-gray-600 text-white">
          1
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600">2</div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600">3</div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600">4</div>
      </div>
      <div className="h-screen-10 flex w-full flex-col">
        <div className="grid h-full grid-cols-2">
          <div className="flex h-full w-full items-center justify-center">
            <div className="max-h-40 w-full max-w-sm">
              <div className="text-xl text-gray-500">선택한 활동</div>
              <div className="mt-2 block">
                {selectedStudentActivityV3s.map((sav) => (
                  <div
                    key={sav.id}
                    className="border-brand-1 text-15 text-brand-1 relative mr-2 mb-2 inline-block rounded-lg border px-3 py-1.5 whitespace-pre"
                  >
                    {sav.activityv3.title}
                    <div
                      onClick={() => setCheckedCardIds(checkedCardIds.filter((id) => id !== sav.id))}
                      className="absolute -top-2 -right-2 z-20 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-600 bg-white text-sm text-gray-600"
                    >
                      X
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex h-full w-full items-center justify-center">
            <div className="max-h-40 w-full max-w-sm">
              <div className="text-xl text-gray-500">성취기준</div>
              <div className="w-full rounded-md border border-gray-500 px-4 py-2 leading-6 whitespace-pre-line">
                {`[6실05-03] 생활 속에 적용된 발명과 문제해결의 사례를 통해 발명의 의미와 중요성을 이해한다.
              [6실05-04] 다양한 재료를 사용하여 창의적인 제품을 구상하고 제작한다.`}
              </div>
            </div>
          </div>
          <div className="flex h-full w-full items-center justify-center">
            <div className="max-h-40 w-full max-w-sm">
              <div className="text-xl text-gray-500">타입</div>
              <RadioGroup onChange={(e) => setType(e.target.value)} className="mt-1 flex items-center space-x-4">
                {['교과', '창체', '행발'].map((el) => (
                  <div key={el} className="flex items-center space-x-2">
                    <Radio id={el} name={el} onChange={() => setType(el)} checked={type === el} value={el} />
                    <Label className="cursor-pointer" htmlFor={el}>
                      {el}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <div className="flex h-full w-full items-center justify-center">
            <div className="max-h-40 w-full max-w-sm">
              <div className="text-xl text-gray-500">성취수준</div>
              <RadioGroup onChange={(e) => setType(e.target.value)} className="mt-1 flex items-center space-x-4">
                {['상', '중', '하'].map((el) => (
                  <div key={el} className="flex items-center space-x-2">
                    <Radio id={el} name={el} onChange={() => setType(el)} checked={type === el} value={el} />
                    <Label className="cursor-pointer" htmlFor={el}>
                      {el}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <div className="flex h-full w-full items-center justify-center">
            <div className="max-h-40 w-full max-w-sm">
              <div className="text-xl text-gray-500">과목별 역량 선택</div>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                className="mt-1"
                options={[
                  '과학적 문제 해결력',
                  '과학적 탐구 능력',
                  'STS연계 능력',
                  '과학적 의사소통능력',
                  '과학적 참여와 평생 학습 능력',
                ]}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} />}
              />
            </div>
          </div>
        </div>
        <div className="flex w-full justify-end space-x-2">
          <div className="cursor-pointer rounded-lg border border-gray-500 p-2">
            <Icon.ChevronLeft className="h-8 w-8" stroke="#d1d5db" />
          </div>
          <div className="cursor-pointer rounded-lg border border-gray-500 p-2" onClick={goNextPage}>
            <Icon.ChevronRight className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
