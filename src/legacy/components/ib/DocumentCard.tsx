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
    <div className="bg-primary-gray-50 flex items-center justify-center gap-2 rounded-lg px-4 py-[9px]">
      {typeof documentObjet.document === 'string' ? (
        <Typography variant="body2" className="text-primary-gray-700 font-medium">
          {getFileNameFromUrl(documentObjet.document)}
        </Typography>
      ) : (
        <Typography variant="body2" className="text-primary-gray-700 font-medium">
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
