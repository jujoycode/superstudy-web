import { format } from 'date-fns'
import { useState } from 'react'
import Viewer from 'react-viewer'
import { useRecoilValue } from 'recoil'

import { Divider, Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Constants } from '@/legacy/constants'
import { Canteen, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { meState } from '@/stores'

interface CanteenDetailPageProps {
  selectedDate: Date
  canteen?: Canteen
  setSubmitState: () => void
}

export function CanteenDetailPage({ selectedDate, canteen, setSubmitState }: CanteenDetailPageProps) {
  const me = useRecoilValue(meState)
  const { t } = useLanguage()
  const [isImageModalOpen, setImageModalOpen] = useState(false)

  return (
    <>
      <div className="scroll-box h-screen-4.5 border-grey-6 relative w-full overflow-y-scroll border-l bg-white">
        <div className="border-grey-6 relative flex w-full items-center justify-between border-b px-6 py-4">
          <div className="text-xl font-bold">
            {t('language') === 'ko'
              ? `${selectedDate?.getFullYear()}년 ${selectedDate?.getMonth() + 1}월 ${selectedDate?.getDate()}일`
              : format(selectedDate, 'MMM d, yyyy')}
          </div>
          {(me?.canEditCanteen || me?.role === Role.ADMIN) && (
            <Button.lg children={t('edit')} onClick={() => setSubmitState()} className="filled-primary" />
          )}
        </div>
        <Section className="mb-6">
          <div className="w-full" onClick={() => setImageModalOpen(true)}>
            <div className="aspect-5/3 rounded bg-gray-50">
              {canteen?.image ? (
                <img
                  src={`${Constants.imageUrl}${canteen.image}`}
                  alt=""
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                <div className="h-full w-full rounded bg-white object-cover">
                  <div className="flex h-full w-full flex-col items-center justify-center space-y-1">
                    <div className="text-brand-1">{t('no_image')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="absolute">
            {canteen?.image && (
              <Viewer
                visible={isImageModalOpen}
                rotatable
                noImgDetails
                scalable={false}
                images={[
                  {
                    src: Constants.imageUrl + canteen.image,
                    alt: '',
                  },
                ]}
                onClose={() => setImageModalOpen(false)}
              />
            )}
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-full flex-col space-y-2">
              <div className="text-lg font-bold">{t('lunch')}</div>
              <div className="whitespace-pre-line">{canteen?.lunch}</div>
            </div>
            <div className="w-full flex-col space-y-2">
              <div className="text-lg font-bold">{canteen?.dinner ? t('dinner') : ''}</div>
              <div className="whitespace-pre-line">{canteen?.dinner}</div>
            </div>
          </div>
        </Section>
        <Divider />
      </div>
    </>
  )
}
