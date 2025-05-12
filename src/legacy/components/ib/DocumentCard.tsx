import { DocumentObject } from 'src/type/document-object';
import { getFileNameFromUrl } from 'src/util/file';
import { Typography } from '../common/Typography';
import ColorSVGIcon from '../icon/ColorSVGIcon';

interface DocumentCardProps {
  id: number;
  documentObjet: DocumentObject;
  onDeleteClick?: (key: number) => void;
}

export function DocumentCard({ id, documentObjet, onDeleteClick }: DocumentCardProps) {
  if (documentObjet.isDelete) {
    return null;
  }
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-primary-gray-50 px-4 py-[9px]">
      {typeof documentObjet.document === 'string' ? (
        <Typography variant="body2" className="font-medium text-primary-gray-700">
          {getFileNameFromUrl(documentObjet.document)}
        </Typography>
      ) : (
        <Typography variant="body2" className="font-medium text-primary-gray-700">
          {documentObjet.document.name}
        </Typography>
      )}
      {onDeleteClick && (
        <div onClick={() => onDeleteClick(id)}>
          <ColorSVGIcon.Close className="cursor-pointer" color="dimmed" size={24} />
        </div>
      )}
    </div>
  );
}
