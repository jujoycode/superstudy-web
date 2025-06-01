import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
// @ts-ignore
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Viewer from 'react-viewer'
import DINNER from '@/assets/images/dinner.png'
import LUNCH from '@/assets/images/lunch.png'
import NODATA from '@/assets/images/no-data.png'
import { useLanguage } from '@/hooks/useLanguage'
import { useUserStore } from '@/stores/user'
import { Badge } from '@/atoms/Badge'
import { Button } from '@/atoms/Button'
import { Flex } from '@/atoms/Flex'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { Constants } from '@/legacy/constants'
import { Canteen, Role } from '@/legacy/generated/model'

interface CanteenDetailPageProps {
  selectedDate: Date
  canteen?: Canteen
  setSubmitState: () => void
}

export function CanteenDetailPage({ selectedDate, canteen, setSubmitState }: CanteenDetailPageProps) {
  const { me } = useUserStore()
  const { t } = useLanguage()
  const [isImageModalOpen, setImageModalOpen] = useState(false)
  const isToday = isSameDay(selectedDate, new Date())
  const [isLoading, setIsLoading] = useState(canteen?.image ? false : true)
  return (
    <main className="relative flex h-[680px] w-full flex-col gap-6 rounded-xl bg-white py-6">
      <header className="relative flex w-full items-center gap-2 px-6">
        <Typography variant="title1">
          {t('language') === 'ko'
            ? `${selectedDate?.getFullYear()}년 ${selectedDate?.getMonth() + 1}월 ${selectedDate?.getDate()}일`
            : format(selectedDate, 'MMM d, yyyy')}
        </Typography>
        {isToday && (
          <Badge variant="active" className="border-none px-2 py-1">
            오늘
          </Badge>
        )}
      </header>

      <section className="scrollable-vertical flex flex-col gap-6 px-6">
        {canteen ? (
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3">
              <Typography variant="title2" className="font-semibold">
                오늘의 급식
              </Typography>
              {canteen.lunch && (
                <span className="relative flex flex-col gap-1 rounded-md border border-gray-200 p-4">
                  <Typography variant="title3" className="font-semibold">
                    중식
                  </Typography>
                  <div className="absolute top-4 right-4 h-12 w-12">
                    <img src={LUNCH} className="h-12 w-12 object-cover" />
                  </div>
                  <Typography variant="body2" className="whitespace-pre-line">
                    {canteen.lunch}
                  </Typography>
                </span>
              )}
              {canteen.dinner && (
                <span className="border-primary-gray-200 relative flex flex-col gap-1 rounded-xl border p-4">
                  <Typography variant="title3" className="font-semibold">
                    석식
                  </Typography>
                  <div className="absolute top-4 right-4 h-12 w-12">
                    <img src={DINNER} className="h-12 w-12 object-cover" />
                  </div>
                  <Typography variant="body2" className="whitespace-pre-line">
                    {canteen.dinner}
                  </Typography>
                </span>
              )}
              {canteen.image && (
                <>
                  {isLoading ? (
                    <IBBlank type="section" />
                  ) : (
                    <LazyLoadImage
                      src={`${Constants.imageUrl}${canteen.image}`}
                      alt="메뉴 이미지"
                      className="border-primary-gray-200 h-[276px] w-full rounded-xl border object-fill"
                      loading="lazy"
                      placeholderSrc={`${Constants.imageUrl}${canteen.image}`}
                      onLoad={() => setIsLoading(false)}
                    />
                  )}
                </>
              )}
            </section>
            {(me?.canEditCanteen || me?.role === Role.ADMIN) && (
              <Flex items="center" justify="start">
                <Button
                  color="tertiary"
                  variant="outline"
                  size="sm"
                  className="border-gray-200"
                  onClick={setSubmitState}
                >
                  {t('edit')}
                </Button>
              </Flex>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span>
              <Typography variant="body2" className="text-center font-medium">
                입력된 급식이 없습니다.
              </Typography>
            </span>
            <Button variant="solid" color="sub" size="md" onClick={() => setSubmitState()}>
              추가하기
            </Button>
          </div>
        )}
      </section>

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
    </main>
  )
}
