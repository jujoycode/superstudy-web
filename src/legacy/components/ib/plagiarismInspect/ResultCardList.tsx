import { Typography } from '@/legacy/components/common/Typography'
import { ResponseCopykillerResponseDto } from '@/legacy/generated/model'

import ResultCard from './ResultCard'

export default function ResultCardList({ data }: { data: ResponseCopykillerResponseDto[] }) {
  return (
    <div className="flex min-h-[600px] flex-col gap-6 rounded-xl bg-white p-6">
      <Typography variant="title1" className="text-primary-gray-900">
        검사결과 확인
      </Typography>
      <div className="grid grid-cols-2 gap-4">
        {data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((item) => (
            <ResultCard key={item.id} data={item} />
          ))}
      </div>
    </div>
  )
}
