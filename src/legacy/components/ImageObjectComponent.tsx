import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import undoArrow from 'src/assets/images/undo-arrow.png'
import { Constants } from '@/legacy/constants'
import type { ImageObject } from '@/legacy/types/image-object'
import { isPdfFile } from '@/legacy/util/file'
import { PdfCard } from './common/PdfCard'

interface ImageObjectComponentProps {
  id: number
  imageObjet: ImageObject
  onDeleteClick?: (key: number) => void
  cardType?: boolean
}

export function ImageObjectComponent({ id, imageObjet, onDeleteClick, cardType }: ImageObjectComponentProps) {
  const [objUrl, setObjUrl] = useState('')

  useEffect(() => {
    setObjUrl(typeof imageObjet.image == 'string' ? imageObjet.image : URL.createObjectURL(imageObjet.image))
  }, [imageObjet])

  return (
    <div
      className={clsx(
        'relative',
        cardType ? 'border-grey-5 aspect-5/3 rounded border-2 border-dashed' : 'aspect-square',
        imageObjet.isDelete && 'opacity-50',
      )}
    >
      {onDeleteClick && (
        <span className="absolute -top-3 -right-3 z-40 block h-6 w-6 rounded-full bg-red-700 ring-2 ring-white">
          <div
            className="flex h-full w-full cursor-pointer items-center justify-center text-white"
            onClick={() => onDeleteClick(id)}
            style={{ transform: 'translate(0.1px, 0.1px)' }}
          >
            {imageObjet.isDelete ? <img src={undoArrow} alt="" className="h-4 w-4" /> : 'X'}
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
      {imageObjet.isDelete && (
        <div className="absolute z-20 h-full w-full">
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-4xl text-gray-800 opacity-100">삭제</div>
          </div>
        </div>
      )}
    </div>
  )
}
