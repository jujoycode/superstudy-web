import { Icon } from '@/legacy/components/common/icons'

export const ExamScoresBatcbUploadComponent = () => {
  return (
    <main className="w-full gap-0 rounded-lg bg-[#b6d3ff] p-10 text-xs">
      <h1 children="모의고사 성적 파일 업로드 순서" className="pb-6 text-2xl" />
      {/* 1번째 박스 */}
      <section className="flex w-full flex-row gap-5">
        <article className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0066ff] font-bold text-white">
              1
            </div>
            <p>오른쪽 상단에 있는 &apos;파일 업로드&apos; 버튼을 클릭합니다.</p>
          </div>
          <div className="flex justify-center">
            <Icon.FillArrow />
          </div>
          <div className="flex items-center gap-1">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0066ff] font-bold text-white">
              2
            </div>
            <p>업로드 할 파일의 모의고사 시행 월을 선택해 주세요.</p>
          </div>
          <img
            src={'https://kr.object.gov-ncloudstorage.com/superschool/storage/material/score/mock_1.jpg'}
            className="rounded-lg object-cover"
          />
        </article>
        <div className="flex -rotate-90 items-center justify-center">
          <Icon.FillArrow />
        </div>
        <article className="flex flex-col gap-2">
          <div className="flex items-center gap-1" style={{ visibility: 'hidden' }}>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0066ff] font-bold text-white"></div>
            <p></p>
          </div>
          <div className="flex justify-center" style={{ visibility: 'hidden' }}>
            <Icon.FillArrow />
          </div>
          <div className="flex items-center gap-1">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0066ff] font-bold text-white">
              3
            </div>
            <p>파일을 선택해 주세요.</p>
          </div>
          <img
            src={'https://kr.object.gov-ncloudstorage.com/superschool/storage/material/score/mock_2.jpg'}
            className="rounded-lg object-cover"
          />
        </article>
        <div className="flex -rotate-90 items-center justify-center">
          <Icon.FillArrow />
        </div>
        <article className="flex flex-col gap-2">
          <div className="flex items-center gap-1" style={{ visibility: 'hidden' }}>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0066ff] font-bold text-white"></div>
            <p></p>
          </div>
          <div className="flex justify-center" style={{ visibility: 'hidden' }}>
            <Icon.FillArrow />
          </div>
          <div className="flex items-center gap-1">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0066ff] font-bold text-white">
              4
            </div>
            <p>파일 선택 후 &apos;파일 업로드&apos; 버튼을 클릭합니다.</p>
          </div>
          <img
            src={'https://kr.object.gov-ncloudstorage.com/superschool/storage/material/score/mock_3.jpg'}
            className="rounded-lg object-cover"
          />
        </article>
        <div className="flex -rotate-90 items-center justify-center">
          <Icon.FillArrow />
        </div>
        <article className="flex flex-col gap-2">
          <div className="flex items-center gap-1" style={{ visibility: 'hidden' }}>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0066ff] font-bold text-white"></div>
            <p></p>
          </div>
          <div className="flex justify-center" style={{ visibility: 'hidden' }}>
            <Icon.FillArrow />
          </div>
          <div className="flex items-center gap-1" style={{ visibility: 'hidden' }}>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0066ff] font-bold text-white">
              3
            </div>
            <p>업로드 할 파일의 모의고사 시행 월을 선택해 주세요.</p>
          </div>
          <img
            src={'https://kr.object.gov-ncloudstorage.com/superschool/storage/material/score/mock_4.png'}
            className="object-cover"
          />
        </article>
      </section>
    </main>
  )
}
