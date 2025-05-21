import { TextField } from '@mui/material'

import { FC } from 'react'
import { Icon } from '@/legacy/components/common/icons'

interface GenerateGPTPage2Props {
  goPrevPage: () => void
  goNextPage: () => void
}

export const GenerateGPTPage2: FC<GenerateGPTPage2Props> = ({ goPrevPage, goNextPage }) => {
  return (
    <div className="w-full p-4">
      <div className="flex w-full items-center space-x-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600">1</div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600">2</div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600 bg-gray-600 text-white">
          3
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600">4</div>
      </div>
      <div className="h-screen-13 flex w-full flex-col">
        <div className="mx-auto flex h-full w-full max-w-xl flex-col items-center justify-center space-y-2">
          <div className="flex flex-col space-y-4 overflow-y-scroll">
            <div className="flex items-start space-x-2">
              <div className="flex h-10 min-w-10 items-center justify-center rounded-full border border-gray-500 text-sm">
                GPT
              </div>
              <div className="bg-primary-50 rounded-xl rounded-tl-none border border-gray-500 px-5 py-3 leading-6 whitespace-pre-line">
                {`Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap
                into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the
                release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                software like Aldus PageMaker including versions of Lorem Ipsum`}
              </div>
            </div>
            <div className="flex w-full justify-end">
              <div className="rounded-xl rounded-tr-none border border-gray-500 bg-slate-50 px-5 py-3 leading-6 whitespace-pre-line">
                {`근거를 좀 더 종합해서 써줘`}
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="flex h-10 min-w-10 items-center justify-center rounded-full border border-gray-500 text-sm">
                GPT
              </div>
              <div className="bg-primary-50 rounded-xl rounded-tl-none border border-gray-500 px-5 py-3 leading-6 whitespace-pre-line">
                {`Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap
                into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the
                release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                software like Aldus PageMaker including versions of Lorem Ipsum`}
              </div>
            </div>
            <div className="flex w-full justify-end">
              <div className="rounded-xl rounded-tr-none border border-gray-500 bg-slate-50 px-5 py-3 leading-6 whitespace-pre-line">
                {`활동기록 A의 정보를 총집합할 때 차시 A를 기준으로 좀더 스무스하게 써줄래 탁월함, 지적임 이런 키워드를 넣어서`}
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="flex h-10 min-w-10 items-center justify-center rounded-full border border-gray-500 text-sm">
                GPT
              </div>
              <div className="bg-primary-50 rounded-xl rounded-tl-none border border-gray-500 px-5 py-3 leading-6 whitespace-pre-line">
                {`Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap
                into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the
                release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                software like Aldus PageMaker including versions of Lorem Ipsum`}
              </div>
            </div>
          </div>
          <div className="flex w-full items-center border border-gray-600">
            <TextField className="w-full rounded-none" />
            <div className="cursor-pointer p-4">
              <Icon.Send />
            </div>
          </div>
        </div>

        <div className="flex w-full justify-end space-x-2">
          <div className="cursor-pointer rounded-lg border border-gray-500 p-2" onClick={goPrevPage}>
            <Icon.ChevronLeft className="h-8 w-8" />
          </div>
          <div className="cursor-pointer rounded-lg border border-gray-500 p-2" onClick={goNextPage}>
            <Icon.ChevronRight className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
