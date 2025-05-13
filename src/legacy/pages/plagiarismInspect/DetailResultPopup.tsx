import { useParams } from 'react-router-dom'

import { Blank } from '@/legacy/components/common'
import ExternalHTML from '@/legacy/components/common/ExternalHTML'
import { ErrorBlank } from '@/legacy/components/ErrorBlank'
import { useGetPlagiarismInspectDetail } from '@/legacy/container/plagiarism-inspector'

export default function DetailResultPopup() {
  const { id: idParam } = useParams<{ id: string }>()
  const id = Number(idParam)

  const { data, isError } = useGetPlagiarismInspectDetail(id)

  return (
    <div>
      {!data && <Blank />}
      {data && <ExternalHTML html={data} allowRerender />}
      {isError && <ErrorBlank text="표절 검사 결과를 불러오는데 실패했습니다." />}
    </div>
  )
}
