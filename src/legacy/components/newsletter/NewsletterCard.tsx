import { Link, useLocation } from 'react-router-dom'
import { Badge } from '@/atoms/Badge'
import { Time } from '@/legacy/components/common/Time'
import { Routes } from '@/legacy/constants/routes'
import { Newsletter, NewsletterType } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getNickName } from '@/legacy/util/status'

interface NewsletterCardProps {
  newsletter: Newsletter
  isNew?: boolean
  onClick?: () => void
}

export function NewsletterCard({ newsletter, isNew, onClick }: NewsletterCardProps) {
  const { pathname } = useLocation()
  const { id } = newsletter
  const { t } = useLanguage()

  return (
    <div key={newsletter.id || 0}>
      <div className={pathname === `/teacher/newsletter/${newsletter.id}` ? 'bg-gray-50 px-6 py-4' : 'px-6 py-4'}>
        <div className="flex justify-between">
          <div className="space-x-2">
            <Badge variant="active">{t(`${newsletter.category}`) || t('parent_letters')}</Badge>
            <Badge variant="default" className="bg-primary-50 text-purple-700">
              {newsletter.toPerson && t('individual')} {newsletter.toStudent && t('student')}{' '}
              {newsletter.toParent && t('parent')}{' '}
              {newsletter.type === NewsletterType.NOTICE ? `- ${t('notice')}` : `- ${t('survey')}`}
            </Badge>

            {newsletter.isTemp && <Badge>{t('save_draft')}</Badge>}
          </div>

          <div className="text-sm font-light">
            <Time date={newsletter.createdAt} />
            {newsletter.writer?.name && (
              <div className="text-right text-gray-500">
                {newsletter.writer?.name}
                {getNickName(newsletter.writer?.nickName)}
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 text-lg font-semibold">
          {newsletter.title}{' '}
          {isNew && (
            <small className="inline-block h-4 w-4 rounded-full bg-red-500 text-center text-xs font-light text-white">
              N
            </small>
          )}
        </div>

        {newsletter?.endAt && (
          <div className="flex gap-1 text-sm font-normal text-red-400">
            <span className="font-semibold">{t('deadline')}</span>
            <Time date={newsletter.endAt} className="text-inherit" />
            <span>{t('until')}</span>
          </div>
        )}
        <div className="mt-5 space-x-3">
          <Link to={`${Routes.teacher.newsletter}/${newsletter.id}`}>
            <button
              children={t('view_details')}
              onClick={onClick}
              className={
                pathname.startsWith(`${Routes.teacher.newsletter}/${newsletter.id}`)
                  ? 'rounded-md border border-slate-600 bg-slate-600 px-4 py-2 text-xs text-white focus:outline-hidden'
                  : 'rounded-md border border-slate-600 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-600 hover:text-white focus:outline-hidden'
              }
            />
          </Link>
          {newsletter.isPublished && (
            <>
              {newsletter.type !== NewsletterType.NOTICE ? (
                <>
                  <Link to={`/teacher/newsletter/submit/${id}`}>
                    <button
                      children={t('view_submitter')}
                      onClick={onClick}
                      className={
                        pathname.startsWith(`/teacher/newsletter/submit/${id}`)
                          ? 'rounded-md border border-slate-600 bg-slate-600 px-4 py-2 text-xs text-white focus:outline-hidden'
                          : 'rounded-md border border-slate-600 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-600 hover:text-white focus:outline-hidden'
                      }
                    />
                  </Link>
                  <Link to={`/teacher/newsletter/download/${id}`}>
                    <button
                      children={t('download')}
                      className={
                        pathname.startsWith(`/teacher/newsletter/download/${id}`)
                          ? 'rounded-md border border-slate-600 bg-slate-600 px-4 py-2 text-xs text-white focus:outline-hidden'
                          : 'rounded-md border border-slate-600 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-600 hover:text-white focus:outline-hidden'
                      }
                    />
                  </Link>
                </>
              ) : (
                <>
                  <Link to={`/teacher/newsletter/check/${id}`}>
                    <button
                      children={t('view_unconfirmed')}
                      onClick={onClick}
                      className={
                        pathname.startsWith(`/teacher/newsletter/check/${id}`)
                          ? 'rounded-md border border-slate-600 bg-slate-600 px-4 py-2 text-xs text-white focus:outline-hidden'
                          : 'rounded-md border border-slate-600 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-600 hover:text-white focus:outline-hidden'
                      }
                    />
                  </Link>
                  <Link to={`/teacher/newsletter/unread-student-download/${id}`}>
                    <button
                      children={t('download_excel')}
                      className={
                        pathname.startsWith(`/teacher/newsletter/unread-student-download/${id}`)
                          ? 'rounded-md border border-slate-600 bg-slate-600 px-4 py-2 text-xs text-white focus:outline-hidden'
                          : 'rounded-md border border-slate-600 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-600 hover:text-white focus:outline-hidden'
                      }
                    />
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className="h-0.5 w-full bg-gray-100"></div>
    </div>
  )
}
