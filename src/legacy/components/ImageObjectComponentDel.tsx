import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { Constants } from '@/legacy/constants'
import type { ImageObject } from '@/legacy/types/image-object'
import { isPdfFile } from '@/legacy/util/file'
import { PdfCard } from './common/PdfCard'
import { Icon } from './common/icons'

interface ImageObjectComponentProps {
  id: number
  imageObjet: ImageObject
  onDeleteClick?: (key: number) => void
  cardType?: boolean
}

export function ImageObjectComponentDel({ id, imageObjet, onDeleteClick, cardType }: ImageObjectComponentProps) {
  if (imageObjet.isDelete) {
    return null
  }
  const [objUrl, setObjUrl] = useState('')

  useEffect(() => {
    setObjUrl(typeof imageObjet.image == 'string' ? imageObjet.image : URL.createObjectURL(imageObjet.image))
  }, [imageObjet])

  return (
    <div
      className={clsx(
        'relative',
        cardType
          ? 'border-grey-5 aspect-5/3 rounded border-2 border-dashed'
          : 'aspect-square min-h-[48px] rounded border border-neutral-200 md:min-h-[120px]',
      )}
    >
      {onDeleteClick && (
        <span className="absolute -top-2 -right-2 z-10 block md:top-3 md:right-3">
          <div
            className="flex h-full w-full cursor-pointer items-center justify-center text-white"
            onClick={() => onDeleteClick(id)}
            style={{ transform: 'translate(0.1px, 0.1px)' }}
          >
            <Icon.Close className="cursor-pointer rounded-full bg-zinc-100 p-1 text-zinc-400" />
          </div>
        </span>
      )}
      {typeof imageObjet.image === 'string' && isPdfFile(imageObjet.image) ? (
        <PdfCard fileUrl={`${Constants.imageUrl}${imageObjet.image}`} visibleButton={false} cardType={cardType} />
      ) : typeof imageObjet.image === 'string' ? (
        <LazyLoadImage
          src={`${Constants.imageUrl}${imageObjet.image}`}
          alt=""
          loading="lazy"
          className="object-fit absolute h-full w-full rounded"
        />
      ) : isPdfFile(imageObjet.image.name) ? (
        <PdfCard fileUrl={objUrl} visibleButton={false} cardType={cardType} />
      ) : (
        <LazyLoadImage src={objUrl} alt="" loading="lazy" className="object-fit absolute h-full w-full rounded" />
      )}
    </div>
  )
}
