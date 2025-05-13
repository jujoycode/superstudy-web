import { Constants } from '@/legacy/constants'
import { DocumentObject } from '@/legacy/types/document-object'
import { getFileNameFromUrl } from '@/legacy/util/file'

import { Icon } from './common/icons'

import { ReactComponent as FileItemIcon } from '@/legacy/assets/svg/file-item-icon.svg'

interface DocumentObjectComponentProps {
  id: number
  documentObjet: DocumentObject
  onDeleteClick?: (key: number) => void
}

export function DocumentObjectComponentDel({ id, documentObjet, onDeleteClick }: DocumentObjectComponentProps) {
  if (documentObjet.isDelete) {
    return null
  }
  return (
    <div className={`relative flex items-center justify-between bg-white`}>
      <div className="flex w-full items-center">
        <div className="flex h-8 items-center space-x-2 rounded bg-stone-50 px-3 py-1">
          <FileItemIcon />
          {typeof documentObjet.document === 'string' ? (
            <a
              className="ml-2 text-xs text-neutral-500"
              href={`${Constants.imageUrl}${documentObjet.document}`}
              target="_blank"
              rel="noreferrer"
              download={getFileNameFromUrl(documentObjet.document)}
            >
              {getFileNameFromUrl(documentObjet.document)}
            </a>
          ) : (
            <div className="w-full text-xs break-words whitespace-pre-wrap text-neutral-500">
              {documentObjet.document.name}
            </div>
          )}
        </div>
        <div className="text-lightpurple-4 flex min-w-max items-center justify-center bg-white px-2">
          {onDeleteClick && (
            <div className="z-10 ml-2 block rounded-full text-center text-sm">
              <div
                className="flex h-full w-full cursor-pointer items-center justify-center text-white"
                onClick={() => onDeleteClick(id)}
              >
                <Icon.Close className="cursor-pointer rounded-full bg-zinc-100 p-1 text-zinc-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
