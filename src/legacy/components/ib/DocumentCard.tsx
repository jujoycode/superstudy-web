import { Typography } from '@/legacy/components/common/Typography'
import { DocumentObject } from '@/legacy/types/document-object'
import { getFileNameFromUrl } from '@/legacy/util/file'

import ColorSVGIcon from '../icon/ColorSVGIcon'

interface DocumentCardProps {
  id: number
  documentObjet: DocumentObject
  onDeleteClick?: (key: number) => void
}

export function DocumentCard({ id, documentObjet, onDeleteClick }: DocumentCardProps) {
  if (documentObjet.isDelete) {
    return null
  }
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-[9px]">
      {typeof documentObjet.document === 'string' ? (
        <Typography variant="body2" className="font-medium text-gray-700">
          {getFileNameFromUrl(documentObjet.document)}
        </Typography>
      ) : (
        <Typography variant="body2" className="font-medium text-gray-700">
          {documentObjet.document.name}
        </Typography>
      )}
      {onDeleteClick && (
        <div onClick={() => onDeleteClick(id)}>
          <ColorSVGIcon.Close className="cursor-pointer" color="dimmed" size={24} />
        </div>
      )}
    </div>
  )
}
