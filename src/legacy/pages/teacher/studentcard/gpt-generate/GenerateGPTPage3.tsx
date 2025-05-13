import { Radio, TextField } from '@mui/material'

import { FC } from 'react'
import { Textarea } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'

interface GenerateGPTPage3Props {
  goPrevPage: () => void
  goNextPage: () => void
}

export const GenerateGPTPage3: FC<GenerateGPTPage3Props> = ({ goPrevPage, goNextPage }) => {
  return (
    <div className="w-full p-4">
      <div className="flex w-full items-center space-x-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600">1</div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600">2</div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600">3</div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600 bg-gray-600 text-white">
          4
        </div>
      </div>
      <div className="h-screen-13 flex w-full flex-col">
        <div className="mx-auto flex h-full w-full max-w-xl flex-col items-center justify-center space-y-2">
          <TextField className="w-full rounded-none" placeholder="제목을 입력해주세요" />

          <div className="flex flex-col space-y-4 overflow-y-scroll">
            <label className="flex items-start space-x-2" htmlFor="radio-1">
              <Radio id="radio-1" name="radio-1" />

              <div className="bg-light_orange rounded-xl rounded-tl-none border border-gray-500 px-5 py-3 leading-6 whitespace-pre-line">
                {`Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap
                into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the
                release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                software like Aldus PageMaker including versions of Lorem Ipsum`}
              </div>
            </label>
            <label className="flex items-start space-x-2" htmlFor="radio-1">
              <Radio id="radio-1" name="radio-1" />

              <div className="bg-light_orange rounded-xl rounded-tl-none border border-gray-500 px-5 py-3 leading-6 whitespace-pre-line">
                {`Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap
                into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the
                release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                software like Aldus PageMaker including versions of Lorem Ipsum`}
              </div>
            </label>
            <label className="flex items-start space-x-2" htmlFor="radio-1">
              <Radio id="radio-1" name="radio-1" />

              <div className="bg-light_orange rounded-xl rounded-tl-none border border-gray-500 px-5 py-3 leading-6 whitespace-pre-line">
                {`Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap
                into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the
                release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                software like Aldus PageMaker including versions of Lorem Ipsum`}
              </div>
            </label>
            <label className="flex items-start space-x-2" htmlFor="radio-text">
              <Radio id="radio-text" name="radio-text" />
              <Textarea rows={10} placeholder="선생님이 원하시는 시안을 자유롭게 편집하세요" />
            </label>
          </div>
        </div>

        <div className="flex w-full justify-end space-x-2">
          <div className="cursor-pointer rounded-lg border border-gray-500 p-2" onClick={goPrevPage}>
            <Icon.ChevronLeft className="h-8 w-8" />
          </div>
          <div
            className="text-bold flex cursor-pointer items-center rounded-lg border border-gray-500 p-2 px-4 text-lg"
            onClick={goNextPage}
          >
            확인
          </div>
        </div>
      </div>
    </div>
  )
}
