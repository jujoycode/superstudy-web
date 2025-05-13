import { ResponseCopykillerResponseDto } from '@/legacy/generated/model'

import InspectorButtonContainer from './InspectorButtonContainer'
import ResultCardList from './ResultCardList'

interface PlagiarismInspectProps {
  onInspectorClick: (type: 'upload' | 'input') => void
  onFileUpload: (files: File[]) => void
  data?: ResponseCopykillerResponseDto[]
}

export default function PlagiarismInspect({ onInspectorClick, onFileUpload, data = [] }: PlagiarismInspectProps) {
  return (
    <div className="flex gap-4">
      {data.length > 0 ? (
        <>
          <ResultCardList data={data} />
          <InspectorButtonContainer type="vertical" onTypeSelect={onInspectorClick} onFileUpload={onFileUpload} />
        </>
      ) : (
        <InspectorButtonContainer type="horizontal" onTypeSelect={onInspectorClick} onFileUpload={onFileUpload} />
      )}
    </div>
  )
}
