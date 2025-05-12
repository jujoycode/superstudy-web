import { Link, useLocation } from 'react-router-dom';
import { Badge } from 'src/components/common';
import { Newsletter, NewsletterType } from 'src/generated/model';
import { useLanguage } from 'src/hooks/useLanguage';
import { Routes } from 'src/routes';
import { getNickName } from 'src/util/status';
import { Time } from '../common/Time';

interface NewsletterCardProps {
  newsletter: Newsletter;
  isNew?: boolean;
  onClick?: () => void;
}

export function NewsletterCard({ newsletter, isNew, onClick }: NewsletterCardProps) {
  const { pathname } = useLocation();
  const { id } = newsletter;
  const { t } = useLanguage();

  return (
    <div key={newsletter.id || 0}>
      <div className={pathname === `/teacher/newsletter/${newsletter.id}` ? 'bg-gray-50 px-6 py-4' : 'px-6 py-4'}>
        <div className="flex justify-between">
          <div className="space-x-2">
            <Badge
              children={t(`${newsletter.category}`) || t('parent_letters')}
              className="rounded-md bg-brand-1 text-brand-5"
            />
            <Badge className="rounded-md bg-purple-100 text-purple-700">
              {newsletter.toPerson && t('individual')} {newsletter.toStudent && t('student')}{' '}
              {newsletter.toParent && t('parent')}{' '}
              {newsletter.type === NewsletterType.NOTICE ? `- ${t('notice')}` : `- ${t('survey')}`}
            </Badge>

            {newsletter.isTemp && <Badge className="px-4 py-1 text-sm text-brand-1">{t('save_draft')}</Badge>}
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
                  ? 'rounded-md border border-darkgray bg-darkgray px-4 py-2 text-xs text-white focus:outline-none'
                  : 'rounded-md border border-darkgray bg-white px-4 py-2 text-xs text-darkgray hover:bg-darkgray hover:text-white focus:outline-none'
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
                          ? 'rounded-md border border-darkgray bg-darkgray px-4 py-2 text-xs text-white focus:outline-none'
                          : 'rounded-md border border-darkgray bg-white px-4 py-2 text-xs text-darkgray hover:bg-darkgray hover:text-white focus:outline-none'
                      }
                    />
                  </Link>
                  <Link to={`/teacher/newsletter/download/${id}`}>
                    <button
                      children={t('download')}
                      className={
                        pathname.startsWith(`/teacher/newsletter/download/${id}`)
                          ? 'rounded-md border border-darkgray bg-darkgray px-4 py-2 text-xs text-white focus:outline-none'
                          : 'rounded-md border border-darkgray bg-white px-4 py-2 text-xs text-darkgray hover:bg-darkgray hover:text-white focus:outline-none'
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
                          ? 'rounded-md border border-darkgray bg-darkgray px-4 py-2 text-xs text-white focus:outline-none'
                          : 'rounded-md border border-darkgray bg-white px-4 py-2 text-xs text-darkgray hover:bg-darkgray hover:text-white focus:outline-none'
                      }
                    />
                  </Link>
                  <Link to={`/teacher/newsletter/unread-student-download/${id}`}>
                    <button
                      children={t('download_excel')}
                      className={
                        pathname.startsWith(`/teacher/newsletter/unread-student-download/${id}`)
                          ? 'rounded-md border border-darkgray bg-darkgray px-4 py-2 text-xs text-white focus:outline-none'
                          : 'rounded-md border border-darkgray bg-white px-4 py-2 text-xs text-darkgray hover:bg-darkgray hover:text-white focus:outline-none'
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
  );
}
