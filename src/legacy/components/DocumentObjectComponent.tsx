import undoArrow from '@/assets/images/undo-arrow.png'
import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { Constants } from '@/legacy/constants'
import { DocumentObject } from '@/legacy/types/document-object'
import { getFileNameFromUrl } from '@/legacy/util/file'

interface DocumentObjectComponentProps {
  id: number
  documentObjet: DocumentObject
  onDeleteClick?: (key: number) => void
}

export function DocumentObjectComponent({ id, documentObjet, onDeleteClick }: DocumentObjectComponentProps) {
  return (
    <div
      className={`relative m-1 flex items-center justify-between overflow-x-hidden bg-white p-1 ${
        documentObjet.isDelete ? 'opacity-50' : ''
      }`}
    >
      {typeof documentObjet.document === 'string' ? (
        <div className="flex items-center justify-between overflow-x-hidden bg-white">
          <div className="flex items-center space-x-2">
            <FileItemIcon />
            <div className="ml-2">{getFileNameFromUrl(documentObjet.document)}</div>
          </div>
          <div className="flex min-w-max items-center justify-center bg-white px-2 text-indigo-500">
            <a
              href={`${Constants.imageUrl}${documentObjet.document}`}
              target="_blank"
              rel="noreferrer"
              download={getFileNameFromUrl(documentObjet.document)}
            >
              Download
            </a>
            {onDeleteClick && (
              <div className="z-40 ml-2 block h-5 w-5 rounded-full bg-red-700 text-center text-sm ring-2 ring-white">
                <div
                  className="flex h-full w-full cursor-pointer items-center justify-center text-white"
                  onClick={() => onDeleteClick(id)}
                >
                  {documentObjet.isDelete ? (
                    <img src={undoArrow} alt="" className="h-3 w-3" style={{ transform: 'translate(0px, 1px)' }} />
                  ) : (
                    'X'
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <FileItemIcon />
          <div className="w-full overflow-x-hidden whitespace-pre">{documentObjet.document.name}</div>
        </div>
      )}
    </div>
  )
}
