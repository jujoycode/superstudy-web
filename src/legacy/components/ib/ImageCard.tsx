import { useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'

import { Constants } from '@/legacy/constants'
import type { ImageObject } from '@/legacy/types/image-object'

import ColorSVGIcon from '../icon/ColorSVGIcon'

interface ImageCardProps {
  id: number
  imageObjet: ImageObject
  onDeleteClick?: (key: number) => void
}

export function ImageCard({ id, imageObjet, onDeleteClick }: ImageCardProps) {
  if (imageObjet.isDelete) {
    return null
  }

  const [objUrl, setObjUrl] = useState('')

  useEffect(() => {
    setObjUrl(typeof imageObjet.image === 'string' ? imageObjet.image : URL.createObjectURL(imageObjet.image))
  }, [imageObjet])

  return (
    <div className="border-dim-8 relative aspect-square h-20 w-20 rounded-lg border">
      {onDeleteClick && (
        <span className="absolute top-1 right-1 z-10 block">
          <div
            className="flex h-full w-full cursor-pointer items-center justify-center text-white"
            onClick={() => onDeleteClick(id)}
            style={{ transform: 'translate(0.1px, 0.1px)' }}
          >
            <ColorSVGIcon.Close className="cursor-pointer" color="dimmed" size={24} />
          </div>
        </span>
      )}
      {typeof imageObjet.image === 'string' ? (
        <LazyLoadImage
          src={`${Constants.imageUrl}${imageObjet.image}`}
          alt=""
          loading="lazy"
          className="object-fit absolute h-full w-full rounded-lg"
        />
      ) : (
        <LazyLoadImage src={objUrl} alt="" loading="lazy" className="object-fit absolute h-full w-full rounded-lg" />
      )}
    </div>
  )
}
